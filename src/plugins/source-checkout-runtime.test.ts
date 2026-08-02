/** Verifies source-checkout plugin runtime resolution and dependency diagnostics. */
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setBundledPluginsDirOverrideForTest } from "./bundled-dir.js";
import {
  getGlobalHookRunner,
  initializeGlobalHookRunner,
  resetGlobalHookRunner,
} from "./hook-runner-global.js";
import { loadOpenClawPlugins } from "./loader.js";

describe("source checkout bundled plugin runtime", () => {
  beforeEach(() => {
    setBundledPluginsDirOverrideForTest(path.join(process.cwd(), "extensions"));
  });

  afterEach(() => {
    setBundledPluginsDirOverrideForTest(undefined);
    resetGlobalHookRunner();
    vi.unstubAllGlobals();
  });

  it("loads enabled bundled plugins from source checkout", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["tokenjuice"],
      config: {
        plugins: {
          entries: {
            tokenjuice: { enabled: true },
          },
        },
      },
    });

    const tokenjuice = registry.plugins.find((plugin) => plugin.id === "tokenjuice");
    expect(tokenjuice?.status).toBe("loaded");
    expect(tokenjuice?.origin).toBe("bundled");

    const expectedRuntime = `${path.sep}extensions${path.sep}tokenjuice${path.sep}index.ts`;
    const expectedRoot = `${path.sep}extensions${path.sep}tokenjuice`;

    expect(tokenjuice?.source).toContain(expectedRuntime);
    expect(tokenjuice?.rootDir).toContain(expectedRoot);
  });

  it("loads Deliberation with exactly four hooks", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["deliberation"],
      config: {
        plugins: {
          entries: {
            deliberation: {
              enabled: true,
              config: {
                enabled: true,
                failClosed: true,
                sources: [{ channel: "discord", accountId: "acct-1", target: "source-1" }],
                processingSource: {
                  channel: "discord",
                  accountId: "acct-1",
                  target: "processing-1",
                },
                km: {
                  endpoint: "https://km.invalid",
                  credential: "test-credential",
                  requestTimeoutMs: 1000,
                },
                restrictedSessionKeys: ["agent:reviewer"],
              },
            },
          },
        },
      },
    });

    const deliberation = registry.plugins.find((plugin) => plugin.id === "deliberation");
    expect(deliberation?.status, deliberation?.error).toBe("loaded");
    expect(
      registry.typedHooks
        .filter((hook) => hook.pluginId === "deliberation")
        .map((hook) => hook.hookName),
    ).toEqual(["inbound_claim", "before_dispatch", "before_tool_call", "message_sending"]);
    expect(registry.services.filter((service) => service.pluginId === "deliberation")).toHaveLength(
      0,
    );
  });

  it("routes a realistic Discord source event through loader-backed Deliberation hooks", async () => {
    const sourceId = "1494265174389948538";
    const fetchMock = vi.fn<
      (input: string | URL | Request, init?: RequestInit) => Promise<Response>
    >(
      async () =>
        new Response(
          JSON.stringify({
            protocolVersion: 1,
            recordId: "record-1",
            inboundId: "inbound-1",
            duplicate: false,
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["deliberation"],
      config: {
        plugins: {
          entries: {
            deliberation: {
              enabled: true,
              config: {
                enabled: true,
                failClosed: true,
                sources: [{ channel: "discord", accountId: "default", target: sourceId }],
                processingSource: {
                  channel: "discord",
                  accountId: "default",
                  target: "processing",
                },
                km: {
                  endpoint: "https://km.invalid",
                  credential: "test-credential",
                  requestTimeoutMs: 1000,
                },
                restrictedSessionKeys: ["agent:reviewer"],
              },
            },
          },
        },
      },
    });
    initializeGlobalHookRunner(registry);
    const runner = getGlobalHookRunner();
    const event = {
      channel: "discord",
      accountId: "default",
      conversationId: sourceId,
      content: "Tak schvalne",
      isGroup: true,
      messageId: "1533451497218506752",
      senderId: "sender-1",
      timestamp: Date.parse("2026-08-02T12:28:47.088Z"),
    };
    const context = {
      channelId: "discord",
      accountId: "default",
      conversationId: sourceId,
      messageId: event.messageId,
      senderId: event.senderId,
    };

    expect(runner?.hasHooks("inbound_claim")).toBe(true);
    expect(runner?.hasHooks("before_dispatch")).toBe(true);
    await expect(runner?.runInboundClaim(event, context)).resolves.toEqual({ handled: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl).toBe("https://km.invalid/deliberation/v1/intake");
    expect(requestInit?.headers).toMatchObject({
      Authorization: "Bearer test-credential",
      "X-Deliberation-Protocol-Version": "1",
    });
    if (typeof requestInit?.body !== "string") {
      throw new Error("Deliberation intake request body was not JSON text");
    }
    expect(JSON.parse(requestInit.body)).toMatchObject({
      provider: "discord",
      providerEventId: "1533451497218506752",
      sourceTarget: `default:${sourceId}`,
      senderId: "sender-1",
      occurredAt: "2026-08-02T12:28:47.088Z",
      content: "Tak schvalne",
      eventType: "message",
    });

    await expect(
      runner?.runInboundClaim(
        { ...event, conversationId: "unrelated", messageId: "unrelated-message" },
        { ...context, conversationId: "unrelated", messageId: "unrelated-message" },
      ),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockRejectedValueOnce(new Error("listener unavailable"));
    await expect(
      runner?.runInboundClaim(
        { ...event, messageId: "1533451497218506753" },
        { ...context, messageId: "1533451497218506753" },
      ),
    ).resolves.toBeUndefined();
    await expect(runner?.runBeforeDispatch(event, context)).resolves.toEqual({ handled: true });
  });
});
