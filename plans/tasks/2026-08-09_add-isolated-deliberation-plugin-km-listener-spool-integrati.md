# Add isolated Deliberation plugin → KM listener → spool integration harness

## Problem

The current OpenClaw Deliberation tests mock the KM HTTP boundary, while KM tests exercise the listener/spool without the real OpenClaw serializer. This allowed a live Discord intake request to reach the listener and fail as `400 SCHEMA_INVALID` although focused tests were green. Human-authored Discord messages must not be the regression test.

Build one deterministic cross-repository integration harness that runs the real OpenClaw Deliberation intake code against the real KM HTTP listener and a disposable spool, without starting the full Gateway or contacting Discord.

## Scope and ownership

This is a cross-repository task intentionally covering only:

- `/Users/michal/Projects/openclaw-fork/extensions/deliberation/`
- `/Users/michal/.openclaw/workspace/km-system/scripts/deliberation-v2-listener.py`
- `/Users/michal/.openclaw/workspace/km-system/lib/deliberation_*`
- the smallest test-runner/package wiring needed to register the harness in a maintained test suite

Do not inspect or modify unrelated projects, production OpenClaw config, LaunchAgents, cron jobs, Discord configuration, production credentials, or runtime state.

## Required behavior

1. Start the real KM Deliberation listener as a child process on a random loopback port.
2. Give it a generated temporary credential and an explicitly supplied temporary spool root/database under the test framework's temporary directory.
3. Invoke the real OpenClaw Deliberation intake handler/client with representative Discord-like facts, including the concrete timestamp regression case:
   - message ID `1535928766595866624`
   - timestamp `2026-08-09T08:32:34.252Z`
   - expected canonical wire timestamp `2026-08-09T08:32:34.252000Z`
4. Send through the actual HTTP/auth/wire boundary; do not mock `fetch` or instantiate only a fake Python wire object.
5. Assert HTTP success and inspect the disposable canonical spool to verify exact provider event ID, source identity/target, content, timestamps, and ready state.
6. Submit the same provider event ID again and assert idempotency: one canonical record and a duplicate response.
7. Include a negative malformed-request assertion proving schema failures are attributed clearly and do not mutate the spool.
8. Stop the listener and remove all temporary artifacts even on failure.
9. Register the test in a named maintained command/suite so later Deliberation changes and task acceptance can run it with one documented command.

## Production database isolation — hard safety contract

The test must be structurally incapable of opening the production spool.

- Refactor the listener entrypoint only as much as necessary to require/accept an explicit spool root for tests while preserving the existing canonical production default for the LaunchAgent.
- The integration harness must create the spool path beneath an OS/test-created temporary directory and pass that absolute path explicitly.
- Before starting the listener, resolve both paths and fail closed if the temporary spool equals, is inside, contains, aliases, or symlink-resolves to the canonical production path `/Users/michal/.openclaw/workspace/km-system/state/deliberation-v2`.
- Add a unique test sentinel file inside the temp root; listener startup in integration-test mode must require that sentinel and reject paths without it.
- Do not read `~/.openclaw/openclaw.json`, the production credential file, environment variables that point to production state, or the canonical spool fallback in test mode.
- Add a guard test that intentionally supplies the production path and proves the harness/listener rejects it before opening SQLite. Verify production database mtime/hash is unchanged when present.
- Never delete or mutate anything outside the temporary root during cleanup.

## Test-suite wiring

Choose one canonical command owned by the OpenClaw fork, because the regression originates at the plugin serialization boundary, and document it near the Deliberation extension. The command may orchestrate the Python listener from the sibling KM checkout via one explicit environment variable/path. It must:

- exit non-zero on any failed seam,
- print a concise seam-specific failure (`plugin`, `HTTP/auth`, `wire/schema`, `spool`, `cleanup`),
- be included in the Deliberation extension's maintained test selection or an explicit Deliberation integration suite invoked by task acceptance,
- run without network access beyond loopback.

If ordinary upstream CI cannot access the sibling KM checkout, keep the unit suite hermetic and add a clearly named local cross-repo integration command that fails with an actionable missing-checkout message rather than silently skipping. Wire this command into local Deliberation task acceptance documentation/checks.

## Acceptance criteria

- One command starts no full Gateway and contacts no Discord/provider.
- The real TypeScript intake serializer/client talks to the real Python HTTP listener and writes the real spool implementation.
- The concrete `.252Z` case succeeds and persists `.252000Z` canonically.
- Duplicate submission remains one record.
- Malformed input fails without spool mutation.
- A production-path attempt is rejected before SQLite open; production spool remains byte/mtime unchanged.
- Listener process and temporary files are cleaned after pass and fail paths.
- Existing Deliberation TypeScript tests and focused KM listener/wire/spool tests remain green.

## Verification

Run the new named integration command, the OpenClaw Deliberation focused suite/typecheck, and KM's focused listener/wire/spool tests. Record exact commands and results in the final note.

## Do not

- Do not start/restart the installed OpenClaw Gateway.
- Do not send a Discord message.
- Do not use production token/config/state.
- Do not weaken KM schema validation.
- Do not make live smoke tests replace this isolated gate.
- Do not include git operations.
