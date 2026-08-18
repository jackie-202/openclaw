import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { runIntakeProducer } from "./intake-producer.js";

const routes = {
  sources: [{ provider: "discord", accountId: "default", channelId: "1494265174389948538" }],
  processing: { provider: "discord", accountId: "default", channelId: "processing" },
} as const;

const eventIdentity = {
  provider: "discord",
  eventType: "message",
  eventKind: "user_request",
  accountId: "default",
} as const;

describe("deliberation intake producer", () => {
  it("keeps the configured final target out of source intake", async () => {
    let intake: Record<string, unknown> | undefined;
    const server = createServer((request, response) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        intake = JSON.parse(body) as Record<string, unknown>;
        response.writeHead(201, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            protocolVersion: 1,
            recordId: "record-1",
            inboundId: "inbound-1",
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
      await runIntakeProducer(
        {
          endpoint: `http://127.0.0.1:${address.port}`,
          routes: {
            ...routes,
            delivery: {
              provider: "discord",
              accountId: "delivery",
              channelId: "target-b",
              threadId: "thread-b",
            },
          },
          event: {
            ...eventIdentity,
            channelId: "1494265174389948538",
            messageId: "message-override",
            senderId: "sender-1",
            timestamp: "2026-08-04T12:50:19.483Z",
            content: "route this reviewed reply",
          },
        },
        { OPENCLAW_DELIBERATION_KM_CREDENTIAL: "0123456789abcdef" },
      );

      expect(intake).toMatchObject({
        sourceTarget: "v1:discord:default:1494265174389948538",
        sourceThreadId: "message-override",
      });
      expect(intake).not.toHaveProperty("source_thread_id");
      expect(intake).not.toHaveProperty("deliveryTarget");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("validates input and reports duplicate replay without exposing content or credentials", async () => {
    const seen = new Map<string, string>();
    const server = createServer((request, response) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        const event = JSON.parse(body) as { providerEventId: string; sourceTarget: string };
        const duplicate = seen.has(event.providerEventId);
        seen.set(event.providerEventId, event.sourceTarget);
        response.writeHead(duplicate ? 200 : 201, { "Content-Type": "application/json" });
        response.end(
          JSON.stringify({
            protocolVersion: 1,
            recordId: "record-1",
            inboundId: "inbound-1",
            duplicate,
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
      const input = {
        endpoint: `http://127.0.0.1:${address.port}`,
        routes,
        event: {
          ...eventIdentity,
          channelId: "1494265174389948538",
          messageId: "1534181693647355986",
          senderId: "sender-1",
          timestamp: "2026-08-04T12:50:19.483Z",
          content: "private message",
        },
      };
      const env = { OPENCLAW_DELIBERATION_KM_CREDENTIAL: "0123456789abcdef" };

      const first = await runIntakeProducer(input, env);
      const second = await runIntakeProducer(input, env);

      expect(first).toEqual({
        handled: true,
        providerEventId: input.event.messageId,
        duplicate: false,
      });
      expect(second).toEqual({
        handled: true,
        providerEventId: input.event.messageId,
        duplicate: true,
      });
      expect(JSON.stringify([first, second])).not.toMatch(/private message|0123456789abcdef/);
      expect(seen).toEqual(
        new Map([[input.event.messageId, "v1:discord:default:1494265174389948538"]]),
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });

  it("rejects malformed producer input before making a request", async () => {
    await expect(
      runIntakeProducer(
        { endpoint: "https://km.invalid", routes, event: {} },
        {
          OPENCLAW_DELIBERATION_KM_CREDENTIAL: "0123456789abcdef",
        },
      ),
    ).rejects.toThrow("invalid producer input");
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
          endpoint: `http://127.0.0.1:${address.port}`,
          routes: {
            sources: [{ provider: "discord", accountId: "default", channelId: "source" }],
            processing: routes.processing,
          },
          event: {
            ...eventIdentity,
            channelId: "source",
            messageId: "message-1",
            senderId: "sender-1",
            timestamp: "2026-08-04T12:50:19.483Z",
            content: "private message",
          },
        },
        { OPENCLAW_DELIBERATION_KM_CREDENTIAL: "0123456789abcdef" },
      );

      expect(result).toEqual({
        handled: false,
        providerEventId: "message-1",
        diagnostic: { stage: "http", status: 400, code: "SCHEMA_INVALID" },
      });
      expect(JSON.stringify(result)).not.toMatch(
        /private message|private listener|0123456789abcdef/,
      );
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  });

  it.each([
    ["processing", { ...eventIdentity, channelId: "processing" }],
    ["wrong account", { ...eventIdentity, accountId: "other", channelId: "source" }],
  ])("makes zero KM requests for a %s route", async (_name, identity) => {
    const result = await runIntakeProducer(
      {
        endpoint: "https://km.invalid",
        routes: {
          sources: [{ provider: "discord", accountId: "default", channelId: "source" }],
          processing: routes.processing,
        },
        event: {
          ...identity,
          messageId: "message-1",
          senderId: "sender-1",
          timestamp: "2026-08-04T12:50:19.483Z",
          content: "private message",
        },
      },
      { OPENCLAW_DELIBERATION_KM_CREDENTIAL: "0123456789abcdef" },
    );

    expect(result).toEqual({ handled: false, providerEventId: "message-1" });
  });
});
