---
title: "Use task lineage when a checkpoint is missing"
date: 2026-07-25
category: tooling
component: tooling
tags: [checkpoints, task-evidence, acceptance, recovery]
---

The expected `dark-crag-9860` checkpoint did not exist, so recovery proceeded from the original plan, task description, parent task evidence, and acceptance-run manifest/result. The task-evidence helper provided the authoritative parent evidence path. Acceptance follow-ups should treat task lineage and immutable run artifacts as the recovery source rather than reconstructing results from memory or rerunning broad suites immediately.