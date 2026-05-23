# W66 Live Extraction Gap Closure And Resolver Tuning

Decision: PASS / LIVE EXTRACTION GAP PARTIALLY CLOSED / NO WRITE AUTHORITY

## Objective

Use W65 live smoke findings to close resolver extraction gaps for approved public websites without overfitting to static fixtures.

## What Changed

- Added bicycle, cycling, bike, equipment, helmet, road-bike, mountain-bike, electric-bike, gear, parts, and gravel terms to resolver extraction.
- Added bicycle/cycling/equipment/helmet discovery labels.
- Reweighted Dealer Hardgoods so readable bicycle/cycling pages lead with `dealer_hardgoods`.
- Aligned Dealer Hardgoods resolver output to `Bicycle SKU` and `Bicycle Dealer Hardgoods`.
- Preserved thin/blocked honesty for Patagonia, Grainger, and Lincoln Electric.

## Live Before / After

- Trek before W66: needs_confirmation / apparel_accessories leading / ambiguous
- Trek after W66: recommended / dealer_hardgoods / stable
- Current live metrics: recommended 1, needs confirmation 0, insufficient 3, false-confident-wrong 0, unsupported claims 0

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w66_resolver_version_advanced | website_resolver_service_v1.js |
| PASS | w66_bicycle_terms_and_discovery_added | bicycle/cycling terms |
| PASS | w66_dealer_weighting_prefers_bicycle_hardgoods | dealer_hardgoods weighting |
| PASS | w66_trek_live_gap_closed | {"id":"w65_live_trek","baselineCaseId":"w58_real_product_brand_trek","website":"https://www.trekbikes.com/","liveFetchExecuted":true,"expectedState":"recommended","expectedLaneId":"dealer_hardgoods","actualState":"recommended","actualLaneId":"dealer_hardgoods","actualScore":0.95,"secondLaneId":"apparel_accessories","secondScore":0.55,"failureState":null,"fetchStatus":"fetched","sourceUrlCount":3,"evidenceCoverage":1,"correctOrHonest":true,"falseConfidentWrong":false,"unsupportedClaim":false,"driftType":"stable","extractionGaps":[],"evidence":{"schema":"idb.website-evidence.v1","resolverVersion":"websiteResolverServiceV1.local-prototype.w66","requestId":"w65_live_trek","inputUrl":"https://www.trekbikes.com/","normalizedUrl":"https://www.trekbikes.com/","domain":"trekbikes.com","fetchStatus":"fetched","fetchErrors":[],"pagesSampled":[{"role":"homepage","url":"https://www.trekbikes.com/us/en_US/","status":200,"contentHash":"3290b7154f60462ddeb6a7d57ce293548a15a13bda9e943b33f0a3f31536afcf","pageBytes":279936,"redirects":[{"from":"https://www.trekbikes.com/","to":"https://www.trekbikes.com/us/en_US/","status":302}]},{"role":"navigation_discovered_category_or_products_page","url":"https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/","status":200,"contentHash":"7a4cbe24c88b46c874eac330dd34729d033c744716a0e20a061815a02c60176c","pageBytes":844025,"redirects":[]},{"role":"navigation_discovered_category_or_products_page","url":"https://www.trekbikes.com/us/en_US/bikes/road-bikes/c/B200/","status":200,"contentHash":"d363d9b9fd51e3796fc15725417569013b4bde64984eb7e694d9b3d301425760","pageBytes":851877,"redirects":[]}],"extractedEvidence":{"pageTitle":"Trek Bikes - The world's best bikes and cycling gear","metaDescription":"Discover the fun of riding with our wide range of electric, mountain, road, city, gravel, kids', and certified pre-owned bikes. Shop online or in-store!","h1Text":["Trek Bikes - The world's best bikes and cycling gear","Shop Trek Electric Bikes","Trek road bikes for efficiency and speed wherever you ride"],"h2Text":["Electric bikes","Road bikes","Mountain bikes","City bikes","Be seen","Be aware","Be smart","Be ready","Lights","Apparel","Shoes","The march to modern","50 bikes that built Trek","Born in a barn","Trek stories","Shop online, we’ll deliver"],"navigationLabels":["Skip to content","{{ $t('header.link.login') }}","United States / English","Shop now","Shop all Deals","Shop daytime running lights","Shop hi-viz apparel","Shop CarBack Radar","Shop WaveCel helmets","Shop AirRush","see the timeline","Read the story","Explore Trek stories","Your local Trek retailer","Our guarantee","We’ll take care of you","Road bikes","Mountain bikes","Hybrid bikes","Electric bikes","Electra bikes","Men's bikes","Women's bikes","Equipment","Bikes"],"productCategoryTerms":["apparel","bike","bikes","bicycle","cycling","electric bikes","equipment","gear","gravel","helmets","mountain bikes","products","road bikes","shoes"],"industryLanguage":["retail","service"],"locationServiceClues":["service"],"ecommerceSignals":["buy","cart","checkout","order online","shop"],"manufacturingSignals":["assembly"],"distributionSignals":[],"sourceUrls":["https://www.trekbikes.com/us/en_US/","https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/","https://www.trekbikes.com/us/en_US/bikes/road-bikes/c/B200/"]},"signals":{"laneCandidates":[{"laneId":"dealer_hardgoods","score":0.95,"evidence":["bike","bikes","bicycle","cycling","electric bikes","equipment"]},{"laneId":"apparel_accessories","score":0.55,"evidence":["apparel","shoes","Shop hi-viz apparel"]},{"laneId":"industrial_equipment","score":0.45,"evidence":["assembly"]}],"productSeed":"Bicycle SKU","productFamily":"Bicycle Dealer Hardgoods","demandMoment":"dealer inventory and replenishment readiness"},"confidence":{"state":"recommended","score":0.95,"requiresConfirmation":false},"failureState":null,"sourceUrls":["https://www.trekbikes.com/us/en_US/","https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/","https://www.trekbikes.com/us/en_US/bikes/road-bikes/c/B200/"],"capturedAt":"2026-05-12T21:46:26.497Z","cache":{"key":"808b4d4b6228f36dc54e20f080b0bc16dfc7d247a8fed9a5f955bec465feedea","ttlSeconds":86400,"resolverVersion":"websiteResolverServiceV1.local-prototype.w66","extractionPolicyVersion":"w66.extraction-policy.v1","contentHashes":[{"url":"https://www.trekbikes.com/us/en_US/","contentHash":"3290b7154f60462ddeb6a7d57ce293548a15a13bda9e943b33f0a3f31536afcf"},{"url":"https://www.trekbikes.com/us/en_US/bikes/electric-bikes/c/B507/","contentHash":"7a4cbe24c88b46c874eac330dd34729d033c744716a0e20a061815a02c60176c"},{"url":"https://www.trekbikes.com/us/en_US/bikes/road-bikes/c/B200/","contentHash":"d363d9b9fd51e3796fc15725417569013b4bde64984eb7e694d9b3d301425760"}]},"writeAuthority":"none","nllmAdvisoryOnly":true,"noRegression":{"noSuiteScriptInvocation":true,"noWriteAuthority":true,"noHiddenLaneOverride":true,"notesCannotOwnIdentification":true,"transactionWriteEnabled":false}}} |
| PASS | w66_trek_no_extraction_gaps_remaining | [] |
| PASS | w66_thin_and_blocked_sites_remain_honest | [{"id":"w65_live_patagonia","state":"insufficient_evidence","lane":"","failure":"thin"},{"id":"w65_live_grainger","state":"insufficient_evidence","lane":"","failure":"thin"},{"id":"w65_live_lincoln_electric","state":"insufficient_evidence","lane":"","failure":"blocked"}] |
| PASS | w66_no_false_confident_wrong_or_unsupported_claims | {"mode":"approved_live_fetch","total":4,"correctOrHonestCount":4,"falseConfidentWrongCount":0,"unsupportedClaimCount":0,"evidenceCoverageScore":0.5,"recommendedCount":1,"needsConfirmationCount":0,"insufficientEvidenceCount":3,"correctOrHonestRate":1} |
| PASS | w66_no_write_boundaries_present | {"writeAuthority":"none","suiteScriptInvocation":false,"nllmAdvisoryOnly":true,"notesCannotOwnIdentification":true,"blockedThinUnavailableTimeoutDoNotGuess":true,"transactionWriteEnabled":false,"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false} |
| PASS | w66_best_next_prompt_present | W67: Resolver Production Readiness And Hosted Endpoint Plan |

## Remaining Gaps

- Patagonia remains thin from the public resolver response.
- Grainger remains thin from the public resolver response.
- Lincoln Electric remains blocked by HTTP 403.
- Production readiness still needs hosted endpoint behavior, caching, observability, and pilot rollout controls.

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
Move through W67: Resolver Production Readiness And Hosted Endpoint Plan. Turn the local websiteResolverServiceV1 prototype and W64 drawer adapter into a production deployment plan: hosting shape, endpoint auth/CORS, cache strategy, rate limits, observability, retry policy, safe manual-evidence fallback, domain allow/block policy, and pilot rollout toggles. Use W65/W66 live findings as readiness evidence and keep the objective honest: no writes, no SuiteScript invocation, N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout remain insufficient evidence with no confident guesses. Output production endpoint plan, deployment checklist, rollback plan, validator gates, W67 report, and best next Codex prompt.
```
