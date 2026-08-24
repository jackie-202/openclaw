---
title: Route per-pipeline deliberation and deliver source-default replies
type: implementation
---

# Route per-pipeline deliberation and deliver source-default replies

Complete the `openclaw-fork` runtime behavior for proposal `proposal-20260820-203458-161e2c` after the config/wire and KM lifecycle slices are available.

## Deliverable

- Route each authenticated inbound source to exactly one configured pipeline and send that pipeline's stable ID and effective target to KM.
- Preserve ordinary Jackie-response suppression for every deliberation source across accepted, rejected, disabled-processing, and failure paths.
- Make Discord and Slack final adapters honor the same immutable reservation/invocation/completion contract.
- For omitted target, return to the authenticated original source in a thread: preserve an existing source thread; for a root source message, reply under that message as thread anchor.
- For explicit target, use only the configured target: no `threadId` means a root target message, while supplied `threadId` means that exact target thread. Never inherit or manufacture a target-side thread.
- Permit Slack source-default delivery only when a Slack pipeline omits its target.
- Enforce one provider attempt, matching completion receipt, and no provider/channel fallback or second send.
- Update documentation and focused positive/negative integration coverage.

## Constraints

- Every inbound message is a separate intake even when messages share a thread; the thread only supplies history.
- Inbound content and model output cannot choose, rewrite, or override pipeline/target.
- Do not edit live config or restart/deploy the Gateway.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system` or live configuration. Consume the repository-local versioned contract established by earlier slices; record an explicit contract mismatch instead of crossing repositories.

## Acceptance

- Focused tests cover Discord→source, Slack→source, Slack→Discord, explicit same-provider root/thread targets, root-source and child-thread inputs, duplicates, stale/malformed evidence, disabled processing, and provider failures.
- Ordinary dispatch remains silent in source channels.
- Accepted work produces at most one send attempt and one matching completion; fallback and late target drift are rejected.
- Explicit targets never inherit source threads; omitted targets always use source-thread semantics.

## Verification

Run focused final-adapter, orchestration, plugin, contract, and producer integration tests, followed by the smallest relevant deliberation suite. Record exact commands and results in the final note.
