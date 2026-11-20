---
{
  "tdd":
    {
      "decision": "required",
      "reason": "The acceptance requires genuine task-bound compiler RED before the type changes and matching GREEN afterward; any uncovered reasoning-policy regression must also be characterized before its corresponding behavior change. The earlier interpreter prerequisite must be resolved or reviewed by existing owners without relabeling historical proof.",
    },
}
...

# Plan

## Analysis

- Inspect current catalog/provider-thinking declarations, the full affected functions, existing `thinking.test.ts` coverage, and preserved unrelated work before editing.
- Resolve task-local TDD proof eligibility: use only this task's own captured RED/GREEN. The previous attempt reports `.python-version` requires Python 3.15.0 and its helper could not resolve it; do not repeat that unsupported invocation unchanged. Confirm whether the configured interpreter is now available to the supported helper, otherwise stop for explicit prerequisite/provenance review by the existing owners.
- Preserve reasoning-disabled off-only behavior, provider-authoritative and binary profiles, catalog opt-out precedence, and valid, invalid, and empty effort handling.

## Approach

- Repair only the actual canonical optional compat declaration and effort-option contextual typing; make no policy changes, casts, suppressions, build bypasses, or unrelated-work edits.
- Require genuine task-bound compiler RED before behavior-changing edits and matching GREEN with the same exact declaration command; never import or relabel historical proof.

## Implementation

1. Establish proof-helper prerequisite and inspect the exact current diff/source state; if required causal RED cannot be captured through the supported helper, pause and obtain the specified owner review rather than implement without proof.
2. Capture RED using `node scripts/run-tsgo.mjs -p tsconfig.plugin-sdk.dts.json --declaration true`.
3. Correct the owning shared compat type and mapped-options contextual type; add behavioral characterization only for uncovered policy contracts, capturing its RED before the corresponding source change.
4. Run matching GREEN and the existing focused tests; record exact commands, outcomes, changed files, and any proof blockers in the task-owned checkpoint, then obtain independent acceptance against final source and proof.

## Testing

- Causal compiler proof: `node scripts/run-tsgo.mjs -p tsconfig.plugin-sdk.dts.json --declaration true` before and after the type correction.
- Run `pnpm test src/auto-reply/thinking.test.ts`; add no missing `thinking.shared.test.ts` file.
- Perform focused formatting/lint checks selected from repository instructions. Do not run `pnpm build`, broad/full suites, installation, deployment, runtime probes, or unrelated gates.
- Report unavailable interpreter/helper prerequisites precisely; a focused declaration pass is not complete-build proof.

## TDD

- Decision: `required`. The acceptance requires causal compiler RED before the type changes and matching GREEN afterward; any uncovered reasoning-policy regression must likewise be characterized before its behavior change. Existing proof is usable only with its original task/run provenance and explicit owner review; no fabricated or relabeled proof.

## Files

- `src/auto-reply/thinking.shared.ts` — align shared compat declaration with canonical optional catalog contract.
- `src/auto-reply/thinking.ts` — contextually type effort options to allow authorized `off` without changing values or policy.
- `src/auto-reply/thinking.test.ts` — add only missing behavioral characterization.
- `plans/checkpoints/` — update the authorized task-owned implementation checkpoint with proof provenance, exact verification, limits, and acceptance status.

## Progress

- [x] Read the original task-owned plan, task scope, and current relevant source/tests; note reported Python 3.15.0 helper prerequisite.
- [ ] Resolve supported task-local proof prerequisite or obtain explicit owner review before code changes.
- [ ] Capture genuine RED, make bounded correction, and capture matching GREEN plus focused tests.
- [ ] Record checkpoint and complete independent acceptance.
