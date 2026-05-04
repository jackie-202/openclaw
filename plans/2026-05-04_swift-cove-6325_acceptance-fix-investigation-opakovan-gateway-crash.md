# Plan 2026-05-04: WhatsApp 408 Investigation Acceptance Evidence

Close the acceptance gap by verifying the existing investigation artifacts and handing off concrete diff/content evidence.

_Status: DRAFT_

## Analysis

### Context From Current Artifacts

- `plans/2026-05-04_fresh-cove-5182_investigation-opakovan-gateway-crash-whatsapp-unhandled.md` already scoped the retry to artifact evidence, log inspection, benchmark-noise cleanup, `git diff --check`, and `save-learning`.
- `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` already includes root cause, source lines, unsafe `result.error`, bash-backed gateway log evidence, stability bundle evidence, 408 path, recommended fix, tests to add, and upstream status.
- `plans/checkpoints/wild-reef-6230.checkpoint.md` already marks log inspection, report update, verification, and learning as complete; verify whether it needs a timestamped acceptance checkpoint note.
- `git status --short` shows no current `scripts/bench/` entries; do not touch unrelated untracked files outside the acceptance scope.
- `git diff -- plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md plans/checkpoints/wild-reef-6230.checkpoint.md` is empty because those files are currently untracked; final evidence must use either file contents or `git diff --no-index /dev/null <file>` for untracked artifacts.

### Relevant Documentation

- `docs/plugins/sdk-channel-turn.md`: channel lifecycle ownership stays plugin-local; keep this pass investigation-only.
- `extensions/AGENTS.md`: bundled plugin work must respect plugin/SDK boundaries; do not edit runtime source in this task.

### Knowledge Base

- `learnings/tooling/acceptance-retry-investigation-reports-need-fresh-evidence.md`: acceptance retries need fresh log evidence, not source-only conclusions; use bash for `~/.openclaw/logs/...`; remove only named unrelated files.
- `learnings/tooling/fresh-cove-5182-acceptance-retry-plans-must-preserve-review-scope.md`: read existing plan/artifacts first and target only unmet acceptance goals.
- `learnings/tooling/fresh-mist-4301-diagnostic-only-investigations-can-use-lightweight-verification-when-no-runtime-.md`: markdown/checkpoint-only investigation work can use completed `git diff --check` as baseline verification.
- `learnings/runtime-errors/fresh-mist-4301-baileys-408-login-failures-surface-through-a-structured-disconnect-path.md`: preserve the 408 trace through `lastDisconnect`, login outcome mapping, and final throw site.

## Available Skills

- `compound-plan`: used for this plan only.
- `save-learning`: mandatory last implementation action before final handoff.

## Implementation

1. Run `git status --short` and confirm `scripts/bench/` is absent; if any `scripts/bench/` item appears, remove only untracked entries and ask before touching tracked entries.
2. Re-run minimal bash evidence checks and keep output snippets for handoff:
   - `grep -n "Cannot read properties of undefined (reading 'error')" "$HOME/.openclaw/logs/gateway.err.log"`
   - `ls -lt "$HOME/.openclaw/logs/stability"/openclaw-stability-2026-05-04*unhandled_rejection.json`
   - a small JSON inspection command for the latest matching stability bundle, redacting local-only details as needed.
3. Review `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`; edit only if any acceptance-required field is missing or stale:
   - root cause and exact source lines
   - unsafe dereference and 408 path
   - bash gateway log and stability bundle evidence
   - recommended fix and tests
   - upstream status from current `upstream/main` source/history
4. Review `plans/checkpoints/wild-reef-6230.checkpoint.md`; add acceptance checkpoint evidence only if current content is insufficient for the rerun.
5. Preserve investigation-only scope; do not edit `extensions/whatsapp/src/**` or tests unless the task is explicitly expanded.
6. Run `git diff --check` and capture the completed output exactly.
7. Produce verifiable artifact evidence for final handoff:
   - `git diff -- plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md plans/checkpoints/wild-reef-6230.checkpoint.md` for tracked edits.
   - If files are untracked, use `git diff --no-index -- /dev/null <file>` or paste concise file excerpts with line ranges.
   - Include the checkpoint file evidence, investigation report evidence, cleanup status, learning artifact path/content summary, and completed verification output.
8. Run `save-learning` and add at least one learning about acceptance evidence requirements if no new learning was added during this rerun.

## Files To Modify

| File                                                                      | Change                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` | Only patch missing or stale acceptance evidence.                                |
| `plans/checkpoints/wild-reef-6230.checkpoint.md`                          | Only patch missing checkpoint proof for this rerun.                             |
| `learnings/.../*.md`                                                      | Add one concise learning via `save-learning` as the last implementation action. |

## TDD: skip

This acceptance fix is documentation/checkpoint evidence only; no runtime behavior is being implemented.

## Verification

- Run `git diff --check` after artifact edits and include the completed output in the final response.
- Do not run broad gates for markdown/checkpoint-only work.
- If a targeted runtime test is attempted and blocked by unrelated local locks, report the exact blocker but do not substitute it for `git diff --check`.

## Dependencies

- Bash access to `$HOME/.openclaw/logs/gateway.err.log` and `$HOME/.openclaw/logs/stability/` for evidence refresh.
- `upstream/main` available locally for upstream status proof; run `git fetch upstream main` only if current refs are missing or stale.
