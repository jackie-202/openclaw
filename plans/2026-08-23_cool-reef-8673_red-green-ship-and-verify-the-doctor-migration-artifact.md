# Plan 2026-08-23: RED-GREEN doctor migration artifact

Prove the missing built migration, restore the canonical doctor-owned migration path, and verify it through the packaged CLI without touching live state.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `scripts/lib/bundled-plugin-build-entries.mjs:137-173` derives bundled plugin entries from `git ls-files`; the untracked `extensions/deliberation/doctor-contract-api.ts` and `src/config-compat*.ts` are therefore absent from the successful built artifact.
- `src/plugins/doctor-contract-registry.ts:104-119,290-369,434-456` discovers top-level `doctor-contract-api` modules and applies plugin-owned normalizers; `src/commands/doctor/shared/channel-legacy-config-migrate.ts:56-92` is the real doctor call path.
- `extensions/deliberation/src/config-compat.ts:68-136` already maps legacy sources deterministically, removes legacy keys, validates the complete canonical result, and refuses mixed/malformed/duplicate routes by returning no mutation.
- `extensions/deliberation/src/config-compat.test.ts` imports the untracked source directly, so it proves helper behavior but not tracked build selection, package contents, registry discovery, CLI writeback, or idempotence.
- `extensions/deliberation/src/config.ts:108-166`, `extensions/deliberation/src/config.test.ts:47-220`, and `openclaw.plugin.json:15-130` keep startup canonical-only and reject duplicate routes, processing overlap, and unsupported `inheritThread`.
- `scripts/package-openclaw-for-docker.mjs` owns the build, inventory, pack, and tarball-check sequence used by package E2E; the packaged launcher can be isolated with `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, and its packaged bundled-plugin root.

### Relevant documentation

- `plans/investigations/warm-cove-4137_audit-openclaw-deliberation-remediation-and-rollout-safety.md:30,39-40,52` records the authentic omission and requires a temporary-config packaged CLI migration plus canonical startup proof.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` owns the single-authority migration requirement.
- Root and scoped `AGENTS.md` require plugin-owned migration through `doctor-contract-api`, canonical-only runtime parsing, package/build proof, focused tests, fresh autoreview, and no live-state mutation.

### Knowledge base

- `learnings/build-errors/warm-cove-4137-build-success-can-omit-untracked-plugin-artifacts.md`: inspect `git ls-files`, collected entries, built output, and runtime discovery; a green build alone is insufficient.
- `learnings/patterns/calm-cove-1824-validate-the-complete-canonical-result-after-migration.md`: transform once, validate the entire destination shape, and refuse partial writeback.
- `learnings/tooling/calm-cove-1824-do-not-advertise-changes-when-migration-refuses-writeback.md`: rejected mixed/malformed input must remain unchanged with no false mutation report.
- `learnings/test-failures/calm-cove-1824-tdd-proof-must-use-the-identical-behavioral-command.md`: preserve fresh RED and GREEN from the same package-CLI command.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove discovery and invocation, not file presence alone.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: execute the required RED-GREEN cycle and preserve proof.
- `openclaw-testing`: select focused, package, build, and canonical gate commands.
- `autoreview`: perform the mandatory fresh pre-handoff review after implementation.
- `save-learning`: record implementation findings as the final action.

## Solution

Track the existing Deliberation doctor contract and normalizer without changing the generic registry. Add one package-gated integration test that installs the repository tarball, points every config/state/home path at a temporary directory, invokes the installed `openclaw.mjs doctor --fix`, and then invokes installed `config validate`. The same test must prove package presence, discovery/writeback, refusal cases, idempotence, and canonical-only startup validation.

## Implementation

1. Invoke `skill:tdd`; create `plans/checkpoints/cool-reef-8673.red-green-proof.md` and the package CLI test below before changing tracking/build state.
2. Build and pack the current checkout with `node scripts/package-openclaw-for-docker.mjs --output-dir /Users/michal/.openclaw/tmp/opencode/cool-reef-8673-red --output-name openclaw-current.tgz`; run the exact targeted test command and preserve authentic RED showing the installed package lacks `dist/extensions/deliberation/doctor-contract-api.js` and leaves legacy config unmigrated.
3. Review the existing normalizer against the package test. Keep `extensions/deliberation/doctor-contract-api.ts` as the narrow top-level export and `src/config-compat.ts` as the plugin-owned implementation; change behavior only if the real CLI exposes a concrete contract defect.
4. Stage the three migration source/test files so `git ls-files extensions/deliberation` includes them. Assert `collectBundledPluginBuildEntries()` selects `./doctor-contract-api.ts`, then rebuild and require `dist/extensions/deliberation/doctor-contract-api.js`.
5. Extend the package test with isolated fixtures: valid legacy config becomes deterministic `pipelines`; a second doctor run leaves bytes unchanged; mixed authority, duplicate sources, processing-source overlap, and unsupported `inheritThread` remain unchanged and fail installed `config validate`; migrated config passes installed `config validate` and plugin discovery. Never invoke `gateway run`.
6. Repack to `/Users/michal/.openclaw/tmp/opencode/cool-reef-8673-green/openclaw-current.tgz`; rerun the identical targeted command and append GREEN output. Run the focused source/doctor suites, build, tarball checker, targeted lint/format, and the canonical `npm test` gate.
7. Run fresh `skill:autoreview`, resolve every accepted/actionable finding, rerun affected proof, inspect `git diff --numstat`, and keep unrelated dirty-worktree files untouched.

## Files to Modify

| File                                                   | Change                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `extensions/deliberation/doctor-contract-api.ts`       | Track the top-level doctor discovery surface                                    |
| `extensions/deliberation/src/config-compat.ts`         | Track the plugin-owned bounded normalizer; edit only for package-CLI defects    |
| `extensions/deliberation/src/config-compat.test.ts`    | Track focused migration and canonical-invariant tests                           |
| `test/scripts/deliberation-doctor-package.e2e.test.ts` | Add installed-tarball CLI migration, refusal, idempotence, and validation proof |
| `plans/checkpoints/cool-reef-8673.red-green-proof.md`  | Record identical-command RED/GREEN and final gates                              |

## TDD

Implement the cycle with `skill:tdd`; write evidence to `plans/checkpoints/cool-reef-8673.red-green-proof.md`.

**Test file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`  
**Framework:** Vitest plus installed package child processes  
**Run command:** `OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/cool-reef-8673-red/openclaw-current.tgz pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`

```ts
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

function makeLegacyConfig() {
  return {
    plugins: {
      entries: {
        deliberation: {
          enabled: true,
          config: {
            enabled: true,
            failClosed: true,
            sources: [{ channel: "discord", accountId: "acct", target: "source" }],
            processingSource: { channel: "discord", accountId: "acct", target: "processing" },
            km: {
              endpoint: "https://km.invalid",
              credential: { source: "env", provider: "default", id: "KM_TOKEN" },
              requestTimeoutMs: 1000,
            },
            restrictedSessionKeys: ["agent:reviewer"],
          },
        },
      },
    },
  };
}

function isolatedOpenClawEnv(root: string, configPath: string, packageRoot: string) {
  return {
    ...process.env,
    HOME: root,
    KM_TOKEN: "test-only",
    OPENCLAW_STATE_DIR: path.join(root, "state"),
    OPENCLAW_CONFIG_PATH: configPath,
    OPENCLAW_OAUTH_DIR: path.join(root, "oauth"),
    OPENCLAW_BUNDLED_PLUGINS_DIR: path.join(packageRoot, "dist", "extensions"),
  };
}

function readPluginConfig(configPath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(configPath, "utf8")).plugins.entries.deliberation.config;
}

it("migrates Deliberation legacy config through the packaged CLI", () => {
  const tarball = process.env.OPENCLAW_CURRENT_PACKAGE_TGZ;
  if (!tarball) throw new Error("OPENCLAW_CURRENT_PACKAGE_TGZ is required");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-doctor-"));
  const prefix = path.join(root, "prefix");
  expect(
    spawnSync("npm", ["install", "--ignore-scripts", "--prefix", prefix, tarball]).status,
  ).toBe(0);
  const packageRoot = path.join(prefix, "node_modules", "openclaw");
  const contract = path.join(
    packageRoot,
    "dist",
    "extensions",
    "deliberation",
    "doctor-contract-api.js",
  );
  expect(fs.existsSync(contract)).toBe(true); // RED: tracked build omits this artifact.

  const configPath = path.join(root, "openclaw.json");
  fs.writeFileSync(configPath, JSON.stringify(makeLegacyConfig()));
  const env = isolatedOpenClawEnv(root, configPath, packageRoot);
  const result = spawnSync(
    process.execPath,
    [path.join(packageRoot, "openclaw.mjs"), "doctor", "--fix", "--non-interactive"],
    { env, encoding: "utf8" },
  );
  expect(result.status, result.stderr).toBe(0);
  expect(readPluginConfig(configPath)).toMatchObject({
    pipelines: [{ id: "v1:discord:acct:source" }],
  });
  expect(readPluginConfig(configPath)).not.toHaveProperty("sources");
});
```

| Test                                 | RED                                         | GREEN                                                                |
| ------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------- |
| Package artifact and valid migration | Contract file absent; legacy config remains | Installed CLI writes deterministic canonical pipelines               |
| Mixed authority                      | Package cannot invoke the plugin normalizer | Doctor leaves input untouched; installed validator rejects it        |
| Idempotence                          | First migration never occurs                | Second doctor run is byte-stable and reports no migration            |
| Canonical invariants                 | Only source-helper tests cover negatives    | Installed CLI rejects duplicate routes, overlap, and `inheritThread` |
| Canonical validation                 | No migrated package output exists           | Installed `config validate` and plugin discovery succeed             |

Focused GREEN: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/config-compat.test.ts src/plugins/doctor-contract-registry.test.ts src/plugins/doctor-contract-registry.load-paths.test.ts src/commands/doctor/shared/channel-legacy-config-migrate.test.ts -- --reporter=verbose`.

## Dependencies

- Existing generic doctor contract registry and package builder; no new core API or runtime legacy fallback.
- Temporary roots under `/Users/michal/.openclaw/tmp/opencode`; tests explicitly override `HOME`, `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, `OPENCLAW_OAUTH_DIR`, and `OPENCLAW_BUNDLED_PLUGINS_DIR`.
- Verification: `pnpm build`; `node scripts/check-openclaw-package-tarball.mjs <green-tarball>`; targeted `node scripts/run-oxlint.mjs` and `pnpm format:check <touched-files>`; canonical `npm test`; changed gate selected through `skill:openclaw-testing`/Testbox if local scope fans out.
- No live configuration reads/writes, Gateway start/restart, deployment, credentials, or KM access.
