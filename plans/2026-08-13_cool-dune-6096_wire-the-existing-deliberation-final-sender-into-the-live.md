# Plan 2026-08-13: Complete Deliberation Final Sender Acceptance

Audit the preserved sender implementation, repair only concrete gaps, and produce task-scoped runtime and verification evidence.

## Analysis

- `extensions/deliberation/index.ts` already owns production wiring: it constructs one final-delivery service, lazily loads Discord through `api.runtime.channel.outbound.loadAdapter("discord")`, sends with the reservation account/channel, and calls `api.registerService` once.
- `extensions/deliberation/src/final-adapter.ts` already owns bounded scheduling: immediate startup tick, one active tick, unref'd interval, timer cleanup, and stop-time drain. KM remains authoritative for reservation, invocation, idempotency, and terminal state.
- `extensions/deliberation/src/plugin.test.ts` and `extensions/deliberation/src/final-adapter.test.ts` already cover registration, exact-account delivery, empty/disabled/conflicted cases, provider failure, malformed destination, non-overlap, and cleanup.
- `plans/checkpoints/swift-fork-0553.red-green-proof.md` is the genuine parent RED/GREEN record. `plans/checkpoints/swift-fork-0553.evidence.md` cannot prove broader commands because its log commands are truncated, so this follow-up needs fresh evidence.
- `learnings/architecture/deliberation-final-delivery-lifecycle-boundaries.md` already records the required lifecycle/provider-boundary learning; do not duplicate it unless this audit discovers a distinct lesson.
- Contract constraints: use injected plugin runtime helpers (`docs/plugins/sdk-runtime.md`), preserve channel ownership of native sends and receipts (`docs/plugins/sdk-channel-outbound.md`), and avoid Discord internals (`extensions/AGENTS.md`).

## Available Skills

- `tdd`: link the historical RED and capture fresh GREEN proof without fabricating a new RED.
- `openclaw-testing`: select focused tests, extension typecheck, and the smallest build gate.
- `validate-implementation`: check the final diff against plugin boundaries and acceptance goals.
- `autoreview`: mandatory fresh pre-handoff review of any code changes.
- `save-learning`: mandatory final action; update/create a learning only for new task-specific knowledge.

## Implementation

1. Compare the preserved diff in `extensions/deliberation/index.ts` and `extensions/deliberation/src/final-adapter.ts` with the Plugin SDK service and outbound contracts. Confirm exactly one lifecycle-owned service, one Discord provider call per reservation, serialized ticks, and stop/reload cleanup.
2. Review the existing lifecycle and adapter tests against every blocking claim. Change production or tests only if the audit finds a concrete uncovered defect; do not redo the already-present wiring, docs, fixtures, or parent RED work.
3. Keep `docs/plugins/reference/deliberation.md` aligned with verified behavior: plugin service ownership, exact-account Discord delivery, KM authority, bounded polling, and cleanup.
4. Create/update `plans/checkpoints/cool-dune-6096.red-green-proof.md` to link the genuine RED in `plans/checkpoints/swift-fork-0553.red-green-proof.md` and record fresh GREEN command results for this follow-up. Never manufacture a post-implementation RED.
5. Create/update `plans/checkpoints/cool-dune-6096.checkpoint.md` with exact command/outcome pairs and explicitly name `extensions/deliberation/index.ts` as the production sender owner.
6. Run `skill:validate-implementation`; if code changed, run fresh `skill:autoreview` until no accepted actionable findings remain. Invoke `skill:save-learning` last and reference the existing lifecycle learning or save a distinct new learning discovered by the audit.

## Files

| File | Action |
| --- | --- |
| `extensions/deliberation/index.ts` | Audit existing runtime registration and provider wiring; patch only a proven gap. |
| `extensions/deliberation/src/final-adapter.ts` | Audit serialization and cleanup; patch only a proven gap. |
| `extensions/deliberation/src/plugin.test.ts` | Retain existing lifecycle coverage; add only missing acceptance behavior. |
| `extensions/deliberation/src/final-adapter.test.ts` | Retain existing transaction/failure coverage; add only missing adapter behavior. |
| `docs/plugins/reference/deliberation.md` | Confirm docs match the audited live runtime. |
| `plans/checkpoints/cool-dune-6096.red-green-proof.md` | Link historical RED and record fresh GREEN proof. |
| `plans/checkpoints/cool-dune-6096.checkpoint.md` | Record owner and exact verification evidence. |
| `learnings/**` | Touch only through final `save-learning` if a distinct learning is found. |

## TDD

Implement verification using `skill:tdd`. Reuse the historical RED at `plans/checkpoints/swift-fork-0553.red-green-proof.md`; the implementation already exists, so the follow-up begins with an audit and fresh GREEN verification.

**Test files:** `extensions/deliberation/src/plugin.test.ts`, `extensions/deliberation/src/final-adapter.test.ts`  
**Focused command:** `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`

```ts
// Existing executable acceptance assertions to preserve or minimally extend:
expect(services).toHaveLength(1);
expect(loadAdapter).toHaveBeenCalledWith("discord");
expect(sendText).toHaveBeenCalledWith({
  cfg: api.config,
  accountId: "acct-1",
  to: "channel:channel-1",
  text: "reply",
});
await service.stop?.(serviceContext);
expect(vi.getTimerCount()).toBe(0);
```

| Behavior | Historical RED | Fresh GREEN |
| --- | --- | --- |
| one registered live service | parent proof: `registerService` called 0 times | exactly one service registered |
| exact-account Discord delivery | parent proof: no service available | one outbound call with canonical account/channel |
| bounded lifecycle | parent proof: no scheduler available | repeated ticks do not overlap; stop drains and clears timer |
| fail-closed outcomes | parent lifecycle absent | empty/disabled/conflict do not send; malformed/provider failures terminalize through KM |

## Verification

- `pnpm test extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/final-adapter.test.ts`
- `pnpm test extensions/deliberation`
- `pnpm tsgo:extensions`
- `pnpm build`
- `git diff --check`
- `git diff --numstat`
- Record every exact result in `plans/checkpoints/cool-dune-6096.checkpoint.md`; report blockers rather than summarizing unrecorded outcomes.

---
*Status: DRAFT*
