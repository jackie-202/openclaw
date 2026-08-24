# Plan 2026-08-23: Ship and verify OpenClaw Deliberation doctor migration package

Track the audited migration sidecar, prove it through an installed package, and align built-runtime verification with the canonical five-hook plugin.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/doctor-contract-api.ts`, `extensions/deliberation/src/config-compat.ts`, `extensions/deliberation/src/config-compat.test.ts`, and `test/scripts/deliberation-doctor-package.e2e.test.ts` are untracked blobs matching audited orphan commit `97e3f8c235dbdb5b616cf4e942f7d6bd6b7024b0`; preserve their semantics unless installed execution finds a defect.
- `scripts/lib/bundled-plugin-build-entries.mjs:137-173` selects top-level plugin entries from `git ls-files`, so source presence and `pnpm build` are insufficient until `./doctor-contract-api.ts` enters the tracked inventory.
- `src/plugins/doctor-contract-registry.ts:104-118,290-333,434-456` already discovers and applies top-level doctor contracts; `src/commands/doctor/shared/channel-legacy-config-migrate.ts:79-87` is the installed CLI call path. No generic registry change is indicated.
- `extensions/deliberation/src/config-compat.ts:68-136` deterministically maps legacy `sources`/`deliveryTarget`, validates the complete canonical result through `parseDeliberationConfig`, and returns no mutation for mixed, malformed, duplicate, or overlapping authority.
- `extensions/deliberation/openclaw.plugin.json:5-11` and `extensions/deliberation/index.ts:140-149` define five hooks, including `inbound_event_policy`; `scripts/test-built-plugin-singleton.mjs:215-245` is stale at four while `src/plugins/source-checkout-runtime.test.ts:48-106` already proves five.
- `test/scripts/deliberation-doctor-package.e2e.test.ts` installs a real tarball under a temporary prefix and isolates `HOME`, state, config, OAuth, and bundled-plugin paths before invoking packaged `openclaw.mjs`.

### Relevant documentation

- `plans/investigations/warm-vale-4978_audit-warm-cove-4137-remediation-completeness-and-rollout-readiness.md:34-36,47-54,62-64` is the authoritative gap ledger: untracked sidecar, omitted emitted file, package proof absent, and singleton `5 !== 4`.
- `plans/tasks/2026-08-23_ship-and-verify-openclaw-deliberation-doctor-migration-packa.md:21-42` requires the exact named OR-22 leaf and excludes KM, live configuration, Gateway, provider, and deployment actions.

### Knowledge base

- `learnings/build-errors/warm-cove-4137-build-success-can-omit-untracked-plugin-artifacts.md`: assert tracked inventory and emitted output, not build success alone.
- `learnings/test-failures/cool-reef-8673-package-migration-tests-execute-installed-artifact.md`: install the real tarball, isolate all state paths, invoke packaged doctor, and use the same package-test command for RED/GREEN.
- `learnings/test-failures/cool-reef-8673-doctor-refusal-and-quarantine.md`: exact no-mutation belongs in the normalizer test; package proof must assert no migration was reported or synthesized because generic doctor may quarantine invalid config.
- `learnings/patterns/calm-cove-1824-validate-the-complete-canonical-result-after-migration.md`: permit writeback only after full canonical validation.
- `learnings/patterns/wild-vale-0017-assert-built-and-source-plugin-singleton-behavior-separately.md`: retain both source and emitted-runtime hook/service assertions.
- Recall backend: local fallback; collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: capture authentic identical-command package RED/GREEN evidence.
- `validate-implementation`: check the completed package/config changes against repository architecture and task scope.
- `save-learning`: run last and save at least one implementation learning.

## Implementation

1. Invoke `skill:tdd`. Rename the installed-package test to exactly `OR-22 doctor-package-writeback-built-five-hook-runtime`, package the pre-fix tracked inventory to a fixed tarball path, and capture RED from the canonical runner showing the installed sidecar is absent.
2. Add the audited doctor API, normalizer, focused test, and package E2E to Git tracking before building. Confirm all four with `git ls-files --error-unmatch`; do not recreate migration behavior or add runtime legacy acceptance.
3. Add a focused assertion in `test/scripts/bundled-plugin-build-entries.test.ts` that Deliberation contributes `extensions/deliberation/doctor-contract-api` and packs `dist/extensions/deliberation/doctor-contract-api.js`.
4. Keep package OR-22 coverage for installed sidecar presence, packaged doctor discovery/execution, deterministic canonical writeback, byte-identical second doctor run, installed canonical validation/plugin discovery, and fail-closed mixed/malformed/ambiguous cases. Preserve focused exact no-mutation assertions.
5. Add `inbound_event_policy` first in `expectedDeliberationHooks` in `scripts/test-built-plugin-singleton.mjs`; retain exact five-hook ordering and the sole `deliberation-final-delivery` service assertion. Do not remove a runtime hook.
6. Build and probe the selected source entry plus `dist`/`dist-runtime` outputs. Repack the same tarball path and capture GREEN with the identical OR-22 test command, then run source and built singleton verification.
7. Run scoped static checks and `validate-implementation`; run the mandatory fresh autoreview and resolve accepted findings. Inspect the full task-owned diff and non-test LOC before committing only intended files with `scripts/committer`; do not push or touch unrelated worktree changes.
8. Write `plans/checkpoints/cool-cove-3068.final-note.md` with tracked/emitted file lists, exact commands/results, named OR-22 result, writeback/idempotence proof, and five-hook evidence. Invoke `skill:save-learning` as the final action and save at least one learning file.

## Files to Modify

| File                                                   | Change                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `extensions/deliberation/doctor-contract-api.ts`       | Track the narrow doctor contract export.                                          |
| `extensions/deliberation/src/config-compat.ts`         | Track the audited bounded normalizer; alter only for a reproduced package defect. |
| `extensions/deliberation/src/config-compat.test.ts`    | Track canonical writeback and exact refusal tests.                                |
| `test/scripts/bundled-plugin-build-entries.test.ts`    | Assert Deliberation source-entry and packed-sidecar inventory.                    |
| `test/scripts/deliberation-doctor-package.e2e.test.ts` | Materialize named OR-22 and execute the isolated installed package.               |
| `scripts/test-built-plugin-singleton.mjs`              | Expect the canonical ordered five-hook contract.                                  |
| `plans/checkpoints/cool-cove-3068.red-green-proof.md`  | Record identical-command package RED/GREEN.                                       |
| `plans/checkpoints/cool-cove-3068.final-note.md`       | Record completion evidence and explicit exclusions.                               |

## TDD

Implement the RED/GREEN cycle with `skill:tdd`; write evidence to `plans/checkpoints/cool-cove-3068.red-green-proof.md`.

**Test file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`  
**Framework:** Vitest through the repository `pnpm test` runner, spawning the installed CLI  
**Run command:** `OPENCLAW_CURRENT_PACKAGE_TGZ="$HOME/.openclaw/tmp/opencode/cool-cove-3068/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`  
**Edit hint:** Rename the existing `it(...)` at line 74 before changing tracked/build state; retain its helpers and assertions.

```ts
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("OR-22 doctor-package-writeback-built-five-hook-runtime", () => {
  const tarball = process.env.OPENCLAW_CURRENT_PACKAGE_TGZ;
  if (!tarball) throw new Error("OPENCLAW_CURRENT_PACKAGE_TGZ is required");

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-doctor-"));
  try {
    const prefix = path.join(root, "prefix");
    const install = spawnSync(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", prefix, tarball],
      { encoding: "utf8", timeout: 180_000 },
    );
    expect(install.status, install.stderr).toBe(0);
    const sidecar = path.join(
      prefix,
      "node_modules/openclaw/dist/extensions/deliberation/doctor-contract-api.js",
    );
    expect(fs.existsSync(sidecar), `missing packaged doctor contract: ${sidecar}`).toBe(true);
    // RED: pre-fix git-derived build inventory omits the sidecar.
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
```

| Test                        | RED                                            | GREEN                                                                                    |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| OR-22 installed artifact    | Packaged sidecar assertion fails.              | Installed package contains and loads `doctor-contract-api.js`.                           |
| OR-22 writeback/idempotence | Doctor cannot invoke the omitted normalizer.   | Canonical pipelines are written once; second run is byte-stable.                         |
| OR-22 refusal/startup       | No installed migration path exists.            | Invalid authority is not guessed; canonical validation/discovery and built startup pass. |
| Five-hook singleton         | `pnpm test:build:singleton` reports `5 !== 4`. | Built plugin exposes the ordered five hooks and one final-delivery service.              |

## Verification

1. Create/recreate the fixed tarball with `node scripts/package-openclaw-for-docker.mjs --output-dir "$HOME/.openclaw/tmp/opencode/cool-cove-3068" --output-name openclaw-current.tgz`; use the TDD command above unchanged for RED and GREEN.
2. Run focused behavior: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/config-compat.test.ts src/plugins/doctor-contract-registry.test.ts src/plugins/doctor-contract-registry.load-paths.test.ts src/commands/doctor/shared/channel-legacy-config-migrate.test.ts src/plugins/source-checkout-runtime.test.ts test/scripts/bundled-plugin-build-entries.test.ts -- --reporter=verbose`.
3. Run `pnpm build`, then probe with `node --input-type=module -e "import fs from 'node:fs'; import { collectBundledPluginBuildEntries } from './scripts/lib/bundled-plugin-build-entries.mjs'; const entry=collectBundledPluginBuildEntries().find((item)=>item.id==='deliberation'); console.log(JSON.stringify({sourceEntries:entry?.sourceEntries,distDoctor:fs.existsSync('dist/extensions/deliberation/doctor-contract-api.js'),runtimeDoctor:fs.existsSync('dist-runtime/extensions/deliberation/doctor-contract-api.js')}));"`; require `./doctor-contract-api.ts` and both booleans `true`.
4. Repack and run OR-22 through the TDD command, then run `pnpm test:build:singleton`.
5. Run `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, and `pnpm tsgo:core:test` sequentially.
6. Run scoped Oxlint for the touched extension files and separately for touched script/test files with `node scripts/run-oxlint.mjs`; run `pnpm format:check -- <touched-files>` and `git diff --check`.

## Constraints

- Preserve the accepted Deliberation contract mirror and canonical-only runtime parser; no KM or contract semantic edits.
- No live installation link, live config/state access, Gateway start/restart, deployment, spool access, provider send, or pilot activation.
- Package proof is valid only when the tarball is installed under an isolated prefix and the installed `openclaw.mjs` executes against packaged `dist/extensions`.
