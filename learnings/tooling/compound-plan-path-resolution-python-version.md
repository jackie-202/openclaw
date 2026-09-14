---
title: "Compound-plan path resolution depends on the invoked Python version"
date: 2026-09-09
category: tooling
component: tooling
tags: [compound-plan, python, plan-path, tooling]
file_type: rules
---

# Compound-plan path resolution depends on the invoked Python version

The mandatory `compound-plan` path resolver imports `km-system`, which rejects Python versions older than 3.10. A shell's `python3` may therefore make planning fail before a canonical plan filename is returned, even when the skill bundle and `_path_helpers.py` are present.

When `plan-path.py --touch` fails without printing a path, do not guess a filename or create a plan elsewhere. Report the interpreter error and stop, because the compound-plan workflow makes the resolver output authoritative.

Before retrying a blocked planning task, ensure the `python3` selected by the execution environment is Python 3.10 or newer; then rerun the exact caller-provided resolver command.
