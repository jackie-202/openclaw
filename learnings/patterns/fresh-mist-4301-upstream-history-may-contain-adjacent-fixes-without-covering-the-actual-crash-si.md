---
title: "Upstream history may contain adjacent fixes without covering the actual crash site"
date: 2026-05-04
category: patterns
component: shared
tags: [upstream, investigation, whatsapp, regression, history]
---

Two recent upstream WhatsApp login fixes (`capture login outcome output` and `route login qr through runtime`) improved logging and QR handling, but neither touched the unsafe `result.error` dereference in `extensions/whatsapp/src/login.ts`. The useful pattern is to verify the current upstream source after reading commit history instead of assuming a nearby fix also solved the runtime crash you are chasing.
