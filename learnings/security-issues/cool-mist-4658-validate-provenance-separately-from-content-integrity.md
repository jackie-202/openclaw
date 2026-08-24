---
title: "Validate provenance separately from content integrity"
date: 2026-08-23
category: security-issues
component: shared
tags: [provenance, sha256, git-revision, supply-chain]
---

Matching file hashes alone did not satisfy the immutable authority gate because the containing checkout was at an unapproved commit. Content integrity and source provenance protect different properties and should be checked separately. For supplied contract or runtime artifacts, require the expected repository revision, a clean scoped worktree, and exact hashes; do not infer approved provenance merely because current bytes match.
