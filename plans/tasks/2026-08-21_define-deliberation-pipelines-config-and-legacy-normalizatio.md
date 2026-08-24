---
title: Define deliberation pipelines config and legacy normalization
type: implementation
---

# Define deliberation pipelines config and legacy normalization

Implement the `openclaw-fork` configuration half of proposal `proposal-20260820-203458-161e2c`.

## Deliverable

- Establish one canonical runtime configuration representation based on stable unique `pipelines[]` entries, each with one canonical `source` and optional explicit `target`.
- Keep `processingSource`, KM connection settings, and restricted review sessions global.
- Validate unique pipeline IDs and exactly one pipeline per canonical source.
- Reject duplicate sources, malformed source/target identities, invalid cross-provider thread inheritance, and mixed legacy/new configuration.
- Add a bounded compatibility normalizer for the current `sources[]` plus optional global `deliveryTarget` shape. Legacy-only and new-only configuration must normalize to the same runtime representation; mixed authority fails closed.
- Document the explicit cleanup/removal condition for legacy support and update repository-local config examples, docs, and focused fixtures.

## Constraints

- This slice defines configuration and normalization only. Do not add `pipelineId` to intake or change producer/final delivery behavior.
- Explicit targets without `threadId` represent root delivery. Omitted targets remain marked for authenticated source-default resolution by the later producer-contract slice.
- Do not modify live OpenClaw configuration or restart the Gateway.

## Scope boundary

Work only in `/Users/michal/Projects/openclaw-fork`. Do not inspect or modify `km-system`, `~/.openclaw/openclaw.json`, or external configuration. Use the proposal and repository-local fixtures as authority.

## Acceptance

- New and legacy-only examples parse into one canonical pipeline representation.
- Mixed shapes, duplicate IDs, duplicate canonical sources, malformed identities, and invalid target/thread combinations fail deterministically.
- Global processing/review settings remain global and unchanged in meaning.
- Legacy support has a documented, bounded removal condition rather than becoming permanent parallel authority.

## Verification

Run focused deliberation config, identity, route-shape, and fixture tests, followed by the smallest relevant plugin test suite. Record exact commands and results in the final note.
