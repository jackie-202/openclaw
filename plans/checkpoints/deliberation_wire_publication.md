# Deliberation Wire Publication Evidence

## Authority Map

- Public source authority: `contracts/deliberation-v2/v1/contract.json` and `contracts/deliberation-v2/v1/fixtures.json`.
- Runtime characterization: `lib/deliberation_wire.py`, `lib/deliberation_source_identity.py`, and `tests/test_deliberation_wire.py`.
- Private and excluded: spool/runtime state, credentials, workspace paths, deployment identity, protocol-gate evidence, drafting/reviewer contracts and internals.

## Transfer Bundle

- Bundle schema/version: `1` / `1`.
- Bundle SHA-256: `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`.
- `contracts/deliberation-v2/v1/contract.json`: `292e7f17b13379c8e909497084bddccb57e0f371f79f7113ebd894a78cd6a98f`.
- `contracts/deliberation-v2/v1/fixtures.json`: `357e965edb2a82b7793f92807928718843f31d6152c7524723cf65a7207c8a78`.
- Canonical bytes are UTF-8, lexicographically sorted compact JSON with one trailing newline.

## Fixture And Consumer Evidence

The focused publication suite passed (`83 passed` with the CLI contract suite; `107 passed` with wire, health-boundary, and delivery-gate coverage). It proves canonical current-authority equivalence, deterministic bytes, runtime-free CLI export/verification, and tamper, missing, unexpected, and version-mismatch rejection. The deterministic E2E suite passed (`52 passed`). The full code-health suite passed (`10,608 passed, 4 skipped`; warnings only).

The host transfers only `deliberation-wire-publication/` to the consumer, with no network publication. The consumer pins bundle schema/version, ordered member paths, every member digest, and the self-excluding bundle digest, then runs:

```bash
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=scripts:lib .venv/bin/python3 scripts/deliberation-v2.py \
  verify-wire-contract --output-directory <received-bundle-directory>
```

Protocol-gate proof remains private, deployed-identity-bound evidence. This export neither changes it nor refreshes it; its existing approved refresh process remains required.

## G17 → #18 Host Acceptance And Implementation/Deployment Policy (2026-09-10)

- Operator approval: Michal, Discord message 1547475473330868245 at 07:15 CEST, “ok tak proveď a pokračuj”, in response to the handoff and next-gate approval request.
- Releases only task `warm-crag-0106` (slot 18) in `complete-deliberation-spool-v21-proposal-20260904`. Later manual gates remain in force. Ordinary non-gated batch continuation remains permitted.
- Accepted producer leaf: `bold-mist-8938`, status done, acceptance ACCEPT, testing passed. Its final testing artifact reports exit 0, 10,614 passed, 4 skipped, 112 subtests passed. The earlier producer summary above predates this final follow-up test count.
- Host verified the source bundle with the producer's `verify-wire-contract` command, exit 0. Transferred exactly the three sanitized files (contract, fixtures, manifest), preserving bytes; all destination files compared byte-for-byte to the source. Bundle digest: `b9eaada06b60b8ecba17a378832f03591fbbf0e5a574844cd6b94a9d722ee338`.
- This repository-local handoff is the consumer input. The producer source paths above document provenance, not permission to import/read another checkout during implementation. Do not invoke the producer-side verifier from the coding task; implement and test local pin validation as specified in the task.

### Inspected host policy and effects

- Canonical project registry: `/Users/michal/.openclaw/workspace/skills/opencode-dev/projects.yaml`, `projects.openclaw-fork`.
- Existing `post_impl`: `cd ~/Projects/openclaw-fork && pnpm build && npm link && openclaw doctor`.
- Existing deploy: enabled, command `bash ~/.openclaw/workspace/km-system/scripts/deploy-fork.sh all`, trigger `on_done`, environment `production`.
- Host inspected the deploy implementation: it may build backend and/or UI, run npm link and doctor. It reports restart-needed but does not execute a gateway restart. The installed OpenClaw symlink points to this fork, so build/link effects are not an isolated sandbox deploy and may include unrelated existing working-tree changes.
- Decision: retain existing host policy unchanged and accept these existing automation-owned build/link/doctor effects for this approved continuation. No configuration toggle or scheduler change was made. This is not authorization for the coding agent to execute deployment, installation, restart, live messages, provider calls, real-data processing, or protocol cutover.
- The coding agent must restrict itself to the task's scoped plugin implementation and local fake tests. Unrelated existing dirty changes in approval/cron source, tests, learnings, and checkpoints are pre-existing work; preserve them and do not include them in task claims.
- A fresh restart/live cutover and deployed-identity/protocol-smoke authorization remains a separate host decision. Source/test acceptance is not deployed-runtime acceptance. No restart or live processing was performed to satisfy this gate.
