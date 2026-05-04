# Plan 2026-05-04: WhatsApp 408 Unhandled Rejection Investigation

Trace the crash from runtime evidence to source, compare current fork against upstream, and write a recommendation report without changing runtime code.

## Problem

Resolve the source-level cause of the gateway crash after WhatsApp Web 408 disconnects and recommend patch, cherry-pick, or rebase.

## Analysis

### Kontext z codebase

- Inspect `src/gateway/server-channels.ts:511`-`524`; this is the tracked channel task `.then/.catch/.finally` path matching the reported supervisor block.
- Inspect `src/gateway/server-channels.ts:525`-`566`; this cleanup/restart tail can convert handled channel failures into later unhandled promise rejections.
- Inspect `src/gateway/server-channels.test.ts:157`-`229`; existing auto-restart tests cover clean exit and manual abort, but not malformed/undefined rejection values or logger/status failure paths.
- Locate WhatsApp channel runtime owner under `extensions/whatsapp*/` or bundled plugin paths before attributing behavior to core.
- Use sourcemaps if the exact `dist/server.impl-Bkl7pvfK.js` file exists in the runtime bundle; current worktree search did not find that chunk name.

### Relevantní dokumentace

- `docs/plugins/architecture.md`: use plugin capability ownership boundaries; keep WhatsApp-specific diagnosis in the WhatsApp plugin unless a generic channel-runtime seam is proven.
- `docs/plugins/sdk-channel-plugins.md`: use channel plugin runtime ownership and session/transport responsibilities to separate core supervisor failures from WhatsApp transport failures.
- `docs/platforms/mac/child-process.md`: read only if the report needs launchd restart evidence or macOS gateway lifecycle details.

### Knowledge base

- `learnings/tooling/fork-sync-hotfix-then-rebase.md`: if one upstream fix is identified, recommend hotfix cherry-pick first, full rebase later; always rebuild before restart.
- `learnings/runtime-errors/gateway-startup-after-upstream-pull.md`: verify stale `dist`/running process mismatch before trusting chunk stack line numbers.
- `learnings/architecture/whatsapp-plugin-only-delivery-suppression.md`: keep WhatsApp-owned behavior in the plugin delivery/runtime layer, not generic core, unless evidence shows a core supervisor bug.

## Available Skills

- `compound-plan`: already used to create this plan.
- `recall-knowledge`: already used for relevant learning discovery.
- `openclaw-testing`: use only if the investigator decides to run targeted gateway/plugin tests during diagnosis.
- `code-review`: use after the report drafts a concrete diff recommendation and needs sanity review.
- `save-learning`: run after the investigation/report task finishes.

## Solutions

- Produce one diagnostic report that ranks these outcomes by evidence: local guard patch, upstream cherry-pick list, or full rebase.
- Include a concrete diff only if the source line and failing dereference are proven.
- Prefer cherry-pick only when an upstream commit directly changes the proven failing path and applies cleanly to this fork.
- Recommend full rebase only when the crash depends on broad channel-runtime changes that cannot be isolated safely.

## Implementation

### Reproduce

1. Read `~/.openclaw/logs/stability/openclaw-stability-2026-05-04T*-unhandled_rejection.json`; extract stack, rejection reason shape, runtime account state, PID/build path, and nearby gateway log lines.
2. Read the runtime `dist/server.impl-Bkl7pvfK.js` around line `2051` from the path named in the stability bundle; map the generated block to source via `.map` if present.
3. If live reproduction is safe, trigger only a supervised channel restart/stop path; do not disrupt WhatsApp auth or force a production outage.

### Trace

4. Map generated frame to `src/gateway/server-channels.ts` or the exact source file using sourcemap, `grep "channel exited without an error"`, and generated chunk context.
5. Trace each expression inside the failing block: `formatErrorMessage(err)`, `setRuntime(channelId, id, ...)`, and `log.error?.(...)`.
6. Trace cleanup after the catch: `cleanupTaskScopedApprovalRuntime(...)`, `setRuntime(...running:false...)`, `sleepWithAbort(...)`, and restart scheduling.
7. Trace WhatsApp 408 propagation from the WhatsApp runtime through `startAccount(...)`; record whether it rejects, resolves, throws `undefined`, or emits an async rejection outside the returned promise.

### Diagnose

8. Compare current fork with upstream using `git log --since="6 weeks ago" upstream/main -- '*whatsapp*' '**/server*'` and targeted `git show` on candidate commits touching `src/gateway/server-channels.ts`, WhatsApp runtime, channel runtime cleanup, or unhandled rejection handling.
9. Check CHANGELOG/release notes for `2026.5.0` through `2026.5.4` for channel runtime, WhatsApp reconnect, and unhandled rejection fixes.
10. Classify root cause as one of: unsafe logger/status dereference, `formatErrorMessage(undefined)`/redaction bug, `setRuntime` status merge bug, cleanup/restart tail rejection, WhatsApp runtime fire-and-forget rejection, or stale dist mismatch.
11. If a local guard is enough, draft a minimal diff against the proven source line and identify the exact targeted test that would fail before it.
12. If upstream fixed it, list exact SHA(s), changed files, why each commit is necessary, and cherry-pick conflict expectations.
13. If only full rebase is safe, document why no isolated patch/cherry-pick covers the proven path.

### Write Report

14. Create `plans/investigations/bold-reef-9239_wa-408-unhandled-rejection.md`.
15. Write source mapping, evidence, root-cause hypothesis, recommendation, and either the concrete diff, cherry-pick SHA list, or rebase rationale into that report.
16. Link stability bundle filenames and exact source refs using repo-root paths only; redact secrets and avoid absolute local paths except when naming user-provided log locations.

## Files to Modify

| Soubor                                                              | Změna                                                            |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `plans/investigations/bold-reef-9239_wa-408-unhandled-rejection.md` | Add final investigation report with evidence and recommendation. |

## TDD: skip

This task produces an investigation plan/report only; any implementation follow-up must use TDD for a patch task.

## Dependencies

- `upstream/main` remote must be fetchable before upstream comparison.
- Stability bundles must remain available under `~/.openclaw/logs/stability/` for evidence extraction.
- Generated `dist` chunk or sourcemap may need to be read from the runtime bundle rather than the current worktree.

---

_Vytvořeno: 2026-05-04_
_Status: DRAFT_
