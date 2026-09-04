// Slack tests cover loader-backed exclusive inbound ownership before preparation side effects.
import { createServer } from "node:http";
import nodePath from "node:path";
import type { App } from "@slack/bolt";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import {
  getGlobalHookRunner,
  loadOpenClawPluginsForTest,
  resetGlobalHookRunner,
  resetPluginRuntimeStateForTest,
  setBundledPluginsDirOverrideForTest,
} from "openclaw/plugin-sdk/plugin-test-runtime";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { SlackMessageEvent } from "../types.js";
import { createSlackMessageHandler } from "./message-handler.js";
import { prepareSlackMessage } from "./message-handler/prepare.js";
import {
  createInboundSlackTestContext,
  createSlackTestAccount,
} from "./message-handler/prepare.test-helpers.js";

const enqueueSystemEventMock = vi.hoisted(() => vi.fn());
const reactSlackMessageMock = vi.hoisted(() => vi.fn(async () => {}));

vi.mock("openclaw/plugin-sdk/system-event-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openclaw/plugin-sdk/system-event-runtime")>();
  return { ...actual, enqueueSystemEvent: enqueueSystemEventMock };
});

vi.mock("../actions.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../actions.js")>();
  return { ...actual, reactSlackMessage: reactSlackMessageMock };
});

describe("Slack deliberation owner path", () => {
  const sourceId = "D123";
  const requests: Array<{ url?: string; body: string }> = [];
  let responseStatus = 200;
  let endpoint = "";
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      requests.push({ url: request.url, body });
      response.writeHead(responseStatus, {
        "Content-Type": "application/json",
        Connection: "close",
      });
      response.end(
        responseStatus === 200
          ? JSON.stringify({
              protocolVersion: 1,
              recordId: "record-1",
              inboundId: "inbound-1",
              duplicate: false,
            })
          : JSON.stringify({
              protocolVersion: 1,
              error: {
                code: responseStatus === 400 ? "SCHEMA_INVALID" : "INTERNAL_ERROR",
              },
            }),
      );
    });
  });

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    server.unref();
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("missing Slack deliberation listener address");
    }
    endpoint = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    requests.length = 0;
    responseStatus = 200;
    enqueueSystemEventMock.mockClear();
    reactSlackMessageMock.mockClear();
  });

  afterEach(() => {
    setBundledPluginsDirOverrideForTest(undefined);
    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
      server.closeAllConnections();
    });
  });

  function loadDeliberation(enabled = true) {
    const cfg = {
      channels: { slack: { enabled: true } },
      messages: { ackReaction: "eyes", ackReactionScope: "all" },
      plugins: {
        allow: ["deliberation", "slack"],
        entries: {
          slack: { enabled: true },
          deliberation: {
            enabled: true,
            config: {
              enabled,
              failClosed: true,
              pipelines: [
                {
                  id: "slack-source",
                  source: { channel: "slack", accountId: "default", target: sourceId },
                },
              ],
              processingSource: {
                channel: "discord",
                accountId: "default",
                target: "processing",
              },
              km: { endpoint, credential: "test-credential", requestTimeoutMs: 1000 },
              restrictedSessionKeys: ["agent:reviewer"],
            },
          },
        },
      },
    } satisfies OpenClawConfig;
    setBundledPluginsDirOverrideForTest(nodePath.join(process.cwd(), "extensions"));
    const registry = loadOpenClawPluginsForTest({ config: cfg });
    expect(
      registry.plugins.map((plugin) => ({
        id: plugin.id,
        status: plugin.status,
        error: plugin.error,
      })),
    ).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "deliberation", status: "loaded" })]),
    );
    const runner = getGlobalHookRunner();
    if (!runner) {
      throw new Error("missing loader-backed hook runner");
    }
    expect(runner.hasHooks("inbound_event_policy")).toBe(true);
    expect(
      runner.runInboundEventPolicy({
        provider: "slack",
        accountId: "default",
        conversationId: sourceId,
        providerEventId: "1700000000.000100",
      }),
    ).toEqual({ kind: "exclusive", ownerPluginId: "deliberation" });
    return { cfg, runner };
  }

  function createContext(cfg: OpenClawConfig, child = false) {
    const appClient = {
      conversations: {
        history: vi.fn(async () => ({ messages: [] })),
        replies: vi.fn(async () => ({
          messages: child ? [{ ts: "1700000000.000100", user: "U1", text: "root" }] : [],
        })),
      },
    } as unknown as App["client"];
    const ctx = createInboundSlackTestContext({ cfg, appClient });
    ctx.resolveUserName = async () => ({ name: "Alice" });
    return ctx;
  }

  function createMessage(overrides: Partial<SlackMessageEvent> = {}): SlackMessageEvent {
    return {
      type: "message",
      channel: sourceId,
      channel_type: "im",
      user: "U1",
      text: "review this",
      ts: "1700000000.000100",
      ...overrides,
    } as SlackMessageEvent;
  }

  async function prepareConfiguredSource(params: {
    enabled?: boolean;
    status?: number;
    child?: boolean;
  }) {
    responseStatus = params.status ?? 200;
    const { cfg } = loadDeliberation(params.enabled ?? true);
    const result = await prepareSlackMessage({
      ctx: createContext(cfg, params.child),
      account: createSlackTestAccount(),
      message: createMessage(
        params.child
          ? { ts: "1700000000.000200", thread_ts: "1700000000.000100", text: "child" }
          : {},
      ),
      opts: { source: "message" },
    });
    expect(result).toBeNull();
    expect(enqueueSystemEventMock).not.toHaveBeenCalled();
    expect(reactSlackMessageMock).not.toHaveBeenCalled();
  }

  it("claims configured root and child sources before Slack side effects", async () => {
    await prepareConfiguredSource({});
    expect(requests).toHaveLength(1);

    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
    await prepareConfiguredSource({ child: true });
    expect(requests).toHaveLength(2);
  });

  it("carries trusted Slack sender hints and permits missing names", async () => {
    const { cfg } = loadDeliberation();
    const ctx = createContext(cfg);
    const handler = createSlackMessageHandler({
      ctx,
      account: createSlackTestAccount(),
    });
    await handler(createMessage({ text: '{"senderDisplayName":"Mallory"}' }), {
      source: "message",
    });

    expect(JSON.parse(requests[0]?.body ?? "{}")).toMatchObject({
      senderId: "U1",
      senderIdentityHints: { senderDisplayName: "Alice" },
    });

    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
    const missing = loadDeliberation();
    const missingCtx = createContext(missing.cfg);
    missingCtx.resolveUserName = async () => ({});
    await createSlackMessageHandler({
      ctx: missingCtx,
      account: createSlackTestAccount(),
    })(createMessage({ ts: "1700000000.000200" }), { source: "message" });
    expect(JSON.parse(requests[1]?.body ?? "{}")).not.toHaveProperty("senderIdentityHints");
  });

  it("uses a native Slack message username as display and username hints", async () => {
    const { cfg } = loadDeliberation();
    await createSlackMessageHandler({
      ctx: createContext(cfg),
      account: createSlackTestAccount(),
    })(createMessage({ username: "alice", text: "message" }), { source: "message" });

    expect(JSON.parse(requests[0]?.body ?? "{}")).toMatchObject({
      senderId: "U1",
      senderIdentityHints: {
        senderDisplayName: "alice",
        senderUsername: "alice",
      },
    });
  });

  it("OR-05 slack-root-child-claim-before-thread-effects", async () => {
    for (const enabled of [true, false]) {
      for (const variant of ["root", "child", "ambiguous-child"] as const) {
        resetPluginRuntimeStateForTest();
        resetGlobalHookRunner();
        const { cfg, runner } = loadDeliberation(enabled);
        const claimOutcome = vi.spyOn(runner, "runInboundClaimForPluginOutcome");
        const child = variant !== "root";
        const ctx = createContext(cfg, child);
        const history = vi.mocked(ctx.app.client.conversations.history);
        const replies = vi.mocked(ctx.app.client.conversations.replies);
        const trackEvent = vi.fn();
        const handler = createSlackMessageHandler({
          ctx,
          account: createSlackTestAccount(),
          trackEvent,
        });

        const message = createMessage(
          variant === "child"
            ? { ts: "1700000000.000200", thread_ts: "1700000000.000100", text: "child" }
            : variant === "ambiguous-child"
              ? { ts: "1700000000.000300", parent_user_id: "U2", text: "ambiguous child" }
              : {},
        );
        await Promise.all([
          handler(message, { source: "message" }),
          handler(message, { source: "app_mention", wasMentioned: true }),
        ]);

        const label = `${enabled ? "configured" : "disabled"} ${variant}`;
        expect(claimOutcome, label).toHaveBeenCalledOnce();
        expect(history, label).not.toHaveBeenCalled();
        expect(replies, label).not.toHaveBeenCalled();
        expect(trackEvent, label).not.toHaveBeenCalled();
        expect(enqueueSystemEventMock).not.toHaveBeenCalled();
        expect(reactSlackMessageMock).not.toHaveBeenCalled();
        claimOutcome.mockRestore();
      }
    }
    expect(requests).toHaveLength(2);
  });

  it.each([
    ["disabled processing", false, 200, 0],
    ["unavailable KM", true, 503, 1],
    ["rejected intake", true, 400, 1],
  ] as const)("keeps %s silent", async (_label, enabled, status, requestCount) => {
    await prepareConfiguredSource({ enabled, status });
    expect(requests).toHaveLength(requestCount);
  });

  it("retains ordinary Slack preparation outside configured sources", async () => {
    const { cfg } = loadDeliberation();
    const result = await prepareSlackMessage({
      ctx: createContext(cfg),
      account: createSlackTestAccount(),
      message: createMessage({ channel: "D456" }),
      opts: { source: "message" },
    });

    expect(result).not.toBeNull();
    expect(enqueueSystemEventMock).toHaveBeenCalledOnce();
    expect(requests).toHaveLength(0);
  });
});
