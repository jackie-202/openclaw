---
title: "Represent media-only messages with metadata-only placeholders"
date: 2026-08-01
category: patterns
component: backend
tags: [attachments, media, privacy, intake]
---

Blank-text messages containing attachments must not be discarded as empty, but forwarding raw media locations can expose URLs or local paths. Derive a closed placeholder from safe metadata, such as `[media: audio/ogg]`, and submit that as intake content. Cover media-only events explicitly because text-centric fixtures will miss this edge case.
