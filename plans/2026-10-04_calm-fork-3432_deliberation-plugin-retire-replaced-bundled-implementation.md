# Plan 2026-10-04: Deliberation plugin: retire replaced bundled implementation and host path coupling

## Analysis

- Use `plans/handoffs/deliberation-plugin-retirement/{accepted-host-contract.md,plugin-retirement-manifest.json,external-native-suite-host.log}` to authorize retirement of 43 paths, including 15 native test files; cite the supplied 17-file/380-case pass as host-integrated evidence, not worker execution or installed-package proof.
- Follow the superseding readiness section in `plans/checkpoints/deliberation_external_plugin_cutover.md:50-58` and completed exclusions in `plans/checkpoints/deliberation_bundled_registration_removal.md`; preserve existing dirty work.
- Decouple `src/plugins/source-checkout-runtime.test.ts:53-67` and the Deliberation loaders in Discord `message-handler.deliberation.test.ts:174`, Discord `message-handler.process.test.ts:608-643`, and Slack `message-handler.deliberation.test.ts:106-161`; direct-import searches alone miss these consumers.
- Apply the local loader-consumer and plan-header learnings; retain the dated title and only accepted section names. Keep research repo-local rather than invoking external knowledge-cache or home-configuration discovery.

## Approach

- Use generated metadata for generic discovery and the separately packaged `@openclaw-deliberation/plugin` entry / `./api` for real domain consumers; preserve generic SDK, transport, history, hook, runtime and channel APIs.
- Keep the existing wire pin, producer-owned identity semantics and assertions. Accept the supplied native-suite evidence without requiring another externalization, production rebuild, install or deployment.

## Implementation

1. Read owning `AGENTS.md` files; characterize the focused tests below before edits. Search current source, scripts, exports, workspace/type/test configuration and docs for retired paths, split path joins, probe exports and enabled Deliberation loader calls. Classify hits as active consumers, absence protections, generic examples or historical evidence.
2. Add the absence regression in `## TDD` and capture RED before deleting sources. Compare actual `extensions/deliberation` paths and SHA-256 values with the supplied manifest; leave any unmatched or changed path untouched and report it.
3. Replace the source-checkout test's symlink to retired source with a tiny generated package/manifest/entry fixture; preserve exactly one config-origin discovery result. Keep enabled-but-uninstalled and source/built/overlay/symlink/global-discovery scenarios; use isolated metadata fixtures where deletion would make exclusion coverage vacuous.
4. Update the three channel test loaders to resolve the separate public package entry through existing test loader/config seams; assert config-origin loading and required hooks. Preserve ownership, real mocked intake, sender hints, root/child identity, duplicate events, disabled/failure silence and ordinary dispatch scenarios. Use `./api` for any surviving probe consumer; never import sibling sources or duplicate domain hooks in a fixture. If offline package resolution or a needed public export is unavailable, record the exact consumer and missing input; do not skip or weaken its test.
5. Delete only manifest-listed paths. Record each removed path and retirement reason in the requested checkpoint: external counterpart, transferred scenario ownership, or the explicitly superseded `src/thread-identity-store.ts`. Map the renamed Slack/Discord hooks to producer-owned persisted identity; inspect parameterized local scenarios, including Slack root/child orchestration, and report any equivalence gap that the supplied handoff cannot answer rather than inferring it from counts.
6. Remove `pnpm-lock.yaml:595-603`'s workspace importer; remove dependency snapshots only if no remaining importer uses them. Retain shared `zod@4.4.3` and SDK dependencies. Change other API/build/discovery/test references only when the search proves executable coupling; retain npm `!dist/extensions/deliberation/**`, negative artifact tests and stale bundled-index protections. Keep removed full-gate tooling removed.
7. Update only obsolete source availability/package ownership wording in `docs/plugins/reference/deliberation.md` using `technical-documentation`; identify the external owner without inventing installation instructions. Run focused source checks and write `plans/checkpoints/deliberation_bundled_plugin_retirement.md` with exact removed/retained paths and reasons, test ownership/scenario mapping, classified references, commands/results, compatibility and unresolved inputs.
8. Include an operator-only checklist in that checkpoint: verify one external config-origin plugin, required hooks/history/status and preserved wire/receipt behavior; authorize any later build/reload and real-message validation separately; retain existing host rollback evidence outside retired sources. Claim source-only completion only when surviving consumers pass; run fresh `autoreview` before any later authorized commit.

## Files

| Path                                                                                                                                                                                                         | Planned change                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/`                                                                                                                                                                                   | Delete the exact 43 `entries[].path` values in the supplied manifest after local hash comparison; retain no source backup or second implementation. |
| `pnpm-lock.yaml`                                                                                                                                                                                             | Remove obsolete importer and only proven orphan dependencies.                                                                                       |
| `src/plugins/source-checkout-runtime.test.ts`                                                                                                                                                                | Replace retired-source symlink with generated metadata fixture.                                                                                     |
| `src/plugins/discovery.test.ts`                                                                                                                                                                              | Preserve exclusion coverage with isolated fixtures where necessary.                                                                                 |
| `extensions/discord/src/monitor/message-handler.deliberation.test.ts`, `extensions/discord/src/monitor/message-handler.process.test.ts`, `extensions/slack/src/monitor/message-handler.deliberation.test.ts` | Resolve real domain tests through separate public package boundary.                                                                                 |
| `test/scripts/bundled-plugin-build-entries.test.ts`                                                                                                                                                          | Add source-absence regression; keep existing no-build/no-pack and Bonjour assertions.                                                               |
| `docs/plugins/reference/deliberation.md`                                                                                                                                                                     | Correct retired source/package ownership wording only.                                                                                              |
| `plans/checkpoints/deliberation_bundled_plugin_retirement.md`                                                                                                                                                | Record the requested retirement evidence and operator checklist in one document.                                                                    |

## TDD

Use `tdd`: append the test below to `test/scripts/bundled-plugin-build-entries.test.ts`, reusing its existing imports. Run the identical command for RED and GREEN; record output in the retirement checkpoint.

```ts
import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

it("retires the replaced Deliberation source package from the host", () => {
  expect(fs.existsSync(path.resolve("extensions", "deliberation"))).toBe(false);
});
```

Command: `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2`.

| Test                                                | RED                                                     | GREEN                                                                              |
| --------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Retired source package absent                       | `true` differs from expected `false` before deletion    | `false` after manifest-listed files and empty directory are removed                |
| Existing absence and public discovery/channel tests | Record characterization results separately from TDD RED | Keep original scenarios passing through retained protections and public boundaries |

## Testing

- Use `openclaw-testing` for focused source proof under the supplied isolation policy: repo-local temporary HOME/config/state/cache, synthetic credentials and local mock listeners; inspect setup first for writes outside the repo or into live `dist`. Run sequentially; report missing dependencies instead of installing them.
- Run these affected host tests before/after cleanup, preserving every scenario:

```sh
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/source-checkout-runtime.test.ts src/plugins/discovery.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/plugin-registry.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts extensions/discord/src/monitor/message-handler.process.test.ts --maxWorkers=2
node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/deliberation-history.test.ts --maxWorkers=2
node scripts/run-tsgo.mjs -p tsconfig.extensions.json --noEmit --incremental false
node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.extensions.test.json --noEmit --incremental false
node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.test.src.json --noEmit --incremental false
```

- Respect typecheck wrapper limits and existing heavy-check policy; record baseline versus new diagnostics, and request host-owned isolated source proof if a lane is too broad locally. Do not replace typechecking with transpilation.
- Run scoped formatter/lint checks without build preparation, `git diff --check` and `git diff --numstat`; repeat the reference search and explain every retained active protection. Broaden to generic inbound/dispatch siblings only if their seam changes.
- Preserve the full `npm test` pipeline gate unchanged; do not query pipeline state, exclude suites, relax assertions, build/overwrite live `dist`, inspect installed releases, install/link, restart, replay or send a real message. Keep prior package/runtime evidence attributed to its original run.

## Progress

- [x] Read prior rejection, current consumers, local guidance and supplied handoff; revise the canonical plan without extra custody/package-readiness gates.
- [x] Link planning state to [this plan](2026-10-04_calm-fork-3432_deliberation-plugin-retire-replaced-bundled-implementation.md); leave `plans/tasks/` untouched.
- [ ] Implement only after planning approval; populate the retirement checkpoint and execute the focused proof.
