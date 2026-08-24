---
title: Establish caller-owned Deliberation OR-01 through OR-23 full gate
---

# Establish caller-owned Deliberation OR-01 through OR-23 full gate

## Objective

Create the one executable Definition of Done that the earlier batches lacked. It must compose already-implemented channel, producer, KM listener/SQLite, delivery adapter, contract provenance, package, and static boundaries into named `OR-01` through `OR-23` evidence and fail closed on missing, duplicate, skipped, contradictory, or stale results.

Work only in `/Users/michal/Projects/openclaw-fork`. KM is a read-only pinned verification dependency. Resolve and verify the accepted KM revision/hashes from the previous tasks before running. Do not change product semantics in this task except the smallest test-runner/evidence plumbing needed to expose real existing boundaries; any newly discovered product defect must be reported as a concrete blocker rather than hidden by a fixture or weaker assertion.

## Deliverable

1. Implement one canonical caller-owned command that runs exactly the scenario assignment from `wild-crag-3236`, with real executable leaves `OR-01` through `OR-23`.
2. Every OR ID must occur exactly once in the final ledger and map to named test selectors plus immutable command evidence. No synthetic PASS rows, aggregate-only substitution, or historical green reuse.
3. The command must pin and print the KM revision and contract/fixture hashes, reject dirty or mismatched owner paths, use isolated temporary listener/credential/SQLite state, and never overlap production state.
4. Compose:
   - channel ownership leaves OR-01..OR-06;
   - singular intake/lifecycle leaves OR-07..OR-21;
   - package/doctor/singleton leaf OR-22;
   - OR-23 as the full-gate integrity assertion over all preceding leaves, provenance, build, package E2E, focused suites, and scoped static checks.
5. Update readiness accounting to consume only this canonical gate result. It must not claim deployment, live activation, provider authenticity, or pilot readiness.

## Executable acceptance

The canonical command must exit zero with **23/23 named leaves Green**. It must deterministically fail if any leaf is missing, skipped, duplicated, red, stale, or uses the wrong KM revision/hash.

Also prove one negative characterization of the gate itself: deliberately malformed/missing result input must cause a nonzero exit without manufacturing evidence.

Run the full canonical gate from a clean task workspace and preserve its bounded output/result artifact. Remote Blacksmith/Azure/AWS runs are not required unless the task discovers and documents a specific release-only property they uniquely prove.

## Completion evidence

Final note must include the canonical command, exact clean revisions/hashes, complete 23-row result artifact, negative fail-closed check, elapsed result, and any non-semantic infrastructure prerequisite. A green command is repository readiness only.

No KM edits, deployment, build/link into the live installation, Gateway restart, live configuration, production spool access, real provider send, or pilot activation.
