---
title: Remove OpenClaw dependency on KM Deliberation source layout
---

# Remove OpenClaw dependency on KM Deliberation source layout

## Context

OpenClaw currently owns a reverse source-level dependency on the external KM System checkout:

- `scripts/lib/deliberation-full-gate-ledger.ts` pins an absolute KM checkout root plus hashes for KM contract and internal Python source files;
- `scripts/deliberation-full-gate.ts` reads and hashes those external files during OpenClaw's canonical gate and compares them with `extensions/deliberation/contracts/provenance.json`;
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` requires `OPENCLAW_DELIBERATION_KM_ROOT` and launches the external KM implementation for OpenClaw-owned tests;
- the wire/health schema exposes literal internal KM paths such as `lib/deliberation_wire.py`, `lib/deliberation_spool_contracts.py`, and `lib/deliberation_source_identity.py` as identity keys.

This reverses the intended architecture. KM System is a runtime layer over OpenClaw. OpenClaw may define and test its own public adapter/provider boundary, but it must not require access to a sibling KM checkout, execute KM-owned implementation code, or encode KM internal filenames and hashes as an OpenClaw acceptance condition.

## Objective

Remove the OpenClaw → KM source-checkout dependency while preserving OpenClaw's real Deliberation responsibilities: channel ownership, intake adapter behavior, public wire validation, history/provider adapters, final-delivery behavior, package integrity, and local fail-closed tests.

The resulting OpenClaw test/build/package gates must run from an isolated OpenClaw checkout without `/Users/michal/.openclaw/workspace/km-system`, `OPENCLAW_DELIBERATION_KM_ROOT`, or any KM implementation source files.

## Required changes

### 1. Delete external implementation ownership from OpenClaw gates

- Remove absolute KM roots, KM Git HEAD checks, external KM source-file hashes, and external-file reads from the canonical full gate and its ledger/schema.
- Remove OpenClaw-owned tests/scripts whose sole purpose is launching or validating the real KM implementation from another checkout.
- Remove package scripts and documentation that instruct OpenClaw contributors to provide `OPENCLAW_DELIBERATION_KM_ROOT` for ordinary OpenClaw verification.
- Do not replace the dependency with copied KM Python files, a vendored KM checkout, symlinks, or another machine-specific path.

### 2. Keep the correct OpenClaw-owned contract boundary

- Retain local tests for the OpenClaw plugin's request/response parsing and behavior using repository-local fixtures/fakes at the public protocol boundary.
- Retain channel/provider ownership, history, delivery, package, migration, and negative integrity coverage that tests OpenClaw code itself.
- If OpenClaw needs a protocol schema, it must be an explicitly OpenClaw-owned public adapter contract or repository-local fixture, not an assertion about KM internal implementation paths.
- Replace health metadata keyed by KM source filenames with behavior/version/capability-oriented public fields, or remove that metadata if OpenClaw does not need it. Do not retain path aliases merely to disguise the same coupling.

### 3. Re-scope the OR/full-gate model

- Audit OR-01 through OR-23 and classify each leaf as:
  - OpenClaw-owned and retained locally;
  - public-boundary fixture/adapter coverage retained locally; or
  - KM implementation/integration ownership removed from the OpenClaw gate.
- Do not preserve an artificial 23-leaf count if some leaves only prove KM internals. Update gate schemas, integrity checks, docs, and tests to the truthful OpenClaw-owned set.
- Ensure removing cross-repository checks does not silently remove local coverage for OpenClaw behavior that those tests happened to exercise. Add local characterization first where necessary.

### 4. Make dependency direction explicit

Document the boundary:

- OpenClaw owns provider/channel APIs, hooks, adapters, and the public interface consumed by an external orchestrator.
- KM System may depend on and integration-test against that public OpenClaw interface in its own repository.
- Cross-repository end-to-end validation, if retained operationally, is caller/KM-owned and must not be a prerequisite of OpenClaw's repository-local build or acceptance gate.

Do not modify KM System in this task. Report any KM-side replacement gate needed as a follow-up recommendation only.

## Characterization-first guardrail

Before deleting tests, inventory exactly what each cross-repository test proves. For every removed test, either:

1. show that it proves only external KM implementation behavior and belongs outside OpenClaw; or
2. preserve its OpenClaw-owned assertion with a repository-local fake/fixture.

No meaningful OpenClaw provider, routing, ownership, idempotency, history, delivery, package, or malformed-response behavior may disappear merely because the harness was architecturally wrong.

## Likely files

Inspect at minimum:

- `scripts/deliberation-full-gate.ts`
- `scripts/lib/deliberation-full-gate-ledger.ts`
- `test/scripts/deliberation-full-gate.test.ts`
- `extensions/deliberation/scripts/km-listener.cross-repo.ts`
- `extensions/deliberation/src/km-client.ts`
- `extensions/deliberation/src/km-client.test.ts`
- `extensions/deliberation/src/contract.test.ts`
- `extensions/deliberation/contracts/provenance.json`
- `extensions/deliberation/contracts/km-wire-v1.json`
- `extensions/deliberation/contracts/cutover-controls-v1.json`
- `extensions/deliberation/README.md`
- `package.json`

The list is not permission for unrelated cleanup.

## Acceptance

1. A repository-wide active-code/config/docs search finds no absolute KM checkout path, no `OPENCLAW_DELIBERATION_KM_ROOT`, and no OpenClaw test or gate that launches or reads the KM implementation checkout.
2. OpenClaw acceptance no longer hashes, pins, or names internal KM Python source paths.
3. OpenClaw's Deliberation tests use only OpenClaw-local code and fixtures, except normal runtime calls through the documented public boundary where explicitly intended outside repository-local tests.
4. Every deleted cross-repository assertion is accounted for in a before/after coverage matrix; OpenClaw-owned behavior remains covered.
5. The full gate and ledger truthfully represent only OpenClaw-owned/local checks; no fixed OR count is retained solely for historical compatibility.
6. Focused Deliberation tests, full gate, typecheck/lint, and build pass from an environment where the KM checkout path is absent or deliberately inaccessible.
7. Documentation states the one-way dependency and identifies KM/caller ownership for any future cross-repository E2E gate.
8. No KM System files, external checkout, runtime service, or production configuration are modified.

## Verification

Run the smallest focused tests while changing each seam, then the repository's Deliberation gate and relevant build/type/lint gates. Include a negative isolation proof that the resulting OpenClaw gate succeeds with the KM root absent/inaccessible. Record exact commands and results in the final note.
