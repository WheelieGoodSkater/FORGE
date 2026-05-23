# W64 Drawer To Resolver Service Adapter

Decision: PASS / DRAWER ADAPTER READY / NO WRITE AUTHORITY

## Objective

Wire the drawer runtime to call the no-write `websiteResolverServiceV1` adapter/service instead of relying on local domain hints alone, with feature-flagged local fallback.

## Completed

- Added resolver service adapter configuration for endpoint, harness mock, and local fallback flag.
- Added async drawer service request path that never blocks rendering and never sends write/auth/SuiteScript fields.
- Added response validation so service evidence must be `websiteEvidenceV1`, no-write, N/LLM advisory-only, same-domain, and honest on failure states.
- Preserved explicit local fallback when no endpoint is configured.
- Exposed resolver mode/status/failure state in Plan and Review evidence UX.
- Added trace coverage for `websiteResolverRuntime`, `resolverAdapter`, and failure-state UX samples.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w64_service_adapter_resolves_website_identity | {"serviceName":"websiteResolverServiceV1","mode":"service","requestKey":"websiteresolverservicev1/https://ariat.example//","endpointConfigured":true,"tokenConfigured":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"status":"resolved","failureState":""} |
| PASS | w64_notes_do_not_override_service_identity | {"lane":"apparel_accessories","product":{"product":"Core Boot and Apparel Style Matrix","productFamily":"Apparel and Footwear Style","demandMoment":"style, size, and channel availability","source":"website_evidence_v1","confidence":"high","fallbackReason":""}} |
| PASS | w64_request_excludes_write_and_suitescript_fields | {"url":"https://ariat.example/","requestId":"drawer-1779054061528","maxPages":4,"timeoutMs":12000,"manualEvidence":"","drawerRequestKey":"websiteresolverservicev1/https://ariat.example//"} |
| PASS | w64_plan_review_ux_exposes_resolver_mode | {"state":"recommended","scoreLabel":"high","requiresConfirmation":false,"source":"website_evidence_v1","resolverSource":"websiteEvidenceV1","resolverMode":"service","resolverStatus":"resolved","hostedOnlyMode":false,"tokenConfigured":false,"failureState":""} |
| PASS | w64_local_fallback_is_explicit_when_service_absent | {"serviceName":"websiteResolverServiceV1","mode":"local_fallback_only","requestKey":"websiteresolverservicev1/https://ariat.com//","endpointConfigured":false,"tokenConfigured":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"status":"fallback_ready","failureState":""} |
| PASS | w64_local_fallback_feature_flag_can_disable_fallback | {"serviceName":"websiteResolverServiceV1","mode":"local_fallback_only","requestKey":"websiteresolverservicev1/https://ariat.com//","endpointConfigured":false,"tokenConfigured":false,"localFallbackEnabled":false,"hostedOnlyMode":false,"status":"insufficient_evidence","failureState":""} |
| PASS | w64_failure_states_never_guess | [{"failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: blocked.example","Resolver: service / resolved","Failure state: blocked","Evidence: Fetch status: blocked / Failure state: blocked","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: blocked"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"thin","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: thin.example","Resolver: service / resolved","Failure state: thin","Evidence: Fetch status: thin / Failure state: thin","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: thin"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: unavailable.example","Resolver: service / resolved","Failure state: unavailable","Evidence: Fetch status: unavailable / Failure state: unavailable","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: unavailable"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: timeout.example","Resolver: service / resolved","Failure state: timeout","Evidence: Fetch status: timeout / Failure state: timeout","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: timeout"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true}] |
| PASS | w64_failure_states_visible_in_ux | [{"failureState":"blocked","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: blocked.example","Resolver: service / resolved","Failure state: blocked","Evidence: Fetch status: blocked / Failure state: blocked","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: blocked"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"thin","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: thin.example","Resolver: service / resolved","Failure state: thin","Evidence: Fetch status: thin / Failure state: thin","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: thin"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"unavailable","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: unavailable.example","Resolver: service / resolved","Failure state: unavailable","Evidence: Fetch status: unavailable / Failure state: unavailable","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: unavailable"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true},{"failureState":"timeout","confidence":{"state":"insufficient_evidence","score":0,"requiresConfirmation":true},"laneCandidates":[],"whatIdbSaw":["Domain: timeout.example","Resolver: service / resolved","Failure state: timeout","Evidence: Fetch status: timeout / Failure state: timeout","Product seed: needs evidence","Product family: needs evidence","Demand moment: needs evidence","Fetch errors: timeout"],"confirmationPrompt":"Confirm the website category before ROI, competitive, or write preparation proceeds.","writeAuthority":"none","nllmAdvisoryOnly":true}] |
| PASS | w64_rejects_false_confident_failure_response | {"serviceName":"websiteResolverServiceV1","mode":"service_rejected_local_fallback","requestKey":"websiteresolverservicev1/https://bad-timeout.example//","endpointConfigured":true,"tokenConfigured":false,"localFallbackEnabled":true,"hostedOnlyMode":false,"status":"rejected","failureState":"timeout","error":"domain_mismatch"} |
| PASS | w64_contract_has_next_prompt | idb.w64-drawer-resolver-service-adapter.v1 |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout never produce confident guesses.
- Transaction writes remain blocked.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W65: Approved Live Resolver Smoke And Drift Gate. Run the no-write websiteResolverServiceV1 path against an approved small set of live public websites, compare live resolver output to W58/W59 snapshot expectations, and produce a drift report with pass/fail, confidence calibration, failure-state honesty, evidence coverage, and any extraction gaps. Keep the drawer and SuiteScript write-disabled, preserve N/LLM advisory-only, keep notes story-only, and require blocked/thin/unavailable/timeout to remain insufficient evidence with no lane guesses. Output live smoke harness, approved-site results, drift findings, validator gates, W65 report, and best next Codex prompt.
```
