---
title: "Kanonický gate retry potřebuje spustitelnou provenienci"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, evidence, provenance]
file_type: rules
---

# A canonical gate retry needs executable provenance

An evidence-only acceptance retry is not complete merely because the required full-suite command is known. Before execution, identify the infrastructure owner and require a durable provider/run reference tied to the preserved implementation state. On success, the evidence artifact must record that reference, the exact command, source provenance, exit code, and complete suite totals.

If the provider cannot start, preserve the attempted reference and exact infrastructure failure but keep acceptance blocked. Local suite output, focused historical totals, and self-assigned labels cannot be promoted into caller-owned canonical evidence. Existing genuine RED proof should remain linked rather than recreated after implementation.
