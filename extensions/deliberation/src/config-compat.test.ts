import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import {
  validateJsonSchemaValue,
  type JsonSchemaObject,
} from "openclaw/plugin-sdk/json-schema-runtime";
import { describe, expect, it } from "vitest";
import {
  DELIBERATION_LEGACY_CONFIG_CUTOFF,
  legacyConfigRules,
  normalizeCompatibilityConfig,
} from "../doctor-contract-api.js";
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

function pluginConfig(config: OpenClawConfig): Record<string, unknown> {
  return (
    (config.plugins?.entries?.deliberation as { config?: Record<string, unknown> } | undefined)
      ?.config ?? {}
  );
}

describe("deliberation doctor migration", () => {
  it("diagnoses the tagged cutoff and writes operational config as canonical pipelines", async () => {
    const legacy = {
      plugins: {
        entries: {
          deliberation: {
            enabled: true,
            config: {
              ...common,
              sources: [
                { channel: "discord", accountId: "acct", target: "source" },
                { channel: "slack", accountId: "workspace-a", target: "C123" },
              ],
              deliveryTarget: {
                provider: "discord",
                accountId: "delivery",
                channelId: "channel",
                threadId: "thread",
              },
            },
          },
        },
      },
    } as OpenClawConfig;

    expect(DELIBERATION_LEGACY_CONFIG_CUTOFF).toBe("v2026.8.1-beta.2");
    expect(legacyConfigRules.map((rule) => rule.message)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(DELIBERATION_LEGACY_CONFIG_CUTOFF),
        expect.stringContaining('Run "openclaw doctor --fix"'),
      ]),
    );

    const migrated = normalizeCompatibilityConfig({ cfg: legacy });
    const config = pluginConfig(migrated.config);
    expect(config).toMatchObject({
      ...common,
      pipelines: [
        {
          id: "v1:discord:acct:source",
          source: { channel: "discord", accountId: "acct", target: "source" },
          target: {
            channel: "discord",
            accountId: "delivery",
            target: "channel",
            threadId: "thread",
          },
        },
        {
          id: "v1:slack:workspace-a:C123",
          source: { channel: "slack", accountId: "workspace-a", target: "C123" },
          target: {
            channel: "discord",
            accountId: "delivery",
            target: "channel",
            threadId: "thread",
          },
        },
      ],
    });
    expect(config).not.toHaveProperty("sources");
    expect(config).not.toHaveProperty("deliveryTarget");
    expect(migrated.changes).toEqual([
      expect.stringContaining("v2026.8.1-beta.2"),
      expect.stringContaining("2 pipelines"),
    ]);
    expect(migrated.config.plugins?.entries?.deliberation?.enabled).toBe(true);
    expect(() => parseDeliberationConfig(config)).not.toThrow();
    expect(() => parseDeliberationConfig(pluginConfig(legacy))).toThrow();

    const extensionDir = join(dirname(fileURLToPath(import.meta.url)), "..");
    const manifest = JSON.parse(
      await readFile(join(extensionDir, "openclaw.plugin.json"), "utf8"),
    ) as { configSchema: JsonSchemaObject };
    expect(
      validateJsonSchemaValue({
        schema: manifest.configSchema,
        cacheKey: "deliberation-doctor-migrated-manifest-config",
        value: config,
      }),
    ).toMatchObject({ ok: true });
  });

  it("leaves canonical config unchanged and refuses mixed authority", () => {
    const canonical = {
      plugins: {
        entries: {
          deliberation: {
            config: {
              ...common,
              pipelines: [
                {
                  id: "discord-source",
                  source: { channel: "discord", accountId: "acct", target: "source" },
                },
              ],
            },
          },
        },
      },
    } as OpenClawConfig;
    expect(normalizeCompatibilityConfig({ cfg: canonical })).toEqual({
      config: canonical,
      changes: [],
    });

    const mixed = structuredClone(canonical);
    Object.assign(pluginConfig(mixed), {
      sources: [{ channel: "discord", accountId: "acct", target: "legacy" }],
    });
    const refused = normalizeCompatibilityConfig({ cfg: mixed });
    expect(refused.config).toBe(mixed);
    expect(refused.changes).toEqual([]);
    expect(pluginConfig(refused.config)).toHaveProperty("sources");
  });

  it("diagnoses malformed legacy input without partial writeback", () => {
    const malformed = {
      plugins: {
        entries: {
          deliberation: {
            config: {
              ...common,
              sources: [{ channel: "discord", accountId: "acct", target: "bad:target" }],
              deliveryTarget: {
                provider: "slack",
                accountId: "workspace-a",
                channelId: "C123",
              },
            },
          },
        },
      },
    } as OpenClawConfig;

    const refused = normalizeCompatibilityConfig({ cfg: malformed });
    expect(refused.config).toBe(malformed);
    expect(refused.changes).toEqual([]);
    expect(pluginConfig(refused.config)).not.toHaveProperty("pipelines");
  });

  it("does not write legacy input that violates canonical routing invariants", () => {
    for (const legacyConfig of [
      {
        ...common,
        sources: [
          { channel: "discord", accountId: "acct", target: "source" },
          { channel: "discord", accountId: "acct", target: "source" },
        ],
      },
      {
        ...common,
        sources: [common.processingSource],
      },
    ]) {
      const legacy = {
        plugins: { entries: { deliberation: { config: legacyConfig } } },
      } as OpenClawConfig;
      expect(normalizeCompatibilityConfig({ cfg: legacy })).toEqual({
        config: legacy,
        changes: [],
      });
      expect(pluginConfig(legacy)).not.toHaveProperty("pipelines");
    }
  });
});
