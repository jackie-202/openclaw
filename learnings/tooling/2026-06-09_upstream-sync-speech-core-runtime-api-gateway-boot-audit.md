---
title: "Upstream sync boot audit: speech-core runtime-api alias broke Gateway replies"
date: 2026-06-09
category: tooling
component: openclaw-upstream-sync
tags: [openclaw, upstream-sync, gateway, speech-core, plugin-sdk, runtime-alias, force-push]
---

# Upstream sync boot audit: `speech-core/runtime-api.js` broke Gateway replies

## Situation

During the 2026-06-09 OpenClaw upstream sync, the fork built far enough to start the Gateway, but real channel replies failed after restart with:

```text
Unable to resolve bundled plugin public surface speech-core/runtime-api.js
```

This was not a config-only failure. It was a source/runtime alias seam introduced by upstream package layout changes plus our local plugin SDK alias assumptions.

## What changed / why the Gateway did not fully work

The speech runtime public surface moved to a workspace package shape:

- There is no `extensions/speech-core/**` source tree anymore.
- Speech runtime lives under `packages/speech-core/`.
- `packages/speech-core/runtime-api.ts` is a package-root entrypoint, not `packages/speech-core/src/runtime-api.ts`.
- Runtime/public-surface resolution still needed to understand `@openclaw/speech-core/runtime-api.js`.

The old alias generation only handled selected workspace packages and source files under `packages/<pkg>/src/<file>`. That meant package-root entrypoints such as `packages/speech-core/runtime-api.ts` were invisible in a source checkout, even though build artifacts existed in `dist`.

## Files that had to be adjusted to get Gateway replies/routing working

### `src/plugins/sdk-alias.ts`

Actual runtime fix.

- Added `@openclaw/speech-core` to workspace package alias generation.
- For source checkout resolution, aliases now try both:
  - `packages/<pkg>/src/<file>`
  - `packages/<pkg>/<file>`
- This lets package-root entrypoints resolve before/distinct from built dist files.

### `packages/speech-core/package.json`

Public package export fix.

- Added explicit export for `./runtime-api.js` pointing at `./dist/runtime-api.mjs` and `./dist/runtime-api.d.mts`.
- This matches the failing runtime specifier with `.js` suffix.

### `tsconfig.json`

TypeScript/path alias fix.

- Added `@openclaw/speech-core/runtime-api.js` path mapping to `./packages/speech-core/runtime-api.ts`.
- Without this, tests/source tooling can pass for extensionless imports but still miss the exact runtime specifier that failed live.

### `src/plugins/sdk-alias.test.ts`

Regression proof.

- Added a fixture for `packages/speech-core/runtime-api.ts` plus `dist/runtime-api.mjs`.
- Added source-mode assertions for:
  - `@openclaw/speech-core/runtime-api`
  - `@openclaw/speech-core/runtime-api.js`
- Added dist-mode assertions for the same two aliases.

### `plans/2026-06-04_retrospective-openclaw-gateway-tui-runaway-opencode-monitor.md`

Incident notes.

- Appended the `2026-06-09 speech-core runtime-api follow-up` section with evidence, source fix, tests, and restart/build verification.
- This is useful as raw forensic context, but the canonical reusable learning is this audit note.

## Validation performed

Pre-restart/source validation:

```text
pnpm test src/plugins/sdk-alias.test.ts src/tts/tts.test.ts
pnpm exec oxfmt --check --threads=1 src/plugins/sdk-alias.ts src/plugins/sdk-alias.test.ts
git diff --check
```

Gateway rebuild/restart proof after approval:

```text
node dist/index.js gateway stop
pnpm build
node dist/index.js gateway start
node dist/index.js gateway status --deep
```

Post-restart proof from the new process:

```text
openclaw --version
# OpenClaw 2026.6.2 (e9a50a7)

openclaw status
# Gateway reachable, LaunchAgent running pid 92490, app 2026.6.2

openclaw doctor
# exited 0; warnings remain but no hard failure
```

Basic Discord routing proof:

- Sent a Discord smoke message to `#autonomous-coding`.
- Receipt/message id: `1514023741426897026`.

## Force-push decision from this checkpoint

Blocked / not safe yet.

Reasons observed after boot proof:

- Local `main` was still `ahead 11, behind 31` versus `upstream/main`.
- Worktree was dirty with the five files listed above.
- Upstream had moved to a newer appcast/release line (`2026.6.5`) while the proven local Gateway process was `2026.6.2`.

Do not force-push from this state. First preserve/commit the Gateway boot fixes, reconcile upstream delta, rebuild, rerun doctor/status/routing, and only then decide whether `origin/main` can be force-pushed with lease.

## Rule for future upstream syncs

Add a post-rebuild live-routing gate, not just `doctor`:

1. Build from the candidate sync branch.
2. Link/restart only after validation passes.
3. Verify `openclaw --version`, `openclaw status`, and `openclaw doctor`.
4. Send one internal Discord/channel smoke message.
5. If any runtime alias/public-surface error appears, audit exact specifier and check both:
   - package `exports`, including `.js` suffixed subpaths,
   - source checkout aliases for package-root entrypoints, not only `src/` entrypoints.

The dangerous pattern: a build can pass while the running Gateway still fails on lazy/runtime public-surface resolution during the first real reply.
