---
title: "Testy parseru s presnymi klici potrebuji kanonicke fixtures"
date: 2026-08-09
category: test-failures
component: tooling
tags: [deliberation, fixtures, closed-schema, vitest, contracts]
file_type: rules
---

# Oddel forkove runtime chovani od upstream kompatibility

Pri odstranovani zdvojene konfiguracni vrstvy nestaci zmenit sdileny resolver jen proto, ze ho pouziva novy runtime. `resolveChannelModelOverride` je upstream-owned kompatibilitni API a pouzivaji ho take status, agent command a plugin SDK. Jeho zmena by rozsirila fork diff a rozbila upstream konfigurace s `channels.modelByChannel`.

Spravny rez je:

- zachovat upstream schema, validaci, doctor migrace a legacy resolver,
- u fork-added message-time call sites pouzit primo `resolveChannelRuntimeProfile`,
- nedoplnovat chybejici `runtimeByChannel.model` z `modelByChannel`,
- testovat zvlast fresh session, existing session re-entry a oddeleni obou resolveru.

Pred rozhodnutim je nutne porovnat `git grep` a `git log upstream/main -- <files>`. Lokalni symbol muze byt forkove upraveny, ale jeho puvodni kontrakt muze byt stale upstream-owned. Autoreview v tomto pripade odhalil, ze prvni minimalni oprava omylem zmenila vsechny spotrebitele sdileneho resolveru; presun rozhodnuti do forkoveho call site odstranil fallback bez kompatibilitni regrese.

# Acceptance repair plans must include the owning implementation

When acceptance rejects a task because an externally owned listener still has the bug, repeating an owner gate as a blocked outcome cannot repair the task. The follow-up plan must include both owner-side implementation and consumer synchronization, and completion must require GREEN proof from the actual changed listener.

For a provenance-hashed consumer mirror:

- change and test the authoritative listener and canonical contract first;
- capture live behavior from the changed listener, not only mocked or mirror-derived consumer tests;
- synchronize the accepted artifact and hash into the consumer;
- link genuine historical RED evidence when the task requires it, then record fresh GREEN under the follow-up task;
- leave already accepted adjacent behavior untouched.

If the authority source is absent from the workspace, state that concrete availability requirement in the plan. Do not substitute a speculative mirror edit or describe unchanged baseline tests as implementation GREEN.

# Exact-key parser tests need canonical base fixtures

When a closed-schema response gains required keys, stale malformed fixtures can fail at the exact-key gate before reaching the field they intend to test. This produces misleading generic errors even when the parser is correct.

For Deliberation KM client tests, keep builders for otherwise-valid ready items and reservations. Derive malformed cases by overriding exactly one field, including `deliveryEnvelope`, `deliveryEnvelopeDigest`, or `reviewedTextHash`. This preserves closed-schema enforcement and proves each assertion reaches its named validation boundary.

Endpoint inventory tests must also execute active client methods rather than infer paths from historical contract counts. Trace the current caller sequence before renaming the expected count.
