---
title: OpenClaw Deliberation plugin pin to published domain wire contract
type: implementation
---

# OpenClaw Deliberation plugin pin to published domain wire contract

## Project and manual gate

M, openclaw-fork ONLY; extensions/deliberation and its focused tests/docs. Proposal proposal-20260831-170956-a06505 / openclaw-session-adapter; sequential batch complete-deliberation-spool-v21-proposal-20260904. Consumes preceding canonical-publication task. HOST MUST supply plans/checkpoints/deliberation-wire-publication/ and plans/checkpoints/deliberation_wire_publication.md in this repository containing the accepted exact artifact, manifest/digests, producer fixtures and authority map. Task is explicitly manually paused until this evidence and the host's implementation/deployment-policy checkpoint are approved. Fork pipeline configuration may have post-implementation build/link/deploy effects; task text cannot override host automation. Host must resolve those before release. Do not edit runtime config or deployment policy from this task.

## Work

Characterization first. Inspect current extensions/deliberation/contracts/km-wire-v1.json, provenance.json, source-identity fixtures and src/contract.test.ts. Replace independent domain-owned wire definitions with the supplied published artifact pinned by explicit version and digest. Preserve plugin-specific overlays and genuine OpenClaw-owned transport/history/delivery API contracts; the authority map determines membership, not a broad glob. Do not reassign all plugin schemas to deliberation.
Consumers/tests use the pinned local artifact; no runtime network fetching, sibling repo reads/imports, generation from remote source or mirrored hand-maintained authority. Add extensions/deliberation/src/deliberation-wire-pin.test.ts (basename checked absent; recheck) to reject modified/missing/mismatched files and prove all relevant request/status/response fixtures remain supported. Adapt local validation/provenance wiring only as required, retaining authentication, closed-schema checks, intake freshness, source identity, accepted-versus-completed distinctions, duplicate protection and final-delivery ownership. No protocol/workflow/schema redesign or unrelated plugin cleanup. If producer contract cannot represent actual consumer behavior, stop with an explicit incompatibility report; never silently hand-edit the pin.

## Acceptance

Run local plugin contract, pin, intake, history, reservation/completion and delivery test coverage with fakes; producer fixture copy and consumer coverage agree on the same version/digest. No live sessions, message sending, provider calls, spool mutations, service restarts or installation by the coding agent. No edits to KM or another checkout. Record commands/results, baseline failures, authority and exact digests in plans/checkpoints/deliberation_wire_pin.md. Explain separately required build/deployed-identity/protocol smoke evidence without claiming it ran. Missing host bundle or policy checkpoint is a blocker. New files domain-qualified, never utils/config/state/common/helpers modules. Consumer pin survives later source-repo move without a dependency on its path.
