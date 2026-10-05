# Plan 2026-10-04: Deliberation plugin: retire replaced bundled implementation and host path coupling

## Analysis

- Preserve commit `16a38827177` and current uncommitted retirement work; compare task-specific hunks before editing. The 43 source removals, workspace importer removal, generic discovery fixtures, and negative packaging protections are already completed.
- Repair loaders at `extensions/discord/src/monitor/message-handler.deliberation.test.ts:138`, `extensions/discord/src/monitor/message-handler.process.test.ts:574`, and `extensions/slack/src/monitor/message-handler.deliberation.test.ts:106`; all currently enable Deliberation against the bundled root without an external `plugins.load.paths` entry.
- Use the existing public loader exported by `src/plugin-sdk/plugin-test-runtime.ts:18`; its implementation consumes configured load paths in `src/plugins/loader.ts:1920`. Keep bundled Discord/Slack available while selecting Deliberation exclusively from a config-origin package.
- Treat `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md:7-19` as ownership authority, not runnable input: the repo-local handoff contains no package archive/public test contract and no expanded orchestration assertion mapping. Do not infer either from the supplied 17-file/380-case source-suite result.
- Apply `learnings/architecture/2026-10-04_plugin-retirement-must-decouple-loader-backed-host-tests.md` and `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: acquire the missing inputs as implementation deliverables rather than repeat a blocked checkpoint as completion. Knowledge search used local fallback, collection `openclaw-fork-learnings` missing; older empty extracted learnings supply no additional contract evidence.
- Preserve the accepted source-only host isolation in `plans/checkpoints/deliberation_external_plugin_cutover.md:50-58`; use direct Node wrappers because prior pnpm reconciliation changed dependencies. Read scoped guides before any future helper/test edits.

## Approach

- Have the external owner export the accepted immutable public package plus public testing contract into the repo-local retirement handoff; stage/extract it into isolated test scratch space. Consume package metadata and public entry/API only; keep domain implementation ownership outside this fork.
- Reuse one test-only offline package staging/resolution helper across all three consumers. Limit it to artifact verification, package-root resolution and cleanup; retain each consumer's configuration, HTTP mocks, native transport calls and assertions.
- Keep producer-owned persisted identity/resolve semantics and existing wire/receipt contracts; prove root and child orchestration separately with owner-supplied assertion evidence.

## Implementation

1. Obtain owner-exported `public-package-contract.json` and the archive it names under `plans/handoffs/deliberation-plugin-retirement/`. Require package `@openclaw-deliberation/plugin@2026.6.5`, owner revision/release, archive SHA-256, manifest/plugin id, public entry and `./api` export resolution, SDK/runtime dependency requirements, and the supported offline test setup. Include any required producer-resolve fixtures with endpoint/schema provenance. Verify contents before loading; no installed-host paths, sibling imports, source reconstruction, fake hooks or network fetch during tests. If absent, request these exact artifacts; keep both findings open until acquired and verified.
2. Add `test/helpers/deliberation-public-package.ts` to stage that artifact once per suite beneath task-isolated scratch space, return the package root and cleanup, and verify its pinned metadata/public boundaries. Use existing archive utilities where available; expose no plugin-private module path. Keep the fixture out of bundled inventories/workspace importers and avoid adding a root runtime dependency.
3. In each of the three loaders, add `plugins.load: { paths: [packageRoot] }`, preserving `allow`, entries and native channel setup. Assert exactly one Deliberation record with `status: "loaded"`, `origin: "config"`, the staged root, and plugin-owned `inbound_event_policy`, `inbound_claim`, `before_dispatch` registrations. Keep the bundled-root override only for bundled transport plugins; retain all registry/hook resets and package cleanup.
4. Preserve six Discord owner cases, the Discord process integration's intake/envelope and failure-silence assertions, all eight Slack cases, the six enabled/disabled root/child/ambiguous-child combinations, duplicate-envelope dedupe, trusted sender hints and ordinary dispatch. Adapt mock identity-resolution responses only where the accepted public testing contract requires them; preserve observed assertions and domain scenarios rather than replacing hooks or suppressing failures.
5. Obtain owner-exported `orchestration-assertion-map.json` plus immutable test excerpts/results for both expanded Slack root/child cases. Bind old source hash/revision from `plugin-retirement-manifest.json`, external owner revision/test hash, actual expanded title, original assertion, target assertion/location and expected value. Use the retired source from Git history for read-only comparison; do not restore it. Validate the rows below against actual owner evidence; add missing assertions in the external owner before claiming equivalence.

| Map separately for root and child | Required preserved assertion                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity                          | Root event/thread timestamps agree; child event id differs from root thread id; exact provider/account/channel and unchanged intake identity; producer commit/resolve replaces the local keyed store. |
| Bounded history                   | Root pre-event history is empty; child pre-event history contains the root; chronological/watermark rules and exact account/channel hold; freshness is bounded to 32 KiB.                             |
| Thread exclusion/freshness        | Unrelated-thread messages excluded; root observes newer replies and newer channel root; child observes later same-thread reply freshness.                                                             |
| Envelopes/receipts                | No reservation target override; invocation and completion envelopes, identity and receipts match the accepted producer contract.                                                                      |
| Send/lifecycle                    | Exactly one Discord send, zero Slack sends; service start/stop and serialized processing preserved.                                                                                                   |

6. Run the focused commands below sequentially and capture fresh output under this task. Update `plans/checkpoints/deliberation_bundled_plugin_retirement.md` with artifact provenance, three consumer/result mappings and both assertion maps; preserve historical results and attribution. Mark complete only when all migrated domain scenarios pass and every required assertion has owner evidence; report unrelated failures separately.
7. Before any later authorized code commit, run fresh `autoreview` and address actionable findings. Use `tdd`/`task-evidence` for historical RED attribution, `openclaw-testing` for focused proof and `crabbox` for host-owned broader checks; use `save-learning` last at closeout. Do not change the registered full `npm test` gate or live deployment hooks.

## TDD

- Implement the evidence cycle with `tdd`; link `plans/checkpoints/calm-fork-3432.red-green-proof.md:5-80` (2026-10-04, exit 1, source-absence assertion) as genuine parent RED. Its GREEN proves retirement only, not public loader correctness.
- Record pre-repair loader characterization separately: parent checkpoint reports Discord owner/integration missing-plugin failures and eight Slack missing-loader failures. Do not fabricate a new RED by restoring deleted sources or breaking completed behavior.
- Extend the existing `loadDeliberation` functions and `runDeliberationIntegrationTest` with this assertion skeleton after the existing loader call; use their current imports and the staged package root from step 2:

```ts
import { loadOpenClawPluginsForTest } from "openclaw/plugin-sdk/plugin-test-runtime";
import { expect } from "vitest";

// Existing cfg must include plugins.load.paths = [packageRoot].
const registry = loadOpenClawPluginsForTest({ config: cfg });
const records = registry.plugins.filter((plugin) => plugin.id === "deliberation");
expect(records).toHaveLength(1);
expect(records[0]).toMatchObject({ status: "loaded", origin: "config", rootDir: packageRoot });
for (const hookName of ["inbound_event_policy", "inbound_claim", "before_dispatch"]) {
  expect(
    registry.typedHooks.some(
      (hook) => hook.pluginId === "deliberation" && hook.hookName === hookName,
    ),
  ).toBe(true);
}
```

| Proof                     | Historical/pre-repair result                                                       | Fresh GREEN required                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Source absence            | Genuine parent RED: expected true to be false                                      | Existing absence test still passes; no restoration of retired source.                        |
| Three public loaders      | Parent characterization lacks loaded domain plugin; not the source-absence TDD RED | Exactly one config-origin record and all three real hooks; unchanged domain assertions pass. |
| Slack root/child transfer | No expanded target titles/assertions supplied                                      | Both owner cases pass with explicit assertion mappings, not case-count equivalence.          |

- Save new output/provenance to `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.red-green-proof.md`; label inherited RED and fresh GREEN explicitly.

## Testing

- Set repo-local synthetic HOME/config/state/cache/TMPDIR under `.artifacts/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc/`, `OPENCLAW_LIVE_TEST=0`; use local mock listeners and sequential test execution. Exercise a clean offline artifact extraction so tests cannot borrow installed or sibling code.

```sh
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/deliberation-history.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts src/plugins/source-checkout-runtime.test.ts --maxWorkers=2
env OPENCLAW_OXLINT_SKIP_PREPARE=1 node scripts/run-oxlint.mjs test/helpers/deliberation-public-package.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts
node node_modules/oxfmt/bin/oxfmt --check --threads=1 test/helpers/deliberation-public-package.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts
git diff --check
git diff --numstat
```

- Obtain the external owner's focused root/child orchestration command/results from its exported testing contract; record exact argv, expanded titles and immutable revision without executing sibling-source imports in the fork.
- Run extension production/test tsgo lanes on Testbox using `node scripts/run-tsgo.mjs -p tsconfig.extensions.json --noEmit --incremental false` and `node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.extensions.test.json --noEmit --incremental false`. Separate existing reasoning-effort diagnostics and the known Discord room-history `Alice`/`alice` failure from new diagnostics; require all Deliberation cases green.
- Repeat loader/config-path reference searches to ensure none of the three consumers resolves retired source. Retain negative bundled discovery/package tests; keep full pipeline proof host-owned and avoid builds/reloads that overwrite live `dist`.

## Files

| Path                                                                                                          | Change                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `plans/handoffs/deliberation-plugin-retirement/public-package-contract.json` and named owner-exported archive | Add runnable pinned offline public package/test input, not a copied implementation tree. |
| `test/helpers/deliberation-public-package.ts`                                                                 | Share artifact staging/root resolution/cleanup across three loaders.                     |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`                                         | Config-origin loader and real registration assertions.                                   |
| `extensions/discord/src/monitor/message-handler.process.test.ts`                                              | Same public loader migration; preserve integration assertions.                           |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`                                           | Same public loader migration; preserve dynamic variants and silence.                     |
| `plans/handoffs/deliberation-plugin-retirement/orchestration-assertion-map.json`                              | Owner-backed expanded root/child assertion mapping and linked proof.                     |
| `plans/checkpoints/deliberation_bundled_plugin_retirement.md` and follow-up proof file                        | Append fresh evidence and closure of both findings.                                      |

## Progress

- [x] Resolve canonical plan path and read parent plan.
- [x] Inspect accepted contracts, three consumers, public loader seam, prior commits and historical proof.
- [x] Link task planning state to [this canonical plan](2026-10-04_task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc_deliberation-plugin-retire-replaced-bundled-implementation.md); keep `plans/tasks/` untouched.
- [ ] Execute implementation only in a subsequent implementation session; acquire owner inputs, migrate loaders, prove assertions, and close both findings.
