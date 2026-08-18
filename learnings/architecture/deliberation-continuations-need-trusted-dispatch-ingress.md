---
title: "Deliberation continuations need a trusted dispatch ingress"
date: 2026-08-17
category: architecture
component: shared
tags: [deliberation, continuations, dispatch, attempt-pinning]
file_type: rules
---

# Planning Deliberation Continuation Safety

The bundled Deliberation plugin currently owns source intake, isolation hooks, and final delivery. Its `drafting` fields are a read-only KM record projection, not a dispatch API. The generic embedded-runner continuation prompt also has no Deliberation attempt identity.

Before adding attempt-pinning behavior, locate an in-repository trusted producer that can provide a closed envelope containing request kind, attempt/revision, correlation ID, payload path, result path, and run/reply ID. If no such producer exists, stop and record the missing ingress rather than deriving authority from transcript text, filenames, a generic continuation event, or an external KM projection.

Fence the validated envelope before tool side effects and replace stale session state for a reused drafting session. Keep the existing memory-flush and restricted-session send guards intact.
