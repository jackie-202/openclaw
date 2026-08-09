import { pathToFileURL } from "node:url";
import { z } from "zod";
import { parseDeliberationConfig } from "../src/config.js";
import { createInboundClaimHandler } from "../src/intake.js";
import { createKmClient, KmRequestError, type KmClient } from "../src/km-client.js";

const CREDENTIAL_ENV = "OPENCLAW_DELIBERATION_KM_CREDENTIAL";

const configuredRouteSchema = z
  .object({
    provider: z.literal("discord"),
    accountId: z.string().min(1).max(96),
    channelId: z.string().min(1).max(96),
  })
  .strict();

const inputSchema = z
  .object({
    endpoint: z.url(),
    routes: z
      .object({
        sources: z.array(configuredRouteSchema).min(1),
        processing: configuredRouteSchema,
      })
      .strict(),
    event: z
      .object({
        provider: z.literal("discord"),
        eventType: z.literal("message"),
        eventKind: z.literal("user_request"),
        channelId: z.string().min(1).max(256),
        accountId: z.string().min(1).max(256),
        messageId: z.string().min(1).max(256),
        senderId: z.string().min(1).max(256),
        timestamp: z.iso.datetime({ offset: true }),
        content: z.string().min(1).max(65536),
      })
      .strict(),
  })
  .strict();

type ProducerDiagnostic = Pick<KmRequestError, "stage" | "status" | "code">;

export type IntakeProducerResult = {
  handled: boolean;
  providerEventId: string;
  duplicate?: boolean;
  diagnostic?: ProducerDiagnostic;
};

export async function runIntakeProducer(
  input: unknown,
  env: NodeJS.ProcessEnv = process.env,
): Promise<IntakeProducerResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("invalid producer input");
  }
  const { endpoint, routes, event } = parsed.data;
  const config = parseDeliberationConfig({
    enabled: true,
    failClosed: true,
    sources: routes.sources.map((route) => ({
      channel: route.provider,
      accountId: route.accountId,
      target: route.channelId,
    })),
    processingSource: {
      channel: routes.processing.provider,
      accountId: routes.processing.accountId,
      target: routes.processing.channelId,
    },
    km: {
      endpoint,
      credential: { source: "env", provider: "default", id: CREDENTIAL_ENV },
      requestTimeoutMs: 5000,
    },
    restrictedSessionKeys: ["__deliberation-probe-restricted__"],
  });
  const client = createKmClient({ config, openclawConfig: {} as never, env });
  let duplicate: boolean | undefined;
  let diagnostic: ProducerDiagnostic | undefined;
  const intakeClient: KmClient = {
    ...client,
    intake: async (...args) => {
      try {
        const result = await client.intake(...args);
        duplicate = result.duplicate;
        return result;
      } catch (error) {
        if (error instanceof KmRequestError) {
          diagnostic = { stage: error.stage, status: error.status, code: error.code };
        }
        throw error;
      }
    },
  };
  const handler = createInboundClaimHandler(config, intakeClient, {
    info() {},
    warn() {},
    error() {},
    debug() {},
  });
  const result = await handler(
    {
      channel: event.provider,
      provider: event.provider,
      eventType: event.eventType,
      eventKind: event.eventKind,
      accountId: event.accountId,
      conversationId: event.channelId,
      content: event.content,
      isGroup: true,
      senderId: event.senderId,
      timestamp: Date.parse(event.timestamp),
    },
    {
      channelId: event.provider,
      accountId: event.accountId,
      conversationId: event.channelId,
      messageId: event.messageId,
      senderId: event.senderId,
    },
  );
  return {
    handled: result.handled,
    providerEventId: event.messageId,
    ...(duplicate === undefined ? {} : { duplicate }),
    ...(diagnostic === undefined ? {} : { diagnostic }),
  };
}

async function main(): Promise<void> {
  const endpointIndex = process.argv.indexOf("--endpoint");
  const endpoint = endpointIndex === -1 ? undefined : process.argv[endpointIndex + 1];
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("invalid producer input");
  }
  const result = await runIntakeProducer({ ...input, endpoint });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.handled) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    process.stderr.write('{"handled":false,"diagnostic":{"stage":"input","code":"UNKNOWN"}}\n');
    process.exitCode = 1;
  });
}
