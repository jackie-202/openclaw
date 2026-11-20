# Host review of reasoning-catalog type repair — 2026-11-20 20:48 Prague

## Proven current implementation

Actual production delta in `src/auto-reply/thinking.shared.ts` adds optional `supportsReasoningEffort?: boolean`, matching canonical `packages/model-catalog-core/src/model-catalog-types.ts:43`. `src/auto-reply/thinking.ts` annotates the mapped `levels` array as `RankedThinkingLevelOption[]`, retaining off in its contextual union. No executable expressions/branches changed. Host transpiled both HEAD and current versions in memory with the same installed TypeScript options; emitted JavaScript matched byte-for-byte for BOTH source files. This proves no runtime semantic delta from these two type edits; it is not full compilation or deployment proof.

Task4670891c proof artifact contains genuine identical-command declaration RED exit1 at 19:43:59Z (TS2551 + two TS2322) and GREEN exit0 at19:44:31Z. Worker reports focused thinking40 pass plus format/lint. Parent has not overruled independent acceptance.

## Changed thinking fixture is consistent with pre-existing source policy

Original runtime already required `supportsReasoningEffort === true` before consulting advertised effort labels. The prior custom-gmn fixture supplied only labels yet expected xhigh. The repaired thinking fixture supplies the missing true switch and expects exactly advertised low/medium/high/xhigh, without off/minimal that are not advertised. The ORIGINAL executable branch (before type edits) has the same restriction. Thus this test edit repairs inconsistent characterization rather than proving a new runtime policy.

Do NOT turn a reviewer suggestion that off should always be visible into an implementation requirement: this request is behavior-preserving. Actual source only inserts off when listed; an effort list without off deliberately remains without off. An always-off policy change is outside this repair and not proven necessary here.

## Concrete remaining test defect, reproduced locally

Host ran standard scoped:
`pnpm test src/auto-reply/thinking.test.ts src/auto-reply/commands-registry.test.ts`
Result exit1: thinking40/40 pass, commands-registry28/29 pass; total68pass1fail.
Failing assertion `src/auto-reply/commands-registry.test.ts:778`, test `uses configured model compat for /think arg menus`. Its configured gmn model at line767 still supplies ONLY `supportedReasoningEfforts: [low,medium,high,xhigh]` but asserts xhigh is exposed. Same stale-fixture capability mismatch as corrected thinking test. Expected list actually default/off/minimal/low/medium/high. This is a pre-existing assertion/fixture inconsistency, not evidence the type edits changed menu runtime behavior (emitted-JS equality above). `commands-registry.ts:311,338` builds/passes the configured catalog to choices.

## Correct continuation

Repair this remaining test fixture and characterize strict capability gating and existing off/binary fallback boundaries without production policy changes or weakening assertions. Keep xhigh assertions for an explicitly enabled fixture. Add negative coverage that missing/false support flag does NOT use labels alone, and meaningful positive binary coverage with explicit flag. Obtain applicability/verification through normal review owners; do not fabricate RED for tests-only characterization. Preserve compiler proof under its original task identity. No broad build, deployment, restart, model/provider calls or runtime config changes have been performed by this review.
