# External Deliberation plugin: cutover and retirement readiness

Host inspection, 2026-10-04. Proposal `proposal-20260831-170956-a06505`, section `externalize-openclaw-plugin`.

## Milestone disposition

Michal reported the first successful real Discord end-to-end message and explicitly closed that milestone in Discord message `1556295773237280881` (2026-10-04 15:23 Europe/Prague). Record this as user-observed live E2E, not a newly executed host test. No source messages, private content, credentials, or provider receipts are reproduced here. This does not turn historical rejected acceptance or failed tests into successful outcomes, nor complete the entire extraction proposal.

## Directly checked host observations

- `openclaw plugins list --json`: exactly one Deliberation entry, id `deliberation`, status `loaded`, origin `config`, version `2026.6.5`; entry `/Users/michal/.local/share/deliberation-pipeline/releases/0.1.0-1b21c0cb8a7deeaa-source-history/plugin/dist/index.js`. Entry SHA256 `f1701f1e559af2ff29fe0641d2e2d9a246fb90c77d454fe83e65b956b5b414d9`.
- Declared hooks: `inbound_event_policy`, `inbound_claim`, `before_dispatch`, `before_tool_call`, `message_sending`. Plugin-list discovery identifies the selected artifact; it is not alone evidence that every hook executed on the user scenario.
- Live `openclaw gateway call deliberation.status --json`: status `ok`; source-intake, claims, review, sender all enabled; source drift false; no queued draft/review/send/retry work. Runner installation projection remains `CRON_AUDIT_NOT_CONFIGURED`/unknown; do not label that reader repaired.
- Prior installed protocol-gate checkpoint: external-gate release `0.1.0-58b85d1696b8fd0b-external-gate`, six synthetic stages passed, first provider call 1, duplicate 0, attempt 1, empty queues. Loaded live plugin stayed on the source-history release; prior inspection found only probe JS different, with the renewal gate explicitly selecting the newer probe. Do not conflate selected live plugin identity and gate probe identity. Existing release retained for rollback; no new restart/config/replay/send was performed by this readiness inspection.

## Remaining implementation

Bundled build/discovery/package registration was already removed; `plans/checkpoints/deliberation_bundled_registration_removal.md` records it. The old `extensions/deliberation` directory still contains 43 files, including 15 test files. All 15 test relative paths exist in the external plugin package. Filename presence is not complete scenario-transfer proof.

Remaining executable/package references observed outside that directory: the `extensions/deliberation` importer in `pnpm-lock.yaml`; explicit npm exclusion `!dist/extensions/deliberation/**`; negative artifact assertions in `test/scripts/bundled-plugin-build-entries.test.ts`. Classify these separately: the latter two may remain intentional regression protections rather than references to remove blindly. Preserve generic host transport/history/channel APIs.

The earlier provider extraction receipt covers the KM/provider transfer, not automatically this 43-file plugin retirement. Prepare an explicit plugin removed/retained manifest and scenario mapping; do not claim an unrelated receipt proves plugin test transfer.

## Fresh external native suite: not green

Executed in `deliberation-pipeline/plugins/openclaw-deliberation`:

`node node_modules/vitest/vitest.mjs run --reporter=default`

Result: exit 1; 16 test files passed, 1 failed (17 total), 371 tests passed. `src/delivery-composition.test.ts` fails during import of `@openclaw/discord/api.js`, before its assertions run. It also imports `@openclaw/slack/api.js`. External package currently has no canonical test script or declared Vitest dependency; available local runner does not establish a reproducible package-owned lane. The historical fork baseline was 15 files / 345 passed, but counts alone do not establish scenario equivalence.

Earlier test-lane repair ancestry has rejected acceptance and exhausted follow-ups. Do not reset that chain or create a fresh root merely to bypass the failed gate. Narrow continuation authorization is required. A successful real Discord message does not discharge the missing composition test suite.

## Effective host automation: not isolated

Canonical project registry still has:

- `post_impl`: `cd ~/Projects/openclaw-fork && pnpm build && npm link && openclaw doctor`
- `deploy.enabled`: true; trigger `on_done`; command `bash ~/.openclaw/workspace/km-system/scripts/deploy-fork.sh all`; environment production.
- `testCommand`: `cd ~/Projects/openclaw-fork && npm test`.

The 2026-09-30 isolated pipeline policy is a proposal, not effective configuration. A no-deploy instruction to the worker does not disable these host hooks. Before cleanup dispatch, host must apply and verify a scoped reversible isolation policy, retain original registry values for restoration, and select an adequate affected-host verification gate. No hook or registry changes made in this inspection.

## Operator disposition

Cleanup remains necessary but is not ready for execution. Existing independent root `calm-fork-3432` stays manually held, with no runtime or plan; its prompt is refreshed to remaining work only. Unrelated successor manual hold remains intact. No historical task state is repainted.

Before release: resolve the native suite under explicitly authorized continuation; verify a reproducible external package/test contract and scenario mapping; provide a plugin-specific provenance manifest; isolate the fork's effective hooks; then use public pipeline controls. Runtime revalidation after source cleanup remains an operator action, not an implicit deployment by the worker.

## Superseding readiness check — user15:48

User message1556301986163327068 explicitly authorizes manually decoupling necessary links/hooks and starting the existing retirement. Host inspected actual selected artifacts: Deliberation external release loaded; Discord compiled host plugin and Slack source host plugin loaded. Global CLI remains linked to the fork itself, which is necessary for the working assistant; do not unlink it. The retired Deliberation source is not the selected runtime entry.

The plain external test failure was host test-environment wiring, not proof a new code repair is necessary. With existing host test resolution aliases and a single selected Slack SDK instance, all17nativefiles/380tests passed (2workers, unchanged5second test timeout, no exclusions). Native composition9tests ran successfully. See repo-local accepted host-integrated contract/log/43filemanifest at `plans/handoffs/deliberation-plugin-retirement/`. This is source-level host-integrated verification, not a self-contained installed package contract. External package reproducibility and historical failed gates remain separate claims, not repainted.

Canonical registry backup created; effective reader verifies `post_impl=''`, `deploy.enabled=false`, full `npm test` unchanged. This supersedes the earlier not-isolated observation. Restore only original changed hook fields after final host acceptance; do not overwrite unrelated later registry changes. No live restart/config/replay/send, no uninstall or unlink. Worker prompt forbids writing live dist while checking source.

This supplies technical retirement inputs and permits starting the independent existing cleanup under user instruction. No new root, failed-chain reset/waiver or successor manual-gate release.
