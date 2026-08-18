import { describe, expect, it, vi } from "vitest";
import { createFinalDeliveryAdapter } from "./final-adapter.js";

const deliveryTarget = {
  provider: "discord" as const,
  account: "account-1",
  channel: "channel-1",
};

function asProviderTarget(target: {
  provider: string;
  account: string;
  channel: string;
  threadId?: string;
}) {
  return {
    provider: target.provider,
    accountId: target.account,
    channelId: target.channel,
    ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
  };
}

const reservation = {
  recordId: "record-1",
  attemptId: "attempt-1",
  owner: "owner",
  leaseToken: "lease",
  deliveryEnvelope: {
    sourceTarget: "v1:discord:account-1:channel-1",
    deliveryTarget,
  },
  deliveryEnvelopeDigest: "a".repeat(64),
};

describe("public final delivery adapter", () => {
  it.each([
    {
      name: "Slack -> Discord",
      sourceTarget: "v1:slack:workspace-a:C123",
      target: {
        provider: "discord" as const,
        account: "delivery-account",
        channel: "delivery-channel",
        threadId: "delivery-thread",
      },
    },
    {
      name: "Discord -> Slack",
      sourceTarget: "v1:discord:source-account:source-channel",
      target: {
        provider: "slack" as const,
        account: "workspace-a",
        channel: "C123",
        threadId: "1712345678.123456",
      },
    },
    {
      name: "Discord -> Discord",
      sourceTarget: "v1:discord:source-account:source-channel",
      target: {
        provider: "discord" as const,
        account: "delivery-account",
        channel: "delivery-channel",
        threadId: "delivery-thread",
      },
    },
    {
      name: "Slack -> Slack",
      sourceTarget: "v1:slack:workspace-a:C123",
      target: {
        provider: "slack" as const,
        account: "workspace-a",
        channel: "C123",
        threadId: "1712345678.654321",
      },
    },
  ])(
    "routes $name by destination alone and binds the exact receipt",
    async ({ sourceTarget, target }) => {
      const events: string[] = [];
      const discord = {
        send: vi.fn(async () => {
          events.push("send");
          return { receiptId: "receipt-1", messageId: "discord-message-1" };
        }),
      };
      const slack = {
        send: vi.fn(async () => {
          events.push("send");
          return { receiptId: "receipt-1", messageId: "slack-message-1" };
        }),
      };
      const durableReservation = {
        ...reservation,
        deliveryEnvelope: { sourceTarget, deliveryTarget: target },
      };
      const km = {
        ready: vi.fn().mockResolvedValue({
          items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: target }],
        }),
        reserve: vi.fn(async () => {
          events.push("reserve");
          return { outcome: "reserved" as const, reservation: durableReservation };
        }),
        invoke: vi.fn(async () => events.push("invoke")),
        completeDelivery: vi.fn(async () => {
          events.push("complete");
          return { state: "SENT" };
        }),
      };

      await createFinalDeliveryAdapter({
        km,
        providers: { discord, slack },
        owner: "owner",
      } as never).runOnce();

      expect(events).toEqual(["reserve", "invoke", "send", "complete"]);
      const selected = target.provider === "discord" ? discord : slack;
      const unselected = target.provider === "discord" ? slack : discord;
      expect(selected.send).toHaveBeenCalledTimes(1);
      expect(unselected.send).not.toHaveBeenCalled();
      expect(selected.send).toHaveBeenCalledWith({
        ...asProviderTarget(target),
        text: "reply",
        idempotencyKey: "provider:attempt-1",
      });
      expect(km.completeDelivery).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptedTarget: target,
          providerReceiptId: "receipt-1",
          providerMessageId:
            target.provider === "discord" ? "discord-message-1" : "slack-message-1",
        }),
      );
    },
  );

  it("uses the durable delivery target for send and all evidence", async () => {
    const durableReservation = {
      ...reservation,
      deliveryEnvelope: {
        sourceTarget: "v1:discord:account-a:channel-a",
        deliveryTarget: {
          provider: "discord" as const,
          account: "account-b",
          channel: "channel-b",
        },
      },
    };
    const provider = {
      send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [
          {
            recordId: "record-1",
            text: "reply",
            effectiveDeliveryTarget: durableReservation.deliveryEnvelope.deliveryTarget,
          },
        ],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation: durableReservation }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
    };

    await createFinalDeliveryAdapter({
      km,
      providers: { discord: provider },
      owner: "owner",
    } as never).runOnce();

    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "account-b", channelId: "channel-b" }),
    );
    expect(km.invoke).toHaveBeenCalledWith(
      durableReservation,
      durableReservation.deliveryEnvelope.deliveryTarget,
      "provider:attempt-1",
    );
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        attemptedTarget: durableReservation.deliveryEnvelope.deliveryTarget,
      }),
    );
  });

  it("rejects a malformed ready target before reservation", async () => {
    const provider = { send: vi.fn() };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [
          {
            recordId: "record-1",
            text: "reply",
            effectiveDeliveryTarget: { ...deliveryTarget, unknown: true },
          },
        ],
      }),
      reserve: vi.fn(),
      invoke: vi.fn(),
      completeDelivery: vi.fn(),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow("invalid deliveryTarget");
    expect(km.reserve).not.toHaveBeenCalled();
    expect(provider.send).not.toHaveBeenCalled();
  });

  it("rejects a reservation target mismatch before durable invocation", async () => {
    const provider = { send: vi.fn() };
    const mismatchedReservation = {
      ...reservation,
      deliveryEnvelope: {
        ...reservation.deliveryEnvelope,
        deliveryTarget: { ...deliveryTarget, channel: "other-channel" },
      },
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({
        outcome: "reserved",
        reservation: mismatchedReservation,
      }),
      invoke: vi.fn(),
      completeDelivery: vi.fn(),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow("differs from ready target");
    expect(km.invoke).not.toHaveBeenCalled();
    expect(provider.send).not.toHaveBeenCalled();
  });

  it("rejects an unsupported destination before invocation or provider send", async () => {
    const discord = { send: vi.fn() };
    const slackTarget = {
      provider: "slack" as const,
      account: "workspace-a",
      channel: "C123",
      threadId: "1712345678.123456",
    };
    const slackReservation = {
      ...reservation,
      deliveryEnvelope: {
        ...reservation.deliveryEnvelope,
        deliveryTarget: slackTarget,
      },
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: slackTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({
        outcome: "reserved",
        reservation: slackReservation,
      }),
      invoke: vi.fn(),
      completeDelivery: vi.fn(),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow("unsupported destination");

    expect(km.reserve).not.toHaveBeenCalled();
    expect(km.invoke).not.toHaveBeenCalled();
    expect(discord.send).not.toHaveBeenCalled();
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("durably invokes once, calls only the injected provider, and binds its receipt", async () => {
    const provider = {
      send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "SENT" }),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).resolves.toEqual({ state: "SENT" });
    expect(km.invoke).toHaveBeenCalledBefore(provider.send);
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "account-1", channelId: "channel-1" }),
    );
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "SENT", providerReceiptId: "receipt-1" }),
    );
  });

  it("terminalizes a provider failure without retrying it", async () => {
    const provider = { send: vi.fn().mockRejectedValue(new Error("permission denied")) };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "FAILED" }),
    };

    await createFinalDeliveryAdapter({
      km,
      providers: { discord: provider },
      owner: "owner",
    } as never).runOnce();
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
    );
  });

  it("leaves an invoked attempt unresolved when provider receipt evidence is invalid", async () => {
    const provider = {
      send: vi.fn().mockResolvedValue({ receiptId: "r".repeat(257), messageId: "message-1" }),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "FAILED" }),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow("invalid receipt id");

    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });

  it("does not retry a send when KM rejects completion evidence", async () => {
    const provider = {
      send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi
        .fn()
        .mockResolvedValueOnce({ outcome: "reserved", reservation })
        .mockResolvedValueOnce({ outcome: "conflict" }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockRejectedValue(new Error("mismatched completion evidence")),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow("mismatched completion evidence");
    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).resolves.toBeUndefined();

    expect(km.invoke).toHaveBeenCalledTimes(1);
    expect(km.reserve).toHaveBeenCalledTimes(2);
    expect(km.reserve.mock.calls[1]).toEqual([
      { recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget },
      "owner",
    ]);
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(km.completeDelivery).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: "permission",
      error: Object.assign(new Error("missing permissions"), {
        kind: "missing-permissions",
        status: 403,
      }),
      expected: "permission",
    },
    {
      name: "rate limit",
      error: Object.assign(new Error("rate limited"), { status: 429, retryAfter: 1.2 }),
      expected: "rate_limit",
    },
    {
      name: "transport",
      error: Object.assign(new Error("upstream unavailable"), { statusCode: 503 }),
      expected: "transport",
    },
    {
      name: "timeout",
      error: Object.assign(new Error("timed out"), { name: "TimeoutError" }),
      expected: "timeout",
    },
    {
      name: "Slack missing scope",
      error: Object.assign(new Error("request contained xoxb-secret"), {
        code: "slack_webapi_platform_error",
        data: { error: "missing_scope", needed: "chat:write", provided: "channels:read" },
      }),
      expected: "permission",
    },
    {
      name: "Slack not in channel",
      error: Object.assign(new Error("not in channel"), {
        code: "slack_webapi_platform_error",
        data: { error: "not_in_channel" },
      }),
      expected: "permission",
    },
    {
      name: "Slack inaccessible target",
      error: Object.assign(new Error("channel deleted"), {
        code: "slack_webapi_platform_error",
        data: { error: "channel_not_found" },
      }),
      expected: "rejection",
    },
    {
      name: "Slack authentication",
      error: Object.assign(new Error("bad token"), {
        code: "slack_webapi_platform_error",
        data: { error: "invalid_auth" },
      }),
      expected: "permission",
    },
    {
      name: "Slack rate limit",
      error: Object.assign(new Error("rate limited"), {
        code: "slack_webapi_rate_limited_error",
        retryAfter: 2,
      }),
      expected: "rate_limit",
    },
    {
      name: "Slack exhausted rate limit",
      error: new Error(
        "A rate limit was exceeded (url: https://slack.com/api/chat.postMessage, retry-after: 7)",
      ),
      expected: "rate_limit",
    },
    {
      name: "Slack nested transport",
      error: Object.assign(new Error("request failed"), {
        code: "slack_webapi_request_error",
        original: { code: "ECONNRESET" },
      }),
      expected: "transport",
    },
  ])("classifies structured provider $name failures", async ({ error, expected }) => {
    const provider = { send: vi.fn().mockRejectedValue(error) };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "FAILED" }),
    };

    await createFinalDeliveryAdapter({
      km,
      providers: { discord: provider },
      owner: "owner",
    } as never).runOnce();

    expect(km.completeDelivery).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: expected }),
    );
    expect(km.completeDelivery).not.toHaveBeenCalledWith(
      expect.objectContaining({
        providerEvidence: expect.objectContaining({
          detail: expect.stringContaining("xoxb-secret"),
        }),
      }),
    );
  });

  it.each([
    "v1:discord:account-1:channel-1",
    { provider: "discord", accountId: "account-1", channelId: "channel 1" },
    { provider: "teams", account: "account-1", channel: "channel-1" },
    { provider: "slack", account: "account-1", channel: "channel-1" },
    { provider: "slack", account: "account-1", channel: "channel-1", threadId: "child" },
  ])("rejects malformed destination %# before durable invocation", async (malformedTarget) => {
    const malformedReservation = {
      ...reservation,
      deliveryEnvelope: { ...reservation.deliveryEnvelope, deliveryTarget: malformedTarget },
    };
    const provider = { send: vi.fn() };
    const km = {
      ready: vi.fn().mockResolvedValue({
        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: malformedTarget }],
      }),
      reserve: vi.fn().mockResolvedValue({
        outcome: "reserved",
        reservation: malformedReservation,
      }),
      invoke: vi.fn().mockResolvedValue({}),
      completeDelivery: vi.fn().mockResolvedValue({ state: "FAILED" }),
    };

    await expect(
      createFinalDeliveryAdapter({
        km,
        providers: { discord: provider },
        owner: "owner",
      } as never).runOnce(),
    ).rejects.toThrow(/invalid deliveryTarget|differs from ready target/);

    expect(provider.send).not.toHaveBeenCalled();
    expect(km.reserve).not.toHaveBeenCalled();
    expect(km.invoke).not.toHaveBeenCalled();
    expect(km.completeDelivery).not.toHaveBeenCalled();
  });
});
