import assert from "node:assert/strict";
import { spawn, spawnSync, type ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { request } from "node:http";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { parseDeliberationConfig } from "../src/config.js";
import { createFinalDeliveryAdapter } from "../src/final-adapter.js";
import { createKmClient, KmRequestError } from "../src/km-client.js";
import { runIntakeProducer } from "./intake-producer.js";

const SENTINEL = ".openclaw-deliberation-integration-test";
const MESSAGE_ID = "1535928766595866624";
const OCCURRED_AT = "2026-08-09T08:32:34.252Z";
const CANONICAL_OCCURRED_AT = "2026-08-09T08:32:34.252000Z";
const RECEIVED_AT = "2026-08-09T08:33:00.123000Z";
const CONFIGURED_KM_ROOT = (() => {
  const value = process.env.OPENCLAW_DELIBERATION_KM_ROOT;
  if (!value) {
    throw new Error("plugin: set OPENCLAW_DELIBERATION_KM_ROOT to the KM checkout");
  }
  return value;
})();

type ListenerContext = {
  endpoint: string;
  credential: string;
  kmRoot: string;
  spoolRoot: string;
};

type ListenerFixture = {
  child: ChildProcessWithoutNullStreams;
  context: ListenerContext;
  tempRoot: string;
};

type FileFingerprint = {
  sha256: string;
  size: number;
  mtimeMs: number;
};

function requireKmRoot(): { kmRoot: string; listener: string; python: string } {
  const kmRoot = realpathSync(CONFIGURED_KM_ROOT);
  const listener = path.join(kmRoot, "scripts/deliberation-v2-listener.py");
  const python = path.join(kmRoot, ".venv/bin/python3");
  assert.ok(existsSync(listener), `plugin: KM listener is missing at ${listener}`);
  assert.ok(existsSync(python), `plugin: KM Python is missing at ${python}`);
  const provenance = JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../contracts/provenance.json"), "utf8"),
  ) as { ownerFiles?: Record<string, string> };
  assert.ok(provenance.ownerFiles, "provenance: accepted KM owner hashes are missing");
  for (const [ownerFile, expected] of Object.entries(provenance.ownerFiles)) {
    const relative = ownerFile.replace(/^km-system\//, "");
    const file = path.join(kmRoot, relative);
    assert.ok(existsSync(file), `provenance: KM owner file is missing: ${relative}`);
    const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(actual, expected, `provenance: KM owner hash mismatch: ${relative}`);
  }
  return { kmRoot, listener, python };
}

function resolvedPath(value: string): string {
  return existsSync(value) ? realpathSync(value) : path.resolve(value);
}

function pathsOverlap(left: string, right: string): boolean {
  const relative = path.relative(left, right);
  const reverse = path.relative(right, left);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative)) ||
    (!reverse.startsWith("..") && !path.isAbsolute(reverse))
  );
}

function productionSpool(kmRoot: string): string {
  return path.join(kmRoot, "state/deliberation-v2");
}

function assertIsolatedSpool(kmRoot: string, tempRoot: string, spoolRoot: string): void {
  const resolvedTemp = resolvedPath(tempRoot);
  const resolvedSpool = resolvedPath(spoolRoot);
  const resolvedProduction = resolvedPath(productionSpool(kmRoot));
  assert.ok(
    !pathsOverlap(resolvedTemp, resolvedProduction) &&
      !pathsOverlap(resolvedSpool, resolvedProduction),
    "spool: temporary root overlaps the production spool",
  );
  const relative = path.relative(resolvedTemp, resolvedSpool);
  assert.ok(
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative),
    "spool: explicit spool root must be beneath the temporary root",
  );
}

function childEnvironment(kmRoot: string, tempRoot: string): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    LANG: "C",
    LC_ALL: "C",
    TMPDIR: tempRoot,
    PYTHONDONTWRITEBYTECODE: "1",
    PYTHONPATH: [path.join(kmRoot, "scripts"), path.join(kmRoot, "lib")].join(path.delimiter),
  };
}

function runProbe(
  python: string,
  kmRoot: string,
  tempRoot: string,
  spoolRoot: string,
  command: "init" | "prepare" | "read",
  reviewedText?: string,
): unknown {
  const args = [path.join(import.meta.dirname, "km-spool-probe.py"), command, tempRoot, spoolRoot];
  if (reviewedText !== undefined) {
    args.push(reviewedText);
  }
  const result = spawnSync(python, args, {
    encoding: "utf8",
    env: childEnvironment(kmRoot, tempRoot),
    timeout: 10_000,
  });
  assert.equal(result.status, 0, `spool: probe failed: ${result.stderr.trim()}`);
  try {
    return JSON.parse(result.stdout) as unknown;
  } catch {
    assert.fail("spool: probe returned invalid JSON");
  }
}

function canonicalTarget(route: {
  provider: string;
  accountId: string;
  channelId: string;
}): string {
  return `v1:${route.provider}:${route.accountId}:${route.channelId}`;
}

function createIntegrationKmClient(
  context: ListenerContext,
  deliveryTarget?: { provider: "discord"; accountId: string; channelId: string },
) {
  const config = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: [{ channel: "discord", accountId: "default", target: "source-a" }],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    ...(deliveryTarget
      ? {
          deliveryTarget: {
            provider: deliveryTarget.provider,
            accountId: deliveryTarget.accountId,
            channelId: deliveryTarget.channelId,
          },
        }
      : {}),
    km: {
      endpoint: context.endpoint,
      credential: context.credential,
      requestTimeoutMs: 5_000,
    },
    restrictedSessionKeys: ["__deliberation-integration-restricted__"],
  });
  return createKmClient({ config, openclawConfig: {} as never });
}

async function awaitReadiness(child: ChildProcessWithoutNullStreams): Promise<number> {
  let stdout = "";
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk: string) => (stderr += chunk));
  child.stdout.setEncoding("utf8");
  return await new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("HTTP/auth: listener readiness timed out")),
      10_000,
    );
    const finish = (callback: () => void) => {
      clearTimeout(timeout);
      callback();
    };
    child.once("exit", (code) => {
      finish(() => reject(new Error(`HTTP/auth: listener exited (${code}): ${stderr.trim()}`)));
    });
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      const newline = stdout.indexOf("\n");
      if (newline === -1) {
        return;
      }
      try {
        const ready = JSON.parse(stdout.slice(0, newline)) as {
          ready?: unknown;
          host?: unknown;
          port?: unknown;
        };
        assert.equal(ready.ready, true, "HTTP/auth: invalid readiness status");
        assert.equal(ready.host, "127.0.0.1", "HTTP/auth: listener is not loopback");
        assert.ok(Number.isInteger(ready.port) && Number(ready.port) > 0);
        finish(() => resolve(Number(ready.port)));
      } catch (error) {
        finish(() => reject(new Error(`HTTP/auth: invalid readiness line: ${String(error)}`)));
      }
    });
  });
}

async function stopListener(child: ChildProcessWithoutNullStreams): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  const exited = new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });
  child.kill("SIGTERM");
  if (
    await Promise.race([
      exited.then(() => true),
      new Promise<false>((resolve) => {
        setTimeout(() => resolve(false), 2_000);
      }),
    ])
  ) {
    return;
  }
  child.kill("SIGKILL");
  await exited;
}

async function createListenerFixture(): Promise<ListenerFixture> {
  const { kmRoot, listener, python } = requireKmRoot();
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-km-"));
  const spoolRoot = path.join(tempRoot, "spool");
  const credentialFile = path.join(tempRoot, "credential");
  const credential = randomBytes(24).toString("hex");
  let child: ChildProcessWithoutNullStreams | undefined;
  try {
    writeFileSync(path.join(tempRoot, SENTINEL), `${randomBytes(16).toString("hex")}\n`, {
      mode: 0o600,
    });
    writeFileSync(credentialFile, `${credential}\n`, { mode: 0o600 });
    chmodSync(credentialFile, 0o600);
    assertIsolatedSpool(kmRoot, tempRoot, spoolRoot);
    runProbe(python, kmRoot, tempRoot, spoolRoot, "init");
    child = spawn(
      python,
      [
        listener,
        "--host",
        "127.0.0.1",
        "--port",
        "0",
        "--credential-file",
        credentialFile,
        "--spool-root",
        spoolRoot,
        "--integration-test-root",
        tempRoot,
      ],
      { env: childEnvironment(kmRoot, tempRoot), stdio: "pipe" },
    );
    child.stdin.end();
    const port = await awaitReadiness(child);
    return {
      child,
      context: {
        endpoint: `http://127.0.0.1:${port}`,
        credential,
        kmRoot,
        spoolRoot,
      },
      tempRoot,
    };
  } catch (error) {
    if (child) {
      await stopListener(child);
    }
    rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

async function disposeFixture(fixture: ListenerFixture): Promise<void> {
  let cleanupError: unknown;
  try {
    await stopListener(fixture.child);
  } catch (error) {
    cleanupError = error;
  }
  try {
    rmSync(fixture.tempRoot, { recursive: true, force: true });
  } catch (error) {
    cleanupError ??= error;
  }
  if (cleanupError) {
    throw new Error(`cleanup: ${String(cleanupError)}`);
  }
}

function postMalformed(context: ListenerContext): Promise<{ status: number; body: unknown }> {
  const body = JSON.stringify({
    provider: "discord",
    providerEventId: "malformed-event",
    sourceTarget: "v1:discord:default:1494265174389948538",
    senderId: "sender-1",
    occurredAt: CANONICAL_OCCURRED_AT,
    receivedAt: RECEIVED_AT,
  });
  return new Promise((resolve, reject) => {
    const outgoing = request(
      `${context.endpoint}/deliberation/v1/intake`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${context.credential}`,
          "Content-Type": "application/json",
          "Content-Length": String(Buffer.byteLength(body)),
          "X-Deliberation-Protocol-Version": "1",
        },
      },
      (incoming) => {
        const chunks: Buffer[] = [];
        incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
        incoming.on("error", reject);
        incoming.on("end", () => {
          try {
            resolve({
              status: incoming.statusCode ?? 0,
              body: JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown,
            });
          } catch (error) {
            reject(new Error(`wire/schema: malformed response JSON: ${String(error)}`));
          }
        });
      },
    );
    outgoing.on("error", (error) => reject(new Error(`HTTP/auth: ${error.message}`)));
    outgoing.end(body);
  });
}

function fingerprint(file: string): FileFingerprint | undefined {
  if (!existsSync(file)) {
    return undefined;
  }
  const bytes = readFileSync(file);
  const stat = statSync(file);
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    size: stat.size,
    mtimeMs: stat.mtimeMs,
  };
}

test("real producer reaches the isolated KM listener and canonical spool", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-08-09T08:33:00.123Z") });
  const fixture = await createListenerFixture();
  try {
    const input = {
      endpoint: fixture.context.endpoint,
      routes: {
        sources: [{ provider: "discord", accountId: "default", channelId: "1494265174389948538" }],
        processing: { provider: "discord", accountId: "default", channelId: "processing" },
      },
      event: {
        provider: "discord",
        eventType: "message",
        eventKind: "user_request",
        channelId: "1494265174389948538",
        accountId: "default",
        messageId: MESSAGE_ID,
        senderId: "sender-1",
        timestamp: OCCURRED_AT,
        content: "isolated deliberation intake regression",
      },
    } as const;
    const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential };

    assert.deepEqual(await runIntakeProducer(input, env), {
      handled: true,
      providerEventId: MESSAGE_ID,
      duplicate: false,
    });
    assert.deepEqual(await runIntakeProducer(input, env), {
      handled: true,
      providerEventId: MESSAGE_ID,
      duplicate: true,
    });

    const python = path.join(fixture.context.kmRoot, ".venv/bin/python3");
    const records = runProbe(
      python,
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "read",
    ) as Array<Record<string, unknown>>;
    assert.equal(records.length, 1, "spool: duplicate created another canonical record");
    const record = records[0];
    assert.equal(record.sourceTarget, "v1:discord:default:1494265174389948538");
    assert.equal(record.state, "DEBOUNCING", "spool: unexpected post-intake ready state");
    assert.equal(record.duplicateCount, 1);
    const messages = record.messages as Array<Record<string, unknown>>;
    assert.equal(messages.length, 1, "spool: duplicate created another canonical message");
    assert.deepEqual(messages[0], {
      inboundId: messages[0]?.inboundId,
      provider: "discord",
      providerEventId: MESSAGE_ID,
      senderId: "sender-1",
      eventType: "message",
      occurredAt: CANONICAL_OCCURRED_AT,
      receivedAt: RECEIVED_AT,
      content: "isolated deliberation intake regression",
    });

    const beforeMalformed = JSON.stringify(records);
    const malformed = await postMalformed(fixture.context);
    assert.equal(malformed.status, 400, "wire/schema: malformed intake did not return 400");
    assert.equal((malformed.body as { protocolVersion?: unknown }).protocolVersion, 1);
    assert.equal(
      (malformed.body as { error?: { code?: unknown } }).error?.code,
      "SCHEMA_INVALID",
      "wire/schema: malformed intake was not attributed to schema validation",
    );
    const afterMalformed = runProbe(
      python,
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "read",
    );
    assert.equal(
      JSON.stringify(afterMalformed),
      beforeMalformed,
      "spool: malformed intake mutated state",
    );
  } finally {
    t.mock.timers.reset();
    await disposeFixture(fixture);
  }
  assert.equal(existsSync(fixture.tempRoot), false, "cleanup: temporary root remains");
});

test("reviewed final delivery preserves source provenance and uses the durable target", async (t) => {
  const source = { provider: "discord", accountId: "default", channelId: "source-a" } as const;
  const processing = {
    provider: "discord",
    accountId: "default",
    channelId: "processing",
  } as const;
  const override = {
    provider: "discord",
    accountId: "delivery",
    channelId: "target-b",
  } as const;
  const reviewedText = "reviewed integration response";

  for (const scenario of [
    { name: "defaults final delivery to source A", delivery: undefined },
    { name: "routes final delivery from source A to override B", delivery: override },
  ] as const) {
    await t.test(scenario.name, async () => {
      const fixture = await createListenerFixture();
      try {
        const routes = {
          sources: [source],
          processing,
          ...(scenario.delivery ? { delivery: scenario.delivery } : {}),
        };
        const sourceTarget = canonicalTarget(source);
        const processingTarget = canonicalTarget(processing);
        const sourceWireTarget = {
          provider: source.provider,
          account: source.accountId,
          channel: source.channelId,
          threadId: scenario.delivery ? "1535928766595866625" : "1535928766595866624",
        };
        const deliveryTarget = scenario.delivery
          ? {
              provider: scenario.delivery.provider,
              account: scenario.delivery.accountId,
              channel: scenario.delivery.channelId,
            }
          : sourceWireTarget;
        assert.notEqual(
          processingTarget,
          sourceTarget,
          "routing: processing source must remain distinct from intake source A",
        );
        assert.notEqual(
          processingTarget,
          canonicalTarget(deliveryTarget),
          "routing: processing source must remain distinct from final delivery",
        );

        const result = await runIntakeProducer(
          {
            endpoint: fixture.context.endpoint,
            routes,
            event: {
              provider: "discord",
              eventType: "message",
              eventKind: "user_request",
              channelId: source.channelId,
              accountId: source.accountId,
              messageId: scenario.delivery ? "1535928766595866625" : "1535928766595866624",
              senderId: "sender-routing",
              timestamp: OCCURRED_AT,
              content: "deliberation routing integration request",
            },
          },
          { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential },
        );
        assert.equal(
          result.handled,
          true,
          `routing: intake was not handled: ${JSON.stringify(result.diagnostic ?? {})}`,
        );

        const python = path.join(fixture.context.kmRoot, ".venv/bin/python3");
        const prepared = runProbe(
          python,
          fixture.context.kmRoot,
          fixture.tempRoot,
          fixture.context.spoolRoot,
          "prepare",
          reviewedText,
        ) as Record<string, unknown>;
        assert.equal(prepared.state, "READY_TO_SEND", "routing: reviewed item is not ready");
        assert.equal(prepared.sourceTarget, sourceTarget, "routing: source projection changed");

        const client = createIntegrationKmClient(fixture.context, scenario.delivery);
        const ready = await client.ready();
        assert.equal(ready.items.length, 1, "routing: expected exactly one reviewed ready item");
        const item = ready.items[0];
        assert.ok(item, "routing: reviewed ready item is missing");
        assert.equal(item.text, reviewedText, "routing: reviewed text changed before delivery");
        assert.equal(
          item.deliveryEnvelope.sourceTarget,
          sourceTarget,
          "routing: ready envelope lost source A",
        );
        assert.deepEqual(
          item.deliveryEnvelope.deliveryTarget,
          sourceWireTarget,
          "routing: ready envelope must preserve the structured source destination",
        );
        assert.deepEqual(
          item.effectiveDeliveryTarget,
          deliveryTarget,
          "routing: ready item must expose the effective structured destination",
        );

        const reserved = await client.reserve(item, "openclaw-deliberation-integration");
        assert.equal(reserved.outcome, "reserved", "fencing: reviewed item was not reserved");
        if (reserved.outcome !== "reserved") {
          assert.fail("fencing: missing delivery reservation");
        }
        assert.equal(
          reserved.reservation.deliveryEnvelope.sourceTarget,
          sourceTarget,
          "provenance: reservation lost source A",
        );
        assert.deepEqual(
          reserved.reservation.deliveryEnvelope.deliveryTarget,
          deliveryTarget,
          "routing: reservation has the wrong durable delivery target",
        );
        const expectedProviderAttemptId = `provider:${reserved.reservation.attemptId}`;
        const providerCalls: Array<{
          accountId: string;
          channelId: string;
          text: string;
          idempotencyKey: string;
        }> = [];
        let successfulCompletion: Parameters<typeof client.completeDelivery>[0] | undefined;
        let deliveryKm = {
          ...client,
          ready: async () => ({ items: [item], nextCursor: null }),
          reserve: async () => reserved,
          completeDelivery: async (delivery: Parameters<typeof client.completeDelivery>[0]) => {
            successfulCompletion = delivery;
            return await client.completeDelivery(delivery);
          },
        };
        if (scenario.delivery) {
          const beforeRejectedInvocation = runProbe(
            python,
            fixture.context.kmRoot,
            fixture.tempRoot,
            fixture.context.spoolRoot,
            "read",
          ) as Array<Record<string, unknown>>;
          const beforeRejectedDelivery = beforeRejectedInvocation[0]?.delivery as
            | { attempts?: Array<Record<string, unknown>> }
            | undefined;
          const beforeRejectedAttempt = beforeRejectedDelivery?.attempts?.[0];
          assert.ok(beforeRejectedAttempt, "fencing: reserved attempt evidence is missing");
          await assert.rejects(
            client.invoke(reserved.reservation, sourceWireTarget, "provider:mismatched-target"),
            (error: unknown) =>
              error instanceof KmRequestError &&
              error.stage === "http" &&
              error.status === 400 &&
              error.code === "SCHEMA_INVALID",
            "fencing: mismatched attempted target A did not fail closed",
          );
          const afterRejectedInvocation = runProbe(
            python,
            fixture.context.kmRoot,
            fixture.tempRoot,
            fixture.context.spoolRoot,
            "read",
          ) as Array<Record<string, unknown>>;
          const rejectedInvocationDelivery = afterRejectedInvocation[0]?.delivery as
            | { attempts?: Array<Record<string, unknown>> }
            | undefined;
          const rejectedInvocationAttempt = rejectedInvocationDelivery?.attempts?.[0];
          assert.deepEqual(
            rejectedInvocationAttempt,
            beforeRejectedAttempt,
            "fencing: rejected invocation changed durable attempt evidence",
          );
          assert.equal(providerCalls.length, 0, "provider: rejected invocation called provider");
          const mismatchTarget = {
            provider: "discord",
            account: "other",
            channel: "target-c",
          } as const;
          const completeDelivery = deliveryKm.completeDelivery;
          deliveryKm = {
            ...deliveryKm,
            completeDelivery: async (delivery) => {
              const beforeRejectedCompletion = runProbe(
                python,
                fixture.context.kmRoot,
                fixture.tempRoot,
                fixture.context.spoolRoot,
                "read",
              ) as Array<Record<string, unknown>>;
              const completionDelivery = beforeRejectedCompletion[0]?.delivery as
                | { attempts?: Array<Record<string, unknown>> }
                | undefined;
              const beforeRejectedCompletionAttempt = completionDelivery?.attempts?.[0];
              assert.ok(
                beforeRejectedCompletionAttempt,
                "fencing: invoked attempt evidence is missing",
              );
              const callsBeforeRejection = providerCalls.length;
              await assert.rejects(
                client.completeDelivery({ ...delivery, attemptedTarget: mismatchTarget }),
                (error: unknown) =>
                  error instanceof KmRequestError &&
                  error.stage === "http" &&
                  error.status === 400 &&
                  error.code === "SCHEMA_INVALID",
                "fencing: mismatched completion target C did not fail closed",
              );
              const afterRejectedCompletion = runProbe(
                python,
                fixture.context.kmRoot,
                fixture.tempRoot,
                fixture.context.spoolRoot,
                "read",
              ) as Array<Record<string, unknown>>;
              const rejectedCompletionDelivery = afterRejectedCompletion[0]?.delivery as
                | { attempts?: Array<Record<string, unknown>> }
                | undefined;
              const rejectedCompletionAttempt = rejectedCompletionDelivery?.attempts?.[0];
              assert.deepEqual(
                rejectedCompletionAttempt,
                beforeRejectedCompletionAttempt,
                "fencing: rejected completion changed durable attempt evidence",
              );
              assert.equal(
                providerCalls.length,
                callsBeforeRejection,
                "provider: rejected completion triggered another provider call",
              );
              return await completeDelivery(delivery);
            },
          };
        }

        const provider = {
          send: async (call: (typeof providerCalls)[number]) => {
            providerCalls.push(call);
            return { receiptId: "fake-receipt-1", messageId: "fake-message-1" };
          },
        };
        const completed = await createFinalDeliveryAdapter({
          km: deliveryKm,
          providers: { discord: provider },
          owner: "openclaw-deliberation-integration",
        }).runOnce();
        assert.equal(completed?.state, "SENT", "routing: delivery did not reach SENT");
        assert.ok(successfulCompletion, "fencing: adapter did not submit successful completion");
        assert.deepEqual(
          successfulCompletion,
          {
            reservation: reserved.reservation,
            attemptedTarget: deliveryTarget,
            providerAttemptId: expectedProviderAttemptId,
            outcome: "SENT",
            providerReceiptId: "fake-receipt-1",
            providerMessageId: "fake-message-1",
          },
          "fencing: adapter submitted incorrect successful completion evidence",
        );
        assert.equal(providerCalls.length, 1, "provider: fake adapter was not called exactly once");
        const [{ idempotencyKey, ...providerCall }] = providerCalls;
        assert.deepEqual(
          providerCall,
          {
            provider: "discord",
            accountId: (scenario.delivery ?? source).accountId,
            channelId: (scenario.delivery ?? source).channelId,
            ...(scenario.delivery ? {} : { threadId: sourceWireTarget.threadId }),
            text: reviewedText,
          },
          "provider: fake adapter received the wrong account, channel, or text",
        );

        const records = runProbe(
          python,
          fixture.context.kmRoot,
          fixture.tempRoot,
          fixture.context.spoolRoot,
          "read",
        ) as Array<Record<string, unknown>>;
        assert.equal(records.length, 1, "spool: final delivery created another record");
        const record = records[0];
        assert.equal(record.sourceTarget, sourceTarget, "provenance: final record lost source A");
        const review = record.review as { freshnessArtifacts?: Array<Record<string, unknown>> };
        assert.equal(
          review.freshnessArtifacts?.[0]?.sourceTarget,
          sourceTarget,
          "provenance: review freshness no longer identifies source A",
        );
        const delivery = record.delivery as { attempts?: Array<Record<string, unknown>> };
        const attempt = delivery.attempts?.[0];
        assert.equal(
          attempt?.attemptId,
          reserved.reservation.attemptId,
          "fencing: final projection changed the reserved attempt identity",
        );
        assert.equal(
          idempotencyKey,
          expectedProviderAttemptId,
          "provider: fake adapter did not receive the reserved attempt identity",
        );
        assert.equal(
          attempt?.providerAttemptId,
          expectedProviderAttemptId,
          "fencing: durable invocation records the wrong provider attempt identity",
        );
        assert.deepEqual(
          attempt?.attemptedTarget,
          deliveryTarget,
          "fencing: attempted target not durable",
        );
        assert.equal(attempt?.completionOutcome, "SENT", "fencing: completion outcome not durable");
        assert.deepEqual(
          (attempt?.deliveryEnvelope as Record<string, unknown>)?.deliveryTarget,
          deliveryTarget,
          "fencing: durable envelope records the wrong final target",
        );
      } finally {
        await disposeFixture(fixture);
      }
      assert.equal(existsSync(fixture.tempRoot), false, "cleanup: routing temporary root remains");
    });
  }
});

test("listener rejects the production spool before opening SQLite", () => {
  const { kmRoot, listener, python } = requireKmRoot();
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-guard-"));
  const credentialFile = path.join(tempRoot, "credential");
  const productionRoot = productionSpool(kmRoot);
  const productionDatabase = path.join(productionRoot, "spool.sqlite3");
  try {
    writeFileSync(path.join(tempRoot, SENTINEL), "guard\n", { mode: 0o600 });
    writeFileSync(credentialFile, `${randomBytes(24).toString("hex")}\n`, { mode: 0o600 });
    const before = fingerprint(productionDatabase);
    const probe = spawnSync(
      python,
      [path.join(import.meta.dirname, "km-spool-probe.py"), "read", tempRoot, productionRoot],
      { encoding: "utf8", env: childEnvironment(kmRoot, tempRoot), timeout: 10_000 },
    );
    assert.notEqual(probe.status, 0, "spool: probe accepted the production root");
    assert.match(probe.stderr, /overlap the production Deliberation spool/);
    const result = spawnSync(
      python,
      [
        listener,
        "--host",
        "127.0.0.1",
        "--port",
        "0",
        "--credential-file",
        credentialFile,
        "--spool-root",
        productionRoot,
        "--integration-test-root",
        tempRoot,
      ],
      { encoding: "utf8", env: childEnvironment(kmRoot, tempRoot), timeout: 10_000 },
    );
    assert.notEqual(result.status, 0, "spool: listener accepted the production root");
    assert.match(result.stderr, /overlaps the production Deliberation state root/);
    assert.deepEqual(fingerprint(productionDatabase), before, "spool: production database changed");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
  assert.equal(existsSync(tempRoot), false, "cleanup: guard temporary root remains");
});

test("listener and temporary root are cleaned after callback failure", async () => {
  const fixture = await createListenerFixture();
  const pid = fixture.child.pid;
  assert.ok(pid, "cleanup: listener PID is missing");
  await assert.rejects(async () => {
    try {
      throw new Error("deliberate callback failure");
    } finally {
      await disposeFixture(fixture);
    }
  }, /deliberate callback failure/);
  assert.equal(
    existsSync(fixture.tempRoot),
    false,
    "cleanup: failed callback left temporary state",
  );
  assert.throws(
    () => process.kill(pid, 0),
    (error: NodeJS.ErrnoException) => error.code === "ESRCH",
    "cleanup: failed callback left listener running",
  );
});

test("temporary fixture paths cannot alias production state", () => {
  const { kmRoot } = requireKmRoot();
  const productionRoot = productionSpool(kmRoot);
  assert.throws(
    () => assertIsolatedSpool(kmRoot, productionRoot, path.join(productionRoot, "child")),
    /spool: temporary root overlaps the production spool/,
  );
  if (existsSync(productionRoot)) {
    assert.equal(lstatSync(productionRoot).isDirectory(), true);
  }
});
