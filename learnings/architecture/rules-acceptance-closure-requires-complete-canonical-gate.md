---
title: "Uzaverka acceptance nesmi povysit castecny gate na zeleny"
date: 2026-07-25
category: architecture
component: tooling
tags: [acceptance, evidence, verification, closure]
file_type: rules
---

# Evidence-gated closure

When a closure criterion requires the canonical test/build gate, focused tests plus a successful build are not equivalent to a green canonical gate. Preserve exact historical outcomes for every required command; if a later slice does not supply a complete green record, mark the acceptance item and overall closure as FAIL even when the failures were documented as unrelated.

Collect migration proof with a sanitized equality check rather than copying live configuration into the report. Compare target sets, canonical model values, absence of the retired model field, and normalized supplemental fields; a missing backup or mismatch is an evidence gap, not permission to infer success.