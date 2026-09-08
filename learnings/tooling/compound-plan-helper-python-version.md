---
title: "Use a compatible Python for canonical plan path helpers"
date: 2026-09-08
category: tooling
component: tooling
tags: [compound-plan, python, path-helper, macos]
file_type: rules
---

# Planning helpers may resolve through a newer external Python package

The compound-plan path helper can import task-state code outside the skill bundle. On macOS, `/usr/bin/python3` may be Python 3.9 even when a newer Homebrew Python is installed, causing the mandatory helper to fail with `km-system requires Python 3.10 or newer`.

Before treating this as a missing-helper or filename-resolution failure, inspect `python3 --version` and `which -a python3`. If `/opt/homebrew/bin/python3` is suitable, rerun the same helper arguments with `/opt/homebrew/bin` prepended to `PATH`:

```sh
PATH=/opt/homebrew/bin:$PATH python3 "$HOME/.config/opencode/skills/compound-plan/scripts/plan-path.py" ...
```

Do not guess a plan filename when the first invocation fails. Preserve the helper as the canonical path authority and fix only the interpreter selection.
