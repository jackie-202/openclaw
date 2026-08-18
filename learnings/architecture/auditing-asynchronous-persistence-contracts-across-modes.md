---
title: "Auditing asynchronous persistence contracts across modes"
date: 2026-08-09
category: architecture
component: general
tags: [async-persistence, queued-writer, trajectory, contract-audit, test-evidence]
file_type: checklist
---

# Auditing asynchronous persistence contracts across modes

When a factory changes its default implementation, inherited tests for the old implementation do not prove the new default. Audit the selected runtime path, option forwarding, caller ownership, and lifecycle composition before accepting test names or comments as evidence.

## Contract audit sequence

1. Separate the generic queue, the domain adapter, and the lifecycle caller. A correct writer does not provide an end-to-end guarantee if the adapter closes shared state or process shutdown never calls it.
2. Verify which factory branch tests actually select. Tests that force a legacy environment value only prove legacy queue caps and diagnostics.
3. Trace every option into the selected implementation. A shared interface can expose `maxQueuedBytes` while a new factory branch silently forwards only `maxFileBytes`.
4. Check constant semantics, not only numeric bounds. A live-capture cap and an import/export file cap may both be byte limits but are not interchangeable retention contracts.
5. Treat cache keys and resource ownership separately. Per-path caching serializes access only while all recorders agree on the writer lifetime; deleting and closing on one recorder's flush invalidates other retained references.
6. Define what flush completion means under size drops and failures. A Promise that always resolves can mean only "work settled," not "data persisted."
7. Trace normal `finally` cleanup separately from `SIGTERM`, `SIGINT`, crashes, and forced exits. A direct `close()` test is not process-termination proof.
8. Inspect test observables for false positives. After unlink/recreate, a persistent handle can keep writing to the unlinked inode while the replacement pathname remains unchanged, satisfying a weak "replacement file unchanged" assertion without detecting the swap.
9. Search callers of old helpers after refactors. Type alignment for an operation used only by unreachable code is not a runtime compatibility guarantee.

## Useful evidence standard

For each matrix row, record source behavior, direct test proof, missing proof, and whether a weaker comparison guarantee is real or only apparent. Keep pre-flush memory/crash-window guarantees separate from post-flush durability, retention, and error propagation; one implementation can be stronger on one side of that boundary and weaker on the other.
