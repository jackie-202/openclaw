# Remove legacy channels.modelByChannel support (fork-only simplification)

## Context

Our fork carries `channels.runtimeByChannel` (commit `9c09c25952` + fixes `f7d039a357`, `0529559822`) as the canonical per-channel model/thinking/reasoning profile store. The older `channels.modelByChannel` map is a legacy duplicate layer: one more writer/reader in the model-selection precedence chain that has repeatedly contributed to model-drift incidents (see `knowledge/workflows/openclaw-channel-model-switching.md` in the workspace, incidents 2026-07-10 and 2026-07-17).

The live production config no longer contains `modelByChannel` (migrated to runtimeByChannel on 2026-07-18). The km-system operator helper is being updated in a separate task to stop touching the key. Goal here: remove the legacy layer from the fork to shrink our upstream delta surface and reduce the number of model-selection writers/readers.

IMPORTANT: First check `git log upstream/main -- <files>` / upstream source to determine whether `modelByChannel` is upstream code or fork-only. If it exists upstream, DO NOT delete the schema key (that would break upstream config compat and enlarge our diff); instead only remove/neutralize any fork-added fallback reads of `modelByChannel` in the runtime model-selection path so `runtimeByChannel` and session overrides are the only per-channel sources. Record the finding in the final note.

## Scope

- `src/config/**` (schema/types for channels config) — only if fork-only.
- Model selection / channel runtime resolution paths, e.g. `src/agents/command/model-selection.ts`, `src/auto-reply/**` where `modelByChannel` is read as fallback.
- Related tests referencing `modelByChannel`.

## Requirements

1. Determine upstream vs fork-only ownership of `modelByChannel` (schema + read paths) and record evidence.
2. Remove fork-added `modelByChannel` fallback reads from message-time model selection so precedence is: session override > runtimeByChannel profile > agent/global default. No behavior change for configs without the key.
3. If schema key is fork-only: remove it from schema/types/validation and docs. If upstream: leave schema untouched, only neutralize fork-added reads.
4. Update/remove tests that pin the legacy fallback; keep/extend tests proving runtimeByChannel precedence still works (fresh session + existing session re-entry, per the 2026-07-18 fallback-pin fix `0529559822`).
5. No changes to unrelated channel config behavior.

## Verification

- Focused test run for touched selection modules passes.
- `pnpm build` (or repo build command) passes.
- `openclaw doctor --non-interactive` passes against the live config from the new build.
- Grep proof of removed fork-added reads: `git grep -n modelByChannel src/` output included in final note with classification (upstream-owned vs removed).

## Acceptance

Fork-added legacy `modelByChannel` read paths are gone, runtimeByChannel precedence covered by tests, build + doctor green, and the final note documents the upstream-ownership finding and resulting decision.
