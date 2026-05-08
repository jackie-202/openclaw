---
title: "Plan malformed runtime outcomes before branch reads"
date: 2026-05-04
category: patterns
component: backend
tags: [planning, tdd, whatsapp, defensive-errors]
file_type: rules
---

# Plan malformed runtime outcomes before branch reads

When planning a defensive fix for a supposedly typed async result, include an explicit test for `undefined` before any discriminant branch reads. In the WhatsApp login crash, guarding only `result.error` would miss the earlier `result.outcome` read in `loginWeb`; the plan needs a RED test where `waitForWhatsAppLoginResult` resolves `undefined` so the implementation must guard the whole result before inspecting `outcome`.

For plugin tests, a dedicated file with a direct mock of the producer function is clearer than forcing the producer path to create an impossible malformed union value. Keep the normal producer tests separate and use the malformed-result test to validate the consumer boundary.
