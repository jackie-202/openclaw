---
title: "Acceptance retries need self-contained artifact evidence"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance, investigations, evidence, git-diff]
file_type: rules
---

# Acceptance retries need self-contained artifact evidence

When an acceptance-fix task is rejected for missing evidence, do not rely on a final-answer summary alone. Put the verifiable command names and representative outputs directly into the requested investigation/checkpoint artifacts.

For markdown-only investigation retries, `git diff --check` is still the required lightweight proof, but untracked report files may not appear in `git diff`. Make the artifact itself auditable by including concrete bash evidence such as counts, representative log lines, upstream commands, cleanup status, and verification output.

This is especially important for external-log investigations where the relevant proof comes from `~/.openclaw/logs/`: record redacted command output in the report so acceptance can verify the source without needing hidden terminal history.
