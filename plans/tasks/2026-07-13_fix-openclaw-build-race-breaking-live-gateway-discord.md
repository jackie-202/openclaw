# Fix OpenClaw build race breaking live Gateway Discord delivery

## Context

Michal reported that Jackie sometimes does not answer on Discord. Live evidence on 2026-07-13 shows this is not a Discord token/outbound problem; it is a live Gateway + mutable `dist/` race.

Observed log evidence:

- `discord debounce flush failed: Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/michal/Projects/openclaw-fork/dist/message-handler.preflight-DWw5zVlT.js' imported from /Users/michal/Projects/openclaw-fork/dist/message-handler-Dg3aq_EQ.js`
- Later the same failure repeated for `message-handler.preflight-mROsjPvj.js` imported from `message-handler-DjLrWbLf.js`.
- Heartbeat also failed during the same window: `Cannot find module '/Users/michal/Projects/openclaw-fork/dist/heartbeat-runner.runtime.js' imported from .../dist/heartbeat-runner-DUmnwxNW.js`.
- Plugin shutdown showed the same pattern: missing `control-service-*.js` imported from `plugin-registration-*.js`.
- Outbound Discord sends still succeeded (`✅ Sent via Discord...`), while inbound debounce flush failed, so the symptom is intermittent missing replies, not full Discord outage.
- `bold-dune-2644` and its parent chain were running in `openclaw-fork` at the same time and builds were rewriting hashed `dist` chunks while the live Gateway process still had old dynamic import URLs in memory.

Current live Gateway runs from `/Users/michal/Projects/openclaw-fork/dist/index.js gateway --port 18789`, i.e. the same checkout/`dist` that implementation tasks rebuild. Any clean build that deletes/replaces hashed chunks can break dynamic imports in the already-running Gateway.

## Goal

Make OpenClaw development/build tasks unable to break the currently running Gateway by deleting or replacing dynamically imported `dist/` chunks under the live process.

## Scope

Work in `openclaw-fork` only. Diagnose and implement the smallest safe fix for the build/runtime race. Prefer a systemic guard over patching one missing chunk.

Likely acceptable directions (choose after inspecting build scripts/runtime):

1. Build into a staging directory and atomically promote only at restart-safe moments, or preserve old chunks until process restart.
2. Change dev task/build workflow so implementation builds do not mutate the live Gateway `dist/` while Gateway runs from that same directory.
3. Add a guard to build scripts that detects a live Gateway using this checkout and refuses/describes unsafe clean rebuild unless invoked by an explicit restart/update path.
4. If the intended architecture is “Gateway must run from installed package, not working tree”, enforce/document/fix the link/start path so task builds happen in a separate worktree or do not touch the runtime install.

Do not simply restart Gateway as the fix; restart is only a mitigation after damage already occurred.

## Acceptance criteria

- There is a focused regression test or script-level check proving that the selected fix prevents stale dynamic import chunk breakage during a build/rebuild scenario.
- The live Gateway no longer runs with old dynamic import references to files that normal task builds can delete underneath it, or normal task builds refuse/avoid the unsafe mutation.
- The fix covers Discord inbound handler chunks and heartbeat/plugin sidecar chunks as the same class of problem, not one filename.
- Existing build/test workflow remains usable for OpenClaw development agents.
- Final note records exact commands and evidence, including one negative/repro observation from the current logs and one positive verification after the fix.

## Verification

Run the focused test/check added for this race. Also run the smallest relevant existing build-sidecar or runtime-sidecar validation command, for example `node scripts/check-runtime-sidecar-loaders.mjs` if still applicable, plus any package test target directly covering the changed build/start logic.
