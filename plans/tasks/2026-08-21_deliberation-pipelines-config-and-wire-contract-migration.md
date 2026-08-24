---
title: Deliberation pipelines config and wire contract migration
type: implementation
---

# Deliberation pipelines config and wire contract migration

Implement the `openclaw-fork`-owned configuration and producer-side wire contract for proposal `proposal-20260820-203458-161e2c`.

## Deliverable

- Replace the canonical deliberation config authority with stable unique `pipelines[]` entries, each containing one canonical `source` and an optional explicit `target`.
- Keep `processingSource`, KM connection settings, and restricted review sessions global.
- Validate exactly one pipeline per canonical source; reject duplicate pipeline IDs, duplicate sources, malformed targets, and mixed legacy/new configuration.
- Add a bounded compatibility normalizer for the current `sources[]` plus optional global `deliveryTarget` shape. Both old and new shapes must normalize to one runtime representation; mixed authority must fail closed. Document the explicit cleanup/removal condition for legacy support.
- Extend producer-side contracts and synchronized OpenClaw fixtures so accepted intake carries required `pipelineId` and the resolved effective delivery target.
- Resolve omitted targets only from authenticated inbound source context. Preserve an existing source thread, or use the root source message as the reply-thread anchor. Explicit targets never inherit source thread state; without `threadId` they are root targets.
- Preserve normal-dispatch suppression for every configured pipeline source.

## Constraints

- Each inbound message remains a separate intake. Thread history is context only; do not introduce burst aggregation or thread-level intake identity.
- Message content or model output must never select or override a target.
- Do not change provider final-send behavior in this slice except where tests require the new typed contract.
- Do not modify live OpenClaw configuration or restart the Gateway.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system`, `~/.openclaw/openclaw.json`, or external configuration. Use the proposal and repository-local contract fixtures as authority; record any cross-repository unknown as a follow-up rather than crossing the boundary.

## Acceptance

- New and legacy-only config examples parse into one canonical pipeline representation; mixed shapes, duplicate IDs, duplicate sources, and invalid thread inheritance fail deterministically.
- Producer tests prove `pipelineId` and effective target are derived from authenticated route context and cannot be overridden by inbound content.
- Existing configured sources continue to suppress ordinary agent dispatch.
- Repository-local shared contract/fixture evidence is versioned and internally consistent.

## Verification

Run focused deliberation config, contract, intake-producer, and plugin tests, then the smallest relevant deliberation test suite. Record exact commands and results in the final note.
