---
title: "Baileys 408 login failures surface through a structured disconnect path"
date: 2026-05-04
category: runtime-errors
component: backend
tags: [whatsapp, baileys, 408, login, disconnect]
---

A WhatsApp `408` during QR/login does not fail at the socket creation call directly. The failure path runs through `waitForWaConnection`, which rejects from `connection.update.lastDisconnect`, then `waitForWhatsAppLoginResult` converts that into a failed login outcome, and finally `loginWeb` rethrows from that result. Reuse this trace when debugging login crashes or missing error context: inspect the `lastDisconnect` payload first, then the login outcome mapping, then the final throw site.
