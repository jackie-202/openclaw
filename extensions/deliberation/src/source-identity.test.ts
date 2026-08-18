import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { encodeSourceIdentity, parseSourceIdentity } from "./source-identity.js";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "../contracts");

type IdentityFixtures = {
  positive: Array<{
    name: string;
    provider: string;
    account: string;
    channel: string;
    sourceTarget: string;
  }>;
  negative: Array<{ name: string; sourceTarget: string }>;
};

async function loadFixtures(): Promise<IdentityFixtures> {
  return JSON.parse(
    await readFile(join(contractDir, "source-identity-fixtures-v1.json"), "utf8"),
  ) as IdentityFixtures;
}

describe("Deliberation source identity", () => {
  it("keeps Slack provenance channel-scoped without a thread component", () => {
    const identity = { provider: "slack", account: "workspace-a", channel: "C123" };

    expect(encodeSourceIdentity(identity)).toBe("v1:slack:workspace-a:C123");
    expect(parseSourceIdentity("v1:slack:workspace-a:C123")).toEqual(identity);
    expect(parseSourceIdentity("v1:slack:workspace-a:C123:1723640000.000100")).toBeUndefined();
  });

  it("round-trips every accepted KM-owned fixture byte-for-byte", async () => {
    const fixtures = await loadFixtures();
    for (const fixture of fixtures.positive) {
      const identity = {
        provider: fixture.provider,
        account: fixture.account,
        channel: fixture.channel,
      };
      expect(encodeSourceIdentity(identity), fixture.name).toBe(fixture.sourceTarget);
      expect(parseSourceIdentity(fixture.sourceTarget), fixture.name).toEqual(identity);
    }
  });

  it("rejects every malformed, unsupported, and historical fixture", async () => {
    const fixtures = await loadFixtures();
    for (const fixture of fixtures.negative) {
      expect(parseSourceIdentity(fixture.sourceTarget), fixture.name).toBeUndefined();
    }
  });
});
