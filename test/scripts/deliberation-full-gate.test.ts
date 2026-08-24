import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import {
  assertNoLiveEnvironment,
  authorityDigest,
  buildSanitizedChildEnvironment,
  candidateDigest,
  commandIdentityDigest,
  DELIBERATION_FOCUSED_VITEST_CONFIG,
  DELIBERATION_LEAVES,
  DELIBERATION_SUPPORT_COMMANDS,
  DELIBERATION_VITEST_TIMEOUT_MS,
  KM_AUTHORITY,
  parseJunitReport,
  parseVitestJsonReport,
  validateCandidateLedger,
  validateFinalLedger,
  writeLedgerExclusive,
  type CandidateLedger,
  type GateAuthority,
  type GateCommand,
  type FinalLedger,
} from "../../scripts/lib/deliberation-full-gate-ledger.js";

const runId = "123e4567-e89b-42d3-a456-426614174000";
const revision = "1234567890abcdef1234567890abcdef12345678";
const root = "/tmp/openclaw-deliberation-gate-fixture";
const runStartedAt = "2026-08-23T12:00:00.000Z";
const candidateCreatedAt = "2026-08-23T12:10:00.000Z";

it("allows canonical Vitest leaves to remain silent during expensive startup", () => {
  expect(DELIBERATION_VITEST_TIMEOUT_MS).toBe("1200000");
});

it("routes focused Deliberation support through the generic extensions project", () => {
  expect(DELIBERATION_FOCUSED_VITEST_CONFIG).toBe("test/vitest/vitest.extensions.config.ts");
});

function fixtureAuthority(kmHead = "f".repeat(40)): GateAuthority {
  return {
    openclaw: { root, revision, clean: true },
    km: {
      repositoryRoot: KM_AUTHORITY.repositoryRoot,
      root: KM_AUTHORITY.root,
      head: kmHead,
      files: KM_AUTHORITY.files.map((file) => ({ path: file.path, sha256: file.sha256 })),
    },
  };
}

function fixtureCommand(
  id: string,
  role: GateCommand["role"],
  selectors: string[],
  authoritySha256: string,
  index: number,
): GateCommand {
  const startedAt = new Date(Date.parse(runStartedAt) + index * 1_000 + 100).toISOString();
  const finishedAt = new Date(Date.parse(runStartedAt) + index * 1_000 + 500).toISOString();
  const identity = {
    executable: process.execPath,
    argv: ["fixture", id],
    cwd: root,
    env: { FIXTURE: id },
  };
  return {
    id,
    role,
    ...identity,
    identitySha256: commandIdentityDigest(runId, authoritySha256, identity),
    startedAt,
    finishedAt,
    expectedExitCode: id.startsWith("negative-") ? 1 : 0,
    exitCode: id.startsWith("negative-") ? 1 : 0,
    timedOut: false,
    stdoutSha256: "0".repeat(64),
    stderrSha256: "0".repeat(64),
    report: selectors.length
      ? {
          format: id === "km-integration" ? "junit" : "vitest-json",
          sha256: "0".repeat(64),
          bytes: 1,
          passed: selectors.length,
          failed: 0,
          skipped: 0,
          selectors,
        }
      : null,
  };
}

function validCandidate(options: { kmHead?: string } = {}): CandidateLedger {
  const authority = fixtureAuthority(options.kmHead);
  const authoritySha256 = authorityDigest(authority);
  const acceptanceIds = ["discord", "slack", "km-integration", "package"];
  const commands = acceptanceIds.map((id, index) =>
    fixtureCommand(
      id,
      "acceptance",
      DELIBERATION_LEAVES.slice(0, 22)
        .filter((leaf) => leaf[2] === id)
        .map((leaf) => leaf[1]),
      authoritySha256,
      index,
    ),
  );
  commands.push(
    ...DELIBERATION_SUPPORT_COMMANDS.map((id, index) =>
      fixtureCommand(id, "support", [], authoritySha256, acceptanceIds.length + index),
    ),
  );
  const byId = new Map(commands.map((command) => [command.id, command]));
  return {
    schemaVersion: 1,
    kind: "candidate",
    runId,
    runStartedAt,
    candidateCreatedAt,
    authority,
    authoritySha256,
    commands,
    leaves: DELIBERATION_LEAVES.slice(0, 22).map(([id, selector, commandId]) => ({
      id,
      selector,
      commandId,
      status: "Green",
      observedAt: byId.get(commandId)!.finishedAt,
    })),
  };
}

function bindCandidateToCurrentCheckout(candidate: CandidateLedger): void {
  const revisionResult = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  if (revisionResult.status !== 0) {
    throw new Error(`unable to resolve test revision: ${revisionResult.stderr}`);
  }
  candidate.authority.openclaw.root = process.cwd();
  candidate.authority.openclaw.revision = revisionResult.stdout.trim();
  candidate.authoritySha256 = authorityDigest(candidate.authority);
  for (const command of candidate.commands) {
    command.identitySha256 = commandIdentityDigest(runId, candidate.authoritySha256, command);
  }
}

function context(now = "2026-08-23T12:10:01.000Z") {
  return { runId, now: new Date(now), openclawRoot: root, openclawRevision: revision };
}

function validFinal(): FinalLedger {
  const candidate = validCandidate();
  const integrity = fixtureCommand(
    "integrity",
    "acceptance",
    [DELIBERATION_LEAVES[22][1]],
    candidate.authoritySha256,
    candidate.commands.length + 1,
  );
  integrity.startedAt = "2026-08-23T12:10:01.100Z";
  integrity.finishedAt = "2026-08-23T12:10:01.500Z";
  return {
    schemaVersion: 1,
    kind: "final",
    runId,
    runStartedAt,
    candidateCreatedAt,
    candidateSha256: candidateDigest(candidate),
    finalizedAt: "2026-08-23T12:10:02.000Z",
    authority: candidate.authority,
    authoritySha256: candidate.authoritySha256,
    commands: [...candidate.commands, integrity],
    leaves: [
      ...candidate.leaves,
      {
        id: DELIBERATION_LEAVES[22][0],
        selector: DELIBERATION_LEAVES[22][1],
        commandId: DELIBERATION_LEAVES[22][2],
        status: "Green",
        observedAt: integrity.finishedAt,
      },
    ],
  };
}

it("accepts moving KM HEAD when all authoritative hashes match", () => {
  const kmHead = "a".repeat(40);
  expect(validateCandidateLedger(validCandidate({ kmHead }), context()).authority.km.head).toBe(
    kmHead,
  );
});

it("rejects a live execution environment before running children", () => {
  expect(() => assertNoLiveEnvironment({ OPENCLAW_LIVE_TEST: "1" })).toThrow(
    "live execution environment",
  );
});

it("omits inherited provider credentials from the recorded child environment", () => {
  const child = buildSanitizedChildEnvironment(
    {
      PATH: "/usr/bin",
      OPENAI_API_KEY: "not-a-real-key",
      AWS_SECRET_ACCESS_KEY: "not-a-real-secret",
    },
    { HOME: "/tmp/gate-home", OPENCLAW_STATE_DIR: "/tmp/gate-state" },
    { OPENCLAW_TEST_TOKEN: "test-only" },
  );
  expect(child).toEqual({
    PATH: "/usr/bin",
    HOME: "/tmp/gate-home",
    OPENCLAW_STATE_DIR: "/tmp/gate-state",
    OPENCLAW_TEST_TOKEN: "test-only",
  });
});

it.each([
  {
    name: "missing",
    input: () => {
      const candidate = validCandidate();
      candidate.leaves.pop();
      return JSON.stringify(candidate);
    },
    diagnostic: "missing leaf OR-22",
  },
  {
    name: "duplicate",
    input: () => {
      const candidate = validCandidate();
      candidate.leaves.push(candidate.leaves[0]);
      return JSON.stringify(candidate);
    },
    diagnostic: "duplicate leaf OR-01",
  },
  {
    name: "stale",
    input: () => JSON.stringify(validCandidate()),
    diagnostic: "candidate is stale",
  },
  {
    name: "malformed",
    input: () => "{",
    diagnostic: "JSON",
  },
])("verify fails closed for $name input", ({ name, input, diagnostic }) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "deliberation-gate-negative-"));
  try {
    const inputPath = path.join(tempRoot, `${name}.json`);
    const output = path.join(tempRoot, "result.json");
    const contents = input();
    if (name === "stale") {
      const candidate = JSON.parse(contents) as CandidateLedger;
      bindCandidateToCurrentCheckout(candidate);
      candidate.candidateCreatedAt = "2020-01-01T00:00:00.000Z";
      fs.writeFileSync(inputPath, JSON.stringify(candidate));
    } else {
      fs.writeFileSync(inputPath, contents);
    }

    const result = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "scripts/deliberation-full-gate.ts",
        "verify",
        "--input",
        inputPath,
        "--output",
        output,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr.length).toBeLessThanOrEqual(4_000);
    expect(result.stderr).toContain(diagnostic);
    expect(fs.existsSync(output)).toBe(false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

it("normalizes nested Vitest names to exact leaf titles", () => {
  const report = parseVitestJsonReport(
    Buffer.from(
      JSON.stringify({
        testResults: [
          {
            assertionResults: [
              {
                title: "OR-01 exclusive-owner-before-ordinary-side-effects",
                fullName:
                  "Discord deliberation owner path OR-01 exclusive-owner-before-ordinary-side-effects",
                status: "passed",
              },
            ],
          },
        ],
      }),
    ),
  );
  expect(report.selectors).toEqual(["OR-01 exclusive-owner-before-ordinary-side-effects"]);
});

it("keeps only passed JUnit testcase selectors", () => {
  const report = parseJunitReport(
    Buffer.from(`<?xml version="1.0"?>
      <testsuites><testsuite name="support OR-99 parent">
        <testcase name="OR-07 authenticated-event-creates-one-record"></testcase>
        <testcase name="OR-08 skipped"><skipped/></testcase>
        <testcase name="OR-09 failed"><failure>no</failure></testcase>
        <testcase name="support self closing"/>
      </testsuite></testsuites>`),
  );
  expect(report).toMatchObject({ passed: 2, failed: 1, skipped: 1 });
  expect(report.selectors).toEqual([
    "OR-07 authenticated-event-creates-one-record",
    "support self closing",
  ]);
});

it("accepts only the exact fresh 22-row candidate", () => {
  expect(validateCandidateLedger(validCandidate(), context()).leaves).toHaveLength(22);
});

it("accepts only the exact 23-row final ledger bound to its candidate", () => {
  expect(
    validateFinalLedger(validFinal(), context("2026-08-23T12:10:03.000Z")).leaves,
  ).toHaveLength(23);
});

it("rejects unknown fields", () => {
  const candidate = validCandidate() as CandidateLedger & { unexpected?: boolean };
  candidate.unexpected = true;
  expect(() => validateCandidateLedger(candidate, context())).toThrow("Unrecognized key");
});

it("rejects a final ledger whose candidate evidence changed", () => {
  const final = validFinal();
  final.leaves[10].observedAt = final.commands[0].finishedAt;
  expect(() => validateFinalLedger(final, context())).toThrow();
});

it("rejects duplicate reporter results", () => {
  const candidate = validCandidate();
  const command = candidate.commands.find(({ id }) => id === "km-integration");
  command!.report!.selectors.push(DELIBERATION_LEAVES[6][1]);
  expect(() => validateCandidateLedger(candidate, context())).toThrow(
    "exactly one reporter result",
  );
});

it("allows expected skips in supporting suites without skipping an OR leaf", () => {
  const candidate = validCandidate();
  const support = candidate.commands.find(({ id }) => id === "focused-deliberation");
  support!.report = {
    format: "vitest-json",
    sha256: "0".repeat(64),
    bytes: 1,
    passed: 1,
    failed: 0,
    skipped: 1,
    selectors: ["supporting test"],
  };
  expect(validateCandidateLedger(candidate, context()).leaves).toHaveLength(22);
});

it.each([
  ["duplicate", (value: CandidateLedger) => value.leaves.push(value.leaves[6])],
  ["skipped", (value: CandidateLedger) => (value.leaves[11].status = "Skipped")],
  ["red", (value: CandidateLedger) => (value.leaves[15].status = "Red")],
  ["contradictory", (value: CandidateLedger) => (value.commands[0].exitCode = 1)],
  [
    "wrong authority",
    (value: CandidateLedger) => (value.authority.km.files[0].sha256 = "f".repeat(64)),
  ],
])("rejects %s candidate evidence", (_name, mutate) => {
  const candidate = validCandidate();
  mutate(candidate);
  expect(() => validateCandidateLedger(candidate, context())).toThrow();
});

it("rejects stale candidate evidence", () => {
  expect(() =>
    validateCandidateLedger(validCandidate(), context("2026-08-24T12:10:01.000Z")),
  ).toThrow("candidate is stale");
});

it("rejects stale final evidence", () => {
  expect(() => validateFinalLedger(validFinal(), context("2026-08-24T12:10:02.000Z"))).toThrow(
    "final ledger is stale",
  );
});

it("rejects a fresh finalization around stale candidate evidence", () => {
  const final = validFinal();
  const integrity = final.commands.find(({ id }) => id === "integrity")!;
  integrity.startedAt = "2026-08-24T12:10:01.100Z";
  integrity.finishedAt = "2026-08-24T12:10:01.500Z";
  final.leaves[22].observedAt = integrity.finishedAt;
  final.finalizedAt = "2026-08-24T12:10:02.000Z";
  expect(() => validateFinalLedger(final, context("2026-08-24T12:10:03.000Z"))).toThrow(
    "candidate is stale",
  );
});

it("refuses to overwrite an existing ledger", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "deliberation-gate-overwrite-"));
  const output = path.join(directory, "ledger.json");
  try {
    fs.writeFileSync(output, "sentinel\n");
    expect(() => writeLedgerExclusive(output, validCandidate())).toThrow("refusing to overwrite");
    expect(fs.readFileSync(output, "utf8")).toBe("sentinel\n");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

it.runIf(Boolean(process.env.OPENCLAW_DELIBERATION_GATE_CANDIDATE))(
  "OR-23 full-gate-integrity",
  () => {
    const candidatePath = process.env.OPENCLAW_DELIBERATION_GATE_CANDIDATE;
    const expectedRunId = process.env.OPENCLAW_DELIBERATION_GATE_RUN_ID;
    const expectedRevision = process.env.OPENCLAW_DELIBERATION_GATE_REVISION;
    if (!candidatePath || !expectedRunId || !expectedRevision) {
      throw new Error("canonical gate candidate context is required");
    }
    const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8")) as unknown;
    const validated = validateCandidateLedger(candidate, {
      runId: expectedRunId,
      now: new Date(),
      openclawRoot: process.cwd(),
      openclawRevision: expectedRevision,
    });
    expect(validated.leaves.map((leaf) => leaf.id)).toEqual(
      DELIBERATION_LEAVES.slice(0, 22).map((leaf) => leaf[0]),
    );
  },
);
