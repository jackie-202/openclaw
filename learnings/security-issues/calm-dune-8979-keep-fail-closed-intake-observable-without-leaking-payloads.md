---
title: "Keep fail-closed intake observable without leaking payloads"
date: 2026-08-01
category: security-issues
component: backend
tags: [fail-closed, logging, privacy, diagnostics]
---

Fail-closed intake has many intentional skip paths, including disabled configuration, processing routes, unmatched routes, missing IDs, and empty content. Without distinct diagnostics these paths are indistinguishable from broken intake. Log a stable reason for every skip and sanitize downstream failure warnings so message text, media URLs, and filesystem paths are never included. Tests should assert both the reason emitted and the absence of sensitive values.
