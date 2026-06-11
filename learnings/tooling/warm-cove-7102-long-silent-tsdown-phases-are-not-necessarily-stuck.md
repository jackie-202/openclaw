---
title: "Long silent tsdown phases are not necessarily stuck"
date: 2026-06-10
category: tooling
component: ci-cd
tags: [build, tsdown, observability, timeouts, false-alarms]
---

The build spent about 154 seconds in `tsdown` with repeated `still running pid=...; no output for 30s` messages, then completed successfully. That means this build phase can be quiet for a long time without being hung. Reuse this knowledge when diagnosing similar runs: do not treat periodic no-output watchdog messages as a failure by themselves; wait for the phase timing summary or explicit error before intervening.
