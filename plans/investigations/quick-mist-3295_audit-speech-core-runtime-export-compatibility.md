# Investigation: speech-core runtime export compatibility

## Scope

- Task: `quick-mist-3295`
- Historical fork commit: `2c030c303aba3e27131903b08d934fd1764af78f`
- Comparison base: `4b85d834ed1586062f31bded2f358fc5192d1674`
- Question: Does the base still need an alias for the retired `@openclaw/speech-core` package and its runtime API?
- Boundary: Static repository, proposal, and cited audit evidence only. No tests, builds, generated-artifact inspection, live Gateway action, external-repository search, or Git lifecycle operation was performed.

The requested path helper is absent at the comparison base and in the working tree, so this report uses the fallback path specified by the plan.

## Summary

The historical alias fixed a real source-checkout resolution failure while speech runtime was a private workspace package. That package architecture no longer exists at the comparison base. Core runtime callers now import `src/tts/**` relatively, while official speech plugins use the host-owned private-local entrypoints `openclaw/plugin-sdk/speech-core` and `openclaw/plugin-sdk/tts-runtime`.

Static source and build-configuration evidence contains no producer or consumer of `@openclaw/speech-core`, no `packages/speech-core/**` or `extensions/speech-core/**` tree, and no loader alias for the retired package. The current facade test deliberately rejects `speech-core/runtime-api.js` as a bundled plugin surface. Restoring the alias would recreate an owner boundary that the base explicitly removed.

This is enough to decide alias necessity, but it is not the full promotion proof required by Family 10. A package-resolution test, generated build/DTS checks, and a clean-checkout plugin reply smoke remain outstanding.

## Historical Architecture

At `2c030c303aba`, `packages/speech-core/package.json` declared a private workspace package whose root and runtime exports resolved to package-root source entrypoints and `dist/*.mjs` artifacts. The commit added the `.js`-suffixed runtime export and taught `src/plugins/sdk-alias.ts` to resolve package-root source files after the Gateway had failed lazily with:

```text
Unable to resolve bundled plugin public surface speech-core/runtime-api.js
```

The incident and its source/dist resolver proof are recorded in `learnings/tooling/2026-06-09_upstream-sync-speech-core-runtime-api-gateway-boot-audit.md:13-65`.

### Historical Package Exports

| Historical specifier | Historical source target | Historical packaged target |
| --- | --- | --- |
| `@openclaw/speech-core` | `packages/speech-core/runtime-api.ts` | `packages/speech-core/dist/runtime-api.mjs` |
| `@openclaw/speech-core/api` | `packages/speech-core/api.ts` | `packages/speech-core/dist/api.mjs` |
| `@openclaw/speech-core/runtime-api` | `packages/speech-core/runtime-api.ts` | `packages/speech-core/dist/runtime-api.mjs` |
| `@openclaw/speech-core/runtime-api.js` | `packages/speech-core/runtime-api.ts` | `packages/speech-core/dist/runtime-api.mjs` |
| `@openclaw/speech-core/speaker` | `packages/speech-core/speaker.ts` | `packages/speech-core/dist/speaker.mjs` |
| `@openclaw/speech-core/voice-models` | `packages/speech-core/voice-models.ts` | `packages/speech-core/dist/voice-models.mjs` |

Evidence: `2c030c303aba:packages/speech-core/package.json`; `2c030c303aba:tsconfig.json:218-226`. The package declared `"private": true`, so the repository provides no evidence that these names were a supported third-party package contract.

## Import And Export Map

### Package-Qualified Paths

| Historical path | Reference at base | Supported base route | Source and packaged target | Loader involvement | Classification |
| --- | --- | --- | --- | --- | --- |
| `@openclaw/speech-core` | No source, config, package export, or alias reference | Plugin runtime behavior: `openclaw/plugin-sdk/tts-runtime`; core behavior: relative `src/tts/**` imports | `src/plugin-sdk/tts-runtime.ts` -> `dist/plugin-sdk/tts-runtime.js`; core `src/tts/tts.ts` | Generic plugin-SDK aliasing only; no speech-core package or bundled facade | Retired name is unreferenced; behavior is owned by current routes |
| `@openclaw/speech-core/api` | No reference | `openclaw/plugin-sdk/speech-core` | `src/plugin-sdk/speech-core.ts` -> `dist/plugin-sdk/speech-core.js` | Generic plugin-SDK aliasing | Replaced by the host plugin-SDK route |
| `@openclaw/speech-core/runtime-api` | No reference | `openclaw/plugin-sdk/tts-runtime` for plugins; `src/tts/runtime-api.ts` for core | `src/plugin-sdk/tts-runtime.ts` -> `dist/plugin-sdk/tts-runtime.js`; core-relative runtime barrel | Generic plugin-SDK aliasing; no bundled facade | Retired name is unreferenced; runtime behavior remains supported |
| `@openclaw/speech-core/runtime-api.js` | No reference | Same as extensionless runtime path | Same as extensionless runtime path | Explicitly rejected as a bundled `speech-core` facade | Retired failing specifier is unreferenced and intentionally not loadable |
| `@openclaw/speech-core/speaker` | No reference | Core-only relative imports of `src/tts/speaker.ts` | Core build graph; no package subpath replacement | None | Retired package path is unreferenced; surviving callers moved with ownership |
| `@openclaw/speech-core/voice-models` | No reference | Core-only relative imports of `src/tts/voice-models.ts` | Core build graph; no package subpath replacement | None | Retired package path is unreferenced; surviving callers moved with ownership |

The zero-reference result comes from a commit-pinned fixed-string search across the base, excluding only the proposal, plans, and learning evidence that discuss the old architecture. The same search found no `packages/speech-core` reference in product, build, test, or package metadata. A commit-pinned tree listing found neither `packages/speech-core/**` nor `extensions/speech-core/**`.

### Historical Relative Imports

| Historical import at `2c030c303aba` | Historical caller | Base state or replacement |
| --- | --- | --- |
| `../../packages/speech-core/runtime-api.js` | `src/plugin-sdk/tts-runtime.ts:55` | `src/plugin-sdk/tts-runtime.ts` now exports from `../tts/tts.js` and `../tts/runtime-api.js` |
| `../../../packages/speech-core/speaker.js` | `src/gateway/server-methods/talk.ts:20` | `src/gateway/server-methods/talk.ts:51` imports `../../tts/speaker.js` |
| `../../../packages/speech-core/voice-models.js` | `src/gateway/server-methods/talk-shared.ts:14` | `src/gateway/server-methods/talk-shared.ts:34` imports `../../tts/voice-models.js` |
| `../../packages/speech-core/voice-models.js` | `src/plugins/capability-provider-runtime.ts:3` and `src/plugins/model-catalog-registration.ts:17` | Both import `../tts/voice-models.js` at the base |
| `../../packages/speech-core/src/tts.ts` | `scripts/repro/webchat-auto-tts-live-proof.mjs:10` | The repro script and import are absent at the base; current runtime source is `src/tts/tts.ts` |

No historical relative path remains at the base. The speaker and voice-model implementations were moved rather than exposed through replacement package subpaths; their callers are all core-owned and therefore use relative imports.

## Current Ownership And Resolution

### Plugin Consumers

Bundled speech providers import provider/config helpers from `openclaw/plugin-sdk/speech-core`; examples include Azure, ElevenLabs, Google, OpenAI, and local CLI speech providers. `extensions/voice-call/runtime-api.ts:19` imports host runtime helpers from `openclaw/plugin-sdk/tts-runtime`. The extension package-boundary map resolves both declarations through generated `packages/plugin-sdk` output (`extensions/tsconfig.package-boundary.paths.json:107-112`).

The root package exports only runtime JavaScript for these private-local entrypoints:

- `package.json:724-726`: `./plugin-sdk/speech-core` -> `./dist/plugin-sdk/speech-core.js`
- `package.json:731-733`: `./plugin-sdk/tts-runtime` -> `./dist/plugin-sdk/tts-runtime.js`

Both names appear in `scripts/lib/plugin-sdk-entrypoints.json:97-99` and in the private-local inventory at `scripts/lib/plugin-sdk-private-local-only-subpaths.json:157,182`. Their root-package declaration artifacts are explicitly pack-excluded at `package.json:205,240`; official plugin typechecking instead uses the generated package-boundary declarations.

### Core And Gateway Callers

Core code does not route runtime behavior through a private plugin-SDK import. `scripts/check-plugin-sdk-subpath-exports.mts` enforces relative imports for private runtime helpers used from non-test `src/**`. The observed paths follow that rule:

- Gateway TTS and talk handlers import `../../tts/tts.js`, `../../tts/speaker.js`, and `../../tts/voice-models.js`.
- Reply and cron delivery paths lazily import `../../tts/tts.runtime.js`.
- `src/tts/tts.runtime.ts:2` re-exports `maybeApplyTtsToPayload` from `./tts.js`.
- `src/tts/tts.ts:7,50` imports and re-exports from `./runtime-api.js`.

This lazy path never constructs an `@openclaw/speech-core` specifier and does not cross the bundled plugin public-surface loader.

### Build And Packaging Contracts

Static build configuration supports the current routes:

- `scripts/lib/plugin-sdk-entries.mts` derives both current entrypoints as production private runtime facades, generates default-only package exports, requires their `dist/plugin-sdk/*.js` artifacts, and excludes their private declarations from package output.
- `tsdown.config.ts:179-180` builds the production plugin-SDK entrypoint set during ordinary builds.
- `scripts/release-check.ts:92` includes all packaged private plugin-SDK runtime artifacts in required package contents.
- `test/release-check.test.ts:578-594` checks that private declarations stay excluded and private runtime JavaScript stays included.
- `scripts/check-plugin-sdk-exports.mts` checks only public SDK JS/DTS entries. It does not prove these private-local entries, by design.
- `scripts/check-plugin-sdk-subpath-exports.mts:109-142` verifies package export/inventory presence for referenced public paths and the private-relative-import owner rule.

There is no build entry, package export generator, TypeScript path, or SDK alias rule for `@openclaw/speech-core` at the base.

## Loader And Test Evidence

- `src/plugins/sdk-alias.ts` has no speech-core workspace-package special case. `src/plugins/sdk-alias.test.ts` exercises generic `openclaw/plugin-sdk/*` source/dist alias behavior but contains no exact assertion for the two current speech subpaths.
- `src/plugin-sdk/facade-activation-contract.ts:1-6` permits only `image-generation-core` and `media-understanding-core` as runtime-core facade directories without plugin manifests.
- `src/plugin-sdk/facade-runtime.test.ts:703-718` asserts that `speech-core/runtime-api.js` is not treated as a bundled extension surface and returns `no bundled plugin manifest found for speech-core`.
- `src/tts/tts.test.ts` imports the current core TTS module and `../plugin-sdk/tts-runtime.js`, proving the intended in-tree facade relationship when that test runs.
- Reply-path tests mock `../../tts/tts.runtime.js`; they verify caller behavior but do not prove real lazy module resolution in a built or clean package.
- The historical audit records source/dist alias tests and one real rebuilt Gateway/channel smoke for the former package architecture. That proof does not substitute for a clean smoke of the base architecture.

## Alias Necessity

No current source path can be shown to emit the retired package name:

1. Exact old specifiers and package-relative paths have zero references at the pinned base.
2. The source package and extension facade directories are absent.
3. Current plugin entrypoints export directly from core TTS modules.
4. Current core lazy callers import a relative `src/tts` runtime facade.
5. Build entry and package-export generation know only the current `openclaw/plugin-sdk/*` names.
6. The bundled facade contract deliberately excludes `speech-core`.

The old failure was therefore architectural, not a permanent compatibility requirement: a private workspace package exposed a package-root runtime entrypoint that source-checkout alias generation did not understand. The base removed that package boundary and moved the surviving responsibilities to their current owners. Adding an alias now would introduce a second route to core-owned runtime code without a repository consumer or supported external contract.

## Verification Gaps

Family 10's promotion gate is not fully satisfied by this investigation:

- No package-resolution test imported `openclaw/plugin-sdk/speech-core` and `openclaw/plugin-sdk/tts-runtime` from a clean source checkout and packed install.
- No build was run, so generated chunks were not searched for `@openclaw/speech-core` and the expected private runtime JS artifacts were not inspected.
- No DTS/export or release gate was executed; only its static source contract was inspected.
- No clean-checkout Gateway boot and first real reply exercised the lazy `src/tts/tts.runtime.js` path.
- Existing reply tests mock the lazy TTS runtime.
- Exact source/dist resolver assertions for the two current private-local speech SDK subpaths are absent from `src/plugins/sdk-alias.test.ts`.
- External repositories were outside scope. The old package's `private` declaration and repository-wide zero references are strong negative contract evidence, but not an external consumer census.

Evidence that would change the decision includes a generated base artifact that still imports `@openclaw/speech-core`, a clean package where either current plugin-SDK path fails to resolve, a clean Gateway reply reproducing the old facade error, or a shipped supported consumer contract for the old private package name.

## Proposal Decision

**Verdict: Obsolete by decision.**

**Confidence: Medium-high.**

The original alias need ended when the private speech-core workspace-package architecture was removed and its callers were migrated to core-relative or current host plugin-SDK routes. Static source, package metadata, build configuration, loader policy, and tests all agree on that ownership. Confidence is not high because the proposal-mandated generated build/export checks and clean-checkout first-reply smoke were intentionally excluded from this investigation; those remain promotion proof rather than a reason to retain the old alias.
