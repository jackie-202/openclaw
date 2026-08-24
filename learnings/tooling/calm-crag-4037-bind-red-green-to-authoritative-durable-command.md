---
title: "Bind acceptance TDD to the authoritative durable command"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [tdd, acceptance, cross-repository, provenance, durable-state]
file_type: rules
---

# Bind acceptance TDD to the authoritative durable command

When an acceptance repair spans a local consumer and an external durable owner, the RED/GREEN command must exercise the owner-backed durable path rather than only mocked unit behavior. For Deliberation, `pnpm test:deliberation:km-integration` is the command that can prove both distinct SQLite records and restart-safe delivery fencing.

Before writing tests, use task lineage evidence to determine whether a genuine historical RED exists. If the evidence reports none, do not reconstruct history; add new assertions before the missing repair implementation. Require owner provenance/setup to pass first, because missing checkouts, unreadable files, and hash mismatches are setup failures, not behavioral RED.

Keep the proof helper's trailing command identical between RED and GREEN. Run local Vitest files, lint, build, and changed gates afterward as supplemental verification, not as substitutes for the durable proof command.
