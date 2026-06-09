# Fix MC grill button dispatch failure caused by OpenClaw CLI missing dependency / exit handling

## Context

Michal clicked the Mission Control issue grill button and the UI showed `Grill failed`.

Live reproduction from `mission-control/services/issues.runGrillTrigger(143)`:

```text
Command failed: python3 /Users/michal/.openclaw/workspace/km-system/scripts/grill-trigger.py --json --issue 143
```

The script did build the correct minimal channel prompt and JSON diagnostics, but dispatch failed because the OpenClaw CLI cannot start:

```text
[openclaw] Failed to start CLI: Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'global-agent' imported from /Users/michal/Projects/openclaw-fork/dist/proxy-lifecycle-BSoUb6hR.js
```

Current facts verified live:

- `/opt/homebrew/lib/node_modules/openclaw` is a symlink to `/Users/michal/Projects/openclaw-fork`.
- `openclaw --version` works: `OpenClaw 2026.6.2 (e264dea)`.
- `package.json` and `pnpm-lock.yaml` currently do not mention `global-agent`.
- `dist/proxy-lifecycle-*.js` imports `global-agent`.
- OpenClaw fork worktree currently has many existing merge conflicts (`UU ...`). Do not overwrite unrelated conflict state.

## Goal

Make the MC grill button able to dispatch to `#issue-grill` without showing `Grill failed`, while preserving the new minimal prompt/bounded-reader behavior.

## Scope

Project: `openclaw-fork` primarily. If needed, add a small Mission Control hardening follow-up only after fixing the OpenClaw CLI dependency issue.

## Required work

1. Identify why built OpenClaw `dist/proxy-lifecycle-*.js` imports `global-agent` while package metadata does not declare/install it.
2. Add the correct runtime dependency or remove/replace the stale import in source/build path — choose the smallest correct fix.
3. Rebuild/link as needed so the installed/symlinked CLI can run `openclaw session send` path used by `grill-trigger.py`.
4. Do not resolve or overwrite unrelated existing conflict hunks unless they are directly required for this fix; if conflicts block the fix, report exactly which files block it.
5. Consider hardening `mission-control/services/issues.js` so `runGrillTrigger` can parse JSON diagnostics from stdout even when the child exits non-zero, but only if it is a small safe change and does not mask real dispatch failures.

## Acceptance

Run and record evidence:

```bash
cd /Users/michal/Projects/openclaw-fork
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
```

Then from workspace:

```bash
cd /Users/michal/.openclaw/workspace
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

And from Mission Control:

```bash
cd /Users/michal/Projects/mission-control
node --test tests/api/issues.test.js tests/api/grill.test.js
node - <<'NODE'
const issues = require('./services/issues');
const result = issues.runGrillTrigger(143);
console.log(JSON.stringify(result, null, 2));
if (result.error || result.started !== true) process.exit(1);
NODE
```

If the final live dispatch would post to Discord/GitHub, stop before destructive/public posting and report the exact command/output needed for Michal to retry the MC button instead.

## Guardrails

- No git operations in the task.
- No public GitHub comments from the task unless explicitly required by the existing grill workflow and already triggered by the live test; prefer dry-run/smoke first.
- Do not touch channel IDs, session keys, cron config, or routing semantics.
