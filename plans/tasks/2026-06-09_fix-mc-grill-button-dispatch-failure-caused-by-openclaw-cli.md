# Fix MC grill button dispatch failure caused by OpenClaw CLI global-agent runtime dependency

## Current context

Michal clicked the Mission Control issue grill button and the UI showed `Grill failed`.

Earlier reproduction from `mission-control/services/issues.runGrillTrigger(143)` failed because the OpenClaw CLI could not start:

```text
[openclaw] Failed to start CLI: Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'global-agent' imported from /Users/michal/Projects/openclaw-fork/dist/proxy-lifecycle-BSoUb6hR.js
```

Important update from 2026-06-09/10 upstream-sync boot repair:

- The separate Gateway reply/routing break caused by `speech-core/runtime-api.js` has already been fixed and committed in `cfefa09329 fix: resolve speech-core runtime api alias`.
- Gateway boot proof passed after that fix: OpenClaw `2026.6.2 (cfefa09)`, `openclaw doctor` exit 0, Discord smoke routing worked.
- Our fork remote `origin/main` now matches local `main` at `cfefa09329`.
- Ignore remaining `upstream/main` divergence for this task; that is the original OpenClaw repo and is not the blocker here.

Live facts rechecked after the boot repair:

```text
openclaw --version
# OpenClaw 2026.6.2 (cfefa09)

node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e.message); process.exit(1)})"
# Cannot find package 'global-agent'
```

`grill-trigger.py --dry-run --json` can build the issue-grill prompt/bundle, but dry-run intentionally does not prove the final `openclaw session send` dispatch path. This task is still needed because the explicit `global-agent` runtime dependency/import path remains broken.

## Goal

Make the Mission Control issue grill button able to dispatch to `#issue-grill` without showing `Grill failed`, while preserving the existing minimal prompt and bounded-reader behavior.

## Scope

Primary project: `/Users/michal/Projects/openclaw-fork`.

Optional small hardening in `/Users/michal/Projects/mission-control` is allowed only if it is needed to surface diagnostics cleanly and does not mask real dispatch failures.

## Required work

1. Identify why built OpenClaw `dist/proxy-lifecycle-*.js` imports `global-agent` while package metadata does not declare/install it.
2. Fix the smallest correct source/package issue:
   - either declare/install the real runtime dependency, or
   - remove/replace the stale import in the source/build path if it is no longer needed.
3. Rebuild/link as needed so the installed/symlinked CLI can run the `openclaw session send` path used by `grill-trigger.py`.
4. Re-run the focused checks below.
5. If Mission Control still reports `Grill failed` after the CLI fix, inspect `services/issues.runGrillTrigger` error handling and add a minimal diagnostic hardening only if safe.

## Acceptance

Run and record evidence:

```bash
cd /Users/michal/Projects/openclaw-fork
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

Then from workspace:

```bash
cd /Users/michal/.openclaw/workspace
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

Then from Mission Control:

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

If the final live dispatch would post to Discord/GitHub, stop before any destructive/public posting and report the exact command/output needed for Michal to retry the MC button instead.

## Guardrails

- No git operations in the task.
- Do not touch channel IDs, session keys, cron config, or routing semantics.
- Do not undo or rework the already-committed `speech-core/runtime-api.js` Gateway boot fix unless a test proves it is directly involved.
- Do not treat `upstream/main` divergence as a blocker; only local working tree and `origin/main` backup safety matter for this task.

## Previous Plan (rejected - attempt 1)

Plan file: /Users/michal/Projects/openclaw-fork/plans/2026-06-10_warm-cove-7102_fix-mc-grill-button-dispatch-failure-caused-by-openclaw-cli.md
Review feedback: The plan identifies the missing `global-agent` dependency, but it is mostly TODOs and silently omits the exit-handling requirement, so it cannot demonstrate a simple root-cause fix aligned with the task.
Read the previous plan, understand what was wrong, and produce a corrected plan.
