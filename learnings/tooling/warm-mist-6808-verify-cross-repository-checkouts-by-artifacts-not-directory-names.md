---
title: "Verify cross-repository checkouts by artifacts, not directory names"
date: 2026-08-23
category: tooling
component: tooling
tags: [cross-repo, environment, sha256, dependency-discovery]
---

Two different paths appeared to represent `km-system`: `/Users/michal/Projects/km-system` contained only an empty documentation tree, while `~/.openclaw/workspace/km-system` contained the contracts and listener under a different filename than initially expected. The environment variable `OPENCLAW_DELIBERATION_KM_ROOT` was also unset. For future cross-repository work, resolve the canonical root explicitly and validate required files, expected hashes, and actual entry-point names before using a checkout. Directory existence or a familiar repository name is insufficient evidence that the dependency is complete or approved.
