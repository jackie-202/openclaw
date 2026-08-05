---
title: "Autoritativni listener proof musi zachovat semantiku poli"
date: 2026-08-04
category: test-failures
component: e2e
tags: [openclaw, deliberation, http, contract-testing, idempotency]
file_type: rules
---

# Authoritative listener proof must preserve field semantics

A permissive loopback fixture can miss byte-level HTTP and normalization requirements. For Deliberation, the KM-owned temporary listener exposed two defects that local request mocks accepted:

- constructing Node request headers through `Headers` lowercased canonical application names, causing the authority to report `AUTH_MISSING`;
- JavaScript's three-digit fractional timestamps had to preserve the same instant using the authority's six-digit form, such as `.483000Z`.

Real duplicate proof also surfaced an important testing boundary. The authority accepts an exact replay for an existing inbound ID, while production `receivedAt` represents actual receipt time. Do not make `receivedAt` equal event time merely to force deterministic replay; that corrupts audit semantics. Instead, fix the evidence clock when replaying the exact producer request against a disposable authority-owned store, and state that condition explicitly in the artifact.

For future external-listener fixes, record the authority revision and source hashes, invoke the real producer, assert safe controls, and query the owner store after replay. Keep credentials, endpoint details, content, sender identity, and raw listener messages out of evidence.
