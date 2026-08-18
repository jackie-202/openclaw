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

export type FinalDeliveryProvider = {
  send(
    params: KmDeliveryTarget & {
      text: string;
      idempotencyKey: string;
    },
  ): Promise<{ receiptId: string; messageId: string }>;
};

export class FinalDeliveryOutcomeUnknownError extends Error {
  override readonly name = "FinalDeliveryOutcomeUnknownError";
}

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
    attemptedTarget: KmWireDeliveryTarget,
    providerAttemptId: string,
  ): Promise<unknown>;
  completeDelivery(params: {
    reservation: KmReservation;
    attemptedTarget: KmWireDeliveryTarget;
    providerAttemptId: string;
    outcome: "SENT" | "FAILED";
    providerReceiptId?: string;
    providerMessageId?: string;
    providerFailureClass?: string;
    providerEvidence?: Record<string, string | number>;
  }): Promise<Record<string, unknown>>;
};

type ProviderFailureClass = "permission" | "rejection" | "rate_limit" | "transport" | "timeout";

function providerTarget(target: KmWireDeliveryTarget): KmDeliveryTarget {
  return parseKmDeliveryTarget({
    provider: target.provider,
    accountId: target.account,
    channelId: target.channel,
    ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
  });
}

const SLACK_PERMISSION_ERRORS = new Set([
  "account_inactive",
  "invalid_auth",
  "missing_scope",
  "no_permission",
  "not_authed",
  "not_in_channel",
  "token_revoked",
]);
const TRANSPORT_ERROR_CODES = new Set([
  "EAI_AGAIN",
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENETUNREACH",
  "ENOTFOUND",
  "EPIPE",
]);
const TIMEOUT_ERROR_CODES = new Set(["ETIMEDOUT", "ESOCKETTIMEDOUT"]);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function boundedErrorCode(value: unknown): string | undefined {
  return typeof value === "string" && /^[A-Za-z0-9._~-]{1,256}$/.test(value) ? value : undefined;
}

function boundedProviderId(value: string, field: string): string {
  if (value.length < 1 || value.length > 256) {
    throw new Error(`provider returned an invalid ${field}`);
  }
  return value;
}

function providerFailure(error: unknown): {
  failureClass: ProviderFailureClass;
  evidence: Record<string, string | number>;
} {
  const candidate = asRecord(error) ?? {};
  const data = asRecord(candidate.data);
  const original = asRecord(candidate.original);
  const statusValue = candidate.status ?? candidate.statusCode;
  const status =
    typeof statusValue === "number" && Number.isInteger(statusValue) ? statusValue : undefined;
  const platformCode = boundedErrorCode(data?.error);
  const sdkCode = boundedErrorCode(candidate.code);
  const nestedCode = boundedErrorCode(original?.code);
  const code = platformCode ?? nestedCode ?? sdkCode;
  // Slack's SDK emits this plain error after exhausting a non-rejecting 429 attempt.
  const exhaustedRateLimit =
    error instanceof Error
      ? /^A rate limit was exceeded \(url: .+, retry-after: (\d+)\)$/.exec(error.message)
      : undefined;
  const retryAfter =
    candidate.retryAfter ?? (exhaustedRateLimit ? Number(exhaustedRateLimit[1]) : undefined);
  const retryAfterSeconds =
    typeof retryAfter === "number" && Number.isFinite(retryAfter) && retryAfter >= 0
      ? Math.ceil(retryAfter)
      : undefined;
  const detail = code ? `provider failed (${code})` : "provider failed";
  const evidence = {
    ...(code ? { code } : {}),
    ...(status === undefined ? {} : { status }),
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
    detail,
  };
  if (
    (error instanceof Error && error.name === "TimeoutError") ||
    (code !== undefined && TIMEOUT_ERROR_CODES.has(code))
  ) {
    return { failureClass: "timeout", evidence };
  }
  if (
    candidate.kind === "missing-permissions" ||
    status === 401 ||
    status === 403 ||
    (platformCode !== undefined && SLACK_PERMISSION_ERRORS.has(platformCode))
  ) {
    return { failureClass: "permission", evidence };
  }
  if (status === 429 || sdkCode === "slack_webapi_rate_limited_error" || exhaustedRateLimit) {
    return { failureClass: "rate_limit", evidence };
  }
  if (
    (status !== undefined && status >= 500) ||
    (code !== undefined && TRANSPORT_ERROR_CODES.has(code))
  ) {
    return { failureClass: "transport", evidence };
  }
  return { failureClass: "rejection", evidence };
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
      const targetForProvider = providerTarget(readyTarget);
      const provider = params.providers[targetForProvider.provider];
      if (!provider) {
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
      const providerAttemptId = `provider:${reservation.attemptId}`;
      await params.km.invoke(reservation, attemptedTarget, providerAttemptId);

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
        const failure = providerFailure(error);
        return await params.km.completeDelivery({
          reservation,
          attemptedTarget,
          providerAttemptId,
          outcome: "FAILED",
          providerFailureClass: failure.failureClass,
          providerEvidence: failure.evidence,
        });
      }
      // A resolved provider call may already have delivered. Invalid receipt evidence must
      // remain unresolved so KM recovery records DELIVERY_UNKNOWN instead of a false failure.
      const receipt = {
        receiptId: boundedProviderId(result.receiptId, "receipt id"),
        messageId: boundedProviderId(result.messageId, "message id"),
      };
      return await params.km.completeDelivery({
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
