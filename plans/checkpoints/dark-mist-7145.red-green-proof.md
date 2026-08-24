# TDD Red-Green Proof: dark-mist-7145

<!-- proof-capture-metadata: {"version":1,"task_id":"dark-mist-7145","command":["pnpm","test","extensions/deliberation/src/config.test.ts","--","--reporter=verbose"],"command_sha256":"8567b026ec658b6c1dae64d4d9d4e594b541cc0cc97b031a278e9625838f5447"} -->

Historical provenance: this follow-up preserves the genuine pre-production RED from `plans/checkpoints/warm-vale-8134.red-green-proof.md`; it was not recreated after implementation.

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

 Test Files  1 failed (1)
      Tests  1 failed | 33 passed (34)
   Start at  10:33:18
   Duration  377ms (transform 156ms, setup 158ms, import 94ms, tests 37ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

 FAIL  |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes canonical pipelines as the sole runtime authority
ZodError: strict legacy schema required `sources` and rejected the unrecognized `pipelines` key

[test] failed 1 Vitest shard in 100.82s
```

## GREEN Phase

- **Timestamp:** 2026-08-21T11:14:03
- **Test command:** `pnpm test extensions/deliberation/src/config.test.ts -- --reporter=verbose`
- **Exit code:** 0

### Standard Output

```text
$ node scripts/test-projects.mjs extensions/deliberation/src/config.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.extensions.config.ts

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes canonical pipelines as the sole runtime authority 24ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > normalizes legacy and canonical inputs to the same runtime representation 1ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps source-default targets omitted and accepts explicit provider roots 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > derives a common explicit target only when every pipeline has the same target 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > preserves the stricter legacy Slack target contract while normalizing it 0ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps the exclusive manifest branches aligned with runtime config 2ms
 ✓ |extensions| extensions/deliberation/src/config.test.ts > parseDeliberationConfig > keeps manifest KM and credential constraints aligned with runtime validation 1ms

 Test Files  1 passed (1)
      Tests  41 passed (41)
   Start at  11:14:03
   Duration  254ms (transform 104ms, setup 90ms, import 46ms, tests 35ms, environment 0ms)

[test] passed 1 Vitest shard in 47.50s
```
