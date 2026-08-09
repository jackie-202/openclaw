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
import { runIntakeProducer } from "./intake-producer.js";

const SENTINEL = ".openclaw-deliberation-integration-test";
const MESSAGE_ID = "1535928766595866624";
const OCCURRED_AT = "2026-08-09T08:32:34.252Z";
const CANONICAL_OCCURRED_AT = "2026-08-09T08:32:34.252000Z";
const RECEIVED_AT = "2026-08-09T08:33:00.123000Z";
const CONFIGURED_KM_ROOT = (() => {
  const value = process.env.OPENCLAW_DELIBERATION_KM_ROOT;
  if (!value) throw new Error("plugin: set OPENCLAW_DELIBERATION_KM_ROOT to the KM checkout");
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
  command: "init" | "read",
): unknown {
  const result = spawnSync(
    python,
    [path.join(import.meta.dirname, "km-spool-probe.py"), command, tempRoot, spoolRoot],
    {
      encoding: "utf8",
      env: childEnvironment(kmRoot, tempRoot),
      timeout: 10_000,
    },
  );
  assert.equal(result.status, 0, `spool: probe failed: ${result.stderr.trim()}`);
  try {
    return JSON.parse(result.stdout) as unknown;
  } catch {
    assert.fail("spool: probe returned invalid JSON");
  }
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
      if (newline === -1) return;
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
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  child.kill("SIGTERM");
  if (
    await Promise.race([
      exited.then(() => true),
      new Promise<false>((resolve) => setTimeout(() => resolve(false), 2_000)),
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
    if (child) await stopListener(child);
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
  if (cleanupError) throw new Error(`cleanup: ${String(cleanupError)}`);
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
  if (!existsSync(file)) return undefined;
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
