---
title: "Kanonický gate nad dirty worktree potřebuje provenienci obsahu"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, provenance, dirty-worktree, crabbox]
file_type: rules
---

# Dirty worktree canonical gates need content provenance

When a canonical remote gate validates preserved, uncommitted implementation work, `HEAD` does not identify the tested source. Before sync, capture the commit, `git status --short`, and a sanitized digest or manifest of the task-owned files; record the same provenance with the provider run ID.

A provider-owned pass is durable only when reviewers can connect the allocated `cbx_...` or `tbx_...` run to the exact synced content. This prevents an authenticated runner from producing a valid-looking pass against a clean commit that omits the implementation under acceptance.
