---
title: "Prove no-duplicate delivery at the reservation fence"
date: 2026-08-17
category: test-failures
component: backend
tags: [deliberation, replay, fencing, idempotency, testing]
file_type: rules
---

# Prove no-duplicate delivery at the reservation fence

When a durable delivery test claims that a provider send is not retried after ambiguous or rejected completion evidence, a second poll with an empty ready queue is insufficient. It only proves that no work causes no send.

Replay the same ready item on the next poll and have the durable owner return its canonical conflict outcome from reservation. Then assert:

- the same ready item and owner were presented to `reserve` twice;
- `invoke`, provider `send`, and completion each ran only for the first attempt;
- the second reservation conflict returned without another provider call.

This keeps the test aligned with ownership: KM supplies the durable replay fence, while the non-durable final adapter must honor the conflict before invocation. It also avoids inventing an adapter-local deduplication mechanism.
