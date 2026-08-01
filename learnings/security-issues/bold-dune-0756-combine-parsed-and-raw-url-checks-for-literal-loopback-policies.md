---
title: "Combine parsed and raw URL checks for literal loopback policies"
date: 2026-08-01
category: security-issues
component: shared
tags: [url-validation, loopback, ssrf, ipv4, ipv6]
---

When HTTP is permitted only for literal loopback endpoints, parsed hostname checks alone are insufficient because URL canonicalization can turn aliases such as `127.1` into a loopback address. Validate both the parsed identity and the original authority: require the hostname to resolve as loopback while also requiring the raw authority to use exactly `127.0.0.1` or `[::1]`, with an optional port. Continue rejecting credentials, queries, fragments, `localhost`, non-loopback addresses, and alternate IPv4 spellings.
