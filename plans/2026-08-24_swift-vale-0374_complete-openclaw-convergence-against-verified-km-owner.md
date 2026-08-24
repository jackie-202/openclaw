# Plan 2026-08-24: Complete OpenClaw convergence against verified KM owner artifacts

Preserve the parent implementation, replace synthetic owner-test wrappers with composed boundary proof, and make the repaired task’s code and evidence attributable.

## Analysis

### Preserved Work

- Keep the exact owner mirrors and hash-authority provenance already present in `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json`; do not regenerate them unless the four-file preflight differs.
- Keep the implemented producer, client, and adapter behavior in `extensions/deliberation/scripts/intake-producer.ts`, `extensions/deliberation/src/km-client.ts`, and `extensions/deliberation/src/final-adapter.ts`: immutable producer-selected target, invocation before one provider call, typed definitive failures, ambiguity fencing, no post-invocation retry, and strict historical-attempt validation.
- Keep the existing OR-19/OR-20 regressions and genuine RED/GREEN history in `extensions/deliberation/src/km-client.test.ts` and `plans/checkpoints/cool-vale-4616.red-green-proof.md`.
- Include these preserved unstaged changes in the repaired task’s reviewed change set; the previous acceptance input omitted them and therefore reported implementation missing.

### Remaining Gaps

- `extensions/deliberation/scripts/km-listener.cross-repo.ts:511` implements OR-08..OR-21 by spawning owner pytest selectors. Reporter names are not proof that OpenClaw’s producer/client/adapter exercised the isolated owner runtime.
- `extensions/deliberation/scripts/km-spool-probe.py:54` derives source context from `record.messages`; the probe must receive a separate explicit history snapshot and cutoff.
- OR-07 proves replay idempotency for one event but not two distinct same-window events producing two durable records.
- The parent proof records one remaining composed E2E failure and lacks a task-owned exact completion ledger acceptable to the monitor.

### Authority And Rules

- Before edits, print KM HEAD as non-blocking provenance and verify the accepted SHA-256 values for `contract.json`, `fixtures.json`, `deliberation_wire.py`, and `deliberation_spool_contracts.py`; stop only on an exact artifact mismatch.
- Inspect the verified owner source for each public spool/listener lifecycle operation before implementing the probe and OR scenarios; do not infer dependency behavior from OpenClaw wrappers.
- Keep all product changes inside the Deliberation plugin boundary and public Plugin SDK seams per `extensions/AGENTS.md`.
- Treat a stale owner assertion separately from contract/runtime correctness; never remove required `pipelineId` or `deliveryTarget` fields to make it pass.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was unavailable. Applicable rules: external authority defines the wire, authority gates precede behavioral TDD, and acceptance work does not grant protocol authority.

## Available Skills

- `tdd`: preserve the parent RED and capture fresh same-command GREEN in the follow-up proof.
- `task-evidence`: extract parent command/outcome history without reconstructing missing logs.
- `openclaw-testing`: choose serial focused, plugin, owner-backed, and changed-surface checks.
- `validate-implementation`: verify the final boundary against the canonical task and repository rules.
- `autoreview`: perform the mandatory bounded fresh review after code and proof are complete.
- `save-learning`: run last and save at least one learning after all implementation and evidence work.

## Implementation

1. Run the authority preflight and record current HEAD plus all four expected/actual hashes in `plans/checkpoints/swift-vale-0374.evidence.md`; do not touch KM or continue on a mismatch.
2. Inventory the preserved parent hunks against the canonical task. Retain correct contract/provenance, producer, client, adapter, and focused-test changes; modify only gaps found by executable owner-backed scenarios.
3. Change `km-spool-probe.py prepare` to accept an explicit source-context snapshot and cutoff provider event ID. Use owner public APIs to advance the named record, capture that supplied context, draft, review, and enable sender state without deriving history authority from `record.messages`.
4. Refactor `km-listener.cross-repo.ts` fixture helpers just enough to support listener restart over the same disposable SQLite, explicit context preparation, lifecycle projection reads, and bounded legacy setup. Delete `runOwnerTests`, `OWNER_CHARACTERIZATION`, and `OWNER_E2E`.
5. Implement every named leaf as one top-level `node:test` scenario against the random-loopback listener and disposable spool:
   - OR-07/08: submit two distinct authenticated same-window events plus exact/conflicting replay; assert two records, exact duplicate count, and zero mutation on conflict.
   - OR-09/10: submit account/channel variants and explicit source-history context; assert isolation, singular pending records, and context remaining separate from intake identity.
   - OR-11/12: drive ready/reserve through `createKmClient`; assert immutable pipeline/source/target/envelope, no target override, CAS conflict zero mutation, and exact replay.
   - OR-13/14: drive `createFinalDeliveryAdapter`; inspect the spool before the provider callback, assert one callback, then exact SENT receipt persistence and replay behavior.
   - OR-15/16: inject typed rejection versus timeout/transport ambiguity; assert only the typed result completes FAILED and ambiguous invocation remains fenced without a second callback.
   - OR-17/18: restart the isolated listener over the same database; assert invoked-unknown remains nonreservable, while a public owner reconciliation of never-invoked abandonment alone yields a new attempt ID.
   - OR-19/20: feed owner-produced legacy/tampered histories through the real client response parser; assert legacy unknown never authorizes retry and all pipeline/source/target/envelope/receipt drift fails closed without provider calls.
   - OR-21: invoke the verified owner’s bounded migration entry point only against a disposable legacy database; assert atomic rollback on failure, version bounds, and audit-only historical outcomes.
6. Run the unchanged three KM composed selectors. Fix only OpenClaw serialization/parsing/adapter defects exposed by owner-valid assertions; if the sole failure still expects fields forbidden by the verified contract, preserve the exact failure as an owner-side blocker and do not claim convergence complete.
7. Use `skill:task-evidence` for `cool-vale-4616`, link its genuine RED from the new proof, and capture fresh output from the identical OR-19/OR-20 command as GREEN. Do not manufacture a new RED after the implementation exists.
8. Write `plans/checkpoints/swift-vale-0374.evidence.md` with exact commands, exit codes, current HEAD, four hashes, touched boundaries, OR-07..OR-21 one-by-one results, composed E2E result, focused checks, cleanup proof, and forbidden-action confirmation. Update `plans/checkpoints/swift-vale-0374.checkpoint.md` only from captured evidence.
9. Run `git diff --numstat`, trim avoidable production growth, validate with `skill:validate-implementation`, and run a bounded `skill:autoreview` until no actionable finding remains. Run `skill:save-learning` as the final action.

## Files To Modify

| Path                                                                     | Change                                                                                                           |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`              | Replace pytest wrappers with real OR-07..OR-21 composed scenarios and reusable isolated lifecycle helpers.       |
| `extensions/deliberation/scripts/km-spool-probe.py`                      | Accept explicit history context and expose only verified public owner setup/reconciliation/migration operations. |
| `extensions/deliberation/scripts/intake-producer.test.ts`                | Add serialization-level support only if the real same-window scenario exposes a producer defect.                 |
| `extensions/deliberation/src/{contract,km-client,final-adapter}.test.ts` | Preserve existing coverage; add regressions only for defects found by the real owner gate.                       |
| `extensions/deliberation/contracts/*.json`                               | Preserve exact verified mirrors/provenance; update only after a documented accepted-hash change.                 |
| `plans/checkpoints/swift-vale-0374.red-green-proof.md`                   | Link genuine parent RED and capture fresh identical-command GREEN.                                               |
| `plans/checkpoints/swift-vale-0374.evidence.md`                          | Store the exact provenance, per-leaf, composed, focused, cleanup, and forbidden-action ledger.                   |
| `plans/checkpoints/swift-vale-0374.checkpoint.md`                        | Summarize only evidence materially present in the task-owned artifacts.                                          |

## TDD

Implement the evidence cycle with `skill:tdd`, but reuse the genuine parent RED as explicitly required. Do not alter passing code to fabricate another failure.

**Existing test file:** `extensions/deliberation/src/km-client.test.ts`  
**Fresh GREEN command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`  
**Proof file:** `plans/checkpoints/swift-vale-0374.red-green-proof.md`

```ts
import { describe, expect, it } from "vitest";

// Append inside the existing describe block and reuse its real local helpers.
it("OR-19 legacy-not-sent-unknown-never-authorize-retry", async () => {
  const legacy = {
    ordinal: 1,
    attemptId: "legacy-unknown",
    completionOutcome: "DELIVERY_UNKNOWN",
    outcome: "DELIVERY_UNKNOWN",
    providerAttemptId: "provider-legacy",
    providerReceiptId: null,
    providerMessageId: null,
    proofReference: null,
    completedAt: null,
    deliveryEnvelope: null,
    deliveryEnvelopeDigest: null,
    reserveIdempotencyKey: "reserve:legacy",
    terminalReason: "delivery_outcome_unknown",
  };
  const client = createClient({
    protocolVersion: 1,
    record: {
      recordId: "record-1",
      state: "SENT",
      version: 9,
      delivery: { attempts: [legacy, { ...validTerminalAttempt(), ordinal: 2 }] },
    },
  });

  await expect(
    client.completeDelivery({
      reservation: { ...validReservation(), ordinal: 2 },
      providerAttemptId: "provider-1",
      outcome: "SENT",
      providerReceiptId: "receipt-1",
      providerMessageId: "message-1",
    }),
  ).rejects.toThrow("unauthorized delivery retry");
});
```

| Test                                         | RED provenance                                                                             | Required GREEN                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| OR-19 legacy NOT_SENT/DELIVERY_UNKNOWN retry | Parent proof: three focused assertions resolved instead of rejecting, exit 1.              | Identical command rejects both unauthorized histories, exit 0.                           |
| OR-20 historical immutable-evidence drift    | Parent proof: drifted history resolved instead of rejecting, exit 1.                       | Identical command rejects drift/tamper, exit 0.                                          |
| OR-07..OR-21 composed owner gate             | Current harness uses synthetic pytest wrappers, so named passes do not prove the boundary. | Every exact leaf runs a real isolated OpenClaw/owner scenario once with no skip/failure. |

## Verification

1. Focused regressions: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`.
2. Owner gate: `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration`; require HEAD/four hashes, OR-07..OR-21 exactly once, real composed execution, cleanup, and exit 0.
3. KM composed selectors from the verified KM root: `PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib OPENCLAW_FORK_ROOT=/Users/michal/Projects/openclaw-fork .venv/bin/pytest tests/integration/test_deliberation_v2_e2e.py -q -k 'test_real_producer_listener_to_ready_to_send_is_deterministic_and_audited or test_composed_send_uses_real_public_plugin_adapter_once_and_persists_fake_receipt or test_public_plugin_adapter_rejects_target_mismatch_without_fake_send'`.
4. Plugin and static checks, serially: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`, `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, `pnpm lint:extensions`, `pnpm build`, `pnpm changed:lanes --json`, `pnpm check:changed`, and `git diff --check`.
5. Record unrelated/infrastructure failures separately; no aggregate pass substitutes for a missing OR leaf or composed selector.

## Constraints

- Modify only OpenClaw files; KM source, Git metadata, services, credentials, configuration, and production spool remain read-only.
- Do not deploy, install/link/build in KM, restart Gateway/services, send to a live provider, or activate a pilot.
- Preserve unrelated worktree changes and do not overwrite parent evidence.

_Status: DRAFT_
