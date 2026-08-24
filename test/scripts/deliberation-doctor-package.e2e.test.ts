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

function makeLegacyConfig(): JsonObject {
  return makeConfig({
    ...commonConfig,
    sources: [
      { channel: "discord", accountId: "acct", target: "source" },
      { channel: "slack", accountId: "workspace-a", target: "C123" },
    ],
    deliveryTarget: {
      provider: "discord",
      accountId: "delivery",
      channelId: "channel",
      threadId: "thread",
    },
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

function readPluginConfig(configPath: string): JsonObject {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as {
    plugins: { entries: { deliberation: { config: JsonObject } } };
  };
  return config.plugins.entries.deliberation.config;
}

function expectSuccess(result: SpawnSyncReturns<string>, label: string): void {
  expect(result.status, `${label}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`).toBe(0);
}

it("OR-22 doctor-package-writeback-built-five-hook-runtime", () => {
  const tarball = process.env.OPENCLAW_CURRENT_PACKAGE_TGZ;
  if (!tarball) {
    throw new Error("OPENCLAW_CURRENT_PACKAGE_TGZ is required");
  }

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-doctor-"));
  try {
    const prefix = path.join(root, "prefix");
    const install = spawnSync(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", prefix, tarball],
      { encoding: "utf8", timeout: 180_000 },
    );
    expectSuccess(install, "install packaged OpenClaw");

    const packageRoot = path.join(prefix, "node_modules", "openclaw");
    const contract = path.join(
      packageRoot,
      "dist",
      "extensions",
      "deliberation",
      "doctor-contract-api.js",
    );
    expect(fs.existsSync(contract), `missing packaged doctor contract: ${contract}`).toBe(true);

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

    const migratedPath = writeFixture("legacy", makeLegacyConfig());
    const firstDoctor = runCli(migratedPath, ["doctor", "--fix", "--non-interactive"]);
    expectSuccess(firstDoctor, "first doctor migration");
    expect(firstDoctor.stdout + firstDoctor.stderr).toContain(
      "Migrated Deliberation legacy config",
    );
    expect(readPluginConfig(migratedPath)).toMatchObject({
      pipelines: [
        {
          id: "v1:discord:acct:source",
          source: { channel: "discord", accountId: "acct", target: "source" },
          target: {
            channel: "discord",
            accountId: "delivery",
            target: "channel",
            threadId: "thread",
          },
        },
        {
          id: "v1:slack:workspace-a:C123",
          source: { channel: "slack", accountId: "workspace-a", target: "C123" },
        },
      ],
    });
    expect(readPluginConfig(migratedPath)).not.toHaveProperty("sources");
    expect(readPluginConfig(migratedPath)).not.toHaveProperty("deliveryTarget");

    const firstBytes = fs.readFileSync(migratedPath, "utf8");
    const secondDoctor = runCli(migratedPath, ["doctor", "--fix", "--non-interactive"]);
    expectSuccess(secondDoctor, "idempotent doctor migration");
    expect(fs.readFileSync(migratedPath, "utf8")).toBe(firstBytes);

    const validateMigrated = runCli(migratedPath, ["config", "validate"]);
    expectSuccess(validateMigrated, "validate migrated config");

    const listPlugins = runCli(migratedPath, ["plugins", "list", "--json"]);
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
          ...isolatedOpenClawEnv(root, migratedPath, packageRoot),
          OPENCLAW_PROBE_PACKAGE_ROOT: packageRoot,
          OPENCLAW_PROBE_CONFIG_PATH: migratedPath,
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

    const refusalFixtures: Array<[string, JsonObject]> = [
      [
        "mixed-authority",
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
      ],
      [
        "duplicate-routes",
        makeConfig({
          ...commonConfig,
          sources: [
            { channel: "discord", accountId: "acct", target: "source" },
            { channel: "discord", accountId: "acct", target: "source" },
          ],
        }),
      ],
      [
        "processing-overlap",
        makeConfig({
          ...commonConfig,
          sources: [commonConfig.processingSource],
        }),
      ],
      [
        "impossible-thread-inheritance",
        makeConfig({
          ...commonConfig,
          pipelines: [
            {
              id: "slack-source",
              source: { channel: "slack", accountId: "workspace-a", target: "C123" },
              target: {
                channel: "discord",
                accountId: "delivery",
                target: "channel",
                inheritThread: true,
              },
            },
          ],
        }),
      ],
    ];

    for (const [name, fixture] of refusalFixtures) {
      const configPath = writeFixture(name, fixture);
      const validation = runCli(configPath, ["config", "validate"]);
      expect(validation.status, `${name} unexpectedly validated`).not.toBe(0);

      const doctor = runCli(configPath, ["doctor", "--fix", "--non-interactive"]);
      expect(doctor.stdout + doctor.stderr, `${name} must not be migrated`).not.toContain(
        "Migrated Deliberation legacy config",
      );
      expect(fs.readFileSync(configPath, "utf8"), `${name} must not be guessed`).not.toContain(
        '"v1:',
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}, 300_000);
