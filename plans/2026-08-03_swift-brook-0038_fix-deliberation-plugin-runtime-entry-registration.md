# Plan 2026-08-03: Fix Deliberation plugin runtime entry registration

Make Deliberation's expected hooks visible in manifest-only inventory, enforce them during full runtime registration, and lock the built Gateway path with artifact-level and composed Discord ingress tests.

_Status: DRAFT_

## Analysis

- `extensions/deliberation/index.ts` already follows the documented contract: its default `definePluginEntry(...)` export has a callable `register` that installs `inbound_claim`, `before_dispatch`, `before_tool_call`, and `message_sending`.
- A scoped build produced `dist/extensions/deliberation/index.js` with module keys `__esModule` and `default`; `default.register` is a function. A full loader probe registered all four typed hooks. Do not add an entry shim unless the isolated `dist-runtime` RED test contradicts this result.
- `openclaw plugins list --json` uses `src/plugins/status-snapshot.ts`, intentionally does not import runtime modules, and currently hardcodes `hookCount: 0` and `hookNames: []`. That output is not evidence that `register` failed.
- Gateway startup loads only manifest-selected startup IDs. Deliberation declares `activation.onStartup: true`, but the bundled startup inventory test does not yet lock Deliberation into its expected set.
- Existing source tests prove direct registration and source-checkout loading. `extensions/discord/src/monitor/message-handler.process.test.ts` composes real Discord message processing with Deliberation hooks, canonical KM intake, terminal success, and fail-closed fallback; built-artifact coverage is the missing layer.

## Relevant Contracts

- `docs/plugins/sdk-entrypoints.md`: non-channel plugins default-export `definePluginEntry(...)`; installed runtime prefers built JavaScript.
- `docs/plugins/sdk-testing.md`: direct `register(api)` tests are insufficient; loader-backed tests must reset runtime and global hook state.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`: intake and terminal suppression stay separate and processing routes plus restricted-session guards remain isolated.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove discovery, registration, activation, and callers instead of inferring activation from artifact presence.

## Available Skills

- `tdd`: capture the built-artifact and expected-hook-contract RED/GREEN cycle.
- `openclaw-testing`: select focused loader, plugin, Discord, build, and changed-surface checks.
- `autoreview`: run mandatory fresh review after implementation and verification.
- `validate-implementation`: confirm the final change still respects plugin/core ownership.
- `save-learning`: save at least one learning as the implementation task's final action.

## Implementation

1. Use `skill:tdd` to extend `scripts/test-built-plugin-singleton.mjs` with a Deliberation case loaded from staged `dist-runtime/extensions`, not `extensions/`. Assert the full loader reports `status: "loaded"`, `hookCount: 4`, the four typed hook names, and a global runner containing `inbound_claim`.
2. Add a generic optional expected-hook list to plugin manifest contracts, parse and preserve it through manifest registry/index snapshots, and declare only Deliberation's four hooks in `extensions/deliberation/openclaw.plugin.json`. Keep `plugins list` non-importing; populate its hook fields from declared metadata instead of executing plugin code.
3. After full `register(api)` completes, compare Deliberation's declared expected hooks with its actual typed registrations. Mark the plugin load as an error and roll back registrations when any declared hook is absent; plugins without the optional contract retain current behavior.
4. Add focused manifest/status tests proving Deliberation's JSON list record exposes all four expected hooks, plus a loader fixture proving a plugin that declares an expected hook cannot remain `loaded` after registering none.
5. Lock Gateway activation by adding Deliberation to the bundled startup expectation and asserting `resolveGatewayStartupPluginIdsFromRegistry(...)` includes it when enabled. Do not broaden startup loading or special-case the plugin ID in production core.
6. Update the existing loader-backed Deliberation event expectation to `sourceTarget: discord:channel:<channelId>`. Keep the composed Discord test's assertions that durable intake succeeds before terminal handling, ordinary dispatch/delivery do not run, KM failure remains fail-closed through `before_dispatch`, processing sources remain excluded, and SecretRef parsing is unchanged.
7. If step 1 fails because the isolated artifact has a module shape not handled by `resolvePluginModuleExport`, fix `src/plugins/loader.ts` at the shared documented default-export boundary and add that exact module shape to `src/plugins/loader.native-module-loader.test.ts`. Do not change the canonical Deliberation default export or add a bundled-only compatibility path.
8. In the final implementation note, state activation commands exactly: `pnpm build`, `pnpm openclaw gateway restart`, then `pnpm openclaw gateway status --deep`. State that rebuilding without restarting leaves the process-stable plugin registry unchanged.

## Files to Modify

| File                                                             | Change                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/openclaw.plugin.json`                   | Declare four expected typed hooks.                                                                            |
| `src/plugins/manifest.ts`                                        | Parse and type the optional expected-hook contract.                                                           |
| `src/plugins/manifest-registry.ts`                               | Preserve the new contract key in registry metadata.                                                           |
| `src/plugins/status-snapshot.ts`                                 | Report declared hook names/count without importing runtime code.                                              |
| `src/plugins/loader.ts`                                          | Enforce declared hooks after registration; change export normalization only if built RED proves it necessary. |
| `src/plugins/manifest-registry.test.ts`                          | Cover expected-hook parsing/preservation.                                                                     |
| `src/plugins/status.registry-snapshot.test.ts`                   | Assert manifest-only Deliberation hook metadata.                                                              |
| `src/plugins/loader.test.ts`                                     | Reject a loaded plugin missing its declared hook.                                                             |
| `src/plugins/bundled-plugin-metadata.test.ts`                    | Lock Deliberation into Gateway startup scope.                                                                 |
| `src/plugins/source-checkout-runtime.test.ts`                    | Preserve source-loader hook coverage and canonical KM target expectation.                                     |
| `extensions/discord/src/monitor/message-handler.process.test.ts` | Preserve composed ingress, terminal dispatch, and fail-closed assertions.                                     |
| `scripts/test-built-plugin-singleton.mjs`                        | Load the actual staged Deliberation artifact and assert runtime/global hook registration.                     |
| `src/plugins/loader.native-module-loader.test.ts`                | Only if the artifact RED identifies an unsupported export wrapper.                                            |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; record evidence in `plans/checkpoints/swift-brook-0038.red-green-proof.md`.

**Primary test file:** `scripts/test-built-plugin-singleton.mjs`
**Run command:** `OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton`

```js
const deliberation = registry.plugins.find((entry) => entry.id === "deliberation");
assert.equal(deliberation?.status, "loaded", deliberation?.error);
assert.equal(deliberation?.hookCount, 4); // RED: built smoke does not load/assert Deliberation yet.
assert.deepEqual(
  registry.typedHooks
    .filter((hook) => hook.pluginId === "deliberation")
    .map((hook) => hook.hookName),
  ["inbound_claim", "before_dispatch", "before_tool_call", "message_sending"],
);
initializeGlobalHookRunner(registry);
assert.equal(getGlobalHookRunner()?.hasHooks("inbound_claim"), true);
```

| Test                            | RED                                                                                                       | GREEN                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Built Deliberation registration | Smoke has no Deliberation/runtime-runner assertion, or isolated artifact exposes the failing export shape | Staged built artifact registers exactly four hooks and global `inbound_claim`                        |
| Declared-hook enforcement       | Fixture declaring `inbound_claim` but registering nothing remains `loaded`                                | Loader returns an error and rolls back the incomplete plugin                                         |
| Manifest-only list metadata     | Deliberation snapshot reports zero hooks                                                                  | Snapshot reports the four declared hooks without importing runtime                                   |
| Composed Discord ingress        | Missing/wrong canonical target or ordinary dispatch continues                                             | KM receives `discord:channel:<id>` and successful intake is terminal; KM failure remains fail-closed |

## Verification

1. Run focused tests: `pnpm test src/plugins/manifest-registry.test.ts src/plugins/status.registry-snapshot.test.ts src/plugins/loader.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts extensions/deliberation/src extensions/discord/src/monitor/message-handler.process.test.ts`.
2. Run the built artifact command from the TDD section and verify its source is under `dist-runtime/extensions/deliberation`.
3. Run `pnpm build`, then execute `pnpm openclaw plugins list --json` against an isolated test config and assert Deliberation reports the four declared hooks.
4. Run `pnpm changed:lanes --json`, then the smallest lanes selected by `skill:openclaw-testing`; use `pnpm check:changed` only after focused proof is green.
5. Run fresh `skill:autoreview` until no accepted actionable findings remain, then `skill:validate-implementation`.
6. As the final action, invoke `skill:save-learning` and save at least one learning about manifest-only status versus activated runtime proof.

---

_Created: 2026-08-03_
