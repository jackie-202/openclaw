# Fix approval command deadlock behind same-session reply admission

Implement bounded repair, not another investigation. Manually traced evidence by Jackie:

- Actual plugin approval card1546880893430403124 uses occomp:cid=btn_HPQFwPWK, not native execapproval. Callback flows extensions/discord/src/monitor/agent-components.handlers.ts synthetic command fallback -> agent-components.dispatch.ts CommandSource:text and same session -> dispatchReplyFromConfig.
- src/auto-reply/reply/dispatch-from-config.ts ensureDispatchReplyOperation('dispatch') at2285 awaits admitReplyTurn(waitForActive:true), BEFORE replyResolver at2559+.
- reply-turn-admission.ts visible turns waitForIdle until current operation ends. resolveReplyTurnKind defaults visible; no approval control exemption.
- /approve handler runs downstream inside get-reply.ts -> get-reply-inline-actions.ts handleCommands at519+ -> commands-approve.ts. Approval-waiting tool keeps originating reply operation active, hence callback cannot resolve until expiry and originating reply completes.
- Deployed dist/dispatch-CdSF49CH.js independently contains identical admission ordering at1393 before resolver1533, waitForActive745. No need to regenerate distribution or touch runtime.
- Existing reply-turn-admission.test.ts run directly:6 passed. Confirms waiting behavior, not complete approval integration reproduction. Add exact RED reproducer below before fixing.
- Last live waitDecision timed out15:54:24.284, resolver RPC15:54:47.481 expired; clicked-at timestamp missing, don't claim observed click time. Mechanism establishes early click CAN deadlock.

Acceptance:

1. Regression fake test: active same-session reply operation waits on pending plugin approval; dispatch authorized /approve plugin:<id> allow-once from Discord generic component command; assert resolver reaches gateway approval owner BEFORE releasing active operation or advancing expiry. Show RED then GREEN.
2. Route narrowly recognized approval control commands before normal agent-run admission OR a similarly bounded existing-owner control lane. Do not let arbitrary visible turns bypass session serialization. Preserve existing owner authorization, account/session target checks, operator scopes, exact request identity, allowed decisions and expiry enforcement. Never run LLM to interpret approval, never trust callback alone as authorization.
3. Tests unauthorized sender, deny, expired/unknown request, exec approval compatibility, normal message still waits, /stop behavior unchanged, originating run not aborted or completed by control lane, no duplicate resolution and no registry ownership corruption.
4. Keep narrow, reuse existing commands/approval services rather than duplicate resolver or broad special-case enabling all commands. No config changes, production requests, deployment or restarts. Timeout increase separately owned calm-wave-9279, not solution here.
5. Record focused checks and file/line final evidence. Remaining generic expired-card stale controls and selection of native-vs-generic transport are separate concerns, not required to inflate this repair.

Parent cool-wave-3470 report incorrectly ruled out generic dispatch based on native execapproval fixtures. Corrective investigation calm-cove-6633 is paused; do not wait on it or duplicate it. This repair is based on source+deployed-path ordering, with integration regression required to validate exact mechanism before patch.
