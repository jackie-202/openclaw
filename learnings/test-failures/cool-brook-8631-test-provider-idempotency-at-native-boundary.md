---
title: "Testujte idempotency na obou vlastnických hranicích"
date: 2026-08-25
category: test-failures
component: shared
tags: [deliberation, discord, slack, idempotency, vitest]
file_type: rules
---

# Test provider idempotency at both ownership boundaries

A shared outbound interface can hide different transport contracts. Deliberation passes an `idempotencyKey` to both Discord and Slack, but Discord serializes it as a native nonce limited to 25 characters while Slack reports message-create idempotency as unsupported and does not send the value to Slack.

For fixes at this boundary, combine two levels of proof:

- An owner-level adapter test should assert deterministic derivation, bounded shape, and distinct sample attempt IDs.
- A composition test using the real channel adapter should assert the exact native payload, such as Discord's `nonce` and `enforce_nonce` fields.
- KM invocation and completion assertions should independently preserve the control-plane `providerAttemptId`.

Testing only the common interface can miss serialization limits. Testing only the native adapter can miss accidental reuse of a longer control-plane identity before the adapter is called.
