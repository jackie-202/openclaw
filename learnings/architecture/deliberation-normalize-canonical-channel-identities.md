---
title: "Deliberation: normalizace kanonických identit kanálů"
date: 2026-08-01
category: architecture
component: backend
tags: [deliberation, discord, inbound-claim, route-matching, fail-closed]
file_type: rules
---

# Normalize channel identities at the consuming plugin boundary

Discord's canonical inbound hook context can represent a top-level channel conversation as `channel:<id>`, even when operator-facing plugin configuration intentionally stores the bare channel ID. Synthetic hook tests that use only bare `conversationId` values can therefore pass while every real inbound event misses route matching.

For Deliberation intake, normalize the canonical Discord `channel:` prefix once when constructing the plugin-owned route candidate. Reuse that normalized route for source matching, processing-route exclusion, fail-closed `before_dispatch`, and the KM `sourceTarget`. This preserves one documented config shape instead of adding runtime fallback readers.

Fail-closed intake also needs diagnosable and privacy-safe failure paths. Log stable reason codes for disabled, unmatched, processing, missing-ID, and empty-content skips, but never include message content, attachment paths, or URLs. When a closed external schema requires nonempty content but has no media field, media-only events can use a deterministic MIME-based placeholder such as `[media: audio/ogg]`, falling back to `[media attachment]` without exposing filenames or locations.

Regression tests should construct the event and context shape emitted by the canonical mapper, including `conversationId: "channel:<id>"`, rather than testing only simplified plugin-local fixtures.
