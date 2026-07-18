---
title: "Persistence tests must use the real session-store backend"
date: 2026-07-18
category: test-failures
component: e2e
tags: [session-store, persistence, test-fixtures, e2e]
---

The runner invoked the correct model, but the persistence assertion still observed stale in-memory fixture data. The test had not configured a session-store path, while the production runner persists runtime metadata through the session-store backend.

When testing post-run session state, use the harness's temporary `sessions.json` pattern and reload the persisted row. Do not infer persistence behavior from the original in-memory fixture. Assert both the selected provider/model and the absence of fabricated fallback metadata.
