---
title: "Loopback alone does not isolate a mutating probe"
date: 2026-08-25
category: security-issues
component: backend
tags: [loopback, ephemeral-ports, probe-safety, input-validation]
---

The delivery probe initially accepted any loopback port from 1 through 65535. Review identified that this still allowed callers to target a privileged or long-running local KM service and mutate real delivery state with supplied credentials. The boundary was tightened to the project's high-ephemeral range (`32768-65535`) and covered by a rejection test for low ports. Reuse this defense for local probes that perform mutations: validate both the host and the expected disposable-listener port policy before any I/O. Do not treat `localhost` by itself as an isolation guarantee.
