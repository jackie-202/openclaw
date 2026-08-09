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
      transportHeaders: string[];
      endpoints: Array<{ method: string; path: string }>;
      schemas: { controls: { properties: Record<string, unknown> } };
    };
    expect(contract.applicationHeaders).toEqual([
      "Authorization",
      "X-Deliberation-Protocol-Version",
      "Accept",
      "Content-Type",
    ]);
    expect(contract.transportHeaders).toContain("Sec-Fetch-Mode");
    expect([...contract.applicationHeaders, ...contract.transportHeaders]).not.toContain(
      "X-Deliberation-Unknown",
    );
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

  it("pins the accepted KM owner files and identity vocabulary", async () => {
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      ownerFiles: Record<string, string>;
    };
    expect(provenance.ownerFiles).toEqual({
      "km-system/contracts/deliberation-v2/v1/contract.json":
        "c5ea7d1514b8834368d90bed51f0f9f99772b0b59ab885a4a67bccb78775cbd5",
      "km-system/contracts/deliberation-v2/v1/fixtures.json":
        "afe531da034209a8a329b6af24d40381cc06cc0a93406ca274c99564eb4d5d34",
    });
    const identity = JSON.parse(
      await readFile(join(contractDir, "source-identity-v1.json"), "utf8"),
    ) as { version: string; grammar: string; providerAgreement: string };
    expect(identity).toMatchObject({
      version: "v1",
      grammar: "v1:<provider>:<account>:<channel>",
      providerAgreement: "intake provider must exactly equal the provider component",
    });
  });
});
