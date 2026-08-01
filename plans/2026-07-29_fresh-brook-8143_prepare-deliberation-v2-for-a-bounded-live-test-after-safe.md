# Plan 2026-07-29: Prepare Deliberation v2 For Bounded Live Test

Repair only fork-owned Deliberation surfaces so a later activation task can enable a bounded pilot without sending during this task.

## Analysis

### Codebase Context

- `extensions/AGENTS.md`: keep Deliberation as a plugin-boundary package using `openclaw/plugin-sdk/*`; no core internals or cross-extension imports.
- `extensions/deliberation/index.ts`: registers `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`, one worker service, CLI commands, and `deliberation.*` Gateway controls.
- `extensions/deliberation/src/km-client.ts`: current client uses `/v1/*` paths and `x-deliberation-wire-version: 1`; reconcile against the task/audit contract before changing behavior.
- `extensions/deliberation/src/intake.ts`: intake returns non-claiming results; `before_dispatch` silences configured source routes even when v2 work is disabled.
- `extensions/deliberation/src/poll-service.ts`: worker reads KM controls, skips work during sender-disabled or safe-silence, lists, reserves, and sends only reserved attempts.
- `extensions/deliberation/src/final-send.ts`: sole production `sendDurableMessageBatch` call; maps unconfigured route and uncertain provider outcomes to KM completion without replay.
- `extensions/deliberation/contracts/*.json`: current fixtures are sparse summaries; `plans/checkpoints/warm-fork-8996.checkpoint.md` says authoritative KM-owner fixtures were still missing.
- `plans/investigations/bright-vale-8642_final-deliberation-v2-readiness-audit.md`: required by task but absent locally; treat as missing immutable input unless its quoted evidence is sufficient and non-conflicting.
- `plans/investigations/swift-mist-4312_audit-deliberation-v1-residue-in-openclaw-fork.md`: proves no v1/thoughtful-response executable residue and classifies `/v1/*` as current wire-version naming, not retired implementation residue.
- `plans/investigations/wild-peak-6037_investigate-deliberation-v2-standard-plugin-capabilities.md`: bounds guarantees to loaded-plugin fail-closed silence, cooperative session isolation, KM reservation authority, and one platform-send attempt.
- Existing tests cover plugin registration, config, hooks, KM parsing basics, worker CAS/safe-silence, final-send receipt mapping, sole-send ownership, and contract hashes; add missing contract-schema and preparation-mode coverage.

### Relevant Documentation

- `pnpm docs:list`: passed for discovery; relevant entries include `plugins/reference/deliberation.md`, `plugins/sdk-channel-outbound.md`, `plugins/sdk-entrypoints.md`, `plugins/sdk-overview.md`, `plugins/sdk-testing.md`, and `reference/secretref-credential-surface.md`.
- `docs/plugins/reference/deliberation.md`: update exact config fields, read-only preflight/health, non-sending preparation defaults, and rollback-to-safe-silence with no v1 restore.
- `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`: preserve bounded guarantee language; do not claim exactly-once visible delivery.
- `docs/investigations/deliberation-v1-residue-audit-openclaw-fork.md`: keep v1-residue facts aligned if implementation changes wire/control naming.

### Knowledge Base

- `learnings/architecture/2026-07-27_do-not-invent-missing-external-wire-contracts.md`: stop rather than guess missing KM paths, schemas, lease/CAS, or recovery semantics.
- `learnings/architecture/2026-07-28_external-contract-gates-precede-behavioral-tdd.md`: verify immutable contract inputs before writing behavior tests that would encode invented semantics.
- `learnings/architecture/2026-07-28_route-delivery-recovery-through-canonical-reservation.md`: all recovery must return through KM reservation; reconciliation must not send directly.
- `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`: do not treat `/v1/*` or `*-v1.json` as retired residue without activation proof.
- Recall search: backend `local`, collection `openclaw-fork-learnings`, diagnostic `Collection not found: openclaw-fork-learnings`.

## Available Skills

- `tdd`: use for the first implementation step; capture RED/GREEN evidence in `plans/checkpoints/fresh-brook-8143.red-green-proof.md`.
- `openclaw-testing`: choose the smallest safe test/build/typecheck gates after changes.
- `technical-documentation`: use if documentation edits need structure or link review beyond small updates.
- `save-learning`: mandatory final implementation-step skill after the task-owned checkpoint is written.

## Solutions

- Gate on contract authority first: read the task file, absent named audit status, existing contract fixtures, provenance, and prior checkpoints; if canonical KM paths/schemas/control semantics cannot be reconstructed without guessing, write `plans/checkpoints/fresh-brook-8143.checkpoint.md` and stop with no product edits.
- If contract is sufficient, replace sparse contract summaries with closed request/response fixture schemas and provenance; keep one canonical wire path family only.
- Align `km-client.ts`, `index.ts`, and tests to the canonical paths, headers, control methods, and lifecycle semantics; delete any alternate route rather than preserving compatibility.
- Preserve non-sending preparation: plugin config can be loadable, but intake and sender remain disabled by KM controls until a later task enables them; no v1 fallback and no direct provider send outside `reserve -> sendReservedAttempt -> complete`.
- Update docs and checkpoint proof so a later activation task has exact fields and read-only preflight commands, not live mutation instructions.

## Implementation

1. Read `plans/tasks/2026-07-29_prepare-deliberation-v2-for-a-bounded-live-test-after-safe-s.md`, `plans/checkpoints/warm-fork-8996.checkpoint.md`, current `extensions/deliberation/contracts/*`, and the available investigations; record whether the absent `bright-vale-8642` audit is blocking.
2. If blocked, write `plans/checkpoints/fresh-brook-8143.checkpoint.md` naming the exact missing immutable input: canonical KM base path, request/response schemas, control operation schema, CAS/lease semantics, reconciliation outcome schema, or provenance owner/hash.
3. Create TDD RED tests before production edits for canonical wire, disabled controls, duplicate intake, reservation, one send attempt, receipt/reconciliation, and rollback silence assumptions.
4. Replace `extensions/deliberation/contracts/*.json` with closed canonical fixtures only if the contract gate passes; regenerate `provenance.json` hashes in the same edit.
5. Update `extensions/deliberation/src/km-client.ts` so all methods use the single canonical path family, required protocol header, closed parsers, and canonical request bodies; remove any alternate `/v1/*` versus `/deliberation/v1/*` variant.
6. Update `extensions/deliberation/index.ts` control registration to expose read-only `status`/`health` and write controls that exactly match the control fixture; ensure `reconcile` only requeues through KM and never sends.
7. Update `extensions/deliberation/src/intake.ts` only if the canonical intake schema differs; keep processing-route exclusion, stable-message-id requirement, non-claiming intake, and independent terminal silence.
8. Update `extensions/deliberation/src/poll-service.ts` only if the canonical reserve/list contract differs; keep disabled/safe-silence skips and serialized reservation before send.
9. Update `extensions/deliberation/src/final-send.ts` only for canonical completion schema changes; keep the sole provider attempt and no replay on unknown/partial outcomes.
10. Update `docs/plugins/reference/deliberation.md` with exact config fields, SecretRef requirement, preparation-mode defaults, read-only `health`/`status` preflight, non-sending activation handoff, and rollback by removing/disabling v2 back to safe silence only.
11. Write `plans/checkpoints/fresh-brook-8143.checkpoint.md` with exact commands/results, contract gate result, changed files, and explicit statement that no live config, routes, spool, Gateway, external service, or message send was mutated.
12. Run `save-learning` and save at least one learning about contract-gated planning/implementation discoveries.

## Files to Modify

| File                                                         | Change                                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`          | Replace sparse summary with canonical closed wire fixture, or leave unchanged and stop if authority is missing. |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Align control operations, schemas, disabled semantics, and reconciliation rules to canonical contract.          |
| `extensions/deliberation/contracts/provenance.json`          | Update hashes/provenance only after accepted fixture replacement.                                               |
| `extensions/deliberation/src/km-client.ts`                   | Canonicalize paths/header/request bodies/closed response parsers; remove competing route variants.              |
| `extensions/deliberation/index.ts`                           | Align control method registration and CLI behavior to canonical control fixture.                                |
| `extensions/deliberation/src/intake.ts`                      | Adjust intake mapping only if canonical schema requires it; preserve silence semantics.                         |
| `extensions/deliberation/src/poll-service.ts`                | Adjust list/reserve lifecycle only if canonical schema requires it; preserve disabled/safe-silence skips.       |
| `extensions/deliberation/src/final-send.ts`                  | Adjust completion payloads only if canonical schema requires it; preserve sole provider attempt.                |
| `extensions/deliberation/src/*.test.ts`                      | Add focused compatibility, disabled, duplicate, reservation, send, receipt, reconciliation, and rollback tests. |
| `docs/plugins/reference/deliberation.md`                     | Document exact preparation config, read-only preflight, activation handoff, and rollback-to-safe-silence.       |
| `plans/checkpoints/fresh-brook-8143.checkpoint.md`           | Record exact evidence and any blocked missing input.                                                            |

## TDD

**Workflow for implementing agent:**

1. Implement the TDD cycle with `skill:tdd`.
2. Create/update the test file below first.
3. Run the focused test and verify RED.
4. Implement the smallest passing production/docs changes.
5. Run the focused test and verify GREEN.
6. Record RED/GREEN evidence in `plans/checkpoints/fresh-brook-8143.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Framework:** Vitest through repo wrapper  
**Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`  
**Edit hint:** append to `describe("KM contract parsing", ...)`.

```ts
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient } from "./km-client.js";

describe("KM canonical wire contract", () => {
  it("uses the canonical v2 base path and protocol header for intake", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ status: "accepted", recordId: "record-1" }), { status: 200 }),
      );
    const client = createKmClient({
      config: parseDeliberationConfig({
        enabled: true,
        failClosed: true,
        sources: [{ channel: "discord", accountId: "acct", target: "source" }],
        processingSource: { channel: "discord", accountId: "acct", target: "processing" },
        km: {
          endpoint: "https://km.invalid",
          credential: { source: "env", provider: "default", id: "KM_TOKEN" },
          requestTimeoutMs: 1000,
          pollIntervalMs: 1000,
        },
        restrictedSessionKeys: ["agent:reviewer"],
      }),
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await client.intake({ idempotencyKey: "key", route: {}, message: {} });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://km.invalid/deliberation/v1/intake");
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
      "x-deliberation-protocol": "v1",
    });
  });
});
```

| Test                                                             | RED                                                                                     | GREEN                                                                                                                                                                             |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uses the canonical v2 base path and protocol header for intake` | Current client calls `https://km.invalid/v1/intake` with `x-deliberation-wire-version`. | Client uses the canonical contract path/header, or the implementer replaces this skeleton with the exact audit-quoted canonical values before RED if the contract says otherwise. |

### Additional Focused Tests

- `extensions/deliberation/src/hooks.test.ts`: assert duplicate intake response remains non-claiming and source route stays terminally silent when intake/sender controls are disabled.
- `extensions/deliberation/src/poll-service.test.ts`: assert disabled sender never lists/reserves/sends; assert one reserved attempt across competing workers.
- `extensions/deliberation/src/final-send.test.ts`: assert at-most-one provider call and full sanitized receipt/completion mapping for sent, partial, failed-before-send, and unknown.
- `extensions/deliberation/src/km-client.test.ts`: assert closed list/reserve/complete/reconcile schemas and duplicate/disabled/safe-silence response parsing.
- `extensions/deliberation/src/contract.test.ts`: assert fixture hashes and no competing route variants remain in contract files.

### Verification Commands

- `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
- `node scripts/run-vitest.mjs extensions/deliberation src/plugins/source-checkout-runtime.test.ts --reporter=verbose`
- `pnpm docs:list`
- `pnpm lint:docs docs/plugins/reference/deliberation.md plans/checkpoints/fresh-brook-8143.checkpoint.md`
- `pnpm docs:check-mdx`

## Dependencies

- Do not inspect or mutate live config, Jackie workspace runtime state, KM System, Mission Control, crons, channels, spool data, Gateway processes, or external services.
- Do not proceed past the contract gate if `bright-vale-8642` contains canonical values not present in repository-local artifacts or quoted task evidence.
- Do not add compatibility paths, v1 fallback, direct provider-send fallback, JSON state files, or runtime dual readers.
- Keep `/v1/*` only if proven to be the canonical current wire contract rather than a competing route; otherwise replace it with the single canonical path family.
- Keep all replies and checkpoint references repo-root relative.

---

_Created: 2026-07-29_
_Status: DRAFT_
