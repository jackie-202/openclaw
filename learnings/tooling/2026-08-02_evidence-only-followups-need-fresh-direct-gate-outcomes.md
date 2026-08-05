---
title: "Evidence-only follow-ups need fresh direct gate outcomes"
date: 2026-08-02
category: tooling
component: ci-cd
tags: [acceptance, test-gate, vitest, checkpoint]
file_type: rules
---

# Evidence-only follow-ups need fresh direct gate outcomes

When an acceptance retry reports `canonical:not-run`, a historical TDD artifact proves the original RED/GREEN cycle but cannot establish sibling guard or dispatch gates that were never captured. Keep the historical RED intact and run each required GREEN command directly through the repository wrapper.

For OpenClaw, record the exact command and terminal test count in the active checkpoint immediately after the run. A directory-level plugin run is useful for fail-closed coverage because it includes config, hooks, plugin registration, KM client, contract, and sole-send tests, while the focused core `-t` run separately proves dispatch short-circuiting without coupling core to plugin internals.

Do not change production code during an evidence-only retry when these fresh gates pass. Also do not fabricate a second RED after the implementation already exists.
