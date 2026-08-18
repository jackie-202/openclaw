---
title: "Acceptance replans separate contract readiness from behavioral TDD"
date: 2026-08-16
category: architecture
component: backend
tags: [acceptance, deliberation, contracts, tdd, provenance]
file_type: rules
---

# Acceptance replans must separate contract readiness from behavioral TDD

When a repeated acceptance fix still depends on an external owner-owned wire shape, the new plan must preserve that gate instead of treating repeated acceptance wording as protocol authority.

For Deliberation, verify the copied KM schema at every target-bearing lifecycle projection before writing the behavioral RED. A passing provenance test only proves the old artifact is intact. If the parent evidence contains no behavioral failure, say so explicitly and capture a new RED under the follow-up task ID only after the structured contract lands.

The implementation plan should still identify the local seam that is already ready. Here, OpenClaw's generic outbound runtime and Discord adapter already accept `threadId`, so the eventual change remains inside Deliberation; no speculative core, Discord, or Slack outbound changes are needed.
