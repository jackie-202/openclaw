# Bounded Completion/Receipt Evidence: calm-crag-0993

## Scope

This artifact exposes only the preserved completion/receipt runtime and focused regression hunks. Pipeline routing, configuration, documentation, SDK, changelog, and `extensions/deliberation/contracts/**` changes are excluded.

## Path Inventory

- `extensions/deliberation/index.ts`
- `extensions/deliberation/src/final-adapter.test.ts`
- `extensions/deliberation/src/final-adapter.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/plugin.test.ts`

## Provenance

- Baseline: current `HEAD` plus concurrent non-task worktree changes outside the selected hunks.
- Diff format: zero-context unified patch selected at exact hunk boundaries from `git diff --unified=0`.
- Statistics: 576 additions, 102 deletions.
- SHA-256 of the complete patch block: `fc987598157bccb024116de33ea4eae71e9acb02d768d81ee6d9c68973dbd30b`.
- Truncation check: passed; the patch contains no output-capping or truncation marker.
- Reverse/forward validation: the embedded patch reverse-applied to copies of all six current files, forward-applied to that reconstructed baseline, and reproduced every source byte exactly.

## Requirement Map

- Unknown post-invocation outcomes and explicit rejection: `final-adapter.ts`, `final-adapter.test.ts`.
- Canonical one-message receipt identity: `index.ts`, `plugin.test.ts`.
- Duplicate identity, exact replay, conflict preservation, failure evidence, and strict projections: `km-client.ts`, `km-client.test.ts`.
- `delivery-composition.test.ts` is a pre-existing prerequisite verification dependency in the GREEN command, not a task-owned completion/receipt hunk; it is intentionally excluded from this bounded implementation diff.

## Complete Task-Owned Diff

```diff
diff --git a/extensions/deliberation/index.ts b/extensions/deliberation/index.ts
index cec34b06253..092e3956ac5 100644
--- a/extensions/deliberation/index.ts
+++ b/extensions/deliberation/index.ts
@@ -15,0 +22,34 @@ const FAIL_CLOSED_HOOK_PRIORITY = 1000;
+const INVALID_PLATFORM_MESSAGE_IDS = new Set(["unknown", "suppressed"]);
+
+function requireSingleAttemptReceipt(result: ChannelOutboundTextAttemptResult): {
+  receiptId: string;
+  messageId: string;
+} {
+  if (result.outcome === "rejected") {
+    throw new FinalDeliveryRejectedError(result.error, result.failureClass);
+  }
+  if (result.outcome === "unknown") {
+    throw new FinalDeliveryOutcomeUnknownError(result.error);
+  }
+
+  const messageId = result.messageId;
+  const receiptId = result.receipt.primaryPlatformMessageId;
+  const platformIds = result.receipt.platformMessageIds;
+  const parts = result.receipt.parts;
+  const isSingleMessage =
+    messageId.length > 0 &&
+    messageId.length <= 256 &&
+    messageId === messageId.trim() &&
+    !INVALID_PLATFORM_MESSAGE_IDS.has(messageId) &&
+    receiptId === messageId &&
+    platformIds.length === 1 &&
+    platformIds[0] === messageId &&
+    parts.length === 1 &&
+    parts[0]?.platformMessageId === messageId;
+  if (!isSingleMessage) {
+    throw new FinalDeliveryOutcomeUnknownError(
+      "Final delivery returned malformed or multi-message receipt evidence",
+    );
+  }
+  return { receiptId, messageId };
+}
@@ -71,4 +102 @@ export default definePluginEntry({
-              return {
-                receiptId: result.receipt?.primaryPlatformMessageId ?? result.messageId,
-                messageId: result.messageId,
-              };
+              return requireSingleAttemptReceipt(result);
@@ -105,14 +133 @@ export default definePluginEntry({
-              const receiptId = result.receipt?.primaryPlatformMessageId;
-              if (
-                !receiptId ||
-                result.messageId === "unknown" ||
-                result.messageId === "suppressed"
-              ) {
-                throw new FinalDeliveryOutcomeUnknownError(
-                  "Slack final delivery returned no platform message id",
-                );
-              }
-              return {
-                receiptId,
-                messageId: result.messageId,
-              };
+              return requireSingleAttemptReceipt(result);
diff --git a/extensions/deliberation/src/final-adapter.test.ts b/extensions/deliberation/src/final-adapter.test.ts
index aa3a2f8d9df..60c5b0458e1 100644
--- a/extensions/deliberation/src/final-adapter.test.ts
+++ b/extensions/deliberation/src/final-adapter.test.ts
@@ -322,2 +346,31 @@ describe("public final delivery adapter", () => {
-  it("terminalizes a provider failure without retrying it", async () => {
-    const provider = { send: vi.fn().mockRejectedValue(new Error("permission denied")) };
+  it.each([
+    Object.assign(new Error("connection reset"), { code: "ECONNRESET" }),
+    Object.assign(new Error("request timed out"), { name: "TimeoutError" }),
+  ])("leaves a post-invocation transport outcome unresolved", async (error) => {
+    const provider = { send: vi.fn().mockRejectedValue(error) };
+    const km = {
+      ready: vi.fn().mockResolvedValue({
+        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
+      }),
+      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
+      invoke: vi.fn().mockResolvedValue({}),
+      completeDelivery: vi.fn(),
+    };
+
+    await expect(
+      createFinalDeliveryAdapter({
+        km,
+        providers: { discord: provider },
+        owner: "owner",
+      } as never).runOnce(),
+    ).rejects.toThrow(FinalDeliveryOutcomeUnknownError);
+    expect(provider.send).toHaveBeenCalledTimes(1);
+    expect(km.completeDelivery).not.toHaveBeenCalled();
+  });
+
+  it("terminalizes a definitive adapter rejection without retrying it", async () => {
+    const provider = {
+      send: vi
+        .fn()
+        .mockRejectedValue(new FinalDeliveryRejectedError("missing scope", "permission")),
+    };
@@ -343,0 +398,25 @@ describe("public final delivery adapter", () => {
+  it("leaves an ambiguous adapter outcome unresolved without retrying it", async () => {
+    const provider = {
+      send: vi.fn().mockRejectedValue(new FinalDeliveryOutcomeUnknownError("request timed out")),
+    };
+    const km = {
+      ready: vi.fn().mockResolvedValue({
+        items: [{ recordId: "record-1", text: "reply", effectiveDeliveryTarget: deliveryTarget }],
+      }),
+      reserve: vi.fn().mockResolvedValue({ outcome: "reserved", reservation }),
+      invoke: vi.fn().mockResolvedValue({}),
+      completeDelivery: vi.fn(),
+    };
+
+    await expect(
+      createFinalDeliveryAdapter({
+        km,
+        providers: { discord: provider },
+        owner: "owner",
+      } as never).runOnce(),
+    ).rejects.toThrow(FinalDeliveryOutcomeUnknownError);
+
+    expect(provider.send).toHaveBeenCalledTimes(1);
+    expect(km.completeDelivery).not.toHaveBeenCalled();
+  });
+
diff --git a/extensions/deliberation/src/final-adapter.ts b/extensions/deliberation/src/final-adapter.ts
index 181e0ae3bf7..8e7e72e091e 100644
--- a/extensions/deliberation/src/final-adapter.ts
+++ b/extensions/deliberation/src/final-adapter.ts
@@ -27,0 +40,11 @@ export class FinalDeliveryOutcomeUnknownError extends Error {
+export class FinalDeliveryRejectedError extends Error {
+  override readonly name = "FinalDeliveryRejectedError";
+
+  constructor(
+    message: string,
+    readonly failureClass: "permission" | "rate_limit" | "rejection",
+  ) {
+    super(message);
+  }
+}
+
@@ -99,58 +92,0 @@ function boundedProviderId(value: string, field: string): string {
-function providerFailure(error: unknown): {
-  failureClass: ProviderFailureClass;
-  evidence: Record<string, string | number>;
-} {
-  const candidate = asRecord(error) ?? {};
-  const data = asRecord(candidate.data);
-  const original = asRecord(candidate.original);
-  const statusValue = candidate.status ?? candidate.statusCode;
-  const status =
-    typeof statusValue === "number" && Number.isInteger(statusValue) ? statusValue : undefined;
-  const platformCode = boundedErrorCode(data?.error);
-  const sdkCode = boundedErrorCode(candidate.code);
-  const nestedCode = boundedErrorCode(original?.code);
-  const code = platformCode ?? nestedCode ?? sdkCode;
-  // Slack's SDK emits this plain error after exhausting a non-rejecting 429 attempt.
-  const exhaustedRateLimit =
-    error instanceof Error
-      ? /^A rate limit was exceeded \(url: .+, retry-after: (\d+)\)$/.exec(error.message)
-      : undefined;
-  const retryAfter =
-    candidate.retryAfter ?? (exhaustedRateLimit ? Number(exhaustedRateLimit[1]) : undefined);
-  const retryAfterSeconds =
-    typeof retryAfter === "number" && Number.isFinite(retryAfter) && retryAfter >= 0
-      ? Math.ceil(retryAfter)
-      : undefined;
-  const detail = code ? `provider failed (${code})` : "provider failed";
-  const evidence = {
-    ...(code ? { code } : {}),
-    ...(status === undefined ? {} : { status }),
-    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
-    detail,
-  };
-  if (
-    (error instanceof Error && error.name === "TimeoutError") ||
-    (code !== undefined && TIMEOUT_ERROR_CODES.has(code))
-  ) {
-    return { failureClass: "timeout", evidence };
-  }
-  if (
-    candidate.kind === "missing-permissions" ||
-    status === 401 ||
-    status === 403 ||
-    (platformCode !== undefined && SLACK_PERMISSION_ERRORS.has(platformCode))
-  ) {
-    return { failureClass: "permission", evidence };
-  }
-  if (status === 429 || sdkCode === "slack_webapi_rate_limited_error" || exhaustedRateLimit) {
-    return { failureClass: "rate_limit", evidence };
-  }
-  if (
-    (status !== undefined && status >= 500) ||
-    (code !== undefined && TRANSPORT_ERROR_CODES.has(code))
-  ) {
-    return { failureClass: "transport", evidence };
-  }
-  return { failureClass: "rejection", evidence };
-}
-
@@ -203,9 +139,13 @@ export function createFinalDeliveryAdapter(params: {
-        const failure = providerFailure(error);
-        return await params.km.completeDelivery({
-          reservation,
-          attemptedTarget,
-          providerAttemptId,
-          outcome: "FAILED",
-          providerFailureClass: failure.failureClass,
-          providerEvidence: failure.evidence,
-        });
+        if (error instanceof FinalDeliveryRejectedError) {
+          return await params.km.completeDelivery({
+            reservation,
+            attemptedTarget,
+            providerAttemptId,
+            outcome: "FAILED",
+            providerFailureClass: error.failureClass,
+            providerEvidence: { detail: error.message.slice(0, MAX_LOOP_WARNING_LENGTH) },
+          });
+        }
+        throw new FinalDeliveryOutcomeUnknownError(
+          "Final delivery provider outcome is unknown after invocation",
+        );
diff --git a/extensions/deliberation/src/km-client.test.ts b/extensions/deliberation/src/km-client.test.ts
index 76c49a91974..b85e2c8f580 100644
--- a/extensions/deliberation/src/km-client.test.ts
+++ b/extensions/deliberation/src/km-client.test.ts
@@ -968,0 +983,267 @@ describe("KM contract parsing", () => {
+  it.each([
+    { field: "ordinal", value: 2 },
+    { field: "reservedRecordVersion", value: 8 },
+  ] as const)("rejects completion evidence with another $field", async ({ field, value }) => {
+    const client = createClient({
+      protocolVersion: 1,
+      record: {
+        recordId: "record-1",
+        state: "SENT",
+        version: 9,
+        delivery: { attempts: [{ ...validTerminalAttempt(), [field]: value }] },
+      },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).rejects.toThrow("mismatched completion evidence");
+  });
+
+  it("accepts an exact completion replay", async () => {
+    const client = createClient({
+      protocolVersion: 1,
+      record: {
+        recordId: "record-1",
+        state: "SENT",
+        version: 9,
+        delivery: { attempts: [validTerminalAttempt()] },
+      },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).resolves.toMatchObject({ state: "SENT" });
+  });
+
+  it.each([
+    {
+      name: "attempt ID",
+      attempts: [validTerminalAttempt(), { ...validTerminalAttempt(), ordinal: 2 }],
+    },
+    {
+      name: "provider-attempt ID",
+      attempts: [
+        { ...validTerminalAttempt(), attemptId: "historical-attempt" },
+        { ...validTerminalAttempt(), ordinal: 2 },
+      ],
+    },
+  ])("rejects duplicate $name completion evidence", async ({ attempts }) => {
+    const client = createClient({
+      protocolVersion: 1,
+      record: {
+        recordId: "record-1",
+        state: "SENT",
+        version: 9,
+        delivery: { attempts },
+      },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).rejects.toThrow("duplicate delivery attempt identity");
+  });
+
+  it("preserves a completion CAS conflict as an HTTP error", async () => {
+    const client = createKmClient({
+      config,
+      openclawConfig: {} as never,
+      fetchImpl: vi.fn().mockResolvedValue(
+        new Response(
+          JSON.stringify({
+            protocolVersion: 1,
+            error: { code: "CAS_CONFLICT", message: "completion evidence differs" },
+          }),
+          { status: 409 },
+        ),
+      ),
+      env: { KM_TOKEN: "test-only" },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).rejects.toMatchObject({ stage: "http", status: 409, code: "CAS_CONFLICT" });
+  });
+
+  it("rejects receipt evidence that differs from the submitted message pair", async () => {
+    const client = createClient({
+      protocolVersion: 1,
+      record: {
+        recordId: "record-1",
+        state: "SENT",
+        version: 9,
+        delivery: {
+          attempts: [{ ...validTerminalAttempt(), providerReceiptId: "other-receipt" }],
+        },
+      },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).rejects.toThrow("mismatched provider receipt evidence");
+  });
+
+  it.each(["providerReceiptId", "providerMessageId"] as const)(
+    "rejects FAILED completion carrying a non-null %s",
+    async (field) => {
+      const client = createClient({
+        protocolVersion: 1,
+        record: {
+          recordId: "record-1",
+          state: "FAILED",
+          version: 9,
+          delivery: { attempts: [{ ...validFailedAttempt(), [field]: "message-1" }] },
+        },
+      });
+
+      await expect(
+        client.completeDelivery({
+          reservation: validReservation(),
+          attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+          providerAttemptId: "provider-1",
+          outcome: "FAILED",
+          providerFailureClass: "rejection",
+          providerEvidence: { code: "rejected" },
+        }),
+      ).rejects.toThrow("mismatched provider failure evidence");
+    },
+  );
+
+  it("accepts all schema-permitted record projection fields", async () => {
+    const client = createClient({
+      protocolVersion: 1,
+      record: {
+        recordId: "record-1",
+        state: "SENT",
+        version: 9,
+        readyAt: "2026-08-01T12:00:10Z",
+        processingSessionKey: "agent:reviewer",
+        processing: {
+          phase: "review",
+          attempt: 1,
+          purpose: "review",
+          candidateRevision: 1,
+          correlationId: "correlation-1",
+          processingSessionKey: "agent:reviewer",
+          dispatchStartedAt: "2026-08-01T12:00:11Z",
+          acknowledgedAt: "2026-08-01T12:00:12Z",
+          resultDeadline: "2026-08-01T12:01:12Z",
+          expiredAt: null,
+          releasedAt: "2026-08-01T12:00:20Z",
+          releaseReason: "result_finalized",
+          lateResult: {
+            event: "LATE_RESULT_AFTER_EXPIRY",
+            classification: "valid",
+            digest: "1".repeat(64),
+            auditedAt: "2026-08-01T12:00:21Z",
+          },
+        },
+        sourceContext: {
+          schemaVersion: 1,
+          sourceTarget: "v1:discord:account-1:channel-1",
+          provenance: { provider: "discord", account: "account-1", channel: "channel-1" },
+          cutoffProviderEventId: "event-1",
+          capturedAt: "2026-08-01T12:00:00Z",
+          snapshotHash: "c".repeat(64),
+          messages: [],
+        },
+        review: {
+          candidateRevision: 1,
+          rewriteCount: 0,
+          attempts: [
+            {
+              attempt: 1,
+              technicalAttempt: 1,
+              candidateRevision: 1,
+              correlationId: "review-1",
+              startedAt: "2026-08-01T12:00:00Z",
+              completedAt: "2026-08-01T12:00:10Z",
+              sessionId: "session-1",
+              provider: "openai",
+              model: "gpt-5.5",
+              freshnessCount: 1,
+              freshnessHash: "d".repeat(64),
+              freshnessCutoff: "event-1",
+              freshnessComplete: true,
+              freshnessArtifactPath: "freshness.json",
+              freshnessArtifactDigest: "e".repeat(64),
+              reviewContractVersion: 1,
+              reviewInputVersion: 1,
+              qualityRubricVersion: 1,
+              canonicalInputDigest: "f".repeat(64),
+              candidateDigest: "0".repeat(64),
+              verdict: "approved",
+              reason: "complete",
+              outcome: "approved",
+            },
+          ],
+          freshnessArtifacts: [
+            {
+              schemaVersion: 1,
+              candidateRevision: 1,
+              sourceTarget: "v1:discord:account-1:channel-1",
+              provenance: {
+                provider: "discord",
+                account: "account-1",
+                channel: "channel-1",
+              },
+              exclusiveCutoffProviderEventId: "event-0",
+              inclusiveWatermarkProviderEventId: "event-1",
+              capturedAt: "2026-08-01T12:00:00Z",
+              messageCount: 1,
+              complete: true,
+              path: "freshness.json",
+              digest: "2".repeat(64),
+            },
+          ],
+        },
+        delivery: { attempts: [validTerminalAttempt()] },
+      },
+    });
+
+    await expect(
+      client.completeDelivery({
+        reservation: validReservation(),
+        attemptedTarget: validReservation().deliveryEnvelope.deliveryTarget,
+        providerAttemptId: "provider-1",
+        outcome: "SENT",
+        providerReceiptId: "receipt-1",
+        providerMessageId: "message-1",
+      }),
+    ).resolves.toMatchObject({ state: "SENT" });
+  });
+
diff --git a/extensions/deliberation/src/km-client.ts b/extensions/deliberation/src/km-client.ts
index 1452fee8eaa..e4ec8bbe576 100644
--- a/extensions/deliberation/src/km-client.ts
+++ b/extensions/deliberation/src/km-client.ts
@@ -786,0 +793,19 @@ const reviewAttemptSchema = z
+    freshnessArtifactPath: nullableString.optional(),
+    freshnessArtifactDigest: z
+      .string()
+      .regex(/^[0-9a-f]{64}$/)
+      .nullable()
+      .optional(),
+    reviewContractVersion: z.literal(1).nullable().optional(),
+    reviewInputVersion: z.literal(1).nullable().optional(),
+    qualityRubricVersion: z.literal(1).nullable().optional(),
+    canonicalInputDigest: z
+      .string()
+      .regex(/^[0-9a-f]{64}$/)
+      .nullable()
+      .optional(),
+    candidateDigest: z
+      .string()
+      .regex(/^[0-9a-f]{64}$/)
+      .nullable()
+      .optional(),
@@ -796,0 +822,82 @@ const reviewSchema = z
+    freshnessArtifacts: z
+      .array(
+        z
+          .object({
+            schemaVersion: z.literal(1).optional(),
+            candidateRevision: z.number().int().optional(),
+            sourceTarget: z.string().optional(),
+            provenance: z
+              .object({
+                provider: z.literal("discord").optional(),
+                account: z.string().optional(),
+                channel: z.string().optional(),
+              })
+              .strict()
+              .optional(),
+            exclusiveCutoffProviderEventId: z.string().optional(),
+            inclusiveWatermarkProviderEventId: z.string().optional(),
+            capturedAt: z.string().optional(),
+            messageCount: z.number().int().optional(),
+            complete: z.boolean().optional(),
+            path: z.string().optional(),
+            digest: z.string().optional(),
+          })
+          .strict(),
+      )
+      .optional(),
+  })
+  .strict()
+  .nullable();
+const processingSchema = z
+  .object({
+    phase: z.string().optional(),
+    attempt: z.number().int().optional(),
+    purpose: z.string().optional(),
+    candidateRevision: z.number().int().optional(),
+    correlationId: z.string().optional(),
+    processingSessionKey: nullableString.optional(),
+    dispatchStartedAt: nullableString.optional(),
+    acknowledgedAt: nullableString.optional(),
+    resultDeadline: nullableString.optional(),
+    expiredAt: nullableString.optional(),
+    releasedAt: nullableString.optional(),
+    releaseReason: z
+      .enum([
+        "result_finalized",
+        "source_history_unavailable",
+        "transport_rejected",
+        "processing_session_timeout",
+        "malformed_draft_result",
+        "draft_result_correlation_conflict",
+      ])
+      .nullable()
+      .optional(),
+    lateResult: z
+      .object({
+        event: z.literal("LATE_RESULT_AFTER_EXPIRY"),
+        classification: z.enum(["valid", "malformed", "correlation_conflict"]),
+        digest: z.string().regex(/^[0-9a-f]{64}$/),
+        auditedAt: z.string(),
+      })
+      .strict()
+      .nullable()
+      .optional(),
+  })
+  .strict()
+  .nullable();
+const sourceContextSchema = z
+  .object({
+    schemaVersion: z.number().int().optional(),
+    sourceTarget: z.string().optional(),
+    provenance: z
+      .object({
+        provider: z.string().optional(),
+        account: z.string().optional(),
+        channel: z.string().optional(),
+      })
+      .strict()
+      .optional(),
+    cutoffProviderEventId: z.string().optional(),
+    capturedAt: z.string().optional(),
+    snapshotHash: z.string().optional(),
+    messages: z.array(z.object({}).strict()).optional(),
@@ -832,0 +940 @@ const recordSchema = z
+    readyAt: nullableString.optional(),
@@ -838,0 +947,3 @@ const recordSchema = z
+    processing: processingSchema.optional(),
+    processingSessionKey: nullableString.optional(),
+    sourceContext: sourceContextSchema.optional(),
@@ -925,9 +1031,0 @@ export function createKmClient(params: {
-      if (response.status === 409 && isRecord(value) && value.protocolVersion === 1) {
-        const error = value.error;
-        if (
-          isRecord(error) &&
-          (error.code === "CAS_CONFLICT" || error.code === "CONTROL_DISABLED")
-        ) {
-          return { value: { conflict: error.code }, status: response.status };
-        }
-      }
@@ -1209 +1320,18 @@ export function createKmClient(params: {
-      const attempt = attempts.find((item) => item.attemptId === reservation.attemptId);
+      const attemptIds = new Set<string>();
+      const providerAttemptIds = new Set<string>();
+      for (const item of attempts) {
+        const attemptId = item.attemptId as string;
+        const providerAttemptId = item.providerAttemptId as string | null;
+        if (
+          attemptIds.has(attemptId) ||
+          (providerAttemptId !== null && providerAttemptIds.has(providerAttemptId))
+        ) {
+          throw new Error("KM returned duplicate delivery attempt identity");
+        }
+        attemptIds.add(attemptId);
+        if (providerAttemptId !== null) {
+          providerAttemptIds.add(providerAttemptId);
+        }
+      }
+      const matchingAttempts = attempts.filter((item) => item.attemptId === reservation.attemptId);
+      const attempt = matchingAttempts.length === 1 ? matchingAttempts[0] : undefined;
@@ -1210,0 +1339,3 @@ export function createKmClient(params: {
+      // Reservation responses carry the incremented record version; attempt evidence retains
+      // the version on which the reservation CAS was performed.
+      const expectedReservedRecordVersion = reservation.version - 1;
@@ -1220,0 +1352,2 @@ export function createKmClient(params: {
+        attempt.ordinal !== reservation.ordinal ||
+        attempt.reservedRecordVersion !== expectedReservedRecordVersion ||
@@ -1240 +1373,3 @@ export function createKmClient(params: {
-        (attempt.providerFailureClass !== delivery.providerFailureClass ||
+        (attempt.providerReceiptId !== null ||
+          attempt.providerMessageId !== null ||
+          attempt.providerFailureClass !== delivery.providerFailureClass ||
diff --git a/extensions/deliberation/src/plugin.test.ts b/extensions/deliberation/src/plugin.test.ts
index 7ab7f405d08..21f6c412b67 100644
--- a/extensions/deliberation/src/plugin.test.ts
+++ b/extensions/deliberation/src/plugin.test.ts
@@ -365 +487 @@ describe("deliberation plugin boundary", () => {
-  it("contains provider failures and records FAILED", async () => {
+  it("leaves a thrown provider outcome unresolved", async () => {
@@ -377,3 +499,61 @@ describe("deliberation plugin boundary", () => {
-    expect(km.completeDelivery).toHaveBeenCalledWith(
-      expect.objectContaining({ outcome: "FAILED", providerFailureClass: "rejection" }),
-    );
+    expect(km.completeDelivery).not.toHaveBeenCalled();
+  });
+
+  it.each([
+    {
+      name: "unknown Discord sentinel",
+      result: sentAttempt("unknown"),
+    },
+    {
+      name: "padded noncanonical ID",
+      result: {
+        ...sentAttempt("message-1"),
+        messageId: " message-1 ",
+        receipt: {
+          ...sentAttempt("message-1").receipt,
+          primaryPlatformMessageId: " message-1 ",
+        },
+      },
+    },
+    {
+      name: "missing primary ID",
+      result: {
+        ...sentAttempt("message-1"),
+        receipt: { ...sentAttempt("message-1").receipt, primaryPlatformMessageId: undefined },
+      },
+    },
+    {
+      name: "different receipt ID",
+      result: {
+        ...sentAttempt("message-1"),
+        receipt: {
+          ...sentAttempt("message-1").receipt,
+          primaryPlatformMessageId: "message-2",
+        },
+      },
+    },
+    {
+      name: "multiple receipt parts",
+      result: {
+        ...sentAttempt("message-1"),
+        receipt: {
+          ...sentAttempt("message-1").receipt,
+          platformMessageIds: ["message-1", "message-2"],
+          parts: [
+            { platformMessageId: "message-1", kind: "text", index: 0 },
+            { platformMessageId: "message-2", kind: "text", index: 1 },
+          ],
+        },
+      },
+    },
+  ])("leaves $name receipt evidence unresolved", async ({ result }) => {
+    vi.useFakeTimers();
+    const km = createKm();
+    const sendText = vi.fn().mockResolvedValue(result);
+    const { api, services } = registerPlugin(km, sendText);
+
+    await services[0]?.start({ config: api.config, stateDir: "/tmp", logger: api.logger });
+    await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", logger: api.logger });
+
+    expect(sendText).toHaveBeenCalledTimes(1);
+    expect(km.completeDelivery).not.toHaveBeenCalled();
```
