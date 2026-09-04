# Deliberation plugin: remove legacy config compatibility

Reference: `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260819-123611-8e12fc_deliberation-spool-v2-1-simplification-delivery-queue-oddelena-od-audit-logu.md`, Slice 4 only. Do not implement other proposal slices.

## Goal

Remove the Deliberation plugin's obsolete compatibility path for pre-cutover `sources` and global `deliveryTarget` configuration. The canonical configuration is `pipelines`; `doctor --fix` migration has served its released cutoff and a second lifecycle must not remain indefinitely.

## Scope boundary

Repository-local only: `/Users/michal/Projects/openclaw-fork`.

Primary files:

- `extensions/deliberation/src/config-compat.ts`
- `extensions/deliberation/src/config-compat.test.ts`
- Deliberation extension manifest/schema, fixtures, and current documentation that still publish the legacy forms
- focused startup/intake/final-delivery tests affected by removal

Do not inspect or modify `km-system` or the workspace proposal file. Historical changelog/release notes may retain historical terminology.

## Requirements

- Characterize the current canonical `pipelines` behavior before removal.
- Remove legacy schemas and the legacy normalization/migration branch, including generated legacy pipeline IDs and translation of global legacy targets.
- Remove compatibility-only test cases, manifest/schema branches, fixtures, and current documentation for `sources` or global `deliveryTarget`.
- Keep canonical `pipelines` parsing, startup, intake, and final delivery unchanged.
- Unsupported legacy configuration must fail with a clear validation/configuration error; do not silently reinterpret it.
- Do not add another deprecation flag, deadline, fallback, or parallel lifecycle.
- Investigate `extensions/deliberation/contracts/history-read-v1.json` and `history-read-v2.json` only within this repository. Remove them only if repository-local evidence proves both are unused generated residue; otherwise leave them and record the evidence. Do not merge the distinct v1/v2 protocols.

## Acceptance

- Parser, plugin manifest, current docs, fixtures, and tests publish only `pipelines`.
- No active Deliberation plugin code mentions legacy `sources` or global `deliveryTarget`; historical changelog text is exempt.
- Focused config compatibility/validation tests prove canonical config works and legacy config is rejected clearly.
- Deliberation startup, intake, and final-delivery tests pass.
- Final note records exact removals, retained historical/protocol artifacts, commands, and results.

## Constraints

- No git operations.
- No deployment, Gateway restart, or live config mutation.
- No unrelated plugin cleanup.
