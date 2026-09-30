---
title: "Preserve commit ownership in acceptance handoffs"
date: 2026-09-15
category: tooling
component: general
tags: [acceptance, evidence, handoff, commit-ownership]
file_type: rules
---

# Preserve commit ownership in acceptance handoffs

When a completion task explicitly reserves staging and commits for a host owner,
an acceptance follow-up should close only the missing evidence gate. Its plan
must still identify complete, separated commit manifests so the host can finish
the handoff without rediscovering scope. Do not turn that requirement into an
unauthorized commit or another source-change pass.
