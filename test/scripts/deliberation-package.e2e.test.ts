import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

type JsonObject = Record<string, unknown>;

const commonConfig = {
  enabled: true,
  failClosed: true,
  processingSource: { channel: "discord", accountId: "acct", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
};

function makeConfig(pluginConfig: JsonObject): JsonObject {
  return {
    plugins: {
      entries: {
        deliberation: {
          enabled: true,
          config: pluginConfig,
        },
      },
    },
  };
}

function makeCanonicalConfig(): JsonObject {
  return makeConfig({
    ...commonConfig,
    pipelines: [
      {
        id: "discord-source",
        source: { channel: "discord", accountId: "acct", target: "source" },
        target: {
          channel: "discord",
          accountId: "delivery",
          target: "channel",
          threadId: "thread",
        },
      },
      {
        id: "slack-source",
        source: { channel: "slack", accountId: "workspace-a", target: "C123" },
      },
    ],
  });
}

function isolatedOpenClawEnv(root: string, configPath: string, packageRoot: string) {
  return {
    ...process.env,
    HOME: root,
    KM_TOKEN: "test-only",
    OPENCLAW_STATE_DIR: path.join(root, "state"),
    OPENCLAW_CONFIG_PATH: configPath,
    OPENCLAW_OAUTH_DIR: path.join(root, "oauth"),
    OPENCLAW_BUNDLED_PLUGINS_DIR: path.join(packageRoot, "dist", "extensions"),
    OPENCLAW_TEST_CONSOLE: "1",
  };
}

function expectSuccess(result: SpawnSyncReturns<string>, label: string): void {
  expect(result.status, `${label}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`).toBe(0);
}

it("OR-22 canonical-package-validation-built-five-hook-runtime", () => {
  const tarball = process.env.OPENCLAW_CURRENT_PACKAGE_TGZ;
  if (!tarball) {
    throw new Error("OPENCLAW_CURRENT_PACKAGE_TGZ is required");
  }

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-package-"));
  try {
    const prefix = path.join(root, "prefix");
    const install = spawnSync(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", prefix, tarball],
      { encoding: "utf8", timeout: 180_000 },
    );
    expectSuccess(install, "install packaged OpenClaw");

    const packageRoot = path.join(prefix, "node_modules", "openclaw");
    const entrypoint = path.join(packageRoot, "openclaw.mjs");
    const runCli = (configPath: string, args: string[]) =>
      spawnSync(process.execPath, [entrypoint, ...args], {
        encoding: "utf8",
        env: isolatedOpenClawEnv(root, configPath, packageRoot),
        timeout: 60_000,
      });
    const writeFixture = (name: string, config: JsonObject) => {
      const configPath = path.join(root, `${name}.json`);
      fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
      return configPath;
    };

    const canonicalPath = writeFixture("canonical", makeCanonicalConfig());
    const validateCanonical = runCli(canonicalPath, ["config", "validate"]);
    expectSuccess(validateCanonical, "validate canonical config");

    const listPlugins = runCli(canonicalPath, ["plugins", "list", "--json"]);
    expectSuccess(listPlugins, "discover packaged plugins");

    const runtimeProbeSource = `
      import fs from "node:fs";
      import path from "node:path";
      import { pathToFileURL } from "node:url";

      const packageRoot = process.env.OPENCLAW_PROBE_PACKAGE_ROOT;
      const configPath = process.env.OPENCLAW_PROBE_CONFIG_PATH;
      const entry = path.join(packageRoot, "dist", "plugins", "build-smoke-entry.js");
      const { loadOpenClawPlugins } = await import(pathToFileURL(entry).href);
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      const registry = loadOpenClawPlugins({
        cache: false,
        workspaceDir: path.dirname(configPath),
        onlyPluginIds: ["deliberation"],
        env: process.env,
        config,
      });
      const plugin = registry.plugins.find(({ id }) => id === "deliberation");
      const hooks = registry.typedHooks
        .filter(({ pluginId }) => pluginId === "deliberation")
        .map(({ hookName }) => hookName);
      const services = registry.services
        .filter(({ pluginId }) => pluginId === "deliberation")
        .map(({ service }) => service.id);
      console.log(
        "OPENCLAW_RUNTIME_PROBE=" + JSON.stringify({ status: plugin?.status, hooks, services }),
      );
    `;
    const runtime = spawnSync(
      process.execPath,
      ["--input-type=module", "--eval", runtimeProbeSource],
      {
        encoding: "utf8",
        env: {
          ...isolatedOpenClawEnv(root, canonicalPath, packageRoot),
          OPENCLAW_PROBE_PACKAGE_ROOT: packageRoot,
          OPENCLAW_PROBE_CONFIG_PATH: canonicalPath,
        },
        timeout: 60_000,
      },
    );
    expectSuccess(runtime, "load installed Deliberation runtime");
    const probeLine = runtime.stdout
      .split("\n")
      .find((line) => line.startsWith("OPENCLAW_RUNTIME_PROBE="));
    expect(probeLine).toBeDefined();
    const registration = JSON.parse(probeLine!.slice("OPENCLAW_RUNTIME_PROBE=".length)) as {
      status: string;
      hooks: string[];
      services: string[];
    };
    expect(registration.status).toBe("loaded");
    expect(registration.hooks).toEqual([
      "inbound_event_policy",
      "inbound_claim",
      "before_dispatch",
      "before_tool_call",
      "message_sending",
    ]);
    expect(registration.services).toEqual(["deliberation-final-delivery"]);

    const refusalFixtures: Array<[string, JsonObject, string]> = [
      [
        "legacy-sources",
        makeConfig({
          ...commonConfig,
          sources: [{ channel: "discord", accountId: "acct", target: "source" }],
        }),
        "sources",
      ],
      [
        "mixed-sources",
        makeConfig({
          ...commonConfig,
          pipelines: [
            {
              id: "canonical",
              source: { channel: "discord", accountId: "acct", target: "source" },
            },
          ],
          sources: [{ channel: "discord", accountId: "acct", target: "legacy" }],
        }),
        "sources",
      ],
      [
        "mixed-global-target",
        makeConfig({
          ...commonConfig,
          pipelines: [
            {
              id: "canonical",
              source: { channel: "discord", accountId: "acct", target: "source" },
            },
          ],
          deliveryTarget: {
            provider: "discord",
            accountId: "delivery",
            channelId: "channel",
          },
        }),
        "deliveryTarget",
      ],
    ];

    for (const [name, fixture, unsupportedKey] of refusalFixtures) {
      const configPath = writeFixture(name, fixture);
      const before = fs.readFileSync(configPath, "utf8");
      const validation = runCli(configPath, ["config", "validate"]);
      expect(validation.status, `${name} unexpectedly validated`).not.toBe(0);
      expect(validation.stdout + validation.stderr).toContain(unsupportedKey);
      expect(fs.readFileSync(configPath, "utf8"), `${name} must not be mutated`).toBe(before);
      expect(
        fs.readFileSync(configPath, "utf8"),
        `${name} must not be reinterpreted`,
      ).not.toContain('"id": "v1:');
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}, 300_000);
