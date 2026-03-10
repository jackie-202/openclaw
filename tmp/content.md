# Gateway announce delivery: bounded in-band + durable async retry

When gateway WS handling stalls under load, direct completion announce can consume the cron run timeout budget even though the agent run already finished.

## Pattern

- Keep direct completion announce on a short in-band budget.
- On transient timeout/failure, persist the announce payload to a durable queue.
- Drain that queue from a background worker with retry backoff and idempotency keys.

## Why this helps

- Cron execution outcome stays tied to agent work, not transport hiccups.
- Completion messages are not lost across process stalls/restarts.
- Run history can reflect `deferred` delivery explicitly instead of conflating it with `delivered` or `not-delivered`.

## Implementation note

Delivery status modeling should prioritize deferred state before delivered booleans. Otherwise deferred sends can be misreported as immediate success.
