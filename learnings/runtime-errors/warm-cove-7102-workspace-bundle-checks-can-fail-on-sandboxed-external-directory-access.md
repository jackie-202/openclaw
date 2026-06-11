---
title: "Workspace bundle checks can fail on sandboxed external-directory access"
date: 2026-06-10
category: runtime-errors
component: tooling
tags: [permissions, sandbox, workspace, bundle-checks, external-directory]
---

The follow-up dry-run bundle generation failed before execution because access to `/Users/michal/.openclaw/workspace/*` was treated as `external_directory` and auto-rejected. The failure was environmental, not a product regression. Next time, verify sandbox scope before scheduling workspace-level verification steps, and either run them from an already approved location or request the needed directory permission up front to avoid false-negative validation failures.
