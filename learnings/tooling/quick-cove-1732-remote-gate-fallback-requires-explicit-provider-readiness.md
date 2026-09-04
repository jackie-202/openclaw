---
title: "Remote gate fallback requires explicit provider readiness"
date: 2026-08-31
category: tooling
component: ci-cd
tags: [crabbox, blacksmith, aws, azure, remote-tests]
---

`pnpm check:changed` could not dispatch because the configured Blacksmith executable was absent. An unqualified Crabbox retry unexpectedly selected Azure and failed because Azure CLI/authentication was unavailable. An explicit AWS retry also failed because the required Crabbox broker login was missing.

Before relying on a remote broad gate, verify both provider selection and its prerequisites. Specify the intended provider explicitly and confirm the corresponding CLI, authentication, or broker session exists. Distinguish dispatch failures from test failures and retain successful task-scoped verification when infrastructure cannot allocate a runner.
