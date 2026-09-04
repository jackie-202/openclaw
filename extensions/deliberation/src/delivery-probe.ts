import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { parseDeliberationConfig } from "./config.js";
import { createFinalDeliveryAdapter, type FinalDeliveryProvider } from "./final-adapter.js";
import { createKmClient, KmRequestError, type KmClient } from "./km-client.js";

const PROBE_OWNER = "openclaw-deliberation-probe";
const probeCredentialSchema = z
  .object({
    source: z.literal("env"),
    provider: z.literal("default"),
    id: z.string().regex(/^[A-Z_][A-Z0-9_]{0,127}$/),
  })
  .strict();
const probeInputSchema = z
  .object({
    endpoint: z
      .string()
      .url()
      .refine((value) => {
        const url = new URL(value);
        const authority = value.slice(value.indexOf("//") + 2).split("/", 1)[0];
        return (
          url.protocol === "http:" &&
          (url.hostname === "127.0.0.1" || url.hostname === "[::1]") &&
          /^(?:127\.0\.0\.1|\[::1\]):[1-9][0-9]{0,4}$/.test(authority) &&
          Number(url.port) >= 32_768 &&
          Number(url.port) <= 65_535 &&
          url.pathname === "/" &&
          !url.username &&
          !url.password &&
          !url.search &&
          !url.hash
        );
      }),
    credential: probeCredentialSchema,
    requestTimeoutMs: z.number().int().min(100).max(10_000),
  })
  .strict();

export type DeliberationDeliveryProbeInput = z.infer<typeof probeInputSchema>;
export type DeliberationDeliveryProbeStage =
  | "input"
  | "ready"
  | "reserve"
  | "invoke"
  | "provider"
  | "complete";
export type DeliberationDeliveryProbeResult = {
  ok: boolean;
  stages: Array<{ stage: DeliberationDeliveryProbeStage; outcome: string }>;
  provider: {
    callCount: number;
    target: { provider: "discord" | "slack"; mode: "root" | "thread" } | null;
  };
  build: {
    packageVersion: string | null;
    commit: string | null;
    artifactClass: "source-api" | "built-api";
    moduleSha256: string;
  };
  error?: {
    stage: DeliberationDeliveryProbeStage;
    operation?: string;
    path?: string;
    status?: number;
    code?: string;
    cause?: string;
  };
};

type BuildIdentity = DeliberationDeliveryProbeResult["build"];
type ProviderSummary = DeliberationDeliveryProbeResult["provider"];

async function readJson(url: URL): Promise<Record<string, unknown> | undefined> {
  try {
    const value = JSON.parse(await readFile(url, "utf8")) as unknown;
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

async function readBuildIdentity(): Promise<BuildIdentity> {
  const moduleUrl = new URL(import.meta.url);
  const moduleBytes = await readFile(moduleUrl);
  const packageMetadata = await readJson(new URL("../package.json", moduleUrl));
  const buildInfoCandidates = [
    new URL("../../../dist/build-info.json", moduleUrl),
    new URL("../../../../dist/build-info.json", moduleUrl),
    new URL("../../../build-info.json", moduleUrl),
  ];
  let buildInfo: Record<string, unknown> | undefined;
  for (const candidate of buildInfoCandidates) {
    buildInfo = await readJson(candidate);
    if (buildInfo) {
      break;
    }
  }
  const modulePath = fileURLToPath(moduleUrl).replaceAll("\\", "/");
  return {
    packageVersion:
      typeof packageMetadata?.version === "string" ? packageMetadata.version.slice(0, 64) : null,
    commit: typeof buildInfo?.commit === "string" ? buildInfo.commit.slice(0, 64) : null,
    artifactClass:
      modulePath.includes("/dist-runtime/") || modulePath.includes("/dist/")
        ? "built-api"
        : "source-api",
    moduleSha256: createHash("sha256").update(moduleBytes).digest("hex"),
  };
}

function probeConfig(input: DeliberationDeliveryProbeInput) {
  return parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    pipelines: [
      {
        id: "probe-pipeline",
        source: { channel: "discord", accountId: "probe-source", target: "probe-source" },
      },
    ],
    processingSource: {
      channel: "discord",
      accountId: "probe-processing",
      target: "probe-processing",
    },
    km: input,
    restrictedSessionKeys: ["__deliberation_delivery_probe__"],
  });
}

function syntheticProvider(
  provider: "discord" | "slack",
  summary: ProviderSummary,
): FinalDeliveryProvider {
  return {
    async send({ threadId, idempotencyKey }) {
      if (summary.callCount !== 0) {
        throw new Error("synthetic probe provider permits one call");
      }
      summary.callCount = 1;
      summary.target = { provider, mode: threadId === undefined ? "root" : "thread" };
      const identity = createHash("sha256").update(idempotencyKey).digest("hex");
      return {
        receiptId: `synthetic-receipt:${identity}`,
        messageId: `synthetic-message:${identity}`,
      };
    },
  };
}

function instrumentKm(
  km: KmClient,
  stages: DeliberationDeliveryProbeResult["stages"],
  setActiveStage: (stage: DeliberationDeliveryProbeStage) => void,
) {
  return {
    async ready() {
      setActiveStage("ready");
      const result = await km.ready();
      stages.push({ stage: "ready", outcome: result.items.length === 0 ? "empty" : "ok" });
      return result;
    },
    async reserve(...args: Parameters<KmClient["reserve"]>) {
      setActiveStage("reserve");
      const result = await km.reserve(...args);
      stages.push({
        stage: "reserve",
        outcome: result.outcome === "reserved" ? "ok" : result.outcome,
      });
      return result;
    },
    async invoke(...args: Parameters<KmClient["invoke"]>) {
      setActiveStage("invoke");
      const result = await km.invoke(...args);
      stages.push({ stage: "invoke", outcome: "ok" });
      return result;
    },
    async completeDelivery(...args: Parameters<KmClient["completeDelivery"]>) {
      setActiveStage("complete");
      const result = await km.completeDelivery(...args);
      stages.push({ stage: "complete", outcome: "ok" });
      return result;
    },
  };
}

function safeError(
  error: unknown,
  stage: DeliberationDeliveryProbeStage,
): NonNullable<DeliberationDeliveryProbeResult["error"]> {
  const targetMismatch =
    error instanceof Error &&
    (error.message === "KM returned a reservation that differs from the request" ||
      error.message === "delivery reservation target differs from ready target");
  if (targetMismatch) {
    return { stage, cause: "target_mismatch" };
  }
  if (error instanceof KmRequestError) {
    return {
      stage,
      operation: error.operation,
      path: error.path,
      ...(error.status === undefined ? {} : { status: error.status }),
      code: error.code,
      ...(error.cause
        ? { cause: error.cause }
        : error.stage === "response-schema"
          ? { cause: "response_schema" }
          : {}),
    };
  }
  return { stage, cause: "unexpected" };
}

/**
 * Isolated deployment probe. This boundary is absent from plugin discovery and
 * can only compose the production KM/adapter path with its internal fake provider.
 */
export async function runDeliberationDeliveryProbe(
  rawInput: DeliberationDeliveryProbeInput,
): Promise<DeliberationDeliveryProbeResult> {
  const build = await readBuildIdentity();
  const provider: ProviderSummary = { callCount: 0, target: null };
  const parsed = probeInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      stages: [{ stage: "input", outcome: "refused" }],
      provider,
      build,
      error: { stage: "input", cause: "invalid_input" },
    };
  }

  const stages: DeliberationDeliveryProbeResult["stages"] = [{ stage: "input", outcome: "ok" }];
  let activeStage: DeliberationDeliveryProbeStage = "ready";
  const km = instrumentKm(
    createKmClient({ config: probeConfig(parsed.data), openclawConfig: {} }),
    stages,
    (stage) => {
      activeStage = stage;
    },
  );
  const providerStage = (providerName: "discord" | "slack") => {
    const providerImpl = syntheticProvider(providerName, provider);
    return {
      async send(...args: Parameters<FinalDeliveryProvider["send"]>) {
        activeStage = "provider";
        const result = await providerImpl.send(...args);
        stages.push({ stage: "provider", outcome: "ok" });
        return result;
      },
    };
  };

  try {
    await createFinalDeliveryAdapter({
      km,
      owner: PROBE_OWNER,
      providers: { discord: providerStage("discord"), slack: providerStage("slack") },
    }).runOnce();
    return { ok: true, stages, provider, build };
  } catch (error) {
    return { ok: false, stages, provider, build, error: safeError(error, activeStage) };
  }
}
