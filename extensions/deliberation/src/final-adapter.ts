import type { KmReadyItem, KmReservation } from "./km-client.js";

export type FinalDeliveryProvider = {
  send(params: {
    accountId: string;
    channelId: string;
    text: string;
    idempotencyKey: string;
  }): Promise<{ receiptId: string; messageId: string }>;
};

type FinalDeliveryKmClient = {
  ready(): Promise<{ items: KmReadyItem[] }>;
  reserve(
    item: KmReadyItem,
    owner: string,
  ): Promise<
    { outcome: "reserved"; reservation: KmReservation } | { outcome: "conflict" | "disabled" }
  >;
  invoke(
    reservation: KmReservation,
    attemptedTarget: string,
    providerAttemptId: string,
  ): Promise<unknown>;
  complete(params: {
    reservation: KmReservation;
    attemptedTarget: string;
    providerAttemptId: string;
    outcome: "SENT" | "FAILED";
    providerReceiptId?: string;
    providerMessageId?: string;
    providerFailureClass?: string;
    providerEvidence?: Record<string, string>;
  }): Promise<Record<string, unknown>>;
};

function destination(sourceTarget: string): { accountId: string; channelId: string } {
  const parts = sourceTarget.split(":");
  if (parts.length !== 4 || parts[0] !== "v1" || parts[1] !== "discord" || !parts[2] || !parts[3]) {
    throw new Error("delivery envelope has an unsupported destination");
  }
  return { accountId: parts[2], channelId: parts[3] };
}

function failureClass(error: unknown): string {
  if (error instanceof Error && error.name === "TimeoutError") return "timeout";
  return "provider_rejected";
}

/**
 * Public, non-durable adapter boundary. KM owns reservation and terminal state;
 * the injected provider owns the single real provider call.
 */
export function createFinalDeliveryAdapter(params: {
  km: FinalDeliveryKmClient;
  provider: FinalDeliveryProvider;
  owner: string;
}) {
  return {
    async runOnce(): Promise<Record<string, unknown> | undefined> {
      const item = (await params.km.ready()).items[0];
      if (!item) return undefined;
      const reserved = await params.km.reserve(item, params.owner);
      if (reserved.outcome !== "reserved") return undefined;

      const { reservation } = reserved;
      const envelope = reservation.deliveryEnvelope;
      const attemptedTarget = envelope.sourceTarget;
      const providerAttemptId = `provider:${reservation.attemptId}`;
      await params.km.invoke(reservation, attemptedTarget, providerAttemptId);

      let receipt: { receiptId: string; messageId: string };
      try {
        const target = destination(attemptedTarget);
        receipt = await params.provider.send({
          ...target,
          text: item.text,
          idempotencyKey: providerAttemptId,
        });
      } catch (error) {
        return await params.km.complete({
          reservation,
          attemptedTarget,
          providerAttemptId,
          outcome: "FAILED",
          providerFailureClass: failureClass(error),
          providerEvidence: {
            message: error instanceof Error ? error.message.slice(0, 256) : "provider failed",
          },
        });
      }
      return await params.km.complete({
        reservation,
        attemptedTarget,
        providerAttemptId,
        outcome: "SENT",
        providerReceiptId: receipt.receiptId,
        providerMessageId: receipt.messageId,
      });
    },
  };
}
