# Investigation Follow-up: WhatsApp 408 Unhandled Rejection (resume from checkpoint)

## Goal

Resume investigation `bold-reef-9239` z checkpointu. Předchozí běh skončil po Step 1 (vytvořil checkpoint a spustil `pnpm docs:list`), ale monitor task chybně označil jako `done`. Plán je dobrý, jen se nedoběhl.

## Resume from

Plán: `~/Projects/openclaw-fork/plans/2026-05-04_bold-reef-9239_investigation-whatsapp-408-unhandled-rejection-crash-gateway.md`
Checkpoint: `~/Projects/openclaw-fork/plans/checkpoints/bold-reef-9239.checkpoint.md`

Hotovo: Step 1 (init checkpoint + docs:list).
Zbývá: Steps 2-6 (map dist→source, upstream srovnání, root-cause, write report, verify).

## Output

Report do: `~/Projects/openclaw-fork/plans/investigations/bold-reef-9239_wa-408-unhandled-rejection.md` (přesně podle původního plánu, sekce "Files to Modify").

## Notes

- Plán z parent tasku je platný a kompletní — řiď se jím doslova od Step 2.
- NEpřepisuj plán, jen ho dokonči.
- Stability bundles: `~/.openclaw/logs/stability/openclaw-stability-2026-05-04T*-unhandled_rejection.json`
- Source mapping hint: `dist/server.impl-Bkl7pvfK.js:2051` → blok kolem `src/gateway/server-channels.ts:511-524` (channel runtime supervisor `.then/.catch/.finally`).
- Upstream gap: fork na 2026.4.30, upstream na 2026.5.4 (~2114 commitů).

## Parent

Follow-up of `bold-reef-9239` (false-completed by monitor).
