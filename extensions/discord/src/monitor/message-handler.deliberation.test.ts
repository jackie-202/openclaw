// Discord tests cover loader-backed exclusive ownership before ordinary channel effects.
import { createServer } from "node:http";
import nodePath from "node:path";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import {
  getGlobalHookRunner,
  loadOpenClawPluginsForTest,
  resetGlobalHookRunner,
  resetPluginRuntimeStateForTest,
  setBundledPluginsDirOverrideForTest,
} from "openclaw/plugin-sdk/plugin-test-runtime";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MessageType } from "../internal/discord.js";
import { preflightDiscordMessage } from "./message-handler.preflight.js";
import {
  createDiscordMessage,
  createDiscordPreflightArgs,
  createGuildEvent,
  createGuildTextClient,
  type DiscordConfig,
} from "./message-handler.preflight.test-helpers.js";
import { processDiscordMessage } from "./message-handler.process.js";
import { createBaseDiscordMessageContext } from "./message-handler.test-harness.js";

const sideEffects = vi.hoisted(() => ({
  channelActivity: vi.fn(),
  dispatch: vi.fn(),
  deliver: vi.fn(),
  enqueue: vi.fn(),
  react: vi.fn(async () => {}),
  recordSession: vi.fn(async () => {}),
  removeReaction: vi.fn(async () => {}),
  typing: vi.fn(async () => {}),
}));

vi.mock("openclaw/plugin-sdk/channel-activity-runtime", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("openclaw/plugin-sdk/channel-activity-runtime")>();
  return { ...actual, recordChannelActivity: sideEffects.channelActivity };
});

vi.mock("openclaw/plugin-sdk/system-event-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openclaw/plugin-sdk/system-event-runtime")>();
  return { ...actual, enqueueSystemEvent: sideEffects.enqueue };
});

vi.mock("openclaw/plugin-sdk/conversation-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("openclaw/plugin-sdk/conversation-runtime")>();
  return { ...actual, recordInboundSession: sideEffects.recordSession };
});

vi.mock("openclaw/plugin-sdk/reply-dispatch-runtime", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("openclaw/plugin-sdk/reply-dispatch-runtime")>();
  return { ...actual, dispatchReplyWithBufferedBlockDispatcher: sideEffects.dispatch };
});

vi.mock("../send.js", () => ({
  reactMessageDiscord: sideEffects.react,
  removeReactionDiscord: sideEffects.removeReaction,
}));

vi.mock("./typing.js", () => ({ sendTyping: sideEffects.typing }));
vi.mock("./reply-delivery.js", () => ({ deliverDiscordReply: sideEffects.deliver }));

describe("Discord deliberation owner path", () => {
  const sourceId = "1494265174389948538";
  const guildId = "guild-deliberation";
  const requests: Array<{ body: string }> = [];
  let endpoint = "";
  let responseStatus = 200;
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      requests.push({ body });
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
              error: { code: responseStatus === 400 ? "SCHEMA_INVALID" : "INTERNAL_ERROR" },
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
      throw new Error("missing Discord deliberation listener address");
    }
    endpoint = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    setBundledPluginsDirOverrideForTest(undefined);
    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
    requests.length = 0;
    responseStatus = 200;
    for (const effect of Object.values(sideEffects)) {
      effect.mockClear();
    }
  });

  afterEach(() => {
    responseStatus = 200;
    setBundledPluginsDirOverrideForTest(undefined);
    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
  });

  afterAll(async () => {
    setBundledPluginsDirOverrideForTest(undefined);
    resetPluginRuntimeStateForTest();
    resetGlobalHookRunner();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  });

  function loadDeliberation(enabled = true) {
    const cfg = {
      channels: { discord: { enabled: true } },
      messages: {
        ackReaction: "eyes",
        ackReactionScope: "all",
        groupChat: { unmentionedInbound: "room_event" },
      },
      plugins: {
        allow: ["deliberation", "discord"],
        entries: {
          discord: { enabled: true },
          deliberation: {
            enabled: true,
            config: {
              enabled,
              failClosed: true,
              pipelines: [
                {
                  id: "discord-source",
                  source: { channel: "discord", accountId: "default", target: sourceId },
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
    const runner = getGlobalHookRunner();
    if (!runner) {
      throw new Error("missing loader-backed hook runner");
    }
    const policy = runner.runInboundEventPolicy({
      provider: "discord",
      accountId: "default",
      conversationId: sourceId,
      providerEventId: "policy-probe",
    });
    expect(policy).toEqual({ kind: "exclusive", ownerPluginId: "deliberation" });
    return { cfg, registry, runner, policy };
  }

  async function createProcessContext(
    cfg: OpenClawConfig,
    overrides: Record<string, unknown> = {},
  ) {
    return await createBaseDiscordMessageContext({
      cfg,
      messageChannelId: sourceId,
      message: {
        id: "discord-source-message",
        channelId: sourceId,
        content: "review this",
        timestamp: "2026-08-23T12:00:00.000Z",
        attachments: [],
      },
      baseText: "review this",
      messageText: "review this",
      shouldRequireMention: false,
      effectiveWasMentioned: false,
      route: {
        agentId: "main",
        channel: "discord",
        accountId: "default",
        sessionKey: `agent:main:discord:channel:${sourceId}`,
        mainSessionKey: "agent:main:main",
      },
      ...overrides,
    });
  }

  function expectNoOrdinaryEffects(restPost?: ReturnType<typeof vi.fn>) {
    expect(sideEffects.enqueue).not.toHaveBeenCalled();
    expect(sideEffects.channelActivity).not.toHaveBeenCalled();
    expect(sideEffects.react).not.toHaveBeenCalled();
    expect(sideEffects.removeReaction).not.toHaveBeenCalled();
    expect(sideEffects.typing).not.toHaveBeenCalled();
    expect(sideEffects.recordSession).not.toHaveBeenCalled();
    expect(sideEffects.dispatch).not.toHaveBeenCalled();
    expect(sideEffects.deliver).not.toHaveBeenCalled();
    if (restPost) {
      expect(restPost).not.toHaveBeenCalled();
    }
  }

  function createGuildPreflightParams(
    cfg: OpenClawConfig,
    params: {
      id: string;
      content: string;
      type?: MessageType;
      channelId?: string;
      mentionedUsers?: Array<{ id: string }>;
    },
  ) {
    const channelId = params.channelId ?? sourceId;
    const message = createDiscordMessage({
      id: params.id,
      channelId,
      content: params.content,
      type: params.type,
      author: { id: "U1", bot: false, username: "Alice" },
      mentionedUsers: params.mentionedUsers,
    });
    return {
      ...createDiscordPreflightArgs({
        cfg,
        discordConfig: {} as DiscordConfig,
        data: createGuildEvent({ channelId, guildId, author: message.author, message }),
        client: createGuildTextClient(channelId),
      }),
      allowFrom: ["discord:U1"],
      guildEntries: {
        [guildId]: {
          channels: { [channelId]: { enabled: true, requireMention: false } },
        },
      },
    };
  }

  it("OR-02 disabled-source-terminal-without-side-effects", async () => {
    const { cfg, runner, policy } = loadDeliberation(false);
    const outcome = vi.spyOn(runner, "runInboundClaimForPluginOutcome");

    await processDiscordMessage(await createProcessContext(cfg, { inboundEventPolicy: policy }));

    expect(outcome).toHaveBeenCalledOnce();
    await expect(outcome.mock.results[0]?.value).resolves.toEqual({ status: "declined" });
    expect(requests).toHaveLength(0);
    expectNoOrdinaryEffects();
    outcome.mockRestore();
  });

  it("OR-01 exclusive-owner-before-ordinary-side-effects", async () => {
    const { cfg, runner } = loadDeliberation();
    const outcome = vi.spyOn(runner, "runInboundClaimForPluginOutcome");

    const preflight = await preflightDiscordMessage(
      createGuildPreflightParams(cfg, {
        id: "discord-source-message",
        content: "review this",
        mentionedUsers: [{ id: "openclaw-bot" }],
      }),
    );
    expect(preflight).not.toBeNull();
    if (!preflight) {
      throw new Error("configured Discord source did not reach process");
    }
    await processDiscordMessage(preflight);

    expect(outcome).toHaveBeenCalledOnce();
    expect(outcome).toHaveBeenCalledWith(
      "deliberation",
      expect.objectContaining({ conversationId: sourceId, messageId: "discord-source-message" }),
      expect.objectContaining({ conversationId: sourceId, channelId: "discord" }),
    );
    await expect(outcome.mock.results[0]?.value).resolves.toEqual({
      status: "handled",
      result: { handled: true },
    });
    expect(requests).toHaveLength(1);
    expectNoOrdinaryEffects();
    outcome.mockRestore();
  });

  it("OR-03 missing-error-ambiguous-owner-terminal", async () => {
    const loaded = loadDeliberation();
    const claimHookIndex = loaded.registry.typedHooks.findIndex(
      (hook) => hook.pluginId === "deliberation" && hook.hookName === "inbound_claim",
    );
    const claimHook = loaded.registry.typedHooks[claimHookIndex];
    if (!claimHook) {
      throw new Error("missing claim hook for terminal matrix");
    }
    const originalHandler = claimHook.handler;
    const outcome = vi.spyOn(loaded.runner, "runInboundClaimForPluginOutcome");
    for (const expected of ["missing_plugin", "no_handler", "error", "declined"] as const) {
      outcome.mockClear();
      if (expected === "no_handler") {
        loaded.registry.typedHooks.splice(claimHookIndex, 1);
      } else if (expected === "error") {
        claimHook.handler = vi.fn(async () => {
          throw new Error("owner failed");
        });
      } else if (expected === "declined") {
        responseStatus = 400;
      }
      const ownerPluginId = expected === "missing_plugin" ? "missing-owner" : "deliberation";
      await processDiscordMessage(
        await createProcessContext(loaded.cfg, {
          inboundEventPolicy: { kind: "exclusive", ownerPluginId },
        }),
      );
      await expect(outcome.mock.results[0]?.value).resolves.toEqual(
        expected === "error" ? { status: "error", error: "owner failed" } : { status: expected },
      );
      expectNoOrdinaryEffects();
      if (expected === "no_handler") {
        loaded.registry.typedHooks.splice(claimHookIndex, 0, claimHook);
      }
      claimHook.handler = originalHandler;
      responseStatus = 200;
    }

    const policyHook = loaded.registry.typedHooks.find(
      (hook) => hook.pluginId === "deliberation" && hook.hookName === "inbound_event_policy",
    );
    if (!policyHook) {
      throw new Error("missing policy hook for ambiguous row");
    }
    loaded.registry.typedHooks.push({ ...policyHook, pluginId: "competing-owner" });
    const ambiguousPolicy = loaded.runner.runInboundEventPolicy({
      provider: "discord",
      accountId: "default",
      conversationId: sourceId,
      providerEventId: "ambiguous-message",
    });
    expect(ambiguousPolicy).toEqual({ kind: "ambiguous" });
    outcome.mockClear();
    await processDiscordMessage(
      await createProcessContext(loaded.cfg, { inboundEventPolicy: ambiguousPolicy }),
    );
    expect(outcome).not.toHaveBeenCalled();
    expectNoOrdinaryEffects();
    loaded.registry.typedHooks.pop();
    outcome.mockRestore();
  });

  it("OR-04 discord-system-room-event-claimed-before-enqueue", async () => {
    const { cfg, runner } = loadDeliberation();
    const outcome = vi.spyOn(runner, "runInboundClaimForPluginOutcome");
    const system = await preflightDiscordMessage(
      createGuildPreflightParams(cfg, {
        id: "discord-system-event",
        content: "",
        type: MessageType.ChannelPinnedMessage,
      }),
    );
    if (system) {
      await processDiscordMessage(system);
    }
    const room = await preflightDiscordMessage(
      createGuildPreflightParams(cfg, { id: "discord-room-event", content: "room update" }),
    );
    if (room) {
      await processDiscordMessage(room);
    }
    const configuredEnqueues = sideEffects.enqueue.mock.calls.length;
    const configuredActivity = sideEffects.channelActivity.mock.calls.length;

    const ordinaryCfg = {
      session: { mainKey: "main", scope: "per-sender" },
    } satisfies OpenClawConfig;
    await preflightDiscordMessage(
      createGuildPreflightParams(ordinaryCfg, {
        id: "ordinary-system-event",
        content: "",
        type: MessageType.ChannelPinnedMessage,
        channelId: "ordinary-channel",
      }),
    );

    expect(outcome).toHaveBeenCalledTimes(2);
    expect(outcome.mock.calls.map(([, event]) => event)).toEqual([
      expect.objectContaining({ messageId: "discord-system-event", eventKind: "room_event" }),
      expect.objectContaining({ messageId: "discord-room-event", eventKind: "room_event" }),
    ]);
    expect(configuredEnqueues).toBe(0);
    expect(configuredActivity).toBe(0);
    expect(sideEffects.enqueue).toHaveBeenCalledOnce();
    expect(sideEffects.channelActivity).toHaveBeenCalledOnce();
    expect(sideEffects.react).not.toHaveBeenCalled();
    expect(sideEffects.removeReaction).not.toHaveBeenCalled();
    expect(sideEffects.typing).not.toHaveBeenCalled();
    expect(sideEffects.recordSession).not.toHaveBeenCalled();
    expect(sideEffects.dispatch).not.toHaveBeenCalled();
    expect(sideEffects.deliver).not.toHaveBeenCalled();
  });

  it("OR-06 command-abort-empty-autothread-claim-matrix", async () => {
    const { cfg, runner } = loadDeliberation();
    const outcome = vi.spyOn(runner, "runInboundClaimForPluginOutcome");
    for (const row of [
      { id: "command", text: "/new", kind: "user_request" },
      { id: "abort", text: "please stop", kind: "user_request" },
      { id: "autothread", text: "review this", kind: "user_request", autoThread: true },
    ] as const) {
      const restPost = vi.fn(async () => ({ id: `thread-${row.id}` }));
      await processDiscordMessage(
        await createProcessContext(cfg, {
          message: {
            id: row.id,
            channelId: sourceId,
            content: row.text,
            timestamp: "2026-08-23T12:00:00.000Z",
            attachments: [],
          },
          baseText: row.text,
          messageText: row.text,
          inboundEventKind: row.kind,
          client: { rest: { post: restPost } },
          channelConfig: row.autoThread ? { allowed: true, autoThread: true } : null,
        }),
      );
      expect(restPost).not.toHaveBeenCalled();
    }
    const empty = await preflightDiscordMessage(
      createGuildPreflightParams(cfg, { id: "empty", content: "" }),
    );
    if (empty) {
      await processDiscordMessage(empty);
    }

    expect(outcome).toHaveBeenCalledTimes(4);
    expect(outcome.mock.calls.map(([, event]) => event)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ messageId: "command", content: "/new" }),
        expect.objectContaining({ messageId: "abort", content: "please stop" }),
        expect.objectContaining({ messageId: "autothread", content: "review this" }),
        expect.objectContaining({ messageId: "empty", content: "" }),
      ]),
    );
    expect(requests).toHaveLength(3);
    expectNoOrdinaryEffects();
  });
});
