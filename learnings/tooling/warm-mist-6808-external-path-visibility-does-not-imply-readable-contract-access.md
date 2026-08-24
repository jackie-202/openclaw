---
title: "External-path visibility does not imply readable contract access"
date: 2026-08-23
category: tooling
component: tooling
tags: [permissions, external-directory, artifact-access, opencode]
---

Shell metadata operations could list external contract files and calculate their SHA-256 hashes, while direct file reads were denied by the tool permission policy. This allowed identity verification but not semantic inspection. When an implementation depends on external artifacts, confirm read permissions early; hash and existence checks cannot substitute for reviewing contract contents. Prefer an approved readable checkout or synchronized repository-local mirror instead of attempting to infer schema details from filenames, hashes, or stale provenance.
