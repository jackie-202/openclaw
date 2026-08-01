---
title: "Acceptance-fix plans must close contract gates explicitly"
date: 2026-07-29
category: architecture
component: tooling
tags: [deliberation, planning, acceptance, tdd, contract-gate]
file_type: rules
---

# Acceptance-fix plans must not treat a prior contract gate as completion

When an acceptance monitor rejects a task because it stopped at a missing external contract, the follow-up plan should not repeat the same fail-closed path as if it satisfies the goal.

For Deliberation-style contract work, the repair plan needs one of two explicit outcomes:

- Implement against accepted immutable KM-owner evidence with a genuine RED before edits and fresh GREEN after edits.
- Obtain a task-owner contract that explicitly accepts blocked fail-closed completion, then record that acceptance in the checkpoint.

Prior fail-closed evidence is still useful context, but it is not valid TDD proof for the acceptance fix unless it contains a real focused failing command before implementation.
