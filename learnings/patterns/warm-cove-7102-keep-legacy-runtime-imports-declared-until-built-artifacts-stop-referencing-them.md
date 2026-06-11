---
title: "Keep legacy runtime imports declared until built artifacts stop referencing them"
date: 2026-06-10
category: patterns
component: backend
tags: [dependency-management, compatibility, global-agent, runtime-imports, packaging]
---

Even though the intended implementation path used `@openclaw/proxyline`, the runtime still needed `global-agent` available because shipped artifacts were still importing it. The durable lesson is that dependency cleanup must follow the actual built import graph, not just current source intent. Avoid removing or downgrading a package until post-build verification proves no generated or compatibility layer still references it. A quick probe like `node -e "import('global-agent')..."` is a good final check for runtime package availability.
