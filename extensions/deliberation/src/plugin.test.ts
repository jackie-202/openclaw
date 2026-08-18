import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { afterEach, describe, expect, it, vi } from "vitest";
import plugin from "../index.js";

const { createKmClientMock } = vi.hoisted(() => ({ createKmClientMock: vi.fn() }));

vi.mock("./km-client.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./km-client.js")>()),
  createKmClient: createKmClientMock,
}));

const pluginConfig = {
  enabled: true,
  failClosed: true,
  sources: [{ channel: "discord", accountId: "acct-1", target: "source-1" }],
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
  sendText = vi.fn(),
  slackSendText = vi.fn(),
) {
  createKmClientMock.mockReturnValue(km);
  const services: OpenClawPluginService[] = [];
  const loadAdapter = vi.fn((provider: string) => ({
    sendText: provider === "slack" ? slackSendText : sendText,
    textChunkLimit: provider === "slack" ? 4000 : 2000,
    chunker:
      provider === "slack"
        ? null
        : (text: string, limit: number) =>
            text.length <= limit ? [text] : [text.slice(0, limit), text.slice(limit)],
  }));
  const api = createTestPluginApi({
    config: {
      channels: { slack: { accounts: { "workspace-delivery": {} } } },
    } as never,
    pluginConfig,
    registerService: (service) => services.push(service),
    runtime: { channel: { outbound: { loadAdapter } } } as never,
  });
  plugin.register(api);
  return { api, services, loadAdapter, sendText, slackSendText };
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
    const registerGatewayMethod = vi.fn();

    plugin.register(
      createTestPluginApi({
        pluginConfig,
        on,
        registerService,
        registerGatewayMethod,
        runtime: {
          channel: { outbound: { loadAdapter: vi.fn().mockReturnValue({ sendText: vi.fn() }) } },
        } as never,
      }),
    );

    expect(on.mock.calls.map((call) => call[0])).toEqual([
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
    ]);
    expect(registerService).toHaveBeenCalledTimes(1);
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

  it("does not register final delivery while Deliberation is disabled", () => {
    const registerService = vi.fn();
    createKmClientMock.mockReturnValue(createKm());

    plugin.register(
      createTestPluginApi({
        pluginConfig: { ...pluginConfig, enabled: false },
        registerService,
      }),
    );

    expect(registerService).not.toHaveBeenCalled();
  });

  it("delivers one ready item through the exact Discord account and stops its timer", async () => {
    vi.useFakeTimers();
    const km = createKm();
    const sendText = vi.fn().mockResolvedValue({ channel: "discord", messageId: "message-1" });
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
      formatting: {
        chunkMode: "length",
        maxLinesPerMessage: 1,
        tableMode: "off",
        textLimit: 2000,
      },
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
      const slackSendText = vi.fn().mockResolvedValue({
        channel: "slack",
        messageId: "1712345678.777777",
        receipt: { primaryPlatformMessageId: "receipt-1" },
      });
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
      });
      expect(km.completeDelivery).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptedTarget: target,
          outcome: "SENT",
          providerReceiptId: "receipt-1",
          providerMessageId: "1712345678.777777",
        }),
      );
    },
  );

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
    const { api, services, sendText } = registerPlugin(km);

    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(sendText).not.toHaveBeenCalled();
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
      channel: "slack",
      messageId: "unknown",
      receipt: { platformMessageIds: [] },
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

  it("contains provider failures and records FAILED", async () => {
    vi.useFakeTimers();
    const km = createKm();
    km.completeDelivery.mockResolvedValue({ state: "FAILED" });
    const sendText = vi.fn().mockRejectedValue(new Error("permission denied"));
    const { api, services } = registerPlugin(km, sendText);

    await expect(
      services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger }),
    ).resolves.toBeUndefined();
    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });

    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
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
