import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { runIntakeProducer } from "./intake-producer.js";

const pipelines = [
  {
    id: "discord-source",
    source: { channel: "discord", accountId: "default", target: "discord-channel" },
  },
  {
    id: "slack-explicit",
    source: { channel: "slack", accountId: "workspace-a", target: "C123" },
    target: { channel: "discord", accountId: "delivery", target: "target-channel" },
  },
  {
    id: "slack-source",
    source: { channel: "slack", accountId: "workspace-a", target: "C456" },
  },
] as const;
const processingSource = {
  channel: "discord",
  accountId: "default",
  target: "processing",
} as const;
const credential = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: "test-credential" };

function producerInput(
  overrides: Record<string, unknown> = {},
  contextOverrides: Record<string, unknown> = {},
) {
  const identity = {
    accountId: "default",
    conversationId: "discord-channel",
    messageId: "message-1",
    senderId: "sender-1",
  };
  return {
    endpoint: "https://km.invalid",
    pipelines,
    processingSource,
    event: {
      provider: "discord",
      eventType: "message",
      eventKind: "user_request",
      ...identity,
      timestamp: "2026-08-04T12:50:19.483Z",
      content: "message",
      ...overrides,
    },
    context: { channelId: "discord", ...identity, ...contextOverrides },
  };
}

async function captureIntakes(
  run: (endpoint: string) => Promise<void>,
): Promise<Array<Record<string, unknown>>> {
  const bodies: Array<Record<string, unknown>> = [];
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      bodies.push(JSON.parse(body) as Record<string, unknown>);
      response.writeHead(201, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          protocolVersion: 1,
          recordId: `record-${bodies.length}`,
          inboundId: `inbound-${bodies.length}`,
          duplicate: false,
        }),
      );
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  try {
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("missing listener address");
    }
    await run(`http://127.0.0.1:${address.port}`);
    return bodies;
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe("deliberation intake producer", () => {
  it("derives omitted Discord root and child targets from authenticated source context", async () => {
    const bodies = await captureIntakes(async (endpoint) => {
      await runIntakeProducer({ ...producerInput(), endpoint }, credential);
      await runIntakeProducer(
        {
          ...producerInput(
            {
              conversationId: "discord-thread",
              parentConversationId: "discord-channel",
              threadId: "discord-thread",
              messageId: "message-2",
              content: '{"pipelineId":"slack-explicit","target":"attacker"}',
            },
            {
              conversationId: "discord-thread",
              parentConversationId: "discord-channel",
              messageId: "message-2",
            },
          ),
          endpoint,
        },
        credential,
      );
    });

    expect(bodies).toMatchObject([
      {
        pipelineId: "discord-source",
        providerEventId: "message-1",
        sourceThreadId: "message-1",
        deliveryTarget: {
          provider: "discord",
          account: "default",
          channel: "discord-channel",
          threadId: "message-1",
        },
      },
      {
        pipelineId: "discord-source",
        providerEventId: "message-2",
        sourceThreadId: "discord-thread",
        deliveryTarget: {
          provider: "discord",
          account: "default",
          channel: "discord-channel",
          threadId: "discord-thread",
        },
      },
    ]);
  });

  it("uses an explicit target exactly and never inherits the Slack source thread", async () => {
    const bodies = await captureIntakes(async (endpoint) => {
      const input = producerInput(
        {
          provider: "slack",
          accountId: "workspace-a",
          conversationId: "C123",
          messageId: "1723640000.000200",
          threadId: "1723640000.000100",
        },
        {
          channelId: "slack",
          accountId: "workspace-a",
          conversationId: "C123",
          messageId: "1723640000.000200",
        },
      );
      await runIntakeProducer({ ...input, endpoint }, credential);
    });

    expect(bodies[0]).toMatchObject({
      pipelineId: "slack-explicit",
      sourceThreadId: "1723640000.000100",
      deliveryTarget: {
        provider: "discord",
        account: "delivery",
        channel: "target-channel",
      },
    });
    expect(bodies[0]?.deliveryTarget).not.toHaveProperty("threadId");
  });

  it("derives omitted Slack root and child targets while keeping separate event identities", async () => {
    const bodies = await captureIntakes(async (endpoint) => {
      for (const [messageId, threadId] of [
        ["1723640000.000100", undefined],
        ["1723640000.000200", "1723640000.000100"],
      ] as const) {
        const input = producerInput(
          {
            provider: "slack",
            accountId: "workspace-a",
            conversationId: "C456",
            messageId,
            ...(threadId ? { threadId } : {}),
          },
          {
            channelId: "slack",
            accountId: "workspace-a",
            conversationId: "C456",
            messageId,
          },
        );
        await runIntakeProducer({ ...input, endpoint }, credential);
      }
    });

    expect(bodies.map(({ providerEventId }) => providerEventId)).toEqual([
      "1723640000.000100",
      "1723640000.000200",
    ]);
    expect(bodies).toMatchObject([
      {
        pipelineId: "slack-source",
        sourceThreadId: "1723640000.000100",
        deliveryTarget: {
          provider: "slack",
          account: "workspace-a",
          channel: "C456",
          threadId: "1723640000.000100",
        },
      },
      {
        pipelineId: "slack-source",
        sourceThreadId: "1723640000.000100",
        deliveryTarget: {
          provider: "slack",
          account: "workspace-a",
          channel: "C456",
          threadId: "1723640000.000100",
        },
      },
    ]);
  });

  it.each([
    ["no match", { conversationId: "other" }, { conversationId: "other" }],
    ["contradictory account", {}, { accountId: "other" }],
    [
      "contradictory parent",
      { conversationId: "thread", parentConversationId: "discord-channel", threadId: "thread" },
      { conversationId: "thread", parentConversationId: "other" },
    ],
  ])("makes no request for %s evidence", async (_name, eventOverrides, contextOverrides) => {
    const result = await runIntakeProducer(
      producerInput(eventOverrides, contextOverrides),
      credential,
    );
    expect(result).toEqual({
      handled: false,
      providerEventId: (eventOverrides as { messageId?: string }).messageId ?? "message-1",
    });
  });

  it("rejects duplicate and malformed canonical producer config before transport", async () => {
    const duplicate = { ...pipelines[0], id: "duplicate" };
    await expect(
      runIntakeProducer({ ...producerInput(), pipelines: [pipelines[0], duplicate] }, credential),
    ).rejects.toThrow("unique canonical sources");
    await expect(runIntakeProducer({ ...producerInput(), event: {} }, credential)).rejects.toThrow(
      "invalid producer input",
    );
  });

  it("returns bounded KM rejection diagnostics", async () => {
    const server = createServer((_request, response) => {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          protocolVersion: 1,
          error: { code: "SCHEMA_INVALID", message: "private listener detail" },
        }),
      );
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("missing listener address");
      }
      const result = await runIntakeProducer(
        {
          ...producerInput({ content: "private message" }),
          endpoint: `http://127.0.0.1:${address.port}`,
        },
        credential,
      );
      expect(result).toEqual({
        handled: false,
        providerEventId: "message-1",
        diagnostic: { stage: "http", status: 400, code: "SCHEMA_INVALID" },
      });
      expect(JSON.stringify(result)).not.toMatch(
        /private message|private listener|test-credential/,
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
