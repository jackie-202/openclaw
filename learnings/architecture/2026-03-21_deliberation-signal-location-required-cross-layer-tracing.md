---
title: "Deliberation signal location required cross-layer tracing"
date: 2026-03-21
category: architecture
component: tooling
tags: [architecture, auto-extracted]
file_type: rules
---

# Deliberation signal location required cross-layer tracing

## What happened

Searches across WhatsApp extension and plugin SDK found no direct inbound_claim hook-runner wiring or dedicated thoughtful-response extension path, while deliberation-related references appeared elsewhere. This showed the decision signal is not centralized in a single obvious module.

## What to do

Before coding, trace the full path across monitor, reply dispatcher/runtime, and config policy files to identify the true control point. Prefer end-to-end dataflow verification over assumptions based on naming.

## Context

Extracted from task: Block WA auto-reply delivery for plugin-deliberated channels
