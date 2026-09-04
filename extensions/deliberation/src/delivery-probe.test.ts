import { createServer, type IncomingMessage, type Server } from "node:http";
import { describe, expect, it, vi } from "vitest";

type ProbeResult = {
  ok: boolean;
  stages: Array<{ stage: string; outcome: string }>;
  provider: {
    callCount: number;
    target: { provider: string; mode: "root" | "thread" } | null;
  };
  build: {
    packageVersion: string | null;
    commit: string | null;
    artifactClass: string;
    moduleSha256: string;
  };
  error?: {
    stage: string;
    operation?: string;
    path?: string;
    status?: number;
    code?: string;
    cause?: string;
  };
};

type ProbeFunction = (input: unknown) => Promise<ProbeResult>;

const credentialRef = { source: "env", provider: "default", id: "KM_PROBE_TEST_TOKEN" };

function deliveryEnvelope(
  target = {
    provider: "discord",
    account: "account-1",
    channel: "channel-1",
  },
) {
  return {
    schemaVersion: 1,
    pipelineId: "probe-pipeline",
    sourceTarget: "v1:discord:account-1:channel-1",
    deliveryTarget: target,
    recordId: "record-1",
    inboundId: "inbound-1",
    draftAttempt: 1,
    draftCorrelationId: "draft-1",
    reviewAttempt: 1,
    reviewCorrelationId: "review-1",
    candidateRevision: 1,
    reviewedTextHash: "a".repeat(64),
  };
}

async function requestBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>;
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("missing listener address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function writeJson(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

function createLifecycleServer(options: { mismatchReservationTarget?: boolean } = {}) {
  const requests: Array<{ path: string; body: Record<string, unknown> }> = [];
  let completed = false;
  const envelope = deliveryEnvelope();
  const server = createServer((request, response) => {
    void (async () => {
      const path = request.url ?? "";
      const body = request.method === "POST" ? await requestBody(request) : {};
      requests.push({ path, body });
      if (request.headers.authorization !== "Bearer ephemeral-test-token") {
        writeJson(response, 401, {
          protocolVersion: 1,
          error: { code: "AUTH_INVALID", message: "sensitive auth detail" },
        });
        return;
      }
      if (path === "/deliberation/v1/ready") {
        writeJson(response, 200, {
          protocolVersion: 1,
          items: completed
            ? []
            : [
                {
                  recordId: "record-1",
                  pipelineId: "probe-pipeline",
                  deliveryTarget: envelope.deliveryTarget,
                  version: 7,
                  text: "sensitive reviewed reply",
                  candidateRevision: 1,
                  updatedAt: "2026-08-25T12:00:00Z",
                  deliveryEnvelope: envelope,
                },
              ],
          nextCursor: null,
        });
        return;
      }
      if (path === "/deliberation/v1/reservations") {
        const reservedEnvelope = options.mismatchReservationTarget
          ? deliveryEnvelope({ ...envelope.deliveryTarget, channel: "other-channel" })
          : envelope;
        writeJson(response, 201, {
          protocolVersion: 1,
          reservation: {
            recordId: "record-1",
            attemptId: "attempt-1",
            ordinal: 1,
            version: 8,
            owner: body.owner,
            leaseToken: "lease-1",
            leaseExpiresAt: "2026-08-25T12:01:00Z",
            candidateRevision: 1,
            reviewedTextHash: "a".repeat(64),
            deliveryEnvelope: reservedEnvelope,
            deliveryEnvelopeDigest: "b".repeat(64),
          },
        });
        return;
      }
      if (path === "/deliberation/v1/invocations") {
        writeJson(response, 200, {
          protocolVersion: 1,
          invocation: {
            recordId: "record-1",
            attemptId: "attempt-1",
            deliveryEnvelope: envelope,
            attemptedTarget: envelope.deliveryTarget,
            invocationIdempotencyKey: "invoke:attempt-1",
            providerAttemptId: body.providerAttemptId,
            invokedAt: "2026-08-25T12:00:30Z",
          },
        });
        return;
      }
      if (path === "/deliberation/v1/completions") {
        completed = true;
        writeJson(response, 200, {
          protocolVersion: 1,
          record: {
            recordId: "record-1",
            pipelineId: "probe-pipeline",
            deliveryTarget: envelope.deliveryTarget,
            sourceSequence: 1,
            state: "SENT",
            version: 9,
            delivery: {
              attempts: [
                {
                  ordinal: 1,
                  attemptId: "attempt-1",
                  candidateRevision: 1,
                  reviewedTextHash: "a".repeat(64),
                  reservedRecordVersion: 7,
                  owner: body.owner,
                  leaseExpiresAt: "2026-08-25T12:01:00Z",
                  reservedAt: "2026-08-25T12:00:20Z",
                  completionOutcome: "SENT",
                  outcome: "SENT",
                  providerAttemptId: body.providerAttemptId,
                  providerReceiptId: body.providerReceiptId,
                  providerMessageId: body.providerMessageId,
                  proofReference: null,
                  completedAt: "2026-08-25T12:00:40Z",
                  deliveryEnvelope: envelope,
                  deliveryEnvelopeDigest: "b".repeat(64),
                  reserveIdempotencyKey: "reserve:record-1:7",
                  invocationIdempotencyKey: "invoke:attempt-1",
                  completionIdempotencyKey: "complete:attempt-1",
                  invokedAt: "2026-08-25T12:00:30Z",
                  attemptedTarget: envelope.deliveryTarget,
                  terminalReason: "delivery_sent",
                },
              ],
            },
          },
        });
        return;
      }
      writeJson(response, 404, {
        protocolVersion: 1,
        error: { code: "ROUTE_NOT_FOUND", message: "unknown route" },
      });
    })().catch((error: unknown) => {
      response.destroy(error instanceof Error ? error : undefined);
    });
  });
  return { server, requests };
}

async function probeFunction(): Promise<ProbeFunction> {
  const api = (await import("../api.js")) as Record<string, unknown>;
  expect(api).toHaveProperty("runDeliberationDeliveryProbe");
  return api.runDeliberationDeliveryProbe as ProbeFunction;
}

describe("public Deliberation delivery probe", () => {
  it("is exported only from the non-plugin API boundary", async () => {
    const api = await import("../api.js");
    const plugin = await import("../index.js");

    expect(api).toHaveProperty("runDeliberationDeliveryProbe");
    expect(plugin).not.toHaveProperty("runDeliberationDeliveryProbe");
  });

  it("runs the real ready/reserve/invoke/complete lifecycle once and replays with zero calls", async () => {
    vi.stubEnv("KM_PROBE_TEST_TOKEN", "ephemeral-test-token");
    const { server, requests } = createLifecycleServer();
    const endpoint = await listen(server);
    try {
      const runProbe = await probeFunction();
      const first = await runProbe({
        endpoint,
        credential: credentialRef,
        requestTimeoutMs: 1_000,
      });
      const replay = await runProbe({
        endpoint,
        credential: credentialRef,
        requestTimeoutMs: 1_000,
      });

      expect(first).toMatchObject({
        ok: true,
        provider: { callCount: 1, target: { provider: "discord", mode: "root" } },
        build: {
          packageVersion: expect.any(String),
          artifactClass: "source-api",
          moduleSha256: expect.stringMatching(/^[0-9a-f]{64}$/),
        },
      });
      expect(first.stages.map(({ stage, outcome }) => `${stage}:${outcome}`)).toEqual([
        "input:ok",
        "ready:ok",
        "reserve:ok",
        "invoke:ok",
        "provider:ok",
        "complete:ok",
      ]);
      expect(replay).toMatchObject({ ok: true, provider: { callCount: 0, target: null } });
      expect(replay.stages.map(({ stage, outcome }) => `${stage}:${outcome}`)).toEqual([
        "input:ok",
        "ready:empty",
      ]);
      expect(requests.map(({ path }) => path)).toEqual([
        "/deliberation/v1/ready",
        "/deliberation/v1/reservations",
        "/deliberation/v1/invocations",
        "/deliberation/v1/completions",
        "/deliberation/v1/ready",
      ]);
      expect(requests[1]?.body.idempotencyKey).toBe("reserve:record-1:7");
      expect(requests[2]?.body).toMatchObject({
        idempotencyKey: "invoke:attempt-1",
        providerAttemptId: "provider:attempt-1",
      });
      expect(requests[3]?.body).toMatchObject({
        idempotencyKey: "complete:attempt-1",
        providerAttemptId: "provider:attempt-1",
      });
      expect(JSON.stringify([first, replay])).not.toContain("sensitive reviewed reply");
      expect(JSON.stringify([first, replay])).not.toContain("ephemeral-test-token");
      expect(JSON.stringify([first, replay])).not.toContain(endpoint);
    } finally {
      vi.unstubAllEnvs();
      await close(server);
    }
  });

  it("reports the reserve stage for a target mismatch without calling the provider", async () => {
    vi.stubEnv("KM_PROBE_TEST_TOKEN", "ephemeral-test-token");
    const { server } = createLifecycleServer({ mismatchReservationTarget: true });
    const endpoint = await listen(server);
    try {
      const result = await (
        await probeFunction()
      )({
        endpoint,
        credential: credentialRef,
        requestTimeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        ok: false,
        provider: { callCount: 0, target: null },
        error: { stage: "reserve", cause: "target_mismatch" },
      });
    } finally {
      vi.unstubAllEnvs();
      await close(server);
    }
  });

  it.each([
    {
      name: "authentication",
      status: 401,
      body: {
        protocolVersion: 1,
        error: { code: "AUTH_INVALID", message: "credential secret detail" },
      },
      expected: {
        stage: "ready",
        operation: "ready",
        path: "/deliberation/v1/ready",
        status: 401,
        code: "AUTH_INVALID",
      },
    },
    {
      name: "protocol",
      status: 200,
      body: { protocolVersion: 2, items: [], nextCursor: null, text: "payload secret" },
      expected: {
        stage: "ready",
        operation: "ready",
        path: "/deliberation/v1/ready",
        status: 200,
        code: "UNKNOWN",
        cause: "response_schema",
      },
    },
  ])("returns bounded $name diagnostics", async ({ status, body, expected }) => {
    vi.stubEnv("KM_PROBE_TEST_TOKEN", "ephemeral-test-token");
    const server = createServer((_request, response) => writeJson(response, status, body));
    const endpoint = await listen(server);
    try {
      const result = await (
        await probeFunction()
      )({
        endpoint,
        credential: credentialRef,
        requestTimeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        ok: false,
        provider: { callCount: 0, target: null },
        error: expected,
      });
      expect(JSON.stringify(result)).not.toMatch(/credential secret detail|payload secret/u);
    } finally {
      vi.unstubAllEnvs();
      await close(server);
    }
  });

  it.each([
    { endpoint: "https://127.0.0.1:4444", credential: credentialRef, requestTimeoutMs: 1_000 },
    { endpoint: "http://localhost:4444", credential: credentialRef, requestTimeoutMs: 1_000 },
    { endpoint: "http://192.0.2.1:4444", credential: credentialRef, requestTimeoutMs: 1_000 },
    { endpoint: "http://127.0.0.1:8080", credential: credentialRef, requestTimeoutMs: 1_000 },
    { endpoint: "http://127.0.0.1:4444", credential: "literal-secret", requestTimeoutMs: 1_000 },
    {
      endpoint: "http://127.0.0.1:4444",
      credential: credentialRef,
      requestTimeoutMs: 1_000,
      provider: "discord",
    },
    {
      endpoint: "http://127.0.0.1:4444",
      credential: credentialRef,
      requestTimeoutMs: 1_000,
      providers: { discord: { send: vi.fn() } },
    },
  ])("refuses unsafe or provider-selecting input before I/O %#", async (input) => {
    const result = await (await probeFunction())(input);

    expect(result).toMatchObject({
      ok: false,
      stages: [{ stage: "input", outcome: "refused" }],
      provider: { callCount: 0, target: null },
      error: { stage: "input", cause: "invalid_input" },
    });
  });
});
