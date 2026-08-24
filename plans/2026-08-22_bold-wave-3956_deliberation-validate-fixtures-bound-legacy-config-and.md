# Plan 2026-08-22: Deliberation cross-repository integration evidence

Capture the missing runtime evidence without changing production behavior unless inspection proves a defect.

_Status: DRAFT_
_Created: 2026-08-22_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` verifies owner hashes before starting an isolated listener, then exercises the canonical producer, ten intake/protocol negatives, four lifecycle conflicts, routing, fencing, cleanup, and production-spool guards.
- `extensions/deliberation/contracts/provenance.json` pins owner hashes but currently records the configured checkout as mismatched and external/live convergence as unknown.
- `plans/checkpoints/calm-cove-1824.red-green-proof.md` preserves contract/config RED/GREEN only; `plans/checkpoints/calm-cove-1824.checkpoint.md` records that integration stopped at preflight.

### Relevant documentation

- `extensions/deliberation/README.md` defines `OPENCLAW_DELIBERATION_KM_ROOT=<checkout> pnpm test:deliberation:km-integration` as the isolated owner-backed gate.

### Knowledge base

- `learnings/architecture/2026-08-22_hash-mismatch-is-a-gate-not-provenance-convergence.md`: require matching owner hashes plus runtime success; retain external/live status as unknown.
- `learnings/tooling/2026-08-21_evidence-only-tdd-followups-fail-closed-on-missing-red-provenance.md`: never reconstruct or fabricate RED after implementation.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: link genuine RED and capture fresh complete GREEN from the exact gate.

## Available Skills

- `task-evidence`: recover exact historical command/outcome provenance before making any RED claim.
- `openclaw-testing`: select the narrow integration verification path.
- `save-learning`: mandatory final action after evidence completion.

## Solution

Run the unchanged owner-backed integration gate against a caller-approved checkout whose tracked owner files match the pinned hashes. Preserve genuine historical RED provenance separately from a fresh GREEN; never treat the rejected hash-mismatch preflight as runtime proof or claim live convergence.

## Execution

1. Run `skill:task-evidence` for `calm-cove-1824` and inspect the parent proof/checkpoint. Reuse an integration RED only if the artifact contains the complete `pnpm test:deliberation:km-integration` command, nonzero outcome, and failure tied to the repaired harness; otherwise record the RED provenance gap and request caller-supplied historical evidence rather than reconstructing it.
2. Require the caller-approved KM checkout to contain `scripts/deliberation-v2-listener.py`, `.venv/bin/python3`, and tracked, clean owner files. Record its immutable Git revision and verify SHA-256 values equal `d3c0771d5c1d63fecc18cb93e381136fa8af3054c96cbcdebb95b7785a46dc5f` and `a399132355c792e3861a3e8e2d8e2542e0ccb517231e817acf8afe3c54cca4b7`; do not refresh pins to fit a newer incompatible checkout.
3. Capture fresh GREEN with `TASK_ID=bold-wave-3956 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- env OPENCLAW_DELIBERATION_KM_ROOT="<approved-km-checkout>" pnpm test:deliberation:km-integration`. Require exit 0 and runtime output for the canonical producer, all ten intake/protocol negatives, all four lifecycle conflicts, both final-delivery routes, production-spool rejection, cleanup, and path isolation.
4. Write `plans/checkpoints/bold-wave-3956.red-green-proof.md` with the genuine inherited RED link and exact command/outcome, the complete fresh GREEN output, approved checkout revision/hashes, scenario counts, and explicit statement that external/live convergence remains unknown. If no valid RED exists, mark the acceptance requirement blocked instead of manufacturing one.
5. After GREEN, update only `configuredKmCheckoutEvidence` in `extensions/deliberation/contracts/provenance.json` to record the approved revision, matching hashes, and passing runtime gate; preserve `externalLiveDeployment.status: "unknown"` and repository-local scope.
6. Run the integration command once more only if the provenance edit affects its preflight, then run `git diff --check`. Update `plans/checkpoints/bold-wave-3956.checkpoint.md` with exact evidence paths and any blocker.
7. If the hash-matched gate reaches a scenario and exposes a real implementation defect, stop the evidence-only path, document the failing scenario as RED, make the smallest test-backed repair, rerun the identical gate for GREEN, and run fresh `skill:autoreview`. Do not otherwise edit production code.
8. Invoke `skill:save-learning` as the final action and save at least one learning about the evidence/provenance result.

## Files to Modify

| File                                                  | Change                                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plans/checkpoints/bold-wave-3956.red-green-proof.md` | Record inherited RED provenance or its explicit gap and fresh owner-backed GREEN |
| `plans/checkpoints/bold-wave-3956.checkpoint.md`      | Record completion or the exact unmet prerequisite                                |
| `extensions/deliberation/contracts/provenance.json`   | Change configured-checkout evidence only after the runtime gate passes           |
| `learnings/<category>/<generated-name>.md`            | Save the mandatory final learning via `skill:save-learning`                      |

## TDD: skip

This is an evidence-only follow-up with an existing implementation; creating a new failing test or reconstructing RED would violate the supplied provenance rules. The execution instead links a genuine historical same-command RED when available and captures fresh GREEN from the exact integration gate.

## Dependencies

- Caller-supplied, approved KM checkout with the pinned owner hashes, listener, Python environment, and owner files clean against an immutable revision.
- Genuine historical same-command integration RED from task lineage or caller evidence; without it, GREEN can prove runtime behavior but the requested RED/GREEN acceptance claim remains blocked.
- External/live KM access is intentionally unnecessary and remains unverified.
