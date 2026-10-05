---
title: Remove deliberation from the fork's bundled plugin registration surface
type: implementation
---

# Remove deliberation from the fork's bundled plugin registration surface

## Goal

Stop `openclaw-fork` from registering, expecting and gating on `deliberation`
as a **bundled** plugin. This is the registration/expectation half of the
externalization: after this task the fork must not claim deliberation ships
inside core, and its bundled-plugin test expectations, build entries and gate
scripts must not require it.

This task is deliberately narrower than the full retirement task
`calm-fork-3432` (which additionally requires a completed external cutover with
recorded identity-bound evidence). Do **not** delete `extensions/deliberation`
here — `calm-fork-3432` owns source removal.

## Exact files / known references

Bundled discovery itself is a filesystem scan of `extensions/*` — there is no
hand-maintained bundled id array in production code. The coupling that must
change is in expectations, build entries and gate scripts:

- `src/plugins/bundled-plugin-metadata.test.ts`
  - `EXPECTED_BUNDLED_STARTUP_PLUGIN_IDS` (~line 39) lists `"deliberation"`.
  - `it("starts Deliberation when explicitly enabled")` (~line 626).
- `src/plugins/source-checkout-runtime.test.ts` (~lines 51, 55, 88) —
  `onlyPluginIds: ["deliberation"]` source-checkout registry assertion.
- `scripts/test-built-plugin-singleton.mjs` — hardcoded `deliberationId`,
  `dist/extensions/deliberation`, `dist-runtime/extensions/deliberation`,
  probe-API import and loaded/hookCount assertions.
- `test/scripts/bundled-plugin-build-entries.test.ts`
- `scripts/deliberation-full-gate.ts`, `scripts/lib/deliberation-full-gate-ledger.ts`,
  `test/scripts/deliberation-full-gate.test.ts`,
  `test/scripts/deliberation-package.e2e.test.ts`
- `package.json` script `test:deliberation:full-gate` (~line 1769).
- Incidental mentions to classify, not necessarily change:
  `src/agents/embedded-agent-utils.test.ts`,
  `src/auto-reply/reply/dispatch-from-config.test.ts`,
  `src/plugin-sdk/channel-inbound.test.ts`.

Also note `src/plugins/externalized-bundled-plugins.ts` already provides the
`ExternalizedBundledPluginBridge` shape (bundledPluginId / pluginId /
npmSpec / clawhubSpec / legacyPluginIds / channelIds / preferOver / bundledDirName)
used by `src/plugins/update.ts` and `src/cli/plugins-location-bridges.ts`.
Assess whether deliberation should be declared through that existing
externalized-bridge mechanism so users with the bundled plugin enabled migrate
cleanly, rather than simply dropping the id and leaving no migration path.
Report the decision and its evidence; do not invent a new parallel mechanism.

## Boundaries / non-goals

- Repository-local to `~/Projects/openclaw-fork`. Do not read the sibling
  deliberation-pipeline repository or real home configuration.
- Do NOT delete or edit `extensions/deliberation/**`. Source retirement is
  `calm-fork-3432`.
- Do not delete failing tests to make the suite pass, and do not add silent
  skips. If an expectation is genuinely obsolete, change it to assert the new
  intended behavior and explain it in the final note.
- Do not run `npm link`, `openclaw doctor`, a deploy, or any live restart or
  config edit.
- Preserve generic plugin/hook/channel runtime APIs used by other plugins.
- No version-control operations.

## Verification

- `input/scenario → expected → proving test`:
  - gateway startup resolution with empty config → deliberation absent from
    bundled startup ids → `bundled-plugin-metadata.test.ts`
  - config explicitly enabling a `deliberation` entry → behavior matches the
    chosen migration decision (either external-bridge resolution or documented
    no-op), asserted explicitly rather than deleted
  - built-runtime singleton check → passes without requiring a bundled
    deliberation runtime entry → `scripts/test-built-plugin-singleton.mjs`
  - preservation: every other bundled plugin id still resolves exactly as
    before → same metadata test

Commands, from `~/Projects/openclaw-fork`:

```
node scripts/run-vitest.mjs run --config test/vitest/vitest.config.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts
node scripts/test-projects.mjs --changed HEAD
```

Record exact commands and results in the final note.

## Output

Write `plans/checkpoints/deliberation_bundled_registration_removal.md` listing
every changed reference, every reference deliberately retained with its reason,
the migration-path decision for existing enabled configs, and the focused test
results.
