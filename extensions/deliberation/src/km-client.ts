import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isDeepStrictEqual } from "node:util";
import type { OpenClawConfig } from "openclaw/plugin-sdk/plugin-entry";
import { resolveConfiguredSecretInputString } from "openclaw/plugin-sdk/secret-input-runtime";
import { z } from "zod";
import type { DeliberationConfig } from "./config.js";
import type { KmDeliveryTarget } from "./delivery-target.js";
import { parseSourceIdentity } from "./source-identity.js";

type KmDeliveryEnvelope = Record<string, unknown> & {
  sourceTarget: string;
  deliveryTarget: KmWireDeliveryTarget;
};

export type KmWireDeliveryTarget = {
  provider: string;
  account: string;
  channel: string;
  threadId?: string;
};

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
  deliveryEnvelope: KmDeliveryEnvelope;
  effectiveDeliveryTarget: KmWireDeliveryTarget;
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
  deliveryEnvelope: KmDeliveryEnvelope;
  deliveryEnvelopeDigest: string;
  reserveIdempotencyKey: string;
};

export type KmIntakeBody = {
  provider: string;
  providerEventId: string;
  sourceTarget: string;
  sourceThreadId: string;
  senderId: string;
  occurredAt: string;
  receivedAt: string;
  content: string;
  eventType?: "message" | "edit" | "delete";
};

export type KmClient = ReturnType<typeof createKmClient>;

export type KmRequestStage =
  | "credential"
  | "transport"
  | "response-json"
  | "http"
  | "response-schema";

const KM_ERROR_CODES = [
  "SCHEMA_INVALID",
  "AUTH_MISSING",
  "AUTH_INVALID",
  "ROUTE_NOT_FOUND",
  "RECORD_NOT_FOUND",
  "MEDIA_TYPE_INVALID",
  "CAS_CONFLICT",
  "CONTROL_DISABLED",
  "VERSION_UNSUPPORTED",
] as const;

type KmErrorCode = (typeof KM_ERROR_CODES)[number] | "UNKNOWN";

export class KmRequestError extends Error {
  override readonly name = "KmRequestError";

  constructor(
    readonly stage: KmRequestStage,
    readonly status?: number,
    readonly code: KmErrorCode = "UNKNOWN",
    message = "KM request failed",
  ) {
    super(message);
  }
}

type KmResponse = { value: unknown; status: number };

function canonicalErrorCode(value: unknown): KmErrorCode {
  return typeof value === "string" && KM_ERROR_CODES.includes(value as never)
    ? (value as KmErrorCode)
    : "UNKNOWN";
}

function parseResponse<T>(response: KmResponse, parse: (value: unknown) => T): T {
  try {
    return parse(response.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : "KM returned an invalid response";
    throw new KmRequestError("response-schema", response.status, "UNKNOWN", message);
  }
}

function nodeFetch(input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  const request = url.protocol === "http:" ? httpRequest : httpsRequest;
  const canonicalNames: Record<string, string> = {
    accept: "Accept",
    authorization: "Authorization",
    "content-type": "Content-Type",
    "x-deliberation-protocol-version": "X-Deliberation-Protocol-Version",
  };
  const headers = Object.fromEntries(
    Array.from(new Headers(init.headers).entries(), ([name, value]) => [
      canonicalNames[name] ?? name,
      value,
    ]),
  );
  const body = init.body;
  if (body !== undefined && body !== null && typeof body !== "string") {
    return Promise.reject(new Error("KM Node transport requires a string body"));
  }
  if (typeof body === "string") {
    headers["Content-Length"] = String(Buffer.byteLength(body));
  }

  return new Promise((resolve, reject) => {
    const outgoing = request(
      url,
      {
        method: init.method,
        headers,
        signal: init.signal ?? undefined,
      },
      (incoming) => {
        const chunks: Buffer[] = [];
        incoming.on("data", (chunk: Buffer) => chunks.push(chunk));
        incoming.on("error", reject);
        incoming.on("end", () => {
          const responseHeaders = new Headers();
          for (const [name, value] of Object.entries(incoming.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) {
                responseHeaders.append(name, item);
              }
            } else if (value !== undefined) {
              responseHeaders.set(name, value);
            }
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: incoming.statusCode ?? 500,
              headers: responseHeaders,
            }),
          );
        });
      },
    );
    outgoing.on("error", reject);
    outgoing.end(body);
  });
}

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

const DESTINATION_COMPONENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/;

export function parseWireDeliveryTarget(value: unknown, field: string): KmWireDeliveryTarget {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, ["provider", "account", "channel", "threadId"]) ||
    !hasRequiredKeys(value, ["provider", "account", "channel"]) ||
    typeof value.provider !== "string" ||
    !DESTINATION_COMPONENT_PATTERN.test(value.provider) ||
    typeof value.account !== "string" ||
    !DESTINATION_COMPONENT_PATTERN.test(value.account) ||
    typeof value.channel !== "string" ||
    !DESTINATION_COMPONENT_PATTERN.test(value.channel) ||
    (value.threadId !== undefined &&
      (typeof value.threadId !== "string" || !DESTINATION_COMPONENT_PATTERN.test(value.threadId)))
  ) {
    throw new Error(`KM returned an invalid ${field}`);
  }
  return value as KmWireDeliveryTarget;
}

function configuredTargetToWire(target: KmDeliveryTarget): KmWireDeliveryTarget {
  return {
    provider: target.provider,
    account: target.accountId,
    channel: target.channelId,
    ...(target.threadId === undefined ? {} : { threadId: target.threadId }),
  };
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
    !hasExactKeys(value, [
      "recordId",
      "version",
      "text",
      "candidateRevision",
      "updatedAt",
      "deliveryEnvelope",
    ]) ||
    !Number.isInteger(value.version) ||
    (value.version as number) < 1 ||
    !Number.isInteger(value.candidateRevision) ||
    (value.candidateRevision as number) < 0
  ) {
    throw new Error("KM returned an invalid ready item");
  }
  const recordId = boundedString(value.recordId, "recordId", 1, 256);
  const deliveryEnvelope = parseDeliveryEnvelope(value.deliveryEnvelope);
  if (
    deliveryEnvelope.recordId !== recordId ||
    deliveryEnvelope.candidateRevision !== value.candidateRevision
  ) {
    throw new Error("KM returned a ready envelope for a different record");
  }
  return {
    recordId,
    version: value.version as number,
    text: boundedString(value.text, "text", 1, 65536),
    candidateRevision: value.candidateRevision as number,
    updatedAt: boundedString(value.updatedAt, "updatedAt", 20, 64),
    deliveryEnvelope,
    effectiveDeliveryTarget: deliveryEnvelope.deliveryTarget,
  };
}

function parseDeliveryEnvelope(value: unknown): KmDeliveryEnvelope {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "schemaVersion",
      "sourceTarget",
      "deliveryTarget",
      "recordId",
      "inboundId",
      "draftAttempt",
      "draftCorrelationId",
      "reviewAttempt",
      "reviewCorrelationId",
      "candidateRevision",
      "reviewedTextHash",
    ]) ||
    value.schemaVersion !== 1
  ) {
    throw new Error("KM returned an invalid deliveryEnvelope");
  }
  const sourceTarget = boundedString(value.sourceTarget, "deliveryEnvelope.sourceTarget", 8, 229);
  if (!parseSourceIdentity(sourceTarget)) {
    throw new Error("KM returned an invalid deliveryEnvelope.sourceTarget");
  }
  parseWireDeliveryTarget(value.deliveryTarget, "deliveryEnvelope.deliveryTarget");
  boundedString(value.recordId, "deliveryEnvelope.recordId", 1, 256);
  boundedString(value.inboundId, "deliveryEnvelope.inboundId", 1, 256);
  integerAtLeast(value.draftAttempt, "deliveryEnvelope.draftAttempt", 1);
  boundedString(value.draftCorrelationId, "deliveryEnvelope.draftCorrelationId", 1, 256);
  integerAtLeast(value.reviewAttempt, "deliveryEnvelope.reviewAttempt", 1);
  boundedString(value.reviewCorrelationId, "deliveryEnvelope.reviewCorrelationId", 1, 256);
  integerAtLeast(value.candidateRevision, "deliveryEnvelope.candidateRevision", 0);
  boundedString(value.reviewedTextHash, "deliveryEnvelope.reviewedTextHash", 64, 64);
  return value as KmDeliveryEnvelope;
}

function parseReservation(value: unknown): Omit<KmReservation, "reserveIdempotencyKey"> {
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
    "deliveryEnvelope",
    "deliveryEnvelopeDigest",
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
  const recordId = boundedString(value.recordId, "recordId", 1, 256);
  const reviewedTextHash = boundedString(value.reviewedTextHash, "reviewedTextHash", 64, 64);
  const deliveryEnvelope = parseDeliveryEnvelope(value.deliveryEnvelope);
  if (
    deliveryEnvelope.recordId !== recordId ||
    deliveryEnvelope.candidateRevision !== value.candidateRevision ||
    deliveryEnvelope.reviewedTextHash !== reviewedTextHash
  ) {
    throw new Error("KM returned a reservation envelope for a different record");
  }
  return {
    recordId,
    attemptId: boundedString(value.attemptId, "attemptId", 1, 256),
    ordinal: value.ordinal as number,
    version: value.version as number,
    owner: boundedString(value.owner, "owner", 1, 256),
    leaseToken: boundedString(value.leaseToken, "leaseToken", 1, 256),
    leaseExpiresAt: boundedString(value.leaseExpiresAt, "leaseExpiresAt", 20, 64),
    candidateRevision: value.candidateRevision as number,
    reviewedTextHash,
    deliveryEnvelope,
    deliveryEnvelopeDigest: boundedString(
      value.deliveryEnvelopeDigest,
      "deliveryEnvelopeDigest",
      64,
      64,
    ),
  };
}

function parseDeliveryAttempt(value: unknown, expectedRecordId: string): void {
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
    "deliveryEnvelope",
    "deliveryEnvelopeDigest",
    "reserveIdempotencyKey",
    "invocationIdempotencyKey",
    "completionIdempotencyKey",
    "invokedAt",
    "attemptedTarget",
    "providerFailureClass",
    "providerEvidence",
    "terminalReason",
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
      "deliveryEnvelope",
      "deliveryEnvelopeDigest",
      "reserveIdempotencyKey",
    ]) ||
    !["SENT", "FAILED", "RESERVATION_ABANDONED", "NOT_SENT", "DELIVERY_UNKNOWN", null].includes(
      value.completionOutcome as string | null,
    ) ||
    !["SENT", "FAILED", "RESERVATION_ABANDONED", "NOT_SENT", "DELIVERY_UNKNOWN", null].includes(
      value.outcome as string | null,
    )
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
  const envelope =
    value.deliveryEnvelope === null ? undefined : parseDeliveryEnvelope(value.deliveryEnvelope);
  if (envelope && envelope.recordId !== expectedRecordId) {
    throw new Error("KM returned a delivery attempt envelope for a different record");
  }
  if (value.deliveryEnvelopeDigest !== null) {
    boundedString(value.deliveryEnvelopeDigest, "deliveryEnvelopeDigest", 64, 64);
  }
  boundedString(value.reserveIdempotencyKey, "reserveIdempotencyKey", 1, 256);
  const outcome = value.outcome as
    | "SENT"
    | "FAILED"
    | "RESERVATION_ABANDONED"
    | "NOT_SENT"
    | "DELIVERY_UNKNOWN"
    | null;
  const retainedOutcome =
    outcome === "RESERVATION_ABANDONED" || outcome === "NOT_SENT" || outcome === "DELIVERY_UNKNOWN";
  if (
    !retainedOutcome &&
    !hasRequiredKeys(value, [
      "candidateRevision",
      "reviewedTextHash",
      "reservedRecordVersion",
      "owner",
      "leaseExpiresAt",
      "reservedAt",
    ])
  ) {
    throw new Error("KM returned an incomplete live delivery attempt");
  }
  if (
    "providerFailureClass" in value &&
    !["permission", "rejection", "rate_limit", "transport", "timeout", null].includes(
      value.providerFailureClass as string | null,
    )
  ) {
    throw new Error("KM returned an invalid providerFailureClass");
  }
  if (
    "providerEvidence" in value &&
    value.providerEvidence !== null &&
    !providerEvidenceSchema.safeParse(value.providerEvidence).success
  ) {
    throw new Error("KM returned invalid provider evidence");
  }
  if (
    "terminalReason" in value &&
    ![
      "delivery_sent",
      "delivery_failed",
      "delivery_outcome_unknown",
      "reservation_abandoned",
      null,
    ].includes(value.terminalReason as string | null)
  ) {
    throw new Error("KM returned an invalid terminalReason");
  }
  if (value.completionOutcome !== outcome) {
    throw new Error("KM returned inconsistent delivery outcomes");
  }
  if (outcome === null && (!envelope || value.deliveryEnvelopeDigest === null)) {
    throw new Error("KM returned an active delivery attempt without durable envelope evidence");
  }
  if (outcome === null) {
    if (value.invokedAt !== null && value.invokedAt !== undefined) {
      boundedString(value.invokedAt, "invokedAt", 20, 64);
      boundedString(value.invocationIdempotencyKey, "invocationIdempotencyKey", 1, 256);
      boundedString(value.providerAttemptId, "providerAttemptId", 1, 256);
      if (!isDeepStrictEqual(value.attemptedTarget, envelope?.deliveryTarget)) {
        throw new Error("KM returned an active delivery attempt with mismatched target evidence");
      }
    } else if (
      [value.attemptedTarget, value.invocationIdempotencyKey, value.providerAttemptId].some(
        (item) => item !== null && item !== undefined,
      )
    ) {
      throw new Error("KM returned an incomplete active invocation marker");
    }
  }
  if (outcome === "SENT" || outcome === "FAILED") {
    if (!envelope || value.deliveryEnvelopeDigest === null || value.completedAt === null) {
      throw new Error("KM returned terminal delivery without durable envelope evidence");
    }
    const attemptedTarget = parseWireDeliveryTarget(value.attemptedTarget, "attemptedTarget");
    if (!isDeepStrictEqual(attemptedTarget, envelope.deliveryTarget)) {
      throw new Error("KM returned terminal delivery with mismatched target evidence");
    }
    boundedString(value.invocationIdempotencyKey, "invocationIdempotencyKey", 1, 256);
    boundedString(value.completionIdempotencyKey, "completionIdempotencyKey", 1, 256);
    boundedString(value.invokedAt, "invokedAt", 20, 64);
    boundedString(value.providerAttemptId, "providerAttemptId", 1, 256);
    const expectedTerminalReason = outcome === "SENT" ? "delivery_sent" : "delivery_failed";
    if (value.terminalReason !== expectedTerminalReason) {
      throw new Error("KM returned a terminal reason that contradicts the delivery outcome");
    }
    if (outcome === "SENT") {
      boundedString(value.providerReceiptId, "providerReceiptId", 1, 256);
      boundedString(value.providerMessageId, "providerMessageId", 1, 256);
    } else if (
      !["permission", "rejection", "rate_limit", "transport", "timeout"].includes(
        value.providerFailureClass as string,
      ) ||
      !providerEvidenceSchema.safeParse(value.providerEvidence).success
    ) {
      throw new Error("KM returned terminal failure without provider evidence");
    }
  }
  if ("candidateRevision" in value) {
    integerAtLeast(value.candidateRevision, "candidateRevision", 0);
  }
  if ("reviewedTextHash" in value) {
    boundedString(value.reviewedTextHash, "reviewedTextHash", 64, 64);
  }
  if ("reservedRecordVersion" in value) {
    integerAtLeast(value.reservedRecordVersion, "reservedRecordVersion", 1);
  }
  if ("owner" in value) {
    boundedString(value.owner, "owner", 1, 256);
  }
  if ("leaseExpiresAt" in value) {
    boundedString(value.leaseExpiresAt, "leaseExpiresAt", 20, 64);
  }
  if ("reservedAt" in value) {
    boundedString(value.reservedAt, "reservedAt", 20, 64);
  }
  if (
    envelope &&
    (("candidateRevision" in value && value.candidateRevision !== envelope.candidateRevision) ||
      ("reviewedTextHash" in value && value.reviewedTextHash !== envelope.reviewedTextHash))
  ) {
    throw new Error("KM returned delivery attempt evidence for a different reviewed candidate");
  }
}

const nullableString = z.string().nullable();
const providerEvidenceSchema = z
  .object({
    code: z.string().optional(),
    status: z.number().int().optional(),
    retryAfterSeconds: z.number().int().optional(),
    detail: z.string().optional(),
  })
  .strict();
const listenerModuleSchema = z.union([
  z.object({ status: z.literal("ok"), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).strict(),
  z.object({ status: z.literal("unavailable"), sha256: z.null() }).strict(),
]);
const healthMetadataSchema = z
  .object({
    listener: z
      .object({
        protocolVersion: z.literal(1),
        startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/),
        sourceIdentity: z
          .object({
            status: z.enum(["ok", "unavailable"]),
            modules: z
              .object({
                "lib/deliberation_source_identity.py": listenerModuleSchema,
                "lib/deliberation_wire.py": listenerModuleSchema,
                "lib/deliberation_spool_contracts.py": listenerModuleSchema,
              })
              .strict(),
          })
          .strict(),
      })
      .strict(),
    runner: z
      .object({
        owner: z.literal("deliberation-v2-cron"),
        buildId: z.literal("deliberation-v2-runtime-v1"),
        installation: z
          .object({
            status: z.enum(["ok", "missing", "drift", "duplicate", "unknown"]),
            candidateCount: z.number().int().min(0).max(100),
            liveId: z.string().max(128).optional(),
            drift: z.array(z.string().max(64)).max(16).optional(),
            code: z.string().max(64).optional(),
          })
          .strict(),
      })
      .strict(),
    runtime: z
      .object({
        queueCounts: z
          .object({
            dueClosure: z.number().int().min(0),
            readyDraft: z.number().int().min(0),
            processingPending: z.number().int().min(0),
            reviewReady: z.number().int().min(0),
            retry: z.number().int().min(0),
            readyToSend: z.number().int().min(0),
            deliveryInFlight: z.number().int().min(0),
          })
          .strict(),
        oldestReadyAgeSeconds: z.number().int().min(0).nullable(),
        activeSlot: z
          .object({
            recordId: z.string().max(128),
            correlationId: z.string().max(128),
            phase: z.string().max(32),
            acknowledgedAt: nullableString,
            resultDeadline: nullableString,
            ageSeconds: z.number().int().min(0),
            deadlineInSeconds: z.number().int().nullable(),
          })
          .strict()
          .nullable(),
        timeoutCount: z.number().int().min(0),
        lateResultCount: z.number().int().min(0),
        lastPass: z
          .object({
            schemaVersion: z.literal(1),
            startedAt: z.string(),
            completedAt: z.string(),
            durationMs: z.number().int().min(0).max(90_000),
            owner: z.string().max(128),
            buildId: z.string().max(64),
            phases: z
              .object({
                reconciled: z.number().int().min(0),
                closed: z.number().int().min(0),
                selected: z.number().int().min(0).max(1),
              })
              .strict(),
            transition: z
              .object({
                recordId: z.string().max(128),
                state: z.string().max(64),
                code: z.string().max(64),
              })
              .strict()
              .nullable(),
            hasMore: z.boolean(),
            stopReason: z.enum([
              "idle",
              "completed",
              "processing_pending",
              "reconciliation_budget",
              "closure_budget",
              "selection_budget",
              "monotonic_guard",
            ]),
          })
          .strict()
          .nullable(),
      })
      .strict(),
  })
  .strict();
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
    diagnostic: z
      .object({ code: z.string().min(1).max(64), message: z.string().min(1).max(512) })
      .strict()
      .nullable()
      .optional(),
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
    sourceThreadId: z.string().min(1).max(96).optional(),
    messages: z.array(messageSchema).optional(),
    openedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    debounceUntil: z.string().optional(),
    effectiveDebounceSeconds: z.number().int().optional(),
    closedAt: nullableString.optional(),
    state: z.enum(["READY_TO_SEND", "SENDING", "SENT", "FAILED", "DELIVERY_UNKNOWN"]),
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
    terminalReason: z.string().max(512).nullable().optional(),
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
  const recordId = boundedString(record.recordId, "recordId", 1, 256);
  record.delivery.attempts.forEach((attempt) => parseDeliveryAttempt(attempt, recordId));
  return record;
}

export function createKmClient(params: {
  config: DeliberationConfig;
  openclawConfig: OpenClawConfig;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}) {
  // Node fetch injects Accept-Language, which is outside KM's closed transport-header contract.
  const fetchImpl = params.fetchImpl ?? (nodeFetch as typeof fetch);
  const endpoint = params.config.km.endpoint.replace(/\/$/, "");
  const configuredDeliveryTarget = params.config.deliveryTarget
    ? configuredTargetToWire(params.config.deliveryTarget)
    : undefined;

  async function request(path: string, init: RequestInit = {}): Promise<KmResponse> {
    let credentialResolution;
    try {
      credentialResolution = await resolveConfiguredSecretInputString({
        config: params.openclawConfig,
        env: params.env ?? process.env,
        value: params.config.km.credential,
        path: "plugins.entries.deliberation.config.km.credential",
      });
    } catch {
      throw new KmRequestError("credential");
    }
    const credential = credentialResolution.value;
    if (!credential) {
      throw new KmRequestError("credential");
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
      throw new KmRequestError("transport");
    }
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new KmRequestError("response-json", response.status);
    }
    if (!response.ok) {
      if (response.status === 409 && isRecord(value) && value.protocolVersion === 1) {
        const error = value.error;
        if (
          isRecord(error) &&
          (error.code === "CAS_CONFLICT" || error.code === "CONTROL_DISABLED")
        ) {
          return { value: { conflict: error.code }, status: response.status };
        }
      }
      const error = isRecord(value) && isRecord(value.error) ? value.error : undefined;
      throw new KmRequestError("http", response.status, canonicalErrorCode(error?.code));
    }
    return { value, status: response.status };
  }

  return {
    async health(signal?: AbortSignal) {
      return parseResponse(await request("/deliberation/v1/health", { signal }), (value) => {
        if (
          !isRecord(value) ||
          !hasExactKeys(value, [
            "protocolVersion",
            "status",
            "listener",
            "controls",
            "runner",
            "runtime",
          ]) ||
          (value.status !== "ok" && value.status !== "degraded") ||
          !isRecord(value.listener) ||
          !isRecord(value.runner) ||
          !isRecord(value.runtime) ||
          !healthMetadataSchema.safeParse({
            listener: value.listener,
            runner: value.runner,
            runtime: value.runtime,
          }).success
        ) {
          throw new Error("KM returned an invalid health response");
        }
        assertProtocolVersion(value);
        return {
          protocolVersion: 1 as const,
          status: value.status,
          controls: parseControls(value.controls),
          listener: value.listener,
          runner: value.runner,
          runtime: value.runtime,
        };
      });
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
      if (query.limit !== undefined) {
        search.set("limit", String(query.limit));
      }
      if (query.cursor !== undefined) {
        search.set("cursor", query.cursor);
      }
      const suffix = search.size ? `?${search}` : "";
      return parseResponse(
        await request(`/deliberation/v1/ready${suffix}`, { signal }),
        (value) => {
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
          return {
            items: value.items.map((readyItem) => {
              const item = parseReadyItem(readyItem);
              return {
                ...item,
                effectiveDeliveryTarget: configuredDeliveryTarget ?? item.effectiveDeliveryTarget,
              };
            }),
            nextCursor: value.nextCursor,
          };
        },
      );
    },
    async intake(event: KmIntakeBody, signal?: AbortSignal) {
      if ("deliveryTarget" in event) {
        throw new Error("KM intake deliveryTarget is operator-controlled");
      }
      if ("debounceSeconds" in event) {
        throw new Error("KM intake does not accept debounceSeconds overrides");
      }
      const response = await request("/deliberation/v1/intake", {
        method: "POST",
        body: JSON.stringify(event),
        signal,
      });
      return parseResponse(response, (value) => {
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
      });
    },
    async reserve(item: KmReadyItem, owner: string, signal?: AbortSignal) {
      const reserveIdempotencyKey = `reserve:${item.recordId}:${item.version}`;
      const response = await request("/deliberation/v1/reservations", {
        method: "POST",
        body: JSON.stringify({
          recordId: item.recordId,
          expectedVersion: item.version,
          owner,
          idempotencyKey: reserveIdempotencyKey,
          ...(configuredDeliveryTarget ? { deliveryTarget: configuredDeliveryTarget } : {}),
          leaseSeconds: 60,
        }),
        signal,
      });
      const value = response.value;
      if (isRecord(value) && value.conflict === "CAS_CONFLICT") {
        return { outcome: "conflict" as const };
      }
      if (isRecord(value) && value.conflict === "CONTROL_DISABLED") {
        return { outcome: "disabled" as const };
      }
      return parseResponse(response, (responseValue) => {
        if (
          !isRecord(responseValue) ||
          !hasExactKeys(responseValue, ["protocolVersion", "reservation"])
        ) {
          throw new Error("KM returned an invalid reservation response");
        }
        assertProtocolVersion(responseValue);
        const reservation = parseReservation(responseValue.reservation);
        const { deliveryTarget: readyTarget, ...readyProvenance } = item.deliveryEnvelope;
        const { deliveryTarget: reservedTarget, ...reservedProvenance } =
          reservation.deliveryEnvelope;
        const expectedTarget = configuredDeliveryTarget ?? readyTarget;
        if (
          reservation.recordId !== item.recordId ||
          reservation.owner !== owner ||
          reservation.version !== item.version + 1 ||
          !isDeepStrictEqual(reservedProvenance, readyProvenance) ||
          !isDeepStrictEqual(reservedTarget, expectedTarget)
        ) {
          throw new Error("KM returned a reservation that differs from the request");
        }
        return {
          outcome: "reserved" as const,
          reservation: { ...reservation, reserveIdempotencyKey },
        };
      });
    },
    async invoke(
      reservation: KmReservation,
      attemptedTarget: KmWireDeliveryTarget,
      providerAttemptId: string,
      signal?: AbortSignal,
    ) {
      return parseResponse(
        await request("/deliberation/v1/invocations", {
          method: "POST",
          body: JSON.stringify({
            recordId: reservation.recordId,
            attemptId: reservation.attemptId,
            owner: reservation.owner,
            leaseToken: reservation.leaseToken,
            deliveryEnvelope: reservation.deliveryEnvelope,
            deliveryEnvelopeDigest: reservation.deliveryEnvelopeDigest,
            attemptedTarget,
            idempotencyKey: `invoke:${reservation.attemptId}`,
            providerAttemptId,
          }),
          signal,
        }),
        (value) => {
          if (
            !isRecord(value) ||
            !hasExactKeys(value, ["protocolVersion", "invocation"]) ||
            !isRecord(value.invocation) ||
            !hasExactKeys(value.invocation, [
              "recordId",
              "attemptId",
              "deliveryEnvelope",
              "attemptedTarget",
              "invocationIdempotencyKey",
              "providerAttemptId",
              "invokedAt",
            ])
          ) {
            throw new Error("KM returned an invalid invocation response");
          }
          assertProtocolVersion(value);
          const invocation = value.invocation;
          const envelope = parseDeliveryEnvelope(invocation.deliveryEnvelope);
          const invocationTarget = parseWireDeliveryTarget(
            invocation.attemptedTarget,
            "attemptedTarget",
          );
          const invocationKey = boundedString(
            invocation.invocationIdempotencyKey,
            "invocationIdempotencyKey",
            1,
            256,
          );
          if (
            boundedString(invocation.recordId, "recordId", 1, 256) !== reservation.recordId ||
            boundedString(invocation.attemptId, "attemptId", 1, 256) !== reservation.attemptId ||
            !isDeepStrictEqual(invocationTarget, attemptedTarget) ||
            !isDeepStrictEqual(invocationTarget, envelope.deliveryTarget) ||
            !isDeepStrictEqual(envelope, reservation.deliveryEnvelope) ||
            invocationKey !== `invoke:${reservation.attemptId}` ||
            boundedString(invocation.providerAttemptId, "providerAttemptId", 1, 256) !==
              providerAttemptId
          ) {
            throw new Error("KM returned mismatched invocation evidence");
          }
          boundedString(invocation.invokedAt, "invokedAt", 20, 64);
          return invocation;
        },
      );
    },
    async completeDelivery(
      delivery: {
        reservation: KmReservation;
        attemptedTarget: KmWireDeliveryTarget;
        providerAttemptId: string;
        outcome: "SENT" | "FAILED";
        providerReceiptId?: string;
        providerMessageId?: string;
        providerFailureClass?: string;
        providerEvidence?: Record<string, string | number>;
      },
      signal?: AbortSignal,
    ) {
      const { reservation } = delivery;
      const record = parseResponse(
        await request("/deliberation/v1/completions", {
          method: "POST",
          body: JSON.stringify({
            recordId: reservation.recordId,
            attemptId: reservation.attemptId,
            owner: reservation.owner,
            leaseToken: reservation.leaseToken,
            deliveryEnvelope: reservation.deliveryEnvelope,
            deliveryEnvelopeDigest: reservation.deliveryEnvelopeDigest,
            attemptedTarget: delivery.attemptedTarget,
            invocationIdempotencyKey: `invoke:${reservation.attemptId}`,
            outcome: delivery.outcome,
            idempotencyKey: `complete:${reservation.attemptId}`,
            providerAttemptId: delivery.providerAttemptId,
            ...(delivery.providerReceiptId
              ? { providerReceiptId: delivery.providerReceiptId }
              : {}),
            ...(delivery.providerMessageId
              ? { providerMessageId: delivery.providerMessageId }
              : {}),
            ...(delivery.providerFailureClass
              ? { providerFailureClass: delivery.providerFailureClass }
              : {}),
            ...(delivery.providerEvidence ? { providerEvidence: delivery.providerEvidence } : {}),
          }),
          signal,
        }),
        parseRecordResponse,
      );
      const attempts = (record.delivery as { attempts: Array<Record<string, unknown>> }).attempts;
      const attempt = attempts.find((item) => item.attemptId === reservation.attemptId);
      const expectedCompletionKey = `complete:${reservation.attemptId}`;
      if (
        record.recordId !== reservation.recordId ||
        record.state !== delivery.outcome ||
        !attempt ||
        attempt.outcome !== delivery.outcome ||
        attempt.completionOutcome !== delivery.outcome ||
        !isDeepStrictEqual(attempt.deliveryEnvelope, reservation.deliveryEnvelope) ||
        attempt.deliveryEnvelopeDigest !== reservation.deliveryEnvelopeDigest ||
        !isDeepStrictEqual(attempt.attemptedTarget, delivery.attemptedTarget) ||
        attempt.providerAttemptId !== delivery.providerAttemptId ||
        attempt.owner !== reservation.owner ||
        attempt.leaseExpiresAt !== reservation.leaseExpiresAt ||
        attempt.candidateRevision !== reservation.candidateRevision ||
        attempt.reviewedTextHash !== reservation.reviewedTextHash ||
        attempt.reserveIdempotencyKey !== reservation.reserveIdempotencyKey ||
        attempt.invocationIdempotencyKey !== `invoke:${reservation.attemptId}` ||
        attempt.completionIdempotencyKey !== expectedCompletionKey
      ) {
        throw new Error("KM returned mismatched completion evidence");
      }
      if (
        delivery.outcome === "SENT" &&
        (attempt.providerReceiptId !== delivery.providerReceiptId ||
          attempt.providerMessageId !== delivery.providerMessageId)
      ) {
        throw new Error("KM returned mismatched provider receipt evidence");
      }
      if (
        delivery.outcome === "FAILED" &&
        (attempt.providerFailureClass !== delivery.providerFailureClass ||
          !isDeepStrictEqual(attempt.providerEvidence, delivery.providerEvidence))
      ) {
        throw new Error("KM returned mismatched provider failure evidence");
      }
      return record;
    },
  };
}
