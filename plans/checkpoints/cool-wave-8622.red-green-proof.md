# Red/Green Proof: cool-wave-8622

## RED Phase

Created before production code changes.

Planned failing coverage:

- strict-agentic GPT-5 promise-only actionable final text retries through the existing planning-only flow
- retry exhaustion returns the existing strict-agentic blocked path instead of finalizing the promise
- informational answers still finalize normally
- blocker/confirmation-style text still finalizes normally
- attempts with tool-progress evidence do not retry as promise-only

RED command to run after adding tests and before implementation:

```bash
pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose
```

RED result before production change:

```text
Test Files  1 failed (1)
Tests  2 failed | 120 passed (122)

Failed tests:
- retries strict-agentic promise-only actionable final text: expected runEmbeddedAttempt to be called 2 times, got 1
- uses the strict-agentic blocked path after promise-only retry exhaustion: expected runEmbeddedAttempt to be called 3 times, got 1
```

## GREEN Phase

Focused test command after implementation:

```bash
pnpm test src/agents/embedded-agent-runner/run.incomplete-turn.test.ts -- --reporter=verbose
```

Result:

```text
Test Files  1 passed (1)
Tests  123 passed (123)
```

Additional verification:

```bash
node scripts/run-oxlint.mjs src/agents/embedded-agent-runner/run/incomplete-turn.ts src/agents/embedded-agent-runner/run.incomplete-turn.test.ts
```

Result: passed.

```bash
git diff --check
```

Result: passed.

Broader static gates attempted:

```bash
pnpm lint src/agents/embedded-agent-runner/run/incomplete-turn.ts src/agents/embedded-agent-runner/run.incomplete-turn.test.ts
```

Result: failed outside the touched files because the sharded wrapper reported pre-existing `src/trajectory/runtime.ts:436:10` unused function `getTrajectoryWindowWriter`.

```bash
pnpm tsgo:core:test
```

Result: failed outside the touched files in existing core test type errors, including `src/agents/embedded-agent-runner/run/attempt.test.ts`, cron isolated-agent tests, and `src/trajectory/runtime.test.ts`.
