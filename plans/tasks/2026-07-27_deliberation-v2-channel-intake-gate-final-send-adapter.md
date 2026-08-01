# Deliberation v2 — standard OpenClaw plugin for intake, silence and bounded final delivery

## Objective

Implement Deliberation v2's OpenClaw-facing boundary as a **standard external plugin using existing public Plugin SDK APIs**. The Discord pilot plugin owns configured-source intake, terminal suppression of the ordinary reply path, restricted-session outbound guards, and one KM-reserved durable final-send attempt.

KM System remains the sole durable authority for workflow state, readiness, authorization, attempt reservation and reconciliation. Do not modify OpenClaw core or claim exactly-once visible delivery.

## Approved guarantee

This task deliberately chooses the simplest plugin-only contract established by investigation `wild-peak-6037`:

- Fail closed while the plugin is loaded and its terminal hook executes.
- A plugin load/registration failure, host timeout or hook exception is **not** claimed to be covered by the standard SDK.
- Delivery means one KM-reserved platform-send attempt.
- If the provider may have accepted the send but the result is unknown, persist `DELIVERY_UNKNOWN`; never retry without reconciliation proof.
- Drafting/reviewer isolation is cooperative protection inside the trusted OpenClaw process, not a security boundary against malicious native plugins or raw adapters.

This bounded contract is accepted for the Discord pilot. Do not introduce generic core changes for stronger guarantees in this task.

## Evidence and authority

- Proposal: `proposal-20260719-201615-c61968`, section `slice-5-openclaw-adapter`.
- Investigation: `docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md`.
- The investigation is design evidence for SDK behavior and limitations; this task's Scope and Acceptance are the implementation authority.
- Project scope is `/Users/michal/Projects/openclaw-fork` only. Do not inspect or edit KM System, workspace, Mission Control, live Gateway config or cron state. If a required KM contract is not already stated here or represented by repository-local fixtures/interfaces, stop and report the missing contract rather than crossing repository boundaries.

## Prerequisites and stop conditions

Before production implementation, express these KM-owned contracts as repository-local plugin interfaces and test fixtures. Stop if any contract cannot be represented unambiguously:

1. Deterministic inbound event key from canonical route plus provider `messageId`, with explicit behavior when `messageId` is absent.
2. Idempotent intake result: `accepted`, `duplicate`, or `unavailable`.
3. Immutable `recordId`, readiness version or authorization reference, and exact `READY_TO_SEND` payload/route fields.
4. Atomic KM reservation/CAS: exactly one worker may transition `READY_TO_SEND -> SENDING` and obtain one `deliveryAttemptId`.
5. Terminal reporting for `SENT(receipt)`, `SUPPRESSED(reason)`, proven `NOT_SENT`, `PARTIAL_FAILED`, and `DELIVERY_UNKNOWN`.
6. Reconciliation contract forbidding retry while outcome is unknown.
7. Canonical Discord account/source/processing IDs, thread/reply behavior, and restricted drafting/reviewer session identities must be supplied through validated plugin config; display names are not runtime identifiers.

If implementation evidence disproves the investigation's public-API flow, stop and report the exact SDK gap. Do not repair it by changing core.

## Plugin configuration

Define strict manifest JSON Schema under `plugins.entries.<id>.config` for a shape equivalent to:

```ts
type DeliberationPluginConfig = {
  enabled: boolean;
  failClosed: true;
  sources: Array<{
    channel: string;
    accountId?: string;
    target: string;
  }>;
  processingSource: {
    channel: string;
    accountId?: string;
    target: string;
  };
  km: {
    endpoint: string;
    requestTimeoutMs: number;
    pollIntervalMs?: number;
  };
  restrictedSessionKeys: string[];
};
```

Use canonical opaque IDs and strict normalized matching. Secrets must use the standard credential/SecretRef surface chosen for the plugin; never embed secret values in source, examples or logs. Support generic `channel/accountId/target` configuration, but enable and test production behavior only for the Discord pilot. The processing source must be excluded before intake and before gating.

## Required interfaces

Inbound request must preserve at least:

```ts
type DeliberationInboundEvent = {
  eventKey: string;
  channel: string;
  accountId?: string;
  conversationId: string;
  parentConversationId?: string;
  messageId: string;
  sessionKey?: string;
  senderId?: string;
  threadId?: string | number;
  replyToId?: string;
  replyToBody?: string;
  replyToSender?: string;
  timestamp?: number;
  body: string;
};
```

Ready delivery must preserve at least:

```ts
type ReadyDelivery = {
  recordId: string;
  readinessVersion: string;
  deliveryAttemptId: string;
  state: "SENDING";
  channel: string;
  accountId?: string;
  to: string;
  text: string;
  threadId?: string | number;
  replyToId?: string;
};
```

Completion reporting must include normalized status, OpenClaw queue intent ID when available, platform message IDs, thread/reply correlation, timestamp, and bounded error/suppression/unknown category. Do not persist raw secret-bearing errors.

## Required behavior

### 1. Intake

- Register `inbound_claim` for strict configured-source matching and synchronous bounded intake to KM.
- Use it as a **non-claiming intake seam** after every matched-source intake result; do not rely on the current broadcast `{ handled: true }` path because investigation found incomplete reply/dedupe settlement there.
- Build a deterministic event key from the explicit KM contract.
- Use the public persistent dedupe helper only as a bounded optimization. KM remains the canonical permanent duplicate authority.
- Exclude the processing source before any intake call.

### 2. Terminal source silence

- Register `before_dispatch` as the primary terminal source gate.
- For every configured pilot-source turn, return `{ handled: true }` with no text, including KM accepted, duplicate, unavailable, error and timeout outcomes.
- Keep this decision local and deterministic once source matching is known.
- Prove no ordinary model call or ordinary visible reply occurs when the hook runs.
- Document and test the accepted SDK limitation: plugin absence, hook exception or host timeout is not guaranteed fail-closed. Do not weaken tests by calling that strict coverage.

### 3. Restricted drafting/reviewer sessions

- Register `before_tool_call` to block direct outbound-capable tools for configured restricted session keys. At minimum block `message`; enumerate any additional available outbound-capable tools from repository-local policy/types before coding.
- Register `message_sending` as defense in depth to cancel canonical sends from restricted sessions to configured source targets.
- Permission must be decided synchronously from validated config and trusted local context; do not depend on a slow KM lookup in the outbound hook.
- Do not claim protection against malicious native plugins, raw adapters or native clients in the same process.

### 4. Final-send adapter

- Use `api.registerService` for bounded KM polling, or implement a repository-local plugin-owned authenticated wake seam if such a standard public SDK pattern is already available. Prefer the smaller design; do not add a second workflow or scheduling system.
- Before every send, reread KM state and require a successful atomic reservation returning state `SENDING` plus one `deliveryAttemptId`.
- Put the only `sendDurableMessageBatch` import/call in one final-send adapter module.
- Preserve exact canonical channel, account, target, reply and thread fields.
- Report `sent`, `suppressed`, `failed-before-send`, `partial_failed`, and `unknown` distinctly.
- Never retry `partial_failed` or any outcome where platform send may have started unless KM reconciliation proves `NOT_SENT` and issues a fresh reservation.
- Do not use `__deliberated__`, message text, user/model content, or other forgeable payload data as authorization.

## Side-effect ownership

- The source-channel side effect has exactly one repository-local call site: the final-send adapter.
- KM owns authorization and attempt reservation; the plugin owns execution of the reserved OpenClaw send and receipt reporting.
- `before_dispatch` owns ordinary-source silence.
- No other module may send to the source channel or mutate KM workflow state outside the typed client boundary.

## Non-scope / DO NOT

- No OpenClaw core or generic SDK changes.
- No KM spool, drafting, reviewer, debounce, readiness, rewrite, retry or reconciliation implementation.
- No second workflow database or plugin-owned authoritative state file.
- No provider-level or visible exactly-once claim.
- No v1 fallback, dual write, parallel authority, `_legacy`, `.bak`, disabled/commented executable fallback, or content marker authorization.
- No live config, cron, routing or channel mutation.
- No WhatsApp or Slack enablement.
- Do not modify or replace `plan_linking.py`.
- Do not use external URLs or attachments as runtime inputs.

## Characterization-first guardrail

Before production code, add focused characterization/tests for the SDK seams relied on by the plugin where existing tests do not already pin behavior:

- `inbound_claim` rich context and non-claiming continuation,
- `before_dispatch` terminal silent result,
- `before_tool_call` cancellation by restricted session,
- `message_sending` cancellation and its trusted-context limitations,
- durable send result/receipt classification,
- unknown-send recovery refusing blind replay.

Do not alter generic behavior merely to make the plugin easier to implement. If existing behavior contradicts the approved bounded design, stop with evidence.

## Acceptance criteria

1. Two inbound deliveries with the same provider event key produce one canonical KM intake record; missing provider ID follows the explicit fallback contract.
2. The configured processing source produces no intake event, no terminal source gate and no recursive final send.
3. Every configured pilot-source turn terminates at `before_dispatch` with no model call and no ordinary visible reply, including KM timeout/unavailable/error, while the plugin and hook are operating.
4. Hook exception/timeout/absent-plugin behavior is explicitly tested or characterized and documented as outside the accepted plugin-only guarantee; no test or documentation claims stronger protection.
5. Restricted drafting/reviewer sessions cannot execute `message` or any identified equivalent outbound tool, and their canonical outbound payloads to source targets are cancelled.
6. Two workers racing on one READY record yield exactly one KM reservation and exactly one call to the final-send adapter.
7. Successful send persists one normalized receipt with returned platform IDs and the matching `deliveryAttemptId`.
8. Crash before provider send can recover. Crash after provider send may have started does not blindly retry and records `DELIVERY_UNKNOWN` without a second send call.
9. `partial_failed` is not retried without explicit reconciliation proof and a fresh reservation.
10. Static scans find exactly one outbound-send import/call site, no `__deliberated__`, no v1 write/fallback, no second state authority, and no production WhatsApp/Slack source configuration.
11. Configuration validation rejects ambiguous display-name routing, source/processing overlap, malformed endpoints, missing restricted-session identities and non-fail-closed mode.
12. Documentation consistently says **one reserved attempt** and **unknown requires reconciliation**, never exactly-once visible delivery.
13. Existing relevant plugin/outbound behavior remains green; no generic core semantics are changed.

## Verification

Use the implemented plugin's exact path plus the smallest relevant shared suites:

```bash
pnpm test <deliberation-plugin-path>
pnpm test src/plugins/wired-hooks-inbound-claim.test.ts src/plugins/wired-hooks-reply-dispatch.test.ts src/plugins/hooks.before-agent-reply.test.ts
pnpm test src/plugins/wired-hooks-message.test.ts src/plugins/wired-hooks-reply-payload-sending.test.ts src/plugins/hooks.security.test.ts src/plugins/hooks.correlation.test.ts
pnpm test src/infra/outbound/deliver.test.ts src/infra/outbound/delivery-queue.recovery.test.ts src/channels/message/receipt.test.ts
pnpm build
pnpm check:changed
```

Also run:

- a deterministic duplicate-worker race test repeatedly,
- restart/crash tests covering before-send recovery and after-send `DELIVERY_UNKNOWN`,
- a static scan for outbound-send call sites, forbidden markers, v1 fallbacks and channel enablement,
- a changed-files inspection proving all source changes remain inside `/Users/michal/Projects/openclaw-fork` and no live runtime/config state changed.

The final note must record exact commands and results, the accepted guarantee boundary, any unresolved KM prerequisite, and whether the plugin uses polling or an authenticated wake seam.

## Rollback

Rollback removes/disables only the new plugin package and its repository-local registration/config schema. It must not reactivate v1 or route ordinary replies around the gate. Operational rollback for the later pilot cutover is safe silence and belongs to the cutover task, not this implementation task.
