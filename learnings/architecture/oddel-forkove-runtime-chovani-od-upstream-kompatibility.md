---
title: "Oddel forkove runtime chovani od upstream kompatibility"
date: 2026-07-19
category: architecture
component: shared
tags: [openclaw, upstream-compatibility, model-selection, runtime-profiles]
file_type: decisions
---

# Oddel forkove runtime chovani od upstream kompatibility

Pri odstranovani zdvojene konfiguracni vrstvy nestaci zmenit sdileny resolver jen proto, ze ho pouziva novy runtime. `resolveChannelModelOverride` je upstream-owned kompatibilitni API a pouzivaji ho take status, agent command a plugin SDK. Jeho zmena by rozsirila fork diff a rozbila upstream konfigurace s `channels.modelByChannel`.

Spravny rez je:

- zachovat upstream schema, validaci, doctor migrace a legacy resolver,
- u fork-added message-time call sites pouzit primo `resolveChannelRuntimeProfile`,
- nedoplnovat chybejici `runtimeByChannel.model` z `modelByChannel`,
- testovat zvlast fresh session, existing session re-entry a oddeleni obou resolveru.

Pred rozhodnutim je nutne porovnat `git grep` a `git log upstream/main -- <files>`. Lokalni symbol muze byt forkove upraveny, ale jeho puvodni kontrakt muze byt stale upstream-owned. Autoreview v tomto pripade odhalil, ze prvni minimalni oprava omylem zmenila vsechny spotrebitele sdileneho resolveru; presun rozhodnuti do forkoveho call site odstranil fallback bez kompatibilitni regrese.
