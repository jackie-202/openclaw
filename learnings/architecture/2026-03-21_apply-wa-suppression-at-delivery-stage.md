---
title: "Apply WA suppression at delivery stage"
date: 2026-03-21
category: architecture
component: tooling
tags: [architecture, auto-extracted]
file_type: rules
---

# Apply WA suppression at delivery stage

## What happened

The task analysis concluded that WhatsApp auto-reply blocking for plugin-deliberated channels should be enforced in the delivery path, not by altering earlier inbound hook broadcasts. Existing plans and architecture notes reinforced this separation of concerns.

## What to do

Implement plugin-only suppression checks in the outbound delivery/dispatch layer where final send decisions are made. Keep inbound claim/message-received flow intact unless the requirement explicitly targets event propagation.

## Context

Extracted from task: Block WA auto-reply delivery for plugin-deliberated channels
