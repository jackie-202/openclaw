import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import type { KmDeliveryTarget } from "./delivery-target.js";
import { createKmClient, type KmReadyItem, type KmReservation } from "./km-client.js";

const rawConfig = {
  enabled: true,
  failClosed: true,
  sources: [{ channel: "discord", accountId: "1", target: "2" }],
  processingSource: { channel: "discord", accountId: "1", target: "3" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
};

const config = parseDeliberationConfig(rawConfig);

const deliveryTarget = {
  provider: "discord" as const,
  accountId: "account-1",
  channelId: "channel-1",
};

const slackDeliveryTarget = {
  provider: "slack" as const,
  accountId: "workspace-delivery",
  channelId: "C456",
  threadId: "1770000000.000001",
};

const configWithDeliveryTarget = parseDeliberationConfig({
  ...rawConfig,
  deliveryTarget: {
    provider: "discord",
    accountId: "account-2",
    channelId: "channel-2",
    threadId: "thread-2",
  },
});

function createClient(response: unknown) {
  return createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl: vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    env: { KM_TOKEN: "test-only" },
  });
}

function validHealthResponse() {
  return {
    protocolVersion: 1,
    status: "ok",
    listener: {
      protocolVersion: 1,
      startedAt: "2026-08-09T12:00:00Z",
      sourceIdentity: {
        status: "ok",
        modules: {
          "lib/deliberation_source_identity.py": { status: "ok", sha256: "a".repeat(64) },
          "lib/deliberation_wire.py": { status: "ok", sha256: "b".repeat(64) },
          "lib/deliberation_spool_contracts.py": { status: "ok", sha256: "c".repeat(64) },
        },
      },
    },
    controls: { "source-intake": true, claims: true, review: true, sender: false },
    runner: {
      owner: "deliberation-v2-cron",
      buildId: "deliberation-v2-runtime-v1",
      installation: { status: "unknown", candidateCount: 0 },
    },
    runtime: {
      queueCounts: {
        dueClosure: 0,
        readyDraft: 0,
        processingPending: 0,
        reviewReady: 0,
        retry: 0,
        readyToSend: 0,
        deliveryInFlight: 0,
      },
      oldestReadyAgeSeconds: null,
      activeSlot: null,
      timeoutCount: 0,
      lateResultCount: 0,
      lastPass: null,
    },
  };
}

function validDeliveryEnvelope(
  target: KmDeliveryTarget = deliveryTarget,
  sourceTarget = "v1:discord:account-1:channel-1",
) {
  return {
    schemaVersion: 1,
    sourceTarget,
    deliveryTarget: {
      provider: target.provider,
      account: target.accountId,
      channel: target.channelId,
      ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
    },
    recordId: "record-1",
    inboundId: "inbound-1",
    draftAttempt: 1,
    draftCorrelationId: "draft-correlation-1",
    reviewAttempt: 1,
    reviewCorrelationId: "review-correlation-1",
    candidateRevision: 1,
    reviewedTextHash: "a".repeat(64),
  };
}

function validReadyItem(
  target: KmDeliveryTarget = deliveryTarget,
  sourceTarget?: string,
): KmReadyItem {
  return {
    recordId: "record-1",
    version: 7,
    text: "reviewed reply",
    candidateRevision: 1,
    updatedAt: "2026-08-01T12:00:00Z",
    deliveryEnvelope: validDeliveryEnvelope(target, sourceTarget),
    effectiveDeliveryTarget: validDeliveryEnvelope(target, sourceTarget).deliveryTarget,
  };
}

function validWireReadyItem(): Omit<KmReadyItem, "effectiveDeliveryTarget"> {
  const { effectiveDeliveryTarget: _, ...item } = validReadyItem();
  return item;
}

function validReservation(
  target: KmDeliveryTarget = deliveryTarget,
  sourceTarget?: string,
): KmReservation {
  return {
    recordId: "record-1",
    attemptId: "attempt-1",
    ordinal: 1,
    version: 8,
    owner: "sender-1",
    leaseToken: "lease-1",
    leaseExpiresAt: "2026-08-01T12:01:00Z",
    candidateRevision: 1,
    reviewedTextHash: "a".repeat(64),
    deliveryEnvelope: validDeliveryEnvelope(target, sourceTarget),
    deliveryEnvelopeDigest: "b".repeat(64),
    reserveIdempotencyKey: "reserve:record-1:7",
  };
}

function validWireReservation(): Omit<KmReservation, "reserveIdempotencyKey"> {
  const { reserveIdempotencyKey: _, ...reservation } = validReservation();
  return reservation;
}

function validTerminalAttempt(
  target: KmDeliveryTarget = deliveryTarget,
  sourceTarget?: string,
): Record<string, unknown> {
  return {
    ordinal: 1,
    attemptId: "attempt-1",
    candidateRevision: 1,
    reviewedTextHash: "a".repeat(64),
    reservedRecordVersion: 7,
    owner: "sender-1",
    leaseExpiresAt: "2026-08-01T12:01:00Z",
    reservedAt: "2026-08-01T12:00:20Z",
    completionOutcome: "SENT",
    outcome: "SENT",
    providerAttemptId: "provider-1",
    providerReceiptId: "receipt-1",
    providerMessageId: "message-1",
    proofReference: null,
    completedAt: "2026-08-01T12:01:00Z",
    deliveryEnvelope: validDeliveryEnvelope(target, sourceTarget),
    deliveryEnvelopeDigest: "b".repeat(64),
    reserveIdempotencyKey: "reserve:record-1:7",
    invocationIdempotencyKey: "invoke:attempt-1",
    completionIdempotencyKey: "complete:attempt-1",
    invokedAt: "2026-08-01T12:00:30Z",
    attemptedTarget: validDeliveryEnvelope(target, sourceTarget).deliveryTarget,
    terminalReason: "delivery_sent",
  };
}

function validFailedAttempt(): Record<string, unknown> {
  return {
    ...validTerminalAttempt(),
    completionOutcome: "FAILED",
    outcome: "FAILED",
    providerReceiptId: null,
    providerMessageId: null,
    providerFailureClass: "rejection",
    providerEvidence: { code: "rejected" },
    terminalReason: "delivery_failed",
  };
}

describe("KM contract parsing", () => {
  it("serializes the required source thread identity with exact camelCase casing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          protocolVersion: 1,
          recordId: "record-1",
          inboundId: "inbound-1",
          duplicate: false,
        }),
        { status: 201 },
      ),
    );
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await client.intake({
      provider: "discord",
      providerEventId: "message-1",
      sourceTarget: "v1:discord:account-1:channel-1",
      sourceThreadId: "message-1",
      senderId: "sender-1",
      occurredAt: "2026-08-04T12:50:19.483Z",
      receivedAt: "2026-08-04T12:50:21.838Z",
      content: "message",
    } as never);

    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as Record<string, unknown>;
    expect(body.sourceThreadId).toBe("message-1");
    expect(body).not.toHaveProperty("source_thread_id");
  });

  it("reports an unavailable credential at the credential stage", async () => {
    const client = createKmClient({ config, openclawConfig: {} as never, env: {} });

    await expect(client.health()).rejects.toMatchObject({
      stage: "credential",
      status: undefined,
      code: "UNKNOWN",
    });
  });

  it.each([
    {
      name: "transport",
      fetchImpl: vi.fn().mockRejectedValue(new Error("socket contains secret")),
      expected: { stage: "transport", status: undefined, code: "UNKNOWN" },
    },
    {
      name: "response-json",
      fetchImpl: vi.fn().mockResolvedValue(new Response("not-json", { status: 200 })),
      expected: { stage: "response-json", status: 200, code: "UNKNOWN" },
    },
    {
      name: "http with canonical code",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            protocolVersion: 1,
            error: { code: "SCHEMA_INVALID", message: "secret body" },
          }),
          { status: 400 },
        ),
      ),
      expected: { stage: "http", status: 400, code: "SCHEMA_INVALID" },
    },
    {
      name: "http with unknown code",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            protocolVersion: 1,
            error: { code: "SECRET_CODE", message: "secret" },
          }),
          { status: 500 },
        ),
      ),
      expected: { stage: "http", status: 500, code: "UNKNOWN" },
    },
  ])("reports bounded $name diagnostics", async ({ fetchImpl, expected }) => {
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await expect(client.health()).rejects.toMatchObject(expected);
  });

  it("reports response-schema after a successful malformed intake response", async () => {
    const client = createClient({ protocolVersion: 1, recordId: "record-1" });

    await expect(
      client.intake({
        provider: "discord",
        providerEventId: "message-1",
        sourceTarget: "discord:channel:source",
        sourceThreadId: "message-1",
        senderId: "sender-1",
        occurredAt: "2026-08-04T12:50:19.483Z",
        receivedAt: "2026-08-04T12:50:21.838Z",
        content: "message",
      }),
    ).rejects.toMatchObject({ stage: "response-schema", status: 200, code: "UNKNOWN" });
  });

  it("rejects caller debounce overrides before transport", async () => {
    const fetchImpl = vi.fn();
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await expect(
      client.intake({
        provider: "discord",
        providerEventId: "message-1",
        sourceTarget: "v1:discord:account-1:channel-1",
        sourceThreadId: "message-1",
        senderId: "sender-1",
        occurredAt: "2026-08-04T12:50:19.483Z",
        receivedAt: "2026-08-04T12:50:21.838Z",
        content: "message",
        debounceSeconds: 17,
      } as never),
    ).rejects.toThrow("debounceSeconds");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [config, undefined],
    [
      configWithDeliveryTarget,
      {
        provider: "discord",
        account: "account-2",
        channel: "channel-2",
        threadId: "thread-2",
      },
    ],
  ] as const)(
    "injects only the configured delivery target at the durable reservation boundary",
    async (clientConfig, expected) => {
      const fetchImpl = vi.fn().mockImplementation((input: string | URL | Request) => {
        const reservation = new URL(String(input)).pathname.endsWith("/reservations");
        return Promise.resolve(
          new Response(
            JSON.stringify(
              reservation
                ? {
                    protocolVersion: 1,
                    reservation: {
                      ...validWireReservation(),
                      deliveryEnvelope: {
                        ...validWireReservation().deliveryEnvelope,
                        deliveryTarget:
                          expected ?? validWireReservation().deliveryEnvelope.deliveryTarget,
                      },
                    },
                  }
                : {
                    protocolVersion: 1,
                    recordId: "record-1",
                    inboundId: "inbound-1",
                    duplicate: false,
                  },
            ),
            { status: reservation ? 201 : 200 },
          ),
        );
      });
      const client = createKmClient({
        config: clientConfig,
        openclawConfig: {} as never,
        fetchImpl,
        env: { KM_TOKEN: "test-only" },
      });

      await client.intake({
        provider: "discord",
        providerEventId: "message-1",
        sourceTarget: "v1:discord:account-1:channel-1",
        sourceThreadId: "message-1",
        senderId: "sender-1",
        occurredAt: "2026-08-04T12:50:19.483Z",
        receivedAt: "2026-08-04T12:50:21.838Z",
        content: "message",
      });
      await client.reserve(validReadyItem(), "sender-1");

      const intakeBody = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as Record<
        string,
        unknown
      >;
      const reservationBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body)) as Record<
        string,
        unknown
      >;
      expect(intakeBody).not.toHaveProperty("deliveryTarget");
      expect(reservationBody.deliveryTarget).toStrictEqual(expected);
    },
  );

  it("binds an exact Slack target and provider receipt through the KM lifecycle", async () => {
    const sourceTarget = "v1:discord:account-1:channel-1";
    const item = validReadyItem(slackDeliveryTarget, sourceTarget);
    const reservation = validReservation(slackDeliveryTarget, sourceTarget);
    const fetchImpl = vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
      const path = new URL(String(input)).pathname;
      const body = path.endsWith("/ready")
        ? {
            protocolVersion: 1,
            items: [
              {
                ...item,
                effectiveDeliveryTarget: undefined,
              },
            ],
            nextCursor: null,
          }
        : path.endsWith("/reservations")
          ? {
              protocolVersion: 1,
              reservation: {
                ...reservation,
                reserveIdempotencyKey: undefined,
              },
            }
          : path.endsWith("/invocations")
            ? {
                protocolVersion: 1,
                invocation: {
                  recordId: reservation.recordId,
                  attemptId: reservation.attemptId,
                  deliveryEnvelope: reservation.deliveryEnvelope,
                  attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
                  invocationIdempotencyKey: `invoke:${reservation.attemptId}`,
                  providerAttemptId: "provider-1",
                  invokedAt: "2026-08-01T12:00:30Z",
                },
              }
            : {
                protocolVersion: 1,
                record: {
                  recordId: reservation.recordId,
                  state: "SENT",
                  version: 9,
                  delivery: {
                    attempts: [validTerminalAttempt(slackDeliveryTarget, sourceTarget)],
                  },
                },
              };
      return new Response(JSON.stringify(body), {
        status: path.endsWith("/reservations") ? 201 : 200,
      });
    });
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    const ready = await client.ready();
    const reserved = await client.reserve(ready.items[0], "sender-1");
    if (reserved.outcome !== "reserved") {
      throw new Error("expected successful Slack reservation fixture");
    }
    await client.invoke(
      reserved.reservation,
      reservation.deliveryEnvelope.deliveryTarget,
      "provider-1",
    );
    await client.completeDelivery({
      reservation: reserved.reservation,
      attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
      providerAttemptId: "provider-1",
      outcome: "SENT",
      providerReceiptId: "receipt-1",
      providerMessageId: "message-1",
    });

    const requestBodies = fetchImpl.mock.calls
      .map(([, init]) => init?.body)
      .filter((body): body is string => typeof body === "string")
      .map((body) => JSON.parse(body) as Record<string, unknown>);
    expect(ready.items[0]?.effectiveDeliveryTarget).toStrictEqual(
      reservation.deliveryEnvelope.deliveryTarget,
    );
    expect(reserved.reservation.deliveryEnvelope.deliveryTarget).toStrictEqual(
      reservation.deliveryEnvelope.deliveryTarget,
    );
    expect(requestBodies[1]?.attemptedTarget).toStrictEqual(
      reservation.deliveryEnvelope.deliveryTarget,
    );
    expect(requestBodies[2]).toMatchObject({
      attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
      providerReceiptId: "receipt-1",
      providerMessageId: "message-1",
    });
  });

  it("binds bounded Slack failure evidence to KM completion without target drift", async () => {
    const reservation = validReservation(slackDeliveryTarget, "v1:slack:workspace-a:C123");
    const attempt = {
      ...validTerminalAttempt(slackDeliveryTarget, "v1:slack:workspace-a:C123"),
      completionOutcome: "FAILED",
      outcome: "FAILED",
      providerReceiptId: null,
      providerMessageId: null,
      providerFailureClass: "rate_limit",
      providerEvidence: { code: "ratelimited", status: 429, retryAfterSeconds: 2 },
      terminalReason: "delivery_failed",
    };
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          protocolVersion: 1,
          record: {
            recordId: reservation.recordId,
            state: "FAILED",
            version: 9,
            delivery: { attempts: [attempt] },
          },
        }),
        { status: 200 },
      ),
    );
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await client.completeDelivery({
      reservation,
      attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
      providerAttemptId: "provider-1",
      outcome: "FAILED",
      providerFailureClass: "rate_limit",
      providerEvidence: { code: "ratelimited", status: 429, retryAfterSeconds: 2 },
    });

    const body = JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
      providerFailureClass: "rate_limit",
      providerEvidence: { code: "ratelimited", status: 429, retryAfterSeconds: 2 },
    });
  });

  it("rejects a terminal reason that contradicts the delivery outcome", async () => {
    const attempt = { ...validTerminalAttempt(), terminalReason: "delivery_failed" };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [attempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("terminal reason that contradicts the delivery outcome");
  });

  it("rejects caller-selected delivery targets before transport", async () => {
    const fetchImpl = vi.fn();
    const client = createKmClient({
      config: configWithDeliveryTarget,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await expect(
      client.intake({
        provider: "discord",
        providerEventId: "message-1",
        sourceTarget: "v1:discord:account-1:channel-1",
        sourceThreadId: "message-1",
        senderId: "sender-1",
        occurredAt: "2026-08-04T12:50:19.483Z",
        receivedAt: "2026-08-04T12:50:21.838Z",
        content: "message",
        deliveryTarget: {
          provider: "discord",
          accountId: "attacker",
          channelId: "channel",
        },
      } as never),
    ).rejects.toThrow("deliveryTarget");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("emits only transport metadata accepted by the closed KM contract", async () => {
    const contract = JSON.parse(
      await readFile(new URL("../contracts/km-wire-v1.json", import.meta.url), "utf8"),
    ) as { transportHeaders: string[] };
    const transportHeaders = new Set(contract.transportHeaders.map((name) => name.toLowerCase()));
    let rawHeaderNames: string[] = [];
    const server = createServer((request, response) => {
      rawHeaderNames = request.rawHeaders.filter((_, index) => index % 2 === 0);
      const applicationHeaders = new Set([
        "authorization",
        "x-deliberation-protocol-version",
        "accept",
        "content-type",
      ]);
      const rejected = Object.keys(request.headers).some(
        (name) => !applicationHeaders.has(name) && !transportHeaders.has(name),
      );
      response.writeHead(rejected ? 400 : 200, {
        "Content-Type": "application/json",
      });
      response.end(JSON.stringify(validHealthResponse()));
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("missing test listener address");
      }
      const client = createKmClient({
        config: {
          ...config,
          km: { ...config.km, endpoint: `http://127.0.0.1:${address.port}` },
        },
        openclawConfig: {} as never,
        env: { KM_TOKEN: "test-only" },
      });

      await expect(client.health()).resolves.toMatchObject({ protocolVersion: 1, status: "ok" });
      expect(transportHeaders.has("accept-language")).toBe(true);
      expect(rawHeaderNames).toEqual(
        expect.arrayContaining(["Accept", "Authorization", "X-Deliberation-Protocol-Version"]),
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("uses the canonical protocol header and reservations route", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          protocolVersion: 1,
          error: { code: "CAS_CONFLICT", message: "record version changed" },
        }),
        { status: 409 },
      ),
    );
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await client.reserve(
      {
        recordId: "record-1",
        version: 7,
        text: "reviewed reply",
        candidateRevision: 1,
        updatedAt: "2026-07-31T12:00:00Z",
      } as never,
      "sender-1",
    );

    expect
      .soft(fetchImpl.mock.calls[0]?.[0])
      .toBe("https://km.invalid/deliberation/v1/reservations");
    expect.soft(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
      "X-Deliberation-Protocol-Version": "1",
    });
  });

  it("rejects health responses outside the accepted closed schema", async () => {
    const client = createClient({
      ...validHealthResponse(),
      unexpected: true,
    });

    await expect(client.health()).rejects.toThrow("invalid health response");
  });

  it("accepts a degraded listener identity as a valid health response", async () => {
    const health = validHealthResponse();
    const client = createClient({
      ...health,
      status: "degraded",
      listener: {
        ...health.listener,
        sourceIdentity: { ...health.listener.sourceIdentity, status: "unavailable" },
      },
    });

    await expect(client.health()).resolves.toMatchObject({
      protocolVersion: 1,
      status: "degraded",
    });
  });

  it.each(["listener", "runner", "runtime"])(
    "rejects malformed nested health projection %s",
    async (field) => {
      const client = createClient({ ...validHealthResponse(), [field]: {} });

      await expect(client.health()).rejects.toThrow("invalid health response");
    },
  );

  it("uses a credential already materialized by the secrets runtime", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(validHealthResponse()), { status: 200 }));
    const client = createKmClient({
      config: { ...config, km: { ...config.km, credential: "runtime-secret" } },
      openclawConfig: {} as never,
      fetchImpl,
      env: {},
    });

    await expect(client.health()).resolves.toMatchObject({
      protocolVersion: 1,
      status: "ok",
      controls: { "source-intake": true, claims: true, review: true, sender: false },
      listener: validHealthResponse().listener,
      runner: validHealthResponse().runner,
      runtime: validHealthResponse().runtime,
    });
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer runtime-secret",
    });
  });

  it("uses only the six canonical endpoint paths", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const path = new URL(String(input)).pathname;
      const body =
        path === "/deliberation/v1/health"
          ? validHealthResponse()
          : path === "/deliberation/v1/ready"
            ? { protocolVersion: 1, items: [], nextCursor: null }
            : path === "/deliberation/v1/intake"
              ? {
                  protocolVersion: 1,
                  recordId: "record-1",
                  inboundId: "inbound-1",
                  duplicate: false,
                }
              : path === "/deliberation/v1/reservations"
                ? {
                    protocolVersion: 1,
                    reservation: validWireReservation(),
                  }
                : path === "/deliberation/v1/invocations"
                  ? {
                      protocolVersion: 1,
                      invocation: {
                        recordId: "record-1",
                        attemptId: "attempt-1",
                        deliveryEnvelope: validDeliveryEnvelope(),
                        attemptedTarget: validDeliveryEnvelope().deliveryTarget,
                        invocationIdempotencyKey: "invoke:attempt-1",
                        providerAttemptId: "provider-1",
                        invokedAt: "2026-08-01T12:00:30Z",
                      },
                    }
                  : {
                      protocolVersion: 1,
                      record: {
                        recordId: "record-1",
                        state: "FAILED",
                        version: 9,
                        delivery: { attempts: [validFailedAttempt()] },
                      },
                    };
      return new Response(JSON.stringify(body), {
        status: path.endsWith("reservations") ? 201 : 200,
      });
    });
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });
    const item = validReadyItem();

    await client.health();
    await client.ready();
    await client.intake({
      provider: "discord",
      providerEventId: "message-1",
      sourceTarget: "acct:target",
      sourceThreadId: "message-1",
      senderId: "sender-1",
      occurredAt: "2026-08-01T12:00:00Z",
      receivedAt: "2026-08-01T12:00:01Z",
      content: "hello",
    });
    const reservation = await client.reserve(item, "sender-1");
    if (reservation.outcome !== "reserved") {
      throw new Error("expected successful reservation fixture");
    }
    await client.invoke(
      reservation.reservation,
      reservation.reservation.deliveryEnvelope.deliveryTarget,
      "provider-1",
    );
    await client.completeDelivery({
      reservation: reservation.reservation,
      attemptedTarget: reservation.reservation.deliveryEnvelope.deliveryTarget,
      providerAttemptId: "provider-1",
      outcome: "FAILED",
      providerFailureClass: "rejection",
      providerEvidence: { code: "rejected" },
    });

    expect(fetchImpl.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual([
      "/deliberation/v1/health",
      "/deliberation/v1/ready",
      "/deliberation/v1/intake",
      "/deliberation/v1/reservations",
      "/deliberation/v1/invocations",
      "/deliberation/v1/completions",
    ]);
    expect(client).not.toHaveProperty("complete");
    expect(client).not.toHaveProperty("reconcile");
  });

  it("rejects a successful response without closed durable invocation evidence", async () => {
    const client = createClient({ protocolVersion: 1, invocation: {} });

    await expect(
      client.invoke(
        validReservation(),
        validReservation().deliveryEnvelope.deliveryTarget,
        "provider-1",
      ),
    ).rejects.toThrow("invalid invocation response");
  });

  it("rejects invocation evidence whose envelope differs from the reservation", async () => {
    const reservation = validReservation();
    const client = createClient({
      protocolVersion: 1,
      invocation: {
        recordId: reservation.recordId,
        attemptId: reservation.attemptId,
        deliveryEnvelope: {
          ...reservation.deliveryEnvelope,
          sourceTarget: "v1:discord:other:source",
        },
        attemptedTarget: reservation.deliveryEnvelope.deliveryTarget,
        invocationIdempotencyKey: `invoke:${reservation.attemptId}`,
        providerAttemptId: "provider-1",
        invokedAt: "2026-08-01T12:00:30Z",
      },
    });

    await expect(
      client.invoke(reservation, reservation.deliveryEnvelope.deliveryTarget, "provider-1"),
    ).rejects.toThrow("mismatched invocation evidence");
  });

  it("rejects invocation evidence whose attempted target drifts", async () => {
    const reservation = validReservation();
    const client = createClient({
      protocolVersion: 1,
      invocation: {
        recordId: reservation.recordId,
        attemptId: reservation.attemptId,
        deliveryEnvelope: reservation.deliveryEnvelope,
        attemptedTarget: {
          ...reservation.deliveryEnvelope.deliveryTarget,
          channel: "other-channel",
        },
        invocationIdempotencyKey: `invoke:${reservation.attemptId}`,
        providerAttemptId: "provider-1",
        invokedAt: "2026-08-01T12:00:30Z",
      },
    });

    await expect(
      client.invoke(reservation, reservation.deliveryEnvelope.deliveryTarget, "provider-1"),
    ).rejects.toThrow("mismatched invocation evidence");
  });

  it("rejects completion evidence that does not belong to the reservation", async () => {
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "other-record",
        state: "SENT",
        version: 9,
        delivery: { attempts: [validTerminalAttempt()] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("delivery attempt envelope for a different record");
  });

  it("rejects completion evidence with another reservation idempotency key", async () => {
    const attempt = { ...validTerminalAttempt(), reserveIdempotencyKey: "reserve:other:7" };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [attempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("mismatched completion evidence");
  });

  it("rejects completion evidence whose attempted target drifts", async () => {
    const attempt = {
      ...validTerminalAttempt(),
      attemptedTarget: {
        ...validReservation().deliveryEnvelope.deliveryTarget,
        channel: "other-channel",
      },
    };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [attempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("terminal delivery with mismatched target evidence");
  });

  it("rejects historical attempt envelopes belonging to another record", async () => {
    const historicalAttempt = {
      ...validTerminalAttempt(),
      attemptId: "historical-attempt",
      deliveryEnvelope: { ...validDeliveryEnvelope(), recordId: "other-record" },
    };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [historicalAttempt, { ...validTerminalAttempt(), ordinal: 2 }] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("delivery attempt envelope for a different record");
  });

  it("rejects ready pagination outside the canonical query contract", async () => {
    const client = createClient({ protocolVersion: 1, items: [], nextCursor: null });

    await expect(client.ready({ limit: 0 })).rejects.toThrow("invalid ready query");
    await expect(client.ready({ limit: 101 })).rejects.toThrow("invalid ready query");
    await expect(client.ready({ cursor: "not-base64url=" })).rejects.toThrow("invalid ready query");
  });

  it("accepts bounded drafting diagnostics from record projections", async () => {
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "FAILED",
        version: 9,
        drafting: {
          diagnostic: { code: "SOURCE_HISTORY_FAILED", message: "history unavailable" },
        },
        terminalReason: "source_history_unavailable",
        delivery: { attempts: [validFailedAttempt()] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "FAILED",
        providerFailureClass: "rejection",
        providerEvidence: { code: "rejected" },
      }),
    ).resolves.toMatchObject({ state: "FAILED" });
  });

  it("rejects malformed closed ready and record responses", async () => {
    const oversizedCursor = createClient({
      protocolVersion: 1,
      items: [],
      nextCursor: "a".repeat(513),
    });
    await expect(oversizedCursor.ready()).rejects.toThrow("invalid ready response");

    const malformedReady = createClient({
      protocolVersion: 1,
      items: [
        {
          recordId: "record-1",
          version: 0,
          text: "reply",
          candidateRevision: 1,
          updatedAt: "2026-08-01T12:00:00Z",
        },
      ],
      nextCursor: null,
    });
    await expect(malformedReady.ready()).rejects.toThrow("invalid ready item");

    const malformedRecord = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [] },
        unexpected: true,
      },
    });
    await expect(
      malformedRecord.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "FAILED",
        providerFailureClass: "rejection",
        providerEvidence: { code: "rejected" },
      }),
    ).rejects.toThrow("invalid record response");

    const malformedOptionalRecord = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [] },
        history: [
          {
            sequence: 1,
            event: "completed",
            fromState: "SENDING",
            toState: "SENT",
            version: 9,
            occurredAt: "2026-08-01T12:01:00Z",
            details: { unexpected: true },
          },
        ],
      },
    });
    await expect(
      malformedOptionalRecord.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "FAILED",
        providerFailureClass: "rejection",
        providerEvidence: { code: "rejected" },
      }),
    ).rejects.toThrow("invalid record response");

    const malformedAttempt = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: {
          attempts: [
            {
              ...validTerminalAttempt(),
              candidateRevision: "wrong",
            },
          ],
        },
      },
    });
    await expect(
      malformedAttempt.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "FAILED",
        providerFailureClass: "rejection",
        providerEvidence: { code: "rejected" },
      }),
    ).rejects.toThrow("invalid candidateRevision");
  });

  it.each(["deliveryEnvelope", "deliveryEnvelopeDigest", "reserveIdempotencyKey"])(
    "rejects terminal delivery attempts missing %s",
    async (missing) => {
      const attempt = validTerminalAttempt();
      delete attempt[missing];
      const client = createClient({
        protocolVersion: 1,
        record: {
          recordId: "record-1",
          state: "SENT",
          version: 9,
          delivery: { attempts: [attempt] },
        },
      });

      await expect(
        client.completeDelivery({
          reservation: validReservation(),
          attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
          providerAttemptId: "provider-1",
          outcome: "SENT",
          providerReceiptId: "receipt-1",
          providerMessageId: "message-1",
        }),
      ).rejects.toThrow("invalid delivery attempt");
    },
  );

  it.each(["deliveryEnvelope", "deliveryEnvelopeDigest"])(
    "rejects terminal delivery attempts with null %s",
    async (field) => {
      const attempt = { ...validTerminalAttempt(), [field]: null };
      const client = createClient({
        protocolVersion: 1,
        record: {
          recordId: "record-1",
          state: "SENT",
          version: 9,
          delivery: { attempts: [attempt] },
        },
      });

      await expect(
        client.completeDelivery({
          reservation: validReservation(),
          attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
          providerAttemptId: "provider-1",
          outcome: "SENT",
          providerReceiptId: "receipt-1",
          providerMessageId: "message-1",
        }),
      ).rejects.toThrow("terminal delivery without durable envelope evidence");
    },
  );

  it("rejects active delivery attempts with null envelope evidence", async () => {
    const activeAttempt = {
      ordinal: 1,
      attemptId: "attempt-1",
      candidateRevision: 1,
      reviewedTextHash: "a".repeat(64),
      reservedRecordVersion: 7,
      owner: "sender-1",
      leaseExpiresAt: "2026-08-01T12:01:00Z",
      reservedAt: "2026-08-01T12:00:20Z",
      completionOutcome: null,
      outcome: null,
      providerAttemptId: null,
      providerReceiptId: null,
      providerMessageId: null,
      proofReference: null,
      completedAt: null,
      deliveryEnvelope: null,
      deliveryEnvelopeDigest: null,
      reserveIdempotencyKey: "reserve:record-1:7",
    };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [activeAttempt, { ...validTerminalAttempt(), ordinal: 2 }] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("active delivery attempt without durable envelope evidence");
  });

  it.each([
    { outcome: "RESERVATION_ABANDONED", terminalReason: "reservation_abandoned" },
    { outcome: "NOT_SENT", terminalReason: null },
    { outcome: "DELIVERY_UNKNOWN", terminalReason: "delivery_outcome_unknown" },
  ])("accepts retained $outcome audit attempts", async ({ outcome, terminalReason }) => {
    const retainedAttempt = {
      ordinal: 1,
      attemptId: `retained-${outcome}`,
      completionOutcome: outcome,
      outcome,
      providerAttemptId: null,
      providerReceiptId: null,
      providerMessageId: null,
      proofReference: null,
      completedAt: null,
      deliveryEnvelope: null,
      deliveryEnvelopeDigest: null,
      reserveIdempotencyKey: `reserve:retained-${outcome}`,
      terminalReason,
    };
    const currentAttempt = { ...validTerminalAttempt(), ordinal: 2 };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [retainedAttempt, currentAttempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).resolves.toMatchObject({ state: "SENT" });
  });

  it.each([
    {
      providerFailureClass: "unknown",
      providerEvidence: { code: "rejected" },
      expected: "providerFailureClass",
    },
    {
      providerFailureClass: "rejection",
      providerEvidence: { unexpected: true },
      expected: "provider evidence",
    },
    {
      providerFailureClass: "rate_limit",
      providerEvidence: { retryAfterSeconds: 1.5 },
      expected: "provider evidence",
    },
  ])(
    "rejects malformed terminal failure evidence %#",
    async ({ providerFailureClass, providerEvidence, expected }) => {
      const attempt = {
        ...validTerminalAttempt(),
        completionOutcome: "FAILED",
        outcome: "FAILED",
        providerReceiptId: null,
        providerMessageId: null,
        providerFailureClass,
        providerEvidence,
      };
      const client = createClient({
        protocolVersion: 1,
        record: {
          recordId: "record-1",
          state: "FAILED",
          version: 9,
          delivery: { attempts: [attempt] },
        },
      });

      await expect(
        client.completeDelivery({
          reservation: validReservation(),
          attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
          providerAttemptId: "provider-1",
          outcome: "FAILED",
          providerFailureClass: "rejection",
          providerEvidence: { code: "rejected" },
        }),
      ).rejects.toThrow(expected);
    },
  );

  it.each([
    { field: "providerFailureClass", value: "unknown", expected: "providerFailureClass" },
    { field: "providerEvidence", value: { unexpected: true }, expected: "provider evidence" },
    { field: "terminalReason", value: "unknown", expected: "terminalReason" },
  ])("rejects invalid optional terminal field $field", async ({ field, value, expected }) => {
    const attempt = { ...validTerminalAttempt(), [field]: value };
    const client = createClient({
      protocolVersion: 1,
      record: {
        recordId: "record-1",
        state: "SENT",
        version: 9,
        delivery: { attempts: [attempt] },
      },
    });

    await expect(
      client.completeDelivery({
        reservation: validReservation(),
        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
        providerAttemptId: "provider-1",
        outcome: "SENT",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow(expected);
  });

  it("rejects a malformed ready delivery envelope at its field boundary", async () => {
    const client = createClient({
      protocolVersion: 1,
      items: [{ ...validWireReadyItem(), deliveryEnvelope: null }],
      nextCursor: null,
    });

    await expect(client.ready()).rejects.toThrow("invalid deliveryEnvelope");
  });

  it.each([
    {
      provider: "Teams",
      account: "account-1",
      channel: "channel-1",
    },
    {
      provider: "slack",
      account: "workspace-1",
      channel: "C123",
    },
  ])("accepts generic KM wire target $provider before adapter validation", async (target) => {
    const item = validWireReadyItem();
    const client = createClient({
      protocolVersion: 1,
      items: [
        {
          ...item,
          deliveryEnvelope: { ...item.deliveryEnvelope, deliveryTarget: target },
        },
      ],
      nextCursor: null,
    });

    await expect(client.ready()).resolves.toMatchObject({
      items: [{ effectiveDeliveryTarget: target }],
    });
  });

  it.each([
    { deliveryTarget: undefined, expected: "invalid deliveryEnvelope" },
    {
      deliveryTarget: {
        provider: "discord",
        accountId: "account-1",
        channelId: "channel 1",
      },
      expected: "deliveryEnvelope.deliveryTarget",
    },
    {
      deliveryTarget: { ...deliveryTarget, unknown: true },
      expected: "deliveryEnvelope.deliveryTarget",
    },
  ])(
    "rejects missing or malformed durable delivery target $deliveryTarget",
    async ({ deliveryTarget: malformedTarget, expected }) => {
      const item = validWireReadyItem();
      const client = createClient({
        protocolVersion: 1,
        items: [
          {
            ...item,
            deliveryEnvelope: { ...item.deliveryEnvelope, deliveryTarget: malformedTarget },
          },
        ],
        nextCursor: null,
      });

      await expect(client.ready()).rejects.toThrow(expected);
    },
  );

  it("rejects malformed source provenance in a delivery envelope", async () => {
    const item = validWireReadyItem();
    const client = createClient({
      protocolVersion: 1,
      items: [
        {
          ...item,
          deliveryEnvelope: {
            ...item.deliveryEnvelope,
            sourceTarget: "discord:account-1:channel-1",
          },
        },
      ],
      nextCursor: null,
    });

    await expect(client.ready()).rejects.toThrow("deliveryEnvelope.sourceTarget");
  });

  it("rejects a ready envelope belonging to another record", async () => {
    const item = validWireReadyItem();
    const client = createClient({
      protocolVersion: 1,
      items: [
        {
          ...item,
          deliveryEnvelope: { ...item.deliveryEnvelope, recordId: "other-record" },
        },
      ],
      nextCursor: null,
    });

    await expect(client.ready()).rejects.toThrow("ready envelope for a different record");
  });

  it.each([
    {
      name: "deliveryEnvelope",
      reservation: { ...validWireReservation(), deliveryEnvelope: null },
      expected: "invalid deliveryEnvelope",
    },
    {
      name: "deliveryEnvelopeDigest",
      reservation: { ...validWireReservation(), deliveryEnvelopeDigest: "short" },
      expected: "invalid deliveryEnvelopeDigest",
    },
    {
      name: "reviewedTextHash",
      reservation: { ...validWireReservation(), reviewedTextHash: "short" },
      expected: "invalid reviewedTextHash",
    },
    {
      name: "record identity",
      reservation: {
        ...validWireReservation(),
        deliveryEnvelope: { ...validWireReservation().deliveryEnvelope, recordId: "other-record" },
      },
      expected: "reservation envelope for a different record",
    },
    {
      name: "ready provenance",
      reservation: {
        ...validWireReservation(),
        deliveryEnvelope: {
          ...validWireReservation().deliveryEnvelope,
          inboundId: "other-inbound",
        },
      },
      expected: "reservation that differs from the request",
    },
    {
      name: "request owner",
      reservation: { ...validWireReservation(), owner: "other-owner" },
      expected: "reservation that differs from the request",
    },
    {
      name: "stale ready replay",
      reservation: { ...validWireReservation(), version: validWireReadyItem().version - 1 },
      expected: "reservation that differs from the request",
    },
  ])("rejects malformed reservation $name", async ({ reservation, expected }) => {
    const client = createClient({ protocolVersion: 1, reservation });

    await expect(client.reserve(validReadyItem(), "sender-1")).rejects.toThrow(expected);
  });
});
