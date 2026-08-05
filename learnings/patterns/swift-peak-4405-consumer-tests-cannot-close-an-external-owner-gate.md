---
title: "Consumer tests cannot close an external owner gate"
date: 2026-08-02
category: patterns
component: shared
tags: [contract-testing, ownership, verification, hash-pinning]
---

All OpenClaw Deliberation tests and its TypeScript gate passed, but they only established the unchanged consumer baseline and did not resolve the external listener's HTTP 400. When a contract mirror is hash-pinned to an owner-maintained canonical artifact, do not edit the mirror to work around an incompatibility. Require the owner to publish the revised canonical artifact and listener regression evidence first, then update the consumer mirror. Record baseline success explicitly so it is not mistaken for end-to-end GREEN proof.
