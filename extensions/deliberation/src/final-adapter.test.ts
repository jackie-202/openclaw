import { describe, expect, it, vi } from "vitest";
import { createFinalDeliveryAdapter } from "./final-adapter.js";

const reservation = {
  recordId: "record-1",
  attemptId: "attempt-1",
  owner: "owner",
  leaseToken: "lease",
  deliveryEnvelope: { sourceTarget: "v1:discord:account-1:channel-1" },
  deliveryEnvelopeDigest: "a".repeat(64),
};

describe("public final delivery adapter", () => {
  it("durably invokes once, calls only the injected provider, and binds its receipt", async () => {
    const provider = {
      send: vi.fn().mockResolvedValue({ receiptId: "receipt-1", messageId: "message-1" }),
    };
    const km = {
      ready: vi.fn().mockResolvedValue({ items: [{ recordId: "record-1", text: "reply" }] }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      complete: vi.fn().mockResolvedValue({ state: "SENT" }),
    };

    await expect(
      createFinalDeliveryAdapter({ km, provider, owner: "owner" }).runOnce(),
    ).resolves.toEqual({ state: "SENT" });
    expect(km.invoke).toHaveBeenCalledBefore(provider.send);
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(provider.send).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: "account-1", channelId: "channel-1" }),
    );
    expect(km.complete).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "SENT", providerReceiptId: "receipt-1" }),
    );
  });

  it("terminalizes a provider failure without retrying it", async () => {
    const provider = { send: vi.fn().mockRejectedValue(new Error("permission denied")) };
    const km = {
      ready: vi.fn().mockResolvedValue({ items: [{ recordId: "record-1", text: "reply" }] }),
      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
      invoke: vi.fn().mockResolvedValue({}),
      complete: vi.fn().mockResolvedValue({ state: "FAILED" }),
    };

    await createFinalDeliveryAdapter({ km, provider, owner: "owner" }).runOnce();
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(km.complete).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "provider_rejected" }),
    );
  });
});
