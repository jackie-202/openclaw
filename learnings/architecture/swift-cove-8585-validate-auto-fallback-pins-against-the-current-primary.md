---
title: "Validate auto-fallback pins against the current primary"
date: 2026-07-18
category: architecture
component: backend
tags: [model-selection, auto-fallback, runtime-profile, session-state]
---

A persisted auto-fallback model pin was incorrectly treated as authoritative after the channel's configured primary model changed. This caused a stale Ollama fallback from another primary to override the Einstein channel runtime profile.

Reuse a single staleness check wherever stored model overrides can enter the selection flow. An auto-fallback pin is valid only when its recorded origin matches the current configured or channel primary. Clear mismatched pins before selection rather than merely ignoring them at one call site, because later model-selection stages may otherwise reapply them. Preserve explicit user overrides and same-primary fallback recovery.
