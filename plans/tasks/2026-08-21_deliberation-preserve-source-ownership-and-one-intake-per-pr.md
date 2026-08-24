---
title: Deliberation: preserve source ownership and one intake per provider event
---

# Deliberation: preserve source ownership and one intake per provider event

## Context

Remediation items 2 and 3 from `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md` (`NOT SAFE`).

## Objective

Configured Deliberation sources must be claimed and ordinary Jackie dispatch suppressed before channel transforms; each authenticated provider event must create one distinct intake item.

## Required behavior

- Preserve authenticated Discord source-parent facts across `autoThread`, or claim configured traffic before auto-thread retargeting.
- Ensure Deliberation source suppression precedes fast-abort output and all ordinary model/reply paths.
- Exempt configured Discord and Slack Deliberation sources from inbound debounce aggregation: two provider event/message IDs produce two intake calls even inside one debounce window.
- History remains context only and must not merge provider events into one intake record.
- Preserve ordinary non-Deliberation debounce and auto-thread behavior.

## Acceptance

- Tests cover enabled, disabled, failed and empty intake, room events, fast abort and autoThread with zero ordinary reply/model dispatch for configured sources.
- Discord and Slack same-window events are admitted separately with their own IDs.
- Focused routing, hooks, intake and native monitor tests pass.
