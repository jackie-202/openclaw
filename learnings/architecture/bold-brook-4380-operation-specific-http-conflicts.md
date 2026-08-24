---
title: "Keep expected HTTP conflicts at the endpoint owner"
date: 2026-08-22
category: architecture
component: shared
tags: [deliberation, http, conflicts, replay, km-client]
file_type: rules
---

# Keep expected HTTP conflicts at the endpoint owner

A shared KM request helper must preserve every non-2xx response as a typed HTTP error. Converting selected 409 responses into synthetic success values in the helper loses which operation received the conflict: reservation can legitimately map `CAS_CONFLICT` and `CONTROL_DISABLED` to closed non-send outcomes, while completion must expose the same 409 as a conflict because it means replay evidence differs.

Catch and translate expected conflict codes only inside the endpoint method that owns those semantics. This keeps exact replay as a validated 200 response, preserves conflicting completion evidence as HTTP 409, and prevents generic response parsing from misreporting a real conflict as malformed success JSON.
