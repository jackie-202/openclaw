// Tests get-reply fast-path command handling before full agent dispatch.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { testing as cliBackendsTesting } from "../../agents/cli-backends.js";
import type { OpenClawConfig } from "../../config/config.js";
import { getSessionEntry } from "../../config/sessions.js";
import {
  buildFastReplyCommandContext,
  initFastReplySessionState,
  markCompleteReplyConfig,
  withFastReplyConfig,
} from "./get-reply-fast-path.js";
import {
  buildGetReplyCtx,
  createGetReplyContinueDirectivesResult,
  createGetReplySessionState,
  expectResolvedTelegramTimezone,
  registerGetReplyRuntimeOverrides,
} from "./get-reply.test-fixtures.js";
import { loadGetReplyModuleForTest } from "./get-reply.test-loader.js";
import "./get-reply.test-runtime-mocks.js";

type LoadModelCatalogFn = typeof import("../../agents/model-catalog.js").loadModelCatalog;
type ModelAliasIndex = import("../../agents/model-selection.js").ModelAliasIndex;

function emptyAliasIndex(): ModelAliasIndex {
  return { byAlias: new Map(), byKey: new Map() };
}

const mocks = vi.hoisted(() => ({
  ensureAgentWorkspace: vi.fn(),
  handleInlineActions: vi.fn(),
  initSessionState: vi.fn(),
  loadModelCatalog: vi.fn<LoadModelCatalogFn>(async () => [
    {
      provider: "openai",
      id: "gpt-5.5",
      name: "GPT-5.5",
      reasoning: true,
    },
  ]),
  resolveReplyDirectives: vi.fn(),
}));

vi.mock("../../agents/model-catalog.js", async () => {
  const actual = await vi.importActual<typeof import("../../agents/model-catalog.js")>(
    "../../agents/model-catalog.js",
  );
  return {
    ...actual,
    loadModelCatalog: mocks.loadModelCatalog,
  };
});

vi.mock("../../agents/workspace.js", () => ({
  DEFAULT_AGENT_WORKSPACE_DIR: "/tmp/openclaw-workspace",
  ensureAgentWorkspace: (...args: unknown[]) => mocks.ensureAgentWorkspace(...args),
}));
registerGetReplyRuntimeOverrides(mocks);

let getReplyFromConfig: typeof import("./get-reply.js").getReplyFromConfig;
let resolveDefaultModelMock: typeof import("./directive-handling.defaults.js").resolveDefaultModel;
let resolveModelRefFromStringMock: typeof import("../../agents/model-selection.js").resolveModelRefFromString;
let loadConfigMock: typeof import("../../config/config.js").getRuntimeConfig;
let runPreparedReplyMock: typeof import("./get-reply-run.js").runPreparedReply;

async function loadGetReplyRuntimeForTest() {
  ({ getReplyFromConfig } = await loadGetReplyModuleForTest({ cacheKey: import.meta.url }));
  ({ resolveDefaultModel: resolveDefaultModelMock } =
    await import("./directive-handling.defaults.js"));
  ({ resolveModelRefFromString: resolveModelRefFromStringMock } =
    await import("../../agents/model-selection.js"));
  ({ getRuntimeConfig: loadConfigMock } = await import("../../config/config.js"));
  ({ runPreparedReply: runPreparedReplyMock } = await import("./get-reply-run.js"));
}

function requirePreparedReplyParams() {
  const preparedReplyParams = vi.mocked(runPreparedReplyMock).mock.calls[0]?.[0];
  if (!preparedReplyParams) {
    throw new Error("expected prepared reply params");
  }
  return preparedReplyParams;
}

function requireDirectiveParams() {
  const directiveParams = mocks.resolveReplyDirectives.mock.calls[0]?.[0] as
    | {
        sessionKey?: string;
        workspaceDir?: string;
        provider?: string;
        model?: string;
      }
    | undefined;
  if (!directiveParams) {
    throw new Error("expected directive params");
  }
  return directiveParams;
}

describe("getReplyFromConfig fast test bootstrap", () => {
  beforeAll(async () => {
    await loadGetReplyRuntimeForTest();
  });

  beforeEach(() => {
    vi.stubEnv("OPENCLAW_TEST_FAST", "1");
    cliBackendsTesting.setDepsForTest({
      resolvePluginSetupRegistry: () => ({
        providers: [],
        cliBackends: [],
        configMigrations: [],
        autoEnableProbes: [],
        diagnostics: [],
      }),
      resolveRuntimeCliBackends: () => [],
    });
    mocks.ensureAgentWorkspace.mockReset();
    mocks.handleInlineActions.mockReset();
    mocks.handleInlineActions.mockResolvedValue({ kind: "reply", reply: { text: "ok" } });
    mocks.initSessionState.mockReset();
    mocks.loadModelCatalog.mockReset();
    mocks.loadModelCatalog.mockResolvedValue([
      {
        provider: "openai",
        id: "gpt-5.5",
        name: "GPT-5.5",
        reasoning: true,
      },
    ]);
    mocks.resolveReplyDirectives.mockReset();
    vi.mocked(resolveDefaultModelMock).mockReset();
    vi.mocked(resolveDefaultModelMock).mockReturnValue({
      defaultProvider: "openai",
      defaultModel: "gpt-4o-mini",
      aliasIndex: emptyAliasIndex(),
    });
    vi.mocked(resolveModelRefFromStringMock).mockReset();
    vi.mocked(resolveModelRefFromStringMock).mockReturnValue(null);
    vi.mocked(loadConfigMock).mockReset();
    vi.mocked(runPreparedReplyMock).mockReset();
    vi.mocked(loadConfigMock).mockReturnValue({});
    mocks.resolveReplyDirectives.mockResolvedValue({ kind: "reply", reply: { text: "ok" } });
    vi.mocked(runPreparedReplyMock).mockResolvedValue({ text: "ok" });
    mocks.initSessionState.mockResolvedValue(createGetReplySessionState());
  });

  afterEach(() => {
    cliBackendsTesting.resetDepsForTest();
    vi.unstubAllEnvs();
  });

  it("fails fast on unmarked config overrides in strict fast-test mode", async () => {
    await expect(
      getReplyFromConfig(buildGetReplyCtx(), undefined, {} as OpenClawConfig),
    ).rejects.toThrow(/withFastReplyConfig\(\)\/markCompleteReplyConfig\(\)/);
    expect(vi.mocked(loadConfigMock)).not.toHaveBeenCalled();
  });

  it("skips getRuntimeConfig, workspace bootstrap, and session bootstrap for marked test configs", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-fast-reply-"));
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "anthropic/claude-opus-4-6",
          workspace: path.join(home, "openclaw"),
        },
      },
      channels: { telegram: { allowFrom: ["*"] } },
      session: { store: path.join(home, "sessions.json") },
    } as OpenClawConfig);

    await expect(getReplyFromConfig(buildGetReplyCtx(), undefined, cfg)).resolves.toEqual({
      text: "ok",
    });
    expect(vi.mocked(loadConfigMock)).not.toHaveBeenCalled();
    expect(mocks.ensureAgentWorkspace).not.toHaveBeenCalled();
    expect(mocks.initSessionState).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).toHaveBeenCalledOnce();
    const preparedReplyParams = requirePreparedReplyParams();
    expect(preparedReplyParams.cfg).toBe(cfg);
  });

  it("still merges partial config overrides against getRuntimeConfig()", async () => {
    vi.stubEnv("OPENCLAW_ALLOW_SLOW_REPLY_TESTS", "1");
    vi.mocked(loadConfigMock).mockReturnValue({
      channels: {
        telegram: {
          botToken: "resolved-telegram-token",
        },
      },
    } satisfies OpenClawConfig);

    await getReplyFromConfig(buildGetReplyCtx(), undefined, {
      agents: {
        defaults: {
          userTimezone: "America/New_York",
        },
      },
    } as OpenClawConfig);

    expect(vi.mocked(loadConfigMock)).toHaveBeenCalledOnce();
    expect(mocks.initSessionState).toHaveBeenCalledOnce();
    expectResolvedTelegramTimezone(mocks.resolveReplyDirectives);
  });

  it("marks configs through withFastReplyConfig()", async () => {
    const cfg = withFastReplyConfig({ session: { store: "/tmp/sessions.json" } } as OpenClawConfig);

    await expect(getReplyFromConfig(buildGetReplyCtx(), undefined, cfg)).resolves.toEqual({
      text: "ok",
    });
    expect(vi.mocked(loadConfigMock)).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).toHaveBeenCalledOnce();
  });

  it("clears stale ack-only heartbeat pending delivery before running heartbeat", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-heartbeat-pending-clear-"));
    const storePath = path.join(home, "sessions.json");
    const sessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [sessionKey]: {
          sessionId: "pending-ack",
          updatedAt: Date.now(),
          pendingFinalDelivery: true,
          pendingFinalDeliveryText: "HEARTBEAT_OK",
          pendingFinalDeliveryCreatedAt: 1,
          pendingFinalDeliveryAttemptCount: 4,
          pendingFinalDeliveryLastError: null,
        },
      }),
      "utf8",
    );
    const cfg = withFastReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: home,
          heartbeat: { ackMaxChars: 300 },
        },
      },
      session: { store: storePath },
    } as OpenClawConfig);

    await expect(
      getReplyFromConfig(buildGetReplyCtx(), { isHeartbeat: true }, cfg),
    ).resolves.toEqual({ text: "ok" });

    const stored = JSON.parse(await fs.readFile(storePath, "utf8"))[sessionKey];
    expect(stored.pendingFinalDelivery).toBeUndefined();
    expect(stored.pendingFinalDeliveryText).toBeUndefined();
    expect(stored.pendingFinalDeliveryAttemptCount).toBeUndefined();
  });

  it("keeps non-ack heartbeat pending delivery without direct replay", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-heartbeat-pending-replay-"));
    const storePath = path.join(home, "sessions.json");
    const sessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [sessionKey]: {
          sessionId: "pending-ack-with-remainder",
          updatedAt: Date.now(),
          pendingFinalDelivery: true,
          pendingFinalDeliveryText: "HEARTBEAT_OK short",
        },
      }),
      "utf8",
    );
    const cfg = withFastReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: home,
          heartbeat: { ackMaxChars: 0 },
        },
      },
      session: { store: storePath },
    } as OpenClawConfig);

    await expect(
      getReplyFromConfig(buildGetReplyCtx(), { isHeartbeat: true }, cfg),
    ).resolves.toEqual({ text: "ok" });

    const stored = JSON.parse(await fs.readFile(storePath, "utf8"))[sessionKey];
    expect(stored.pendingFinalDelivery).toBe(true);
    expect(stored.pendingFinalDeliveryText).toBe("HEARTBEAT_OK short");
    expect(stored.pendingFinalDeliveryAttemptCount).toBeUndefined();
  });

  it("does not replay stale heartbeat pending delivery", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-heartbeat-pending-suppress-"));
    const storePath = path.join(home, "sessions.json");
    const sessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [sessionKey]: {
          sessionId: "pending-user-final",
          updatedAt: Date.now() - 60_000,
          pendingFinalDelivery: true,
          pendingFinalDeliveryText: "private prior user answer",
          pendingFinalDeliveryCreatedAt: 1,
        },
      }),
      "utf8",
    );
    const cfg = withFastReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: home,
          heartbeat: { ackMaxChars: 300 },
        },
      },
      session: { store: storePath },
    } as OpenClawConfig);

    await expect(
      getReplyFromConfig(buildGetReplyCtx(), { isHeartbeat: true }, cfg),
    ).resolves.toEqual({
      text: "ok",
    });

    const stored = JSON.parse(await fs.readFile(storePath, "utf8"))[sessionKey];
    expect(stored.pendingFinalDelivery).toBe(true);
    expect(stored.pendingFinalDeliveryText).toBe("private prior user answer");
    expect(stored.pendingFinalDeliveryAttemptCount).toBeUndefined();
  });

  it("selects fresh Discord models from modelByChannel and thinking from runtime profiles", async () => {
    vi.stubEnv("OPENCLAW_ALLOW_SLOW_REPLY_TESTS", "1");
    vi.mocked(resolveDefaultModelMock).mockReturnValue({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });
    vi.mocked(resolveModelRefFromStringMock).mockImplementation(({ raw }) => {
      const [provider, ...modelParts] = raw.split("/");
      const model = modelParts.join("/");
      return provider && model ? ({ ref: { provider, model } } as never) : null;
    });
    const target = "1483471834283507863";
    const sessionKey = `agent:main:discord:channel:${target}`;
    const cases = [
      {
        name: "live session override",
        sessionEntry: { modelOverride: "gpt-5.7", providerOverride: "openai" },
        runtimeProfile: { thinkingLevel: "medium" },
        legacyModel: "openai/gpt-5.4",
        expectedModel: "gpt-5.7",
      },
      {
        name: "fresh model and thinking ownership",
        sessionEntry: {},
        runtimeProfile: {
          thinkingLevel: "high",
          reasoningLevel: "on",
          textVerbosity: "low" as const,
        },
        legacyModel: "openai/gpt-5.4",
        expectedModel: "gpt-5.4",
      },
      {
        name: "modelByChannel without runtime model",
        sessionEntry: {},
        runtimeProfile: { thinkingLevel: "high" },
        legacyModel: "openai/gpt-5.4",
        expectedModel: "gpt-5.4",
      },
      {
        name: "global default",
        sessionEntry: {},
        runtimeProfile: undefined,
        legacyModel: undefined,
        expectedModel: "gpt-5.5",
      },
    ];

    for (const testCase of cases) {
      mocks.initSessionState.mockResolvedValueOnce(
        createGetReplySessionState({
          sessionCtx: { Provider: "discord", ChatType: "channel", SessionKey: sessionKey },
          sessionEntry: {
            sessionId: `session-${testCase.name}`,
            updatedAt: 1,
            channel: "discord",
            chatType: "channel",
            groupId: target,
            ...testCase.sessionEntry,
          },
          sessionStore: {},
          sessionKey,
          isNewSession: true,
          groupResolution: { channel: "discord", id: target },
          isGroup: true,
        }),
      );
      mocks.resolveReplyDirectives.mockResolvedValueOnce({ kind: "reply", reply: { text: "ok" } });
      const cfg = {
        agents: { defaults: { model: "openai/gpt-5.5" } },
        channels: {
          ...(testCase.runtimeProfile
            ? { runtimeByChannel: { discord: { [target]: testCase.runtimeProfile } } }
            : {}),
          ...(testCase.legacyModel
            ? { modelByChannel: { discord: { [target]: testCase.legacyModel } } }
            : {}),
        },
      } as OpenClawConfig;

      await getReplyFromConfig(
        buildGetReplyCtx({
          Provider: "discord",
          Surface: "discord",
          ChatType: "channel",
          SessionKey: sessionKey,
          From: `discord:channel:${target}`,
          To: `discord:channel:${target}`,
        }),
        undefined,
        cfg,
      );

      const directiveParams = mocks.resolveReplyDirectives.mock.calls.at(-1)?.[0] as {
        model?: string;
        channelRuntimeProfile?: Record<string, unknown> | null;
        sessionEntry?: Record<string, unknown>;
      };
      expect(directiveParams.model, testCase.name).toBe(testCase.expectedModel);
      expect(directiveParams.channelRuntimeProfile, testCase.name).toEqual(
        testCase.runtimeProfile
          ? expect.objectContaining({
              ...testCase.runtimeProfile,
            })
          : null,
      );
      if (testCase.name === "fresh model and thinking ownership") {
        expect(directiveParams.sessionEntry?.modelOverride).toBeUndefined();
        expect(directiveParams.channelRuntimeProfile?.thinkingLevel).toBe("high");
      }
    }
  });

  it("keeps the canonical channel model authoritative over stale fallback state", async () => {
    vi.stubEnv("OPENCLAW_ALLOW_SLOW_REPLY_TESTS", "1");
    vi.mocked(resolveDefaultModelMock).mockReturnValue({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });
    vi.mocked(resolveModelRefFromStringMock).mockImplementation(({ raw }) => {
      const [provider, ...modelParts] = raw.split("/");
      const model = modelParts.join("/");
      return provider && model ? ({ ref: { provider, model } } as never) : null;
    });
    mocks.handleInlineActions.mockImplementation(async (params: unknown) => ({
      kind: "continue",
      directives: {},
      abortedLastRun: false,
      cleanedBody: (params as { cleanedBody: string }).cleanedBody,
    }));
    mocks.resolveReplyDirectives.mockImplementation(async (params: unknown) => {
      const selected = params as { provider: string; model: string; triggerBodyNormalized: string };
      return createGetReplyContinueDirectivesResult({
        body: selected.triggerBodyNormalized,
        abortKey: "agent:main:discord:channel:1494790764134273195",
        from: "discord:channel:1494790764134273195",
        to: "discord:channel:1494790764134273195",
        senderId: "einstein-user",
        commandSource: selected.triggerBodyNormalized,
        senderIsOwner: true,
        resetHookTriggered: false,
        provider: selected.provider,
        model: selected.model,
      });
    });

    const target = "1494790764134273195";
    const sessionKey = `agent:main:discord:channel:${target}`;
    const staleRuntime = {
      sessionId: "a6eaa5bb-58de-46da-b30e-eb3597c533cb",
      updatedAt: 1,
      channel: "discord",
      chatType: "channel" as const,
      groupId: target,
      modelProvider: "ollama",
      model: "qwen3-coder-next-q6k:latest",
    };
    const cases = [
      {
        name: "ordinary stale runtime metadata",
        sessionEntry: staleRuntime,
        channelModel: "copilot/claude-fable-5",
        expectedProvider: "copilot",
        expectedModel: "claude-fable-5",
      },
      {
        name: "stale auto fallback from the previous channel primary",
        sessionEntry: {
          ...staleRuntime,
          providerOverride: "ollama",
          modelOverride: "qwen3-coder-next-q6k:latest",
          modelOverrideSource: "auto" as const,
          modelOverrideFallbackOriginProvider: "openai",
          modelOverrideFallbackOriginModel: "gpt-5.6-sol",
        },
        channelModel: "copilot/claude-fable-5",
        expectedProvider: "copilot",
        expectedModel: "claude-fable-5",
      },
      {
        name: "explicit same-session model command",
        sessionEntry: {
          ...staleRuntime,
          providerOverride: "ollama",
          modelOverride: "qwen3-coder-next-q6k:latest",
          modelOverrideSource: "user" as const,
        },
        channelModel: "copilot/claude-fable-5",
        expectedProvider: "ollama",
        expectedModel: "qwen3-coder-next-q6k:latest",
      },
      {
        name: "unprofiled channel",
        sessionEntry: staleRuntime,
        channelModel: undefined,
        expectedProvider: "openai",
        expectedModel: "gpt-5.5",
      },
    ];

    for (const testCase of cases) {
      const sessionEntry = { ...testCase.sessionEntry };
      mocks.initSessionState.mockResolvedValueOnce(
        createGetReplySessionState({
          sessionCtx: { Provider: "discord", ChatType: "channel", SessionKey: sessionKey },
          sessionEntry,
          sessionStore: {
            [sessionKey]: sessionEntry,
            "agent:main:current": {
              sessionId: "unrelated",
              updatedAt: 1,
              providerOverride: "ollama",
              modelOverride: "qwen3-coder-next-q6k:latest",
              modelOverrideSource: "user",
            },
          },
          sessionKey,
          groupResolution: { channel: "discord", id: target },
          isGroup: true,
        }),
      );
      const cfg = {
        agents: { defaults: { model: "openai/gpt-5.5" } },
        channels: testCase.channelModel
          ? {
              modelByChannel: {
                discord: { [target]: testCase.channelModel },
              },
            }
          : {},
      } as OpenClawConfig;

      await getReplyFromConfig(
        buildGetReplyCtx({
          Provider: "discord",
          Surface: "discord",
          ChatType: "channel",
          SessionKey: sessionKey,
          From: `discord:channel:${target}`,
          To: `discord:channel:${target}`,
        }),
        undefined,
        cfg,
      );

      const preparedReplyParams = vi.mocked(runPreparedReplyMock).mock.calls.at(-1)?.[0];
      expect(preparedReplyParams, testCase.name).toMatchObject({
        provider: testCase.expectedProvider,
        model: testCase.expectedModel,
      });
    }
  });

  it("handles native /status before workspace bootstrap", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-status-fast-"));
    const targetSessionKey = "agent:main:telegram:123";
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: path.join(home, "workspace"),
        },
      },
      session: { store: path.join(home, "sessions.json") },
    } as OpenClawConfig);
    vi.mocked(resolveDefaultModelMock).mockReturnValueOnce({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });

    const reply = await getReplyFromConfig(
      buildGetReplyCtx({
        Body: "/status",
        BodyForAgent: "/status",
        RawBody: "/status",
        CommandBody: "/status",
        CommandSource: "native",
        CommandAuthorized: true,
        SessionKey: "telegram:slash:123",
        CommandTargetSessionKey: targetSessionKey,
      }),
      undefined,
      cfg,
    );

    if (!reply || Array.isArray(reply) || typeof reply.text !== "string") {
      throw new Error("expected status reply text");
    }
    expect(reply.text.includes("OpenClaw")).toBe(true);
    expect(reply.text.includes("Think: medium")).toBe(true);
    expect(mocks.loadModelCatalog).toHaveBeenCalledWith({ config: cfg });
    expect(mocks.ensureAgentWorkspace).not.toHaveBeenCalled();
    expect(mocks.initSessionState).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).not.toHaveBeenCalled();
  });

  it("uses configured agent thinking defaults for native /status", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-status-agent-think-"));
    const targetSessionKey = "agent:main:telegram:123";
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: path.join(home, "workspace"),
          thinkingDefault: "low",
        },
        list: [
          {
            id: "main",
            thinkingDefault: "high",
          },
        ],
      },
      session: { store: path.join(home, "sessions.json") },
    } as OpenClawConfig);
    vi.mocked(resolveDefaultModelMock).mockReturnValueOnce({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });

    const reply = await getReplyFromConfig(
      buildGetReplyCtx({
        Body: "/status",
        BodyForAgent: "/status",
        RawBody: "/status",
        CommandBody: "/status",
        CommandSource: "native",
        CommandAuthorized: true,
        SessionKey: "telegram:slash:123",
        CommandTargetSessionKey: targetSessionKey,
      }),
      undefined,
      cfg,
    );

    expect(Array.isArray(reply)).toBe(false);
    if (!reply || Array.isArray(reply)) {
      throw new Error("expected single reply payload");
    }
    expect(reply.text).toContain("Think: high");
    expect(mocks.loadModelCatalog).not.toHaveBeenCalled();
    expect(mocks.ensureAgentWorkspace).not.toHaveBeenCalled();
    expect(mocks.initSessionState).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).not.toHaveBeenCalled();
  });

  it("uses modelByChannel for native /status", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-status-channel-model-"));
    const targetSessionKey = "agent:main:telegram:123";
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: path.join(home, "workspace"),
        },
      },
      channels: {
        modelByChannel: { telegram: { "*": "openai/gpt-5.4" } },
        runtimeByChannel: {
          telegram: { "*": { thinkingLevel: "high" } },
        },
      },
      session: { store: path.join(home, "sessions.json") },
    } as OpenClawConfig);
    vi.mocked(resolveDefaultModelMock).mockReturnValueOnce({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });
    vi.mocked(resolveModelRefFromStringMock).mockImplementation(({ raw }) => {
      const [provider, ...modelParts] = raw.split("/");
      const model = modelParts.join("/");
      return provider && model ? ({ ref: { provider, model } } as never) : null;
    });

    const reply = await getReplyFromConfig(
      buildGetReplyCtx({
        Body: "/status",
        BodyForAgent: "/status",
        RawBody: "/status",
        CommandBody: "/status",
        CommandSource: "native",
        CommandAuthorized: true,
        SessionKey: "telegram:slash:123",
        CommandTargetSessionKey: targetSessionKey,
      }),
      undefined,
      cfg,
    );

    expect(Array.isArray(reply)).toBe(false);
    if (!reply || Array.isArray(reply)) {
      throw new Error("expected single reply payload");
    }
    expect(reply.text).toContain("Model: openai/gpt-5.4");
  });

  it("uses the target session thinking override for native /status", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-status-think-"));
    const storePath = path.join(home, "sessions.json");
    const targetSessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [targetSessionKey]: {
          sessionId: "existing-telegram-session",
          thinkingLevel: "xhigh",
          updatedAt: 1,
        },
      }),
      "utf8",
    );
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "openai/gpt-5.5",
          workspace: path.join(home, "workspace"),
        },
      },
      session: { store: storePath },
    } as OpenClawConfig);
    vi.mocked(resolveDefaultModelMock).mockReturnValueOnce({
      defaultProvider: "openai",
      defaultModel: "gpt-5.5",
      aliasIndex: emptyAliasIndex(),
    });

    const reply = await getReplyFromConfig(
      buildGetReplyCtx({
        Body: "/status",
        BodyForAgent: "/status",
        RawBody: "/status",
        CommandBody: "/status",
        CommandSource: "native",
        CommandAuthorized: true,
        SessionKey: "telegram:slash:123",
        CommandTargetSessionKey: targetSessionKey,
      }),
      undefined,
      cfg,
    );

    expect(Array.isArray(reply)).toBe(false);
    if (!reply || Array.isArray(reply)) {
      throw new Error("expected single reply payload");
    }
    expect(reply.text).toContain("Think: xhigh");
    expect(mocks.loadModelCatalog).not.toHaveBeenCalled();
    expect(mocks.ensureAgentWorkspace).not.toHaveBeenCalled();
    expect(mocks.initSessionState).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).not.toHaveBeenCalled();
  });

  it("handles native slash directives before workspace bootstrap", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-slash-fast-"));
    const targetSessionKey = "agent:main:telegram:123";
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "anthropic/claude-opus-4-6",
          workspace: path.join(home, "workspace"),
        },
      },
      session: { store: path.join(home, "sessions.json") },
    } as OpenClawConfig);
    mocks.resolveReplyDirectives.mockResolvedValueOnce({
      kind: "reply",
      reply: { text: "model status" },
    });

    await expect(
      getReplyFromConfig(
        buildGetReplyCtx({
          Body: "/model status",
          BodyForAgent: "/model status",
          RawBody: "/model status",
          CommandBody: "/model status",
          CommandSource: "native",
          CommandAuthorized: true,
          SessionKey: "telegram:slash:123",
          CommandTargetSessionKey: targetSessionKey,
        }),
        undefined,
        cfg,
      ),
    ).resolves.toEqual({ text: "model status" });

    expect(mocks.ensureAgentWorkspace).not.toHaveBeenCalled();
    expect(mocks.initSessionState).not.toHaveBeenCalled();
    expect(vi.mocked(runPreparedReplyMock)).not.toHaveBeenCalled();
    expect(mocks.resolveReplyDirectives).toHaveBeenCalledOnce();
    const directiveParams = requireDirectiveParams();
    expect(directiveParams.sessionKey).toBe(targetSessionKey);
    expect(directiveParams.workspaceDir).toBe("/tmp/workspace");
  });

  it("continues native slash goal starts with the rewritten command-safe prompt", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-native-goal-fast-"));
    const targetSessionKey = "agent:main:telegram:123";
    const storePath = path.join(home, "sessions.json");
    const cfg = markCompleteReplyConfig({
      agents: {
        defaults: {
          model: "anthropic/claude-opus-4-6",
          workspace: path.join(home, "workspace"),
        },
      },
      channels: {
        runtimeByChannel: {
          telegram: {
            "*": { thinkingLevel: "high", reasoningLevel: "on", textVerbosity: "low" },
          },
        },
      },
      session: { store: storePath },
    } as OpenClawConfig);
    const continuationPrompt = `Pursue this goal exactly as written from this JSON string: "\\/status"`;
    const continueDirectives = async (params: unknown) =>
      createGetReplyContinueDirectivesResult({
        body: (params as { triggerBodyNormalized: string }).triggerBodyNormalized,
        abortKey: targetSessionKey,
        from: "telegram:user:42",
        to: "telegram:123",
        senderId: "telegram:user:42",
        commandSource: (params as { triggerBodyNormalized: string }).triggerBodyNormalized,
        senderIsOwner: true,
        resetHookTriggered: false,
      });
    mocks.resolveReplyDirectives
      .mockImplementationOnce(continueDirectives)
      .mockImplementationOnce(async (params: unknown) => {
        expect(params).toMatchObject({
          triggerBodyNormalized: continuationPrompt,
          channelRuntimeProfile: {
            thinkingLevel: "high",
            reasoningLevel: "on",
            textVerbosity: "low",
          },
        });
        return continueDirectives(params);
      });
    mocks.handleInlineActions.mockImplementation(async (params: unknown) => {
      expect(params).toMatchObject({
        command: {
          rawBodyNormalized: continuationPrompt,
          commandBodyNormalized: continuationPrompt,
        },
        cleanedBody: continuationPrompt,
      });
      return {
        kind: "continue",
        directives: {},
        abortedLastRun: false,
        cleanedBody: continuationPrompt,
      };
    });
    const onSessionMetadataChanges = vi.fn();

    await expect(
      getReplyFromConfig(
        buildGetReplyCtx({
          Body: "/goal start /status",
          BodyForAgent: "/goal start /status",
          RawBody: "/goal start /status",
          CommandBody: "/goal start /status",
          CommandSource: "native",
          CommandAuthorized: true,
          SessionKey: "telegram:slash:123",
          CommandTargetSessionKey: targetSessionKey,
        }),
        { onSessionMetadataChanges } as never,
        cfg,
      ),
    ).resolves.toEqual({ text: "ok" });

    expect(onSessionMetadataChanges).toHaveBeenCalledWith([
      { sessionKey: targetSessionKey, agentId: "main", reason: "command-metadata" },
    ]);
    expect(onSessionMetadataChanges.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(runPreparedReplyMock).mock.invocationCallOrder[0],
    );
    expect(getSessionEntry({ storePath, sessionKey: targetSessionKey })?.goal?.objective).toBe(
      "/status",
    );
    const preparedReplyParams = requirePreparedReplyParams();
    expect(preparedReplyParams.command.commandBodyNormalized).toBe(continuationPrompt);
    expect(preparedReplyParams.sessionCtx.BodyForAgent).toBe(continuationPrompt);
    expect(mocks.handleInlineActions).toHaveBeenCalledTimes(2);
  });

  it("uses native command target session keys during fast bootstrap", () => {
    const result = initFastReplySessionState({
      ctx: buildGetReplyCtx({
        SessionKey: "telegram:slash:123",
        CommandSource: "native",
        CommandTargetSessionKey: "agent:main:main",
      }),
      cfg: { session: { store: "/tmp/sessions.json" } } as OpenClawConfig,
      agentId: "main",
      commandAuthorized: true,
      workspaceDir: "/tmp/workspace",
    });

    expect(result.sessionKey).toBe("agent:main:main");
    expect(result.sessionCtx.SessionKey).toBe("agent:main:main");
  });

  it("maps explicit gateway origin into command context", () => {
    const command = buildFastReplyCommandContext({
      ctx: buildGetReplyCtx({
        Provider: "internal",
        Surface: "internal",
        OriginatingChannel: "slack",
        OriginatingTo: "user:U123",
        From: undefined,
        To: undefined,
        SenderId: "gateway-client",
      }),
      cfg: {} as OpenClawConfig,
      sessionKey: "main",
      isGroup: false,
      triggerBodyNormalized: "/codex bind",
      commandAuthorized: true,
    });

    expect(command.channel).toBe("slack");
    expect(command.channelId).toBe("slack");
    expect(command.from).toBe("gateway-client");
    expect(command.to).toBe("user:U123");
  });

  it("keeps the existing session for /reset newline soft during fast bootstrap", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-fast-reset-newline-soft-"));
    const storePath = path.join(home, "sessions.json");
    const sessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [sessionKey]: {
          sessionId: "existing-fast-reset-newline-soft",
          updatedAt: Date.now(),
        },
      }),
      "utf8",
    );

    const result = initFastReplySessionState({
      ctx: buildGetReplyCtx({
        Body: "/reset \nsoft",
        RawBody: "/reset \nsoft",
        CommandBody: "/reset \nsoft",
        SessionKey: sessionKey,
      }),
      cfg: { session: { store: storePath } } as OpenClawConfig,
      agentId: "main",
      commandAuthorized: true,
      workspaceDir: home,
    });

    expect(result.resetTriggered).toBe(false);
    expect(result.isNewSession).toBe(false);
    expect(result.sessionId).toBe("existing-fast-reset-newline-soft");
  });

  it("keeps the existing session for /reset: soft during fast bootstrap", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-fast-reset-colon-soft-"));
    const storePath = path.join(home, "sessions.json");
    const sessionKey = "agent:main:telegram:123";
    await fs.writeFile(
      storePath,
      JSON.stringify({
        [sessionKey]: {
          sessionId: "existing-fast-reset-colon-soft",
          updatedAt: Date.now(),
        },
      }),
      "utf8",
    );

    const result = initFastReplySessionState({
      ctx: buildGetReplyCtx({
        Body: "/reset: soft",
        RawBody: "/reset: soft",
        CommandBody: "/reset: soft",
        SessionKey: sessionKey,
      }),
      cfg: { session: { store: storePath } } as OpenClawConfig,
      agentId: "main",
      commandAuthorized: true,
      workspaceDir: home,
    });

    expect(result.resetTriggered).toBe(false);
    expect(result.isNewSession).toBe(false);
    expect(result.sessionId).toBe("existing-fast-reset-colon-soft");
  });
});
