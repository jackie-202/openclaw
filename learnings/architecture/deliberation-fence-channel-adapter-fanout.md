---
title: "Durable attempts must fence channel adapter fan-out"
date: 2026-08-16
category: architecture
component: shared
tags: [deliberation, discord, durable-delivery, chunking, sole-send]
file_type: rules
---

# Durable attempts must fence channel adapter fan-out

A single call to a channel adapter is not necessarily one platform message. Discord's general `sendText` path applies character and line chunking and may issue several Discord requests while returning one attached result. A KM lifecycle that records one provider attempt and one message receipt cannot safely call that path without an additional fence.

For Deliberation's sole-send contract, inspect the loaded channel adapter's declared `textChunkLimit` and `chunker` before durable delivery. Proceed only when the exact text produces one unchanged chunk, then pass matching formatting overrides (`chunkMode: "length"`, `tableMode: "off"`, the same text limit, and the actual line count). If the adapter lacks those capabilities or predicts multiple chunks, fail the provider attempt without calling `sendText`.

This check belongs at the Deliberation-to-channel boundary, not in intake or the generic Discord adapter. It preserves normal Discord behavior for other callers while ensuring each Deliberation KM attempt maps to at most one platform message and one receipt.
