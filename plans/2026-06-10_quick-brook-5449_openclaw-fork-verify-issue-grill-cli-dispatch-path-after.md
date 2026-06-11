# Plan 2026-06-10: Verify issue-grill CLI dispatch dependency path

Confirm the OpenClaw linked CLI uses the fixed `global-agent` dependency graph and can build the issue-grill dry-run bundle without the prior `ERR_MODULE_NOT_FOUND` failure.

## Problem

The prior OpenClaw fix appears to declare `global-agent`, but acceptance still needs proof against the executable linked CLI path, not just source metadata.

## Analysis

### Codebase Context

- `package.json:1894` declares runtime dependency `global-agent: 4.1.3`.
- `npm-shrinkwrap.json:39` declares `global-agent: 4.1.3` for npm package installs.
- `pnpm-lock.yaml:123`, `pnpm-lock.yaml:5442`, and `pnpm-lock.yaml:11385` lock `global-agent@4.1.3` and its dependencies.
- `src/plugins/AGENTS.md:82` requires `pnpm build` when plugin loader/runtime import fanout changes; use rebuild only if linked artifacts are stale or proof fails.
- `dist/proxy-lifecycle-*.js` is not present in the current checkout, so verification must treat the installed/symlinked `openclaw` executable and any regenerated `dist` output as runtime truth.
- `plans/checkpoints/warm-cove-7102.checkpoint.md:10` records that the OpenClaw side was rebuilt and focused checks passed, but workspace grill smoke remained incomplete.

### Relevant Documentation

- `docs/security/network-proxy.md:37` says the public contract is proxy routing behavior, not the internal Node hook.
- `docs/security/network-proxy.md:39` says Proxyline is the process-level routing runtime; keep any dependency correction aligned with the actual built import graph.
- `docs/start/openclaw.md:73` documents `~/.openclaw/workspace` as the default agent workspace; use it only for the requested dry-run smoke.
- No PlantUML diagrams were found under `docs/**/*.puml`.

### Knowledge Base

- `learnings/patterns/warm-cove-7102-keep-legacy-runtime-imports-declared-until-built-artifacts-stop-referencing-them.md`: dependency cleanup follows the built import graph; keep `global-agent` declared while built artifacts still import it.
- `learnings/tooling/warm-cove-7102-rebuild-linked-cli-after-runtime-dependency-changes.md`: when CLI behavior disagrees with source, inspect/refresh `dist`, rebuild before retesting, and verify the linked executable path.

## Available Skills

- `compound-plan`: already used to create this plan.
- `openclaw-testing`: use only if focused checks fan out or a safer OpenClaw proof path is needed.
- `save-learning`: mandatory final step after the verification task is complete.

## Solution

1. Verify the dependency declaration and lock state first; do not edit if `package.json`, `pnpm-lock.yaml`, and `npm-shrinkwrap.json` already agree.
2. Check which `openclaw` executable is being run and whether it resolves to this fork or a stale global install.
3. Run `openclaw --version` and direct `import('global-agent')` from the fork to prove the dependency is available.
4. If `openclaw` still fails with `ERR_MODULE_NOT_FOUND: global-agent`, run the minimum rebuild/link refresh for this repo, then rerun the failed proof.
5. If rebuild is not enough, make the smallest OpenClaw-only correction to package metadata, lockfile, or stale proxy lifecycle source; do not modify Mission Control or workspace scripts.
6. Run the required focused OpenClaw checks and workspace dry-run smoke.
7. Record exact command outcomes in `plans/checkpoints/quick-brook-5449.checkpoint.md` if proof needs durable task evidence.
8. Invoke `save-learning` as the last action before final handoff.

## Implementation

1. In repo root, inspect runtime dependency state with file reads/searches only; avoid git commands.
2. Run `openclaw --version`; if it is not the linked fork CLI, identify the blocker and stop before faking proof.
3. Run:

```bash
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
```

4. If step 2 or 3 fails because artifacts are stale, run the minimal repo refresh needed, normally `pnpm build`, then repeat the failed command.
5. If dependency metadata is incomplete, update only the OpenClaw package metadata/lockfile or source that directly causes the missing runtime import, then rebuild.
6. Run:

```bash
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
```

7. From `/Users/michal/.openclaw/workspace`, run:

```bash
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

8. If workspace smoke needs permission outside the OpenClaw fork, record the exact command and permission blocker; do not substitute unrelated proof.
9. Do not run or implement Mission Control `runGrillTrigger()`; this task ends at OpenClaw CLI/runtime and safe dry-run bundle proof.

## Files to Modify

| File                                               | Change                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `package.json`                                     | Modify only if `global-agent` is missing or misplaced for runtime installs.                     |
| `pnpm-lock.yaml`                                   | Modify only as the lockfile counterpart to a required package metadata correction.              |
| `npm-shrinkwrap.json`                              | Modify only as the npm package install counterpart to a required runtime dependency correction. |
| Proxy lifecycle source under `src/**`              | Modify only if proof shows stale source still generates an invalid `global-agent` import path.  |
| `plans/checkpoints/quick-brook-5449.checkpoint.md` | Optional proof log if task evidence needs a durable OpenClaw-local checkpoint.                  |

## TDD: skip

This is a verification-first task with existing focused regression commands; add or change tests only if proof exposes an actual OpenClaw code defect.

## Verification

Run and record these exact OpenClaw fork commands:

```bash
openclaw --version
node -e "import('global-agent').then(()=>console.log('global-agent-ok')).catch(e=>{console.error(e); process.exit(1)})"
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

Run and record these exact workspace dry-run commands:

```bash
python3 km-system/scripts/grill-trigger.py --issue 143 --dry-run --json --bundle-out /tmp/openclaw-grill-button-fix-smoke-bundle.json
python3 km-system/scripts/issue-grill-bundle.py --read /tmp/openclaw-grill-button-fix-smoke-bundle.json --section overview
```

## Guardrails

- No git operations.
- No Mission Control edits.
- No channel ID, session key, cron config, routing, workspace script, or task pipeline changes.
- No unrelated upstream divergence cleanup.
- No fake evidence; exact blockers are acceptable evidence gaps.

---

_Status: DRAFT_
