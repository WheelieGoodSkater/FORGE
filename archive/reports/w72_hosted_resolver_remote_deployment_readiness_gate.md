# W72 Hosted Resolver Remote Deployment Readiness Gate

Decision: PASS / REMOTE DEPLOYMENT READINESS GATE READY / REMOTE SMOKE NOT CONFIGURED / NO WRITE AUTHORITY

## Objective

Convert the local end-to-end hosted resolver smoke into a remote staging deployment readiness gate.

## Readiness Position

This block does not deploy a remote endpoint. It creates the readiness gate and command pack required before a remote staging endpoint can be used for pilot testing. Remote smoke is opt-in through `IDB_REMOTE_RESOLVER_SMOKE=1` and required secret/origin environment variables.

## Command Pack

```bash
node tools/run_remote_resolver_deployment_readiness_gate_harness.js
IDB_REMOTE_RESOLVER_SMOKE=1 IDB_REMOTE_RESOLVER_BASE_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_REMOTE_RESOLVER_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN=$IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN node tools/run_remote_resolver_deployment_readiness_gate_harness.js
IDB_APPROVED_LIVE_RESOLVER_SMOKE=1 IDB_RESOLVER_STAGING_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_RESOLVER_STAGING_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN node tools/run_approved_live_resolver_smoke_harness.js
```

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w72_contract_schema_present | idb.w72-hosted-resolver-remote-deployment-readiness-gate.v1 |
| PASS | w72_inherits_w71_local_e2e_pass | {"decision":"PASS","lane":"dealer_hardgoods","cacheHit":true} |
| PASS | w72_environment_config_complete | ["IDB_REMOTE_RESOLVER_BASE_URL","IDB_REMOTE_RESOLVER_TOKEN","IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN","IDB_REMOTE_RESOLVER_SMOKE"] |
| PASS | w72_secret_and_cors_policy_present | {"secrets":["Store resolver token in deployment secret manager or environment secret store.","Do not pass NetSuite cookies, NetSuite auth headers, SuiteScript URLs, record IDs, or write tokens to the resolver.","Log only tokenConfigured/tokenHashPrefix, never raw token.","Redact cookies, authorization headers, and manual evidence full text.","Rotate staging token before pilot and immediately after any failed auth anomaly."],"cors":{"allowed":["approved NetSuite account origins only","approved local preview origin only for development"],"blocked":["wildcard production CORS","unapproved public origins","null origin","file origin"],"requiredSmoke":["approved preflight returns 204 and echoes approved origin","blocked preflight returns 403 and does not echo blocked origin","POST without token returns 401 before website fetch","POST with write-shaped payload returns 400 before website fetch"]}} |
| PASS | w72_deployment_target_checklist_present | ["Deploy Node.js/serverless resolver service outside Tampermonkey and outside SuiteScript.","Set IDB_REMOTE_RESOLVER_BASE_URL to HTTPS remote staging URL.","Configure resolver token as environment secret.","Configure strict CORS allowlist for approved NetSuite staging origin.","Set max pages, page bytes, total bytes, timeout, and redirect controls from W67.","Enable cache key by normalized URL + resolverVersion + extractionPolicyVersion.","Enable redacted request trace and metrics.","Enable rate limits per token and per domain.","Expose /health and /idb/website-resolver/v1/resolve.","Verify rollback switch: clear drawer endpoint/token toggle and disable remote token.","Do not enable SuiteScript writes or transaction writes."] |
| PASS | w72_remote_command_pack_present | {"readinessOnly":"node tools/run_remote_resolver_deployment_readiness_gate_harness.js","remoteSmoke":"IDB_REMOTE_RESOLVER_SMOKE=1 IDB_REMOTE_RESOLVER_BASE_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_REMOTE_RESOLVER_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN=$IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN node tools/run_remote_resolver_deployment_readiness_gate_harness.js","approvedLiveSmoke":"IDB_APPROVED_LIVE_RESOLVER_SMOKE=1 IDB_RESOLVER_STAGING_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_RESOLVER_STAGING_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN node tools/run_approved_live_resolver_smoke_harness.js"} |
| PASS | w72_remote_smoke_gates_present | ["Remote /health returns serviceName, resolverVersion, extractionPolicyVersion, cacheStatus, writeAuthority none, suiteScriptInvocation false, nllmAdvisoryOnly true.","Approved CORS preflight passes without wildcard CORS.","Blocked CORS preflight fails without echoing blocked origin.","Missing or bad token returns 401 before website fetch.","Write-shaped payload returns 400 and no SuiteScript invocation.","Repeated eligible URL returns cacheHit true.","Approved live-site smoke has zero false-confident-wrong and zero unsupported claims.","Blocked, thin, unavailable, and timeout remain insufficient evidence with no lane candidates."] |
| PASS | w72_observability_and_rollback_present | {"observability":["Trace includes requestId, normalizedUrl, domain, resolverVersion, extractionPolicyVersion, fetchStatus, failureState, sourceUrls, confidence, cacheHit, latencyMs, writeAuthority, and nllmAdvisoryOnly.","Metrics include request count, p50/p95 latency, cache hit rate, failure-state rates, confidence-state rates, false-confident-wrong, and unsupported claims.","Alerts exist for false-confident-wrong greater than zero, unsupported claims greater than zero, timeout rate spike, blocked/thin spike, CORS anomaly, and p95 latency above target.","Remote logs redact token, cookies, authorization headers, and manual evidence full text."],"rollback":["Clear localStorage:idb.websiteResolver.endpoint.v1.","Clear localStorage:idb.websiteResolver.token.v1.","Set localStorage:idb.websiteResolver.localFallback.v1 to empty/true.","Disable remote resolver token.","Preserve trace exports for failed runs.","Keep SuiteScript writes disabled; no retry writes are allowed."]} |
| PASS | w72_pilot_go_no_go_present | {"goIf":["Remote readiness harness passes.","Remote health/auth/CORS/cache smoke passes.","Approved live-site smoke has zero false-confident-wrong.","Unsupported claims remain zero.","Failure states are visible and honest.","Rollback switch works without drawer code changes."],"noGoIf":["Any false-confident-wrong result appears.","Any unsupported claim appears.","CORS allows wildcard or blocked origin.","Resolver accepts NetSuite cookies, auth headers, SuiteScript URLs, record IDs, write tokens, or create flags.","Blocked, thin, unavailable, or timeout produces a confident lane.","Trace omits failure state, source URLs, or no-write boundary."]} |
| PASS | w72_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w72_best_next_prompt_present | Move through W73: Remote Hosted Resolver Smoke Execution. With the remote staging websiteResolverServiceV1 endpoint configured, run the W72 remote smoke command pack against the real hosted URL: health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, observability checks, rollback switch, and pilot go/no-go. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output executed remote smoke results, trace samples, W73 report, validator gates, and best next Codex prompt. |
| PASS | w72_remote_smoke_opt_in_not_required_for_readiness_pack | remote smoke skipped until IDB_REMOTE_RESOLVER_SMOKE=1 and secret env vars are configured |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W73: Remote Hosted Resolver Smoke Execution. With the remote staging websiteResolverServiceV1 endpoint configured, run the W72 remote smoke command pack against the real hosted URL: health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, observability checks, rollback switch, and pilot go/no-go. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output executed remote smoke results, trace samples, W73 report, validator gates, and best next Codex prompt.
```
