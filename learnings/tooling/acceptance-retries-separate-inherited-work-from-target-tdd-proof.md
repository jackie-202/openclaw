---
title: "Acceptance retries must separate inherited work from target TDD provenance"
date: 2026-08-14
category: tooling
component: tooling
tags: [acceptance, tdd, evidence, contracts, planning]
file_type: rules
---

# Acceptance retries must separate inherited work from target TDD provenance

When an acceptance-fix task inherits a dirty worktree, first map the requested behavior against the current diff instead of treating every preserved edit as the parent implementation. In the Deliberation delivery-target retry, the sender lifecycle and KM contract refresh were present, but the manifest config, trusted injection, durable target field, and adapter consumption were still absent.

Historical proof must be checked independently with the task-evidence artifact. If the parent artifact reports no RED, do not claim or reconstruct one from later code. A fresh RED is legitimate only when the specific target behavior is still absent; record that fact and the failing assertion before editing the target production files.

External contract ownership remains a separate gate. Acceptance urgency does not authorize inventing an optional request field or durable envelope field. Plan the post-gate TDD and implementation concretely, but keep closure blocked until the owner-approved mirror and provenance define the exact wire shape.
