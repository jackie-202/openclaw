---
title: "Neměnné owner gate musí předcházet behaviorálnímu TDD"
date: 2026-08-23
category: tooling
component: general
tags: [openclaw, km-deliberation, tdd, provenance, immutable-owner]
file_type: rules
---

# Immutable owner gates must precede behavioral TDD

For cross-repository convergence against an immutable owner bundle, verify both the owner checkout revision and every supplied artifact hash before editing tests or production code. Matching file hashes are not enough when the approved contract also pins the repository revision.

If the revision differs, treat that as a setup/provenance blocker rather than behavioral RED. Do not manufacture a failing test from the setup failure, and do not reset an owner checkout when the implementation plan reserves restoration for an operator. Preserve genuine historical RED by linking its original proof artifact, then defer fresh GREEN until the exact authority revision is available.

For task `calm-fork-2914`, all four KM artifact hashes matched while `/Users/michal/.openclaw` reported a different HEAD. The correct result was therefore a durable blocked checkpoint with no OpenClaw product or test edits.
