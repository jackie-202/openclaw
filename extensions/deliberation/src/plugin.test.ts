import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { afterEach, describe, expect, it, vi } from "vitest";
import plugin from "../index.js";
import { deriveProviderIdempotencyKey } from "./final-adapter.js";
import { KmRequestError } from "./km-client.js";

const { createKmClientMock } = vi.hoisted(() => ({ createKmClientMock: vi.fn() }));

function createStateRuntime() {
  const values = new Map<string, unknown>();
  return {
    openKeyedStore: vi.fn(() => ({
      lookup: async (key: string) => values.get(key),
      registerIfAbsent: async (key: string, value: unknown) => {
        if (values.has(key)) {
          return false;
        }
        values.set(key, value);
        return true;
      },
    })),
  };
}

vi.mock("./km-client.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./km-client.js")>()),
  createKmClient: createKmClientMock,
}));

const pluginConfig = {
  enabled: true,
  failClosed: true,
  pipelines: [
    {
      id: "discord-source-1",
      source: { channel: "discord", accountId: "acct-1", target: "source-1" },
    },
  ],
  processingSource: { channel: "discord", accountId: "acct-1", target: "process-1" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
};

const reservation = {
  recordId: "record-1",
  attemptId: "attempt-1",
  owner: "owner",
  leaseToken: "lease",
  deliveryEnvelope: {
    pipelineId: "discord-source-1",
    sourceTarget: "v1:slack:workspace-a:C123",
    deliveryTarget: {
      provider: "discord" as const,
      account: "acct-2",
      channel: "channel-2",
      threadId: "thread-2",
    },
  },
  deliveryEnvelopeDigest: "a".repeat(64),
};

function sentAttempt(messageId: string) {
  return {
    outcome: "sent" as const,
    messageId,
    receipt: {
      primaryPlatformMessageId: messageId,
      platformMessageIds: [messageId],
      parts: [{ platformMessageId: messageId, kind: "text" as const, index: 0 }],
      sentAt: Date.now(),
    },
    idempotency: "unsupported" as const,
  };
}

function createKm(outcome: "reserved" | "disabled" | "conflict" = "reserved") {
  return {
    health: vi.fn(),
    ready: vi.fn().mockResolvedValue({
      items: [
        {
          recordId: "record-1",
          text: "reply",
          effectiveDeliveryTarget: reservation.deliveryEnvelope.deliveryTarget,
        },
      ],
    }),
    reserve: vi
      .fn()
      .mockResolvedValue(outcome === "reserved" ? { outcome, reservation } : { outcome }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
  };
}

function registerPlugin(
  km: ReturnType<typeof createKm>,
  sendTextAttempt = vi.fn(),
  slackSendTextAttempt = vi.fn(),
) {
  createKmClientMock.mockReturnValue(km);
  const services: OpenClawPluginService[] = [];
  const loadAdapter = vi.fn((provider: string) => ({
    sendTextAttempt: provider === "slack" ? slackSendTextAttempt : sendTextAttempt,
  }));
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  const api = createTestPluginApi({
    config: {
      channels: { slack: { accounts: { "workspace-delivery": {} } } },
    } as never,
    pluginConfig,
    logger,
    registerService: (service) => services.push(service),
    runtime: { channel: { outbound: { loadAdapter } }, state: createStateRuntime() } as never,
  });
  plugin.register(api);
  return {
    api,
    logger,
    services,
    loadAdapter,
    sendText: sendTextAttempt,
    slackSendText: slackSendTextAttempt,
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("deliberation plugin boundary", () => {
  it("registers fail-closed hooks, read-only KM health, and one final sender", () => {
    const km = createKm();
    createKmClientMock.mockReturnValue(km);
    const on = vi.fn();
    const registerService = vi.fn();
    const registerCli = vi.fn();
    const registerGatewayMethod = vi.fn();

    plugin.register(
      createTestPluginApi({
        pluginConfig,
        on,
        registerService,
        registerCli,
        registerGatewayMethod,
        runtime: {
          channel: { outbound: { loadAdapter: vi.fn().mockReturnValue({ sendText: vi.fn() }) } },
          state: createStateRuntime(),
        } as never,
      }),
    );

    expect(on.mock.calls.map((call) => call[0])).toEqual([
      "inbound_event_policy",
      "inbound_claim",
      "before_dispatch",
      "before_tool_call",
      "message_sending",
    ]);
    expect(on.mock.calls.map((call) => call[2])).toEqual([
      { priority: 1000 },
      { priority: 1000 },
      { priority: 1000 },
      { priority: 1000 },
      { priority: 1000 },
    ]);
    expect(registerService.mock.calls.map(([service]) => service.id)).toEqual([
      "deliberation-final-delivery",
    ]);
    expect(registerCli).toHaveBeenCalledTimes(1);
    expect(registerGatewayMethod.mock.calls.map(([name]) => name)).toEqual([
      "deliberation.status",
      "deliberation.health",
      "deliberation.history.read",
    ]);
    expect(registerGatewayMethod.mock.calls.map((call) => call[2])).toEqual([
      { scope: "operator.read" },
      { scope: "operator.read" },
      { scope: "operator.read" },
    ]);
  });

  it.each([
    {
      classification: "missing_scope",
      needed: "channels:history,groups:history,not a scope",
      provided: "chat:write,channels:read,xoxp-secret",
      expectedScopes: {
        neededScopes: ["channels:history", "groups:history"],
        providedScopes: ["chat:write", "channels:read"],
      },
    },
    { classification: "not_in_channel" },
    { classification: "channel_not_found" },
    {
      classification: "identity_mapping_unavailable",
      internalMessage: "Slack thread identity mapping is unavailable or conflicting",
    },
    {
      classification: "runtime_context_unavailable",
      internalMessage: "Slack account history runtime is unavailable",
    },
    {
      classification: "root_not_found",
      internalMessage: "Slack thread root is unavailable or conflicting",
    },
  ])("returns only safe Slack $classification history failure diagnostics", async (testCase) => {
    const registerGatewayMethod = vi.fn();
    const sourceTarget = "v1:slack:default:C0BJW0FALSC";
    const providerError = testCase.internalMessage
      ? new Error(testCase.internalMessage)
      : Object.assign(new Error("request failed with xoxp-secret and unrelated message content"), {
          code: "slack_webapi_platform_error",
          data: {
            error: testCase.classification,
            ...(testCase.needed ? { needed: testCase.needed } : {}),
            ...(testCase.provided ? { provided: testCase.provided } : {}),
          },
          headers: { authorization: "Bearer xoxp-secret" },
        });
    createKmClientMock.mockReturnValue(createKm());
    plugin.register(
      createTestPluginApi({
        pluginConfig: {
          ...pluginConfig,
          pipelines: [
            {
              id: "slack-default-configured-channel",
              source: { channel: "slack", accountId: "default", target: "C0BJW0FALSC" },
            },
          ],
        },
        registerGatewayMethod,
        runtime: {
          channel: {
            outbound: { loadAdapter: vi.fn() },
            runtimeContexts: {
              get: vi.fn().mockReturnValue({
                readMessage: vi.fn().mockRejectedValue(providerError),
                readThreadPage: vi.fn(),
              }),
            },
          },
          state: {
            openKeyedStore: vi.fn().mockReturnValue({
              lookup: vi.fn().mockResolvedValue({
                sourceTarget,
                providerEventId: "1787683185.523829",
                threadId: "1787683185.523829",
              }),
              registerIfAbsent: vi.fn(),
            }),
          },
        } as never,
      }),
    );
    const handler = registerGatewayMethod.mock.calls.find(
      ([method]) => method === "deliberation.history.read",
    )?.[1];
    const respond = vi.fn();

    await handler?.({
      params: { schemaVersion: 2, sourceTarget, after: "1787683185.523829" },
      respond,
    });

    expect(respond).toHaveBeenCalledWith(false, undefined, {
      code: "SOURCE_HISTORY_UNAVAILABLE",
      message: `source history read failed: ${testCase.classification}`,
      details: {
        provider: "slack",
        classification: testCase.classification,
        ...testCase.expectedScopes,
      },
    });
    expect(JSON.stringify(respond.mock.calls)).not.toMatch(
      /xoxp-secret|authorization|message content/,
    );
  });

  it("does not register final delivery while Deliberation is disabled", () => {
    const registerService = vi.fn();
    const on = vi.fn();
    createKmClientMock.mockReturnValue(createKm());

    plugin.register(
      createTestPluginApi({
        pluginConfig: { ...pluginConfig, enabled: false },
        registerService,
        on,
      }),
    );

    expect(registerService).not.toHaveBeenCalled();
    const beforeDispatch = on.mock.calls.find(([hook]) => hook === "before_dispatch")?.[1];
    expect(beforeDispatch).toEqual(expect.any(Function));
    expect(
      beforeDispatch?.(
        {},
        { channelId: "discord", accountId: "acct-1", conversationId: "source-1" },
      ),
    ).toEqual({ handled: true });
  });

  it("delivers one ready item through the exact Discord account and stops its timer", async () => {
    vi.useFakeTimers();
    const km = createKm();
    const sendText = vi.fn().mockResolvedValue(sentAttempt("message-1"));
    const { api, services, loadAdapter, slackSendText } = registerPlugin(km, sendText);

    expect(services).toHaveLength(1);
    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(loadAdapter).toHaveBeenCalledWith("discord");
    expect(sendText).toHaveBeenCalledTimes(1);
    expect(slackSendText).not.toHaveBeenCalled();
    expect(sendText).toHaveBeenCalledWith({
      cfg: api.config,
      accountId: "acct-2",
      to: "channel:channel-2",
      threadId: "thread-2",
      text: "reply",
      idempotencyKey: deriveProviderIdempotencyKey("attempt-1"),
    });
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "SENT",
        providerReceiptId: "message-1",
        providerMessageId: "message-1",
      }),
    );

    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ["Slack", "v1:slack:workspace-source:C111"],
    ["Discord", "v1:discord:source-account:source-channel"],
  ])(
    "delivers one %s-origin item through the exact Slack account and thread",
    async (_name, sourceTarget) => {
      vi.useFakeTimers();
      const target = {
        provider: "slack",
        account: "workspace-delivery",
        channel: "C222",
        threadId: "1712345678.123456",
      } as const;
      const slackReservation = {
        ...reservation,
        deliveryEnvelope: { sourceTarget, deliveryTarget: target },
      };
      const km = createKm();
      km.ready.mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
      } as never);
      km.reserve.mockResolvedValue({ outcome: "reserved", reservation: slackReservation } as never);
      const discordSendText = vi.fn();
      const slackSendText = vi.fn().mockResolvedValue(sentAttempt("1712345678.777777"));
      const { api, services, loadAdapter } = registerPlugin(km, discordSendText, slackSendText);

      await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
      await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

      expect(loadAdapter).toHaveBeenCalledTimes(1);
      expect(loadAdapter).toHaveBeenCalledWith("slack");
      expect(discordSendText).not.toHaveBeenCalled();
      expect(slackSendText).toHaveBeenCalledTimes(1);
      expect(slackSendText).toHaveBeenCalledWith({
        cfg: api.config,
        accountId: "workspace-delivery",
        to: "channel:C222",
        threadId: "1712345678.123456",
        text: "reply",
        idempotencyKey: deriveProviderIdempotencyKey("attempt-1"),
      });
      expect(km.completeDelivery).toHaveBeenCalledWith(
        expect.objectContaining({
          outcome: "SENT",
          providerReceiptId: "1712345678.777777",
          providerMessageId: "1712345678.777777",
        }),
      );
    },
  );

  it("delivers an explicit Slack root without manufacturing a thread", async () => {
    vi.useFakeTimers();
    const target = {
      provider: "slack",
      account: "workspace-delivery",
      channel: "C222",
    } as const;
    const km = createKm();
    km.ready.mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    } as never);
    km.reserve.mockResolvedValue({
      outcome: "reserved",
      reservation: {
        ...reservation,
        deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: target },
      },
    } as never);
    const slackSendText = vi.fn().mockResolvedValue(sentAttempt("1723640000.777777"));
    const { api, services } = registerPlugin(km, vi.fn(), slackSendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(slackSendText).toHaveBeenCalledTimes(1);
    expect(slackSendText.mock.calls[0]?.[0]).not.toHaveProperty("threadId");
    expect(km.completeDelivery).toHaveBeenCalledWith(expect.objectContaining({ outcome: "SENT" }));
  });

  it("delivers a Discord root target without forwarding a message id as threadId", async () => {
    vi.useFakeTimers();
    const target = {
      provider: "discord",
      account: "acct-2",
      channel: "channel-2",
    } as const;
    const km = createKm();
    km.ready.mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    } as never);
    km.reserve.mockResolvedValue({
      outcome: "reserved",
      reservation: {
        ...reservation,
        deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: target },
      },
    } as never);
    const sendText = vi.fn().mockResolvedValue(sentAttempt("message-1"));
    const { api, services } = registerPlugin(km, sendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(sendText).toHaveBeenCalledTimes(1);
    expect(sendText).toHaveBeenCalledWith({
      cfg: api.config,
      accountId: "acct-2",
      to: "channel:channel-2",
      text: "reply",
      idempotencyKey: deriveProviderIdempotencyKey("attempt-1"),
    });
    expect(sendText.mock.calls[0]?.[0]).not.toHaveProperty("threadId");
  });

  it("fails an oversized result without sending multiple Discord messages", async () => {
    vi.useFakeTimers();
    const km = createKm();
    km.ready.mockResolvedValue({
      items: [
        {
          recordId: "record-1",
          text: "x".repeat(2001),
          effectiveDeliveryTarget: reservation.deliveryEnvelope.deliveryTarget,
        },
      ],
    });
    km.completeDelivery.mockResolvedValue({ state: "FAILED" });
    const sendText = vi.fn().mockResolvedValue({
      outcome: "rejected",
      failureClass: "rejection",
      error: "Discord rendered text exceeds 2000 characters",
      idempotency: "native",
    });
    const { api, services } = registerPlugin(km, sendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(sendText).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
  });

  it("fails a Slack destination whose explicit account is not configured", async () => {
    vi.useFakeTimers();
    const target = {
      provider: "slack",
      account: "unknown-workspace",
      channel: "C222",
      threadId: "1712345678.123456",
    } as const;
    const km = createKm();
    km.ready.mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    } as never);
    km.reserve.mockResolvedValue({
      outcome: "reserved",
      reservation: {
        ...reservation,
        deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: target },
      },
    } as never);
    km.completeDelivery.mockResolvedValue({ state: "FAILED" });
    const slackSendText = vi.fn();
    const { api, services } = registerPlugin(km, vi.fn(), slackSendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(slackSendText).not.toHaveBeenCalled();
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
  });

  it("leaves Slack delivery unresolved when the provider returns no platform message id", async () => {
    vi.useFakeTimers();
    const target = {
      provider: "slack",
      account: "workspace-delivery",
      channel: "C222",
      threadId: "1712345678.123456",
    } as const;
    const km = createKm();
    km.ready.mockResolvedValue({
      items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
    } as never);
    km.reserve.mockResolvedValue({
      outcome: "reserved",
      reservation: {
        ...reservation,
        deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: target },
      },
    } as never);
    km.completeDelivery.mockResolvedValue({ state: "FAILED" });
    const slackSendText = vi.fn().mockResolvedValue({
      outcome: "unknown",
      failureClass: "transport",
      error: "request outcome unknown",
      idempotency: "unsupported",
    });
    const { api, services } = registerPlugin(km, vi.fn(), slackSendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(slackSendText).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it.each(["disabled", "conflict"] as const)(
    "does not call Discord when reservation is %s",
    async (outcome) => {
      vi.useFakeTimers();
      const km = createKm(outcome);
      const { api, services, sendText } = registerPlugin(km);

      await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
      await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

      expect(sendText).not.toHaveBeenCalled();
      expect(km.invoke).not.toHaveBeenCalled();
    },
  );

  it("does not call Discord for an empty queue", async () => {
    vi.useFakeTimers();
    const km = createKm();
    km.ready.mockResolvedValue({ items: [] });
    const { api, services, sendText } = registerPlugin(km);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(sendText).not.toHaveBeenCalled();
    expect(km.reserve).not.toHaveBeenCalled();
  });

  it("logs safe KM request metadata and retries after a ready failure", async () => {
    vi.useFakeTimers();
    const km = createKm();
    const failure = new KmRequestError(
      "ready",
      "/deliberation/v1/ready",
      "http",
      401,
      "AUTH_INVALID",
    );
    km.ready.mockRejectedValueOnce(failure).mockResolvedValue({ items: [] });
    const { api, logger, services, sendText } = registerPlugin(km);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await vi.advanceTimersByTimeAsync(5_000);
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(logger.warn).toHaveBeenCalledWith(
      "deliberation: final delivery tick failed: operation=ready path=/deliberation/v1/ready stage=http status=401 code=AUTH_INVALID",
    );
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain("reply");
    expect(km.ready).toHaveBeenCalledTimes(2);
    expect(km.reserve).not.toHaveBeenCalled();
    expect(sendText).not.toHaveBeenCalled();
  });

  it("leaves a thrown provider outcome unresolved", async () => {
    vi.useFakeTimers();
    const km = createKm();
    km.completeDelivery.mockResolvedValue({ state: "FAILED" });
    const sendText = vi.fn().mockRejectedValue(new Error("permission denied"));
    const { api, services } = registerPlugin(km, sendText);

    await expect(
      services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger }),
    ).resolves.toBeUndefined();
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "unknown Discord sentinel",
      result: sentAttempt("unknown"),
    },
    {
      name: "padded noncanonical ID",
      result: {
        ...sentAttempt("message-1"),
        messageId: " message-1 ",
        receipt: {
          ...sentAttempt("message-1").receipt,
          primaryPlatformMessageId: " message-1 ",
        },
      },
    },
    {
      name: "missing primary ID",
      result: {
        ...sentAttempt("message-1"),
        receipt: { ...sentAttempt("message-1").receipt, primaryPlatformMessageId: undefined },
      },
    },
    {
      name: "different receipt ID",
      result: {
        ...sentAttempt("message-1"),
        receipt: {
          ...sentAttempt("message-1").receipt,
          primaryPlatformMessageId: "message-2",
        },
      },
    },
    {
      name: "multiple receipt parts",
      result: {
        ...sentAttempt("message-1"),
        receipt: {
          ...sentAttempt("message-1").receipt,
          platformMessageIds: ["message-1", "message-2"],
          parts: [
            { platformMessageId: "message-1", kind: "text", index: 0 },
            { platformMessageId: "message-2", kind: "text", index: 1 },
          ],
        },
      },
    },
  ])("leaves $name receipt evidence unresolved", async ({ result }) => {
    vi.useFakeTimers();
    const km = createKm();
    const sendText = vi.fn().mockResolvedValue(result);
    const { api, services } = registerPlugin(km, sendText);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(sendText).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("serializes repeated ticks and waits for the active tick during stop", async () => {
    vi.useFakeTimers();
    let releaseReady: (value: { items: [] }) => void = () => {};
    const km = createKm();
    km.ready.mockResolvedValueOnce({ items: [] }).mockImplementation(
      () =>
        new Promise<{ items: [] }>((resolve) => {
          releaseReady = resolve;
        }),
    );
    const { api, services, sendText } = registerPlugin(km);

    await services[0]?.start({
      config: api.config,
      stateDir: "/tmp",
      logger: api.logger,
    });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(km.ready).toHaveBeenCalledTimes(2);

    const stopPromise = services[0]?.stop?.({
      config: api.config,
      stateDir: "/tmp",
      logger: api.logger,
    });
    let stopped = false;
    void stopPromise?.then(() => (stopped = true));
    await Promise.resolve();
    expect(stopped).toBe(false);

    releaseReady({ items: [] });
    await stopPromise;
    expect(sendText).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
