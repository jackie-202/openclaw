# Plan 2026-08-23: Close owner-runtime acceptance evidence gaps

Capture the missing owner-backed `OR-01` through `OR-23` GREEN evidence without reopening completed implementation.

## Analysis

- `plans/checkpoints/bold-reef-6539.red-green-proof.md` is the genuine behavioral RED: the exact owner command exited 1 with 12/23 passing and 11 failures. Reuse it; do not manufacture another RED.
- `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` already owns the 23-row matrix but certifies 0/23 at required boundaries. Update it in place.
- `extensions/deliberation/scripts/km-listener.cross-repo.ts` verifies owner hashes, starts the real owner listener, and isolates SQLite, but its current 23 reporter tests are aggregate/supporting cases rather than 23 `OR-*` results.
- Owner `main` revision `9ad21d9670eb3178cfcfe4c222b10b288b2b601a` is not approved or converged. Hash freshness does not authorize contract synchronization.
- Preserve the dirty worktree. Test-only edits are conditional on a demonstrably missing matrix assertion; production edits require a real OpenClaw defect reproduced against the approved owner runtime.

## Available Skills

- `task-evidence`: retain exact parent command/result provenance.
- `tdd`: record matching-command GREEN in the parent proof.
- `openclaw-testing` and `crabbox`: select focused and remote proof only if code changes.
- `acceptance`: check the completed evidence against findings 001-002.
- `autoreview`: mandatory if any code or test changes are required.
- `save-learning`: mandatory final execution action.

## Approach

Gate execution on owner approval, map each matrix row to an existing named automated result at its required boundary, then run those exact commands and record immutable owner provenance. Stop as blocked rather than changing hashes/contracts when owner semantics diverge.

## Execution Steps

1. Require a clean, readable, owner-approved immutable checkout. Record its commit and every hash checked by `requireKmRoot()`, then inspect listener schema, SQLite lifecycle, replay, delivery target, invocation, completion, and recovery semantics. Place that checkout at the exact path encoded in the historical RED command so command identity is unchanged. Stop with `NOT READY` on any approval, hash, or semantic mismatch.
2. Build a reviewable `OR-01` through `OR-23` mapping from the existing matrix to exact test names and boundaries: owner listener/isolated SQLite for durable lifecycle rows, loader-backed Discord/Slack tests for ownership/silence rows, final adapter for provider attempts, and installed-package CLI for `OR-21`/`OR-22`. Do not count aggregate parent tests or supporting guards as matrix rows.
3. If an `OR-*` row lacks an automated assertion, add only the missing named test at the existing owning boundary and capture its failure against the approved runtime before changing behavior. If the assertion exposes owner divergence, stop; if it proves an OpenClaw defect, make the smallest task-owned fix. Do not modify contracts, provenance, config, or production runtime merely to make evidence pass.
4. Run the historical command unchanged through `skill:tdd` GREEN with `TASK_ID=bold-reef-6539`. Require exit 0 and 23/23 mapped behaviors passing; preserve supporting test totals separately. Verify the proof helper appends GREEN to `plans/checkpoints/bold-reef-6539.red-green-proof.md` and retains owner revision/hash provenance.
5. Run the mapped loader-backed channel, final-adapter, and installed-package doctor commands needed by rows not wholly covered by the owner harness. For every row record ID, exact test name, command/run reference, result, boundary, owner commit, and owner-file hashes.
6. Update `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` to 23 passing rows and update `plans/checkpoints/bold-reef-6539.checkpoint.md` with the GREEN proof and matrix reference. Create `plans/checkpoints/dark-crag-3048.checkpoint.md` as the follow-up evidence index. Any absent/failing row keeps `IMPLEMENTATION NOT READY`; live activation remains independently unapproved.
7. If code or tests changed, run focused tests, installed-package proof, `pnpm build`, scoped lint/format, `git diff --check`, changed lanes, the selected remote gate, and fresh `autoreview` until clear. Otherwise verify artifact consistency only. Run `acceptance` against findings 001-002, then invoke `save-learning` last and make no later edits.

## Files to Modify

| File                                                     | Change                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `plans/checkpoints/bold-reef-6539.red-green-proof.md`    | Append genuine identical-command GREEN while retaining historical RED   |
| `plans/checkpoints/fresh-peak-7129.rollout-readiness.md` | Replace blocked rows with exact passing result/provenance per `OR-*` ID |
| `plans/checkpoints/bold-reef-6539.checkpoint.md`         | Link final GREEN and matrix evidence                                    |
| `plans/checkpoints/dark-crag-3048.checkpoint.md`         | Index this follow-up's reused RED, fresh GREEN, and 23-row evidence     |
| Existing owning test file                                | Conditional missing named assertion only; no broad test rewrite         |
| Production/plugin contract file                          | Conditional minimal fix only after approved owner-backed defect proof   |

## TDD

Implementace TDD cyklu dle `skill:tdd`. The existing executable RED target remains `extensions/deliberation/scripts/km-listener.cross-repo.ts`; do not author a post-implementation RED.

**Historical RED:** `plans/checkpoints/bold-reef-6539.red-green-proof.md`  
**Run command:** use the proof metadata command byte-for-byte, with the approved checkout provisioned at its recorded path.  
**GREEN capture:** `TASK_ID=bold-reef-6539 python3 "$HOME/.config/opencode/skills/tdd/scripts/proof-capture.py" green -- <exact command from proof metadata>`

The existing failing assertion is the executable test skeleton; preserve its real imports and fixture:

```ts
void test("real producer reaches the isolated KM listener and canonical spool", async (t) => {
  const fixture = await createListenerFixture();
  try {
    const result = await runIntakeProducer(input, env);
    assert.deepEqual(result, {
      handled: true,
      providerEventId: MESSAGE_ID,
      duplicate: false,
    });
    assert.equal(readSpool(fixture).length, 1);
  } finally {
    t.mock.timers.reset();
    await disposeFixture(fixture);
  }
});
```

| Evidence      | RED                                                       | GREEN                                                                             |
| ------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Owner command | 12 pass / 11 fail with positive intake rejected           | Exit 0 against approved immutable owner checkout                                  |
| Matrix        | Rows lack passing owner-boundary provenance               | `OR-01` through `OR-23` each map to a passing named result                        |
| Durable state | Positive lifecycle setup fails before required assertions | Isolated SQLite proves exact records, identities, targets, attempts, and receipts |

## Dependencies

- Owner-approved immutable checkout implementing the accepted singular-intake and uncertain-delivery semantics.
- Exact historical command path remains available for proof-command identity.
- Isolated temporary listener, SQLite, package, config, HOME, and state roots.
- Live configuration, deployment, Gateway restart, and rollout approval remain out of scope.

---

_Status: DRAFT_
