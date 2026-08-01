# Plan 2026-08-01: Deliver the Preserved Deliberation Wire Repair

Expose the already-correct Deliberation implementation and docs in the task-scoped diff, then attach fresh verification to the genuine parent RED.

## Analysis

- `extensions/deliberation/` and `docs/plugins/reference/deliberation.md` are complete but untracked, so plain `git diff` omitted them from `cool-brook-7690` acceptance.
- `extensions/deliberation/src/km-client.ts` sends `X-Deliberation-Protocol-Version: 1` and calls only health, ready, intake, reservations, completions, and reconciliations.
- The KM source artifacts and repository mirrors match SHA-256 `e1f3ed030d69f24b7117ca55edb7aa63fd18152b515fa9e047404d495306aebf` and `1f62540db97714cfe2cca72b25f2e2c7bd50200284557595991f8c357c85b9c1`.
- The current retired-wire scan is empty. `docs/plugins/reference/deliberation.md` already documents the canonical header, six routes, KM-owned controls, and inactive sender.
- `plans/checkpoints/cool-brook-7690.red-green-proof.md` contains the genuine assertion-level RED and parent GREEN. Do not recreate RED after implementation exists.
- No PlantUML diagram applies. Follow `extensions/AGENTS.md` for plugin boundaries and `docs/AGENTS.md` for the Mintlify page.

## Knowledge Base

- `learnings/tooling/2026-07-24_acceptance-retries-need-inspectable-parent-diffs.md`: expose preserved source/test hunks, checksum them, link historical RED, and capture fresh retry GREEN.
- `learnings/tooling/warm-fork-8996-task-scoped-evidence-must-include-untracked-files.md`: checkpoint prose and passing tests cannot replace omitted untracked source.
- `learnings/architecture/cool-brook-7690-canonical-wire-convergence.md`: keep mirrors hash-pinned, parsers closed, scans precise, and outbound activation removed while destination authority is absent.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: verify registrations and callers as well as literal residue.
- Recall used local fallback because QMD collection `openclaw-fork-learnings` was absent; unrelated empty auto-extracted results do not affect this plan.

## Available Skills

- `tdd`: record parent RED provenance and fresh follow-up GREEN.
- `openclaw-testing`: run the narrow extension proof before broader required gates.
- `technical-documentation`: review the existing public reference without rewriting it unnecessarily.
- `autoreview`: perform the mandatory final implementation review.
- `save-learning`: run last after implementation and verification.

## Implementation

1. Recheck the two KM source hashes against `extensions/deliberation/contracts/{km-wire-v1,cutover-controls-v1}.json`; stop instead of editing if authority drifted.
2. Inventory all files under `extensions/deliberation/`, `docs/plugins/reference/deliberation.md`, and the parent proof. Preserve their content unless focused verification finds a concrete defect.
3. Mark only that bounded inventory intent-to-add with `git add -N` so the actual implementation, tests, contract mirrors, and docs appear in the caller-supplied task diff; do not stage or alter unrelated worktree files.
4. Generate `plans/checkpoints/quick-cove-7094.source-and-tests.diff` from the bounded visible diff. Verify its path inventory, reverse applicability, absence of truncation markers, and SHA-256 checksum.
5. Create `plans/checkpoints/quick-cove-7094.red-green-proof.md`: link the exact RED command/output in `plans/checkpoints/cool-brook-7690.red-green-proof.md`, then append fresh GREEN output under task `quick-cove-7094`.
6. Create `plans/checkpoints/quick-cove-7094.acceptance-evidence.md` mapping the canonical header, six endpoints, closed contract tests, retired sender removal, and docs claims to visible source-diff hunks. Include the raw diff artifact checksum and exact command outcomes.
7. Update `plans/checkpoints/quick-cove-7094.checkpoint.md` with the bounded file inventory and evidence links, then mark the new task evidence files intent-to-add too. Confirm `git diff -- extensions/deliberation docs/plugins/reference/deliberation.md` contains source/docs additions, not only evidence prose.
8. Run the focused and required broader checks below. Fix only defects in the bounded Deliberation surface, then regenerate and revalidate the diff/evidence artifacts.
9. Run `skill:autoreview` until no accepted actionable finding remains. Run `skill:save-learning` as the final action; do not commit or push.

## Files to Modify

| Path                                                       | Action                                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `extensions/deliberation/**`                               | Preserve and expose the complete canonical plugin, mirrors, and tests in the task-scoped diff; edit only for a verified defect |
| `docs/plugins/reference/deliberation.md`                   | Preserve and expose the canonical public reference; edit only if source review finds drift                                     |
| `plans/checkpoints/quick-cove-7094.source-and-tests.diff`  | Add the bounded raw implementation/test/docs diff                                                                              |
| `plans/checkpoints/quick-cove-7094.red-green-proof.md`     | Link parent RED and capture fresh follow-up GREEN                                                                              |
| `plans/checkpoints/quick-cove-7094.acceptance-evidence.md` | Map acceptance claims to inspectable hunks and checksums                                                                       |
| `plans/checkpoints/quick-cove-7094.checkpoint.md`          | Record completion state and exact bounded inventory                                                                            |

## TDD

Implement evidence capture with `skill:tdd`. Do not manufacture a new RED; reuse the genuine parent failure at `plans/checkpoints/cool-brook-7690.red-green-proof.md:5-77`.

- **Test file:** `extensions/deliberation/src/km-client.test.ts`
- **Run command:** `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`

**Existing historical RED case:**

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
const readyItem = {
  recordId: "record-1",
  version: 7,
  text: "reviewed reply",
  candidateRevision: 1,
  updatedAt: "2026-07-31T12:00:00Z",
};

it("uses the canonical protocol header and reservations route", async () => {
  const fetchImpl = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        protocolVersion: 1,
        error: { code: "CAS_CONFLICT", message: "record version changed" },
      }),
      { status: 409 },
    ),
  );
  const client = createKmClient({
    config,
    openclawConfig: {} as never,
    fetchImpl,
    env: { KM_TOKEN: "test-only" },
  });

  await client.reserve(readyItem, "sender-1");

  expect.soft(fetchImpl.mock.calls[0]?.[0]).toBe("https://km.invalid/deliberation/v1/reservations");
  expect.soft(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
    "X-Deliberation-Protocol-Version": "1",
  });
});
```

| Phase           | Required evidence                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Historical RED  | Parent proof shows `/deliveries/undefined/reserve` and `x-deliberation-protocol: v1`, exit 1     |
| Follow-up GREEN | Same existing test passes against the preserved client, exit 0, recorded under `quick-cove-7094` |

## Verification

1. `node scripts/run-vitest.mjs extensions/deliberation/src/km-client.test.ts --reporter=verbose`
2. `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose`
3. `pnpm build`
4. `pnpm docs:list`
5. `pnpm lint:docs docs/plugins/reference/deliberation.md`
6. `pnpm docs:check-mdx`
7. `rg -n 'x-deliberation-protocol|"/deliveries"|"/attempts"|"/control"' extensions/deliberation docs/plugins/reference/deliberation.md` must exit 1 with no output.
8. `git apply --check --reverse plans/checkpoints/quick-cove-7094.source-and-tests.diff`
9. `git diff --check -- extensions/deliberation docs/plugins/reference/deliberation.md plans/checkpoints/quick-cove-7094.*`
10. `git status --short -- extensions/deliberation docs/plugins/reference/deliberation.md plans/checkpoints/quick-cove-7094.*` must show the complete bounded repair and no unrelated paths.

## Dependencies

- Read access to the task-pinned KM artifacts is required only for hash verification; repository mirrors provide the inspectable contract bytes.
- No new package, config surface, compatibility path, source rewrite, commit, or push is planned.

_Status: DRAFT_
