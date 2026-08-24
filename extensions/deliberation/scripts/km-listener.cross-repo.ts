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
import { createFinalDeliveryAdapter, deriveProviderAttemptId } from "../src/final-adapter.js";
import {
  FinalDeliveryOutcomeUnknownError,
  FinalDeliveryRejectedError,
} from "../src/final-adapter.js";
import {
  createKmClient,
  KmRequestError,
  type KmReadyItem,
  type KmReservation,
} from "../src/km-client.js";
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
  credentialFile: string;
  tempRoot: string;
};

type FileFingerprint = {
  sha256: string;
  size: number;
  mtimeMs: number;
};

type ContractFixture = {
  name: string;
  request: {
    method: string;
    path: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    body: Record<string, unknown> | null;
  };
  response: { status: number; body: { error?: { code?: string } } };
};

let verifiedKmRuntime: { kmRoot: string; listener: string; python: string } | undefined;

const contractFixtures = (
  JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../contracts/cutover-controls-v1.json"), "utf8"),
  ) as { cases: ContractFixture[] }
).cases;

function requireKmRoot(): { kmRoot: string; listener: string; python: string } {
  if (verifiedKmRuntime) {
    return verifiedKmRuntime;
  }
  const kmRoot = realpathSync(CONFIGURED_KM_ROOT);
  const revision = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: kmRoot,
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.equal(
    revision.status,
    0,
    `provenance: cannot read KM revision: ${revision.stderr.trim()}`,
  );
  console.log(`KM HEAD (provenance only): ${revision.stdout.trim()}`);
  const listener = path.join(kmRoot, "scripts/deliberation-v2-listener.py");
  const python = path.join(kmRoot, ".venv/bin/python3");
  assert.ok(existsSync(listener), `plugin: KM listener is missing at ${listener}`);
  assert.ok(existsSync(python), `plugin: KM Python is missing at ${python}`);
  const provenance = JSON.parse(
    readFileSync(path.join(import.meta.dirname, "../contracts/provenance.json"), "utf8"),
  ) as { ownerFiles?: Record<string, string>; files?: Record<string, string> };
  assert.ok(provenance.ownerFiles, "provenance: accepted KM owner hashes are missing");
  for (const [ownerFile, expected] of Object.entries(provenance.ownerFiles)) {
    const relative = ownerFile.replace(/^km-system\//, "");
    const file = path.join(kmRoot, relative);
    assert.ok(existsSync(file), `provenance: KM owner file is missing: ${relative}`);
    const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(actual, expected, `provenance: KM owner hash mismatch: ${relative}`);
    console.log(`KM artifact verified: ${relative} ${actual}`);
  }
  assert.ok(provenance.files, "provenance: local mirror hashes are missing");
  for (const [localFile, expected] of Object.entries(provenance.files)) {
    const file = path.join(import.meta.dirname, "../contracts", localFile);
    const actual = createHash("sha256").update(readFileSync(file)).digest("hex");
    assert.equal(actual, expected, `provenance: local mirror hash mismatch: ${localFile}`);
  }
  verifiedKmRuntime = { kmRoot, listener, python };
  return verifiedKmRuntime;
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
  command: "audit-fixture" | "init" | "migration-check" | "prepare" | "read" | "reconcile",
  reviewedText?: string,
  recordId?: string,
  sourceHistory?: Array<Record<string, unknown>>,
  cutoffProviderEventId?: string,
  reconcileAt?: string,
  auditCase?: "legacy-not-sent" | "legacy-delivery-unknown" | "pipeline-drift",
): unknown {
  const args = [path.join(import.meta.dirname, "km-spool-probe.py"), command, tempRoot, spoolRoot];
  if (command === "prepare") {
    assert.ok(
      recordId && reviewedText && sourceHistory && cutoffProviderEventId,
      "spool: prepare requires an exact record, reviewed text, source history, and cutoff",
    );
    args.push(recordId, reviewedText, JSON.stringify(sourceHistory), cutoffProviderEventId);
  } else if (command === "reconcile") {
    assert.ok(reconcileAt, "spool: reconcile requires an exact clock");
    args.push(reconcileAt);
  } else if (command === "audit-fixture") {
    assert.ok(recordId && auditCase, "spool: audit fixture requires a record and case");
    args.push(recordId, auditCase);
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
    throw new Error("spool: probe returned invalid JSON");
  }
}

function explicitSourceHistory(providerEventId: string, content: string) {
  return [
    {
      providerEventId,
      senderId: "source-history-sender",
      senderIsBot: false,
      eventType: "message",
      occurredAt: OCCURRED_AT,
      content,
    },
  ];
}

function canonicalTarget(route: {
  provider: string;
  accountId: string;
  channelId: string;
}): string {
  return `v1:${route.provider}:${route.accountId}:${route.channelId}`;
}

function createIntegrationKmClient(context: ListenerContext, fetchImpl?: typeof fetch) {
  const config = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    pipelines: [
      {
        id: "discord-source-a",
        source: { channel: "discord", accountId: "default", target: "source-a" },
      },
    ],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    km: {
      endpoint: context.endpoint,
      credential: context.credential,
      requestTimeoutMs: 5_000,
    },
    restrictedSessionKeys: ["__deliberation-integration-restricted__"],
  });
  return createKmClient({ config, openclawConfig: {} as never, fetchImpl });
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
      credentialFile,
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

async function restartListener(fixture: ListenerFixture): Promise<void> {
  await stopListener(fixture.child);
  const { listener, python } = requireKmRoot();
  const child = spawn(
    python,
    [
      listener,
      "--host",
      "127.0.0.1",
      "--port",
      "0",
      "--credential-file",
      fixture.credentialFile,
      "--spool-root",
      fixture.context.spoolRoot,
      "--integration-test-root",
      fixture.tempRoot,
    ],
    { env: childEnvironment(fixture.context.kmRoot, fixture.tempRoot), stdio: "pipe" },
  );
  child.stdin.end();
  fixture.child = child;
  const port = await awaitReadiness(child);
  fixture.context.endpoint = `http://127.0.0.1:${port}`;
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
    const detail = cleanupError instanceof Error ? cleanupError.message : "unknown cleanup failure";
    throw new Error(`cleanup: ${detail}`);
  }
}

function requireContractFixture(name: string): ContractFixture {
  const fixture = contractFixtures.find((item) => item.name === name);
  assert.ok(fixture, `fixture: missing ${name}`);
  return fixture;
}

function sendFixtureRequest(
  context: ListenerContext,
  fixture: ContractFixture,
  bodyOverride?: Record<string, unknown>,
): Promise<{ status: number; body: unknown }> {
  const requestBody = bodyOverride ?? fixture.request.body;
  const body = requestBody === null ? undefined : JSON.stringify(requestBody);
  const headers = { ...fixture.request.headers };
  if (headers.Authorization && fixture.name !== "auth.invalid") {
    headers.Authorization = `Bearer ${context.credential}`;
  }
  if (body === undefined) {
    delete headers["Content-Type"];
  } else {
    headers["Content-Length"] = String(Buffer.byteLength(body));
  }
  const query = new URLSearchParams(fixture.request.query).toString();
  return new Promise((resolve, reject) => {
    const outgoing = request(
      `${context.endpoint}${fixture.request.path}${query ? `?${query}` : ""}`,
      {
        method: fixture.request.method,
        headers,
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
            reject(new Error(`${fixture.name}: invalid response JSON: ${String(error)}`));
          }
        });
      },
    );
    outgoing.on("error", (error) => reject(new Error(`HTTP/auth: ${error.message}`)));
    outgoing.end(body);
  });
}

function assertFixtureResponse(
  fixture: ContractFixture,
  response: { status: number; body: unknown },
): void {
  assert.equal(response.status, fixture.response.status, `${fixture.name}: unexpected status`);
  assert.equal(
    (response.body as { error?: { code?: unknown } }).error?.code,
    fixture.response.body.error?.code,
    `${fixture.name}: unexpected error code`,
  );
}

function readSpool(fixture: ListenerFixture): Array<Record<string, unknown>> {
  return runProbe(
    path.join(fixture.context.kmRoot, ".venv/bin/python3"),
    fixture.context.kmRoot,
    fixture.tempRoot,
    fixture.context.spoolRoot,
    "read",
  ) as Array<Record<string, unknown>>;
}

function producerInput(
  fixture: ListenerFixture,
  params: {
    messageId: string;
    content: string;
    accountId?: string;
    channelId?: string;
    pipelineId?: string;
    deliveryChannelId?: string;
  },
) {
  const accountId = params.accountId ?? "default";
  const channelId = params.channelId ?? "source-a";
  return {
    endpoint: fixture.context.endpoint,
    pipelines: [
      {
        id: params.pipelineId ?? `pipeline-${accountId}-${channelId}`,
        source: { channel: "discord", accountId, target: channelId },
        ...(params.deliveryChannelId
          ? {
              target: {
                channel: "discord",
                accountId,
                target: params.deliveryChannelId,
              },
            }
          : {}),
      },
    ],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    event: {
      provider: "discord",
      eventType: "message",
      eventKind: "user_request",
      accountId,
      conversationId: channelId,
      messageId: params.messageId,
      senderId: `sender-${accountId}`,
      timestamp: OCCURRED_AT,
      content: params.content,
    },
    context: {
      channelId: "discord",
      accountId,
      conversationId: channelId,
      messageId: params.messageId,
      senderId: `sender-${accountId}`,
    },
  } as const;
}

async function produce(fixture: ListenerFixture, params: Parameters<typeof producerInput>[1]) {
  return await runIntakeProducer(producerInput(fixture, params), {
    OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential,
  });
}

function recordForEvent(fixture: ListenerFixture, providerEventId: string) {
  const record = readSpool(fixture).find((candidate) => {
    const messages = candidate.messages as Array<Record<string, unknown>> | undefined;
    return messages?.some((message) => message.providerEventId === providerEventId);
  });
  assert.ok(record, `spool: record for ${providerEventId} is missing`);
  return record;
}

function prepareRecord(
  fixture: ListenerFixture,
  recordId: string,
  reviewedText: string,
  sourceHistory: Array<Record<string, unknown>>,
  cutoffProviderEventId: string,
) {
  return runProbe(
    path.join(fixture.context.kmRoot, ".venv/bin/python3"),
    fixture.context.kmRoot,
    fixture.tempRoot,
    fixture.context.spoolRoot,
    "prepare",
    reviewedText,
    recordId,
    sourceHistory,
    cutoffProviderEventId,
  ) as Record<string, unknown>;
}

async function readyItemFor(fixture: ListenerFixture, recordId: string) {
  const client = createIntegrationKmClient(fixture.context);
  const item = (await client.ready()).items.find((candidate) => candidate.recordId === recordId);
  assert.ok(item, `spool: ready item for ${recordId} is missing`);
  return { client, item };
}

function attemptFor(record: Record<string, unknown>, attemptId: string) {
  const delivery = record.delivery as { attempts?: Array<Record<string, unknown>> } | undefined;
  const attempt = delivery?.attempts?.find((candidate) => candidate.attemptId === attemptId);
  assert.ok(attempt, `spool: delivery attempt ${attemptId} is missing`);
  return attempt;
}

function completionRecord(record: Record<string, unknown>) {
  return {
    recordId: record.recordId,
    pipelineId: record.pipelineId,
    deliveryTarget: record.deliveryTarget,
    sourceSequence: record.sourceSequence,
    state: record.state,
    version: record.version,
    terminalReason: record.terminalReason,
    delivery: record.delivery,
  };
}

async function setupReadyRecord(
  fixture: ListenerFixture,
  messageId: string,
  options: { pipelineId?: string; deliveryChannelId?: string } = {},
) {
  const content = `intake ${messageId}`;
  const result = await produce(fixture, { messageId, content, ...options });
  assert.equal(result.handled, true, "fixture setup: intake was not handled");
  const record = recordForEvent(fixture, messageId);
  assert.ok(typeof record.recordId === "string", "fixture setup: record ID is missing");
  prepareRecord(
    fixture,
    record.recordId,
    `reviewed ${messageId}`,
    explicitSourceHistory(messageId, `history ${messageId}`),
    messageId,
  );
  return { recordId: record.recordId, ...(await readyItemFor(fixture, record.recordId)) };
}

async function prepareReservation(fixture: ListenerFixture): Promise<{
  client: ReturnType<typeof createIntegrationKmClient>;
  item: KmReadyItem;
  reservation: KmReservation;
}> {
  const input = {
    endpoint: fixture.context.endpoint,
    pipelines: [
      {
        id: "negative-fixture-pipeline",
        source: { channel: "discord", accountId: "default", target: "negative-source" },
      },
    ],
    processingSource: { channel: "discord", accountId: "default", target: "processing" },
    event: {
      provider: "discord",
      eventType: "message",
      eventKind: "user_request",
      accountId: "default",
      conversationId: "negative-source",
      messageId: MESSAGE_ID,
      senderId: "negative-sender",
      timestamp: OCCURRED_AT,
      content: "negative lifecycle setup",
    },
    context: {
      channelId: "discord",
      accountId: "default",
      conversationId: "negative-source",
      messageId: MESSAGE_ID,
      senderId: "negative-sender",
    },
  } as const;
  const result = await runIntakeProducer(input, {
    OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential,
  });
  assert.equal(result.handled, true, "fixture setup: intake was not handled");
  const record = readSpool(fixture)[0];
  assert.ok(
    record && typeof record.recordId === "string",
    "fixture setup: intake record is missing",
  );
  runProbe(
    path.join(fixture.context.kmRoot, ".venv/bin/python3"),
    fixture.context.kmRoot,
    fixture.tempRoot,
    fixture.context.spoolRoot,
    "prepare",
    "negative fixture reviewed text",
    record.recordId,
    explicitSourceHistory(MESSAGE_ID, "negative lifecycle source history"),
    MESSAGE_ID,
  );
  const client = createIntegrationKmClient(fixture.context);
  const ready = await client.ready();
  assert.equal(ready.items.length, 1, "fixture setup: expected one ready item");
  const item = ready.items[0];
  assert.ok(item, "fixture setup: ready item is missing");
  const reserved = await client.reserve(item, "negative-fixture-owner");
  assert.equal(reserved.outcome, "reserved", "fixture setup: reservation failed");
  if (reserved.outcome !== "reserved") {
    assert.fail("fixture setup: reservation evidence is missing");
  }
  return { client, item, reservation: reserved.reservation };
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

void test("OR-07 authenticated-event-creates-one-record", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date("2026-08-09T08:33:00.123Z") });
  const fixture = await createListenerFixture();
  try {
    const input = {
      endpoint: fixture.context.endpoint,
      pipelines: [
        {
          id: "discord-source",
          source: {
            channel: "discord",
            accountId: "default",
            target: "1494265174389948538",
          },
        },
      ],
      processingSource: { channel: "discord", accountId: "default", target: "processing" },
      event: {
        provider: "discord",
        eventType: "message",
        eventKind: "user_request",
        conversationId: "1494265174389948538",
        accountId: "default",
        messageId: MESSAGE_ID,
        senderId: "sender-1",
        timestamp: OCCURRED_AT,
        content: "isolated deliberation intake regression",
      },
      context: {
        channelId: "discord",
        accountId: "default",
        conversationId: "1494265174389948538",
        messageId: MESSAGE_ID,
        senderId: "sender-1",
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
    const secondMessageId = "1535928766595866625";
    assert.deepEqual(
      await runIntakeProducer(
        {
          ...input,
          event: {
            ...input.event,
            messageId: secondMessageId,
            content: "second event in the same source window",
          },
          context: { ...input.context, messageId: secondMessageId },
        },
        env,
      ),
      { handled: true, providerEventId: secondMessageId, duplicate: false },
    );

    const python = path.join(fixture.context.kmRoot, ".venv/bin/python3");
    const records = runProbe(
      python,
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "read",
    ) as Array<Record<string, unknown>>;
    assert.equal(records.length, 2, "spool: distinct same-window events did not stay distinct");
    const record = records.find((candidate) =>
      (candidate.messages as Array<Record<string, unknown>>).some(
        (message) => message.providerEventId === MESSAGE_ID,
      ),
    );
    assert.ok(record, "spool: first canonical record is missing");
    assert.equal(record.pipelineId, "discord-source");
    assert.equal(record.sourceTarget, "v1:discord:default:1494265174389948538");
    assert.equal(record.sourceThreadId, MESSAGE_ID);
    assert.deepEqual(record.deliveryTarget, {
      provider: "discord",
      account: "default",
      channel: "1494265174389948538",
      threadId: MESSAGE_ID,
    });
    assert.equal(record.state, "DEBOUNCING", "spool: unexpected post-intake ready state");
    assert.equal(record.duplicateCount, 1);
    const messages = record.messages as Array<Record<string, unknown>>;
    assert.equal(messages.length, 1, "spool: duplicate created another canonical message");
    assert.deepEqual(messages[0], {
      inboundId: messages[0]?.inboundId,
      provider: "discord",
      providerEventId: MESSAGE_ID,
      pipelineId: "discord-source",
      deliveryTarget: record.deliveryTarget,
      senderId: "sender-1",
      eventType: "message",
      occurredAt: CANONICAL_OCCURRED_AT,
      receivedAt: RECEIVED_AT,
      content: "isolated deliberation intake regression",
    });
    const secondRecord = records.find((candidate) => candidate !== record);
    assert.ok(secondRecord, "spool: second canonical record is missing");
    assert.equal(secondRecord.duplicateCount, 0);
    assert.equal((secondRecord.messages as Array<unknown>).length, 1);

    const beforeMalformed = JSON.stringify(records);
    const schemaFixture = requireContractFixture("schema.unknown-field");
    const malformed = await sendFixtureRequest(fixture.context, schemaFixture);
    assertFixtureResponse(schemaFixture, malformed);
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

void test("OR-08 duplicate-idempotent-conflict-zero-mutation", async () => {
  const fixture = await createListenerFixture();
  try {
    const params = { messageId: "1535928766595866708", content: "original OR-08 event" };
    assert.equal((await produce(fixture, params)).duplicate, false);
    const record = recordForEvent(fixture, params.messageId);
    const [message] = record.messages as Array<Record<string, unknown>>;
    assert.ok(message);
    const intake = {
      pipelineId: record.pipelineId as string,
      deliveryTarget: record.deliveryTarget as KmReadyItem["deliveryTarget"],
      provider: message.provider as string,
      providerEventId: message.providerEventId as string,
      sourceTarget: record.sourceTarget as string,
      sourceThreadId: record.sourceThreadId as string,
      senderId: message.senderId as string,
      occurredAt: message.occurredAt as string,
      receivedAt: message.receivedAt as string,
      content: message.content as string,
      eventType: message.eventType as "message",
    };
    const client = createIntegrationKmClient(fixture.context);
    assert.equal((await client.intake(intake)).duplicate, true);
    const beforeConflict = JSON.stringify(readSpool(fixture));
    await assert.rejects(
      client.intake({ ...intake, content: "conflicting OR-08 bytes" }),
      (error: unknown) =>
        error instanceof KmRequestError && error.status === 400 && error.code === "SCHEMA_INVALID",
    );
    assert.equal(JSON.stringify(readSpool(fixture)), beforeConflict);
    const replayed = recordForEvent(fixture, params.messageId);
    assert.equal(replayed.duplicateCount, 1);
    assert.equal((replayed.messages as Array<unknown>).length, 1);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-09 account-channel-source-isolation", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866709";
    for (const route of [
      { accountId: "account-a", channelId: "channel-a", pipelineId: "or09-pipeline" },
      { accountId: "account-b", channelId: "channel-a", pipelineId: "or09-pipeline" },
      { accountId: "account-a", channelId: "channel-b", pipelineId: "or09-pipeline" },
    ]) {
      const result = await produce(fixture, {
        messageId,
        content: `isolated ${route.accountId}/${route.channelId}`,
        ...route,
      });
      assert.equal(result.duplicate, false);
    }
    const records = readSpool(fixture);
    assert.equal(records.length, 3);
    assert.equal(new Set(records.map((record) => record.recordId)).size, 3);
    assert.equal(new Set(records.map((record) => record.sourceTarget)).size, 3);
    assert.ok(records.every((record) => record.sourceSequence === 1));
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-10 history-context-only-pending-event-singular", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866710";
    await produce(fixture, { messageId, content: "pending event" });
    const record = recordForEvent(fixture, messageId);
    assert.ok(typeof record.recordId === "string");
    const historyId = "1535928766595866700";
    prepareRecord(
      fixture,
      record.recordId,
      "reviewed OR-10",
      explicitSourceHistory(historyId, "separate source history"),
      historyId,
    );
    const [prepared] = readSpool(fixture);
    assert.equal((prepared.messages as Array<unknown>).length, 1);
    assert.equal(
      (prepared.messages as Array<Record<string, unknown>>)[0]?.providerEventId,
      messageId,
    );
    const sourceContext = prepared.sourceContext as Record<string, unknown>;
    assert.equal(sourceContext.cutoffProviderEventId, historyId);
    assert.deepEqual(
      sourceContext.messages,
      explicitSourceHistory(historyId, "separate source history"),
    );
    assert.equal(readSpool(fixture).length, 1);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-11 pipeline-source-target-immutable-end-to-end", async () => {
  const fixture = await createListenerFixture();
  try {
    const { client, item } = await setupReadyRecord(fixture, "1535928766595866711", {
      pipelineId: "or11-pipeline",
      deliveryChannelId: "or11-destination",
    });
    assert.equal(item.pipelineId, "or11-pipeline");
    assert.equal(item.deliveryEnvelope.pipelineId, item.pipelineId);
    assert.deepEqual(item.deliveryEnvelope.deliveryTarget, item.deliveryTarget);
    const reserved = await client.reserve(item, "or11-owner");
    assert.equal(reserved.outcome, "reserved");
    if (reserved.outcome !== "reserved") {
      assert.fail("OR-11 reservation evidence is missing");
    }
    assert.equal(reserved.reservation.recordId, item.recordId);
    assert.equal(reserved.reservation.deliveryEnvelope.pipelineId, item.pipelineId);
    assert.equal(
      reserved.reservation.deliveryEnvelope.sourceTarget,
      item.deliveryEnvelope.sourceTarget,
    );
    assert.deepEqual(reserved.reservation.deliveryEnvelope.deliveryTarget, item.deliveryTarget);
    const providerAttemptId = deriveProviderAttemptId(reserved.reservation.attemptId);
    await client.invoke(reserved.reservation, providerAttemptId);
    const completed = await client.completeDelivery({
      reservation: reserved.reservation,
      providerAttemptId,
      outcome: "SENT",
      providerReceiptId: "or11-receipt",
      providerMessageId: "or11-message",
    });
    assert.equal(completed.pipelineId, item.pipelineId);
    assert.deepEqual(completed.deliveryTarget, item.deliveryTarget);
    const completedAttempt = (completed.delivery as { attempts: Array<Record<string, unknown>> })
      .attempts[0];
    assert.ok(completedAttempt);
    assert.equal(
      (completedAttempt.deliveryEnvelope as Record<string, unknown>).sourceTarget,
      item.deliveryEnvelope.sourceTarget,
    );
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-12 reservation-no-target-override-cas-replay", async () => {
  const fixture = await createListenerFixture();
  try {
    const { client, item } = await setupReadyRecord(fixture, "1535928766595866712");
    const overrideFixture = requireContractFixture("reserve.delivery-target-malformed");
    const beforeOverride = JSON.stringify(readSpool(fixture));
    assertFixtureResponse(
      overrideFixture,
      await sendFixtureRequest(fixture.context, overrideFixture, {
        recordId: item.recordId,
        expectedVersion: item.version,
        owner: "or12-owner",
        idempotencyKey: "reserve:or12:override",
        leaseSeconds: 60,
        deliveryTarget: { provider: "discord", account: "other", channel: "override" },
      }),
    );
    assert.equal(JSON.stringify(readSpool(fixture)), beforeOverride);
    const first = await client.reserve(item, "or12-owner");
    assert.equal(first.outcome, "reserved");
    const beforeReplay = JSON.stringify(readSpool(fixture));
    const replay = await client.reserve(item, "or12-owner");
    assert.deepEqual(replay, first);
    assert.equal(JSON.stringify(readSpool(fixture)), beforeReplay);
    const conflict = await client.reserve({ ...item, version: item.version - 1 }, "or12-owner");
    assert.equal(conflict.outcome, "conflict");
    assert.equal(JSON.stringify(readSpool(fixture)), beforeReplay);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-13 invocation-marker-before-one-provider-call", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866713";
    const { client, item } = await setupReadyRecord(fixture, messageId);
    let providerCalls = 0;
    let reserved: KmReservation | undefined;
    const km = {
      ...client,
      ready: async () => ({ items: [item], nextCursor: null }),
      reserve: async (...args: Parameters<typeof client.reserve>) => {
        const result = await client.reserve(...args);
        if (result.outcome === "reserved") {
          reserved = result.reservation;
        }
        return result;
      },
    };
    await createFinalDeliveryAdapter({
      km,
      owner: "or13-owner",
      providers: {
        discord: {
          send: async () => {
            providerCalls += 1;
            assert.ok(reserved, "OR-13 provider ran before reservation");
            const attempt = attemptFor(recordForEvent(fixture, messageId), reserved.attemptId);
            assert.ok(attempt.invokedAt, "OR-13 provider ran before durable invocation");
            assert.equal(attempt.providerAttemptId, deriveProviderAttemptId(reserved.attemptId));
            assert.equal(attempt.completionOutcome, null);
            return { receiptId: "or13-receipt", messageId: "or13-message" };
          },
        },
      },
    }).runOnce();
    assert.equal(providerCalls, 1);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-14 sent-completion-exact-immutable-receipt", async () => {
  const fixture = await createListenerFixture();
  try {
    const { client, item } = await setupReadyRecord(fixture, "1535928766595866714");
    let reservation: KmReservation | undefined;
    const km = {
      ...client,
      ready: async () => ({ items: [item], nextCursor: null }),
      reserve: async (...args: Parameters<typeof client.reserve>) => {
        const result = await client.reserve(...args);
        if (result.outcome === "reserved") {
          reservation = result.reservation;
        }
        return result;
      },
    };
    await createFinalDeliveryAdapter({
      km,
      owner: "or14-owner",
      providers: {
        discord: {
          send: async () => ({ receiptId: "or14-receipt", messageId: "or14-message" }),
        },
      },
    }).runOnce();
    assert.ok(reservation);
    const beforeReplay = JSON.stringify(readSpool(fixture));
    await client.completeDelivery({
      reservation,
      providerAttemptId: deriveProviderAttemptId(reservation.attemptId),
      outcome: "SENT",
      providerReceiptId: "or14-receipt",
      providerMessageId: "or14-message",
    });
    assert.equal(JSON.stringify(readSpool(fixture)), beforeReplay);
    await assert.rejects(
      client.completeDelivery({
        reservation,
        providerAttemptId: deriveProviderAttemptId(reservation.attemptId),
        outcome: "SENT",
        providerReceiptId: "other-receipt",
        providerMessageId: "or14-message",
      }),
      (error: unknown) => error instanceof KmRequestError && error.code === "CAS_CONFLICT",
    );
    assert.equal(JSON.stringify(readSpool(fixture)), beforeReplay);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-15 authoritative-provider-rejection-terminal", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866715";
    const { client, item } = await setupReadyRecord(fixture, messageId);
    let providerCalls = 0;
    const result = await createFinalDeliveryAdapter({
      km: { ...client, ready: async () => ({ items: [item], nextCursor: null }) },
      owner: "or15-owner",
      providers: {
        discord: {
          send: async () => {
            providerCalls += 1;
            throw new FinalDeliveryRejectedError("permission denied", "permission");
          },
        },
      },
    }).runOnce();
    assert.equal(providerCalls, 1);
    assert.equal(result?.state, "FAILED");
    const record = recordForEvent(fixture, messageId);
    const attempts = (record.delivery as { attempts: Array<Record<string, unknown>> }).attempts;
    assert.equal(attempts[0]?.providerFailureClass, "permission");
    assert.equal(attempts[0]?.providerReceiptId, null);
    assert.equal(
      (await client.ready()).items.some((ready) => ready.recordId === item.recordId),
      false,
    );
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-16 timeout-transport-remain-delivery-unknown", async () => {
  for (const [messageId, providerError] of [
    ["1535928766595866716", new Error("transport interrupted after invocation")],
    ["1535928766595866719", new FinalDeliveryOutcomeUnknownError("request timed out")],
  ] as const) {
    const fixture = await createListenerFixture();
    try {
      const { client, item } = await setupReadyRecord(fixture, messageId);
      let providerCalls = 0;
      await assert.rejects(
        createFinalDeliveryAdapter({
          km: { ...client, ready: async () => ({ items: [item], nextCursor: null }) },
          owner: "or16-owner",
          providers: {
            discord: {
              send: async () => {
                providerCalls += 1;
                throw providerError;
              },
            },
          },
        }).runOnce(),
        FinalDeliveryOutcomeUnknownError,
      );
      assert.equal(providerCalls, 1);
      const record = recordForEvent(fixture, messageId);
      assert.equal(record.state, "SENDING");
      const attempt = (record.delivery as { attempts: Array<Record<string, unknown>> }).attempts[0];
      assert.ok(attempt?.invokedAt);
      assert.equal(attempt?.outcome, null);
      assert.equal(attempt?.providerReceiptId, null);
    } finally {
      await disposeFixture(fixture);
    }
  }
});

void test("OR-17 invoked-unknown-nonreservable-after-restart", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866717";
    const { client, item } = await setupReadyRecord(fixture, messageId);
    const reserved = await client.reserve(item, "or17-owner");
    assert.equal(reserved.outcome, "reserved");
    if (reserved.outcome !== "reserved") {
      assert.fail("OR-17 reservation evidence is missing");
    }
    const providerAttemptId = deriveProviderAttemptId(reserved.reservation.attemptId);
    await client.invoke(reserved.reservation, providerAttemptId);
    await restartListener(fixture);
    const reconcileAt = new Date(
      Date.parse(reserved.reservation.leaseExpiresAt) + 1_000,
    ).toISOString();
    runProbe(
      path.join(fixture.context.kmRoot, ".venv/bin/python3"),
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "reconcile",
      undefined,
      undefined,
      undefined,
      undefined,
      reconcileAt,
    );
    const record = recordForEvent(fixture, messageId);
    assert.equal(record.state, "FAILED");
    assert.equal(record.terminalReason, "delivery_outcome_unknown");
    const attempt = attemptFor(record, reserved.reservation.attemptId);
    assert.equal(attempt.providerAttemptId, providerAttemptId);
    assert.deepEqual(attempt.deliveryEnvelope, reserved.reservation.deliveryEnvelope);
    assert.equal((await createIntegrationKmClient(fixture.context).ready()).items.length, 0);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-18 never-invoked-abandonment-fresh-attempt-id", async () => {
  const fixture = await createListenerFixture();
  try {
    const messageId = "1535928766595866718";
    const { client, item } = await setupReadyRecord(fixture, messageId);
    const first = await client.reserve(item, "or18-owner");
    assert.equal(first.outcome, "reserved");
    if (first.outcome !== "reserved") {
      assert.fail("OR-18 reservation evidence is missing");
    }
    await restartListener(fixture);
    const reconcileAt = new Date(
      Date.parse(first.reservation.leaseExpiresAt) + 1_000,
    ).toISOString();
    runProbe(
      path.join(fixture.context.kmRoot, ".venv/bin/python3"),
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "reconcile",
      undefined,
      undefined,
      undefined,
      undefined,
      reconcileAt,
    );
    const freshClient = createIntegrationKmClient(fixture.context);
    const freshItem = (await freshClient.ready()).items.find(
      (candidate) => candidate.recordId === item.recordId,
    );
    assert.ok(freshItem, "OR-18 abandoned record did not return to ready");
    const second = await freshClient.reserve(freshItem, "or18-owner");
    assert.equal(second.outcome, "reserved");
    if (second.outcome !== "reserved") {
      assert.fail("OR-18 fresh reservation evidence is missing");
    }
    assert.notEqual(second.reservation.attemptId, first.reservation.attemptId);
    assert.equal(second.reservation.ordinal, first.reservation.ordinal + 1);
    assert.deepEqual(second.reservation.deliveryEnvelope, first.reservation.deliveryEnvelope);
    const abandoned = attemptFor(recordForEvent(fixture, messageId), first.reservation.attemptId);
    assert.equal(abandoned.outcome, "RESERVATION_ABANDONED");
    assert.equal(abandoned.providerAttemptId, null);
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-19 legacy-not-sent-unknown-never-authorize-retry", async () => {
  for (const [index, auditCase] of (
    ["legacy-not-sent", "legacy-delivery-unknown"] as const
  ).entries()) {
    const fixture = await createListenerFixture();
    try {
      const messageId = `153592876659586672${index}`;
      const { client, item } = await setupReadyRecord(fixture, messageId);
      const reserved = await client.reserve(item, "or19-owner");
      assert.equal(reserved.outcome, "reserved");
      if (reserved.outcome !== "reserved") {
        assert.fail("OR-19 reservation evidence is missing");
      }
      const audit = runProbe(
        path.join(fixture.context.kmRoot, ".venv/bin/python3"),
        fixture.context.kmRoot,
        fixture.tempRoot,
        fixture.context.spoolRoot,
        "audit-fixture",
        undefined,
        item.recordId,
        undefined,
        undefined,
        undefined,
        auditCase,
      ) as {
        record: Record<string, unknown>;
        currentAttemptId: string;
        currentReserveIdempotencyKey: string;
      };
      const currentReservation = {
        ...reserved.reservation,
        attemptId: audit.currentAttemptId,
        ordinal: 2,
        reserveIdempotencyKey: audit.currentReserveIdempotencyKey,
      };
      const parser = createIntegrationKmClient(
        fixture.context,
        async () =>
          new Response(
            JSON.stringify({ protocolVersion: 1, record: completionRecord(audit.record) }),
            { status: 200 },
          ),
      );
      await assert.rejects(
        parser.completeDelivery({
          reservation: currentReservation,
          providerAttemptId: "provider-current",
          outcome: "SENT",
          providerReceiptId: "receipt-current",
          providerMessageId: "message-current",
        }),
        /unauthorized delivery retry/,
      );
    } finally {
      await disposeFixture(fixture);
    }
  }
});

void test("OR-20 historical-attempt-drift-and-tamper-fail-closed", async () => {
  const fixture = await createListenerFixture();
  try {
    const { client, item } = await setupReadyRecord(fixture, "1535928766595866730");
    const reserved = await client.reserve(item, "or20-owner");
    assert.equal(reserved.outcome, "reserved");
    if (reserved.outcome !== "reserved") {
      assert.fail("OR-20 reservation evidence is missing");
    }
    const audit = runProbe(
      path.join(fixture.context.kmRoot, ".venv/bin/python3"),
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "audit-fixture",
      undefined,
      item.recordId,
      undefined,
      undefined,
      undefined,
      "pipeline-drift",
    ) as {
      record: Record<string, unknown>;
      currentAttemptId: string;
      currentReserveIdempotencyKey: string;
    };
    const parser = createIntegrationKmClient(
      fixture.context,
      async () =>
        new Response(
          JSON.stringify({ protocolVersion: 1, record: completionRecord(audit.record) }),
          { status: 200 },
        ),
    );
    await assert.rejects(
      parser.completeDelivery({
        reservation: {
          ...reserved.reservation,
          attemptId: audit.currentAttemptId,
          ordinal: 2,
          reserveIdempotencyKey: audit.currentReserveIdempotencyKey,
        },
        providerAttemptId: "provider-current",
        outcome: "SENT",
        providerReceiptId: "receipt-current",
        providerMessageId: "message-current",
      }),
      /historical delivery attempt drift|record delivery authority drift/,
    );
  } finally {
    await disposeFixture(fixture);
  }
});

void test("OR-21 atomic-bounded-legacy-migration-audit-only", async () => {
  const fixture = await createListenerFixture();
  try {
    await stopListener(fixture.child);
    const result = runProbe(
      path.join(fixture.context.kmRoot, ".venv/bin/python3"),
      fixture.context.kmRoot,
      fixture.tempRoot,
      fixture.context.spoolRoot,
      "migration-check",
    ) as Record<string, unknown>;
    assert.deepEqual(result, {
      version: "1",
      rollbackObserved: true,
      rollbackAtomic: true,
      historicalPipelineId: "__historical_v1__",
      historicalValid: false,
      historicalState: "SENT",
      historicalReadyCount: 0,
      sourceReport: { migratedRecordIds: [] },
      targetReport: { migratedRecordIds: [], skippedRecords: [] },
    });
  } finally {
    await disposeFixture(fixture);
  }
});

void test("named intake and protocol negatives reach their runtime rejection", async (t) => {
  const names = [
    "auth.missing",
    "auth.invalid",
    "version.unsupported",
    "schema.unknown-field",
    "intake.debounce-override-rejected",
    "intake.conflicting-replay",
    "intake.provider-mismatch",
    "intake.account-missing",
    "intake.synthetic-impersonation",
    "intake.historical-reopen-rejected",
  ] as const;

  for (const name of names) {
    await t.test(name, async () => {
      const listener = await createListenerFixture();
      try {
        if (name === "intake.conflicting-replay") {
          const setup = requireContractFixture("intake.success");
          const setupResponse = await sendFixtureRequest(listener.context, setup);
          assert.equal(setupResponse.status, setup.response.status, `${name}: setup intake failed`);
        }
        const before = JSON.stringify(readSpool(listener));
        const fixture = requireContractFixture(name);
        assertFixtureResponse(fixture, await sendFixtureRequest(listener.context, fixture));
        assert.equal(
          JSON.stringify(readSpool(listener)),
          before,
          `${name}: rejection mutated state`,
        );
      } finally {
        await disposeFixture(listener);
      }
    });
  }
});

void test("named lifecycle conflicts preserve durable state without provider calls", async (t) => {
  for (const name of [
    "reserve.cas-conflict",
    "reserve.lease-conflict",
    "invoke.conflict",
    "complete.conflict",
  ] as const) {
    await t.test(name, async () => {
      const listener = await createListenerFixture();
      try {
        const fixture = requireContractFixture(name);
        const { client, item, reservation } = await prepareReservation(listener);
        const attemptedTarget = reservation.deliveryEnvelope.deliveryTarget;
        const providerAttemptId = "negative-provider-attempt";
        let body: Record<string, unknown>;

        if (name === "reserve.cas-conflict") {
          body = {
            recordId: item.recordId,
            expectedVersion: item.version - 1,
            owner: reservation.owner,
            idempotencyKey: "negative-cas-conflict",
            leaseSeconds: 60,
          };
        } else if (name === "reserve.lease-conflict") {
          body = {
            recordId: item.recordId,
            expectedVersion: item.version,
            owner: reservation.owner,
            idempotencyKey: reservation.reserveIdempotencyKey,
            leaseSeconds: 61,
          };
        } else {
          await client.invoke(reservation, providerAttemptId);
          if (name === "invoke.conflict") {
            body = {
              recordId: reservation.recordId,
              attemptId: reservation.attemptId,
              owner: reservation.owner,
              leaseToken: reservation.leaseToken,
              deliveryEnvelope: reservation.deliveryEnvelope,
              deliveryEnvelopeDigest: reservation.deliveryEnvelopeDigest,
              attemptedTarget,
              idempotencyKey: `invoke:${reservation.attemptId}`,
              providerAttemptId: `${providerAttemptId}-conflict`,
            };
          } else {
            await client.completeDelivery({
              reservation,
              providerAttemptId,
              outcome: "SENT",
              providerReceiptId: "negative-receipt",
              providerMessageId: "negative-message",
            });
            body = {
              recordId: reservation.recordId,
              attemptId: reservation.attemptId,
              owner: reservation.owner,
              leaseToken: reservation.leaseToken,
              deliveryEnvelope: reservation.deliveryEnvelope,
              deliveryEnvelopeDigest: reservation.deliveryEnvelopeDigest,
              attemptedTarget,
              invocationIdempotencyKey: `invoke:${reservation.attemptId}`,
              outcome: "SENT",
              idempotencyKey: "complete-conflict",
              providerAttemptId,
              providerReceiptId: "negative-receipt",
              providerMessageId: "negative-message",
            };
          }
        }

        const before = JSON.stringify(readSpool(listener));
        assertFixtureResponse(fixture, await sendFixtureRequest(listener.context, fixture, body));
        assert.equal(
          JSON.stringify(readSpool(listener)),
          before,
          `${name}: rejection mutated state`,
        );
      } finally {
        await disposeFixture(listener);
      }
    });
  }
});

void test("reviewed final delivery preserves source provenance and uses the durable target", async (t) => {
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
          canonicalTarget({
            provider: deliveryTarget.provider,
            accountId: deliveryTarget.account,
            channelId: deliveryTarget.channel,
          }),
          "routing: processing source must remain distinct from final delivery",
        );

        const result = await runIntakeProducer(
          {
            endpoint: fixture.context.endpoint,
            pipelines: [
              {
                id: "discord-source-a",
                source: {
                  channel: source.provider,
                  accountId: source.accountId,
                  target: source.channelId,
                },
                ...(scenario.delivery
                  ? {
                      target: {
                        channel: scenario.delivery.provider,
                        accountId: scenario.delivery.accountId,
                        target: scenario.delivery.channelId,
                      },
                    }
                  : {}),
              },
            ],
            processingSource: {
              channel: processing.provider,
              accountId: processing.accountId,
              target: processing.channelId,
            },
            event: {
              provider: "discord",
              eventType: "message",
              eventKind: "user_request",
              conversationId: source.channelId,
              accountId: source.accountId,
              messageId: scenario.delivery ? "1535928766595866625" : "1535928766595866624",
              senderId: "sender-routing",
              timestamp: OCCURRED_AT,
              content: "deliberation routing integration request",
            },
            context: {
              channelId: "discord",
              accountId: source.accountId,
              conversationId: source.channelId,
              messageId: scenario.delivery ? "1535928766595866625" : "1535928766595866624",
              senderId: "sender-routing",
            },
          },
          { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential },
        );
        assert.equal(
          result.handled,
          true,
          `routing: intake was not handled: ${JSON.stringify(result.diagnostic ?? {})}`,
        );

        const intakeRecord = readSpool(fixture)[0];
        assert.ok(
          intakeRecord && typeof intakeRecord.recordId === "string",
          "routing: intake record is missing",
        );
        const python = path.join(fixture.context.kmRoot, ".venv/bin/python3");
        const prepared = runProbe(
          python,
          fixture.context.kmRoot,
          fixture.tempRoot,
          fixture.context.spoolRoot,
          "prepare",
          reviewedText,
          intakeRecord.recordId,
          explicitSourceHistory(
            scenario.delivery ? "1535928766595866625" : "1535928766595866624",
            "deliberation routing source history",
          ),
          scenario.delivery ? "1535928766595866625" : "1535928766595866624",
        ) as Record<string, unknown>;
        assert.equal(prepared.state, "READY_TO_SEND", "routing: reviewed item is not ready");
        assert.equal(prepared.sourceTarget, sourceTarget, "routing: source projection changed");

        const client = createIntegrationKmClient(fixture.context);
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
          deliveryTarget,
          "routing: ready envelope must preserve the effective durable destination",
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
        const expectedProviderAttemptId = deriveProviderAttemptId(reserved.reservation.attemptId);
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
            client.invoke(
              {
                ...reserved.reservation,
                deliveryEnvelope: {
                  ...reserved.reservation.deliveryEnvelope,
                  deliveryTarget: sourceWireTarget,
                },
              },
              "provider:mismatched-target",
            ),
            (error: unknown) =>
              error instanceof KmRequestError &&
              error.stage === "http" &&
              (error.code === "SCHEMA_INVALID" || error.code === "CAS_CONFLICT"),
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
                client.completeDelivery({
                  ...delivery,
                  reservation: {
                    ...delivery.reservation,
                    deliveryEnvelope: {
                      ...delivery.reservation.deliveryEnvelope,
                      deliveryTarget: mismatchTarget,
                    },
                  },
                }),
                (error: unknown) =>
                  error instanceof KmRequestError &&
                  error.stage === "http" &&
                  (error.code === "SCHEMA_INVALID" || error.code === "CAS_CONFLICT"),
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

void test("listener rejects the production spool before opening SQLite", () => {
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

void test("listener and temporary root are cleaned after callback failure", async () => {
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

void test("temporary fixture paths cannot alias production state", () => {
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
