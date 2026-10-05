---
title: "Chybějící export vlastníka lze ověřit bez obnovy odstraněného pluginu"
date: 2026-10-04
category: test-failures
component: tooling
tags: [deliberation, plugin-retirement, tdd, owner-contract, acceptance]
---

# Missing owner exports can be characterized without recreating retired code

The Deliberation retirement acceptance follow-up required a pinned public package and expanded owner assertion evidence, but the repo-local handoff contained only an ownership note, a filename/hash manifest, and a source-suite log. None was runnable offline public-package input.

The existing Slack loader-backed suite already supplied genuine pre-repair RED: all eight owner-path cases failed at the loaded-plugin assertion, while all three native history tests passed. Capturing the unchanged suite through the tdd proof helper produced accepted_red (normal child exit 1); no restored implementation or artificial failing surrogate was necessary.

Command: `node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-slack.config.ts extensions/slack/src/monitor/message-handler.deliberation.test.ts extensions/slack/src/monitor/deliberation-history.test.ts --maxWorkers=2`.

Distinguish this characterization from the parent's source-absence RED, and from future config-origin registration proof. The helper accepts nonzero exit; inspect actual output to confirm assertion failure rather than infrastructure failure. Keep the exact argv for eventual GREEN, and do not manufacture GREEN while the immutable owner package/public testing contract and root/child assertion map are missing. Request those exports and leave acceptance open. The task proof and checkpoint are `plans/checkpoints/task-29e25aa6-c5d5-4da5-ac89-e98c4538a2fc.red-green-proof.md` and its `.checkpoint.md` counterpart.
