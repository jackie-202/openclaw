---
title: "Acceptance replans must transfer proof ownership"
date: 2026-08-23
category: tooling
component: tooling
tags: [acceptance, tdd, provenance, cross-repository]
file_type: rules
---

# Acceptance replans must transfer proof ownership

When an acceptance follow-up inherits a genuine RED from a blocked parent, keep the parent proof immutable and create a proof artifact for the new task ID that links it. Fresh GREEN, focused checks, and the completion checkpoint belong to the follow-up task so acceptance tooling can attribute the repaired outcome without mistaking historical evidence for a command run in the current session.

For cross-repository work, repeat the immutable revision, clean-path, and hash preflight before any behavioral edit. Matching artifact hashes do not authorize implementation when the supplied bundle also pins a repository revision.
