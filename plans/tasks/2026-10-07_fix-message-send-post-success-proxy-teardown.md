---
title: Fix message send post-success proxy teardown hang
type: implementation
---

# Fix `openclaw message send` post-success proxy teardown hang

## Problem

A real local Discord send through `openclaw message send` reaches Discord and Gateway records a successful `message.action`, but the short-lived CLI process remains alive until its 90-second host timeout kills it. The caller therefore records `visible_delivery_status=pending`, does not capture the Discord message ID, never dispatches the Ask Jackie session, and an attempted Reconcile repeats the same ambiguous transport stage.

Observed production case:

- Mission Control request `ff82c30b-4959-4c36-90aa-656479f74491`
- delivery key `ask-jackie:file:plaud-transcripts:db079aa1229a6780bc6f62c2:attempt-1`
- Discord destination `channel:1506359676986593411`
- diagnostic send reached Discord as message `1557346617701564451` around five seconds after start, while the CLI later required SIGKILL
- Gateway log contains a successful `message.action` response
- `openclaw message read ... --json` exits normally
- `openclaw message send ... --dry-run --json` exits normally
- therefore the failure is specific to resources activated by a real local outbound HTTP send, not generic command parsing, output serialization, or the Gateway RPC client

Current trace points to the short-lived CLI's managed proxy / global Undici lifecycle: `message` uses the default network-proxy policy, Discord `send` executes locally, the real request creates network resources, and `run-main.ts` restores proxy routing but does not clearly dispose the active/global dispatcher resources created for the command. Confirm this with tests/instrumentation; do not assume it without evidence.

## Goal

Make a successful `openclaw message send` return its structured send result and terminate promptly after the platform send, while preserving managed proxy routing and existing host-controlled transport timeouts.

## Scope

Primary likely files include:

- `src/cli/run-main.ts`
- `src/infra/net/proxy/proxy-lifecycle.ts`
- `src/infra/net/undici-global-dispatcher.ts`
- focused tests beside those owners and/or CLI message integration tests

Use the lowest responsible owner. Do not add a forced unconditional `process.exit(0)`, do not disable proxy routing for message sends, do not merely increase Mission Control's 90-second timeout, and do not weaken failure reporting.

## Required behavior

1. A successful real/local message action may keep HTTP connections alive internally, but short-lived CLI teardown must close or unreference all command-owned resources and return promptly.
2. The structured send result, including platform message ID when supplied, remains available to stdout/callers before teardown.
3. Failure exit semantics remain unchanged.
4. Managed proxy routing remains active during the outbound request and is restored safely afterward without breaking inherited/nested proxy ownership.
5. Long-lived gateway/runtime processes must not have shared dispatchers closed by a short-lived CLI cleanup path.
6. Host environment timeout ownership remains intact; no internal timeout increase or hidden retry.

## Regression tests

Add focused tests that fail before the fix and prove at least:

- a short-lived CLI command that performs a real mocked outbound fetch/send settles and completes teardown rather than leaving an active dispatcher/handle;
- dry-run/read/non-network behavior remains unchanged;
- nested or inherited managed-proxy registration is not destroyed by releasing one CLI owner;
- successful message output is emitted before cleanup;
- existing run-main successful routed command behavior is preserved (do not reintroduce forced `process.exit`).

Prefer deterministic mocked HTTP/proxy fixtures. Do not send a real Discord message in automated tests.

## Verification

Run focused tests for changed CLI/proxy/message modules, then the repository's registered full test/type/lint gates required by the project. Report the exact resource that caused the hang and why the cleanup is scoped safely.

## Out of scope

- Mission Control retry/reconcile semantics
- changes to `openclaw-session-delivery`
- replaying request `ff82c30b-4959-4c36-90aa-656479f74491`
- sending live Discord diagnostics
- deployment, restart, task lifecycle, or message replay
