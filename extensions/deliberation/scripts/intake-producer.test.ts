import { createServer } from "node:http";
import { describe, expect, it } from "vitest";
import { runIntakeProducer } from "./intake-producer.js";

describe("deliberation intake producer", () => {
  it("validates input and reports duplicate replay without exposing content or credentials", async () => {
    const seen = new Set<string>();
    const server = createServer((request, response) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => (body += chunk));
      request.on("end", () => {
        const event = JSON.parse(body) as { providerEventId: string };
        const duplicate = seen.has(event.providerEventId);
        seen.add(event.providerEventId);
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
        event: {
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
      expect(seen).toEqual(new Set([input.event.messageId]));
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }),
      );
    }
  });

  it("rejects malformed producer input before making a request", async () => {
    await expect(
      runIntakeProducer(
        { endpoint: "https://km.invalid", event: {} },
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
          event: {
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
      await new Promise<void>((resolve, reject) =>
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }),
      );
    }
  });
});
