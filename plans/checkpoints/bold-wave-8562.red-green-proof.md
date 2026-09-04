# TDD Red-Green Proof: bold-wave-8562

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-wave-8562","command":["pnpm","test","extensions/deliberation/src/delivery-probe.test.ts","extensions/deliberation/src/km-client.test.ts","--","--reporter=verbose"],"command_sha256":"a6caf3b8901c1c6608fa4a1b2eea5616cb6b3e01bc5f89b1b4273ba8ad4956c1"} -->

## RED Phase

- **Timestamp:** 2026-08-25T10:05:26.922241+00:00
- **Test command:** `pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 25ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields 2ms
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
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > is exported only from the non-plugin API boundary 593ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > runs the real ready/reserve/invoke/complete lifecycle once and replays with zero calls 4ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > reports the reserve stage for a target mismatch without calling the provider 2ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'authentication' diagnostics 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'protocol' diagnostics 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 0 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 1 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 2 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 3 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 4 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 × |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 5 0ms
   → expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"

 Test Files  1 failed | 1 passed (2)
      Tests  11 failed | 75 passed (86)
   Start at  12:05:26
   Duration  866ms (transform 618ms, setup 298ms, import 337ms, tests 663ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > is exported only from the non-plugin API boundary
AssertionError: expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 ❯ extensions/deliberation/src/delivery-probe.test.ts:216:17
    214|     const plugin = await import("../index.js");
    215|
    216|     expect(api).toHaveProperty("runDeliberationDeliveryProbe");
       |                 ^
    217|     expect(plugin).not.toHaveProperty("runDeliberationDeliveryProbe");
    218|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > runs the real ready/reserve/invoke/complete lifecycle once and replays with zero calls
AssertionError: expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 ❯ probeFunction extensions/deliberation/src/delivery-probe.test.ts:207:15
    205| async function probeFunction(): Promise<ProbeFunction> {
    206|   const api = (await import("../api.js")) as Record<string, unknown>;
    207|   expect(api).toHaveProperty("runDeliberationDeliveryProbe");
       |               ^
    208|   return api.runDeliberationDeliveryProbe as ProbeFunction;
    209| }
 ❯ extensions/deliberation/src/delivery-probe.test.ts:225:24

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > reports the reserve stage for a target mismatch without calling the provider
AssertionError: expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 ❯ probeFunction extensions/deliberation/src/delivery-probe.test.ts:207:15
    205| async function probeFunction(): Promise<ProbeFunction> {
    206|   const api = (await import("../api.js")) as Record<string, unknown>;
    207|   expect(api).toHaveProperty("runDeliberationDeliveryProbe");
       |               ^
    208|   return api.runDeliberationDeliveryProbe as ProbeFunction;
    209| }
 ❯ extensions/deliberation/src/delivery-probe.test.ts:281:29

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'authentication' diagnostics
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'protocol' diagnostics
AssertionError: expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 ❯ probeFunction extensions/deliberation/src/delivery-probe.test.ts:207:15
    205| async function probeFunction(): Promise<ProbeFunction> {
    206|   const api = (await import("../api.js")) as Record<string, unknown>;
    207|   expect(api).toHaveProperty("runDeliberationDeliveryProbe");
       |               ^
    208|   return api.runDeliberationDeliveryProbe as ProbeFunction;
    209| }
 ❯ extensions/deliberation/src/delivery-probe.test.ts:332:29

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 0
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 1
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 2
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 3
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 4
 FAIL  |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 5
AssertionError: expected { [Symbol(Symbol.toStringTag)]: 'Mod…' } to have property "runDeliberationDeliveryProbe"
 ❯ probeFunction extensions/deliberation/src/delivery-probe.test.ts:207:15
    205| async function probeFunction(): Promise<ProbeFunction> {
    206|   const api = (await import("../api.js")) as Record<string, unknown>;
    207|   expect(api).toHaveProperty("runDeliberationDeliveryProbe");
       |               ^
    208|   return api.runDeliberationDeliveryProbe as ProbeFunction;
    209| }
 ❯ extensions/deliberation/src/delivery-probe.test.ts:368:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

[test] failed 1 Vitest shard in 4.15s
```

## GREEN Phase

- **Timestamp:** 2026-08-25T10:11:45.789298+00:00
- **Test command:** `pnpm test extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 18ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener 1ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts all schema-permitted record projection fields 2ms
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
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > is exported only from the non-plugin API boundary 543ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > runs the real ready/reserve/invoke/complete lifecycle once and replays with zero calls 18ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > reports the reserve stage for a target mismatch without calling the provider 4ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'authentication' diagnostics 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > returns bounded 'protocol' diagnostics 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 0 1ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 1 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 2 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 3 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 4 0ms
 ✓ |extensions| extensions/deliberation/src/delivery-probe.test.ts > public Deliberation delivery probe > refuses unsafe or provider-selecting input before I/O 5 0ms

 Test Files  2 passed (2)
      Tests  86 passed (86)
   Start at  12:11:45
   Duration  729ms (transform 418ms, setup 153ms, import 239ms, tests 628ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.38s
```
