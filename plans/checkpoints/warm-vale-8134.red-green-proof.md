# TDD Red-Green Proof: warm-vale-8134

<!-- proof-capture-metadata: {"version":1,"task_id":"warm-vale-8134","command":["pnpm","test","extensions/deliberation/src/config.test.ts","--","--reporter=verbose"],"command_sha256":"8567b026ec658b6c1dae64d4d9d4e594b541cc0cc97b031a278e9625838f5447"} -->

## RED Phase

- **Timestamp:** 2026-08-21T08:33:19.301552+00:00
- **Test command:** `pnpm test extensions/deliberation/src/config.test.ts -- --reporter=verbose`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 × |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes canonical pipelines as the sole runtime authority 27ms
   → [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": [
      "sources"
    ],
    "message": "Invalid input: expected array, received undefined"
  },
  {
    "code": "unrecognized_keys",
    "keys": [
      "pipelines"
    ],
    "path": [],
    "message": "Unrecognized key: \"pipelines\""
  }
]
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes the exact route and restricted-session sets 1ms
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
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest endpoint pattern aligned with runtime validation 2ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the manifest credential schema aligned with secrets materialization 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the optional manifest delivery route aligned with runtime validation 1ms

 Test Files  1 failed (1)
      Tests  1 failed | 33 passed (34)
   Start at  10:33:18
   Duration  377ms (transform 156ms, setup 158ms, import 94ms, tests 37ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/config.test.ts -- --reporter=verbose
[test] queued behind the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 45s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 31s for the local heavy-check lock held by test, pid 59174, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.extensions.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes canonical pipelines as the sole runtime authority
ZodError: [
  {
    "expected": "array",
    "code": "invalid_type",
    "path": [
      "sources"
    ],
    "message": "Invalid input: expected array, received undefined"
  },
  {
    "code": "unrecognized_keys",
    "keys": [
      "pipelines"
    ],
    "path": [],
    "message": "Unrecognized key: \"pipelines\""
  }
]
 ❯ parseDeliberationConfig extensions/deliberation/src/config.ts:93:31
     91|
     92| export function parseDeliberationConfig(value: unknown): DeliberationC…
     93|   const parsed = configSchema.parse(value);
       |                               ^
     94|   const sourceKeys = new Set(parsed.sources.map(routeKey));
     95|   if (sourceKeys.size !== parsed.sources.length) {
 ❯ extensions/deliberation/src/config.test.ts:40:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { _zod: { def: [ { expected: 'array', code: 'invalid_type', path: [ 'sources' ], message: 'Invalid input: expected array, received undefined' }, { code: 'unrecognized_keys', keys: [ 'pipelines' ], path: [], message: 'Unrecognized key: "pipelines"' } ], constr: 'Function<ZodError>', traits: { constructor: 'Function<Set>', has: 'Function<has>', add: 'Function<add>', delete: 'Function<delete>', difference: 'Function<difference>', clear: 'Function<clear>', entries: 'Function<entries>', forEach: 'Function<forEach>', intersection: 'Function<intersection>', isSubsetOf: 'Function<isSubsetOf>', isSupersetOf: 'Function<isSupersetOf>', isDisjointFrom: 'Function<isDisjointFrom>', size: 2, symmetricDifference: 'Function<symmetricDifference>', union: 'Function<union>', values: 'Function<values>', keys: 'Function<values>' }, deferred: [] }, issues: [ { expected: 'array', code: 'invalid_type', path: [ 'sources' ], message: 'Invalid input: expected array, received undefined' }, { code: 'unrecognized_keys', keys: [ 'pipelines' ], path: [], message: 'Unrecognized key: "pipelines"' } ], format: 'Function<value>', flatten: 'Function<value>', addIssue: 'Function<value>', addIssues: 'Function<value>', isEmpty: false }
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 100.82s
```

## GREEN Phase

- **Timestamp:** 2026-08-21T08:50:52.221484+00:00
- **Test command:** `pnpm test extensions/deliberation/src/config.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes canonical pipelines as the sole runtime authority 19ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes legacy and canonical inputs to the same runtime representation 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps source-default targets omitted and accepts explicit provider roots 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > derives a common explicit target only when every pipeline has the same target 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > accepts a credential materialized by the secrets runtime 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ], sources: [ { channel: 'discord', accountId: 'acct', target: 'source' } ] } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ], deliveryTarget: { provider: 'discord', accountId: 'acct', channelId: 'delivery' } } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } }, { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } }, { id: 'other-id', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'source' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer', 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } deterministically 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ], unknown: true } (unknown config key) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: false, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } (non-fail-closed mode) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'bad id', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } (malformed id) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'channel:bad' } } ] } (malformed source identity) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' }, target: { channel: 'discord', accountId: 'acct', target: 'channel:bad' } } ] } (malformed target identity) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' }, target: { channel: 'discord', accountId: 'acct', target: 'delivery', inheritThread: true } } ] } (unknown thread inheritance) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' }, target: { channel: 'slack', accountId: 'acct', target: 'C123', threadId: 'child-event-id' } } ] } (invalid Slack thread) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' }, target: { channel: 'discord', accountId: 'acct', target: 'delivery', threadId: 'ttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt' } } ] } (oversized Discord thread) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'http://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } (non-loopback HTTP KM) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: '', requestTimeoutMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } (empty credential) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > rejects malformed config: { enabled: true, failClosed: true, processingSource: { channel: 'discord', accountId: 'acct', target: 'processing' }, km: { endpoint: 'https://km.invalid', credential: { source: 'env', provider: 'default', id: 'KM_TOKEN' }, requestTimeoutMs: 1000, pollIntervalMs: 1000 }, restrictedSessionKeys: [ 'agent:reviewer' ], pipelines: [ { id: 'discord-source', source: { channel: 'discord', accountId: 'acct', target: 'source' } } ] } (retired polling config) 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > preserves the stricter legacy Slack target contract while normalizing it 0ms
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
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the exclusive manifest branches aligned with runtime config 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps manifest KM and credential constraints aligned with runtime validation 0ms

 Test Files  1 passed (1)
      Tests  40 passed (40)
   Start at  10:50:52
   Duration  183ms (transform 67ms, setup 61ms, import 28ms, tests 28ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts
[test] passed 1 Vitest shard in 2.85s
```
