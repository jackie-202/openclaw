---
title: "Evidence-gated closure preserves negative results"
date: 2026-07-25
category: tooling
component: general
tags: [acceptance, evidence, verification, architecture-review, migration]
file_type: rules
---

# Evidence-gated closure must preserve negative results

When an architecture migration has separate implementation slices, closure must be based on durable predecessor artifacts rather than the plausibility of the current state.

## Rule

Evaluate every acceptance item independently. A focused test pass and successful build do not make a canonical gate green when the recorded canonical check or repository-wide test exited nonzero. Likewise, a current config that looks migrated does not prove losslessness when the named migration backup or exact apply/rollback record is unavailable.

## Practical closure pattern

1. Resolve exact predecessor final notes and historical command outcomes.
2. Compare current state to the explicitly identified backup without guessing among artifacts.
3. Record each safety path separately: dry-run, apply, doctor, and rollback.
4. Mark an item `FAIL` when required evidence is absent, even if source inspection suggests the implementation is correct.
5. Keep architectural provenance correction separate from rollout acceptance. A recommendation can be definitively reversed while implementation closure remains failed.

For append-only correction reports, capture the original byte count and SHA-256 before editing, then hash that exact prefix afterward. This proves the historical report was preserved while allowing a clearly marked correction.
