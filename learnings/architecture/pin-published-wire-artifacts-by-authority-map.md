---
title: "Pin published wire artifacts by authority map"
date: 2026-09-10
category: architecture
component: shared
tags: [deliberation, wire-contract, pinning, provenance]
file_type: rules
---

When planning a cross-repository wire pin, use the accepted transfer bundle's authority map as a closed membership list. Record the bundle version, member order, member digests, and bundle digest in a self-contained local pin; do not make tests or runtime depend on the producer checkout.

Keep content integrity separate from authority ownership: only the published domain contract and fixtures move under the pin, while OpenClaw overlays, source identity, history, and final-delivery contracts remain local. If current consumers cannot represent a supplied fixture, stop with an incompatibility report rather than editing the canonical bytes.
