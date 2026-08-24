import { isDeepStrictEqual } from "node:util";
import type { OpenClawPluginService } from "openclaw/plugin-sdk/plugin-entry";
import { parseKmDeliveryTarget, type KmDeliveryTarget } from "./delivery-target.js";
import {
  parseWireDeliveryTarget,
  type KmReadyItem,
  type KmReservation,
  type KmWireDeliveryTarget,
} from "./km-client.js";

const FINAL_DELIVERY_OWNER = "openclaw-deliberation";
const FINAL_DELIVERY_POLL_INTERVAL_MS = 5_000;
const MAX_LOOP_WARNING_LENGTH = 256;

export function deriveProviderAttemptId(attemptId: string): string {
  return `provider:${attemptId}`;
}

export type FinalDeliveryProvider = {
  send(
    params: Omit<KmDeliveryTarget, "mode"> & {
      text: string;
      idempotencyKey: string;
    },
  ): Promise<{ receiptId: string; messageId: string }>;
};

export class FinalDeliveryOutcomeUnknownError extends Error {
  override readonly name = "FinalDeliveryOutcomeUnknownError";
}

export class FinalDeliveryRejectedError extends Error {
  override readonly name = "FinalDeliveryRejectedError";

  constructor(
    message: string,
    readonly failureClass: "permission" | "rate_limit" | "rejection",
  ) {
    super(message);
  }
}

type FinalDeliveryKmClient = {
  ready(): Promise<{ items: KmReadyItem[] }>;
  reserve(
    item: KmReadyItem,
    owner: string,
  ): Promise<
    { outcome: "reserved"; reservation: KmReservation } | { outcome: "conflict" | "disabled" }
  >;
  invoke(reservation: KmReservation, providerAttemptId: string): Promise<unknown>;
  completeDelivery(params: {
    reservation: KmReservation;
    providerAttemptId: string;
    outcome: "SENT" | "FAILED";
    providerReceiptId?: string;
    providerMessageId?: string;
    providerFailureClass?: string;
    providerEvidence?: Record<string, string | number>;
  }): Promise<Record<string, unknown>>;
};

function providerTarget(target: KmWireDeliveryTarget): Omit<KmDeliveryTarget, "mode"> {
  const { mode: _mode, ...parsedTarget } = parseKmDeliveryTarget({
    provider: target.provider,
    accountId: target.account,
    channelId: target.channel,
    mode: target.threadId === undefined ? "root" : "thread",
    ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
  });
  return parsedTarget;
}

function boundedProviderId(value: string, field: string): string {
  if (value.length < 1 || value.length > 256) {
    throw new Error(`provider returned an invalid ${field}`);
  }
  return value;
}

/**
 * Public, non-durable adapter boundary. KM owns reservation and terminal state;
 * the injected provider owns the single real provider call.
 */
export function createFinalDeliveryAdapter(params: {
  km: FinalDeliveryKmClient;
  providers: Partial<Record<KmDeliveryTarget["provider"], FinalDeliveryProvider>>;
  owner: string;
}) {
  return {
    async runOnce(): Promise<Record<string, unknown> | undefined> {
      const item = (await params.km.ready()).items[0];
      if (!item) {
        return undefined;
      }
      const readyTarget = parseWireDeliveryTarget(item.effectiveDeliveryTarget, "deliveryTarget");
      if (!params.providers[providerTarget(readyTarget).provider]) {
        throw new Error("delivery envelope has an unsupported destination");
      }
      const reserved = await params.km.reserve(item, params.owner);
      if (reserved.outcome !== "reserved") {
        return undefined;
      }

      const { reservation } = reserved;
      const envelope = reservation.deliveryEnvelope;
      const attemptedTarget = envelope.deliveryTarget;
      if (!isDeepStrictEqual(attemptedTarget, readyTarget)) {
        throw new Error("delivery reservation target differs from ready target");
      }
      const targetForProvider = providerTarget(attemptedTarget);
      const provider = params.providers[targetForProvider.provider];
      if (!provider) {
        throw new Error("delivery envelope has an unsupported destination");
      }
      const providerAttemptId = deriveProviderAttemptId(reservation.attemptId);
      await params.km.invoke(reservation, providerAttemptId);

      let result: { receiptId: string; messageId: string };
      try {
        result = await provider.send({
          ...targetForProvider,
          text: item.text,
          idempotencyKey: providerAttemptId,
        });
      } catch (error) {
        if (error instanceof FinalDeliveryOutcomeUnknownError) {
          throw error;
        }
        if (error instanceof FinalDeliveryRejectedError) {
          return await params.km.completeDelivery({
            reservation,
            providerAttemptId,
            outcome: "FAILED",
            providerFailureClass: error.failureClass,
            providerEvidence: { detail: error.message.slice(0, MAX_LOOP_WARNING_LENGTH) },
          });
        }
        throw new FinalDeliveryOutcomeUnknownError(
          "Final delivery provider outcome is unknown after invocation",
        );
      }
      // A resolved provider call may already have delivered. Invalid receipt evidence must
      // remain unresolved so KM recovery records DELIVERY_UNKNOWN instead of a false failure.
      const receipt = {
        receiptId: boundedProviderId(result.receiptId, "receipt id"),
        messageId: boundedProviderId(result.messageId, "message id"),
      };
      return await params.km.completeDelivery({
        reservation,
        providerAttemptId,
        outcome: "SENT",
        providerReceiptId: receipt.receiptId,
        providerMessageId: receipt.messageId,
      });
    },
  };
}

export function createFinalDeliveryService(params: {
  km: FinalDeliveryKmClient;
  providers: Partial<Record<KmDeliveryTarget["provider"], FinalDeliveryProvider>>;
}): OpenClawPluginService {
  const adapter = createFinalDeliveryAdapter({
    ...params,
    owner: FINAL_DELIVERY_OWNER,
  });
  let timer: ReturnType<typeof setInterval> | undefined;
  let activeTick: Promise<void> | undefined;
  let stopped = true;

  const tick = (warn: (message: string) => void): Promise<void> | undefined => {
    if (stopped || activeTick) {
      return activeTick;
    }
    const currentTick = adapter
      .runOnce()
      .then(() => {})
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "final delivery tick failed";
        warn(
          `deliberation: final delivery tick failed: ${message.slice(0, MAX_LOOP_WARNING_LENGTH)}`,
        );
      })
      .finally(() => {
        if (activeTick === currentTick) {
          activeTick = undefined;
        }
      });
    activeTick = currentTick;
    return currentTick;
  };

  return {
    id: "deliberation-final-delivery",
    start: async ({ logger }) => {
      stopped = false;
      await tick((message) => logger.warn(message));
      if (stopped) {
        return;
      }
      timer = setInterval(() => {
        void tick((message) => logger.warn(message));
      }, FINAL_DELIVERY_POLL_INTERVAL_MS);
      timer.unref?.();
    },
    stop: async () => {
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
      await activeTick;
    },
  };
}
