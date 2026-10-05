# Plan 2026-09-30: Export plugin-sdk test surface so external plugins can run their own test lane

_Status: DRAFT_

## Progress

- [x] Initialize canonical plan path
- [x] Inspect exports, build, package tests, and scoped guidance
- [x] Read relevant learnings and documentation
- [x] Specify implementation and verification

## Analysis

- `scripts/lib/plugin-sdk-entrypoints.json` already lists both modules; `scripts/lib/plugin-sdk-private-local-only-subpaths.json` excludes them from generated public exports and pack artifacts. `scripts/lib/plugin-sdk-deprecated-public-subpaths.json` also lists both.
- `scripts/lib/plugin-sdk-entries.mjs` and `src/plugin-sdk/entrypoints.ts` derive public exports by subtracting private-local-only entries; `scripts/sync-plugin-sdk-exports.mjs` regenerates `package.json` exports.
- `package.json` additionally excludes both JS and declarations in `files`; existing public entries use `types`/`default`, not `types`/`import`.
- `tsdown.config.ts:158-162,659` builds only public SDK entries in production; removing the two names from local-only automatically emits them. `scripts/write-plugin-sdk-entry-dts.ts` handles declaration entries already.
- `src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts:766-778,888-901` checks exact package/public metadata correspondence, other helpers remaining local-only, and deprecated surface usage. `test/scripts/bundled-plugin-build-entries.test.ts` covers a different owner.
- `docs/plugins/sdk-testing.md:20-24` and `docs/plugins/sdk-subpaths.md:43-48` currently call both repo-local/unexported; update these claims and the SDK overview's general classification wording.
- `learnings/architecture/plugin-sdk-test-helpers-require-aligned-public-metadata.md` records the generator/build/pack alignment checklist; no critical-patterns file applies.

## Available Skills

- `compound-plan`: create/update this plan.
- `recall-knowledge`: search relevant learnings before synthesis.
- `tdd`: implementation agent should record RED/GREEN focused contract test evidence.
- `openclaw-testing`, `autoreview`, `technical-documentation`: implementation validation, fresh review, and docs writing respectively per root guidance.

## Decision

- Publish both as **normal public SDK subpaths intended for plugin test code**. This repo has no published test-only export condition: its existing test-helper convention is local-only, which prevents external use. Use existing `types`/`default` export shape; do not introduce conditions or wildcards.
- Remove both from the local-only list and deprecated-public list: newly supported test imports should not be labeled deprecated. Leave every other test helper local-only and every existing export unchanged.

## Implementation

1. In `src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts`, add the RED contract test below first; run it via `skill:tdd`. Keep its neighboring local-only and export-alignment tests.
2. Remove `plugin-test-api` and `test-env` from `scripts/lib/plugin-sdk-private-local-only-subpaths.json` and `scripts/lib/plugin-sdk-deprecated-public-subpaths.json`. Keep `scripts/lib/plugin-sdk-entrypoints.json` and `tsdown.config.ts` as-is: both source entries already exist, and the production build derives from the public subset.
3. Regenerate only SDK export entries with `pnpm plugin-sdk:sync-exports`; delete four exact `!dist/plugin-sdk/{plugin-test-api,test-env}.{js,d.ts}` entries from `package.json#files`. Verify generated export diff contains two additions and no changed preexisting entries.
4. Update `docs/plugins/sdk-testing.md` and `docs/plugins/sdk-subpaths.md`: identify these two as packaged, test-code-only usage; keep remaining testing helpers documented as repo-local. Follow `skill:technical-documentation`. Check `docs/plugins/sdk-overview.md` classification remains accurate.
5. Run focused contract checks and inspect packaged runtime/declarations. If `pnpm plugin-sdk:api:check` reports baseline drift, seek explicit approval before editing generated baseline/hash files (root policy); report any unresolved gate. Obtain fresh `skill:autoreview` before implementation handoff.

## TDD

**Test file:** `src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts` (append after the package exports alignment test). **Run:** `pnpm test src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts -t "publishes the two plugin test subpaths"`. Implement TDD cycle per `skill:tdd`.

```ts
it("publishes the two plugin test subpaths", () => {
  const packageJson = JSON.parse(fs.readFileSync(resolve(REPO_ROOT, "package.json"), "utf8")) as {
    exports: Record<string, { types: string; default: string }>;
    files: string[];
  };
  for (const name of ["plugin-test-api", "test-env"]) {
    expect(publicPluginSdkEntrypoints).toContain(name); // RED: both currently local-only
    expect(packageJson.exports[`./plugin-sdk/${name}`]).toEqual({
      types: `./dist/plugin-sdk/${name}.d.ts`,
      default: `./dist/plugin-sdk/${name}.js`,
    });
    for (const ext of ["js", "d.ts"]) {
      expect(packageJson.files).not.toContain(`!dist/plugin-sdk/${name}.${ext}`);
    }
  }
});
```

| Assertion                                       | RED                                                  | GREEN                                     |
| ----------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- |
| Public entrypoint / export mapping (both names) | Absent from public subset and `package.json#exports` | Both present with `types`/`default` paths |
| Pack inclusion (JS + d.ts, both names)          | Four exclusions remain                               | No exact exclusions                       |

## Verification (implementation stage)

- `pnpm test src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts` then `pnpm test src/plugins/contracts/plugin-sdk-subpaths.test.ts`; `node scripts/sync-plugin-sdk-exports.mjs --check`; `pnpm plugin-sdk:api:check` (respect baseline approval rule).
- `pnpm build` in this source checkout only; check `dist/plugin-sdk/{plugin-test-api,test-env}.{js,d.ts}` exists. Run `npm pack --dry-run --json` locally and assert all four appear in `files` (inspect returned JSON).
- From a disposable **repository-local** consumer directory with `node_modules/openclaw` pointing at this checkout/packed package, run `node --input-type=module -e 'for (const s of ["plugin-test-api", "test-env", "channel-runtime-context"]) { const m = await import(`openclaw/plugin-sdk/${s}`); if (!m || !Object.keys(m).length) throw Error(s); console.log(s, "ok"); }'`. Prefer a packed local package to validate packed dependencies; do not touch the live installation or another repository. Confirm both new modules resolve and the existing subpath remains resolvable.
- `git diff --check`; record exact commands/results and public/test-use decision in final implementation note.

## Files to modify

| Path                                                                                                                | Action                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/lib/plugin-sdk-private-local-only-subpaths.json`, `scripts/lib/plugin-sdk-deprecated-public-subpaths.json` | Unclassify the two newly published test helpers as local-only/deprecated |
| `package.json`                                                                                                      | Add two generated export keys; remove four pack exclusions               |
| `src/plugins/contracts/plugin-sdk-package-contract-guardrails.test.ts`                                              | Lock both metadata and pack-file intent                                  |
| `docs/plugins/sdk-testing.md`, `docs/plugins/sdk-subpaths.md`                                                       | Clarify published test-helper contract                                   |

_Created: 2026-09-30_
