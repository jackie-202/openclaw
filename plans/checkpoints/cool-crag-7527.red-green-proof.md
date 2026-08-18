# TDD Red-Green Proof: cool-crag-7527

## RED Phase

TDD: skip - the required semantic gate failed before the planned assertion
change. The live owner contract is incompatible with the preserved generic
wire/provider-overlay architecture, so the plan requires no production or
test change.

## GREEN Phase

Not applicable to a provenance refresh. The fail-closed result preserves the
existing provenance pin; no test can legitimately turn the incompatible refresh
green without changing the contract architecture beyond this task's scope.

Focused preservation test:

```text
Test Files  1 passed (1)
Tests       8 passed (8)
[test] passed 1 Vitest shard in 16.36s
```

Command: `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/Projects/openclaw-fork/.tmp-cool-crag-7527-vitest-cache node scripts/run-vitest.mjs extensions/deliberation/src/contract.test.ts --reporter=verbose`

The planned `pnpm test` command waited on a user-owned heavy-check lock for two
minutes; the isolated repository runner then completed the same focused test
without modifying the locked test cache.
