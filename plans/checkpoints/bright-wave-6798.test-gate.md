# Test Gate: bright-wave-6798

## Status

`BLOCKED`

No caller-owned remote runner allocated, so no durable Testbox/Crabbox run ID or URL exists. Local verification below is supplementary and is not relabeled as the canonical Test Gate.

## Candidate

- HEAD: `c810e68835a128c4dbd5e77db2208ab7b43bcce2`
- Dirty-workspace identity: task-relevant SHA-256 digests and the pre-test status snapshot are recorded in `plans/checkpoints/bright-wave-6798.evidence.md`.
- Allocation/verification window ended: `2026-08-25T17:26:07Z`.

## Allocation Attempts

### Blacksmith Testbox Through Crabbox

- Provider: `blacksmith-testbox`
- Requested command: `npm test`
- Run reference: none; allocation failed before a `tbx_...` ID or Actions URL was issued.
- Result: `BLOCKED`
- Error: `blacksmith testbox warmup failed: blacksmith failed: exec: "blacksmith": executable file not found in $PATH`

### Coordinator-Backed AWS Crabbox

- Provider: `aws`
- Requested command: `npm test`
- Run reference: none; allocation failed before a `cbx_...` lease/run ID was issued.
- Result: `BLOCKED`
- Error: the wrapper requires a configured Crabbox broker login and directed `crabbox login --url https://crabbox.openclaw.ai --provider aws` before retrying.

### Configured Azure Provider

- Provider: `azure`
- Requested command: `npm test`
- Run reference: none; allocation failed before a lease/run ID was issued.
- Result: `BLOCKED`
- Error: `AZURE_SUBSCRIPTION_ID is required for direct azure provider`; the `az` CLI is not installed.

## Required Canonical Matrix

No matrix entry ran on a caller-owned provider because allocation never completed.

| Command                                   | Canonical result            | Exit code | Totals |
| ----------------------------------------- | --------------------------- | --------- | ------ |
| `cd ~/Projects/openclaw-fork && npm test` | `BLOCKED` before allocation | not run   | none   |
| `pnpm test extensions/deliberation`       | `BLOCKED` before allocation | not run   | none   |
| `pnpm tsgo:extensions`                    | `BLOCKED` before allocation | not run   | none   |
| `pnpm tsgo:extensions:test`               | `BLOCKED` before allocation | not run   | none   |
| `pnpm build`                              | `BLOCKED` before allocation | not run   | none   |

## Supplementary Local Verification

These commands ran in the preserved local workspace after remote allocation failed. They verify the current candidate but do not satisfy the caller-owned canonical gate requirement.

| Command                                                                           | Exit code | Result                                                                                |
| --------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------- |
| `pnpm test extensions/deliberation/src/route-match.test.ts -- --reporter=verbose` | `0`       | 1 file passed; 36 tests passed; 0 failed                                              |
| `pnpm test extensions/deliberation`                                               | `0`       | 15 files passed; 315 tests passed; 0 failed; wrapper passed 1 shard in 6.95s          |
| `pnpm lint:extensions`                                                            | `0`       | extension oxlint completed with no findings                                           |
| `pnpm tsgo:extensions`                                                            | `0`       | extension source typecheck completed with no diagnostics                              |
| `pnpm tsgo:extensions:test`                                                       | `0`       | extension test typecheck completed with no diagnostics                                |
| `pnpm build`                                                                      | `0`       | full build completed; total 167.0s; UI built 918 modules; plugin SDK exports verified |

## Acceptance Consequence

The fresh focused GREEN and supplementary local checks support goals 001-006, but finding-002 remains blocked until caller-owned infrastructure returns a concrete non-`not-run` reference for the complete canonical matrix. This artifact intentionally does not claim `PASS`.
