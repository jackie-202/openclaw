---
title: "Stale listener can disagree with current CLI over the same spool"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [stale-process, listener, spool, diagnostics]
---

A current CLI saw a `READY_TO_SEND` record in the canonical spool while the live listener returned an empty ready list. Endpoint, credential, host, port, script path, and spool selection all matched. The actual difference was process age: the listener had started before several projection and validation modules were updated, so it retained old Python code in memory.

When two clients disagree over the same durable state, compare the running process start time with the modification times of every transitively loaded module, not only the entrypoint. Treat deployment or restart as a separate operator action rather than changing URLs, credentials, or spool state to compensate for stale runtime code.
