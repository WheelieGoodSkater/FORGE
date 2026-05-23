# W58 Real Unknown-Site Corpus

Decision: PASS / REAL UNKNOWN-SITE CORPUS READY / NO WRITE AUTHORITY

## Objective

Prove the live resolver and classifier against real consultant-style websites.

## Completed

- Added a human-labeled W58 corpus with real URL seeds and synthetic failure cases.
- Evaluated W57 resolver output and classifier-shaped recommendations together.
- Added evidence coverage scoring, false-confident-wrong detection, unsupported-claim checks, and required site mix coverage.
- Covered product brand, distributor/dealer, apparel/accessories, manufacturing-heavy, ambiguous, weak/thin, blocked, unavailable, and timeout cases.

## Fixture Honesty

This W58 corpus uses deterministic HTML snapshots for real URL seeds so preflight stays stable without live internet access. It does not claim the snapshots are current live website content. W59 should compare approved live fetch results against these labels and report drift.

## Scorecard

| Metric | Value | Threshold |
| --- | ---: | ---: |
| Total cases | 9 | >= 9 |
| Real URL seed cases | 4 | >= 4 |
| Correct or honest pass rate | 1 | >= 0.85 |
| False-confident-wrong rate | 0 | <= 0 |
| Unsupported claim count | 0 | <= 0 |
| Evidence coverage score | 1 | >= 0.95 |
| Required site mix covered | yes | yes |
| Failure states covered | yes | yes |

## Case Results

| Status | Case | Site Kind | State | Lane | Correct/Honest | False Confident Wrong | Unsupported Claims | Evidence Covered | Failure State | Notes |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| PASS | w58_real_product_brand_trek | real_product_brand | recommended | dealer_hardgoods | yes | no | 0 | yes | none | None |
| PASS | w58_real_apparel_accessories_patagonia | apparel_accessories | recommended | apparel_accessories | yes | no | 0 | yes | none | None |
| PASS | w58_real_distributor_dealer_grainger | distributor_dealer | recommended | industrial_distribution | yes | no | 0 | yes | none | None |
| PASS | w58_real_manufacturing_heavy_lincoln_electric | manufacturing_heavy | recommended | industrial_equipment | yes | no | 0 | yes | none | None |
| PASS | w58_ambiguous_outfitter_apparel_service | ambiguous_multi_category | needs_confirmation | apparel_accessories | yes | no | 0 | yes | ambiguous | None |
| PASS | w58_weak_thin_website | weak_thin_website | insufficient_evidence | none | yes | no | 0 | yes | thin | None |
| PASS | w58_blocked_website | blocked | insufficient_evidence | none | yes | no | 0 | yes | blocked | None |
| PASS | w58_unavailable_website | unavailable | insufficient_evidence | none | yes | no | 0 | yes | unavailable | None |
| PASS | w58_timeout_website | timeout | insufficient_evidence | none | yes | no | 0 | yes | timeout | None |

## No Regression

- Write authority remains `none`.
- Resolver/classifier evaluation does not invoke SuiteScript.
- N/LLM remains advisory-only.
- Notes cannot own identification.
- Blocked, thin, unavailable, and timeout cases do not produce confident guesses.
- Ambiguous cases require confirmation and competing candidates.

## Next Block Prompt

W59: Confidence Calibration And Live Fetch Drift. Use the W58 corpus to tune thresholds and compare deterministic snapshot results against approved live resolver fetches. The goal is to reduce false-confident-wrong outcomes, identify website drift, preserve honest uncertainty, and prepare the corpus for five-consultant pilot testing.
