# Plan 2026-08-18: Fix Deliberation READY_TO_SEND delivery

Prove and repair the active-runtime seam without adding another sender or changing KM state.

## Analysis

### Current fork state

- `extensions/deliberation/index.ts:30-133` already registers one enabled-only `deliberation-final-delivery` service and all four typed hooks. The service is existing dirty batch work; do not edit it until ownership is handed off.
- `extensions/deliberation/src/final-adapter.ts:161-287` already owns `ready -> reserve -> invoke -> provider.send -> completeDelivery`, serializes ticks, and drains in-flight work on stop.
- `extensions/deliberation/src/plugin.test.ts:96-417` already covers service registration, one Discord send, disabled/conflicted reservations, empty queues, provider failures, non-overlap, and shutdown.
- `src/plugins/loader.ts:2683-2758` in the active fork already enforces manifest `expectedHooks` after registration and rolls back partial registration; `src/plugins/loader.test.ts:6987-7010` proves visible failure. This is clean `HEAD` behavior from `28dacc24ebb`, so do not recreate `calm-dune-8916` changes.
- Plain plugin status can look loaded from manifest metadata: `src/plugins/status-snapshot.ts:69-125` projects `expectedHooks` and an empty service list without executing plugin code. Runtime inspection is required.
- `scripts/test-built-plugin-singleton.mjs:169-235` proves the emitted Deliberation entry and four hooks, but does not currently assert that the built artifact registers `deliberation-final-delivery`.
- The production symptom matches stale/deployed-artifact drift until runtime evidence proves otherwise: no reservation row means the service never reached the KM reservation boundary.

### Contracts and operations

- `extensions/deliberation/contracts/km-wire-v1.json:319-324` keeps reservation CAS, idempotency, invocation fencing, and stale-attempt reconciliation in KM.
- `docs/plugins/reference/deliberation.md:120-122` defines one bounded plugin service as sender and forbids retry after ambiguous provider outcomes.
- `docs/tools/plugin.md:249-266` requires active Gateway status, runtime plugin inspection, and a real Gateway restart after code/load-path changes.
- Existing rollout evidence names the order `host deploy verifier -> full gateway restart -> live smoke`; obtain the canonical verifier command from the active batch handoff rather than inventing one.

### Knowledge base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace manifest, registration, runtime caller, and side-effect authority; inventory alone is not activation proof.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: prove discovery, runtime hooks/services, and the reservation-to-send call separately.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md`: KM owns durable state, Deliberation owns one bounded invocation, and the channel plugin owns provider I/O and receipts.
- Knowledge search used local fallback because collection `openclaw-fork-learnings` was absent (`Collection not found: openclaw-fork-learnings`).

## Available Skills

- `tdd`: capture the actual failing activation/build seam before edits.
- `openclaw-testing`: select focused, build, and changed-file gates.
- `crabbox`: run broad/build or live Discord proof when local scope is insufficient.
- `autoreview`: mandatory fresh implementation review before handoff.
- `save-learning`: final implementation action.

## Implementation

1. Query the live task/batch controller for `calm-dune-8916` in `stage-a7-family13-adaptation-20260818`; record status, owned files, commit/worktree, and handoff. Do not touch overlapping files while ownership is live.
2. Capture read-only evidence from the exact running host: `openclaw gateway status --deep --require-rpc`, `openclaw plugins inspect deliberation --runtime --json`, active process/build identity, resolved plugin source path, four typed hooks, and service list. Treat plain `plugins list/inspect` as insufficient.
3. Compare source, freshly staged `dist-runtime/extensions/deliberation`, linked/deployed artifact, and running process. Confirm `message_sending` and `deliberation-final-delivery` are runtime registrations, not manifest projections.
4. Add the built-artifact service assertion below and establish RED against the failing artifact. If it is already GREEN and runtime inspection shows all hooks/service, make no Deliberation or loader edits; diagnose service startup/KM-ready diagnostics and add a focused RED only for that observed condition.
5. Apply the smallest fix at the proven owner boundary. For a stale artifact, fix only staging/link/package proof. For a missing hook, consume `calm-dune-8916`. For a missing service, repair the existing entry. If the service starts but cannot claim, fix only the observed KM client/config/lifecycle defect.
6. Keep `createFinalDeliveryAdapter()` as the only reservation-to-provider path. Preserve one provider call after invocation fencing, exact durable destination, one receipt/message ID, no retry for unknown outcomes, and stop-time drain.
7. After focused tests, build, built singleton proof, changed checks, and `autoreview`, use only the canonical OpenClaw rollout: host deploy verifier, full Gateway restart, then live smoke.
8. Verify record `786951effe8b9f7eb035954671b80daafca7e6355dff846d53232761dacc24c7` through read-only KM/provider evidence: `SENT`, one `delivery_attempts` row, one provider message ID, and one Discord reply. Do not reserve, send, or mutate it manually.
9. Record root cause, changed files, exact commands/results, artifact/process identities, hook/service inspection, verifier result, and live record/message IDs. Run `save-learning` last.

## Files to Modify

| File | Change |
| --- | --- |
| `scripts/test-built-plugin-singleton.mjs` | Assert the emitted Deliberation plugin registers the four hooks and exactly one final-delivery service. |
| `extensions/deliberation/src/plugin.test.ts` or the test nearest the observed defect | Add RED/GREEN coverage only if runtime evidence reveals a source lifecycle/config defect. |
| Proven owner file | Make the smallest fix selected by step 5; no speculative Deliberation, loader, or KM edits. |

## TDD

Implement with `skill:tdd`; save evidence to `plans/checkpoints/wild-vale-0017.red-green-proof.md`.

**Primary test file:** `scripts/test-built-plugin-singleton.mjs`  
**RED command:** `pnpm build && pnpm test:build:singleton`  
**Edit:** append after the existing built Deliberation hook assertions.

```js
assert.deepEqual(
  deliberation.services,
  ["deliberation-final-delivery"],
  "built Deliberation runtime did not register its sole delivery service",
);
```

| Test | RED | GREEN |
| --- | --- | --- |
| Built sole-send activation | Failing artifact reports no `deliberation-final-delivery` service. | Fresh emitted artifact reports exactly one service plus the four hooks. |
| Missing send hook | Existing loader test reports register-phase error and rolls all hooks back. | `message_sending` is present or activation visibly fails; never loaded-looking runtime success. |
| READY delivery | Focused test for the observed defect produces zero reservations/sends. | One eligible item yields one reservation, invocation, provider call, receipt completion, and no replay. |

If the primary assertion is GREEN before product edits, record that result and do not manufacture RED; switch to a focused test for the next observed runtime failure, or finish as deployment-only when rollout consumes the record.

## Verification

1. `node scripts/run-vitest.mjs extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/sole-send.test.ts src/plugins/loader.test.ts`
2. `pnpm build && pnpm test:build:singleton`
3. `git diff --check` and the changed-file lanes selected by `skill:openclaw-testing`.
4. Fresh `skill:autoreview --mode uncommitted`, then rerun affected proof.
5. Canonical host deploy verifier, `openclaw gateway restart`, `openclaw gateway status --deep --require-rpc`, and `openclaw plugins inspect deliberation --runtime --json`.
6. Read-only live assertion: original record `SENT`, exactly one attempt row, exactly one Discord provider message ID.

## Dependencies

- `calm-dune-8916` ownership must be complete or explicitly handed off before overlapping work.
- The active batch must supply the canonical host deploy verifier and authorized rollout context.
- Preserve all unrelated dirty files; do not modify km-system, production SQLite, cron/listener state, or OpenClaw config.

---

*Status: DRAFT*  
*Created: 2026-08-18*
