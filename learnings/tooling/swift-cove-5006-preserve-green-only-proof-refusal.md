---
title: "Evidence-only follow-up nesmí obcházet odmítnutí GREEN-only důkazu"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [tdd, evidence, acceptance, test-gate, provenance]
file_type: rules
---

# Evidence-only follow-ups must preserve proof-helper refusal

When production code already exists and historical extraction contains no behavior-specific RED, the TDD proof helper correctly refuses a GREEN-only capture. Do not bypass that guard by copying an insufficient RED, reverting correct production code, or changing tests to recreate a failure.

Use three distinct records instead:

1. Transcribe the task-lineage extractor's exact command/outcome pairs and every gap, such as `outcome_unavailable` or `command_lines_truncated`.
2. Run the original focused command unchanged and label the passing result as fresh verification, not historical TDD proof.
3. Keep caller-owned canonical Test Gate status separate. If the runner or run reference is unavailable, record `canonical:not-run`; local test/build output cannot mint canonical provenance.

Repository test locking is another provenance detail: a timeout while waiting for the heavy-check lock means the test never executed. Wait for the owning process without terminating it, then rerun the unchanged command and record only the completed invocation as behavior evidence.
