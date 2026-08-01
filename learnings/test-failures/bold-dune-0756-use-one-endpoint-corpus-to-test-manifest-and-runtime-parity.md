---
title: "Use one endpoint corpus to test manifest and runtime parity"
date: 2026-08-01
category: test-failures
component: shared
tags: [contract-testing, manifest, runtime-validation, table-driven-tests]
---

Declarative manifest validation and runtime parsing can drift even when each appears correct independently. A shared table of accepted and rejected endpoint strings exposed both missing loopback support and normalization-related differences. Reuse one table-driven corpus against the manifest pattern and runtime parser, including IPv4, bracketed IPv6, aliases, credentials, empty delimiters, queries, fragments, and scheme-case policy.
