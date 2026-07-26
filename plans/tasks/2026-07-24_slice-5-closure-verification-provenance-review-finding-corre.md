# Slice 5: Closure — verification, provenance review, finding correction

## Goal

Verify the full acceptance criteria of proposal `proposal-20260724-083714-6c9e68`, produce the before/after provenance review, and write the closure artifacts (architecture-review correction note, supersession note for the old workspace proposal).

## Requirements

1. Walk the proposal `## Verification and acceptance` list (items 1–8) and record evidence for each:
   - single persistent model source across regular messages, fresh sessions, native slash, agent-command, status (cite the Slice 1/3 tests);
   - upstream compatibility of the canonical source;
   - non-model runtime behavior preserved (cite tests);
   - the 11 local Discord profiles migrated without effective-setting loss (read-only inspection of live config + migration backup diff);
   - dry-run/apply/doctor/rollback paths tested (cite Slice 2/4 tests);
   - canonical test/build gate green (cite Slice 3/4 gate runs);
   - fork-vs-upstream diff reduced on affected surfaces (summarize the Slice 3 before/after comparison).
2. Write the correction note closing architecture review finding `2026-07-24T080000Z-openclaw-fork`: append a clearly-marked correction section to `/Users/michal/Projects/openclaw-fork/.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md` linking this proposal and explaining why the original "make runtimeByChannel canonical" recommendation was reversed. Do not alter the original report text — append only.
3. Write a supersession note into `/Users/michal/.openclaw/workspace/docs/proposals/proposal-20260710-090050-9a1a4c_simplify-openclaw-channel-model-runtime-configuration.md` (append-only banner section at top or bottom): direction superseded by `proposal-20260724-083714-6c9e68`, `modelByChannel` removal must not be implemented.
4. Produce a final closure report file at `/Users/michal/Projects/openclaw-fork/.architecture-reviews/reports/2026-07-24-option-a-closure.md` summarizing evidence per acceptance item, with explicit PASS/FAIL per item. Any FAIL → report it as the task result, do not paper over.

## DO NOT

- Do not modify fork source code, workspace helper code, or the live config.
- Do not archive the old proposal in the proposal DB (operator action).
- No git write operations.

## Context

**Proposal:** `proposal-20260724-083714-6c9e68` — Minimize channel runtime divergence from upstream
**Proposal file:** `/Users/michal/Projects/openclaw-fork/docs/proposals/proposal-20260724-083714-6c9e68_minimize-channel-runtime-divergence-from-upstream.md`
**Batch:** `channel-model-authority-a-2026-07-24` (seq 5 z 5) — return channel model authority to upstream `modelByChannel`, fork keeps only non-model runtime supplement.
**Section:** `slice-5-closure`

### Co stavíme jako celek

Batch vrací model authority upstreamu a redukuje fork deltu. Seq 1–4 dodaly kód, migraci a tooling; tento task je důkazní uzávěrka.

### Můj task v sekvenci (seq 5)

**Co dělám:** evidence-based closure — acceptance walk, provenance review, correction + supersession notes.
**Závisí na (předchozí seq):** všechny (1–4) + ruční migrace configu.
**Co následuje po mně:** — (last task). Operátor pak archivuje starý proposal a označí tento jako done.

### Required reading (PŘED začátkem):
1. Celý proposal file (je to closure task — výjimka z rychločtení)
2. Final notes of seq 1–4 tasks
3. `/Users/michal/Projects/openclaw-fork/.architecture-reviews/reports/2026-07-24T082900Z-openclaw-fork.md`

## Embedded supersession source — do not access workspace

The old workspace proposal is outside this project's permitted read/write scope. **Do not read or write `/Users/michal/.openclaw/workspace/**` and do not request `external_directory` permission.** Its relevant direction is reproduced here and is sufficient for closure:

- Old proposal ID/title: `proposal-20260710-090050-9a1a4c` — “Simplify OpenClaw channel model runtime configuration”.
- It proposed `channels.runtimeByChannel.<provider>.<channelId>` as the only persistent per-channel model/runtime source.
- It treated `channels.modelByChannel` as a deprecated compatibility layer to remove per migrated channel.
- This direction is superseded by `proposal-20260724-083714-6c9e68`, Option A: upstream `channels.modelByChannel` is the sole persistent model authority; the fork profile contains only non-model runtime fields; live sessions are cache/snapshot only.
- Therefore `modelByChannel` removal must not be implemented.

The operator will apply the actual supersession banner to the workspace proposal separately. For this task, **do not modify the workspace proposal**. Instead include in the project-local closure report a ready-to-copy section titled `Workspace proposal supersession note` with this exact meaning:

> Superseded by `proposal-20260724-083714-6c9e68` (Option A). The earlier direction making `runtimeByChannel` canonical for channel models is withdrawn. `channels.modelByChannel` remains the upstream-compatible sole persistent model authority; the fork runtime profile is model-free and supplemental. Do not implement removal of `modelByChannel` from this proposal.

Treat that project-local note as the task's deliverable for Requirement 3. Do not fail or block merely because the external workspace file cannot be accessed.
