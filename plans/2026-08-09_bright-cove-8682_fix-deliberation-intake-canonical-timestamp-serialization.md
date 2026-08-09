# Plan 2026-08-09: Fix Deliberation intake canonical timestamp serialization

Pin the reported Discord timestamp at the serialized KM request boundary, and change production code only if that test reproduces a mismatch.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/intake.ts:18` converts exact seconds from `.000Z` to `Z` and appends three zeros to non-zero ISO milliseconds before constructing both KM timestamp fields.
- Standard `Date#toISOString()` returns `.816Z`; the current helper returns `.816000Z` with six fractional digits, not nine. A direct Node probe and the focused hook suite confirm this current behavior.
- `extensions/deliberation/src/hooks.test.ts:324` already exercises whole seconds and `.120000Z` through `createKmClient`; `extensions/deliberation/src/km-client.ts:664` JSON-serializes the intake body unchanged.
- Existing dirty changes in `intake.ts` and `hooks.test.ts` concern source admission. Preserve them and keep routing, duplicate/idempotency handling, terminal claims, and fail-closed dispatch out of this change.

### Relevant Documentation

- `extensions/deliberation/contracts/km-wire-v1.json:57` keeps intake closed but does not define timestamp normalization; the task-provided KM parser/reserializer behavior is the authority for six fractional digits.
- `docs/plugins/reference/deliberation.md:59` documents the unchanged wire route and idempotent probe behavior; no docs edit is needed.

### Knowledge Base

- `learnings/test-failures/quick-peak-3638-test-canonical-timestamps-at-request-boundary.md`: assert exact serialized JSON through the real KM client rather than a permissive mocked client.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: require genuine RED evidence before claiming a production fix.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; the other returned architecture notes add no timestamp-specific constraint.

## Available Skills

- `tdd`: capture RED/GREEN evidence if the concrete regression fails.
- `validate-implementation`: verify the final diff against serialization and unchanged intake behavior.
- `save-learning`: save the mandatory implementation-session learning last.

## Solution

Add the concrete `.816Z` case and reject fractions longer than six digits at the existing serialized-request seam. If this is already GREEN, make no behavior-neutral edit to `canonicalUtcTimestamp()`; if it is RED in the implementation checkout, replace the formatter with explicit whole-second stripping and three-digit-to-six-digit padding only.

## Implementation

1. Use `skill:tdd` to change the existing timestamp table in `extensions/deliberation/src/hooks.test.ts` to the observed `2026-08-08T16:23:38.816Z` event, assert exact output `2026-08-08T16:23:38.816000Z`, retain a whole-second row, and reject `\.\d{7,}Z`.
2. Run the focused test before production edits. If it passes, record that the reported nine-digit premise is not reproducible and leave `extensions/deliberation/src/intake.ts` unchanged.
3. Only on genuine RED, rewrite `canonicalUtcTimestamp()` so `.000Z` becomes `Z` and a non-zero three-digit ISO fraction gains exactly three trailing zeros. Keep both existing call sites and all listener/KM validation unchanged.
4. Re-run the Deliberation tests and package TypeScript gate. Confirm duplicate intake still produces one record and both first and duplicate submissions remain handled.
5. Run `skill:validate-implementation`; save the required session learning with `skill:save-learning` as the final implementation action.

## Files to Modify

| File                                                    | Change                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/hooks.test.ts`             | Add the concrete `.816Z` request-boundary regression and explicit over-precision rejection. |
| `extensions/deliberation/src/intake.ts`                 | Edit only if the new regression is genuinely RED; preserve both timestamp call sites.       |
| `plans/checkpoints/bright-cove-8682.red-green-proof.md` | Record the pre-edit result and any genuine RED/GREEN cycle.                                 |

## TDD

Implement the cycle with `skill:tdd`. Do not manufacture RED by reverting the already-correct formatter; a pre-edit GREEN means no production fix is justified.

**Test file:** `extensions/deliberation/src/hooks.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts -- --reporter=verbose`  
**Edit hint:** Replace the existing non-zero row in `sends canonical KM timestamps...` and retain its real-client request-body assertion.

```ts
it.each([
  ["exact second", "2026-08-08T16:23:38.000Z", "2026-08-08T16:23:38Z"],
  ["reported .816Z regression", "2026-08-08T16:23:38.816Z", "2026-08-08T16:23:38.816000Z"],
])("serializes KM %s timestamps canonically", async (_, input, expected) => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date(input));
    const bodies: Array<{ occurredAt: string }> = [];
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { occurredAt: string };
      bodies.push(body);
      return new Response(
        JSON.stringify({
          protocolVersion: 1,
          recordId: "record-1",
          inboundId: "inbound-1",
          duplicate: false,
        }),
        { status: 201 },
      );
    });
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });
    const handler = createInboundClaimHandler(config, client, createLogger());

    await handler(
      {
        ...canonicalMessageFacts,
        channel: "discord",
        content: "Jdeme testovat",
        timestamp: Date.parse(input),
      },
      { ...sourceContext, messageId: "1535684929403359352", senderId: "sender-1" },
    );

    expect(bodies[0]?.occurredAt).toBe(expected);
    expect(bodies[0]?.occurredAt).not.toMatch(/\.\d{7,}Z$/);
  } finally {
    vi.useRealTimers();
  }
});
```

| Case               | Pre-edit result                                                                          | Required result                                           |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Whole second       | Expected GREEN under current helper                                                      | `2026-08-08T16:23:38Z`                                    |
| `.816Z` regression | If RED, capture actual serialized value before editing; current source is expected GREEN | Exactly `.816000Z`, never seven or more fractional digits |

### Verification

1. `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
2. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
3. `git diff --check -- extensions/deliberation/src/intake.ts extensions/deliberation/src/hooks.test.ts plans/checkpoints/bright-cove-8682.red-green-proof.md`

## Dependencies

- No dependency, schema, config, public API, listener-validation, or documentation change is required.
- Preserve concurrent uncommitted source-admission changes; do not revert or fold them into timestamp evidence.
