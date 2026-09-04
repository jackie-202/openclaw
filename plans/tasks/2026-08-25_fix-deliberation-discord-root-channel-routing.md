# Fix Deliberation Discord root-channel delivery routing

## Objective

Fix the narrow routing defect that causes a Deliberation response to an ordinary Discord channel message to be delivered with the inbound message ID as `threadId`, leading Discord to reject the provider send with `Unknown Channel`.

## Confirmed production evidence

A fresh production-path Deliberation record reached the normal final-delivery lifecycle and failed:

- record: `1d09a50b8c08cc6552bf92f6cbb85f809791dbd30fed49f075b98d6532d04193`
- source channel: `1494265174389948538`
- inbound/provider event message ID: `1541842641891627048`
- attempted delivery target contained `threadId: 1541842641891627048`
- provider error: `Unknown Channel`
- delivery lifecycle: `DRAFT_READY_FOR_REVIEW → READY_TO_SEND → DELIVERY_RESERVED → DELIVERY_INVOCATION_STARTED → FAILED`
- provider message ID/receipt: absent
- duplicate count: zero

The earlier Discord idempotency-length defect did not recur, so do not broaden this task into that already implemented fix.

## Root cause

In `extensions/deliberation/src/route-match.ts`, Discord source normalization currently falls back to `providerEventId` for `sourceThreadId` when the inbound event is an ordinary root-channel message with no actual Discord thread. That routing identity is later preserved into the final delivery target as `threadId`, so the provider attempts to send to the message snowflake as if it were a Discord thread/channel ID.

This is a code defect, not a pipeline configuration defect. The configured source channel is correct. Do not solve it by changing the production pipeline target.

## Required behavior

1. Ordinary Discord root-channel message:
   - preserve the real source channel as the delivery destination;
   - preserve the inbound message ID only as message/event identity where needed;
   - omit `threadId` from final delivery.
2. Message received inside a real Discord thread:
   - preserve the actual thread channel ID;
   - deliver back into that real thread.
3. Slack thread semantics must remain unchanged.
4. Existing route ambiguity and malformed-route fail-closed behavior must remain intact.
5. Delivery identity, idempotency, and exactly-once semantics must remain unchanged except for correcting the Discord target shape.

## Scope

Inspect and modify only the narrow OpenClaw Deliberation routing/delivery path and its focused tests, expected primarily around:

- `extensions/deliberation/src/route-match.ts`
- the corresponding route-match/final-adapter/plugin tests needed to prove root-channel versus real-thread behavior

Do not change Gateway config, KM spool records, historical terminal states, listener ownership, provider idempotency derivation, or unrelated channel routing.

## Test requirements

Add or update regression tests that explicitly cover:

- Discord root-channel inbound message produces a delivery target with the channel ID and no `threadId`.
- Discord real-thread inbound message produces a delivery target with the actual thread channel ID.
- The inbound message ID is never substituted as a Discord thread/channel target.
- Slack route/thread behavior remains unchanged.
- Existing malformed and ambiguous Discord route cases remain rejected.
- Final adapter/provider invocation receives the corrected target shape.

The red test must reproduce the production defect before the implementation change and pass afterward.

## Verification

- Run the narrow Deliberation test files covering route matching and final delivery.
- Run the relevant extension test suite and build/typecheck gate required by the project.
- Verify the built artifact contains the corrected behavior.
- Do not claim runtime deployment or production E2E success from source tests alone; this task implements and verifies the fix locally. Activation/build/restart and a fresh production-path proof are separate deployment evidence unless explicitly performed by the canonical workflow.

## Safety

- Do not manually reserve, invoke, complete, recover, or resend any KM record.
- Do not reuse the failed production record to manufacture a successful proof.
- Do not send provider traffic from tests.
- Do not alter production configuration.

## Acceptance criteria

- The production `Unknown Channel` failure mode is reproduced by a focused regression test.
- Ordinary Discord root-channel deliveries omit `threadId`.
- Real Discord thread deliveries retain the actual thread channel ID.
- No message snowflake is used as a Discord destination/thread ID.
- Slack behavior and fail-closed route validation remain green.
- Relevant tests and build/typecheck pass with recorded evidence.
