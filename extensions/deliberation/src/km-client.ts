import type { OpenClawConfig } from "openclaw/plugin-sdk/plugin-entry";
import { resolveConfiguredSecretInputString } from "openclaw/plugin-sdk/secret-input-runtime";
import { z } from "zod";
import type { DeliberationConfig } from "./config.js";

export type KmControls = {
  "source-intake": boolean;
  claims: boolean;
  review: boolean;
  sender: boolean;
};

export type KmReadyItem = {
  recordId: string;
  version: number;
  text: string;
  candidateRevision: number;
  updatedAt: string;
};

export type KmReservation = {
  recordId: string;
  attemptId: string;
  ordinal: number;
  version: number;
  owner: string;
  leaseToken: string;
  leaseExpiresAt: string;
  candidateRevision: number;
  reviewedTextHash: string;
};

export type KmIntakeBody = {
  provider: string;
  providerEventId: string;
  sourceTarget: string;
  senderId: string;
  occurredAt: string;
  receivedAt: string;
  content: string;
  eventType?: "message" | "edit" | "delete";
  debounceSeconds?: number;
};

export type KmCompletionBody = {
  recordId: string;
  attemptId: string;
  owner: string;
  leaseToken: string;
  outcome: "SENT" | "NOT_SENT" | "DELIVERY_UNKNOWN";
  idempotencyKey: string;
  providerAttemptId: string;
  providerReceiptId?: string;
  providerMessageId?: string;
  proofReference?: string;
};

export type KmReconciliationBody = {
  recordId: string;
  attemptId: string;
  outcome: "SENT" | "NOT_SENT";
  idempotencyKey: string;
  proofReference: string;
  providerReceiptId?: string;
  providerMessageId?: string;
};

export type KmClient = ReturnType<typeof createKmClient>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).toSorted().join("\0") === keys.toSorted().join("\0");
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function hasRequiredKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => key in value);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`KM returned an invalid ${field}`);
  }
  return value;
}

function boundedString(value: unknown, field: string, min: number, max: number): string {
  const result = requiredString(value, field);
  if (result.length < min || result.length > max) {
    throw new Error(`KM returned an invalid ${field}`);
  }
  return result;
}

function integerAtLeast(value: unknown, field: string, minimum: number): number {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    throw new Error(`KM returned an invalid ${field}`);
  }
  return value as number;
}

function assertProtocolVersion(value: Record<string, unknown>): void {
  if (value.protocolVersion !== 1) {
    throw new Error("KM returned an unsupported protocol version");
  }
}

function isReadyCursor(value: string): boolean {
  return value.length >= 1 && value.length <= 512 && /^[A-Za-z0-9_-]+$/.test(value);
}

function parseControls(value: unknown): KmControls {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["source-intake", "claims", "review", "sender"]) ||
    typeof value["source-intake"] !== "boolean" ||
    typeof value.claims !== "boolean" ||
    typeof value.review !== "boolean" ||
    typeof value.sender !== "boolean"
  ) {
    throw new Error("KM returned invalid controls");
  }
  return {
    "source-intake": value["source-intake"],
    claims: value.claims,
    review: value.review,
    sender: value.sender,
  };
}

function parseReadyItem(value: unknown): KmReadyItem {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["recordId", "version", "text", "candidateRevision", "updatedAt"]) ||
    !Number.isInteger(value.version) ||
    (value.version as number) < 1 ||
    !Number.isInteger(value.candidateRevision) ||
    (value.candidateRevision as number) < 0
  ) {
    throw new Error("KM returned an invalid ready item");
  }
  return {
    recordId: boundedString(value.recordId, "recordId", 1, 256),
    version: value.version as number,
    text: boundedString(value.text, "text", 1, 65536),
    candidateRevision: value.candidateRevision as number,
    updatedAt: boundedString(value.updatedAt, "updatedAt", 20, 64),
  };
}

function parseReservation(value: unknown): KmReservation {
  const keys = [
    "recordId",
    "attemptId",
    "ordinal",
    "version",
    "owner",
    "leaseToken",
    "leaseExpiresAt",
    "candidateRevision",
    "reviewedTextHash",
  ];
  if (
    !isRecord(value) ||
    !hasExactKeys(value, keys) ||
    !Number.isInteger(value.ordinal) ||
    (value.ordinal as number) < 1 ||
    !Number.isInteger(value.version) ||
    (value.version as number) < 1 ||
    !Number.isInteger(value.candidateRevision) ||
    (value.candidateRevision as number) < 0
  ) {
    throw new Error("KM returned an invalid reservation");
  }
  return {
    recordId: boundedString(value.recordId, "recordId", 1, 256),
    attemptId: boundedString(value.attemptId, "attemptId", 1, 256),
    ordinal: value.ordinal as number,
    version: value.version as number,
    owner: boundedString(value.owner, "owner", 1, 256),
    leaseToken: boundedString(value.leaseToken, "leaseToken", 1, 256),
    leaseExpiresAt: boundedString(value.leaseExpiresAt, "leaseExpiresAt", 20, 64),
    candidateRevision: value.candidateRevision as number,
    reviewedTextHash: boundedString(value.reviewedTextHash, "reviewedTextHash", 64, 64),
  };
}

function parseDeliveryAttempt(value: unknown): void {
  const keys = [
    "ordinal",
    "attemptId",
    "candidateRevision",
    "reviewedTextHash",
    "reservedRecordVersion",
    "owner",
    "leaseExpiresAt",
    "completionOutcome",
    "outcome",
    "providerAttemptId",
    "providerReceiptId",
    "providerMessageId",
    "proofReference",
    "reservedAt",
    "completedAt",
    "reconciledAt",
  ];
  const nullableProviderStrings = [
    "providerAttemptId",
    "providerReceiptId",
    "providerMessageId",
    "proofReference",
  ];
  const nullableDates = ["completedAt", "reconciledAt"];
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, keys) ||
    !hasRequiredKeys(value, [
      "ordinal",
      "attemptId",
      "completionOutcome",
      "outcome",
      ...nullableProviderStrings,
      "completedAt",
    ]) ||
    !["SENT", "NOT_SENT", "DELIVERY_UNKNOWN", null].includes(
      value.completionOutcome as string | null,
    ) ||
    !["SENT", "NOT_SENT", "DELIVERY_UNKNOWN", null].includes(value.outcome as string | null)
  ) {
    throw new Error("KM returned an invalid delivery attempt");
  }
  integerAtLeast(value.ordinal, "ordinal", 1);
  boundedString(value.attemptId, "attemptId", 1, 256);
  for (const field of nullableProviderStrings) {
    if (value[field] !== null && (typeof value[field] !== "string" || value[field].length > 256)) {
      throw new Error(`KM returned an invalid ${field}`);
    }
  }
  for (const field of nullableDates) {
    if (
      field in value &&
      value[field] !== null &&
      (typeof value[field] !== "string" || value[field].length > 64)
    ) {
      throw new Error(`KM returned an invalid ${field}`);
    }
  }
  if ("candidateRevision" in value) integerAtLeast(value.candidateRevision, "candidateRevision", 0);
  if ("reviewedTextHash" in value)
    boundedString(value.reviewedTextHash, "reviewedTextHash", 64, 64);
  if ("reservedRecordVersion" in value) {
    integerAtLeast(value.reservedRecordVersion, "reservedRecordVersion", 1);
  }
  if ("owner" in value) boundedString(value.owner, "owner", 1, 256);
  if ("leaseExpiresAt" in value) boundedString(value.leaseExpiresAt, "leaseExpiresAt", 20, 64);
  if ("reservedAt" in value) boundedString(value.reservedAt, "reservedAt", 20, 64);
}

const nullableString = z.string().nullable();
const messageSchema = z
  .object({
    inboundId: z.string(),
    provider: z.string(),
    providerEventId: z.string(),
    senderId: z.string(),
    eventType: z.string(),
    occurredAt: z.string(),
    receivedAt: z.string(),
    content: z.string(),
  })
  .strict();
const leaseSchema = z
  .object({ owner: z.string(), token: z.string(), expiresAt: z.string() })
  .strict()
  .nullable();
const draftingSchema = z
  .object({
    attempt: z.number().int().optional(),
    correlationId: z.string().optional(),
    payloadPath: z.string().optional(),
    resultPath: z.string().optional(),
    outcome: nullableString.optional(),
    diagnostic: z.object({}).strict().nullable().optional(),
    blocked: z.boolean().optional(),
    result: z
      .object({ decision: z.string().optional(), draft: z.string().optional() })
      .strict()
      .nullable()
      .optional(),
    purpose: z.string().optional(),
    candidateRevision: z.number().int().optional(),
    technicalAttempt: z.number().int().optional(),
  })
  .strict()
  .nullable();
const reviewAttemptSchema = z
  .object({
    attempt: z.number().int().optional(),
    technicalAttempt: z.number().int().optional(),
    candidateRevision: z.number().int().optional(),
    correlationId: z.string().optional(),
    startedAt: z.string().optional(),
    completedAt: nullableString.optional(),
    sessionId: nullableString.optional(),
    provider: nullableString.optional(),
    model: nullableString.optional(),
    freshnessCount: z.number().int().optional(),
    freshnessHash: nullableString.optional(),
    freshnessCutoff: nullableString.optional(),
    freshnessComplete: z.boolean().optional(),
    verdict: nullableString.optional(),
    reason: nullableString.optional(),
    outcome: nullableString.optional(),
  })
  .strict();
const reviewSchema = z
  .object({
    candidateRevision: z.number().int().optional(),
    rewriteCount: z.number().int().optional(),
    attempts: z.array(reviewAttemptSchema).optional(),
  })
  .strict()
  .nullable();
const historyDetailsSchema = z
  .object({
    attemptId: z.string().optional(),
    ordinal: z.number().int().optional(),
    owner: z.string().optional(),
    outcome: z.string().optional(),
    proofReference: z.string().optional(),
  })
  .strict()
  .nullable();
const historyEntrySchema = z
  .object({
    sequence: z.number().int(),
    event: z.string(),
    fromState: nullableString,
    toState: nullableString,
    version: z.number().int(),
    occurredAt: z.string(),
    details: historyDetailsSchema,
  })
  .strict();
const recordSchema = z
  .object({
    schemaVersion: z.literal(1).optional(),
    recordId: z.string().min(1).max(256),
    inboundId: z.string().optional(),
    sourceTarget: z.string().optional(),
    messages: z.array(messageSchema).optional(),
    openedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    debounceUntil: z.string().optional(),
    effectiveDebounceSeconds: z.number().int().optional(),
    closedAt: nullableString.optional(),
    state: z.enum(["READY_TO_SEND", "SENDING", "SENT", "DELIVERY_UNKNOWN"]),
    version: z.number().int().min(1),
    duplicateCount: z.number().int().min(0).optional(),
    lease: leaseSchema.optional(),
    drafting: draftingSchema.optional(),
    review: reviewSchema.optional(),
    delivery: z.unknown(),
    candidateRevision: z.number().int().min(0).optional(),
    rewriteCount: z.number().int().min(0).optional(),
    retryStage: nullableString.optional(),
    retryDeadline: nullableString.optional(),
    terminalReason: nullableString.optional(),
    history: z.array(historyEntrySchema).optional(),
    valid: z.boolean().optional(),
    validationError: z.string().max(512).optional(),
  })
  .strict();

function parseRecordResponse(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || !hasExactKeys(value, ["protocolVersion", "record"])) {
    throw new Error("KM returned an invalid record response");
  }
  assertProtocolVersion(value);
  const record = value.record;
  if (
    !isRecord(record) ||
    !recordSchema.safeParse(record).success ||
    !isRecord(record.delivery) ||
    !hasExactKeys(record.delivery, ["attempts"]) ||
    !Array.isArray(record.delivery.attempts)
  ) {
    throw new Error("KM returned an invalid record response");
  }
  record.delivery.attempts.forEach(parseDeliveryAttempt);
  return record;
}

export function createKmClient(params: {
  config: DeliberationConfig;
  openclawConfig: OpenClawConfig;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}) {
  const fetchImpl = params.fetchImpl ?? fetch;
  const endpoint = params.config.km.endpoint.replace(/\/$/, "");

  async function request(path: string, init: RequestInit = {}): Promise<unknown> {
    const credentialResolution = await resolveConfiguredSecretInputString({
      config: params.openclawConfig,
      env: params.env ?? process.env,
      value: params.config.km.credential,
      path: "plugins.entries.deliberation.config.km.credential",
    });
    const credential = credentialResolution.value;
    if (!credential) {
      throw new Error(
        credentialResolution.unresolvedRefReason ?? "Deliberation KM credential is unavailable",
      );
    }
    const timeout = AbortSignal.timeout(params.config.km.requestTimeoutMs);
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    let response: Response;
    try {
      response = await fetchImpl(`${endpoint}${path}`, {
        ...init,
        signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${credential}`,
          "X-Deliberation-Protocol-Version": "1",
          ...(init.body === undefined ? {} : { "Content-Type": "application/json" }),
        },
      });
    } catch {
      throw new Error("KM request failed");
    }
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new Error("KM returned malformed JSON");
    }
    if (!response.ok) {
      if (response.status === 409 && isRecord(value) && value.protocolVersion === 1) {
        const error = value.error;
        if (
          isRecord(error) &&
          (error.code === "CAS_CONFLICT" || error.code === "CONTROL_DISABLED")
        ) {
          return { conflict: error.code };
        }
      }
      throw new Error(`KM request failed with status ${response.status}`);
    }
    return value;
  }

  return {
    async health(signal?: AbortSignal) {
      const value = await request("/deliberation/v1/health", { signal });
      if (
        !isRecord(value) ||
        !hasExactKeys(value, ["protocolVersion", "status", "controls"]) ||
        value.status !== "ok"
      ) {
        throw new Error("KM returned an invalid health response");
      }
      assertProtocolVersion(value);
      return {
        protocolVersion: 1 as const,
        status: "ok" as const,
        controls: parseControls(value.controls),
      };
    },
    async ready(query: { limit?: number; cursor?: string } = {}, signal?: AbortSignal) {
      if (
        (query.limit !== undefined &&
          (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100)) ||
        (query.cursor !== undefined && !isReadyCursor(query.cursor))
      ) {
        throw new Error("KM received an invalid ready query");
      }
      const search = new URLSearchParams();
      if (query.limit !== undefined) search.set("limit", String(query.limit));
      if (query.cursor !== undefined) search.set("cursor", query.cursor);
      const suffix = search.size ? `?${search}` : "";
      const value = await request(`/deliberation/v1/ready${suffix}`, { signal });
      if (
        !isRecord(value) ||
        !hasExactKeys(value, ["protocolVersion", "items", "nextCursor"]) ||
        !Array.isArray(value.items) ||
        (value.nextCursor !== null &&
          (typeof value.nextCursor !== "string" || !isReadyCursor(value.nextCursor)))
      ) {
        throw new Error("KM returned an invalid ready response");
      }
      assertProtocolVersion(value);
      return { items: value.items.map(parseReadyItem), nextCursor: value.nextCursor };
    },
    async intake(event: KmIntakeBody, signal?: AbortSignal) {
      const value = await request("/deliberation/v1/intake", {
        method: "POST",
        body: JSON.stringify(event),
        signal,
      });
      if (
        !isRecord(value) ||
        !hasExactKeys(value, ["protocolVersion", "recordId", "inboundId", "duplicate"]) ||
        typeof value.duplicate !== "boolean"
      ) {
        throw new Error("KM returned an invalid intake response");
      }
      assertProtocolVersion(value);
      return {
        recordId: requiredString(value.recordId, "recordId"),
        inboundId: requiredString(value.inboundId, "inboundId"),
        duplicate: value.duplicate,
      };
    },
    async reserve(item: KmReadyItem, owner: string, signal?: AbortSignal) {
      const value = await request("/deliberation/v1/reservations", {
        method: "POST",
        body: JSON.stringify({
          recordId: item.recordId,
          expectedVersion: item.version,
          owner,
          idempotencyKey: `reserve:${item.recordId}:${item.version}`,
          leaseSeconds: 60,
        }),
        signal,
      });
      if (isRecord(value) && value.conflict === "CAS_CONFLICT")
        return { outcome: "conflict" as const };
      if (isRecord(value) && value.conflict === "CONTROL_DISABLED")
        return { outcome: "disabled" as const };
      if (!isRecord(value) || !hasExactKeys(value, ["protocolVersion", "reservation"])) {
        throw new Error("KM returned an invalid reservation response");
      }
      assertProtocolVersion(value);
      return { outcome: "reserved" as const, reservation: parseReservation(value.reservation) };
    },
    async complete(completion: KmCompletionBody, signal?: AbortSignal) {
      return parseRecordResponse(
        await request("/deliberation/v1/completions", {
          method: "POST",
          body: JSON.stringify(completion),
          signal,
        }),
      );
    },
    async reconcile(reconciliation: KmReconciliationBody, signal?: AbortSignal) {
      return parseRecordResponse(
        await request("/deliberation/v1/reconciliations", {
          method: "POST",
          body: JSON.stringify(reconciliation),
          signal,
        }),
      );
    },
  };
}
