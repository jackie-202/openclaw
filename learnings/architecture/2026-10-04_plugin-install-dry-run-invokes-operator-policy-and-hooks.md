---
title: "Plugin install dry-run invokes operator policy and hooks"
date: 2026-10-04
category: architecture
component: backend
tags: [openclaw, plugins, approvals, preflight, install-policy]
file_type: rules
---

In OpenClaw, installPluginFromArchive with dryRun still reaches scanPackageInstallSource or scanBundleInstallSource. Those scans invoke security.installPolicy and before_install hooks before the dryRun return in installPluginDirectoryIntoExtensions (src/plugins/install.ts; src/plugins/install-security-scan.runtime.ts). Do not use installer dryRun as a side-effect-free preview for agent-driven approval cards. Reuse the installer metadata, archive, compatibility and target validators without executing policies or candidate plugin code; mark policy and hook evaluation deferred. After authorized allow-once, run the existing full installer so those checks remain mandatory, and compare the actual config delta with the reviewed delta. Also inspect src/cli/plugins-install-persist.ts: plugin enablement modifies allow/deny and slot selection, and install record commits request restart by default; an approval-bound install must explicitly suppress automatic restart and report restart required.
