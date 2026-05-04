# Investigation: Opakovaný gateway crash — WhatsApp unhandled rejection (RERUN)

## Problém

Gateway crashuje opakovaně na unhandled rejection:

```
TypeError: Cannot read properties of undefined (reading 'error')
    at dist/server.impl-Bkl7pvfK.js:2051
```

Trigger: WhatsApp Web socket HTTP 408 timeout → error handler dereferencuje `result.error` na undefined.

## IMPORTANT: File access outside repo

- `~/.openclaw/logs/` and `~/.openclaw/` are OUTSIDE the repo working directory
- The `read` and `glob` tools will REJECT access to these paths (external_directory permission)
- **USE `bash` tool instead** — `cat`, `grep`, `ls`, `head`, `tail` all work on any path
- Example: `bash("cat ~/.openclaw/logs/stability/openclaw-stability-2026-05-04*.json | head -100")`
- Example: `bash("ls -lt ~/.openclaw/logs/stability/ | head")`

## What to do

1. **Inspect crash logs** (via bash):
   - `bash("grep 'Cannot read properties of undefined' ~/.openclaw/logs/gateway.err.log | tail -10")`
   - `bash("ls ~/.openclaw/logs/stability/openclaw-stability-2026-05-04* | head -5")`
   - `bash("cat <first-bundle> | python3 -m json.tool | head -80")`

2. **Find the unsafe dereference** in `extensions/whatsapp/src/` — look for `result.error` (without optional chaining) in login, session, connection-controller, and monitor files. Previous run found 4 matches via `grep "result\.error" extensions/whatsapp`.

3. **Trace the 408 path** — When WhatsApp returns 408, Baileys fires `connection.update` with `lastDisconnect`. Trace from `session.ts` → `connection-controller.ts` → `normalizeCloseReason` → find where `result` can be undefined.

4. **Check if upstream already fixed this** — `git log --oneline upstream/main -- extensions/whatsapp/ | head -20`. Relevant commits: `9efbae7acd`, `071db2ca69`.

5. **Write investigation report** — Create `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` with:
   - Root cause (exact file + line with unsafe dereference)
   - Evidence from logs (crash stack, frequency, stability bundles)
   - Why 408 triggers it (Baileys behavior)
   - Recommended fix (exact code change)
   - Whether upstream already has the fix
   - Test file to add guard test

6. **Update checkpoint** — Mark completed steps in `plans/checkpoints/wild-reef-6230.checkpoint.md`

## Key context from previous run

- Agent identified: "The direct `result.error` dereference is in WhatsApp login code, not the monitor reconnect loop"
- `grep "result\.error" extensions/whatsapp` → 4 matches — start there
- Stability bundles exist at `~/.openclaw/logs/stability/openclaw-stability-2026-05-04*.json`
- Gateway error log: `~/.openclaw/logs/gateway.err.log`

## Output

Final artifact MUST be: `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`
Without this file, the task is NOT done.
