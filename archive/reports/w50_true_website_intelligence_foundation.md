# W50 True Website Intelligence Foundation

Decision: PASS / WEBSITE EVIDENCE V1 READY / NO WRITE AUTHORITY

## Objective

Make website identification the center of the product by defining the production resolver contract before ROI, competitive, or broader write expansion.

## Completed

- Added the `idb.website-evidence.v1` contract for URL normalization, fetch strategy, extracted evidence, source URLs, confidence, and failure states.
- Defined the recommended no-write resolver endpoint architecture: the drawer sends a normalized URL request and receives structured evidence JSON.
- Kept Tampermonkey as the consultant surface, not the sole production fetch authority.
- Preserved N/LLM as advisory-only and write authority as `none`.
- Added trace samples for recommended, blocked, thin, unavailable, ambiguous, and timeout outcomes.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w50_contract_schema_present | idb.w50-website-evidence-v1-contract.v1 |
| PASS | w50_no_write_endpoint_architecture_present | {"recommendedRuntime":"no_write_website_evidence_resolver_endpoint","drawerRole":"send_normalized_url_and_receive_structured_evidence_json","tampermonkeyBoundary":"Tampermonkey may display and submit URL/evidence, but production website fetching should not rely on Tampermonkey alone.","writeAuthority":"none","nllmAuthority":"advisory_only","classifierAuthority":"traceable_recommendation_with_confirmation_gates"} |
| PASS | w50_tampermonkey_not_fetch_authority | Tampermonkey may display and submit URL/evidence, but production website fetching should not rely on Tampermonkey alone. |
| PASS | w50_website_evidence_schema_present | idb.website-evidence.v1 |
| PASS | w50_required_fields_present | inputUrl, normalizedUrl, domain, fetchStatus, fetchErrors, pagesSampled, extractedEvidence, signals, confidence, failureState, sourceUrls, capturedAt |
| PASS | w50_url_normalization_present | {"rules":["trim whitespace","default missing scheme to https","lowercase hostname","remove hash fragments","preserve meaningful path","strip obvious tracking query parameters","reject unsupported schemes"],"unsupportedSchemes":["javascript:","data:","file:","mailto:","tel:"]} |
| PASS | w50_fetch_strategy_homepage_plus_discovered_pages | {"pages":[{"role":"homepage","required":true,"maxBytes":350000},{"role":"navigation_discovered_category_or_products_page","required":false,"maxPages":3,"selectionBasis":["products","shop","catalog","industries","solutions","services","collections"]}],"timeoutsMs":{"connect":6000,"overall":12000},"redirectPolicy":"follow_same_site_and_capture_final_url","contentTypes":["text/html"]} |
| PASS | w50_extracted_evidence_fields_present | pageTitle, metaDescription, h1Text, h2Text, navigationLabels, productCategoryTerms, industryLanguage, locationServiceClues, ecommerceSignals, manufacturingSignals, distributionSignals, sourceUrls |
| PASS | w50_confidence_states_present | recommended, needs_confirmation, insufficient_evidence |
| PASS | w50_failure_states_present | [{"id":"blocked","meaning":"The site prevented retrieval or returned an access/robot/security block.","expectedBehavior":"Ask the consultant for pasted website evidence and keep lane uncommitted unless other strong evidence exists."},{"id":"thin","meaning":"The fetched content has too little category/product language to support confident classification.","expectedBehavior":"Show insufficient evidence or needs confirmation with specific missing evidence guidance."},{"id":"unavailable","meaning":"DNS, network, TLS, 4xx, 5xx, or empty response prevented useful evidence capture.","expectedBehavior":"Do not guess from brand name alone; request manual evidence or retry later."},{"id":"ambiguous","meaning":"Evidence supports multiple lanes or product families without a clear winner.","expectedBehavior":"Show the competing interpretations and require consultant confirmation."},{"id":"timeout","meaning":"The resolver exceeded the allowed fetch window.","expectedBehavior":"Return a timeout state with no write authority and a retry/manual-evidence recovery cue."}] |
| PASS | w50_trace_schema_present | idb.website-evidence-resolver-trace-sample.v1 / w50.website-evidence.v1 |
| PASS | w50_trace_has_recommended_case |  |
| PASS | w50_trace_failure_state:blocked | w50_blocked_site |
| PASS | w50_trace_failure_state:thin | w50_thin_site |
| PASS | w50_trace_failure_state:unavailable | w50_unavailable_site |
| PASS | w50_trace_failure_state:ambiguous | w50_ambiguous_site |
| PASS | w50_trace_failure_state:timeout | w50_timeout_site |
| PASS | w50_ambiguous_case_requires_confirmation |  |
| PASS | w50_blocked_thin_unavailable_timeout_do_not_guess |  |
| PASS | w50_trace_no_write_regression | {"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false,"transactionWriteEnabled":false,"nllmAdvisoryOnly":true,"noSuiteScriptInvocation":true} |

## Failure-State Behavior

- Blocked: ask for pasted website evidence and do not guess from brand name alone.
- Thin: mark insufficient evidence or needs confirmation with missing-evidence guidance.
- Unavailable: request manual evidence or retry later; no silent classification.
- Ambiguous: show competing interpretations and require consultant confirmation.
- Timeout: return timeout state with retry/manual-evidence recovery cue.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- Transaction writes remain blocked.
- N/LLM remains advisory-only.
- Website evidence owns identification; conversation notes stay downstream for story, ROI, competitive, objections, and run coaching.

## Failures

- None

## Next Block Prompt

W51: Intelligence Classifier V1. Turn `websiteEvidenceV1` into traceable lane, proof anchor, product seed, product family, and demand moment recommendations with confidence calibration, evidence citations, and confirmation gates.
