---
title: "Review fixtures must reproduce immutable source context exactly"
date: 2026-08-14
category: test-failures
component: e2e
tags: [review-contract, fixture-design, source-context, exact-schema]
---

Advancing a spool record directly to review initially failed because review freshness requires a previously captured immutable source context. A subsequent fixture still failed because source-context messages use an exact closed schema, including `senderIsBot`; extra or missing fields are rejected.

For integration fixtures, exercise the real lifecycle: claim drafting, capture source context, pin and acknowledge the processing session, finalize the draft, attach a valid freshness artifact, and finalize review. Build fixture messages from the canonical contract instead of approximating production records.