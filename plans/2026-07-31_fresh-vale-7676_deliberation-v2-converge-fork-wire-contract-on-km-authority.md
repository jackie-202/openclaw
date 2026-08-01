# Plan 2026-07-31: Deliberation v2 KM wire convergence

_Status: DRAFT_
_Created: 2026-07-31_

## Progress

- [x] Phase 0: Config + init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/km-client.ts` owns HTTP headers, paths, request/response parsing, and currently exposes retired control, delivery, attempt, and reconciliation shapes.
- `extensions/deliberation/src/intake.ts` builds a nested intake payload that does not satisfy KM's closed `intakeBody` schema.
- `extensions/deliberation/src/poll-service.ts` gates on retired control fields and composes list, reservation, send, and completion.
- `extensions/deliberation/src/final-send.ts` requires a KM attempt carrying Discord account, target, and payload, then emits non-canonical completion outcomes.
- `extensions/deliberation/index.ts` exposes retired HTTP control mutations and an underspecified reconciliation command.
- `extensions/deliberation/src/{km-client,poll-service,final-send,hooks,plugin}.test.ts` encode the retired client and caller contracts; `contract.test.ts` only rejects an older alias and does not enforce the KM authority.
- The entire plugin and docs page are untracked. Implementation must preserve unrelated work and finish with every intended plugin/docs file visible in `git status` and no generated or retired leftovers.

### Relevant documentation

- KM `contract.json`, SHA-256 `e1f3ed030d69f24b7117ca55edb7aa63fd18152b515fa9e047404d495306aebf`, is the immutable wire authority.
- KM `fixtures.json`, SHA-256 `1f62540db97714cfe2cca72b25f2e2c7bd50200284557595991f8c357c85b9c1`, supplies exact request/response and operator-control examples.
- `docs/plugins/reference/deliberation.md` must describe the canonical header, six routes, four controls, closed payloads, and KM-owned operator controls only.
- No relevant PlantUML diagram exists in the discovered surface.

### Knowledge base

- External authority must be readable and hash-verified before RED; acceptance metadata is not protocol authority.
- Version `1` is the current Deliberation v2 wire version, not retired product-v1 residue.
- Literal residue scans are necessary but caller/activation tracing decides whether executable retired behavior remains.
- A follow-up acceptance fix needs a genuine focused RED and fresh GREEN, not prior checkpoint claims.
- Do not invent missing external fields, fallback routes, compatibility shims, or a parallel state owner.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; relevant sources are `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`, `learnings/architecture/2026-07-28_wire-protocol-versions-are-not-implementation-generations.md`, `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`, and `learnings/architecture/2026-07-29_contract-gated-plans-should-name-absent-audit-artifacts.md`.

## Available Skills

- `tdd`: record the required focused RED/GREEN cycle.
- `openclaw-testing`: select and report the repository-safe verification lanes.
- `technical-documentation`: update and audit the plugin reference page.
- `autoreview`: run the mandatory fresh pre-handoff review after implementation and verification.
- `save-learning`: record implementation findings as the final action.

## Solution

Treat the KM JSON as the only authority and remove, rather than alias, the retired wire family. Before product edits, close one blocking contract gap: neither canonical `readyItem` nor `reservation` contains `sourceTarget`/Discord account, while `sendReservedAttempt` requires both and multiple configured sources prevent safe inference. KM must publish a revised immutable contract/fixture pair carrying the authorized destination in the ready/reservation flow; otherwise stop and report that a real outbound fix cannot satisfy both the pinned contract and fail-closed delivery semantics.

Do not add an in-memory map, local SQLite mapping, record-id encoding, default source, or retired response fallback. Those options create a second authority, fail after restart, or misroute messages.

## Implementation

1. Re-read and hash `contract.json` and `fixtures.json`; stop before RED if either differs from the accepted authority or if the destination gap remains unresolved.
2. Copy the accepted authority bytes into `contracts/km-wire-v1.json` and `contracts/cutover-controls-v1.json`; update `provenance.json` with source paths, verified hashes, and acceptance date. Strengthen `contract.test.ts` to hash both mirrors and assert the exact header, six endpoint set, closed schemas, and four control names.
3. Run the focused TDD test below against the unchanged client and save the failing output with `skill:tdd`.
4. Rewrite `km-client.ts` around the six canonical operations: parse `protocolVersion`, closed health/controls, ready items, reservations, and record responses; send `X-Deliberation-Protocol-Version: 1`; map 409 error codes to closed conflict/disabled results; remove HTTP control mutation and path-parameter attempt APIs.
5. Update `intake.ts` to emit canonical `provider`, `providerEventId`, `sourceTarget`, `senderId`, ISO timestamps, content, event type, and debounce fields. Add hook assertions for the exact closed payload.
6. Update `poll-service.ts` to read `controls.sender`, page `/ready`, reserve with `recordId`, version, owner, stable idempotency key, and lease duration, then carry the canonical reservation fence into completion. Preserve one sole send owner and no-send behavior when sender control is false.
7. Update `final-send.ts` to emit canonical `SENT`, `NOT_SENT`, or `DELIVERY_UNKNOWN` completion bodies with record, attempt, owner, lease token, idempotency, provider-attempt identity, receipts, and proof where required. Update its behavioral tests without retaining old outcome translations.
8. Remove retired control/synthetic gateway and CLI methods from `index.ts`; keep read-only health/status over `/health`. Require the full canonical reconciliation body in the write method/CLI, or remove that facade if the plugin cannot supply every required field without guessing. Update `plugin.test.ts` accordingly.
9. Rewrite `docs/plugins/reference/deliberation.md` with `skill:technical-documentation`: document the exact header/routes/control names, KM-owned operator controls, canonical reconciliation inputs, and fail-closed limitations; remove old HTTP control and synthetic-fixture instructions.
10. Run targeted tests, full requested verification, case-sensitive residue grep, `git diff --check`, and `skill:autoreview`. Fix all actionable findings, inspect `git status --short`, and ensure only intended plugin/docs/plan/learning files remain with all of `extensions/deliberation/` ready to stage. Do not commit or push.

## Files to Modify

| File                                                         | Change                                                           |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`          | Byte-for-byte canonical contract mirror                          |
| `extensions/deliberation/contracts/cutover-controls-v1.json` | Byte-for-byte canonical fixtures/control mirror                  |
| `extensions/deliberation/contracts/provenance.json`          | Canonical source hashes and provenance                           |
| `extensions/deliberation/src/contract.test.ts`               | Exact authority/hash/endpoint/control assertions                 |
| `extensions/deliberation/src/km-client.ts`                   | Canonical header, routes, schemas, and methods                   |
| `extensions/deliberation/src/km-client.test.ts`              | RED/GREEN wire behavior and closed-response tests                |
| `extensions/deliberation/src/intake.ts`                      | Canonical closed intake body                                     |
| `extensions/deliberation/src/hooks.test.ts`                  | Exact intake mapping coverage                                    |
| `extensions/deliberation/src/poll-service.ts`                | Health/ready/reservation/completion orchestration                |
| `extensions/deliberation/src/poll-service.test.ts`           | Canonical controls, records, reservation fence tests             |
| `extensions/deliberation/src/final-send.ts`                  | Canonical completion outcomes and proof fields                   |
| `extensions/deliberation/src/final-send.test.ts`             | Completion body and no-replay coverage                           |
| `extensions/deliberation/index.ts`                           | Remove retired controls; canonical health/reconciliation surface |
| `extensions/deliberation/src/plugin.test.ts`                 | Canonical registered surface assertions                          |
| `docs/plugins/reference/deliberation.md`                     | Canonical operator and wire documentation                        |

## TDD

Implement the cycle with `skill:tdd`; record RED and GREEN in `plans/checkpoints/fresh-vale-7676.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`  
**Edit:** replace the current retired intake-header test with this focused reservation test before changing `km-client.ts`.

```ts
import { expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient } from "./km-client.js";

const config = parseDeliberationConfig({
  enabled: true,
  failClosed: true,
  sources: [{ channel: "discord", accountId: "1", target: "2" }],
  processingSource: { channel: "discord", accountId: "1", target: "3" },
  km: {
    endpoint: "https://km.invalid",
    credential: { source: "env", provider: "default", id: "KM_TOKEN" },
    requestTimeoutMs: 1000,
    pollIntervalMs: 1000,
  },
  restrictedSessionKeys: ["agent:reviewer"],
});

it("uses the canonical protocol header and reservations route", async () => {
  const fetchImpl = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    const body = url.endsWith("/deliberation/v1/reservations")
      ? {
          protocolVersion: 1,
          reservation: {
            recordId: "record-1",
            attemptId: "attempt-1",
            ordinal: 1,
            version: 8,
            owner: "sender-1",
            leaseToken: "lease-1",
            leaseExpiresAt: "2026-07-31T12:01:00Z",
            candidateRevision: 1,
            reviewedTextHash: "a".repeat(64),
          },
        }
      : { outcome: "conflict" };
    return new Response(JSON.stringify(body), {
      status: url.includes("/reservations") ? 201 : 200,
    });
  });
  const client = createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  await client.reserve(
    {
      recordId: "record-1",
      version: 7,
      text: "reviewed reply",
      candidateRevision: 1,
      updatedAt: "2026-07-31T12:00:00Z",
    } as never,
    "sender-1",
  );

  expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://km.invalid/deliberation/v1/reservations");
  expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
    "X-Deliberation-Protocol-Version": "1",
  });
});
```

| Phase | Expected result                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| RED   | Current client calls `/deliveries/undefined/reserve` and sends no canonical header, so URL/header assertions fail. |
| GREEN | Client calls `/reservations`, sends header value `1`, and parses the canonical reservation response.               |

## Verification

1. `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
2. `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
3. `pnpm build`
4. `pnpm docs:list`
5. `pnpm lint:docs docs/plugins/reference/deliberation.md`
6. `pnpm docs:check-mdx`
7. `rg -n 'x-deliberation-protocol|/deliveries|/attempts|/control' extensions/deliberation docs/plugins/reference/deliberation.md` must exit with no matches.
8. `git diff --check` and `git status --short -- extensions/deliberation docs/plugins/reference/deliberation.md` must show a clean, stageable intended set.
9. Final note records changed files, the zero-match grep command/output, every command's exit/result, authority hashes, RED/GREEN proof path, and any blocked proof.

## Dependencies

- KM owns and must publish the immutable wire schema and fixtures; OpenClaw only mirrors and consumes them.
- Blocking input: a canonical destination/account field in the ready/reservation flow, or an explicit task-owner decision to remove outbound sending from this plugin. The current pinned authority cannot support a real multi-source sender without guessing.
- No new package, config key, compatibility path, state store, commit, or push is permitted.
