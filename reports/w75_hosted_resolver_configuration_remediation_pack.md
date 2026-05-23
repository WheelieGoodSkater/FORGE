# W75 Hosted Resolver Configuration Remediation Pack

Decision: PASS / REMEDIATION PACK READY / HOSTED PILOT STILL NO-GO / NO WRITE AUTHORITY

## Objective

Create the exact remediation package needed before consultant hosted resolver pilot traffic can be enabled.

## Current Position

W74 remains no-go because W73R did not execute against a real hosted endpoint. Hosted resolver pilot traffic stays disabled until W75 is applied and W76 proves the configured remote endpoint.

## Required Environment

| Variable | Owner | Required Shape | Validation |
| --- | --- | --- | --- |
| IDB_REMOTE_RESOLVER_SMOKE | Regression Guard Agent | 1 | W73R must observe remoteSmokeOptIn true. |
| IDB_REMOTE_RESOLVER_BASE_URL | Resolver Service Architect | https://<remote-staging-resolver> | Must be HTTPS and must not be localhost, loopback, private network, or metadata IP. |
| IDB_REMOTE_RESOLVER_TOKEN | Security Guard | <secret-manager-value> | Must be configured from protected environment or secret manager and redacted from all traces/reports. |
| IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN | Security Guard | https://<approved-netsuite-account>.app.netsuite.com | Approved OPTIONS preflight returns allow-origin matching this exact origin. |
| IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN | Security Guard | https://unapproved.example.com | Blocked OPTIONS preflight fails and does not echo the blocked origin. |

## Owner Checklist

| Role | Tasks |
| --- | --- |
| Resolver Service Architect | Deploy the W69 endpoint wrapper or equivalent hosted service.; Expose /health and /idb/website-resolver/v1/resolve.; Confirm cache adapter is enabled for staging.; Confirm timeout and page-size controls match W62/W63. |
| Security Guard | Configure token validation.; Configure strict CORS allowlist.; Confirm cookie/auth-header rejection.; Confirm write-shaped payload rejection. |
| Website Intelligence Agent | Run approved live-site smoke through the hosted endpoint.; Verify evidence coverage, source URLs, status, and failure states.; Confirm blocked/thin/unavailable/timeout remain insufficient evidence. |
| Regression Guard Agent | Run W73R with remote config present.; Run full preflight.; Confirm zero false-confident-wrong and zero unsupported claims.; Confirm hosted pilot toggle remains disabled until W73R passes. |
| Consultant UX Director | After W73R passes, run the hosted-only consultant smoke.; Verify Plan/Review/ROI/Run/Trace show concise resolver status and rollback guidance.; Confirm no repeated audit detail crowds the live consultant view. |

## Rerun Command Pack

```bash
IDB_REMOTE_RESOLVER_SMOKE=1 IDB_REMOTE_RESOLVER_BASE_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_REMOTE_RESOLVER_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN=$IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN node tools/run_remote_resolver_deployment_readiness_gate_harness.js
IDB_APPROVED_LIVE_RESOLVER_SMOKE=1 IDB_RESOLVER_STAGING_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_RESOLVER_STAGING_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN node tools/run_approved_live_resolver_smoke_harness.js
npm run harness:execute-remote-hosted-resolver-smoke
npm run preflight
```

## Pilot Unlock Criteria

- W73R trace shows remoteSmokeExecuted true.
- Remote /health confirms writeAuthority none, suiteScriptInvocation false, and nllmAdvisoryOnly true.
- Approved CORS passes with exact allowed origin.
- Blocked CORS fails with no blocked-origin echo.
- Missing token returns 401 before fetch.
- Write-shaped payload returns 400 before fetch.
- Second eligible resolve returns cacheHit true.
- Approved live-site smoke passes with zero false-confident-wrong.
- Approved live-site smoke passes with zero unsupported claims.
- Blocked/thin/unavailable/timeout sites return insufficient evidence with no confident lane guesses.
- Full preflight passes after W73R remote execution.
- W74 can be rerun and returns hosted resolver consultant smoke eligible.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w75_contract_schema_present | idb.w75-hosted-resolver-configuration-remediation-pack.v1 |
| PASS | w75_inherits_w74_no_go | {"w74Decision":"no_go_w73r_remote_smoke_not_executed","enabled":false} |
| PASS | w75_env_setup_complete | [{"name":"IDB_REMOTE_RESOLVER_SMOKE","requiredValueShape":"1","ownerRole":"Regression Guard Agent","purpose":"Explicit opt-in so remote smoke cannot run accidentally.","validation":"W73R must observe remoteSmokeOptIn true."},{"name":"IDB_REMOTE_RESOLVER_BASE_URL","requiredValueShape":"https://<remote-staging-resolver>","ownerRole":"Resolver Service Architect","purpose":"Public remote staging websiteResolverServiceV1 base URL.","validation":"Must be HTTPS and must not be localhost, loopback, private network, or metadata IP."},{"name":"IDB_REMOTE_RESOLVER_TOKEN","requiredValueShape":"<secret-manager-value>","ownerRole":"Security Guard","purpose":"Resolver API token sent by test harness and drawer adapter placeholder.","validation":"Must be configured from protected environment or secret manager and redacted from all traces/reports."},{"name":"IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN","requiredValueShape":"https://<approved-netsuite-account>.app.netsuite.com","ownerRole":"Security Guard","purpose":"Approved NetSuite staging origin for CORS preflight and hosted drawer requests.","validation":"Approved OPTIONS preflight returns allow-origin matching this exact origin."},{"name":"IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN","requiredValueShape":"https://unapproved.example.com","ownerRole":"Security Guard","purpose":"Negative CORS smoke origin.","validation":"Blocked OPTIONS preflight fails and does not echo the blocked origin."}] |
| PASS | w75_secret_handling_no_raw_values | ["Do not commit resolver tokens to repo files, README, reports, trace samples, screenshots, or shell history snippets.","Use a secret manager, protected CI variable, or local shell export outside the repository.","Only record tokenConfigured true or false in traces.","Never print Authorization, cookie, or X-IDB-Resolver-Token raw values.","Reject inbound cookie/auth-header shaped browser session payloads at the resolver endpoint.","Rotate the staging token before moving from internal smoke to consultant pilot."] |
| PASS | w75_cors_origin_checklist_present | {"approved":["Use the exact NetSuite staging account origin.","Do not use wildcard production CORS.","Do not allow arbitrary consultant-entered website origins.","Allow POST and OPTIONS only for the resolver endpoint."],"blocked":["Use a known unapproved HTTPS origin for negative smoke.","Verify blocked origin gets no allow-origin echo.","Verify blocked origin cannot reach fetch logic.","Keep CORS rejection separate from URL blocked/thin/unavailable/timeout failure states."]} |
| PASS | w75_deployment_owner_checklist_complete | [{"ownerRole":"Resolver Service Architect","tasks":["Deploy the W69 endpoint wrapper or equivalent hosted service.","Expose /health and /idb/website-resolver/v1/resolve.","Confirm cache adapter is enabled for staging.","Confirm timeout and page-size controls match W62/W63."]},{"ownerRole":"Security Guard","tasks":["Configure token validation.","Configure strict CORS allowlist.","Confirm cookie/auth-header rejection.","Confirm write-shaped payload rejection."]},{"ownerRole":"Website Intelligence Agent","tasks":["Run approved live-site smoke through the hosted endpoint.","Verify evidence coverage, source URLs, status, and failure states.","Confirm blocked/thin/unavailable/timeout remain insufficient evidence."]},{"ownerRole":"Regression Guard Agent","tasks":["Run W73R with remote config present.","Run full preflight.","Confirm zero false-confident-wrong and zero unsupported claims.","Confirm hosted pilot toggle remains disabled until W73R passes."]},{"ownerRole":"Consultant UX Director","tasks":["After W73R passes, run the hosted-only consultant smoke.","Verify Plan/Review/ROI/Run/Trace show concise resolver status and rollback guidance.","Confirm no repeated audit detail crowds the live consultant view."]}] |
| PASS | w75_w73r_rerun_command_pack_present | {"localPrecheck":"npm run harness:execute-remote-hosted-resolver-smoke","remoteReadinessSmoke":"IDB_REMOTE_RESOLVER_SMOKE=1 IDB_REMOTE_RESOLVER_BASE_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_REMOTE_RESOLVER_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN=$IDB_REMOTE_RESOLVER_BLOCKED_ORIGIN node tools/run_remote_resolver_deployment_readiness_gate_harness.js","approvedLiveSmoke":"IDB_APPROVED_LIVE_RESOLVER_SMOKE=1 IDB_RESOLVER_STAGING_URL=$IDB_REMOTE_RESOLVER_BASE_URL IDB_RESOLVER_STAGING_TOKEN=$IDB_REMOTE_RESOLVER_TOKEN IDB_RESOLVER_ALLOWED_ORIGIN=$IDB_REMOTE_RESOLVER_ALLOWED_ORIGIN node tools/run_approved_live_resolver_smoke_harness.js","w73rExecution":"npm run harness:execute-remote-hosted-resolver-smoke","fullPreflight":"npm run preflight"} |
| PASS | w75_no_secret_trace_rules_present | ["Trace may include baseUrlConfigured but not the raw base URL when not needed for operator action.","Trace may include tokenConfigured but never token value.","Trace may include allowedOriginConfigured and blockedOriginConfigured booleans.","Trace may include safeBaseUrlConfigured boolean.","Trace must keep rawSecretsIncluded false.","Report must never include request headers containing token, cookie, or Authorization values."] |
| PASS | w75_pilot_unlock_criteria_complete | ["W73R trace shows remoteSmokeExecuted true.","Remote /health confirms writeAuthority none, suiteScriptInvocation false, and nllmAdvisoryOnly true.","Approved CORS passes with exact allowed origin.","Blocked CORS fails with no blocked-origin echo.","Missing token returns 401 before fetch.","Write-shaped payload returns 400 before fetch.","Second eligible resolve returns cacheHit true.","Approved live-site smoke passes with zero false-confident-wrong.","Approved live-site smoke passes with zero unsupported claims.","Blocked/thin/unavailable/timeout sites return insufficient evidence with no confident lane guesses.","Full preflight passes after W73R remote execution.","W74 can be rerun and returns hosted resolver consultant smoke eligible."] |
| PASS | w75_memory_points_prevent_context_corruption | ["Do not treat W72 readiness, W73 blocked gate, W73R blocked gate, or W74 no-go as proof that a hosted endpoint works.","Only W73R with remoteSmokeExecuted true can unlock hosted resolver consultant smoke.","Website evidence remains identity authority; notes remain story-only.","No write authority changes are part of hosted resolver remediation."] |
| PASS | w75_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false,"hostedResolverPilotEnabled":false} |
| PASS | w75_best_next_prompt_present | Move through W76: Hosted Resolver Configured Remote Execution. After the W75 remediation pack has been applied, run W73R with the real remote staging websiteResolverServiceV1 endpoint configuration present. Execute health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, no-secret trace checks, full preflight, and pilot unlock criteria. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output executed remote results, pilot unlock or no-go decision, trace samples, W76 report, validator gates, and best next Codex prompt. |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no confident guesses.
- Transaction writes remain blocked.
- Hosted resolver pilot traffic remains disabled.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W76: Hosted Resolver Configured Remote Execution. After the W75 remediation pack has been applied, run W73R with the real remote staging websiteResolverServiceV1 endpoint configuration present. Execute health, auth/CORS, write-payload rejection, cache-hit, approved live-site smoke, no-secret trace checks, full preflight, and pilot unlock criteria. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output executed remote results, pilot unlock or no-go decision, trace samples, W76 report, validator gates, and best next Codex prompt.
```
