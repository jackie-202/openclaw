# Checkpoint: bold-wave-3956

## Steps

- ✅ Step 1: Inspect parent plan, implementation, and existing evidence
- ✅ Step 2: Obtain an approved hash-matched KM checkout and execute the integration gate
- ⬜ Step 3: Resolve owner-contract blocker, capture GREEN, and complete verification
- ✅ Step 4: Save learning and record the blocked handoff

## Last completed

The required learning was saved to `learnings/architecture/bold-wave-3956-hash-equality-does-not-prove-runtime-convergence.md`. The hash-matched gate reached runtime and produced genuine RED: 12 passed, 11 failed. Every positive setup is rejected with `400 SCHEMA_INVALID`; negative cases not requiring positive setup and all isolation/cleanup guards pass. Repository-local contract/config tests pass (2 files, 14 tests), `pnpm build` passes, task evidence formatting passes, and `git diff --check` passes.

## Context for resume

Blocked on the owner boundary. Pinned KM revision `872436aad992826b5d501597e265e8c2b94e6f78` has the required hashes but its closed listener intake excludes `pipelineId` and `deliveryTarget`, and its target excludes `mode`. Later KM commits add pipeline support while changing the owner hashes and remain semantically different. Do not strip fields, patch the approved checkout, refresh pins, or update configured-checkout provenance without an approved converged owner revision. Evidence is in `plans/checkpoints/bold-wave-3956.red-green-proof.md`; external/live status remains unknown.
