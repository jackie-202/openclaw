---
title: "Audit historical runtime aliases by architecture generation"
date: 2026-08-10
category: architecture
component: tooling
tags: [runtime-aliases, package-exports, plugin-sdk, speech-core, investigation]
file_type: checklist
---

# Audit historical aliases by architecture generation

When auditing an old runtime alias, do not treat deletion of its former directory as proof that the alias is obsolete. First separate every specifier family and compare them at the requested base commit:

- package-qualified imports such as `@openclaw/speech-core/runtime-api.js`
- plugin SDK imports such as `openclaw/plugin-sdk/speech-core`
- repository-relative imports such as `./runtime-api.js`

The speech runtime changed ownership across generations. Commit `2c030c303aba` fixed a workspace package-root alias, while base `4b85d834ed1586062f31bded2f358fc5192d1674` has no `packages/speech-core` or `extensions/speech-core`; it keeps runtime code under `src/tts` and a separate plugin SDK facade. A compatibility verdict therefore needs exact-string source searches plus package export, entrypoint inventory, loader, DTS/build gate, and boot-test evidence. Static absence can support an obsolete verdict, but forbidden build or live checks must remain explicit proof gaps.
