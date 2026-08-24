import { describe, expect, it } from "vitest";
import { buildDiscordMessageRequest } from "./send.message-request.js";

describe("buildDiscordMessageRequest", () => {
  it("adds Discord native idempotency fields when requested", () => {
    expect(
      buildDiscordMessageRequest({
        text: "one attempt",
        nonce: "provider:attempt-1",
        enforceNonce: true,
      }),
    ).toEqual({
      content: "one attempt",
      nonce: "provider:attempt-1",
      enforce_nonce: true,
    });
  });

  it("preserves the ordinary request shape without attempt fields", () => {
    expect(buildDiscordMessageRequest({ text: "ordinary" })).toEqual({ content: "ordinary" });
  });
});
