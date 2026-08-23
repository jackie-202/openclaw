# Final Note: cool-cove-3068

## Result

`OR-22 doctor-package-writeback-built-five-hook-runtime`: PASS.

Commit `ee0cc3b2b82` makes the audited Deliberation doctor API, compatibility normalizer, focused tests, package E2E, package inventory assertion, and five-hook built smoke reachable. No KM, live installation, live config, Gateway, spool, provider, deployment, or pilot surface was accessed or changed.

## Tracked Source

- `extensions/deliberation/doctor-contract-api.ts`
- `extensions/deliberation/src/config-compat.ts`
- `extensions/deliberation/src/config-compat.test.ts`
- `test/scripts/deliberation-doctor-package.e2e.test.ts`
- `test/scripts/bundled-plugin-build-entries.test.ts`
- `scripts/test-built-plugin-singleton.mjs`

`git ls-files --error-unmatch` succeeded for the four formerly orphaned doctor/package files. The build collector now reports `sourceEntries` as `['./index.ts','./api.ts','./doctor-contract-api.ts']`.

## Emitted Package

- `dist/extensions/deliberation/doctor-contract-api.js`
- `dist-runtime/extensions/deliberation/doctor-contract-api.js`
- Isolated installed package: `node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js`

The fixed tarball was built at `/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz`, installed under a temporary npm prefix, and executed only through that installed package's `openclaw.mjs`.

## Migration Evidence

- Legacy Discord and Slack `sources[]` became deterministic `pipelines[]` IDs `v1:discord:acct:source` and `v1:slack:workspace-a:C123`.
- The optional legacy global target became the explicit canonical per-pipeline target.
- `sources` and `deliveryTarget` were removed only after the complete canonical result passed `parseDeliberationConfig`.
- A second installed `doctor --fix --non-interactive` run produced byte-identical config.
- Installed `config validate` and `plugins list --json` succeeded after writeback.
- Mixed authority, duplicate routes, processing-source overlap, malformed legacy input, and impossible thread inheritance produced no migration claim or synthesized pipeline.
- Canonical runtime tests continue to reject legacy keys; compatibility remains doctor-only.

## Five-Hook Evidence

The built runtime smoke passed with this exact ordered hook contract:

1. `inbound_event_policy`
2. `inbound_claim`
3. `before_dispatch`
4. `before_tool_call`
5. `message_sending`

It also retained exactly one service: `deliberation-final-delivery`.

## Verification

- RED package command: `env OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose` failed as intended because the installed sidecar was absent.
- GREEN identical package command: PASS, 1 file and named OR-22 leaf.
- `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/config-compat.test.ts src/plugins/doctor-contract-registry.test.ts src/plugins/doctor-contract-registry.load-paths.test.ts src/commands/doctor/shared/channel-legacy-config-migrate.test.ts src/plugins/source-checkout-runtime.test.ts test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose`: PASS, 4 shards, 7 files, 77 tests.
- `pnpm build`: PASS.
- Emitted-file/build-entry probe: PASS with `distDoctor:true`, `runtimeDoctor:true`, and `./doctor-contract-api.ts` selected.
- `node scripts/package-openclaw-for-docker.mjs --output-dir "/Users/michal/.openclaw/tmp/opencode/cool-cove-3068" --output-name openclaw-current.tgz`: PASS, including tarball integrity.
- `pnpm test:build:singleton`: PASS, built five-hook singleton and sole delivery service.
- `pnpm tsgo:extensions`: PASS.
- `pnpm tsgo:extensions:test`: BLOCKED by pre-existing errors in unrelated dirty files `extensions/deliberation/src/history-read.test.ts`, `extensions/discord/src/monitor/message-handler.queue.test.ts`, and `extensions/slack/src/monitor/message-handler.test.ts`; no error referenced a task-owned file.
- `pnpm tsgo:core:test`: BLOCKED by pre-existing `priority` fixture errors in `src/plugins/hooks.sync-only.test.ts`; no error referenced a task-owned file.
- `node scripts/run-oxlint.mjs --tsconfig config/tsconfig/oxlint.extensions.json extensions/deliberation/doctor-contract-api.ts extensions/deliberation/src/config-compat.ts extensions/deliberation/src/config-compat.test.ts`: PASS.
- `node scripts/run-oxlint.mjs scripts/test-built-plugin-singleton.mjs test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-doctor-package.e2e.test.ts`: PASS.
- `pnpm format:check -- extensions/deliberation/doctor-contract-api.ts extensions/deliberation/src/config-compat.ts extensions/deliberation/src/config-compat.test.ts scripts/test-built-plugin-singleton.mjs test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-doctor-package.e2e.test.ts plans/checkpoints/cool-cove-3068.checkpoint.md plans/checkpoints/cool-cove-3068.red-green-proof.md`: PASS after formatting the generated evidence files.
- `git diff --check`: PASS.
- `.agents/skills/autoreview/scripts/autoreview --mode commit --commit ee0cc3b2b82 ...`: final bounded Codex review clean, no accepted/actionable findings.

The first local autoreview attempt exceeded the engine's 1 MiB input limit because unrelated dirty-worktree changes produced a 1.87 MiB bundle. Commit-scoped review supplied the required bounded review. One initial compatibility finding was rejected after direct parent-contract proof showed the legacy plugin target had no wire `mode`; one commit-isolation finding was resolved by reviewing against the explicitly required preceding canonical-pipelines baseline.
