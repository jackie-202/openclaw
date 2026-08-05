---
title: "Fetch-generated headers belong to the listener contract"
date: 2026-08-02
category: architecture
component: shared
tags: [node-fetch, http-headers, closed-allowlist, external-contract]
---

Node's Fetch implementation automatically emitted `Sec-Fetch-Mode: cors`, causing the KM listener to return HTTP 400 even though the client supplied only the expected application headers. For strict transport-header allowlists, distinguish runtime-generated transport headers from application-controlled headers. The listener should accept `Sec-Fetch-Mode` case-insensitively with the expected `cors` value while preserving authentication, protocol, and media checks and continuing to reject arbitrary headers such as `X-Deliberation-Unknown`.
