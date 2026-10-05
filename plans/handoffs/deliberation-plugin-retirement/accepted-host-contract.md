# Retirement technical input: external plugin and host-isolated verification

Host, 2026-10-04; user instruction message1556301986163327068 authorizes necessary manual decoupling and starting the existing cleanup task, not a new failed-chain repair or live deploy.

## Accepted external source/API contract

Package `@openclaw-deliberation/plugin` version2026.6.5 owns Deliberation intake/history/delivery behavior. Runtime selected plugin comes from the immutable source-history release recorded in `plans/checkpoints/deliberation_external_plugin_cutover.md`, not `extensions/deliberation`. Public package boundaries are plugin entry and `./api`; wire producer pin and receipt identity remain unchanged. `plugin-retirement-manifest.json` binds all43 current fork file hashes and external counterparts, with literal test scenarios. All15 original test paths exist externally; the external suite has17files/380cases. Dynamic test titles and changed semantics need inspection, not count-based equivalence.

## Successful full external native gate

Host ran every external native suite using the existing host test resolver configuration and real native adapter sources. No suite/mock substitution, no source edits, no timeout relaxation. Command:

`node node_modules/vitest/vitest.mjs run --config .retirement-host-vitest.config.mjs --maxWorkers=2 --reporter=default`

Result17files passed/380tests passed; log `external-native-suite-host.log`. The host test config merged `sharedVitestConfig.resolve.alias` from the existing host test configuration and selected the same installed `@slack/web-api/dist/index.js` for the existing mock and native adapter. This is a host-integrated source test, NOT evidence of a self-contained installed SDK/package gate. First unconstrained-parallel run had a5second module-import timeout; limiting to2workers passed all tests at unchanged5second assertion timeout. Temporary config archived by host; worker must not create sibling-source imports.

## Deliberately superseded file/scenarios

`src/thread-identity-store.ts` has no external counterpart: this local map was replaced by producer-owned source-history identity persistence and resolution, not accidentally omitted. External hooks scenarios are named `commits Slack child-to-thread identity only in the unchanged KM intake body` and `commits authenticated Discord child identity without changing parent route ownership`, replacing old `registers ... before sending ...` titles. Public producer contract, resolve endpoint and tests moved custody to the intake producer. Retain generic history/native transport APIs; do not retain a second thread map solely to match stale filenames. This mapping explains exact-title mismatch, not blanket permission to remove unmatched coverage.

## Effective host isolation

Canonical project registry reader verified fork `post_impl=''`, `deploy.enabled=false`; full `testCommand='cd ~/Projects/openclaw-fork && npm test'` unchanged. Worker focused tests plus full pipeline test gate remain enabled. No build, npm link, doctor or deploy command is run automatically from completion. Any worker build/type check must avoid changing live dist/runtime artifacts; select source-level verification if shared live dist makes build unsafe. The global installed CLI remains linked to the host fork, so removal must be confined to manifest-proven non-runtime bundled sources. Do not unlink the working host CLI or touch installed external plugin artifacts.

Host backup `/Users/michal/.openclaw/backups/deliberation-retirement-20261004-1548` retains original registry and test config. Host restores only changed hook fields after explicit final acceptance, preserving later registry changes. Prior historical rejected task results stay unchanged; no full package-readiness or extraction-completion claim follows from this independent retirement.
