# TDD Red-Green Proof: swift-peak-3523

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-peak-3523","command":["pnpm","test","extensions/deliberation/src/route-match.test.ts","extensions/deliberation/src/hooks.test.ts","extensions/deliberation/src/km-client.test.ts","extensions/deliberation/src/contract.test.ts","extensions/deliberation/scripts/intake-producer.test.ts","--","--reporter=verbose"],"command_sha256":"dfd6890cc0f1dcbedd6479c2d3f70b5933f7f8e20cca5d12b9ee855f85d2e4bc"} -->

## RED Phase

- **Timestamp:** 2026-08-21T10:04:00.253796+00:00
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 37ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller-selected delivery targets before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 12ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses the canonical protocol header and reservations route 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects health responses outside the accepted closed schema 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts a degraded listener identity as a valid health response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection listener 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runner 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed nested health projection runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses a credential already materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > uses only the six canonical endpoint paths 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a successful response without closed durable invocation evidence 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose envelope differs from the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key 0ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(3) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > registers Slack child-to-thread identity before sending the unchanged KM intake body 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > fails Slack intake closed when an existing child mapping conflicts 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps two configured channels under one Discord account distinct 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > persists the live Discord event once through the closed KM wire contract 5ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped reported .816Z regression event 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > queues and terminally claims the configured Discord source only 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes blank-text audio with a MIME-only placeholder 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'disabled config' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'processing route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'unmatched route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'non-Discord route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing account' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing target' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing message id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing sender id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'empty content' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > warns about KM failure without leaking message or media values 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > keeps the configured final target out of source intake 5ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials 2ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects malformed producer input before making a request 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a processing route 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a wrong account route 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 3ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 14ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 8ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 7ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 3ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 6ms
 × |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > selects the pipeline and anchors an omitted target to the root source message 8ms
   → expected { accepted: true, …(5) } to match object { accepted: true, …(2) }
(8 matching properties omitted from actual)
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > accepts one exact configured source identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > keeps a Slack reply's child identity separate from its normalized thread identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses a Slack root message timestamp as both event and thread identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack unconfigured account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack unconfigured channel 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting channel 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting child id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting sender 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack malformed child timestamp 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack malformed thread timestamp 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack thread later than child 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects processing 2ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects wrong account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported kind 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects oversized id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing kind 0ms

 Test Files  1 failed | 4 passed (5)
      Tests  1 failed | 138 passed (139)
   Start at  12:03:56
   Duration  4.03s (transform 1.51s, setup 1.57s, import 1.57s, tests 174ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 7513, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > selects the pipeline and anchors an omitted target to the root source message
AssertionError: expected { accepted: true, …(5) } to match object { accepted: true, …(2) }
(8 matching properties omitted from actual)

- Expected
+ Received

  {
    "accepted": true,
-   "deliveryTarget": {
-     "account": "account-a",
-     "channel": "source",
-     "provider": "discord",
-     "threadId": "message-1",
-   },
-   "pipelineId": "discord-account-a",
  }

 ❯ extensions/deliberation/src/route-match.test.ts:59:56
     57| describe("Deliberation source admission", () => {
     58|   it("selects the pipeline and anchors an omitted target to the root s…
     59|     expect(admitInboundSource(config, event, context)).toMatchObject({
       |                                                        ^
     60|       accepted: true,
     61|       pipelineId: "discord-account-a",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 90.60s
```

## GREEN Phase

- **Timestamp:** 2026-08-21T10:11:29.209384+00:00
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 23ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose envelope differs from the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects invocation evidence whose attempted target drifts 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence that does not belong to the reservation 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects completion evidence with another reservation idempotency key 0ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects missing or malformed durable delivery target { provider: 'discord', …(3) } 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed source provenance in a delivery envelope 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a ready envelope belonging to another record 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelope' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'deliveryEnvelopeDigest' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'reviewedTextHash' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'record identity' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'ready provenance' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'request owner' 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed reservation 'stale ready replay' 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > selects the pipeline and anchors an omitted target to the root source message 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > accepts one exact configured source identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > keeps a Slack reply's child identity separate from its normalized thread identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses a Slack root message timestamp as both event and thread identity 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > matches a Discord child through its authenticated parent and preserves the child thread 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses an explicit root target without inheriting the Discord source thread 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack unconfigured account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack unconfigured channel 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting channel 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting child id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack conflicting sender 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack malformed child timestamp 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack malformed thread timestamp 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects Slack thread later than child 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects processing 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects wrong account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported kind 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting parent 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects thread id that contradicts the child conversation 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects oversized id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing kind 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > registers Slack child-to-thread identity before sending the unchanged KM intake body 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > fails Slack intake closed when an existing child mapping conflicts 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps two configured channels under one Discord account distinct 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > persists the live Discord event once through the closed KM wire contract 4ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped reported .816Z regression event 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > queues and terminally claims the configured Discord source only 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes blank-text audio with a MIME-only placeholder 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'disabled config' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'processing route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'unmatched route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'non-Discord route' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing account' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing target' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing message id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'missing sender id' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > logs the 'empty content' skip without intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > warns about KM failure without leaking message or media values 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences but does not intake a source event without a stable message ID 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > silences exact sources independently of KM 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > blocks send tools and canonical sends for restricted sessions 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps source traffic silent while v2 work is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > suppresses every configured pipeline source after accepted intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > suppresses every configured pipeline source after rejected intake 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > suppresses every configured pipeline source after disabled processing 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > suppresses every configured pipeline source after empty content 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > suppresses every configured pipeline source after KM failure 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > derives omitted Discord root and child targets from authenticated source context 4ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > uses an explicit target exactly and never inherits the Slack source thread 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > derives omitted Slack root and child targets while keeping separate event identities 2ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes no request for no match evidence 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes no request for contradictory account evidence 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes no request for contradictory parent evidence 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects duplicate and malformed canonical producer config before transport 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 2ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner revision and owner files 0ms

 Test Files  5 passed (5)
      Tests  149 passed (149)
   Start at  12:11:28
   Duration  574ms (transform 252ms, setup 104ms, import 307ms, tests 78ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.64s
```
