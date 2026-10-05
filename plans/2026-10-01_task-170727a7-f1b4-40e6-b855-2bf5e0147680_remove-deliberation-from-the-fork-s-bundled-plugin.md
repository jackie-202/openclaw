# Plan 2026-10-01: Remove deliberation from the fork's bundled plugin registration surface

_Status: DRAFT_

## Findings and decision

- `src/plugins/bundled-plugin-metadata.ts:90-99` and `src/plugins/discovery.ts:1543-1575` still scan the checked-in `extensions/deliberation` manifest (`activation.onStartup: true`). Dropping an expected id alone cannot remove it from a source checkout while source removal belongs to `calm-fork-3432`. Treat source-checkout loading as an explicitly retained development path until that retirement; assert the **distributed/built** runtime omits it. Do not add a plugin-id exception to generic discovery.
- `scripts/lib/bundled-plugin-build-entries.mjs:193-256` already has an exclusion seam and `package.json:72-109` controls pack exclusions. Exclude deliberation from both generated bundled build entries and the root package; do not exclude any other bundled id. Verify stale local `dist`/`dist-runtime` output is not mistaken for fresh packaging proof.
- `src/cli/plugins-location-bridges.ts:13-50` derives `ExternalizedBundledPluginBridge` only from an **enabled persisted bundled record plus npm/ClawHub install metadata**; `src/cli/update-cli/update-command.ts:1671` passes it into update. `extensions/deliberation/package.json` has a package name but no `openclaw` install metadata, and the official external catalog has no deliberation entry. **Do not manufacture an install spec or add a parallel bridge.** Existing enabled config without a separately installed plugin must be reported as unresolved by normal validation/discovery, never silently treated as migrated or loaded. If an approved, installable external spec becomes available, add it through the existing catalog/persisted-record bridge and cover a positive migration case before promising automatic relocation. Confirm the actual CLI/config diagnostics in focused tests rather than assuming a no-op.
- `docs/plugins/reference/deliberation.md:12-16` currently says “included in OpenClaw”; update distribution wording to accurately describe manual external installation only once a verified install route exists. Otherwise state that no supported install route has been proven; never promise external availability.
- Learning: `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md` requires tracing each retained match through registration and activation; `learnings/architecture/deliberation-readiness-evidence-gate.md` separates local behavior proof from external rollout proof. No external repository/home config inspection.

## Implementation

1. First write regression assertions: bundled build entries and pack artifacts have **no** `extensions/deliberation/` prefix; the distributed startup inventory contains no deliberation, including when the config explicitly enables it without an installed external plugin; every other existing bundled startup id stays identical. Keep the source-checkout tests asserting real plugin hooks and the Discord intake path as **source-development behavior**; rename their description to avoid implying distribution. For the packaged-path case use an isolated built/packaged fixture, not the source-backed manifest registry used by `bundled-plugin-metadata.test.ts:217-244`.
2. Add deliberation to `EXCLUDED_CORE_BUNDLED_PLUGIN_DIRS` in `scripts/lib/bundled-plugin-build-entries.mjs` and `!dist/extensions/deliberation/**` in root `package.json.files`. Check `scripts/copy-bundled-plugin-metadata.mjs`, `scripts/stage-bundled-plugin-runtime.mjs`, sidecar baseline generation, package assembly and any stale artifact copying: enforce omission using existing build/pack exclusion machinery, without a new id-specific runtime switch. If generated baselines change, regenerate from the source of truth; do not edit baselines to hide failures.
3. In `src/plugins/bundled-plugin-metadata.test.ts`, distinguish the retained source-tree inventory from the **packaged** inventory; remove deliberation from the packaged expected startup set only when its input is actually packaged metadata. Replace the bundled explicit-enable assertion with a packaged no-registration/clear missing-install diagnostic assertion. Preserve the empty-config and all-other-ids checks; do not filter the source manifest fixture merely to make the test green.
4. In `scripts/test-built-plugin-singleton.mjs`, remove the deliberation manifest copy, probe API import, `onlyPluginIds`, five-hook/service assertions and generated-runtime requirement; retain the synthetic command plugin singleton smoke and assert no deliberation bundled entry in the fresh built runtime. In `test/scripts/bundled-plugin-build-entries.test.ts`, replace the narrow retired-doctor-sidecar assertion with complete entry/artifact exclusion plus preservation of a known other bundled entry.
5. Inspect `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, `test/scripts/deliberation-full-gate.test.ts`, `test/scripts/deliberation-package.e2e.test.ts` and root `test:deliberation:full-gate`: eliminate the OR-22 **bundled-package** leaf and its required-ledger/gate wiring without suppressing failures or discarding the independent Discord/Slack/focused plugin checks. Replace OR-22 with an applicable external-package behavior test **only if a real external artifact is supplied**; otherwise retire the now-unsatisfiable full-gate script/ledger and its tests with explicit checkpoint explanation, retaining meaningful channel and source-level tests. Remove the obsolete root script rather than leaving a gate that promises impossible package proof.
6. Classify incidental test mentions in `src/agents/embedded-agent-utils.test.ts`, `src/auto-reply/reply/dispatch-from-config.test.ts`, `src/plugin-sdk/channel-inbound.test.ts` by call path; keep generic hook/channel behavior examples that do not load/register deliberation. Update docs distribution wording and write `plans/checkpoints/deliberation_bundled_registration_removal.md` with changed and retained references, external migration decision, exact test commands/results and source-checkout-vs-distribution limitation. No `extensions/deliberation/**` edits or deletion.

## TDD

Implement TDD cycle per skill:tdd. First append this executable RED assertion inside the existing `describe("bundled plugin build entries", ...)` in `test/scripts/bundled-plugin-build-entries.test.ts` (its imports already supply `expect`, `it`, `listBundledPluginBuildEntries`, `listBundledPluginPackArtifacts`):

```ts
it("does not build or package deliberation as a bundled plugin", () => {
  const entries = listBundledPluginBuildEntries();
  const artifacts = listBundledPluginPackArtifacts();
  expect(Object.keys(entries).filter((key) => key.startsWith("extensions/deliberation/"))).toEqual(
    [],
  ); // RED: source is currently built
  expect(artifacts.filter((key) => key.startsWith("dist/extensions/deliberation/"))).toEqual([]); // RED: source is currently packed
  expect(entries).toHaveProperty("extensions/bonjour/index");
});
```

| Assertion         | RED before implementation     | GREEN after implementation |
| ----------------- | ----------------------------- | -------------------------- |
| No build entries  | Deliberation entry present    | Empty prefix match         |
| No pack artifacts | Deliberation artifact present | Empty prefix match         |
| Preserve Bonjour  | Already present               | Still present              |

Run focused RED/GREEN: `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts` (use the correct tooling Vitest config if project routing requires it). Then add the packaged startup and explicit-enabled-no-install assertions before implementing their matching behavior; do not turn a source-checkout test into a fake packaged test.

## Verification at implementation time

- Run exactly: `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts` and `node scripts/test-projects.mjs --changed HEAD`. The latter uses `HEAD` only as the requested command argument; planning performs no version-control operations.
- Also run the focused build-entry tests, singleton script against a freshly built runtime (`pnpm build` first), and surviving gate/channel tests with the repository's Vitest wrapper. Inspect the fresh packed artifact and assert the deliberate absence of `dist/extensions/deliberation/**` and continued inclusion of other bundled plugins. Record exact commands/outcomes; if unavailable, record the first actionable blocker instead of claiming success.
- Run the required `$autoreview` for nontrivial code changes before handoff; record accepted findings/resolutions in the implementation checkpoint (not during planning).
