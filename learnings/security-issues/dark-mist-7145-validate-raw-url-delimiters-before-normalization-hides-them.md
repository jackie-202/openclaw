---
title: "Validate raw URL delimiters before normalization hides them"
date: 2026-08-21
category: security-issues
component: backend
tags: [url-validation, ssrf, loopback, credentials]
---

KM endpoint validation could not rely only on the parsed `URL` fields because normalization hides empty credential, query, and fragment components such as `https://@host`, `https://host?`, or `https://host/#`. The robust validation combined parsed protocol and hostname checks with inspection of the raw authority and raw `?`, `#`, and `@` delimiters. It allowed HTTPS generally and HTTP only for exact literal loopback hosts (`127.0.0.1` and `[::1]`), deliberately rejecting aliases and abbreviated forms such as `localhost` and `127.1`. Reuse this parsed-plus-raw validation pattern for security-sensitive endpoint configuration.
