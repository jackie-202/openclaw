import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { parseDeliberationConfig } from "./src/config.js";
import { createBeforeToolCallHandler, createMessageSendingHandler } from "./src/guards.js";
import { createBeforeDispatchHandler, createInboundClaimHandler } from "./src/intake.js";
import { createKmClient } from "./src/km-client.js";

const FAIL_CLOSED_HOOK_PRIORITY = 1000;

export default definePluginEntry({
  id: "deliberation",
  name: "Deliberation",
  description: "Fail-closed Discord intake backed by the Deliberation KM",
  register(api) {
    const config = parseDeliberationConfig(api.pluginConfig);
    const client = createKmClient({ config, openclawConfig: api.config });
    const hookOptions = { priority: FAIL_CLOSED_HOOK_PRIORITY };
    api.on("inbound_claim", createInboundClaimHandler(config, client, api.logger), hookOptions);
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
