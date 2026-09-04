# Final Note: wild-peak-9394

## Implementation

- `extensions/deliberation/index.ts` now expresses the enabled owner as one direct `api.registerService(createFinalDeliveryService(...))` call.
- `extensions/deliberation/src/final-adapter.ts` retains one immediate adapter tick, one unref'd 5-second interval, a single guarded active promise, bounded warning output, timer cleanup, and stop-time draining.
- `extensions/deliberation/src/plugin.test.ts` requires the exact enabled service ID `deliberation-final-delivery`; the disabled zero-service and blocked-tick shutdown tests remain in place.
- The adapter still selects only the first ready item and preserves reservation, target-equality, invocation, one-provider-attempt, explicit-rejection, and ambiguous-outcome behavior.

## Verification

- `pnpm exec oxfmt --write extensions/deliberation/index.ts extensions/deliberation/src/final-adapter.ts extensions/deliberation/src/plugin.test.ts` -> passed; 3 files formatted.
- `pnpm test extensions/deliberation/src/plugin.test.ts` -> passed; 1 file, 20 tests.
- `pnpm test extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/delivery-composition.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/config.test.ts` -> passed; 5 files, 89 tests.
- `pnpm test src/plugins/source-checkout-runtime.test.ts` -> first run exceeded the 120-second tool timeout without an assertion failure; one retry with a 300-second timeout passed, 1 file and 3 tests.
- `pnpm test extensions/deliberation` -> passed; 14 files, 295 tests.
- `pnpm tsgo:extensions` -> passed.
- `pnpm tsgo:extensions:test` -> passed.
- `pnpm lint:extensions` -> passed.
- `git diff --check` -> passed with no output.
- `git grep -n -E 'deliver-once|final-delivery-callable|deliberation-v2-final-sender' -- extensions scripts src test docs` -> no matches.
- `.agents/skills/autoreview/scripts/autoreview --mode local --prompt '<wild-peak scope>'` -> clean; no accepted/actionable findings.

The fresh GREEN evidence is in `plans/checkpoints/wild-peak-9394.red-green-proof.md`: 20/20 tests passed. The genuine historical RED is linked from `plans/checkpoints/quick-wave-8748.red-green-proof.md`, where 16 tests failed because zero services were registered. `task-evidence` generated `plans/checkpoints/quick-wave-8748.evidence.md`, but reports both historical helper command outcomes as `outcome_unavailable`; the parent proof remains the exact command-output source. The GREEN helper could not append to imported historical metadata, so this task records the exact direct command output and the helper refusal explicitly.

## Preserved Matrix

- Discord delivery keeps the exact configured account, channel, and explicit thread/source anchor.
- Slack delivery from both Slack and Discord origins keeps the exact configured account, channel, and explicit thread.
- Explicit Slack root delivery does not manufacture a thread.
- Source-default routing and immutable KM ready/reservation delivery targets remain covered by the config and adapter suites.
- Slack root and child-source orchestration still delivers once to the exact account-aware Discord thread.
- Discord and Slack native composition still makes one provider attempt and leaves ambiguous outcomes unresolved.

## Removed Architecture

The following callable-only artifacts remain absent:

- `extensions/deliberation/src/final-delivery-command.ts`
- `extensions/deliberation/src/final-delivery-cli.test-helper.ts`
- `extensions/deliberation/scripts/final-delivery-callable-fixture.ts`

No `deliver-once` command, callable replacement, fallback scheduler, or `deliberation-v2-final-sender` dependency exists in the searched repository surfaces. If an external `km-system` checkout independently installs a `deliberation-v2-final-sender` cron, removing that registration remains an external repository follow-up; this task did not inspect or modify that repository.

## Safety Boundary

No live message was sent. No live state, local application state, configuration, credentials, or external provider was read or mutated. No package installation, build, package E2E, Gateway restart, deployment, or external repository inspection occurred.
