---
title: "Exclusive inbound policy must identify one owner"
date: 2026-08-22
category: architecture
component: shared
tags: [openclaw, plugins, channels, deliberation, fail-closed]
file_type: rules
---

# Exclusive inbound policy must identify one owner

A pre-debounce policy that returns only `allowDebounce: false` protects event identity but does not protect channel side effects. The host must preserve which plugin declared `dispatch: "exclusive"`, and channels must re-evaluate that decision from authenticated preflight facts before acknowledgement, typing, auto-thread creation, command shortcuts, or normal dispatch.

Use a closed host decision such as `ordinary | separate | exclusive(ownerPluginId) | ambiguous`. Scan all policy hooks: priority may order ordinary policy evaluation, but it must not silently choose between two exclusive owners. Multiple exclusive claimants fail closed without invoking either claim.

For one exclusive owner, invoke only that plugin's targeted `inbound_claim`. Every outcome is terminal for the ordinary channel path, including disabled/declined intake, missing handler, timeout, and error. This lets the owner keep bounded diagnostics while preventing outage or configuration states from leaking traffic into ordinary assistant behavior.

The channel should carry original authenticated provider/account/conversation/parent/message/sender facts into the targeted claim. It must not reconstruct source identity from a generated reply thread or another transformed delivery target. Keep late dispatch guards as defense in depth for legacy and nonexclusive paths.
