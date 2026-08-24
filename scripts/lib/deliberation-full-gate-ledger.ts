import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const DELIBERATION_LEAVES = [
  ["OR-01", "OR-01 exclusive-owner-before-ordinary-side-effects", "discord"],
  ["OR-02", "OR-02 disabled-source-terminal-without-side-effects", "discord"],
  ["OR-03", "OR-03 missing-error-ambiguous-owner-terminal", "discord"],
  ["OR-04", "OR-04 discord-system-room-event-claimed-before-enqueue", "discord"],
  ["OR-05", "OR-05 slack-root-child-claim-before-thread-effects", "slack"],
  ["OR-06", "OR-06 command-abort-empty-autothread-claim-matrix", "discord"],
  ["OR-07", "OR-07 authenticated-event-creates-one-record", "km-integration"],
  ["OR-08", "OR-08 duplicate-idempotent-conflict-zero-mutation", "km-integration"],
  ["OR-09", "OR-09 account-channel-source-isolation", "km-integration"],
  ["OR-10", "OR-10 history-context-only-pending-event-singular", "km-integration"],
  ["OR-11", "OR-11 pipeline-source-target-immutable-end-to-end", "km-integration"],
  ["OR-12", "OR-12 reservation-no-target-override-cas-replay", "km-integration"],
  ["OR-13", "OR-13 invocation-marker-before-one-provider-call", "km-integration"],
  ["OR-14", "OR-14 sent-completion-exact-immutable-receipt", "km-integration"],
  ["OR-15", "OR-15 authoritative-provider-rejection-terminal", "km-integration"],
  ["OR-16", "OR-16 timeout-transport-remain-delivery-unknown", "km-integration"],
  ["OR-17", "OR-17 invoked-unknown-nonreservable-after-restart", "km-integration"],
  ["OR-18", "OR-18 never-invoked-abandonment-fresh-attempt-id", "km-integration"],
  ["OR-19", "OR-19 legacy-not-sent-unknown-never-authorize-retry", "km-integration"],
  ["OR-20", "OR-20 historical-attempt-drift-and-tamper-fail-closed", "km-integration"],
  ["OR-21", "OR-21 atomic-bounded-legacy-migration-audit-only", "km-integration"],
  ["OR-22", "OR-22 doctor-package-writeback-built-five-hook-runtime", "package"],
  ["OR-23", "OR-23 full-gate-integrity", "integrity"],
] as const;

export const DELIBERATION_SUPPORT_COMMANDS = [
  "build",
  "package-build",
  "focused-deliberation",
  "oxlint",
  "tsgo-production",
  "tsgo-tests",
  "package-singleton",
  "diff-check",
  "negative-missing",
  "negative-duplicate",
  "negative-stale",
  "negative-malformed",
] as const;

// The canonical command owns a 20-minute leaf timeout, so nested Vitest
// watchdogs and per-test limits must not terminate a healthy leaf earlier.
export const DELIBERATION_VITEST_TIMEOUT_MS = "1200000";
export const DELIBERATION_FOCUSED_VITEST_CONFIG = "test/vitest/vitest.extensions.config.ts";

export const KM_AUTHORITY = {
  repositoryRoot: "/Users/michal/.openclaw",
  root: "/Users/michal/.openclaw/workspace/km-system",
  files: [
    {
      path: "contracts/deliberation-v2/v1/contract.json",
      sha256: "5c63424b32a8db8370a1212ff7eb3878695afbb5d0fec3721fbab326908de44b",
    },
    {
      path: "contracts/deliberation-v2/v1/fixtures.json",
      sha256: "f26ca9afb804664cdcc03947262001d1d8441eab6d5ad9d92bb8533ae3c916b4",
    },
    {
      path: "lib/deliberation_wire.py",
      sha256: "a0e42e4fe54eedab6f9955e77f439a4e69c9614a60560ca46532ce0de9dbb528",
    },
    {
      path: "lib/deliberation_spool_contracts.py",
      sha256: "47587e405d3e6b7f433eb7d450bd02969546860ff0d6822ad7bea9ff2478a0ca",
    },
  ],
} as const;

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const timestampSchema = z.string().datetime({ offset: true });
const authorityFileSchema = z.strictObject({ path: z.string().min(1), sha256: sha256Schema });
const authoritySchema = z.strictObject({
  openclaw: z.strictObject({
    root: z.string().min(1),
    revision: z.string().regex(/^[a-f0-9]{40}$/u),
    clean: z.literal(true),
  }),
  km: z.strictObject({
    repositoryRoot: z.literal(KM_AUTHORITY.repositoryRoot),
    root: z.literal(KM_AUTHORITY.root),
    head: z.string().regex(/^[a-f0-9]{40}$/u),
    files: z.array(authorityFileSchema).length(KM_AUTHORITY.files.length),
  }),
});
const reportSchema = z.strictObject({
  format: z.enum(["vitest-json", "junit"]),
  sha256: sha256Schema,
  bytes: z.number().int().nonnegative(),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  selectors: z.array(z.string()),
});
const commandSchema = z.strictObject({
  id: z.string().min(1),
  role: z.enum(["acceptance", "support"]),
  executable: z.string().min(1),
  argv: z.array(z.string()),
  cwd: z.string().min(1),
  env: z.record(z.string(), z.string()),
  identitySha256: sha256Schema,
  startedAt: timestampSchema,
  finishedAt: timestampSchema,
  expectedExitCode: z.number().int(),
  exitCode: z.number().int(),
  timedOut: z.boolean(),
  stdoutSha256: sha256Schema,
  stderrSha256: sha256Schema,
  report: reportSchema.nullable(),
});
const leafSchema = z.strictObject({
  id: z.string().regex(/^OR-\d{2}$/u),
  selector: z.string().min(1),
  commandId: z.string().min(1),
  status: z.enum(["Green", "Red", "Skipped"]),
  observedAt: timestampSchema,
});
const commonLedgerShape = {
  schemaVersion: z.literal(1),
  runId: z.string().uuid(),
  runStartedAt: timestampSchema,
  authority: authoritySchema,
  authoritySha256: sha256Schema,
  commands: z.array(commandSchema),
  leaves: z.array(leafSchema),
};
const candidateSchema = z.strictObject({
  ...commonLedgerShape,
  kind: z.literal("candidate"),
  candidateCreatedAt: timestampSchema,
});
const finalSchema = z.strictObject({
  ...commonLedgerShape,
  kind: z.literal("final"),
  candidateCreatedAt: timestampSchema,
  candidateSha256: sha256Schema,
  finalizedAt: timestampSchema,
});

export type GateAuthority = z.infer<typeof authoritySchema>;
export type GateCommand = z.infer<typeof commandSchema>;
export type GateLeaf = z.infer<typeof leafSchema>;
export type CandidateLedger = z.infer<typeof candidateSchema>;
export type FinalLedger = z.infer<typeof finalSchema>;

export type GateReport = NonNullable<GateCommand["report"]>;

export function parseVitestJsonReport(bytes: Buffer): GateReport {
  const value = JSON.parse(bytes.toString("utf8")) as {
    testResults?: Array<{
      assertionResults?: Array<{ title?: unknown; fullName?: unknown; status?: unknown }>;
    }>;
  };
  const assertions = value.testResults?.flatMap((result) => result.assertionResults ?? []) ?? [];
  const statusCount = (status: string) =>
    assertions.filter((assertion) => assertion.status === status).length;
  return {
    format: "vitest-json",
    sha256: sha256(bytes),
    bytes: bytes.length,
    passed: statusCount("passed"),
    failed: statusCount("failed"),
    skipped: statusCount("pending") + statusCount("skipped") + statusCount("todo"),
    selectors: assertions.flatMap((assertion) =>
      assertion.status === "passed" && typeof assertion.title === "string" ? [assertion.title] : [],
    ),
  };
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

export function parseJunitReport(bytes: Buffer): GateReport {
  const xml = bytes.toString("utf8");
  const testcases = [
    ...xml.matchAll(
      /<testcase\b([^>]*\bname="([^"]+)"[^>]*)>([\s\S]*?)<\/testcase>|<testcase\b([^>]*\bname="([^"]+)"[^>]*)\/>/gu,
    ),
  ].map((match) => ({
    name: decodeXml(match[2] ?? match[5] ?? ""),
    body: match[3] ?? "",
  }));
  const failed = testcases.filter(({ body }) => /<(?:failure|error)\b/u.test(body)).length;
  const skipped = testcases.filter(({ body }) => /<skipped\b/u.test(body)).length;
  return {
    format: "junit",
    sha256: sha256(bytes),
    bytes: bytes.length,
    passed: testcases.length - failed - skipped,
    failed,
    skipped,
    selectors: testcases.flatMap(({ name, body }) =>
      /<(?:failure|error|skipped)\b/u.test(body) ? [] : [name],
    ),
  };
}

export type LedgerValidationContext = {
  runId: string;
  now: Date;
  openclawRoot: string;
  openclawRevision: string;
  maxAgeMs?: number;
};

export class LedgerValidationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "LedgerValidationError";
  }
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function authorityDigest(authority: GateAuthority): string {
  return sha256(canonicalJson(authority));
}

export function commandIdentityDigest(
  runId: string,
  authoritySha256: string,
  command: Pick<GateCommand, "executable" | "argv" | "cwd" | "env">,
): string {
  return sha256(
    canonicalJson({
      runId,
      authoritySha256,
      executable: command.executable,
      argv: command.argv,
      cwd: command.cwd,
      env: command.env,
    }),
  );
}

export function candidateDigest(candidate: CandidateLedger): string {
  return sha256(canonicalJson(candidate));
}

function environmentFlagEnabled(value: string | undefined): boolean {
  return value !== undefined && ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function assertNoLiveEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): void {
  const enabled = Object.entries(environment)
    .filter(([key, value]) => key.includes("LIVE") && environmentFlagEnabled(value))
    .map(([key]) => key)
    .toSorted();
  if (enabled.length > 0) {
    throw new LedgerValidationError(
      "LIVE_ENVIRONMENT",
      `live execution environment is forbidden: ${enabled.join(", ")}`,
    );
  }
}

export function buildSanitizedChildEnvironment(
  inherited: Readonly<Record<string, string | undefined>>,
  isolated: Readonly<Record<string, string>>,
  command: Readonly<Record<string, string>> = {},
): Record<string, string> {
  const safeInherited = Object.fromEntries(
    ["PATH", "SystemRoot"].flatMap((key) => {
      const value = inherited[key];
      return value ? [[key, value]] : [];
    }),
  );
  return { ...safeInherited, ...isolated, ...command };
}

function rawLeaves(input: unknown): Array<Record<string, unknown>> {
  if (!input || typeof input !== "object") {
    throw new LedgerValidationError("MALFORMED_LEDGER", "ledger must be an object");
  }
  const leaves = (input as { leaves?: unknown }).leaves;
  if (!Array.isArray(leaves)) {
    throw new LedgerValidationError("MALFORMED_LEDGER", "ledger leaves must be an array");
  }
  return leaves.filter(
    (leaf): leaf is Record<string, unknown> => leaf !== null && typeof leaf === "object",
  );
}

function precheckLeaves(input: unknown, expectedCount: number): void {
  const leaves = rawLeaves(input);
  const ids = leaves.map((leaf) => leaf.id).filter((id): id is string => typeof id === "string");
  for (const [id] of DELIBERATION_LEAVES.slice(0, expectedCount)) {
    if (!ids.includes(id)) {
      throw new LedgerValidationError("MISSING_LEAF", `missing leaf ${id}`);
    }
  }
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicate) {
    throw new LedgerValidationError("DUPLICATE_LEAF", `duplicate leaf ${duplicate}`);
  }
}

function parseDate(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new LedgerValidationError("MALFORMED_LEDGER", `${label} is not a timestamp`);
  }
  return parsed;
}

function validateAuthority(authority: GateAuthority, context: LedgerValidationContext): void {
  if (
    authority.openclaw.root !== context.openclawRoot ||
    authority.openclaw.revision !== context.openclawRevision
  ) {
    throw new LedgerValidationError("WRONG_AUTHORITY", "wrong OpenClaw authority");
  }
  for (const [index, expected] of KM_AUTHORITY.files.entries()) {
    const actual = authority.km.files[index];
    if (actual?.path !== expected.path || actual.sha256 !== expected.sha256) {
      throw new LedgerValidationError(
        "WRONG_AUTHORITY",
        `wrong KM authority file ${expected.path}`,
      );
    }
  }
}

function validateCommands(
  commands: GateCommand[],
  leaves: GateLeaf[],
  runId: string,
  authoritySha256: string,
  runStartedAt: number,
  ledgerCreatedAt: number,
  requireSupport: boolean,
): void {
  const byId = new Map<string, GateCommand>();
  for (const command of commands) {
    if (byId.has(command.id)) {
      throw new LedgerValidationError("CONTRADICTORY_EVIDENCE", `duplicate command ${command.id}`);
    }
    byId.set(command.id, command);
    const expectedDigest = commandIdentityDigest(runId, authoritySha256, command);
    if (command.identitySha256 !== expectedDigest) {
      throw new LedgerValidationError(
        "CONTRADICTORY_EVIDENCE",
        `command identity mismatch ${command.id}`,
      );
    }
    const startedAt = parseDate(command.startedAt, `${command.id} start`);
    const finishedAt = parseDate(command.finishedAt, `${command.id} finish`);
    if (startedAt < runStartedAt || finishedAt < startedAt || finishedAt > ledgerCreatedAt) {
      throw new LedgerValidationError(
        "CONTRADICTORY_EVIDENCE",
        `non-monotonic command timestamps ${command.id}`,
      );
    }
    const expectedExitCode = command.id.startsWith("negative-") ? 1 : 0;
    if (command.expectedExitCode !== expectedExitCode) {
      throw new LedgerValidationError(
        "CONTRADICTORY_EVIDENCE",
        `wrong expected exit code ${command.id}`,
      );
    }
    if (
      command.exitCode !== command.expectedExitCode ||
      command.timedOut ||
      (command.report && command.report.failed !== 0)
    ) {
      throw new LedgerValidationError("SUPPORT_FAILED", `command did not pass ${command.id}`);
    }
  }
  if (requireSupport) {
    for (const id of DELIBERATION_SUPPORT_COMMANDS) {
      if (!byId.has(id)) {
        throw new LedgerValidationError("SUPPORT_FAILED", `missing support command ${id}`);
      }
    }
  }
  for (const leaf of leaves) {
    const command = byId.get(leaf.commandId);
    const selectorCount = command?.report?.selectors.filter(
      (selector) => selector === leaf.selector,
    ).length;
    if (!command?.report || selectorCount !== 1) {
      throw new LedgerValidationError(
        "CONTRADICTORY_EVIDENCE",
        `leaf ${leaf.id} must have exactly one reporter result`,
      );
    }
    if (leaf.observedAt !== command.finishedAt) {
      throw new LedgerValidationError(
        "CONTRADICTORY_EVIDENCE",
        `leaf ${leaf.id} timestamp contradicts its command`,
      );
    }
  }
}

function validateManifest(leaves: GateLeaf[], expectedCount: number): void {
  if (leaves.length !== expectedCount) {
    throw new LedgerValidationError(
      "CONTRADICTORY_EVIDENCE",
      `expected ${expectedCount} leaves, received ${leaves.length}`,
    );
  }
  for (const [index, [id, selector, commandId]] of DELIBERATION_LEAVES.slice(
    0,
    expectedCount,
  ).entries()) {
    const leaf = leaves[index];
    if (leaf?.id !== id || leaf.selector !== selector || leaf.commandId !== commandId) {
      throw new LedgerValidationError("CONTRADICTORY_EVIDENCE", `wrong manifest row ${id}`);
    }
    if (leaf.status !== "Green") {
      throw new LedgerValidationError("NON_GREEN_LEAF", `leaf ${id} is ${leaf.status}`);
    }
  }
}

export function validateCandidateLedger(
  input: unknown,
  context: LedgerValidationContext,
): CandidateLedger {
  precheckLeaves(input, 22);
  const parsed = candidateSchema.safeParse(input);
  if (!parsed.success) {
    throw new LedgerValidationError(
      "MALFORMED_LEDGER",
      parsed.error.issues[0]?.message ?? "invalid ledger",
    );
  }
  const ledger = parsed.data;
  if (ledger.runId !== context.runId) {
    throw new LedgerValidationError("STALE_RUN", "ledger run ID is not current");
  }
  validateAuthority(ledger.authority, context);
  if (ledger.authoritySha256 !== authorityDigest(ledger.authority)) {
    throw new LedgerValidationError("WRONG_AUTHORITY", "authority digest mismatch");
  }
  const startedAt = parseDate(ledger.runStartedAt, "run start");
  const createdAt = parseDate(ledger.candidateCreatedAt, "candidate creation");
  const maxAgeMs = context.maxAgeMs ?? 6 * 60 * 60 * 1000;
  if (
    createdAt < startedAt ||
    createdAt > context.now.getTime() ||
    context.now.getTime() - createdAt > maxAgeMs
  ) {
    throw new LedgerValidationError("STALE_RUN", "candidate is stale or future-dated");
  }
  validateManifest(ledger.leaves, 22);
  validateCommands(
    ledger.commands,
    ledger.leaves,
    ledger.runId,
    ledger.authoritySha256,
    startedAt,
    createdAt,
    true,
  );
  return ledger;
}

export function validateFinalLedger(input: unknown, context: LedgerValidationContext): FinalLedger {
  precheckLeaves(input, 23);
  const parsed = finalSchema.safeParse(input);
  if (!parsed.success) {
    throw new LedgerValidationError(
      "MALFORMED_LEDGER",
      parsed.error.issues[0]?.message ?? "invalid ledger",
    );
  }
  const ledger = parsed.data;
  if (ledger.runId !== context.runId) {
    throw new LedgerValidationError("STALE_RUN", "ledger run ID is not current");
  }
  validateAuthority(ledger.authority, context);
  if (ledger.authoritySha256 !== authorityDigest(ledger.authority)) {
    throw new LedgerValidationError("WRONG_AUTHORITY", "authority digest mismatch");
  }
  const startedAt = parseDate(ledger.runStartedAt, "run start");
  const candidateCreatedAt = parseDate(ledger.candidateCreatedAt, "candidate creation");
  const finalizedAt = parseDate(ledger.finalizedAt, "finalization");
  const maxAgeMs = context.maxAgeMs ?? 6 * 60 * 60 * 1000;
  if (candidateCreatedAt < startedAt || finalizedAt < candidateCreatedAt) {
    throw new LedgerValidationError("CONTRADICTORY_EVIDENCE", "final ledger timestamps conflict");
  }
  if (finalizedAt > context.now.getTime() || context.now.getTime() - finalizedAt > maxAgeMs) {
    throw new LedgerValidationError("STALE_RUN", "final ledger is stale or future-dated");
  }
  if (
    candidateCreatedAt > context.now.getTime() ||
    context.now.getTime() - candidateCreatedAt > maxAgeMs
  ) {
    throw new LedgerValidationError("STALE_RUN", "candidate is stale or future-dated");
  }
  validateManifest(ledger.leaves, 23);
  validateCommands(
    ledger.commands,
    ledger.leaves,
    ledger.runId,
    ledger.authoritySha256,
    startedAt,
    finalizedAt,
    true,
  );
  const candidate: CandidateLedger = {
    schemaVersion: 1,
    kind: "candidate",
    runId: ledger.runId,
    runStartedAt: ledger.runStartedAt,
    candidateCreatedAt: ledger.candidateCreatedAt,
    authority: ledger.authority,
    authoritySha256: ledger.authoritySha256,
    commands: ledger.commands.filter((command) => command.id !== "integrity"),
    leaves: ledger.leaves.slice(0, 22),
  };
  if (ledger.candidateSha256 !== candidateDigest(candidate)) {
    throw new LedgerValidationError("CONTRADICTORY_EVIDENCE", "candidate digest mismatch");
  }
  const integrity = ledger.commands.find((command) => command.id === "integrity");
  if (!integrity || parseDate(integrity.startedAt, "integrity start") < candidateCreatedAt) {
    throw new LedgerValidationError("CONTRADICTORY_EVIDENCE", "OR-23 did not run after candidate");
  }
  return ledger;
}

export function writeLedgerExclusive(
  outputPath: string,
  ledger: CandidateLedger | FinalLedger,
): void {
  const bytes = `${JSON.stringify(ledger, null, 2)}\n`;
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  let descriptor: number | undefined;
  try {
    descriptor = fs.openSync(outputPath, "wx", 0o600);
    fs.writeFileSync(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new LedgerValidationError("OUTPUT_EXISTS", `refusing to overwrite ${outputPath}`);
    }
    throw error;
  } finally {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
    }
  }
}
