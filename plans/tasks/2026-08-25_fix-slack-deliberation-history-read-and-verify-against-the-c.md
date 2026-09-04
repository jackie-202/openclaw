---
title: Fix Slack Deliberation history read and verify against the configured channel
type: implementation
---

# Fix Slack Deliberation history read and verify against the configured channel

## Problem

The newly enabled Deliberation matrix pipeline `slack-jen-tak` accepted a real inbound Slack message from source `v1:slack:default:C0BJW0FALSC` and persisted the correct explicit Discord target, but record `d4180615d5b0e650c060ba90db15768cd17a9c05d1b463b87c42418a3231c777` terminally failed before drafting/sending with `source_history_unavailable`.

Correlated evidence:

- Slack source channel: `C0BJW0FALSC`
- root/provider event timestamp: `1787683185.523829`
- pipeline: `slack-jen-tak`
- expected target: Discord `1494265174389948538`
- hot reload resolved `C0BJW0FALSC→jen-tak` and Slack Socket Mode connected
- configured Slack channel entry is enabled and does not require mention
- a manual read through the public Slack action path was rejected before provider access with `Slack read target channel is not allowed.`
- Deliberation's internal history read collapsed its failure into `SOURCE_HISTORY_UNAVAILABLE`

The task must determine the actual root cause rather than assume either policy resolution or missing Slack scopes.

## Objective

Characterize and fix the smallest underlying OpenClaw runtime defect that prevents Deliberation from reading history for a configured Slack source channel, while preserving fail-closed policy, exactly-once behavior, and sanitized diagnostics.

## Scope boundary

Primary repository and editable scope: `/Users/michal/Projects/openclaw-fork` only.

The configured runtime in `~/.openclaw/openclaw.json`, the KM production spool, Gateway cron, and external provider messages are evidence/dependencies, not editable task scope. Do not change config, credentials, cron, spool records, or provider messages. Do not inspect unrelated repositories. Do not recycle or mutate the terminal failed record.

## Required work

1. Add focused characterization tests covering the real configured shape:
   - default Slack account,
   - `groupPolicy: allowlist`,
   - `channels.C0BJW0FALSC.enabled: true`,
   - exact-ID read should be allowed,
   - inbound and Deliberation history resolution must agree on the effective account/channel config.
2. Reproduce the mismatch through the nearest public/runtime seams and identify whether it originates in action parameter mapping, account/config resolution, hot-reload runtime context construction, channel history context, or Slack Web API authorization.
3. Implement the smallest fix. Do not weaken the allowlist or switch policy to `open`.
4. Preserve sanitized causal diagnostics for history failure where feasible: distinguish safe Slack classifications such as `missing_scope`, `not_in_channel`, or `channel_not_found` from routing/delivery failures, while retaining `source_history_unavailable` as the terminal Deliberation class. Never expose tokens, headers, raw credentials, or unrelated message content.
5. Preserve existing Discord behavior, current matrix routing, fail-closed semantics, exactly-once delivery, and the single final-delivery owner.

## Mandatory live verification

After deterministic tests pass, verify the implementation against the **already configured real Slack channel** using the existing root message only:

- account: `default`
- channel: `C0BJW0FALSC`
- message/root timestamp: `1787683185.523829`

The verification must call the newly fixed production/public history-read method or the exact runtime seam it exposes and successfully retrieve/correlate that root from Slack. Record a bounded, sanitized result containing only identifiers, success/failure classification, and relevant scope/API error code.

This live read is explicitly authorized and read-only. It must not:

- send, edit, react to, delete, or create Slack/Discord messages;
- start a new Deliberation record;
- replay or mutate `d4180615…`;
- invoke final delivery;
- mutate production spool/config/cron.

If provider authorization still blocks the read, do not fake success and do not broaden permissions. Report the exact sanitized Slack error/scope evidence and leave a concrete operator action in the final note. Implementation acceptance is not complete merely because mocks pass: either the real configured read succeeds, or the task must clearly prove an external permission blocker after the internal mismatch is fixed.

## Acceptance criteria

- A regression test fails before the fix and passes afterward for the configured allowlist/default-account shape.
- Existing focused Slack action, monitor/history, and Deliberation history tests pass.
- The configured real channel/root is read successfully through the fixed method, or a precise sanitized external permission blocker is proven without claiming success.
- No provider writes and no config/spool/cron mutation occur.
- Final note records commands, deterministic results, live-read result, files changed, and any remaining operator permission action.

## Verification

Run the smallest focused test sets for:

- Slack action runtime allowlist reads,
- Slack Deliberation channel-history context,
- Deliberation history read and route matching,
- the relevant registered OpenClaw gate/build check.

Then perform the mandatory bounded live read described above. Do not use synthetic provider traffic as verification.
