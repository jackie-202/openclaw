# Fix WhatsApp 408 unhandled rejection in login.ts

## Problem

Gateway crashes (12 unhandled rejection stability bundles on 2026-05-04 alone) caused by
unsafe dereference in `extensions/whatsapp/src/login.ts:65`:

```ts
console.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
throw new Error(result.message, { cause: result.error });
```

When `waitForWhatsAppLoginResult(...)` returns an outcome whose runtime shape doesn't
match the declared union (e.g. result is undefined or missing `error`/`message`),
this throw path itself throws `TypeError: Cannot read properties of undefined (reading 'error')`,
turning a recoverable WhatsApp 408 disconnect into an **unhandled rejection that crashes
the gateway**.

The same unsafe pattern exists at `login.ts:60` for the `logged-out` branch.

## Root cause (verified)

Investigation report: `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`

Trail:

- `session.ts:320` rejects with `update.lastDisconnect ?? new Error("Connection closed")`
- `connection-controller.ts:233` returns generic `{ outcome: "failed", message, statusCode, error: err }` for 408
- `login.ts:64-65` logs and throws — assumes `result` is well-formed
- If `result` is undefined or `result.error`/`result.message` is missing → TypeError
- Stack: `dist/server.impl-Bkl7pvfK.js:2051:10` → `processTicksAndRejections`

## Goals

1. **Make `login.ts:60` and `login.ts:65` defensive.**
   - Guard against `result` being undefined/null
   - Guard against `result.message` and `result.error` being missing
   - Fall back to a sane default error message ("WhatsApp login failed: <statusCode or 'unknown'>")
   - Never throw a TypeError from the error-handling path itself

2. **Wrap the throw in a try/catch or use a safe error builder.**
   - Even with guards, ensure no future regression can crash the gateway from this path
   - Consider extracting a small `buildLoginError(result, defaultMsg)` helper

3. **Add a unit test reproducing the failure mode.**
   - Test passes `result = undefined` → assert function throws a regular `Error`, not TypeError
   - Test passes `result = { outcome: "failed" }` (missing message/error) → same assertion
   - Test passes well-formed result → original behavior preserved

4. **Verify against stability bundles.**
   - After fix, run gateway and confirm no new `unhandled_rejection` bundles appear under
     `~/.openclaw/logs/stability/` for the next WhatsApp 408 event
   - This is post-merge verification, not part of acceptance gate

## Acceptance criteria

- [ ] `login.ts:60` and `login.ts:65` are defensive against malformed `result`
- [ ] No TypeError can be thrown from the error-handling path
- [ ] New test covers undefined and partial `result` cases
- [ ] Existing WhatsApp tests still pass
- [ ] Built gateway bundle (`pnpm build` in extensions/whatsapp) succeeds
- [ ] Investigation report referenced in commit message

## Out of scope

- Refactoring the entire WhatsApp connection-controller (too big)
- Adding 408-specific reconnect logic (separate concern, monitor handles 408 already)
- Changing the `WhatsAppLoginWaitResult` type union (just make consumers defensive)

## References

- Investigation: `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md`
- Source: `extensions/whatsapp/src/login.ts:60,65`
- Related: `extensions/whatsapp/src/connection-controller.ts:233`
- Stability bundles: `~/.openclaw/logs/stability/openclaw-stability-2026-05-04*unhandled_rejection.json`
- Parent investigation tasks: `bold-reef-9239`, `calm-wave-3348`
