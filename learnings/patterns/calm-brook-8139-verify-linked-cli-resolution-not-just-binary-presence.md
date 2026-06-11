---
title: "Verify linked CLI resolution, not just binary presence"
date: 2026-06-10
category: patterns
component: tooling
tags: [cli-linking, symlink, realpath, environment-proof, global-agent]
---

The verification did more than check `command -v openclaw`: it resolved the binary to its real path and confirmed it pointed at the forked `openclaw.mjs`, then validated a critical runtime dependency with a `global-agent` import smoke test. This produced stronger proof than a version check alone.

Reuse this pattern for CLI dispatch debugging: confirm command discovery, resolve the final target path, check reported version, and run a minimal dependency import. That combination catches mislinked binaries and missing runtime pieces that a simple `--version` check can miss.
