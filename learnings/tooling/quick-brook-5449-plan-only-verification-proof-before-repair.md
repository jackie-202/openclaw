---
title: "Plan-only verification tasks should encode executable proof before repair steps"
date: 2026-06-10
category: tooling
component: tooling
tags: [planning, verification, linked-cli, global-agent, openclaw]
file_type: rules
---

# Plan-only verification tasks should encode executable proof before repair steps

When creating a plan for a verification-first OpenClaw task, make the executable proof path the center of the plan before listing any repair action. For the `global-agent` linked CLI follow-up, current metadata already showed `global-agent` in `package.json`, `pnpm-lock.yaml`, and `npm-shrinkwrap.json`, so the plan should not assume another code fix. It should first prove the actual `openclaw` executable and safe workspace dry-run path, then only allow the smallest OpenClaw-only correction if that proof fails.

This avoids turning acceptance verification into unrelated Mission Control or routing work, and preserves the important distinction between source metadata, built artifacts, and the linked CLI users actually execute.
