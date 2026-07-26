---
title: "Use portable validation when optional search tools are absent"
date: 2026-07-24
category: tooling
component: tooling
tags: [portability, validation, ruby, ripgrep]
---

Evidence checks initially assumed `rg` was installed, but the environment returned `command not found`. Small Ruby scripts provided a reliable fallback for counting diff headers, detecting truncation markers, and comparing embedded content byte-for-byte. Critical acceptance validation should not depend solely on optional developer utilities; use repository-guaranteed runtimes or check tool availability first.