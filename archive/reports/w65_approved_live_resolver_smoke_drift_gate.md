# W65 Approved Live Resolver Smoke And Drift Gate

Decision: PASS / APPROVED LIVE FETCH EXECUTED / NO WRITE AUTHORITY

## Objective

Run the no-write `websiteResolverServiceV1` path against an approved small set of public websites, compare output to W58/W59 expectations, and produce a drift report.

## Metrics

- Mode: approved_live_fetch
- Correct or honest: 4/4 (1)
- False-confident-wrong: 0
- Unsupported claims: 0
- Evidence coverage score: 0.5
- Recommended / needs confirmation / insufficient: 1 / 0 / 3

## Findings

| Status | Case | Actual state | Actual lane | Expected lane | Drift type | Source URLs | Extraction gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PASS | w65_live_trek | recommended | dealer_hardgoods | dealer_hardgoods | stable | 3 | None |
| PASS | w65_live_patagonia | insufficient_evidence | none | apparel_accessories | thin | 1 | Live state is insufficient_evidence; expected recommended.; Fewer than two source URLs; keep needs confirmation.; Resolver returned thin; do not classify confidently. |
| PASS | w65_live_grainger | insufficient_evidence | none | industrial_distribution | thin | 1 | Live state is insufficient_evidence; expected needs_confirmation.; Fewer than two source URLs; keep needs confirmation.; No product/category or industry terms extracted.; Resolver returned thin; do not classify confidently. |
| PASS | w65_live_lincoln_electric | insufficient_evidence | none | industrial_equipment | blocked | 0 | Live state is insufficient_evidence; expected recommended.; No source URLs captured.; Fewer than two source URLs; keep needs confirmation.; No product/category or industry terms extracted.; Resolver returned blocked; do not classify confidently. |

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w65_approved_site_set_present | 4 |
| PASS | w65_correct_or_honest_threshold_met | {"mode":"approved_live_fetch","total":4,"correctOrHonestCount":4,"falseConfidentWrongCount":0,"unsupportedClaimCount":0,"evidenceCoverageScore":0.5,"recommendedCount":1,"needsConfirmationCount":0,"insufficientEvidenceCount":3,"correctOrHonestRate":1} |
| PASS | w65_false_confident_wrong_limit_met | {"mode":"approved_live_fetch","total":4,"correctOrHonestCount":4,"falseConfidentWrongCount":0,"unsupportedClaimCount":0,"evidenceCoverageScore":0.5,"recommendedCount":1,"needsConfirmationCount":0,"insufficientEvidenceCount":3,"correctOrHonestRate":1} |
| PASS | w65_unsupported_claim_limit_met | {"mode":"approved_live_fetch","total":4,"correctOrHonestCount":4,"falseConfidentWrongCount":0,"unsupportedClaimCount":0,"evidenceCoverageScore":0.5,"recommendedCount":1,"needsConfirmationCount":0,"insufficientEvidenceCount":3,"correctOrHonestRate":1} |
| PASS | w65_failure_states_do_not_guess | [{"id":"w65_live_trek","failureState":null,"actualState":"recommended","actualLaneId":"dealer_hardgoods"},{"id":"w65_live_patagonia","failureState":"thin","actualState":"insufficient_evidence","actualLaneId":""},{"id":"w65_live_grainger","failureState":"thin","actualState":"insufficient_evidence","actualLaneId":""},{"id":"w65_live_lincoln_electric","failureState":"blocked","actualState":"insufficient_evidence","actualLaneId":""}] |
| PASS | w65_no_write_boundaries_present |  |
| PASS | w65_best_next_prompt_present | W66: Live Extraction Gap Closure And Resolver Tuning |

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no lane guesses.
- Transaction writes remain blocked.

## Failures

- None

## Best Next Codex Prompt

```text
Move through W66: Live Extraction Gap Closure And Resolver Tuning. Use the W65 live smoke findings to close resolver extraction gaps for approved public websites without overfitting to static fixtures. Tune product/category vocab, page discovery, confidence calibration, and failure-state UX only where W65 evidence proves a gap. Preserve no writes, no SuiteScript invocation, N/LLM advisory-only, notes story-only, and blocked/thin/unavailable/timeout as insufficient evidence with no confident guesses. Output resolver tuning changes, updated live/snapshot harness results, extraction gap report, validator gates, W66 report, and best next Codex prompt.
```
