---
title: "Acceptance follow-up: parent checkpoint can disprove historical RED provenance"
date: 2026-10-01
category: tooling
component: tooling
tags: [acceptance, tdd, model-ops, provenance]
file_type: rules
---

When an acceptance follow-up requests reuse of historical RED, inspect the parent checkpoint and proof artifacts first. If the checkpoint explicitly records no test implementation and no RED capture, do not claim historical proof exists. For an unimplemented owner-side feature, capture a genuine focused RED after obtaining the owner source, then GREEN against the same test command; if source access remains blocked, leave the repair incomplete rather than calling baseline tests proof.
