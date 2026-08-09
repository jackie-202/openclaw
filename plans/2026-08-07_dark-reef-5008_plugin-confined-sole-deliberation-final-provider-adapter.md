# Plan 2026-08-07: Plugin-confined sole Deliberation final provider adapter

_Status: DRAFT_  
_Created: 2026-08-07_

## Analysis

### Codebase context

- `extensions/deliberation/index.ts` registers only fail-closed intake/dispatch/tool/message hooks and read-only KM methods; no sender service exists.
- `km-client.ts` validates KM v1 requests/reservations/completions but lacks the Slice 5A envelope and durable invocation-ack contract.
- `guards.ts` blocks restricted-session generic sends; `sole-send.test.ts` only rejects `sendDurableMessageBatch` by source-token scan.
- `source-identity.ts` accepts `v1:<provider>:<account>:<channel>`; this is the current KM wire version, not a legacy sender path.
- `history-read.ts` proves the local pattern: parse `sourceTarget`, require exactly one configured route, and use only identity account/channel with a public Discord API.
- `src/plugin-sdk/channel-outbound.ts` exposes durable batch delivery, which conflicts with the required non-durable, non-retrying one-shot send. No inspected public export provides the required account-bound one-shot source send.

### Documentation and knowledge

- `extensions/AGENTS.md` permits production extension imports only through public SDK seams and prohibits core/private imports.
- The two required KM/proposal documents are outside this workspace; the environment denied direct reads. The implementer must read them before any code or schema decision.
- Recall used its local fallback (`openclaw-fork-learnings` collection missing). Relevant learnings require KM to own the wire schema/recovery and require authority/activation proof instead of literal `v1` scans.

## Approach

1. Gate implementation on the pinned Slice 5A envelope and a public one-shot account-bound sender seam.
2. If either gate fails, write only the required evidence-backed blocker; do not change core or invent a wire schema.
3. If both pass, add one local adapter that validates the immutable envelope, durably acknowledges invocation with KM, calls the provider once, and returns closed target-bound evidence.
4. Keep retries, replay, reconciliation, ordering, and invoked-without-receipt unknown classification with KM.

## Implementation

1. Read `05-delivery.md` slice 2/final contract and the proposal Slice 5B section. Cross-check exact envelope version, reservation/correlation fields, invocation acknowledgment, completion vocabulary, receipt fields, and fixtures. Stop if unavailable or inconsistent.
2. Inspect public plugin SDK and Discord plugin API types for an account-bound non-durable single-send function returning a receipt. Reject `sendDurableMessageBatch`, sessions, generic message tools, and private-core imports. If absent, report the inspected APIs, why each fails, and the smallest generic seam required.
3. Add `extensions/deliberation/src/final-adapter.ts` only after both gates. Model envelope and evidence as closed local unions; reject unknown/stale/mismatched reservation, provenance, correlation, idempotency, route, target, bot, and self inputs before a provider call.
4. Extend `extensions/deliberation/src/km-client.ts` only with exact Slice 5A envelope/invocation-ack types and calls. Keep validation strict and bounded; add no retry, replay, reconciliation, or fallback path.
5. Acknowledge invocation with KM before calling the proven sender. On acknowledgment failure return zero-call `delivery_failed`; otherwise call once using only parsed canonical provider/account/channel. Map target-matching receipt to `SENT`; map denial, rejection, 429, transport error, and timeout to `delivery_failed`; leave post-invocation no-receipt as KM-owned unknown.
6. Update `index.ts` only if registration is required by the proven seam. Preserve existing fail-closed guards so drafts, reviews, processing sessions, generic/session/operator/synthetic inputs, and alternate target forms cannot reach the adapter.
7. Replace the token-only ownership test with activation/authority tests proving the adapter is the only final-source caller and rejected paths never reach its fake sender.
8. Run focused fakes-only tests and extension typecheck selected via `skill:openclaw-testing`; inspect `git diff --name-only` and `git diff --numstat` to prove production edits are confined to `extensions/deliberation/`.

## Files to Modify

| File                                                | Change                                                                  |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.ts`      | New sole provider-side adapter, conditional on both gates.              |
| `extensions/deliberation/src/final-adapter.test.ts` | Fake-backed envelope, one-shot, isolation, result, and rejection tests. |
| `extensions/deliberation/src/km-client.ts`          | Exact Slice 5A envelope/invocation-ack contract only.                   |
| `extensions/deliberation/src/km-client.test.ts`     | Closed-schema tests for added KM calls.                                 |
| `extensions/deliberation/src/sole-send.test.ts`     | Runtime authority coverage replacing token scanning.                    |
| `extensions/deliberation/index.ts`                  | Adapter registration only if the public seam requires it.               |

## TDD

Use `skill:tdd`; record RED/GREEN evidence in `plans/checkpoints/dark-reef-5008.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/final-adapter.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { createFinalAdapter } from "./final-adapter.js";

describe("final provider adapter", () => {
  it("does not invoke a malformed envelope", async () => {
    const send = vi.fn();
    const adapter = createFinalAdapter({ acknowledgeInvocation: vi.fn(), send });

    await expect(adapter.deliver({ sourceTarget: "wrong" } as never)).resolves.toMatchObject({
      kind: "delivery_failed",
    });
    expect(send).not.toHaveBeenCalled(); // RED: adapter and closed validation do not exist.
  });
});
```

| Fixture group                                                    | RED                      | GREEN                                                                  |
| ---------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| malformed/stale/mismatched envelope or failed acknowledgment     | adapter/import missing   | zero calls and closed failure                                          |
| accepted envelope                                                | sender wiring missing    | exactly one canonical provider/account/channel call and `SENT` receipt |
| account/channel or receipt mismatch                              | isolation checks missing | no cross-route target or receipt accepted                              |
| bot/self, denial, rejection, 429, transport, timeout             | outcome mapping missing  | closed failure, no retry, zero or one call                             |
| draft/review/processing/generic/session/operator/synthetic paths | authority proof missing  | no path invokes fake sender                                            |

## Dependencies

- Readable, pinned Slice 5A KM contract and fixtures. No substitute schema.
- A public plugin SDK account-bound one-shot sender. The inspected durable batch API is unsuitable; its absence is a blocker, not permission for a core change.
- Existing source-identity fixtures supply canonical route grammar. No config, migration, V1 fallback, or live credentials.

## Available Skills

- `tdd` for RED/GREEN proof.
- `openclaw-testing` for focused test/typecheck selection.
- `validate-implementation` for boundary/diff validation.
- `save-learning` as the required final action.
