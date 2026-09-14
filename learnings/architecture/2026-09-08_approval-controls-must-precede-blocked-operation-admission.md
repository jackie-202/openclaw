---
title: "Approval controls must precede blocked operation admission"
date: 2026-09-08
category: architecture
component: backend
tags: [openclaw, approvals, reply-admission, deadlock, tdd]
file_type: rules
---

# Approval controls must be admitted before the operation they unblock

When a reply operation waits for an approval owned by the same session, routing the approval callback through ordinary visible-turn admission creates a dependency cycle: the callback waits for the active reply, while the active reply waits for the callback's decision.

The bounded repair is to classify only the exact approval command syntax before reply-operation admission, then continue through the existing command handler and gateway approval owner. Admission bypass is not authorization: sender/account checks, operator scopes, request visibility, allowed decisions, expiry, and duplicate enforcement must remain downstream in their canonical owners.

The regression must assert that the gateway resolver is reached while the originating operation is still active and registered. Releasing the active operation before the assertion only reproves normal serialization and cannot demonstrate that the cycle was broken. Keep ordinary messages blocked and `/stop` on its existing abort lane.
