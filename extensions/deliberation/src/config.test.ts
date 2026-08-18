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

  it("accepts an optional canonical final delivery target", () => {
    const deliveryTarget = {
      provider: "discord",
      accountId: "delivery",
      channelId: "channel",
      threadId: "thread",
    };

    expect(parseDeliberationConfig(valid).deliveryTarget).toBeUndefined();
    expect(parseDeliberationConfig({ ...valid, deliveryTarget }).deliveryTarget).toEqual(
      deliveryTarget,
    );
  });

  it("accepts any number of canonical Slack sources while keeping processing Discord-only", () => {
    const parsed = parseDeliberationConfig({
      ...valid,
      sources: [
        ...valid.sources,
        { channel: "slack", accountId: "workspace-a", target: "C123" },
        { channel: "slack", accountId: "workspace-b", target: "C123" },
      ],
    });

    expect(parsed.sourceKeys).toEqual(
      new Set(["discord\0acct\0source", "slack\0workspace-a\0C123", "slack\0workspace-b\0C123"]),
    );
    expect(() =>
      parseDeliberationConfig({
        ...valid,
        processingSource: { channel: "slack", accountId: "workspace-a", target: "C123" },
      }),
    ).toThrow();
    const slackTarget = {
      provider: "slack",
      accountId: "workspace-a",
      channelId: "C123",
      threadId: "1712345678.123456",
    };
    expect(
      parseDeliberationConfig({ ...valid, deliveryTarget: slackTarget }).deliveryTarget,
    ).toEqual(slackTarget);
    expect(() =>
      parseDeliberationConfig({
        ...valid,
        deliveryTarget: { ...slackTarget, threadId: "child-event-id" },
      }),
    ).toThrow();
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
    [
      {
        ...valid,
        deliveryTarget: { provider: "discord", accountId: "acct", channelId: "channel:bad" },
      },
      "malformed delivery identity component",
    ],
    [
      {
        ...valid,
        deliveryTarget: {
          provider: "discord",
          accountId: "acct",
          channelId: "delivery",
          threadId: "t".repeat(97),
        },
      },
      "oversized delivery thread identity",
    ],
    [
      {
        ...valid,
        deliveryTarget: {
          provider: "discord",
          accountId: "acct",
          channelId: "delivery",
          unknown: true,
        },
      },
      "unknown delivery route property",
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

  it("keeps the optional manifest delivery route aligned with runtime validation", async () => {
    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as {
      configSchema: {
        required: string[];
        properties: {
          sources: { items: { $ref: string } };
          processingSource: { $ref: string };
          deliveryTarget: { $ref: string };
        };
        $defs: {
          deliveryTarget: { oneOf: Array<{ $ref: string }> };
          discordDeliveryTarget: {
            required: string[];
            additionalProperties: boolean;
            properties: Record<string, Record<string, unknown>>;
          };
          slackDeliveryTarget: {
            required: string[];
            additionalProperties: boolean;
            properties: Record<string, Record<string, unknown>>;
          };
        };
      };
    };

    expect(manifest.configSchema.required).not.toContain("deliveryTarget");
    expect(manifest.configSchema.properties.sources.items).toEqual({
      $ref: "#/$defs/sourceRoute",
    });
    expect(manifest.configSchema.properties.processingSource).toEqual({
      $ref: "#/$defs/discordRoute",
    });
    expect(manifest.configSchema.properties.deliveryTarget).toEqual({
      $ref: "#/$defs/deliveryTarget",
    });
    expect(manifest.configSchema.$defs.deliveryTarget.oneOf).toEqual([
      { $ref: "#/$defs/discordDeliveryTarget" },
      { $ref: "#/$defs/slackDeliveryTarget" },
    ]);
    expect(manifest.configSchema.$defs.discordDeliveryTarget).toMatchObject({
      required: ["provider", "accountId", "channelId"],
      additionalProperties: false,
      properties: {
        provider: { const: "discord" },
        accountId: { minLength: 1, maxLength: 96 },
        channelId: { minLength: 1, maxLength: 96 },
        threadId: { minLength: 1, maxLength: 96 },
      },
    });
    expect(manifest.configSchema.$defs.slackDeliveryTarget).toMatchObject({
      required: ["provider", "accountId", "channelId", "threadId"],
      additionalProperties: false,
      properties: {
        provider: { const: "slack" },
        accountId: { minLength: 1, maxLength: 96 },
        channelId: { minLength: 1, maxLength: 96 },
        threadId: { minLength: 3, maxLength: 96, pattern: "^\\d+\\.\\d+$" },
      },
    });
  });
});
