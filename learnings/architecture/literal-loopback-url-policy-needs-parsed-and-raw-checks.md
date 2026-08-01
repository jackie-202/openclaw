---
title: "Literal loopback URL policy needs parsed and raw checks"
date: 2026-08-01
category: architecture
component: shared
tags: [url-validation, loopback, plugins, config-schema, ipv6]
file_type: rules
---

# Literal loopback URL policy needs parsed and raw checks

When a config contract permits plaintext HTTP only for literal loopback IPs, checking `new URL(value).hostname` is insufficient. Node canonicalizes alternate IPv4 spellings such as `127.1` to `127.0.0.1`, which can accidentally broaden a literal-only policy.

Use URL parsing for protocol, credentials, and port validity, but also compare the original HTTP authority's host token with exactly `127.0.0.1` or `[::1]`. WHATWG `URL` also normalizes empty delimiters: `url.username`, `url.search`, and `url.hash` are empty for inputs such as `https://@host`, `https://host?`, and `https://host#`. If the static schema rejects those forms, runtime validation must inspect raw `@`, `?`, and `#` delimiters too.

Keep a shared case table that runs against both the static plugin manifest pattern and runtime parser so discovery-time and activation-time validation cannot silently drift. Include canonicalization aliases and empty-delimiter cases, not only ordinary credentials, queries, and fragments.
