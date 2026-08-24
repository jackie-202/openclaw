# Plan 2026-08-23: Complete caller-owned Deliberation OR-01 through OR-23 gate

Complete only the missing owner-runtime leaves and produce one genuine canonical 23-row ledger from a verified clean run.

_Status: DRAFT_
_Created: 2026-08-23_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- Preserve the implemented gate and ledger in `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, `test/scripts/deliberation-full-gate.test.ts`, and `package.json`; they already enforce exact selectors, immutable command evidence, negative verification, OR-23, and overwrite refusal.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` still exposes seven aggregate tests. Its intake/routing/conflict/cleanup coverage does not execute the fixed OR-07..OR-21 manifest.
- `extensions/deliberation/scripts/km-spool-probe.py` supports only `init`, `prepare`, and `read`; owner recovery, restart, historical-attempt, and migration scenarios need public owner-API probe operations.
- `extensions/deliberation/contracts/provenance.json` still pins `calm-cove-1824` and two stale hashes, so canonical preflight must continue to reject it until the supplied authority is directly verified.
- OR-01..06, OR-22, readiness consumption, and the fail-closed ledger tests are completed work and should change only if fresh reporter extraction finds a concrete defect.

### Relevant documentation

- `plans/tasks/2026-08-23_establish-caller-owned-deliberation-or-01-through-or-23-full.md` defines 23/23 Green, immutable authority, isolated state, and no synthetic or historical rows.
- `docs/proposals/proposal-20260820-203458-161e2c_per-source-deliberation-pipelines-with-source-default-delivery.md` fixes singular intake, immutable pipeline/target evidence, at-most-once provider invocation, exact receipt completion, and fail-closed recovery.
- `plans/checkpoints/quick-brook-1900.{checkpoint.md,final-note.md,red-green-proof.md}` proves the gate plumbing but records that no owner leaves or final ledger ran.

### Knowledge base

- `learnings/tooling/quick-brook-1900-fail-closed-named-leaf-gates.md`: aggregate reporter totals cannot become acceptance leaves; verify path, revision, scoped cleanliness, and hashes before execution.
- `learnings/tooling/quick-brook-1900-aggregate-gate-final-leaf.md`: OR-23 must be a real reporter result over the fresh 22-row candidate.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: this follow-up must obtain accepted immutable owner evidence and Green, not stop at the same blocker.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; empty auto-extracted learnings were not treated as evidence.
- External KM source access was denied during planning. Implementation must obtain authorized read access before choosing owner API calls; mirrored OpenClaw contracts are insufficient to invent those calls.

## Available Skills

- `task-evidence`: extract the parent task's historical RED and evidence gaps without rerunning old code.
- `tdd`: bind the fresh owner integration GREEN to the preserved genuine RED; do not fabricate a new RED after implementation exists.
- `validate-implementation`: check the completed ledger and architecture contract.
- `save-learning`: required last implementation action.

## Implementation

1. Run `skill:task-evidence` for `quick-brook-1900` and the referenced owner-convergence parent. Link the genuine historical owner-listener RED into `plans/checkpoints/quick-fork-2935.red-green-proof.md`; do not rerun old code or count dirty/provenance preflight as RED.
2. Obtain authorized read access to `/Users/michal/.openclaw/workspace/km-system`. At revision `79bbc5c0426bc7be901d5199da11b21213bfa008`, read its scoped instructions, listener, spool public API, migration/reconciliation tests, and the four pinned files. Verify revision, scoped cleanliness, and hashes before editing OpenClaw.
3. Update `extensions/deliberation/contracts/provenance.json` to the directly verified revision and four owner hashes. Preserve repository-readiness scope; do not claim deployment or live convergence.
4. Extend the test-only spool probe only with owner-public operations needed to arrange and inspect restart/reconciliation/migration states. Keep its sentinel, temporary SQLite root, and production-overlap refusal; do not mirror private KM logic in OpenClaw.
5. Split `extensions/deliberation/scripts/km-listener.cross-repo.ts` into the fixed exact selectors already declared in `DELIBERATION_LEAVES`: OR-07 singular authenticated intake, OR-08 idempotent conflict, OR-09 account/channel isolation, OR-10 history-only context, OR-11 immutable pipeline/target, OR-12 reservation CAS/replay, OR-13 durable pre-send invocation marker, OR-14 exact SENT receipt, OR-15 authoritative rejection, OR-16 timeout/transport unknown, OR-17 restart-safe invoked unknown, OR-18 never-invoked fresh reservation, OR-19 legacy unknown non-retry, OR-20 history drift/tamper rejection, and OR-21 bounded atomic migration. Each test must exercise the listener and isolated owner SQLite and appear once in JUnit; keep auth/protocol/cleanup guards as uncounted support.
6. Run the direct owner harness and require all OR-07..21 selectors exactly once. If an owner API cannot establish a declared leaf, stop with that exact contract gap instead of substituting a fixture or synthetic row.
7. Run focused gate-validator tests, the existing pinned KM E2E selectors, build/package OR-22 proof, and scoped static checks through the existing runner. Fix only failures attributable to this acceptance repair.
8. After the task state is committed by the authorized workflow, run `pnpm test:deliberation:full-gate` from the clean checkout. Require zero exit, 23/23 Green, exact revisions/hashes, successful malformed-input rejection, elapsed output, and an exclusively created `plans/checkpoints/quick-brook-1900.full-gate.json`; update the final note from that run only.
9. Run `skill:validate-implementation` and the repository-mandated fresh autoreview, resolve actionable findings, and rerun affected proof. Invoke `skill:save-learning` as the final action.

## Files to Modify

| File                                                                | Change                                                                                                   |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`         | Replace aggregate owner coverage with exact executable OR-07..21 tests while retaining support guards.   |
| `extensions/deliberation/scripts/km-spool-probe.py`                 | Add only public owner-API scenario setup/inspection required by restart, recovery, and migration leaves. |
| `extensions/deliberation/contracts/provenance.json`                 | Pin the directly verified accepted revision and four hashes.                                             |
| `scripts/deliberation-full-gate.ts`                                 | Change only if fresh reporter extraction or final-note completeness exposes a concrete runner defect.    |
| `test/scripts/deliberation-full-gate.test.ts`                       | Change only for a concrete validator regression found by the completed owner manifest.                   |
| `plans/checkpoints/quick-fork-2935.red-green-proof.md`              | Link historical RED provenance and record fresh owner-harness GREEN.                                     |
| `plans/checkpoints/quick-brook-1900.{full-gate.json,final-note.md}` | Store canonical machine evidence and its bounded completion summary.                                     |

## TDD

Implementace TDD cyklu dle skill:tdd. Reuse verified historical RED because the gate and owner consumer already exist; never manufacture a post-implementation RED. Capture fresh GREEN with the identical owner-backed command in `plans/checkpoints/quick-fork-2935.red-green-proof.md`.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Run command:** `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`  
**Edit hint:** replace aggregate tests with exact `node:test` leaves after authority preflight.

```ts
void test("OR-17 invoked-unknown-nonreservable-after-restart", async () => {
  const fixture = await createListenerFixture();
  try {
    const { client, item, reservation } = await prepareReservation(fixture);
    await client.invoke(
      reservation,
      reservation.deliveryEnvelope.deliveryTarget,
      deriveProviderAttemptId(reservation.attemptId),
    );
    const reconciled = await restartAndReconcileExpiredAttempt(fixture); // RED: owner-backed helper is absent.
    assert.equal(reconciled.state, "DELIVERY_UNKNOWN");
    assert.equal((await client.reserve(item, "retry-owner")).outcome, "conflict");
  } finally {
    await disposeFixture(fixture);
  }
});
```

| Test                     | RED                                                                                                                           | GREEN                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| OR-07..21 owner manifest | Historical owner-backed command failed before complete owner convergence; exact provenance is extracted with `task-evidence`. | One current JUnit run reports every exact selector once with no skipped/red leaf.                   |
| OR-17 skeleton           | No restart/reconciliation helper exposes the public owner behavior.                                                           | Invoked unknown is durable after restart and cannot reserve again.                                  |
| Canonical integrity      | Parent run stopped before behavioral leaves and produced no ledger.                                                           | `pnpm test:deliberation:full-gate` writes one validated 23/23 artifact and real OR-23 reporter row. |

## Verification

1. `env OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`
2. `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test test/scripts/deliberation-full-gate.test.ts`
3. `pnpm test:deliberation:full-gate` from the clean committed checkout; inspect the generated ledger for 23 ordered unique Green rows and the exact authority bundle.
4. Run the touched-surface checks already encoded as support commands; use the repository testing workflow if any check fans out beyond a narrow local run.

## Dependencies

- Authorized read-only access to the pinned KM checkout and its exact public lifecycle contract; planning-time access was denied.
- KM revision `79bbc5c0426bc7be901d5199da11b21213bfa008` and supplied hashes must be independently verified, not copied into Green evidence.
- A clean committed OpenClaw checkout is required for the canonical run. Do not weaken preflight or overwrite an earlier ledger to accommodate the current dirty workspace.
- No KM edits, production spool access, real provider send, deployment, Gateway restart, or pilot activation.
