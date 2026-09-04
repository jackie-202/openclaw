---
title: "Reproduce external-client incidents with the deployed configuration shape"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, km, http, secretref, diagnostics, testing]
file_type: rules
---

# Reproduce external-client incidents with the deployed configuration shape

An isolated listener test can prove the full wire lifecycle and still miss a production request failure when it always uses a bare origin and a materialized credential. The deployed endpoint pathname and SecretInput descriptor are part of the client boundary even when the listener contract and spool are correct.

Before changing an authenticated client, project the active configuration into non-secret test facts: endpoint scheme, host class, port/prefix shape, SecretInput source/provider/id, and whether resolution succeeded. Substitute a random loopback authority and temporary credential, then run the real transport against the canonical listener and disposable state. Require the pre-fix run to fail at the same operation and status as production.

Keep diagnostics closed. Record operation, canonical path, stage, numeric status, canonical protocol code, and a bounded transport classification. Never retain raw endpoint authority, credential values, request/response bodies, queue text, or listener error messages. This makes the mismatch actionable without weakening authentication or leaking payloads.
