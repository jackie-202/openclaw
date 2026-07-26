---
title: "Append-only evidence must record the completed comparison"
date: 2026-07-25
category: tooling
component: general
tags: [acceptance, evidence, verification, append-only, sha256]
file_type: rules
---

# Append-only evidence must record the completed comparison

Recording a pre-append byte count and SHA-256 is not sufficient proof that an append-only document preserved its original content. The durable closure artifact must also state the exact prefix-hash command, expected digest, actual digest, and explicit comparison outcome after the append.

For an evidence-only acceptance retry, do not fabricate a RED or repeat unrelated source gates. Reuse the parent provenance, run the deterministic prefix check as fresh GREEN evidence, and stop without rewriting either artifact if the digest differs.
