# Plan 2026-07-28: Deliberation v2 acceptance repair

Identify the smallest remaining implementation and evidence gaps in the preserved Deliberation v2 work, then close only those gaps.

_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- The full `extensions/deliberation/` package, fixtures, four hooks, worker, send adapter, controls, tests, docs, lockfile, and loader coverage exist in the current worktree, but the package and key evidence files are untracked. Plain/task-attributed `git diff` therefore exposed only `.github/labeler.yml` to acceptance.
- Existing tests cover registration and selected config, hook, guard, and send outcomes. Direct KM-client, poll-loop/CAS/restart, controls/health, redaction, route matrix, and comprehensive delivery recovery tests are absent.
- `extensions/deliberation/contracts/provenance.json` self-identifies `cool-vale-5964` as accepter; adjacent hashes prove local integrity only. The summaries omit authoritative request/response schemas, conflict/lease/CAS semantics, recovery fixtures, and owner provenance required by the original gate.

### Relevant documentation

- `plans/2026-07-28_dark-crag-0344_deliberation-v2-plugin-consuming-the-accepted-km-wire.md` defines the canonical contract gate, behavior groups, and verification surface.
- `docs/plugins/reference/deliberation.md` documents strict SecretRef setup, controls, terminal silence, and bounded single-call delivery; tests and implementation must substantiate each claim.
- `docs/reference/test.md` and `docs/ci.md` require narrow Vitest proof first, then changed lanes/build for plugin/package surfaces.

### Knowledge base

- `learnings/architecture/bright-wave-6041-external-authority-contracts-must-precede-plugin-implementation.md`: do not test an implementer-invented KM API; require authoritative schemas and conflict/recovery semantics.
- `learnings/architecture/cool-vale-5964-canonical-delivery-recovery.md`: `NOT_SENT` reconciliation only requeues; every later send must pass through the normal control-aware reservation path with a fresh attempt ID.
- Recall used deterministic local fallback because collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: preserve the historical registration RED and capture new assertion-level cycles plus fresh GREEN proof under `warm-fork-8996`.
- `task-evidence`: extract exact historical command/outcome provenance instead of reconstructing it.
- `openclaw-testing`: choose focused extension, loader, SecretRef, build, and changed-gate proof.
- `autoreview`, `validate-implementation`, `save-learning`: mandatory closeout; run `save-learning` last.

## Implementation

1. Obtain the KM-owner-approved wire/control bundle with immutable provenance, complete request/response/error schemas, cursor/lease/CAS rules, receipt/correlation fields, stale-attempt recovery, control transitions, and `NOT_SENT` fixtures. Replace the self-accepted summaries and regenerate `provenance.json`; stop with a checkpoint if authority or semantics remain missing.
2. Preserve the existing package and historical registration RED. Use `skill:tdd` to add assertion-level RED cycles only for behavior not yet implemented or proved: strict contract/config parsing, KM transport/redaction, fail-closed intake and all guards, serialized worker races/restart/reconciliation, complete durable-send outcomes, controls/health, and dynamic sole-send ownership.
3. Repair production code against the accepted fixtures: enforce canonical route IDs and closed schemas; map transport/CAS variants; keep errors payload-free; serialize list/reread/reserve work; route reconciliation through a fresh reservation; preserve all accepted delivery metadata; and register real health diagnostics if the accepted control contract requires them.
4. Expand tests with fixture-driven HTTP cases, route matrices, every intake/guard outcome, non-overlap and two-worker CAS races, restart/completion recovery, partial/unknown non-replay, fresh-attempt reconciliation, Gateway/CLI controls, redaction, and a recursive sole-send scan. Keep all network/provider sends mocked.
5. Regenerate inventory/reference and SecretRef surfaces, verify `.github/labeler.yml`, and create the missing `extensions: deliberation` repository label only through the explicit maintainer workflow.
6. Run focused GREEN per behavior group, then the plugin, loader, SecretRef, hook/outbound regression, type, inventory, build, and changed gates. Run `git diff --check`, fresh `skill:autoreview` until clean, then `skill:validate-implementation`.
7. Write `plans/checkpoints/warm-fork-8996.{checkpoint,red-green-proof}.md` with links to `cool-vale-5964.red-green-proof.md`, exact commands/outcomes, and any blocked broad gate. Before acceptance, verify the task-scoped payload contains every new plugin, contract, test, docs, and evidence file; do not rely on plain `git diff` omitting untracked files. Run `skill:save-learning` last.

## Files to Modify

| Path                                                                                                  | Change                                                                                      |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `extensions/deliberation/contracts/*.json`                                                            | Replace self-authored summaries with authoritative, complete fixtures and provenance.       |
| `extensions/deliberation/src/{config,route-match,km-client,intake,guards,poll-service,final-send}.ts` | Make only fixture- and failing-test-driven repairs.                                         |
| `extensions/deliberation/index.ts`, `extensions/deliberation/openclaw.plugin.json`                    | Align controls, health, config metadata, and registration with accepted contracts.          |
| `extensions/deliberation/src/*.test.ts`                                                               | Add missing contract, route, KM, worker, recovery, control, redaction, and ownership proof. |
| `src/plugins/source-checkout-runtime.test.ts`                                                         | Retain loader-backed exact registration proof.                                              |
| `docs/plugins/**`, `docs/reference/secretref-*`, `.github/labeler.yml`, `pnpm-lock.yaml`              | Regenerate and verify repository integration surfaces.                                      |
| `plans/checkpoints/warm-fork-8996.{checkpoint,red-green-proof}.md`                                    | Record provenance, fresh proof, task-scoped file inventory, and gaps.                       |

## TDD

Implementace TDD cyklu dle skill:tdd. Reuse the genuine registration RED at `plans/checkpoints/cool-vale-5964.red-green-proof.md`; never manufacture a post-implementation RED for preserved behavior. Capture a new RED only when a newly added assertion fails current code, then its matching GREEN in `plans/checkpoints/warm-fork-8996.red-green-proof.md`.

**Initial test file:** `extensions/deliberation/src/km-client.test.ts` (new)  
**Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`

```ts
import { describe, expect, it, vi } from "vitest";
import { parseDeliberationConfig } from "./config.js";
import { createKmClient } from "./km-client.js";

describe("KM contract parsing", () => {
  it("rejects control responses outside the accepted closed schema", async () => {
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
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          intakeEnabled: true,
          senderEnabled: true,
          safeSilence: false,
          unexpected: true,
        }),
        { status: 200 },
      ),
    );
    const client = createKmClient({
      config,
      openclawConfig: {} as never,
      fetchImpl,
      env: { KM_TOKEN: "test-only" },
    });

    await expect(client.controls()).rejects.toThrow("invalid control response");
    // RED: the current parser silently accepts unknown response fields.
  });
});
```

| Test                  | RED                                        | GREEN                                                    |
| --------------------- | ------------------------------------------ | -------------------------------------------------------- |
| Closed control schema | `controls()` resolves despite `unexpected` | Response is rejected without exposing body or credential |

Add separate helper-captured cycles before each other missing behavior slice. After those cycles, capture fresh GREEN for all preserved tests without labeling it new RED provenance.

### Verification

```bash
node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose
node scripts/run-vitest.mjs src/plugins/source-checkout-runtime.test.ts src/secrets/runtime-config-collectors-plugins.bundled.test.ts src/secrets/target-registry.docs.test.ts --reporter=verbose
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/wired-hooks-message.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm tsgo:extensions
pnpm tsgo:extensions:test
pnpm plugins:inventory:check
pnpm build
pnpm check:changed
git diff --check
```

## Dependencies

- Blocking: authoritative KM-owner fixtures and approval provenance. A task-authored hash manifest is not acceptance evidence.
- Preserve the current dirty worktree and modify only Deliberation-owned/integration files; do not absorb unrelated changes.
- No live KM credential, Discord traffic, source activation, or provider send is required; all behavioral proof remains deterministic and mocked.

---

_Created: 2026-07-28_
_Status: DRAFT_
