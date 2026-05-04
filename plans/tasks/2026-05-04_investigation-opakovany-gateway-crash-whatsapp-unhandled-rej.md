# Investigation: Opakovaný gateway crash — WhatsApp unhandled rejection (RERUN)

## Problém

Gateway crashuje opakovaně na unhandled rejection:

```
TypeError: Cannot read properties of undefined (reading 'error')
    at dist/server.impl-Bkl7pvfK.js:2051
```

Trigger: WhatsApp Web socket HTTP 408 timeout → error handler dereferencuje `result.error` na undefined.

## IMPORTANT CONSTRAINTS

- **You CANNOT access `~/.openclaw/logs/`** — permission denied. Do NOT try to glob/read external directories.
- Focus purely on **source code analysis** within the repo.
- The crash is in the built bundle `dist/server.impl-Bkl7pvfK.js:2051` but that file may not exist. Use grep/source analysis instead.

## What to do

1. **Find the unsafe dereference** in `extensions/whatsapp/src/` — look for `result.error` (without optional chaining) in login, session, connection-controller, and monitor files. Previous run found 4 matches via `grep "result\.error" extensions/whatsapp`.

2. **Trace the 408 path** — When WhatsApp returns 408, Baileys fires `connection.update` with `lastDisconnect`. Trace from `session.ts` → `connection-controller.ts` → `normalizeCloseReason` → find where `result` can be undefined.

3. **Check if upstream already fixed this** — compare our fork's WhatsApp extension against upstream commits. Relevant commits: `9efbae7acd` (route login qr through runtime), `071db2ca69` (capture login outcome output). Run `git log --oneline upstream/main -- extensions/whatsapp/` to see recent fixes.

4. **Write investigation report** — Create `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` with:
   - Root cause (exact file + line with unsafe dereference)
   - Why 408 triggers it (Baileys behavior)
   - Recommended fix (exact code change, likely `result?.error`)
   - Whether upstream already has the fix
   - Test file to add guard test

5. **Update checkpoint** — Mark completed steps in `plans/checkpoints/wild-reef-6230.checkpoint.md`

## Key context from previous run

- Agent successfully read: `session.ts`, `session.runtime.ts`, `login.ts`, `login-qr.ts`, `connection-controller.ts`, `auto-reply/monitor.ts`, `inbound/monitor.ts`
- Agent identified: "The direct `result.error` dereference is in WhatsApp login code, not the monitor reconnect loop"
- `grep "result\.error" extensions/whatsapp` → 4 matches — start there

## Output

Final artifact MUST be: `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`
