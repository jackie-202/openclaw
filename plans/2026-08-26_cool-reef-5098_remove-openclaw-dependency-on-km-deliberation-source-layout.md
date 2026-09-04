# Plan 2026-08-26: Remove OpenClaw dependency on KM Deliberation source layout

Remove KM checkout discovery and implementation evidence from the gate, retain OpenClaw behavior through local protocol fakes, and reduce the acceptance ledger to its actual repository-owned leaves.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `scripts/deliberation-full-gate.ts` preflights a clean OpenClaw revision plus `KM_AUTHORITY`, hashes external files, launches `km-listener.cross-repo.ts`, and hard-codes 22-row candidate/23-row final output.
- `scripts/lib/deliberation-full-gate-ledger.ts` embeds the machine-specific KM roots, four owner-file hashes, KM authority schema, `km-integration` leaves OR-07..21, and fixed candidate/final counts.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` and `km-spool-probe.py` execute the external listener/Python APIs and assert both mixed adapter behavior and KM-owned spool, restart, reconciliation, and migration behavior.
- OR-01..06 are OpenClaw channel-ownership tests; OR-22 is OpenClaw package/doctor coverage; OR-23 is local ledger integrity. OR-07..21 must be split by assertion ownership before deletion.
- Existing local coverage already exercises intake target derivation (`intake-producer.test.ts`), wire parsing and lifecycle validation (`km-client.test.ts`), final provider calls (`final-adapter.test.ts`), and built public probe composition (`delivery-probe.test.ts`); missing mixed-leaf assertions belong in these files with local HTTP/fetch fakes.
- `km-client.ts`, `km-client.test.ts`, `km-wire-v1.json`, and `cutover-controls-v1.json` expose health identity keyed by three KM Python paths. The client can instead validate and return only the public health projection OpenClaw consumes.
- `provenance.json` and `contract.test.ts` treat copied KM artifacts and external hashes as semantic authority. They must become OpenClaw-owned adapter fixtures/integrity metadata or be deleted if no local consumer remains.
- `package.json` and `extensions/deliberation/README.md` expose the cross-repository command; the public plugin guide describes the external wire boundary but not the one-way repository ownership rule.

### Relevant documentation

- `docs/plugins/reference/deliberation.md` defines the six-operation public adapter, ownership, fail-closed intake, history, and final-delivery behavior that must remain.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` currently prescribes synchronized KM source/hash proof and 23/23 convergence; mark that corrective sequence historical/superseded and state caller-owned cross-repository E2E.
- `docs/reference/test.md` requires focused `pnpm test <target>` proof before broader changed/build checks.

### Knowledge base

- `learnings/runtime-errors/deployed-shape-fixtures-isolate-plugin-km-boundaries.md`: preserve endpoint-prefix and SecretInput behavior in local client/probe fixtures; keep diagnostics closed.
- `learnings/patterns/swift-peak-4405-consumer-tests-cannot-close-an-external-owner-gate.md`: local adapter tests prove only OpenClaw behavior; KM implementation convergence remains caller-owned.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: classify every source-layout match by importer and runtime activation before declaring the dependency removed.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: keep protocol v1 where it is the current public wire version; remove implementation provenance, not versioned API names.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: maintain this plan incrementally.
- `recall-knowledge`: identify applicable project learnings before synthesis.
- `tdd`: execute the characterization-first RED/GREEN cycle during implementation.
- `openclaw-testing`: select focused and repository-level OpenClaw verification.
- `technical-documentation`: update and verify the Deliberation boundary documentation.
- `autoreview`: perform the mandatory fresh pre-handoff code review after implementation.
- `save-learning`: capture planning discoveries as the final action of this planning task.

## Approach

Keep the public HTTP adapter contract and OpenClaw's closed request/response validation. Delete external checkout authority and KM implementation scenarios instead of replacing them with a fake KM state machine. Characterize mixed OR leaves first, add only missing OpenClaw assertions to existing local tests, then derive ledger counts from the remaining manifest.

### OR coverage matrix

| Leaves    | Classification                                                                               | After change                                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OR-01..06 | OpenClaw channel ownership                                                                   | Retain unchanged in the local gate.                                                                                                                                                                                                |
| OR-07     | Mixed                                                                                        | Retain intake serialization and duplicate-response parsing locally; remove KM record-count/state assertions.                                                                                                                       |
| OR-08..10 | KM idempotent storage, source isolation, and history projection with some adapter assertions | Keep local identity, malformed/conflict response, and history-adapter tests; remove durable mutation/count assertions.                                                                                                             |
| OR-11..16 | Mixed lifecycle                                                                              | Retain immutable target, no reserve override, invocation-before-provider, receipt validation, rejection, and unknown-outcome behavior in `km-client`, `final-adapter`, and delivery-probe tests; remove KM persistence assertions. |
| OR-17..18 | KM restart/reconciliation                                                                    | Remove from OpenClaw; retain the existing local guarantee that an uncertain provider outcome is not retried by the adapter run.                                                                                                    |
| OR-19..20 | Mixed historical evidence                                                                    | Retain client fail-closed parsing for unauthorized retry, attempt drift, tamper, and receipt mismatch; remove KM audit-fixture mutation.                                                                                           |
| OR-21     | KM legacy migration                                                                          | Remove from OpenClaw entirely; recommend equivalent KM-owned coverage as follow-up.                                                                                                                                                |
| OR-22     | OpenClaw doctor/package runtime                                                              | Retain locally.                                                                                                                                                                                                                    |
| OR-23     | OpenClaw gate integrity                                                                      | Retain, deriving candidate/final manifests and totals from the remaining leaf list.                                                                                                                                                |

## Implementation

1. Use `skill:tdd` to add the local gate/health RED cases below and append any missing OR-07..20 OpenClaw assertions to `km-client.test.ts`, `final-adapter.test.ts`, `delivery-probe.test.ts`, or `intake-producer.test.ts` before deleting the cross-repository harness.
2. Replace `provenance.json` owner roots, hashes, revisions, and source claims with OpenClaw ownership plus hashes only for repository-local public contract/fixture files. Update `contract.test.ts` to validate local integrity and adapter semantics without claiming KM implementation authority.
3. Trim `km-wire-v1.json` to an explicitly OpenClaw-owned adapter contract: keep the six operations and consumed request/response shapes; remove spool paths, Python/listener commands, implementation identity hashes, and source-filename-keyed health metadata. Update `cutover-controls-v1.json` and `km-client.ts` so health validation/projected output uses only public behavior/version/control/runtime fields needed by OpenClaw and does not expose ignored implementation metadata.
4. Delete `km-listener.cross-repo.ts` and `km-spool-probe.py`; remove `test:deliberation:km-integration` and every full-gate spawn, environment injection, JUnit parser use, lint target, and leaf mapping that exists only for that harness.
5. Refactor `DELIBERATION_LEAVES`, authority schemas, validators, candidate reconstruction, negative cases, and result text to derive expected rows and totals from the retained local manifest. Keep OpenClaw revision/cleanliness, command/report binding, stale/duplicate/malformed rejection, exclusive output creation, secret-sanitized children, package proof, and OR-23 ordering.
6. Make the gate write only its requested/default artifact under `.artifacts`; remove task-specific readiness/final-note checkpoint generation and all fixed `22`, `23`, `/23`, and `23/23` assumptions.
7. Use `skill:technical-documentation` to replace the README cross-checkout instructions and update the public plugin page plus proposal corrective section: OpenClaw owns channel/provider hooks and the public adapter; external orchestrators consume it; KM owns cross-repository E2E and implementation tests.
8. Run the active-surface search and verification below, use `skill:autoreview` until no actionable finding remains, and report a KM-side follow-up for listener/storage/restart/reconciliation/migration E2E without modifying KM.

## Files to Modify

| Path                                                                                                               | Change                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `scripts/deliberation-full-gate.ts`                                                                                | Remove KM preflight/execution and fixed counts; run only local leaves/support and emit one local artifact.               |
| `scripts/lib/deliberation-full-gate-ledger.ts`                                                                     | Remove `KM_AUTHORITY`, KM authority schema, JUnit support if unused, OR-07..21 rows, and fixed manifest lengths.         |
| `test/scripts/deliberation-full-gate.test.ts`                                                                      | Replace KM fixtures/assertions with OpenClaw-only authority and dynamically sized candidate/final integrity cases.       |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                                        | Delete after characterization coverage is local.                                                                         |
| `extensions/deliberation/scripts/km-spool-probe.py`                                                                | Delete with its only caller.                                                                                             |
| `extensions/deliberation/src/km-client.ts`                                                                         | Remove source-filename health identity and project only the public health fields OpenClaw consumes.                      |
| `extensions/deliberation/src/{km-client,final-adapter,delivery-probe}.test.ts`                                     | Preserve mixed-leaf OpenClaw request, parsing, ordering, fail-closed, receipt, and no-retry assertions with local fakes. |
| `extensions/deliberation/src/contract.test.ts`                                                                     | Assert OpenClaw-owned adapter fixtures and local hashes only.                                                            |
| `extensions/deliberation/contracts/{provenance,km-wire-v1,cutover-controls-v1}.json`                               | Remove KM source layout/provenance and express the public adapter/health contract.                                       |
| `extensions/deliberation/README.md`                                                                                | Remove checkout setup; document local verification and one-way ownership.                                                |
| `docs/plugins/reference/deliberation.md`                                                                           | State public boundary and KM/caller ownership of cross-repository E2E.                                                   |
| `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` | Supersede source-hash/23-leaf corrective guidance with the one-way dependency decision.                                  |
| `package.json`                                                                                                     | Remove the KM integration script; retain the local full-gate entrypoint.                                                 |

## TDD

Implement the cycle with `skill:tdd`; save RED/GREEN evidence to `plans/checkpoints/cool-reef-5098.red-green-proof.md`.

**Test files:** `test/scripts/deliberation-full-gate.test.ts`, `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `pnpm test test/scripts/deliberation-full-gate.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`  
**Edit hint:** append to the existing top-level gate tests and `describe("KM contract parsing")`.

```ts
// test/scripts/deliberation-full-gate.test.ts
it("contains no external KM implementation command", () => {
  expect(DELIBERATION_LEAVES.map((leaf) => leaf[2])).not.toContain("km-integration");
});

// extensions/deliberation/src/km-client.test.ts
it("accepts health without source-file identity metadata", async () => {
  const health = validHealthResponse();
  const client = createClient({
    ...health,
    listener: {
      protocolVersion: health.listener.protocolVersion,
      startedAt: health.listener.startedAt,
    },
  });
  await expect(client.health()).resolves.toMatchObject({ status: "ok" });
});
```

| Test                     | RED                                             | GREEN                                                            |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------- |
| Gate command inventory   | `km-integration` is still present.              | Every acceptance command is repository-local.                    |
| Public health projection | Current schema requires three Python-path keys. | Health succeeds using only public metadata consumed by OpenClaw. |

## Verification

1. `pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/delivery-probe.test.ts extensions/deliberation/scripts/intake-producer.test.ts test/scripts/deliberation-full-gate.test.ts -- --reporter=verbose`
2. `pnpm test extensions/deliberation`
3. From a clean candidate commit, run `env -i PATH="$PATH" HOME="$(mktemp -d)" TMPDIR="${TMPDIR:-/tmp}" pnpm test:deliberation:full-gate` to prove the gate has no sibling checkout/environment dependency.
4. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
5. `node scripts/run-oxlint.mjs scripts/deliberation-full-gate.ts scripts/lib/deliberation-full-gate-ledger.ts test/scripts/deliberation-full-gate.test.ts extensions/deliberation/src/km-client.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/contract.test.ts`
6. `pnpm build`
7. `pnpm check:docs && git diff --check`
8. Search active source/config/docs, excluding historical plans and Git metadata, for the former absolute root, root environment variable, deleted harness/probe names, and the three Python filenames; require zero matches. Separately search `23/23`, `/23`, and fixed candidate/final lengths and classify every remaining match.
9. Run `git diff --numstat`; deleted cross-repository production/tooling LOC should exceed any local characterization additions.

## Dependencies

- No KM checkout, service, source file, or production configuration is an implementation prerequisite.
- Any replacement listener/spool/restart/reconciliation/migration E2E belongs in KM and is follow-up-only.
