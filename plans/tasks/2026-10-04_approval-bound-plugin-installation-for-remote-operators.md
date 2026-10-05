---
title: Add approval-bound plugin installation for remote operators
type: implementation
---

# Approval-bound plugin installation for remote operators

## User outcome and evidence

The operator cannot access the host and explicitly needs automated plugin installation with native approval cards. An agent should prepare a specific reviewed local plugin archive, request approval in the current channel, and install/enable it through the existing installer only after a real authorized allow-once decision. Remote approval must not require a terminal.

Observed in current source: `src/agents/tools/gateway-tool.ts` deliberately rejects changes to `plugins.load.paths` via `assertGatewayConfigMutationAllowed`. This is an intentional model/operator trust boundary, not a defect to delete. `src/cli/plugins-cli.runtime.ts` has `runPluginsInstallAction`, `src/cli/plugins-install-command.ts` owns existing install/config handling, and `src/gateway/server-methods/plugin-approval.ts` plus `src/infra/plugin-approvals.ts` already implement native plugin approval lifecycle. No agent-facing plugin-install tool is currently exposed. Reuse these owners; do not introduce a second installer or a generic privileged command runner.

## Scope boundary

Work only inside `/Users/michal/Projects/openclaw-fork` source, tests and documentation. Do not read sibling repositories, real home config, credentials, production plugin artifacts, or live queues. Use synthetic local plugin archives and temporary config roots for verification. Do not install/activate anything on the real host, change real approval configuration, deploy, restart, send a real approval/message, or replay live requests. Host installation/runtime validation remains a separate operator action.

## Deliverable

Implement one narrowly scoped agent-facing plugin-install operation backed by the existing installer and existing native approval machinery. Version one supports local packaged plugin archives only; registry/network sources, arbitrary local executable directories, mutable development links, removal and general updates are out of scope. Do not add an unrelated service or broker.

1. A no-side-effect preparation/preflight identifies canonical plugin ID/name, archive SHA-256, effective source, dependency/install-script implications, current selected installation, precise intended enablement/config effect and whether activation requires Gateway restart. Reuse existing manifest/security/compatibility/install-policy validation. Preflight must not load candidate plugin code before approval.
2. Stage immutable artifact bytes in the existing appropriate managed staging area. Bind the server-owned pending install operation to those bytes, digest, plugin ID, intended config delta, requester/session/channel and expiry. Do not rely on user-editable card text, a model-provided approval ID, a claimed historical chat approval, or a fabricated decision to authorize work. Detect staging/symlink/content/config changes between prepare and execute; fail closed or require fresh approval. Validate archive traversal/identity with existing installer owner.
3. Request the existing native plugin approval through its shared manager/forwarder. Only allow-once and deny for this operation: no wildcard allow-always or policy changes. Approval must come from existing authorized operator controls; delivery failure, deny, timeout, unknown/mismatched/replayed ID must make zero installation/config/activation side effects. Consumption must be one-shot and remain safe under duplicated tool requests/concurrent retries.
4. On real allow-once execute only the bound managed plugin installation and tightly scoped enablement via the existing install/config persistence owners, preserving unrelated configuration and existing plugin settings. Keep security scans/hooks and package compatibility checks; never force/bypass their denials or disable install-script safeguards. No arbitrary shell payload or general protected-config mutation endpoint. Handle dependencies through the installer's established policy. If safe dependency behavior cannot be established, return an explicit blocker instead of broadening access.
5. Return truthful states: prepared/pending/denied/expired/installed-awaiting-restart/failed, source/digest/selected plugin location and operation ID. Treat approval receipt, installation, cold discovery and running Gateway registration as distinct evidence. Do not pretend a generic plugin approval card already executes an install. Capture sanitized operator audit evidence, backup/recovery handling and existing installer partial-failure behavior without logging secrets. Do not conflate separate approved restart with install approval; report restart required and leave restart to the existing host operation.
6. Wire the tool into current tool registration/schema/policy patterns, document usage including native channel approval and limitations. Prefer domain-qualified filenames such as `plugin-install-tool.ts` if a new file is needed; do not create generic `state.ts`, `service.ts`, `utils.ts`, `manager.ts`.

## Invariants

- Keep `ALLOWED_GATEWAY_CONFIG_PATHS` and protected path rejection unchanged. Do not make `plugins.load.paths`, `plugins.entries`, tools permissions or security/approval settings agent-tunable through config.patch/apply.
- The new operation is an explicit human-approved capability, not exec fallback after a protected-path rejection.
- Reuse installer, registry, native approvals, routing and config owners; no parallel JSON registry writer, custom card/decision protocol, maintained duplicate installation implementation, eval or shell runner.
- No standing expanded permissions, automatic self-installation, broad allowlists, approval self-resolution, forced unsafe installation or replayed approval.
- Preserve compatibility of existing CLI plugin install and all existing approval types/callers.

## Verification and acceptance

Characterize existing rejection and native approval/installer behavior before edits. Add focused RED/GREEN tests that exercise the real public tool handler through real approval manager/forwarding and existing installer/config owner with temp archive/config fixtures; do not replace the entire installation path with a success stub.

Required cases: pending makes no writes; authorized native allow-once installs exact prepared archive and merges only intended plugin config; denied/expired/undeliverable decisions make zero side effects; wrong requester/operation/digest, mutated artifact, changed relevant config, traversal/symlink escape, manifest mismatch and security-hook rejection fail closed; duplicate execution cannot reinstall or consume approval twice; unrelated settings survive; existing plugin config is preserved; partial installer failure records truthful recovery state; restart is not silently performed; protected config.patch/apply still rejects plugin and tool/security writes; existing CLI installer and native approval routes remain compatible.

Exercise real native channel approval payload/action construction offline with captured synthetic fixtures (no live sends). Include targeted approval/installer/tool suites, relevant broader tests and typecheck/build checks according to project guidance. No skipped failing security cases or weakening assertions. Final note names modified owners, exact commands/counts, RED/GREEN evidence, remaining limitations and how host can validate the installed runtime. Source-only test success is not deployed readiness.
