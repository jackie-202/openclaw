# Plan 2026-08-04: Fix OpenClaw Deliberation live intake request failure

Use the real extension producer to identify the rejected wire field, fix only that producer/client boundary, and leave a reusable fork-owned probe for listener E2E.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/src/intake.ts` builds the Discord intake body, normalizes timestamps, claims only after `client.intake()` resolves, and reduces every rejection to `error=Error`.
- `extensions/deliberation/src/km-client.ts` owns credential resolution, endpoint/path, protocol/auth/media headers, global `fetch`, response JSON parsing, and closed response validation. It currently discards transport causes and KM error codes.
- `extensions/deliberation/src/hooks.test.ts` composes the handler with `KmClient`, but its in-memory `fetchImpl` accepts three-digit fractional timestamps and never proves persistence through a listener.
- `extensions/deliberation/src/km-client.test.ts` covers global-fetch metadata only for health; other intake tests mock fetch and cannot expose listener-side intake rejection.
- `extensions/deliberation/index.ts` is the production registration boundary; `extensions/deliberation/src/plugin.test.ts` proves hooks are registered and sender remains absent, but does not invoke the captured real intake producer.
- `src/hooks/message-hook-mappers.ts` forwards the canonical numeric timestamp; Discord derives it with `Date.parse`, so the observed `.483Z` event reaches the plugin as epoch milliseconds.
- The worktree contains pre-existing Deliberation changes, including exact-second normalization and transport-header fixture updates. Implementation must preserve and build on them rather than overwrite or re-create them.

### Relevant Documentation

- `extensions/deliberation/contracts/km-wire-v1.json` is the provenance-pinned protocol-v1 mirror: authenticated `POST /deliberation/v1/intake`, closed headers/body, bounded canonical response/error codes, and sender disabled by default.
- `extensions/deliberation/contracts/provenance.json` identifies `km-system` as contract authority; do not weaken or invent the mirrored contract while fixing the producer.
- `docs/plugins/reference/deliberation.md` documents the six operations and fail-closed/no-sender policy but lacks a fork-owned producer invocation and bounded rejection diagnostic contract.
- `docs/plugins/sdk-testing.md` requires bundled-plugin integration tests to use documented test seams and notes that hand-written registration mocks do not prove production loader/runtime behavior.

### Knowledge Base

- `learnings/architecture/2026-08-02_external-listener-gates-require-external-green-proof.md`: mocked consumer green is not listener green; require a real listener result.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture a genuine focused RED before edits and fresh GREEN after the accepted fix.
- `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`: use current fixture/provenance and stop rather than guessing if listener authority is unavailable.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove the loaded registration/producer path, not only source inventory.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable; all ten returned files were reviewed.

## Available Skills

- `compound-plan`: owns this planning artifact.
- `recall-knowledge`: supplied contract, activation, and real-listener proof constraints.
- `tdd`: records the focused RED/GREEN implementation cycle.
- `openclaw-testing`: selects focused extension and integration verification.
- `technical-documentation`: reviews the producer invocation and safe diagnostic contract.
- `validate-implementation`: checks the completed fork-only change against architecture and task acceptance.
- `save-learning`: records the planning finding after finalization.

## Solution

Reproduce the observed `.483Z` Discord event through `createInboundClaimHandler` plus the real `KmClient` against a temporary KM listener. Capture only path, header names/presence, timestamp/source schema, HTTP status, canonical KM error code, parser stage, and before/after record counts. Compare health and intake to isolate endpoint, auth, protocol header, Node fetch metadata, request schema/timestamps, and response parsing independently.

The leading hypothesis is that the exact-second repair still emits JavaScript's three-digit non-zero fraction while the listener requires a different canonical fractional representation. Confirm this with the listener before changing normalization; preserve the represented instant and meaningful fraction rather than dropping precision.

Represent KM failures as a closed diagnostic error with fixed stages and bounded status/code fields. The hook logs only those fields and the error class, never endpoint, credential, body, sender, message content, or raw KM message.

## Implementation

1. Use `skill:tdd` to add the focused RED case in `extensions/deliberation/src/hooks.test.ts`: drive the observed Discord timestamp through the real handler/client request path, pin the listener-confirmed rejection predicate, and require safe `stage/status/code` logging.
2. Run the same producer against a real temporary KM listener with `source-intake=true` and `sender=false`. Send the same `providerEventId` twice; record sanitized HTTP/KM outcomes and prove the listener persists one record. If the listener is unavailable or contradicts the mirrored contract, stop with the missing artifact instead of guessing or editing `km-system`.
3. In `extensions/deliberation/src/km-client.ts`, preserve the canonical KM error code and HTTP status in a small closed `KmRequestError`; distinguish `credential`, `transport`, `response-json`, `http`, and `response-schema`. Keep CAS/control conflict behavior unchanged and bound unknown codes to a safe sentinel.
4. In `extensions/deliberation/src/intake.ts`, log only `stage`, optional numeric status, bounded code, and `error=Error`. Keep `{ handled: false }` on every failure and keep `before_dispatch` silence independent.
5. Apply the listener-proven request correction at its owner. If fractional timestamp normalization is confirmed, update `canonicalUtcTimestamp` to emit the KM canonical fractional form while retaining exact-second `...ssZ` and the same instant. Do not change endpoint, auth, protocol headers, source routing, or response schema unless the differential probe identifies that field instead.
6. Add `extensions/deliberation/scripts/intake-producer.ts` as a test-only executable that accepts endpoint and Discord-shaped event input, reads the credential from an environment variable, invokes the real handler/client, and emits bounded JSON (`handled`, diagnostic stage/status/code, provider event id) without content or credentials. This is the fork-owned seam for the separate `km-system` E2E; it must not send Discord messages or activate sender delivery.
7. Extend `extensions/deliberation/src/km-client.test.ts` for each diagnostic stage and canonical KM code handling. Add a producer-script test for input validation, sanitized output, one request, and duplicate replay behavior against a disposable wire fixture.
8. Update `docs/plugins/reference/deliberation.md` with the exact producer-probe command/input/output contract, environment-only credential rule, and diagnostic field meanings. State that listener persistence is asserted by the external harness and sender remains disabled.
9. Verify the focused RED/GREEN pair, all Deliberation tests, extension type boundary, docs inventory, and `git diff --check`. Use `skill:validate-implementation`, then mandatory fresh `$autoreview`; do not modify or run changes to `km-system` harness files.

## Files to Modify

| File                                                      | Change                                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/km-client.ts`                | Preserve bounded request failure stage/status/KM code and apply any listener-proven client correction.                      |
| `extensions/deliberation/src/intake.ts`                   | Apply confirmed canonical request normalization and emit safe structured diagnostics without changing fail-closed behavior. |
| `extensions/deliberation/src/hooks.test.ts`               | Add the real producer/client regression for the observed fractional Discord event and safe rejection log.                   |
| `extensions/deliberation/src/km-client.test.ts`           | Cover transport, HTTP/KM error, malformed JSON, response-schema stages, and no-secret diagnostics.                          |
| `extensions/deliberation/scripts/intake-producer.ts`      | Provide the fork-owned executable producer seam for a real temporary listener.                                              |
| `extensions/deliberation/scripts/intake-producer.test.ts` | Prove validated Discord-shaped input, bounded output, one request, and duplicate replay.                                    |
| `docs/plugins/reference/deliberation.md`                  | Document producer invocation/output and diagnostic contract for the separate listener E2E.                                  |

## TDD

Implement the cycle with `skill:tdd`; save RED/GREEN evidence to `plans/checkpoints/bold-cove-8557.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/hooks.test.ts`
**Framework:** Vitest with the real `createInboundClaimHandler` and `createKmClient` request path
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/scripts/intake-producer.test.ts -- --reporter=verbose`
**Edit hint:** append to `describe("deliberation hooks")`; replace the temporary three-digit predicate only if the real listener identifies a different rejected field.

```ts
it("reports and repairs the live fractional-timestamp intake rejection", async () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date("2026-08-04T12:50:21.838Z"));
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { occurredAt: string };
      const canonical = !/\.\d{3}Z$/.test(body.occurredAt); // RED: pin listener-confirmed rule.
      return new Response(
        JSON.stringify(
          canonical
            ? { protocolVersion: 1, recordId: "record-1", inboundId: "inbound-1", duplicate: false }
            : { protocolVersion: 1, error: { code: "SCHEMA_INVALID", message: "timestamp" } },
        ),
        { status: canonical ? 201 : 400 },
      );
    });
    const logger = createLogger();
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });
    const handler = createInboundClaimHandler(config, client, logger);

    await expect(
      handler(
        {
          channel: "discord",
          content: "message",
          isGroup: true,
          senderId: "sender-1",
          timestamp: Date.parse("2026-08-04T12:50:19.483Z"),
        },
        { ...sourceContext, messageId: "1534181693647355986" },
      ),
    ).resolves.toEqual({ handled: true });
    expect(logger.warn).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});
```

| Test                           | RED before implementation                                           | GREEN after implementation                                                                       |
| ------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Observed fractional event      | Wire fixture returns `400 SCHEMA_INVALID`; handler is non-claiming. | Listener-confirmed canonical request returns 201; handler claims after persistence.              |
| Bounded rejection diagnostic   | Log contains only generic `error=Error`.                            | Log includes fixed stage, status 400, and `SCHEMA_INVALID`, with no body/credential/raw message. |
| Real listener duplicate replay | Current producer does not persist the event.                        | Two calls with one provider event id produce one persisted record and a duplicate response.      |

### Verification

1. Focused RED/GREEN command above.
2. `pnpm test extensions/deliberation -- --reporter=verbose`
3. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
4. Real temporary listener invocation of `node --import tsx extensions/deliberation/scripts/intake-producer.ts ...`, followed by listener-owned count/record assertions.
5. `pnpm docs:list`
6. `git diff --check`

## Dependencies

- A runnable temporary protocol-v1 KM listener with `source-intake=true`, sender disabled, disposable persistence, and a test credential supplied through environment only.
- The accepted `extensions/deliberation/contracts/km-wire-v1.json` mirror and provenance remain authoritative; no `km-system` harness edits are part of this task.
- Supported Node global `fetch`; no new HTTP dependency.

---

_Created: 2026-08-04_
_Status: DRAFT_
