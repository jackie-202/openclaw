---
title: "Verify Model Ops ownership before planning protected metadata changes"
date: 2026-10-01
category: tooling
component: tooling
tags: [model-ops, model-catalog, scope, planning]
file_type: rules
---

# Check repository ownership before planning protected Model Ops changes

When a task names a repository-owned integration, confirm the implementation actually exists in the allowed repository before planning tests around it. In this GPT-6.1 investigation, repository search found canonical OpenClaw metadata types, OpenAI effort resolution, and Gateway session-patch coverage, but did not find `km-system/scripts/model-ops.py` or `model_ops_register_installed_model` in the fork.

Keep scope boundaries explicit: plan the in-fork catalog/profile path, and treat an absent protected registration owner as a prerequisite requiring the owner/capability to be brought into scope. Do not silently assume neighboring repositories are editable or design an alternate authorization/config bypass. Existing session patch tests already cover GPT-6.1 effort membership, so extend those around the truthful registration-produced catalog and keep the registration contract test colocated with its actual owner once located.
