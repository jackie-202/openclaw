import type { IncomingMessage, ServerResponse } from "node:http";
import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { withServer } from "openclaw/plugin-sdk/test-env";
import { afterEach, describe, expect, it, vi } from "vitest";
import plugin from "../index.js";
import { deriveProviderAttemptId } from "./final-adapter.js";

const sourceTarget = "v1:slack:workspace-a:C123";
const rootId = "1723640000.000100";
const childId = "1723640000.000200";
const laterId = "1723640000.000300";
const target = {
  provider: "discord" as const,
  accountId: "delivery-account",
  channelId: "test-deliberation",
  threadId: "delivery-thread",
};
const wireTarget = {
  provider: target.provider,
  account: target.accountId,
  channel: target.channelId,
  threadId: target.threadId,
};

const deliveryEnvelope = {
  schemaVersion: 1,
  pipelineId: "slack-source",
  sourceTarget,
  deliveryTarget: wireTarget,
  recordId: "record-1",
  inboundId: "inbound-1",
  draftAttempt: 1,
  draftCorrelationId: "draft-correlation-1",
  reviewAttempt: 1,
  reviewCorrelationId: "review-correlation-1",
  candidateRevision: 1,
  reviewedTextHash: "a".repeat(64),
};

type RecordedRequest = { method: string; path: string; body?: Record<string, unknown> };

async function readBody(request: IncomingMessage): Promise<Record<string, unknown> | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? (JSON.parse(Buffer.concat(chunks).toString("utf8")) as never) : undefined;
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(value));
}

function createKmFake(recorded: RecordedRequest[]) {
  let readyCalls = 0;
  return async (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const body = await readBody(request);
    recorded.push({ method: request.method ?? "GET", path, ...(body ? { body } : {}) });

    if (path === "/deliberation/v1/intake") {
      sendJson(response, 201, {
        protocolVersion: 1,
        recordId: "record-1",
        inboundId: "inbound-1",
        duplicate: false,
      });
      return;
    }
    if (path === "/deliberation/v1/ready") {
      readyCalls += 1;
      sendJson(response, 200, {
        protocolVersion: 1,
        items:
          readyCalls === 1
            ? [
                {
                  recordId: "record-1",
                  pipelineId: deliveryEnvelope.pipelineId,
                  deliveryTarget: deliveryEnvelope.deliveryTarget,
                  version: 7,
                  text: "reviewed reply",
                  candidateRevision: 1,
                  updatedAt: "2026-08-17T12:00:00Z",
                  deliveryEnvelope,
                },
              ]
            : [],
        nextCursor: null,
      });
      return;
    }
    if (path === "/deliberation/v1/reservations") {
      sendJson(response, 201, {
        protocolVersion: 1,
        reservation: {
          recordId: "record-1",
          attemptId: "attempt-1",
          ordinal: 1,
          version: 8,
          owner: body?.owner,
          leaseToken: "lease-1",
          leaseExpiresAt: "2026-08-17T12:01:00Z",
          candidateRevision: 1,
          reviewedTextHash: "a".repeat(64),
          deliveryEnvelope,
          deliveryEnvelopeDigest: "b".repeat(64),
        },
      });
      return;
    }
    if (path === "/deliberation/v1/invocations") {
      sendJson(response, 200, {
        protocolVersion: 1,
        invocation: {
          recordId: "record-1",
          attemptId: "attempt-1",
          deliveryEnvelope,
          attemptedTarget: body?.attemptedTarget,
          invocationIdempotencyKey: body?.idempotencyKey,
          providerAttemptId: body?.providerAttemptId,
          invokedAt: "2026-08-17T12:00:20Z",
        },
      });
      return;
    }
    if (path === "/deliberation/v1/completions") {
      sendJson(response, 200, {
        protocolVersion: 1,
        record: {
          recordId: "record-1",
          pipelineId: deliveryEnvelope.pipelineId,
          deliveryTarget: deliveryEnvelope.deliveryTarget,
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
                owner: body?.owner,
                leaseExpiresAt: "2026-08-17T12:01:00Z",
                reservedAt: "2026-08-17T12:00:10Z",
                completionOutcome: "SENT",
                outcome: "SENT",
                providerAttemptId: body?.providerAttemptId,
                providerReceiptId: body?.providerReceiptId,
                providerMessageId: body?.providerMessageId,
                proofReference: null,
                completedAt: "2026-08-17T12:00:30Z",
                deliveryEnvelope,
                deliveryEnvelopeDigest: "b".repeat(64),
                reserveIdempotencyKey: "reserve:record-1:7",
                invocationIdempotencyKey: body?.invocationIdempotencyKey,
                completionIdempotencyKey: body?.idempotencyKey,
                invokedAt: "2026-08-17T12:00:20Z",
                attemptedTarget: body?.attemptedTarget,
                terminalReason: "delivery_sent",
              },
            ],
          },
        },
      });
      return;
    }
    sendJson(response, 404, { protocolVersion: 1, error: { code: "ROUTE_NOT_FOUND" } });
  };
}

function requestFor(recorded: RecordedRequest[], path: string): RecordedRequest {
  const matching = recorded.filter((request) => request.path === path);
  expect(matching, path).toHaveLength(1);
  return matching[0];
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Deliberation cross-provider orchestration", () => {
  it.each([
    { name: "Slack root", providerEventId: rootId, threadId: rootId, expectedHistoryIds: [] },
    {
      name: "Slack child reply",
      providerEventId: childId,
      threadId: rootId,
      expectedHistoryIds: [rootId],
    },
  ])(
    "delivers one $name through bounded thread history and KM to the exact Discord target",
    async ({ providerEventId, threadId, expectedHistoryIds }) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-08-17T12:00:00Z"));
      const recorded: RecordedRequest[] = [];
      const hooks = new Map<string, (...args: never[]) => unknown>();
      const gatewayMethods = new Map<string, (...args: never[]) => Promise<void>>();
      const services: OpenClawPluginService[] = [];
      const identities = new Map<string, unknown>();
      const discordSendText = vi.fn().mockResolvedValue({
        outcome: "sent",
        messageId: "discord-message-1",
        receipt: {
          primaryPlatformMessageId: "discord-message-1",
          platformMessageIds: ["discord-message-1"],
          parts: [{ platformMessageId: "discord-message-1", kind: "text", index: 0 }],
          sentAt: Date.now(),
        },
        idempotency: "native",
      });
      const slackSendText = vi.fn();
      const historyReads: Array<Record<string, unknown>> = [];
      const unrelatedThread = {
        id: "1723649999.000100",
        content: "unrelated root",
        senderId: "U9",
      };
      const selectedMessages = [
        { id: rootId, content: "root", senderId: "U1" },
        { id: childId, threadId: rootId, content: "admitted child", senderId: "U2" },
        { id: laterId, threadId: rootId, content: "later child", senderId: "U3" },
      ];
      const historyContext = {
        readMessage: vi.fn(async ({ channelId, messageId }) => {
          historyReads.push({ operation: "message", channelId, messageId });
          return messageId === rootId
            ? { ...selectedMessages[0], latestReplyId: laterId }
            : unrelatedThread;
        }),
        readThreadPage: vi.fn(async (params: Record<string, unknown>) => {
          historyReads.push({ operation: "thread", ...params });
          if (params.threadId !== rootId) {
            return { messages: [unrelatedThread] };
          }
          const latest = typeof params.latest === "string" ? params.latest : undefined;
          const oldest = typeof params.oldest === "string" ? params.oldest : undefined;
          return {
            messages: selectedMessages.filter((message) => {
              if (latest && message.id > latest) {
                return false;
              }
              if (oldest && message.id < oldest) {
                return false;
              }
              return true;
            }),
          };
        }),
      };

      const kmFake = createKmFake(recorded);
      await withServer(
        (request, response) => {
          void kmFake(request, response).catch((error: unknown) =>
            response.destroy(error instanceof Error ? error : new Error(String(error))),
          );
        },
        async (kmEndpoint) => {
          const api = createTestPluginApi({
            config: {},
            pluginConfig: {
              enabled: true,
              failClosed: true,
              pipelines: [
                {
                  id: "slack-source",
                  source: { channel: "slack", accountId: "workspace-a", target: "C123" },
                  target: {
                    channel: target.provider,
                    accountId: target.accountId,
                    target: target.channelId,
                    ...(target.threadId ? { threadId: target.threadId } : {}),
                  },
                },
              ],
              processingSource: {
                channel: "discord",
                accountId: "processing-account",
                target: "processing-channel",
              },
              km: { endpoint: kmEndpoint, credential: "test-token", requestTimeoutMs: 1_000 },
              restrictedSessionKeys: ["agent:reviewer"],
            },
            on: ((name: string, handler: (...args: never[]) => unknown) => {
              hooks.set(name, handler);
            }) as never,
            registerGatewayMethod: ((
              name: string,
              handler: (...args: never[]) => Promise<void>,
            ) => {
              gatewayMethods.set(name, handler);
            }) as never,
            registerService: (service) => services.push(service),
            runtime: {
              state: {
                openKeyedStore: () => ({
                  async registerIfAbsent(key: string, value: unknown) {
                    if (identities.has(key)) {
                      return false;
                    }
                    identities.set(key, value);
                    return true;
                  },
                  async lookup(key: string) {
                    return identities.get(key);
                  },
                }),
              },
              channel: {
                outbound: {
                  loadAdapter: vi.fn(async (provider: string) => ({
                    sendTextAttempt: provider === "discord" ? discordSendText : slackSendText,
                  })),
                },
                runtimeContexts: {
                  get: vi.fn(({ channelId, accountId, capability }) =>
                    channelId === "slack" &&
                    accountId === "workspace-a" &&
                    capability === "channel.history.v1"
                      ? historyContext
                      : undefined,
                  ),
                },
              },
            } as never,
          });
          plugin.register(api);

          const context = {
            channelId: "slack",
            accountId: "workspace-a",
            conversationId: "C123",
            messageId: providerEventId,
            senderId: "U2",
          };
          await expect(
            hooks.get("inbound_claim")?.(
              {
                provider: "slack",
                channel: "slack",
                eventType: "message",
                eventKind: "user_request",
                accountId: "workspace-a",
                conversationId: "C123",
                content: providerEventId === rootId ? "root" : "admitted child",
                isGroup: true,
                messageId: providerEventId,
                threadId,
                senderId: "U2",
                timestamp: Date.parse("2026-08-17T11:59:59.123Z"),
              } as never,
              context as never,
            ),
          ).resolves.toEqual({ handled: true });
          expect(hooks.get("before_dispatch")?.({} as never, context as never)).toEqual({
            handled: true,
          });
          expect(discordSendText).not.toHaveBeenCalled();
          expect(slackSendText).not.toHaveBeenCalled();

          const readHistory = async (params: Record<string, unknown>) => {
            let result: unknown;
            let error: unknown;
            await gatewayMethods.get("deliberation.history.read")?.({
              params,
              respond(ok: boolean, payload: unknown, failure: unknown) {
                if (ok) {
                  result = payload;
                } else {
                  error = failure;
                }
              },
            } as never);
            expect(error).toBeUndefined();
            return result as { messages: Array<{ providerEventId: string }>; complete?: boolean };
          };
          const boundedHistory = await readHistory({
            schemaVersion: 1,
            sourceTarget,
            before: providerEventId,
            limit: 20,
          });
          const freshness = await readHistory({
            schemaVersion: 2,
            sourceTarget,
            after: providerEventId,
          });
          expect(boundedHistory.messages.map((message) => message.providerEventId)).toEqual(
            expectedHistoryIds,
          );
          expect(freshness.messages.map((message) => message.providerEventId)).toEqual(
            providerEventId === rootId ? [childId, laterId] : [laterId],
          );
          expect(JSON.stringify({ boundedHistory, freshness })).not.toContain(unrelatedThread.id);
          expect(freshness.complete).toBe(true);
          expect(Buffer.byteLength(JSON.stringify(freshness.messages), "utf8")).toBeLessThanOrEqual(
            32 * 1024,
          );

          expect(services).toHaveLength(1);
          await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
          await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });
          await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
          await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });
        },
      );

      expect(requestFor(recorded, "/deliberation/v1/intake").body).toEqual({
        pipelineId: "slack-source",
        deliveryTarget: wireTarget,
        provider: "slack",
        providerEventId,
        sourceTarget,
        sourceThreadId: rootId,
        senderId: "U2",
        occurredAt: "2026-08-17T11:59:59.123000Z",
        receivedAt: "2026-08-17T12:00:00Z",
        content: providerEventId === rootId ? "root" : "admitted child",
        eventType: "message",
      });
      expect(requestFor(recorded, "/deliberation/v1/reservations").body).not.toHaveProperty(
        "deliveryTarget",
      );
      expect(requestFor(recorded, "/deliberation/v1/invocations").body).toMatchObject({
        deliveryEnvelope,
        attemptedTarget: wireTarget,
        providerAttemptId: deriveProviderAttemptId("attempt-1"),
      });
      expect(requestFor(recorded, "/deliberation/v1/completions").body).toMatchObject({
        deliveryEnvelope,
        attemptedTarget: wireTarget,
        outcome: "SENT",
        providerReceiptId: "discord-message-1",
        providerMessageId: "discord-message-1",
      });
      expect(recorded.filter((request) => request.path === "/deliberation/v1/ready")).toHaveLength(
        2,
      );
      expect(historyReads.every((read) => read.channelId === "C123")).toBe(true);
      expect(
        historyReads.every((read) => read.messageId === undefined || read.messageId === rootId),
      ).toBe(true);
      expect(
        historyReads.every((read) => read.threadId === undefined || read.threadId === rootId),
      ).toBe(true);
      expect(discordSendText).toHaveBeenCalledTimes(1);
      expect(discordSendText).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: "delivery-account",
          to: "channel:test-deliberation",
          threadId: "delivery-thread",
          text: "reviewed reply",
          idempotencyKey: deriveProviderAttemptId("attempt-1"),
        }),
      );
      expect(slackSendText).not.toHaveBeenCalled();
    },
  );
});
