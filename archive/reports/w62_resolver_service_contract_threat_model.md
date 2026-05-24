# W62 Resolver Service Contract And Threat Model

Decision: PASS / CONTRACT READY BEFORE BUILD / NO WRITE AUTHORITY

## Objective

Define the production website resolver before building it.

## Completed

- Added the no-write `websiteResolverServiceV1` request/response contract.
- Added URL normalization, allowed/blocked schemes, redirect policy, timeout policy, page/page-size limits, and cache-ready response shape.
- Added SSRF, redirect, content-type, rate-limit, and redaction threat controls.
- Added blocked, thin, unavailable, ambiguous, and timeout failure-state matrix.
- Added trace requirements and no-regression gates.
- Added the best next Codex prompt for W63.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w62_schema_present | idb.w62-resolver-service-contract-threat-model.v1 |
| PASS | w62_service_is_no_write | {"name":"websiteResolverServiceV1","schemaReturned":"idb.website-evidence.v1","runtimeRole":"no_write_fetch_extract_resolver","writeAuthority":"none","suiteScriptInvocation":false,"nllmAuthority":"advisory_only","notesAuthority":"story_only_no_identity_override"} |
| PASS | w62_request_shape_present | {"method":"POST","path":"/idb/website-resolver/v1/resolve","contentType":"application/json","body":{"url":"string required","requestId":"string optional","tenantId":"string optional redacted in logs","maxPages":"number optional default 4 maximum 5","timeoutMs":"number optional default 12000 maximum 15000","manualEvidence":"string optional consultant-supplied fallback text"},"forbiddenRequestFields":["recordType","recordId","suiteletUrl","scriptId","deployId","writeToken","nlAuth","cookie","authorization"]} |
| PASS | w62_request_forbids_write_and_auth_fields | recordType, recordId, suiteletUrl, scriptId, deployId, writeToken, nlAuth, cookie, authorization |
| PASS | w62_response_returns_website_evidence_v1 | {"schema":"idb.website-evidence.v1","resolverVersion":"websiteResolverServiceV1","requestId":"string","inputUrl":"string","normalizedUrl":"string","domain":"string","fetchStatus":"fetched / blocked / unavailable / timeout / thin / ambiguous","fetchErrors":"array","pagesSampled":"array of role/url/status/contentHash/pageBytes","extractedEvidence":"page title, meta, headings, nav, product/category terms, industry language, ecommerce/manufacturing/distribution/location/service signals","signals":"lane candidates, product seed, product family, demand moment","confidence":"state, score, requiresConfirmation","failureState":"blocked / thin / unavailable / ambiguous / timeout / null","sourceUrls":"array","capturedAt":"ISO timestamp","cache":"cache key, ttl seconds, content hashes","writeAuthority":"none","nllmAdvisoryOnly":true,"noRegression":"no SuiteScript, no write authority, no hidden lane override, notes cannot own identity"} |
| PASS | w62_url_normalization_policy_present | {"rules":["trim whitespace","default missing scheme to https","lowercase hostname","remove hash fragments","remove tracking query parameters","preserve meaningful path","punycode hostname before safety checks","reject unsupported schemes"],"allowedSchemes":["https"],"httpPolicy":"allow only when immediately upgraded or redirected to https; otherwise return blocked","blockedSchemes":["file:","data:","javascript:","mailto:","tel:","ftp:","gopher:"]} |
| PASS | w62_schemes_are_locked_down | {"rules":["trim whitespace","default missing scheme to https","lowercase hostname","remove hash fragments","remove tracking query parameters","preserve meaningful path","punycode hostname before safety checks","reject unsupported schemes"],"allowedSchemes":["https"],"httpPolicy":"allow only when immediately upgraded or redirected to https; otherwise return blocked","blockedSchemes":["file:","data:","javascript:","mailto:","tel:","ftp:","gopher:"]} |
| PASS | w62_ssrf_controls_present | ["block localhost and loopback","block private RFC1918 ranges","block link-local and metadata service IPs","block internal host suffixes","resolve DNS before fetch and after redirects","reject redirect targets that violate scheme or network policy"] |
| PASS | w62_redirect_timeout_limits_present | {"ssrfControls":["block localhost and loopback","block private RFC1918 ranges","block link-local and metadata service IPs","block internal host suffixes","resolve DNS before fetch and after redirects","reject redirect targets that violate scheme or network policy"],"redirectPolicy":{"maximumRedirects":5,"allowed":"same registrable domain or public https redirect only","captureFinalUrl":true,"redirectLoopFailureState":"unavailable"},"timeouts":{"connectMs":6000,"overallMs":12000,"maximumOverallMs":15000},"limits":{"maxPages":5,"defaultPages":4,"maxPageBytes":350000,"maxTotalBytes":1200000,"allowedContentTypes":["text/html","application/xhtml+xml"]},"robotsAndRespectfulFetch":{"userAgent":"IntelligentDemoBuilderWebsiteResolver/1.0 no-write evidence capture","rateLimitPerDomainPerMinute":6,"cacheTtlSeconds":86400}} |
| PASS | w62_content_types_and_rate_limit_present | {"userAgent":"IntelligentDemoBuilderWebsiteResolver/1.0 no-write evidence capture","rateLimitPerDomainPerMinute":6,"cacheTtlSeconds":86400} |
| PASS | w62_failure_state_matrix_complete | [{"state":"blocked","causes":["403","401","407","429","451","bot block","scheme blocked","SSRF blocked"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Paste website/category/product evidence or retry from approved resolver environment."},{"state":"thin","causes":["too little product/category evidence","placeholder page","homepage only marketing copy"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Paste category/product evidence or confirm the business category."},{"state":"unavailable","causes":["DNS failure","TLS failure","5xx","unsupported content type","redirect loop"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Retry later or provide manual evidence."},{"state":"ambiguous","causes":["multiple close lane candidates","conflicting product/service categories"],"classificationState":"needs_confirmation","laneCandidatesAllowed":true,"consultantAction":"Show competing candidates and require confirmation."},{"state":"timeout","causes":["connect timeout","overall timeout","slow secondary page"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Retry or provide manual evidence."}] |
| PASS | w62_failure_states_do_not_guess | [{"state":"blocked","causes":["403","401","407","429","451","bot block","scheme blocked","SSRF blocked"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Paste website/category/product evidence or retry from approved resolver environment."},{"state":"thin","causes":["too little product/category evidence","placeholder page","homepage only marketing copy"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Paste category/product evidence or confirm the business category."},{"state":"unavailable","causes":["DNS failure","TLS failure","5xx","unsupported content type","redirect loop"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Retry later or provide manual evidence."},{"state":"ambiguous","causes":["multiple close lane candidates","conflicting product/service categories"],"classificationState":"needs_confirmation","laneCandidatesAllowed":true,"consultantAction":"Show competing candidates and require confirmation."},{"state":"timeout","causes":["connect timeout","overall timeout","slow secondary page"],"classificationState":"insufficient_evidence","laneCandidatesAllowed":false,"consultantAction":"Retry or provide manual evidence."}] |
| PASS | w62_ambiguous_requires_confirmation |  |
| PASS | w62_cache_ready_response_present | {"cacheKey":"sha256(normalizedUrl + resolverVersion + extractionPolicyVersion)","ttlSeconds":86400,"contentHashes":"per sampled page","redaction":["do not cache cookies","do not cache auth headers","do not cache tenant secrets","do not log request body manualEvidence beyond trace-safe excerpt"]} |
| PASS | w62_trace_requirements_present | {"mustInclude":["requestId","normalizedUrl","domain","fetchStatus","failureState","sourceUrls","pagesSampled","extractedEvidence","signals","confidence","cache","writeAuthority","nllmAdvisoryOnly"],"mustNotInclude":["recordWriteToken","SuiteScript invocation result","NetSuite cookie","authorization header","hidden create permission"]} |
| PASS | w62_no_regression_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w62_best_next_codex_prompt_present | {"block":"W63: Local Resolver Service Prototype","prompt":"Move through W63: Local Resolver Service Prototype. Build the no-write website resolver service outside the drawer using the W62 websiteResolverServiceV1 contract. Implement URL normalization, safety checks, homepage fetch, secondary page discovery, HTML extraction, failure-state responses, cache-ready response fields, synthetic and approved live-fetch harnesses, trace samples, validator gates, and a W63 report. No writes, no SuiteScript invocation, N/LLM advisory-only, notes cannot own identity, and blocked/thin/unavailable/timeout must never produce confident guesses."} |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout states never produce confident guesses.
- Transaction writes remain blocked.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W63: Local Resolver Service Prototype. Build the no-write website resolver service outside the drawer using the W62 websiteResolverServiceV1 contract. Implement URL normalization, safety checks, homepage fetch, secondary page discovery, HTML extraction, failure-state responses, cache-ready response fields, synthetic and approved live-fetch harnesses, trace samples, validator gates, and a W63 report. No writes, no SuiteScript invocation, N/LLM advisory-only, notes cannot own identity, and blocked/thin/unavailable/timeout must never produce confident guesses.
```
