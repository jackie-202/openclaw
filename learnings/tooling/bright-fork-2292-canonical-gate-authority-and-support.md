---
title: "Kanonická brána musí oddělit autoritu artefaktů od podpůrných testů"
date: 2026-08-24
category: tooling
component: ci-cd
tags: [deliberation, acceptance, cross-repository, provenance, fail-closed]
file_type: rules
---

# Canonical cross-repository gates need two independent inventories

A cross-repository acceptance gate must separate semantic authority from the supporting command inventory.

- Semantic authority comes from the exact accepted artifact paths and hashes. A dependency repository HEAD belongs in provenance and command identity, but unrelated HEAD movement must not invalidate matching authoritative bytes.
- Supporting commands come from the fixed Definition of Done. A stale dependency test that contradicts the accepted artifact schema must remain visible as dependency-test drift, but it must not silently become a new acceptance requirement or force the consumer to weaken required fields.
- Removing a stale aggregate support suite is safe only when every fixed acceptance leaf still executes through its real owner boundary and the remaining final-integrity support set explicitly covers provenance, focused tests, static checks, build, package installation, and cleanup.
- Host environment inheritance is part of evidence design. A hermetic gate needs an explicit no-live guard and sanitized child environment; temporary HOME/SQLite paths alone do not prevent inherited live toggles or provider credentials from changing execution.

Apply these checks before attempting a canonical Green run. If an authoritative hash or a fixed named leaf fails, stop with that exact blocker rather than changing the manifest or manufacturing evidence.
