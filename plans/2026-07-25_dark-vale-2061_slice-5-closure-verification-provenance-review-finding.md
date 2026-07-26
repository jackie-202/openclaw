# Plan 2026-07-25: Slice 5 closure byte-integrity evidence

Task `dark-vale-2061`: close only the missing append-integrity evidence from parent task `dark-mist-3747`.

## Evidence Basis

- `.architecture-reviews/reports/2026-07-24-option-a-closure.md:44` records the original length and digest but leaves the comparison pending.
- `.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md:80` contains the completed append-only correction; this file must not be edited.
- `plans/2026-07-25_dark-mist-3747_slice-5-closure-verification-provenance-review-finding.md:28` requires hashing the corrected report's first 6,776 bytes.
- `plans/checkpoints/dark-mist-3747.evidence.md:9` contains no historical verification result, so fresh GREEN evidence is required without fabricating a new RED.
- `learnings/tooling/dark-mist-3747-evidence-gated-closure.md:26` requires recording a post-edit prefix hash rather than inferring preservation from the visible text.

## Available Skills

- `task-evidence`: retain the parent artifact's explicit lack of verification evidence; do not reconstruct historical commands.
- `recall-knowledge`: apply the append-only prefix-hash rule and evidence-gap handling.
- `acceptance`: finalize against the supplied finding only if an acceptance manifest is provided during implementation.
- `save-learning`: record the evidence-capture pattern as the final implementation action.

## Implementation

1. Confirm the two reports still match the parent state and limit the change to the unresolved validation sentence in `.architecture-reviews/reports/2026-07-24-option-a-closure.md`.
2. Hash exactly the first 6,776 bytes of `.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md` with `dd if=".architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md" bs=6776 count=1 2>/dev/null | shasum -a 256`; compare the emitted digest with `394b08f04e58b78608936e65d024e120bae5ce1e9b009912eb8a3f1058bd75fb`.
3. If the digest differs, stop and report an integrity defect without editing either report. If it matches, replace the pending validation wording with durable evidence containing the exact command, 6,776-byte prefix scope, expected digest, actual digest, and explicit `PASS` comparison outcome.
4. Re-run the same prefix command after the report edit and require the same digest. Run `pnpm exec oxfmt --check --threads=1 .architecture-reviews/reports/2026-07-24-option-a-closure.md .architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md` and `git diff --check -- .architecture-reviews/reports/2026-07-24-option-a-closure.md`; do not run source tests, builds, or broad gates.
5. Review the final diff to prove the architecture report is untouched and no acceptance verdict, provenance conclusion, source file, live config, workspace proposal, or prior evidence was changed.
6. Run `save-learning` last and save at least one concise learning about recording expected and actual prefix digests in the durable closure artifact.

## Files to Modify

| File                                                           | Change                                                                                                              |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `.architecture-reviews/reports/2026-07-24-option-a-closure.md` | Replace the pending prefix-validation statement with the measured command, expected/actual digest, and PASS result. |
| `learnings/tooling/<generated-learning>.md`                    | Save the required evidence-capture learning through `save-learning`.                                                |

Do not modify `.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md`, production code, tests, `plans/tasks/**`, live config, or external workspace files.

## TDD: skip

This is an evidence-only document correction; reuse the parent proof provenance and capture fresh deterministic GREEN verification instead of fabricating a post-implementation RED.

## Dependencies

- The corrected report must contain at least 6,776 bytes and its measured prefix must equal the recorded parent digest.
- `dd`, `shasum`, and the repository-pinned `oxfmt` must be available.
- A mismatch blocks the evidence update and requires defect escalation.

_Status: DRAFT_
