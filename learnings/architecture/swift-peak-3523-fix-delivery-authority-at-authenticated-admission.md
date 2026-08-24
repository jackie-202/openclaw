---
title: "Fix delivery authority at authenticated admission"
date: 2026-08-21
category: architecture
component: backend
tags: [routing, authority, deliberation, cross-provider]
---

Pipeline selection and the effective delivery target should be derived once from authenticated source context during admission. Persist `pipelineId` and `deliveryTarget` in the intake record and do not allow reservation-time target overrides. This prevents destination drift and ensures later processing cannot redirect a message independently of the admitted route. Explicit targets must remain exact, while omitted targets may derive thread information from the authenticated source.
