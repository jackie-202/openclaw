import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateJsonSchemaValue,
  type JsonSchemaObject,
} from "openclaw/plugin-sdk/json-schema-runtime";
import { describe, expect, it } from "vitest";

const contractDir = join(dirname(fileURLToPath(import.meta.url)), "../contracts");

type SchemaReference = { $ref: string };
type ContractEndpoint = {
  method: string;
  path: string;
  request: Record<"headers" | "query" | "body", SchemaReference>;
  responses: Record<string, SchemaReference>;
};
type ContractFixture = {
  name: string;
  request: {
    method: string;
    path: string;
    headers: unknown;
    query: unknown;
    body: unknown;
  };
  response: { status: number; body: unknown };
};

const expectedRequestSchemaErrors: Record<string, { location: "headers" | "body"; field: string }> =
  {
    "auth.missing": { location: "headers", field: "Authorization" },
    "version.unsupported": {
      location: "headers",
      field: "X-Deliberation-Protocol-Version",
    },
    "schema.unknown-field": { location: "body", field: "unknown" },
    "intake.debounce-override-rejected": { location: "body", field: "debounceSeconds" },
    "intake.account-missing": { location: "body", field: "sourceTarget" },
    "intake.historical-reopen-rejected": { location: "body", field: "sourceTarget" },
  };

function normalizeNullableObjectsForRuntime(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeNullableObjectsForRuntime);
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const normalized: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    normalized[key] = normalizeNullableObjectsForRuntime(child);
  }
  if (Array.isArray(normalized.type) && normalized.type.includes("null")) {
    const { type: _type, ...objectSchema } = normalized;
    const anyOf: Array<Record<string, unknown>> = [];
    for (const type of normalized.type) {
      if (type !== "null") {
        anyOf.push({ ...objectSchema, type });
      }
    }
    anyOf.push({ type: "null" });
    return { anyOf };
  }
  return normalized;
}

describe("accepted Deliberation contracts", () => {
  it("validates every fixture request and status-specific response", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      schemas: Record<string, JsonSchemaObject>;
      endpoints: ContractEndpoint[];
    };
    const fixtures = JSON.parse(
      await readFile(join(contractDir, "cutover-controls-v1.json"), "utf8"),
    ) as { cases: ContractFixture[] };
    // TypeBox emits unsafe property probes for the contract's draft-style nullable objects.
    // This equivalent form keeps the referenced closed schema executable for null values.
    const runtimeSchemas = normalizeNullableObjectsForRuntime(contract.schemas) as Record<
      string,
      JsonSchemaObject
    >;

    for (const fixture of fixtures.cases) {
      const endpoint = contract.endpoints.find(
        (candidate) =>
          candidate.method === fixture.request.method && candidate.path === fixture.request.path,
      );
      expect(endpoint, `${fixture.name}: unknown endpoint`).toBeDefined();
      if (!endpoint) {
        continue;
      }

      const requestErrors: Array<{ location: string; field: string; detail: string }> = [];
      for (const location of ["headers", "query", "body"] as const) {
        let result: ReturnType<typeof validateJsonSchemaValue>;
        try {
          result = validateJsonSchemaValue({
            schema: {
              ...endpoint.request[location],
              schemas: runtimeSchemas,
            } as JsonSchemaObject,
            cacheKey: `deliberation-fixture:${fixture.name}:request:${location}`,
            value: fixture.request[location],
          });
        } catch (error) {
          throw new Error(`${fixture.name}: request ${location}: ${String(error)}`, {
            cause: error,
          });
        }
        if (!result.ok) {
          requestErrors.push(
            ...result.errors.map((error) => ({
              location,
              field: error.additionalProperty ?? error.path,
              detail: error.text,
            })),
          );
        }
      }

      const expectedError = expectedRequestSchemaErrors[fixture.name];
      if (expectedError) {
        expect(requestErrors, fixture.name).toHaveLength(1);
        expect(requestErrors[0]?.location, fixture.name).toBe(expectedError.location);
        expect(requestErrors[0]?.detail, fixture.name).toContain(expectedError.field);
      } else if (requestErrors.length > 0) {
        expect(fixture.response, fixture.name).toMatchObject({
          status: 400,
          body: { error: { code: "SCHEMA_INVALID" } },
        });
      }

      const responseSchema = endpoint.responses[String(fixture.response.status)];
      expect(responseSchema, `${fixture.name}: unknown response status`).toBeDefined();
      if (!responseSchema) {
        continue;
      }
      let responseResult: ReturnType<typeof validateJsonSchemaValue>;
      try {
        responseResult = validateJsonSchemaValue({
          schema: { ...responseSchema, schemas: runtimeSchemas } as JsonSchemaObject,
          cacheKey: `deliberation-fixture:${fixture.name}:response:${fixture.response.status}`,
          value: fixture.response.body,
        });
      } catch (error) {
        throw new Error(`${fixture.name}: response ${fixture.response.status}: ${String(error)}`, {
          cause: error,
        });
      }
      expect(responseResult, `${fixture.name}: invalid response`).toMatchObject({ ok: true });
    }
  });

  it("requires the KM owner to adopt immutable pipeline and target evidence", async () => {
    const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
      schemas: {
        intakeBody: { properties: Record<string, unknown>; required: string[] };
        deliveryTarget: { properties: Record<string, unknown> };
        deliveryEnvelope: { properties: Record<string, unknown>; required: string[] };
      };
    };
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      openclawProducerExtension: { status: string; kmOwnerBaselineChanged: boolean };
    };

    expect(contract.schemas.intakeBody.required).toEqual(
      expect.arrayContaining(["pipelineId", "deliveryTarget"]),
    );
    expect(contract.schemas.deliveryEnvelope.required).toContain("pipelineId");

    expect(Object.keys(contract.schemas.deliveryTarget.properties)).toEqual([
      "provider",
      "account",
      "channel",
      "threadId",
    ]);
    expect(provenance.openclawProducerExtension.status).not.toMatch(/pending/i);
    expect(provenance.openclawProducerExtension.kmOwnerBaselineChanged).toBe(true);
  });

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

    expect(contract.schemas.intakeBody.properties.deliveryTarget).toEqual(targetRef);
    expect(contract.schemas.intakeBody.required).toEqual(
      expect.arrayContaining(["pipelineId", "deliveryTarget"]),
    );
    expect(contract.schemas.intakeBody.required).not.toContain("sourceThreadId");
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
    expect(contract.schemas.reservationBody.properties).not.toHaveProperty("deliveryTarget");
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
      producerIntakeExtension: {
        proposal: string;
        owner: string;
        kmAdoption: string;
        requiredFields: string[];
        authority: string;
        targetEquality: string;
        derivationVectors: Record<string, Record<string, unknown>>;
      };
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

    expect(fixtures.producerIntakeExtension).toMatchObject({
      proposal: "proposal-20260820-203458-161e2c",
      owner: "openclaw-fork",
      requiredFields: ["pipelineId", "deliveryTarget"],
      targetEquality: "exact deep equality from intake through lifecycle evidence",
    });
    expect(fixtures.producerIntakeExtension.kmAdoption).toContain("adopted");
    expect(fixtures.producerIntakeExtension.authority).toContain(
      "message content and model output have no routing authority",
    );
    expect(fixtures.producerIntakeExtension.derivationVectors).toMatchObject({
      omittedDiscordRoot: {
        pipelineId: "discord-source",
        deliveryTarget: { mode: "source_anchor", threadId: "discord-message-1" },
      },
      omittedDiscordChild: {
        providerEventId: "discord-message-2",
        sourceThreadId: "discord-thread-1",
        deliveryTarget: { mode: "thread", threadId: "discord-thread-1" },
      },
      omittedSlackRoot: {
        providerEventId: "1723640000.000100",
        deliveryTarget: { mode: "thread", threadId: "1723640000.000100" },
      },
      omittedSlackChild: {
        providerEventId: "1723640000.000200",
        sourceThreadId: "1723640000.000100",
        deliveryTarget: { mode: "thread", threadId: "1723640000.000100" },
      },
      explicitRoot: {
        deliveryTarget: {
          provider: "discord",
          account: "delivery-account",
          channel: "delivery-channel",
          mode: "root",
        },
      },
      explicitThread: { deliveryTarget: { mode: "thread", threadId: "delivery-thread" } },
    });
    expect(
      fixtures.producerIntakeExtension.derivationVectors.explicitRoot?.deliveryTarget,
    ).not.toHaveProperty("threadId");

    expect(fixtures.structuredDestinationVectors).toMatchObject({
      threadedDiscord: {
        provider: "discord",
        account: "delivery-account",
        channel: "delivery-channel",
        mode: "thread",
        threadId: "delivery-thread",
      },
      nonThreadedDiscord: {
        provider: "discord",
        account: "delivery-account",
        channel: "delivery-channel",
        mode: "root",
      },
      threadedSlack: {
        provider: "slack",
        account: "workspace-a",
        channel: "C123",
        mode: "thread",
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
        threadId: "Slack thread timestamp, required only when mode is thread",
        threadIdPattern: "^\\d+\\.\\d+$",
      },
    });
  });

  it("pins account-scoped Discord root, Slack root, and Slack reply intake vectors", async () => {
    const fixtures = JSON.parse(
      await readFile(join(contractDir, "cutover-controls-v1.json"), "utf8"),
    ) as {
      pipelineVectors: { live: string[]; historical: string; targets: unknown[] };
      identityVectors: { positive: Array<Record<string, string>> };
      cases: Array<{
        name: string;
        request: { body: Record<string, unknown> | null };
        response: { body: Record<string, unknown> };
      }>;
    };

    expect(fixtures.pipelineVectors).toMatchObject({
      live: ["discord-source", "slack-source", "synthetic-diagnostic"],
      historical: "__historical_v1__",
    });
    expect(fixtures.identityVectors.positive).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "discord.producer.default",
          sourceTarget: "v1:discord:default:1494265174389948538",
        }),
      ]),
    );
    const reservation = fixtures.cases.find((item) => item.name === "reserve.success");
    if (!reservation) {
      throw new Error("missing reserve.success fixture");
    }
    expect(reservation.request.body).not.toHaveProperty("deliveryTarget");
    expect(
      (reservation.response.body.reservation as Record<string, unknown>).deliveryEnvelope,
    ).toMatchObject({
      deliveryTarget: {
        provider: "discord",
        account: "default",
        channel: "001",
      },
      pipelineId: "discord-source",
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
      code: "provider_rejected",
    });
  });

  it("pins the accepted KM owner revision and owner files", async () => {
    const provenance = JSON.parse(await readFile(join(contractDir, "provenance.json"), "utf8")) as {
      runtimeRevision: { head: string; scope: string; blocking: boolean };
      semanticAuthority: string;
      ownerFiles: Record<string, string>;
      openclawProducerExtension: Record<string, unknown>;
      repositoryLocalEvidence: Record<string, unknown>;
      configuredKmCheckoutEvidence: Record<string, unknown>;
      externalLiveDeployment: Record<string, unknown>;
    };
    expect(provenance.runtimeRevision).toEqual({
      head: "printed by the owner-backed gate at execution time",
      scope: "runtime provenance only",
      blocking: false,
    });
    expect(provenance.semanticAuthority).toContain("SHA-256");
    expect(provenance.ownerFiles).toEqual({
      "km-system/contracts/deliberation-v2/v1/contract.json":
        "5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b",
      "km-system/contracts/deliberation-v2/v1/fixtures.json":
        "f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4",
      "km-system/lib/deliberation_wire.py":
        "a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528",
      "km-system/lib/deliberation_spool_contracts.py":
        "47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca",
    });
    expect(provenance).not.toHaveProperty("ownerPin");
    expect(provenance.openclawProducerExtension).toEqual({
      proposal: "proposal-20260820-203458-161e2c",
      owner: "openclaw-fork",
      status:
        "repository-local closed schemas and lifecycle fixtures are semantically consistent; external deployment is unknown",
      kmOwnerBaselineChanged: true,
    });
    expect(provenance).toMatchObject({
      repositoryLocalEvidence: {
        schemaValidation: "all request and status-specific response fixtures pass",
        scope: "OpenClaw repository only",
      },
      configuredKmCheckoutEvidence: {
        status: "accepted artifact authority",
        contractSha256: "5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b",
        fixturesSha256: "f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4",
        wireSha256: "a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528",
        spoolContractsSha256: "47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca",
        result: expect.stringContaining("runtime HEAD is non-blocking"),
      },
      externalLiveDeployment: { status: "unknown" },
    });
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
