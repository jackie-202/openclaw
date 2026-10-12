---
title: Deliberation fork cleanup — replace retired loader coupling with generic host-owner fixtures
type: implementation
---

# Deliverable

Make the retained Discord/Slack native owner-path tests runnable without loading retired bundled Deliberation implementation. Replace only obsolete plugin-loader/config/wire assumptions with a minimal generic exclusive-owner test fixture; preserve behavior-critical host coverage and record a real post-retirement focused run.

# Exact inputs and source scope

Write only /Users/michal/Projects/openclaw-fork. Read plans/investigations/task-ef32aba1-f900-432a-a3fa-1ea1ce1a0961_deliberation-openclaw-retirement-scope-and-native-adapter-test-ownership.md, plans/checkpoints/deliberation_bundled_plugin_retirement.md and plans/handoffs/deliberation-plugin-retirement/accepted-host-contract.md. Historical manifest and 43-file retirement are provenance, not source restoration authority. Use current source plus scoped 2026-10-05 AGENTS.md authority.
Primary consumers: extensions/discord/src/monitor/message-handler.deliberation.test.ts, message-handler.process.test.ts, and extensions/slack/src/monitor/message-handler.deliberation.test.ts. Characterize their exact assertions before edits. Prefer established generic plugin/hook fixtures; add at most a minimal domain-qualified host-owner fixture if needed (not a replica plugin or config engine). A fixture may claim handled/declined/failure; it must not mock away the host processDiscordMessage/Slack preparation path.
External assertion ownership may be checked read-only in /Users/michal/Projects/deliberation-pipeline/plugins/openclaw-deliberation/{src,scripts}; no sibling writes, shell execution, imports or vendoring. Sibling package activation is not a prerequisite for generic host behavior, and this work must not claim installed-plugin parity.

# Required behavior and bounded cleanup

Preserve OR-01/OR-03/OR-04/OR-05/OR-06 semantics: native input/context mapping, owner-before-output/typing, handled terminal claim, declined ordinary continuation, fail-closed error/ambiguous termination, Slack native root/child/ambiguous-child routing, duplicate/dual-envelope arbitration, distinct-event/no-debounce separation and no ordinary side effects on handled/failure. Preserve outside-source ordinary Slack preparation. Keep Slack history native provider bridge/API/cursor tests, outbound provider-owned single-attempt/targeting/limits/results, generic hook/arbitration tests, and no-bundle/no-staged-artifact guards.
Remove duplicated plugin config normalization, loader setup and exact plugin wire-body assertions only with exact external replacement path/test/assertion mapping; retain host-supplied facts. Do not delete these test files wholesale or restore extensions/deliberation or the local thread identity store. No production behavior refactor is expected. Rename opaque fixture owner IDs only where useful.
Do NOT remove EXCLUDED_CORE_BUNDLED_PLUGIN_DIRS or the package exclusion, alter build/package policy, or weaken no-bundle guarantees; those metadata changes need separate clean-build/tarball evidence. Update current docs only if an exact existing public package path is verified; do not invent a path. Historical reports stay historical.
No installation/activation/deploy/restart/build-link/hook/scheduler/runtime-data changes, providers/messages/live calls, or gate release. Historical exhausted retirement remains unsuccessful; this is independent bounded fixture cleanup.

# Verification and evidence

Establish characterization before modification. Run focused native Discord process/owner/queue, Slack owner/history/handler, generic hook and build-entry negative tests through scripts/run-vitest.mjs / the registered repository test wrappers with applicable config. Preserve the full registered npm test obligation. Missing SDK/provider dependencies remain blockers; do not stub external SDK exports, skip native suites or fabricate green. Record exact commands, assertion mapping and before/after results in plans/checkpoints/deliberation_generic_host_fixture_cleanup.md. Source-suite success is not installed-package, real-provider or deployed proof. Any added module must have a domain-qualified filename; no generic helpers/utils/state/config/common.
