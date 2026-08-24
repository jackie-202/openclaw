---
title: Deliberation: make Discord child-thread history exact
---

# Deliberation: make Discord child-thread history exact

## Context

Remediation item 4 from `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md` (`NOT SAFE`).

## Objective

Keep the parent Discord channel as source-route authority while reading history from the authenticated child thread when the admitted event belongs to one.

## Required behavior

- Carry authenticated Discord child-thread identity into the history request/store boundary.
- Root events read root/channel context; child events read the exact child thread, never a sibling or parent-only approximation.
- Reject missing, conflicting or off-thread identity fail-closed.
- Do not allow history identity to become a second pipeline or delivery-target selector.

## Acceptance

- Add Discord root/child/conflict history vectors parallel to existing Slack coverage.
- Tests prove parent route ownership and child-thread history identity coexist without fallback.
- Focused route/history tests pass.
