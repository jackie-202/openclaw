# Deliberation plugin: allow loopback HTTP endpoint in km.endpoint schema

## Context

`extensions/deliberation/openclaw.plugin.json` currently enforces `"pattern": "^https://"` on `km.endpoint`. The KM side is `deliberation-v2-listener.py`, a loopback-only HTTP listener (binds strictly to 127.0.0.1 or ::1, bearer-token auth). Traffic never leaves the machine, so requiring TLS forces a pointless local proxy/self-signed cert layer.

## Goal

Relax the endpoint schema and config validation to accept, in addition to `https://` URLs, **strictly loopback plaintext HTTP**:

- `http://127.0.0.1[:port]/...`
- `http://[::1][:port]/...`

Anything else with `http://` (hostnames, other IPs, `localhost` by name) must remain rejected — `localhost` is excluded deliberately because it can resolve to non-loopback in edge cases; require the literal IP.

## Scope

Repository-local to `~/Projects/openclaw-fork`, directory `extensions/deliberation/` only. Do not inspect other repos or external config. Record unknowns as follow-ups instead of crossing the boundary.

## Requirements

1. Update `openclaw.plugin.json` `km.endpoint` schema: replace the single `^https://` pattern with a pattern (or anyOf) accepting `https://` OR literal-loopback `http://127.0.0.1` / `http://[::1]` (optional port, optional path).
2. If `src/config.ts` performs its own endpoint validation, keep it in exact agreement with the schema (single source of truth preferred — if config.ts already parses the URL, enforce loopback there with URL parsing, not regex duplication).
3. TDD RED→GREEN: extend `src/config.test.ts` first with cases:
   - accept `https://km.example.com/api`
   - accept `http://127.0.0.1:8765/deliberation`
   - accept `http://[::1]:8765/deliberation`
   - reject `http://localhost:8765`
   - reject `http://192.168.1.10:8765`
   - reject `http://evil.example.com`
4. Update any contract fixtures/docs in `extensions/deliberation/` that state the https-only rule.
5. Full plugin test suite + typecheck/build for the extension must pass.

## Acceptance

- All six endpoint cases above are covered by tests and behave as specified.
- Schema and runtime validation agree (no case where schema accepts and runtime rejects or vice versa).
- No unrelated churn outside `extensions/deliberation/`.
- Working tree left commit-ready; do NOT run any git commands.

## Verification

Run the extension test suite and record command + results in the final note.
