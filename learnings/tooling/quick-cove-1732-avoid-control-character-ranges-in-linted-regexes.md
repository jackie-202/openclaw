---
title: "Avoid control-character ranges in linted regexes"
date: 2026-08-31
category: tooling
component: shared
tags: [oxlint, regex, unicode, validation]
---

Extension lint rejected intentional C0/C1 control-character regex ranges under `no-control-regex`. Suppressing the rule was unnecessary. Replacing the regexes with explicit Unicode code-point checks preserved the same rejection semantics and passed repository lint policy.

For bounded text validation in this repository, prefer code-point comparisons over regex character ranges containing control bytes.
