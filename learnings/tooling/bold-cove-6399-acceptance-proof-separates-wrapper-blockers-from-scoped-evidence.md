---
title: "Acceptance Fix Proof Separates Wrapper Blockers From Scoped Evidence"
date: 2026-05-05
category: tooling
component: tooling
tags: [acceptance-fix, tdd-proof, vitest, test-lock]
file_type: rules
---

# Acceptance Fix Proof Should Separate Wrapper Blockers From Scoped Vitest Evidence

When an acceptance-fix task only needs missing proof for an already committed implementation, keep the implementation intact and make the proof artifact explicit about how RED was reproduced. A temporary Vitest config can transform one source module back to the pre-hardening branch behavior, producing concrete failing output without reverting the active workspace.

If `pnpm test <file>` is blocked by the local heavy-check lock, record that blocker separately and then run the same scoped Vitest config through `node scripts/run-vitest.mjs` with a unique `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH`. This gives relevant login regression evidence without claiming unrelated broad-suite output as acceptance proof.

For acceptance artifacts, include the exact RED command, GREEN command, regression command, formatter/lint command, and build command output in the required `plans/checkpoints/<task-id>.red-green-proof.md` path. A proof file with prose-only expected output is not enough for monitor acceptance.
