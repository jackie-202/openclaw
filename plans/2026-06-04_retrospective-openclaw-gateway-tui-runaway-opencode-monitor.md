# Retrospective 2026-06-04: OpenClaw gateway/TUI degradation from runaway opencode monitor

Retrospective record of the live recovery session where OpenClaw Gateway appeared broken, TUI stopped responding, and CPU was saturated by a cron-triggered opencode monitor run.

Status: mitigated again after recurrence
Project: `openclaw-fork`
Primary affected surfaces: Gateway LaunchAgent, OpenClaw TUI, cron job `opencode-monitor`, repo `dist` build output

## Summary

Gateway was not fundamentally down. It was repeatedly degraded by a combination of:

- a scheduled `opencode-monitor` cron job running every 2 minutes
- the monitor wrapper launching `npm test` in this repo
- many parallel Vitest projects consuming CPU
- a stale or half-rebuilt `dist` during concurrent CLI auto-builds
- an old `openclaw-tui` process stuck on a stale gateway socket

The incident was mitigated by terminating the runaway test process tree, killing the stale TUI process, disabling the `opencode-monitor` cron job through the OpenClaw cron CLI, and rebuilding `dist` once sequentially.

## What was observed first

Initial report: a previous OpenCode agent may have changed OpenClaw configuration and Gateway seemed broken.

Evidence gathered:

- `pnpm openclaw gateway status --deep` showed the LaunchAgent loaded and Gateway process running on port `18789`, but WebSocket probe timed out.
- The Gateway process listened on `127.0.0.1:18789`, so the port was not missing.
- A Python process `opencode-monitor.py` was running from the user workspace and had launched `npm test` in `openclaw-fork`.
- Multiple Vitest processes were running in parallel under `scripts/test-projects.mjs`.
- Gateway CPU was elevated while the test suite was also saturating CPU.

Representative process chain from the first investigation:

```text
opencode-monitor.py
  /bin/sh -c cd <repo> && npm test
    npm test
      node scripts/test-projects.mjs
        vitest tooling/extensions/providers/agents-core/auto-reply/infra/memory/telegram/commands/discord...
```

Important log findings from the first investigation:

- repeated Gateway WebSocket request errors from a client using invalid `sessions.list` params with unexpected property `active`
- repeated embedded agent failures due model quota/rate limit (`429 quota exceeded` on `copilot/claude-sonnet-4.6`)
- cron job `opencode-monitor` timing out
- attempted Gateway config patch for Discord channel model routing, with protected-path failures
- Gateway reload deferring restart while active operations/replies/embedded runs were still in progress
- Gateway eventually restarting after operations completed

The initial `openclaw status` command detected stale `dist` (`dirty_watched_tree`) and rebuilt. After that auto-rebuild/restart, `gateway status --deep` passed with:

```text
Connectivity probe: ok
Capability: admin-capable
```

At that point, the runaway test processes had also exited, so no configuration edit was made.

## Second report: TUI unresponsive and high CPU

Second report: TUI did not respond and there were likely stuck CPU-heavy processes.

Evidence gathered:

- `opencode-monitor.py` had started again.
- It again launched `npm test` in this repo.
- Many Vitest subprocesses were consuming roughly 80-167% CPU each.
- `openclaw-tui` itself was consuming about 77% CPU.
- `lsof` showed the TUI connection to Gateway in `CLOSE_WAIT`.
- Gateway itself still passed deep probe at that moment.

Representative high-CPU processes in the second investigation:

```text
vitest.agents-core.config.ts        ~167% CPU
vitest.commands.config.ts           ~155% CPU
vitest.auto-reply-reply.config.ts   ~154% CPU
vitest.extension-providers.config.ts ~153% CPU
vitest.gateway-client.config.ts     ~151% CPU
vitest.infra.config.ts              ~150% CPU
openclaw-tui                         ~77% CPU, stale socket
gateway                              ~74% CPU during pressure
```

## Immediate mitigations performed

The first mitigation was to terminate only the runaway OpenClaw-related process tree, not unrelated user/system processes.

Terminated categories:

- `monitor-cron-wrapper.py`
- `opencode-monitor.py`
- shell wrapper launching `npm test`
- `npm test`
- `scripts/test-projects.mjs`
- Vitest subprocesses spawned by that test run
- stale `openclaw-tui` process with `CLOSE_WAIT` gateway socket

After the first kill pass:

- test processes disappeared
- Gateway stayed running
- TUI CPU dropped or the stale TUI process exited
- Gateway port no longer showed the TUI `CLOSE_WAIT` connection

## Root cause found

The scheduled cron job was still enabled, so the mitigation was not durable.

Cron job details:

```text
id: d401fb17-b12e-42ad-943c-14638d907071
name: opencode-monitor
schedule: every 2m
enabled: true before mitigation
```

The job payload asked an agent to run one exec command:

```text
python3 <home>/.openclaw/workspace/km-system/scripts/monitor-cron-wrapper.py --summary
```

That wrapper then launched `npm test` in this repo, which was the CPU-heavy behavior.

Durable mitigation performed:

```text
pnpm openclaw cron disable d401fb17-b12e-42ad-943c-14638d907071 --timeout 30000
```

Verified result:

```text
id: d401fb17-b12e-42ad-943c-14638d907071
name: opencode-monitor
enabled: no
status: disabled
next: -
```

## Dist/build issue encountered during recovery

Several `pnpm openclaw ...` commands auto-triggered rebuilds because `dist` was stale. One recovery step launched multiple CLI checks in parallel, which caused a transient inconsistent `dist` state:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '<repo>/dist/fs-safe-defaults-DPw2RCP0.js' imported from <repo>/dist/fs-safe-advanced-DBHw0phb.js
```

This was treated as a build-output race, not a source-code bug. It was fixed by running one sequential build:

```text
pnpm build
```

Build completed successfully, including bundled plugin assets and runtime postbuild steps.

After the sequential build, `pnpm openclaw gateway status --deep` passed again:

```text
Connectivity probe: ok
Capability: admin-capable
```

## Final verified state

After cleanup:

- Gateway LaunchAgent was still loaded and running.
- Gateway process was still listening on port `18789`.
- Gateway deep probe passed.
- No `opencode-monitor.py` process remained.
- No `monitor-cron-wrapper.py` process remained.
- No `npm test` process remained.
- No Vitest processes from the monitor run remained.
- No stale `openclaw-tui` process remained.
- `opencode-monitor` cron was disabled.

The remaining visible CPU pressure was no longer from OpenClaw tests. It came mostly from macOS Spotlight indexing (`mds`, `mds_stores`, `mdworker_shared`) after rebuilds and file churn, plus normal UI/virtualization processes.

## Recurrence later the same day

After a later Gateway restart, OpenClaw still appeared intermittently slow. A fresh read-only pass found that the Gateway was listening and `pnpm openclaw gateway status --deep` passed, but recent WebSocket `status` and `cron.list` replies had taken 47-151 seconds during active restart draining.

Additional findings:

- `opencode-monitor` had become enabled again in `cron list`, with `next` scheduled and recent successful runs.
- Gateway logs showed the restart waiting on active embedded runs and cron background tasks, including `opencode-monitor` and `batch-orchestrator`.
- The Gateway eventually drained active work and restarted cleanly at `16:24`.
- After restart, WS replies returned to roughly 100-300 ms and Gateway CPU dropped back below 1%.
- `Mission Control` and `openclaw-tui` remained connected clients; `Mission Control` continued to send invalid `sessions.list` params containing `active`, producing log noise but not blocking Gateway.

Mitigation repeated:

```text
pnpm openclaw cron disable d401fb17-b12e-42ad-943c-14638d907071
pnpm openclaw cron show d401fb17-b12e-42ad-943c-14638d907071
```

Verified result again:

```text
enabled: no
status: disabled
next: -
```

One recovery mistake was repeated: running multiple `pnpm openclaw ...` commands in parallel while the CLI considered `dist` stale caused another transient chunk-missing error:

```text
Cannot find module '<repo>/dist/status-B2m52fz8.js' imported from '<repo>/dist/status-BXjBeIGS.js'
```

That was fixed again by a single sequential `pnpm build`, followed by a sequential `pnpm openclaw gateway status --deep`, which passed.

Final proof from the second recovery pass:

```text
pnpm build
pnpm openclaw gateway status --deep
```

The sequential build completed successfully, including bundled plugin assets, runtime postbuild, plugin SDK export checks, static extension assets, build metadata, and CLI compatibility output. The follow-up deep Gateway probe showed:

```text
Runtime: running (pid 95328)
Connectivity probe: ok
Capability: admin-capable
Listening: 127.0.0.1:18789
```

A delayed CPU and socket sample showed the transient post-build/startup CPU spike had cleared:

```text
mission-control/server.js                         1.6% CPU
openclaw gateway pid 95328                        0.1% CPU
openclaw-tui                                      0.0% CPU
```

At that point Gateway was still listening on `127.0.0.1:18789` and `[::1]:18789`, with two local persistent clients connected: `openclaw-tui` and `Mission Control`. No further kill or restart was performed because the health probe was green, CPU had normalized, and the remaining issue was log noise rather than a live outage.

Known residuals after the second recovery handoff:

- `Mission Control` continues to send invalid `sessions.list` requests with the deprecated/unaccepted `active` property.
- `openclaw-tui` remains connected but idle and not consuming CPU.
- `batch-orchestrator` is still an enabled every-2m cron job and may create ordinary background activity, but it was not the confirmed runaway source.
- `opencode-monitor` was disabled again at that point and was recommended to remain disabled until its wrapper is audited.

## Later TUI reconnect follow-up

Later the same day, TUI briefly showed `not connected to gateway` but then started responding again. No hard Gateway restart, TUI kill, or manual cron JSON edit was performed during this later follow-up.

What was checked:

- Gateway LaunchAgent process `95328` was still running and listening on port `18789`.
- The active TUI process `98170` had an `ESTABLISHED` socket to Gateway: `127.0.0.1:60404 -> 127.0.0.1:18789`.
- `Mission Control` process `86804` also stayed connected over `[::1]:59954 -> [::1]:18789`.
- TUI reconnect was visible in Gateway logs on connection `3cd0eb4d...9fc7`, with repeated `cron.list` and `status` responses.
- Gateway did not appear fundamentally down, but some `status` responses still took roughly 5-14 seconds and one `gateway status --deep` probe timed out while the Gateway process was at about 100% CPU.

Important late-window findings:

- The user had intentionally re-enabled `opencode-monitor`; `jobs.json` later showed `enabled: true` for `d401fb17-b12e-42ad-943c-14638d907071`.
- A chained attempt to show/disable that cron job timed out at the `cron show` step with `GatewayTransportError: gateway timeout after 30000ms`, so it did not prove that a disable had been applied.
- After the user clarified that `opencode-monitor` was intentionally re-enabled and appeared to run well, no further attempt was made to disable it.
- The strongest concrete runtime errors in the late window were inconsistent `dist` artifacts, not a direct `opencode-monitor` failure:

```text
Cannot find module '<repo>/dist/runtime-plugins.runtime.js'
Cannot find module '<repo>/dist/plugin-sdk/channel-targets.js'
Cannot find module '<repo>/dist/channel-outbound-send-*.js'
```

The `17:11:40` hard cron error was attributed to `batch-orchestrator`, which failed while importing `extensions/speech-core/src/tts.ts` because `dist/plugin-sdk/channel-targets.js` was missing. Its failure notification also failed because an outbound-send dist chunk was missing.

Conclusion for the later follow-up:

- There is strong evidence that the first and second degradations involved `opencode-monitor` launching heavy test work and/or recurring agent work.
- There is not strong evidence that the later TUI reconnect issue was caused by `opencode-monitor` after the user re-enabled it.
- The later issue is better recorded as Gateway slowness plus stale/inconsistent `dist` build artifacts, with persistent clients reconnecting or waiting rather than a dead Gateway.
- The likely reason it recovered without a restart is that Gateway drained or recovered from the slow state, while the earlier sequential `pnpm build` repaired missing generated runtime artifacts.

## Follow-up dist diagnosis

After the user clarified that `opencode-monitor` was intentionally re-enabled and appeared healthy, a follow-up investigation focused on whether there was a concrete `dist` inconsistency to fix.

Confirmed current state after recovery:

- `dist/runtime-plugins.runtime.js` now exists and points at the current hash chunk.
- `dist/plugin-sdk/channel-targets.js` now exists and imports the expected compiled helper chunks.
- `dist/channel-outbound-send-DSJojww5.js` now exists and imports successfully.
- Direct runtime import smoke passed for these three paths.

Confirmed current residual artifact drift:

- `node scripts/check-plugin-sdk-exports.mjs` currently fails because many `dist/plugin-sdk/*.d.ts` files are missing.
- This DTS drift is not the cause of the live Gateway/TUI runtime outage, because Node runtime imports use the JS artifacts and those now resolve.
- It is still a real build artifact inconsistency for package/full-build quality, because published SDK exports expect those DTS files.

Likely underlying cause:

- `scripts/run-node.mjs` auto-builds local `pnpm openclaw ...` commands using only `scripts/tsdown-build.mjs` plus runtime postbuild.
- `scripts/tsdown-build.mjs` cleans `dist` and `dist-runtime` at startup before running tsdown, even when invoked with `--no-clean` for tsdown itself.
- The auto-build path does not run `build:plugin-sdk:dts`, `write-plugin-sdk-entry-dts`, or `check-plugin-sdk-exports`.
- Therefore a runtime-only local auto-build can remove full package artifacts such as plugin SDK DTS files and can briefly remove runtime lazy chunks while the live Gateway is still serving or importing from the same `dist` tree.
- The run-node build lock serializes multiple CLI auto-builds, but it does not protect the live Gateway process from lazy-importing files while another process is cleaning and rebuilding `dist` in place.

Connection to the same-day per-channel runtime profile implementation:

- The changed files for the per-channel implementation were in config/schema/session display/model override logic, not in `scripts/run-node.mjs`, `scripts/tsdown-build.mjs`, `scripts/runtime-postbuild.mjs`, or plugin SDK entry generation.
- Targeted tests for the changed per-channel/runtime-profile surfaces passed: `src/channels/model-overrides.test.ts`, `src/config/config.model-ref-validation.test.ts`, `src/config/zod-schema.providers.lazy-runtime.test.ts`, `src/gateway/session-utils.test.ts`, and `src/agents/openclaw-tools.session-status.test.ts`.
- The implementation likely contributed indirectly by keeping the source tree dirty. `run-node` treats `dirty_watched_tree` as a build requirement for most `pnpm openclaw ...` commands, so recovery commands such as `cron show`, `cron list`, and `cron disable` can trigger repeated in-place `dist` rebuilds while the live Gateway is still running.
- `gateway status` has a special dirty-tree path that can use existing `dist`, but cron/admin commands do not, so the recovery workflow itself can create the live `dist` race when source files are dirty.
- No direct evidence was found that `resolveChannelRuntimeProfile` or `runtimeByChannel` logic caused the missing-module runtime failures. The direct missing-module evidence still points at in-place `dist` cleanup/rebuild during live lazy imports.

Additional runtime hardening gap:

- `dispatch-BViq6ZGC.js` imports `./runtime-plugins.runtime.js`, which is covered by the stable runtime alias postbuild logic.
- `deps-DR7vOr_0.js` imports `./channel-outbound-send-DSJojww5.js`, which is a hash-specific chunk and is not covered by the stable `.runtime.js` alias logic.
- If `deps-*.js` remains loaded in a live Gateway while `dist` is rebuilt and the hash changes, this lazy import can fail in the same way old `runtime-plugins.runtime-*` chunks used to fail before stable aliases were added.

Candidate fixes, in priority order:

1. Make the live Gateway and local auto-build path stop sharing a destructively cleaned `dist` tree. Options include atomic build output swap, build-to-temp then replace only after complete postbuild, or requiring Gateway restart/stop before a source checkout auto-build that cleans `dist`.
2. Add a stable runtime boundary for `src/cli/send-runtime/channel-outbound-send.ts`, for example by turning it into a `.runtime` lazy boundary and ensuring postbuild creates a stable alias, so live `deps-*` chunks do not depend on a hash-specific `channel-outbound-send-*` filename.
3. Decide whether run-node runtime auto-build should preserve or regenerate plugin SDK DTS artifacts. If full-package artifact consistency matters after any `pnpm openclaw ...` auto-build, the auto-build must either run the DTS steps or avoid deleting existing `dist/plugin-sdk/*.d.ts` files.
4. Add a regression check for the current `deps-* -> channel-outbound-send-*` hashed lazy import so future runtime lazy boundaries either use stable aliases or are explicitly accepted as non-live-safe.

## 2026-06-09 speech-core runtime-api follow-up

After an upstream sync, TUI/agent replies failed with:

```text
Unable to resolve bundled plugin public surface speech-core/runtime-api.js
```

Source/build evidence gathered:

- `extensions/speech-core/**` does not exist; speech runtime now lives under `packages/speech-core/`.
- `src/plugin-sdk/tts-runtime.ts` already imports `../../packages/speech-core/runtime-api.js`; it does not call the bundled plugin public-surface loader for `speech-core`.
- Current `dist/plugin-sdk/tts-runtime.js` points at the compiled `tts-runtime-*` and `speech-core-*` chunks, not at `extensions/speech-core`.
- The extension boundary stub still allows `@openclaw/speech-core/runtime-api.js`, but runtime workspace package alias generation did not include `@openclaw/speech-core` and only checked `packages/<pkg>/src/<file>` for source files.
- `packages/speech-core/runtime-api.ts` is intentionally package-root based, not under `packages/speech-core/src/`.

Source fix implemented:

- `src/plugins/sdk-alias.ts` now includes `@openclaw/speech-core` in workspace package alias generation.
- Workspace package aliases now check both `packages/<pkg>/src/<file>` and `packages/<pkg>/<file>` for source resolution, so package-root entrypoints such as `packages/speech-core/runtime-api.ts` resolve in source checkouts.
- `packages/speech-core/package.json` now exports `./runtime-api.js` to match the extension boundary stub and the failing runtime specifier.
- `tsconfig.json` now maps `@openclaw/speech-core/runtime-api.js` to `packages/speech-core/runtime-api.ts`.
- `src/plugins/sdk-alias.test.ts` now covers source and dist alias resolution for both `@openclaw/speech-core/runtime-api` and `@openclaw/speech-core/runtime-api.js`.

Verification performed:

```text
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

All passed.

Build/restart verification after user approval:

```text
node dist/index.js gateway stop
pnpm build
node dist/index.js gateway start
node dist/index.js gateway status --deep
```

Result:

- Gateway LaunchAgent stopped before the build, avoiding live `dist` cleanup under the running Gateway.
- `pnpm build` completed successfully, including `tsdown`, runtime postbuild, plugin SDK DTS generation, `check-plugin-sdk-exports`, UI build, and CLI metadata/compat steps.
- Gateway restarted from `/Users/michal/Projects/openclaw-fork/dist/index.js`.
- Deep status passed: runtime running, connectivity probe `ok`, capability `admin-capable`.
- Connected clients after restart included `openclaw-tui` and Mission Control.

## Changes made

Operational/configuration changes:

- disabled OpenClaw cron job `d401fb17-b12e-42ad-943c-14638d907071` (`opencode-monitor`)
- terminated runaway process trees for the cron-launched test runs
- terminated the stale nonresponsive TUI process
- rebuilt repo `dist` with `pnpm build`
- disabled `opencode-monitor` a second time after it was observed enabled again later the same day
- recorded the recurrence and final health proof in this report
- documented the later TUI reconnect follow-up, including that `opencode-monitor` was intentionally re-enabled by the user and was not proven to be the cause of that later issue

No source code changes were made during the recovery.

## Follow-up recommendations

1. If `opencode-monitor` remains enabled, keep watching its cron status and Gateway liveness; do not treat it as the confirmed cause of every later slowdown without matching log evidence.
2. Inspect `monitor-cron-wrapper.py` and prevent it from launching broad local test suites automatically.
3. If monitor functionality is still needed, make it run a cheap status-only command and never `npm test` or `pnpm test` from cron.
4. Avoid running multiple `pnpm openclaw ...` commands in parallel when `dist` is stale, because the CLI auto-build path can race and leave chunks temporarily inconsistent.
5. Restart TUI manually after Gateway recovery instead of reusing a TUI process that has a stale `CLOSE_WAIT` socket.
6. Investigate why `opencode-monitor` became enabled again after the first mitigation.
7. Update or restart `Mission Control` if the repeated invalid `sessions.list { active: ... }` requests are undesirable in logs.

## Safe enable/keep-enabled path if needed

Only re-enable, or keep enabled long-term, after auditing the wrapper behavior:

```text
pnpm openclaw cron enable d401fb17-b12e-42ad-943c-14638d907071
```

Before re-enabling or leaving it enabled, validate that the wrapper cannot launch a broad local test suite or long-running build loop.
