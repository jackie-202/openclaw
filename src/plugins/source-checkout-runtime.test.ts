/** Verifies source-checkout plugin runtime resolution and dependency diagnostics. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setBundledPluginsDirOverrideForTest } from "./bundled-dir.js";
import { discoverOpenClawPlugins } from "./discovery.js";
import { resetGlobalHookRunner } from "./hook-runner-global.js";
import { loadOpenClawPlugins } from "./loader.js";

describe("source checkout plugin runtime", () => {
  const fixtureDirs: string[] = [];

  beforeEach(() => {
    setBundledPluginsDirOverrideForTest(path.join(process.cwd(), "extensions"));
  });

  afterEach(() => {
    setBundledPluginsDirOverrideForTest(undefined);
    resetGlobalHookRunner();
    for (const fixtureDir of fixtureDirs.splice(0)) {
      fs.rmSync(fixtureDir, { recursive: true, force: true });
    }
  });

  it("loads enabled bundled plugins from source checkout", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["tokenjuice"],
      config: { plugins: { entries: { tokenjuice: { enabled: true } } } },
    });

    const tokenjuice = registry.plugins.find((plugin) => plugin.id === "tokenjuice");
    expect(tokenjuice?.status).toBe("loaded");
    expect(tokenjuice?.origin).toBe("bundled");
    expect(tokenjuice?.source).toContain(
      `${path.sep}extensions${path.sep}tokenjuice${path.sep}index.ts`,
    );
    expect(tokenjuice?.rootDir).toContain(`${path.sep}extensions${path.sep}tokenjuice`);
  });

  it("does not register an enabled Deliberation without an external installation", () => {
    const registry = loadOpenClawPlugins({
      cache: false,
      onlyPluginIds: ["deliberation"],
      config: { plugins: { entries: { deliberation: { enabled: true } } } },
    });
    expect(registry.plugins.find((plugin) => plugin.id === "deliberation")).toBeUndefined();
    expect(registry.typedHooks.some((hook) => hook.pluginId === "deliberation")).toBe(false);
    expect(registry.services.some((service) => service.pluginId === "deliberation")).toBe(false);
  });

  it("discovers external Deliberation through a non-bundled local path", () => {
    const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-deliberation-local-"));
    fixtureDirs.push(fixtureDir);
    const pluginDir = path.join(fixtureDir, "deliberation");
    const packageDir = path.join(fixtureDir, "package");
    fs.mkdirSync(packageDir);
    fs.writeFileSync(
      path.join(packageDir, "package.json"),
      JSON.stringify({
        name: "@example/deliberation",
        openclaw: { extensions: ["./index.js"] },
      }),
    );
    fs.writeFileSync(
      path.join(packageDir, "openclaw.plugin.json"),
      JSON.stringify({ id: "deliberation", configSchema: { type: "object" } }),
    );
    fs.writeFileSync(path.join(packageDir, "index.js"), "export default {};\n");
    fs.symlinkSync(packageDir, pluginDir, process.platform === "win32" ? "junction" : "dir");

    const result = discoverOpenClawPlugins({ extraPaths: [pluginDir] });
    const candidates = result.candidates.filter((candidate) => candidate.idHint === "deliberation");
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.origin).toBe("config");
  });
});
