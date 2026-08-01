---
title: "Cutover controls require an authority contract"
date: 2026-07-28
category: architecture
component: general
tags: [openclaw, plugins, external-authority, cutover-controls, km]
file_type: rules
---

# Cutover controls require an authority contract

When a plugin consumes a durable external authority, accepted data-plane fixtures do not automatically define operational cutover controls. Health, intake enablement, sender enablement, safe silence, and synthetic operations each need an authoritative contract for persistence, transitions, restart behavior, authorization scopes, command or RPC names, and machine-readable results.

Do not fill this gap with process-local booleans. They reset on Gateway restart, can diverge across workers, and cannot provide reliable cutover evidence. If the external authority already owns workflow and delivery state, require it to publish accepted control fixtures too; otherwise stop and name the missing control contract.

Keep terminal source silence independent from remote control availability. A KM outage or disabled intake/sender state must not reopen ordinary dispatch for configured pilot routes.
