// Smoke-tests the built plugin loader singleton and bundled plugin runtime overlay.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { installProcessWarningFilter } from "./process-warning-filter.mjs";
import { stageBundledPluginRuntime } from "./stage-bundled-plugin-runtime.mjs";

installProcessWarningFilter();

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const smokeEntryPath = path.join(repoRoot, "dist", "plugins", "build-smoke-entry.js");
assert.ok(fs.existsSync(smokeEntryPath), `missing build output: ${smokeEntryPath}`);

const {
  clearPluginCommands,
  getGlobalHookRunner,
  getPluginCommandSpecs,
  initializeGlobalHookRunner,
  loadOpenClawPlugins,
  matchPluginCommand,
  resetGlobalHookRunner,
} = await import(pathToFileURL(smokeEntryPath).href);

assert.equal(typeof loadOpenClawPlugins, "function", "built loader export missing");
assert.equal(typeof clearPluginCommands, "function", "clearPluginCommands missing");
assert.equal(typeof getPluginCommandSpecs, "function", "getPluginCommandSpecs missing");
assert.equal(typeof matchPluginCommand, "function", "matchPluginCommand missing");
assert.equal(typeof getGlobalHookRunner, "function", "getGlobalHookRunner missing");
assert.equal(typeof initializeGlobalHookRunner, "function", "initializeGlobalHookRunner missing");
assert.equal(typeof resetGlobalHookRunner, "function", "resetGlobalHookRunner missing");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-build-smoke-"));
const pluginId = "build-smoke-plugin";
const deliberationId = "deliberation";
const distPluginDir = path.join(repoRoot, "dist", "extensions", pluginId);
const runtimePluginDir = path.join(repoRoot, "dist-runtime", "extensions", pluginId);
const distDeliberationDir = path.join(repoRoot, "dist", "extensions", deliberationId);

function cleanup() {
  clearPluginCommands();
  resetGlobalHookRunner();
  fs.rmSync(distPluginDir, { recursive: true, force: true });
  fs.rmSync(runtimePluginDir, { recursive: true, force: true });
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(143);
});

fs.mkdirSync(distPluginDir, { recursive: true });
fs.writeFileSync(
  path.join(distPluginDir, "package.json"),
  JSON.stringify(
    {
      name: "@openclaw/build-smoke-plugin",
      type: "module",
      openclaw: {
        extensions: ["./index.js"],
      },
    },
    null,
    2,
  ),
  "utf8",
);
fs.writeFileSync(
  path.join(distPluginDir, "openclaw.plugin.json"),
  JSON.stringify(
    {
      id: pluginId,
      configSchema: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
    },
    null,
    2,
  ),
  "utf8",
);
fs.writeFileSync(
  path.join(distPluginDir, "index.js"),
  [
    "import sdk from 'openclaw/plugin-sdk';",
    "const { emptyPluginConfigSchema } = sdk;",
    "",
    "export default {",
    `  id: ${JSON.stringify(pluginId)},`,
    "  configSchema: emptyPluginConfigSchema(),",
    "  register(api) {",
    "    api.registerCommand({",
    "      name: 'pair',",
    "      description: 'Pair a device',",
    "      acceptsArgs: true,",
    "      nativeNames: { telegram: 'pair', discord: 'pair' },",
    "      async handler({ args }) {",
    "        return { text: `paired:${args ?? ''}` };",
    "      },",
    "    });",
    "  },",
    "};",
    "",
  ].join("\n"),
  "utf8",
);

for (const fileName of ["package.json", "openclaw.plugin.json"]) {
  fs.copyFileSync(
    path.join(repoRoot, "extensions", deliberationId, fileName),
    path.join(distDeliberationDir, fileName),
  );
}

stageBundledPluginRuntime({ repoRoot });

const runtimeEntryPath = path.join(runtimePluginDir, "index.js");
assert.ok(fs.existsSync(runtimeEntryPath), "runtime overlay entry missing");
assert.equal(
  fs.existsSync(path.join(repoRoot, "dist-runtime", "plugins", "commands.js")),
  false,
  "dist-runtime must not stage a duplicate commands module",
);

clearPluginCommands();

const registry = loadOpenClawPlugins({
  cache: false,
  workspaceDir: tempRoot,
  env: {
    ...process.env,
    OPENCLAW_BUNDLED_PLUGINS_DIR: path.join(repoRoot, "dist-runtime", "extensions"),
  },
  config: {
    plugins: {
      enabled: true,
      allow: [pluginId],
      entries: {
        [pluginId]: { enabled: true },
      },
    },
  },
});

const record = registry.plugins.find((entry) => entry.id === pluginId);
assert.ok(record, "smoke plugin missing from registry");
assert.equal(record.status, "loaded", record.error ?? "smoke plugin failed to load");

assert.deepEqual(
  getPluginCommandSpecs().filter((command) => command.name === "pair"),
  [{ name: "pair", description: "Pair a device", acceptsArgs: true }],
);

const match = matchPluginCommand("/pair now");
assert.ok(match, "canonical built command registry did not receive the command");
assert.equal(match.args, "now");
const result = await match.command.handler({ args: match.args });
assert.deepEqual(result, { text: "paired:now" });

const deliberationRuntimeDir = path.join(repoRoot, "dist-runtime", "extensions", deliberationId);
const deliberationRuntimeEntry = path.join(deliberationRuntimeDir, "index.js");
assert.ok(fs.existsSync(deliberationRuntimeEntry), "built Deliberation runtime entry missing");

const deliberationRegistry = loadOpenClawPlugins({
  cache: false,
  workspaceDir: tempRoot,
  onlyPluginIds: [deliberationId],
  env: {
    ...process.env,
    OPENCLAW_BUNDLED_PLUGINS_DIR: path.join(repoRoot, "dist-runtime", "extensions"),
  },
  config: {
    plugins: {
      enabled: true,
      allow: [deliberationId],
      entries: {
        [deliberationId]: {
          enabled: true,
          config: {
            enabled: true,
            failClosed: true,
            sources: [{ channel: "discord", accountId: "default", target: "pilot" }],
            processingSource: {
              channel: "discord",
              accountId: "default",
              target: "processing",
            },
            km: {
              endpoint: "https://km.invalid",
              credential: "test-credential",
              requestTimeoutMs: 1000,
            },
            restrictedSessionKeys: ["agent:reviewer"],
          },
        },
      },
    },
  },
});

const expectedDeliberationHooks = [
  "inbound_claim",
  "before_dispatch",
  "before_tool_call",
  "message_sending",
];
const deliberation = deliberationRegistry.plugins.find((entry) => entry.id === deliberationId);
assert.ok(deliberation, "Deliberation missing from built runtime registry");
assert.equal(deliberation.source, deliberationRuntimeEntry);
assert.equal(deliberation.status, "loaded", deliberation.error ?? "Deliberation failed to load");
assert.equal(deliberation.hookCount, expectedDeliberationHooks.length);
assert.deepEqual(deliberation.hookNames, expectedDeliberationHooks);
assert.deepEqual(
  deliberationRegistry.typedHooks
    .filter((hook) => hook.pluginId === deliberationId)
    .map((hook) => hook.hookName),
  expectedDeliberationHooks,
);
assert.deepEqual(
  deliberation.services,
  ["deliberation-final-delivery"],
  "built Deliberation runtime did not register its sole delivery service",
);
resetGlobalHookRunner();
initializeGlobalHookRunner(deliberationRegistry);
assert.equal(getGlobalHookRunner()?.hasHooks("inbound_claim"), true);

const deliberationManifest = JSON.parse(
  fs.readFileSync(path.join(deliberationRuntimeDir, "openclaw.plugin.json"), "utf8"),
);
assert.deepEqual(deliberationManifest.expectedHooks, expectedDeliberationHooks);

process.stdout.write("[build-smoke] built plugin singleton smoke passed\n");
