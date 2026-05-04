# Checkpoint: wild-reef-6230

## Steps

- ✅ Step 1: Locate unsafe source dereferences via source-only grep under `extensions/whatsapp/`
- ✅ Step 2: Trace why the WhatsApp login failure path reaches the unsafe `result.error` access around 408 timeout handling
- ✅ Step 3: Inspect external gateway crash logs and stability bundles via bash
- ✅ Step 4: Compare related upstream WhatsApp login/runtime commits
- ✅ Step 5: Save investigation report under `plans/investigations/`
- ✅ Step 6: Run verification commands appropriate for diagnostic-only work
- ✅ Step 7: Save learnings

## Last completed

COMPLETE: acceptance retry refreshed the investigation with concrete bash evidence, upstream proof, and benchmark cleanup status.

## Context for resume

Investigation complete. Report is `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`. No code fix was made. External logs were inspected with bash; `gateway.err.log` has 65 matching `Cannot read properties of undefined (reading 'error')` unhandled rejections, representative stack lines at built bundle `dist/server.impl-Bkl7pvfK.js:2051:10`, and May 4 stability bundles confirm repeated `unhandled_rejection` TypeErrors. Fresh acceptance evidence also verified `git status --short -- scripts/bench` had no output, so there was no untracked benchmark noise to remove. `git show upstream/main:extensions/whatsapp/src/login.ts` still shows `cause: result.error` in both logged-out and generic failed branches.

## Acceptance evidence

- ✅ Bash log inspection: `grep -c "Cannot read properties of undefined (reading 'error')" "$HOME/.openclaw/logs/gateway.err.log"` returned `65`.
- ✅ 408 path evidence: `grep -n "408\|Request Time-out\|lastDisconnect\|connection.update" "$HOME/.openclaw/logs/gateway.err.log"` returned repeated WhatsApp `status=408 Request Time-out Connection was lost` retries.
- ✅ Stability evidence: `ls -lt "$HOME/.openclaw/logs/stability"/openclaw-stability-2026-05-04*` found May 4 unhandled-rejection bundles; Python JSON extraction found 12 May 4 `unhandled_rejection` bundles.
- ✅ Upstream status: `git log --oneline upstream/main -- extensions/whatsapp` and `git show upstream/main:extensions/whatsapp/src/login.ts` confirm adjacent upstream WhatsApp login commits do not guard `result.error`.
- ✅ Cleanup status: `git status --short -- scripts/bench` produced no output; no `scripts/bench/` files were touched.
- ✅ Verification: `git diff --check` completed successfully with no output.
