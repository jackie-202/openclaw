---
title: "Acceptance retries must expose the preserved owning diff"
date: 2026-08-03
category: tooling
component: backend
tags: [openclaw, acceptance, discord, deliberation, tdd]
file_type: rules
---

# Acceptance retries must expose the preserved owning diff

When an acceptance follow-up inherits a correct but uncommitted implementation, fresh test narratives alone do not repair a `required_implementation_missing` finding. The task-scoped evidence must explicitly retain and surface the owning production diff, not only tests and checkpoint prose.

For Discord Deliberation intake, route matching remains account-qualified, but the KM grouping identity is built from the normalized route target:

```ts
sourceTarget: `discord:channel:${route.target}`;
```

The strongest compact proof combines three surfaces:

1. The owning production diff in `extensions/deliberation/src/intake.ts`.
2. A unit matrix proving bare and `channel:` runtime targets normalize identically across account IDs.
3. A loader-backed Discord ingress test proving the exact pilot-channel payload, rejecting the old account-qualified value, and asserting the terminal hook result.

For TDD provenance after implementation already exists, link the genuine historical RED and capture fresh GREEN. Never revert correct production code solely to manufacture a new failure.
