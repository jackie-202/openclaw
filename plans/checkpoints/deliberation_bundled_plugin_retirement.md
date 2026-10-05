# Deliberation bundled plugin retirement

## Status

Partial implementation; **not COMPLETE**. Manifest-backed source retirement and host absence/discovery checks pass. Three real channel loader consumers still require a repo-local runnable external package input. Their assertions and full test registration remain intact. This document claims neither runtime reload nor full acceptance.

Task: `calm-fork-3432`. Authoritative plan unchanged. Existing dirty fork changes preserved.

## Exact retirement manifest

Before deletion, SHA-256 comparison against `plans/handoffs/deliberation-plugin-retirement/plugin-retirement-manifest.json` found exactly 43 files, 43 matching source hashes, zero unmatched files and zero changed files. Empty `contracts`, `scripts`, `src` and package directories were removed after file deletion. No source backup was created.

All paths below are relative to the removed `extensions/deliberation/` directory. External counterparts are host-attested in the supplied manifest, not inspected across repository boundaries by this worker.

Reasons: **E** = same-byte external counterpart; **T** = external counterpart with changed bytes, ownership transferred under the accepted host contract; **S** = explicitly superseded local identity map. **T** does not claim assertion-level scenario equivalence.

| Removed path                                 | Reason                                                  |
| -------------------------------------------- | ------------------------------------------------------- |
| `README.md`                                  | E                                                       |
| `api.ts`                                     | E; public API now owned by separate package             |
| `contracts/deliberation-v2-v1-contract.json` | T; producer-owned wire contract                         |
| `contracts/deliberation-v2-v1-fixtures.json` | T; producer-owned fixtures                              |
| `contracts/deliberation-wire-pin-v1.json`    | T; external plugin owns pin                             |
| `contracts/history-read-v1.json`             | E                                                       |
| `contracts/history-read-v2.json`             | E                                                       |
| `contracts/openclaw-overlay-v1.json`         | E                                                       |
| `contracts/provenance.json`                  | T                                                       |
| `contracts/source-identity-fixtures-v1.json` | E                                                       |
| `contracts/source-identity-v1.json`          | E                                                       |
| `index.ts`                                   | T; registration owned by external entry                 |
| `openclaw.plugin.json`                       | E                                                       |
| `package.json`                               | T; external package metadata replaces workspace package |
| `scripts/intake-producer.test.ts`            | E                                                       |
| `scripts/intake-producer.ts`                 | T                                                       |
| `src/config.test.ts`                         | E                                                       |
| `src/config.ts`                              | T                                                       |
| `src/contract.test.ts`                       | T                                                       |
| `src/deliberation-wire-pin.test.ts`          | T                                                       |
| `src/delivery-composition.test.ts`           | E                                                       |
| `src/delivery-probe.test.ts`                 | E                                                       |
| `src/delivery-probe.ts`                      | T                                                       |
| `src/delivery-target.ts`                     | E                                                       |
| `src/final-adapter.test.ts`                  | E                                                       |
| `src/final-adapter.ts`                       | E                                                       |
| `src/guards.ts`                              | E                                                       |
| `src/history-read.test.ts`                   | T                                                       |
| `src/history-read.ts`                        | T                                                       |
| `src/hooks.test.ts`                          | T                                                       |
| `src/intake.ts`                              | T                                                       |
| `src/km-client.test.ts`                      | T                                                       |
| `src/km-client.ts`                           | T                                                       |
| `src/orchestration.test.ts`                  | T; dynamic scenario gap below                           |
| `src/plugin.test.ts`                         | T                                                       |
| `src/route-match.test.ts`                    | E                                                       |
| `src/route-match.ts`                         | E                                                       |
| `src/slack-timestamp.ts`                     | E                                                       |
| `src/sole-send.test.ts`                      | T                                                       |
| `src/source-identity.test.ts`                | E                                                       |
| `src/source-identity.ts`                     | E                                                       |
| `src/thread-identity-store.ts`               | S; producer-owned persisted identity replaces local map |
| `tsconfig.json`                              | T; external package owns compilation                    |

Retained paths under `extensions/deliberation/`: none.

## Test ownership and scenario mapping

All 15 original native test paths have external counterparts. This is an ownership transfer, not deletion of generic host transport coverage. Supplied host evidence `external-native-suite-host.log` reports 17 files / 380 tests passed using the host-integrated source SDK/native adapter resolver. This worker did not execute that external suite. It is not a self-contained installed-package result.

| Original test path                  | Ownership/scenarios/evidence                                                                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/intake-producer.test.ts`   | Same bytes externally: trusted hints, source-derived Discord/Slack root/child targets, explicit target authority, malformed config rejection, bounded KM failures; 10 external cases.                                                    |
| `src/config.test.ts`                | Same bytes externally, including parameterized invalid config and endpoint cases; 40 external cases.                                                                                                                                     |
| `src/contract.test.ts`              | Closed request/response fixtures and contract checks externally; changed bytes, literal title mapping supplied; 13 external cases.                                                                                                       |
| `src/deliberation-wire-pin.test.ts` | Published fixtures and pin validation externally; changed bytes; 3 external cases.                                                                                                                                                       |
| `src/delivery-composition.test.ts`  | Same bytes externally; external log names `delivery-composition.test.ts`, 9 cases.                                                                                                                                                       |
| `src/delivery-probe.test.ts`        | Same bytes externally; probe remains non-plugin public API responsibility; 12 external cases.                                                                                                                                            |
| `src/final-adapter.test.ts`         | Same bytes externally; receipts, reservation/invocation/completion and sole-send bounds; 24 external cases.                                                                                                                              |
| `src/history-read.test.ts`          | Bounded chronological history, watermark, Discord child identity, mapped Slack thread/root freshness, pagination/count/byte bounds and conflicting duplicates map by literal titles; changed persisted-identity seam; 34 external cases. |
| `src/hooks.test.ts`                 | Source ownership, hints, closed intake, silence, restricted sends; 43 external cases. Two old local-registration titles map to producer commits as described below.                                                                      |
| `src/km-client.test.ts`             | Closed wire schemas, identity, cancellation/timeout precedence, authority and receipt/CAS/drift/tamper checks map by literal titles; added source-history resolve scenarios; 93 external cases.                                          |
| `src/orchestration.test.ts`         | Two dynamic Slack root/child orchestration cases, external log also reports 2; title list is empty in both manifest sides, so detailed equivalence remains unproven.                                                                     |
| `src/plugin.test.ts`                | Hook/history/service registration, exact account/target delivery, oversized/missing receipt/provider failure, serialized ticks and stop; literal mapping supplied; 28 external cases.                                                    |
| `src/route-match.test.ts`           | Same bytes externally, including parameterized route/identity cases; 36 external cases.                                                                                                                                                  |
| `src/sole-send.test.ts`             | Destination authority and registered final sender boundary; changed bytes, matching literal scenarios; 2 external cases.                                                                                                                 |
| `src/source-identity.test.ts`       | Same bytes externally; canonical provenance round trips and malformed/historical fixtures; 3 external cases.                                                                                                                             |

External-only `src/source-history-listener.test.ts` (24 cases) and `src/source-history-regression.test.ts` (4 cases) belong to the external owner.

Accepted identity mapping: old Slack `registers ... before sending ...` scenario becomes `commits Slack child-to-thread identity only in the unchanged KM intake body`; old Discord registration scenario becomes `commits authenticated Discord child identity without changing parent route ownership`. The host contract expressly replaces `src/thread-identity-store.ts` with producer persistence and resolve operations. No second local map was retained.

Dynamic gap inspected before deletion: `src/orchestration.test.ts` parameterizes **Slack root** (root timestamp as event/thread ID; empty bounded pre-event history; newer replies plus newer channel root) and **Slack child reply** (child event ID, root thread ID; bounded root history; later same-thread reply freshness). Both assert exclusion of unrelated threads, exact account/channel history, 32 KiB freshness bound, unchanged intake identity, no target override at reservation, matching invocation/completion envelopes and receipts, one Discord send, zero Slack sends, and service start/stop serialization. The source test used a local keyed-store identity map. The supplied manifest has no dynamic target titles or target assertions. A 2-case count and full-suite pass do not establish those assertions survived the producer-resolve conversion. Request external-owner scenario mapping for these exact assertions; no sibling reads are authorized.

## Classified remaining references

| Paths/surface                                                                                                                                   | Classification and action                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json` exclusion `!dist/extensions/deliberation/**`                                                                                     | Retained intentional absence protection against stale built artifacts.                                                                                                                                                                |
| `scripts/lib/bundled-plugin-build-entries.mjs`                                                                                                  | Retained exclusion from build/pack entry inventory.                                                                                                                                                                                   |
| `scripts/test-built-plugin-singleton.mjs`                                                                                                       | Retained negative `dist-runtime` artifact assertion.                                                                                                                                                                                  |
| `test/scripts/bundled-plugin-build-entries.test.ts`                                                                                             | Existing no-build/no-pack and Bonjour assertions preserved; new source-absence regression added.                                                                                                                                      |
| `test/scripts/deliberation-package.e2e.test.ts`                                                                                                 | Retained package absence / enabled-but-uninstalled negative test; not executed because it requires package artifacts.                                                                                                                 |
| `src/plugins/bundled-source-exclusions.ts`                                                                                                      | Retained source/built/overlay/symlink exclusion policy; protects older artifacts even after source retirement.                                                                                                                        |
| `src/plugins/discovery.test.ts`                                                                                                                 | Preserved all scenarios and added direct exclusion-policy assertions so absence alone cannot make source/built/overlay/symlink policy coverage pass. Existing separate global-install metadata fixture retained. No live dist writes. |
| `src/plugins/source-checkout-runtime.test.ts`                                                                                                   | Replaced source symlink with generated package/manifest/empty entry fixture and symlink; still exactly one config-origin candidate. Fixture implements no domain behavior. Enabled-but-uninstalled negative scenario preserved.       |
| `src/plugins/plugin-registry.test.ts`                                                                                                           | Stale persisted bundled source snapshot preserved; synthetic manifest supplies hash instead of reading deleted source.                                                                                                                |
| `src/plugins/bundled-plugin-metadata.test.ts`                                                                                                   | Retained negative source/package startup coverage and all other startup IDs.                                                                                                                                                          |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`                                                                           | Active real-domain loader consumer, blocked pending public package input; unchanged, six scenarios retained.                                                                                                                          |
| `extensions/discord/src/monitor/message-handler.process.test.ts`                                                                                | Active real-domain loader consumer at `runDeliberationIntegrationTest`; unchanged hook/intake/ordinary-dispatch assertions.                                                                                                           |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`                                                                             | Active real-domain loader consumer; eight scenarios retained, including six enabled/disabled root/child/ambiguous-child combinations and duplicate native envelopes.                                                                  |
| `extensions/slack/src/monitor/deliberation-history.ts`, `.test.ts`, `provider.ts`                                                               | Generic native history API and its provider registration; retained, independent of removed implementation.                                                                                                                            |
| `extensions/discord/src/outbound-adapter.ts`, `.test.ts`                                                                                        | Native source-message anchored thread creation/display name and transport test; retained provider contract, no retired-source import.                                                                                                 |
| Discord queue tests, Slack message-handler tests, `src/plugin-sdk/channel-inbound.test.ts`, `src/auto-reply/reply/dispatch-from-config.test.ts` | Generic exclusive-owner examples/mocks; no domain-source loading; retained.                                                                                                                                                           |
| `src/agents/embedded-agent-utils.test.ts`                                                                                                       | Ordinary reasoning text using the word deliberation; unrelated.                                                                                                                                                                       |
| `.github/labeler.yml`                                                                                                                           | Existing docs label routing retained; old source glob is historical metadata, not executable coupling.                                                                                                                                |
| Plans, handoffs, learnings, proposals, historical docs/changelog evidence                                                                       | Historical provenance retained; no rewriting old receipts.                                                                                                                                                                            |
| `pnpm-lock.yaml`                                                                                                                                | Obsolete workspace importer removed. Its only runtime dependency was shared `zod@4.4.3`, still used by root and 27 other importers; SDK link is also shared. No snapshots were orphaned.                                              |

Searches covered `src`, `extensions`, `packages`, `scripts`, `test`, `.github`, root package and lockfile surfaces, including loader calls and split path joins. No surviving probe consumer importing the removed `api.ts` was found. Removed full-gate script and command remain removed.

## Missing technical input and public compatibility

The supplied handoff directory contains exactly `accepted-host-contract.md`, `plugin-retirement-manifest.json`, and `external-native-suite-host.log`. No repo-local Deliberation package tarball or entry artifact was found. The accepted package is `@openclaw-deliberation/plugin` version `2026.6.5`, with public entry and `./api` boundaries, but neither runnable package metadata nor its public test contract is supplied locally. Installed releases and sibling repositories are explicitly out of scope.

Exact consumers: Discord owner loader at `message-handler.deliberation.test.ts:138`, Discord integration at `message-handler.process.test.ts:574`, Slack owner loader at `message-handler.deliberation.test.ts:106`. They need an offline public package entry plus manifest/config schema that the existing `plugins.load.paths`/test-loader seam can discover as **config** origin and that registers `inbound_event_policy`, `inbound_claim`, and `before_dispatch`. A package name and passing external source-suite receipt do not establish entry layout or runnable resolution. Provide that technical input inside this repository, then migrate these loaders and assert config-origin registration before rerunning their unchanged scenarios. No fake domain hooks, skip, downloaded package, or vendored replacement was introduced.

Generic SDK/runtime/history/channel APIs are untouched. Docs now name the separate package/owner; installation instructions were not invented. The supplied host contract says producer wire pin and receipt identity remain unchanged. The old pin was bundle SHA-256 `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`; source/target contract and pin file hashes differ in the supplied transfer manifest. This worker has not independently compared external publication contents and does not claim byte-equivalent wire artifacts. External-owner verification remains responsible for that producer pin.

## Commands and results

All focused Vitest commands use `HOME=$PWD/.artifacts/calm-fork-3432/home`, `TMPDIR=$PWD/.artifacts/calm-fork-3432/tmp`, and `OPENCLAW_LIVE_TEST=0`. Shared test setup creates its temporary HOME beneath this repo-local TMPDIR. Commands ran sequentially. No production build or live dist overwrite was performed.

```sh
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/source-checkout-runtime.test.ts src/plugins/discovery.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/plugin-registry.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/deliberation-history.test.ts --maxWorkers=2
node scripts/run-tsgo.mjs -p tsconfig.extensions.json --noEmit --incremental false
node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.extensions.test.json --noEmit --incremental false
node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.test.src.json --noEmit --incremental false
env OPENCLAW_OXLINT_SKIP_PREPARE=1 node scripts/run-oxlint.mjs src/plugins/source-checkout-runtime.test.ts src/plugins/discovery.test.ts src/plugins/plugin-registry.test.ts test/scripts/bundled-plugin-build-entries.test.ts
node node_modules/oxfmt/bin/oxfmt --check --threads=1 src/plugins/source-checkout-runtime.test.ts src/plugins/discovery.test.ts src/plugins/plugin-registry.test.ts test/scripts/bundled-plugin-build-entries.test.ts docs/plugins/reference/deliberation.md pnpm-lock.yaml
git diff --check
git diff --numstat -- extensions/deliberation pnpm-lock.yaml src/plugins/source-checkout-runtime.test.ts src/plugins/discovery.test.ts src/plugins/plugin-registry.test.ts test/scripts/bundled-plugin-build-entries.test.ts docs/plugins/reference/deliberation.md
```

- TDD command executed through discovered `tdd` proof-capture helper for both phases, identical argv. RED accepted: expected `true` vs `false`, 1 failed / 16 passed. GREEN accepted: 17 passed. Canonical `calm-fork-3432.red-green-proof.md` was read back; genuine output and helper run IDs retained.
- Host source group: initial cleanup run 145 passed / 1 failed because stale-index test still hashed retired manifest. Replaced that metadata dependency; subsequent runs 146 passed / 4 files, including final direct exclusion assertions.
- Discord characterization before deletion: 104 passed / 8 failed. Six owner-path tests and one intake integration fail because Deliberation is absent under the existing bundled exclusion. One unrelated failure is room-history `Alice` vs `alice` at line 1955. Not repaired. No post-deletion Discord rerun yet; missing package input still blocks meaningful domain proof.
- Slack after deletion: 3 generic history tests pass; all 8 owner-path tests fail at missing loaded Deliberation assertion. No baseline Slack run was captured before deletion; do not label its failures independently baseline-proven.
- Three source type lanes ran and failed. Extension prod/test each report three diagnostics in pre-existing dirty `src/auto-reply/thinking.ts:104,253` (`supportsReasoningEffort` absent and two `off` enum errors). Source-test lane adds two `priority` excess-property diagnostics in untouched `src/plugins/hooks.sync-only.test.ts:67,73`. No retired-source imports or edited-test diagnostics reported. These files were not changed by this task; no clean pre-change type baseline was captured.
- Scoped lint passed without package-boundary preparation. Formatter initially flagged two edited test files; formatted them and rechecked before handoff. `git diff --check` passed. Numstat shows deletion of 43 files and reduced production LOC; existing dirty hunks are included in git totals, not attributed to this task.
- `pnpm docs:list` unexpectedly invoked automatic pnpm dependency reconciliation (reported -170 packages, no downloads) and timed out. This is an unintended tool side effect, not a successful docs-list run. `node scripts/docs-list.js` then passed. No manual install/link command or node_modules edit was performed. Remaining checks used direct Node wrappers.
- Full `npm test` gate configuration was not changed. Full build/package gate was not run because live CLI shares this fork's `dist` and the supplied policy requires source-only worker proof.

## Operator-only follow-through

- Supply the offline public plugin package/test contract locally; complete the three config-origin loader migrations and run unchanged Discord/Slack ownership, duplicate-event, identity, failure-silence and ordinary-dispatch scenarios.
- Obtain external-owner assertion-level mapping for both parameterized Slack orchestration cases and confirm producer wire publication pin/receipt invariants.
- Resolve unrelated source type diagnostics under their owner; rerun source type lanes and full registered pipeline gate.
- Before any later commit/land, run fresh autoreview and required host-owned broader proof.
- Under separately authorized deployment policy, verify exactly one external config-origin Deliberation plugin, required hooks, history/status methods, producer identity resolution and native durable receipt behavior.
- Authorize any production build/reload and real-message validation separately. Source cleanup does not reload the running gateway.
- Preserve supplied host rollback evidence outside retired sources; no backup copy was placed in this checkout. Review pnpm's unintended reconciliation effect before relying on the local dependency tree for operator validation.
