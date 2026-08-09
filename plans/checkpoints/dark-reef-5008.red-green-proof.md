# RED/GREEN Proof: dark-reef-5008

## RED Phase

Created before production code. Focused regression tests have not yet been written or run.

The Slice 5B test cannot be written without inventing the unavailable KM envelope and invocation-ack schema. The checked-in KM contract exposes only `ready`, `reserve`, `complete`, and `reconcile`; the public SDK exposes only generic durable batch delivery, which is explicitly disallowed for this one-shot adapter.

## GREEN Phase

No production code was added because the plan's two required gates are absent. Existing ownership proof passed:

```text
$ pnpm test extensions/deliberation/src/sole-send.test.ts -- --reporter=verbose
Test Files  1 passed (1)
Tests  1 passed (1)
[test] passed 1 Vitest shard in 2.90s
```

Extension typecheck passed:

```text
$ pnpm tsgo:extensions
$ node scripts/run-tsgo.mjs -p tsconfig.extensions.json --incremental --tsBuildInfoFile .artifacts/tsgo-cache/extensions.tsbuildinfo
```
