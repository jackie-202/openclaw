# Investigation: WhatsApp 408 Unhandled Rejection

## Summary

Gateway crash source is the WhatsApp CLI login failure path, not the monitor reconnect loop. The unsafe production dereference is in `extensions/whatsapp/src/login.ts:65`; `extensions/whatsapp/src/login.ts:60` has the same pattern for the logged-out branch, but HTTP 408 follows the generic failed branch.

Local crash logs were inspected with `bash` because `~/.openclaw/logs/` is outside the repo. They confirm repeated unhandled rejections from the built gateway bundle at `dist/server.impl-Bkl7pvfK.js:2051:10`, followed by stability bundle writes for the same failures.

## Root Cause

`loginWeb` assumes `waitForWhatsAppLoginResult(...)` always resolves a well-formed `WhatsAppLoginWaitResult`:

```ts
console.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
throw new Error(result.message, { cause: result.error });
```

The unsafe dereference is `result.error` at `extensions/whatsapp/src/login.ts:65`. If the login outcome is missing or otherwise violates the declared union at runtime, the throw path can itself throw `TypeError: Cannot read properties of undefined (reading 'error')`, turning a recoverable WhatsApp disconnect into an unhandled rejection.

The only production `result.error` matches under `extensions/whatsapp/src/` are:

- `extensions/whatsapp/src/login.ts:60` in the `logged-out` branch
- `extensions/whatsapp/src/login.ts:65` in the generic failed branch used by 408

The other two matches from `grep "result\.error" extensions/whatsapp` are test assertions in `extensions/whatsapp/src/resolve-outbound-target.test.ts`.

## Log Evidence

`bash` inspection of `~/.openclaw/logs/gateway.err.log` found 65 matching crash lines for `Cannot read properties of undefined (reading 'error')`:

```text
$ grep -c "Cannot read properties of undefined (reading 'error')" "$HOME/.openclaw/logs/gateway.err.log"
65
```

Recent examples all have the same built gateway stack and stability-bundle write:

```text
[openclaw] Unhandled promise rejection: TypeError: Cannot read properties of undefined (reading 'error')
    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
    at processTicksAndRejections (node:internal/process/task_queues:104:5)
[openclaw] wrote stability bundle: /Users/michal/.openclaw/logs/stability/openclaw-stability-2026-05-04T08-25-22-128Z-3528-unhandled_rejection.json
```

Fresh rerun evidence for that representative stack:

```text
$ grep -n "dist/server.impl-Bkl7pvfK.js:2051:10\|wrote stability bundle: .*2026-05-04T08-25-22" "$HOME/.openclaw/logs/gateway.err.log"
216019:    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
216175:    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
216177:[openclaw] wrote stability bundle: /Users/michal/.openclaw/logs/stability/openclaw-stability-2026-05-04T08-25-22-128Z-3528-unhandled_rejection.json
216401:    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
217266:    at file:///Users/michal/Projects/openclaw-fork/dist/server.impl-Bkl7pvfK.js:2051:10
```

The gateway log also contains repeated WhatsApp 408 retry evidence on the same log file. Representative matching lines from `grep -n "408\|Request Time-out\|lastDisconnect\|connection.update" "$HOME/.openclaw/logs/gateway.err.log"` include:

```text
199671:2026-04-30T14:15:40.353+02:00 [whatsapp] Web connection closed (status 408). Retry 1/12 in 2.4s… (status=408 Request Time-out Connection was lost)
202689:2026-05-01T09:39:50.742+02:00 [whatsapp] Web connection closed (status 408). Retry 1/12 in 2.12s… (status=408 Request Time-out Connection was lost)
207027:WhatsApp Web connection closed (status 408). Retry 1/12 in 2.11s… (status=408 Request Time-out Connection was lost)
209753:WhatsApp Web connection closed (status 408). Retry 1/12 in 2.12s… (status=408 Request Time-out Connection was lost)
```

Additional matching stability bundles from the same day include:

```text
openclaw-stability-2026-05-04T09-05-29-760Z-4992-unhandled_rejection.json
openclaw-stability-2026-05-04T12-45-18-773Z-12259-unhandled_rejection.json
```

`bash`/Python inspection of `~/.openclaw/logs/stability/openclaw-stability-2026-05-04*unhandled_rejection.json` found 12 May 4 unhandled-rejection bundles. Fresh parsed bundle fields from the three newest May 4 unhandled-rejection bundles:

```text
count 12
openclaw-stability-2026-05-04T08-25-22-128Z-3528-unhandled_rejection.json
  generatedAt 2026-05-04T08:25:22.128Z
  reason unhandled_rejection
  error.name TypeError
  error.message None
  process.pid 3528
  process.node 25.6.1
  snapshot.count 10
  snapshot.dropped 0
openclaw-stability-2026-05-04T09-05-29-760Z-4992-unhandled_rejection.json
  generatedAt 2026-05-04T09:05:29.760Z
  reason unhandled_rejection
  error.name TypeError
  error.message None
  process.pid 4992
  process.node 25.6.1
  snapshot.count 684
  snapshot.dropped 0
openclaw-stability-2026-05-04T12-45-18-773Z-12259-unhandled_rejection.json
  generatedAt 2026-05-04T12:45:18.773Z
  reason unhandled_rejection
  error.name TypeError
  error.message None
  process.pid 12259
  process.node 25.6.1
  snapshot.count 1000
  snapshot.dropped 2640
```

The stability bundle schema records only `error.name` for this TypeError, so the gateway error log is the source for the exact `reading 'error'` message and built-bundle stack.

## Why HTTP 408 Triggers It

Baileys reports socket timeouts via `connection.update` with `connection === "close"` and a `lastDisconnect` value whose nested error carries status 408.

The source path is:

- `extensions/whatsapp/src/session.ts:188` registers a `connection.update` observer for logging/status.
- `extensions/whatsapp/src/session.ts:305` defines `waitForWaConnection(...)`.
- `extensions/whatsapp/src/session.ts:318` sees `connection === "close"`.
- `extensions/whatsapp/src/session.ts:320` rejects with `update.lastDisconnect ?? new Error("Connection closed")`.
- `extensions/whatsapp/src/connection-controller.ts:195` catches that rejection in `waitForWhatsAppLoginResult(...)`.
- `extensions/whatsapp/src/connection-controller.ts:196` extracts the status with `getStatusCode(err)`.
- `extensions/whatsapp/src/connection-controller.ts:233` returns a generic `{ outcome: "failed", message, statusCode, error: err }` for 408 because only 515 restart and 401 logged-out are special-cased.
- `extensions/whatsapp/src/login.ts:64` logs the failed outcome.
- `extensions/whatsapp/src/login.ts:65` throws `new Error(result.message, { cause: result.error })`.

The monitor reconnect path handles 408 separately and does not use this `result` object:

- `extensions/whatsapp/src/inbound/monitor.ts:776` extracts `getStatusCode(update.lastDisconnect?.error)`.
- `extensions/whatsapp/src/inbound/monitor.ts:777` resolves a `WebListenerCloseReason` with `status`, `isLoggedOut`, and `error`.
- `extensions/whatsapp/src/connection-controller.ts:450` normalizes that close reason.
- `extensions/whatsapp/src/connection-controller.ts:490` retries unless the status is non-retryable.

That path has existing 408 recovery coverage in `extensions/whatsapp/src/auto-reply.web-auto-reply.connection-and-logging.e2e.test.ts:517`.

## Recommended Fix

Harden the login boundary so a malformed or missing outcome cannot crash while reporting the original WhatsApp failure. Minimum change:

```ts
console.error(
  danger(
    `WhatsApp Web connection ended before fully opening. ${result?.message ?? "No login result was returned."}`,
  ),
);
throw new Error(result?.message ?? "WhatsApp Web connection ended before fully opening.", {
  cause: result?.error,
});
```

Also change the logged-out branch to `cause: result?.error` for consistency, or first guard the result immediately after awaiting:

```ts
if (!result) {
  const message =
    "WhatsApp Web connection ended before fully opening. No login result was returned.";
  console.error(danger(message));
  throw new Error(message);
}
```

The explicit guard is clearer because the current code also reads `result.outcome` before the failed branch. If the runtime can truly return `undefined`, guarding immediately after the await is safer than only changing `result.error`.

## Upstream Status

Upstream history was verified with `git log --oneline upstream/main -- extensions/whatsapp`. The relevant recent commits are still adjacent output/runtime changes, not a guard for missing login results:

- `9efbae7acd fix(whatsapp): route login qr through runtime`
- `071db2ca69 fix(whatsapp): capture login outcome output`
- `841eb81baf chore: better explicit message on whatsapp`

Neither commit fixes the unsafe dereference. `git show upstream/main:extensions/whatsapp/src/login.ts` shows `upstream/main` still throws with `cause: result.error` in both logged-out and generic failed branches. Upstream changes route output through `RuntimeEnv` and add assertions for captured runtime output; they do not add optional chaining or a missing-result guard.

This fork also does not contain those upstream commits on the current branch (`git branch --contains 071db2ca69` returned no containing local branch), and the local source still uses `console.log`/`console.error` in `extensions/whatsapp/src/login.ts`.

Current upstream evidence from `git show upstream/main:extensions/whatsapp/src/login.ts`:

```ts
throw new Error("Session logged out; cache cleared. Re-run login.", {
  cause: result.error,
});
runtime.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
throw new Error(result.message, { cause: result.error });
```

## Worktree Cleanup Status

The acceptance retry requested cleanup of unrelated `scripts/bench/` worktree noise only if untracked. Fresh bash status for that path is clean, so no benchmark files were removed or touched:

```text
$ git status --short -- scripts/bench
```

## Test To Add

Add guard coverage in `extensions/whatsapp/src/login.coverage.test.ts` or a small dedicated `extensions/whatsapp/src/login.test.ts`.

Recommended test cases:

- Mock `waitForWhatsAppLoginResult(...)` to resolve `undefined` and assert `loginWeb(...)` rejects with the fallback WhatsApp login-ended message, not a `TypeError`.
- Mock `waitForWhatsAppLoginResult(...)` to resolve `{ outcome: "failed", message: "status=408 Request Time-out" }` without an `error` field and assert the thrown error message is preserved and `cause` is `undefined` without crashing.
- Keep the existing 408 reconnect monitor coverage in `extensions/whatsapp/src/auto-reply.web-auto-reply.connection-and-logging.e2e.test.ts:517`; this bug is specifically the login failure boundary.
