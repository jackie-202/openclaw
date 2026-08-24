---
title: "Serialize local heavy checks"
date: 2026-08-22
category: tooling
component: tooling
tags: [typecheck, lint, locking, resource-contention]
---

`tsgo:extensions` waited behind Oxlint's local heavy-check lock for over a minute. The repository intentionally serializes resource-intensive checks, so apparent inactivity is not necessarily a hung process. Respect the lock, inspect its reported owner and working directory, and avoid launching competing heavy checks when a sequential run is sufficient.
