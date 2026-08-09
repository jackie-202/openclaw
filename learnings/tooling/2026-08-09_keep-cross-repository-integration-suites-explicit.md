---
title: "Keep cross-repository integration suites explicit and hermetic"
date: 2026-08-09
category: tooling
component: e2e
tags: [cross-repository, integration-tests, node-test, isolation, sqlite]
file_type: rules
---

# Keep cross-repository integration suites explicit and hermetic

When an integration test depends on a sibling checkout that ordinary CI cannot access, do not place it under the repository's default `*.test.ts` discovery and do not silently skip it. Give it a nonstandard suffix, run it through one named package command, and make a missing checkout an actionable nonzero failure.

For OpenClaw TypeScript harnesses, an explicitly selected Node test such as `node --import tsx --test path/to/harness.cross-repo.ts` avoids adding a Vitest project or contaminating `pnpm test:extensions`. The harness remains typechecked when its extension package `tsconfig.json` includes scripts.

The external service must also fail closed. Require an explicit temporary root, sentinel, credential, and spool path; compare resolved paths in both directions against production before constructing storage; pass an allowlisted child environment; and register process and filesystem cleanup immediately. This makes isolation a listener-enforced contract rather than a convention in the caller.
