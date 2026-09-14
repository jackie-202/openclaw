# TDD Red-Green Proof: quick-vale-3780

## RED Phase

- **Provenance:** Historical genuine RED recorded before the preserved implementation in `plans/checkpoints/bright-mist-3363.red-green-proof.md:5`.
- **Test command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`
- **Result:** 3 failed, 43 passed.
- **Relevant failures:** The deferred setup watchdog omitted stage diagnostics; cancelled preparation dispatched the model after release; setup progress was not reported.

This follow-up reuses the genuine pre-implementation RED rather than fabricating a post-implementation failure. Fresh verification is recorded below after the missing regression assertions are added.

## GREEN Phase

- **Test files:** `src/cron/service/timer.regression.test.ts`, `src/cron/isolated-agent/run.preparation-cancellation.test.ts`
- **Implementation files:** `src/cron/service/timer.regression.test.ts`
- **Test command:** `pnpm test src/cron/isolated-agent/run.preparation-cancellation.test.ts src/cron/service/timer.regression.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 47 passed.

### Test Output

```text
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > does not dispatch after a cancelled preparation await is released
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > retires a rolled persistent session after cancelled persistence settles
✓ |cron| src/cron/isolated-agent/run.preparation-cancellation.test.ts > isolated cron preparation cancellation > reports bounded ordered stages during successful preparation
✓ |cron| src/cron/service/timer.regression.test.ts > cron service timer regressions > records one staged timeout when deferred setup resolves late

Test Files  2 passed (2)
     Tests  47 passed (47)
Duration  2.10s
[test] passed 1 Vitest shard in 5.06s
```

### Compatibility Verification

- **Command:** `pnpm test src/gateway/server-cron.test.ts src/cron/isolated-agent/run.meta-error-status.test.ts src/cron/isolated-agent/run.skill-filter.test.ts -- --reporter=verbose`
- **Result:** 0 failed, 68 passed across Gateway and cron shards.

```text
✓ |gateway-server| ../../src/gateway/server-cron.test.ts > buildGatewayCronService > forwards setup progress from the cron watchdog to isolated runs
✓ |gateway-methods| ../../src/gateway/server-cron.test.ts > buildGatewayCronService > forwards setup progress from the cron watchdog to isolated runs

Test Files  2 passed (2)
     Tests  48 passed (48)

Test Files  2 passed (2)
     Tests  20 passed (20)
[test] passed 2 Vitest shards in 14.11s
```
