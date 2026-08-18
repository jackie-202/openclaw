---
title: "Evidence-only acceptance retries need an archival stop condition"
date: 2026-08-14
category: tooling
component: tooling
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Evidence-only acceptance retries need an archival stop condition

When a required TDD RED predates the current implementation, rerunning the current checkout cannot repair provenance. First inspect the parent proof, the generated task-evidence artifact, and the complete implementation-session archive.

Accept historical RED evidence only when it includes the target scenario, exact command, timestamp, exit status, failing assertion, and source provenance from before implementation. If the archive is truncated or contains only a sibling test, record an explicit evidence blocker. Do not relabel a later dependency failure or manufacture a new RED by reverting working code.

Plans for this case should separate two outcomes: link a recovered archival RED to a fresh GREEN, or stop without production/test edits when no qualifying archive record exists.
