import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";

const valid = {
  enabled: true,
  failClosed: true,
  sources: [{ channel: "discord", accountId: "acct", target: "source" }],
  processingSource: { channel: "discord", accountId: "acct", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
};

const endpointCases = [
  ["https://km.example.com/api", true],
  ["http://127.0.0.1:8765/deliberation", true],
  ["http://[::1]:8765/deliberation", true],
  ["http://127.0.0.1", true],
  ["http://[::1]", true],
  ["http://localhost:8765", false],
  ["http://192.168.1.10:8765", false],
  ["http://evil.example.com", false],
  ["http://127.1:8765", false],
  ["https://user@km.invalid", false],
  ["https://@km.invalid", false],
  ["https://km.invalid?mode=test", false],
  ["https://km.invalid?", false],
  ["https://km.invalid/#fragment", false],
  ["https://km.invalid/#", false],
] as const;

describe("parseDeliberationConfig", () => {
  it("normalizes the exact route and restricted-session sets", () => {
    const parsed = parseDeliberationConfig(valid);
    expect(parsed.sourceKeys.size).toBe(1);
    expect(parsed.restrictedSessionKeySet.has("agent:reviewer")).toBe(true);
  });

  it("accepts a credential materialized by the secrets runtime", () => {
    const parsed = parseDeliberationConfig({
      ...valid,
      km: { ...valid.km, credential: "runtime-secret" },
    });

    expect(parsed.km.credential).toBe("runtime-secret");
  });

  it.each([
    [{ ...valid, unknown: true }, "unknown keys"],
    [{ ...valid, failClosed: false }, "non-fail-closed mode"],
    [{ ...valid, sources: [...valid.sources, ...valid.sources] }, "duplicate routes"],
    [{ ...valid, processingSource: valid.sources[0] }, "processing overlap"],
    [
      { ...valid, sources: [{ channel: "discord", accountId: "acct", target: "channel:bad" }] },
      "malformed source identity component",
    ],
    [{ ...valid, km: { ...valid.km, endpoint: "http://km.invalid" } }, "non-loopback HTTP KM"],
    [{ ...valid, km: { ...valid.km, credential: "" } }, "empty credential"],
    [{ ...valid, km: { ...valid.km, pollIntervalMs: 1000 } }, "retired polling config"],
  ])("rejects %s (%s)", (input, _description) => {
    expect(() => parseDeliberationConfig(input)).toThrow();
  });

  it.each(endpointCases)("validates KM endpoint %s as %s", (endpoint, accepted) => {
    const parse = () => parseDeliberationConfig({ ...valid, km: { ...valid.km, endpoint } });
    if (accepted) {
      expect(parse).not.toThrow();
    } else {
      expect(parse).toThrow();
    }
  });

  it("keeps the manifest endpoint pattern aligned with runtime validation", async () => {
    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as {
      configSchema: { properties: { km: { properties: { endpoint: { pattern: string } } } } };
    };
    const pattern = new RegExp(manifest.configSchema.properties.km.properties.endpoint.pattern);

    for (const [endpoint, accepted] of endpointCases) {
      expect(pattern.test(endpoint), endpoint).toBe(accepted);
      const parse = () => parseDeliberationConfig({ ...valid, km: { ...valid.km, endpoint } });
      if (accepted) {
        expect(parse).not.toThrow();
      } else {
        expect(parse).toThrow();
      }
    }
  });

  it("keeps the manifest credential schema aligned with secrets materialization", async () => {
    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as {
      configSchema: {
        properties: { km: { properties: { credential: { type: string[] } } } };
      };
    };

    expect(manifest.configSchema.properties.km.properties.credential.type).toEqual([
      "string",
      "object",
    ]);
  });
});
