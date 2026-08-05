# Plan 2026-08-04: Fix Deliberation live intake canonical UTC timestamps

Use one extension-local formatter at intake construction and prove the serialized KM request rejects the old `.000Z` shape.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/intake.ts` creates `receivedAt` and `occurredAt` with raw `Date.toISOString()`; routing and fail-closed dispatch are independent branches that must not change.
- `extensions/deliberation/src/km-client.ts` serializes `KmIntakeBody` unchanged, so a request-boundary test can observe the exact JSON sent to KM.
- `extensions/deliberation/src/hooks.test.ts` currently expects `.000Z` through a permissive mocked client; `extensions/deliberation/src/km-client.test.ts` already hosts KM wire-shape tests.
- `extensions/deliberation/index.ts` is the sole production caller of the inbound handler. No public export or new file is needed.

### Relevant documentation

- `extensions/deliberation/contracts/km-wire-v1.json` defines closed intake fields but does not encode timestamp normalization; the task's accepted live KM evidence supplies the missing canonical-format rule.
- `docs/plugins/reference/deliberation.md` documents the unchanged intake route and fail-closed behavior; no docs edit is required.

### Knowledge base

- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: use the accepted authority evidence and capture genuine RED/GREEN proof.
- `learnings/architecture/deliberation-successful-intake-terminal-claim.md`: preserve successful terminal claims and the independent fail-closed guard.
- `learnings/patterns/cool-vale-7046-use-request-builder-seam-tests-to-prove-provider-payload-invariants.md`: assert the serialized request payload at the narrow boundary.
- `learnings/tooling/warm-fork-9899-use-concrete-vitest-file-globs-when-directory-targets-hit-the-wrong-project-conf.md`: run explicit test files.
- Recall backend: local fallback; collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: implement the required RED/GREEN cycle and proof file.
- `openclaw-testing`: select focused extension verification.
- `autoreview`: run the mandatory fresh pre-handoff review after implementation.
- `validate-implementation`: check acceptance and architecture after implementation.
- `save-learning`: mandatory final implementation-session action.

## Implementation

1. Use `skill:tdd` to add the request-boundary regression in `extensions/deliberation/src/hooks.test.ts`; run the focused command and record the old handler returning `{ handled: false }` because the listener-shaped mock rejects `.000Z`.
2. Add a small extension-private formatter in `extensions/deliberation/src/intake.ts` that calls `toISOString()` and removes only a terminal `.000Z`. Apply it to both event-derived `occurredAt` and clock-derived `receivedAt`; preserve non-zero millisecond digits unchanged.
3. Update the existing canonical intake expectation from `.000Z` to `Z`, and cover a non-zero value such as `.120Z` so the formatter cannot drop or alter meaningful precision.
4. Keep route matching, duplicate response handling, successful `{ handled: true }`, KM-error `{ handled: false }`, and `createBeforeDispatchHandler` unchanged.
5. Run focused tests and the package-scoped type gate below. Then run `skill:autoreview` until clean and `skill:validate-implementation`; record exact commands/results in the implementation final note.

## Files to Modify

| File                                                   | Change                                                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `extensions/deliberation/src/intake.ts`                | Normalize both outbound KM intake timestamps at their construction seam.                                             |
| `extensions/deliberation/src/hooks.test.ts`            | Pin exact-second and non-zero fractional JSON through a real `KmClient` request path; retain fail-closed assertions. |
| `plans/checkpoints/quick-peak-3638.red-green-proof.md` | Record RED/GREEN commands and outcomes during implementation.                                                        |

## TDD

Implement the cycle with `skill:tdd` and write evidence to `plans/checkpoints/quick-peak-3638.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/hooks.test.ts`
**Run command:** `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
**Edit hint:** import `createKmClient` from `./km-client.js` and append inside `describe("deliberation hooks", ...)`.

```ts
it.each([
  ["exact second", "2026-08-04T07:13:50Z", "2026-08-04T07:13:51Z"],
  ["non-zero milliseconds", "2026-08-04T07:13:50.120Z", "2026-08-04T07:13:51.120Z"],
])(
  "sends canonical KM timestamps for a live-shaped %s event",
  async (_, occurredAt, receivedAt) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(receivedAt));
    const bodies: Array<{ occurredAt: string; receivedAt: string }> = [];
    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { occurredAt: string; receivedAt: string };
      bodies.push(body);
      const canonical = [body.occurredAt, body.receivedAt].every(
        (value) =>
          /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(value) && !value.endsWith(".000Z"),
      );
      return new Response(
        JSON.stringify(
          canonical
            ? { protocolVersion: 1, recordId: "record-1", inboundId: "inbound-1", duplicate: false }
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
    ).resolves.toEqual({ handled: true });
    expect(bodies).toEqual([{ occurredAt, receivedAt }]);
    vi.useRealTimers();
  },
);
```

| Case                  | RED before implementation                                                              | GREEN after implementation                             |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Exact second          | Listener-shaped mock returns 400 for `.000Z`; handler resolves `{ handled: false }`.   | Both fields end in `:ssZ`; intake succeeds and claims. |
| Non-zero milliseconds | Guards against an over-broad fraction removal while the exact-second row supplies RED. | Both `.120Z` values retain all millisecond digits.     |

### Verification

1. `pnpm test extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/km-client.test.ts -- --reporter=verbose`
2. `node scripts/run-tsgo.mjs -p extensions/deliberation/tsconfig.json`
3. `git diff --check`

## Dependencies

- Use the task-provided live KM behavior as authoritative contract evidence; do not inspect another repository or runtime configuration.
- No dependency, public API, config, contract-mirror, or documentation change is required.
- Invoke `skill:save-learning` as the implementation session's final action and save at least one learning file.
