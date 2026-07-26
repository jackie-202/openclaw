# Slice 3: Remove transitional fallback, reject `model` in fork runtime profile

## Goal

Finish the single-authority model: delete the transitional fallback seam introduced in Slice 1 and remove the `model` field from the fork's `runtimeByChannel` profile schema, so `channels.modelByChannel` is the only persistent channel-model authority and the split cannot silently return.

## Precondition (MUST verify before any code change)

The live local config must already be migrated: `~/.openclaw/openclaw.json` must contain NO `runtimeByChannel[*][*].model` entries. Verify read-only (e.g. python json inspection). If any `model` key remains under `runtimeByChannel`, STOP and report — do not proceed. This task runs only after the manual config migration between Slice 2 and this slice.

## Requirements

1. Remove the fallback seam (marked with the proposal id `proposal-20260724-083714-6c9e68` in Slice 1) — model resolution reads only `modelByChannel`.
2. Remove `model` from the fork runtime-profile schema/types; config validation rejects `runtimeByChannel[*][*].model` with a clear error pointing to `channels.modelByChannel`.
3. Trim fork-only schema/SDK/doctor/update/test changes that existed only to make `runtimeByChannel` a model authority. Record the disposition of fork commits `9c09c25952`, `435059f7d6`, `0529559822` (retain narrowly / replaced / reverted) in the final task note.
4. Keep non-model runtime fields (`thinkingLevel`, `reasoningLevel`, `textVerbosity`) fully working, including fresh sessions.
5. Update fallback/precedence tests: precedence tests become single-authority tests; add a validation-rejection test for a profile containing `model`; fresh-session test proving model comes from `modelByChannel` while thinking level comes from the runtime profile.

## Tests

- Focused tests above, then the repository's canonical test/build gate.
- Include a brief before/after `git diff --stat upstream/main` style comparison for the affected channel-config surfaces in the final note (read-only git commands for reporting are acceptable via the pipeline's standard verification; no commits/pushes).

## DO NOT

- Do not modify `~/.openclaw/openclaw.json` (read-only precondition check only).
- Do not remove `runtimeByChannel` itself or its non-model fields.
- Do not touch workspace tooling (Slice 4).
- No git write operations (commit/push/branch/PR).

## Context

**Proposal:** `proposal-20260724-083714-6c9e68` — Minimize channel runtime divergence from upstream
**Proposal file:** `/Users/michal/Projects/openclaw-fork/docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md`
**Batch:** `channel-model-authority-a-2026-07-24` (seq 3 z 5) — return channel model authority to upstream `modelByChannel`, fork keeps only non-model runtime supplement.
**Section:** `slice-3-remove-fallback`

### Co stavíme jako celek

Fork přestává forkovat upstream contract `modelByChannel`. Seq 1 zavedl dual-read, seq 2 dodal migrační nástroj, mezi seq 2 a tímto taskem proběhla RUČNÍ migrace živého configu. Tento task dual-read ukončuje.

### Můj task v sekvenci (seq 3)

**Co dělám:** smazání fallback seamu + schema rejection `model` klíče + trim fork delty.
**Závisí na (předchozí seq):** seq 1 (fallback seam), seq 2 + ruční migrace (config už `model` v runtime profilech nemá — ověřit preconditions!).
**Co následuje po mně:** seq 4 srovná workspace helper s novým ownership modelem; seq 5 uzavře proposal a review finding.

### Required reading (PŘED začátkem):
1. Proposal sections `## Decision record`, `## Safe rollout strategy`, `## Fork realignment implementation`
2. Your section: `<!-- section:slice-3-remove-fallback -->`
3. Slice 1 task file + its implementation (the fallback seam location)
