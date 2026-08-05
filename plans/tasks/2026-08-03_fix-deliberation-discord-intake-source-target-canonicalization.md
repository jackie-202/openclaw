# Fix live Discord Deliberation intake source-target canonicalization

## Incident evidence

After the KM listener transport-header fix and listener restart, live Node health succeeds (HTTP 200), but real Discord messages in the configured pilot channel still do not enter the KM spool.

Observed live evidence on 2026-08-03:

- Configured pilot target: Discord channel `1494265174389948538`.
- Discord history contains user messages in that exact channel:
  - event `1533766775097786448`, content `další kolo testu`, at `2026-08-03T09:21:35.192Z`;
  - event `1533799066796822528`, content `a další test`, at `2026-08-03T11:29:54.133Z`.
- KM `deliberation-v2.py audit` still contains only the older synthetic diagnostic record; neither real provider event is present.
- The plugin is enabled and its source config matches that channel.
- `extensions/deliberation/src/intake.ts` constructs `sourceTarget` as `${route.accountId}:${route.target}`, yielding `default:1494265174389948538`.
- The canonical wire/spool and MC expect `discord:channel:1494265174389948538` (the existing synthetic record uses that shape).

This strongly isolates the next authority seam: the plugin's live intake payload must use the canonical provider-qualified source target, without changing route matching or weakening fail-closed source silence.

## Required work

1. Reproduce the live-payload mismatch with a RED integration test at the actual Discord inbound hook boundary.
2. Correct canonical `sourceTarget` construction for Discord intake to `discord:channel:<channelId>`.
3. Keep account identity separate from the canonical source target unless the KM contract explicitly defines otherwise.
4. Verify duplicate/event identity continues to use the Discord message ID and that debounce grouping remains per canonical Discord channel.
5. Preserve all fail-closed behavior:
   - configured pilot messages remain terminally suppressed from ordinary dispatch;
   - processing-route messages are not re-ingested;
   - unmatched channels are not captured;
   - KM errors do not leak pilot traffic to ordinary dispatch.
6. Add regression coverage for account `default`, a non-default Discord account, targets both with and without the runtime `channel:` prefix, and malformed/non-Discord route candidates.
7. Run focused Deliberation plugin tests and the smallest relevant broader check.

## Acceptance criteria

- A configured pilot-channel inbound event sends an intake body containing exactly `sourceTarget: discord:channel:1494265174389948538`.
- Tests prove the prior `default:1494265174389948538` payload cannot recur.
- The real inbound event remains `handled: true` after successful KM intake.
- Existing routing, fail-closed suppression, processing-route isolation, auth/SecretRef, and delivery controls remain unchanged.
- Focused tests pass; final note includes exact commands/results and whether a gateway rebuild/restart is needed to activate the fix.

## Scope

Work only in `/Users/michal/Projects/openclaw-fork`. Do not modify KM state, Mission Control, OpenClaw config, or live services. Do not include git operations in the implementation task.
