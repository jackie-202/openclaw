# Plan 2026-05-04: WhatsApp 408 Unhandled Rejection Investigation

Plan a diagnostic investigation for repeated Gateway crashes from WhatsApp Web 408 disconnect handling.

## Problem

Gateway crashes repeatedly after a WhatsApp Web socket HTTP 408 timeout because an unhandled rejection dereferences `.error` on an undefined result; crash points at built output `dist/server.impl-Bkl7pvfK.js:2051`.

## Analysis

### Kontext z codebase

- `extensions/AGENTS.md`: keep fixes and investigation inside plugin boundary; extension prod code must not import core internals.
- `extensions/whatsapp/src/session.ts`: `createWaSocket` wires Baileys socket, `connection.update`, `lastDisconnect?.error`, WebSocket `error` logging, and explicit socket timing.
- `extensions/whatsapp/src/inbound/monitor.ts`: `handleConnectionUpdate` converts `update.lastDisconnect?.error` into `{ status, isLoggedOut, error }` and resolves listener close.
- `extensions/whatsapp/src/connection-controller.ts`: `waitForClose` races listener close, close promise, abort; `normalizeCloseReason` reads `reason?.error` and formats close reason.
- `extensions/whatsapp/src/auto-reply/monitor.ts`: reconnect loop consumes `controller.waitForClose()`, logs close decisions, and reports retry/stop through `runtime.error`.
- `extensions/whatsapp/src/session-errors.ts`: existing safe helpers handle missing nested error data via optional chaining; likely source for robust status/error formatting.
- `extensions/whatsapp/src/connection-controller.test.ts`: targeted place for controller close normalization tests.
- `extensions/whatsapp/src/auto-reply.web-auto-reply.connection-and-logging.e2e.test.ts`: targeted place for reconnect behavior around close statuses and retry logging.
- `extensions/whatsapp/src/session.test.ts`: targeted place for socket-level error/update handling if trace identifies `createWaSocket` path.

### Relevantní dokumentace

- `docs/channels/whatsapp.md`: runtime model says Gateway owns WhatsApp socket and reconnect loop; explicit `web.whatsapp.*` socket timing controls 408-adjacent timeouts.
- `docs/plugins/sdk-channel-plugins.md`: read if diagnosis requires changing channel plugin contracts or runtime delivery hooks.
- `docs/plugins/sdk-testing.md`: read if follow-up fix needs plugin contract tests.

### Knowledge base

**Relevantní pravidla:**

- Keep WhatsApp-owned behavior in `extensions/whatsapp`; add generic core seams only if multiple plugins need them.
- Do not deep-import extension internals from core/tests; use local plugin tests for WhatsApp-specific behavior.
- Use repo wrappers for verification: `pnpm test <path-or-filter>`, not raw Vitest.

**Related learning:**

- `learnings/architecture/whatsapp-plugin-only-delivery-suppression.md`: preserve plugin hook and delivery boundaries; do not short-circuit unrelated WhatsApp monitor paths while investigating reconnect crashes.

## Available Skills

- `compound-plan`: already used for this plan.
- `recall-knowledge`: already used to pull relevant project learnings.
- `openclaw-testing`: use after a fix plan is requested to choose targeted vs Testbox validation.
- `blacksmith-testbox`: use for broad `pnpm check:changed` only if follow-up implementation changes runtime/test behavior.
- `save-learning`: run after this plan creation and after the later investigation report.

## Solutions

- Diagnostic investigation only: collect crash artifacts, source-map the built crash, verify Baileys/handler return contracts, compare upstream commits, then write a report with a fix recommendation.
- Do not edit WhatsApp runtime code in this task; record probable code diff only as recommendation in the investigation report.

## Implementation

### Pre-implementation checklist

- [ ] Do not modify runtime/test code during investigation.
- [ ] Redact secrets and phone numbers from logs, stability bundles, and report excerpts.
- [ ] Keep all repo references relative, e.g. `extensions/whatsapp/src/session.ts:202`.
- [ ] Use targeted local commands only; do not run broad gates for a plan/report-only task.

### Kroky implementace

1. Reproduce: inspect `~/.openclaw/logs/gateway.err.log` for the exact unhandled rejection stack, timestamps, process restarts, and surrounding WhatsApp 408 messages; do not paste secrets or full phone numbers into notes.
2. Reproduce: inspect `~/.openclaw/logs/stability/openclaw-stability-2026-05-04*.json`; extract bundle count, crash timestamps, `snapshot.events`, recent log excerpts, process exit signal/code, and repeated stack fingerprint.
3. Reproduce: if safe and already configured, run a read-only Gateway/status command to verify current WhatsApp health and whether crashes continue; skip live reproduction if it risks another crash loop.
4. Trace: locate `dist/server.impl-Bkl7pvfK.js` and its `.map`; map built line `2051` back to source using source-map data or by matching nearby minified symbols/strings.
5. Trace: grep source for the mapped handler and all `.error` dereferences in WhatsApp reconnect/login/error paths; prioritize `result.error`, `reason.error`, `lastDisconnect.error`, `listener.onClose`, and login outcome paths.
6. Trace: read Baileys types/source for the relevant 408 `DisconnectReason`/Boom shape and confirm whether 408 can emit undefined `lastDisconnect`, undefined result, or a non-Boom payload.
7. Diagnose: compare observed crash stack with `extensions/whatsapp/src/session.ts`, `extensions/whatsapp/src/inbound/monitor.ts`, `extensions/whatsapp/src/connection-controller.ts`, and `extensions/whatsapp/src/auto-reply/monitor.ts`; identify the first unsafe dereference and the caller that fails to catch it.
8. Diagnose: inspect upstream commits `9efbae7acd` (`fix(whatsapp): route login qr through runtime`) and `071db2ca69` (`fix(whatsapp): capture login outcome output`) with `git show --stat --patch`; decide whether either touches the crashing path or only login QR/output handling.
9. Diagnose: propose the minimal fix as report-only guidance, likely a null-safe guard such as `result?.error`, a normalized default close reason, or a catch around the promise source; include exact target file and test file to change in follow-up.
10. Write report: create `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` with sections `Summary`, `Evidence`, `Root Cause`, `Upstream Comparison`, `Recommended Fix`, `Verification Plan`, and `Open Questions`.

## Files to Modify

| Soubor                                                                    | Změna                                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `plans/investigations/wild-reef-6230_whatsapp-408-unhandled-rejection.md` | Write final diagnostic investigation report with evidence and recommended fix. |

## Files to Inspect

| Soubor                                                           | Účel                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------- |
| `~/.openclaw/logs/gateway.err.log`                               | Crash stack, 408 timing, unhandled rejection context. |
| `~/.openclaw/logs/stability/openclaw-stability-2026-05-04*.json` | Stability bundle evidence and pre-crash events.       |
| `dist/server.impl-Bkl7pvfK.js`                                   | Built crash location at line 2051.                    |
| `dist/server.impl-Bkl7pvfK.js.map`                               | Source-map to original TypeScript source.             |
| `extensions/whatsapp/src/session.ts`                             | Baileys socket and `connection.update` handler.       |
| `extensions/whatsapp/src/inbound/monitor.ts`                     | Listener close resolution from `lastDisconnect`.      |
| `extensions/whatsapp/src/connection-controller.ts`               | Close reason normalization and reconnect decision.    |
| `extensions/whatsapp/src/auto-reply/monitor.ts`                  | Reconnect loop and runtime error reporting.           |
| `extensions/whatsapp/src/session-errors.ts`                      | Existing safe formatting/status helpers.              |

## TDD: skip

This task produces an investigation report, not a code change; include concrete test targets in the report for the follow-up fix.

## Dependencies

- Local stability logs and `gateway.err.log` must be readable from the operator machine.
- Built artifact/source map must exist locally or be regenerated only if necessary to map `dist/server.impl-Bkl7pvfK.js:2051`.
- Upstream commit comparison needs local git history or network access to fetch upstream refs.

---

_Vytvořeno: 2026-05-04_
_Status: DRAFT_
