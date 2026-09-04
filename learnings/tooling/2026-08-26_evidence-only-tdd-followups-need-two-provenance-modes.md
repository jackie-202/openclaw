---
title: "Evidence-only TDD follow-ups need two provenance modes"
date: 2026-08-26
category: tooling
component: ci-cd
tags: [acceptance, tdd, evidence, verification]
file_type: rules
---

# Evidence-only TDD follow-ups need two provenance modes

When implementation already exists, do not rerun RED or weaken the proof to satisfy a task-local helper. Preserve the genuine pre-implementation RED by citing the parent proof with its exact command, timestamp, nonzero exit, aggregate result, and expected behavior failure. Then run that same command freshly and record its direct zero-exit GREEN output in the follow-up's canonical proof.

The TDD `proof-capture.py` helper intentionally rejects a manually linked historical RED because it can authenticate only RED sections it created. That refusal is not an implementation failure and must not lead to a fabricated post-implementation RED. For an acceptance repair explicitly requiring historical reuse, maintain a self-contained task proof that links the immutable parent artifact and includes fresh GREEN provenance.

Also run build and lint sequentially when lint prepares generated package-boundary artifacts. Starting lint while a build is still producing those artifacts can create unrelated missing-export failures; rerun the timed-out build with an adequate timeout before judging the lint result.
