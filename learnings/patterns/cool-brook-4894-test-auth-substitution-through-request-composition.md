---
title: "Test auth substitution through request composition"
date: 2026-08-20
category: patterns
component: backend
tags: [testing, auth, compaction, vitest, headers]
---

Resolver-only tests are insufficient for synthetic local auth. Test the composed flow: resolve synthetic auth despite a locked OAuth profile, set it as the runtime key, apply the local no-auth override, then apply general auth overrides and assert the created request model has `Authorization: null`. Make harness auth and header-override mocks configurable so compaction integration tests can validate this boundary.
