---
title: "Retiring a migration must update acceptance ownership"
date: 2026-09-07
category: architecture
component: tooling
tags: [plugins, migrations, package-e2e, acceptance-gates, deliberation]
file_type: rules
---

# Retiring a migration must update acceptance ownership

A plugin migration sidecar can have indirect consumers outside the parser and doctor code. In Deliberation, the package build inventory and OR-22 full-gate leaf explicitly require `doctor-contract-api.ts`, while the package E2E combines migration writeback with useful installed-runtime startup assertions.

When the migration cutoff expires, do not simply delete the sidecar and its unit test. Trace package entries, tarball assertions, named acceptance leaves, and current docs. Delete migration-only fixtures, then preserve still-current behavior proof by converting the package leaf to canonical config validation and installed plugin registration.

Protocol artifacts need a separate residue verdict. Repository-local use showed `history-read-v2.json` is loaded by a contract test and both history schema versions have distinct runtime branches and tests, so they are not compatibility files merely because they sit near migration-era contracts.
