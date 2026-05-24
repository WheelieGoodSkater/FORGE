# W52 End-Goal Intelligence Test Harness

Decision: PASS / END-GOAL INTELLIGENCE HARNESS READY / NO WRITE AUTHORITY

## Objective

Build the production-shaped intelligence evaluation harness around real and synthetic unknown websites.

## Completed

- Added the unknown-site corpus contract with human-labeled expected outcomes.
- Added a classifier evaluation harness that scores correct-or-honest behavior instead of static fixture success.
- Added false-confident-wrong detection.
- Added unsupported-claim checks.
- Added trace evidence coverage scoring.
- Added required site mix coverage for real product brand, ambiguous multi-category, thin, blocked, unavailable, and timeout cases.

## Scorecard

| Metric | Value | Threshold |
| --- | ---: | ---: |
| Correct or honest pass rate | 1 | >= 0.8 |
| False-confident-wrong rate | 0 | <= 0.05 |
| Unsupported claim count | 0 | <= 0 |
| Trace evidence coverage score | 1 | >= 0.95 |
| Required site mix covered | yes | yes |

## Case Results

| Status | Case | Site Kind | State | Lane | Correct/Honest | False Confident Wrong | Unsupported Claims | Evidence Covered | Notes |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| PASS | w52_real_product_brand_trek | real_product_brand | recommended | dealer_hardgoods | yes | no | 0 | yes | None |
| PASS | w52_synthetic_ambiguous_industrial_apparel | synthetic_ambiguous_multi_category | needs_confirmation | apparel_accessories | yes | no | 0 | yes | None |
| PASS | w52_synthetic_blocked_site | synthetic_blocked | insufficient_evidence | none | yes | no | 0 | yes | None |
| PASS | w52_synthetic_thin_site | synthetic_weak_thin_website | insufficient_evidence | none | yes | no | 0 | yes | None |
| PASS | w52_synthetic_unavailable_site | synthetic_unavailable | insufficient_evidence | none | yes | no | 0 | yes | None |
| PASS | w52_synthetic_timeout_site | synthetic_timeout | insufficient_evidence | none | yes | no | 0 | yes | None |

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- Transaction writes remain blocked.
- N/LLM remains advisory-only.
- Notes cannot own website identification.
- Honest uncertainty is preferred over confident guessing.

## Next Block Prompt

W53: Consultant Evidence UX. Make the website intelligence visible and usable inside Review/Plan by showing what IDB saw, why it classified the prospect, what is uncertain, and exactly what the consultant should confirm before ROI, competitive, or write preparation proceeds.
