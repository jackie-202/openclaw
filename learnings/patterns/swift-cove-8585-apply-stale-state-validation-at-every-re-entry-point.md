---
title: "Apply stale-state validation at every re-entry point"
date: 2026-07-18
category: patterns
component: backend
tags: [state-validation, model-selection, shared-helper, defense-in-depth]
---

Fixing only the inbound model bootstrap was insufficient because `createModelSelectionState` could consume the same stored override later and restore the stale value. The working approach centralized the stale auto-fallback decision and used it in both initial inbound selection and final model-selection state creation.

For persisted state that can enter a pipeline through multiple stages, centralize validity rules in one helper and enforce them at every consumption boundary. Avoid parallel, narrowly named detectors when one canonical predicate can cover the shared rule plus context-specific legacy heuristics.
