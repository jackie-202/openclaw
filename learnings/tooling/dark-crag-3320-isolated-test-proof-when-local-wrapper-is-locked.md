---
title: "Acceptance Fix: Isolated Test Proof When Local Wrapper Is Locked"
date: 2026-05-04
category: tooling
component: tooling
tags: [acceptance-fix, vitest, test-lock, tdd-proof]
file_type: rules
---

# Acceptance Fix: Isolated Test Proof When Local Wrapper Is Locked

When an acceptance-fix task starts after production code has already been committed, missing RED/GREEN proof cannot always be regenerated honestly from the current tree without temporarily undoing completed work. Preserve the completed implementation and make the proof file explicit about which evidence is reconstructed from the pre-hardening behavior versus which GREEN output was freshly run.

For OpenClaw targeted Vitest proof, if `pnpm test <file>` is queued behind another active local heavy-check lock that cannot be killed, use the repo wrapper `node scripts/run-vitest.mjs` with the exact scoped config and a unique `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH`. This avoids racing the shared experimental Vitest module cache while still using the project Vitest wrapper rather than raw `vitest`.

Example:

```bash
OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/Users/michal/.openclaw/tmp/opencode/vitest-cache-task \
  node scripts/run-vitest.mjs run \
  --config test/vitest/vitest.extension-whatsapp.config.ts \
  extensions/whatsapp/src/login.malformed-result.test.ts
```

Always record the local wrapper blockage separately from the actual targeted proof, and do not treat unrelated broad extension failures as regressions for a focused login-boundary test.
