---
title: Deliberation: enforce one native provider attempt and one-message delivery
---

# Deliberation: enforce one native provider attempt and one-message delivery

## Context

Remediation item 1 from `plans/investigations/quick-wave-9858_audit-openclaw-deliberation-pipeline-routing-and-delivery-safety.md` (`NOT SAFE`).

## Objective

Create a Deliberation-owned outbound capability/mode that makes exactly one native text API attempt for the immutable target and returns evidence for exactly one platform message.

## Required behavior

- Disable Discord transient retries and webhook-to-bot fallback for Deliberation delivery.
- Disable Slack DNS/request retries and provider-side rechunking for Deliberation delivery.
- Carry the durable invocation idempotency key through provider wrappers wherever the native provider supports it; never silently drop it.
- Preflight the final provider-specific text/mention representation against the single-message limit before invocation.
- One KM provider-attempt identity must correspond to at most one real platform attempt; accepted-then-error and partial-send paths must not trigger another send.
- Preserve ordinary non-Deliberation outbound behavior.

## Acceptance

- Composition tests run through Deliberation into the real Discord/Slack adapter seams rather than mocks only.
- Tests prove zero fallback/retry/rechunking and at most one native attempt for timeout, accepted-then-error, webhook failure and over-limit text.
- Focused extension tests and the relevant build/typecheck pass.
