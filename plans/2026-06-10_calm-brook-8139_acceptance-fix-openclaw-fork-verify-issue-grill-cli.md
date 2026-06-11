# Plan 2026-06-10: Acceptance Checkpoint For Warm Mist Proof

Create the missing durable checkpoint evidence for the already-committed CLI dependency fix.

## Problem

Acceptance needs task-local command evidence in `plans/checkpoints/warm-mist-9351.checkpoint.md`, not another dependency metadata edit.

## Analysis

### Codebase Context

- Preserve the prior `global-agent` metadata fix; edit `package.json`, lockfiles, or shrinkwrap only if fresh CLI/import proof fails.
- Continue from `plans/checkpoints/warm-mist-9351.checkpoint.md`: linked CLI proof and focused checks are marked complete, issue-grill smoke and final durable evidence remain incomplete.
- Use `plans/2026-06-10_warm-mist-9351_openclaw-fork-verify-issue-grill-cli-dispatch-path-after.md` as the accepted implementation guide; do not rewrite the original plan.
- Record the cleanup decision for `test/scripts/runtime-postbuild.test.ts:91` in the checkpoint; leave code untouched unless the suite is intentionally rerun and exposes a task-relevant failure.

### Relevant Documentation

- Use `docs/start/openclaw.md:69` through `docs/start/openclaw.md:73` as the source for the default `~/.openclaw/workspace` location.

### Knowledge Base

- Apply `learnings/tooling/quick-brook-5449-plan-only-verification-proof-before-repair.md`: prove the executable path before allowing any repair.
- Apply `learnings/tooling/warm-mist-9351-prove-linked-cli-fixes-with-realpath-and-direct-import-first.md`: capture `command -v`, realpath, `openclaw --version`, and direct ESM import proof.
- Apply `learnings/tooling/warm-mist-9351-workspace-dry-run-proofs-can-fail-on-sandbox-permission-boundaries.md`: if workspace permission is denied, record the exact blocker instead of substituting unrelated tests.
- Apply `learnings/patterns/warm-cove-7102-keep-legacy-runtime-imports-declared-until-built-artifacts-stop-referencing-them.md`: do not remove `global-agent` while built/runtime artifacts still need it.

## Available Skills

- Use `save-learning` after checkpoint completion; this is the last implementation action before final response.
- Use `openclaw-testing` only if focused checks unexpectedly fan out or need safer proof selection.
- Use `recall-knowledge` when refreshing task-specific learning context before implementation.

## Solution

1. Update only `plans/checkpoints/warm-mist-9351.checkpoint.md` unless fresh proof exposes a real regression.
2. Record exact command, cwd, stdout summary, and exit status for linked CLI proof, `global-agent` import, focused checks, issue-grill smoke, cleanup decision, and save-learning.
3. Run the issue-grill dry-run from `~/.openclaw/workspace`; if tool permissions reject the workspace, record the exact rejection and stop the smoke path cleanly.
4. Save at least one learning after the checkpoint is complete.

## Implementation

1. Read current `plans/checkpoints/warm-mist-9351.checkpoint.md` and preserve completed evidence entries.
2. If the existing CLI proof lacks command details, rerun from repo root and append results:

```bash
command -v openclaw
python3 - <<'PY'
import os, shutil
p = shutil.which('openclaw')
print(p or '')
print(os.path.realpath(p) if p else '')
PY
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
```

3. If focused check details are missing, rerun only these repo-root checks and append results:

```bash
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

4. Verify the parent paths before the smoke command, then run the workspace smoke from `~/.openclaw/workspace` with a task-local bundle under `$HOME/.openclaw/tmp/opencode/`:

```bash
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out "$HOME/.openclaw/tmp/opencode/warm-mist-9351-issue-grill-smoke-bundle.json"
python3 km-system/scripts/issue-grill-bundle.py --read "$HOME/.openclaw/tmp/opencode/warm-mist-9351-issue-grill-smoke-bundle.json" --section overview
```

5. If sandbox permission rejects `~/.openclaw/workspace`, append the exact rejection text, cwd, command attempted, and mark smoke blocked rather than passed.
6. Append the cleanup decision for `test/scripts/runtime-postbuild.test.ts:91`: not part of acceptance unless intentionally rerun; record any rerun result if performed.
7. Invoke `save-learning`, save at least one learning about the completed proof path or permission blocker, and record the learning path in the checkpoint.
8. Run `git diff --check` after checkpoint edits and record the exit status if not already fresh.

## Files to Modify

| File                                             | Change                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `plans/checkpoints/warm-mist-9351.checkpoint.md` | Add durable task-local proof entries and blocker notes.                                |
| `learnings/**/*.md`                              | Add the required `save-learning` output.                                               |
| `package.json`                                   | Change only if fresh `global-agent` proof fails and the dependency metadata regressed. |
| `pnpm-lock.yaml`                                 | Change only with a required dependency metadata repair.                                |
| `npm-shrinkwrap.json`                            | Change only with a required dependency metadata repair.                                |

## TDD: skip

This is a verification/checkpoint task; behavior is proven by command evidence, not by adding a new automated test.

## Verification

- Checkpoint includes executable path and realpath evidence for `openclaw`.
- Checkpoint includes `openclaw --version` stdout summary and exit status.
- Checkpoint includes direct `global-agent` import stdout summary and exit status.
- Checkpoint includes focused checks or exact blocker/failure.
- Checkpoint includes issue-grill smoke bundle creation/readback or exact workspace permission blocker.
- Checkpoint includes cleanup decision for `test/scripts/runtime-postbuild.test.ts:91`.
- Checkpoint includes the saved learning path.

---

_Status: DRAFT_
