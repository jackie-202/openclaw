# Plan 2026-07-24: Supply Slice 1 Acceptance Evidence

Put the preserved implementation and focused-test hunks directly into caller-supplied semantic review material; do not change production behavior.

*Status: DRAFT*

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `plans/checkpoints/swift-dune-1559.source-and-tests.diff` already contains the complete 672-line, 13-path parent diff with SHA-256 `83ecc4e4ede1228faeed223bfec45e86fb2934316c1441cf5f4b02a69c45a878`.
- `plans/checkpoints/swift-dune-1559.acceptance-evidence.md` maps every required resolver and caller semantic to that diff, but `plans/checkpoints/acceptance-runs/swift-dune-1559-acceptance-001/result.json` confirms the raw `.diff` contents were absent from supplied review material.
- Inspection shows no implementation defect. The current task must add a review-visible Markdown artifact, not regenerate or alter the preserved `src/` work.

### Relevant Documentation

- `plans/2026-07-24_swift-dune-1559_slice-1-upstream-model-authority-with-transitional-fallback.md`: completed parent evidence plan.
- `plans/tasks/2026-07-24_followup-acceptance-fix-slice-1-upstream-model-authority-with-transit.md`: current blocker and evidence-only constraint.
- `plans/checkpoints/swift-dune-1559.red-green-proof.md`: prior fresh verification and genuine parent RED/GREEN links.

### Knowledge Base

- Acceptance evaluates supplied artifacts, not referenced filenames; required source semantics must be present in material the reviewer can read.
- Preserve one canonical resolver path and separate supplemental runtime fields; do not reopen implementation decisions while fixing evidence delivery.
- Do not fabricate a new RED after implementation. Link the historical genuine RED and record only fresh GREEN for this follow-up.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `acceptance`: ensure the new artifact is semantically inspectable rather than another summary or checksum.
- `task-evidence`: use existing exact historical evidence and report gaps; do not reconstruct history.
- `save-learning`: record the artifact-delivery lesson as the final execution action.

## Approach

Embed the complete existing diff verbatim in a new Markdown checkpoint artifact so it is part of this task's caller-supplied semantic material. Keep the existing evidence map and proof as provenance; add only current-task links and fresh focused verification.

## Implementation

1. Reinspect `plans/checkpoints/swift-dune-1559.source-and-tests.diff` against its recorded 13-path inventory and checksum. Stop and document a defect before any `src/` edit if they differ.
2. Create `plans/checkpoints/warm-peak-1796.semantic-review-material.md` with the complete 672-line diff in one `diff` fence, plus the source path and SHA-256. Do not abbreviate, summarize, or replace hunks with line references.
3. Add `plans/checkpoints/warm-peak-1796.acceptance-evidence.md` linking the inline artifact, parent semantic map, parent proof, and current GREEN. Map authority, fallback/warning, target matching, six consumer paths, and non-model preservation to visible lines in the new Markdown artifact.
4. Run the five unaffected focused files and the two changed dispatch cases using the exact commands preserved in `plans/checkpoints/swift-dune-1559.red-green-proof.md`; record command, exit code, and counts in `plans/checkpoints/warm-peak-1796.red-green-proof.md`. Link `plans/checkpoints/quick-reef-5974.red-green-proof.md` as the genuine RED; do not create a same-task RED.
5. Verify the embedded fenced payload is byte-for-byte identical to `plans/checkpoints/swift-dune-1559.source-and-tests.diff`, contains all 13 paths, and has no truncation marker. Run `git diff --check` for the new evidence files.
6. Create `plans/checkpoints/warm-peak-1796.checkpoint.md` that explicitly names the semantic-review artifact as the acceptance input and links this plan, both evidence maps, historical proof, and fresh GREEN. Invoke `save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `plans/checkpoints/warm-peak-1796.semantic-review-material.md` | Add the complete parent source and focused-test diff inline. |
| `plans/checkpoints/warm-peak-1796.acceptance-evidence.md` | Map acceptance requirements to inspectable inline hunks. |
| `plans/checkpoints/warm-peak-1796.red-green-proof.md` | Link historical RED and record fresh focused GREEN only. |
| `plans/checkpoints/warm-peak-1796.checkpoint.md` | Link all current-task acceptance inputs. |

No `src/` file or existing parent evidence artifact is expected to change.

## TDD: skip

This is evidence packaging after implementation; a new RED would fabricate history. Reuse the genuine parent RED and capture fresh focused GREEN.

## Verification

- The inline payload equals `plans/checkpoints/swift-dune-1559.source-and-tests.diff` byte-for-byte and exposes all 13 paths in review-visible Markdown.
- Five focused files pass with 585 tests; the two changed dispatch cases pass independently, with unrelated broad-file failures documented rather than hidden.
- `git diff --check -- plans/checkpoints/warm-peak-1796.semantic-review-material.md plans/checkpoints/warm-peak-1796.acceptance-evidence.md plans/checkpoints/warm-peak-1796.red-green-proof.md plans/checkpoints/warm-peak-1796.checkpoint.md` exits 0.
- The checkpoint names the inline Markdown artifact, not only the prior `.diff` path, as semantic review material.
