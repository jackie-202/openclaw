# Isolated Pipeline Policy — Deliberation Plugin Externalization

**Status:** proposal for host decision. Nothing in this document has been applied.
**Prepared:** 2026-09-30 Europe/Prague, by the host, as the blocking half of manual gate **G30** in proposal `proposal-20260831-170956-a06505`, section `externalize-openclaw-plugin`.
**Companion:** `deliberation_plugin_externalization_prerequisites.md` (inspection evidence).

## 1. What we are actually trying to achieve

The end goal of slice 10 is narrow and worth stating plainly, because it is easy to confuse with a rewrite:

> Move the **source and tests** of the Deliberation plugin out of the OpenClaw fork into `~/Projects/deliberation-pipeline/plugins/openclaw-deliberation/`, install it back into OpenClaw as an ordinary external plugin, and keep the observable behavior identical.

Non-goals, stated so no agent invents them: no new engine, no new transport, no second delivery owner, no change to the pinned wire contract, no second copy of the domain implementation, and no new repository.

Why it matters: today the Deliberation domain lives in two places. The Python provider (`deliberation-pipeline`) owns spool, drafting, review, People Intel. The TypeScript plugin that feeds it and delivers its output lives inside the OpenClaw fork. Every upstream sync has to carry a domain component that has nothing to do with OpenClaw. Moving the plugin to the provider makes ownership match reality: OpenClaw becomes a host that loads a plugin, the provider owns its own edges.

## 2. The problem this policy solves

Slice 10 needs at least one implementation task that touches the fork. But the fork's registered automation currently couples _finishing a coding task_ to _rebuilding and deploying the live assistant_:

```
post_impl: cd ~/Projects/openclaw-fork && pnpm build && npm link && openclaw doctor
deploy:    bash ~/.openclaw/workspace/km-system/scripts/deploy-fork.sh all
           enabled: true, trigger: on_done, environment: production
testCommand: cd ~/Projects/openclaw-fork && npm test        # full suite
```

So a plugin-scoped task would, on completion, rebuild the fork, relink the globally installed `openclaw`, and fire a production deploy. The proposal already anticipated this and says a prohibition in the task prompt is not sufficient — which is correct, because these hooks are executed by the pipeline, not by the agent.

There is a second, quieter problem: the fork tree currently carries 60 uncommitted modifications, 8 of them inside the plugin. A build/deploy triggered now would ship that mixture.

## 3. Proposed policy

### P1 — Verification is scoped, not global

Replace the full-suite gate for plugin externalization work with the lane that actually covers the plugin:

```
node scripts/run-vitest.mjs run --config test/vitest/vitest.extensions.config.ts extensions/deliberation
```

Measured baseline: **15 files / 345 tests / pass / 4.12 s**, with no build, link or doctor step. A full `npm test` adds nothing for a plugin-local change and takes orders of magnitude longer.

### P2 — Building is decoupled from deploying

For the duration of slice 10, fork tasks in this lane run with:

- `post_impl` reduced to type/lint verification at most; explicitly **no** `npm link`, **no** `openclaw doctor`
- `deploy.enabled: false`

Rationale: `pnpm build` is a verification step and is defensible. `npm link` mutates the globally installed `openclaw` — that is an install, not a test. `openclaw doctor` inspects live configuration. `deploy-fork.sh all` is a production action. Only the first belongs in a task gate.

### P3 — Installation and activation stay with the host

The host performs, under explicit per-step approval: package build, external plugin install, configuration migration, and the switch from bundled to external. The proposal already requires that two receivers/deliverers are never simultaneously active, and that a rollback path exists before cleanup. None of that is delegable to a coding agent.

### P4 — The target project owns a real test lane before any transfer

Finding from the inspection: `extensions/deliberation` is in no `vitest.extension-*-paths.mjs` routing list. It runs only via the catch-all extensions shard. So there is no dedicated fork lane to retire — and the target project must create a genuine one. G31 must reject a placeholder.

The target project already has a clean, non-deploying pipeline profile, which is what makes this direction work at all:

```
deliberation-pipeline:  autocommit: true, deploy.enabled: false, post_impl: ''
                        testCommand: standalone integration verify
```

### P5 — Ordering

1. Reconcile or commit the 8 modified plugin files in the fork (host).
2. Apply P1+P2 to the fork's pipeline profile (host, reversible config).
3. Release `bold-brook-5925` — prepare portable package and transfer manifest, **provider-side**.
4. G31: host byte-verifies the manifest and copies approved sources/tests across.
5. Packaging and isolated external-load proof in the target project.
6. G32: host installs, switches, proves live behavior and rollback.
7. Only then remove the bundled copy from the fork.

### P6 — Restore afterwards

P2 is a scoped, temporary exception, not a permanent policy change. When slice 10 reaches its final host acceptance, the fork's `post_impl` and `deploy` settings are restored to their current values. This document records the original values so the restore is mechanical.

## 4. Open decisions for Michal

1. **Approve P1+P2** as a scoped, reversible change to the fork's pipeline profile? Without it G30 stays unmet and seq 79 stays held.
2. **B1 — SDK dependency:** the external package cannot use `workspace:*`. Pin a published `@openclaw/plugin-sdk` version, or declare it a host-provided peer dependency?
3. **B2 — `delivery-composition.test.ts`** imports the Discord and Slack plugin packages directly. Carry them as target dev dependencies, or rewrite the test against the SDK test API?
4. **B3 — build identity:** `delivery-probe.ts` walks up to `dist/build-info.json`. Externally that always misses. Accept a null commit, or require the host to pass build identity through the SDK?

Questions 2–4 are genuine design blockers named by the proposal; they should be answered before the preparation task runs, not discovered by an agent mid-implementation.

## 5. Explicit non-actions

Nothing here has been applied. The project registry is unchanged. No build, link, doctor, install or deploy was run against the fork. No source crossed a repository boundary. `bold-brook-5925` remains `backlog` / `pauseState=manual`.
