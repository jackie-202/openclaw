// Verifies sync-only plugin hook execution constraints.
import type { AgentMessage } from "openclaw/plugin-sdk/agent-core";
import { describe, expect, it, vi } from "vitest";
import { createHookRunner, type HookRunnerLogger } from "./hooks.js";
import { createMockPluginRegistry } from "./hooks.test-helpers.js";

function createToolResultMessage(text: string): AgentMessage {
  return {
    role: "toolResult",
    toolCallId: "call_1",
    content: [{ type: "text", text }],
    isError: false,
  } as AgentMessage;
}

function createLogger(): HookRunnerLogger & {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
} {
  const warn = vi.fn<(message: string) => void>();
  const error = vi.fn<(message: string) => void>();
  return {
    warn,
    error,
  };
}

describe("sync-only plugin hooks", () => {
  it("keeps inbound events separate when an ownership policy claims the source", () => {
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "inbound_event_policy" as never,
          pluginId: "source-owner",
          handler: (() => ({ aggregation: "separate", dispatch: "exclusive" })) as never,
        },
      ]),
    );

    const result = (
      runner as typeof runner & {
        runInboundEventPolicy: (event: {
          provider: string;
          accountId: string;
          conversationId: string;
          providerEventId: string;
        }) => { aggregation: "separate"; dispatch?: "exclusive" } | undefined;
      }
    ).runInboundEventPolicy({
      provider: "discord",
      accountId: "default",
      conversationId: "source",
      providerEventId: "message-1",
    });

    expect(result).toEqual({ kind: "exclusive", ownerPluginId: "source-owner" });
  });

  it("fails closed when multiple plugins claim exclusive ownership", () => {
    const firstPolicy = vi.fn(() => ({ aggregation: "separate", dispatch: "exclusive" }) as const);
    const secondPolicy = vi.fn(() => ({ aggregation: "separate", dispatch: "exclusive" }) as const);
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "inbound_event_policy" as never,
          pluginId: "higher-priority-owner",
          priority: 100,
          handler: firstPolicy as never,
        },
        {
          hookName: "inbound_event_policy" as never,
          pluginId: "lower-priority-owner",
          priority: 1,
          handler: secondPolicy as never,
        },
      ]),
    );

    const result = runner.runInboundEventPolicy({
      provider: "slack",
      accountId: "default",
      conversationId: "C123",
      providerEventId: "1700000000.000100",
    });

    expect(result).toEqual({ kind: "ambiguous" });
    expect(firstPolicy).toHaveBeenCalledOnce();
    expect(secondPolicy).toHaveBeenCalledOnce();
  });

  it("fails safe to separate events when an inbound ownership policy is async", () => {
    const logger = createLogger();
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "inbound_event_policy" as never,
          pluginId: "async-source-owner",
          handler: (async () => ({ aggregation: "separate" })) as never,
        },
      ]),
      { logger },
    );

    const result = (
      runner as typeof runner & {
        runInboundEventPolicy: (event: {
          provider: string;
          accountId: string;
          conversationId: string;
        }) => { aggregation: "separate" } | undefined;
      }
    ).runInboundEventPolicy({
      provider: "slack",
      accountId: "workspace",
      conversationId: "C123",
    });

    expect(result).toEqual({ kind: "separate" });
    expect(logger.warn).toHaveBeenCalledWith(
      "[hooks] inbound_event_policy handler from async-source-owner returned a Promise; this hook is synchronous, so aggregation was disabled.",
    );
  });

  it("keeps policy exception details out of fail-closed diagnostics", () => {
    const logger = createLogger();
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "inbound_event_policy" as never,
          pluginId: "broken-source-owner",
          handler: (() => {
            throw new Error("credential=do-not-log");
          }) as never,
        },
      ]),
      { logger },
    );

    expect(
      runner.runInboundEventPolicy({
        provider: "discord",
        accountId: "default",
        conversationId: "source",
      }),
    ).toEqual({ kind: "separate" });
    expect(logger.error).toHaveBeenCalledWith(
      "[hooks] inbound_event_policy handler from broken-source-owner failed; aggregation was disabled.",
    );
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("do-not-log");
  });

  it("warns and ignores accidental async tool_result_persist handlers", () => {
    const logger = createLogger();
    const originalMessage = createToolResultMessage("original");
    const replacementMessage = createToolResultMessage("replacement");
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "tool_result_persist",
          pluginId: "async-tool-result",
          handler: async () => ({ message: replacementMessage }),
        },
      ]),
      { logger },
    );

    const result = runner.runToolResultPersist(
      { message: originalMessage },
      { agentId: "agent-1", sessionKey: "session-1" },
    );

    expect(result).toEqual({ message: originalMessage });
    expect(logger.warn.mock.calls).toEqual([
      [
        "[hooks] tool_result_persist handler from async-tool-result returned a Promise; this hook is synchronous and the result was ignored.",
      ],
    ]);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("warns and ignores accidental async before_message_write handlers", () => {
    const logger = createLogger();
    const originalMessage = createToolResultMessage("original");
    const runner = createHookRunner(
      createMockPluginRegistry([
        {
          hookName: "before_message_write",
          pluginId: "async-before-write",
          handler: async () => ({ block: true }),
        },
      ]),
      { logger },
    );

    const result = runner.runBeforeMessageWrite(
      { message: originalMessage, sessionKey: "session-1", agentId: "agent-1" },
      { agentId: "agent-1", sessionKey: "session-1" },
    );

    expect(result).toBeUndefined();
    expect(logger.warn.mock.calls).toEqual([
      [
        "[hooks] before_message_write handler from async-before-write returned a Promise; this hook is synchronous and the result was ignored.",
      ],
    ]);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
