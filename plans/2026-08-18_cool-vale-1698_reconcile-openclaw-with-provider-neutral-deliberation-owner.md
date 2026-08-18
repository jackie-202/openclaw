# Plan 2026-08-18: Reconcile OpenClaw with provider-neutral Deliberation owner contract

Align the OpenClaw mirror and provider overlay with the accepted immutable KM owner revision, then refresh provenance only after semantic and integration proof.

## Analysis

- `extensions/deliberation/contracts/km-wire-v1.json` is stale at `deliveryTarget`: it uses `accountId`/`channelId`; the authoritative generic shape is closed `{ provider, account, channel, threadId? }` with no provider enum or provider-specific identifier grammar.
- `extensions/deliberation/src/km-client.ts` already models the provider-neutral wire, maps operator config only at reservation, and preserves exact target equality through ready, reserve, invoke, completion, and durable attempt evidence.
- `extensions/deliberation/src/delivery-target.ts`, `config.ts`, and `openclaw.plugin.json` correctly own Discord/Slack allowlisting and thread rules; keep operator-facing `accountId`/`channelId` and adapt them at the wire boundary.
- `extensions/deliberation/src/final-adapter.ts` validates provider policy after ready/reservation equality and before invocation/send. Preserve this ordering and its one-call fake-provider tests.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` verifies owner hashes before launching an isolated temporary listener/spool and currently produces seven top-level/subtest results. Its expected wire targets must use `account`/`channel` while fake provider calls continue to use `accountId`/`channelId`.
- `docs/plugins/reference/deliberation.md` already describes the provider-owned operator configuration and fail-closed delivery behavior; no docs edit is expected unless implementation changes that behavior.
- Planning-time tool policy blocked direct KM reads. Implementation must inspect only `contracts/deliberation-v2/v1/{contract,fixtures}.json`, their clean tracked status, immutable `HEAD`, and canonical verifier output. If the accepted revision is absent, dirty, mutable, or semantically incompatible, stop without changing provenance.

## Knowledge Base

- `learnings/architecture/deliberation-owner-mirror-vs-provider-overlay.md`: mirror owner-generic semantics exactly; keep concrete provider restrictions in the OpenClaw overlay/adapters.
- `learnings/architecture/deliberation-provenance-refresh-semantic-immutable-gates.md`: clean immutable owner identity and semantic compatibility are separate gates; provenance preflight alone is not integration proof.
- `learnings/architecture/deliberation-provider-thread-routing-outside-closed-wire.md`: keep `sourceThreadId`, destination `threadId`, provider event identity, and canonical `sourceTarget` distinct.
- `plans/checkpoints/cool-crag-7527.semantic-comparison.md`: the prior owner revision was incompatible because it enumerated providers and required destination threads; do not reuse its revision or hashes.
- Recall used local fallback because collection `openclaw-fork-learnings` was unavailable; the relevant contract-gate rules require genuine RED/GREEN proof against accepted owner evidence rather than inventing a wire.

## Available Skills

- `tdd`: record the focused contract RED before mirror edits and GREEN afterward.
- `openclaw-testing`: run narrow plugin tests first, then the required cross-repository verifier and changed checks.
- `autoreview`: perform the mandatory fresh pre-handoff code review after implementation and proof.
- `save-learning`: record any new contract/provenance lesson after implementation.

## Implementation

1. Establish the owner gate before product edits: confirm both KM owner files are tracked and clean, capture the exact KM `HEAD` and SHA-256 values, and compare the owner `deliveryTarget`, lifecycle references, source identity, `sourceThreadId`, and fixture vectors against the shared decision. Stop and report the exact mismatch if the owner still enumerates providers, requires every `threadId`, uses non-camelCase generic fields, or lacks an immutable compatible revision.
2. Use `skill:tdd` to add the RED contract assertions below. Prove the current mirror fails on generic `account`/`channel`, optional `threadId`, and absence of concrete provider policy.
3. Reconcile only owner-generic content in `km-wire-v1.json`: use closed `provider`/`account`/`channel` plus optional `threadId` everywhere the target is referenced; retain structured lifecycle equality, canonical `v1:<provider>:<account>:<channel>`, and separate required intake `sourceThreadId`. Mirror any accepted owner fixture changes without copying Discord/Slack policy into the generic file.
4. Expand `openclaw-overlay-v1.json` and `contract.test.ts` with explicit threaded and non-threaded vectors plus assertions that Discord/Slack enumeration, identifier validation, and Slack's required timestamp thread remain OpenClaw-owned. Reuse `delivery-target.ts`, config schema, and manifest validation; change runtime code only if owner comparison exposes an actual mismatch.
5. Update `km-client.test.ts`, `final-adapter.test.ts`, and `km-listener.cross-repo.ts` expectations so wire evidence uses `account`/`channel`, provider calls use `accountId`/`channelId`, threaded and non-threaded targets survive exact lifecycle equality, and unsupported/malformed/provider-mismatched targets still stop before invocation or send. Preserve the existing seven-result cross-repo structure.
6. Run the semantic-focused test before provenance refresh. Only after it passes, update `provenance.json` with the exact compatible KM `HEAD`, exact owner-file hashes, and recomputed hashes for every changed local contract artifact; update provenance assertions without retaining task IDs or prior hashes as the owner revision.
7. Run focused contract, config/overlay, client, adapter, orchestration, plugin, hook guard, and sole-send tests. Then run the canonical verifier with `OPENCLAW_DELIBERATION_KM_ROOT=/Users/michal/.openclaw/workspace/km-system pnpm test:deliberation:km-integration` and require all seven tests to execute and pass against isolated temporary state and fake providers.
8. Run `pnpm check:changed`, `git diff --check`, and fresh `skill:autoreview`; resolve accepted findings and rerun affected proof. Record exact commands/results and the remaining operator sequence: host deploy verifier -> full gateway restart -> live smoke. Do not restart, deploy, merge, or call a real provider.

## Files to Modify

| File | Change |
|---|---|
| `extensions/deliberation/contracts/km-wire-v1.json` | Mirror the accepted provider-neutral generic target and owner fixture semantics. |
| `extensions/deliberation/contracts/openclaw-overlay-v1.json` | Pin OpenClaw-owned threaded/non-threaded and provider-policy evidence. |
| `extensions/deliberation/contracts/provenance.json` | Refresh exact immutable owner revision and owner/local hashes only after semantic proof. |
| `extensions/deliberation/src/contract.test.ts` | Assert generic wire neutrality, overlay ownership, fixtures, and exact provenance. |
| `extensions/deliberation/src/config.test.ts` | Strengthen provider-specific optional/required thread validation if current coverage is insufficient. |
| `extensions/deliberation/src/km-client.test.ts` | Cover generic threaded/non-threaded wire targets and lifecycle equality. |
| `extensions/deliberation/src/final-adapter.test.ts` | Preserve provider conversion, validation, fencing, and fake-send isolation. |
| `extensions/deliberation/scripts/km-listener.cross-repo.ts` | Align isolated seven-test expectations with generic wire names without weakening guards. |

## TDD

Implement the TDD cycle with `skill:tdd`; save RED/GREEN evidence to `plans/checkpoints/cool-vale-1698.red-green-proof.md`.

**Test file:** `extensions/deliberation/src/contract.test.ts`  
**Run command:** `pnpm test extensions/deliberation/src/contract.test.ts -- -t "defines provider-neutral generic delivery targets"`  
**Edit:** append inside `describe("accepted Deliberation contracts", ...)`.

```ts
it("defines provider-neutral generic delivery targets", async () => {
  const contract = JSON.parse(await readFile(join(contractDir, "km-wire-v1.json"), "utf8")) as {
    schemas: {
      deliveryTarget: {
        properties: Record<string, unknown>;
        required: string[];
        additionalProperties: boolean;
      };
    };
  };
  const target = contract.schemas.deliveryTarget;

  expect(Object.keys(target.properties)).toEqual(["provider", "account", "channel", "threadId"]);
  expect(target.required).toEqual(["provider", "account", "channel"]);
  expect(target.additionalProperties).toBe(false);
  expect(JSON.stringify(target)).not.toMatch(/discord|slack|accountId|channelId/);
});
```

| Test | RED | GREEN |
|---|---|---|
| Generic target fields | Current mirror returns `accountId`/`channelId`. | Mirror returns `provider`/`account`/`channel`/`threadId`. |
| Optional generic thread | Required keys or provider policy drift fails the assertion. | Only provider/account/channel are generically required. |
| Provider neutrality | Any Discord/Slack enum or old key leaks fail. | Concrete policy exists only in overlay/config/adapter assertions. |

Focused GREEN command:

```bash
pnpm test extensions/deliberation/src/contract.test.ts extensions/deliberation/src/config.test.ts extensions/deliberation/src/km-client.test.ts extensions/deliberation/src/final-adapter.test.ts extensions/deliberation/src/orchestration.test.ts extensions/deliberation/src/plugin.test.ts extensions/deliberation/src/hooks.test.ts extensions/deliberation/src/sole-send.test.ts
```

## Dependencies

- Compatible immutable task-1 owner revision in the approved read-only KM checkout.
- KM `.venv` and listener files required by the canonical isolated verifier.
- No gateway/listener/plugin restart, host deployment, real transport, or live smoke in this task.

*Status: DRAFT*
*Created: 2026-08-18*
