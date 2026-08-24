# Plan 2026-08-22: Deliberation fixture validation, legacy-config bound, and integration proof

Make the mirrored exchanges executable, move the operational config upgrade into doctor, and produce same-gate repository-local evidence without overstating external deployment.

## Analysis

- `extensions/deliberation/contracts/km-wire-v1.json` requires intake `pipelineId`/`deliveryTarget`, envelope `pipelineId`, target `mode`, and mode-specific `threadId`; 24 of 32 current exchanges fail at least one request or response schema check.
- `extensions/deliberation/src/contract.test.ts` asserts selected schema fields and hashes but never validates each case against its endpoint request and status-specific response schema.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` has production-spool guards and real listener/client/adapter coverage, but its first producer call still uses retired `routes` input while `intake-producer.ts` accepts only `pipelines`, `processingSource`, `event`, and `context`.
- No release tag contains the Deliberation introduction commit or `extensions/deliberation/src/config.ts`; both `v2026.7.1` and latest `v2026.8.1-beta.2` predate the plugin. Use `v2026.8.1-beta.2` as the repository-verifiable pre-plugin cutoff: every later tag that includes Deliberation must be canonical-only, while doctor repairs operational config from untagged fork builds.
- `src/plugins/doctor-contract-registry.ts` already discovers plugin-local `doctor-contract-api.ts`, reports `legacyConfigRules`, and writes `normalizeCompatibilityConfig` mutations through `openclaw doctor --fix`.
- `provenance.json` hashes prove local byte identity; even a green isolated owner checkout proves only that checkout's contract/runtime compatibility, not live KM deployment.

## Knowledge Base

- `learnings/architecture/quick-wave-9858-audit-abstraction-and-fixture-boundaries.md`: schema-check every mirrored exchange and report external convergence as unknown.
- `learnings/tooling/2026-08-21_acceptance-green-must-match-historical-red-command.md`: capture RED and GREEN with the identical contract command; a neighboring passing suite is not equivalent.
- `learnings/architecture/2026-08-21_bound-compatibility-at-the-parser-boundary.md`: retain one canonical runtime shape and make migration/removal conditions observable.
- Root policy places shipped plugin-config repair in the plugin doctor contract; runtime and manifest consume only the latest canonical shape.

## Available Skills

- `tdd`: implement the fixture and migration tests RED-first and save exact evidence.
- `task-evidence`: preserve the historical `calm-vale-3982` contract RED if it is cited; do not reconstruct it.
- `openclaw-testing`: run focused extension tests and the required build.
- `technical-documentation`: align the public plugin page and README with the tagged cutoff and doctor command.
- `save-learning`: record the implementation lesson after completion.

## Implementation

1. Add a table-driven schema gate in `contract.test.ts`. Resolve each case's endpoint by method/path, validate headers/query/body through `openclaw/plugin-sdk/json-schema-runtime`, validate the response against `endpoint.responses[String(status)]`, and require explicit expected request-schema errors only for the field intentionally broken by schema/auth/version cases. Fail on an unknown endpoint/status, an extra validation error, or any invalid response.
2. Regenerate all lifecycle exchanges in `cutover-controls-v1.json`: add stable `pipelineId`, exact `root`/`thread`/`source_anchor` mode, and required/forbidden `threadId` consistently through intake, ready, reservation, invocation, completion, and delivery-attempt projections. Keep conflict/provider/identity negatives valid except for their named fault so no stale omission masks the intended rejection.
3. Extend `km-listener.cross-repo.ts` with a table of negative fixture scenarios. Use the existing isolated listener plus positive setup operations to establish intake, reservation, invocation, and completion preconditions; submit each raw negative request and assert its fixture name, status, bounded error code, unchanged durable state where required, and zero provider calls. Do not touch the production spool or infer live state.
4. Replace the stale first producer input in `km-listener.cross-repo.ts` with canonical `pipelines`, `processingSource`, and matching authenticated `event`/`context` facts. Assert intake persists the selected `pipelineId`, effective target mode/thread evidence, and separate provider-event/source-thread identities before the existing delivery scenarios run.
5. Add `extensions/deliberation/doctor-contract-api.ts` and a private config-migration helper. Detect `plugins.entries.deliberation.config.sources`/`deliveryTarget`, deterministically map each source to one pipeline (`v1:<provider>:<account>:<channel>` ID), copy the global target to each pipeline, delete legacy keys, preserve unrelated config, report exact change diagnostics with cutoff `v2026.8.1-beta.2`, and leave canonical input unchanged. Refuse to auto-resolve mixed legacy/canonical authority.
6. Remove `legacyConfigSchema`, target adapters, and runtime fallback from `config.ts`; remove `legacyConfig` definitions from `openclaw.plugin.json`; change config tests to prove legacy startup validation fails while doctor migration writes a canonical config accepted by both manifest and runtime. Document that no tagged release shipped the legacy plugin config, `v2026.8.1-beta.2` is the pre-plugin cutoff, and later tagged builds use `openclaw doctor --fix` for untagged operational config.
7. Run the contract and cross-repository gates before updating provenance. Only after both are green, recompute local fixture hashes and rewrite provenance evidence to distinguish: repository-local schema/runtime proof, hash-matched configured KM checkout proof, and unknown external/live deployment status.
8. Save exact current RED/GREEN output in `plans/checkpoints/calm-cove-1824.red-green-proof.md`. Use the same contract command for both phases and the same KM integration command before/after the harness repair; retain the historical RED link only as prior context.

## Files to Modify

| File                                                                          | Change                                                                |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `extensions/deliberation/contracts/cutover-controls-v1.json`                  | Repair executable lifecycle and negative exchanges                    |
| `extensions/deliberation/src/contract.test.ts`                                | Validate every endpoint request and status-specific response          |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                   | Use current producer input and execute named runtime negatives        |
| `extensions/deliberation/src/config.ts`                                       | Keep canonical pipeline parsing only                                  |
| `extensions/deliberation/src/config.test.ts`                                  | Prove runtime rejection and canonical manifest alignment              |
| `extensions/deliberation/src/config-compat.ts`                                | Add doctor-only legacy-to-pipeline conversion                         |
| `extensions/deliberation/src/config-compat.test.ts`                           | Test diagnostics, writeback, idempotence, and mixed-authority refusal |
| `extensions/deliberation/doctor-contract-api.ts`                              | Export plugin-owned doctor rules and normalizer                       |
| `extensions/deliberation/openclaw.plugin.json`                                | Remove runtime legacy schema branch                                   |
| `extensions/deliberation/contracts/provenance.json`                           | Refresh local hashes and scope claims after green gates               |
| `extensions/deliberation/README.md`, `docs/plugins/reference/deliberation.md` | Document cutoff and `doctor --fix` migration                          |
| `plans/checkpoints/calm-cove-1824.red-green-proof.md`                         | Record identical-command RED/GREEN evidence                           |

## TDD

Implement the cycle with `skill:tdd`; write proof to `plans/checkpoints/calm-cove-1824.red-green-proof.md`.

**Test files:** `extensions/deliberation/src/contract.test.ts`, `extensions/deliberation/src/config-compat.test.ts`

**RED/GREEN command:** `env OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/calm-cove-1824-contract-cache OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config-compat.test.ts -- --reporter=verbose`

```ts
// Append to contract.test.ts; current intake.success is schema-invalid.
import {
  validateJsonSchemaValue,
  type JsonSchemaObject,
} from "openclaw/plugin-sdk/json-schema-runtime";

it("validates each fixture against its endpoint schemas", async () => {
  const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8"));
  const fixtures = JSON.parse(
    await readFile(join(contractDir, "cutover-controls-v1.json"), "utf8"),
  );
  const fixture = fixtures.cases.find((item: { name: string }) => item.name === "intake.success");
  const endpoint = contract.endpoints.find(
    (item: { method: string; path: string }) =>
      item.method === fixture.request.method && item.path === fixture.request.path,
  );
  const result = validateJsonSchemaValue({
    schema: { $ref: endpoint.request.body.$ref, schemas: contract.schemas } as JsonSchemaObject,
    cacheKey: "deliberation-fixture-intake-success",
    value: fixture.request.body,
  });
  expect(result, JSON.stringify(result)).toMatchObject({ ok: true }); // RED: missing pipeline/target fields
});
```

```ts
// New config-compat.test.ts; import is absent before implementation.
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import { describe, expect, it } from "vitest";
import { normalizeCompatibilityConfig } from "../doctor-contract-api.js";
import { parseDeliberationConfig } from "./config.js";

describe("deliberation doctor migration", () => {
  it("writes operational sources config as canonical pipelines", () => {
    const legacy = {
      plugins: {
        entries: {
          deliberation: {
            config: { sources: [{ channel: "discord", accountId: "acct", target: "source" }] },
          },
        },
      },
    } as OpenClawConfig;
    const migrated = normalizeCompatibilityConfig({ cfg: legacy });
    const config = migrated.config.plugins?.entries?.deliberation?.config;
    expect(config).toMatchObject({ pipelines: [{ id: "v1:discord:acct:source" }] });
    expect(config).not.toHaveProperty("sources"); // RED: doctor contract does not exist
    expect(() => parseDeliberationConfig(config)).not.toThrow();
  });
});
```

| Test                   | RED                                                       | GREEN                                                                                |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fixture schema gate    | `intake.success` lacks required pipeline/target evidence  | Every case matches its explicit request expectation and response schema              |
| Doctor migration       | Doctor contract/import is absent                          | Legacy config is diagnosed and written back canonically; runtime rejects raw legacy  |
| Runtime negative table | Stale producer input fails before named listener behavior | Every negative reaches its named status/code with required no-mutation/no-send proof |

## Verification

- Contract/config: the identical RED/GREEN command above.
- Cross-repository RED/GREEN: `env OPENCLAW_DELIBERATION_KM_ROOT="<approved-km-checkout>" pnpm test:deliberation:km-integration`.
- Focused regression: `pnpm test extensions/deliberation/src/config.test.ts extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`.
- Doctor integration: `pnpm test src/plugins/doctor-contract-registry.test.ts src/commands/doctor-legacy-config.migrations.test.ts -- --reporter=verbose` if plugin discovery/writeback is not fully proven by the focused plugin test.
- Build: `pnpm build`.
- Docs sanity: `git diff --check` and verify the public page still passes the relevant docs checks selected by `skill:technical-documentation`.
- Pre-handoff: run fresh `skill:autoreview`; resolve all accepted/actionable findings.

---

_Status: DRAFT_
