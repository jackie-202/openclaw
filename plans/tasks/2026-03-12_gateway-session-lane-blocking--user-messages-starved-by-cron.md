# Gateway session lane blocking: user messages starved by cron/subagent retries

## Problem

When cron jobs or subagent announce-completion retries occupy the session lane, interactive user messages (TUI, WhatsApp) get queued behind them. The lane is FIFO — no priority differentiation. Result: user types a message, it sits in queue for 7+ minutes while retrying operations drain.

Observed 2026-03-10 ~16:05-16:13 Prague:
1. `opencode-monitor` cron timed out at 180s, held lane
2. Multiple subagent announce-completion retries (60s timeout each, retry 2/4 then 3/4 with 5s/10s backoff)
3. `lane wait exceeded: waitedMs=435370 queueAhead=2` — user messages waited 7+ min
4. TUI became unresponsive — not crashed, just starved
5. Manual gateway restart was needed to unblock

## Impact
- User loses trust in system responsiveness
- No way for user to know "just wait" vs "it's stuck, restart needed"
- Critical: user messages should NEVER be blocked by background operations

## Potential Solutions (to investigate)

### A. Lane priority queuing
- User-interactive messages get priority over cron/subagent announce
- Cron and announce-completion operations go to a lower-priority sub-queue
- User messages can preempt or jump ahead of background work

### B. Separate lanes for cron/announce vs interactive
- Cron jobs and subagent completions get their own lane(s)
- User session lane only handles direct user messages
- Background work never blocks interactive flow

### C. Circuit breaker on retries
- After N consecutive timeouts on announce-completion, stop retrying immediately (don't burn 4 retries × 60s)
- Exponential backoff should be more aggressive — 60s gateway timeout is too long for a retry
- Cap total announce-completion retry time (e.g., 30s total, not 4×60s+backoff = 5+ min)

### D. User-facing health indicator
- TUI shows "⏳ background tasks blocking queue (2 ahead)" when lane wait exceeds threshold
- User can see it's not dead, just busy
- Optional: TUI "force-flush" command that drops queued background work

### E. Timeout tuning
- opencode-monitor cron: reduce from 180s to 60s (it shouldn't need 3 min)
- Subagent announce timeout: reduce from 60s to 15s
- Gateway WS timeout for loopback: shorter than external

## Context
- This is an openclaw-fork issue (gateway lane architecture)
- File: `dist/subsystem-Cf9yS0UI.js` (lane management)
- File: `dist/gateway-cli-D-p1YRbA.js` (cron job execution)
- Cron job ID: `d401fb17-b12e-42ad-943c-14638d907071` (opencode-monitor)
- Gateway PID at time: 48187
- Session lane: `session:agent:main:main`
