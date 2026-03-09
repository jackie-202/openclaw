# Create implementation plan: Group Chat Pipeline Stage 1 & 2

Read the full design document at:
/Users/michal/Projects/openclaw-fork/plans/005_group-chat-response-pipeline.md

Then create a detailed implementation plan covering:

## Phase 1: Shared GateContext layer

Define `GateContext` TypeScript interface in new file `src/auto-reply/reply/gate-context.ts`.

The interface should include:

- groupId, sessionKey, agentId
- rawMessage: string
- resolvedMentions: Map<string, string> (LID → display name)
- groupKnowledge: string (content of knowledge/groups/<group>.md)
- conversationHistory: string[] (recent messages, last 20)
- groupMembers: GroupMember[]
- senderName: string
- activation: 'always' | 'mention'

Create `resolveGateContext(params: GateContextParams): Promise<GateContext>` that consolidates:

- Mention resolution (from group-gate.ts `resolveAriaNames`)
- Knowledge loading (from group-context-priming.ts)
- History loading (from history.ts tail)
- Member roster lookup

## Phase 2: Security Gate

New file `src/auto-reply/reply/gate-security.ts`.

Export two functions:

1. `classifyInboundSecurity(ctx: GateContext): SecurityClassification` — scans raw message for social engineering patterns (asking about capabilities, Michal's personal info, system config). Returns `{ flagged: boolean, reason?: string, deflect?: string }`
2. `scanOutboundSecurity(text: string, ctx: GateContext): OutboundScanResult` — scans generated reply for: information leaks (personal names + details), system config mentions, capability descriptions, sentinel tokens (NO_REPLY, HEARTBEAT_OK, SILENT_REPLY_TOKEN appearing as visible text). Returns `{ safe: boolean, violations: string[], cleanedText?: string }`

## Phase 3: Refactor group-gate.ts to accept GateContext

Modify `src/auto-reply/reply/group-gate.ts`:

- Change `runGroupGate()` signature to accept `GateContext` (use pre-resolved context instead of reloading)
- Extend return type to include `relevanceSignals: { directAddress: boolean, topicExpertise: boolean, silenceBreaker: boolean, followUp: boolean }`
- These signals will be used downstream by Voice gate (future phase)

## Wire-up changes needed

In `src/web/auto-reply/monitor/on-message.ts`:

- Call `resolveGateContext()` once and pass it to both gate-security and group-gate
- Add security gate inbound check before group-gate call
- After processMessage() returns, call `scanOutboundSecurity()` before deliverWebReply()

## Output format

Write the detailed plan to:
/Users/michal/Projects/openclaw-fork/plans/008_group-chat-pipeline-stage1-2.md

Include:

- Exact TypeScript type definitions
- Function signatures with JSDoc
- File-by-file change list
- Implementation order
- How to test (unit test sketches)

Project root: /Users/michal/Projects/openclaw-fork
