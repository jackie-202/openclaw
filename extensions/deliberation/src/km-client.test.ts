import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient, type KmReadyItem, type KmReservation } from "./km-client.js";

const config = parseDeliberationConfig({
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
});

function createClient(response: unknown) {
  return createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl: vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    env: { KM_TOKEN: "test-only" },
  });
}

function validReadyItem(): KmReadyItem {
  return {
    recordId: "record-1",
    version: 7,
    text: "reviewed reply",
    candidateRevision: 1,
    updatedAt: "2026-08-01T12:00:00Z",
    deliveryEnvelope: { sourceTarget: "v1:discord:account-1:channel-1" },
  };
}

function validReservation(): KmReservation {
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
    deliveryEnvelope: { sourceTarget: "v1:discord:account-1:channel-1" },
    deliveryEnvelopeDigest: "b".repeat(64),
  };
}

describe("KM contract parsing", () => {
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
        senderId: "sender-1",
        occurredAt: "2026-08-04T12:50:19.483Z",
        receivedAt: "2026-08-04T12:50:21.838Z",
        content: "message",
      }),
    ).rejects.toMatchObject({ stage: "response-schema", status: 200, code: "UNKNOWN" });
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
      response.end(
        JSON.stringify({
          protocolVersion: 1,
          status: "ok",
          controls: { "source-intake": true, claims: true, review: true, sender: false },
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

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
      expect(transportHeaders.has("accept-language")).toBe(false);
      expect(rawHeaderNames).toEqual(
        expect.arrayContaining(["Accept", "Authorization", "X-Deliberation-Protocol-Version"]),
      );
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
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
      protocolVersion: 1,
      status: "ok",
      controls: { "source-intake": true, claims: true, review: true, sender: false },
      unexpected: true,
    });

    await expect(client.health()).rejects.toThrow("invalid health response");
  });

  it("uses a credential already materialized by the secrets runtime", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          protocolVersion: 1,
          status: "ok",
          controls: { "source-intake": true, claims: true, review: true, sender: false },
        }),
        { status: 200 },
      ),
    );
    const client = createKmClient({
      config: { ...config, km: { ...config.km, credential: "runtime-secret" } },
      openclawConfig: {} as never,
      fetchImpl,
      env: {},
    });

    await expect(client.health()).resolves.toEqual({
      protocolVersion: 1,
      status: "ok",
      controls: { "source-intake": true, claims: true, review: true, sender: false },
    });
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer runtime-secret",
    });
  });

  it("uses only the seven canonical endpoint paths", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const path = new URL(String(input)).pathname;
      const body =
        path === "/deliberation/v1/health"
          ? {
              protocolVersion: 1,
              status: "ok",
              controls: { "source-intake": true, claims: true, review: true, sender: false },
            }
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
                    reservation: validReservation(),
                  }
                : {
                    protocolVersion: 1,
                    record: {
                      recordId: "record-1",
                      state: "SENT",
                      version: 9,
                      delivery: { attempts: [] },
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
      reservation.reservation.deliveryEnvelope.sourceTarget,
      "provider-1",
    );
    await client.complete({
      recordId: "record-1",
      attemptId: "attempt-1",
      owner: "sender-1",
      leaseToken: "lease-1",
      outcome: "NOT_SENT",
      idempotencyKey: "complete-1",
      providerAttemptId: "provider-1",
    });
    await client.reconcile({
      recordId: "record-1",
      attemptId: "attempt-1",
      outcome: "NOT_SENT",
      idempotencyKey: "reconcile-1",
      proofReference: "proof-1",
    });

    expect(fetchImpl.mock.calls.map(([input]) => new URL(String(input)).pathname)).toEqual([
      "/deliberation/v1/health",
      "/deliberation/v1/ready",
      "/deliberation/v1/intake",
      "/deliberation/v1/reservations",
      "/deliberation/v1/invocations",
      "/deliberation/v1/completions",
      "/deliberation/v1/reconciliations",
    ]);
  });

  it("rejects ready pagination outside the canonical query contract", async () => {
    const client = createClient({ protocolVersion: 1, items: [], nextCursor: null });

    await expect(client.ready({ limit: 0 })).rejects.toThrow("invalid ready query");
    await expect(client.ready({ limit: 101 })).rejects.toThrow("invalid ready query");
    await expect(client.ready({ cursor: "not-base64url=" })).rejects.toThrow("invalid ready query");
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
      malformedRecord.complete({
        recordId: "record-1",
        attemptId: "attempt-1",
        owner: "sender-1",
        leaseToken: "lease-1",
        outcome: "NOT_SENT",
        idempotencyKey: "complete-1",
        providerAttemptId: "provider-1",
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
      malformedOptionalRecord.complete({
        recordId: "record-1",
        attemptId: "attempt-1",
        owner: "sender-1",
        leaseToken: "lease-1",
        outcome: "NOT_SENT",
        idempotencyKey: "complete-1",
        providerAttemptId: "provider-1",
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
              ordinal: 1,
              attemptId: "attempt-1",
              candidateRevision: "wrong",
              completionOutcome: "SENT",
              outcome: "SENT",
              providerAttemptId: "provider-1",
              providerReceiptId: "receipt-1",
              providerMessageId: "message-1",
              proofReference: null,
              completedAt: "2026-08-01T12:01:00Z",
            },
          ],
        },
      },
    });
    await expect(
      malformedAttempt.reconcile({
        recordId: "record-1",
        attemptId: "attempt-1",
        outcome: "SENT",
        idempotencyKey: "reconcile-1",
        proofReference: "proof-1",
        providerReceiptId: "receipt-1",
        providerMessageId: "message-1",
      }),
    ).rejects.toThrow("invalid candidateRevision");
  });

  it("rejects a malformed ready delivery envelope at its field boundary", async () => {
    const client = createClient({
      protocolVersion: 1,
      items: [{ ...validReadyItem(), deliveryEnvelope: null }],
      nextCursor: null,
    });

    await expect(client.ready()).rejects.toThrow("invalid deliveryEnvelope");
  });

  it.each([
    {
      name: "deliveryEnvelope",
      reservation: { ...validReservation(), deliveryEnvelope: null },
      expected: "invalid deliveryEnvelope",
    },
    {
      name: "deliveryEnvelopeDigest",
      reservation: { ...validReservation(), deliveryEnvelopeDigest: "short" },
      expected: "invalid deliveryEnvelopeDigest",
    },
    {
      name: "reviewedTextHash",
      reservation: { ...validReservation(), reviewedTextHash: "short" },
      expected: "invalid reviewedTextHash",
    },
  ])("rejects malformed reservation $name", async ({ reservation, expected }) => {
    const client = createClient({ protocolVersion: 1, reservation });

    await expect(client.reserve(validReadyItem(), "sender-1")).rejects.toThrow(expected);
  });
});
