---
title: "Preserve resolved Discord sender identity"
date: 2026-08-02
category: patterns
component: backend
tags: [discord, identity, pluralkit, webhooks]
---

Discord's resolved `sender.id` can differ from `author.id`. For PluralKit or webhook-proxied messages, `sender.id` identifies the human member while `author.id` identifies the bot or webhook. Propagating only `author.id` silently corrupts audit and routing identity. Reuse the precedence `sender.id ?? author.id`, and test both an ordinary message and a proxied message where the two IDs differ.
