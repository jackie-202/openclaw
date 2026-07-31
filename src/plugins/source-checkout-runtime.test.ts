/** Verifies source-checkout plugin runtime resolution and dependency diagnostics. */
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setBundledPluginsDirOverrideForTest } from "./bundled-dir.js";
import { loadOpenClawPlugins } from "./loader.js";

describe("source checkout bundled plugin runtime", () => {
  beforeEach(() => {
    setBundledPluginsDirOverrideForTest(path.join(process.cwd(), "extensions"));
  });

  afterEach(() => {
    setBundledPluginsDirOverrideForTest(undefined);
  });

  it("loads enabled bundled plugins from source checkout", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["tokenjuice"],
      config: {
        plugins: {
          entries: {
            tokenjuice: { enabled: true },
          },
        },
      },
    });

    const tokenjuice = registry.plugins.find((plugin) => plugin.id === "tokenjuice");
    expect(tokenjuice?.status).toBe("loaded");
    expect(tokenjuice?.origin).toBe("bundled");

    const expectedRuntime = `${path.sep}extensions${path.sep}tokenjuice${path.sep}index.ts`;
    const expectedRoot = `${path.sep}extensions${path.sep}tokenjuice`;

    expect(tokenjuice?.source).toContain(expectedRuntime);
    expect(tokenjuice?.rootDir).toContain(expectedRoot);
  });

  it("loads Deliberation with exactly four hooks and one worker", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["deliberation"],
      config: {
        plugins: {
          entries: {
            deliberation: {
              enabled: true,
              config: {
                enabled: true,
                failClosed: true,
                sources: [{ channel: "discord", accountId: "acct-1", target: "source-1" }],
                processingSource: {
                  channel: "discord",
                  accountId: "acct-1",
                  target: "processing-1",
                },
                km: {
                  endpoint: "https://km.invalid",
                  credential: { source: "env", provider: "default", id: "KM_TOKEN" },
                  requestTimeoutMs: 1000,
                  pollIntervalMs: 1000,
                },
                restrictedSessionKeys: ["agent:reviewer"],
              },
            },
          },
        },
      },
    });

    expect(registry.plugins.find((plugin) => plugin.id === "deliberation")?.status).toBe("loaded");
    expect(
      registry.typedHooks
        .filter((hook) => hook.pluginId === "deliberation")
        .map((hook) => hook.hookName),
    ).toEqual(["inbound_claim", "before_dispatch", "before_tool_call", "message_sending"]);
    expect(registry.services.filter((service) => service.pluginId === "deliberation")).toHaveLength(
      1,
    );
  });
});
