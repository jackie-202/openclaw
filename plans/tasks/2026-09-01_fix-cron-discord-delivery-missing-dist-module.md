# Fix cron Discord delivery missing dist module

## Problem

Gateway cron jobs `opencode-monitor` and `batch-orchestrator` execute successfully and produce actionable summaries, but Discord delivery fails with:

`Cannot find module '/Users/michal/Projects/openclaw-fork/dist/channel-outbound-send.js' imported from '/Users/michal/Projects/openclaw-fork/dist/deps-D9AmLXpX.js'`

Observed examples on 2026-09-01:

- opencode-monitor summary for `bold-vale-0080` was not delivered.
- batch-orchestrator summaries for `cool-fork-9121` were not delivered.
- Current dist now contains `dist/channel-outbound-send.js`, so investigate why the running Gateway/import graph saw an absent or inconsistent build artifact and make delivery resilient/correct across build and restart/update lifecycle.

## Scope

Repository: `/Users/michal/Projects/openclaw-fork` only. Do not inspect or modify other repositories or external config. Existing cron run evidence above is authoritative external evidence.

## Requirements

1. Reproduce or characterize the inconsistent dist/import condition behind failed outbound Discord delivery.
2. Identify the source/build packaging or runtime reload lifecycle defect; do not patch generated `dist/` as the solution.
3. Implement the smallest source-level correction that ensures all required outbound-delivery chunks/modules are present and consistently loadable by a running Gateway after the supported build/update/restart flow.
4. Add a regression test that would fail for the observed missing `dist/channel-outbound-send.js` import condition.
5. Preserve existing delivery behavior and channel routing.

## Verification

- Run the focused regression test.
- Run the smallest relevant build/package verification proving the emitted import graph resolves.
- Run the relevant outbound-delivery test suite.
- Record exact commands and results in the final note.

## Acceptance criteria

- A built distribution cannot reference a missing `channel-outbound-send.js` module.
- The correction is source/build-lifecycle based, not a manual generated-file workaround.
- Focused regression and relevant delivery tests pass.
- No unrelated files are changed.
