---
title: Deliberation: validate fixtures, bound legacy config, and repair integration proof
---

# Deliberation: validate fixtures, bound legacy config, and repair integration proof

## Context

Remediation items 6-8 from `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md` (`NOT SAFE`).

## Objective

Make contract fixtures executable semantic evidence, put legacy config compatibility behind a repository-verifiable migration bound, and refresh the current cross-repository integration proof.

## Required behavior

- Regenerate `cutover-controls-v1.json` lifecycle cases with required `pipelineId`, target `mode`, and thread evidence; keep negative cases otherwise valid so they reach their named runtime rejection.
- Schema-validate every request and status-specific response against the referenced closed schema and execute negative cases through the runtime path.
- Reissue provenance only after local semantic consistency is green; do not claim external KM/live convergence from hashes alone.
- Define a tagged-release cutoff and plugin-owned doctor migration/writeback for legacy config; remove runtime legacy acceptance after the documented migration window rather than relying on comments.
- Update `km-listener.cross-repo.ts` to current `pipelines` and producer inputs and capture current exact RED/GREEN commands for the same contract gate.

## Acceptance

- All fixture cases validate and execute as named.
- Legacy compatibility has an enforceable, tested removal condition and migration diagnostics.
- Current cross-repository harness uses the current producer contract and recorded evidence distinguishes repository-local proof from external/live unknowns.
- Focused contract/config/integration tests and build pass.
