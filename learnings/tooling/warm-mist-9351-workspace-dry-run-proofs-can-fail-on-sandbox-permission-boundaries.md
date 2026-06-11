---
title: "Workspace dry-run proofs can fail on sandbox permission boundaries"
date: 2026-06-10
category: tooling
component: tooling
tags: [sandbox, permissions, workspace, dry-run, acceptance-proof]
---

The final workspace smoke step was prepared correctly, including verifying that both the workspace path and `/tmp` existed, but the actual dry-run command still failed because the tool call needed external-directory permission for `/Users/michal/.openclaw/workspace/*` and that permission was rejected. The durable lesson is that path existence is not enough for proof steps crossing sandbox boundaries. Reuse this by checking whether the verification command will require external-directory access before treating it as a reliable acceptance step, and if permission is denied, record the exact blocker instead of substituting unrelated proof.
