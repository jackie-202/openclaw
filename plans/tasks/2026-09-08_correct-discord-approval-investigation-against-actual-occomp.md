# Correct Discord approval investigation against actual occomp card evidence

Read-only follow-up to cool-wave-3470, same batch. Its report plans/investigations/cool-wave-3470.md incorrectly assumes reported live card uses native execapproval and rules out generic session dispatch. This is contradicted by actual Discord readback. Correct the evidence-backed diagnosis before any runtime remedy. No production changes, live approvals, config edits or restarts.

Latest live evidence supplied by operator (local Europe/Prague 2026-09-08):

- Card message1546880893430403124 channel1483778179700228147 server-created15:52:24.651. Text starts '🚨 Plugin approval required', tool model_ops_register_installed_model, plugin model-ops-openclaw, request plugin:860743ca-c38e-45ec-93d2-72bb7f55a071, Expires in120s.
- Actual button custom_ids: Allow Once occomp:cid=btn_HPQFwPWK, Deny occomp:cid=btn_7SO8eL00. NOT execapproval. Message edited_timestamp=null and action buttons remain in readback after expiry.
- waitDecision returns after119920ms at15:54:24.284, tool timed out15:54:24.287.
- Separate expiry message1546881396981633074 created15:54:24.707, text '⏱️ Plugin approval expired. ID: plugin:860743ca-c38e-45ec-93d2-72bb7f55a071'. This is a NEW MESSAGE not expired-card edit.
- plugin.approval.resolve rejected unknown/expired at15:54:47.481 (0ms RPC); error message1546881493853413407 at15:54:47.803 exactly '❌ Failed to submit approval: unknown or expired approval id'. Text matches src/auto-reply/reply/commands-approve.ts, NOT native exec-approvals.ts error.
- No authoritative interaction receipt or click timestamp. Do not infer user delay.

Trace actual route: src/infra/exec-approval-forwarder.ts plugin strategy and src/infra/plugin-approvals.ts formatter -> generic presentation/occomp -> extensions/discord/src/monitor/agent-components.handlers.ts command fallback -> agent-components.dispatch.ts CommandSource:text/runChannelInboundEvent -> channel turn/session admission and commands-approve.ts -> plugin.approval.resolve. Compare actual source/built path identity when needed within repository only. Existing report inspected snapshot a213e22 while live status during latest test says0a91aae5; source differences must not be ignored.

Determine with fake characterization whether /approve callback can wait behind current same-session approval-waiting agent. Inspect dispatch-from-config.ts ensureDispatchReplyOperation/admitReplyTurn and placement of command processing relative to waitForActive. Do not blindly assume deadlock; identify exact owner if reproduced. Also trace why generic forwarding rather than native transport was selected, and why expired generic card buttons remain enabled. Preserve distinction between routing choice, stale UI, and actual delay cause.

Output own canonical investigation report and correct parent report's unsupported actual-card classification (documentation only). Provide exact source evidence, minimal reproducible fake test if existing fixtures support it, and task-ready correction only if root defect shown. If timing still missing say what exact instrumentation is required on GENERIC route, not native route. No security widening or timeout-only claimed fix. Parent299 tests only characterize native path and cannot validate this route. Existing timeout change remains separately owned calm-wave-9279.
