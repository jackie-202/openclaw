---
title: "Named package leaves must assert every behavior in their name"
date: 2026-08-23
category: test-failures
component: e2e
tags: [openclaw, package-e2e, acceptance, deliberation, tdd]
file_type: checklist
---

# Named package leaves must assert every behavior in their name

An independent smoke test does not satisfy an acceptance requirement that a specific named E2E leaf cover the same behavior. The Deliberation package suite already ran `scripts/test-built-plugin-singleton.mjs`, but `OR-22 doctor-package-writeback-built-five-hook-runtime` itself only verified doctor migration and package discovery. Acceptance correctly treated the hook/service portion as uncovered.

For package-scoped acceptance, probe through the installed artifact rather than importing source checkout modules:

1. Install the real tarball under an isolated prefix.
2. Import the installed `dist/plugins/build-smoke-entry.js`.
3. Point plugin discovery at the installed `dist/extensions` directory.
4. Load only the target plugin with canonical migrated config.
5. Assert the ordered typed-hook registration and exact service IDs inside the named leaf.

Keep the standalone built singleton smoke too. It catches global built-runtime regressions independently, while the package leaf proves that the installed artifact carries the same registration contract alongside migration behavior.

When this is an acceptance follow-up after implementation already exists, preserve the genuine parent RED and explain the missing-assertion gap. Do not manufacture a new failing production state merely to create fresh RED output.
