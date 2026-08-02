---
title: "Require terminal exit evidence after command timeouts"
date: 2026-08-01
category: tooling
component: ci-cd
tags: [acceptance, build, timeouts, evidence]
file_type: rules
---

# Require terminal exit evidence after command timeouts

A command's visible output can look complete even when the execution tool times out immediately afterward. In that state, the output is diagnostic only: there is no trustworthy successful exit result.

For acceptance or build evidence, retry the same command with a timeout that covers its observed duration. Record the retry as the passing evidence and keep the timed-out attempt explicit rather than inferring success from its final log lines. This is especially important for `pnpm build`, whose quiet build phases can consume most of a default 120-second tool budget.
