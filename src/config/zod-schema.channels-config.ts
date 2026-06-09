// Defines Zod schema fragments for channel configuration.
import { z } from "zod";
import type { ChannelsConfig } from "./types.channels.js";
import { ChannelHeartbeatVisibilitySchema } from "./zod-schema.channels.js";
import { ContextVisibilityModeSchema, GroupPolicySchema } from "./zod-schema.core.js";

const ChannelModelByChannelSchema = z
  .record(z.string(), z.record(z.string(), z.string()))
  .optional();

const ChannelRuntimeProfileSchema = z
  .object({
    model: z.string().trim().min(1).optional(),
    thinkingLevel: z
      .enum(["off", "minimal", "low", "medium", "high", "xhigh", "adaptive", "max"])
      .optional(),
    reasoningLevel: z.enum(["off", "on", "stream"]).optional(),
    textVerbosity: z.enum(["low", "medium", "high"]).optional(),
  })
  .strict();

const ChannelRuntimeByChannelSchema = z
  .record(z.string(), z.record(z.string(), ChannelRuntimeProfileSchema))
  .optional();

export const ChannelBotLoopProtectionSchema = z
  .object({
    enabled: z.boolean().optional(),
    maxEventsPerWindow: z.number().int().positive().optional(),
    windowSeconds: z.number().int().positive().optional(),
    cooldownSeconds: z.number().int().positive().optional(),
  })
  .strict();

function addLegacyChannelAcpBindingIssues(
  value: unknown,
  ctx: z.RefinementCtx,
  path: Array<string | number> = [],
) {
  if (!value || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => addLegacyChannelAcpBindingIssues(entry, ctx, [...path, index]));
    return;
  }

  const record = value as Record<string, unknown>;
  const bindings = record.bindings;
  if (bindings && typeof bindings === "object" && !Array.isArray(bindings)) {
    const acp = (bindings as Record<string, unknown>).acp;
    if (acp && typeof acp === "object") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...path, "bindings", "acp"],
        message:
          "Legacy channel-local ACP bindings were removed; use top-level bindings[] entries.",
      });
    }
  }

  for (const [key, entry] of Object.entries(record)) {
    addLegacyChannelAcpBindingIssues(entry, ctx, [...path, key]);
  }
}

export const ChannelsSchema: z.ZodType<ChannelsConfig | undefined> = z
  .object({
    defaults: z
      .object({
        groupPolicy: GroupPolicySchema.optional(),
        contextVisibility: ContextVisibilityModeSchema.optional(),
        heartbeat: ChannelHeartbeatVisibilitySchema,
        botLoopProtection: ChannelBotLoopProtectionSchema.optional(),
      })
      .strict()
      .optional(),
    modelByChannel: ChannelModelByChannelSchema,
    runtimeByChannel: ChannelRuntimeByChannelSchema,
  })
  .passthrough() // Allow extension channel configs (nostr, matrix, zalo, etc.)
  .superRefine((value, ctx) => {
    addLegacyChannelAcpBindingIssues(value, ctx);
  })
  .optional() as z.ZodType<ChannelsConfig | undefined>;
