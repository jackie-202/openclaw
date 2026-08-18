import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { parseDeliberationConfig } from "./src/config.js";
import {
  createFinalDeliveryService,
  FinalDeliveryOutcomeUnknownError,
} from "./src/final-adapter.js";
import { createBeforeToolCallHandler, createMessageSendingHandler } from "./src/guards.js";
import { createHistoryReadHandler, HISTORY_READ_METHOD } from "./src/history-read.js";
import { createBeforeDispatchHandler, createInboundClaimHandler } from "./src/intake.js";
import { createKmClient } from "./src/km-client.js";
import type { SlackThreadIdentity } from "./src/thread-identity-store.js";

export { createFinalDeliveryAdapter, type FinalDeliveryProvider } from "./src/final-adapter.js";

const FAIL_CLOSED_HOOK_PRIORITY = 1000;

export default definePluginEntry({
  id: "deliberation",
  name: "Deliberation",
  description: "Fail-closed Discord and Slack intake backed by the Deliberation KM",
  register(api) {
    const config = parseDeliberationConfig(api.pluginConfig);
    const client = createKmClient({ config, openclawConfig: api.config });
    const threadStore = config.sources.some((source) => source.channel === "slack")
      ? api.runtime.state.openKeyedStore<SlackThreadIdentity>({
          namespace: "slack-thread-identities-v1",
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
      const finalDeliveryService = createFinalDeliveryService({
        km: client,
        providers: {
          discord: {
            async send({ accountId, channelId, threadId, text }) {
              discordOutboundPromise ??= api.runtime.channel.outbound.loadAdapter("discord");
              const discordOutbound = await discordOutboundPromise;
              if (!discordOutbound?.sendText) {
                throw new Error("Discord outbound adapter does not support text delivery");
              }
              const textLimit = discordOutbound.textChunkLimit;
              const lineCount = text.split("\n").length;
              const chunks =
                typeof textLimit === "number" && discordOutbound.chunker
                  ? discordOutbound.chunker(text, textLimit, {
                      formatting: { maxLinesPerMessage: lineCount },
                    })
                  : [];
              if (chunks.length !== 1 || chunks[0] !== text) {
                throw new Error("Discord final delivery requires one platform message");
              }
              const result = await discordOutbound.sendText({
                cfg: api.config,
                accountId,
                to: `channel:${channelId}`,
                ...(threadId ? { threadId } : {}),
                text,
                formatting: {
                  chunkMode: "length",
                  maxLinesPerMessage: lineCount,
                  tableMode: "off",
                  textLimit,
                },
              });
              return {
                receiptId: result.receipt?.primaryPlatformMessageId ?? result.messageId,
                messageId: result.messageId,
              };
            },
          },
          slack: {
            async send({ accountId, channelId, threadId, text }) {
              const slackAccounts = api.config.channels?.slack?.accounts;
              if (
                accountId !== "default" &&
                (!slackAccounts || !Object.hasOwn(slackAccounts, accountId))
              ) {
                throw new Error("Slack final delivery requires a configured explicit account");
              }
              slackOutboundPromise ??= api.runtime.channel.outbound.loadAdapter("slack");
              const slackOutbound = await slackOutboundPromise;
              if (!slackOutbound?.sendText) {
                throw new Error("Slack outbound adapter does not support text delivery");
              }
              if (!threadId) {
                throw new Error("Slack final delivery requires an explicit thread");
              }
              const textLimit = slackOutbound.textChunkLimit;
              if (typeof textLimit !== "number" || text.length > textLimit) {
                throw new Error("Slack final delivery requires one platform message");
              }
              const result = await slackOutbound.sendText({
                cfg: api.config,
                accountId,
                to: `channel:${channelId}`,
                threadId,
                text,
              });
              const receiptId = result.receipt?.primaryPlatformMessageId;
              if (
                !receiptId ||
                result.messageId === "unknown" ||
                result.messageId === "suppressed"
              ) {
                throw new FinalDeliveryOutcomeUnknownError(
                  "Slack final delivery returned no platform message id",
                );
              }
              return {
                receiptId,
                messageId: result.messageId,
              };
            },
          },
        },
      });
      api.registerService(finalDeliveryService);
    }
    const hookOptions = { priority: FAIL_CLOSED_HOOK_PRIORITY };
    api.on(
      "inbound_claim",
      createInboundClaimHandler(config, client, api.logger, threadStore),
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
      threadStore,
      channelRuntime: api.runtime.channel,
    });
    api.registerGatewayMethod(
      HISTORY_READ_METHOD,
      async ({ params, respond }) => {
        try {
          respond(true, await readHistory(params));
        } catch {
          respond(false, undefined, {
            code: "SOURCE_HISTORY_UNAVAILABLE",
            message: "source history read failed",
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
