# W67 Resolver Production Readiness And Hosted Endpoint Plan

Decision: PASS / PLAN READY / NOT PRODUCTION GO / NO WRITE AUTHORITY

## Objective

Turn the local `websiteResolverServiceV1` prototype and W64 drawer adapter into a production deployment plan.

## Readiness Position

This is not a production go. It is a production endpoint plan. W66 proved Trek can resolve correctly from live evidence, but Patagonia and Grainger remain thin and Lincoln Electric remains blocked. The hosted endpoint is required before five-consultant pilot because it gives us controlled egress, cache, auth/CORS, observability, rate limits, and rollback.

## Production Shape

- Hosted no-write `POST /idb/website-resolver/v1/resolve` endpoint.
- Drawer uses W64 endpoint toggle for pilot users.
- Resolver returns only `idb.website-evidence.v1`.
- Strict auth/CORS for approved NetSuite account origins.
- Cache key includes normalized URL, resolver version, and extraction policy version.
- Observability tracks cache, latency, failure states, confidence states, and false-confident-wrong.
- Manual evidence fallback is allowed, traceable, and never write-authoritative.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w67_contract_schema_present | idb.w67-resolver-production-readiness-hosted-endpoint-plan.v1 |
| PASS | w67_decision_is_plan_ready_not_prod_go | plan_ready_not_production_go |
| PASS | w67_hosting_shape_present | {"serviceName":"websiteResolverServiceV1","path":"/idb/website-resolver/v1/resolve","method":"POST","runtime":"Node.js service or serverless function with controlled egress","deploymentShape":["Dedicated no-write resolver service outside Tampermonkey and outside SuiteScript.","Drawer calls endpoint through W64 adapter using window/localStorage endpoint toggle during pilot.","Resolver returns idb.website-evidence.v1 only.","No NetSuite credentials, no NetSuite cookies, no SuiteScript URLs, no record IDs, and no write tokens accepted."],"environmentTiers":["local deterministic harness","staging resolver endpoint with approved live smoke","pilot resolver endpoint allowlisted for five consultants","production resolver endpoint after go/no-go"]} |
| PASS | w67_auth_and_cors_locked_down | {"auth":["Require short-lived resolver API token or signed request header for pilot.","Rotate pilot token before broader rollout.","Reject requests with NetSuite session cookies or authorization headers from NetSuite.","Do not use N/LLM credentials or NetSuite credentials in resolver."],"cors":["Allow only approved NetSuite account origins during pilot.","Reject wildcard production CORS.","Allow local preview origin only in development.","Respond to preflight with POST and Content-Type only."],"requestRedaction":["Do not log cookies.","Do not log authorization headers.","Do not log tenant secrets.","Store only manualEvidence excerpt hashes and short trace-safe excerpts."]} |
| PASS | w67_cache_strategy_present | {"cacheKey":"sha256(normalizedUrl + resolverVersion + extractionPolicyVersion)","ttlSeconds":86400,"staleWhileRevalidateSeconds":3600,"cacheScope":"public website evidence only","doNotCache":["cookies","authorization headers","NetSuite tenant data","manualEvidence full text","blocked-domain security decisions beyond aggregate metrics"],"cacheInvalidation":["resolverVersion change","extractionPolicyVersion change","explicit pilot refresh","cache corruption or bad extraction rollback"]} |
| PASS | w67_rate_timeout_retry_policy_present | {"perDomainPerMinute":6,"perConsultantPerMinute":12,"maxPages":5,"defaultPages":4,"maxPageBytes":350000,"maxTotalBytes":1200000,"connectTimeoutMs":6000,"overallTimeoutMs":12000,"maxOverallTimeoutMs":15000,"retryPolicy":["No automatic retry for blocked/403/401/407/429/451.","One delayed retry for transient 5xx or network reset.","No retry after timeout inside live consultant flow; return timeout and allow manual retry.","Retry never changes write authority or confidence state."]} |
| PASS | w67_domain_policy_preserves_ssrf_controls | {"allowedSchemes":["https"],"blockedSchemes":["file:","data:","javascript:","mailto:","tel:","ftp:","gopher:"],"blockedTargets":["localhost","loopback","RFC1918 private networks","link-local","metadata IPs","internal host suffixes"],"redirectPolicy":["Maximum five redirects.","Re-check scheme and DNS after every redirect.","Reject redirects into private/internal networks.","Capture final URL in trace."]} |
| PASS | w67_observability_trace_metrics_alerts_present | {"requiredTraceFields":["requestId","normalizedUrl","domain","resolverVersion","extractionPolicyVersion","fetchStatus","failureState","pagesSampled","sourceUrls","confidence","leadingLaneId","cacheHit","latencyMs","writeAuthority","nllmAdvisoryOnly"],"metrics":["request count","cache hit rate","p50/p95 latency","blocked/thin/unavailable/timeout rates","recommended/needs_confirmation/insufficient_evidence rates","false-confident-wrong count from labeled smoke","unsupported-claim count from labeled smoke"],"alerts":["false-confident-wrong greater than zero","unsupported claims greater than zero","timeout rate above 20 percent during pilot","blocked/thin rate spike after deployment","p95 latency above 12 seconds"]} |
| PASS | w67_manual_evidence_fallback_safe | {"whenUsed":["blocked","thin","unavailable","timeout","consultant has copied homepage/category/product text","approved live site drift prevents sufficient public extraction"],"rules":["Manual evidence may improve extraction and confidence but must be displayed as consultant-supplied.","Manual evidence cannot authorize writes.","Manual evidence cannot hide blocked/timeout fetch status.","Manual evidence must be included in trace as excerpt/hash, not full sensitive notes."]} |
| PASS | w67_rollout_toggles_and_kill_switches_present | {"drawerEndpointToggle":"window.IDB_WEBSITE_RESOLVER_ENDPOINT or localStorage:idb.websiteResolver.endpoint.v1","drawerFallbackToggle":"window.IDB_WEBSITE_RESOLVER_LOCAL_FALLBACK or localStorage:idb.websiteResolver.localFallback.v1","pilotAllowlist":["approved NetSuite account origins","five named consultant browsers","approved resolver staging endpoint"],"killSwitches":["disable resolver endpoint and return to local fallback","disable local fallback and force manual evidence confirmation","pause pilot endpoint on false-confident-wrong","pause endpoint on auth/CORS anomaly"]} |
| PASS | w67_deployment_and_rollback_checklists_present | {"deploy":["Deploy staging no-write resolver endpoint.","Configure strict CORS for approved NetSuite account origins.","Configure pilot API token or signed request header.","Enable cache with resolverVersion/extractionPolicyVersion key.","Enable metrics and trace logging with redaction.","Run W65 approved live smoke from staging.","Run W66 extraction gap closure harness against staging trace.","Configure drawer endpoint toggle for pilot users only.","Verify Plan/Review failure-state UX for blocked, thin, unavailable, timeout.","Verify no SuiteScript invocation and no write fields accepted.","Capture rollback baseline and endpoint kill switch."],"rollback":["Clear drawer resolver endpoint toggle.","Set local fallback toggle according to pilot stop condition.","Disable hosted endpoint token.","Preserve trace exports for failed runs.","Revert resolverVersion/extractionPolicyVersion if bad extraction shipped.","Do not retry writes because resolver has no write authority."]} |
| PASS | w67_go_no_go_criteria_present | {"goIf":["W65/W66 staging smoke has zero false-confident-wrong.","Unsupported claims remain zero.","Failure states are visible in Plan and Review.","Consultants can provide manual evidence for blocked/thin sites.","Endpoint can be killed without changing drawer code."],"noGoIf":["Any false-confident-wrong result appears.","Resolver accepts write/auth/SuiteScript fields.","CORS allows unapproved origins.","Blocked/thin/unavailable/timeout generates a confident lane.","Trace omits resolver failure state or source URLs."]} |
| PASS | w67_uses_w65_w66_readiness_evidence | {"w65":{"mode":"approved_live_fetch","total":4,"correctOrHonestCount":4,"falseConfidentWrongCount":0,"unsupportedClaimCount":0,"evidenceCoverageScore":0.5,"recommendedCount":1,"needsConfirmationCount":0,"insufficientEvidenceCount":3,"correctOrHonestRate":1},"trek":{"actualState":"recommended","actualLaneId":"dealer_hardgoods","driftType":"stable","sourceUrlCount":3,"extractionGaps":[]}} |
| PASS | w67_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w67_best_next_prompt_present | W68: Staging Resolver Endpoint Smoke Pack |

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
Move through W68: Staging Resolver Endpoint Smoke Pack. Build the staging smoke package for the hosted no-write websiteResolverServiceV1 endpoint: environment variables, endpoint health check, auth/CORS test cases, cache validation, approved live-site smoke command, failure-state samples, manual-evidence fallback samples, observability checklist, and pilot toggle instructions. Keep the drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output staging smoke pack, runnable harness, trace samples, W68 report, and best next Codex prompt.
```
