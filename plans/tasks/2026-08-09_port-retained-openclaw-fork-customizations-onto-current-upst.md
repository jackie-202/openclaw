---
title: Port retained OpenClaw fork customizations onto current upstream
---

# Port retained OpenClaw fork customizations onto current upstream

## Objective

Work only in the clean sync worktree `/Users/michal/Projects/openclaw-upstream-sync-20260809-180149` on branch `sync/clean-upstream-20260809-180149`, based at upstream commit `4b85d834ed1586062f31bded2f358fc5192d1674`.

Port the custom behavior that is still absent from current upstream. Do not replay the old commit tail mechanically. The original checkout `/Users/michal/Projects/openclaw-fork` is evidence-only and must not be edited, checked out, reset, linked, or used as the task cwd.

## Preserved rollback evidence

- Old fork HEAD: `03639ab0774c8a7a47f5301457e6c76a0474c415`
- Remote rollback tag: `rollback/pre-upstream-sync-20260809-172217`
- Clean target branch: `sync/clean-upstream-20260809-180149`
- Clean target base: `4b85d834ed1586062f31bded2f358fc5192d1674`

## Audit verdict to follow

### Port/adapt

1. `c387494b4769fd0d2ec94929262a9be4fbbc5b05` — local `.gitignore` Swabble entry. This may be applied directly if still relevant.
2. WhatsApp `deliveryPolicy: plugin-only` logical family:
   - `1b491abbd9084af43368e963473500a698195015`
   - `74ccfb5752eb63ee88dec370ae8b610564ced7c4`
   - `1516cd91d811b375a44602e72096485f2e34d9f6`
   Reimplement on current WhatsApp plugin-owned schema/config and current inbound policy/delivery architecture. Preserve the later corrected merge semantics and use public SDK exports from the outset.
3. Defensive WhatsApp login normalization from `1d066c8d2c5f5b4fb45d9b1704de7299ec93eab6`, adapted to current login code, with focused tests for untrusted/non-Error results.
4. Credential registry/documentation semantic delta from `60b779d8c9e2bdb07f40cff10bd0f96584189a39`. Update only current canonical source registry/matrix and generated docs if the relevant Deliberation credential surface is still missing. Do not replay old lockfile or generated prose blindly.
5. Deliberation extension final behavior represented by this stack:
   - `120dc9059c0ba6416516390310188982eb15e598`
   - `b734b8e3ee4683ffd46f9f291605ba612ac8dc53`
   - `9f6f2ad55200c82c52c9e9f9a0473fc32beb7458`
   - `28dacc24ebb3e24a455d839dd6ecff0d24ac9294`
   - `e7a0517245be14e94c90b1bc45643bcc070a4a6f`
   - `03639ab0774c8a7a47f5301457e6c76a0474c415`
   Port this as one current-API implementation, not as six blind cherry-picks. Preserve final-state behavior: manifest/config, KM client and contracts, hardened route matching and intake guards, canonical source identity, media-only safe placeholders, fail-closed observable skips without payload leakage, host-runtime Discord intake where genuinely required, sole-send guarantees, history-read v1/v2, final adapter, listener/probe tooling, and the refreshed final KM contract fixtures.

### Explicitly skip as already upstreamed or obsolete

Do not port these unless current source inspection disproves the audit:

- `da1059a30450` inbound_claim — current upstream already has mature targeted claim/outcome APIs.
- `b0da725a110f` cron trajectory opt-out — current upstream already carries `disableTrajectory` and cron coverage.
- `47c4aff1db67` plus trajectory part of `7dd48ebcb8db` — queued writer exists and evolved upstream.
- Channel runtime/model authority series `9c09c259528`, `f7d039a3575`, `0529559822f1`, `435059f7d634`, `0b4e3efe7331` — upstream contains the intended final authority model; do not resurrect removed `runtimeByChannel` divergence.
- `031cdbf89477` reasoning effort — upstreamed under current stream-wrapper architecture.
- `dc43c20df50c` cron failure markers — upstreamed.
- `2c030c303aba` speech-core alias — obsolete package architecture.
- `e904c5b752d8` generated metadata — regenerate from current sources if needed.
- `44c82cded640` historical plan and unrelated architecture/checkpoint evidence — omit from product port.

## Required implementation order

1. Characterize current upstream plugin, inbound claim, WhatsApp config/inbound, SecretRef registry, Discord host-runtime, and extension build/loader seams. Add or preserve focused tests before behavior-sensitive edits.
2. Port the isolated WhatsApp behavior and login normalization.
3. Establish Deliberation manifest/config, KM client/contracts, source identity, routing/intake and sole-send behavior against current plugin APIs.
4. Prefer current generic `inbound_claim` registration and host dispatch contracts. Modify Discord/core only when required metadata cannot be obtained through the generic current API; explain any such seam in the final note.
5. Add history-read/final-adapter capabilities, listener/probe tooling and final contract fixtures.
6. Integrate with current build/loader/credential metadata conventions. Regenerate derived config/schema/docs metadata from current sources rather than copying stale generated files.
7. Run focused tests continuously, then the smallest relevant broader plugin/Discord/WhatsApp suites.

## Scope boundary

Allowed write scope is only `/Users/michal/Projects/openclaw-upstream-sync-20260809-180149`.

The old checkout is read-only evidence. Do not inspect unrelated projects, `~/.openclaw/openclaw.json`, live KM data, or external repositories. Do not run `npm link`, restart/stop/start the gateway, push, force-push, merge, or alter Git branches/worktrees. Do not include git lifecycle instructions in implementation output.

## Acceptance criteria

- Target worktree contains only deliberate current-upstream adaptations, not wholesale replay of obsolete files or historical evidence.
- Current upstream behaviors listed in the skip section remain the authority and are not duplicated.
- WhatsApp plugin-only delivery policy has schema/config and inbound behavior tests, with corrected policy merge semantics.
- Defensive WhatsApp login handling is covered by focused tests.
- Deliberation extension builds against current plugin APIs and its focused tests cover configuration, KM wire contracts, route matching, intake guards, source identity, sole-send behavior, history reads/final adapter, and refreshed KM client fixtures.
- Generated metadata is regenerated from current source where required.
- No runtime deployment, link, restart, main rewrite, or remote push occurs.

## Verification

Run and record:

- focused tests for every adapted module,
- relevant plugin loader/source-checkout and SecretRef consistency checks,
- relevant WhatsApp and Discord suites touched by the port,
- Deliberation extension tests,
- config/channel/schema generation commands required by current repository scripts,
- `pnpm build`, including plugin SDK DTS/export gates,
- current local doctor entrypoint against repository defaults only if it does not require mutating live config; otherwise leave doctor to the promotion gate and state why.

The final note must list applied/adapted/skipped patch families, changed production seams, exact verification commands/results, generated files, and any remaining blocker before branch-level smoke.
