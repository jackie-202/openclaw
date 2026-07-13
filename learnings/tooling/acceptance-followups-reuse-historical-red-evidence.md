---
title: "Acceptance follow-ups reuse genuine historical RED evidence"
date: 2026-07-13
category: tooling
component: ci-cd
tags: [tdd, red-green, acceptance, evidence, provenance]
file_type: rules
---

# Reuse historical RED evidence for acceptance follow-ups

When an acceptance follow-up starts after the implementation already exists, rerunning a RED phase would create artificial evidence. Preserve the original helper-captured RED checkpoint as immutable provenance, cite its task ID, command identity, timestamp, exit code, and expected failures, then run the identical command against the preserved implementation for fresh GREEN verification under the follow-up task.

The TDD `proof-capture.py` helper deliberately cannot initialize GREEN from another task's RED. Do not bypass that safeguard by forcing the implemented code to fail. Use a follow-up acceptance checkpoint that links the parent proof and contains directly captured fresh GREEN output, then validate both task identities and exact command equality before completion.
