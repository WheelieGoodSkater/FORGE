# W63 Local Resolver Service Prototype

Decision: PASS / LOCAL RESOLVER PROTOTYPE READY / NO WRITE AUTHORITY

## Objective

Build the no-write website resolver service outside the drawer using the W62 `websiteResolverServiceV1` contract.

## Completed

- Added a local `websiteResolverServiceV1` module with endpoint handler and optional HTTP server.
- Implemented URL normalization, HTTPS upgrade, tracking/hash removal, punycode hostname handling, and blocked scheme handling.
- Added SSRF safety checks for localhost, private networks, metadata IPs, internal suffixes, unsafe redirects, and DNS resolution.
- Added homepage fetch, secondary page discovery, content-type enforcement, timeout and page-limit controls.
- Added HTML evidence extraction, lane candidate signal inference, cache-ready response fields, failure-state responses, and trace-safe no-write metadata.
- Added deterministic synthetic harness coverage plus an approved-live-fetch harness registration note.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w63_url_normalization_https_tracking_hash | {"ok":true,"inputUrl":"ARIAT.example/?utm_source=test#top","normalizedUrl":"https://ariat.example/","domain":"ariat.example"} |
| PASS | w63_apparel_site_resolves_from_website_evidence | {"laneCandidates":[{"laneId":"apparel_accessories","score":0.95,"evidence":["apparel","boots","footwear","size","sku","style"]},{"laneId":"dealer_hardgoods","score":0.55,"evidence":["find a store","dealer locator","store locator","Find a store"]},{"laneId":"industrial_distribution","score":0.45,"evidence":["replenishment"]}],"productSeed":"Core Boot and Apparel Style Matrix","productFamily":"Apparel and Footwear Style","demandMoment":"style, size, and channel availability"} |
| PASS | w63_secondary_discovery_samples_category_pages | https://ariat.example/, https://ariat.example/c/footwear, https://ariat.example/c/apparel, https://ariat.example/stores |
| PASS | w63_cache_ready_response_fields_present | {"key":"6d9ca1125ec8842b3f3a20c6a1e0bbd292d2b77c16dc47ec0e56efdcb95f056f","ttlSeconds":86400,"resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","contentHashes":[{"url":"https://ariat.example/","contentHash":"74710ac4668a8bb924ba33572bc98479f73a383d81bb877c5f1a2cc7bcea6941"},{"url":"https://ariat.example/c/footwear","contentHash":"384b96cc5c8d9aa34b6af7b21dc0600da68d4f4c92f1c30c2bddf89992efddd3"},{"url":"https://ariat.example/c/apparel","contentHash":"5eebc58c9dbcc4db9e304f6494428a884a81440754b32d6ba24a87b9498392cb"},{"url":"https://ariat.example/stores","contentHash":"98b710b686f4799a0a573e6fc79e2b7031da762928e92809a002f5a73b9546a9"}]} |
| PASS | w63_trace_fields_include_no_write_boundaries | {"noSuiteScriptInvocation":true,"noWriteAuthority":true,"noHiddenLaneOverride":true,"notesCannotOwnIdentification":true,"transactionWriteEnabled":false} |
| PASS | w63_blocks_unsafe_scheme_localhost_private_redirect_and_403 | blocked, blocked, blocked, blocked, blocked |
| PASS | w63_thin_site_does_not_guess | {"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true} |
| PASS | w63_unavailable_timeout_content_failures_are_insufficient | unavailable, timeout, unavailable |
| PASS | w63_ambiguous_site_requires_confirmation | [{"laneId":"apparel_accessories","score":0.85,"evidence":["apparel","size","sku","style","variants"]},{"laneId":"dealer_hardgoods","score":0.75,"evidence":["catalog","equipment","parts"]},{"laneId":"industrial_distribution","score":0.75,"evidence":["distribution","wholesale","replenishment","warehouse"]},{"laneId":"industrial_equipment","score":0.55,"evidence":["manufacturing","assembly"]}] |
| PASS | w63_endpoint_rejects_forbidden_write_fields | {"status":400,"body":{"error":"forbidden_request_fields","fields":["recordType"],"writeAuthority":"none","suiteScriptInvocation":false}} |
| PASS | w63_endpoint_returns_status_and_evidence_body | "resolved" |
| PASS | w63_page_limit_honored | 2 |
| PASS | w63_failure_samples_cover_required_states | ["blocked","blocked","blocked","blocked","blocked","thin","unavailable","timeout","unavailable","ambiguous"] |
| PASS | w63_blocked_thin_unavailable_timeout_never_guess | [{"requestId":"blocked_scheme","normalizedUrl":"","fetchStatus":"blocked","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"blocked_localhost","normalizedUrl":"https://localhost/","fetchStatus":"blocked","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"blocked_private_dns","normalizedUrl":"https://private-target.example/","fetchStatus":"blocked","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"blocked_redirect","normalizedUrl":"https://redirect.example/","fetchStatus":"blocked","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"blocked_403","normalizedUrl":"https://blocked.example/","fetchStatus":"blocked","failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"thin_site","normalizedUrl":"https://thin.example/","fetchStatus":"thin","failureState":"thin","confidence":{"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"unavailable_site","normalizedUrl":"https://down.example/","fetchStatus":"unavailable","failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"timeout_site","normalizedUrl":"https://slow.example/","fetchStatus":"timeout","failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"unsupported_content_type","normalizedUrl":"https://pdf.example/","fetchStatus":"unavailable","failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"writeAuthority":"none","nllmAdvisoryOnly":true},{"requestId":"ambiguous_site","normalizedUrl":"https://mixed.example/","fetchStatus":"ambiguous","failureState":"ambiguous","confidence":{"state":"needs_confirmation","score":0.85,"requiresConfirmation":true},"laneCandidates":[{"laneId":"apparel_accessories","score":0.85,"evidence":["apparel","size","sku","style","variants"]},{"laneId":"dealer_hardgoods","score":0.75,"evidence":["catalog","equipment","parts"]},{"laneId":"industrial_distribution","score":0.75,"evidence":["distribution","wholesale","replenishment","warehouse"]},{"laneId":"industrial_equipment","score":0.55,"evidence":["manufacturing","assembly"]}],"writeAuthority":"none","nllmAdvisoryOnly":true}] |
| PASS | w63_data_contract_has_best_next_prompt | idb.w63-local-resolver-service-prototype.v1 |

## Failure Samples

- Blocked: unsafe schemes, localhost, private DNS, unsafe redirect, and access-blocked responses.
- Thin: readable page without enough product/category evidence.
- Unavailable: server/content failures.
- Timeout: explicit timeout failure.
- Ambiguous: competing website evidence requires confirmation.

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
Move through W64: Drawer To Resolver Service Adapter. Wire the drawer runtime to call the no-write websiteResolverServiceV1 adapter/service instead of relying on local domain hints alone, with a feature flag for local fallback. Preserve website evidence as the identity authority, keep notes story-only, display resolver failure states clearly in Plan and Review, and add validator gates proving no writes, no SuiteScript invocation, N/LLM advisory-only, transaction writes blocked, and blocked/thin/unavailable/timeout never produce confident guesses. Output the adapter integration, trace samples, failure UX examples, W64 report, and best next Codex prompt.
```
