---
title: "Isolate touched-file lint when extension boundary generation is broken"
date: 2026-08-20
category: tooling
component: ci-cd
tags: [oxlint, typescript, extension-boundary, slack, verification]
---

The broad `pnpm lint:core` wrapper can fail before linting touched code because it regenerates extension package-boundary DTS artifacts. An unrelated Slack harness import for the missing `primeChannelOutboundSendMock` export blocked that preparation step.

When this occurs, run `pnpm exec oxlint --type-aware --tsconfig config/tsconfig/oxlint.core.json` directly against the changed files to retain type-aware lint coverage. Report the wrapper failure separately; do not treat an unrelated extension-boundary artifact failure as evidence that the modified files fail lint.
