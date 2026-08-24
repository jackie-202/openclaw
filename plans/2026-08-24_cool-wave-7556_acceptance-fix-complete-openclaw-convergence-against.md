# Plan 2026-08-24: Supply attributable OpenClaw owner-convergence changes

Preserve the verified convergence hunks, close the synthetic owner-harness gap, and make the complete product-boundary patch reviewable under this task.

## Analysis

### Codebase Context

- Required implementation is preserved as uncommitted hunks in the contract mirrors/provenance, `intake-producer.ts`, `km-spool-probe.py`, `km-client.ts`, `final-adapter.ts`, and their focused tests; the 13-file boundary diff is roughly 3,202 insertions/1,029 deletions against `HEAD`.
- `km-listener.cross-repo.ts:511` still shells out to owner pytest for OR-08..OR-21, so reporter names do not exercise OpenClaw's producer/client/adapter against one isolated owner spool.
- `km-spool-probe.py:54` still derives source history and cutoff from canonical intake messages instead of accepting the separate source-history snapshot required by the prior plan.
- `extensions/AGENTS.md` keeps all product changes inside the plugin and public Plugin SDK boundary.

### Evidence Context

- `plans/checkpoints/acceptance-runs/swift-vale-0374-acceptance-001/result.json` rejects the task because its supplied diff omitted every required product boundary.
- `plans/checkpoints/swift-vale-0374.{red-green-proof,evidence}.md` preserves genuine OR-19/OR-20 RED/GREEN history and owner hashes, but cannot substitute for attributable implementation.
- The previous evidence's 37-pass claim is not sufficient while OR-08..OR-21 are pytest selector wrappers; fresh proof must bind each OR leaf to a composed scenario.

### Knowledge Base

- Verify all four accepted owner hashes before behavior; KM `HEAD` is provenance, not semantic authority.
- Keep stale owner assertions separate from verified contract behavior; never drop required `pipelineId` or `deliveryTarget` to satisfy drifted E2E expectations.
- Acceptance evidence must expose executable activation and side-effect paths, not names, summaries, or wrapper-selected owner tests.
- A follow-up must link authentic historical RED and run fresh GREEN; setup/provenance failures are not behavioral RED.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: reuse the historical genuine RED and capture same-command GREEN; do not fabricate a new RED.
- `task-evidence`: recover exact parent proof provenance when writing this task's proof ledger.
- `openclaw-testing`: choose focused plugin and owner-backed verification.
- `validate-implementation`, `autoreview`: close project-rule and review gates after implementation.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Run the owner-authority preflight before edits: record current KM `HEAD`, verify the four hashes in `extensions/deliberation/contracts/provenance.json`, and stop on any artifact mismatch. Do not regenerate mirrors from a mismatched checkout.
2. Inventory the preserved diff against `HEAD` and retain the correct contract/provenance, producer, client, adapter, and focused-test hunks. Exclude unrelated architecture-review, changelog, docs, channel, and core work from this task's reviewed patch.
3. Change `km-spool-probe.py prepare` to accept caller-supplied source-history JSON and a cutoff provider event ID. Validate and pass that snapshot through the verified owner public lifecycle APIs; do not reconstruct source context from `record.messages`.
4. Replace `runOwnerTests`, `OWNER_CHARACTERIZATION`, and `OWNER_E2E` in `km-listener.cross-repo.ts` with direct `node:test` scenarios using the existing random-loopback listener, disposable spool, `runIntakeProducer`, `createKmClient`, and `createFinalDeliveryAdapter`.
5. Implement OR-07..OR-10 for two distinct same-window events, exact/conflicting replay, account/channel isolation, and separate explicit source history.
6. Implement OR-11..OR-14 for immutable pipeline/source/target/envelope, CAS and exact replay, invocation before exactly one provider call, and exact SENT receipt persistence.
7. Implement OR-15..OR-18 for definitive rejection versus ambiguous invocation, restart fencing, and owner-authorized never-invoked abandonment with a fresh attempt ID.
8. Implement OR-19..OR-21 using owner-produced legacy/tampered history through the real client parser and bounded migration through the verified owner public entry point, all against disposable state.
9. Add only regressions exposed by those composed scenarios to `intake-producer.test.ts`, `km-client.test.ts`, or `final-adapter.test.ts`; do not churn already-correct product code merely to create task attribution.
10. Before completion, inspect the exact supplied task-scoped diff and require substantive hunks for the mirrors/provenance, producer/probe, KM client, final adapter, OR-07..OR-21 harness, and focused regressions. Do not submit checkpoint prose as a substitute for any missing boundary.
11. Create `plans/checkpoints/cool-wave-7556.red-green-proof.md` by linking the genuine parent OR-19/OR-20 RED and recording fresh output from the identical focused command. Create `plans/checkpoints/cool-wave-7556.evidence.md` with the four hashes, KM `HEAD`, exact per-leaf results, focused checks, composed owner E2E outcome, cleanup, and forbidden-action confirmation.
12. Run `git diff --numstat`, trim avoidable production growth, validate with `skill:validate-implementation`, then run bounded `skill:autoreview` until no actionable findings remain. Invoke `skill:save-learning` as the final implementation-session action and save at least one learning.

## Files in the Repaired Change Set

| Path                                                                                                                             | Action                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1,openclaw-overlay-v1,provenance}.json`                         | Include the preserved verified mirrors and four-hash provenance; change only if the accepted authority changes. |
| `extensions/deliberation/scripts/intake-producer.ts`                                                                             | Include the preserved singular canonical producer implementation.                                               |
| `extensions/deliberation/scripts/km-spool-probe.py`                                                                              | Accept explicit source history/cutoff and expose verified public owner lifecycle operations.                    |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts`                                                                      | Replace pytest wrappers with direct composed OR-07..OR-21 scenarios.                                            |
| `extensions/deliberation/src/km-client.ts`                                                                                       | Include preserved strict parsing, immutable authority, replay, and ambiguity fencing.                           |
| `extensions/deliberation/src/final-adapter.ts`                                                                                   | Include preserved invocation-before-send and one-provider-call behavior.                                        |
| `extensions/deliberation/{scripts/intake-producer.test.ts,src/contract.test.ts,src/km-client.test.ts,src/final-adapter.test.ts}` | Include focused regressions; add cases only for newly exposed defects.                                          |
| `plans/checkpoints/cool-wave-7556.{red-green-proof,evidence}.md`                                                                 | Record task-owned TDD provenance and exact fresh verification.                                                  |

## TDD

Implement the cycle with `skill:tdd`. Reuse the genuine historical RED in `plans/checkpoints/swift-vale-0374.red-green-proof.md`; do not alter passing code to fabricate another failure.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Focused command:** `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/km-client.test.ts -t 'OR-19|OR-20' -- --reporter=verbose`  
**Owner gate:** `OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration`

```ts
import { describe, expect, it } from "vitest";
import { createKmClient } from "./km-client.js";

// Append inside the existing describe block, where createClient,
// validTerminalAttempt, and validReservation are already defined.
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
  ).rejects.toThrow("unauthorized delivery retry"); // Historical RED: resolved.
});
```

The import lines already exist in the target file; add only the test body inside its current `describe` scope. The historical parent run supplies RED, and the unchanged command supplies fresh GREEN.

| Test                       | RED                                                                                    | GREEN                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| OR-19 legacy unknown retry | Parent command exited 1 because legacy `NOT_SENT`/`DELIVERY_UNKNOWN` authorized retry. | Identical focused command rejects both histories.                                          |
| OR-20 historical drift     | Parent command exited 1 because tampered historical authority was accepted.            | Identical focused command rejects pipeline/source/target/envelope drift.                   |
| OR-07..OR-21 composed gate | Current OR-08..OR-21 leaves only run owner pytest selectors.                           | Every named leaf directly exercises OpenClaw and isolated owner state once, with no skips. |

## Verification

1. Focused regressions: `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts -- --reporter=verbose`.
2. Owner-composed gate: `OPENCLAW_DELIBERATION_KM_ROOT="$HOME/.openclaw/workspace/km-system" pnpm test:deliberation:km-integration`; require four verified hashes and one real pass for each OR-07..OR-21 leaf.
3. Run the three existing KM composed selectors from the verified checkout. Preserve an exact stale-assertion failure if it still contradicts the verified schema; do not remove `pipelineId` or `deliveryTarget`.
4. Run `OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test extensions/deliberation -- --reporter=verbose`, `pnpm tsgo:extensions`, `pnpm tsgo:extensions:test`, `pnpm lint:extensions`, `pnpm build`, `git diff --check`, and the repository's changed-surface gate selected by `skill:openclaw-testing`.
5. Record infrastructure or unrelated dirty-worktree failures separately; no aggregate pass replaces a missing product-boundary hunk or OR leaf.

## Dependencies

- Read-only KM owner checkout with its existing `.venv`, matching all four accepted hashes.
- Temporary credential, loopback listener, and disposable SQLite/spool state only; no KM edits, services, production spool, deployment, Gateway restart, live provider send, or pilot activation.
- Preserve unrelated worktree changes and parent evidence files.

_Status: DRAFT_
