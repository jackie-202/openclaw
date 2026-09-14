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
const expectedMembers = [
  {
    path: "contracts/deliberation-v2/v1/contract.json",
    localPath: "deliberation-v2-v1-contract.json",
    sha256: "292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f",
  },
  {
    path: "contracts/deliberation-v2/v1/fixtures.json",
    localPath: "deliberation-v2-v1-fixtures.json",
    sha256: "357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78",
  },
] as const;

type PublicationManifest = {
  bundleSchemaVersion: number;
  bundleVersion: number;
  bundleSha256: string;
  canonicalization: {
    encoding: string;
    json: string;
    trailingNewline: boolean;
  };
  members: Array<{ path: string; sha256: string }>;
};

type PinManifest = {
  pinSchemaVersion: number;
  authority: { owner: string; scope: string };
  localArtifacts: Array<{ publishedPath: string; path: string }>;
  publicationManifest: PublicationManifest;
};

type ContractEndpoint = {
  method: string;
  path: string;
  request: Record<"headers" | "query" | "body", { $ref: string }>;
  responses: Record<string, { $ref: string }>;
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

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .toSorted(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(bytes: string | Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function validatePin(manifest: PinManifest, artifacts: Map<string, Buffer>): void {
  expect(manifest.pinSchemaVersion).toBe(1);
  expect(manifest.authority).toEqual({
    owner: "published Deliberation v2 domain",
    scope: "publicationManifest.members only",
  });
  expect(manifest.publicationManifest).toMatchObject({
    bundleSchemaVersion: 1,
    bundleVersion: 1,
    bundleSha256: "b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338",
    canonicalization: {
      encoding: "UTF-8",
      json: "RFC 8259 values; lexicographic object keys; compact separators",
      trailingNewline: true,
    },
  });
  expect(manifest.publicationManifest.members).toEqual(
    expectedMembers.map(({ path, sha256: digest }) => ({ path, sha256: digest })),
  );
  expect(manifest.localArtifacts).toEqual(
    expectedMembers.map(({ path, localPath }) => ({ publishedPath: path, path: localPath })),
  );

  const { bundleSha256, ...selfExcludedManifest } = manifest.publicationManifest;
  expect(sha256(`${canonicalJson(selfExcludedManifest)}\n`)).toBe(bundleSha256);
  for (const member of expectedMembers) {
    const bytes = artifacts.get(member.localPath);
    expect(bytes, `${member.localPath}: missing local artifact`).toBeDefined();
    expect(sha256(bytes ?? Buffer.alloc(0)), member.localPath).toBe(member.sha256);
    expect(bytes?.toString("utf8"), `${member.localPath}: noncanonical bytes`).toBe(
      `${canonicalJson(JSON.parse(bytes?.toString("utf8") ?? "null"))}\n`,
    );
  }
}

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
    const { type, ...schema } = normalized;
    return {
      anyOf: [
        ...type
          .filter((item) => item !== "null")
          .map((item) => Object.assign({ type: item }, schema)),
        { type: "null" },
      ],
    };
  }
  return normalized;
}

async function loadPin(): Promise<{ manifest: PinManifest; artifacts: Map<string, Buffer> }> {
  const manifest = JSON.parse(
    await readFile(join(contractDir, "deliberation-wire-pin-v1.json"), "utf8"),
  ) as PinManifest;
  const artifacts = new Map<string, Buffer>();
  for (const { path } of manifest.localArtifacts) {
    artifacts.set(path, await readFile(join(contractDir, path)));
  }
  return { manifest, artifacts };
}

describe("Deliberation published wire pin", () => {
  it("pins the exact published manifest and canonical local artifact bytes", async () => {
    const pin = await loadPin();
    validatePin(pin.manifest, pin.artifacts);
  });

  it("rejects missing, tampered, version-mismatched, unordered, and digest-mismatched pins", async () => {
    const pin = await loadPin();
    const variants: Array<{ name: string; manifest: PinManifest; artifacts: Map<string, Buffer> }> =
      [
        {
          name: "missing artifact",
          manifest: structuredClone(pin.manifest),
          artifacts: new Map([...pin.artifacts].slice(1)),
        },
        {
          name: "tampered artifact",
          manifest: structuredClone(pin.manifest),
          artifacts: new Map(pin.artifacts).set(
            expectedMembers[0].localPath,
            Buffer.from("{}\n", "utf8"),
          ),
        },
        {
          name: "bundle schema version",
          manifest: {
            ...structuredClone(pin.manifest),
            publicationManifest: {
              ...structuredClone(pin.manifest.publicationManifest),
              bundleSchemaVersion: 2,
            },
          },
          artifacts: pin.artifacts,
        },
        {
          name: "bundle version",
          manifest: {
            ...structuredClone(pin.manifest),
            publicationManifest: {
              ...structuredClone(pin.manifest.publicationManifest),
              bundleVersion: 2,
            },
          },
          artifacts: pin.artifacts,
        },
        {
          name: "member order",
          manifest: {
            ...structuredClone(pin.manifest),
            publicationManifest: {
              ...structuredClone(pin.manifest.publicationManifest),
              members: structuredClone(pin.manifest.publicationManifest.members).toReversed(),
            },
          },
          artifacts: pin.artifacts,
        },
        {
          name: "member digest",
          manifest: {
            ...structuredClone(pin.manifest),
            publicationManifest: {
              ...structuredClone(pin.manifest.publicationManifest),
              members: pin.manifest.publicationManifest.members.map((member, index) =>
                index === 0 ? { ...member, sha256: "0".repeat(64) } : member,
              ),
            },
          },
          artifacts: pin.artifacts,
        },
        {
          name: "bundle digest",
          manifest: {
            ...structuredClone(pin.manifest),
            publicationManifest: {
              ...structuredClone(pin.manifest.publicationManifest),
              bundleSha256: "0".repeat(64),
            },
          },
          artifacts: pin.artifacts,
        },
      ];

    for (const variant of variants) {
      expect(() => validatePin(variant.manifest, variant.artifacts), variant.name).toThrow();
    }
  });

  it("validates every published request and status-specific response fixture", async () => {
    const pin = await loadPin();
    validatePin(pin.manifest, pin.artifacts);
    const contract = JSON.parse(
      pin.artifacts.get("deliberation-v2-v1-contract.json")?.toString("utf8") ?? "null",
    ) as { schemas: Record<string, JsonSchemaObject>; endpoints: ContractEndpoint[] };
    const fixtures = JSON.parse(
      pin.artifacts.get("deliberation-v2-v1-fixtures.json")?.toString("utf8") ?? "null",
    ) as { cases: ContractFixture[] };
    const schemas = normalizeNullableObjectsForRuntime(contract.schemas) as Record<
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
      const requestErrors: Array<{ location: string; detail: string }> = [];
      for (const location of ["headers", "query", "body"] as const) {
        const result = validateJsonSchemaValue({
          schema: { ...endpoint.request[location], schemas } as JsonSchemaObject,
          cacheKey: `deliberation-pin:${fixture.name}:request:${location}`,
          value: fixture.request[location],
        });
        if (!result.ok) {
          requestErrors.push(...result.errors.map((error) => ({ location, detail: error.text })));
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
      if (responseSchema) {
        expect(
          validateJsonSchemaValue({
            schema: { ...responseSchema, schemas } as JsonSchemaObject,
            cacheKey: `deliberation-pin:${fixture.name}:response:${fixture.response.status}`,
            value: fixture.response.body,
          }),
          `${fixture.name}: invalid response`,
        ).toMatchObject({ ok: true });
      }
    }
  });
});
