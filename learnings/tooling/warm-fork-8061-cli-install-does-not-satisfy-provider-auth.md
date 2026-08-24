---
title: "Instalace gate CLI neposkytuje autoritu poskytovatele"
date: 2026-08-23
category: tooling
component: ci-cd
tags: [acceptance, test-gate, blacksmith, authentication, provenance]
file_type: checklist
---

# Installing a gate CLI does not supply gate authority

For provider-owned acceptance gates, separate three preflight states: executable availability, provider authentication, and runner allocation. Installing the official Blacksmith CLI resolved only the first state; `blacksmith auth status` still reported no organization authentication, browser OAuth timed out, and no `tbx_...` run could be allocated.

Evidence must therefore name the last completed state. A CLI version or successful provider probe is not a canonical run reference. If authentication cannot complete non-interactively, stop before syncing a dirty workspace and request a caller-owned token or OAuth completion rather than substituting local tests.
