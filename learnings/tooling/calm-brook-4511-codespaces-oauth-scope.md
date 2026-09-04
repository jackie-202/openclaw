---
title: "GitHub Codespaces gate potrebuje samostatny OAuth scope"
date: 2026-08-25
category: tooling
component: ci-cd
tags: [openclaw, test-gate, crabbox, codespaces, oauth, evidence]
file_type: checklist
---

# GitHub Codespaces gate potrebuje samostatny OAuth scope

Crabbox muze pouzit `github-codespaces` jako caller-owned vzdaleny runner, ale bezny `gh` token se scopes `repo` a `read:org` nestaci. Preflight skonci HTTP 403 a explicitne vyzaduje scope `codespace`.

Pred planovanim gate nejdriv overte `gh auth status` a `crabbox list --provider github-codespaces`. Chybejici scope doplnte prikazem:

```bash
gh auth refresh -h github.com -s codespace
```

Device authorization musi byt dokoncena, dokud tento prikaz stale polluje. Samotne zobrazeni jednorazoveho kodu ani pozdejsi autorizace po timeoutu nevytvori pouzitelny lokalni token, runner ani trvale run ID. Takovy stav je infrastrukturni blokace, ne neuspesny test a uz vubec ne kanonicky PASS.
