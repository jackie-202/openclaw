---
title: "Dispose registered runtime-context leases explicitly"
date: 2026-08-16
category: runtime-errors
component: backend
tags: [lifecycle, runtime-context, slack, resource-cleanup]
---

A Slack history context registration discarded its lease and depended only on an optional abort signal. Startup failure, monitor exit, or invocation without that signal could leave a stale context containing a closed client or token in the registry.

Retain every registration lease and dispose it in the owner's existing `finally` cleanup path. Abort-based cleanup can remain supplemental, but it must not be the sole lifecycle guarantee.