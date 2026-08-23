import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import { z } from "zod";
import { parseDeliberationConfig } from "./config.js";
import { encodeSourceIdentity } from "./source-identity.js";

export const DELIBERATION_LEGACY_CONFIG_CUTOFF = "v2026.8.1-beta.2";

type LegacyConfigRule = {
  path: string[];
  message: string;
  match: (value: unknown) => boolean;
};

const identityComponentSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/);
const sourceSchema = z
  .object({
    channel: z.enum(["discord", "slack"]),
    accountId: identityComponentSchema,
    target: identityComponentSchema,
  })
  .strict();
const legacyTargetSchema = z
  .object({
    provider: z.enum(["discord", "slack"]),
    accountId: identityComponentSchema,
    channelId: identityComponentSchema,
    threadId: z.string().min(1).max(96).optional(),
  })
  .strict()
  .superRefine((target, context) => {
    if (target.provider === "slack" && !/^\d+\.\d+$/.test(target.threadId ?? "")) {
      context.addIssue({
        code: "custom",
        path: ["threadId"],
        message: "legacy Slack delivery target requires a thread timestamp",
      });
    }
  });

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export const legacyConfigRules: LegacyConfigRule[] = [
  {
    path: ["plugins", "entries", "deliberation", "config", "sources"],
    message: `Deliberation sources config predates ${DELIBERATION_LEGACY_CONFIG_CUTOFF}; later tagged builds accept canonical pipelines only. Run "openclaw doctor --fix".`,
    match: () => true,
  },
  {
    path: ["plugins", "entries", "deliberation", "config", "deliveryTarget"],
    message: `Deliberation deliveryTarget config predates ${DELIBERATION_LEGACY_CONFIG_CUTOFF}; later tagged builds accept per-pipeline targets only. Run "openclaw doctor --fix".`,
    match: () => true,
  },
];

function getPluginConfig(config: OpenClawConfig): Record<string, unknown> | null {
  const entry = asRecord(config.plugins?.entries?.deliberation);
  return asRecord(entry?.config);
}

export function normalizeCompatibilityConfig({ cfg }: { cfg: OpenClawConfig }): {
  config: OpenClawConfig;
  changes: string[];
} {
  const config = getPluginConfig(cfg);
  if (!config) {
    return { config: cfg, changes: [] };
  }
  const hasSources = Object.hasOwn(config, "sources");
  const hasTarget = Object.hasOwn(config, "deliveryTarget");
  if (!hasSources && !hasTarget) {
    return { config: cfg, changes: [] };
  }
  if (Object.hasOwn(config, "pipelines")) {
    return { config: cfg, changes: [] };
  }

  const sources = z.array(sourceSchema).min(1).safeParse(config.sources);
  const target =
    config.deliveryTarget === undefined
      ? { success: true as const, data: undefined }
      : legacyTargetSchema.safeParse(config.deliveryTarget);
  if (!sources.success || !target.success) {
    return { config: cfg, changes: [] };
  }

  const next = structuredClone(cfg);
  const nextConfig = getPluginConfig(next);
  if (!nextConfig) {
    return { config: cfg, changes: [] };
  }
  const canonicalTarget = target.data
    ? {
        channel: target.data.provider,
        accountId: target.data.accountId,
        target: target.data.channelId,
        ...(target.data.threadId === undefined ? {} : { threadId: target.data.threadId }),
      }
    : undefined;
  nextConfig.pipelines = sources.data.map((source) => {
    const id = encodeSourceIdentity({
      provider: source.channel,
      account: source.accountId,
      channel: source.target,
    });
    if (!id) {
      throw new Error("validated Deliberation source did not produce a canonical pipeline id");
    }
    return {
      id,
      source,
      ...(canonicalTarget ? { target: canonicalTarget } : {}),
    };
  });
  delete nextConfig.sources;
  delete nextConfig.deliveryTarget;
  try {
    parseDeliberationConfig(nextConfig);
  } catch {
    return { config: cfg, changes: [] };
  }

  return {
    config: next,
    changes: [
      `Migrated Deliberation legacy config predating ${DELIBERATION_LEGACY_CONFIG_CUTOFF}.`,
      `Generated ${sources.data.length} pipelines and removed legacy sources and deliveryTarget.`,
    ],
  };
}
