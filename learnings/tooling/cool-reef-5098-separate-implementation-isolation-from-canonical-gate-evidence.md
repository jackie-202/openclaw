---
title: "Separate implementation isolation from canonical gate evidence"
date: 2026-08-26
category: tooling
component: ci-cd
tags: [acceptance-gates, clean-checkout, isolation, evidence]
---

The canonical full gate intentionally refused to run because the implementation checkout was dirty. This is desirable for final evidence integrity, but it means the canonical command cannot serve as the only implementation-time isolation check.

During development, use focused tests, sanitized environments, active-surface searches, and preflight observation to prove that no external checkout or credentials are consulted. Generate canonical acceptance artifacts only from a clean committed checkout.

Do not weaken or bypass clean-checkout preflights merely to obtain evidence during implementation. Treat implementation-time isolation proof and canonical final evidence as distinct verification stages.
