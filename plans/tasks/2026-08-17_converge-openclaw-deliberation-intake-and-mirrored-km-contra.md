# Converge OpenClaw Deliberation intake and mirrored KM contract

## Context

The host-owned cross-repository comparison recorded in proposal `proposal-20260814-203937-cbe1dc` found that the current KM owner intake contract requires camelCase `sourceThreadId`, while OpenClaw's mirror and real producer omit it. KM correctly rejects the real producer with HTTP 400 `SCHEMA_INVALID`.

Stable external evidence (do not traverse `km-system`):

- Owner HTTP intake requires `sourceThreadId` (1..96, bounded destination component grammar).
- Canonical source identity remains channel/account scoped: `v1:<provider>:<account>:<channel>`.
- For Slack, admitted source-thread identity is normalized as `threadId ?? providerEventId`.
- For Discord under the current channel-as-source model, use `providerEventId` as the source-thread identifier.
- Current owner delivery semantics use a generic structured `{provider, accountId, channelId, threadId?}` target, a bounded legacy string only at reservation input, and structured attempted targets at durable/invocation/completion boundaries.

## Deliverable

Make the OpenClaw Deliberation producer and contract mirrors semantically compatible with the current KM owner contract:

1. Add `sourceThreadId` to the mirrored/type/client intake boundary and send the admitted normalized value for Discord and Slack.
2. Preserve exact camelCase JSON wire names. Do not add snake_case wire aliases.
3. Reconcile `extensions/deliberation/contracts/km-wire-v1.json` with the owner semantics described above. Keep OpenClaw-specific overlay fixtures/constraints only where they are intentionally separate from the owner mirror; do not weaken useful bounded provider evidence by accident.
4. Update focused fixtures/tests for Discord root intake, Slack root intake, and Slack reply intake, including account-scoped source identity.
5. Refresh provenance pins only after semantic tests pass. A hash-only update is not acceptable.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system`, workspace runtime config, listener state, or gateway deployment. Use the proposal verdict and this stable handoff as the external contract evidence; record any missing owner detail as a follow-up instead of crossing repositories.

## Acceptance

- The producer emits required camelCase `sourceThreadId` for both providers.
- Slack replies retain their root thread identity; Slack roots and Discord messages use the agreed fallback.
- Source identity still distinguishes provider, account, and channel.
- Contract/mirror tests prove generic structured destination semantics and the bounded transitional reservation input without permitting legacy output.
- Focused producer, contract, route/admission, and adapter regression tests pass.
- Final note lists commands/results and any intentional OpenClaw overlay retained outside the owner mirror.
