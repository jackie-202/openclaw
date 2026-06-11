# Plan 2026-06-10: Fix MC grill button dispatch failure

## Problem

Mission Control issue grill dispatch can still fail because the OpenClaw CLI runtime can load built proxy lifecycle code that expects `global-agent`, but `global-agent` is not resolvable from the linked fork install.

Separate note: the `speech-core/runtime-api.js` Gateway reply/routing issue is already fixed in `cfefa09329` and is not part of this task.

## Root cause to fix

`dist/proxy-lifecycle-*.js` can import `global-agent`, but OpenClaw package metadata/lock state do not declare it. The linked CLI therefore works for simple commands but can fail on dispatch paths that load proxy lifecycle/runtime startup.

There is also an MC error-reporting gap: `mission-control/services/issues.js::runGrillTrigger()` uses `execFileSync()` without catching non-zero exits, so when `grill-trigger.py` emits JSON diagnostics and exits non-zero, MC collapses that into generic `Grill failed` instead of returning structured diagnostics.

## Implementation steps

1. In `/Users/michal/Projects/openclaw-fork`, inspect the source/build output that creates `dist/proxy-lifecycle-*.js` and confirm whether `global-agent` is still intentionally required by the proxy stack.
2. Apply the smallest correct OpenClaw fix:
   - if the import is intentional, add `global-agent` to the correct runtime dependencies and update the lockfile;
   - if it is stale, remove/replace the source import and rebuild so `dist` no longer references it.
3. Rebuild OpenClaw and verify the linked CLI can load the affected dispatch path.
4. In `/Users/michal/Projects/mission-control`, harden `runGrillTrigger()` so it catches `execFileSync` failures, parses JSON diagnostics from `stdout` when present, and still reports real non-JSON failures as errors. Keep this small and covered by existing grill/issues tests.
5. Run the acceptance checks from the task file.

## Files likely to modify

- OpenClaw package metadata / lockfile, or proxy lifecycle source if the import is stale.
- Possibly `mission-control/services/issues.js` and its existing tests for non-zero JSON diagnostics handling.

## Validation

Required evidence:

```bash
cd /Users/michal/Projects/openclaw-fork
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

Then:

```bash
cd /Users/michal/.openclaw/workspace
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

Then:

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

If the last command would post publicly/externally, stop and report the exact retry evidence instead of posting.

## Guardrails

- No git operations.
- Do not touch channel IDs, session keys, cron config, or routing semantics.
- Do not rework the already-fixed `speech-core/runtime-api.js` alias path.
- Do not treat `upstream/main` divergence as a blocker for this task.
