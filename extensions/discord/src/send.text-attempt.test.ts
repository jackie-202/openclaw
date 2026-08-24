import { afterEach, describe, expect, it, vi } from "vitest";
import { sendTextAttemptDiscord } from "./send.outbound.js";

describe("sendTextAttemptDiscord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("makes one message-create request with Discord native idempotency", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "msg-1", channel_id: "123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendTextAttemptDiscord("channel:123", "prepared", {
      cfg: { channels: { discord: { token: "test-token" } } },
      idempotencyKey: "provider:attempt-1",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    if (typeof init.body !== "string") {
      throw new Error("expected a JSON request body");
    }
    expect(JSON.parse(init.body)).toEqual({
      content: "prepared",
      flags: 4,
      nonce: "provider:attempt-1",
      enforce_nonce: true,
    });
    expect(result.messageId).toBe("msg-1");
  });

  it("does not let the REST scheduler retry a rate limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "rate limited",
          retry_after: 0,
          global: false,
        }),
        {
          status: 429,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendTextAttemptDiscord("channel:123", "prepared", {
        cfg: { channels: { discord: { token: "test-token" } } },
        idempotencyKey: "provider:attempt-2",
      }),
    ).rejects.toThrow("rate limited");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
