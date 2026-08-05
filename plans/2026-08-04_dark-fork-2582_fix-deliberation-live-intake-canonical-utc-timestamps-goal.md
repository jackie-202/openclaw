# Plan 2026-08-04: Repair Deliberation Canonical Timestamp Acceptance

Preserve the existing timestamp fix and make its implementation and TDD provenance inspectable by the follow-up acceptance run.

_Status: DRAFT_

## Progress

- [x] Phase 0: Initialize canonical plan file
- [x] Phase 1: Inspect preserved implementation and tests
- [x] Phase 2: Load relevant learning and historical proof
- [x] Phase 3: Finalize implementation and verification steps

## Analysis

### Codebase context

- `extensions/deliberation/src/intake.ts:18` already contains the preserved private formatter and applies it to `occurredAt` and `receivedAt` at payload construction.
- `extensions/deliberation/src/hooks.test.ts:105` already covers exact-second `Z` and non-zero `.120Z` values through `createKmClient`; no duplicate test is needed unless fresh verification exposes a defect.
- `extensions/deliberation/src/km-client.ts:502` serializes the intake object unchanged, making the existing fetch assertion the wire boundary.
- `extensions/deliberation/index.ts:17` is the production registration path. Goal-003 routing and fail-closed behavior is already accepted and stays out of scope.
- The relevant implementation remains uncommitted in a dirty worktree; unrelated changes must not be included in task-scoped evidence.

### Documentation and prior plan

- `plans/2026-08-04_quick-peak-3638_fix-deliberation-live-intake-canonical-utc-timestamps.md` defines the original implementation and focused command.
- `plans/checkpoints/quick-peak-3638.red-green-proof.md` contains the genuine old-behavior RED and a parent GREEN, although the acceptance payload did not expose the complete artifact.
- `plans/checkpoints/acceptance-runs/quick-peak-3638-acceptance-001/result.json` rejects missing task-scoped implementation and current-run GREEN evidence.
- `docs/plugins/reference/deliberation.md` documents unchanged intake and fail-closed behavior; no product-doc edit is needed.

### Knowledge base

- `learnings/test-failures/quick-peak-3638-test-canonical-timestamps-at-request-boundary.md`: prove canonical timestamps in serialized JSON, pairing exact seconds with a non-zero fraction.
- `learnings/tooling/evidence-only-tdd-followups-preserve-historical-red.md`: link the genuine parent RED and capture fresh GREEN without reverting working code.
- `learnings/tooling/2026-08-02-current-run-canonical-gate-provenance.md`: do not relabel local output as canonical; record a current acceptance-run gate reference when available.
- Knowledge search used local fallback because collection `openclaw-fork-learnings` was unavailable; the returned generic architecture files added no task-specific constraints.

## Available Skills

- `tdd`: preserve historical RED provenance and record the follow-up GREEN.
- `task-evidence`: recover exact parent commands only if the existing proof is unavailable or disputed.
- `acceptance`: finalize structured acceptance findings after implementation proof exists.
- `validate-implementation`: check the repaired evidence against goals 001, 002, and 004.
- `save-learning`: mandatory final implementation-session action.

## Solution

Treat the preserved formatter and request-boundary regression as the implementation. Change production or test code only if inspection or fresh GREEN reveals that either is absent or defective; otherwise repair the acceptance artifacts and provenance only.

## Implementation

1. Compare `extensions/deliberation/src/intake.ts` and `extensions/deliberation/src/hooks.test.ts` with the parent plan. Keep `canonicalUtcTimestamp(date).replace(/\.000Z$/, "Z")`, both call sites, and the exact-second/`.120Z` serialized-request cases; do not redo accepted routing or fail-closed work.
2. Capture a task-scoped diff for the formatter, both timestamp assignments, and the two regression rows in `plans/checkpoints/dark-fork-2582.evidence.md`. Exclude unrelated dirty-worktree files and clearly identify any inseparable pre-existing hunks.
3. Use `skill:tdd` in follow-up mode: link the genuine RED in `plans/checkpoints/quick-peak-3638.red-green-proof.md`, then run the identical focused command and record fresh GREEN in `plans/checkpoints/dark-fork-2582.red-green-proof.md`. Never revert the fix or weaken the test to manufacture RED.
4. Run the Deliberation TypeScript gate and `git diff --check`; record commands, exit codes, test counts, and timestamps in the follow-up evidence. If a caller-owned canonical gate is available, record its run ID separately rather than relabeling local output.
5. Run the mandatory fresh scoped autoreview until no accepted/actionable findings remain, then use `skill:validate-implementation` against goals 001, 002, and 004.
6. Invoke `skill:save-learning` as the final action and save at least one learning about preserving implementation provenance across acceptance follow-ups.

## Files to Modify

| File                                                  | Action                                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/intake.ts`               | Preserve the existing formatter and both call sites; edit only if fresh inspection finds a real defect.        |
| `extensions/deliberation/src/hooks.test.ts`           | Preserve the existing real-client exact-second and `.120Z` cases; edit only if fresh verification finds a gap. |
| `plans/checkpoints/dark-fork-2582.evidence.md`        | Add the scoped implementation diff and exact verification outcomes.                                            |
| `plans/checkpoints/dark-fork-2582.red-green-proof.md` | Link parent RED and capture fresh follow-up GREEN.                                                             |
| `learnings/<category>/<new-learning>.md`              | Save the mandatory session learning last.                                                                      |

## TDD

Implement the follow-up cycle with `skill:tdd`. The executable regression already exists in `extensions/deliberation/src/hooks.test.ts:105`; do not append a duplicate.

**Test file:** `extensions/deliberation/src/hooks.test.ts`
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
**Proof files:** historical RED in `plans/checkpoints/quick-peak-3638.red-green-proof.md`; fresh GREEN in `plans/checkpoints/dark-fork-2582.red-green-proof.md`

```ts
import { createKmClient } from "./km-client.js";

// Existing executable test inside describe("deliberation hooks").
it.each([
  ["exact second", "2026-08-04T07:13:50Z", "2026-08-04T07:13:51Z"],
  ["non-zero milliseconds", "2026-08-04T07:13:50.120Z", "2026-08-04T07:13:51.120Z"],
])(
  "sends canonical KM timestamps for a live-shaped %s event",
  async (_, occurredAt, receivedAt) => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(receivedAt));
      const bodies: Array<{ occurredAt: string; receivedAt: string }> = [];
      const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as {
          occurredAt: string;
          receivedAt: string;
        };
        bodies.push({ occurredAt: body.occurredAt, receivedAt: body.receivedAt });
        const canonical = [body.occurredAt, body.receivedAt].every(
          (value) =>
            /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) && !value.endsWith(".000Z"),
        );
        return new Response(
          JSON.stringify(
            canonical
              ? {
                  protocolVersion: 1,
                  recordId: "record-1",
                  inboundId: "inbound-1",
                  duplicate: false,
                }
              : { protocolVersion: 1, error: { code: "SCHEMA_INVALID", message: "timestamp" } },
          ),
          { status: canonical ? 201 : 400 },
        );
      });
      const client = createKmClient({
        config,
        openclawConfig: {} as never,
        fetchImpl,
        env: { KM_TOKEN: "test-only" },
      });
      const handler = createInboundClaimHandler(config, client, createLogger());

      await expect(
        handler(
          {
            channel: "discord",
            content: "message",
            isGroup: true,
            senderId: "sender-1",
            timestamp: Date.parse(occurredAt),
          },
          { ...sourceContext, messageId: "1534097014340456599" },
        ),
      ).resolves.toEqual({ handled: true }); // RED: raw toISOString() returns handled:false.
      expect(bodies).toEqual([{ occurredAt, receivedAt }]);
    } finally {
      vi.useRealTimers();
    }
  },
);
```

The implementation agent must retain this existing body at `extensions/deliberation/src/hooks.test.ts:105`, not append another copy.

| Case              | Historical RED                                                             | Follow-up GREEN                                                             |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Exact second      | Parent proof shows `.000Z`, KM-shaped rejection, and `{ handled: false }`. | Both serialized fields equal `...ssZ`; handler returns `{ handled: true }`. |
| Non-zero fraction | Parent row protects against broad fraction stripping.                      | Both serialized fields retain `.120Z`.                                      |

### Verification

1. `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
2. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
3. `git diff --check -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts plans/checkpoints/dark-fork-2582.evidence.md plans/checkpoints/dark-fork-2582.red-green-proof.md`

## Dependencies

- The parent RED/GREEN proof is historical evidence; keep it immutable and link it from the new run.
- The current dirty worktree contains unrelated changes. Never revert, stage, or report them as part of this repair.
- No dependency, config, schema, public API, or product-doc change is required.
