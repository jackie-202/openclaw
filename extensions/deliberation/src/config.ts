import { buildSecretInputSchema, type SecretInput } from "openclaw/plugin-sdk/secret-input";
import { z } from "zod";

const supportedSourceProviderSchema = z.enum(["discord", "slack"]);
const identityComponentSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$/);
const pipelineIdSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:~-]{0,255}$/);

const sourceRouteSchema = z
  .object({
    channel: supportedSourceProviderSchema,
    accountId: identityComponentSchema,
    target: identityComponentSchema,
  })
  .strict();

const discordRouteSchema = z
  .object({
    channel: z.literal("discord"),
    accountId: identityComponentSchema,
    target: identityComponentSchema,
  })
  .strict();

const discordTargetSchema = z
  .object({
    channel: z.literal("discord"),
    accountId: identityComponentSchema,
    target: identityComponentSchema,
    threadId: identityComponentSchema.optional(),
  })
  .strict();

const slackTargetSchema = z
  .object({
    channel: z.literal("slack"),
    accountId: identityComponentSchema,
    target: identityComponentSchema,
    threadId: z
      .string()
      .min(3)
      .max(96)
      .regex(/^\d+\.\d+$/)
      .optional(),
  })
  .strict();

const pipelineTargetSchema = z.discriminatedUnion("channel", [
  discordTargetSchema,
  slackTargetSchema,
]);

const pipelineSchema = z
  .object({
    id: pipelineIdSchema,
    source: sourceRouteSchema,
    target: pipelineTargetSchema.optional(),
  })
  .strict();

const secretInputSchema = buildSecretInputSchema().refine(
  (value) => typeof value !== "string" || value.trim().length > 0,
  "KM credential must not be empty",
);

const commonConfigFields = {
  enabled: z.boolean(),
  failClosed: z.literal(true),
  processingSource: discordRouteSchema,
  km: z
    .object({
      endpoint: z
        .string()
        .url()
        .refine((value) => {
          const url = new URL(value);
          const authority = value.slice(value.indexOf("//") + 2).split(/[/?#]/, 1)[0];
          const isLiteralLoopbackHttp =
            url.protocol === "http:" &&
            (url.hostname === "127.0.0.1" || url.hostname === "[::1]") &&
            /^(?:127\.0\.0\.1|\[::1\])(?::[0-9]+)?$/.test(authority);
          // URL normalizes empty credential/query/fragment components, so retain raw delimiter checks.
          return (
            (value.startsWith("https://") || isLiteralLoopbackHttp) &&
            !authority.includes("@") &&
            !value.includes("?") &&
            !value.includes("#") &&
            !url.username &&
            !url.password &&
            !url.search &&
            !url.hash
          );
        }, "KM endpoint must be credential-free HTTPS or literal-loopback HTTP without query or fragment"),
      credential: secretInputSchema,
      requestTimeoutMs: z.number().int().min(100).max(30_000),
    })
    .strict(),
  restrictedSessionKeys: z.array(z.string().trim().min(1)).min(1),
};

const canonicalConfigSchema = z
  .object({
    ...commonConfigFields,
    pipelines: z.array(pipelineSchema).min(1),
  })
  .strict();

export type DeliberationRoute = z.infer<typeof sourceRouteSchema>;
export type DeliberationDiscordRoute = z.infer<typeof discordRouteSchema>;
export type DeliberationPipelineTarget = z.infer<typeof pipelineTargetSchema>;
export type DeliberationPipeline = z.infer<typeof pipelineSchema>;
type ParsedCommonConfig = Pick<
  z.infer<typeof canonicalConfigSchema>,
  "enabled" | "failClosed" | "processingSource" | "km" | "restrictedSessionKeys"
>;

export type DeliberationConfig = Omit<ParsedCommonConfig, "km"> & {
  km: Omit<ParsedCommonConfig["km"], "credential"> & { credential: SecretInput };
  pipelines: readonly DeliberationPipeline[];
  pipelineBySourceKey: ReadonlyMap<string, DeliberationPipeline>;
  restrictedSessionKeySet: ReadonlySet<string>;
};

export function routeKey(route: DeliberationRoute): string {
  return `${route.channel}\u0000${route.accountId}\u0000${route.target}`;
}

export function parseDeliberationConfig(value: unknown): DeliberationConfig {
  const parsed = canonicalConfigSchema.parse(value);
  const pipelines = parsed.pipelines;

  const ids = new Set(pipelines.map((pipeline) => pipeline.id));
  if (ids.size !== pipelines.length) {
    throw new Error("deliberation pipelines must have unique ids");
  }
  const pipelineBySourceKey = new Map(
    pipelines.map((pipeline) => [routeKey(pipeline.source), pipeline] as const),
  );
  if (pipelineBySourceKey.size !== pipelines.length) {
    throw new Error("deliberation pipelines must have unique canonical sources");
  }
  if (pipelineBySourceKey.has(routeKey(parsed.processingSource))) {
    throw new Error("deliberation processingSource must not overlap pipeline sources");
  }
  const restrictedSessionKeySet = new Set(parsed.restrictedSessionKeys);
  if (restrictedSessionKeySet.size !== parsed.restrictedSessionKeys.length) {
    throw new Error("deliberation restrictedSessionKeys must not contain duplicates");
  }
  const { enabled, failClosed, processingSource, km, restrictedSessionKeys } = parsed;
  return {
    enabled,
    failClosed,
    pipelines,
    processingSource,
    km,
    restrictedSessionKeys,
    pipelineBySourceKey,
    restrictedSessionKeySet,
  };
}
