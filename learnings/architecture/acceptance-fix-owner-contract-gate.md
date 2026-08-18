---
title: "Acceptance fixes cannot override an unresolved owner-contract gate"
date: 2026-08-16
category: architecture
component: backend
tags: [deliberation, contracts, acceptance, tdd, provenance]
file_type: rules
---

# Acceptance fixes cannot override an unresolved owner-contract gate

When an acceptance follow-up demands implementation but its task-specific plan still gates work on an external owner contract, verify the accepted local artifact rather than treating acceptance prose as the wire specification.

For Deliberation, a passing provenance test only proves that the copied KM contract is intact. It does not prove that the required future target shape exists. The decisive checks are the actual lifecycle schemas: ready/envelope, reservation, invocation, completion, and delivery-attempt projections must all define the same structured target, including `threadId` optionality and bounds.

Do not create behavioral RED tests from a proposed object shape while the accepted artifact still defines strings. Such a RED would lock in an invented dependency contract and cannot justify production changes. Keep the checkpoint incomplete, record the exact missing owner evidence, and resume TDD only after accepted artifacts and hashes land.
