# Plan 2026-09-07: Deliberation plugin legacy config removal

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Repository research
- [x] Phase 2: Knowledge review
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/config.ts:108-166` is already strict and canonical: it requires non-empty `pipelines`, enforces unique IDs/sources and processing-source separation, and rejects unknown top-level keys before `index.ts:105-111` registers the plugin.
- `extensions/deliberation/openclaw.plugin.json:15-129` already publishes only canonical `pipelines`; `extensions/deliberation/src/config.test.ts:47-84` already proves canonical parsing and generic legacy rejection.
- The obsolete lifecycle is isolated in `extensions/deliberation/src/config-compat.ts`, its test, and `extensions/deliberation/doctor-contract-api.ts`; build inventory and `test/scripts/bundled-plugin-build-entries.test.ts:71-79` intentionally package that sidecar today.
- `test/scripts/deliberation-doctor-package.e2e.test.ts` mixes obsolete doctor migration fixtures with still-useful installed-package canonical validation and five-hook/one-service startup proof. `scripts/deliberation-full-gate.ts:273-291` and `scripts/lib/deliberation-full-gate-ledger.ts:6-35` bind OR-22 to that file and selector, so they must move to a canonical package leaf rather than leave a dead migration gate.
- Canonical intake and delivery regression coverage lives in `extensions/deliberation/src/hooks.test.ts`, `extensions/deliberation/src/plugin.test.ts`, and `extensions/deliberation/src/final-adapter.test.ts`.
- `extensions/deliberation/contracts/history-read-v2.json` is read by `extensions/deliberation/src/contract.test.ts:70-86`; both v1 and v2 are implemented in `extensions/deliberation/src/history-read.ts:50-76,350-672` and tested in `history-read.test.ts`/`orchestration.test.ts`. Retain both distinct protocol artifacts.

### Relevant documentation

- `extensions/deliberation/README.md:73-157` and `docs/plugins/reference/deliberation.md:45-104` describe canonical pipelines correctly but still advertise the expired doctor migration; remove only those compatibility paragraphs.
- `pnpm docs:list` identifies `docs/plugins/reference/deliberation.md` as the current public Deliberation configuration reference.

### Knowledge base

- `learnings/architecture/2026-08-22_verify-tag-contents-before-defining-a-compatibility-cutoff.md`: no release through the recorded cutoff shipped the plugin; do not preserve a public compatibility contract inferred from worktree history.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: classify residue through imports, packaging, registration, and callers; repository-local protocol use is enough to retain the history snapshots.
- `learnings/patterns/dark-crag-9860-reject-retired-configuration-keys-explicitly.md`: rejection must be observable. Here the strict canonical Zod object can provide key-specific `Unrecognized key` diagnostics without keeping retired fields in production schema code.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; the fallback completed successfully.

## Available Skills

- `tdd`: capture the deletion-first RED/GREEN proof.
- `openclaw-testing`: choose narrow source, package, and build verification lanes.
- `technical-documentation`: keep README and Mintlify reference wording aligned with current behavior.
- `autoreview`: mandatory fresh pre-handoff review after implementation.

## Approach

Delete the plugin-owned doctor lifecycle and all callers that exist only to package or prove it. Keep the strict canonical parser and manifest as the single authority, strengthen rejection assertions around their existing unknown-key errors, and convert the packaged OR-22 check from migration/writeback proof into canonical config validation plus installed runtime registration proof.

## Implementation

1. Use `skill:tdd` to add the build-inventory RED assertion below and capture the failing result before deleting production compatibility files.
2. Delete `extensions/deliberation/src/config-compat.ts`, `extensions/deliberation/src/config-compat.test.ts`, and `extensions/deliberation/doctor-contract-api.ts`; this removes the cutoff constant, legacy schemas/rules, generated pipeline IDs, global-target translation, and doctor normalizer/export in one step.
3. Remove the command-line producer's `routes.sources` translation block from `extensions/deliberation/scripts/intake-producer.ts` so stdin is parsed only through its canonical `pipelines` schema; add a focused rejection case to its test without changing canonical intake behavior.
4. Tighten `extensions/deliberation/src/config.test.ts` to assert that `sources` and top-level `deliveryTarget` fail with key-specific validation messages, while retaining canonical omitted/per-pipeline target coverage and manifest alignment assertions.
5. Replace the Deliberation doctor package E2E with `test/scripts/deliberation-package.e2e.test.ts`: install the tarball, write canonical pipeline config, run `config validate`, assert legacy-only and mixed fixtures fail without mutation, and retain the installed five-hook/one-final-service runtime probe. Remove all doctor writeback, generated-ID, cutoff, and idempotent-migration fixtures.
6. Update `test/scripts/bundled-plugin-build-entries.test.ts`, `scripts/deliberation-full-gate.ts`, and `scripts/lib/deliberation-full-gate-ledger.ts` so no Deliberation doctor sidecar is built and OR-22 targets the renamed canonical package test/selector. Adjust `test/scripts/deliberation-full-gate.test.ts` only where the renamed selector is asserted.
7. Remove the expired migration paragraphs from `extensions/deliberation/README.md` and `docs/plugins/reference/deliberation.md`; leave their canonical pipeline examples and source-default/per-pipeline delivery semantics unchanged.
8. Re-run repository search over active Deliberation source, current docs, tests, build inventory, and gate code. Allow `sources` only as ordinary domain wording/test input proving rejection and `deliveryTarget` only in the distinct KM wire/durable-delivery contract, not as a top-level plugin config key.
9. Retain `extensions/deliberation/contracts/history-read-v1.json` and `history-read-v2.json`; record that v2 is directly contract-tested and both versions have distinct live handlers/tests, so repository-local evidence disproves generated-residue deletion.
10. Run `skill:autoreview` after implementation and fixes, then write `plans/checkpoints/swift-wave-1565.final-note.md` with exact deletions, retained protocol artifacts/evidence, commands, and outcomes.

## Files to Modify

| Path                                                      | Action                                                           |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `extensions/deliberation/src/config-compat.ts`            | Delete doctor-only legacy normalization.                         |
| `extensions/deliberation/src/config-compat.test.ts`       | Delete compatibility-only tests.                                 |
| `extensions/deliberation/doctor-contract-api.ts`          | Delete obsolete doctor sidecar export.                           |
| `extensions/deliberation/scripts/intake-producer.ts`      | Remove noncanonical route/source translation.                    |
| `extensions/deliberation/scripts/intake-producer.test.ts` | Prove noncanonical producer input is rejected.                   |
| `extensions/deliberation/src/config.test.ts`              | Assert canonical success and clear retired-key failures.         |
| `test/scripts/bundled-plugin-build-entries.test.ts`       | Require no Deliberation doctor build/package artifact.           |
| `test/scripts/deliberation-doctor-package.e2e.test.ts`    | Rename and reduce to canonical package validation/startup proof. |
| `scripts/deliberation-full-gate.ts`                       | Point OR-22 at the canonical package leaf.                       |
| `scripts/lib/deliberation-full-gate-ledger.ts`            | Rename the OR-22 selector while preserving gate identity/order.  |
| `test/scripts/deliberation-full-gate.test.ts`             | Align selector assertions if needed.                             |
| `extensions/deliberation/README.md`                       | Remove current migration instructions.                           |
| `docs/plugins/reference/deliberation.md`                  | Remove current migration instructions.                           |

No change is planned for `extensions/deliberation/openclaw.plugin.json`, which is already canonical-only, or either history-read contract.

## TDD

Implement the RED/GREEN cycle with `skill:tdd` and save evidence to `plans/checkpoints/swift-wave-1565.red-green-proof.md`.

**Test file:** `test/scripts/bundled-plugin-build-entries.test.ts`  
**Run command:** `pnpm test test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose`  
**Edit hint:** Replace the current positive Deliberation doctor-sidecar test before deleting the sidecar.

```ts
import { expect, it } from "vitest";
import {
  listBundledPluginBuildEntries,
  listBundledPluginPackArtifacts,
} from "../../scripts/lib/bundled-plugin-build-entries.mjs";

it("omits the retired Deliberation doctor compatibility sidecar", () => {
  const entries = listBundledPluginBuildEntries();
  const artifacts = listBundledPluginPackArtifacts();

  // RED: the sidecar is still present in both inventories before removal.
  expect(entries).not.toHaveProperty("extensions/deliberation/doctor-contract-api");
  expect(artifacts).not.toContain("dist/extensions/deliberation/doctor-contract-api.js");
});
```

| Test                                 | RED                                                         | GREEN                                                                                 |
| ------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Deliberation doctor sidecar omission | Build entry/artifact assertions find the existing sidecar.  | Both inventories omit it after source deletion.                                       |
| Retired config rejection             | Existing generic assertion does not prove the reported key. | Parser and packaged validation name the unsupported key and do not mutate input.      |
| Canonical package startup            | Migration fixture is the package setup authority.           | Canonical fixture validates and registers five hooks plus one final-delivery service. |

## Verification

1. `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/final-adapter.test.ts test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
2. `pnpm build`
3. `node scripts/package-openclaw-for-docker.mjs --skip-build --output-dir "$HOME/.openclaw/tmp/opencode/swift-wave-1565/package" --output-name openclaw-current.tgz`
4. `OPENCLAW_CURRENT_PACKAGE_TGZ="$HOME/.openclaw/tmp/opencode/swift-wave-1565/package/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-package.e2e.test.ts -- --reporter=verbose`
5. `node scripts/run-oxlint.mjs extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/config.test.ts scripts/deliberation-full-gate.ts scripts/lib/deliberation-full-gate-ledger.ts test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts test/scripts/deliberation-package.e2e.test.ts`
6. `pnpm format:check -- extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/config.test.ts scripts/deliberation-full-gate.ts scripts/lib/deliberation-full-gate-ledger.ts test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts test/scripts/deliberation-package.e2e.test.ts extensions/deliberation/README.md docs/plugins/reference/deliberation.md`
7. `pnpm tsgo:extensions`
8. `pnpm tsgo:extensions:test`
9. `pnpm docs:check-mdx`
10. `pnpm docs:check-links`

## Dependencies

- No external repository or dependency contract is changed.
- Preserve the existing canonical Zod parser, plugin manifest, KM wire target, and history-read v1/v2 protocol contracts.

Do not run the deployment, restart the Gateway, mutate live configuration, inspect external repositories, or invoke direct git commands.

---

_Created: 2026-09-07_  
_Status: DRAFT_
