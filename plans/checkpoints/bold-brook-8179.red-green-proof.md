# TDD Red-Green Proof: bold-brook-8179

<!-- proof-capture-metadata: {"version":1,"task_id":"bold-brook-8179","command":["pnpm","test","src/agents/model-auth.profiles.test.ts"],"command_sha256":"dd4efbb8d9b39b8ec819421bce41b951bf1daabc0e2826945cd597a529502180"} -->

## RED Phase

- **Timestamp:** 2026-08-20T06:44:34.987094+00:00
- **Test command:** `pnpm test src/agents/model-auth.profiles.test.ts`
- **Exit code:** 1

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork

 ❯ |agents| src/agents/model-auth.profiles.test.ts (71 tests | 1 failed) 156ms
     × uses synthetic local auth for an OpenAI bridge despite a carried OAuth profile 5ms

 Test Files  1 failed (1)
      Tests  1 failed | 70 passed (71)
   Start at  08:44:32
   Duration  2.54s (transform 1.79s, setup 204ms, import 2.10s, tests 156ms, environment 0ms)

[ELIFECYCLE] Test failed. See above for more details.
```

### Standard Error

```text
$ node scripts/test-projects.mjs src/agents/model-auth.profiles.test.ts
[test] queued behind the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 15s for the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 30s for the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 46s for the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 1s for the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] still waiting 1m 16s for the local heavy-check lock held by test, pid 80120, cwd /Users/michal/Projects/openclaw-fork...
[test] starting test/vitest/vitest.agents.config.ts

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  |agents| src/agents/model-auth.profiles.test.ts > getApiKeyForModel > uses synthetic local auth for an OpenAI bridge despite a carried OAuth profile
Error: Auth profile "openai:default" uses oauth auth, but openai/openai-completions requires an OpenAI API key profile.
 ❯ assertAuthModeAllowedForModel src/agents/model-auth.ts:119:9
    117|     return;
    118|   }
    119|   throw new Error(
       |         ^
    120|     `Auth profile "${params.profileId}" uses ${params.mode} auth, but …
    121|   );
 ❯ resolveApiKeyForProvider src/agents/model-auth.ts:990:5
 ❯ src/agents/model-auth.profiles.test.ts:537:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

[test] failed 1 Vitest shard in 96.12s
```

## GREEN Phase

- **Timestamp:** 2026-08-20T06:46:15.426861+00:00
- **Test command:** `pnpm test src/agents/model-auth.profiles.test.ts`
- **Exit code:** 0

### Standard Output

```text

 RUN  v4.1.7 /Users/michal/Projects/openclaw-fork


 Test Files  1 passed (1)
      Tests  71 passed (71)
   Start at  08:46:14
   Duration  1.18s (transform 487ms, setup 83ms, import 900ms, tests 120ms, environment 0ms)

```

### Standard Error

```text
$ node scripts/test-projects.mjs src/agents/model-auth.profiles.test.ts
[test] starting test/vitest/vitest.agents.config.ts
[test] passed 1 Vitest shard in 3.83s
```
