# OpenClaw fork: verify issue-grill CLI dispatch path after global-agent dependency fix

## Context

The MC grill button originally failed because the OpenClaw CLI dispatch path loaded built proxy lifecycle code that imported `global-agent`, but `global-agent` was not resolvable from the linked fork install.

Known prior state:

- Original task: `warm-cove-7102` appears to have added the `global-agent` runtime dependency metadata/lockfile fix.
- Acceptance still required rebuild/verification proof that the linked CLI can load the affected dispatch path.
- Mission Control diagnostics are handled by a separate `mission-control` task; do not edit Mission Control here.

## Goal

In the OpenClaw fork, confirm the `global-agent` dependency fix is complete and prove the linked OpenClaw CLI can load/run the issue-grill dispatch path enough to support Mission Control.

## Scope

Project: `/Users/michal/Projects/openclaw-fork` primarily.

Allowed changes:

- OpenClaw package metadata / lockfile / source only if verification proves the previous dependency fix is incomplete.
- OpenClaw-local plan/checkpoint evidence files if the project convention requires recording proof.

Do not modify Mission Control, workspace scripts, channel IDs, session routing, cron config, or task pipeline code in this task.

## Requirements

1. Inspect the current OpenClaw fork state and verify whether `global-agent` is declared where the runtime CLI needs it.
2. Rebuild or otherwise refresh linked CLI artifacts if needed so the installed/symlinked `openclaw` command uses the fixed dependency graph.
3. Prove the affected CLI/runtime path can load without `ERR_MODULE_NOT_FOUND: global-agent`.
4. Run the focused OpenClaw checks below and record evidence.
5. If the proof shows the previous fix is incomplete, apply the smallest OpenClaw-only correction and rerun checks.
6. Do not attempt the Mission Control `runGrillTrigger()` implementation here; that is a separate task.

## Verification

Run and record:

```bash
cd /Users/michal/Projects/openclaw-fork
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

Then run the safe workspace smoke that builds the issue-grill prompt/bundle without posting externally:

```bash
cd /Users/michal/.openclaw/workspace
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

If any command requires permission outside the OpenClaw fork workspace, record the exact blocker and do not fake the evidence.

## Guardrails

- No git operations.
- Do not touch Mission Control code.
- Do not touch channel IDs, session keys, cron config, or routing semantics.
- Do not rework unrelated upstream divergence.
