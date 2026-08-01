# Plan 2026-08-01: Converge Deliberation v2 wire contract

Plan the remaining contract, test, provenance, and documentation work without repeating the parent task's completed verification.

_Status: DRAFT_
_Created: 2026-08-01_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- `extensions/deliberation/src/km-client.ts` still sends `x-deliberation-protocol: v1` and exposes `/control`, `/deliveries`, and `/attempts` operations; its callers in `intake.ts`, `poll-service.ts`, `final-send.ts`, and `index.ts` encode the same retired shapes.
- `extensions/deliberation/src/{km-client,contract,hooks,poll-service,final-send,plugin}.test.ts` assert retired headers, controls, records, attempts, and completion outcomes.
- `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1}.json` and `provenance.json` contain retired summaries and hashes rather than the task-pinned KM artifacts.
- `docs/plugins/reference/deliberation.md` documents the retired header, control mutation commands, and attempt-path reconciliation.
- The plugin and docs are untracked preserved work; implementation must edit them in place and leave unrelated untracked files untouched.
- No genuine historical RED covers the exact canonical header plus `/reservations`; `plans/checkpoints/bold-dune-2799.red-green-proof.md` is an intake-path RED for the retired header and is not applicable.

### Relevant documentation

- `plans/tasks/2026-07-31_deliberation-v2-converge-fork-wire-contract-on-km-authority.md` pins the KM source paths, hashes, exact header, six routes, and four controls.
- `plans/tasks/2026-07-31_followup-cool-brook-7690-deliberation-v2-converge-fork-wire-contract-on-km-authority.md` requires implementation plus run-scoped RED/GREEN evidence and marks broad verification already complete.
- `extensions/AGENTS.md` keeps all production changes inside the plugin SDK boundary; `docs/AGENTS.md` governs the public reference page.
- `pnpm docs:list` identifies `docs/plugins/reference/deliberation.md` as the relevant plugin reference; no relevant PlantUML diagram exists.

### Knowledge base

- The KM artifacts are the only protocol authority; verify their pinned hashes before deriving request/response types or fixtures.
- An acceptance repair must deliver against immutable authority and capture assertion-level RED/GREEN evidence; another blocked-only checkpoint does not satisfy this follow-up.
- The pinned ready/reservation responses do not carry an authorized Discord account and target. Do not infer a route, choose a default source, or add intake-side state; remove outbound activation until KM publishes that authority.
- Literal residue is only the final inventory check. Also remove registrations and callers that can still activate retired behavior.
- The working tree is untracked, so final evidence must inventory actual plugin/docs files; `git diff` alone is insufficient.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent. Applied `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`, `learnings/architecture/2026-07-31_authoritative-delivery-contract-must-carry-destination.md`, `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`, `learnings/test-failures/acceptance-tdd-requires-assertion-level-red.md`, and `learnings/tooling/warm-fork-8996-task-scoped-evidence-must-include-untracked-files.md`.

## Available Skills

- `tdd`: capture the required genuine focused RED and fresh GREEN.
- `openclaw-testing`: choose focused repository-safe verification commands.
- `technical-documentation`: align the public plugin reference with the canonical contract.
- `autoreview`: perform the mandatory fresh pre-handoff review after implementation.
- `save-learning`: record implementation findings as the final action.

## Solution

Replace the repository-local summaries with the pinned KM artifacts and rebuild `km-client.ts` around one header and exactly six operations. Update intake and read-only health callers, remove HTTP control mutation/reconciliation facades that cannot construct canonical bodies, and stop registering the outbound worker because the pinned contract cannot safely identify a configured Discord route.

Keep fail-closed source silence and guards unchanged. Do not add compatibility paths, route inference, local delivery state, new config, or a second sender implementation.

## Implementation

1. Verify the KM `contract.json` and `fixtures.json` bytes against the task-pinned SHA-256 values, mirror them into `extensions/deliberation/contracts/`, and update `provenance.json` with owner-identifiable source paths and hashes.
2. With `skill:tdd`, replace the retired wire assertion in `km-client.test.ts` with the focused test below and capture a genuine RED in `plans/checkpoints/cool-brook-7690.red-green-proof.md` before product edits. Do not cite the unrelated `bold-dune-2799` intake RED as proof.
3. Rewrite `km-client.ts` from the mirrored closed schemas: send `X-Deliberation-Protocol-Version: 1`; expose only health, ready, intake, reservations, completions, and reconciliations; parse `protocolVersion`; use fixture-exact bodies/results/status codes; and map canonical conflicts without aliases or fallback routes.
4. Expand `contract.test.ts` and `km-client.test.ts` to assert both artifact hashes, the exact six method/path pairs, four KM-owned controls, exact fixture-backed bodies/responses, malformed-response rejection, and canonical conflict handling.
5. Change `intake.ts` and `hooks.test.ts` to emit the fixture-exact closed intake body from inbound Discord fields while preserving non-claiming intake, processing-route exclusion, and independent source silence.
6. Delete `poll-service.ts`, `final-send.ts`, and their tests, remove service registration from `index.ts`, and update `sole-send.test.ts` to prove the plugin has no active durable sender. This closes the destination-authority gap without blocking wire convergence or inventing a route.
7. Reduce `index.ts` and `plugin.test.ts` to fail-closed hooks plus read-only health/status backed by `/health`; remove control/synthetic mutations and the underspecified reconciliation CLI/Gateway facade. KM owner tooling remains the only control authority.
8. Rewrite `docs/plugins/reference/deliberation.md` with `skill:technical-documentation`: list the canonical header, six routes, and four controls; state that controls are KM-owned; document fail-closed intake and the intentionally inactive sender pending destination-bearing KM authority; remove retired command and reconciliation examples.
9. Run focused verification, the exact residue scan, `git diff --check`, and `skill:autoreview`; fix actionable findings and inventory every untracked plugin/docs/proof file in the final checkpoint. Do not rerun unrelated completed acceptance work, commit, or push.

## Files to Modify

| File                                                            | Change                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `extensions/deliberation/contracts/km-wire-v1.json`             | Mirror pinned canonical contract bytes                            |
| `extensions/deliberation/contracts/cutover-controls-v1.json`    | Mirror pinned canonical fixtures bytes                            |
| `extensions/deliberation/contracts/provenance.json`             | Record canonical owner paths and hashes                           |
| `extensions/deliberation/src/contract.test.ts`                  | Assert hashes, six routes, header, controls, and closed authority |
| `extensions/deliberation/src/km-client.ts`                      | Implement only the six canonical operations                       |
| `extensions/deliberation/src/km-client.test.ts`                 | Add focused RED/GREEN and fixture-backed wire coverage            |
| `extensions/deliberation/src/intake.ts`                         | Emit the canonical closed intake body                             |
| `extensions/deliberation/src/hooks.test.ts`                     | Assert exact intake mapping and retained silence                  |
| `extensions/deliberation/index.ts`                              | Remove sender and mutation facades; retain read-only health       |
| `extensions/deliberation/src/plugin.test.ts`                    | Assert the reduced canonical registration surface                 |
| `extensions/deliberation/src/sole-send.test.ts`                 | Assert no active durable sender remains                           |
| `extensions/deliberation/src/{poll-service,final-send}.ts`      | Delete unsafe destination-dependent sender path                   |
| `extensions/deliberation/src/{poll-service,final-send}.test.ts` | Delete tests for the retired sender contract                      |
| `docs/plugins/reference/deliberation.md`                        | Document canonical wire and safe inactive-sender state            |
| `plans/checkpoints/cool-brook-7690.red-green-proof.md`          | Capture genuine focused RED and fresh GREEN                       |

## TDD

Implement the cycle with `skill:tdd`; write evidence to `plans/checkpoints/cool-brook-7690.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/km-client.test.ts`  
**Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`  
**Edit:** replace the current intake header/path test before changing `km-client.ts`.

```ts
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient } from "./km-client.js";

it("uses the canonical protocol header and reservations route", async () => {
  const fetchImpl = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ outcome: "conflict" }), { status: 200 }));
  const client = createKmClient({
    config: parseDeliberationConfig({
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
    }),
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

  expect.soft(fetchImpl.mock.calls[0]?.[0]).toBe("https://km.invalid/deliberation/v1/reservations");
  expect.soft(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
    "X-Deliberation-Protocol-Version": "1",
  });
});
```

| Phase | Expected result                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| RED   | Existing client calls the delivery-specific reserve URL and sends the retired header, so both soft assertions fail. |
| GREEN | Rewritten client calls `/deliberation/v1/reservations` and sends header value `1`.                                  |

### Verification

1. `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
2. `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
3. `pnpm lint:docs docs/plugins/reference/deliberation.md`
4. `rg -n 'x-deliberation-protocol|/deliveries|/attempts|/control' extensions/deliberation docs/plugins/reference/deliberation.md` must exit `1` with no output.
5. `git diff --check`
6. `git status --short -- extensions/deliberation docs/plugins/reference/deliberation.md plans/checkpoints/cool-brook-7690.red-green-proof.md` must inventory the complete stageable repair.

## Dependencies

- Read access to `~/.openclaw/workspace/km-system/contracts/deliberation-v2/v1/{contract,fixtures}.json`; hashes must match `e1f3ed030d69f24b7117ca55edb7aa63fd18152b515fa9e047404d495306aebf` and `1f62540db97714cfe2cca72b25f2e2c7bd50200284557595991f8c357c85b9c1`.
- No KM schema revision is required for this repair because outbound activation is removed rather than guessed; reactivation requires a later immutable destination-bearing KM contract.
- No new package, config surface, compatibility layer, commit, or push.
