# Compaction Provider-Auth Test Gate: cool-brook-4894

## Required Commands

```text
pnpm test src/agents/model-auth.profiles.test.ts
pnpm test src/agents/model-auth.profiles.test.ts src/agents/model-auth.test.ts src/agents/model-provider-auth.test.ts src/agents/embedded-agent-runner/compact.hooks.test.ts src/agents/embedded-agent-runner/compaction-runtime-context.test.ts
```

## Local Verification

The serialized local wrapper ran both required commands on 2026-08-20 with exit
code `0`:

```text
Test Files  1 passed (1)
     Tests  72 passed (72)
Duration  1.12s

Test Files  5 passed (5)
     Tests  234 passed (234)
Duration  2.24s
```

## Canonical Gate Status

**BLOCKED.** This local output is not represented as caller-owned canonical
Test Gate evidence. The isolated AWS Crabbox submission could not authenticate
to the required OpenClaw broker, and the delegated Blacksmith Testbox submission
could not start because `blacksmith` is absent from `PATH`. No concrete
non-`not-run` Test Gate reference was available in this task environment.

Production and test files were unchanged by this evidence-only follow-up.
