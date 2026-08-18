# Audit inbound claim compatibility across fork and current upstream

## Scope

This report compares:

- pre-change fork parent `c387494b4769fd0d2ec94929262a9be4fbbc5b05`;
- introducing fork commit `da1059a30450d2633635e8331a43ba5a4d890b8c`;
- final fork revision `03639ab0774c8a7a47f5301457e6c76a0474c415`;
- pinned upstream revision `4b85d834ed1586062f31bded2f358fc5192d1674`; and
- the retained Deliberation files in the worktree, which have no diff from `03639ab0774c8a7a47f5301457e6c76a0474c415` for the registration, intake, route matching, manifest, and focused tests inspected here.

The proposal requires consumer-by-consumer proof of ordering, cancellation, error isolation, and fallback before integration (`docs/proposals/proposal-20260809-165021-f994b3_openclaw-upstream-sync-compatibility-review.md:63-67`). This investigation used repository source, committed tests, Git object history, and that proposal only. It did not run product code, tests, builds, inspect live configuration, or inspect another repository. Consequently, Codex findings below cover only the OpenClaw hook and binding control flow, not the external Codex protocol/runtime contract.

## Revision reconstruction

`da1059a30450` changes only `src/auto-reply/reply/dispatch-from-config.ts` and its test. Its production addition is a second, global `runInboundClaim` call after the existing binding-targeted path and before observation hooks and ordinary dispatch (`da1059a30450:src/auto-reply/reply/dispatch-from-config.ts:1903-1930`). The parent already had the targeted outcome path. Between `da1059a30450` and final fork `03639ab0774`, the only change to the production dispatch module is an unrelated four-line channel-model guard removal; the hook runner and inbound-claim tests have no intervening change. Therefore `03639ab0774` preserves the introduced broadcast semantics.

Pinned upstream retains all three runner methods, but production dispatch calls only `runInboundClaimForPluginOutcome`; `runInboundClaim` and `runInboundClaimForPlugin` have no non-test caller (`4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/hooks.ts:1053-1092`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:196-223`). Its public documentation makes this intentional: `inbound_claim` is not global and is invoked only for the core-managed conversation-binding owner (`4b85d834ed1586062f31bded2f358fc5192d1674:docs/plugins/hooks.md:168-185`).

## Final fork sequence

The sequence below is the exact normal-path ordering at `03639ab0774`. Fire-and-forget observation hooks are scheduled in this order; their asynchronous completion is not ordered against later stages.

| Order | Stage | Claim or terminal behavior | Evidence |
| --- | --- | --- | --- |
| 1 | Load runtime plugins and derive one canonical hook event/context pair | The same pair is reused by targeted and broadcast calls. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1350-1370` |
| 2 | Resolve a core-managed plugin-owned binding | Lookup uses resolved channel, account, conversation, and parent conversation. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1557-1573` |
| 3 | Resolve source delivery/send policy | Targeted claims may be skipped under denied automatic delivery; the later broadcast has no equivalent policy gate. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1575-1732`, `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1781-1798` |
| 4 | Claim inbound dedupe | Cached duplicates and same-process in-flight duplicates stop before any claim hook. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1734-1746` |
| 5 | Run the binding-targeted outcome claim, if eligible | The binding owner runs before every global claimant, regardless of global hook priority. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1781-1819` |
| 6 | Handle targeted outcome | `handled` optionally delivers `result.reply`, commits dedupe, and terminates. `missing_plugin`/`no_handler` may issue one additive notice then continue. `declined`/`error` issue terminal sanitized notices, commit dedupe, and terminate. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1819-1897` |
| 7 | Run global `runInboundClaim` | Every registered plugin is eligible. First handled result terminates. Unclaimed or isolated handler failure continues. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1899-1925` |
| 8 | Schedule `message_received` | A global claim schedules the plugin observation hook only. An unclaimed event schedules plugin observation and then the internal `message:received` hook. Targeted terminal outcomes schedule neither. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1909-1949` |
| 9 | Mark processing, then fast abort | The global claim therefore precedes `/stop`-style fast abort handling. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1951-2000` |
| 10 | Acquire dispatch operation, then run `before_dispatch` | A handled result may send text, commits dedupe, and terminates. Deliberation uses this as an independent fail-closed guard. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1997-2000`, `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:2142-2192` |
| 11 | Run `reply_dispatch` | A handled result commits dedupe and terminates. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:2194-2237` |
| 12 | Enter `replyResolver` | Inline command handlers run before `before_agent_reply`; terminal command replies bypass agent execution. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:2513-2528`, `03639ab0774:src/auto-reply/reply/get-reply.ts:823-870`, `03639ab0774:src/auto-reply/reply/get-reply-inline-actions.ts:586-637` |
| 13 | Run `before_agent_reply`, then agent execution | A handled synthetic reply or silence stops the LLM. Otherwise the prepared agent run starts. | `03639ab0774:src/auto-reply/reply/get-reply.ts:930-985` |
| 14 | Deliver normal replies and finalize | Delivery completes, then dedupe is committed, processing is recorded, idle is marked, and the dispatch operation completes. | `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:2893-2944`, `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:3031-3069` |

### Targeted binding eligibility and fallback

The binding owner is bypassed for recognized authorized native/text/plugin commands and skipped when source delivery policy makes non-rewindable plugin output unsafe. Both cases fall through to the old global broadcast (`03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1781-1798`). An authorized unknown slash remains binding-owned; a recognized command escapes to ordinary command handling (`03639ab0774:src/auto-reply/reply/dispatch-from-config.test.ts:5694-5757`).

For `missing_plugin` and `no_handler`, final fork falls back to OpenClaw after a once-per-startup additive notice, but invokes the global broadcast before doing so (`03639ab0774:src/auto-reply/reply/dispatch-from-config.test.ts:5961-6104`). An unmentioned group/channel fallback is terminally silent even if mention enforcement is disabled (`03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1836-1854`). `declined` and `error` are terminal, retain the binding, do not invoke the global runner, and keep raw error details out of the user notice (`03639ab0774:src/auto-reply/reply/dispatch-from-config.test.ts:6106-6220`).

### Global handled-path defects

The global block is capability evidence, but not a safe implementation to cherry-pick:

- It ignores `PluginHookInboundClaimResult.reply` even though the result type supports it. The block has no delivery call (`03639ab0774:src/plugins/hook-types.ts:411-414`, `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1904-1924`).
- It returns without `commitInboundDedupe` or `releaseInboundDedupe`. A successful `claimInboundDedupe` inserts the key into a process-global `Set`; only commit/release removes it, so a globally claimed message key remains in-flight for the process lifetime rather than entering the bounded 20-minute committed cache (`03639ab0774:src/auto-reply/reply/inbound-dedupe.ts:14-31`, `03639ab0774:src/auto-reply/reply/inbound-dedupe.ts:95-127`).
- It runs before a dispatch operation is acquired and has no post-await abort check. A handler without its own timeout can delay pre-dispatch cancellation indefinitely (`03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1899-2000`).
- It marks idle before recording processed and returns a bare result without the normal source-delivery-mode attachment or operation completion (`03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1921-1923`).
- It emits plugin `message_received` but suppresses the internal observation hook, while targeted handled claims suppress both (`03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1909-1949`).

The introducing test proves short-circuiting, plugin observation, and absence of internal hooks, resolver execution, and all dispatcher output, but does not assert reply delivery or dedupe settlement (`03639ab0774:src/auto-reply/reply/dispatch-from-config.test.ts:4898-4965`).

## Runner semantics

The final fork and pinned upstream runner semantics are materially the same; the incompatibility is production invocation and payload, not the first-claim algorithm.

| API | Selection and ordering | Result | Errors and timeouts | Fallback meaning |
| --- | --- | --- | --- | --- |
| `runInboundClaim` | All `inbound_claim` registrations, descending numeric priority; equal-priority handlers retain registration order. Sequential, first `handled: true` wins. | Winning result or `undefined`. | Handler throw/timeout is logged and the next claimant runs. | `undefined` conflates no hooks, all declines/void, and all isolated failures. |
| `runInboundClaimForPlugin` | Same algorithm after filtering to one plugin id. | Winning result or `undefined`. | Same fail-open behavior. | Cannot distinguish missing plugin, no handler, decline, or isolated errors. |
| `runInboundClaimForPluginOutcome` | Checks loaded plugin, then priority-ordered registrations for that plugin. | `handled`, `missing_plugin`, `no_handler`, `declined`, or `error`. | A later handled result wins after an earlier error. If none handles, the first sanitized error yields `error`; otherwise the result is `declined`. | Gives dispatch enough information to choose additive fallback versus a terminal notice. |

Priority sorting and first-claim execution are defined at `03639ab0774:src/plugins/hooks.ts:272-289` and `03639ab0774:src/plugins/hooks.ts:689-807`; pinned upstream retains the same behavior at `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/hooks.ts:254-281` and `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/hooks.ts:789-912`. The focused tests prove first claimant wins, a throwing claimant does not block the next one, plugin filtering, each targeted outcome, and registration timeout classification (`03639ab0774:src/plugins/wired-hooks-inbound-claim.test.ts:49-213`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/wired-hooks-inbound-claim.test.ts:51-216`).

There is no default timeout for `inbound_claim` in either revision. Final fork falls back from a registration timeout to the modifying-hook timeout map, which has no `inbound_claim` entry; pinned upstream directly uses only the registration timeout (`03639ab0774:src/plugins/hooks.ts:220-233`, `03639ab0774:src/plugins/hooks.ts:543-566`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/hooks.ts:625-644`).

## Pinned upstream sequence

Pinned upstream refactors dispatch into phases and deliberately removes the global production call:

1. Gather/finalize context and return immediately if the caller is already aborted (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.gather.ts:60-85`).
2. Resolve source policy and the canonical binding lookup, claim durable/process dedupe, and mark processing (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-context.ts:90-104`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-context.ts:301-405`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-context.ts:460-483`).
3. Run fast abort and fast approval before acquiring the operation and before any targeted claim (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:51-161`).
4. Acquire lifecycle admission, then run only the binding owner's `runInboundClaimForPluginOutcome`, with staged media, current owner authorization, binding context, a post-await abort check, transcript persistence, dedupe settlement, and operation completion (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:147-331`).
5. If no targeted terminal result occurs, schedule plugin and internal `message_received` together, then run `before_dispatch`, `reply_dispatch`, commands, and agent execution (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:335-336`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/message-received-hooks.ts:14-56`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.choose-route.ts:529-650`, `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.execute.ts:103-125`).

Pinned tests explicitly prove that an unbound hook is not broadcast and ordinary resolution continues (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.lifecycle-and-bindings.test-utils.ts:59-105`). They also prove `missing_plugin` and `no_handler` fall through without global invocation, while `declined` and `error` remain terminal (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.delivery-and-tts.test-utils.ts:473-732`). Pinned fallback is slightly different from final fork: an unmentioned group fallback is suppressed only when `GroupRequireMention !== false`, so explicitly mention-free groups continue to OpenClaw (`4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:254-278`).

## Payload comparison

| Payload dimension | Final fork | Pinned upstream | Compatibility impact |
| --- | --- | --- | --- |
| Core route and identity | Content/body/transcript, timestamp, channel/account/conversation/parent, sender, message/thread/session/run ids, reply fields, group/mention/command facts. | Retains these fields and adds `agentId`, `replyToIdFull`, and quote identity. | Additive for Codex and most targeted consumers. |
| Event classification | Top-level host-authoritative `provider`, fixed `eventType: "message"`, and `eventKind`. | These top-level fields are absent. Provider remains only in metadata; no `eventKind` equivalent is projected. | Deliberation's exact admission guard rejects every pinned payload even if a caller is added. |
| Authorization | `commandAuthorized`. | Adds `senderIsOwner` for the targeted binding owner. | Stronger current trust fact; no loss for Codex's current code. |
| Media | Legacy singular/plural aliases in metadata. | Ordered staged `media`, original media, staging state, plus compatibility aliases. | Richer current attachment contract, but not a routing replacement. |
| Binding | `ctx.pluginBinding` only on targeted calls. | Same, with one canonical current binding and lifecycle admission. | Exact requirement for Codex; unavailable to unbound Deliberation. |
| Result | `{ handled, reply? }`. | Same. | Runner contract is source-compatible, but old broadcast ignored `reply`. |

Final fork definitions and projection are at `03639ab0774:src/plugins/hook-message.types.ts:59-100` and `03639ab0774:src/hooks/message-hook-mappers.ts:311-394`. Pinned definitions and projection are at `4b85d834ed1586062f31bded2f358fc5192d1674:src/plugins/hook-message.types.ts:93-139` and `4b85d834ed1586062f31bded2f358fc5192d1674:src/hooks/message-hook-mappers.ts:371-490`.

## Consumer ledger

| Consumer | Registration and activation chain | Final fork behavior | Pinned API mapping | Migration assessment |
| --- | --- | --- | --- | --- |
| Codex conversation binding | Plugin entry registers `inbound_claim`; `/codex bind` requests a core conversation binding; core stores plugin owner metadata; dispatch resolves that record and targets its plugin id. | Handler returns `undefined` without `ctx.pluginBinding`; every actual bound branch returns terminal handled, optionally with a reply. A bound handled result prevents the later broadcast, so the global patch is not needed for Codex. | `runInboundClaimForPluginOutcome` is the exact owner-targeted route and pinned upstream already uses it. | No hook migration required. Current upstream additionally stages media, passes owner status, serializes lifecycle work, persists the bound user turn, settles dedupe, and completes the operation. |
| Deliberation retained baseline | Manifest declares startup activation and four expected hooks; entry registers `inbound_claim` and `before_dispatch` at priority 1000; loader-backed and built-plugin tests prove registration when enabled. | Exact configured Discord `user_request` events are synchronously sent to KM. Success returns handled with no reply. Disabled/unmatched/malformed/failure returns false; the independent `before_dispatch` source match then silently terminates failures. | No production caller reaches this unbound registration. `runInboundClaim` still exists internally but is not dispatched. Targeted APIs require a core-managed binding that Deliberation does not own. | Blocked without semantic adaptation. Pinned payload also lacks the required top-level provider/event type/event kind, so merely restoring a call is insufficient. |

Codex evidence: `03639ab0774:extensions/codex/index.ts:27-44`, `03639ab0774:extensions/codex/index.ts:123-131`, `03639ab0774:extensions/codex/src/command-handlers.ts:655-722`, `03639ab0774:src/plugins/conversation-binding.ts:591-623`, and `03639ab0774:extensions/codex/src/conversation-binding.ts:210-293`. Pinned upstream retains the registration at `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/index.ts:277-288`, requires a public binding at `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/conversation-binding.ts:301-320`, and returns handled for the full bound execution path at `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/conversation-binding.ts:321-427`.

Deliberation evidence: `extensions/deliberation/openclaw.plugin.json:5-13`, `extensions/deliberation/index.ts:10-23`, `extensions/deliberation/src/intake.ts:58-114`, and `extensions/deliberation/src/route-match.ts:64-109`. Existing tests prove priority/registration (`extensions/deliberation/src/plugin.test.ts:5-42`), successful terminal intake and failure-to-guard behavior (`extensions/deliberation/src/hooks.test.ts:431-487`, `extensions/deliberation/src/hooks.test.ts:613-660`), loader activation and global runner execution (`03639ab0774:src/plugins/source-checkout-runtime.test.ts:55-89`, `03639ab0774:src/plugins/source-checkout-runtime.test.ts:91-211`), and the Discord host-to-hook event shape (`03639ab0774:extensions/discord/src/monitor/message-handler.process.test.ts:600-707`). Repository evidence proves loadability when configured but, under the no-live-config scope, does not prove that a particular deployment currently enables the plugin.

## Semantic matrix

| Dimension | Final fork broadcast | Pinned upstream targeted behavior | Finding |
| --- | --- | --- | --- |
| Eligibility | Every loaded registration can observe every dedupe-accepted, non-target-terminal inbound event. | Only the owner of a core-managed conversation binding is invoked. | Not equivalent for unbound consumers. |
| Relative order | After targeted binding, before observation, fast abort, ordinary commands, and agent dispatch. | Fast abort/approval precede targeted claims; no unbound claim stage exists. | A replacement cannot preserve fast-command interception without an explicit ordering decision. |
| Multiple claimants | Descending priority, sequential, first handled wins. Deliberation priority 1000 precedes default-priority Codex only in the global phase; the binding owner always precedes both. | Same runner algorithm inside one targeted plugin, but no cross-plugin competition in production. | Cross-plugin arbitration is removed, not replaced. |
| Handler failure | Logged and fail-open to the next global claimant or ordinary fallback. | Within the target, later handlers may still claim; otherwise dispatcher receives terminal `error`. | Same runner isolation, different dispatch policy. |
| Timeout | Registration timeout only in practice; no default. | Registration timeout only. | Equivalent runner risk; current lifecycle ownership is stronger. |
| Unclaimed | Continue to plugin/internal observation, fast abort, `before_dispatch`, commands, and agent. | Unbound registrations are never called. Missing/no-handler bound owners issue notice as applicable and continue directly to observation/ordinary dispatch. | Same eventual fallback only when the old global phase would be a no-op. |
| Handled reply | Result type permits reply, but broadcast discards it. | Targeted path conditionally delivers the reply under source policy. | Current targeted behavior is stronger; old global behavior is defective. |
| Dedupe | Global handled path leaves the key permanently in the in-flight set. | Every targeted terminal path commits dedupe; error handling releases only replay-safe failed work. | Current targeted behavior is stronger; exact old patch is unsafe. |
| Observation | Global handled schedules plugin `message_received`, skips internal observation. Targeted handled skips both. | Targeted handled skips both; unclaimed paths schedule plugin and internal observations together. | No pinned equivalent for the broadcast observation asymmetry. |
| Cancellation/lifecycle | Broadcast runs before operation acquisition and lacks post-await abort handling. | Caller pre-abort, operation admission, lifecycle serialization, and post-claim abort checks surround targeted work. | Current targeted behavior is stronger; a new global phase must join this lifecycle. |
| Commands | Global claimant can preempt fast abort and all ordinary commands. Recognized commands bypass the binding owner but still enter the global phase. | Fast abort/approval preempt claims; recognized binding commands bypass targeted claim and no global claim follows. | Deliberation cannot preserve all command intake/silence through current hooks. |
| Send policy | Targeted claim may be skipped, but global claim still executes and can stop processing even when delivery is denied. | Targeted claim is skipped and ordinary suppressed processing continues. | Different processing semantics under deny. |
| Payload | Includes authoritative top-level provider/type/kind used by Deliberation. | Adds media/owner/reply facts but removes those top-level classification fields. | Richer in some dimensions, incompatible in the one Deliberation enforces. |

## Adaptation requirements

### Codex

No carry-forward of `da1059a30450` is needed for Codex. Preserve the pinned targeted dispatch and binding ownership model. Any integration must retain the pinned current handler and binding data migrations as a unit; this report does not substitute for external Codex protocol/runtime proof.

### Deliberation

No existing pinned API is a lossless replacement:

- `runInboundClaimForPluginOutcome` would require Deliberation to own a core conversation binding for every configured source. That changes the product from an unbound source claimant to the exclusive binding owner, introduces approval/binding lifecycle and persisted record migration, and can conflict with another binding owner.
- `before_dispatch` is awaited and can combine intake with silence for ordinary turns, and pinned upstream has added message id to its event/context. It still runs after plugin/internal observation and after fast abort/approval, lacks event-kind and rich media admission facts, and is not reached after another binding owner terminates. It is therefore an adaptation with semantic loss, not a drop-in replacement.
- `message_received` is global but fire-and-forget. It cannot synchronously establish KM durability before dispatch and cannot claim/suppress a turn. Pairing it with `before_dispatch` introduces a race between intake and terminal silence.
- `before_agent_reply` and `before_agent_run`, as documented upstream, occur after command handling and session preparation and do not provide the original pre-command route/classification contract (`4b85d834ed1586062f31bded2f358fc5192d1674:docs/plugins/hooks.md:181-185`).

Retaining the capability on pinned upstream requires a clean, generic current-architecture design rather than the old block:

1. Add an explicit unbound/global claim phase with owner-approved precedence relative to fast abort/approval and targeted binding. If historical behavior is required, targeted owner remains first and global claim remains before fast commands.
2. Reuse one canonical terminal completion path for optional reply delivery, source/send policy, plugin/internal observation policy, dedupe commit/release, processed/idle markers, operation completion, and audit state. Do not copy the old early return.
3. Place global claims inside current dispatch lifecycle admission, with pre/post abort handling and a deliberate timeout contract.
4. Restore or replace the host-authoritative provider, fixed message type, and inbound event-kind facts in the SDK payload. Deliberation must not infer `user_request` from display text or mutable names.
5. Preserve binding-owner exclusivity and avoid double invocation. A targeted handled/declined/error outcome must remain terminal; behavior after missing/no-handler and command bypass must be specified and tested.
6. Keep first-claim ordering deterministic and test Deliberation's priority against at least one lower-priority claimant, one throwing claimant, and one timeout.
7. Add regression proof for global `reply`, dedupe replay, fast commands, recognized plugin commands, send-policy deny, message observations, missing/no-handler fallback, source abort during a handler, media-only intake, and current lifecycle completion.

## Configuration and state migration

`da1059a30450` adds no configuration/schema or persisted-state surface, so the core hook capability itself requires no config migration. Deliberation's retained plugin manifest/config and activation are a separate proposal family and must be carried or adapted together; enabling the core phase alone does not load or configure that plugin.

If the targeted-binding alternative is chosen instead, migration is substantial: create or approve canonical binding records for every configured source, choose target session keys, resolve conflicts with existing owners, define detach/repair behavior, and migrate operator configuration. Repository-only evidence cannot preview actual records or deployment configuration, and this investigation intentionally did not inspect them.

## Risks and unresolved proof

- Carrying the exact old block would retain a process-lifetime in-flight dedupe leak, ignored replies, weak cancellation, and inconsistent observation/finalization.
- Dropping the capability makes retained Deliberation silently fail its main function: `inbound_claim` remains registered but is never called, while `before_dispatch` can continue suppressing source traffic. The result is silence without KM intake.
- Moving intake to `before_dispatch` changes fast-command, observation, media, and event-kind behavior. That change needs an explicit product decision, not an API rename.
- Binding Deliberation sources changes ownership and persisted state. It is not a transparent migration.
- Existing source tests are strong evidence but were not executed under this investigation's no-code/no-tests boundary. Later implementation proof must run focused hook, dispatch, loader, built-plugin, and Discord integration tests required by the proposal.
- Live activation and live configuration remain unknown by scope. This does not change the source-level fact that the retained consumer has no pinned-upstream caller.

- **Verdict:** `FORK-ONLY RETAIN`
- **Confidence:** High for the source-level capability decision; medium-high for deployment impact because live config and executable proof were intentionally excluded.
- **Decisive evidence:** the final fork production broadcast at `03639ab0774:src/auto-reply/reply/dispatch-from-config.ts:1899-1925`; pinned upstream's targeted-only call at `4b85d834ed1586062f31bded2f358fc5192d1674:src/auto-reply/reply/dispatch-from-config.prepare-operation.ts:164-336`; the explicit no-global contract at `4b85d834ed1586062f31bded2f358fc5192d1674:docs/plugins/hooks.md:181-185`; Codex's binding requirement at `4b85d834ed1586062f31bded2f358fc5192d1674:extensions/codex/src/conversation-binding.ts:301-320`; and Deliberation's unbound registration plus required event classification at `extensions/deliberation/index.ts:10-23` and `extensions/deliberation/src/route-match.ts:64-109`.
