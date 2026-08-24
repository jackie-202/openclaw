# Plan 2026-08-23: Complete caller-owned Deliberation OR-01 through OR-23 evidence

Capture the missing owner-authorized GREEN proof and canonical ordered 23/23 ledger without changing production behavior.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already defines exact owner-backed OR-07..OR-21 selectors and rejects any KM checkout not at `79bbc5c0426bc7be901d5199da11b21213bfa008`.
- `scripts/deliberation-full-gate.ts` composes OR-01..OR-23, isolates state, verifies OpenClaw cleanliness plus KM revision/hashes, rejects malformed evidence, writes the ledger exclusively, and generates bounded readiness/final-note output.
- `scripts/lib/deliberation-full-gate-ledger.ts` accepts only passed per-testcase selectors, ordered unique Green rows, coherent authority/command digests, required support commands, and a fresh OR-23 candidate check.
- `extensions/deliberation/contracts/provenance.json` already pins the accepted revision and all four owner hashes. `plans/checkpoints/quick-fork-2935.checkpoint.md` identifies execution, not implementation, as the remaining gap.
- The shared OpenClaw worktree is heavily dirty, and the configured KM repository is at the wrong revision; neither state may be weakened or relabeled as Green.

### Relevant documentation

- `plans/tasks/2026-08-23_establish-caller-owned-deliberation-or-01-through-or-23-full.md` requires one zero-exit canonical run, ordered 23/23 Green evidence, immutable authority, a negative fail-closed check, elapsed output, and repository-readiness-only claims.
- `plans/tasks/2026-08-23_followup-dark-brook-7282-acceptance-fix-establish-caller-owned-deliberation-or-01-thr.md` restricts this follow-up to missing evidence unless execution proves a real defect.
- `plans/checkpoints/quick-fork-2935.red-green-proof.md` preserves the genuine historical RED and names the exact owner GREEN command; `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` remains unknown until the canonical artifact exists.
- No PlantUML or product documentation change applies to this evidence-only follow-up.

### Knowledge base

- `learnings/tooling/quick-fork-2935-coherent-authority-and-report-status.md`: revision, scoped cleanliness, and file hashes form one authority bundle; only passed testcase selectors can become leaves.
- `learnings/tooling/quick-fork-2935-preserve-gates-close-missing-leaves.md`: preserve completed gate plumbing, treat authority/preflight failures as setup evidence, and pair historical RED with fresh GREEN from the durable owner command.
- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: external authority validation precedes behavioral evidence.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; most returned auto-extracted files were empty and were not treated as evidence.

## Available Skills

- `task-evidence`: use only if exact historical command provenance must be recovered; never reconstruct unavailable outcomes.
- `tdd`: append fresh GREEN to the preserved genuine RED using the existing owner-backed command.
- `openclaw-testing`: choose any narrow reruns if the gate exposes an attributable defect.
- `autoreview`: mandatory only if a code defect requires a fix; scope input to task-owned files in this dirty shared worktree.
- `save-learning`: mandatory final action after evidence completion.

## Approach

Use the preserved runner unchanged. Obtain caller-authorized KM authority at the exact accepted revision and a clean committed OpenClaw task checkout, capture the direct owner run outside the worktree, then run the canonical command before writing follow-up evidence. If either run exposes a behavioral defect under coherent authority, stop and document it before considering a minimal test-backed fix.

## Execution Steps

1. Confirm the intended OpenClaw implementation is committed in a clean task checkout. Do not stash, commit, discard, or relocate unrelated shared-worktree changes merely to satisfy preflight.
2. Have the KM owner provide `/Users/michal/.openclaw/workspace/km-system` at revision `79bbc5c0426bc7be901d5199da11b21213bfa008`; verify repository HEAD, scoped cleanliness, the four hashes in `KM_AUTHORITY`, `.venv/bin/python3`, and `.venv/bin/pytest` without changing KM.
3. Run `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`. Capture command, timestamps, exit code, and complete output outside the repository; require every exact OR-07..OR-21 selector once with no failed or skipped required leaf.
4. While OpenClaw remains clean and before appending proof, run `pnpm test:deliberation:full-gate` once. Require zero exit, ordered OR-01..OR-23 Green rows, the accepted authority bundle, all support commands Green, negative-verifier exit 1 with no output ledger, elapsed output, and exclusive creation of `plans/checkpoints/quick-brook-1900.full-gate.json`.
5. Validate the generated ledger against `DELIBERATION_LEAVES`: 23 unique ordered rows, each bound to one passed reporter selector and its command; verify the artifact SHA-256, readiness status, and repository-readiness-only scope.
6. Append the captured direct-run GREEN provenance to `plans/checkpoints/quick-fork-2935.red-green-proof.md` without changing its historical RED. Update `plans/checkpoints/quick-fork-2935.checkpoint.md` and `plans/checkpoints/quick-brook-1900.final-note.md` with the real command outcomes, exact OpenClaw/KM revisions, four KM hashes, ledger path/hash, negative check, and elapsed time.
7. If execution fails after authority preflight, preserve the exact failed selector/output and classify the concrete defect. Make no production change unless that evidence proves one; any minimal fix must add or adjust its focused test, rerun steps 3-6, pass touched-surface checks, and complete fresh `skill:autoreview`.
8. Invoke `skill:save-learning` as the final implementation action.

## Files to Modify

| File                                                     | Change                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `plans/checkpoints/quick-brook-1900.full-gate.json`      | Canonical runner creates the immutable validated 23-row ledger; never hand-edit or overwrite it. |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` | Canonical runner replaces unknown status with ledger-derived repository readiness only.          |
| `plans/checkpoints/quick-brook-1900.final-note.md`       | Preserve generated result and add exact four-hash completion evidence if not already rendered.   |
| `plans/checkpoints/quick-fork-2935.red-green-proof.md`   | Append fresh direct owner GREEN while preserving the genuine historical RED.                     |
| `plans/checkpoints/quick-fork-2935.checkpoint.md`        | Mark execution/evidence steps complete and cite the canonical artifact.                          |

Production files remain unchanged by default. Modify `extensions/deliberation/scripts/km-listener.cross-repo.ts`, `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, or `test/scripts/deliberation-full-gate.test.ts` only for a defect reproduced after coherent-authority preflight.

## TDD

Implement the evidence continuation with `skill:tdd`. Do not create a new RED or add a post-implementation skeleton: `plans/checkpoints/quick-fork-2935.red-green-proof.md` already links the genuine historical owner-boundary RED required by the acceptance manifest.

**Existing test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**GREEN command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`

| Proof                       | RED                                                                                                                            | GREEN                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| OR-07..OR-21 owner boundary | Preserve the linked `bold-reef-6539` run: exit 1, 11 failed and 12 passed, authenticated intake returned `400 SCHEMA_INVALID`. | Fresh accepted-revision run exits 0 and reports each exact OR-07..OR-21 selector once with no failed or skipped required leaf. |
| Canonical integrity         | Current readiness says no validated artifact exists.                                                                           | `pnpm test:deliberation:full-gate` creates one validated ordered 23/23 ledger and real OR-23 reporter result.                  |

## Dependencies

- Caller authorization to restore or provide the configured KM checkout at the accepted immutable revision; do not mutate the current mismatched owner checkout without approval.
- A clean committed OpenClaw task checkout containing the preserved implementation. The current shared worktree is not eligible for canonical execution.
- The canonical output path must not already exist; overwrite refusal is part of the evidence contract.
- No KM edits, production spool access, deployment, Gateway restart, live provider send, or pilot activation.
