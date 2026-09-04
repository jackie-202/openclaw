---
title: "A current CLI and stale listener can disagree over the same spool"
date: 2026-08-25
category: runtime-errors
component: backend
tags: [openclaw, deliberation, km, listener, process-lifecycle, diagnostics]
file_type: rules
---

# A current CLI and stale listener can disagree over the same spool

When a Python operator CLI lists a ready record but an authenticated listener on the canonical host and port does not, do not assume the TypeScript client or credential is wrong. Compare the listener process start time with every imported projection and validation module, not only the listener entry point and wire contract.

In this incident, endpoint host/port, file-backed credential resolution, listener script path, and canonical spool ownership all matched. The current CLI listed the target `READY_TO_SEND` record, while the long-running listener returned an empty list. Six imported Deliberation projection, validation, intake, delivery, and orchestration modules had changed after the listener started, so the process was serving an older in-memory implementation despite pointing at current source files and the same SQLite authority.

Use this diagnostic order:

1. Project endpoint and SecretRef shape without printing authority or secret values.
2. Run the real client read operation and retain only closed operation/path/stage/status/code/cause fields.
3. Compare CLI and listener projections without printing message text.
4. Verify listener executable, host, port, credential-file presence, and spool selection.
5. Compare process start time against all imported owner modules.

Do not patch the client to compensate for a stale owner process or weaken response validation. Add safe diagnostics and disposable lifecycle coverage, then leave deployment and listener restart to the operator-controlled rollout.
