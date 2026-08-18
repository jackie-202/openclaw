# Plan 2026-08-14: Recover default-route TDD provenance

Recover only genuine historical evidence, link it to a fresh GREEN, and leave the completed implementation unchanged.

## Analysis

- `plans/checkpoints/quick-crag-3748.evidence.md` identifies implementation session `quick-reef-6630`, but records only producer-test commands and `command_lines_truncated`; it contains no default-route listener RED.
- `plans/checkpoints/quick-crag-3748.red-green-proof.md` proves producer serialization, not the required integration scenario.
- `plans/checkpoints/swift-reef-8917.red-green-proof.md` proves the default and override routes GREEN. Its RED has the default route passing and only the override route failing, so it cannot satisfy the missing provenance.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts:444` contains the preserved default/override integration scenario. No production defect is documented, and production edits are out of scope.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md` forbids reconstructing a missing RED after implementation. Recall used local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: refresh bounded parent-session command/outcome evidence without rerunning history.
- `tdd`: capture only the fresh GREEN after valid historical RED provenance is found.
- `acceptance`: record the evidence result against `goal-001`.
- `save-learning`: save the required session learning last.

## Approach

1. Refresh `skill:task-evidence` for `quick-crag-3748` and obtain the complete archival export for implementation session `quick-reef-6630`. Search only records timestamped before the default-route harness implementation for an exact `pnpm test:deliberation:km-integration` or equivalent `node --test extensions/deliberation/scripts/km-listener.cross-repo.ts` run.
2. Accept a RED only when the archived command/output names the default-route scenario and shows its pre-implementation failure, such as the planned missing `prepare` probe or absent final provider call. Record the session ID, timestamp, exact command, exit code, failing assertion, and archive provenance. Do not use the producer RED, the later override `SCHEMA_INVALID` RED, a current checkout rerun, or inferred chronology.
3. If the complete archive still has no qualifying RED, stop evidence work. Record `historical_default_route_red_unavailable` and the searched session/source in the follow-up checkpoint; do not edit any proof to imply acceptance or change production/tests.
4. If a qualifying RED exists, create `plans/checkpoints/warm-reef-5185.red-green-proof.md` with the verbatim historical RED and a direct link to its archival source. Then use `skill:tdd` only to capture a fresh GREEN for the unchanged integration harness under task ID `warm-reef-5185`.
5. Link the fresh GREEN to the historical RED in the same artifact. Include both route names, 7/7 result, compatible KM provenance hashes, and confirmation that the fake provider captured every outbound send.
6. Update `plans/checkpoints/warm-reef-5185.checkpoint.md` and use `skill:acceptance` to record either satisfied provenance or the explicit archival blocker. Preserve all parent artifacts unchanged.
7. Run `git diff --check` on the evidence files, verify no production/test path changed during this follow-up, then invoke `skill:save-learning` and save at least one learning as the final action.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/quick-crag-3748.evidence.md` | Refresh only through `skill:task-evidence`; retain any reported truncation/gap verbatim. |
| `plans/checkpoints/warm-reef-5185.red-green-proof.md` | Create only if a qualifying historical RED is recovered; pair it with fresh GREEN evidence. |
| `plans/checkpoints/warm-reef-5185.checkpoint.md` | Record success or the explicit archival evidence blocker. |
| `plans/checkpoints/acceptance-runs/warm-reef-5185-*/` | Persist the structured acceptance result via `skill:acceptance`. |
| `learnings/tooling/<slug>.md` | Save the mandatory evidence-provenance learning. |

`extensions/deliberation/**` must remain unchanged unless inspection documents a new, reproducible implementation defect; such a defect requires separate minimal TDD work rather than being mixed into this evidence repair.

## TDD: skip

This is an evidence-only provenance repair: a new RED now would be post-implementation and invalid. `skill:tdd` is used only to capture fresh GREEN after a genuine historical RED is recovered.

## Verification

1. Historical evidence: `python3 "$HOME/.config/opencode/skills/task-evidence/scripts/fetch-evidence.py" --task quick-crag-3748 --project-dir .`
2. Conditional GREEN: `TASK_ID=warm-reef-5185 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- env OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration`
3. Scope check: `git diff --name-only` must show no new follow-up changes under `extensions/deliberation/`.
4. Evidence syntax: `git diff --check -- plans/checkpoints/quick-crag-3748.evidence.md plans/checkpoints/warm-reef-5185.red-green-proof.md plans/checkpoints/warm-reef-5185.checkpoint.md`

---
*Status: DRAFT*
