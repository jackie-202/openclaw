import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "../contracts");

describe("accepted Deliberation contracts", () => {
  it("matches the accepted provenance hashes", async () => {
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      files: Record<string, string>;
    };
    for (const [file, expected] of Object.entries(provenance.files)) {
      const actual = createHash("sha256")
        .update(await readFile(join(contractDir, file)))
        .digest("hex");
      expect(actual, file).toBe(expected);
    }
  });

  it("mirrors the exact canonical header, endpoints, and controls", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      applicationHeaders: string[];
      endpoints: Array<{ method: string; path: string }>;
      schemas: { controls: { properties: Record<string, unknown> } };
    };
    expect(contract.applicationHeaders).toContain("X-Deliberation-Protocol-Version");
    expect(contract.endpoints.map(({ method, path }) => `${method} ${path}`)).toEqual([
      "GET /deliberation/v1/health",
      "GET /deliberation/v1/ready",
      "POST /deliberation/v1/intake",
      "POST /deliberation/v1/reservations",
      "POST /deliberation/v1/completions",
      "POST /deliberation/v1/reconciliations",
    ]);
    expect(Object.keys(contract.schemas.controls.properties)).toEqual([
      "source-intake",
      "claims",
      "review",
      "sender",
    ]);
  });
});
