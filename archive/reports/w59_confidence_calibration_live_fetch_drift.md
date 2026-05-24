# W59 Confidence Calibration And Live Fetch Drift

Decision: PASS / CONFIDENCE CALIBRATION READY / NO WRITE AUTHORITY

## Objective

Tune classification confidence against the W58 corpus and prepare for live website drift.

## Completed

- Added confidence threshold tuning for recommended, needs-confirmation, and insufficient-evidence states.
- Added approved live-vs-snapshot comparison samples.
- Added ambiguity calibration using candidate margin, source URL count, failure state, and lane drift.
- Added a false-confident-wrong guardrail with a maximum of zero.
- Added pilot confirmation requirements for source-limited, ambiguous, drifted, blocked, thin, unavailable, and timeout websites.

## Scorecard

| Metric | Value |
| --- | ---: |
| Correct or honest pass rate | 1 |
| False-confident-wrong count | 0 |
| Unsupported claim count | 0 |
| Confirmation required before pilot | 3 |
| Stable recommended cases | 3 |
| Drift handled honestly rate | 1 |

## Case Results

| Status | Case | Snapshot | Live Observation | Calibrated State | Drift Type | Margin | Confirm Before Pilot | False Confident Wrong | Unsupported Claim | Notes |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| PASS | w59_live_trek_stable | recommended/dealer_hardgoods | recommended/dealer_hardgoods | recommended | stable | 0.41 | no | no | no | None |
| PASS | w59_live_patagonia_stable | recommended/apparel_accessories | recommended/apparel_accessories | recommended | stable | 0.36 | no | no | no | None |
| PASS | w59_live_grainger_source_limited | recommended/industrial_distribution | recommended/industrial_distribution | needs_confirmation | source_limited | 0.19 | yes | no | no | confirmation_required_before_pilot |
| PASS | w59_live_lincoln_stable_after_threshold_tune | recommended/industrial_equipment | recommended/industrial_equipment | recommended | stable | 0.31 | no | no | no | None |
| PASS | w59_live_ridgeline_ambiguous | needs_confirmation/apparel_accessories | needs_confirmation/apparel_accessories | needs_confirmation | stable | 0.11 | yes | no | no | confirmation_required_before_pilot |
| PASS | w59_live_thin_still_insufficient | insufficient_evidence/none | insufficient_evidence/none | insufficient_evidence | source_limited | 0.12 | yes | no | no | confirmation_required_before_pilot |

## Calibration Rules

- Recommend only when score is at least 0.82, at least 2 source URLs are present, no lane drift exists, and no close competing candidate is inside 0.25.
- Downgrade to needs confirmation when evidence is source-limited, ambiguous, drifted, or below the recommended threshold.
- Mark insufficient evidence for blocked, thin, unavailable, timeout, unsafe URL, or no-candidate sites.
- Keep false-confident-wrong at zero before five-consultant pilot testing.

## No Regression

- Write authority remains `none`.
- No SuiteScript invocation.
- N/LLM remains advisory-only.
- Notes cannot own identification.
- Transaction writes remain blocked.

## Next Block Prompt

W60: Five-Consultant Pilot Readiness Gate. Use W57-W59 evidence to decide whether the drawer is ready for five consultant tests. Package install steps, live website test script, evidence checklist, go/no-go scorecard, confirmation rules, and recovery instructions.
