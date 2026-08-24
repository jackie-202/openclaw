# TDD Red-Green Proof: cool-vale-4616

<!-- proof-capture-metadata: {"version":1,"task_id":"cool-vale-4616","command":["env","OPENCLAW_VITEST_MAX_WORKERS=1","pnpm","test","extensions/deliberation/src/km-client.test.ts","-t","OR-19|OR-20","--","--reporter=verbose"],"command_sha256":"e103afa1eab970185eb590f08a82e0b9d09590434c2c0d125a7163dde93fe8bf"} -->

## RED Phase

- **Timestamp:** 2026-08-23T22:18:54.649371+00:00
- **Test command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes producer authority at intake without a reservation-time target override
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects unrelated caller-controlled intake fields before transport
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a degraded listener identity as a valid health response
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runner
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runtime
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a successful response without closed durable invocation evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose immutable pipeline differs from the reservation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'ordinal'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'reservedRecordVersion'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerReceiptId
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerMessageId
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence whose attempted target drifts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects historical attempt envelopes belonging to another record
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelopeDigest
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing reserveIdempotencyKey
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelopeDigest
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects active delivery attempts with null envelope evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'RESERVATION_ABANDONED' audit attempts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'NOT_SENT' audit attempts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'DELIVERY_UNKNOWN' audit attempts
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT 31ms
   → promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN 2ms
   → promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-20 historical-attempt-drift-and-tamper-fail-closed 2ms
   → promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 0
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 1
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 2
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerFailureClass'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerEvidence'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'terminalReason'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a malformed ready delivery envelope at its field boundary
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'Teams' before adapter validation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'slack' before adapter validation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target undefined
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(2) }
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(4) }
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay'

 Test Files  1 failed (1)
      Tests  3 failed | 72 skipped (75)
   Start at  00:18:53
   Duration  577ms (transform 248ms, setup 108ms, import 339ms, tests 36ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT
AssertionError: promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting

- Expected
+ Received

- Error {
-   "message": "rejected promise",
+ {
+   "delivery": {
+     "attempts": [
+       {
+         "attemptId": "legacy-unknown",
+         "completedAt": null,
+         "completionOutcome": "NOT_SENT",
+         "deliveryEnvelope": null,
+         "deliveryEnvelopeDigest": null,
+         "ordinal": 1,
+         "outcome": "NOT_SENT",
+         "proofReference": null,
+         "providerAttemptId": "provider-legacy",
+         "providerMessageId": null,
+         "providerReceiptId": null,
+         "reserveIdempotencyKey": "reserve:legacy",
+         "terminalReason": null,
+       },
+       {
+         "attemptId": "attempt-1",
+         "attemptedTarget": {
+           "account": "account-1",
+           "channel": "channel-1",
+           "mode": "root",
+           "provider": "discord",
+         },
+         "candidateRevision": 1,
+         "completedAt": "2026-08-01T12:01:00Z",
+         "completionIdempotencyKey": "complete:attempt-1",
+         "completionOutcome": "SENT",
+         "deliveryEnvelope": {
+           "candidateRevision": 1,
+           "deliveryTarget": {
+             "account": "account-1",
+             "channel": "channel-1",
+             "mode": "root",
+             "provider": "discord",
+           },
+           "draftAttempt": 1,
+           "draftCorrelationId": "draft-correlation-1",
+           "inboundId": "inbound-1",
+           "pipelineId": "discord-source",
+           "recordId": "record-1",
+           "reviewAttempt": 1,
+           "reviewCorrelationId": "review-correlation-1",
+           "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+           "schemaVersion": 1,
+           "sourceTarget": "v1:discord:account-1:channel-1",
+         },
+         "deliveryEnvelopeDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
+         "invocationIdempotencyKey": "invoke:attempt-1",
+         "invokedAt": "2026-08-01T12:00:30Z",
+         "leaseExpiresAt": "2026-08-01T12:01:00Z",
+         "ordinal": 2,
+         "outcome": "SENT",
+         "owner": "sender-1",
+         "proofReference": null,
+         "providerAttemptId": "provider-1",
+         "providerMessageId": "message-1",
+         "providerReceiptId": "receipt-1",
+         "reserveIdempotencyKey": "reserve:record-1:7",
+         "reservedAt": "2026-08-01T12:00:20Z",
+         "reservedRecordVersion": 7,
+         "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+         "terminalReason": "delivery_sent",
+       },
+     ],
+   },
+   "recordId": "record-1",
+   "state": "SENT",
+   "version": 9,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:1627:7
    1625|           providerMessageId: "message-1",
    1626|         }),
    1627|       ).rejects.toThrow("unauthorized delivery retry");
       |       ^
    1628|     },
    1629|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN
AssertionError: promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting

- Expected
+ Received

- Error {
-   "message": "rejected promise",
+ {
+   "delivery": {
+     "attempts": [
+       {
+         "attemptId": "legacy-unknown",
+         "completedAt": null,
+         "completionOutcome": "DELIVERY_UNKNOWN",
+         "deliveryEnvelope": null,
+         "deliveryEnvelopeDigest": null,
+         "ordinal": 1,
+         "outcome": "DELIVERY_UNKNOWN",
+         "proofReference": null,
+         "providerAttemptId": "provider-legacy",
+         "providerMessageId": null,
+         "providerReceiptId": null,
+         "reserveIdempotencyKey": "reserve:legacy",
+         "terminalReason": "delivery_outcome_unknown",
+       },
+       {
+         "attemptId": "attempt-1",
+         "attemptedTarget": {
+           "account": "account-1",
+           "channel": "channel-1",
+           "mode": "root",
+           "provider": "discord",
+         },
+         "candidateRevision": 1,
+         "completedAt": "2026-08-01T12:01:00Z",
+         "completionIdempotencyKey": "complete:attempt-1",
+         "completionOutcome": "SENT",
+         "deliveryEnvelope": {
+           "candidateRevision": 1,
+           "deliveryTarget": {
+             "account": "account-1",
+             "channel": "channel-1",
+             "mode": "root",
+             "provider": "discord",
+           },
+           "draftAttempt": 1,
+           "draftCorrelationId": "draft-correlation-1",
+           "inboundId": "inbound-1",
+           "pipelineId": "discord-source",
+           "recordId": "record-1",
+           "reviewAttempt": 1,
+           "reviewCorrelationId": "review-correlation-1",
+           "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+           "schemaVersion": 1,
+           "sourceTarget": "v1:discord:account-1:channel-1",
+         },
+         "deliveryEnvelopeDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
+         "invocationIdempotencyKey": "invoke:attempt-1",
+         "invokedAt": "2026-08-01T12:00:30Z",
+         "leaseExpiresAt": "2026-08-01T12:01:00Z",
+         "ordinal": 2,
+         "outcome": "SENT",
+         "owner": "sender-1",
+         "proofReference": null,
+         "providerAttemptId": "provider-1",
+         "providerMessageId": "message-1",
+         "providerReceiptId": "receipt-1",
+         "reserveIdempotencyKey": "reserve:record-1:7",
+         "reservedAt": "2026-08-01T12:00:20Z",
+         "reservedRecordVersion": 7,
+         "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+         "terminalReason": "delivery_sent",
+       },
+     ],
+   },
+   "recordId": "record-1",
+   "state": "SENT",
+   "version": 9,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:1627:7
    1625|           providerMessageId: "message-1",
    1626|         }),
    1627|       ).rejects.toThrow("unauthorized delivery retry");
       |       ^
    1628|     },
    1629|   );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-20 historical-attempt-drift-and-tamper-fail-closed
AssertionError: promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting

- Expected
+ Received

- Error {
-   "message": "rejected promise",
+ {
+   "delivery": {
+     "attempts": [
+       {
+         "attemptId": "historical-attempt",
+         "attemptedTarget": {
+           "account": "account-1",
+           "channel": "other-channel",
+           "mode": "root",
+           "provider": "discord",
+         },
+         "candidateRevision": 1,
+         "completedAt": "2026-08-01T12:01:00Z",
+         "completionIdempotencyKey": "complete:historical-attempt",
+         "completionOutcome": "SENT",
+         "deliveryEnvelope": {
+           "candidateRevision": 1,
+           "deliveryTarget": {
+             "account": "account-1",
+             "channel": "other-channel",
+             "mode": "root",
+             "provider": "discord",
+           },
+           "draftAttempt": 1,
+           "draftCorrelationId": "draft-correlation-1",
+           "inboundId": "inbound-1",
+           "pipelineId": "other-pipeline",
+           "recordId": "record-1",
+           "reviewAttempt": 1,
+           "reviewCorrelationId": "review-correlation-1",
+           "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+           "schemaVersion": 1,
+           "sourceTarget": "v1:discord:account-1:other-channel",
+         },
+         "deliveryEnvelopeDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
+         "invocationIdempotencyKey": "invoke:historical-attempt",
+         "invokedAt": "2026-08-01T12:00:30Z",
+         "leaseExpiresAt": "2026-08-01T12:01:00Z",
+         "ordinal": 1,
+         "outcome": "SENT",
+         "owner": "sender-1",
+         "proofReference": null,
+         "providerAttemptId": "provider-historical",
+         "providerMessageId": "message-historical",
+         "providerReceiptId": "receipt-historical",
+         "reserveIdempotencyKey": "reserve:record-1:7",
+         "reservedAt": "2026-08-01T12:00:20Z",
+         "reservedRecordVersion": 7,
+         "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+         "terminalReason": "delivery_sent",
+       },
+       {
+         "attemptId": "attempt-1",
+         "attemptedTarget": {
+           "account": "account-1",
+           "channel": "channel-1",
+           "mode": "root",
+           "provider": "discord",
+         },
+         "candidateRevision": 1,
+         "completedAt": "2026-08-01T12:01:00Z",
+         "completionIdempotencyKey": "complete:attempt-1",
+         "completionOutcome": "SENT",
+         "deliveryEnvelope": {
+           "candidateRevision": 1,
+           "deliveryTarget": {
+             "account": "account-1",
+             "channel": "channel-1",
+             "mode": "root",
+             "provider": "discord",
+           },
+           "draftAttempt": 1,
+           "draftCorrelationId": "draft-correlation-1",
+           "inboundId": "inbound-1",
+           "pipelineId": "discord-source",
+           "recordId": "record-1",
+           "reviewAttempt": 1,
+           "reviewCorrelationId": "review-correlation-1",
+           "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+           "schemaVersion": 1,
+           "sourceTarget": "v1:discord:account-1:channel-1",
+         },
+         "deliveryEnvelopeDigest": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
+         "invocationIdempotencyKey": "invoke:attempt-1",
+         "invokedAt": "2026-08-01T12:00:30Z",
+         "leaseExpiresAt": "2026-08-01T12:01:00Z",
+         "ordinal": 2,
+         "outcome": "SENT",
+         "owner": "sender-1",
+         "proofReference": null,
+         "providerAttemptId": "provider-1",
+         "providerMessageId": "message-1",
+         "providerReceiptId": "receipt-1",
+         "reserveIdempotencyKey": "reserve:record-1:7",
+         "reservedAt": "2026-08-01T12:00:20Z",
+         "reservedRecordVersion": 7,
+         "reviewedTextHash": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+         "terminalReason": "delivery_sent",
+       },
+     ],
+   },
+   "recordId": "record-1",
+   "state": "SENT",
+   "version": 9,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:1673:5
    1671|         providerMessageId: "message-1",
    1672|       }),
    1673|     ).rejects.toThrow("historical delivery attempt drift");
       |     ^
    1674|   });
    1675|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

[test] failed 1 Vitest shard in 6.48s
```

## GREEN Phase

- **Timestamp:** 2026-08-23T22:39:12.767426+00:00
- **Test command:** `env OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes producer authority at intake without a reservation-time target override
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects unrelated caller-controlled intake fields before transport
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a degraded listener identity as a valid health response
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runner
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runtime
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a successful response without closed durable invocation evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose immutable pipeline differs from the reservation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'ordinal'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'reservedRecordVersion'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerReceiptId
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerMessageId
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence whose attempted target drifts
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects historical attempt envelopes belonging to another record
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelopeDigest
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing reserveIdempotencyKey
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelopeDigest
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects active delivery attempts with null envelope evidence
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a proven never-invoked abandonment before a fresh attempt
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT 25ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-20 historical-attempt-drift-and-tamper-fail-closed 0ms
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 0
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 1
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 2
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerFailureClass'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerEvidence'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'terminalReason'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a malformed ready delivery envelope at its field boundary
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'Teams' before adapter validation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'slack' before adapter validation
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target undefined
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(2) }
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(4) }
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner'
 ↓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay'

 Test Files  1 passed (1)
      Tests  3 passed | 70 skipped (73)
   Start at  00:39:12
   Duration  439ms (transform 194ms, setup 88ms, import 249ms, tests 28ms, environment 0ms)

```

## Owner And Integration Evidence

- Historical owner RED from `wild-crag-3236`: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q` -> `3 failed, 38 passed in 18.45s`. The source evidence explicitly reports `command_lines_truncated`; missing suffixes/details were not reconstructed.
- Authority preflight: current observed KM HEAD `bf192a1b7128dfa7cfb0dceb2a81394fe2378874` (non-blocking provenance); all four accepted SHA-256 values matched.
- `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration` -> exit 0, 37 passed, including every exact OR-07 through OR-21 leaf once.
- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose` -> 112 passed.
- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose` -> 295 passed.
- Unchanged KM composed selectors -> `1 failed, 2 passed, 38 deselected`. The remaining owner-side assertion expects the pre-contract message shape without `pipelineId` and `deliveryTarget`, while the hash-verified owner contract requires both and current KM persistence emits both. OpenClaw cannot remove owner-persisted required fields without violating the accepted contract.
- `pnpm tsgo:extensions` and `pnpm lint:extensions` passed. `pnpm tsgo:extensions:test` remains blocked by pre-existing unrelated history-read/Discord/Slack test-mock discriminant errors in the shared dirty worktree.
- `pnpm check:changed` could not allocate Blacksmith Testbox because the local `blacksmith` executable is unavailable. `git diff --check` passed.
- Autoreview was invoked but its shared-worktree bundle was 2,192,462 characters and exceeded the engine's 1,048,576-character input limit; no review verdict was produced.

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.57s
```
