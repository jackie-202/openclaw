# Update stale deliberation intake-producer test to optional Discord sourceThreadId semantics

## Background

The deliberation extension changed Discord intake semantics: `sourceThreadId` is now optional and
is NO longer derived from the Discord message id (`providerEventId`). For Discord, `sourceThreadId`
is set only when a genuine thread id is present; otherwise the key is omitted entirely
(optional-by-absence). See current `extensions/deliberation/src/route-match.ts`
(`admitInboundSource`, `normalizedThreadId`) and `src/intake.ts` (spread-conditional
`sourceThreadId`). These changes are intentional and verified: they fix a production bug where
Discord message ids were sent as thread targets, causing provider HTTP 404 delivery failures.

One test was not updated and now fails:

- `extensions/deliberation/scripts/intake-producer.test.ts` > "keeps the configured final target out
  of source intake" — asserts `sourceThreadId: "message-override"` at line ~70-72.

Current run: `pnpm vitest run extensions/deliberation` → 242 passed, 1 failed (only this test).

## Task

Update ONLY the stale test expectation(s) in
`extensions/deliberation/scripts/intake-producer.test.ts` to match the new intentional semantics:

- If the test scenario supplies a Discord message with no genuine thread, the produced intake body
  must NOT contain a `sourceThreadId` key at all (assert absence, e.g.
  `expect(intake).not.toHaveProperty("sourceThreadId")`), while still asserting the
  `sourceTarget` and the "final target stays out of intake" property the test exists for.
- If the scenario actually intends to exercise an explicit thread override, adapt the fixture so it
  supplies the thread through the supported explicit-thread path and keep asserting the value.
  Choose whichever matches the test's documented intent ("keeps the configured final target out of
  source intake") — do not weaken that intent.

Do NOT change any production source files (`src/*.ts`, `scripts/intake-producer.*` non-test code).
Do NOT revert the optional-threadId changes.

## Verify

- `pnpm vitest run extensions/deliberation` → all tests pass (243/243 or current total).

## Acceptance criteria

- The single stale assertion is aligned with optional-by-absence Discord sourceThreadId semantics.
- Full deliberation extension suite green.
- No production code modified.
