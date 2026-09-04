---
title: "Propagate shared dependencies through every load path"
date: 2026-08-25
category: patterns
component: backend
tags: [startup, reload, deferred-loading, lifecycle, code-review]
---

The initial runtime-sharing change worked on the live deferred-load path but omitted config/plugin reload and two normal startup branches. Automated review found each omission separately. When adding a dependency to plugin loading, enumerate and test initial startup, pre-bind startup, deferred loading, reload, and test/minimal startup paths. A fix that covers only the currently exercised lifecycle can appear correct and later split runtime state after reload.
