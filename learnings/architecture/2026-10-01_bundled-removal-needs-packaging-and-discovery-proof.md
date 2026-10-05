---
title: "Bundled plugin removal requires packaging and discovery proof"
date: 2026-10-01
category: architecture
component: tooling
tags: [plugins, externalization, packaging, migration]
file_type: rules
---

When externalizing a bundled plugin while its extensions/<id> source remains, removing a startup-test id does not stop source-checkout discovery: src/plugins/bundled-plugin-metadata.ts and src/plugins/discovery.ts scan the filesystem. Separate source-development inventory from freshly built and packaged inventory; exclude the plugin from build entries and root package files, then prove both packaged absence and all other bundled entries remain. A persisted enabled-plugin location bridge in src/cli/plugins-location-bridges.ts needs an actual npm/ClawHub install spec; a local package name alone is not evidence that automatic migration works. Keep existing enabled configurations visibly unresolved unless an installable external artifact and bridge proof exist.
