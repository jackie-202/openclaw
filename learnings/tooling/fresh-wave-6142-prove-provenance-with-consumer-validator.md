---
title: "Prove Provenance With the Consumer Validator"
date: 2026-08-17
category: tooling
component: ci-cd
tags: [deliberation, provenance, acceptance, validation]
file_type: rules
---

# Prove Provenance With the Consumer Validator

A manifest-level hash assertion proves local contract copies only. When a
repository has a cross-repository validator, acceptance evidence must include a
fresh successful validator run against the trusted owner checkout. Record the
full command, exit result, and test summary in the canonical Test Gate artifact;
link inherited RED/GREEN separately rather than reconstructing it.
