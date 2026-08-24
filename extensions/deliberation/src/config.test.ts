import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";

const common = {
  enabled: true,
  failClosed: true,
  processingSource: { channel: "discord", accountId: "acct", target: "processing" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
} as const;

const valid = {
  ...common,
  pipelines: [
    {
      id: "discord-source",
      source: { channel: "discord", accountId: "acct", target: "source" },
    },
  ],
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
  it("normalizes canonical pipelines as the sole runtime authority", () => {
    const parsed = parseDeliberationConfig({
      ...common,
      pipelines: [
        {
          id: "slack-aplikace",
          source: { channel: "slack", accountId: "default", target: "C123" },
          target: { channel: "discord", accountId: "default", target: "delivery" },
        },
      ],
    });

    expect(parsed.pipelines).toEqual([
      {
        id: "slack-aplikace",
        source: { channel: "slack", accountId: "default", target: "C123" },
        target: { channel: "discord", accountId: "default", target: "delivery" },
      },
    ]);
    expect(parsed).not.toHaveProperty("sources");
    expect(parsed).not.toHaveProperty("deliveryTarget");
  });

  it("rejects legacy config before runtime startup", () => {
    expect(() =>
      parseDeliberationConfig({
        ...common,
        sources: [{ channel: "discord", accountId: "acct", target: "source" }],
      }),
    ).toThrow();
    expect(() =>
      parseDeliberationConfig({
        ...valid,
        deliveryTarget: { provider: "discord", accountId: "acct", channelId: "delivery" },
      }),
    ).toThrow();
  });

  it("keeps source-default targets omitted and accepts explicit provider roots", () => {
    expect(parseDeliberationConfig(valid).pipelines[0]?.target).toBeUndefined();
    for (const channel of ["discord", "slack"] as const) {
      const target = { channel, accountId: "delivery", target: "channel" };
      const parsed = parseDeliberationConfig({
        ...valid,
        pipelines: [{ ...valid.pipelines[0], target }],
      });
      expect(parsed.pipelines[0]?.target).toEqual(target);
    }
  });

  it("accepts a credential materialized by the secrets runtime", () => {
    const parsed = parseDeliberationConfig({
      ...valid,
      km: { ...valid.km, credential: "runtime-secret" },
    });

    expect(parsed.km.credential).toBe("runtime-secret");
  });

  it.each([
    [
      { ...valid, pipelines: [...valid.pipelines, { ...valid.pipelines[0] }] },
      "duplicate ids and sources",
      "must have unique ids",
    ],
    [
      {
        ...valid,
        pipelines: [...valid.pipelines, { id: "other-id", source: valid.pipelines[0].source }],
      },
      "duplicate canonical sources",
      "must have unique canonical sources",
    ],
    [
      { ...valid, processingSource: valid.pipelines[0].source },
      "processing overlap",
      "must not overlap pipeline sources",
    ],
    [
      { ...valid, restrictedSessionKeys: ["agent:reviewer", "agent:reviewer"] },
      "duplicate restricted sessions",
      "must not contain duplicates",
    ],
  ])("rejects %s deterministically", (input, _description, message) => {
    expect(() => parseDeliberationConfig(input)).toThrow(message);
  });

  it.each([
    [{ ...valid, unknown: true }, "unknown config key"],
    [{ ...valid, failClosed: false }, "non-fail-closed mode"],
    [{ ...valid, pipelines: [{ ...valid.pipelines[0], id: "bad id" }] }, "malformed id"],
    [{ ...valid, pipelines: [{ ...valid.pipelines[0], id: " padded" }] }, "padded id"],
    [
      {
        ...valid,
        pipelines: [
          {
            ...valid.pipelines[0],
            source: { channel: "discord", accountId: "acct", target: "channel:bad" },
          },
        ],
      },
      "malformed source identity",
    ],
    [
      {
        ...valid,
        pipelines: [
          {
            ...valid.pipelines[0],
            target: { channel: "discord", accountId: "acct", target: "channel:bad" },
          },
        ],
      },
      "malformed target identity",
    ],
    [
      {
        ...valid,
        pipelines: [
          {
            ...valid.pipelines[0],
            target: {
              channel: "discord",
              accountId: "acct",
              target: "delivery",
              inheritThread: true,
            },
          },
        ],
      },
      "unknown thread inheritance",
    ],
    [
      {
        ...valid,
        pipelines: [
          {
            ...valid.pipelines[0],
            target: {
              channel: "slack",
              accountId: "acct",
              target: "C123",
              threadId: "child-event-id",
            },
          },
        ],
      },
      "invalid Slack thread",
    ],
    [
      {
        ...valid,
        pipelines: [
          {
            ...valid.pipelines[0],
            target: {
              channel: "discord",
              accountId: "acct",
              target: "delivery",
              threadId: "t".repeat(97),
            },
          },
        ],
      },
      "oversized Discord thread",
    ],
    [{ ...valid, km: { ...valid.km, endpoint: "http://km.invalid" } }, "non-loopback HTTP KM"],
    [{ ...valid, km: { ...valid.km, credential: "" } }, "empty credential"],
    [{ ...valid, km: { ...valid.km, pollIntervalMs: 1000 } }, "retired polling config"],
  ])("rejects malformed config: %s (%s)", (input, _description) => {
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

  it("keeps the canonical manifest aligned with runtime config", async () => {
    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as {
      configSchema: {
        $ref: string;
        $defs: Record<
          string,
          {
            required?: string[];
            additionalProperties?: boolean;
            properties?: Record<string, Record<string, unknown>>;
            oneOf?: Array<{ $ref: string }>;
          }
        >;
      };
    };
    const { configSchema } = manifest;

    expect(configSchema.$ref).toBe("#/$defs/canonicalConfig");
    expect(configSchema.$defs.canonicalConfig).toMatchObject({
      additionalProperties: false,
      required: [
        "enabled",
        "failClosed",
        "pipelines",
        "processingSource",
        "km",
        "restrictedSessionKeys",
      ],
    });
    expect(configSchema.$defs.canonicalConfig?.properties).not.toHaveProperty("sources");
    expect(configSchema.$defs.canonicalConfig?.properties).not.toHaveProperty("deliveryTarget");
    expect(configSchema.$defs).not.toHaveProperty("legacyConfig");
    expect(configSchema.$defs).not.toHaveProperty("legacyDeliveryTarget");
    expect(configSchema.$defs.pipelineTarget?.oneOf).toEqual([
      { $ref: "#/$defs/discordPipelineTarget" },
      { $ref: "#/$defs/slackPipelineTarget" },
    ]);
    expect(configSchema.$defs.discordPipelineTarget?.required).not.toContain("threadId");
    expect(configSchema.$defs.slackPipelineTarget?.required).not.toContain("threadId");
  });

  it("keeps manifest KM and credential constraints aligned with runtime validation", async () => {
    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as {
      configSchema: {
        $defs: {
          km: { properties: { endpoint: { pattern: string }; credential: { type: string[] } } };
        };
      };
    };
    const km = manifest.configSchema.$defs.km;
    const pattern = new RegExp(km.properties.endpoint.pattern);

    expect(km.properties.credential.type).toEqual(["string", "object"]);
    for (const [endpoint, accepted] of endpointCases) {
      expect(pattern.test(endpoint), endpoint).toBe(accepted);
    }
  });
});
