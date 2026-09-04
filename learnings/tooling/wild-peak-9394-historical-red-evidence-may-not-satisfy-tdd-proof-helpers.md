---
title: "Historical RED evidence may not satisfy TDD proof helpers"
date: 2026-08-24
category: tooling
component: general
tags: [tdd, proof-capture, historical-evidence, follow-up]
---

The TDD proof helper refused to append a GREEN result because the follow-up's RED section was imported from a parent task and lacked helper-generated RED metadata. Historical failure evidence can be valid for reasoning while remaining incompatible with automated proof tooling. When a follow-up inherits RED provenance, verify the helper's required metadata format early; if it cannot represent inherited evidence, document the limitation and capture the exact fresh test command and unaltered output directly.
