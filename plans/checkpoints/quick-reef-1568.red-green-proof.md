# TDD Red-Green Proof: quick-reef-1568

<!-- proof-capture-metadata: {"version":1,"task_id":"quick-reef-1568","command":["pnpm","test","extensions/deliberation/src/route-match.test.ts","extensions/deliberation/src/hooks.test.ts","extensions/deliberation/src/km-client.test.ts","extensions/deliberation/scripts/intake-producer.test.ts","extensions/deliberation/src/contract.test.ts","--","--reporter=verbose"],"command_sha256":"f81dcad4e65ae4318685c6c3a26773a26a238e4a201ca06780c07d36e81cb1d2"} -->

## RED Phase

- **Timestamp:** 2026-08-17T08:02:10.743483+00:00
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller-selected delivery targets before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 11ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections 1ms
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
 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root 5ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.576000Z",
+     "provider": "discord",
+     "providerEventId": "m1",
+     "receivedAt": "2026-08-17T08:02:10.576000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:discord:acct:source",
-     "sourceThreadId": "m1",
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.581000Z",
+     "provider": "slack",
+     "providerEventId": "1723640000.000100",
+     "receivedAt": "2026-08-17T08:02:10.581000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply 0ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.581000Z",
+     "provider": "slack",
+     "providerEventId": "1723640000.000200",
+     "receivedAt": "2026-08-17T08:02:10.582000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > registers Slack child-to-thread identity before sending the unchanged KM intake body 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "reply",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.582000Z",
      "provider": "slack",
      "providerEventId": "1723640000.000200",
+     "receivedAt": "2026-08-17T08:02:10.582000Z",
+     "senderId": "U123",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

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
 × |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape 0ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
      "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.590000Z",
+     "provider": "discord",
      "providerEventId": "m1",
+     "receivedAt": "2026-08-17T08:02:10.590000Z",
+     "senderId": "sender-1",
      "sourceTarget": "v1:discord:acct:source",
-     "sourceThreadId": "m1",
    },
  ]


Number of calls: 1

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
 × |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > keeps the configured final target out of source intake 3ms
   → expected { provider: 'discord', …(7) } to match object { …(2) }
(7 matching properties omitted from actual)
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials 2ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects malformed producer input before making a request 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a processing route 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a wrong account route 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 0ms
 × |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
   → expected [ 'provider', 'providerEventId', …(5) ] to include 'sourceThreadId'
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the Slack-origin threaded Discord lifecycle fixture 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins the accepted KM owner files and identity vocabulary 0ms
 × |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > accepts one exact configured source identity 1ms
   → expected { accepted: true, …(4) } to deeply equal { accepted: true, …(5) }
 × |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > keeps a Slack reply's child identity separate from its normalized thread identity 0ms
   → expected { accepted: true, …(5) } to deeply equal { accepted: true, …(6) }
 × |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses a Slack root message timestamp as both event and thread identity 0ms
   → expected { accepted: true, …(5) } to match object { accepted: true, …(4) }
(5 matching properties omitted from actual)
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
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing kind 0ms

 Test Files  4 failed | 1 passed (5)
      Tests  10 failed | 123 passed (133)
   Start at  10:02:10
   Duration  554ms (transform 232ms, setup 90ms, import 313ms, tests 81ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 59465, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 59465, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 59465, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > keeps the configured final target out of source intake
AssertionError: expected { provider: 'discord', …(7) } to match object { …(2) }
(7 matching properties omitted from actual)

- Expected
+ Received

  {
    "sourceTarget": "v1:discord:default:1494265174389948538",
-   "sourceThreadId": "message-override",
  }

 ❯ extensions/deliberation/scripts/intake-producer.test.ts:70:22
     68|       );
     69|
     70|       expect(intake).toMatchObject({
       |                      ^
     71|         sourceTarget: "v1:discord:default:1494265174389948538",
     72|         sourceThreadId: "message-override",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle
AssertionError: expected [ 'provider', 'providerEventId', …(5) ] to include 'sourceThreadId'
 ❯ extensions/deliberation/src/contract.test.ts:136:50
    134|
    135|     expect(contract.schemas.intakeBody.properties).not.toHaveProperty(…
    136|     expect(contract.schemas.intakeBody.required).toContain("sourceThre…
       |                                                  ^
    137|     expect(contract.schemas.intakeBody.properties.sourceThreadId).toEq…
    138|       type: "string",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.576000Z",
+     "provider": "discord",
+     "providerEventId": "m1",
+     "receivedAt": "2026-08-17T08:02:10.576000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:discord:acct:source",
-     "sourceThreadId": "m1",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/hooks.test.ts:114:22
    112|       );
    113|
    114|       expect(intake).toHaveBeenCalledWith(
       |                      ^
    115|         expect.objectContaining({
    116|           sourceTarget: `v1:${provider}:${accountId}:${channelId}`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.581000Z",
+     "provider": "slack",
+     "providerEventId": "1723640000.000100",
+     "receivedAt": "2026-08-17T08:02:10.581000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/hooks.test.ts:114:22
    112|       );
    113|
    114|       expect(intake).toHaveBeenCalledWith(
       |                      ^
    115|         expect.objectContaining({
    116|           sourceTarget: `v1:${provider}:${accountId}:${channelId}`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.581000Z",
+     "provider": "slack",
+     "providerEventId": "1723640000.000200",
+     "receivedAt": "2026-08-17T08:02:10.582000Z",
+     "senderId": "sender",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/hooks.test.ts:114:22
    112|       );
    113|
    114|       expect(intake).toHaveBeenCalledWith(
       |                      ^
    115|         expect.objectContaining({
    116|           sourceTarget: `v1:${provider}:${accountId}:${channelId}`,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/10]⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > registers Slack child-to-thread identity before sending the unchanged KM intake body
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "content": "reply",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.582000Z",
      "provider": "slack",
      "providerEventId": "1723640000.000200",
+     "receivedAt": "2026-08-17T08:02:10.582000Z",
+     "senderId": "U123",
      "sourceTarget": "v1:slack:workspace-a:C123",
-     "sourceThreadId": "1723640000.000100",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/hooks.test.ts:174:20
    172|       threadId: "1723640000.000100",
    173|     });
    174|     expect(intake).toHaveBeenCalledWith(
       |                    ^
    175|       expect.objectContaining({
    176|         provider: "slack",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/10]⎯

 FAIL  |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > intakes the canonical Discord channel event shape
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
      "content": "message",
+     "eventType": "message",
+     "occurredAt": "2026-08-17T08:02:10.590000Z",
+     "provider": "discord",
      "providerEventId": "m1",
+     "receivedAt": "2026-08-17T08:02:10.590000Z",
+     "senderId": "sender-1",
      "sourceTarget": "v1:discord:acct:source",
-     "sourceThreadId": "m1",
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/hooks.test.ts:612:20
    610|     );
    611|
    612|     expect(intake).toHaveBeenCalledWith(
       |                    ^
    613|       expect.objectContaining({
    614|         providerEventId: "m1",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/10]⎯

 FAIL  |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > accepts one exact configured source identity
AssertionError: expected { accepted: true, …(4) } to deeply equal { accepted: true, …(5) }

- Expected
+ Received

@@ -6,7 +6,6 @@
      "channel": "discord",
      "target": "source",
    },
    "senderId": "sender-1",
    "sourceTarget": "v1:discord:account-a:source",
-   "sourceThreadId": "message-1",
  }

 ❯ extensions/deliberation/src/route-match.test.ts:44:56
     42| describe("Deliberation source admission", () => {
     43|   it("accepts one exact configured source identity", () => {
     44|     expect(admitInboundSource(config, event, context)).toEqual({
       |                                                        ^
     45|       accepted: true,
     46|       route: { channel: "discord", accountId: "account-a", target: "so…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/10]⎯

 FAIL  |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > keeps a Slack reply's child identity separate from its normalized thread identity
AssertionError: expected { accepted: true, …(5) } to deeply equal { accepted: true, …(6) }

- Expected
+ Received

@@ -6,8 +6,7 @@
      "channel": "slack",
      "target": "C123",
    },
    "senderId": "U123",
    "sourceTarget": "v1:slack:workspace-a:C123",
-   "sourceThreadId": "1723640000.000100",
    "threadId": "1723640000.000100",
  }

 ❯ extensions/deliberation/src/route-match.test.ts:77:7
     75|         },
     76|       ),
     77|     ).toEqual({
       |       ^
     78|       accepted: true,
     79|       route: { channel: "slack", accountId: "workspace-a", target: "C1…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/10]⎯

 FAIL  |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > uses a Slack root message timestamp as both event and thread identity
AssertionError: expected { accepted: true, …(5) } to match object { accepted: true, …(4) }
(5 matching properties omitted from actual)

- Expected
+ Received

  {
    "accepted": true,
    "providerEventId": "1723640000.000300",
    "sourceTarget": "v1:slack:workspace-b:C123",
-   "sourceThreadId": "1723640000.000300",
    "threadId": "1723640000.000300",
  }

 ❯ extensions/deliberation/src/route-match.test.ts:110:20
    108|     );
    109|
    110|     expect(result).toMatchObject({
       |                    ^
    111|       accepted: true,
    112|       sourceTarget: "v1:slack:workspace-b:C123",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/10]⎯

[test] failed 1 Vitest shard in 48.96s
```

## GREEN Phase

- **Timestamp:** 2026-08-17T08:06:09.168043+00:00
- **Test command:** `pnpm test extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > matches the accepted provenance hashes 30ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the exact canonical header, endpoints, and controls 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > mirrors the current KM endpoint and health contract 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > accepts the current closed projection fields 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > defines required source threads and generic structured targets across the lifecycle 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > keeps provider-specific destination evidence in the OpenClaw overlay 0ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > pins account-scoped Discord root, Slack root, and Slack reply intake vectors 1ms
 ✓ |extensions| extensions/deliberation/src/contract.test.ts > accepted Deliberation contracts > records the semantic handoff and unresolved owner pin without a stale hash claim 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Discord root 2ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack root 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > emits sourceThreadId for Slack reply 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > registers Slack child-to-thread identity before sending the unchanged KM intake body 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > fails Slack intake closed when an existing child mapping conflicts 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps configured Discord accounts distinct for the same channel 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > keeps two configured channels under one Discord account distinct 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > persists the live Discord event once through the closed KM wire contract 13ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > excludes processing before KM intake and never claims 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'source' 1ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'default' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > submits canonical source intake for account 'work' and target 'channel:source' 0ms
 ✓ |extensions| extensions/deliberation/src/hooks.test.ts > deliberation hooks > sends canonical KM timestamps for a live-shaped exact second event 1ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > serializes the required source thread identity with exact camelCase casing 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports an unavailable credential at the credential stage 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'transport' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'response-json' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with canonical code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports bounded 'http with unknown code' diagnostics 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > reports response-schema after a successful malformed intake response 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller debounce overrides before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > injects only the configured delivery target at the durable reservation boundary 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds an exact Slack target and provider receipt through the KM lifecycle 2ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > binds bounded Slack failure evidence to KM completion without target drift 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects a terminal reason that contradicts the delivery outcome 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects caller-selected delivery targets before transport 0ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > emits only transport metadata accepted by the closed KM contract 4ms
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
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > accepts bounded drafting diagnostics from record projections 1ms
 ✓ |extensions| extensions/deliberation/src/km-client.test.ts > KM contract parsing > rejects malformed closed ready and record responses 2ms
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
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > keeps the configured final target out of source intake 3ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > validates input and reports duplicate replay without exposing content or credentials 2ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > rejects malformed producer input before making a request 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > returns bounded KM rejection diagnostics 1ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a processing route 0ms
 ✓ |extensions| extensions/deliberation/scripts/intake-producer.test.ts > deliberation intake producer > makes zero KM requests for a wrong account route 0ms
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
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects processing 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects wrong account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects unsupported kind 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects conflicting id 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects malformed target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string target 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects non-string account 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing provider 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing event 0ms
 ✓ |extensions| extensions/deliberation/src/route-match.test.ts > Deliberation source admission > rejects missing kind 0ms

 Test Files  5 passed (5)
      Tests  134 passed (134)
   Start at  10:06:08
   Duration  666ms (transform 234ms, setup 128ms, import 354ms, tests 93ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/route-match.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/contract.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 4.25s
```
