# Final Note: swift-wave-1565

## Removed

- Deleted `extensions/deliberation/src/config-compat.ts`, including the cutoff, legacy schemas, doctor rules, generated pipeline IDs, global target translation, and compatibility normalizer.
- Deleted `extensions/deliberation/src/config-compat.test.ts` and `extensions/deliberation/doctor-contract-api.ts`.
- Removed the command-line intake producer's `routes.sources` translation. Producer input now accepts only canonical `pipelines` and rejects the former route shape.
- Removed the expired migration instructions from `extensions/deliberation/README.md` and `docs/plugins/reference/deliberation.md`.
- Replaced `test/scripts/deliberation-doctor-package.e2e.test.ts` with `test/scripts/deliberation-package.e2e.test.ts`. OR-22 now validates canonical packaged config, rejects retired keys without mutation, and retains the installed five-hook/one-final-service startup proof.
- Renamed the OR-22 selector in the full gate and ledger while preserving its ID and package command ownership.
- Updated bundled-plugin inventory behavior to ignore tracked source paths absent from the working tree, preventing deletion-first builds from emitting a nonexistent sidecar.

## Canonical Behavior

- `pipelines` remains the sole parser and manifest authority.
- Canonical source-default targets, explicit Discord and Slack targets, startup registration, intake, and final delivery are unchanged and covered by focused tests.
- Parser and installed-package tests require validation diagnostics to name unsupported `sources` and top-level `deliveryTarget` keys. Package fixtures remain byte-identical after failed validation and contain no generated `v1:` pipeline IDs.

## Retained Artifacts

- Retained `extensions/deliberation/contracts/history-read-v1.json` and `extensions/deliberation/contracts/history-read-v2.json` as distinct protocol artifacts.
- `extensions/deliberation/src/history-read.ts:50` has separate closed request branches for schema versions 1 and 2.
- `extensions/deliberation/src/history-read.test.ts:53` and `extensions/deliberation/src/history-read.test.ts:222` exercise both request versions.
- `extensions/deliberation/src/contract.test.ts:71` directly reads and pins `history-read-v2.json`. Repository-local runtime and test evidence therefore disproves treating the pair as unused generated residue; the protocols were not merged.

## Verification

- TDD RED: `pnpm test test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose` failed as expected with 1 failed and 15 passed because the retired sidecar remained in build inventory.
- TDD GREEN: the same command passed with 16 tests. Evidence: `plans/checkpoints/swift-wave-1565.red-green-proof.md`.
- `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/final-adapter.test.ts test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`: PASS, 180 passed and 1 intentional OR-23 skip across two shards.
- `pnpm build`: PASS.
- `node scripts/package-openclaw-for-docker.mjs --skip-build --output-dir "/Users/michal/.openclaw/tmp/opencode/swift-wave-1565/package" --output-name openclaw-current.tgz`: PASS, tarball integrity passed.
- `OPENCLAW_CURRENT_PACKAGE_TGZ="/Users/michal/.openclaw/tmp/opencode/swift-wave-1565/package/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-package.e2e.test.ts -- --reporter=verbose`: PASS, 1 test.
- `node scripts/run-oxlint.mjs extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/config.test.ts scripts/deliberation-full-gate.ts scripts/lib/deliberation-full-gate-ledger.ts scripts/lib/bundled-plugin-build-entries.mjs test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts test/scripts/deliberation-package.e2e.test.ts`: PASS.
- `pnpm format:check -- extensions/deliberation/scripts/intake-producer.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/config.test.ts scripts/deliberation-full-gate.ts scripts/lib/deliberation-full-gate-ledger.ts scripts/lib/bundled-plugin-build-entries.mjs test/scripts/bundled-plugin-build-entries.test.ts test/scripts/deliberation-full-gate.test.ts test/scripts/deliberation-package.e2e.test.ts extensions/deliberation/README.md docs/plugins/reference/deliberation.md`: initial formatting-only failure in the package E2E, then PASS after `pnpm format -- test/scripts/deliberation-package.e2e.test.ts`.
- `pnpm tsgo:extensions`: PASS.
- `pnpm tsgo:extensions:test`: PASS.
- `pnpm docs:check-mdx`: PASS, 682 files.
- `pnpm docs:check-links`: PASS, 4,447 internal links and 0 broken links.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: PASS, Codex reported no accepted/actionable findings.

No deployment, Gateway restart, live configuration mutation, external repository inspection, or direct git command was performed.
