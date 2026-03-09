# Plan 005: Group Chat Response Pipeline — Documentation & Redesign

Jackie participates in WhatsApp group chats via the OpenClaw gateway. The response pipeline — deciding whether, when, and how to respond — has grown organically and now includes a "gate" component. This plan documents the existing pipeline end-to-end and proposes a multi-stage replacement that is smarter, safer, and better aligned with SOUL.md.

_Status: DRAFT_
_Created: 2026-03-08_

---

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research (codebase analysis + documentation review)
- [x] Phase 2: Knowledge (learnings + cross-cutting patterns)
- [x] Phase 3: Synthesis (5-stage pipeline design, implementation plan, files, testing)

## Problem

The group chat response pipeline has been extended incrementally. There is no single document that maps the full flow from incoming WhatsApp message to outgoing response (or silence). The current gate logic needs to be understood, documented, and then redesigned into a principled multi-stage pipeline with clear responsibilities: Security → Relevance → Data/Context → Voice.

### Two phases:

- **Phase A — Document:** Map the existing group chat pipeline end-to-end
- **Phase B — Redesign:** Design a multi-stage replacement pipeline

## Analysis [DONE]

### Codebase context [DONE]

#### A. Full pipeline flow (existing)

**Entry point:** WhatsApp message arrives via Baileys WS connection → `monitorWebInbox()` (`src/web/inbound.ts`) streams inbound messages.

**Monitor layer:** `monitorWebChannel()` in `src/web/auto-reply/monitor.ts` sets up the connection loop, creates the `onMessage` handler via `createWebOnMessageHandler()` (`src/web/auto-reply/monitor/on-message.ts`).

**Pipeline stages (current, in order):**

1. **Routing** — `resolveAgentRoute()` determines `sessionKey`, `agentId`, `accountId` based on channel + peer kind (group/direct) + peerId.

2. **Echo detection** — `echoTracker.has(msg.body)` skips messages that Jackie just sent.

3. **GROUP PATH (msg.chatType === "group"):**

   a. **Last-route update** — `updateLastRouteInBackground()` stores delivery context.

   b. **Group gating** — `applyGroupGating()` in `src/web/auto-reply/monitor/group-gating.ts`:
   - **Allowlist check** — `resolveGroupPolicyFor()` → `resolveChannelGroupPolicy()`: is this group in the allow list? (groupPolicy="open"|"allowlist")
   - **Member tracking** — `noteGroupMember()` records sender name/E164.
   - **Activation command parsing** — `/activation` commands from non-owners are blocked.
   - **Mention gating** — `debugMention()` + `resolveMentionGating()`: if activation mode is NOT "always", require an @mention, reply-to-self, or owner bypass.
   - If `shouldSkip` → record history entry, return `{ shouldProcess: false }`.

   c. **LLM group gate (Phase 1)** — `runGroupGate()` in `src/auto-reply/reply/group-gate.ts`:
   - Only runs when `activation === "always"` (always-on groups, i.e. `requireMention: false`).
   - Uses a cheap model (default `copilot/gpt-4o-mini`) with 10s timeout.
   - Reads recent session transcript (JSONL, last 20 messages).
   - Loads group knowledge files from workspace (`knowledge/groups/*.md`).
   - Builds a structured prompt asking whether Jackie should respond.
   - Resolves @-mention LIDs to human-readable names from participant roster.
   - On failure/timeout → defaults to `shouldRespond: true` (safe fallback).
   - If blocked → records history entry, returns early.

4. **Broadcast groups** — `maybeBroadcastMessage()` for multi-agent fan-out.

5. **Process message** — `processMessage()` in `src/web/auto-reply/monitor/process-message.ts`:
   - Builds `combinedBody` with history context (prepends recent group history entries).
   - Resolves per-group `systemPrompt` and `GroupMembers` context.
   - Builds full `ctxPayload` (MsgContext) with all fields: Body, ChatType, GroupSubject, GroupMembers, GroupSystemPrompt, SenderName, etc.
   - Calls `dispatchReplyWithBufferedBlockDispatcher()` → `getReplyFromConfig()` which runs the full LLM (Phase 2).
   - Delivers reply via `deliverWebReply()` to WhatsApp.
   - Clears group history buffer after sending.

#### B. Key files

| File                                             | Role                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| `extensions/whatsapp/src/channel.ts`             | WhatsApp channel plugin definition                                        |
| `src/web/auto-reply/monitor.ts`                  | WS connection loop, creates onMessage handler                             |
| `src/web/auto-reply/monitor/on-message.ts`       | **Main pipeline orchestrator** — routing, echo, gating, LLM gate, process |
| `src/web/auto-reply/monitor/group-gating.ts`     | Mention gating + allowlist check (Phase 0 gate)                           |
| `src/web/auto-reply/monitor/group-activation.ts` | Resolves activation mode (always/mention) per group                       |
| `src/auto-reply/reply/group-gate.ts`             | **LLM gate** — cheap model decides shouldRespond (Phase 1)                |
| `src/auto-reply/reply/group-context-priming.ts`  | Loads group knowledge files + previous session tail                       |
| `src/web/auto-reply/monitor/process-message.ts`  | Full message processing + LLM dispatch (Phase 2)                          |
| `src/web/auto-reply/monitor/group-members.ts`    | Group member name tracking                                                |
| `src/web/auto-reply/monitor/broadcast.ts`        | Broadcast group fan-out                                                   |
| `src/channels/mention-gating.ts`                 | Pure-function mention gate logic                                          |
| `src/auto-reply/group-activation.ts`             | Activation mode normalization                                             |
| `src/config/group-policy.ts`                     | Group policy resolution (allowlist, requireMention, tools)                |
| `src/auto-reply/reply/get-reply.ts`              | Full LLM reply resolution                                                 |
| `src/auto-reply/reply/history.ts`                | Group history buffer management                                           |

#### C. Gate architecture

**Gate 0 — Structural (synchronous, no LLM):**

- Allowlist: is this group allowed?
- Mention: was Jackie @mentioned, or is this a reply-to-self?
- Owner command bypass: owner can force processing with control commands.
- Activation mode: "always" bypasses mention requirement.

**Gate 1 — LLM gate (async, cheap model):**

- Only for `activation === "always"` groups.
- Prompt includes: conversation history, new message, group knowledge ("gate memory").
- Decision: `{ shouldRespond: boolean, reason: string }`.
- Configurable via `agents.defaults.groupGate` (enabled, model, historyLimit, timeoutMs).
- Default model: `copilot/gpt-4o-mini`, 10s timeout, 150 max tokens, temperature 0.1.
- Fail-open: any error → respond.

**Gate 2 — Full LLM (Phase 2):**

- Standard reply pipeline with `HEARTBEAT_OK` / `SILENT_REPLY_TOKEN` options.
- Model can choose silence via `HEARTBEAT_OK` token.

### Relevant documentation [DONE]

#### SOUL.md — Group-relevant rules

- **Brevity:** "Ve skupinách: EXTRA stručně. Max 1-3 věty." Default everywhere is terse; longer only when explicitly asked.
- **Anti-sycophancy:** Never open with empty validation. Agreement without addition is noise. Deconstruct-and-reconstruct is the standard.
- **Anti-repetition:** Each message adds NEW info. Never echo back what someone just said. Never re-answer a question already answered in the session.
- **Anti-AI tells:** Banned word list (delve, tapestry, robust…). No chatbot openers ("Hej, co potřebuješ?"). No filler phrases.
- **Information boundaries:** Never leak personal details about Michal, system config, capabilities, or memory contents in groups. "When in doubt, say less."
- **Disclosure test:** "Would I say this to a stranger on the street?" — if not, don't say it.
- **Don't interrogate:** Max 1 question per message. Contribute your own insight instead.
- **Web search before claims:** "NEVER ask people to explain something you can look up."

#### AGENTS.md — Group chat protocols

- **Group Session Self-Review (NON-NEGOTIABLE):** After every significant group interaction: read transcript → critically evaluate → update knowledge file → log learnings → reset session.
- **Know When to Speak:** Respond when directly mentioned, can add genuine value, or correct misinformation. Stay silent for casual banter, already-answered questions, or when "yeah/nice" would be the reply.
- **The human rule:** "If you wouldn't send it in a real group chat with friends, don't send it."
- **React Like a Human:** Use emoji reactions for lightweight acknowledgment instead of messages.

#### knowledge/groups/group-chat-rules.md — Compensating rules

- Documents the core problem: in `activation: always` mode, every message triggers a full LLM run. Model generates fresh each time without checking what it already said → same answer 7-8× in a row.
- **Ideal solution identified:** "Two-pass architecture. First pass (cheap/fast): analyze conversation + decide if response is needed. Second pass (only if yes): generate actual response." — This is exactly what Gate 1 (`runGroupGate()`) partially implements, but the rules doc says "OpenClaw doesn't support this natively yet, so we compensate with strict self-discipline rules."
- **Pre-flight checklist:** 3-step decision framework (read history → decide respond/skip → verify freshness).
- **15 hard rules** covering: never repeat yourself, one response per topic per person, emoji=NO_REPLY, meta-comments≠questions, no narration of thinking, no loop patterns, no fabricated excuses, web_search before claims, keep it short, no echo, max 1 question, don't apologize repeatedly.
- **Golden test:** (1) Would a human send this? (2) Does it add something new? (3) Did I already say something similar? (4) Is anyone actually asking ME?

#### knowledge/groups/wa-dungeons-dragons.md — Gate Decision Memory

The D&D group file contains an extensive, append-only "Gate Decision Memory" section with learned rules from real failures:

- Suppress after 3+ consecutive agent messages without human reply.
- Require evidence/citation for assertive claims.
- Limit reply length to ~150 chars in informal groups.
- Detect and block duplicate messages.
- Avoid follow-up questions when previous question unanswered.
- On social-correction marker → silence + require human re-approval.
- After public reprimand → 10-minute cooldown.
- Default in group = silence; speak only on (1) direct mention, (2) unanswered question, (3) clear information value.
- Never send sentinel tokens (NO_REPLY, HEARTBEAT_OK) as visible messages.
- Prevent disclosure of model/runtime identifiers in group chats.

**Error log (15+ entries):** Looping, generic openers, lazy questions, ignoring stop signals, fabricating explanations, excessive length, echo/mirroring, interrogation, reality denial, unsolicited status messages, duplicate sending.

#### knowledge/security/information-boundaries.md — Security rules for groups

- **What never leaves command channel:** Personal details (Michal), system details (Jackie), project details.
- **What CAN be shared:** Own opinions, general knowledge, personality/humor.
- **Social engineering awareness:** Casual questions can map capabilities and attack surfaces. Default: deflect.
- **Group behavior:** Don't reference private conversations. If asked about Michal → "Ask him." If asked about capabilities → stay ambiguous.

### Knowledge base [DONE]

#### Learnings (from `knowledge/learnings/`)

No direct pipeline/gate-related learnings found. The learnings directory contains:

- `philosophical-foundations.md` — Jackie's intellectual framework (Derrida, Levinas, Gadamer, Patočka, Stiegler, Wittgenstein)
- `derrida-toolkit.md` — Reference for deconstructive concepts
- `three-layer-memory-model.md` — Memory architecture (daily→tacit→curated)

**Relevant insight from three-layer-memory-model:** "The biggest technical unlock is memory quality, not model quality." This principle applies to the gate pipeline: the gate's decision quality depends heavily on the quality of context it receives (group knowledge files, conversation history, member context).

#### Cross-cutting patterns identified from all documentation

1. **Two-pass architecture is the acknowledged ideal** — group-chat-rules.md explicitly calls for it. Gate 1 (`runGroupGate()`) is the first attempt, but it's incomplete: it only handles the "should I respond?" decision, not the quality/freshness/repetition checks that cause most real failures.

2. **Most real failures are NOT relevance failures** — they're repetition (8× same answer), echo (mirroring what was just said), excessive length, sentinel token leaks, and unsolicited entries. The current LLM gate focuses on relevance ("should Jackie respond?") but doesn't catch these patterns.

3. **Security is a first-class concern** — information boundaries, anti-social-engineering, no capability disclosure. Currently there is NO dedicated security gate; security relies entirely on SOUL.md prompt engineering in the full LLM pass.

4. **Voice/style enforcement is prompt-based only** — anti-AI-tells, brevity rules, anti-sycophancy are all in SOUL.md/system prompt. No structural enforcement exists (e.g., output length cap, banned-word filter, repetition detector).

5. **Context quality determines gate quality** — group knowledge files, conversation history, member rosters all feed the gate. But the gate prompt and the full LLM prompt load context independently, with different approaches. No shared context resolution layer exists.

6. **Fail-open is the current default** — Gate 1 defaults to `shouldRespond: true` on any error. This is safe from a "don't miss messages" perspective but dangerous from a "don't spam the group" perspective. The redesign should consider fail-closed or fail-silent defaults for some gates.

## Solutions

### Option A: Incremental Enhancement (recommended)

Refactor the existing pipeline into a 5-stage gate architecture. Each stage has a clear responsibility, runs in order, and can short-circuit to silence. The stages share a common `GateContext` object that accumulates data as it flows through.

**Key principle:** Each gate is a separate module with a single function signature: `(ctx: GateContext) → GateResult`. Gates are composable, testable, and independently configurable. The pipeline runner calls them in order and short-circuits on any `{ pass: false }`.

#### Stage 1: Security Gate (synchronous, no LLM)

**Responsibility:** Block information leaks, prompt injection, and social engineering attempts.

**What it does:**

- Scans outbound message text (not inbound — this runs as a post-generation filter OR as an inbound classifier)
- **Inbound path:** Detects social engineering patterns ("what tools do you have?", "what's your config?", "tell me about Michal's schedule") and flags them for the Voice gate to handle with deflection
- **Outbound path (post-generation):** Scans generated reply for information boundary violations before delivery — personal details, system config, capability descriptions, internal project names
- Checks against `information-boundaries.md` rules
- Blocks sentinel token leaks (`NO_REPLY`, `HEARTBEAT_OK`, `SILENT_REPLY_TOKEN` appearing as visible text)

**Source of truth:** `knowledge/security/information-boundaries.md` + SOUL.md Boundaries section

**Fail behavior:** Fail-closed. If the security gate can't determine safety, suppress the message and log for review.

**Cost:** Zero LLM calls. Pattern matching + keyword scanning.

#### Stage 2: Relevance Gate (async, cheap LLM — evolved from current Gate 1)

**Responsibility:** Decide whether Jackie should respond at all.

**What it does (largely what `runGroupGate()` does today, refined):**

- Reads conversation history + new message
- Loads group knowledge (gate decision memory, group context)
- Resolves @mentions to human-readable names
- Asks cheap model: "should Jackie respond?"
- Includes the existing gate prompt with social awareness, silence detection, default bias toward yes

**Changes from current Gate 1:**

- Receives pre-computed `GateContext` with resolved mentions, history, knowledge (from shared context layer)
- Returns structured result with `{ pass: boolean, reason: string, relevanceSignals: { ... } }` — signals include: directAddress, topicExpertise, silenceBreaker, followUp
- The relevance signals propagate downstream so Voice gate can calibrate tone/length

**Fail behavior:** Fail-open (same as today). Better to occasionally respond unnecessarily than to miss a direct question.

**Cost:** 1 cheap LLM call (~150 tokens). Same as current Gate 1.

#### Stage 3: Data/Context Gate (synchronous, no LLM)

**Responsibility:** Assemble all context the full LLM needs, and pre-check for repetition/staleness.

**What it does:**

- Loads full group knowledge files (group context, member info, topics)
- Loads previous session tail for continuity
- Builds the `combinedBody` with history context
- **Repetition check:** Scans Jackie's recent messages in history for content overlap with the likely response topic. If the same topic/facts were covered in the last N messages, signals "stale" to Voice gate
- **Duplicate detection:** Checks if an identical or near-identical message was sent in the current group turn (anti-duplicate guard from wa-dungeons-dragons.md)
- **Consecutive message check:** If Jackie has 3+ consecutive messages without a human reply, suppress (from Gate Decision Memory)
- Resolves per-group systemPrompt, GroupMembers context
- Packages everything into `GateContext.fullContext` for the LLM

**This stage absorbs logic currently split between:**

- `group-context-priming.ts` (knowledge loading)
- `process-message.ts` (history building, context assembly)
- Some of the wa-dungeons-dragons.md gate rules (repetition, duplicate, consecutive)

**Fail behavior:** If context loading fails, proceed with degraded context (current behavior). If repetition/duplicate check trips, suppress.

**Cost:** Zero LLM calls. File I/O + string matching.

#### Stage 4: Voice Gate (synchronous or cheap LLM, optional)

**Responsibility:** Enforce style, length, and tone constraints BEFORE the full LLM runs.

**Two implementation options:**

**4a. Rule-based (simpler, recommended first):**

- Injects a calibrated system prompt suffix based on accumulated gate signals:
  - If relevanceSignals.directAddress → allow normal length (1-3 sentences)
  - If relevanceSignals.silenceBreaker → allow slightly longer, warmer tone
  - If topic is casual banter → hard cap 1 sentence
  - If recent reprimand detected in history → inject cooldown instruction
- Scans inbound for tone markers ("stručně", "nerozkecávej", ironic teasing about verbosity) → triggers ultra-terse mode
- Adds anti-AI-tell word filter as a post-processing step (scan output, flag banned words)
- Enforces max output length based on context (150 chars for banter, 500 for direct questions, uncapped for explicit "explain" requests)

**4b. LLM-based (future, optional):**

- Second cheap LLM call that takes the generated draft and rewrites it for voice/length compliance
- Only needed if rule-based approach proves insufficient

**Fail behavior:** If voice rules can't be determined, default to terse mode (safer in groups).

**Cost:** Zero LLM calls (option 4a). One additional cheap call (option 4b).

#### Stage 5: Async/Delivery Gate (synchronous, post-generation)

**Responsibility:** Final safety net before message delivery.

**What it does:**

- **Outbound security scan** (Stage 1 outbound path runs here): check generated text for information leaks, sentinel tokens, model identifiers
- **Length enforcement:** Hard cap on character count based on Voice gate signals. Truncate if exceeded.
- **Deduplication:** Check if this exact text (normalized) was already sent in this group turn. If so, suppress.
- **Cooldown check:** If a reprimand/correction was detected in recent messages, check if cooldown period has elapsed
- **Delivery decision:** If all checks pass, deliver. Otherwise, log the suppressed message and return silence.

**Fail behavior:** Fail-closed. Any doubt → suppress and log.

**Cost:** Zero LLM calls.

### Option B: Full rewrite with middleware pipeline

Replace the entire `on-message.ts` → `process-message.ts` chain with a generic middleware pipeline where each gate is a middleware function. More flexible but higher risk and more work. Defer to Option B only if Option A's stage boundaries prove too rigid.

### Recommended: Option A

The 5-stage architecture maps cleanly onto existing code boundaries, can be implemented incrementally (one stage at a time), and addresses all documented failure modes from the error logs.

## Implementation

### Phase 1: Shared context layer (`GateContext`)

1. Define `GateContext` type in new file `src/auto-reply/reply/gate-context.ts`
2. Move context resolution (mention resolution, history loading, knowledge loading) from scattered locations into a single `resolveGateContext()` function
3. Both the relevance gate and the full LLM use the same resolved context — no duplicate loading

### Phase 2: Refactor existing Gate 1 → Stage 2 (Relevance)

1. Extract `runGroupGate()` interface to accept `GateContext` instead of raw params
2. Add `relevanceSignals` to the return type
3. Update gate prompt to emit structured signals (not just boolean)
4. Keep backward compatibility: `runGroupGate()` remains the entry point, just with richer input/output

### Phase 3: Add Stage 3 (Data/Context) — repetition & duplicate checks

1. New file: `src/auto-reply/reply/gate-data-context.ts`
2. Implement repetition detector: compare current message topic against Jackie's last N messages
3. Implement duplicate detector: normalized text comparison within group turn
4. Implement consecutive-message check (3+ without human reply → suppress)
5. Wire into pipeline between Stage 2 and `processMessage()`

### Phase 4: Add Stage 1 (Security) and Stage 5 (Delivery)

1. Stage 1: `src/auto-reply/reply/gate-security.ts` — inbound social engineering classifier + outbound leak scanner
2. Stage 5: `src/auto-reply/reply/gate-delivery.ts` — final outbound filter (sentinel tokens, dedup, cooldown, length)
3. Wire Stage 1 at the start of the pipeline (after structural gating, before LLM gate)
4. Wire Stage 5 after `processMessage()` returns, before `deliverWebReply()`

### Phase 5: Add Stage 4 (Voice)

1. `src/auto-reply/reply/gate-voice.ts` — rule-based voice calibration
2. Reads relevance signals from Stage 2 + data context from Stage 3
3. Produces a system prompt suffix or post-processing filter for the full LLM
4. Wire between Stage 3 and `processMessage()`

### Phase 6: Pipeline runner

1. New file: `src/auto-reply/reply/group-pipeline.ts` — orchestrates all 5 stages in order
2. `on-message.ts` calls `runGroupPipeline()` instead of separate `applyGroupGating()` + `runGroupGate()` + `processMessage()` calls
3. Old functions remain as thin wrappers for backward compatibility during transition

### Backward compatibility

- `wa-gate-lessons` cron: Currently reads `wa-gate-lessons-state.json` and updates group knowledge files. The new pipeline reads the same files, so the cron continues to work unchanged.
- Existing group knowledge files (`knowledge/groups/*.md`): Read by Stage 2 (relevance) and Stage 3 (data/context). No format changes needed.
- Configuration: `agents.defaults.groupGate` continues to work. New stages add optional config keys under `agents.defaults.groupPipeline.*`.
- The `activation` mode system (always/mention) is unchanged. The new stages only run when `activation === "always"` (same as current Gate 1).

## Files to Modify

| File                                            | Action                                                              | Stage   |
| ----------------------------------------------- | ------------------------------------------------------------------- | ------- |
| `src/auto-reply/reply/gate-context.ts`          | **NEW** — GateContext type + resolveGateContext()                   | Phase 1 |
| `src/auto-reply/reply/group-gate.ts`            | **MODIFY** — accept GateContext, return relevanceSignals            | Phase 2 |
| `src/auto-reply/reply/group-context-priming.ts` | **MODIFY** — expose context loading for shared use                  | Phase 1 |
| `src/auto-reply/reply/gate-data-context.ts`     | **NEW** — repetition/duplicate/consecutive checks                   | Phase 3 |
| `src/auto-reply/reply/gate-security.ts`         | **NEW** — inbound classifier + outbound leak scanner                | Phase 4 |
| `src/auto-reply/reply/gate-delivery.ts`         | **NEW** — final outbound filter                                     | Phase 4 |
| `src/auto-reply/reply/gate-voice.ts`            | **NEW** — voice/style calibration rules                             | Phase 5 |
| `src/auto-reply/reply/group-pipeline.ts`        | **NEW** — pipeline runner orchestrating all stages                  | Phase 6 |
| `src/web/auto-reply/monitor/on-message.ts`      | **MODIFY** — replace inline gate/process calls with pipeline runner | Phase 6 |
| `src/web/auto-reply/monitor/process-message.ts` | **MODIFY** — accept voice calibration context from Stage 4          | Phase 5 |
| `src/web/auto-reply/monitor/group-gating.ts`    | **KEEP** — structural Gate 0 stays as-is (mention/allowlist)        | —       |
| `src/auto-reply/reply/history.ts`               | **KEEP** — history buffer unchanged, consumed by Stage 3            | —       |
| `src/config/group-policy.ts`                    | **KEEP** — policy resolution unchanged                              | —       |

## Testing

### Unit tests (per stage)

- **Stage 1 (Security):** Test pattern matching for social engineering phrases, information boundary keywords, sentinel token detection. Test with known-good and known-bad messages from error log.
- **Stage 2 (Relevance):** Existing `runGroupGate()` tests + new tests for relevanceSignals output. Test with transcripts from wa-dungeons-dragons.md failure cases.
- **Stage 3 (Data/Context):** Test repetition detection (same topic N times), duplicate detection (normalized text match), consecutive message counting.
- **Stage 4 (Voice):** Test system prompt suffix generation for different signal combinations. Test banned word detection.
- **Stage 5 (Delivery):** Test sentinel token filtering, length enforcement, deduplication.

### Integration tests

- **Pipeline runner:** Full pipeline with mocked LLM calls. Test short-circuit behavior: if Stage 1 blocks, Stage 2+ never runs. If Stage 3 detects repetition, LLM is never called.
- **Backward compatibility:** Run existing test suite to verify no regressions in `on-message.ts` flow.

### Manual validation

- Replay documented failure scenarios from wa-dungeons-dragons.md error log:
  - 7× repeated Evolution API report → Stage 3 should catch by message 2-3
  - Generic opener "Hej, co potřebuješ?" → Stage 4 banned phrase filter
  - "Moltbook neexistuje" without web search → Stage 1 or Stage 4 hedging rule
  - Sentinel token "NO_REPLY" visible in chat → Stage 5 should catch
  - Unsolicited "Jackie online" → Stage 2 relevance gate should block

## Dependencies

- **No new external dependencies.** All gates use existing infrastructure (file I/O, string matching, existing LLM client).
- **Stage 2 (Relevance)** depends on existing `completeSimple` from `@mariozechner/pi-ai` — no change.
- **Configuration extension:** New optional keys under `agents.defaults.groupPipeline` (each stage independently configurable). Backward-compatible: if not set, current behavior preserved.
- **wa-gate-lessons cron:** No changes needed. The cron writes to `knowledge/groups/*.md` which the new pipeline reads as before.
- **Knowledge files:** No format changes. The existing `Gate Decision Memory` section in group knowledge files is consumed by Stage 2 (relevance gate prompt) exactly as today.
