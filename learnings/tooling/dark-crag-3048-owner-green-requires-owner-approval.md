---
title: "Owner-runtime GREEN requires authority, not matching fixture hashes"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [deliberation, cross-repository, tdd, provenance, acceptance]
file_type: checklist
---

# Owner-runtime GREEN requires authority, not matching fixture hashes

An owner-listener integration can pass its hash preflight while still being semantically divergent. In the Deliberation gate, the configured owner contract and fixture files matched the OpenClaw provenance hashes, but the real listener rejected positive intake with `400 SCHEMA_INVALID`; the unchanged command remained at 12 passes and 11 failures.

For evidence-only acceptance repairs:

1. Preserve the genuine historical RED and rerun its command byte-for-byte.
2. Record contract, fixture, and executable hashes separately. Accepted mirror hashes do not establish that the executable implements those mirrors.
3. Require explicit owner approval plus semantic inspection of the immutable checkout before changing consumer contracts or tests.
4. Keep repository-local passing tests separate from owner-runtime GREEN. Local totals cannot certify owner SQLite lifecycle rows.
5. If the approved checkout is unavailable, report the gate as blocked. A section heading or aggregate reporter count must never be presented as passing convergence evidence.

This distinction prevents a consumer repository from adapting itself to an unapproved owner implementation merely to make a rollout gate green.
