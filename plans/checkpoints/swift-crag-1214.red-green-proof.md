# TDD Red-Green Proof: swift-crag-1214

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-crag-1214","command":["pnpm","test","extensions/deliberation/src/km-client.test.ts","extensions/deliberation/src/plugin.test.ts","--","--reporter=verbose"],"command_sha256":"b5daa23e93cea3218e265f425fb28bcf5a9b45162e49cc861266c0fdcceb9a28"} -->

## RED Phase

- **Timestamp:** 2026-08-25T09:57:47.265434+00:00
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 24ms
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 6ms
   → expected KmRequestError: KM request failed { …(3) } to match object { operation: 'health', …(4) }
(1 matching property omitted from actual)
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > identifies a failed ready request without exposing listener data 1ms
   → expected KmRequestError: KM request failed { …(3) } to match object { operation: 'ready', …(4) }
(1 matching property omitted from actual)
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes producer authority at intake without a reservation-time target override 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects unrelated caller-controlled intake fields before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 11ms
 × |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > does not duplicate the canonical API prefix from a configured endpoint 3ms
   → promise rejected "KmRequestError: KM request failed { …(3) }" instead of resolving
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'ordinal' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'reservedRecordVersion' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerReceiptId 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerMessageId 0ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a proven never-invoked abandonment before a fresh attempt 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-20 historical-attempt-drift-and-tamper-fail-closed 0ms
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
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 9ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not register final delivery while Deliberation is disabled 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer 2ms
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
 × |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > logs safe KM request metadata and retries after a ready failure 3ms
   → [Function warn] is not a spy or a call to a spy!
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'unknown Discord sentinel' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'padded noncanonical ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'missing primary ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'different receipt ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'multiple receipt parts' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 0ms

 Test Files  2 failed (2)
      Tests  4 failed | 92 passed (96)
   Start at  11:57:46
   Duration  736ms (transform 542ms, setup 197ms, import 796ms, tests 90ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage
AssertionError: expected KmRequestError: KM request failed { …(3) } to match object { operation: 'health', …(4) }
(1 matching property omitted from actual)

- Expected
+ Received

- {
+ KmRequestError {
    "code": "UNKNOWN",
-   "operation": "health",
-   "path": "/deliberation/v1/health",
    "stage": "credential",
    "status": undefined,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:304:33
    302|     const client = createKmClient({ config, openclawConfig: {} as neve…
    303|
    304|     await expect(client.health()).rejects.toMatchObject({
       |                                 ^
    305|       operation: "health",
    306|       path: "/deliberation/v1/health",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > identifies a failed ready request without exposing listener data
AssertionError: expected KmRequestError: KM request failed { …(3) } to match object { operation: 'ready', …(4) }
(1 matching property omitted from actual)

- Expected
+ Received

- {
+ KmRequestError {
    "code": "AUTH_INVALID",
-   "operation": "ready",
-   "path": "/deliberation/v1/ready",
    "stage": "http",
    "status": 401,
  }

 ❯ extensions/deliberation/src/km-client.test.ts:331:19
    329|
    330|     const error = await client.ready().catch((caught: unknown) => caug…
    331|     expect(error).toMatchObject({
       |                   ^
    332|       operation: "ready",
    333|       path: "/deliberation/v1/ready",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > does not duplicate the canonical API prefix from a configured endpoint
AssertionError: promise rejected "KmRequestError: KM request failed { …(3) }" instead of resolving
 ❯ extensions/deliberation/src/km-client.test.ts:772:34
    770|       });
    771|
    772|       await expect(client.ready()).resolves.toEqual({ items: [], nextC…
       |                                  ^
    773|       expect(requestedPath).toBe("/deliberation/v1/ready");
    774|     } finally {

Caused by: KmRequestError: KM request failed
 ❯ request extensions/deliberation/src/km-client.ts:1133:13
 ❯ Object.ready extensions/deliberation/src/km-client.ts:1191:9
 ❯ extensions/deliberation/src/km-client.test.ts:772:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { stage: 'http', status: 404, code: 'ROUTE_NOT_FOUND' }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > logs safe KM request metadata and retries after a ready failure
TypeError: [Function warn] is not a spy or a call to a spy!
 ❯ extensions/deliberation/src/plugin.test.ts:498:29
    496|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    497|
    498|     expect(api.logger.warn).toHaveBeenCalledWith(
       |                             ^
    499|       "deliberation: final delivery tick failed: operation=ready path=…
    500|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

[test] failed 1 Vitest shard in 3.45s
```

## GREEN Phase

- **Timestamp:** 2026-08-25T09:59:58.592746+00:00
- **Test command:** `pnpm test extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 21ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > identifies a failed ready request without exposing listener data 1ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 11ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > does not duplicate the canonical API prefix from a configured endpoint 3ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'ordinal' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another 'reservedRecordVersion' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts an exact completion replay 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects duplicate 'provider-attempt ID' completion evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > preserves a completion CAS conflict as an HTTP error 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects receipt evidence that differs from the submitted message pair 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerReceiptId 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects FAILED completion carrying a non-null providerMessageId 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects historical attempt envelopes belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects ready pagination outside the canonical query contract 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts missing reserveIdempotencyKey 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects terminal delivery attempts with null deliveryEnvelopeDigest 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects active delivery attempts with null envelope evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a proven never-invoked abandonment before a fresh attempt 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: NOT_SENT 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-19 legacy-not-sent-unknown-never-authorize-retry: DELIVERY_UNKNOWN 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > OR-20 historical-attempt-drift-and-tamper-fail-closed 0ms
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
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 10ms
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
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > logs safe KM request metadata and retries after a ready failure 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves a thrown provider outcome unresolved 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'unknown Discord sentinel' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'padded noncanonical ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'missing primary ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'different receipt ID' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > leaves 'multiple receipt parts' receipt evidence unresolved 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 0ms

 Test Files  2 passed (2)
      Tests  96 passed (96)
   Start at  11:59:57
   Duration  630ms (transform 379ms, setup 156ms, import 679ms, tests 80ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/plugin.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.27s
```
