---
title: RED-GREEN: enforce exclusive deliberation ownership before channel side effects
type: implementation
---

# RED-GREEN: enforce exclusive deliberation ownership before channel side effects

## Context

The rollout audit `warm-cove-4137` found the proposal unsafe because deliberation ownership can be lost before channel side effects. A configured source must suppress ordinary Jackie behavior before acknowledgement, typing, auto-thread creation, normal dispatch, or fast-abort paths can act.

## Scope

Work in `openclaw-fork`. Preserve the proposal's exact source-route authentication and immutable pipeline selection. Do not activate live configuration or broaden any channel allowlist.

## RED-GREEN requirement

First add focused failing tests that invoke the real inbound/channel owner path and prove that an authenticated deliberation source can currently reach at least one pre-claim channel side effect. Include disabled processing, unavailable KM, intake rejection, fast abort, root message, and child-thread cases. Capture authentic RED output before editing production code.

Then make `dispatch: exclusive` or the equivalent canonical ownership decision available before all channel side effects and ensure configured sources fail closed. Ordinary non-deliberation routes must retain existing behavior.

## Acceptance criteria

- A configured source causes zero ordinary acknowledgement, typing, auto-thread, assistant-dispatch, or fallback side effects before/after claim.
- Failure and disabled paths remain silent in the source while producing bounded diagnostics.
- Exactly one authenticated pipeline owns the event; duplicate/ambiguous routes fail closed.
- Discord and Slack owner-path integration tests cover positive and negative cases.
- Existing non-deliberation channel behavior remains unchanged.
- Focused tests, relevant channel/plugin integration tests, build, lint, and canonical Test Gate pass.
