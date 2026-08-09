---
title: "Validate fractional digit counts before timestamp fixes"
date: 2026-08-09
category: test-failures
component: backend
tags: [deliberation, timestamps, wire-contract, tdd, reproduction]
file_type: rules
---

# Validate fractional digit counts before planning timestamp fixes

When a timestamp bug report describes both a malformed value and a canonical expected value, count the fractional digits and execute the current formatter before proposing a code change. JavaScript `Date#toISOString()` always emits three millisecond digits, so replacing terminal `Z` with `000Z` turns `.816Z` into `.816000Z`, which has six fractional digits and already matches a six-digit microsecond contract.

For Deliberation intake, first add the concrete observed value to the existing real-client request-body test. If that test is GREEN before production edits, record the report as non-reproducible and avoid a behavior-neutral formatter rewrite. Require genuine RED before changing runtime code, while still adding exact-output and `not.toMatch(/\.\d{7,}Z$/)` assertions when the concrete regression was previously absent.
