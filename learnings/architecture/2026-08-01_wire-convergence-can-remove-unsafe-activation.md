---
title: "Konvergence wire kontraktu muze odebrat nebezpecnou aktivaci"
date: 2026-08-01
category: architecture
component: shared
tags: [deliberation, wire-contract, authority, acceptance, fail-closed]
file_type: rules
---

# Wire convergence can remove unsafe activation

When an acceptance repair requires a consumer to adopt an authoritative wire contract but that contract omits data required for a downstream side effect, do not choose between inventing the missing data and stopping the whole repair.

Converge the client, fixtures, callers, tests, and documentation on the authoritative header and endpoints, then remove the activation path for the unsafe side effect. For Deliberation, canonical ready/reservation responses do not authorize a Discord account and target, so the safe repair is to remove worker registration while retaining fail-closed intake and guards. A later immutable contract can reactivate sending after it carries destination authority.

This approach closes wire-residue acceptance goals without adding route inference, default-source behavior, transient intake maps, or a second state authority. Tests must separately prove the exact canonical wire and the absence of an active sender.
