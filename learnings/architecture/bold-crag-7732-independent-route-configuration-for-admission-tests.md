---
title: "Negative admission tests need independent route configuration"
date: 2026-08-07
category: architecture
component: shared
tags: [deliberation, discord, admission, contracts, testing]
file_type: rules
---

# Negative admission tests need independent route configuration

An intake producer cannot prove wrong-account or processing-route rejection when it constructs its configured source route directly from the event under test. That setup makes every well-formed event match by construction and hides the actual admission boundary.

For producer-focused contract tests, represent configured source and processing identities independently from provider event facts. Drive both through the same production handler, count requests at the KM client boundary, and require zero calls for wrong account, processing, unsupported vocabulary, missing identity, malformed routes, and conflicting duplicated fields.

When the canonical identity grammar belongs to an external owner, synchronize and pin its positive and negative fixtures before writing the codec. Cross-account inequality is a valid initial RED assertion because it exposes the account-less bug without guessing the owner's wire syntax.
