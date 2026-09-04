import type { ChannelOutboundTextAttemptResult } from "openclaw/plugin-sdk/channel-send-result";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { isRecord } from "openclaw/plugin-sdk/string-coerce-runtime";
import { parseDeliberationConfig } from "./src/config.js";
import {
  createFinalDeliveryService,
  FinalDeliveryOutcomeUnknownError,
  FinalDeliveryRejectedError,
} from "./src/final-adapter.js";
import { createBeforeToolCallHandler, createMessageSendingHandler } from "./src/guards.js";
import { createHistoryReadHandler, HISTORY_READ_METHOD } from "./src/history-read.js";
import {
  createBeforeDispatchHandler,
  createInboundClaimHandler,
  createInboundEventPolicyHandler,
} from "./src/intake.js";
import { createKmClient } from "./src/km-client.js";
import { parseSourceIdentity } from "./src/source-identity.js";
import type { SourceHistoryIdentity } from "./src/thread-identity-store.js";

export { createFinalDeliveryAdapter, type FinalDeliveryProvider } from "./src/final-adapter.js";

const FAIL_CLOSED_HOOK_PRIORITY = 1000;
const INVALID_PLATFORM_MESSAGE_IDS = new Set(["unknown", "suppressed"]);
const SAFE_SLACK_HISTORY_FAILURES = new Set([
  "missing_scope",
  "not_in_channel",
  "channel_not_found",
]);
const SAFE_SLACK_HISTORY_INTERNAL_FAILURES = new Map<string, string>([
  ["Slack thread identity mapping is unavailable or conflicting", "identity_mapping_unavailable"],
  ["Slack account history runtime is unavailable", "runtime_context_unavailable"],
  ["Slack thread root is unavailable or conflicting", "root_not_found"],
]);
const SLACK_SCOPE_PATTERN = /^[a-z][a-z0-9._-]*:[a-z][a-z0-9._-]*$/i;

function readSlackScopes(value: unknown): string[] | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const scopes = [
    ...new Set(value.split(/[\s,]+/).filter((scope) => SLACK_SCOPE_PATTERN.test(scope))),
  ];
  return scopes.length > 0 ? scopes : undefined;
}

function classifySlackHistoryFailure(error: unknown) {
  const internalClassification =
    error instanceof Error ? SAFE_SLACK_HISTORY_INTERNAL_FAILURES.get(error.message) : undefined;
  if (internalClassification) {
    return { provider: "slack" as const, classification: internalClassification };
  }
  if (
    !isRecord(error) ||
    error.code !== "slack_webapi_platform_error" ||
    !isRecord(error.data) ||
    typeof error.data.error !== "string" ||
    !SAFE_SLACK_HISTORY_FAILURES.has(error.data.error)
  ) {
    return undefined;
  }
  const neededScopes = readSlackScopes(error.data.needed);
  const providedScopes = readSlackScopes(error.data.provided);
  return {
    provider: "slack" as const,
    classification: error.data.error,
    ...(neededScopes ? { neededScopes } : {}),
    ...(providedScopes ? { providedScopes } : {}),
  };
}

function requireSingleAttemptReceipt(result: ChannelOutboundTextAttemptResult): {
  receiptId: string;
  messageId: string;
} {
  if (result.outcome === "rejected") {
    throw new FinalDeliveryRejectedError(result.error, result.failureClass);
  }
  if (result.outcome === "unknown") {
    throw new FinalDeliveryOutcomeUnknownError(result.error);
  }

  const messageId = result.messageId;
  const receiptId = result.receipt.primaryPlatformMessageId;
  const platformIds = result.receipt.platformMessageIds;
  const parts = result.receipt.parts;
  const isSingleMessage =
    messageId.length > 0 &&
    messageId.length <= 256 &&
    messageId === messageId.trim() &&
    !INVALID_PLATFORM_MESSAGE_IDS.has(messageId) &&
    receiptId === messageId &&
    platformIds.length === 1 &&
    platformIds[0] === messageId &&
    parts.length === 1 &&
    parts[0]?.platformMessageId === messageId;
  if (!isSingleMessage) {
    throw new FinalDeliveryOutcomeUnknownError(
      "Final delivery returned malformed or multi-message receipt evidence",
    );
  }
  return { receiptId, messageId };
}

export default definePluginEntry({
  id: "deliberation",
  name: "Deliberation",
  description: "Fail-closed Discord and Slack intake backed by the Deliberation KM",
  register(api) {
    const config = parseDeliberationConfig(api.pluginConfig);
    const client = createKmClient({ config, openclawConfig: api.config });
    const historyStore = config.enabled
      ? api.runtime.state.openKeyedStore<SourceHistoryIdentity>({
          namespace: "source-history-identities-v1",
          maxEntries: 100_000,
        })
      : undefined;
    if (config.enabled) {
      let discordOutboundPromise:
        | ReturnType<typeof api.runtime.channel.outbound.loadAdapter>
        | undefined;
      let slackOutboundPromise:
        | ReturnType<typeof api.runtime.channel.outbound.loadAdapter>
        | undefined;
      api.registerService(
        createFinalDeliveryService({
          km: client,
          providers: {
            discord: {
              async send({ accountId, channelId, threadId, text, idempotencyKey }) {
                discordOutboundPromise ??= api.runtime.channel.outbound.loadAdapter("discord");
                const discordOutbound = await discordOutboundPromise;
                if (!discordOutbound?.sendTextAttempt) {
                  throw new FinalDeliveryRejectedError(
                    "Discord outbound adapter does not support single-attempt text delivery",
                    "rejection",
                  );
                }
                const result = await discordOutbound.sendTextAttempt({
                  cfg: api.config,
                  accountId,
                  to: `channel:${channelId}`,
                  text,
                  idempotencyKey,
                  ...(threadId ? { threadId } : {}),
                });
                return requireSingleAttemptReceipt(result);
              },
            },
            slack: {
              async send({ accountId, channelId, threadId, text, idempotencyKey }) {
                const slackAccounts = api.config.channels?.slack?.accounts;
                if (
                  accountId !== "default" &&
                  (!slackAccounts || !Object.hasOwn(slackAccounts, accountId))
                ) {
                  throw new FinalDeliveryRejectedError(
                    "Slack final delivery requires a configured explicit account",
                    "rejection",
                  );
                }
                slackOutboundPromise ??= api.runtime.channel.outbound.loadAdapter("slack");
                const slackOutbound = await slackOutboundPromise;
                if (!slackOutbound?.sendTextAttempt) {
                  throw new FinalDeliveryRejectedError(
                    "Slack outbound adapter does not support single-attempt text delivery",
                    "rejection",
                  );
                }
                const result = await slackOutbound.sendTextAttempt({
                  cfg: api.config,
                  accountId,
                  to: `channel:${channelId}`,
                  ...(threadId ? { threadId } : {}),
                  text,
                  idempotencyKey,
                });
                return requireSingleAttemptReceipt(result);
              },
            },
          },
        }),
      );
    }
    const hookOptions = { priority: FAIL_CLOSED_HOOK_PRIORITY };
    api.on("inbound_event_policy", createInboundEventPolicyHandler(config), hookOptions);
    api.on(
      "inbound_claim",
      createInboundClaimHandler(config, client, api.logger, historyStore),
      hookOptions,
    );
    api.on("before_dispatch", createBeforeDispatchHandler(config), hookOptions);
    api.on("before_tool_call", createBeforeToolCallHandler(config), hookOptions);
    api.on("message_sending", createMessageSendingHandler(config), hookOptions);

    for (const method of ["deliberation.status", "deliberation.health"]) {
      api.registerGatewayMethod(
        method,
        async ({ respond }) => {
          try {
            respond(true, await client.health());
          } catch (error) {
            respond(false, undefined, {
              code: "UNAVAILABLE",
              message: error instanceof Error ? error.message : "KM health request failed",
            });
          }
        },
        { scope: "operator.read" },
      );
    }

    const readHistory = createHistoryReadHandler({
      config,
      openclawConfig: api.config,
      historyStore,
      channelRuntime: api.runtime.channel,
    });
    api.registerGatewayMethod(
      HISTORY_READ_METHOD,
      async ({ params, respond }) => {
        try {
          respond(true, await readHistory(params));
        } catch (error) {
          const sourceIdentity =
            isRecord(params) && typeof params.sourceTarget === "string"
              ? parseSourceIdentity(params.sourceTarget)
              : undefined;
          const details =
            sourceIdentity?.provider === "slack" ? classifySlackHistoryFailure(error) : undefined;
          respond(false, undefined, {
            code: "SOURCE_HISTORY_UNAVAILABLE",
            message: details
              ? `source history read failed: ${details.classification}`
              : "source history read failed",
            ...(details ? { details } : {}),
          });
        }
      },
      { scope: "operator.read" },
    );

    api.registerCli(
      async ({ program }) => {
        const root = program.command("deliberation").description("Inspect the Deliberation KM");
        for (const command of ["status", "health"]) {
          root
            .command(command)
            .description("Print machine-readable KM health and controls")
            .action(async () => console.log(JSON.stringify(await client.health())));
        }
      },
      {
        descriptors: [
          {
            name: "deliberation",
            description: "Inspect the Deliberation KM",
            hasSubcommands: true,
          },
        ],
      },
    );
  },
});
