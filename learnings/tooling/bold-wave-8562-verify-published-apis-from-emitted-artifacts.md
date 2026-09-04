---
title: "Verify published APIs from emitted artifacts"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [build-smoke, exports, module-identity, singleton]
---

Source tests and extension typechecks passed, but the change also introduced a published build entry. Verification therefore included a full build followed by an isolated singleton smoke that imported emitted code and checked the built API classification and module SHA-256 identity. Reuse this gate for new public exports: source-level tests do not prove that packaging, aliases, post-build steps, and runtime imports expose the intended artifact or preserve singleton identity.
