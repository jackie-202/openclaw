---
title: "Exclude verbatim diff payloads from Markdown formatting"
date: 2026-07-24
category: tooling
component: tooling
tags: [formatting, markdown, diff, whitespace]
---

Running `oxfmt` over Markdown containing a verbatim fenced diff silently removed single-space context lines at 17 locations. The document remained syntactically valid, but its embedded payload no longer matched the canonical diff byte-for-byte. The payload had to be restored and the semantic-review file excluded from subsequent formatter checks while surrounding evidence files were formatted normally. Treat exact evidence payloads as immutable data: format the wrapper before embedding, or exclude the payload-bearing artifact and always rerun a byte-equality check afterward.