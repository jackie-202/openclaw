# TDD Red-Green Proof: swift-brook-0038

<!-- proof-capture-metadata: {"version":1,"task_id":"swift-brook-0038","command":["zsh","-lc","OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton"],"command_sha256":"2a8d31d956a21923b4f0fe025dcf0004e229d5f8e334aa5754bf95c9ca55f81a"} -->

## RED Phase

- **Timestamp:** 2026-08-03T21:18:55.249293+00:00
- **Test command:** `zsh -lc 'OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton'`
- **Exit code:** 1

### Standard Output

```text
[canvas] copy: node scripts/copy-a2ui.mjs
[ELIFECYCLE] Command failed with exit code 1.
```

### Standard Error

```text
$ node scripts/bundled-plugin-assets.mjs --phase copy
$ node scripts/test-built-plugin-singleton.mjs
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Deliberation missing from built runtime registry
    at file:///Users/michal/Projects/openclaw-fork/scripts/test-built-plugin-singleton.mjs:214:8 {
  generatedMessage: false,
  code: 'ERR_ASSERTION',
  actual: undefined,
  expected: true,
  operator: '==',
  diff: 'simple'
}

Node.js v25.6.1
```

### RED Confirmation After Harness Setup Correction

The first run proved the staged artifact was not discoverable because the scoped build omitted metadata assets. The harness was corrected to stage the same `package.json` and `openclaw.plugin.json` files used by a full build, then the identical command failed on the intended runtime descriptor assertion:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ actual - expected

+ []
- [
-   'inbound_claim',
-   'before_dispatch',
-   'before_tool_call',
-   'message_sending'
- ]

at scripts/test-built-plugin-singleton.mjs:226:8
```

## GREEN Phase

- **Timestamp:** 2026-08-03T21:22:09.995751+00:00
- **Test command:** `zsh -lc 'OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton'`
- **Exit code:** 0

### Standard Output

```text
[canvas] copy: node scripts/copy-a2ui.mjs
[build-smoke] built plugin singleton smoke passed
```

### Standard Error

```text
$ node scripts/bundled-plugin-assets.mjs --phase copy
$ node scripts/test-built-plugin-singleton.mjs
Config warnings:
- tools.web.search.provider: web_search provider is not available: brave (configured plugin "brave" is unavailable; Gateway will ignore this optional provider until the plugin is installed/enabled or openclaw doctor --fix repairs the config)
- plugins.entries.acpx: plugin not installed: acpx — install the official external plugin with: openclaw plugins install @openclaw/acpx
- plugins.entries.brave: plugin not installed: brave — install the official external plugin with: openclaw plugins install @openclaw/brave-plugin
- plugins.entries.ollama: plugin not found: ollama (stale config entry ignored; remove it from plugins config)
- plugins.entries.browser: plugin not found: browser (stale config entry ignored; remove it from plugins config)
- plugins.entries.openai: plugin not found: openai (stale config entry ignored; remove it from plugins config)
- plugins.entries.mission-control: plugin not found: mission-control (stale config entry ignored; remove it from plugins config)
(node:98988) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```
