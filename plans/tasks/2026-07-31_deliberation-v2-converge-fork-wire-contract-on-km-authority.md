# Deliberation v2: converge fork wire contract on KM authority (real fix + commit-ready working tree)

## Problem evidence (2026-07-31 preflight, task quick-brook-6201)

Acceptance metadata from `bold-dune-2799` claims the fork/KM wire contract was fixed, but current executable artifacts still use the retired wire family. Verified directly:

- `extensions/deliberation/src/km-client.ts` (SHA-256 98b81e12eeb275f42b09639f9e5c91bdfc8d40411f49ea34d5d0dc8270c017a4) sends header `x-deliberation-protocol: v1` (line ~128) and calls `/deliberation/v1/deliveries...` + `/deliveries/{id}/reserve` (lines ~181, ~202).
- `extensions/deliberation/contracts/km-wire-v1.json` (ee45e90e...) uses `x-deliberation-protocol`, `/deliveries`, `/attempts`.
- `extensions/deliberation/contracts/cutover-controls-v1.json` (489e59f1...) uses `/control`, `/attempts`.
- `extensions/deliberation/contracts/provenance.json` pins the two retired hashes.
- `docs/plugins/reference/deliberation.md` documents the retired wire/control family.
- The entire `extensions/deliberation/` directory is untracked in git; the earlier "fix" existed only transiently.

## KM canonical authority (must match exactly)

From `~/.openclaw/workspace/km-system/contracts/deliberation-v2/v1/contract.json` (SHA-256 e1f3ed030d69f24b7117ca55edb7aa63fd18152b515fa9e047404d495306aebf):

- Header: `X-Deliberation-Protocol-Version: 1`
- Endpoints: `GET /deliberation/v1/health`, `GET /deliberation/v1/ready`, `POST /deliberation/v1/intake`, `POST /deliberation/v1/reservations`, `POST /deliberation/v1/completions`, `POST /deliberation/v1/reconciliations`
- Controls: `source-intake`, `claims`, `review`, `sender`
  Fixtures: `km-system/contracts/deliberation-v2/v1/fixtures.json` (1f62540d...). Read these files read-only as the single source of truth; if unreadable, fail closed.

## Requirements

1. Update `extensions/deliberation/` contract fixtures (`km-wire-v1.json`, `cutover-controls-v1.json`), `provenance.json` (re-pin to canonical hashes), `src/km-client.ts`, all affected src modules, tests, and `docs/plugins/reference/deliberation.md` so every executable artifact uses only the canonical KM wire/control family. No retired route/header string may remain anywhere under `extensions/deliberation/` or in the deliberation docs page (grep-proof it).
2. TDD: RED on a behavioral test asserting canonical header + `/reservations` route before the client change; GREEN after.
3. Verification: `node scripts/run-vitest.mjs extensions/deliberation/src --reporter=verbose` (all pass), `pnpm build`, `pnpm docs:list`, `pnpm lint:docs docs/plugins/reference/deliberation.md`, `pnpm docs:check-mdx`.
4. Leave the working tree commit-ready: all files under `extensions/deliberation/` staged-able with no leftover retired artifacts. Do NOT run git commit/push (host owns git).
5. Final note: list changed files, grep-proof output showing zero retired-wire occurrences, and exact verification results.

## Acceptance criteria

- Grep for `x-deliberation-protocol`, `"/deliveries"`, `"/attempts"`, `"/control"` under `extensions/deliberation/` and `docs/plugins/reference/deliberation.md` returns zero matches (excluding historical plans/checkpoints).
- Client requests use `X-Deliberation-Protocol-Version: 1` and the six canonical endpoints only.
- All listed verification commands pass.
