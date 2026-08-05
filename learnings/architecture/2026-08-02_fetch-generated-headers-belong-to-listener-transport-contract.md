---
title: "Fetch-generated headers belong to the listener transport contract"
date: 2026-08-02
category: architecture
component: shared
tags: [node-fetch, undici, http-headers, wire-contract, deliberation]
file_type: rules
---

# Fetch-generated headers belong to the listener transport contract

When an authenticated client uses Node's supported global `fetch`, Undici may add transport metadata after caller headers are built. In a local probe, `sec-fetch-mode: cors` was emitted even after the caller deleted `sec-fetch-mode` from a `Headers` object.

For a listener that validates a union of closed application and transport header allowlists, this cannot be repaired by changing the caller's `RequestInit`. Replacing `fetch` merely to suppress a standard generated header changes transport ownership and should not be used as a compatibility workaround.

The narrow repair is listener-owned:

- classify the specific generated header case-insensitively as transport metadata;
- keep authentication, protocol, media type, and application-header validation unchanged;
- keep unknown application headers rejected;
- update the authoritative wire fixture and listener regression first, then sync hash-pinned mirrors in consumers.

For OpenClaw Deliberation, `extensions/deliberation/contracts/km-wire-v1.json` is a provenance-pinned mirror of KM authority. Do not hand-edit it ahead of the KM-owned canonical contract. A useful consumer regression uses real global `fetch` against a loopback test listener derived from the mirrored transport allowlist; a mocked `fetchImpl` cannot expose automatically generated headers.
