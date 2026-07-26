# Slice 1: Upstream model authority with transitional fallback

## Goal

Make `channels.modelByChannel` the single persistent channel-model authority across ALL execution paths in the OpenClaw fork, with a clearly-seamed transitional fallback to `runtimeByChannel[*][*].model` so the currently deployed config keeps working until it is migrated.

## Background

The fork currently has path-dependent model selection: some paths (regular replies, fresh sessions, native slash) consume `channels.runtimeByChannel[*][*].model` (fork addition), others (agent-command, status) consume upstream `channels.modelByChannel`. The approved design (proposal, Option A) makes upstream `modelByChannel` canonical and reduces the fork profile to non-model runtime fields only. This slice is the transitional step: dual-read with upstream precedence.

## Requirements

1. All channel model resolution paths — regular replies, fresh session creation, native slash commands, agent-command live model selection, and status attribution — resolve the persistent channel model through the upstream `modelByChannel` contract/resolver.
2. Transitional fallback: if `modelByChannel` has no entry for the resolved target but `runtimeByChannel` has a profile with a `model` field for that target, use that model and log a single deprecation warning (per resolution, at warn level) indicating the config should be migrated.
3. Precedence: when both are present for the same target, `modelByChannel` wins.
4. The fallback must live behind ONE seam (a single helper/function) so Slice 3 can delete it with a minimal diff. Mark it with a comment referencing this proposal id.
5. Non-model fields from `runtimeByChannel` (`thinkingLevel`, `reasoningLevel`, `textVerbosity`) continue to apply exactly as today — no behavior change for them in this slice.
6. Reuse the shared channel/target matching logic; do not duplicate provider/target candidate matching.

## Tests

- Focused tests: precedence (`modelByChannel` wins), fallback (runtime profile model used when upstream entry absent, warning emitted), and identical model resolution across regular reply / fresh session / native slash / agent-command / status for the same target.
- Then run the repository's canonical test/build gate.

## DO NOT

- Do not remove `runtimeByChannel` or its `model` field from schema/validation yet (that is Slice 3).
- Do not modify workspace tooling (`km-system`) — separate slice.
- Do not change global default model routing, cron routing, or session storage.
- Do not touch `~/.openclaw/openclaw.json` (live config).
- No git operations.

## Context

**Proposal:** `proposal-20260724-083714-6c9e68` — Minimize channel runtime divergence from upstream
**Proposal file:** `/Users/michal/Projects/openclaw-fork/docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md`
**Batch:** `channel-model-authority-a-2026-07-24` (seq 1 z 2) — code+tooling so the live config can be safely migrated to upstream `modelByChannel`.
**Section:** `slice-1-model-authority`

### Co stavíme jako celek

Fork přestane forkovat upstream contract `modelByChannel`. Model authority se vrací upstreamu; fork profil zůstane jen pro non-model runtime pole. Batch A dodá dual-read kód a migrační nástroj; poté proběhne ruční migrace živého configu; batch B pak fallback odstraní.

### Můj task v sekvenci (seq 1)

**Co dělám:** dual-read model resolution s upstream precedencí, jeden odstranitelný fallback seam.
**Závisí na:** — (first task)
**Co následuje po mně:** seq 2 přidá `migrate` operaci do workspace helperu; po ruční migraci configu batch B fallback smaže.

### Required reading (PŘED začátkem):
1. Proposal sections `## Verified provenance`, `## Design principle`, `## Decision record`, `## Safe rollout strategy`
2. Your section: `<!-- section:slice-1-model-authority -->`
3. Fork commits `9c09c259528500e0ac015589f2cb3c5a979d70b7` and `435059f7d634a3300dd7533b707e8ccfe73008e0` (what introduced/partially-removed the split)
