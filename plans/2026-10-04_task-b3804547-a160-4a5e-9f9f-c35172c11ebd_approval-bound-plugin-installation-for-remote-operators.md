# Plan 2026-10-04: Approval-bound plugin installation for remote operators

## Progress

- [x] Initialize canonical plan path.
- [x] Inspect existing owners, documentation, and scoped rules.
- [x] Incorporate relevant learnings and synthesize bounded design.
- [x] Finalize test-first implementation plan.

## Analysis

- `src/agents/tools/gateway-tool.ts:49` rejects protected config mutations; retain its allowlist and test both `config.patch`/`config.apply`.
- `src/gateway/server-methods/plugin-approval.ts:98` creates server IDs; `src/gateway/server-methods/approval-shared.ts:383` handles delivery/wait; `src/gateway/exec-approval-manager.ts:191` consumes allow-once but wait results alone are replayable. Installation therefore needs a server-owned one-shot binding and atomic consumption.
- `src/cli/plugins-install-command.ts:769` calls the managed archive installer then `src/cli/plugins-install-persist.ts:184` commits records/config, adds/removes allow/deny, selects slots, refreshes cold registry and announces restart. A privileged installer path must explicitly constrain this broader CLI behavior and prevent implicit restart.
- Docs: `docs/tools/plugin.md` documents install/enable, source precedence, auto-restart and cold-vs-running registration; `docs/tools/exec-approvals-advanced.md` documents native cards, `/approve`, channel approvers and delivery fallback.
- Relevant skills discovered once: `tdd` for RED/GREEN implementation; `openclaw-testing` for verification selection; `technical-documentation` for public docs; `autoreview` for pre-commit closeout. No Codex protocol changes planned.
- `src/plugins/install.ts:2382` already extracts/validates archives; `dryRun` still invokes operator `security.installPolicy` and `before_install` hooks (`src/plugins/install-security-scan.runtime.ts:954`), so **do not** call dry-run install during side-effect-free prepare. Extract reusable metadata/compatibility/path validation from the installer; invoke policy/hooks again only after approval. `src/infra/install-package-dir.ts:259` invokes npm with safe args for archive dependencies; v1 blocks archives requiring dependency resolution until a bound offline dependency contract is proven.
- `src/cli/plugins-install-record-commit.ts:231` defaults to `afterWrite: restart`; `src/config/runtime-snapshot.ts:15` already supports `{ mode: "none", reason }`. `src/cli/plugins-install-persist.ts:195` can alter allow/deny/slot policy: compute exact delta before approval and reject wider or changed deltas; preserve current entry config and unrelated keys.
- Gateway owns one `pluginApprovalManager` in `src/gateway/server-aux-handlers.ts:89`; `plugin.approval.request` delivers decisions but does **not** install code. `src/gateway/methods/core-descriptors.ts:63` declares existing approval scopes; a separate _narrow_ server-owned install operation is required to prevent client-forged decision/replay. `src/agents/openclaw-tools.ts:408` registers `gateway`; `src/agents/tool-catalog.ts:247` and `src/agents/agent-tools.policy.ts:51` govern catalog and subagent denial.
- `learnings/architecture/2026-09-08_approval-controls-must-precede-blocked-operation-admission.md`: verify `/approve` reaches the resolver while originating turn waits; delivery and authorization are distinct. `learnings/runtime-errors/runtime-plugin-evidence-distinguishes-manifest-projection-from-activation.md`: cold registry is not live registration. `learnings/tooling/compound-plan-headers-are-machine-validated.md`: dated first line mandatory. No relevant PlantUML diagram found in scoped docs.

## Approach

- Add one opt-in `plugin_install` built-in tool with `request` and `status` actions; no model-facing `resolve`, `execute`, arbitrary config, force, link, URL, registry, update or restart argument. Pass trusted session/agent/delivery/sender context from tool construction; do not accept those from model args. Deny subagents; require explicit tool policy exposure (same optional-tool pattern), not a new config key.
- Implement Gateway-owned `plugin.install.request/status` handlers beside plugin approvals, sharing the existing manager/forwarder and authorized native `plugin.approval.resolve`. Only the server may stage, retain the operation, consume approval and call the installer; never treat a tool-provided ID as authority. Return `pending` after a routed two-phase request; server continues after decision, recording `denied`/`expired`/`failed`/`installed-awaiting-restart` for requester-scoped status. Use a bounded process-local pending/result map and cleanup; on Gateway restart pending requests fail closed. No separate broker or registry writer.
- Stage one size-bounded regular archive under the installer-owned managed extensions staging root (`.openclaw-install-stage-*`, verify current owner/path safeguards before reusing). Pin SHA-256, realpath/file identity, manifest ID/name, effective source, _currently selected installation_, intended install target, relevant config fingerprint/delta, requester/session/channel and expiry. Forbid symlink source/escape and archive traversal; recheck staged bytes, expiry and relevant config under per-target lock immediately before one-shot consumption and publication. Keep temporary archive artifact ephemeral; remove it on every terminal outcome and after stale-startup cleanup. Do not add a JSON state file.
- Preflight is metadata-only and cannot import candidate code, invoke policy commands/hooks, install npm deps, touch install records/config, or restart; explicitly label policy/hook results **deferred until after approval**, rather than claiming they passed. Reject dependency-bearing, npm-script-bearing, existing target/replacement, shadowed/conflicting source, disabled global plugin policy, or any config delta beyond reviewed per-ID enablement/allow/deny/slot effects with a precise blocker. After approval, call `installPluginFromArchive` with pinned `expectedPluginId`, current config and no override/force; keep full install policy, hooks, safety and compatibility checks, and persist via the existing record/config owner with `afterWrite: { mode: "none", reason: "approved plugin install awaits explicit restart" }`. Validate the actual computed delta equals approved delta before commit; report partial publish/record failures with backup/recovery directions and no false success.
- Keep IDs/digests, target and bounded sanitized decision/audit metadata in operator results/logs; never log credentials or raw config. Expose selected installed source and distinguish prepared metadata, approval receipt, cold registry refresh and live Gateway activation. A separate host restart/`plugins inspect --runtime --json` proves activation.

## Implementation

1. Characterize current gateway rejection, native approval two-phase delivery/authorized resolve, archive `dryRun` hook behavior, CLI install record/enable/auto-restart behavior with existing tests. Check archive extraction, symlink and npm script policy directly before choosing reusable validators.
2. Follow `skill:tdd`: start with the `## TDD` skeleton, record RED, then add temp-archive/config owner fixtures and integration assertions before implementing the server handler.
3. Add side-effect-free archive preflight to `src/plugins/install.ts` using existing metadata, traversal, compatibility and target validators; reuse its canonical validated facts in post-approval installer path to avoid divergent policy. Bound archive size/extraction and reject any dependency/script case without proven offline policy.
4. Add server-owned pending operation adjacent to `src/gateway/server-methods/plugin-approval.ts`; register narrow RPCs in auxiliary handlers, method descriptors/list and protocol schema. Route to existing approval manager/forwarder with `allowedDecisions: ["allow-once", "deny"]`; require effective delivery and let authenticated channel controls resolve. Ensure same-chat `/approve` can run while the agent request waits. After decision verify manager record ID, type, resolved time/expiry and bound operation, then atomically consume allow-once exactly once under per-plugin lock; revalidate artifact, requester binding and relevant config, then install/persist and terminate/cleanup.
5. Extend `persistPluginInstall` narrowly for explicit no-restart write behavior while preserving CLI defaults; compare approved delta against persist-time delta (including allow/deny/slots and selected source), reject wider mutations. Preserve unrelated config and existing entry config. Record truthful partial failure with existing backup/rollback semantics.
6. Register `plugin_install` in core tool assembly/catalog and subagent policy with explicit opt-in; update `docs/tools/plugin.md` and `docs/plugins/plugin-permission-requests.md` via `skill:technical-documentation` with native approvals, blockers, failure states, restart/verification separation. Request owner review for the security/ownership boundary; run fresh `skill:autoreview` before any later commit.

## TDD

- Create `src/agents/tools/plugin-install-tool.test.ts` first (NEW FILE); initial runnable RED tests use existing imports and no real host state:

```ts
import { describe, expect, it } from "vitest";
import { createOpenClawTools } from "../openclaw-tools.js";

describe("approval-bound plugin install tool", () => {
  it("exposes a bounded plugin install capability when explicitly allowed", () => {
    const tools = createOpenClawTools({
      config: { tools: { allow: ["plugin_install"] } },
      agentSessionKey: "agent:main:main",
      disablePluginTools: true,
      wrapBeforeToolCallHook: false,
    });
    const tool = tools.find((candidate) => candidate.name === "plugin_install");
    // RED: no agent-facing plugin_install tool exists yet.
    expect(tool?.execute).toBeTypeOf("function");
  });
});
```

| Skeleton case          | RED                                        | GREEN                                                          |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| explicit tool assembly | `expected undefined to be type "function"` | `plugin_install` exposes request/status handler through policy |

- Run only this file: `pnpm test src/agents/tools/plugin-install-tool.test.ts`. Then expand it into real public-tool-to-Gateway-handler integration using a temporary config root, synthetic archive (`src/plugins/test-helpers/archive-fixtures.ts`), actual approval manager/forwarder and installer/persist owner; mock only native outbound send and prohibited network/process effects. Implement TDD cycle per `skill:tdd`; retain exact RED/GREEN commands and counts.

## Testing

- Pending/prepared statuses, immutable staged SHA, selected source and no install/config/index writes (only temporary archive staging); native approval payload/actions captured offline; authorized allow-once installs exact bytes and only reviewed config delta; no automatic restart or candidate code execution in prepare.
- Deny, expiry, no delivery, unknown/mismatched/replayed approval, wrong requester/session/operation/digest, changed original/staged archive or config, traversal/symlink, manifest mismatch, hooks/policy reject, concurrent duplicate request/decision: assert no installation/config/activation side effects. Assert clean cleanup; verify process restart drops pending authority.
- Test existing config preserved, allow/deny/slot effects exactly disclosed, existing install/shadow/replacement blocked, scripts/dependencies explicit blocker, partial post-publish config failure truthful/recoverable; compatibility of CLI installer/native approval and protected config.patch/apply for plugins/tools/security.
- Narrow suites: `pnpm test src/agents/tools/plugin-install-tool.test.ts src/gateway/server-methods/plugin-approval.test.ts src/plugins/install.path.test.ts src/cli/plugins-install-persist.test.ts src/agents/tools/gateway-tool-guard-coverage.test.ts`; add focused new Gateway protocol/handler suite; use `skill:openclaw-testing` to choose broader changed checks, `pnpm build` for tool/protocol/import boundary, and `git diff --check` + docs sanity. All tests use temp roots; no real send/install/restart.

## Files

- `src/agents/tools/plugin-install-tool.ts`, `src/agents/tools/plugin-install-tool.test.ts`, `src/agents/openclaw-tools.ts`, `src/agents/tool-catalog.ts`, `src/agents/agent-tools.policy.ts`: opt-in handler and policy.
- `src/gateway/server-methods/plugin-install.ts`, `src/gateway/server-methods/plugin-install.test.ts`, `src/gateway/server-aux-handlers.ts`, `src/gateway/methods/core-descriptors.ts`, `src/gateway/server-aux-methods.ts`, `src/gateway/server-methods/plugin-approval.ts`: server-owned pending operation and approved execution through existing manager; only add extra Gateway registration files if existing method inventories require them.
- `packages/gateway-protocol/src/schema/plugin-install.ts` plus package-scoped guide/inventory as needed: narrow typed request/status contract, no generic privileged config/write endpoint.
- `src/plugins/install.ts`, `src/cli/plugins-install-persist.ts`, targeted owner tests: shared metadata-only preflight and explicit no-restart persistence; CLI defaults intact.
- `docs/tools/plugin.md`, `docs/plugins/plugin-permission-requests.md`: operator guide, native decision routing, limitations and proof levels.
