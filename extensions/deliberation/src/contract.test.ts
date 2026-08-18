import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "../contracts");

describe("accepted Deliberation contracts", () => {
  it("matches the accepted provenance hashes", async () => {
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      files: Record<string, string>;
    };
    for (const [file, expected] of Object.entries(provenance.files)) {
      const actual = createHash("sha256")
        .update(await readFile(join(contractDir, file)))
        .digest("hex");
      expect(actual, file).toBe(expected);
    }
  });

  it("mirrors the exact canonical header, endpoints, and controls", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      applicationHeaders: string[];
      transportHeaders: string[];
      endpoints: Array<{ method: string; path: string }>;
      schemas: { controls: { properties: Record<string, unknown> } };
    };
    expect(contract.applicationHeaders).toEqual([
      "Authorization",
      "X-Deliberation-Protocol-Version",
      "Accept",
      "Content-Type",
    ]);
    expect(contract.transportHeaders).toEqual([
      "Host",
      "Content-Length",
      "Connection",
      "User-Agent",
      "Accept-Encoding",
      "Accept-Language",
      "Sec-Fetch-Mode",
    ]);
    expect([...contract.applicationHeaders, ...contract.transportHeaders]).not.toContain(
      "X-Deliberation-Unknown",
    );
    expect(contract.endpoints.map(({ method, path }) => `${method} ${path}`)).toEqual([
      "GET /deliberation/v1/health",
      "GET /deliberation/v1/ready",
      "POST /deliberation/v1/intake",
      "POST /deliberation/v1/reservations",
      "POST /deliberation/v1/invocations",
      "POST /deliberation/v1/completions",
    ]);
    expect(Object.keys(contract.schemas.controls.properties)).toEqual([
      "source-intake",
      "claims",
      "review",
      "sender",
    ]);
  });

  it("mirrors the current KM endpoint and health contract", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      endpoints: Array<{ method: string; path: string }>;
      schemas: { healthResponse: { properties: Record<string, unknown> } };
    };

    expect(contract.endpoints.map(({ method, path }) => `${method} ${path}`)).toEqual([
      "GET /deliberation/v1/health",
      "GET /deliberation/v1/ready",
      "POST /deliberation/v1/intake",
      "POST /deliberation/v1/reservations",
      "POST /deliberation/v1/invocations",
      "POST /deliberation/v1/completions",
    ]);
    expect(Object.keys(contract.schemas.healthResponse.properties)).toEqual([
      "protocolVersion",
      "status",
      "listener",
      "controls",
      "runner",
      "runtime",
    ]);
  });

  it("accepts the current closed projection fields", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      schemas: {
        record: {
          properties: {
            drafting: { properties: { diagnostic: Record<string, unknown> } };
            processing: { properties: Record<string, unknown> };
            terminalReason: Record<string, unknown>;
          };
        };
      };
    };
    const fields = contract.schemas.record.properties;

    expect(fields.drafting.properties.diagnostic).toMatchObject({
      required: ["code", "message"],
      additionalProperties: false,
    });
    expect(fields.processing.properties.releaseReason).toMatchObject({
      enum: expect.arrayContaining(["result_finalized", "processing_session_timeout", null]),
    });
    expect(fields.processing.properties.lateResult).toMatchObject({
      required: ["event", "classification", "digest", "auditedAt"],
    });
    expect(fields.terminalReason).toMatchObject({ maxLength: 512 });
  });

  it("defines required source threads and generic structured targets across the lifecycle", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      schemas: {
        deliveryTarget: Record<string, unknown>;
        nullableDeliveryTarget: Record<string, unknown>;
        intakeBody: { properties: Record<string, unknown>; required: string[] };
        reservationBody: { properties: Record<string, unknown>; required: string[] };
        deliveryEnvelope: { properties: Record<string, unknown>; required: string[] };
        invocationBody: { properties: Record<string, unknown> };
        completionBody: { properties: Record<string, unknown> };
        deliveryAttempt: {
          properties: Record<string, unknown> & {
            providerEvidence: {
              properties: Record<string, Record<string, unknown>>;
            };
          };
        };
        record: { properties: Record<string, unknown> };
      };
    };
    const targetRef = { $ref: "#/schemas/deliveryTarget" };

    expect(contract.schemas.intakeBody.properties).not.toHaveProperty("deliveryTarget");
    expect(contract.schemas.intakeBody.required).toContain("sourceThreadId");
    expect(contract.schemas.intakeBody.properties.sourceThreadId).toEqual({
      type: "string",
      minLength: 1,
      maxLength: 96,
      pattern: "^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$",
    });
    expect(contract.schemas.intakeBody.properties).not.toHaveProperty("source_thread_id");
    expect(contract.schemas.deliveryTarget).toMatchObject({
      required: ["provider", "account", "channel"],
      additionalProperties: false,
      properties: {
        provider: {
          minLength: 1,
          maxLength: 96,
          pattern: "^[A-Za-z0-9][A-Za-z0-9._~-]{0,95}$",
        },
        account: { minLength: 1, maxLength: 96 },
        channel: { minLength: 1, maxLength: 96 },
        threadId: { minLength: 1, maxLength: 96 },
      },
    });
    expect(contract.schemas.deliveryTarget).not.toHaveProperty("properties.accountId");
    expect(contract.schemas.deliveryTarget).not.toHaveProperty("properties.channelId");
    expect(JSON.stringify(contract.schemas.deliveryTarget)).not.toMatch(/discord|slack/);
    expect((contract.schemas.deliveryTarget as { required: string[] }).required).not.toContain(
      "threadId",
    );
    expect(contract.schemas).not.toHaveProperty("legacyDeliveryTarget");
    expect(contract.schemas.nullableDeliveryTarget).toEqual({
      oneOf: [targetRef, { type: "null" }],
    });
    expect(contract.schemas.reservationBody.properties.deliveryTarget).toEqual(targetRef);
    expect(contract.schemas.reservationBody.required).not.toContain("deliveryTarget");
    expect(contract.schemas.deliveryEnvelope.properties.deliveryTarget).toEqual(targetRef);
    expect(contract.schemas.deliveryEnvelope.required).toContain("deliveryTarget");
    expect(contract.schemas.invocationBody.properties.attemptedTarget).toEqual(targetRef);
    expect(contract.schemas.completionBody.properties.attemptedTarget).toEqual(targetRef);
    expect(contract.schemas.deliveryAttempt.properties.attemptedTarget).toEqual({
      $ref: "#/schemas/nullableDeliveryTarget",
    });
    expect(contract.schemas.deliveryAttempt.properties.providerEvidence.properties).toEqual({
      code: { type: "string" },
      status: { type: "integer" },
      retryAfterSeconds: { type: "integer" },
      detail: { type: "string" },
    });
    expect(contract.schemas.record.properties.sourceThreadId).toEqual({
      type: "string",
      minLength: 1,
      maxLength: 96,
    });
  });

  it("keeps provider-specific destination evidence in the OpenClaw overlay", async () => {
    const fixtures = JSON.parse(
      await readFile(join(contractDir, "openclaw-overlay-v1.json"), "utf8"),
    ) as {
      structuredDestinationVectors: {
        threadedDiscord: Record<string, string>;
        nonThreadedDiscord: Record<string, string>;
        threadedSlack: Record<string, string>;
        lifecycle: string[];
        equality: string;
        sourceTarget: string;
      };
      providerValidation: {
        allowedProviders: string[];
        discord: Record<string, unknown>;
        slack: Record<string, unknown>;
      };
    };

    expect(fixtures.structuredDestinationVectors).toMatchObject({
      threadedDiscord: {
        provider: "discord",
        account: "delivery-account",
        channel: "delivery-channel",
        threadId: "delivery-thread",
      },
      nonThreadedDiscord: {
        provider: "discord",
        account: "delivery-account",
        channel: "delivery-channel",
      },
      threadedSlack: {
        provider: "slack",
        account: "workspace-a",
        channel: "C123",
        threadId: "1712345678.123456",
      },
      lifecycle: [
        "ready.deliveryEnvelope.deliveryTarget",
        "reservation.deliveryEnvelope.deliveryTarget",
        "invocation.attemptedTarget",
        "completion.attemptedTarget",
        "deliveryAttempt.attemptedTarget",
      ],
      equality: "exact deep equality",
      sourceTarget: "v1:slack:workspace-a:C123",
    });
    expect(fixtures.providerValidation).toEqual({
      allowedProviders: ["discord", "slack"],
      discord: {
        account: "OpenClaw account identifier",
        channel: "OpenClaw channel identifier",
        threadId: "optional OpenClaw thread identifier",
      },
      slack: {
        account: "OpenClaw workspace/account identifier",
        channel: "OpenClaw channel identifier",
        threadId: "required Slack thread timestamp",
        threadIdPattern: "^\\d+\\.\\d+$",
      },
    });
  });

  it("pins account-scoped Discord root, Slack root, and Slack reply intake vectors", async () => {
    const fixtures = JSON.parse(
      await readFile(join(contractDir, "cutover-controls-v1.json"), "utf8"),
    ) as {
      sourceThreadVectors: Array<Record<string, string>>;
      cases: Array<{
        name: string;
        request: { body: Record<string, unknown> | null };
        response: { body: Record<string, unknown> };
      }>;
    };

    expect(fixtures.sourceThreadVectors).toEqual([
      {
        name: "discord.root",
        provider: "discord",
        account: "account-a",
        channel: "shared-channel",
        providerEventId: "discord-event-001",
        sourceThreadId: "discord-event-001",
        sourceTarget: "v1:discord:account-a:shared-channel",
      },
      {
        name: "slack.root",
        provider: "slack",
        account: "workspace-a",
        channel: "C123",
        providerEventId: "1723640000.000100",
        sourceThreadId: "1723640000.000100",
        sourceTarget: "v1:slack:workspace-a:C123",
      },
      {
        name: "slack.reply",
        provider: "slack",
        account: "workspace-a",
        channel: "C123",
        providerEventId: "1723640000.000200",
        sourceThreadId: "1723640000.000100",
        sourceTarget: "v1:slack:workspace-a:C123",
      },
    ]);
    const reservation = fixtures.cases.find((item) => item.name === "reserve.success");
    if (!reservation) {
      throw new Error("missing reserve.success fixture");
    }
    expect(reservation.request.body?.deliveryTarget).toEqual({
      provider: "discord",
      account: "default",
      channel: "001",
    });
    expect(
      (reservation.response.body.reservation as Record<string, unknown>).deliveryEnvelope,
    ).toMatchObject({
      deliveryTarget: {
        provider: "discord",
        account: "default",
        channel: "001",
      },
    });
    expect(JSON.stringify(fixtures.cases.map((item) => item.response))).not.toMatch(
      /"(?:deliveryTarget|attemptedTarget)":"/,
    );
    for (const name of ["complete.sent", "complete.replay", "complete.failed"]) {
      const completion = fixtures.cases.find((item) => item.name === name);
      const record = completion?.response.body.record as Record<string, unknown>;
      const delivery = record.delivery as { attempts: Array<Record<string, unknown>> };
      expect(delivery.attempts[0]).toMatchObject({
        deliveryEnvelope: expect.objectContaining({
          deliveryTarget: expect.objectContaining({ provider: "discord" }),
        }),
        deliveryEnvelopeDigest: expect.stringMatching(/^[0-9a-f]{64}$/),
        reserveIdempotencyKey: expect.any(String),
        attemptedTarget: expect.objectContaining({ provider: "discord" }),
      });
    }
    const failedCompletion = fixtures.cases.find((item) => item.name === "complete.failed");
    if (!failedCompletion) {
      throw new Error("missing complete.failed fixture");
    }
    const failedRecord = failedCompletion.response.body.record as {
      delivery: { attempts: Array<Record<string, unknown>> };
    };
    expect(failedRecord.delivery.attempts[0].providerEvidence).toEqual({
      code: "provider_timeout",
    });
  });

  it("pins the accepted KM owner revision and owner files", async () => {
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      acceptedRevision: string;
      ownerFiles: Record<string, string>;
    };
    expect(provenance.acceptedRevision).toBe("872436aad992826b5d501597e265e8c2b94e6f78");
    expect(provenance.ownerFiles).toEqual({
      "km-system/contracts/deliberation-v2/v1/contract.json":
        "d3c0771d5c1d63fecc18cb93e381136fa8af3054c96cbcdebb95b7785a46dc5f",
      "km-system/contracts/deliberation-v2/v1/fixtures.json":
        "a399132355c792e3861a3e8e2d8e2542e0ccb517231e817acf8afe3c54cca4b7",
    });
    expect(provenance).not.toHaveProperty("ownerPin");
    const identity = JSON.parse(
      await readFile(join(contractDir, "source-identity-v1.json"), "utf8"),
    ) as { version: string; grammar: string; providerAgreement: string };
    expect(identity).toMatchObject({
      version: "v1",
      grammar: "v1:<provider>:<account>:<channel>",
      providerAgreement: "intake provider must exactly equal the provider component",
    });
  });
});
