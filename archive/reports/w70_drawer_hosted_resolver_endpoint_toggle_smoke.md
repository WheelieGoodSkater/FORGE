# W70 Drawer Hosted Resolver Endpoint Toggle Smoke

Decision: PASS / DRAWER HOSTED TOGGLE READY / LOCAL STAGING ONLY / NO WRITE AUTHORITY

## Objective

Wire and prove the drawer pilot toggle path against the local staging `websiteResolverServiceV1` endpoint.

## Completed

- Added drawer token/header placeholder through `window.IDB_WEBSITE_RESOLVER_TOKEN` and `localStorage:idb.websiteResolver.token.v1`.
- Added hosted-only fallback handling for `false`, `0`, `off`, `disabled`, and `hosted_only`.
- Proved the drawer sends the endpoint URL, resolver token header, and NetSuite origin to the local staging endpoint.
- Proved website evidence still owns identity while notes remain story-only.
- Proved Plan/Review evidence UX displays resolver status, hosted-only mode, token-configured status, and failure states.
- Proved rollback by clearing endpoint/token/fallback toggles.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w70_endpoint_token_hosted_only_configured | {"schema":"idb.w64-drawer-resolver-service-adapter-config.v1","serviceName":"websiteResolverServiceV1","endpoint":"http://127.0.0.1:8787/idb/website-resolver/v1/resolve","endpointConfigured":true,"tokenConfigured":true,"authHeaderName":"X-IDB-Resolver-Token","authMode":"resolver_token_header_placeholder","mockResolverAvailable":false,"localFallbackEnabled":false,"hostedOnlyMode":true,"requestPath":"/idb/website-resolver/v1/resolve","writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesAuthority":"story_only_no_identity_override"} |
| PASS | w70_drawer_calls_local_staging_endpoint_with_token_header | {"url":"http://127.0.0.1:8787/idb/website-resolver/v1/resolve","headers":["Content-Type","Origin","X-IDB-Resolver-Token"],"data":"{\"url\":\"https://trek.example/\",\"requestId\":\"drawer-1779054062141\",\"maxPages\":4,\"timeoutMs\":12000,\"manualEvidence\":\"\",\"drawerRequestKey\":\"websiteresolverservicev1/https://trek.example//\"}"} |
| PASS | w70_hosted_evidence_owns_identity_notes_story_only | {"result":"resolved","runtime":{"serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":true,"tokenConfigured":true,"localFallbackEnabled":false,"hostedOnlyMode":true,"status":"resolved","failureState":""},"lane":"dealer_hardgoods","seed":"Bicycle SKU"} |
| PASS | w70_plan_review_status_display_present | ["Domain: trek.example","Resolver: service / resolved","Evidence: Fetch status: fetched / Source URLs: 4 / Signals: bike, bikes, bicycle, cycling, electric bikes, equipment","Product seed: Bicycle SKU","Product family: Bicycle Dealer Hardgoods","Demand moment: dealer inventory and replenishment readiness","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"] |
| PASS | w70_failure_state_ux_no_confident_guesses | [{"failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"whatIdbSaw":["Domain: 127.0.0.1","Resolver: service / resolved","Failure state: blocked","Evidence: Fetch status: blocked / Failure state: blocked","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: ssrf_blocked","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"]},{"failureState":"thin","confidence":{"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true},"whatIdbSaw":["Domain: thin.example","Resolver: service / resolved","Failure state: thin","Evidence: Fetch status: thin / Failure state: thin","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"]},{"failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"whatIdbSaw":["Domain: down.example","Resolver: service / resolved","Failure state: unavailable","Evidence: Fetch status: unavailable / Failure state: unavailable","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: dns_or_network_error","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"]},{"failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"whatIdbSaw":["Domain: slow.example","Resolver: service / resolved","Failure state: timeout","Evidence: Fetch status: timeout / Failure state: timeout","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: timeout","Hosted resolver: enabled; local fallback disabled","Resolver auth: token header configured"]}] |
| PASS | w70_local_fallback_rollback_path_present | {"rollbackConfig":{"schema":"idb.w64-drawer-resolver-service-adapter-config.v1","serviceName":"websiteResolverServiceV1","endpoint":"","endpointConfigured":false,"tokenConfigured":false,"authHeaderName":"X-IDB-Resolver-Token","authMode":"none","mockResolverAvailable":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"requestPath":"/idb/website-resolver/v1/resolve","writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesAuthority":"story_only_no_identity_override"},"runtime":{"serviceName":"websiteResolverServiceV1","mode":"local_fallback_only","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":false,"tokenConfigured":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"status":"fallback_ready","failureState":""}} |
| PASS | w70_trace_export_coverage_present | {"runtime":{"serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":true,"tokenConfigured":true,"localFallbackEnabled":false,"hostedOnlyMode":true,"status":"resolved","failureState":""},"resolverAdapter":{"schema":"idb.w64-drawer-resolver-service-adapter.v1","serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://trek.example//","endpointConfigured":true,"tokenConfigured":true,"localFallbackEnabled":false,"hostedOnlyMode":true,"notesAuthority":"story_only_no_identity_override"},"traceExportCoverage":{"includedInPlanTrace":true,"includedInDryRunPacket":true,"includedInTraceExport":true,"noWriteAuthority":true,"nllmAdvisoryOnly":true}} |
| PASS | w70_no_write_suitescript_nllm_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w70_contract_and_w69_handoff_present | idb.w70-drawer-hosted-resolver-endpoint-toggle-smoke.v1 |

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
Move through W71: Local End-To-End Hosted Resolver Pilot Smoke. Run the local staging websiteResolverServiceV1 server and drawer hosted-toggle path together in an end-to-end pilot-shaped smoke: start server, configure drawer endpoint/token/fallback toggles, test recommended, blocked, thin, unavailable, timeout, cache-hit, rollback, Plan/Review/Trace export coverage, and no-write/no-SuiteScript/N/LLM-advisory-only gates. Keep notes story-only and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output end-to-end smoke results, trace samples, W71 report, validator gates, and best next Codex prompt.
```
