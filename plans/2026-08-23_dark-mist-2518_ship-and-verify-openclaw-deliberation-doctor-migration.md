# Plan 2026-08-23: Close OR-22 five-hook singleton coverage

Extend the existing package acceptance leaf with direct installed-runtime registration proof; do not repeat the completed migration/package work.

## Analysis

- `test/scripts/deliberation-doctor-package.e2e.test.ts:74-218` is the named OR-22 leaf, but currently stops after package presence, doctor writeback/idempotence, validation, discovery, and refusal assertions.
- `scripts/test-built-plugin-singleton.mjs:215-246` already proves the emitted runtime registers ordered hooks `inbound_event_policy`, `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending` and exactly one `deliberation-final-delivery` service. Retain this standalone smoke unchanged.
- `src/plugins/build-smoke-entry.ts:1-13` exposes `loadOpenClawPlugins`; the installed package contains its built `dist/plugins/build-smoke-entry.js`, so OR-22 can inspect the installed runtime without adding production exports.
- Parent commits `ee0cc3b2b82`, `de86dca21b4`, and `19f39b5e17d` already completed and verified the doctor sidecar/package work. Preserve those changes.
- `plans/tasks/2026-08-23_followup-dark-mist-2518-ship-and-verify-openclaw-deliberation-doctor-migration-packa.md:10-27` is the acceptance requirement. No product docs or runtime code changes are needed.

## Knowledge Base

- `learnings/build-errors/cool-cove-3068-git-inventory-installed-package-proof.md`: package proof must execute artifacts installed from the tarball, not source checkout modules.
- `learnings/patterns/wild-vale-0017-assert-built-and-source-plugin-singleton-behavior-separately.md`: keep source/runtime and built singleton assertions separate; this fix adds the required package-leaf assertion without deleting either existing proof.
- `plans/checkpoints/cool-cove-3068.red-green-proof.md` contains the authentic historical package RED. Per the follow-up task, link it rather than manufacturing a new RED after implementation exists.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; returned generic Deliberation learnings added no stronger task-specific rule.

## Available Skills

- `tdd`: preserve the parent RED provenance and capture fresh follow-up GREEN evidence.
- `task-evidence`: use only if exact parent command/outcome provenance cannot be transcribed from the existing proof.
- `validate-implementation`: verify the final test-only diff remains within the acceptance boundary.
- `autoreview`: run the mandatory fresh pre-close review.
- `save-learning`: run last after implementation and save at least one learning.

## Implementation

1. Invoke `skill:tdd`; create `plans/checkpoints/dark-mist-2518.red-green-proof.md` that links the genuine RED in `plans/checkpoints/cool-cove-3068.red-green-proof.md` and explicitly states why no synthetic follow-up RED is created.
2. In the existing OR-22 body, write a temporary ESM probe that imports the installed package's `dist/plugins/build-smoke-entry.js`, loads only `deliberation` from the installed `dist/extensions`, and prints the loaded plugin status, Deliberation hook names, and Deliberation service IDs as JSON.
3. Spawn the probe with the existing isolated environment and canonical migrated plugin config; require a successful child exit before parsing its final JSON output.
4. Assert inside the named OR-22 leaf that hooks equal the exact five-item ordered array and services equal only `["deliberation-final-delivery"]`. Keep all migration/refusal assertions and `scripts/test-built-plugin-singleton.mjs` unchanged.
5. Build, repack to a task-specific tarball, run the named OR-22 test for fresh GREEN, and rerun the standalone singleton smoke.
6. Run scoped lint/format checks, `validate-implementation`, and fresh `autoreview`; resolve accepted findings without expanding production scope. Record exact fresh commands/outcomes in the follow-up proof/checkpoint.
7. Invoke `skill:save-learning` as the final implementation action and save at least one learning file.

## Files to Modify

| File                                                   | Change                                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `test/scripts/deliberation-doctor-package.e2e.test.ts` | Add installed-runtime probe and exact five-hook/one-service assertions to OR-22. |
| `plans/checkpoints/dark-mist-2518.red-green-proof.md`  | Link authentic parent RED and capture fresh follow-up GREEN.                     |
| `learnings/<category>/<dark-mist-2518-learning>.md`    | Save the required acceptance-testing learning last.                              |

## TDD

Implement the evidence-preserving cycle with `skill:tdd`. Do not fabricate a new RED: reuse `plans/checkpoints/cool-cove-3068.red-green-proof.md:5-69`, then capture fresh GREEN under `dark-mist-2518`.

**Test file:** `test/scripts/deliberation-doctor-package.e2e.test.ts`  
**Framework:** Vitest via the repository test wrapper, with an installed-package Node probe  
**Run command:** `OPENCLAW_CURRENT_PACKAGE_TGZ="$HOME/.openclaw/tmp/opencode/dark-mist-2518/openclaw-current.tgz" OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-doctor-package.e2e.test.ts -- --reporter=verbose`  
**Edit hint:** Extend the existing `OR-22 doctor-package-writeback-built-five-hook-runtime` test after installed plugin discovery succeeds.

```ts
const runtimeProbeSource = `
  import fs from "node:fs";
  import path from "node:path";
  import { pathToFileURL } from "node:url";

  const packageRoot = process.env.OPENCLAW_PROBE_PACKAGE_ROOT;
  const configPath = process.env.OPENCLAW_PROBE_CONFIG_PATH;
  const entry = path.join(packageRoot, "dist", "plugins", "build-smoke-entry.js");
  const { loadOpenClawPlugins } = await import(pathToFileURL(entry).href);
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const registry = loadOpenClawPlugins({
    cache: false,
    workspaceDir: path.dirname(configPath),
    onlyPluginIds: ["deliberation"],
    env: process.env,
    config,
  });
  const plugin = registry.plugins.find(({ id }) => id === "deliberation");
  const hooks = registry.typedHooks
    .filter(({ pluginId }) => pluginId === "deliberation")
    .map(({ hookName }) => hookName);
  const services = registry.services
    .filter(({ pluginId }) => pluginId === "deliberation")
    .map(({ service }) => service.id);
  console.log("OPENCLAW_RUNTIME_PROBE=" + JSON.stringify({ status: plugin?.status, hooks, services }));
`;
const runtime = spawnSync(process.execPath, ["--input-type=module", "--eval", runtimeProbeSource], {
  encoding: "utf8",
  env: {
    ...isolatedOpenClawEnv(root, migratedPath, packageRoot),
    OPENCLAW_PROBE_PACKAGE_ROOT: packageRoot,
    OPENCLAW_PROBE_CONFIG_PATH: migratedPath,
  },
});
expectSuccess(runtime, "load installed Deliberation runtime");
const probeLine = runtime.stdout
  .split("\n")
  .find((line) => line.startsWith("OPENCLAW_RUNTIME_PROBE="));
expect(probeLine).toBeDefined();
const registration = JSON.parse(probeLine!.slice("OPENCLAW_RUNTIME_PROBE=".length)) as {
  status: string;
  hooks: string[];
  services: string[];
};
expect(registration.status).toBe("loaded");
expect(registration.hooks).toEqual([
  "inbound_event_policy",
  "inbound_claim",
  "before_dispatch",
  "before_tool_call",
  "message_sending",
]);
expect(registration.services).toEqual(["deliberation-final-delivery"]);
```

| Test                         | RED / gap before fix                                                                            | GREEN after fix                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| OR-22 package implementation | Historical genuine RED: installed doctor sidecar absent.                                        | Existing migration/package assertions remain green.                                   |
| OR-22 runtime registration   | Acceptance gap: named leaf never inspects runtime registration; no fake failing run is created. | Named leaf loads installed runtime and asserts exact ordered hooks plus sole service. |
| Standalone built singleton   | Existing independent smoke is green.                                                            | `pnpm test:build:singleton` remains green and unchanged.                              |

## Verification

1. `pnpm build`
2. `node scripts/package-openclaw-for-docker.mjs --output-dir "$HOME/.openclaw/tmp/opencode/dark-mist-2518" --output-name openclaw-current.tgz`
3. Run the targeted OR-22 command above and require one passing named leaf.
4. `pnpm test:build:singleton`
5. `node scripts/run-oxlint.mjs test/scripts/deliberation-doctor-package.e2e.test.ts`
6. `pnpm format:check -- test/scripts/deliberation-doctor-package.e2e.test.ts plans/checkpoints/dark-mist-2518.red-green-proof.md`
7. `git diff --check`

## Constraints

- Do not change Deliberation production code, manifest hook declarations, migration semantics, or the standalone singleton smoke unless the installed probe exposes a real defect.
- Do not access live config/state, KM, Gateway, providers, deployment, spool, or pilot surfaces.
- Ignore unrelated dirty-worktree changes and commit only task-owned files if implementation later requests a commit.

_Status: DRAFT_
