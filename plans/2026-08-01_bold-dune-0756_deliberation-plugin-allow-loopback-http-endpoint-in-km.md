# Plan 2026-08-01: Deliberation loopback HTTP endpoint validation

_Status: DRAFT_
_Created: 2026-08-01_

## Progress

- [x] Phase 0: Config + Init
- [x] Phase 1: Research
- [x] Phase 2: Knowledge
- [x] Phase 3: Synthesis

## Analysis

### Codebase Context

- `extensions/deliberation/openclaw.plugin.json:26` owns discovery-time validation with `format: uri` plus an HTTPS-only pattern.
- `extensions/deliberation/src/config.ts:20` owns runtime validation with Zod/`URL`; it independently requires HTTPS and rejects credentials, query, and fragments.
- `extensions/deliberation/src/config.test.ts:39` already loads the manifest pattern and applies the same endpoint cases to manifest and runtime validation, so extend this table rather than creating a second parity test.
- `extensions/deliberation/src/km-client.ts:400` consumes the validated endpoint by trimming one trailing slash and appending canonical KM paths; no transport-specific client change is needed.
- Node's `URL.hostname` preserves brackets for `::1` (`[::1]`) but canonicalizes shorthand IPv4 such as `127.1`; runtime validation must therefore check the literal HTTP authority as well as parsed protocol/hostname.

### Relevant Documentation

- No plugin-local README, PlantUML, or endpoint policy document exists.
- The files under `extensions/deliberation/contracts/` define KM wire paths/fixtures and do not state an HTTPS-only endpoint rule; leave their provenance hashes untouched.

### Knowledge Base

- `learnings/architecture/2026-07-28_residue-audits-require-activation-proof.md`: keep repository-local unknowns explicit instead of crossing the requested scope boundary.
- `learnings/architecture/2026-07-29_acceptance-fix-plans-must-close-contract-gates-explicitly.md`: capture a genuine focused RED before implementation and fresh GREEN afterward.
- Other recall results concern KM wire authority/versioning and do not change this plugin-owned config validation task. Recall used local fallback because the `openclaw-fork-learnings` QMD collection was absent.

## Available Skills

- `tdd`: execute and record the required RED-GREEN cycle for `src/config.test.ts`.
- `save-learning`: record the endpoint-validation/parity lesson as the implementation task's final action.

## Solution

- Keep the manifest's URI format check and replace its HTTPS-only pattern with one anchored alternative for lowercase `https://` or lowercase `http://` followed by exactly `127.0.0.1` or `[::1]`, an optional numeric port, and an optional path; continue excluding credentials, query, and fragment.
- Keep runtime validation URL-based. After parsing, allow HTTPS or HTTP whose parsed hostname and original authority both identify one of the two literal loopback forms; checking the original authority prevents `URL` canonicalization from admitting aliases such as `127.1`.
- Use one table in `src/config.test.ts` as the executable parity contract for manifest and runtime validation.

## Implementation

1. Follow `skill:tdd`: edit `extensions/deliberation/src/config.test.ts` first, add the six required endpoint cases to a shared acceptance table, and run the focused test to capture RED from the two new loopback HTTP acceptances.
2. Update `extensions/deliberation/openclaw.plugin.json` with an anchored pattern equivalent to `^(?:https://[^/?#@]+|http://(?:127\\.0\\.0\\.1|\\[::1\\])(?::[0-9]+)?)(?:/[^?#]*)?$`; preserve `format: uri` so malformed ports/URLs remain schema errors.
3. Update the `km.endpoint` refinement in `extensions/deliberation/src/config.ts`: retain the shared credential/query/fragment checks, accept HTTPS, and accept HTTP only after parsed protocol/hostname and the unnormalized authority prove the literal IPv4 or bracketed IPv6 loopback host. Update the validation message to describe HTTPS-or-literal-loopback HTTP.
4. Run the focused test for GREEN, then the complete plugin suite, extension typecheck, and build. Record exact commands and outcomes in the implementation final note.
5. Confirm the final changed implementation files remain under `extensions/deliberation/`; do not modify immutable contract fixtures because they contain no transport policy. Invoke `save-learning` last and save the required learning without changing implementation behavior.

## Files to Modify

| File                                           | Change                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `extensions/deliberation/src/config.test.ts`   | Add the six-case endpoint table and assert identical manifest/runtime decisions.    |
| `extensions/deliberation/openclaw.plugin.json` | Admit only HTTPS or literal-loopback HTTP while retaining URI and path constraints. |
| `extensions/deliberation/src/config.ts`        | Match the manifest policy with URL parsing and literal-authority checks.            |

## TDD

**Test file:** `extensions/deliberation/src/config.test.ts`  
**Framework:** Vitest  
**Focused command:** `pnpm test extensions/deliberation/src/config.test.ts`  
**Edit:** Define the table beside `valid`; use it in a new runtime case and replace the hard-coded endpoint lists in the existing manifest-parity case.

```ts
import { describe, expect, it } from "vitest";
import { parseDeliberationConfig } from "./config.js";

const endpointCases = [
  ["https://km.example.com/api", true],
  ["http://127.0.0.1:8765/deliberation", true],
  ["http://[::1]:8765/deliberation", true],
  ["http://localhost:8765", false],
  ["http://192.168.1.10:8765", false],
  ["http://evil.example.com", false],
] as const;

it.each(endpointCases)("validates KM endpoint %s as %s", (endpoint, accepted) => {
  const parse = () => parseDeliberationConfig({ ...valid, km: { ...valid.km, endpoint } });
  if (accepted) {
    expect(parse).not.toThrow(); // RED: both loopback HTTP cases currently throw.
  } else {
    expect(parse).toThrow();
  }
});
```

Retain the existing manifest loader and iterate `endpointCases`, asserting `pattern.test(endpoint) === accepted` before the matching runtime assertion.

| Case                                            | RED before implementation                       | GREEN after implementation |
| ----------------------------------------------- | ----------------------------------------------- | -------------------------- |
| HTTPS endpoint                                  | Passes unchanged                                | Passes                     |
| IPv4 and IPv6 literal loopback HTTP             | Runtime and manifest acceptance assertions fail | Both validators accept     |
| `localhost`, LAN IPv4, and remote hostname HTTP | Rejections pass unchanged                       | Both validators reject     |

Implement the TDD cycle with `skill:tdd` and store RED/GREEN evidence at `plans/checkpoints/bold-dune-0756.red-green-proof.md`.

## Verification

- Focused RED/GREEN: `pnpm test extensions/deliberation/src/config.test.ts`
- Full plugin suite: `pnpm test extensions/deliberation`
- Extension typecheck: `pnpm tsgo --project extensions/deliberation/tsconfig.json --noEmit`
- Build: `pnpm build`

## Dependencies

- Use the existing Zod and platform `URL` APIs; add no dependency.
- If the repository's `pnpm tsgo` wrapper does not accept a project argument, record that as the one scoped follow-up and use the repository-supported extension typecheck lane discovered during implementation without editing outside `extensions/deliberation/`.
