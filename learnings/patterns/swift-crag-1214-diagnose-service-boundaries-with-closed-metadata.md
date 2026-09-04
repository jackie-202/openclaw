---
title: "Diagnose service boundaries with closed metadata"
date: 2026-08-25
category: patterns
component: backend
tags: [error-modeling, redaction, observability, retry]
---

KM request failures were made actionable without logging request bodies, credentials, message text, or raw listener responses. A typed request error records a closed operation, canonical path, failure stage, optional HTTP status, canonical error code, and bounded transport cause. The polling service logs only those fields and continues retrying.

Reuse this pattern for sensitive service boundaries: classify failures at credential resolution, transport, JSON decoding, HTTP response, and schema validation; keep operation and path values enum-backed; and test both diagnostic usefulness and absence of secret or payload leakage.
