import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("durable send ownership", () => {
  it("does not activate a durable sender without destination authority", async () => {
    const src = dirname(fileURLToPath(import.meta.url));
    const files = ["config.ts", "route-match.ts", "km-client.ts", "intake.ts", "guards.ts"];
    const owners: string[] = [];
    for (const file of files) {
      if ((await readFile(join(src, file), "utf8")).includes("sendDurableMessageBatch")) {
        owners.push(file);
      }
    }
    expect(owners).toEqual([]);
  });
});
