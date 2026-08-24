# TDD Red-Green Proof: bright-cove-6185

## RED Phase

- **Status:** BLOCKED before behavioral RED; no test result is claimed.
- **Reason:** The mandatory owner-authority preflight cannot be constructed from the available predecessor evidence.
- **Evidence command:** `python3 /Users/michal/.config/opencode/skills/task-evidence/scripts/fetch-evidence.py --task wild-crag-3236 --project-dir .`
- **Evidence artifact:** `plans/checkpoints/wild-crag-3236.evidence.md`
- **Observed evidence:** implementation session `bold-cove-6170`; focused owner tests recorded `28 passed, 84 deselected` and `26 passed, 94 deselected`; composed E2E recorded `3 failed, 38 passed`; command lines are explicitly reported as truncated.
- **Missing authority:** exact accepted KM commit SHA, contract SHA-256, fixture SHA-256, complete OR-07..OR-21 assignment, and the three failing composed E2E selector names.
- **TDD constraint:** Checkout/hash failures and missing authority are setup failures, not genuine RED. The mandatory integration command was therefore not run against an unproven checkout, and no production or test code was changed.

`## GREEN Phase` must be appended only after the exact same owner-backed behavioral command has a genuine RED and then passes following implementation.
