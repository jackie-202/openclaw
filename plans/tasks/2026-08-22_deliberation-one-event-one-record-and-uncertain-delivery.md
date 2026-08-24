---
title: RED-GREEN: preserve one-event intake and safe uncertain-delivery semantics
type: implementation
---

# RED-GREEN: preserve one-event intake and safe uncertain-delivery semantics

## Context

The rollout audit `warm-cove-4137` found three connected contract violations: provider events are grouped into a 60-second multi-message record, `DELIVERY_UNKNOWN` can be followed by another send, and a timeout fixture incorrectly terminalizes uncertainty as `FAILED`. These conflict with the proposal's one-event-per-item non-change constraint and at-most-once delivery requirement.

## Scope

Work in `openclaw-fork` on the wire/runtime side owned by this repository. Keep the immutable effective target and receipt model. Do not change live configuration or invent fallback delivery.

## RED-GREEN requirement

Before production edits, add authentic failing tests through the real intake and delivery state-machine paths for:

- two provider events within 60 seconds becoming two durable deliberation items while sharing thread history context;
- `DELIVERY_UNKNOWN` after invocation never authorizing a second provider attempt without explicit durable `NOT_SENT` evidence;
- timeout/transport ambiguity remaining uncertain rather than being terminalized as definitive `FAILED`;
- replay/restart preserving the same no-second-send decision.

Then remove event coalescing as record authority and repair uncertainty transitions at the canonical contract boundary.

## Acceptance criteria

- One authenticated provider event produces exactly one durable item/record; thread peers share history only.
- One item produces at most one provider attempt and one matching receipt.
- Unknown delivery outcome is fail-closed and cannot silently retry or reroute.
- A new send is allowed only when canonical durable evidence proves no provider attempt occurred.
- Discord and Slack fixtures cover root/child events, timeout, transport ambiguity, replay, duplicate evidence, and receipt mismatch.
- Relevant contract/plugin integration tests, build, lint, and canonical Test Gate pass.
