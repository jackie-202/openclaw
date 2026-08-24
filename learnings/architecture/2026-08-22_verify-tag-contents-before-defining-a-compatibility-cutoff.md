---
title: "Verify tag contents before defining a compatibility cutoff"
date: 2026-08-22
category: architecture
component: shared
tags: [compatibility, migrations, release-tags, doctor, plugins]
file_type: rules
---

# Verify tag contents before defining a compatibility cutoff

A current worktree or release-named branch does not prove that a feature or legacy shape shipped. Before preserving runtime compatibility or naming a migration window, inspect the exact release tags for the owning file and check whether any tag contains the introduction commit.

For the Deliberation pipeline transition, the latest visible tags and similarly named branches initially suggested a stable legacy window. Direct checks showed that neither `v2026.7.1` nor `v2026.8.1-beta.2` contains `extensions/deliberation/src/config.ts`, and no release tag contains the plugin introduction commit. The correct bound is therefore the latest pre-plugin tag: later tagged releases must be canonical-only, while plugin-owned doctor migration may still repair operational config created by untagged fork builds.

Use evidence such as:

```bash
git show <tag>:<owning-file>
git tag --contains <introduction-commit>
```

Do not infer shipped behavior from dates, branch decorations, package versions, comments, or dirty-worktree code. This avoids inventing a public compatibility contract and keeps runtime parsing canonical while preserving a concrete upgrade path where operational state actually exists.
