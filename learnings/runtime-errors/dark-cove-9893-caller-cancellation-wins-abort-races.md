---
title: "Caller cancellation must win combined-signal abort races"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, node-http, abort, timeout, diagnostics]
file_type: rules
---

# Caller cancellation must win abort races

The Deliberation KM client combines a caller signal with `AbortSignal.timeout()` and uses a Node HTTP transport. Node reports either source through the same `AbortError` / `ABORT_ERR` shape, so inspecting only the timeout signal can misclassify a real caller cancellation when both signals become aborted before the transport rejection is handled.

Classify only abort-shaped failures from signal state, and give the original caller signal precedence:

```ts
if (isAbortError(error)) {
  return callerSignal?.aborted ? "aborted" : timeoutSignal.aborted ? "timeout" : "aborted";
}
```

Do not apply signal precedence to unrelated transport failures such as `ECONNRESET`; a caller signal that aborts after an independent socket failure must not rewrite that failure. A deterministic regression can hold the transport rejection, abort the caller, let the timeout expire, and then reject with Node's `ABORT_ERR` to prove the race resolves as caller cancellation.
