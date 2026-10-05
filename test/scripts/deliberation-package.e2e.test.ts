import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

it("keeps deliberation out of an installed OpenClaw package even when configured", () => {
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
    expect(install.status, install.stderr).toBe(0);

    const packageRoot = path.join(prefix, "node_modules", "openclaw");
    expect(fs.existsSync(path.join(packageRoot, "dist", "extensions", "deliberation"))).toBe(false);
    expect(fs.existsSync(path.join(packageRoot, "dist", "extensions", "bonjour"))).toBe(true);

    const configPath = path.join(root, "openclaw.json");
    fs.writeFileSync(
      configPath,
      JSON.stringify({ plugins: { entries: { deliberation: { enabled: true } } } }),
    );
    const env = {
      ...process.env,
      HOME: root,
      OPENCLAW_STATE_DIR: path.join(root, "state"),
      OPENCLAW_CONFIG_PATH: configPath,
      OPENCLAW_BUNDLED_PLUGINS_DIR: path.join(packageRoot, "dist", "extensions"),
      OPENCLAW_TEST_CONSOLE: "1",
    };
    const inspect = spawnSync(
      process.execPath,
      [path.join(packageRoot, "openclaw.mjs"), "plugins", "inspect", "deliberation"],
      { encoding: "utf8", env, timeout: 60_000 },
    );
    expect(inspect.status).not.toBe(0);
    expect(inspect.stdout + inspect.stderr).toContain("Plugin not found: deliberation");
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}, 300_000);
