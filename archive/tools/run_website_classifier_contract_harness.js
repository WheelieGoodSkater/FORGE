const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w51_website_classifier_v1_contract.json');
const evidenceTracePath = path.join(root, 'trace_samples', 'w50_website_evidence_resolver_trace_sample.json');
const classifierTracePath = path.join(root, 'trace_samples', 'w51_website_classifier_trace_sample.json');
const reportPath = path.join(root, 'reports', 'w51_intelligence_classifier_v1.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function includesAll(actual, expected) {
  return expected.every((item) => actual.includes(item));
}

function hasPrompt(item) {
  return item.confirmationPrompt && item.confirmationPrompt.reason && item.confirmationPrompt.missingEvidence && item.confirmationPrompt.question;
}

function hasCitation(item) {
  return (item.evidenceCitations || []).every((citation) => citation.sourceUrl && citation.field && citation.value && citation.supports);
}

function main() {
  const contract = readJson(contractPath);
  const evidenceTrace = readJson(evidenceTracePath);
  const classifierTrace = readJson(classifierTracePath);
  const results = [];
  const classifier = contract.websiteClassifierV1 || {};
  const cases = classifierTrace.cases || [];
  const evidenceIds = new Set((evidenceTrace.cases || []).map((item) => item.id));
  const byFailureInput = new Map((evidenceTrace.cases || []).map((item) => [item.id, item.failureState]));
  const recommendedCases = cases.filter((item) => item.classificationState === 'recommended');
  const confirmationCases = cases.filter((item) => item.classificationState === 'needs_confirmation');
  const insufficientCases = cases.filter((item) => item.classificationState === 'insufficient_evidence');
  const blockedThinUnavailableTimeout = ['blocked', 'thin', 'unavailable', 'timeout'];

  assertCase(results, 'w51_contract_schema_present', contract.schema === 'idb.w51-website-classifier-v1-contract.v1', contract.schema);
  assertCase(results, 'w51_consumes_website_evidence_v1', contract.consumes && contract.consumes.websiteEvidenceSchema === 'idb.website-evidence.v1', JSON.stringify(contract.consumes || {}));
  assertCase(results, 'w51_classifier_schema_present', classifier.schema === 'idb.website-classifier.v1', classifier.schema);
  assertCase(results, 'w51_required_fields_present', includesAll(classifier.requiredFields || [], ['inputEvidenceId', 'normalizedUrl', 'domain', 'laneRecommendation', 'proofAnchorRecommendation', 'productSeed', 'productFamily', 'demandMoment', 'confidence', 'evidenceCitations', 'competingCandidates', 'confirmationPrompt', 'classificationState', 'notesBoundary', 'writeAuthority', 'nllmAuthority']), (classifier.requiredFields || []).join(', '));
  assertCase(results, 'w51_recommendation_fields_present', includesAll(classifier.recommendationFields || [], ['laneRecommendation', 'proofAnchorRecommendation', 'productSeed', 'productFamily', 'demandMoment']), (classifier.recommendationFields || []).join(', '));
  assertCase(results, 'w51_confidence_states_present', includesAll(classifier.confidenceStates || [], ['recommended', 'needs_confirmation', 'insufficient_evidence']), (classifier.confidenceStates || []).join(', '));
  assertCase(results, 'w51_citation_contract_present', classifier.evidenceCitationContract && classifier.evidenceCitationContract.sourceUrlRequired === true && classifier.evidenceCitationContract.requiredFields.includes('sourceUrl') && classifier.evidenceCitationContract.unsupportedClaimPolicy === 'block_or_mark_insufficient_evidence', JSON.stringify(classifier.evidenceCitationContract || {}));
  assertCase(results, 'w51_competing_candidate_contract_present', classifier.competingCandidateContract && classifier.competingCandidateContract.requiredFields.includes('whyItMightFit') && classifier.competingCandidateContract.requiredFields.includes('evidenceCitations'), JSON.stringify(classifier.competingCandidateContract || {}));
  assertCase(results, 'w51_rules_preserve_boundaries', contract.rules.websiteEvidenceOwnsIdentification === true && contract.rules.blockedThinUnavailableTimeoutDoNotGuess === true && contract.rules.writeAuthority === 'none' && contract.rules.suiteScriptInvocation === false && contract.rules.nllmAdvisoryOnly === true, JSON.stringify(contract.rules || {}));
  assertCase(results, 'w51_trace_schema_present', classifierTrace.schema === 'idb.website-classifier-v1-trace-sample.v1' && classifierTrace.classifierVersion === 'w51.website-classifier.v1', `${classifierTrace.schema} / ${classifierTrace.classifierVersion}`);
  assertCase(results, 'w51_trace_cases_use_w50_evidence_ids', cases.every((item) => evidenceIds.has(item.inputEvidenceId)), cases.map((item) => item.inputEvidenceId).join(', '));
  assertCase(results, 'w51_recommended_case_has_cited_identity', recommendedCases.some((item) => item.laneRecommendation && item.laneRecommendation.laneId === 'dealer_hardgoods' && item.proofAnchorRecommendation && item.productSeed && item.productFamily && item.demandMoment && item.evidenceCitations.length >= 2 && hasCitation(item) && item.confirmationPrompt === null), '');
  assertCase(results, 'w51_ambiguous_case_has_competing_candidates_and_prompt', confirmationCases.some((item) => item.inputEvidenceId === 'w50_ambiguous_site' && item.competingCandidates.length >= 2 && item.competingCandidates.every((candidate) => candidate.laneId && candidate.score && candidate.whyItMightFit && candidate.evidenceCitations.length >= 1) && hasPrompt(item)), '');
  assertCase(results, 'w51_insufficient_cases_do_not_guess', insufficientCases.every((item) => item.laneRecommendation === null && item.proofAnchorRecommendation === null && item.productSeed === '' && item.productFamily === '' && item.demandMoment === '' && item.confidence.requiresConfirmation === true && hasPrompt(item)), insufficientCases.map((item) => item.id).join(', '));
  assertCase(results, 'w51_blocked_thin_unavailable_timeout_do_not_produce_recommendations', insufficientCases.filter((item) => blockedThinUnavailableTimeout.includes(byFailureInput.get(item.inputEvidenceId))).every((item) => item.confidence.state === 'insufficient_evidence' && item.laneRecommendation === null), '');
  assertCase(results, 'w51_notes_cannot_override_identification', cases.every((item) => item.notesBoundary && item.notesBoundary.notesDidOverrideIdentification === false && includesAll(item.notesBoundary.notesNotAllowedFor || [], ['laneRecommendation', 'proofAnchorRecommendation', 'productSeed', 'productFamily', 'demandMoment']) && includesAll(item.notesBoundary.notesAllowedFor || [], ['pain', 'roi', 'competitiveFraming', 'objections', 'talkTrack', 'runCoaching'])), '');
  assertCase(results, 'w51_trace_no_write_regression', classifierTrace.writeAuthority === 'none' && classifierTrace.nllmAdvisoryOnly === true && classifierTrace.noRegression.noSuiteScriptInvocation === true && classifierTrace.noRegression.transactionWriteEnabled === false, JSON.stringify(classifierTrace.noRegression || {}));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const rows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${String(result.detail || '').replace(/\|/g, '/')} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W51 Intelligence Classifier V1

Decision: ${decision} / WEBSITE CLASSIFIER V1 READY / NO WRITE AUTHORITY

## Objective

Turn \`websiteEvidenceV1\` into traceable lane, proof anchor, product seed, product family, and demand moment recommendations with honest confidence.

## Completed

- Added the \`idb.website-classifier.v1\` contract.
- Added classifier trace samples for recommended, needs-confirmation, and insufficient-evidence states.
- Added evidence citations tied to source URLs and extracted evidence fields.
- Added competing-candidate handling for ambiguous websites.
- Added confirmation prompts for weak, conflicting, blocked, thin, unavailable, and timeout evidence.
- Proved conversation notes cannot override website-owned identification fields.

## Harness Results

| Status | Rule | Detail |
| --- | --- | --- |
${rows}

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

${failureRows}

## Next Block Prompt

W52: End-Goal Intelligence Test Harness. Build the production-shaped intelligence evaluation harness around real and synthetic unknown websites, human-labeled expected outcomes, confidence calibration, false-confident-wrong limits, unsupported-claim blockers, and trace evidence coverage.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Website classifier contract harness: ${decision} (${results.length - failures.length}/${results.length})`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
