# Plan 2026-08-14: Repair deliberation cross-repository delivery coverage

Use the preserved harness against a contract-compatible KM executable, recover genuine parent-task RED provenance, and capture fresh end-to-end GREEN proof without adding a compatibility shim.

*Status: DRAFT*

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/scripts/km-listener.cross-repo.ts` already drives default and override intake through the real listener, public spool transitions, KM client, reservation/invocation/completion APIs, and fake provider. Only the override intake is blocked by the configured KM executable.
- `extensions/deliberation/scripts/km-spool-probe.py` already prepares `READY_TO_SEND` through public KM spool methods with sentinel, containment, and production-root guards.
- `extensions/deliberation/scripts/intake-producer.ts` already forwards only parsed operator config as `deliveryTarget`; caller event data cannot select it.
- `extensions/deliberation/contracts/provenance.json` records the accepted KM owner contract/fixture hashes, but the harness does not verify the configured checkout against them before startup.
- `plans/checkpoints/quick-crag-3748.red-green-proof.md` proves only producer serialization, not the cross-repository default route.

### Relevant documentation

- `plans/tasks/2026-08-14_deliberation-delivery-target-cross-repo-integration.md` requires both routes through a real isolated listener/spool and forbids KM edits, live state, and real Discord sends.
- `extensions/deliberation/README.md` documents the explicit KM checkout command and isolation guarantees.
- `extensions/deliberation/contracts/km-wire-v1.json` defines optional intake `deliveryTarget`, effective durable envelopes, and target fencing.

### Knowledge base

- `learnings/test-failures/cross-repository-delivery-proof-contract-drift.md`: copied schemas do not prove executable compatibility; do not add a test-only compatibility shim.
- `learnings/architecture/cross-repository-delivery-tests-guard-readiness-seam.md`: keep listener/spool/evidence paths real and fake only outbound delivery.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md`: retrieve historical proof independently; never reconstruct RED after implementation.
- `learnings/patterns/quick-crag-3748-fencing-tests-need-state-evidence-not-only-conflict-responses.md`: compare durable attempts before and after each rejection.
- `learnings/patterns/quick-crag-3748-derive-idempotency-expectations-from-durable-reservation-identity.md`: derive provider idempotency from the persisted reservation.
- Recall used deterministic local fallback because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `task-evidence`: recover exact historical parent-session commands and outcomes without rerunning history.
- `tdd`: capture fresh GREEN proof under `swift-reef-8917` and preserve the historical RED link.
- `openclaw-testing`: select focused extension and integration verification.
- `autoreview`: mandatory fresh pre-handoff review for code changes.
- `save-learning`: mandatory last implementation-session action.

## Implementation

1. Run `skill:task-evidence` for `quick-crag-3748`; inspect the generated artifact for an exact pre-implementation failure of the default reviewed-delivery test in `km-listener.cross-repo.ts`. Link that command/output from `plans/checkpoints/swift-reef-8917.red-green-proof.md`; do not substitute the producer-only proof or reconstruct a RED.
2. Resolve a read-only KM checkout whose `contracts/deliberation-v2/v1/{contract,fixtures}.json` hashes equal `extensions/deliberation/contracts/provenance.json` and whose listener executable implements optional intake `deliveryTarget`. Do not patch `km-system`, intercept the request, mutate SQLite, or remove the override.
3. Run the preserved cross-repository test first. Confirm both subtests reach intake, `READY_TO_SEND`, ready/reserve/invoke, one fake-provider call, completion, provenance reads, and mismatch fences. If a compatible executable exposes an OpenClaw-owned failure, change only the failing assertion/helper path in `km-listener.cross-repo.ts` or `km-spool-probe.py`; retain already-passing isolation and default-route work.
4. Strengthen only assertions proven weak by the run: compare durable attempt projections before/after both rejected mutations and derive the provider idempotency key from `reserved.reservation.attemptId`, not the observed call.
5. Capture fresh GREEN with `skill:tdd` under `swift-reef-8917`, including the compatible KM revision/hash evidence, exact command, exit status, both route names, and confirmation that all outbound sends used the fake provider.
6. Run focused Deliberation regression tests, extension type checks, `git diff --check`, and mandatory `skill:autoreview`; fix accepted findings without touching unrelated preserved work.
7. Update the task checkpoint with the historical RED link, fresh GREEN, compatible KM provenance, and exact verification results. Invoke `skill:save-learning` last and save at least one learning.

## Files to Modify

| File | Change |
| --- | --- |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Modify only if the compatible run reveals a repository-owned harness/assertion defect; do not duplicate the preserved scenarios. |
| `extensions/deliberation/scripts/km-spool-probe.py` | Modify only if a public KM transition call is incompatible with the accepted executable; keep all isolation guards. |
| `plans/checkpoints/swift-reef-8917.red-green-proof.md` | Link genuine historical default-route RED and record fresh compatible-checkout GREEN. |
| `plans/checkpoints/swift-reef-8917.checkpoint.md` | Record completed acceptance evidence and any explicit evidence gap. |
| `learnings/<category>/<slug>.md` | Save the mandatory session learning as the final action. |

## TDD

Implement and capture evidence with `skill:tdd`. The target already exists in the preserved file; do not append a duplicate test or fabricate a post-implementation RED.

**Test file:** `extensions/deliberation/scripts/km-listener.cross-repo.ts`  
**Framework:** Node `node:test`  
**Run command:** `OPENCLAW_DELIBERATION_KM_ROOT=/path/to/compatible/km-system pnpm test:deliberation:km-integration`  
**Historical evidence command:** `python3 "$HOME/.config/opencode/skills/task-evidence/scripts/fetch-evidence.py" --task quick-crag-3748 --project-dir .`

Executable compatibility target in the existing file (use for matching evidence; do not duplicate it):

```ts
test("configured override reaches the executable KM listener", async () => {
  const fixture = await createListenerFixture();
  try {
    const result = await runIntakeProducer(
      {
        endpoint: fixture.context.endpoint,
        routes: {
          sources: [{ provider: "discord", accountId: "default", channelId: "source-a" }],
          processing: { provider: "discord", accountId: "default", channelId: "processing" },
          delivery: { provider: "discord", accountId: "delivery", channelId: "target-b" },
        },
        event: {
          provider: "discord",
          eventType: "message",
          eventKind: "user_request",
          channelId: "source-a",
          accountId: "default",
          messageId: "override-contract-check",
          senderId: "sender-routing",
          timestamp: OCCURRED_AT,
          content: "deliberation routing integration request",
        },
      },
      { OPENCLAW_DELIBERATION_KM_CREDENTIAL: fixture.context.credential },
    );
    assert.equal(result.handled, true, JSON.stringify(result.diagnostic ?? {}));
  } finally {
    await disposeFixture(fixture);
  }
});
```

| Case | Required RED evidence | GREEN |
| --- | --- | --- |
| Default route | Historical parent-session run fails before the readiness/delivery harness implementation; exact command and assertion must come from `task-evidence`. | Compatible listener sends reviewed text once to A and persists `SENT`. |
| Override route | Current stale executable returns `400 SCHEMA_INVALID` for configured `deliveryTarget`; retain as dependency-drift evidence, not as the missing default RED. | Compatible listener carries B through ready, reservation, invocation, fake send, and completion. |
| Provenance/fencing | No provider call or durable mutation may satisfy a rejected target. | Source/freshness remains A; rejected A/C attempts leave exact durable state unchanged; valid evidence records B and reservation-derived idempotency. |

If `task-evidence` reports no genuine historical default-route RED, state that gap explicitly; no rerun against already-implemented code can satisfy finding-002.

## Verification

1. `OPENCLAW_DELIBERATION_KM_ROOT=/path/to/compatible/km-system pnpm test:deliberation:km-integration`
2. `node scripts/run-vitest.mjs extensions/deliberation/scripts/intake-producer.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/km-client.test.ts --reporter=verbose`
3. `pnpm tsgo:extensions && pnpm tsgo:extensions:test`
4. `git diff --check`

## Dependencies

- A read-only KM checkout with owner contract/fixture hashes matching `extensions/deliberation/contracts/provenance.json` and an executable listener implementing the same `deliveryTarget` contract. A copied schema alone is insufficient.
- Historical OpenCode session logs for `quick-crag-3748` containing a genuine default-route RED. Missing logs are an evidence blocker, not permission to reconstruct proof.
- No real Discord credentials, production spool, listener service, or external repository edits.
