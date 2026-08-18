---
title: "Retained contracts supersede older activation snapshots"
date: 2026-08-10
category: architecture
component: general
tags: [compatibility, investigation, activation, authority, deliberation]
file_type: rules
---

# Retained contracts supersede older activation snapshots

When predecessor investigations inspect different revisions, reconcile them by separating historical activation evidence from the current retained contract. An older report can remain correct for its named snapshot without authorizing the same runtime behavior now.

The Deliberation sync exposed this directly. A residue audit proved that its snapshot had one polling service and one durable-send call path, while the retained operator docs and current plugin registration intentionally keep outbound delivery inactive. The current plugin also exports an unwired non-durable adapter that derives a destination from `sourceTarget`; export presence is not activation or authorization proof.

For future compatibility syntheses:

1. Record each report's pinned revision.
2. Trace current activation through manifest, registration, service, and caller paths.
3. Let the retained operator contract decide current activation when it is newer and internally consistent.
4. Preserve older reports as historical evidence instead of treating the difference as either a false report or a current feature.
5. Require a new authority contract before reactivating behavior. A source identity, helper export, fixture, or sole-call-site test is not an authorized outbound destination.
