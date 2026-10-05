# Deliberation bundled-registration removal

## Changed references

- `scripts/lib/bundled-plugin-build-entries.mjs`: exclude deliberation from core build entries; the existing metadata copier consequently removes stale `dist/extensions/deliberation` output and the runtime stager no longer sees it.
- `package.json`: exclude `dist/extensions/deliberation/**` from the npm package and remove the obsolete full-gate command.
- `test/scripts/bundled-plugin-build-entries.test.ts`: assert all deliberation build entries and pack artifacts are absent, while Bonjour remains.
- `src/plugins/bundled-plugin-metadata.test.ts`: source and packaged startup inventories exclude Deliberation; metadata, registry, and explicitly enabled startup all omit it.
- `src/plugins/source-checkout-runtime.test.ts`: source checkout no longer registers Deliberation as bundled; a direct non-bundled local path is discoverable as config origin.
- `src/plugins/discovery.ts`, `src/plugins/bundled-plugin-metadata.ts`, `src/plugins/bundled-source-exclusions.ts`: exclude the retained source directory from the fork's bundled source, built-fallback, and overlay paths, while preserving config/global discovery.
- `src/plugins/plugin-registry-snapshot.ts`: reject persisted bundled Deliberation records from earlier source checkouts and rebuild the index before startup.
- `scripts/test-built-plugin-singleton.mjs`: remove Deliberation manifest injection, probe import, hook/service claims; retain the synthetic command singleton test and assert the fresh runtime overlay has no deliberation directory.
- `test/scripts/deliberation-package.e2e.test.ts`: replace OR-22 bundled five-hook expectation with an actual installed-tarball test: no bundled deliberation, Bonjour still shipped, and explicitly enabled deliberation is reported by `plugins inspect` as `Plugin not found: deliberation`.
- `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`, `test/scripts/deliberation-full-gate.test.ts`: retire the now-unsatisfiable OR-22-based ledger and its validator-only tests. An OR-23 full-gate integrity claim without OR-22 package proof would misrepresent readiness. Independent Discord, Slack and source-level tests remain executable directly.
- `docs/plugins/reference/deliberation.md`: remove the inaccurate bundled-install statement and explain that an external install route is not yet verified.

## Deliberately retained references

- `extensions/deliberation/**`: checked-in development source, manifest and hooks; removal belongs to `calm-fork-3432`. Source-checkout bundled discovery now excludes this directory, including when dist artifacts exist.
- Direct source-level plugin and channel tests remain independently executable. The previous bundled five-hook/intake runtime assertions were removed because a non-bundled local path cannot use the trusted-only keyed state store (`src/plugins/registry.ts`).
- `extensions/discord/src/monitor/message-handler.deliberation.test.ts` and `extensions/slack/src/monitor/message-handler.deliberation.test.ts`: independent ownership and intake tests remain intact.
- `src/agents/embedded-agent-utils.test.ts`: lowercase word inside reasoning-tag stripping fixture; not a plugin identifier.
- `src/auto-reply/reply/dispatch-from-config.test.ts` and `src/plugin-sdk/channel-inbound.test.ts`: mocked generic exclusive owner ID and dispatch outcome; neither imports or discovers the Deliberation plugin.
- Historic plans, checkpoint proof artifacts, and generic plugin/hook/channel runtime APIs: historical evidence and reusable contracts, not current bundled registration.

## Existing enabled configurations

No automatic external bridge: `src/cli/plugins-location-bridges.ts` requires an enabled persisted bundled record **and** an npm/ClawHub install spec. Deliberation has no catalog install entry or verified external artifact; its source package name alone is insufficient. Installed-package `plugins inspect deliberation` returns `Plugin not found: deliberation` when the entry is enabled but no external plugin is installed. The entry is not silently migrated or registered. A verified external install spec and a positive relocation test are prerequisites for using the existing bridge later.

## Verification

- RED/GREEN captured with identical `node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts test/scripts/bundled-plugin-build-entries.test.ts`: RED 1 failed/15 passed (deliberation entries present); GREEN 16 passed. Genuine captured output: `plans/checkpoints/task-170727a7-f1b4-40e6-b855-2bf5e0147680.red-green-proof.md`.
- `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS=240000 node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts`: 40 passed (initial attempts hit wrapper 120-second no-output watchdog).
- `pnpm build`: passed; `node scripts/test-built-plugin-singleton.mjs`: passed.
- `node scripts/package-openclaw-for-docker.mjs --skip-build --output-dir /Users/michal/.openclaw/tmp/opencode --output-name task-170727a7-openclaw.tgz`: tarball integrity passed. `OPENCLAW_CURRENT_PACKAGE_TGZ=/Users/michal/.openclaw/tmp/opencode/task-170727a7-openclaw.tgz node scripts/run-vitest.mjs run --config test/vitest/vitest.e2e.config.ts test/scripts/deliberation-package.e2e.test.ts`: 1 passed; verified installed package and CLI missing-plugin diagnostic.
- `OPENCLAW_VITEST_NO_OUTPUT_TIMEOUT_MS=240000 node scripts/run-vitest.mjs run --config test/vitest/vitest.extension-discord.config.ts extensions/discord/src/monitor/message-handler.deliberation.test.ts`: 6 passed. Matching extension-slack config and Slack test path: 8 passed.
- `node scripts/run-oxlint.mjs` on six changed source/test files: passed. `pnpm exec oxfmt --check` on changed code, docs, package: passed. `pnpm docs:check-mdx`: passed (682 files).
- `node scripts/test-projects.mjs --changed HEAD`: 3,073 passed, 23 failed across unrelated tooling files (heavy-check lock fixture; Docker bash helpers; plugin gauntlet fixture discovery; runtime postbuild fixture discovery; test-env mutation fixture discovery; test-projects routing). No Deliberation changed-surface failures; did not modify unrelated fixtures.
- `node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.test.src.json` and `node scripts/run-tsgo.mjs -p test/tsconfig/tsconfig.test.json`: existing type errors in `src/plugins/hooks.sync-only.test.ts` (`priority`) and the latter also in `extensions/deliberation/src/final-adapter.test.ts` (incomplete `KmReservation`). No edits to those files.
- Structured autoreview helper was not run: its local mode executes Git commands, while this task expressly forbids version-control operations.

## Acceptance follow-up (task-e5c67922)

- Genuine source-checkout RED and GREEN: `plans/checkpoints/task-e5c67922-31da-45dd-a3ec-305fe308ba2f.red-green-proof.md`. Parent packaging RED remains in the historical proof above and does not cover source registration.
- Focused source metadata, discovery, runtime, persisted registry and package-entry tests: 162 passed. `pnpm build`, built loader enabled-but-uninstalled smoke, `node scripts/test-built-plugin-singleton.mjs`, scoped lint with `OPENCLAW_OXLINT_SKIP_PREPARE=1`, formatter and docs MDX passed. Full lint preparation is blocked by unrelated qa-channel missing protocol exports; test tsgo reports existing `hooks.sync-only.test.ts` priority typing errors.
- Autoreview: accepted and fixed built chunk root resolution, Windows directory junction, symlinked checkout, stale persisted record and bundled source overlay findings; final review clean.
