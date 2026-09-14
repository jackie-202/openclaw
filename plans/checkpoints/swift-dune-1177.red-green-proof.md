# TDD Red-Green Proof: swift-dune-1177

## RED Phase

This acceptance repair reuses the genuine RED captured before the preserved production implementation in `plans/checkpoints/bright-mist-3363.red-green-proof.md`.

- **Parent task:** `bright-mist-3363`
- **Timestamp:** `2026-09-09T09:13:35.407480+00:00`
- **Command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`
- **Exit code:** `1`
- **Observed failures:** cancelled deferred workspace preparation dispatched the model once; successful preparation emitted no stages; deferred setup timeout omitted retained stage and elapsed diagnostics.
- **Exact output:** retained in `plans/checkpoints/bright-mist-3363.red-green-proof.md:5-193`.

No synthetic RED was created after the parent implementation. Fresh GREEN output for this repair will be appended below after the regression is strengthened to assert no late model dispatch.

## GREEN Phase

- **Timestamp:** `2026-09-09T10:40:27Z`
- **Command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`
- **Exit code:** `0`

### Output

```text
$ node scripts/test-projects.mjs src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose
[test] starting test/vitest/vitest.cron.config.ts

RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

✓ |cron| src/cron/service/timer.regression.test.ts > cron service timer regressions > records one staged timeout when deferred setup resolves late 55ms
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > does not dispatch after a cancelled preparation await is released 2ms
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > retires a rolled persistent session after cancelled persistence settles 173ms
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > reports bounded ordered stages during successful preparation 81ms

Test Files  2 passed (2)
Tests  47 passed (47)
Duration  1.78s

[test] passed 1 Vitest shard in 4.51s
```

The deferred watchdog case now also asserts that releasing setup after timeout does not cross the modeled model-dispatch boundary.
