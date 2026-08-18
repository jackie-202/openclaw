---
title: "Keep operator routing out of intake payloads"
date: 2026-08-14
category: architecture
component: backend
tags: [deliberation, routing, operator-config, km-contract, durable-envelope]
file_type: rules
---

# Keep operator routing out of intake payloads

When a plugin adds an operator-owned delivery override, do not add routing authority to the inbound hook event or pass through a caller-provided field. Inject the canonical target inside the closed client boundary that already owns parsed plugin config, and reject intake objects that attempt to supply the same field.

Persist the effective destination in the KM-owned delivery envelope before reservation. The final adapter must use that reserved value for provider addressing, invocation evidence, and completion evidence. Reading mutable config after reservation or recomputing from `sourceTarget` can make the real send disagree with durable fencing after reload or config change.

For contract-gated work, verify the accepted local schema first. If the intake and envelope fields are not yet present, stop before tests and product edits rather than guessing optionality, defaulting, or field names.
