# Plan 2026-06-10: Complete linked CLI and issue-grill acceptance proof

Close the acceptance gap by proving the already-fixed fork runtime path and the workspace issue-grill dry-run smoke with durable, task-local evidence.

## Problem

Acceptance requires executed proof, not more dependency metadata edits.

## Analysis

### Codebase Context

- Preserve prior metadata fix: `package.json:1894`, `pnpm-lock.yaml`, and `npm-shrinkwrap.json` already declare/lock `global-agent`.
- Reuse prior proof from `plans/checkpoints/quick-brook-5449.checkpoint.md:12`: linked `/opt/homebrew/bin/openclaw` resolved to this fork, `openclaw --version` passed, `import('global-agent')` passed, focused tests passed, focused oxfmt passed, and `git diff --check` passed.
- Fill the remaining unchecked item from `plans/checkpoints/quick-brook-5449.checkpoint.md:7`: safe workspace issue-grill smoke.
- Treat `test/scripts/runtime-postbuild.test.ts:91` as unrelated cleanup unless the implementer intentionally runs that suite; do not use its failure as substitute evidence.

### Relevant Documentation

- Follow `docs/start/openclaw.md:73` for the default workspace location when running workspace smoke from `~/.openclaw/workspace`.
- Follow `docs/security/network-proxy.md:37` and `docs/security/network-proxy.md:39` only as runtime dependency context; no docs change is planned.

### Knowledge Base

- Apply `learnings/patterns/warm-cove-7102-keep-legacy-runtime-imports-declared-until-built-artifacts-stop-referencing-them.md`: verify the built/import graph before changing dependency metadata.
- Apply `learnings/tooling/warm-cove-7102-rebuild-linked-cli-after-runtime-dependency-changes.md`: verify the linked executable path before rebuilding.
- Apply `learnings/tooling/quick-brook-5449-plan-only-verification-proof-before-repair.md`: center the executable proof path, then repair only if proof fails.

## Available Skills

- Use `openclaw-testing` only if focused local checks fan out or need safer proof selection.
- Use `save-learning` as the final implementation action after evidence is recorded.

## Solution

1. Do not redo the completed dependency metadata work.
2. Re-run or cite fresh commands for linked CLI proof if the monitor needs new output: executable path, symlink realpath, `openclaw --version`, and direct `import('global-agent')` from repo root.
3. Run the focused OpenClaw checks only if prior checkpoint output is considered insufficient or stale.
4. Run the workspace issue-grill dry-run smoke from `~/.openclaw/workspace`; write the bundle to an allowed temp path when `/tmp` is blocked by tool permissions.
5. Record all exact commands, cwd, stdout summary, exit status, and any permission blocker in `plans/checkpoints/warm-mist-9351.checkpoint.md`.
6. Invoke `save-learning` after the checkpoint is complete; make it the last action before final response.

## Implementation

1. Create `plans/checkpoints/warm-mist-9351.checkpoint.md` with checkboxes for linked CLI proof, `global-agent` import proof, focused checks, issue-grill smoke, cleanup decision, and save-learning.
2. In repo root, run non-destructive linked CLI proof commands:

```bash
command -v openclaw
python3 - <<'PY'
import os, shutil
p = shutil.which('openclaw')
print(p)
print(os.path.realpath(p) if p else '')
PY
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
```

3. If `openclaw` does not resolve to this fork, stop and record the exact path mismatch; do not fake acceptance proof.
4. If the import fails, repair only the smallest OpenClaw dependency/artifact issue, rebuild if needed, then rerun only the failed proof.
5. Run focused checks from repo root when fresh evidence is required:

```bash
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

6. Run workspace smoke from `~/.openclaw/workspace` using an allowed bundle output path; prefer `/Users/michal/.openclaw/tmp/opencode/openclaw-grill-button-fix-smoke-bundle.json` if `/tmp` or read access is rejected:

```bash
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /Users/michal/.openclaw/tmp/opencode/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /Users/michal/.openclaw/tmp/opencode/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

7. If `~/.openclaw/workspace` access is rejected, record the permission failure in the checkpoint and ask for permission or an alternate workspace path; do not substitute unrelated repo tests.
8. For cleanup item `test/scripts/runtime-postbuild.test.ts:91`, record whether that suite was run; if not run, mark it unrelated to acceptance proof and leave it for a separate task.
9. Invoke `save-learning`; save at least one learning about the final blocker or proof path.

## Files to Modify

| File                                             | Change                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `plans/checkpoints/warm-mist-9351.checkpoint.md` | Add durable acceptance evidence and permission blockers.            |
| `package.json`                                   | Modify only if fresh proof shows `global-agent` metadata regressed. |
| `pnpm-lock.yaml`                                 | Modify only with a required package metadata repair.                |
| `npm-shrinkwrap.json`                            | Modify only with a required package metadata repair.                |

## TDD: skip

This is a verification-only acceptance fix; add tests only if a fresh command exposes a real OpenClaw defect.

## Verification

- Prove `command -v openclaw` and realpath resolve to this fork.
- Prove `openclaw --version` exits 0.
- Prove `node -e "import('global-agent')..."` exits 0 from repo root.
- Prove focused checks pass or record the first actionable failure.
- Prove workspace issue-grill dry-run creates and reads the bundle, or record the exact permission blocker.
- Prove `save-learning` ran after the checkpoint update.

---

_Status: DRAFT_
