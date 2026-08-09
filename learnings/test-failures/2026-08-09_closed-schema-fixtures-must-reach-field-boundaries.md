---
title: "Closed-schema fixtures must reach field boundaries"
date: 2026-08-09
category: test-failures
component: tooling
tags: [deliberation, fixtures, closed-schema, contracts, vitest]
file_type: rules
---

# Closed-schema parser tests must mutate canonical fixtures

When an external response parser uses exact-key validation, malformed-field tests should start from one canonical valid fixture and override exactly one field. Otherwise a newly required sibling field can make parsing fail at the object-shape guard and silently mask the intended field-level assertion.

For Deliberation KM reservation fixtures, `deliveryEnvelope`, `deliveryEnvelopeDigest`, and `reviewedTextHash` are independent required boundaries. Keep a typed valid reservation builder containing all three, then create malformed cases with object spread so each expected error remains attributable to one field.

Endpoint inventory tests must also execute every active client operation rather than only asserting paths reached by an older workflow. In the Deliberation delivery sequence, reservation must be followed by invocation before completion, so the canonical path test covers seven routes rather than the historical six.
