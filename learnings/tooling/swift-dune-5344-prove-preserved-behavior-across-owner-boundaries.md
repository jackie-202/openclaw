---
title: "Prokazování zachovaného chování napříč hranicemi vlastnictví"
date: 2026-08-16
category: tooling
component: shared
tags: [acceptance, evidence, slack, tdd, scoped-verification]
file_type: checklist
---

# Prove preserved behavior at each ownership boundary

An acceptance repair can fail even when runtime behavior already exists if the review bundle omits the production path or only proves isolated endpoint values.

For provider identity normalization, keep the evidence layered and attributable:

- Prove the transport chooses the canonical child event identity, including fallback behavior such as Slack `message.ts ?? message.event_ts`.
- Prove the generic hook mapper forwards that identity without rewriting it.
- Prove owner-plugin admission distinguishes child identity from thread identity and normalizes roots with `threadId ?? providerEventId`.
- Prove persistence happens before the external intake request while the external wire remains unchanged.
- Include all of those production paths and focused tests in the acceptance bundle, even when no new production edit is justified.

Do not manufacture a no-op production diff or a new RED after implementation exists. Link the genuine historical RED, run fresh GREEN across every relevant ownership layer, and explicitly connect tests that jointly prove a fallback plus downstream normalization.

Repository-wide wrappers may fail before reaching the target because of unrelated package-boundary preparation or formatting debt. Record that blocker, then use the repository wrapper's supported scoped mode and exact task files to establish attributable lint/format evidence without changing unrelated work.
