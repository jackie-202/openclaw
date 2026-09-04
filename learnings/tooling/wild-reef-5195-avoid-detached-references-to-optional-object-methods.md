---
title: "Avoid detached references to optional object methods"
date: 2026-08-31
category: tooling
component: shared
tags: [typescript, oxlint, unbound-method, optional-method]
---

Checking or storing an optional method such as `reader.readChannelPage` triggered the `typescript/unbound-method` lint rule because detaching it could lose its `this` binding. Check capability presence without extracting the method, then invoke it through its owning object. Tests should likewise avoid detached method references or use a bound wrapper.
