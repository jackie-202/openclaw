import { discordPlugin } from "@openclaw/discord/api.js";
import { slackPlugin } from "@openclaw/slack/api.js";
import type { ChannelOutboundAdapter } from "openclaw/plugin-sdk/channel-send-result";
import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { afterEach, describe, expect, it, vi } from "vitest";
import plugin from "../index.js";
import { deriveProviderAttemptId } from "./final-adapter.js";

const mocks = vi.hoisted(() => ({
  createKmClient: vi.fn(),
  slackPostMessage: vi.fn(),
}));

vi.mock("./km-client.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./km-client.js")>()),
  createKmClient: mocks.createKmClient,
}));

vi.mock("@slack/web-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@slack/web-api")>();
  return {
    ...actual,
    WebClient: class {
      readonly chat = { postMessage: mocks.slackPostMessage };
    },
  };
});

const pluginConfig = {
  enabled: true,
  failClosed: true,
  pipelines: [
    {
      id: "discord-source",
      source: { channel: "discord", accountId: "source-account", target: "source-channel" },
    },
  ],
  processingSource: { channel: "discord", accountId: "source-account", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1_000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
};

function createKm(provider: "discord" | "slack", text = "reviewed reply") {
  const target =
    provider === "discord"
      ? { provider, account: "delivery", channel: "123" }
      : { provider, account: "delivery", channel: "C123" };
  const reservation = {
    recordId: "record-1",
    attemptId: "attempt-1",
    owner: "openclaw-deliberation",
    leaseToken: "lease-1",
    deliveryEnvelope: {
      pipelineId: "discord-source",
      sourceTarget: "v1:discord:source-account:source-channel",
      deliveryTarget: target,
    },
    deliveryEnvelopeDigest: "a".repeat(64),
  };
  return {
    health: vi.fn(),
    ready: vi.fn().mockResolvedValue({
      items: [{ recordId: "record-1", text, effectiveDeliveryTarget: target }],
    }),
    reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
    invoke: vi.fn().mockResolvedValue({}),
    completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
  };
}

async function runService(provider: "discord" | "slack", text = "reviewed reply") {
  vi.useFakeTimers();
  const km = createKm(provider, text);
  mocks.createKmClient.mockReturnValue(km);
  const services: OpenClawPluginService[] = [];
  const adapters = {
    discord: discordPlugin.outbound,
    slack: slackPlugin.outbound,
  } satisfies Record<string, ChannelOutboundAdapter | undefined>;
  const historyIdentities = new Map<string, unknown>();
  const api = createTestPluginApi({
    config: {
      channels: {
        discord: { accounts: { delivery: { token: "discord-token" } } },
        slack: { accounts: { delivery: { botToken: "xoxb-test" } } },
      },
    } as never,
    pluginConfig,
    registerService: (service) => services.push(service),
    runtime: {
      channel: {
        outbound: {
          loadAdapter: async (channel: string) => adapters[channel as keyof typeof adapters],
        },
      },
      state: {
        openKeyedStore: () => ({
          lookup: async (key: string) => historyIdentities.get(key),
          registerIfAbsent: async (key: string, value: unknown) => {
            if (historyIdentities.has(key)) {
              return false;
            }
            historyIdentities.set(key, value);
            return true;
          },
        }),
      },
    } as never,
  });
  plugin.register(api);
  await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
  await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });
  return km;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Deliberation native adapter composition", () => {
  it.each([
    ["discord", discordPlugin.outbound],
    ["slack", slackPlugin.outbound],
  ])("requires the real %s adapter single-attempt capability", (_provider, outbound) => {
    expect(outbound?.sendTextAttempt).toEqual(expect.any(Function));
  });

  it("carries the durable key into one Discord native request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "discord-message-1", channel_id: "123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const km = await runService("discord");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      nonce: deriveProviderAttemptId("attempt-1"),
      enforce_nonce: true,
      content: "reviewed reply",
    });
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "SENT",
        providerReceiptId: "discord-message-1",
        providerMessageId: "discord-message-1",
      }),
    );
  });

  it("does not retry an ambiguous Discord native request", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    const km = await runService("discord");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("leaves malformed Discord native success evidence unresolved", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ channel_id: "123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const km = await runService("discord");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("rejects over-limit Discord text before a native request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const km = await runService("discord", "x".repeat(2_001));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
  });

  it("uses one Slack native post and records unsupported idempotency honestly", async () => {
    mocks.slackPostMessage.mockResolvedValue({
      ok: true,
      ts: "1712345678.123456",
      channel: "C123",
    });

    const km = await runService("slack");

    expect(mocks.slackPostMessage).toHaveBeenCalledTimes(1);
    expect(mocks.slackPostMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "C123", text: "reviewed reply" }),
    );
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "SENT",
        providerReceiptId: "1712345678.123456",
      }),
    );
  });

  it("does not retry an accepted-then-error Slack native request", async () => {
    mocks.slackPostMessage.mockRejectedValue(
      Object.assign(new Error("socket closed after dispatch"), {
        code: "slack_webapi_request_error",
        original: { code: "ECONNRESET" },
      }),
    );

    const km = await runService("slack");

    expect(mocks.slackPostMessage).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("rejects Slack text that renders into multiple messages before posting", async () => {
    const km = await runService("slack", "x".repeat(8_001));

    expect(mocks.slackPostMessage).not.toHaveBeenCalled();
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
  });
});
