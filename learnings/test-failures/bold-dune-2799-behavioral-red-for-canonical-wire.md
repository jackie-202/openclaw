---
title: "Acceptance fixes need behavioral RED evidence for canonical wire changes"
date: 2026-07-29
category: test-failures
component: general
tags: [acceptance, tdd, deliberation, contracts]
file_type: rules
---

# Acceptance fixes need behavioral RED evidence for canonical wire changes

When an acceptance-fix task requires TDD proof, do not reuse a blocked contract-gate note as RED if the repair is going to change fork-owned behavior. Add a focused test that fails against the current OpenClaw-side behavior and proves one concrete contract mismatch.

For Deliberation KM wire repairs, a small `km-client.test.ts` assertion on the actual `fetchImpl` URL and headers is enough to prove a real RED before production edits. Then update the client, contract fixture, and fixture provenance together so the GREEN test and `contract.test.ts` prove a single canonical route/header family remains.

Keep external authority bounded: only encode values that the task contract explicitly authorizes or that are already repository-owned fixtures. Do not inspect or mutate live KM, routes, Gateway state, spool data, or external services during a preparation-mode acceptance fix.
