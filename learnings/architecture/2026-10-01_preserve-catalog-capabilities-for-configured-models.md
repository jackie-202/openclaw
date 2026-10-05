---
title: "Preserve catalog capabilities for configured models"
date: 2026-10-01
category: architecture
component: backend
tags: [model-catalog, thinking, reasoning, compatibility]
file_type: rules
---

# Preserve catalog capability data for configured model entries

When a configured model entry supplies only identity/display fields, it must not erase known model capability metadata from the canonical catalog. Thinking-level selection and payload generation depend on the same supported-effort contract; test both the derived-field case and explicit configured overrides at the merge owner.

During planning, the catalog-backed thinking resolver and completion serializer appeared separate: `thinking.ts` adds only special levels from catalog metadata, while the OpenAI-compatible transport independently serializes/off-handles effort. Characterize the UI/session profile and captured final payload before changing either path, then keep provider-specific payload formats covered.
