---
title: "Výhradní vlastnictví předchází retry a thread state"
date: 2026-08-23
category: architecture
component: shared
tags: [openclaw, deliberation, exclusive-ownership, discord, slack]
file_type: rules
---

# Exclusive ownership precedes channel retry and thread state

Channel-level exclusive ownership cannot be certified from the main message processor alone. Discord recognized system messages can enqueue and return before processing, while Slack can resolve thread history or arm `message` to `app_mention` retry state before the owner runs. Empty-content and bot-loop guards can likewise terminate without an attributed result.

When adding exclusive source ownership:

- Inventory all authenticated exits between provider callback and ordinary dispatch, including subtype/system handlers and empty-content drops.
- Carry system-event data to the canonical claim boundary, then perform the unchanged ordinary enqueue only after a nonterminal claim.
- For attributed sources, resolve policy before debounce, retry allowances, thread routing, bot-loop state, and other ordinary mutations. A retry marker cleared after an asynchronous claim is still racy; it must never be armed for an exclusive event.
- Treat missing child-thread identity as an attributed fail-closed claim input rather than performing an ordinary provider history lookup before ownership.
- Test through the real plugin loader and provider handler. Directly testing a late preparation/processing function can pass while an earlier provider branch still bypasses ownership.
- Pair every configured-source assertion with a non-configured control that proves ordinary behavior is unchanged.
