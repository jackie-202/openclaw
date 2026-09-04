---
title: "Deployable probes need independent network and provider isolation"
date: 2026-08-25
category: architecture
component: backend
tags: [probes, provider-isolation, synthetic-adapters, redaction, production-paths]
---

The probe safely exercised the real ready/reserve/invoke/complete lifecycle by combining two independent boundaries: a constrained disposable loopback endpoint and deterministic synthetic providers that callers could neither select nor inject. It reused the production KM client, target parsing, idempotency, and final adapter while returning only bounded, redacted diagnostics. Reuse this structure when building deployed diagnostics: exercise production orchestration code, but make external side effects structurally unreachable rather than relying on caller discipline or documentation.
