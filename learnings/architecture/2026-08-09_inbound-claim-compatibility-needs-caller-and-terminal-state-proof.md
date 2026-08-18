---
title: "Kompatibilita inbound claim vyzaduje dukaz volajiciho a terminalniho stavu"
date: 2026-08-09
category: architecture
component: general
tags: [openclaw, plugins, inbound-claim, compatibility, dedupe]
file_type: checklist
---

# Inbound claim compatibility requires caller and terminal-state proof

A same-named hook runner in two revisions does not establish runtime compatibility. Audit the full chain:

1. Registration and plugin activation.
2. The production caller and its eligibility gate.
3. Relative order against binding ownership, dedupe, commands, observations, and agent dispatch.
4. Event/context fields actually projected by the caller.
5. Result handling, including reply delivery and every unclaimed/error fallback.
6. Terminal cleanup for dedupe, operation lifecycle, audit, and idle/processed markers.

This matters especially when a global API remains implemented but production dispatch has become binding-targeted. A binding-dependent consumer can migrate cleanly while an unbound consumer becomes unreachable even though both still compile.

Early terminal branches deserve a separate state ledger. In the audited fork, the global handled branch returned without committing or releasing the process-global inbound dedupe claim and ignored the hook's optional reply. Comparing only first-claim ordering or tests for agent short-circuiting would miss both defects.

Payload comparisons must be requirement-driven. A newer payload can add structured media and authorization facts while still be incompatible if it removes one authoritative classification field required by a consumer's admission policy.
