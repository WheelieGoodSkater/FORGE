# W69 Hosted Resolver Staging Endpoint Implementation

Decision: PASS / LOCAL STAGING ENDPOINT READY / EXTERNAL HOSTING NOT DEPLOYED / NO WRITE AUTHORITY

## Objective

Build the staging no-write `websiteResolverServiceV1` endpoint wrapper around the local resolver service.

## Completed

- Added `tools/website_resolver_staging_endpoint.js` with health, resolve, auth/CORS, cache, rate limits, redacted trace, and local server mode.
- Health endpoint proves resolver version, extraction policy, cache readiness, no write authority, no SuiteScript invocation, and advisory-only N/LLM.
- Resolve endpoint wraps `idb.website-evidence.v1` without accepting NetSuite cookies, authorization headers, SuiteScript fields, record IDs, or write toggles.
- Staging cache returns cache hits for eligible repeated evidence requests and avoids manual evidence full text.
- Failure states remain insufficient evidence with no lane candidates.
- Manual evidence fallback is visible, hash/excerpt-only, and never write-authoritative.

## Local Staging Run

```bash
IDB_RESOLVER_STAGING_TOKEN=local-staging-token IDB_RESOLVER_ALLOWED_ORIGIN=https://YOUR_ACCOUNT_ID.app.netsuite.com IDB_RESOLVER_STAGING_PORT=8787 node tools/website_resolver_staging_endpoint.js
```

Health: `http://127.0.0.1:8787/health`

Resolve: `http://127.0.0.1:8787/idb/website-resolver/v1/resolve`

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w69_health_endpoint_no_write | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"serviceName":"websiteResolverServiceV1","resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","cacheStatus":"ready"} |
| PASS | w69_cors_allowlist_enforced | {"preflight":{"status":204,"headers":{"Vary":"Origin","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-IDB-Resolver-Token","Access-Control-Allow-Origin":"https://YOUR_ACCOUNT_ID.app.netsuite.com"},"body":null},"blockedPreflight":{"status":403,"headers":{"Content-Type":"application/json","Vary":"Origin","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-IDB-Resolver-Token"},"body":{"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"error":"origin_not_allowed"}}} |
| PASS | w69_auth_cookie_and_write_rejections_before_fetch | {"missingToken":401,"badToken":401,"cookieRejected":400,"authRejected":400,"writeRejected":{"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"error":"no_write_boundary_violation","fields":["recordId","suiteletUrl","createEnabled"]}} |
| PASS | w69_resolve_endpoint_returns_evidence_and_cache_hit | {"first":"resolved","lane":{"laneId":"dealer_hardgoods","score":0.95,"evidence":["bike","bikes","bicycle","cycling","electric bikes","equipment"]},"secondCacheHit":true} |
| PASS | w69_failure_states_remain_insufficient_no_guess | [{"failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"thin","confidence":{"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]},{"failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[]}] |
| PASS | w69_manual_evidence_redacted_and_no_write | {"source":"consultant_supplied","excerptPreview":"Manufacturer of workwear, boots, safety apparel, and seasonal footwear collections.","excerptHash":"b66a25e81cb95be68f7b1a39e4a8fdead56fcb4af2f01a1bb9cbaa806064d1fc","storedAs":"excerpt_hash_only"} |
| PASS | w69_rate_limit_guard_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"error":"rate_limited","domain":"thin.example"} |
| PASS | w69_observability_outcomes_and_redaction_present | ["health_ok","cors_preflight_ok","cors_origin_denied","resolver_token_rejected","resolver_token_rejected","netsuite_cookie_or_auth_rejected","netsuite_cookie_or_auth_rejected","no_write_boundary_violation","resolved_from_fetch","resolved_from_cache","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch","resolved_from_fetch","resolved_from_cache","rate_limited"] |
| PASS | w69_contract_and_w68_handoff_present | idb.w69-hosted-resolver-staging-endpoint-implementation.v1 |
| PASS | w69_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w69_best_next_prompt_present | Move through W70: Drawer Hosted Resolver Endpoint Toggle Smoke. Wire and prove the drawer pilot toggle path against the local staging websiteResolverServiceV1 endpoint: endpoint URL setting, token/header strategy placeholder, hosted-only mode, local fallback rollback, Plan/Review resolver status display, failure-state UX, trace export coverage, and no-write/no-SuiteScript/N/LLM-advisory-only gates. Keep notes story-only and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output drawer toggle smoke artifacts, trace samples, W70 report, validator gates, and best next Codex prompt. |

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
Move through W70: Drawer Hosted Resolver Endpoint Toggle Smoke. Wire and prove the drawer pilot toggle path against the local staging websiteResolverServiceV1 endpoint: endpoint URL setting, token/header strategy placeholder, hosted-only mode, local fallback rollback, Plan/Review resolver status display, failure-state UX, trace export coverage, and no-write/no-SuiteScript/N/LLM-advisory-only gates. Keep notes story-only and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output drawer toggle smoke artifacts, trace samples, W70 report, validator gates, and best next Codex prompt.
```
