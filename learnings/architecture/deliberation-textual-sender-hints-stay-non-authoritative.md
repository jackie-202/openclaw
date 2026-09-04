---
title: "Textual sender hints stay outside identity authority"
date: 2026-08-31
category: architecture
component: shared
tags: [deliberation, discord, slack, identity, plugin-sdk]
file_type: decisions
---

# Keep textual sender hints outside identity authority

Exclusive channel claims run before ordinary finalized-message mapping. Adding sender metadata only to `FinalizedMsgContext` or generic hook mappers therefore does not reach configured Discord or Slack owners. Each channel must project authenticated native identity facts into the early `inbound_claim` event, while the owner plugin normalizes them after route admission.

For Deliberation, keep the opaque provider `senderId` in admission, source identity, and deduplication. Carry display names, usernames, and aliases in a separate optional object that never participates in routing. Normalize at the owner boundary: trim, reject C0/C1 controls and over-byte-limit values, preserve provider order, and deduplicate aliases against direct indicators.

Public plugin SDK declaration checks resolve extensions through generated `dist/plugin-sdk` declarations. A normal cached build can leave those declarations stale when an underlying hook type changes. Run `pnpm build:plugin-sdk:dts` followed by `node --experimental-strip-types scripts/write-plugin-sdk-entry-dts.ts` before extension package-boundary typechecks.
