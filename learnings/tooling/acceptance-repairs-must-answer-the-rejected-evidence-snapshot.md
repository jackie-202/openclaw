---
title: "Acceptance repairs must answer the rejected evidence snapshot"
date: 2026-08-26
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Acceptance repairs must answer the rejected evidence snapshot

An acceptance result can reject an artifact snapshot even when the current parent proof later contains the missing section. Do not treat the current file alone as proof that the rejection was mistaken or already repaired.

For an evidence-only follow-up:

1. Read the finalized acceptance result to identify the exact missing provenance.
2. Preserve and link the genuine parent RED with its exact command, timestamp, exit code, totals, and expected failure.
3. Run the identical command under the follow-up task and record direct fresh GREEN output.
4. Exclude generated task-history evidence when command lines are truncated or outcomes are unavailable.
5. Leave production and tests unchanged unless the fresh run demonstrates a real implementation regression.

This binds the repair to what the acceptance run actually lacked instead of relying on a parent artifact that may have changed after the evaluated snapshot.
