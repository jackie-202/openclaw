---
title: Deliberation invocation timeout before provider send - characterize and repair bounded client contract
type: implementation
---

# Deliberation invocation timeout before provider send

## Goal and scope

Repair the bundled plugin's invocation timeout handling without risking duplicate provider sends. This is an independent root from the user's 2026-09-14 log investigation, not an acceptance repair of the earlier Python drafting-callback task. Work only inside this repository, primarily extensions/deliberation/src/km-client.ts, final-adapter.ts and existing config/tests. No sibling-repository or home-config inspection. No deployment, service/plugin restart, live messaging, production record mutation, replay, or runtime config modification. All verification uses local isolated fakes. If the safe fix needs a producer change, document the precise required contract instead of crossing the repository boundary or inventing it.

## Host-verified incident evidence (external evidence supplied here)

Replay record bb9c26145322f75cfe195629fbb7b551dc8fc8ccbb04cfb93b3a5ffede7b4fb5, delivery attempt 71ae3ce1a1eb4e6dab4f639757475f54:

- Draft result received 2026-09-14T11:10:45Z; reviewer verdict SEND.
- DELIVERY_RESERVED and DELIVERY_FRESHNESS_STARTED at 11:12:17Z, 60-second reservation expiring 11:13:17Z.
- Actual plugin km.requestTimeoutMs is 5000. At 11:12:22.487Z Gateway logged: deliberation: final delivery tick failed: operation=invoke path=/deliberation/v1/invocations stage=transport code=UNKNOWN cause=timeout.
- Producer completed freshness read and persisted DELIVERY_INVOCATION_STARTED at 11:12:30Z, after the client had timed out. This event is authorization metadata, NOT proof provider.send executed.
- Recovery recorded DELIVERY_OUTCOME_UNKNOWN at 11:14:26Z; state FAILED, delivery null. Host read of the destination Discord channel confirmed no new reply present.
- Current final-adapter.ts awaits km.invoke before calling provider.send. km-client.ts applies the same requestTimeoutMs AbortSignal to invoke and other requests. config.ts caps it at 30000.
- Producer authorize_delivery_invocation first checks idempotent invocation replay, begins a freshness claim, synchronously invokes freshness_read_func, validates source history, then calls mark_delivery_invoked. The freshness read can take longer than five seconds (13 seconds observed); no provider send occurs in this producer HTTP authorization handler. Do not infer safely retryable provider delivery from this authorization record alone.
- Earlier standalone repair fixed explicitly-null drafting callbacks and passed its gates. This is a distinct final-delivery boundary; do not weaken or redo the earlier repair.

## Characterization-first guardrail

Reproduce delayed invoke response beyond the configured short request timeout, successful late server authorization, and resulting no-send path with fake time/transport. Pin current ordering, persisted authorization ambiguity, and provider.send call count. Existing tests must remain intact.

## Required repair and acceptance

1. Inspect existing timeout/config and idempotency contracts; choose the smallest supported bounded fix that accommodates legitimate freshness IO without adding parallel queues/owners or blind retry loops. Document why the chosen request budget/recovery fits reservation lifetime. A global arbitrary timeout increase alone is not sufficient evidence of safety.
2. Preserve the rule that provider.send occurs only after validated matching authorization. Unknown/malformed/mismatched/lost responses must never permit a speculative send. Do not interpret authorization replay as proof a previous provider send did not happen. Do not blanket-requeue FAILED records.
3. Demonstrate delayed-but-valid authorization yields exactly one send and valid completion within the supported budget. Cover permanent timeout/no-send, lost response, stale freshness, duplicate/concurrent tick protection, true unknown provider result, and successful send with lost completion response. Keep existing fail-closed semantics for genuine delivery uncertainty.
4. If configuration needs an explicit new or adjusted budget, update repository-local schema/docs/tests consistently and provide an operator recommendation; do not edit live configuration. Avoid an unnecessary protocol redesign. If producer assumptions cannot be verified locally, state the blocker, not an invented contract.
5. Diagnostics should distinguish authorization transport timeout from provider-send unknown where the client can prove the phase, without forging terminal status or success.
6. Run focused Vitest suites for km-client, final-adapter and affected composition/config contracts using the repository's documented test runner. Record exact commands/results and changed files. Tests with mocked transport are not real delivery proof.

## Final note

Explain root cause, chosen bounded behavior, tests and limitations. Explicitly state any host configuration/deployment prerequisites and whether a coordinated producer change is necessary. No automatic live retry is authorized.
