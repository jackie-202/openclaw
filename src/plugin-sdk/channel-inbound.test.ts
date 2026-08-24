/**
 * Tests channel inbound context and dispatch helper behavior.
 */
import { describe, expect, it, vi } from "vitest";

const runInboundEventPolicy = vi.fn();
const runInboundClaimForPluginOutcome = vi.fn();

vi.mock("../plugins/hook-runner-global.js", () => ({
  getGlobalHookRunner: () => ({ runInboundEventPolicy, runInboundClaimForPluginOutcome }),
}));

import {
  buildChannelInboundEventContext,
  claimChannelInboundEvent,
  resolveChannelInboundEventPolicy,
  type BuildChannelInboundEventContextParams,
} from "./channel-inbound.js";

function createInboundParams(
  overrides: Partial<BuildChannelInboundEventContextParams> = {},
): BuildChannelInboundEventContextParams {
  return {
    channel: "test",
    messageId: "msg-1",
    from: "test:user:u1",
    sender: { id: "u1" },
    conversation: {
      kind: "group",
      id: "room-1",
    },
    route: {
      agentId: "main",
      routeSessionKey: "agent:main:test:group:room-1",
    },
    reply: {
      to: "test:room:room-1",
    },
    message: {
      rawBody: "side chatter",
      inboundEventKind: "room_event",
    },
    ...overrides,
  };
}

describe("channel-inbound public helpers", () => {
  it("builds inbound event kind into message context", async () => {
    const ctx = buildChannelInboundEventContext(createInboundParams());

    expect(ctx.InboundEventKind).toBe("room_event");
  });

  it("preserves the closed inbound ownership decision", () => {
    const event = {
      provider: "discord",
      accountId: "default",
      conversationId: "source",
      providerEventId: "message-1",
    };

    runInboundEventPolicy.mockReturnValueOnce({ kind: "separate" });
    expect(resolveChannelInboundEventPolicy(event)).toEqual({ kind: "separate" });

    runInboundEventPolicy.mockReturnValueOnce({
      kind: "exclusive",
      ownerPluginId: "deliberation",
    });
    expect(resolveChannelInboundEventPolicy(event)).toEqual({
      kind: "exclusive",
      ownerPluginId: "deliberation",
    });

    runInboundEventPolicy.mockReturnValueOnce({ kind: "ambiguous" });
    expect(resolveChannelInboundEventPolicy(event)).toEqual({ kind: "ambiguous" });

    runInboundEventPolicy.mockReturnValueOnce({ kind: "ordinary" });
    expect(resolveChannelInboundEventPolicy(event)).toEqual({ kind: "ordinary" });
  });

  it.each([
    [{ status: "handled", result: { handled: true } }, "handled"],
    [{ status: "declined" }, "declined"],
    [{ status: "missing_plugin" }, "missing_plugin"],
    [{ status: "no_handler" }, "no_handler"],
    [{ status: "error", error: "secret detail" }, "error"],
  ] as const)("terminates exclusive ownership after %s", async (outcome, reason) => {
    runInboundClaimForPluginOutcome.mockResolvedValueOnce(outcome);
    const event = {
      content: "review this",
      channel: "discord",
      provider: "discord",
      eventType: "message" as const,
      eventKind: "user_request" as const,
      accountId: "default",
      conversationId: "source",
      messageId: "message-1",
      senderId: "user-1",
      isGroup: true,
    };
    const context = {
      channelId: "discord",
      accountId: "default",
      conversationId: "source",
      messageId: "message-1",
      senderId: "user-1",
    };

    const result = await claimChannelInboundEvent({
      policy: { kind: "exclusive", ownerPluginId: "deliberation" },
      event,
      context,
    });

    expect(result).toEqual(
      expect.objectContaining({
        kind: "terminal",
        reason,
        ownerPluginId: "deliberation",
      }),
    );
    expect(runInboundClaimForPluginOutcome).toHaveBeenCalledWith("deliberation", event, context);
  });

  it("fails ambiguous ownership closed without invoking a claimant", async () => {
    runInboundClaimForPluginOutcome.mockClear();

    const result = await claimChannelInboundEvent({
      policy: { kind: "ambiguous" },
      event: { content: "review", channel: "slack", isGroup: false },
      context: { channelId: "slack" },
    });

    expect(result).toEqual({ kind: "terminal", reason: "ambiguous_owner" });
    expect(runInboundClaimForPluginOutcome).not.toHaveBeenCalled();
  });
});
