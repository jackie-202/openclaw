---
title: "Acceptance fixes need task-scoped production provenance"
date: 2026-08-24
category: tooling
component: general
tags: [acceptance, provenance, task-scope, review]
---

An implementation can already be behaviorally correct yet still fail acceptance when the current task does not contain a reviewable production change and task-local evidence. In this case, preserved production code already had the required service owner, but the follow-up needed an explicit bounded diff, exact assertions, and its own proof artifacts. For acceptance-repair tasks, first distinguish behavioral defects from provenance failures, then make the smallest meaningful task-scoped change and record verification under the current task ID.
