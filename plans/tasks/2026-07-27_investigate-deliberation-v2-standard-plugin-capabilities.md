# Investigate Deliberation v2 against standard OpenClaw plugin capabilities

## Objective

Determine whether Deliberation v2's OpenClaw-facing behavior can be implemented entirely as a standard plugin, identify the exact supported hooks/runtime APIs and their guarantees, and produce a task-ready recommendation for `bright-wave-6041`. The output must distinguish documented capability, observed implementation behavior, gaps, and optional design choices. Do not implement production changes.

## Scope boundary

Investigate only `/Users/michal/Projects/openclaw-fork`: local docs, plugin SDK types/runtime, hook runner and delivery implementation, bundled plugin examples, and relevant tests. Do not inspect or edit KM System, workspace plugin, Mission Control, live config or cron state. The Deliberation requirements below are the external contract; unknown external details should be called out rather than discovered outside this repository.

## Deliberation requirements to test against

- Observe/claim inbound messages from configured generic `channel:target` sources.
- Exclude the dedicated processing channel from intake.
- Suppress the ordinary agent reply fail-closed while deliberation is pending or unavailable.
- Avoid exposing an easily forgeable content marker such as `__deliberated__` as authorization.
- Allow exactly one authorized final delivery after KM marks a record `READY_TO_SEND`.
- Carry stable event, run/session, reply/thread and delivery correlation where available.
- Survive duplicate provider delivery, duplicate worker attempt, technical retry and gateway restart without a visible duplicate send.
- Keep drafting/reviewer sessions incapable of directly sending to the source channel.
- Keep the solution channel-agnostic in design; pilot remains Discord-only.

## Questions to answer

1. **Plugin-only feasibility:** Can a normal external plugin implement every required boundary without modifying OpenClaw core? Give `YES`, `YES WITH LIMITATIONS`, or `NO`, with evidence for each requirement.
2. **Inbound seam:** Compare `inbound_claim`, `message_received`, `before_agent_reply`, `reply_dispatch`, and any relevant channel/session hook. Which hook should own intake and which should prevent default processing? Does `message_received` merely observe too late to avoid an ordinary model run? Can `inbound_claim` safely produce silence or defer asynchronously? What differs by channel, especially Discord versus WhatsApp broadcast configuration?
3. **Fail-closed silence:** Identify the earliest and strongest standard plugin decision point that can guarantee no ordinary assistant response. Explain terminal semantics, ordering/priority behavior, plugin failure behavior, timeout behavior and restart behavior. Determine whether `message_sending` alone is sufficient or only a last-resort guard.
4. **Final-send path:** Inventory supported plugin runtime APIs for originating an outbound message, including whether they re-enter `message_sending`, `reply_payload_sending`, `before_dispatch`, `reply_dispatch` or `message_sent`. Identify the safest supported API and how a plugin can distinguish its authorized send without a user-forgeable text marker.
5. **Authorization/correlation:** List trustworthy context fields or plugin-owned state available across inbound claim, agent/runtime hooks and final delivery (`sessionKey`, `runId`, `messageId`, `threadId`, `replyToId`, trace fields, generation state, plugin-owned durable state, etc.). State which are stable across restart and which are process-local only.
6. **Exactly-once reality:** Separate what OpenClaw/plugin APIs can guarantee from what must be guaranteed by KM/idempotency state. Inspect delivery receipt/result semantics, message id availability, retries, duplicate hook invocation and provider idempotency support. State honestly whether exactly-once visible delivery is possible or only at-most-once attempt plus reconciliation.
7. **Capability isolation:** Determine whether standard plugin APIs can prevent only drafting/reviewer sessions from sending to source channels while permitting the designated sender. Evaluate session identity, hook context and plugin-owned authorization state. Include bypass paths such as direct message tool delivery or alternate outbound APIs.
8. **Lifecycle and durability:** Identify plugin lifecycle APIs suitable for startup recovery and durable plugin state. Determine whether a plugin-owned polling/worker service is appropriate, or whether KM should initiate delivery through a narrower supported seam. Compare these designs without implementing either.
9. **Configuration:** Identify the standard plugin config schema/registration pattern for generic source targets, processing-channel exclusion and fail-closed mode. Note any channel-specific prerequisites.
10. **Core/SDK gaps:** For every missing guarantee, say whether it is a true reusable SDK gap, a Deliberation architecture issue, or a requirement that should remain in KM. If a core change is warranted, specify the smallest generic seam and why existing APIs cannot satisfy it. Do not propose Deliberation-specific core code.
11. **Precedent and regression surface:** Find bundled/external plugin examples using the chosen hooks and identify the smallest existing test suites that characterize the same behavior.
12. **Implementation-task rewrite:** End with concrete recommended scope, non-scope, interfaces, acceptance criteria and verification commands for rewriting `bright-wave-6041`. Include explicit stop conditions if prerequisite KM contracts are insufficient.

## Required evidence

- Cite exact local docs and source paths with symbols/line ranges.
- Trace at least one inbound Discord path from channel receipt through hook/dispatch decisions.
- Trace at least one outbound path through plugin hooks to delivery result/receipt.
- Inspect relevant hook type definitions and terminal-decision implementation, not docs alone.
- Inspect existing tests for hook ordering, cancellation, duplicate behavior and delivery correlation.
- Run narrow existing tests only when needed to resolve ambiguity; no production code edits.

## Deliverable

Write `/Users/michal/Projects/openclaw-fork/docs/investigations/deliberation-v2-standard-plugin-capability-investigation.md` with:

1. Executive verdict.
2. Requirement-to-capability matrix.
3. Recommended plugin architecture and event flow.
4. Hook/API semantics and evidence.
5. Trust, authorization and persistence model.
6. Exactly-once limitations and ownership split between OpenClaw and KM.
7. Identified SDK/core gaps, if any.
8. Alternatives considered and rejected.
9. Exact rewrite proposal for implementation task `bright-wave-6041`.
10. Open decisions that still require Michal.

## Acceptance

- The verdict answers whether a standard plugin is sufficient and does not blur observed behavior with assumptions.
- Every Deliberation requirement has an owner and named API/hook or an explicit gap.
- Fail-closed behavior and final-send authorization are traced through actual source/tests.
- Exactly-once claims are technically bounded and distinguish attempt, provider acceptance and visible delivery.
- Any proposed core change is generic, minimal and supported by evidence that plugin APIs are insufficient.
- The implementation-task rewrite is specific enough to replace the current speculative wording without requiring another broad investigation.
- No production source/config/runtime state is changed.

## Verification

- Confirm only the investigation report and task-local artifacts changed.
- Record all inspected paths and any test commands/results in the report.
- End with a machine-readable summary block containing `verdict`, `recommended_inbound_hook`, `recommended_fail_closed_hook`, `recommended_send_api`, `core_change_required`, `open_decisions`, and `implementation_task_changes`.

## Context

- Proposal: `proposal-20260719-201615-c61968`, section `slice-5-openclaw-adapter`
- Downstream implementation task: `bright-wave-6041`
- Batch: `deliberation-v2-replace-v1-2026-07-26`; this investigation must complete before that paused batch reaches sequence 5.
