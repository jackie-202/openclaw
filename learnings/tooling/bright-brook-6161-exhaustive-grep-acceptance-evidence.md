---
title: "Ukládej úplný grep důkaz pro acceptance follow-up"
date: 2026-07-19
category: tooling
component: ci-cd
tags: [acceptance, evidence, grep, upstream-compatibility]
file_type: checklist
---

# Persist exhaustive grep evidence for acceptance follow-ups

When an acceptance goal requires a final-note grep classification, a checkpoint statement such as "grep verification completed" is not evidence. Preserve the exact command output and classify every returned match, preferably by exhaustive file and line ranges.

For fork simplifications that retain upstream compatibility, compare the current grep with `upstream/main` before deleting references. Separate runtime reads from schema, migration, metadata, caller, and test references. State the resulting compatibility decision explicitly and include a negative scoped grep for the runtime subtree.

Evidence-only follow-ups should not recreate a RED phase after implementation exists. Link the genuine parent RED/GREEN proof, run fresh GREEN verification, and report any lineage extraction gaps rather than inventing missing outcomes.
