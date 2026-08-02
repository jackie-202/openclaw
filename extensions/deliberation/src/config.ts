import { buildSecretInputSchema, type SecretInput } from "openclaw/plugin-sdk/secret-input";
import { z } from "zod";

const routeSchema = z
  .object({
    channel: z.literal("discord"),
    accountId: z.string().trim().min(1),
    target: z.string().trim().min(1),
  })
  .strict();

const secretInputSchema = buildSecretInputSchema().refine(
  (value) => typeof value !== "string" || value.trim().length > 0,
  "KM credential must not be empty",
);

const configSchema = z
  .object({
    enabled: z.boolean(),
    failClosed: z.literal(true),
    sources: z.array(routeSchema).min(1),
    processingSource: routeSchema,
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
  })
  .strict();

export type DeliberationRoute = z.infer<typeof routeSchema>;
export type DeliberationConfig = Omit<z.infer<typeof configSchema>, "km"> & {
  km: Omit<z.infer<typeof configSchema>["km"], "credential"> & { credential: SecretInput };
  sourceKeys: ReadonlySet<string>;
  restrictedSessionKeySet: ReadonlySet<string>;
};

export function routeKey(route: DeliberationRoute): string {
  return `${route.channel}\u0000${route.accountId}\u0000${route.target}`;
}

export function parseDeliberationConfig(value: unknown): DeliberationConfig {
  const parsed = configSchema.parse(value);
  const sourceKeys = new Set(parsed.sources.map(routeKey));
  if (sourceKeys.size !== parsed.sources.length) {
    throw new Error("deliberation sources must not contain duplicate routes");
  }
  if (sourceKeys.has(routeKey(parsed.processingSource))) {
    throw new Error("deliberation processingSource must not overlap sources");
  }
  const restrictedSessionKeySet = new Set(parsed.restrictedSessionKeys);
  if (restrictedSessionKeySet.size !== parsed.restrictedSessionKeys.length) {
    throw new Error("deliberation restrictedSessionKeys must not contain duplicates");
  }
  return { ...parsed, sourceKeys, restrictedSessionKeySet };
}
