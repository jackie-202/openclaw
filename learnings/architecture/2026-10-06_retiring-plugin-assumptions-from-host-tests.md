---
title: "Retiring plugin-specific assumptions from host tests"
date: 2026-10-06
category: architecture
component: tooling
tags: [plugin-retirement, host-tests, exclusive-owner, assertion-ownership]
file_type: rules
---

# Retiring plugin-specific assumptions from host tests

When a bundled plugin implementation is retired, native channel tests can still own essential host behavior. Inventory their assertions by owner before changing fixtures: retain handler invocation, host-built event/context facts, exclusive terminal behavior, side-effect ordering, duplicate-envelope arbitration, and ordinary-path continuation. Remove plugin discovery/configuration and wire serialization assertions only when their exact ownership is producer-side and replacement coverage is identified.

Use a minimal generic exclusive-owner fixture to exercise real Discord/Slack processing paths. Keep plugin arbitration mechanics in generic hook tests, avoid copying a retired implementation into a fixture, and do not describe source-suite coverage as installed-package parity. Preserve build/package absence guards unless separate clean-artifact evidence authorizes metadata cleanup.
