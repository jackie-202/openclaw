# Plan 2026-10-04: Deliberation public-package acceptance repair

## Analysis

- Preserve HEAD `16a38827177`, existing 43-file retirement, and unrelated dirty work; no pull/rebase during this planning run.
- Use `plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md:7-23` for public package ownership and source-only host isolation; its three-file handoff lacks the runnable archive and expanded assertion map.
- Reuse parent Slack RED from `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.red-green-proof.md:3-28`: eight owner cases fail at missing Deliberation; three native history cases pass.
- Apply the two supplied 2026-10-04 learnings: distinguish loader proof from assertion preservation and acquire exports instead of declaring a blocked checkpoint complete.
- Use `src/plugin-sdk/plugin-test-runtime.ts:18` unchanged: the loader passes configured paths to discovery at `src/plugins/loader.ts:1920`, which assigns config origin at `src/plugins/discovery.ts:1475-1485`.
- Follow `extensions/AGENTS.md`, `test/AGENTS.md`, and `test/helpers/AGENTS.md`; keep package behavior external and host helpers restricted to public artifacts.
- Treat package dependency/layout requirements as unresolved until inspecting the actual owner export; the existing host-integrated 17-file/380-case receipt proves neither offline loading nor assertion parity.
- Use knowledge-search local fallback (`openclaw-fork-learnings` collection absent); apply `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md` to completion criteria.

## Approach

- Acquire two independent owner deliverables: runnable pinned public package/testing contract, and assertion-level expanded root/child evidence. Request them together before implementation; if unavailable, retain an incomplete checkpoint with exact missing inputs.
- Stage the package through one test-only helper and migrate all three existing consumers to `plugins.load.paths`; keep bundled Discord/Slack transport discovery and every existing scenario/assertion.
- Preserve producer-owned identity persistence/resolve semantics; do not restore the retired local identity map or manufacture domain hooks.

## Implementation

1. Recheck task-specific Git hunks against the parent checkpoint; preserve completed removals, generic fixtures, packaging exclusions, docs, and unrelated work.
2. Obtain `public-package-contract.json` and its named archive in `plans/handoffs/deliberation-plugin-retirement/`. Require `@openclaw-deliberation/plugin@2026.6.5`, immutable owner revision/release, SHA-256, plugin id/manifest, public entry and `./api` exports, SDK/runtime dependencies, offline setup, and any producer-resolve fixtures with endpoint/schema provenance. Verify artifact bytes, metadata, public export resolution, and dependency completeness before loading. Ask the external owner to repair/export missing package inputs; do not reconstruct from deleted source, use installed-host/sibling paths, or fetch during tests.
3. Add `test/helpers/deliberation-public-package.ts` for verified offline staging into isolated scratch space; return only package root and cleanup. Reuse existing archive utilities after checking their contracts. Support suite reuse with deterministic cleanup and no private plugin imports, root runtime dependency, workspace importer, or bundled inventory entry.
4. Add `plugins.load: { paths: [packageRoot] }` to `loadDeliberation` in both owner suites and `runDeliberationIntegrationTest`. Assert exactly one Deliberation record, loaded/config origin, staged root, and its own three required hooks. Keep the bundled directory override exclusively for channel plugins; reset registries/hooks before removing staged files. Put listener/package cleanup in guaranteed teardown, including assertion failures.
5. Preserve six Discord owner cases, process integration intake/envelope/503 silence, all eight Slack cases, six enabled/disabled root/child/ambiguous-child variants, duplicate envelopes, trusted sender hints, and ordinary dispatch. Adapt mock producer-resolution responses only from the public owner test contract; keep exact intake counts and silence assertions. Do not skip cases or loosen expectations to accommodate package failures.
6. Obtain owner-exported `orchestration-assertion-map.json` and immutable root/child test excerpts/results. Each assertion row must bind source revision/hash from `plugin-retirement-manifest.json`, original assertion/location, owner revision/test hash, expanded target title, target assertion/location, expected value, and result/log hash. Compare retired source read-only from Git history; never restore it. Require these assertions separately for both cases:

| Invariant           | Root and child evidence required                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity            | Root event/thread timestamps agree; child event id differs from root thread id; exact provider/account/channel and unchanged intake identity; producer commit/resolve replaces local storage. |
| History             | Root pre-event history empty; child contains root; chronological/watermark rules and exact account/channel; freshness bounded to 32 KiB.                                                      |
| Exclusion/freshness | Unrelated threads excluded; root observes newer replies and newer channel root; child observes later same-thread replies.                                                                     |
| Envelope/receipt    | No reservation target override; matching invocation/completion envelopes, identity, receipts, and accepted producer pin.                                                                      |
| Send/lifecycle      | Exactly one Discord send, zero Slack sends; service start/stop and serialized processing.                                                                                                     |

7. Have the external owner add any missing assertions and export fresh immutable results before accepting equivalence; record exact owner command/environment and inspect actual expanded output. Filename/title/count parity alone cannot close finding-002.
8. Run focused proof below; append artifact provenance and results to the retirement checkpoint and create this task's checkpoint/proof. Close finding-001 only with runnable offline input and three migrated passing consumers; finding-002 only with complete two-case assertion mapping; finding-003 only with ordered inherited RED/fresh GREEN provenance. Preserve prior receipts and distinguish unrelated failures.
9. Use `task-evidence` to resolve parent provenance, `tdd` for phase capture, `openclaw-testing` for scope, `crabbox` for remote checks, and fresh `autoreview` before any later authorized code commit. Invoke `save-learning` last at implementation closeout. Keep the injected full `npm test` gate and host deployment policy unchanged.

## TDD

- Implementace TDD cyklu dle skill:tdd. First link the genuine parent loader RED (2026-10-04T15:00:31.121929+00:00, child exit 1, run `aa913bba5c234bc4b3686618d4632cab`, command SHA-256 `3d39564f06b531979cd27e0c2d09d5dd95c9874e5e44359dcb4de4c9728da611`). Do not fabricate RED by restoring sources or breaking passing retirement behavior.
- Test files: `extensions/slack/src/monitor/message-handler.deliberation.test.ts`, `extensions/discord/src/monitor/message-handler.deliberation.test.ts`, `extensions/discord/src/monitor/message-handler.process.test.ts`. Existing Slack loaded-plugin assertion at lines 139-147 is the historical failing assertion; retain it.
- Executable registration skeleton: append inside `describe("Discord deliberation owner path")`; existing `it`, `expect`, and `loadDeliberation` are already in scope. Later assert `rootDir: packageRoot` in each loader after staging, without making up an owner API:

```ts
it("loads the public Deliberation package with config origin", () => {
  const { registry } = loadDeliberation();
  const records = registry.plugins.filter((plugin) => plugin.id === "deliberation");
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ status: "loaded", origin: "config" });
  for (const hookName of ["inbound_event_policy", "inbound_claim", "before_dispatch"]) {
    expect(
      registry.typedHooks.some(
        (hook) => hook.pluginId === "deliberation" && hook.hookName === hookName,
      ),
    ).toBe(true);
  }
});
```

| Proof                                   | Genuine RED / current gap                                                                                 | Fresh GREEN                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Slack owner/history                     | Parent eight missing-loader failures, three native-history passes                                         | Same exact argv passes all eleven cases against config-origin package.                                           |
| Registration skeleton and three loaders | Existing Discord policy fails before package discovery; config-origin assertion not historically captured | Exactly one verified staged record and three plugin-owned hooks per consumer; retained behavior assertions pass. |
| Expanded root/child                     | Missing owner assertions/results; evidence gap, not claimed behavioral RED                                | Immutable owner pass output plus every assertion mapped.                                                         |

- Capture fresh GREEN under `plans/checkpoints/task-121a6994-f75a-45f5-a26a-24325e0f11fe.red-green-proof.md` using the parent's exact Slack argv below. First verify historical-RED linking support with `tdd`/`task-evidence`: the loaded TDD instructions document only `red`, `green`, and `read`, not an inheritance flag. Include parent task/proof, timestamp, run id, output hash, command hash, and follow-up revision/artifact hashes in task provenance; never manually reconstruct helper proof. If tooling cannot represent inheritance, request its owner-supported repair before claiming finding-003 closed. Read generated phase-order projection and require complete ordered RED→GREEN; separately capture Discord GREEN. Never relabel source-absence GREEN as loader GREEN.

## Testing

- Use synthetic HOME/config/state/cache/TMPDIR under `.artifacts/task-121a6994-f75a-45f5-a26a-24325e0f11fe/`, `OPENCLAW_LIVE_TEST=0`, local mock listeners, and sequential runs with two workers. Prove a clean offline extraction without installed Deliberation or sibling imports.
- Use direct Node wrappers to avoid the prior pnpm reconciliation side effect in this linked live-host checkout:

```sh
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/deliberation-history.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts src/plugins/source-checkout-runtime.test.ts --maxWorkers=2
env OPENCLAW_OXLINT_SKIP_PREPARE=1 node scripts/run-oxlint.mjs test/helpers/deliberation-public-package.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts
node node_modules/oxfmt/bin/oxfmt --check --threads=1 test/helpers/deliberation-public-package.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts
git diff --check
git diff --numstat
```

- On Testbox, run extension production/test tsgo lanes: `node scripts/run-tsgo.mjs -p tsconfig.extensions.json --noEmit --incremental false` and `node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.extensions.test.json --noEmit --incremental false`. Record actual provider/run ids; isolate known reasoning-effort diagnostics and Discord `Alice`/`alice` mismatch from new failures. Require every Deliberation case to pass.
- Recheck remaining loader/path references and unchanged negative retirement tests; require no tests importing retired private source or installed-host Deliberation. Keep domain package fixtures separate from generated generic discovery fixtures.
- Run owner root/child proof using its supplied public testing contract; record immutable inputs, exact argv, expanded assertions and results. Keep full registered pipeline proof host-owned. Run any required build/package verification on an isolated remote checkout through `crabbox`; never overwrite shared live `dist` or reload the gateway.

## Files

| Path                                                                                                          | Future change                                                                                       |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `plans/handoffs/deliberation-plugin-retirement/public-package-contract.json` and named archive                | Owner-exported runnable offline public contract/package and required dependency/producer fixtures.  |
| `test/helpers/deliberation-public-package.ts`                                                                 | Verified staging, package-root resolution, teardown only.                                           |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`                                         | Config-origin resolution/registration proof; retain six behavior cases.                             |
| `extensions/discord/src/monitor/message-handler.process.test.ts`                                              | Same loader migration and guaranteed cleanup; preserve integration assertions.                      |
| `extensions/slack/src/monitor/message-handler.deliberation.test.ts`                                           | Same migration; preserve eight cases and dynamic combinations.                                      |
| `plans/handoffs/deliberation-plugin-retirement/orchestration-assertion-map.json` and named immutable evidence | Separate root/child assertion transfer and pass receipts.                                           |
| `plans/checkpoints/deliberation_bundled_plugin_retirement.md`                                                 | Append verified closure evidence without rewriting history.                                         |
| `plans/checkpoints/task-121a6994-f75a-45f5-a26a-24325e0f11fe.checkpoint.md` and `.red-green-proof.md`         | Link artifacts, inherited RED, fresh GREEN, ordered provenance, and all three finding dispositions. |

## Progress

- [x] Link task planning state to [this canonical plan](2026-10-04_task-121a6994-f75a-45f5-a26a-24325e0f11fe_acceptance-fix-deliberation-plugin-retire-replaced-bundled.md); leave task files untouched.
- [x] Read parent plan/checkpoints, three loaders, public discovery seam, scoped policies, and relevant learnings; define all three acceptance closures.
- [ ] In a subsequent implementation session, obtain owner exports, migrate loaders, complete assertion evidence, and capture ordered GREEN. Planning performs no implementation or test run.
