---
title: "Confine legacy target forms to compatibility inputs"
date: 2026-08-17
category: architecture
component: backend
tags: [delivery-target, migration, fail-closed, wire-contract]
---

The reconciled contract retained a bounded legacy string target only where KM reservation input still accepts it, while ready, invocation, and completion evidence use canonical structured targets. During protocol migrations, isolate legacy representations at the documented compatibility boundary and keep durable outputs canonical. Allowing legacy forms to leak into later lifecycle stages weakens exact target-equality fencing and makes destination-selected dispatch ambiguous.