# W68 Staging Resolver Endpoint Smoke Pack

Decision: PASS / STAGING SMOKE PACK READY / HOSTED ENDPOINT NOT YET IMPLEMENTED / NO WRITE AUTHORITY

## Objective

Build the staging smoke package for the hosted no-write `websiteResolverServiceV1` endpoint.

## Readiness Position

This is a smoke package, not a hosted endpoint go. It defines the exact staging environment, health check, auth/CORS cases, cache checks, approved live-site command, failure samples, manual-evidence fallback, observability checklist, pilot toggles, and rollback behavior needed before a five-consultant pilot can depend on a hosted resolver.

## Staging Smoke Shape

- Health check: `GET /health` must prove resolver version, extraction policy, cache readiness, no write authority, no SuiteScript invocation, and advisory-only N/LLM.
- Resolve endpoint: `POST /idb/website-resolver/v1/resolve` returns only `idb.website-evidence.v1`.
- Auth/CORS: approved NetSuite origin only, resolver token required, blocked origins denied, NetSuite cookies rejected, write-shaped payloads rejected.
- Cache: repeated URL, versioned key, and manual evidence redaction must be tested.
- Failure states: blocked, thin, unavailable, and timeout stay insufficient evidence with no lane candidates.
- Manual evidence: allowed only as visible consultant-supplied evidence, excerpt/hash stored, no write authority.

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w68_contract_schema_present | idb.w68-staging-resolver-endpoint-smoke-pack.v1 |
| PASS | w68_readiness_position_is_staging_only | staging_smoke_ready_not_hosted_endpoint_go |
| PASS | w68_environment_variables_present | IDB_RESOLVER_STAGING_URL, IDB_RESOLVER_STAGING_TOKEN, IDB_RESOLVER_ALLOWED_ORIGIN, IDB_RESOLVER_BLOCKED_ORIGIN, IDB_APPROVED_LIVE_RESOLVER_SMOKE, IDB_WEBSITE_RESOLVER_ENDPOINT, IDB_WEBSITE_RESOLVER_LOCAL_FALLBACK |
| PASS | w68_health_check_no_write_shape_present | {"request":{"method":"GET","path":"/health"},"expectedStatus":200,"response":{"serviceName":"websiteResolverServiceV1","resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"cacheStatus":"ready"}} |
| PASS | w68_resolve_endpoint_shape_present | {"method":"POST","path":"/idb/website-resolver/v1/resolve","contentType":"application/json","expectedResponseSchema":"idb.website-evidence.v1"} |
| PASS | w68_auth_cors_cases_complete | authorized_preflight, blocked_origin_preflight, missing_token, bad_token, netsuite_cookie_rejected, write_payload_rejected |
| PASS | w68_rejected_auth_cases_do_not_fetch | [{"id":"authorized_preflight","expectedStatus":204,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":false},{"id":"blocked_origin_preflight","expectedStatus":403,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":false},{"id":"missing_token","expectedStatus":401,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":true},{"id":"bad_token","expectedStatus":401,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":true},{"id":"netsuite_cookie_rejected","expectedStatus":400,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":true},{"id":"write_payload_rejected","expectedStatus":400,"simulated":true,"result":"expected_staging_behavior_defined","noWebsiteFetchOnRejectedRequest":true}] |
| PASS | w68_cache_validation_complete | same_url_second_request_cache_hit, versioned_cache_key, manual_evidence_not_cached_full_text |
| PASS | w68_approved_live_smoke_command_present | IDB_APPROVED_LIVE_RESOLVER_SMOKE=1 IDB_RESOLVER_STAGING_URL=$IDB_RESOLVER_STAGING_URL IDB_RESOLVER_STAGING_TOKEN=$IDB_RESOLVER_STAGING_TOKEN IDB_RESOLVER_ALLOWED_ORIGIN=$IDB_RESOLVER_ALLOWED_ORIGIN node tools/run_approved_live_resolver_smoke_harness.js |
| PASS | w68_failure_samples_do_not_guess | [{"id":"blocked_private_network","inputUrl":"https://127.0.0.1/admin","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0},"laneCandidates":[],"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true},{"id":"thin_public_page","inputUrl":"https://example.com/","failureState":"thin","confidence":{"state":"insufficient_evidence","score":0},"laneCandidates":[],"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true},{"id":"unavailable_domain","inputUrl":"https://unavailable.invalid/","failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0},"laneCandidates":[],"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true},{"id":"timeout_site","inputUrl":"https://timeout.example/","failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0},"laneCandidates":[],"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true}] |
| PASS | w68_manual_evidence_fallback_safe | [{"id":"blocked_with_manual_evidence","fetchState":"blocked","manualEvidenceSource":"consultant_supplied_homepage_excerpt","visibleSource":true,"storedAs":"excerpt_hash_only","confidenceFloor":"insufficient_evidence","confidenceCeilingWithoutConfirmation":"needs_confirmation","writeAuthority":"none","suiteScriptInvocation":false},{"id":"thin_with_category_text","fetchState":"thin","manualEvidenceSource":"consultant_supplied_category_text","visibleSource":true,"storedAs":"excerpt_hash_only","confidenceFloor":"insufficient_evidence","confidenceCeilingWithoutConfirmation":"needs_confirmation","writeAuthority":"none","suiteScriptInvocation":false}] |
| PASS | w68_observability_checklist_present | Every request has requestId, normalizedUrl, domain, resolverVersion, extractionPolicyVersion, fetchStatus, failureState, cacheHit, latencyMs, writeAuthority, and nllmAdvisoryOnly. / Auth and CORS failures are counted but redact credentials and cookies. / Metrics include request count, p50/p95 latency, cache hit rate, failure-state rates, confidence-state rates, false-confident-wrong, and unsupported claims. / Alerts exist for false-confident-wrong greater than zero, unsupported claims greater than zero, timeout rate above threshold, CORS anomaly, and p95 above target. / Trace exports include source URLs for sufficient evidence and failure reason for insufficient evidence. |
| PASS | w68_pilot_toggle_instructions_present | Set window.IDB_WEBSITE_RESOLVER_ENDPOINT or localStorage:idb.websiteResolver.endpoint.v1 to the staging resolve URL for pilot browsers only. / Set localStorage:idb.websiteResolver.localFallback.v1 explicitly to 0 when testing hosted-only behavior. / Clear the endpoint toggle to roll back to local fallback or manual evidence mode. / Do not enable any create/write flags as part of resolver smoke. / Capture trace export after each staging smoke run. |
| PASS | w68_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w68_best_next_prompt_present | Move through W69: Hosted Resolver Staging Endpoint Implementation. Build the staging no-write websiteResolverServiceV1 endpoint wrapper around the local resolver service: health endpoint, POST resolve endpoint, auth token validation, strict CORS allowlist, cookie/auth-header rejection, write-payload rejection, cache adapter, rate/timeout controls, redacted observability, and local staging server mode. Keep the drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output endpoint implementation, local staging run instructions, harness results, trace samples, W69 report, validator gates, and best next Codex prompt. |

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
Move through W69: Hosted Resolver Staging Endpoint Implementation. Build the staging no-write websiteResolverServiceV1 endpoint wrapper around the local resolver service: health endpoint, POST resolve endpoint, auth token validation, strict CORS allowlist, cookie/auth-header rejection, write-payload rejection, cache adapter, rate/timeout controls, redacted observability, and local staging server mode. Keep the drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output endpoint implementation, local staging run instructions, harness results, trace samples, W69 report, validator gates, and best next Codex prompt.
```
