# Investigation: WhatsApp 408 → unhandled rejection crash gateway

## Goal

Najít root cause crash signature:

```
WhatsApp Web connection closed (status 408). Retry 1/12 in 2.03s…
[openclaw] Unhandled promise rejection: TypeError: Cannot read properties of undefined (reading 'error')
    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
    at processTicksAndRejections (node:internal/process/task_queues:104:5)
```

a doporučit fix (patch, nebo cherry-pick z upstreamu, nebo plný rebase).

## Context

- Náš fork: `~/Projects/openclaw-fork` na verzi **2026.4.30**.
- Upstream: **2026.5.4** (gap ~2114 commitů).
- Crash se opakuje — 4× za ~50 minut dnes (2026-05-04 10:21, 10:25, 11:05, ~11:14 CET).
- Gateway umírá na `unhandledRejection`, launchd ji okamžitě restartuje (downtime ~10s).
- Stability bundles: `~/.openclaw/logs/stability/openclaw-stability-2026-05-04T*-unhandled_rejection.json`
- Knowledge note: `knowledge/systems/openclaw-wa-unhandled-rejection-crash.md`

## What to investigate

1. **Najít přesný řádek v zdrojáku.**
   - `dist/server.impl-Bkl7pvfK.js:2051` ukazuje na channel runtime supervisor (`.catch(err => { log.error?.(...) })` blok kolem řádků 2030–2055).
   - Najít odpovídající `src/**/*.ts` soubor — pravděpodobně něco kolem channel/runtime supervisor pro WA. Použít sourcemap, pokud je v dist. Jinak grep `channel exited without an error` v src.
   - Identifikovat, kde přesně padá `reading 'error'` — `log.error?.()` má `?.`, takže `log` samo asi není undefined. Suspect: `formatErrorMessage(err)` když `err` je undefined, nebo `setRuntime` který někde uvnitř dereferencuje config.error.

2. **Porovnat s upstreamem.**
   - Kandidátské commity (už zkontrolované, žádný neopravuje přesně tenhle bug, ale podobné patterny):
     - `b36a3a3295` — fix: add .catch() to fire-and-forget stale-flag clear to prevent unhandled rejection
     - `f4f98f45c7` — fix(gateway): cancel post-ready maintenance on close
     - `9efbae7acd` — fix(whatsapp): route login qr through runtime
     - `071db2ca69` — fix(whatsapp): capture login outcome output
   - Projít `git log --since="6 weeks ago" upstream/main -- '*whatsapp*' '**/server*'` a hledat fix s relevantním popisem.
   - Projít CHANGELOG / release notes pro 2026.5.0–5.4.

3. **Reprodukce (pokud možná).**
   - 408 timeout je triggernutý síťovou událostí, těžko reprodukovat lokálně. Ale pokud najdeme přesnou code path, můžeme injektovat undefined response v testu.

## Deliverable

Markdown report v `~/Projects/openclaw-fork/docs/investigations/wa-408-unhandled-rejection.md` s:

- Identifikace přesného řádku/funkce v src.
- Hypotéza root cause.
- Doporučení: (a) lokální patch (1-2 řádky guard), (b) cherry-pick konkrétních commitů, nebo (c) plný upstream rebase.
- Pokud (a): konkrétní diff.
- Pokud (b): seznam commit SHA + důvody.
- Pokud (c): odhad rizika a effortu.

## Out of scope

- Implementace fixu (jen investigace + doporučení).
- Plný upstream rebase (pokud bude doporučení).
- WhatsApp 499 flaps (separate issue).

## Tools

- `git log/show/grep/blame` v `~/Projects/openclaw-fork`
- `gh search commits` / `gh pr list` v openclaw/openclaw repo (přes `~/Projects/openclaw-fork`)
- Číst `dist/server.impl-Bkl7pvfK.js` kolem 2051 + sourcemap
- `~/.openclaw/logs/stability/*.json` pro plný stack/state

## Notes

- NE-eskalační: launchd restartuje, žádný downtime výrazně > 15s.
- Sledujeme — pokud frekvence stoupne nad 4/h dlouhodobě, eskalujeme na fix task.
