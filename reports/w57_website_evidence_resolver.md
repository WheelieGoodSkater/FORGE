# W57 Website Evidence Resolver

Decision: PASS / LIVE ADAPTER READY / NO WRITE AUTHORITY

## Objective

Make real website identification possible: URL in, structured `websiteEvidenceV1` out.

## Completed

- Added a reusable no-write resolver adapter in `tools/website_evidence_live_adapter.js`.
- Implemented URL normalization, unsupported-scheme rejection, tracking query cleanup, homepage fetch shape, same-site secondary page discovery, and extracted evidence fields.
- Added HTML evidence extraction for title, meta description, H1/H2, navigation labels, product/category terms, industry language, location/service clues, ecommerce signals, manufacturing signals, distribution signals, and source URLs.
- Added confidence/failure behavior for recommended, ambiguous, thin, blocked, unavailable, timeout, and invalid-scheme sites.
- Added a POST-style resolver endpoint handler that returns evidence JSON and never invokes SuiteScript.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w57_normalizes_url_and_strips_tracking | {"ok":true,"inputUrl":"PeakCycle.Example/?utm_source=pilot#hero","normalizedUrl":"https://peakcycle.example/","domain":"peakcycle.example"} |
| PASS | w57_rejects_unsupported_scheme | {"ok":false,"error":{"type":"unsupported_scheme","message":"javascript: URLs are not allowed."}} |
| PASS | w57_discovers_secondary_same_site_pages | https://peakcycle.example/bikes, https://peakcycle.example/equipment, https://peakcycle.example/stores |
| PASS | w57_recommended_case_returns_website_evidence_v1 | recommended |
| PASS | w57_recommended_extracts_required_fields | {"pageTitle":"Peak Cycle Bikes","metaDescription":"Bikes, helmets, components, equipment, stores, and dealer service.","h1Text":["Bikes and Cycling Equipment","Bike Catalog"],"h2Text":["Road bikes","Mountain bikes","Bicycle SKU availability"],"navigationLabels":["Bikes","Equipment","Stores"],"productCategoryTerms":["bikes","components","equipment","helmets","bicycle","catalog","inventory","replenishment","sku"],"industryLanguage":["dealer","service","retail"],"locationServiceClues":["dealer locator","find a store","service","stores"],"ecommerceSignals":["cart","shop"],"manufacturingSignals":[],"distributionSignals":["dealer","replenishment"],"sourceUrls":["https://peakcycle.example/","https://peakcycle.example/bikes"]} |
| PASS | w57_recommended_fetches_homepage_and_secondary_page | https://peakcycle.example/, https://peakcycle.example/bikes |
| PASS | w57_recommended_infers_signals_without_notes | {"laneCandidates":[{"laneId":"dealer_hardgoods","score":0.95,"evidence":["bikes","components","equipment","helmets","bicycle"]},{"laneId":"industrial_distribution","score":0.47,"evidence":["replenishment"]},{"laneId":"industrial_equipment","score":0.47,"evidence":[]}],"productSeed":"Bicycle SKU","productFamily":"Bicycle Dealer Hardgoods","demandMoment":"dealer inventory and replenishment readiness"} |
| PASS | w57_ambiguous_case_needs_confirmation | [{"laneId":"apparel_accessories","score":0.95,"evidence":["apparel","accessories","footwear","sizes","style"]},{"laneId":"industrial_distribution","score":0.71,"evidence":["distribution","wholesale","replenishment"]},{"laneId":"dealer_hardgoods","score":0.59,"evidence":["equipment","dealer","Dealers"]}] |
| PASS | w57_thin_case_insufficient_evidence | {"schema":"idb.website-evidence.v1","resolverVersion":"w57.website-evidence-live-adapter.v1","inputUrl":"https://thin.example","normalizedUrl":"https://thin.example/","domain":"thin.example","fetchStatus":"fetched","fetchErrors":[],"pagesSampled":[{"role":"homepage","url":"https://thin.example/","status":200}],"extractedEvidence":{"pageTitle":"Welcome","metaDescription":"","h1Text":["Welcome"],"h2Text":[],"navigationLabels":["About"],"productCategoryTerms":[],"industryLanguage":[],"locationServiceClues":[],"ecommerceSignals":[],"manufacturingSignals":[],"distributionSignals":[],"sourceUrls":["https://thin.example/"]},"signals":{"laneCandidates":[],"productSeed":"","productFamily":"","demandMoment":""},"confidence":{"state":"insufficient_evidence","score":0.12,"requiresConfirmation":true},"failureState":"thin","sourceUrls":["https://thin.example/"],"capturedAt":"2026-05-12T15:08:00.000Z","writeAuthority":"none","nllmAdvisoryOnly":true,"noRegression":{"noSuiteScriptInvocation":true,"noWriteAuthority":true,"noHiddenLaneOverride":true}} |
| PASS | w57_blocked_case_no_guess | [{"type":"access_blocked","message":"HTTP 403 prevented readable HTML."}] |
| PASS | w57_unavailable_case_no_guess | [{"type":"dns_or_network_error","message":"Resolver could not reach host."}] |
| PASS | w57_timeout_case_no_guess | [{"type":"timeout","message":"Fetch timed out."}] |
| PASS | w57_invalid_scheme_blocked_without_fetch | [{"type":"unsupported_scheme","message":"file: URLs are not allowed."}] |
| PASS | w57_endpoint_is_post_only_and_no_write | {"status":200,"body":{"schema":"idb.website-evidence.v1","resolverVersion":"w57.website-evidence-live-adapter.v1","inputUrl":"https://peakcycle.example","normalizedUrl":"https://peakcycle.example/","domain":"peakcycle.example","fetchStatus":"fetched","fetchErrors":[{"type":"dns_or_network_error","message":"No sample page registered."},{"type":"dns_or_network_error","message":"No sample page registered."}],"pagesSampled":[{"role":"homepage","url":"https://peakcycle.example/","status":200},{"role":"navigation_discovered_category_or_products_page","url":"https://peakcycle.example/bikes","status":200}],"extractedEvidence":{"pageTitle":"Peak Cycle Bikes","metaDescription":"Bikes, helmets, components, equipment, stores, and dealer service.","h1Text":["Bikes and Cycling Equipment","Bike Catalog"],"h2Text":["Road bikes","Mountain bikes","Bicycle SKU availability"],"navigationLabels":["Bikes","Equipment","Stores"],"productCategoryTerms":["bikes","components","equipment","helmets","bicycle","catalog","inventory","replenishment","sku"],"industryLanguage":["dealer","service","retail"],"locationServiceClues":["dealer locator","find a store","service","stores"],"ecommerceSignals":["cart","shop"],"manufacturingSignals":[],"distributionSignals":["dealer","replenishment"],"sourceUrls":["https://peakcycle.example/","https://peakcycle.example/bikes"]},"signals":{"laneCandidates":[{"laneId":"dealer_hardgoods","score":0.95,"evidence":["bikes","components","equipment","helmets","bicycle"]},{"laneId":"industrial_distribution","score":0.47,"evidence":["replenishment"]},{"laneId":"industrial_equipment","score":0.47,"evidence":[]}],"productSeed":"Bicycle SKU","productFamily":"Bicycle Dealer Hardgoods","demandMoment":"dealer inventory and replenishment readiness"},"confidence":{"state":"recommended","score":0.95,"requiresConfirmation":false},"failureState":null,"sourceUrls":["https://peakcycle.example/","https://peakcycle.example/bikes"],"capturedAt":"2026-05-12T15:08:00.000Z","writeAuthority":"none","nllmAdvisoryOnly":true,"noRegression":{"noSuiteScriptInvocation":true,"noWriteAuthority":true,"noHiddenLaneOverride":true}}} |
| PASS | w57_no_regression_boundaries_present |  |

## Failure Samples

- Blocked: returns `failureState: blocked`, no lane candidates, and requires confirmation/manual evidence.
- Thin: returns `failureState: thin`, no confident guess, and asks for more website evidence.
- Unavailable: returns `failureState: unavailable`, no lane candidates, and preserves retry/manual-evidence path.
- Ambiguous: returns `failureState: ambiguous`, keeps competing candidates visible, and requires consultant confirmation.
- Timeout: returns `failureState: timeout`, no lane candidates, and preserves retry/manual-evidence path.

## No Regression

- Write authority remains `none`.
- Resolver does not invoke SuiteScript.
- N/LLM remains advisory-only and cannot write.
- Resolver does not hide lane uncertainty or silently override lane gates.
- Main drawer and main Suitelet write boundaries are unchanged.

## Failures

- None

## Next Block Prompt

W58: Real Unknown-Site Corpus. Build a human-labeled corpus of real and synthetic websites that exercises the live adapter plus classifier against product brand, distributor/dealer, apparel/accessories, manufacturing-heavy, ambiguous, weak/thin, blocked, unavailable, and timeout cases. Prove evidence coverage, confidence calibration, and false-confident-wrong limits before the five-consultant pilot.
