# TDD Red-Green Proof: bold-brook-4380

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-brook-4380","command":["pnpm","test","extensions/deliberation/src/final-adapter.test.ts","extensions/deliberation/src/km-client.test.ts","extensions/deliberation/src/plugin.test.ts","extensions/deliberation/src/delivery-composition.test.ts","--","--reporter=verbose"],"command_sha256":"50e3e5f57e95e60e698dbd0e414811f7704d684fa919a7493bc7b1329b071845"} -->

## RED Phase

- **Timestamp:** 2026-08-22T12:17:33.023936+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 20ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes producer authority at intake without a reservation-time target override 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects unrelated caller-controlled intake fields before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 10ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a degraded listener identity as a valid health response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runner 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a successful response without closed durable invocation evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose immutable pipeline differs from the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay 0ms
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence 6ms
   → promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence 1ms
   → promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error 1ms
   → expected KmRequestError: KM returned an invalid re… { …(3) } to match object { stage: 'http', status: 409, …(1) }
(1 matching property omitted from actual)
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair 0ms
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields 1ms
   → promise rejected "KmRequestError: KM returned an invalid re… { …(3) }" instead of resolving
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects historical attempt envelopes belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing reserveIdempotencyKey 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects active delivery attempts with null envelope evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'RESERVATION_ABANDONED' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'NOT_SENT' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'DELIVERY_UNKNOWN' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 0 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 1 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 2 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerFailureClass' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerEvidence' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'terminalReason' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a malformed ready delivery envelope at its field boundary 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'Teams' before adapter validation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'slack' before adapter validation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target undefined 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(2) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(4) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay' 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real discord adapter single-attempt capability 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real slack adapter single-attempt capability 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > carries the durable key into one Discord native request 8ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an ambiguous Discord native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects over-limit Discord text before a native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > uses one Slack native post and records unsupported idempotency honestly 3ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an accepted-then-error Slack native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects Slack text that renders into multiple messages before posting 2ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not register final delivery while Deliberation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers an explicit Slack root without manufacturing a thread 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers a Discord source anchor through the channel-owned anchor operation 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails an oversized result without sending multiple Discord messages 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails a Slack destination whose explicit account is not configured 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves Slack delivery unresolved when the provider returns no platform message id 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is conflict 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord for an empty queue 0ms
 × |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved 2ms
   → expected "vi.fn()" to not be called at all, but actually been called 1 times

Received:

  1st vi.fn() call:

    Array [
      Object {
        "attemptedTarget": Object {
          "account": "acct-2",
          "channel": "channel-2",
          "mode": "thread",
          "provider": "discord",
          "threadId": "thread-2",
        },
        "outcome": "FAILED",
        "providerAttemptId": "p:9hG7yJRtFsNB6ojK_TBY78",
        "providerEvidence": Object {
          "detail": "provider failed",
        },
        "providerFailureClass": "rejection",
        "reservation": Object {
          "attemptId": "attempt-1",
          "deliveryEnvelope": Object {
            "deliveryTarget": Object {
              "account": "acct-2",
              "channel": "channel-2",
              "mode": "thread",
              "provider": "discord",
              "threadId": "thread-2",
            },
            "pipelineId": "discord-source-1",
            "sourceTarget": "v1:slack:workspace-a:C123",
          },
          "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "leaseToken": "lease",
          "owner": "owner",
          "recordId": "record-1",
        },
      },
    ]


Number of calls: 1

 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'unknown Discord sentinel' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'padded noncanonical ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'missing primary ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'different receipt ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'multiple receipt parts' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > derives a stable provider attempt identity that fits native Discord nonces 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Slack -> Discord' by destination alone and binds the exact receipt 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Discord -> Slack' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Discord -> Discord' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Slack -> Slack' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a malformed ready target before reservation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a reservation target mismatch before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects an unsupported destination before invocation or provider send 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 0ms
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved 1ms
   → promise resolved "undefined" instead of rejecting
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved 0ms
   → promise resolved "undefined" instead of rejecting
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a definitive adapter rejection without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves an ambiguous adapter outcome unresolved without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves an invoked attempt unresolved when provider receipt evidence is invalid 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > does not retry a send when KM rejects completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 0 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 1 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 2 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 3 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 4 before durable invocation 0ms

 Test Files  3 failed | 1 passed (4)
      Tests  7 failed | 110 passed (117)
   Start at  14:17:28
   Duration  4.13s (transform 2.40s, setup 102ms, import 3.83s, tests 89ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 26628, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved
 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved
AssertionError: promise resolved "undefined" instead of rejecting

- Expected:
Error {
  "message": "rejected promise",
}

+ Received:
undefined

 ❯ extensions/deliberation/src/final-adapter.test.ts:366:5
    364|         owner: "owner",
    365|       } as never).runOnce(),
    366|     ).rejects.toThrow(FinalDeliveryOutcomeUnknownError);
       |     ^
    367|     expect(provider.send).toHaveBeenCalledTimes(1);
    368|     expect(km.completeDelivery).not.toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence
AssertionError: promise resolved "{ recordId: 'record-1', …(3) }" instead of rejecting

- Expected
+ Received

- Error {
-   "message": "rejected promise",
+ {
+   "delivery": {
+     "attempts": [
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
+         "ordinal": 1,
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

 ❯ extensions/deliberation/src/km-client.test.ts:1034:5
    1032|         providerMessageId: "message-1",
    1033|       }),
    1034|     ).rejects.toThrow("duplicate delivery attempt identity");
       |     ^
    1035|   });
    1036|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence
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
+         "ordinal": 1,
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

 ❯ extensions/deliberation/src/km-client.test.ts:1034:5
    1032|         providerMessageId: "message-1",
    1033|       }),
    1034|     ).rejects.toThrow("duplicate delivery attempt identity");
       |     ^
    1035|   });
    1036|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error
AssertionError: expected KmRequestError: KM returned an invalid re… { …(3) } to match object { stage: 'http', status: 409, …(1) }
(1 matching property omitted from actual)

- Expected
+ Received

- {
-   "code": "CAS_CONFLICT",
-   "stage": "http",
+ KmRequestError {
+   "code": "UNKNOWN",
+   "stage": "response-schema",
    "status": 409,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:1062:5
    1060|         providerMessageId: "message-1",
    1061|       }),
    1062|     ).rejects.toMatchObject({ stage: "http", status: 409, code: "CAS_C…
       |     ^
    1063|   });
    1064|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields
AssertionError: promise rejected "KmRequestError: KM returned an invalid re… { …(3) }" instead of resolving
 ❯ extensions/deliberation/src/km-client.test.ts:1168:5
    1166|         providerMessageId: "message-1",
    1167|       }),
    1168|     ).resolves.toMatchObject({ state: "SENT" });
       |     ^
    1169|   });
    1170|

Caused by: KmRequestError: KM returned an invalid record response
 ❯ parseResponse extensions/deliberation/src/km-client.ts:119:11
 ❯ Object.completeDelivery extensions/deliberation/src/km-client.ts:1187:22
 ❯ extensions/deliberation/src/km-client.test.ts:1159:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { stage: 'response-schema', status: 200, code: 'UNKNOWN' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved
AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times

Received:

  1st vi.fn() call:

    Array [
      Object {
        "attemptedTarget": Object {
          "account": "acct-2",
          "channel": "channel-2",
          "mode": "thread",
          "provider": "discord",
          "threadId": "thread-2",
        },
        "outcome": "FAILED",
        "providerAttemptId": "p:9hG7yJRtFsNB6ojK_TBY78",
        "providerEvidence": Object {
          "detail": "provider failed",
        },
        "providerFailureClass": "rejection",
        "reservation": Object {
          "attemptId": "attempt-1",
          "deliveryEnvelope": Object {
            "deliveryTarget": Object {
              "account": "acct-2",
              "channel": "channel-2",
              "mode": "thread",
              "provider": "discord",
              "threadId": "thread-2",
            },
            "pipelineId": "discord-source-1",
            "sourceTarget": "v1:slack:workspace-a:C123",
          },
          "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "leaseToken": "lease",
          "owner": "owner",
          "recordId": "record-1",
        },
      },
    ]


Number of calls: 1

 ❯ extensions/deliberation/src/plugin.test.ts:499:37
    497|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    498|
    499|     expect(km.completeDelivery).not.toHaveBeenCalled();
       |                                     ^
    500|   });
    501|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

[test] failed 1 Vitest shard in 11.36s
```

## GREEN Phase

- **Timestamp:** 2026-08-22T12:20:07.820187+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 18ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not register final delivery while Deliberation is disabled 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer 3ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers an explicit Slack root without manufacturing a thread 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers a Discord source anchor through the channel-owned anchor operation 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails an oversized result without sending multiple Discord messages 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails a Slack destination whose explicit account is not configured 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves Slack delivery unresolved when the provider returns no platform message id 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is conflict 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord for an empty queue 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'unknown Discord sentinel' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'padded noncanonical ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'missing primary ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'different receipt ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'multiple receipt parts' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes producer authority at intake without a reservation-time target override 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects unrelated caller-controlled intake fields before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 9ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a degraded listener identity as a valid health response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runner 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a successful response without closed durable invocation evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose immutable pipeline differs from the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects historical attempt envelopes belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing reserveIdempotencyKey 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects active delivery attempts with null envelope evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'RESERVATION_ABANDONED' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'NOT_SENT' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts retained 'DELIVERY_UNKNOWN' audit attempts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 0 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 1 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed terminal failure evidence 2 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerFailureClass' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'providerEvidence' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invalid optional terminal field 'terminalReason' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a malformed ready delivery envelope at its field boundary 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'Teams' before adapter validation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts generic KM wire target 'slack' before adapter validation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target undefined 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(2) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(4) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay' 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real discord adapter single-attempt capability 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > requires the real slack adapter single-attempt capability 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > carries the durable key into one Discord native request 7ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an ambiguous Discord native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects over-limit Discord text before a native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > uses one Slack native post and records unsupported idempotency honestly 3ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > does not retry an accepted-then-error Slack native request 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-composition.test.ts > Deliberation native adapter composition > rejects Slack text that renders into multiple messages before posting 2ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > derives a stable provider attempt identity that fits native Discord nonces 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Slack -> Discord' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Discord -> Slack' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Discord -> Discord' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes 'Slack -> Slack' by destination alone and binds the exact receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a malformed ready target before reservation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a reservation target mismatch before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects an unsupported destination before invocation or provider send 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves a post-invocation transport outcome unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a definitive adapter rejection without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves an ambiguous adapter outcome unresolved without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > leaves an invoked attempt unresolved when provider receipt evidence is invalid 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > does not retry a send when KM rejects completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 0 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 1 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 2 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 3 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 4 before durable invocation 0ms

 Test Files  4 passed (4)
      Tests  117 passed (117)
   Start at  14:20:03
   Duration  3.82s (transform 2.22s, setup 94ms, import 3.57s, tests 74ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 6.77s
```
