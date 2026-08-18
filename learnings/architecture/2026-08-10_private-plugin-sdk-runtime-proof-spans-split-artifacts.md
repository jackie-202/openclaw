---
title: "Private plugin SDK runtime proof spans split artifacts"
date: 2026-08-10
category: architecture
component: tooling
tags: [plugin-sdk, private-runtime, package-exports, speech-core, release-check]
file_type: rules
---

# Private plugin SDK runtime proof spans split artifacts

When a retired workspace package has been replaced by a private-local plugin SDK entrypoint, the public SDK export checker is not sufficient proof of the replacement. Private runtime facades deliberately use a split contract:

- The entrypoint and private-local inventories classify the route.
- The root package export exposes runtime JavaScript without a public declaration condition.
- Ordinary builds still include the entrypoint and release checks require its JavaScript artifact.
- Root-package private declarations are excluded, while official plugin package-boundary typechecking resolves generated declarations from `packages/plugin-sdk`.
- Core runtime code must use relative imports instead of importing the private plugin SDK route.

For `speech-core` retirement at base `4b85d834ed1586062f31bded2f358fc5192d1674`, this means `openclaw/plugin-sdk/speech-core` and `openclaw/plugin-sdk/tts-runtime` must be audited across `package.json`, both plugin SDK inventories, `scripts/lib/plugin-sdk-entries.mts`, `tsdown.config.ts`, `scripts/release-check.ts`, `extensions/tsconfig.package-boundary.paths.json`, and the subpath guard. A green public `check-plugin-sdk-exports` result alone cannot prove either private runtime facade.

Before promotion, build the pinned base, inspect the generated private runtime JavaScript, resolve both current package subpaths from the intended source and packed environments, and run the real lazy reply path. Keep those dynamic checks separate from the static architectural verdict.
