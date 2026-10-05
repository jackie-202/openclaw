// The source tree can retain retired plugin code after the distributable stops bundling it.
import fs from "node:fs";
import path from "node:path";
import { resolveOpenClawPackageRootSync } from "../infra/openclaw-root.js";

// Built discovery runs from flat dist chunks; a fixed ../.. path escapes the package.
const packageRoot = resolveOpenClawPackageRootSync({ moduleUrl: import.meta.url });
const isSourceCheckout =
  packageRoot !== null && fs.existsSync(path.join(packageRoot, "pnpm-workspace.yaml"));
const bundledRoots = new Set(
  packageRoot
    ? ["extensions", "dist/extensions", "dist-runtime/extensions"].map((dir) =>
        path.resolve(packageRoot, dir),
      )
    : [],
);

/** Excludes retired source-checkout plugins only from the fork's own bundled roots. */
export function isExcludedSourceCheckoutBundledPlugin(scanDir: string, dirName: string): boolean {
  if (!isSourceCheckout || dirName !== "deliberation") {
    return false;
  }
  // CLI paths can retain a symlinked checkout root while import.meta.url uses its real path.
  return bundledRoots.has(fs.realpathSync.native(scanDir));
}
