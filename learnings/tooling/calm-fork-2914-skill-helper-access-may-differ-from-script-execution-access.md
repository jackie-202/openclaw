---
title: "Skill helper access may differ from script execution access"
date: 2026-08-23
category: tooling
component: tooling
tags: [permissions, skills, external-directory, workaround]
---

Loading the learning skill succeeded, but a direct tool read of its helper script was denied by external-directory permissions even though the skill directory appeared allowed. Executing the known helper path through the shell still succeeded and produced the learning file. When skill resources hit tool-specific permission boundaries, do not assume every access mechanism has identical authorization; use the documented skill command or helper invocation rather than bypassing the workflow or abandoning the required artifact.
