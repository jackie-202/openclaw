# Plan 2026-08-17: Deliberation deterministic cross-provider E2E acceptance fix

Add the preserved orchestration test to the task-scoped implementation evidence and capture fresh focused proof for goal-001.

## Analysis

### Codebase Context

- `extensions/deliberation/src/orchestration.test.ts` exists but is untracked, so it was absent from the rejected task-scoped diff.
- Its table-driven Slack root/reply cases already exercise registered plugin hooks, bounded root-thread history, loopback KM HTTP, and final delivery through public `openclaw/plugin-sdk/*` seams.
- The assertions already distinguish root and child `providerEventId` values from the root `threadId`, select the exact Discord account/channel/thread, send once through Discord, and never call Slack.
- `plans/checkpoints/acceptance-runs/quick-fork-8802-acceptance-001/result.json` identifies missing reviewable implementation, not a production behavior defect. Do not alter production, docs, rollout readiness, or completed lower-level coverage unless the focused test exposes a real failure.

### Knowledge Base

- `learnings/patterns/bright-reef-1988-keep-focused-orchestration-tests-complementary.md`: keep this integration test focused on cross-component wiring; do not duplicate replay and fail-closed matrices from owner-level suites.
- `learnings/architecture/2026-08-17_deliberation-readiness-separate-from-hermetic-e2e.md`: treat deterministic local E2E proof independently from Slack pilot readiness.
- `learnings/tooling/acceptance-retries-separate-inherited-work-from-target-tdd-proof.md`: separate preserved work from this follow-up's evidence and never reconstruct historical RED.
- `learnings/test-failures/quick-fork-8802-prove-replay-at-reservation-fence.md`: replay fencing is already covered elsewhere and is outside this finding.
- Recall used the deterministic local backend because QMD collection `openclaw-fork-learnings` was unavailable.

## Available Skills

- `tdd`: link the genuine parent RED and capture fresh GREEN under `cool-mist-3698`.
- `openclaw-testing`: select and run the narrow repository test command.
- `acceptance`: map the final task-scoped test implementation to goal-001.
- `autoreview`: perform the mandatory fresh review before implementation handoff.
- `save-learning`: run as the final action of the later implementation session.

## Implementation

1. Treat `extensions/deliberation/src/orchestration.test.ts` as the sole code deliverable. Preserve both root and reply rows and ensure the task-scoped patch contains the complete file, not only checkpoint prose or test stdout.
2. Audit the two rows against finding-001: root uses `providerEventId = rootId`; reply uses `providerEventId = childId` with `threadId = rootId`; both assert exact Discord account/channel/thread, one Discord call, and zero Slack calls. Change assertions only if one of those facts is not explicit.
3. Create `plans/checkpoints/cool-mist-3698.red-green-proof.md`, link the genuine RED in `plans/checkpoints/bright-reef-1988.red-green-proof.md`, and record fresh GREEN. Do not modify the test to manufacture another RED.
4. Create `plans/checkpoints/cool-mist-3698.checkpoint.md` with a goal-001 ledger citing the exact test rows/assertions, focused command, exit code, file/test counts, and confirmation that the full test file is present in task-scoped evidence.
5. Run `skill:autoreview` until no accepted actionable finding remains. Run `skill:save-learning` last and record a focused learning about ensuring preserved untracked implementations enter acceptance evidence.

## Files to Modify

| Path | Change |
| --- | --- |
| `extensions/deliberation/src/orchestration.test.ts` | Supply the complete preserved root/reply orchestration test as task-scoped implementation; tighten only a missing required assertion. |
| `plans/checkpoints/cool-mist-3698.red-green-proof.md` | Link historical RED and record fresh GREEN without fabricating RED. |
| `plans/checkpoints/cool-mist-3698.checkpoint.md` | Map finding-001 to concrete lines and record verification. |
| `learnings/**` | Save the required implementation-session learning as the final action. |

## TDD

Implement the cycle according to `skill:tdd`, using the historical RED exception required by this acceptance retry.

**Target test:** `extensions/deliberation/src/orchestration.test.ts`  
**Focused command:** `pnpm test extensions/deliberation/src/orchestration.test.ts`  
**Historical RED:** `plans/checkpoints/bright-reef-1988.red-green-proof.md`

The executable historical skeleton below is provenance only; do not rerun it against the preserved implementation:

```ts
import { createTestPluginApi } from "openclaw/plugin-sdk/plugin-test-api";
import { withServer } from "openclaw/plugin-sdk/test-env";
import { describe, expect, it } from "vitest";
import plugin from "../index.js";

describe("Deliberation cross-provider orchestration", () => {
  it("delivers one Slack root through KM to the exact Discord target", async () => {
    const observed = await withServer((_request, response) => {
      response.writeHead(500).end();
    }, async (kmEndpoint) => {
      plugin.register(createTestPluginApi({ pluginConfig: { km: { endpoint: kmEndpoint } } }));
      return undefined;
    });

    expect(observed).toEqual({ discordCalls: 1, slackCalls: 0 }); // Historical RED
  });
});
```

| Case | Historical RED | Fresh GREEN requirement |
| --- | --- | --- |
| Slack root | Scaffold returned `undefined`. | Root event remains its own thread identity and sends once to the exact Discord target. |
| Slack reply | No reply row existed in the historical skeleton. | Child event remains distinct from root thread identity and sends once to the same exact Discord target. |
| Provider isolation | Expected call summary was absent. | Each row records one Discord call and zero Slack calls. |

## Verification

1. `pnpm test extensions/deliberation/src/orchestration.test.ts`
2. `pnpm tsgo:extensions:test`
3. `pnpm format:check -- extensions/deliberation/src/orchestration.test.ts plans/checkpoints/cool-mist-3698.checkpoint.md plans/checkpoints/cool-mist-3698.red-green-proof.md`
4. `git diff --check`
5. Inspect the final task-scoped patch and confirm it includes the complete `extensions/deliberation/src/orchestration.test.ts`; checkpoint-only evidence is insufficient.

*Status: DRAFT*
