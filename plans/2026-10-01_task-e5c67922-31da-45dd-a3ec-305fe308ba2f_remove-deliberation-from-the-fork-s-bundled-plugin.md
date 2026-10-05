# Plan 2026-10-01: Remove deliberation from source-checkout bundled registration

_Status: DRAFT_

## Analysis

- Source checkout: `src/plugins/bundled-plugin-metadata.ts:90-170` scans every `extensions/*` manifest; `src/plugins/discovery.ts:1543-1575` scans the stock tree and missing built peers from source. Both still admit `extensions/deliberation` with `activation.onStartup: true`.
- `src/plugins/bundled-plugin-metadata.test.ts:34-72,581-675` expects deliberation in the source manifest inventory, then constructs a synthetic bundled registry from every source manifest. `src/plugins/source-checkout-runtime.test.ts:48-233` explicitly registers it as bundled through `onlyPluginIds`.
- Prior work already excludes deliberation from `scripts/lib/bundled-plugin-build-entries.mjs`, root `package.json.files`, packaged tests and tarball; retain those edits. Other unrelated work is present in the checkout; touch only relevant paths.
- `src/plugins/gateway-startup-plugin-ids.ts` consumes index and registry metadata; eliminate the plugin before index construction rather than filtering startup output. `docs/plugins/architecture.md` identifies manifest discovery as the control-plane owner; `docs/tools/plugin.md` documents `plugins.load.paths` for non-bundled local loading.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: audit discovery → registration → startup. `learnings/architecture/bundled-plugin-source-versus-distribution-proof.md` describes the earlier packaged-only proof; this fix must cover source runtime as well. `recall-knowledge` used local fallback (collection unavailable).
- Available skills: `tdd` for new genuine source-registry RED/GREEN; `openclaw-testing` to select focused verification; `autoreview` for implementation closeout; `save-learning` last after implementation. Historical packaging RED: `plans/checkpoints/task-170727a7-f1b4-40e6-b855-2bf5e0147680.red-green-proof.md`.

## Implementation

1. In `src/plugins/bundled-plugin-metadata.test.ts`, add the RED below before code changes. Capture its actual failing output with skill `tdd`; link the parent's historical packaging RED without claiming it proves the new source behavior.
2. Give source-checkout bundled discovery one shared exclusion rule for the retired source directory (a small helper under `src/plugins/` reused by `bundled-plugin-metadata.ts` and `discovery.ts`). Apply it only to _bundled_ scans of the fork's source checkout (stock and source-fallback), not global/workspace/config paths or synthetic scan-dir overrides. Preserve unrelated bundled ids, including other root-package exclusions. Keep build/package exclusion already implemented; assert the source exclusion agrees with packaging. Do not edit or remove `extensions/deliberation/**`.
3. Remove deliberation from the literal bundled startup inventory and source registry fixture in `src/plugins/bundled-plugin-metadata.test.ts`; test empty-config and explicit-enabled startup against the actual source metadata/index and verify no deliberation record exists. Retain packaged tests and other startup ids. Cover direct discovery from a source checkout with built tree present and absent; verify external/global installation with the same plugin id remains discoverable.
4. Replace the `onlyPluginIds: ["deliberation"]` bundled assertions in `src/plugins/source-checkout-runtime.test.ts`: default source checkout with explicit enabled entry and no installed external plugin has no registered deliberation/hook/service and reports the existing missing-plugin diagnostic; run the existing five-hook/intake tests through an explicit **non-bundled** local path, using a temp copy/link outside the recognized stock tree if bundled load-path aliasing blocks the checked-in path. Assert origin is not `bundled`; clean up fixture, hook runner, and server. Keep independent source plugin and channel tests.
5. Update the earlier checkpoint's "deliberately retained source registration" claim and any now-inaccurate user docs about source auto-loading (`docs/plugins/reference/deliberation.md`); do not redo package, build, or retired gate work. Verify source and packaged behavior independently with skill `openclaw-testing`: focused plugin discovery/metadata/runtime tests via `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts <paths>` (raise `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS=240000` if needed), existing build-entry and tarball assertions, `pnpm build` for registry/loader import changes, format/lint/type checks appropriate to touched files, then skill `autoreview` and record findings. Run skill `save-learning` as the final implementation action.

## Files to modify

- `src/plugins/bundled-plugin-metadata.ts`, `src/plugins/discovery.ts`, small shared source-exclusion helper: stop bundled candidate/metadata creation at the discovery boundary.
- `src/plugins/bundled-plugin-metadata.test.ts`, `src/plugins/discovery.test.ts`, `src/plugins/source-checkout-runtime.test.ts`: source inventory, startup, explicit-enable, installed external and direct non-bundled loading proof.
- `plans/checkpoints/deliberation_bundled_registration_removal.md`, `docs/plugins/reference/deliberation.md` if inaccurate: align proof and operator wording with actual source behavior.

## TDD

Use skill `tdd`; append to `describe("bundled plugin metadata", ...)` in **`src/plugins/bundled-plugin-metadata.test.ts`** (imports and helpers already exist):

```ts
it("does not register deliberation from a source checkout even when enabled", () => {
  expect(listRepoBundledPluginMetadata().map((entry) => entry.manifest.id)).not.toContain(
    "deliberation",
  ); // RED: source metadata currently includes it
  const manifestRegistry = createRepoBundledManifestRegistry();
  expect(manifestRegistry.plugins.map((plugin) => plugin.id)).not.toContain("deliberation");
  const index = createInstalledPluginIndexForManifests(manifestRegistry);
  expect(
    resolveGatewayStartupPluginIdsFromRegistry({
      config: { plugins: { entries: { deliberation: { enabled: true } } } },
      env: {},
      index,
      manifestRegistry,
      platform: "linux",
    }),
  ).not.toContain("deliberation");
});
```

| Test                             | RED now                                                                    | GREEN after fix                                                |
| -------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Source metadata/registry/startup | Metadata contains deliberation; registry/explicit startup still include it | No bundled metadata/record/startup id; unrelated ids preserved |

Run focused RED/GREEN: `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS=240000 node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/bundled-plugin-metadata.test.ts`. Add discovery and non-bundled loader tests before implementing their corresponding changes; store fresh follow-up evidence in `plans/checkpoints/task-e5c67922-31da-45dd-a3ec-305fe308ba2f.red-green-proof.md`.
