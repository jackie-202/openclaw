---
title: "Reasoning-effort audits must separate configured wire values from canonical thinking"
date: 2026-08-09
category: architecture
component: backend
tags: [openclaw, reasoning-effort, provider-wrappers, precedence, audit]
file_type: rules
---

# Reasoning-effort audits must separate configured wire values from canonical thinking

An OpenClaw reasoning audit has two independent value paths that can meet at the same payload field:

- Explicit `reasoningEffort` is provider-facing configuration and should be traced unchanged through model, agent, and request parameter merges.
- Session `thinkingLevel` is a canonical product value and may be translated through supported-effort metadata, fallback maps, and provider wrappers.

The decisive compatibility proof is the final wrapper order. A provider builder can preserve explicit effort correctly, then a later thinking wrapper can overwrite `reasoning.effort`. Build one ledger from each source through merge precedence, active wrapper composition, support gating, final wire payload, status projection, and focused test. Commit ancestry and isolated builder tests are supporting evidence only.
