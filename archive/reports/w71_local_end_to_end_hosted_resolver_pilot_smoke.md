# W71 Local End-To-End Hosted Resolver Pilot Smoke

Decision: PASS / LOCAL E2E HOSTED RESOLVER SMOKE READY / REMOTE HOSTING NOT DEPLOYED / NO WRITE AUTHORITY

## Objective

Run the local staging `websiteResolverServiceV1` server and drawer hosted-toggle path together in an end-to-end pilot-shaped smoke.

## Completed

- Started the local staging resolver HTTP server on an ephemeral localhost port.
- Configured the drawer endpoint, token, and hosted-only fallback toggles.
- Exercised the drawer `GM_xmlhttpRequest` path over actual local HTTP.
- Tested recommended, blocked, thin, unavailable, timeout, cache-hit, and rollback cases.
- Verified Plan/Review/Trace evidence coverage and no-write boundaries.

## Local Server

- Health: `http://127.0.0.1:61116/health`
- Resolve: `http://127.0.0.1:61116/idb/website-resolver/v1/resolve`

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w71_local_server_started_health_ok | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"serviceName":"websiteResolverServiceV1","resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","cacheStatus":"ready"} |
| PASS | w71_drawer_config_points_to_real_local_server | {"schema":"idb.w64-drawer-resolver-service-adapter-config.v1","serviceName":"websiteResolverServiceV1","endpoint":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","endpointConfigured":true,"tokenConfigured":true,"authHeaderName":"X-IDB-Resolver-Token","authMode":"resolver_token_header_placeholder","mockResolverAvailable":false,"localFallbackEnabled":false,"hostedOnlyMode":true,"requestPath":"/idb/website-resolver/v1/resolve","writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesAuthority":"story_only_no_identity_override"} |
| PASS | w71_gm_http_requests_reach_server_with_token_origin | [{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://trek.example/\",\"requestId\":\"drawer-1779054062265\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://trek.example//\"}"},{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://trek.example/\",\"requestId\":\"drawer-1779054062270\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://trek.example//\"}"},{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://127.0.0.1/admin\",\"requestId\":\"drawer-1779054062272\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://127.0.0.1/admin/\"}"},{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://thin.example/\",\"requestId\":\"drawer-1779054062274\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://thin.example//\"}"},{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://down.example/\",\"requestId\":\"drawer-1779054062276\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://down.example//\"}"},{"url":"http://127.0.0.1:61116/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://slow.example/\",\"requestId\":\"drawer-1779054062277\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://slow.example//\"}"}] |
| PASS | w71_recommended_case_website_owned_identity | {"lane":"dealer_hardgoods","runtime":{"serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":true,"tokenConfigured":true,"localFallbackEnabled":false,"hostedOnlyMode":true,"status":"resolved","failureState":""},"productSeed":"Bicycle SKU"} |
| PASS | w71_cache_hit_case_reuses_server_cache | {"cache":{"key":"2fe67bc692e391289d2b415a96ed441225baa32f8beeead3d87885184c50ad49","ttlSeconds":86400,"resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","contentHashes":[{"url":"https://trek.example/","contentHash":"88dc77befe47246627a747eb1f392fcef0126a7ce677c7948d319532196dce94"},{"url":"https://trek.example/bikes","contentHash":"5edc9e091ce4111ec1415e543dfe175ecc68654e4cdd4034389f14d9251e09f3"},{"url":"https://trek.example/equipment","contentHash":"889b9e138299173fb1803fc36d053be0cab28ab965c6e3c7f234b120863b6e2e"},{"url":"https://trek.example/stores","contentHash":"e228c6f75b7feb98cb4ae23d62593bb79e9f1a3155769f34b893707f0912adb6"}],"hit":true},"serverOutcomes":["health_ok","resolved_from_fetch","resolved_from_cache","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch"]} |
| PASS | w71_failure_cases_insufficient_no_guess | [{"failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"thin","confidence":{"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]}] |
| PASS | w71_rollback_returns_to_local_fallback_only | {"rollbackConfig":{"schema":"idb.w64-drawer-resolver-service-adapter-config.v1","serviceName":"websiteResolverServiceV1","endpoint":"","endpointConfigured":false,"tokenConfigured":false,"authHeaderName":"X-IDB-Resolver-Token","authMode":"none","mockResolverAvailable":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"requestPath":"/idb/website-resolver/v1/resolve","writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesAuthority":"story_only_no_identity_override"},"runtime":{"serviceName":"websiteResolverServiceV1","mode":"local_fallback_only","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":false,"tokenConfigured":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"status":"fallback_ready","failureState":""}} |
| PASS | w71_plan_review_trace_export_coverage_present | {"ux":["Domain: trek.example","Resolver: service / resolved","Evidence: Fetch status: fetched / Source URLs: 4 / Signals: bike, bikes, bicycle, cycling, electric bikes, equipment","Product seed: Bicycle SKU","Product family: Bicycle Dealer Hardgoods","Demand moment: dealer inventory and replenishment readiness","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"],"traceExportCoverage":{"includedInPlanTrace":true,"includedInDryRunPacket":true,"includedInTraceExport":true,"noWriteAuthority":true,"nllmAdvisoryOnly":true},"resolverAdapter":{"schema":"idb.w64-drawer-resolver-service-adapter.v1","serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":true,"tokenConfigured":true,"localFallbackEnabled":false,"hostedOnlyMode":true,"notesAuthority":"story_only_no_identity_override"}} |
| PASS | w71_no_write_suitescript_nllm_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w71_contract_and_w70_handoff_present | idb.w71-local-end-to-end-hosted-resolver-pilot-smoke.v1 |

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
Move through W72: Hosted Resolver Remote Deployment Readiness Gate. Convert the local end-to-end hosted resolver smoke into a remote staging deployment readiness gate: environment config, secret handling, CORS origin list, deployment target checklist, remote health smoke, remote auth/CORS smoke, approved live-site smoke through the hosted endpoint, cache/observability verification, rollback switch, and pilot go/no-go. Keep drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output remote deployment readiness plan, runnable gate harness or command pack, W72 report, validator gates, and best next Codex prompt.
```
