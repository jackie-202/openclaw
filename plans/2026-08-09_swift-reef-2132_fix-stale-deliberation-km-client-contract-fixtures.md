# Plan 2026-08-09: Fix stale Deliberation KM client contract fixtures

_Status: DRAFT_

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts`: `parseReadyItem` and `parseReservation` use exact-key validation; ready items require `deliveryEnvelope`, and reservations require `deliveryEnvelope` plus a 64-character `deliveryEnvelopeDigest` before field-level parsing.
- `extensions/deliberation/src/km-client.test.ts`: both failing cases use stale inline reservation fixtures. The endpoint test also omits the active `client.invoke(...)` call and still names six paths.
- `extensions/deliberation/src/final-adapter.ts`: the final-delivery adapter sequence is `ready -> reserve -> invoke -> provider -> complete`, proving `/invocations` and `/completions` are both current client paths.
- `extensions/deliberation/src/final-adapter.test.ts`: the canonical envelope fixture shape is `{ sourceTarget: "v1:discord:account-1:channel-1" }` with a 64-character digest.
- Focused baseline: `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts` reports 11 passed and 2 failed, both at the stale reservation fixtures.

### Relevant Documentation

- `docs/plugins/reference/deliberation.md` and `extensions/deliberation/contracts/km-wire-v1.json` still enumerate the older six-operation accepted contract. They are outside this fixture-only repair and must not be changed without broader contract provenance work.
- `extensions/AGENTS.md` keeps this fix inside the plugin boundary and favors focused contract tests.

### Knowledge Base

- Preserve the accepted external wire shape rather than inventing fixture compatibility (`learnings/architecture/2026-07-27_do-not-invent-missing-external-wire-contracts.md`).
- Treat `/deliberation/v1/*` as the current external protocol and trace active side-effect paths instead of inferring behavior from the version label (`learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`).
- Keep genuine focused RED evidence before edits and fresh GREEN evidence afterward (`learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`).
- Knowledge search used the deterministic local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `compound-plan`: produce and persist this plan.
- `recall-knowledge`: load relevant repository learnings before finalizing.
- `tdd`: preserve RED/GREEN evidence while repairing the focused test fixtures.
- `save-learning`: record planning learnings as the final action.

## Approach

Repair only `km-client.test.ts`. Add canonical ready-item and reservation builders carrying `deliveryEnvelope` and `deliveryEnvelopeDigest`, use them wherever a test needs an otherwise-valid response, and override one field at a time for malformed cases. Keep `parseReadyItem`, `parseReservation`, exact-key checks, and digest requirements unchanged unless the repaired fixtures expose a separate parser defect.

## Implementation

1. Add compact valid fixture builders near `createClient`: ready items include `deliveryEnvelope.sourceTarget`; reservations include the same envelope, a 64-character digest, and a valid 64-character `reviewedTextHash`.
2. Replace duplicated inline ready/reservation objects with builder output so endpoint and malformed-field tests remain synchronized with the canonical response shape.
3. Rename the endpoint test from "six" to "seven", call `client.invoke(...)` with the successful reservation, and assert the ordered paths include `/invocations` before `/completions` while retaining health, ready, intake, reservations, and reconciliations.
4. Split or table-drive malformed fixtures so invalid `deliveryEnvelope`, `deliveryEnvelopeDigest`, and `reviewedTextHash` each preserve all unrelated required keys and assert their specific parser error. Cover the ready-item envelope boundary as well as reservation boundaries.
5. Do not edit `km-client.ts`, contract JSON, docs, runtime configuration, or external KM artifacts unless focused test evidence proves the parser itself violates the repository-local canonical shape.

## Files to Modify

| File                                            | Change                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/km-client.test.ts` | Refresh canonical fixtures, cover seven active paths, and isolate malformed-field assertions. |

## TDD

Implement the RED/GREEN cycle with `skill:tdd` and record evidence in `plans/checkpoints/swift-reef-2132.red-green-proof.md`.

**Target:** `extensions/deliberation/src/km-client.test.ts`  
**Focused command:** `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`

The existing failure is the executable RED skeleton: an otherwise intended valid reservation omits the newly required fields, so the resolve assertion fails at `invalid reservation`.

```ts
import { expect, it } from "vitest";

it("accepts the canonical reservation response", async () => {
  const client = createClient({
    protocolVersion: 1,
    reservation: {
      recordId: "record-1",
      attemptId: "attempt-1",
      ordinal: 1,
      version: 8,
      owner: "sender-1",
      leaseToken: "lease-1",
      leaseExpiresAt: "2026-08-01T12:01:00Z",
      candidateRevision: 1,
      reviewedTextHash: "a".repeat(64),
    },
  });

  await expect(
    client.reserve(
      {
        recordId: "record-1",
        version: 7,
        text: "reviewed reply",
        candidateRevision: 1,
        updatedAt: "2026-08-01T12:00:00Z",
        deliveryEnvelope: { sourceTarget: "v1:discord:account-1:channel-1" },
      },
      "sender-1",
    ),
  ).resolves.toMatchObject({
    outcome: "reserved",
  });
});
```

| Test                          | RED                                                            | GREEN                                                                |
| ----------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Canonical reservation fixture | `invalid reservation` because envelope fields are absent       | Resolves with `outcome: "reserved"` using `validReservation()`       |
| Endpoint path contract        | Existing test stops at reservation and never proves invocation | Ordered assertion contains all seven active paths                    |
| Malformed field boundaries    | Hash case is masked by missing envelope keys                   | Envelope, digest, and hash cases throw their named validation errors |

## Verification

1. Run `pnpm exec vitest run extensions/deliberation/src/km-client.test.ts`.
2. Run `pnpm exec vitest run extensions/deliberation/src extensions/deliberation/scripts/intake-producer.test.ts`.
3. Run `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration` without inspecting or modifying that repository.
4. Record exact test-file and test pass/fail counts for all three commands; stop on any failure rather than weakening closed-schema parsing.
5. Confirm `git diff -- extensions/deliberation/src/km-client.test.ts` contains no production/parser, contract, docs, config, spool, or generated-artifact changes.
