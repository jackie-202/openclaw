# Plan 2026-09-14: Deliberation Late-Authorization No-Send Evidence

Add the missing deterministic characterization without changing the already-repaired production timeout path.

## Links

- Follow-up task: `plans/tasks/2026-09-14_followup-task-8a750897-a2ca-4d5d-ba37-7e70d352d86e-deliberation-invocation-timeout-before-provider-send.md`
- Parent plan: `plans/2026-09-14_task-190873da-d25c-46f1-87c0-4782fde68765_deliberation-invocation-timeout-before-provider-send.md`
- Parent RED/GREEN proof: `plans/checkpoints/task-190873da-d25c-46f1-87c0-4782fde68765.red-green-proof.md`

## Analysis

### Codebase Context

- `extensions/deliberation/src/km-client.ts` gives only `invoke` `min(km.invocationTimeoutMs, remainingLeaseMs)` and maps an abort-aware timed-out transport to `KmRequestError` with `operation: "invoke"` and `cause: "timeout"`.
- `extensions/deliberation/src/final-adapter.ts` awaits `km.invoke` before the sole `provider.send`; an invocation rejection therefore prevents both provider delivery and `completeDelivery`.
- `extensions/deliberation/src/km-client.test.ts:290` proves a 13-second authorization succeeds with its independent 30-second budget, but does not retain authorization after an aborted client request.
- `extensions/deliberation/src/final-adapter.test.ts:382` proves an immediate mocked `invoke` rejection is fail-closed, but is disconnected from the real client timeout and server-side authorization ambiguity.
- `extensions/deliberation/src/delivery-probe.test.ts` shows the repository pattern for lifecycle evidence but uses real sockets; use fake timers and an abort-aware `fetchImpl` instead so no external state or live provider is involved.

### Documentation

- `docs/plugins/reference/deliberation.md:105` and `:207-215` already state the invocation budget and fail-closed pre-send behavior. This evidence-only follow-up needs no documentation change.
- `docs/reference/test.md:11-14` prescribes `pnpm test <explicit target>` for focused local proof.

### Knowledge Base

- `learnings/architecture/task-190873da-invocation-authorization-timeout.md`: authorization is pre-send evidence; use an abort-aware replacement for `AbortSignal.timeout` under fake timers; never retry or send after a timed-out authorization response.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: prior proof is context only; preserve historical RED provenance rather than presenting it as new evidence.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: prove the actual side-effect boundary, not only a literal or isolated mock.
- Knowledge search used the local fallback because `openclaw-fork-learnings` was unavailable; the remaining discovered external-contract notes are metadata-only and add no actionable constraint.

## Solution

Add one fake-time transport characterization in `final-adapter.test.ts` that combines the real `createKmClient().invoke` with the production final adapter. The fake transport must reject when the short invocation signal aborts, while its independent delayed server task still appends exact invocation identity to a local `lateAuthorizations` record. The adapter must reject as an invoke timeout before that record appears, then remain at zero provider sends and zero completions after fake time advances through the delayed authorization.

## Implementation

1. Re-read the parent implementation and checkpoint before edits; retain `km-client.ts`, config, manifest, docs, and existing successful-delay test unchanged unless the new characterization proves a concrete defect.
2. In `extensions/deliberation/src/final-adapter.test.ts`, import `createKmClient`, `KmRequestError`, and `parseDeliberationConfig`; add local fixture helpers only if existing reservation/target constants cannot produce the exact invocation response required by `km-client.ts`.
3. Add an abort-aware fake `fetchImpl` for `/deliberation/v1/invocations`: register its rejection on `init.signal.abort`, schedule a later independent authorization persistence record, and do not resolve the client request after it has been aborted.
4. Compose `createFinalDeliveryAdapter` with real `invoke: client.invoke`, mocked `ready` and `reserve`, a tracked `completeDelivery`, and a tracked provider. Configure a short `invocationTimeoutMs` and a lease that remains valid beyond the fake server authorization delay.
5. With fake timers, start `runOnce`, advance past the short client timeout, and assert the rejection is `KmRequestError` for `invoke` with `stage: "transport"` and `cause: "timeout"`; assert the provider and completion have not run.
6. Advance through the delayed fake server authorization; assert its recorded exact durable invocation identity is present, label this as authorization ambiguity in the test assertion/name, and re-assert provider and completion remain uncalled. Do not retry `runOnce` or invoke completion.
7. If this test demonstrates a send, completion, or wrong timeout classification, make the smallest production repair in the owning plugin and add only the test coverage necessary for that observed defect. Otherwise make no production-code changes.
8. Capture fresh focused GREEN proof under follow-up task ID `task-8a750897-a2ca-4d5d-ba37-7e70d352d86e`; create/update `plans/checkpoints/task-8a750897-a2ca-4d5d-ba37-7e70d352d86e.red-green-proof.md` with a link to the parent historical RED and explicit fresh-GREEN result. Do not create a synthetic RED because the production behavior predates this evidence-only follow-up.
9. Run the focused file test, then `pnpm test extensions/deliberation`; record commands and results in the follow-up checkpoint. Run `git diff --check`; include a production-diff statement in the checkpoint.
10. Run `skill:save-learning` as the final implementation-session action and write at least one learning about preserving late server effects after a client abort in fail-closed tests.

## Files to Modify

| File                                                                             | Change                                                                           |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `extensions/deliberation/src/final-adapter.test.ts`                              | Add the real-client, fake-transport late-authorization timeout characterization. |
| `plans/checkpoints/task-8a750897-a2ca-4d5d-ba37-7e70d352d86e.red-green-proof.md` | Link parent RED provenance and record fresh focused GREEN evidence.              |
| `learnings/architecture/<new-learning>.md`                                       | Save the evidence-pattern learning after verification.                           |

## TDD: Skip

This is an evidence-only test addition after the timeout behavior already exists, and the task explicitly prohibits fabricating a new RED. Reuse the genuine parent RED at `plans/checkpoints/task-190873da-d25c-46f1-87c0-4782fde68765.red-green-proof.md:5-58`; use `skill:tdd` only to capture fresh GREEN evidence for the new characterization.

**Targeted test:** `extensions/deliberation/src/final-adapter.test.ts`

```ts
// Characterization shape: the delayed server mutation is deliberately independent of client abort.
const lateAuthorizations: Array<{ attemptId: string; providerAttemptId: string }> = [];
const fetchImpl = vi.fn(
  (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("", "AbortError")), {
        once: true,
      });
      setTimeout(
        () =>
          lateAuthorizations.push({
            attemptId: "attempt-1",
            providerAttemptId: "provider:attempt-1",
          }),
        200,
      );
    }),
);

await vi.advanceTimersByTimeAsync(100);
await expect(run).rejects.toMatchObject({ operation: "invoke", cause: "timeout" });
await vi.advanceTimersByTimeAsync(100);
expect(lateAuthorizations).toEqual([
  { attemptId: "attempt-1", providerAttemptId: "provider:attempt-1" },
]);
expect(provider.send).not.toHaveBeenCalled();
expect(completeDelivery).not.toHaveBeenCalled();
```

**Focused command:** `pnpm test extensions/deliberation/src/final-adapter.test.ts`

## Dependencies

- No live KM, provider, deployment, replay, or persistent state is authorized; the fake transport is the server-side authorization model.
- The fake late authorization is evidence of local ambiguity only, not an assertion about an external KM latency SLA or recovery behavior.
- Keep unrelated worktree changes untouched.

---

_Created: 2026-09-14_
_Status: DRAFT_
