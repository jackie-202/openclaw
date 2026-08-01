---
title: "WHATWG URL parsing erases empty delimiters"
date: 2026-08-01
category: patterns
component: backend
tags: [whatwg-url, validation, credentials, query, fragment]
---

The WHATWG `URL` API normalizes empty URL components, so forms such as `https://@km.invalid`, `https://km.invalid?`, and `https://km.invalid/#` can produce empty parsed username, search, or hash values. Checks against parsed fields alone may therefore accept syntax that a manifest regex rejects. When delimiter presence itself is forbidden, inspect the raw input for credential, query, and fragment delimiters in addition to checking parsed component values.
