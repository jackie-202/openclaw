# Plan 2026-08-03: Close Deliberation registration acceptance gaps

Capture fresh, task-owned proof for the preserved registration and ingress changes; change code only if a required gate reproduces a defect.

_Task: `fresh-dune-0263`_
_Status: DRAFT_

## Progress

- [x] Phase 0: Config and initialization
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase context

- The preserved diff already declares four `expectedHooks`, projects them through `src/plugins/status-snapshot.ts`, enforces them in `src/plugins/loader.ts`, and covers built runtime registration in `scripts/test-built-plugin-singleton.mjs`.
- `extensions/discord/src/monitor/message-handler.process.test.ts` already composes the real loader and Discord dispatch path. It asserts canonical `discord:channel:<id>` intake, `{ handled: true }`, no ordinary dispatch/delivery after success, and `before_dispatch` fail-closed handling after KM failure.
- The parent proof contains the genuine built-loader RED/GREEN cycle, but neither parent artifact preserves the CLI JSON result, composed-ingress command outcome, nor the focused test-gate output required by acceptance.
- No new production change is justified unless fresh verification fails; this follow-up should create run-owned evidence instead of duplicating the preserved implementation.

### Relevant documentation

- `docs/plugins/manifest.md` defines `expectedHooks` as manifest-first inventory metadata enforced during runtime registration.
- `src/plugins/AGENTS.md` requires inventory to stay manifest-only and Gateway metadata changes to activate only after restart.
- `docs/reference/test.md` and `package.json` establish repository test wrappers; `README.md` distinguishes `pnpm openclaw` source execution from `node openclaw.mjs` built `dist/` execution.

### Knowledge base

- `learnings/architecture/swift-brook-0038-separate-plugin-inventory-from-runtime-proof.md`: prove inventory, staged runtime registration, and activation independently; never execute plugin runtime from list/status.
- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: trace discovery, registration, activation, and callers rather than inferring runtime state from artifact presence.
- The task's TDD provenance requires linking the parent genuine RED and capturing fresh GREEN only; do not manufacture a new RED after implementation exists.
- Recall used local fallback because collection `openclaw-fork-learnings` was absent; unrelated auto-extracted empty learnings were discarded.

## Available Skills

- `task-evidence`: recover exact parent command provenance without reconstructing history.
- `tdd`: preserve the historical RED link and record fresh GREEN for this task.
- `openclaw-testing`: choose and run the focused Deliberation, loader, Discord, and build gates.
- `acceptance`: record goal-scoped evidence artifacts for the monitor.
- `autoreview` and `validate-implementation`: mandatory closeout only if code changes become necessary.
- `save-learning`: mandatory final action after implementation/verification.

## Implementation

1. Preserve the existing Deliberation manifest, loader, status snapshot, built-smoke, and composed-ingress changes. Do not redo goal-002 or alter production code unless a fresh command below fails for the asserted behavior.
2. Use `skill:task-evidence` for `swift-brook-0038` only to recover exact historical provenance. In `plans/checkpoints/fresh-dune-0263.red-green-proof.md`, link the genuine parent RED/GREEN at `plans/checkpoints/swift-brook-0038.red-green-proof.md`; do not manufacture a new RED.
3. Run `pnpm build`, then invoke the built launcher with an isolated `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`, and `OPENCLAW_BUNDLED_PLUGINS_DIR=$PWD/dist-runtime/extensions`. Save the raw `node openclaw.mjs plugins list --json` output and a filtered Deliberation record showing `hookCount: 4` and exactly `inbound_claim`, `before_dispatch`, `before_tool_call`, and `message_sending`.
4. Run the loader-backed Discord integration test and save its verbose result alongside the relevant assertion locations: canonical `sourceTarget`, successful `{ handled: true }`, suppressed ordinary dispatch/delivery, and KM-failure `before_dispatch` handling.
5. Run the focused Deliberation and plugin loader/runtime set in one test command, then run the caller-owned canonical Test Gate. Record each exact command, exit code, test counts, and any unrelated failure without relabeling focused output as the canonical gate.
6. If a gate fails on required behavior, use `skill:tdd` to add the narrowest regression assertion first, capture genuine RED, fix only the owning path, rerun all gates, and run fresh `skill:autoreview` plus `skill:validate-implementation`. If all gates pass, make no source or test edits.
7. Create `plans/checkpoints/fresh-dune-0263.evidence.md` and `plans/checkpoints/fresh-dune-0263.checkpoint.md` that map the raw outputs to goals 001, 003, and 004. Use `skill:acceptance` to confirm the supplied artifact set contains the actual outputs, not checkpoint claims alone.
8. Put these exact activation steps in the final implementation note: `pnpm build`, `pnpm openclaw gateway restart`, `pnpm openclaw gateway status --deep`. State that rebuilding without restarting leaves the process-stable plugin registry unchanged.
9. Invoke `skill:save-learning` as the final action and save at least one learning about acceptance artifacts carrying direct command output.

## Files to Modify

| File                                                   | Change                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `plans/checkpoints/fresh-dune-0263.red-green-proof.md` | Link the genuine parent RED and record fresh GREEN commands/results.                     |
| `plans/checkpoints/fresh-dune-0263.plugins-list.json`  | Preserve unedited built-launcher inventory output.                                       |
| `plans/checkpoints/fresh-dune-0263.evidence.md`        | Filter the Deliberation record and map direct ingress/test evidence to acceptance goals. |
| `plans/checkpoints/fresh-dune-0263.checkpoint.md`      | Record exact gate outcomes and the required activation note.                             |
| `learnings/<category>/<generated-name>.md`             | Save the mandatory session learning last.                                                |

Production and test files are conditional: modify only the owning file exposed by a fresh failing assertion.

## TDD

Use `skill:tdd` with the task's historical-RED exception. Existing assertions are the executable skeleton; do not edit them merely to recreate RED.

**Built test file:** `scripts/test-built-plugin-singleton.mjs`
**Built run command:** `OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton`
**Ingress test file:** `extensions/discord/src/monitor/message-handler.process.test.ts`
**Ingress run command:** `pnpm test extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`

```js
import assert from "node:assert/strict";

assert.equal(deliberation.hookCount, 4);
assert.deepEqual(deliberation.hookNames, [
  "inbound_claim",
  "before_dispatch",
  "before_tool_call",
  "message_sending",
]);
```

```ts
await expect(intakeHandler.mock.results[0]?.value).resolves.toEqual({ handled: true });
expect(intakeBody.sourceTarget).toBe(`discord:channel:${sourceId}`);
expect(dispatchInboundMessage).not.toHaveBeenCalled();
expect(deliverDiscordReply).not.toHaveBeenCalled();
expect(beforeDispatchHandler).toHaveBeenCalledTimes(1); // After the KM failure case.
```

| Surface                    | Historical RED                                             | Fresh GREEN                                                                         |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Built runtime registration | Parent built loader reported no typed Deliberation hooks.  | Built artifact registers all four hooks and initializes global `inbound_claim`.     |
| Built CLI inventory        | No parent command output was preserved; do not invent RED. | Raw built-launcher JSON contains the exact four hook names and `hookCount: 4`.      |
| Composed ingress           | Parent acceptance lacked supplied executable proof.        | Verbose test proves canonical intake, terminal success, and fail-closed KM failure. |

## Verification

1. `pnpm build`
2. Run isolated `OPENCLAW_STATE_DIR=<temp> OPENCLAW_CONFIG_PATH=<temp>/openclaw.json OPENCLAW_BUNDLED_PLUGINS_DIR="$PWD/dist-runtime/extensions" node openclaw.mjs plugins list --json`, preserving the raw JSON before asserting the Deliberation record.
3. `OPENCLAW_BUNDLED_PLUGIN_BUILD_IDS=deliberation OPENCLAW_RUN_NODE_SKIP_DTS_BUILD=1 node scripts/tsdown-build.mjs && pnpm plugins:assets:copy && pnpm test:build:singleton`
4. `pnpm test src/plugins/manifest-registry.test.ts src/plugins/status.registry-snapshot.test.ts src/plugins/loader.test.ts src/plugins/bundled-plugin-metadata.test.ts src/plugins/source-checkout-runtime.test.ts extensions/deliberation/src extensions/discord/src/monitor/message-handler.process.test.ts -- --reporter=verbose`
5. Run the registered canonical Test Gate exactly as `cd ~/Projects/openclaw-fork && npm test`; preserve its real gate reference and outcome.
6. `git diff --check -- plans/checkpoints/fresh-dune-0263.red-green-proof.md plans/checkpoints/fresh-dune-0263.evidence.md plans/checkpoints/fresh-dune-0263.checkpoint.md`

## Dependencies

- Parent historical proof remains immutable and linkable at `plans/checkpoints/swift-brook-0038.red-green-proof.md`.
- `dist/` and `dist-runtime/` must come from the fresh build before inventory evidence is captured.
- The canonical Test Gate owner must expose a run reference; report `not-run` or unavailable explicitly rather than substituting a local command.
