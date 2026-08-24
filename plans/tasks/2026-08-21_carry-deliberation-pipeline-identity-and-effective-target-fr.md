---
title: Carry deliberation pipeline identity and effective target from intake
type: implementation
---

# Carry deliberation pipeline identity and effective target from intake

Implement the `openclaw-fork` producer-side wire contract for proposal `proposal-20260820-203458-161e2c`, consuming the canonical pipeline representation introduced by the preceding config slice.

## Deliverable

- Make authenticated source matching return exactly one selected pipeline rather than source membership alone.
- Extend producer-side contracts and synchronized OpenClaw fixtures so accepted intake carries required `pipelineId` and the resolved effective delivery target.
- For omitted targets, derive the target only from authenticated inbound source context: preserve an existing source thread, or use a root source message as the reply-thread anchor.
- For explicit targets, use exactly the configured target. Never inherit the source thread; absent `threadId` means a root target.
- Ensure message content and model output cannot choose or override pipeline or target.
- Preserve ordinary Jackie-dispatch suppression for every configured pipeline source across accepted, rejected, disabled-processing, and producer-failure paths.
- Add focused producer, route matching, contract, and suppression evidence that is ready for KM consumption.

## Constraints

- Every inbound message remains a separate intake. Thread history supplies context only and must not become an aggregation or intake identity.
- Do not implement final Slack/Discord provider sending in this slice.
- Do not modify live configuration or restart/deploy the Gateway.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system` or live configuration. Consume the repository-local normalized config and versioned contract; record a precise follow-up instead of crossing repository boundaries.

## Acceptance

- Producer tests prove stable `pipelineId` and effective target come only from authenticated route/config context.
- Omitted-target root and child-thread inputs produce the required source-thread target; explicit targets never inherit source thread state.
- Duplicate/no-match/malformed routes and contradictory evidence fail closed.
- Existing pipeline sources remain silent to ordinary agent dispatch in all producer outcomes.
- Repository-local wire fixtures and provenance evidence are internally consistent.

## Verification

Run focused route-match, intake, KM-client/contract, hook/plugin suppression, and identity tests, followed by the smallest relevant deliberation suite. Record exact commands and results in the final note.
