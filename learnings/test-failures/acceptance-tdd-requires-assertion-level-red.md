---
title: "Acceptance TDD vyžaduje assertion-level RED"
date: 2026-07-27
category: test-failures
component: general
tags: [tdd, acceptance, plugin, external-contract]
file_type: rules
---

# Acceptance TDD needs an assertion-level RED

When a requested plugin does not exist, a test command that matches no files or fails on a missing module is provenance that the target is absent, not a behavioral RED. Acceptance requiring genuine TDD needs an executable target that reaches an assertion before production behavior is implemented.

For a new OpenClaw plugin whose external contract is prerequisite-gated, first obtain the authoritative contract, then create only package metadata and an inert loadable `definePluginEntry` that registers nothing. Add the behavior test next. Assertions for required hooks and services now fail deterministically against executable code, producing a genuine RED without inventing external protocol behavior.

Keep earlier missing-target output and adjacent passing SDK tests explicitly labeled as historical or baseline evidence. Record the new assertion RED and subsequent production GREEN under the current follow-up task ID.
