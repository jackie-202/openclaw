# TDD Red-Green Proof: bold-dune-7459

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-dune-7459","command":["pnpm","test","extensions/deliberation/src/final-adapter.test.ts","extensions/deliberation/src/plugin.test.ts","extensions/deliberation/src/config.test.ts","extensions/deliberation/src/sole-send.test.ts","--","--reporter=verbose"],"command_sha256":"d74760bf3f10803f4dd1e8ed63401c9f96da440f62ef5c822cdbf694cb127fab"} -->

## RED Phase
- **Timestamp:** 2026-08-16T22:11:17.862802+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes the exact route and restricted-session sets 34ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts an optional canonical final delivery target 1ms
 × |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts any number of canonical Slack sources while keeping processing Discord-only 4ms
   → [
  {
    "code": "invalid_value",
    "values": [
      "discord"
    ],
    "path": [
      "deliveryTarget",
      "provider"
    ],
    "message": "Invalid input: expected \"discord\""
  }
]
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts a credential materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], unknown: true } (unknown keys) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: false, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (non-fail-closed mode) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' }, { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (duplicate routes) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'source' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (processing overlap) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'channel:bad' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (malformed source identity component) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'channel:bad' } } (malformed delivery identity component) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'delivery', threadId: 'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt' } } (oversized delivery thread identity) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'delivery', unknown: true } } (unknown delivery route property) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'http://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (non-loopback HTTP KM) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: '', requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (empty credential) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000, pollIntervalMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (retired polling config) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.example.com/api as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.0.0.1:8765/deliberation as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://[::1]:8765/deliberation as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.0.0.1 as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://[::1] as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://localhost:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://192.168.1.10:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://evil.example.com as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.1:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://user@km.invalid as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://@km.invalid as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid?mode=test as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid? as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid/#fragment as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid/# as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest endpoint pattern aligned with runtime validation 2ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest credential schema aligned with secrets materialization 0ms
 × |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the optional manifest delivery route aligned with runtime validation 3ms
   → expected { Object ($ref) } to deeply equal { '$ref': '#/$defs/deliveryTarget' }
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 2ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not register final delivery while Deliberation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer 3ms
 × |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread 2ms
   → expected "vi.fn()" to be called 1 times, but got 0 times
 × |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread 1ms
   → expected "vi.fn()" to be called 1 times, but got 0 times
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails an oversized result without sending multiple Discord messages 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is conflict 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord for an empty queue 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > contains provider failures and records FAILED 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one Slack-origin result to its canonical Discord thread 1ms
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Slack'-origin result only to its canonical Slack thread 2ms
   → KM returned an invalid deliveryTarget
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Discord'-origin result only to its canonical Slack thread 0ms
   → KM returned an invalid deliveryTarget
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a malformed ready target before reservation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a reservation target mismatch before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a provider failure without retrying it 0ms
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects unbounded provider receipt evidence after one provider call 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
-     "outcome": "FAILED",
-     "providerFailureClass": "rejection",
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
+     "outcome": "SENT",
+     "providerAttemptId": "provider:attempt-1",
+     "providerMessageId": "message-1",
+     "providerReceiptId": "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'permission' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'rate limit' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'transport' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'timeout' failures 0ms
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack missing scope' failures 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "request contained xoxb-secret",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack not in channel' failures 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "not in channel",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack inaccessible target' failures 0ms
 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack authentication' failures 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "bad token",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack rate limit' failures 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "rate_limit",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_rate_limited_error",
+       "detail": "rate limited",
+       "retryAfterSeconds": 2,
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 × |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack nested transport' failures 1ms
   → expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "transport",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_request_error",
+       "detail": "request failed",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 0 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 1 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 2 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 3 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/sole-send.test.ts > durable send ownership > does not activate a durable sender without destination authority 1ms
 ✓ |extensions| extensions/deliberation/src/sole-send.test.ts > durable send ownership > keeps channel outbound calls in the registered final-delivery owner 1ms

 Test Files  3 failed | 1 passed (4)
      Tests  12 failed | 57 passed (69)
   Start at  00:11:16
   Duration  1.42s (transform 661ms, setup 262ms, import 986ms, tests 75ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯ Failed Tests 12 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts any number of canonical Slack sources while keeping processing Discord-only
ZodError: [
  {
    "code": "invalid_value",
    "values": [
      "discord"
    ],
    "path": [
      "deliveryTarget",
      "provider"
    ],
    "message": "Invalid input: expected \"discord\""
  }
]
 ❯ parseDeliberationConfig extensions/deliberation/src/config.ts:93:31
     91|
     92| export function parseDeliberationConfig(value: unknown): DeliberationC…
     93|   const parsed = configSchema.parse(value);
       |                               ^
     94|   const sourceKeys = new Set(parsed.sources.map(routeKey));
     95|   if (sourceKeys.size !== parsed.sources.length) {
 ❯ extensions/deliberation/src/config.test.ts:84:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { _zod: { def: [ { code: 'invalid_value', values: [ 'discord' ], path: [ 'deliveryTarget', 'provider' ], message: 'Invalid input: expected "discord"' } ], constr: 'Function<ZodError>', traits: { constructor: 'Function<Set>', has: 'Function<has>', add: 'Function<add>', delete: 'Function<delete>', difference: 'Function<difference>', clear: 'Function<clear>', entries: 'Function<entries>', forEach: 'Function<forEach>', intersection: 'Function<intersection>', isSubsetOf: 'Function<isSubsetOf>', isSupersetOf: 'Function<isSupersetOf>', isDisjointFrom: 'Function<isDisjointFrom>', size: 2, symmetricDifference: 'Function<symmetricDifference>', union: 'Function<union>', values: 'Function<values>', keys: 'Function<values>' }, deferred: [] }, issues: [ { code: 'invalid_value', values: [ 'discord' ], path: [ 'deliveryTarget', 'provider' ], message: 'Invalid input: expected "discord"' } ], format: 'Function<value>', flatten: 'Function<value>', addIssue: 'Function<value>', addIssues: 'Function<value>', isEmpty: false }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/12]⎯

 FAIL  |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the optional manifest delivery route aligned with runtime validation
AssertionError: expected { Object ($ref) } to deeply equal { '$ref': '#/$defs/deliveryTarget' }

- Expected
+ Received

  {
-   "$ref": "#/$defs/deliveryTarget",
+   "$ref": "#/$defs/discordDeliveryTarget",
  }

 ❯ extensions/deliberation/src/config.test.ts:231:61
    229|       $ref: "#/$defs/discordRoute",
    230|     });
    231|     expect(manifest.configSchema.properties.deliveryTarget).toEqual({
       |                                                             ^
    232|       $ref: "#/$defs/deliveryTarget",
    233|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Slack'-origin result only to its canonical Slack thread
 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Discord'-origin result only to its canonical Slack thread
Error: KM returned an invalid deliveryTarget
 ❯ parseKmDeliveryTarget extensions/deliberation/src/delivery-target.ts:23:11
     21|   const parsed = kmDeliveryTargetSchema.safeParse(value);
     22|   if (!parsed.success) {
     23|     throw new Error(`KM returned an invalid ${field}`);
       |           ^
     24|   }
     25|   return parsed.data;
 ❯ Object.runOnce extensions/deliberation/src/final-adapter.ts:100:27
 ❯ extensions/deliberation/src/final-adapter.test.ts:121:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects unbounded provider receipt evidence after one provider call
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
-     "outcome": "FAILED",
-     "providerFailureClass": "rejection",
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
+     "outcome": "SENT",
+     "providerAttemptId": "provider:attempt-1",
+     "providerMessageId": "message-1",
+     "providerReceiptId": "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:328:33
    326|
    327|     expect(provider.send).toHaveBeenCalledTimes(1);
    328|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    329|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    330|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack missing scope' failures
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "request contained xoxb-secret",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:425:33
    423|     } as never).runOnce();
    424|
    425|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    426|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    427|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack not in channel' failures
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "not in channel",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:425:33
    423|     } as never).runOnce();
    424|
    425|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    426|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    427|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack authentication' failures
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "permission",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_platform_error",
+       "detail": "bad token",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:425:33
    423|     } as never).runOnce();
    424|
    425|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    426|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    427|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack rate limit' failures
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "rate_limit",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_rate_limited_error",
+       "detail": "rate limited",
+       "retryAfterSeconds": 2,
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:425:33
    423|     } as never).runOnce();
    424|
    425|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    426|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    427|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/12]⎯

 FAIL  |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack nested transport' failures
AssertionError: expected "vi.fn()" to be called with arguments: [ ObjectContaining{…} ]

Received:

  1st vi.fn() call:

  [
-   ObjectContaining {
+   {
+     "attemptedTarget": {
+       "accountId": "account-1",
+       "channelId": "channel-1",
+       "provider": "discord",
+     },
      "outcome": "FAILED",
-     "providerFailureClass": "transport",
+     "providerAttemptId": "provider:attempt-1",
+     "providerEvidence": {
+       "code": "slack_webapi_request_error",
+       "detail": "request failed",
+     },
+     "providerFailureClass": "rejection",
+     "reservation": {
+       "attemptId": "attempt-1",
+       "deliveryEnvelope": {
+         "deliveryTarget": {
+           "accountId": "account-1",
+           "channelId": "channel-1",
+           "provider": "discord",
+         },
+         "sourceTarget": "v1:discord:account-1:channel-1",
+       },
+       "deliveryEnvelopeDigest": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
+       "leaseToken": "lease",
+       "owner": "owner",
+       "recordId": "record-1",
+     },
    },
  ]


Number of calls: 1

 ❯ extensions/deliberation/src/final-adapter.test.ts:425:33
    423|     } as never).runOnce();
    424|
    425|     expect(km.completeDelivery).toHaveBeenCalledWith(
       |                                 ^
    426|       expect.objectContaining({ outcome: "FAILED", providerFailureClas…
    427|     );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/12]⎯

 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread
 FAIL  |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
 ❯ extensions/deliberation/src/plugin.test.ts:217:25
    215|     await services[0]?.stop?.({ config: api.config, stateDir: "/tmp", …
    216|
    217|     expect(loadAdapter).toHaveBeenCalledTimes(1);
       |                         ^
    218|     expect(loadAdapter).toHaveBeenCalledWith("slack");
    219|     expect(discordSendText).not.toHaveBeenCalled();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/12]⎯

[test] failed 1 Vitest shard in 5.12s
````

## GREEN Phase
- **Timestamp:** 2026-08-16T22:12:57.217083+00:00
- **Test command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output
````text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes the exact route and restricted-session sets 19ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts an optional canonical final delivery target 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts any number of canonical Slack sources while keeping processing Discord-only 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts a credential materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], unknown: true } (unknown keys) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: false, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (non-fail-closed mode) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' }, { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (duplicate routes) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'source' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (processing overlap) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'channel:bad' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (malformed source identity component) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'channel:bad' } } (malformed delivery identity component) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'delivery', threadId: 'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt' } } (oversized delivery thread identity) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'delivery', unknown: true } } (unknown delivery route property) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'http://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (non-loopback HTTP KM) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: '', requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (empty credential) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ], processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000, pollIntervalMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ] } (retired polling config) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.example.com/api as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.0.0.1:8765/deliberation as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://[::1]:8765/deliberation as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.0.0.1 as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://[::1] as true 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://localhost:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://192.168.1.10:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://evil.example.com as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint http://127.1:8765 as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://user@km.invalid as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://@km.invalid as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid?mode=test as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid? as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid/#fragment as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > validates KM endpoint https://km.invalid/# as false 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest endpoint pattern aligned with runtime validation 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest credential schema aligned with secrets materialization 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the optional manifest delivery route aligned with runtime validation 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > registers fail-closed hooks, read-only KM health, and one final sender 2ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not register final delivery while Deliberation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one ready item through the exact Discord account and stops its timer 3ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Slack-origin item through the exact Slack account and thread 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > delivers one Discord-origin item through the exact Slack account and thread 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > fails an oversized result without sending multiple Discord messages 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is disabled 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord when reservation is conflict 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > does not call Discord for an empty queue 0ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > contains provider failures and records FAILED 1ms
 ✓ |extensions| extensions/deliberation/src/plugin.test.ts > deliberation plugin boundary > serializes repeated ticks and waits for the active tick during stop 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one Slack-origin result to its canonical Discord thread 1ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Slack'-origin result only to its canonical Slack thread 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > routes one 'Discord'-origin result only to its canonical Slack thread 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > uses the durable delivery target for send and all evidence 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a malformed ready target before reservation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects a reservation target mismatch before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > durably invokes once, calls only the injected provider, and binds its receipt 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > terminalizes a provider failure without retrying it 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects unbounded provider receipt evidence after one provider call 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'permission' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'rate limit' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'transport' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'timeout' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack missing scope' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack not in channel' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack inaccessible target' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack authentication' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack rate limit' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > classifies structured provider 'Slack nested transport' failures 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 0 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 1 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 2 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/final-adapter.test.ts > public final delivery adapter > rejects malformed destination 3 before durable invocation 0ms
 ✓ |extensions| extensions/deliberation/src/sole-send.test.ts > durable send ownership > does not activate a durable sender without destination authority 1ms
 ✓ |extensions| extensions/deliberation/src/sole-send.test.ts > durable send ownership > keeps channel outbound calls in the registered final-delivery owner 1ms

 Test Files  4 passed (4)
      Tests  69 passed (69)
   Start at  00:12:56
   Duration  769ms (transform 299ms, setup 78ms, import 579ms, tests 45ms, environment 0ms)

````

### Standard Error
````text
$ node scripts/test-projects.mjs extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 3.57s
````
