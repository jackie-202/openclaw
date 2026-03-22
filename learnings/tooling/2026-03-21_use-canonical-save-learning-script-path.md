---
title: "Use canonical save-learning script path"
date: 2026-03-21
category: tooling
component: tooling
tags: [tooling, auto-extracted]
file_type: rules
---

# Use canonical save-learning script path

## What happened

A local skill path lookup (`.claude/skills/save-learning`) failed, but the learning was successfully saved by invoking the configured script under `/Users/michal/.config/opencode/skills/save-learning/`. The workflow still completed correctly after switching to the canonical location.

## What to do

When persisting learnings, use the environment’s configured skill/script path rather than assuming a repo-local mirror exists. If a local path is missing, fall back immediately to the canonical tool location.

## Context

Extracted from task: Block WA auto-reply delivery for plugin-deliberated channels
