# W51 Intelligence Classifier V1

Decision: PASS / WEBSITE CLASSIFIER V1 READY / NO WRITE AUTHORITY

## Objective

Turn `websiteEvidenceV1` into traceable lane, proof anchor, product seed, product family, and demand moment recommendations with honest confidence.

## Completed

- Added the `idb.website-classifier.v1` contract.
- Added classifier trace samples for recommended, needs-confirmation, and insufficient-evidence states.
- Added evidence citations tied to source URLs and extracted evidence fields.
- Added competing-candidate handling for ambiguous websites.
- Added confirmation prompts for weak, conflicting, blocked, thin, unavailable, and timeout evidence.
- Proved conversation notes cannot override website-owned identification fields.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
| PASS | w51_contract_schema_present | idb.w51-website-classifier-v1-contract.v1 |
| PASS | w51_consumes_website_evidence_v1 | {"websiteEvidenceSchema":"idb.website-evidence.v1","sourceContract":"data/w50_website_evidence_v1_contract.json","sourceTrace":"trace_samples/w50_website_evidence_resolver_trace_sample.json"} |
| PASS | w51_classifier_schema_present | idb.website-classifier.v1 |
| PASS | w51_required_fields_present | inputEvidenceId, normalizedUrl, domain, laneRecommendation, proofAnchorRecommendation, productSeed, productFamily, demandMoment, confidence, evidenceCitations, competingCandidates, confirmationPrompt, classificationState, notesBoundary, writeAuthority, nllmAuthority |
| PASS | w51_recommendation_fields_present | laneRecommendation, proofAnchorRecommendation, productSeed, productFamily, demandMoment |
| PASS | w51_confidence_states_present | recommended, needs_confirmation, insufficient_evidence |
| PASS | w51_citation_contract_present | {"requiredFields":["sourceUrl","field","value","supports"],"sourceUrlRequired":true,"unsupportedClaimPolicy":"block_or_mark_insufficient_evidence"} |
| PASS | w51_competing_candidate_contract_present | {"requiredWhen":["classificationState is needs_confirmation","failureState is ambiguous","second candidate score is within 0.15 of leading candidate"],"requiredFields":["laneId","score","evidenceCitations","whyItMightFit"]} |
| PASS | w51_rules_preserve_boundaries | {"websiteEvidenceOwnsIdentification":true,"conversationNotesDoNotOverride":["laneRecommendation","proofAnchorRecommendation","productSeed","productFamily","demandMoment"],"conversationNotesContinueToDrive":["pain","roi","competitiveFraming","objections","talkTrack","runCoaching"],"blockedThinUnavailableTimeoutDoNotGuess":true,"ambiguousRequiresCompetingCandidates":true,"citationsRequiredForRecommendations":true,"nllmAdvisoryOnly":true,"writeAuthority":"none","suiteScriptInvocation":false} |
| PASS | w51_trace_schema_present | idb.website-classifier-v1-trace-sample.v1 / w51.website-classifier.v1 |
| PASS | w51_trace_cases_use_w50_evidence_ids | w50_recommended_product_brand, w50_ambiguous_site, w50_blocked_site, w50_thin_site, w50_unavailable_site, w50_timeout_site |
| PASS | w51_recommended_case_has_cited_identity |  |
| PASS | w51_ambiguous_case_has_competing_candidates_and_prompt |  |
| PASS | w51_insufficient_cases_do_not_guess | w51_blocked_site, w51_thin_site, w51_unavailable_site, w51_timeout_site |
| PASS | w51_blocked_thin_unavailable_timeout_do_not_produce_recommendations |  |
| PASS | w51_notes_cannot_override_identification |  |
| PASS | w51_trace_no_write_regression | {"mainDrawerCreateEnabled":false,"mainSuiteletCreateEnabled":false,"transactionWriteEnabled":false,"nllmAdvisoryOnly":true,"noSuiteScriptInvocation":true,"notesCannotOwnIdentification":true} |

## Classification Behavior

- Recommended: requires clear website evidence, source citations, product seed, product family, and demand moment.
- Needs confirmation: preserves the leading recommendation, shows competing candidates, and asks the consultant to confirm.
- Insufficient evidence: produces no confident lane, proof anchor, product seed, product family, or demand moment.

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- Transaction writes remain blocked.
- N/LLM remains advisory-only.
- No SuiteScript invocation is introduced.
- Conversation notes remain downstream for pain, ROI, competitive framing, objections, talk track, and run coaching.

## Failures

- None

## Next Block Prompt

W52: End-Goal Intelligence Test Harness. Build the production-shaped intelligence evaluation harness around real and synthetic unknown websites, human-labeled expected outcomes, confidence calibration, false-confident-wrong limits, unsupported-claim blockers, and trace evidence coverage.
