# Gateway stability: announce delivery resilience and event loop protection

## Problem

Gateway (Node.js single-threaded event loop) zamrzla pod souběžnou zátěží 2026-03-10 ~15:15. Cron job (opencode-monitor) úspěšně dokončil agent turn, ale announce delivery (doručení výsledku do hlavní session přes gateway WS) timeoutouvala po 60s. Michal musel ručně restartovat gateway.

## Incident Timeline

```
15:14:26  Session store load: 1099 entries (normal)
15:14:35  WhatsApp heartbeat OK (connection healthy)
15:15:32  [warn] Subagent announce completion direct announce agent call transient failure, retrying 2/4 in 5s: gateway timeout after 60000ms
          Gateway target: ws://127.0.0.1:18789
          Source: local loopback
15:15:35  cron: job failed: cron: job execution timed out (timeoutMs=90000)
15:15:35  [cron:d401fb17-b12e-42ad-943c-14638d907071] cron announce delivery failed
15:15:35  cron: applying error backoff (consecutiveErrors=1, backoffMs=30000)
```

## Root Cause Analysis

1. **Gateway event loop blocked:** Gateway PID 48187 was listening on :18789, HTTP returned 503 (normal for non-API), but WS connections were not being accepted/processed. Event loop was blocked.

2. **Concurrent load at time of freeze:**
   - Main session (Opus model) mid-turn processing multiple queued WhatsApp messages
   - Multiple parallel opencode tasks running (warm-mist-4719 impl, dark-fork-3070 plan, bold-fork-7244 plan)
   - Manual WS test connections to gateway for runtime model endpoint debugging
   - Cron monitor trying to announce via WS at the same time

3. **WS auth overhead:** Gateway WS requires challenge-response HMAC handshake before any RPC. Each announce attempt = new WS connection + challenge + HMAC + send + wait. Under load, this adds up.

4. **Timeout budget too tight:** Job timeout was 90s total (agent turn + deploy + announce). Agent turn ~30s + deploy ~20s = only ~40s left for announce. Announce retry (4 attempts, 5s delay) needs ~80s worst case → exceeds remaining budget.

## Observed Symptoms

- Gateway doesn't respond to WS connections (not even TCP accept)
- WhatsApp messages queued but not processed
- Cron announce delivery fails after retry exhaustion
- Manual gateway restart required to recover
- After restart: everything works immediately (WA reconnects, cron resumes)

## Potential Solutions to Investigate

### A) Announce delivery improvements (MC/OpenClaw side)
- Increase cron job timeout (DONE: 90s → 180s) — but this is a bandaid
- Use persistent WS connection for announce instead of creating new connection per delivery
- Queue announce deliveries with exponential backoff independent of job timeout
- Fallback: write result to file, main session picks it up on next heartbeat

### B) Gateway event loop protection (OpenClaw fork)
- Investigate what blocks the event loop — is it a sync operation? Large session store serialization?
- Add event loop monitoring (detect >100ms block, log warning)
- Session store with 1099 entries — is load/save blocking?
- Consider moving heavy operations to worker threads

### C) Connection pooling
- Reuse WS connection for cron announce instead of connect-per-delivery
- Keep alive connection between cron subsystem and gateway

### D) Graceful degradation
- If announce fails, persist result to disk
- Main session checks for pending announces on heartbeat
- Never lose a completed task result, even if delivery is delayed

## Data Points

- Gateway WS auth: connect.challenge → HMAC response (learned from runtime model fix)
- Session store: 1099 entries at time of incident
- opencode-monitor frequency: every 120s
- Concurrent opencode tasks at time of freeze: 3-4 processes
- Gateway single process, no worker threads
- After restart: immediate recovery (no data loss, just delayed delivery)

## Temporary Mitigation (already applied)

- opencode-monitor timeout increased to 180s
- Runtime model endpoint fixed to use CLI subprocess instead of raw WS (reduces gateway WS load)

## Impact

- Lost 1 announce delivery (dark-fork-3070 plan completion notification)
- ~5 minutes of gateway unresponsiveness
- 3 WhatsApp messages from Michal queued and delivered after restart
- No data loss (task state file was already updated)

Project: /Users/michal/Projects/openclaw-fork
Plans output dir: /Users/michal/Projects/openclaw-fork/plans/
