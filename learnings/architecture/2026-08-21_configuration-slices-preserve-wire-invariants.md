---
title: "Konfigurační slice musí zachovat sousední wire invarianty"
date: 2026-08-21
category: architecture
component: shared
tags: [configuration, contracts, acceptance, tdd, deliberation]
file_type: rules
---

# Configuration-only slices must preserve adjacent wire invariants

When a task introduces a new configuration authority but explicitly defers producer behavior, review the full task diff for incidental contract edits, not only the parser and manifest. Test fixture updates can silently normalize an out-of-scope behavior change, as happened when pipeline fixtures were combined with making `sourceThreadId` optional.

For an acceptance repair, keep the valid configuration migration and reverse only the semantic hunks that crossed the slice boundary. Restore runtime types, producer serialization, wire schemas, fixtures, contract provenance, and assertions together so the pre-task invariant is again end-to-end. Do not retain a provenance update for a rejected wire revision.

Historical TDD evidence and repair TDD evidence are separate facts. Link the genuine parent RED rather than recreating it, then capture a real regression RED and identical-command GREEN for the acceptance repair under the follow-up task ID.
