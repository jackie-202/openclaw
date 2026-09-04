---
title: "Avoid returning expressions from Promise executors"
date: 2026-08-25
category: test-failures
component: tooling
tags: [typescript, eslint, promises, http-tests]
---

The test harness passed runtime tests and typechecks but failed lint because a Promise executor returned the server-close callback expression and an async HTTP listener was supplied where a void callback was expected. The harness was rewritten to invoke `resolve()` or `reject()` without returning their expressions and to keep the listener callback synchronous while handling asynchronous work explicitly. Reuse these forms in Node HTTP tests; successful execution and typechecking do not catch all Promise callback contract violations.
