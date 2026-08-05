# Plan 2026-08-02: Complete deliberation intake acceptance evidence

Capture the missing canonical GREEN evidence without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-02_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- The preserved diff changes only successful intake to `{ handled: true }` and adds plugin/core regression assertions; production and test files must remain untouched unless a fresh gate exposes a real defect.
- `extensions/deliberation/src/hooks.test.ts` contains the successful-intake regression and existing fail-closed guards for missing IDs, KM failure, source silence, restricted tools/sends, and disabled work.
- `extensions/deliberation/src/plugin.test.ts` covers fail-closed hook registration; `src/auto-reply/reply/dispatch-from-config.test.ts:4898` covers terminal claim short-circuiting with no resolver or dispatcher sends.

### Existing evidence

- `plans/checkpoints/quick-cove-7908.red-green-proof.md` preserves a genuine RED and GREEN for `hooks.test.ts` only.
- `plans/checkpoints/quick-cove-7908.evidence.md` reports both historical proof-capture outcomes as unavailable; do not infer results from the session summary.
- `plans/checkpoints/acceptance-runs/quick-cove-7908-acceptance-002/result.json` leaves only `goal-005` and `goal-006` unmet because its canonical gate reference is `canonical:not-run`.
- The parent session claims plugin, full-extension, and focused core success, but those claims are not caller-owned Test Gate evidence.

### Knowledge base

- Reuse the historical RED; a post-implementation RED would be fabricated.
- Fresh local commands or relabeled artifacts cannot replace a caller-owned canonical gate reference.
- Knowledge recall used local fallback because `openclaw-fork-learnings` was absent; returned protocol and runtime-profile learnings do not alter this evidence-only scope.

## Available Skills

- `openclaw-testing`: choose the narrow OpenClaw-safe test commands for the gate.
- `task-evidence`: preserve exact historical command outcomes and explicit gaps; never reconstruct history by rerunning tests.
- `acceptance`: check the new canonical reference against `goal-005` and `goal-006` without executing tests itself.
- `save-learning`: mandatory final execution action.

## Approach

Keep the preserved implementation unchanged. Obtain one inspectable caller-owned canonical Test Gate result that proves the existing fail-closed guards, plugin boundary, full Deliberation suite, and core terminal-claim dispatch test are green; then record that result without upgrading local claims into canonical evidence.

## Execution Steps

1. Reinspect the three preserved changed files and parent proof. If they still match the accepted behavior, make no production or test edits and link `plans/checkpoints/quick-cove-7908.red-green-proof.md` as historical TDD provenance.
2. Submit the unchanged workspace to the caller-owned canonical Test Gate. Require concrete passing coverage for:
   - `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`, including the fail-closed source-silence, KM-failure, restricted-send, and disabled-work tests.
   - `pnpm test extensions/deliberation/src/plugin.test.ts -- --reporter=verbose`.
   - `pnpm test extensions/deliberation -- --reporter=verbose`.
   - `pnpm test src/auto-reply/reply/dispatch-from-config.test.ts -- --reporter=verbose -t "broadcasts inbound claims and short-circuits when a plugin claims"`.
3. If the gate only runs the registered `cd ~/Projects/openclaw-fork && npm test`, accept it only when its canonical logs identify the required files/tests as passing. Otherwise keep the task blocked and request a targeted canonical run; do not substitute a local run or self-authored gate label.
4. Require the gate reference, exact command(s), exit code(s), timestamp, test counts/names, and provider/run ID when supplied. Treat `not-run`, blocked, truncated proof that omits the named surfaces, or nonzero exit as incomplete.
5. If a named test fails, classify infrastructure/unrelated failures separately. Change code only when the canonical output demonstrates a real defect in the parent diff; then add the smallest regression and follow `skill:tdd` before rerunning the same canonical surface.
6. Write `plans/checkpoints/dark-mist-9990.evidence.md` with exact gate facts and explicit gaps. Link the historical RED/GREEN and the rejected `quick-cove-7908-acceptance-002` result; do not copy the parent session summary as proof.
7. Write `plans/checkpoints/dark-mist-9990.checkpoint.md` linking this plan, the evidence artifact, historical proof, and canonical gate reference. If the caller supplies a retry acceptance manifest, use `acceptance` to confirm `goal-005` and `goal-006` are supported.
8. Run `git diff --check -- plans/checkpoints/dark-mist-9990.evidence.md plans/checkpoints/dark-mist-9990.checkpoint.md`.
9. Invoke `save-learning`, save at least one learning about canonical gate provenance, and perform no later edits or verification.

## Files to Modify

| File                                             | Change                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| `plans/checkpoints/dark-mist-9990.evidence.md`   | Record the exact canonical gate reference and outcomes.                 |
| `plans/checkpoints/dark-mist-9990.checkpoint.md` | Link the plan, parent proof, rejection, and fresh gate evidence.        |
| `learnings/**`                                   | Add the mandatory learning through `save-learning` as the final action. |

Production and test files remain unchanged unless canonical output proves a real implementation defect.

## TDD: skip

This is an evidence-only follow-up after implementation; reuse `plans/checkpoints/quick-cove-7908.red-green-proof.md` and capture fresh GREEN canonical evidence without fabricating another RED.

## Completion Criteria

- The canonical reference is caller-owned and no longer `canonical:not-run`.
- Canonical output establishes all named guard, plugin, full-extension, and core dispatch tests passed.
- Evidence transcribes exact outcomes and preserves every unavailable or truncated field as a gap.
- No production or test file changed unless a canonical failure proved a defect.

## Dependencies

- The parent diff and historical RED/GREEN remain intact.
- Completion depends on the caller-owned Test Gate producing inspectable evidence; local tests alone cannot close `finding-001`.
