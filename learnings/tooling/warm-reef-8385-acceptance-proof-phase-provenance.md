---
title: "Acceptance proof repairs need explicit phase provenance"
date: 2026-08-25
category: tooling
component: tooling
tags: [acceptance, tdd, evidence, provenance]
file_type: rules
---

# Acceptance proof repairs need explicit phase provenance

An acceptance monitor can report that a supplied RED/GREEN artifact lacked GREEN even when the workspace copy later contains it. Planning must distinguish the monitor's immutable supplied snapshot from current repository state instead of dismissing either one.

For an evidence-only follow-up, preserve and link the genuine historical RED, then capture a fresh GREEN with the identical focused command under the follow-up task. Do not create a post-implementation RED, rerun completed implementation work, or treat checkpoint claims and truncated session-log extraction as substitutes for command output with exit code and test totals.

The follow-up checkpoint should link the canonical plan plus both evidence sources and leave production/tests unchanged unless inspection proves a real defect.
