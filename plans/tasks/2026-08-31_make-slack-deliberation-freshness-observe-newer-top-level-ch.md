---
title: Make Slack Deliberation freshness observe newer top-level channel messages
type: implementation
---

# Make Slack Deliberation freshness observe newer top-level channel messages

## Problem

The production `deliberation.history.read` schema-v2 Slack implementation is thread-scoped even though the freshness authority is keyed by canonical channel `sourceTarget`.

For a top-level source event, `extensions/deliberation/src/history-read.ts` resolves `threadId == providerEventId`, reads the root, derives `capturedWatermark = root.latestReplyId ?? threadId`, and returns `complete=true`, `messages=[]`, `watermark=cutoff` when that root has no replies. A newer top-level message in the same configured channel is invisible because only `conversations.replies` for the first root can be paged.

Production evidence from 2026-08-31:

- source `v1:slack:default:C0BHHKY4PEV`;
- cutoff/root `1788194124.694719`;
- a newer top-level event `1788194216.931649` was ingested 92 seconds later in the same channel;
- schema-v2 read for the first cutoff returned `complete=true`, zero messages, and `watermarkProviderEventId == cutoff`;
- both records map `sourceThreadId == providerEventId`, proving separate top-level roots;
- older successful controls whose pending events were replies under a shared older `sourceThreadId` correctly return later same-thread replies;
- a Discord control reads channel-wide and returns a newer event.

This did not cause the two records' `freshness_unavailable` terminal state; that separate KM bind regression is owned by task `cool-reef-6066`. This task owns only the blind Slack freshness read.

## Goal

Define and implement Slack schema-v2 freshness semantics that cannot claim complete empty evidence while a relevant newer top-level message exists in the same configured source channel. Preserve exact account/channel provenance, source-history v1 behavior, bounded pagination, thread isolation where required, and fail-closed provider handling.

## Required work

1. Characterize the current root-vs-reply matrix in `extensions/deliberation/src/history-read.test.ts`: top-level cutoff with a newer top-level channel message, top-level cutoff with a later same-thread reply, reply cutoff with later same-thread replies, and unrelated/off-channel evidence.
2. Make the channel runtime history capability expose the smallest bounded Slack API read needed for top-level channel freshness. Reuse the existing authenticated runtime context and centralized read-token selection; do not add a second Slack client or credential path.
3. Capture a stable upper watermark before paging and return only evidence in `(cutoff, watermark]`. Merge channel/thread evidence only according to one explicit documented rule, deduplicate exact provider event IDs, preserve exact decimal timestamp ordering, and keep the existing 50-message/32-KiB completeness bounds.
4. Keep schema-v1 source history semantics unchanged unless a test proves a shared owner must change.
5. Update the checked-in history-read v2 contract/docs if they currently imply a narrower or broader authority than the implemented behavior. Do not silently retain contradictory "one-thread" and "exact channel freshness" claims.
6. Add focused regression coverage at both the Deliberation handler and Slack runtime-context Web API argument boundary.

## Scope boundary

- Repository-local: `openclaw-fork` only.
- Expected files: `extensions/deliberation/src/history-read.ts`, `extensions/deliberation/src/history-read.test.ts`, `extensions/slack/src/monitor/deliberation-history.ts`, its focused test, and the shared channel-runtime-context type/contract only if required.
- Do not inspect or modify the KM repository, production spool, OpenClaw config, credentials, Gateway process, or live Slack data.
- Do not fix KM exception classification or diagnostics here.
- Do not change final delivery routing.

## Acceptance

- A top-level Slack cutoff with a newer top-level message in the same configured account/channel no longer returns `complete=true` empty evidence with `watermark==cutoff`.
- Root/reply semantics are explicit and tested; no off-channel or unrelated-thread message is admitted accidentally.
- Exact decimal ordering, pagination loop protection, size/count bounds, provenance, and configured-source admission remain fail closed.
- Existing Slack and Discord history-read tests pass.
- Build/lint/typecheck and the repository's focused Deliberation full gate pass.

## Verification

Run the repository-standard focused tests for:

- `extensions/deliberation/src/history-read.test.ts`
- `extensions/slack/src/monitor/deliberation-history.test.ts`
- the Deliberation contract/plugin integration owner

Then run the required scoped build, lint/typecheck, and Deliberation full gate documented by the repository.
