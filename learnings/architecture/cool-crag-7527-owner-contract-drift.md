---
title: "Fail closed on Deliberation owner contract drift"
date: 2026-08-17
category: architecture
component: shared
tags: [deliberation, provenance, contracts, fail-closed]
file_type: rules
---

# Fail Closed On Owner Contract Drift

When refreshing a cross-repository provenance pin, verify the owner checkout's
clean immutable `HEAD` and hashes first, but treat those as only byte evidence.
Compare the owner schema and fixtures against the local generic wire and the
provider overlay separately.

For Deliberation v2, a live owner change that requires destination `threadId`,
restricts destination providers, or moves provider routing into the generic
wire is incompatible with the existing generic-wire/provider-overlay split.
Do not update the owner hash or revision in that state: the new pin would claim
compatibility that the local mirror does not provide. Record the exact schema
paths and leave both the provenance manifest and its assertion unchanged.

If a fail-closed gate prevents the intended production change, document why a
RED/GREEN implementation cycle is inapplicable and run only preservation-safe
focused checks. Do not use a passing historical assertion or a hash-only update
as compatibility proof.
