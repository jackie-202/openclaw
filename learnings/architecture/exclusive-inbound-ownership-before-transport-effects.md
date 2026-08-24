---
title: "Výhradní vlastnictví inbound události předchází transportním efektům"
date: 2026-08-23
category: architecture
component: shared
tags: [deliberation, inbound, ownership, discord, slack, fail-closed]
file_type: rules
---

# Exclusive inbound policy must identify one owner

A pre-debounce policy that returns only `allowDebounce: false` protects event identity but does not protect channel side effects. The host must preserve which plugin declared `dispatch: "exclusive"`, and channels must re-evaluate that decision from authenticated preflight facts before acknowledgement, typing, auto-thread creation, command shortcuts, or normal dispatch.

Use a closed host decision such as `ordinary | separate | exclusive(ownerPluginId) | ambiguous`. Scan all policy hooks: priority may order ordinary policy evaluation, but it must not silently choose between two exclusive owners. Multiple exclusive claimants fail closed without invoking either claim.

For one exclusive owner, invoke only that plugin's targeted `inbound_claim`. Every outcome is terminal for the ordinary channel path, including disabled/declined intake, missing handler, timeout, and error. This lets the owner keep bounded diagnostics while preventing outage or configuration states from leaking traffic into ordinary assistant behavior.

The channel should carry original authenticated provider/account/conversation/parent/message/sender facts into the targeted claim. It must not reconstruct source identity from a generated reply thread or another transformed delivery target. Keep late dispatch guards as defense in depth for legacy and nonexclusive paths.

# Exclusive inbound ownership must be terminal before transport feedback

An aggregation policy is not enough to protect a plugin-owned source. The host must preserve a closed decision with the exclusive owner plugin ID, detect multiple owners without using priority as a tiebreaker, and target only that owner's claim handler.

For Discord and Slack, recompute the decision from authenticated route facts and run the targeted claim before acknowledgement, typing, auto-thread creation, system events, fast abort, normal dispatch, streaming, or fallback delivery. Every exclusive outcome is terminal, including decline, missing plugin, missing handler, timeout, and error. Ambiguous ownership is terminal without invoking either claimant.

Keep aggregation-only `separate` distinct from exclusive ownership so ordinary non-deliberation routes retain existing behavior. Discord bot-loop suppression remains an admission gate and must run before the exclusive claim, otherwise bot-authored loops can reach external intake despite channel suppression.

Diagnostics at this boundary should contain only bounded owner and reason codes. In particular, synchronous policy exceptions must not interpolate raw plugin errors because those strings can contain credentials or URLs.
