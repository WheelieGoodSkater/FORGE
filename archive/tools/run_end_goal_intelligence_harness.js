const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const corpusPath = path.join(root, 'data', 'w52_unknown_site_corpus_contract.json');
const classifierTracePath = path.join(root, 'trace_samples', 'w51_website_classifier_trace_sample.json');
const evaluationTracePath = path.join(root, 'trace_samples', 'w52_end_goal_intelligence_evaluation_trace.json');
const reportPath = path.join(root, 'reports', 'w52_end_goal_intelligence_test_harness.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function citationCoverage(item) {
  if (item.classificationState === 'recommended') {
    return (item.evidenceCitations || []).length >= 2 && item.evidenceCitations.every((citation) => citation.sourceUrl && citation.field && citation.value && citation.supports);
  }
  if (item.classificationState === 'needs_confirmation') {
    return !!item.confirmationPrompt
      && (item.competingCandidates || []).length >= 2
      && item.competingCandidates.every((candidate) => (candidate.evidenceCitations || []).some((citation) => citation.sourceUrl && citation.field && citation.value));
  }
  if (item.classificationState === 'insufficient_evidence') {
    return item.laneRecommendation === null
      && item.proofAnchorRecommendation === null
      && item.productSeed === ''
      && item.productFamily === ''
      && item.demandMoment === ''
      && !!item.confirmationPrompt;
  }
  return false;
}

function hasUnsupportedClaim(item) {
  const hasRecommendation = !!item.laneRecommendation || !!item.proofAnchorRecommendation || !!item.productSeed || !!item.productFamily || !!item.demandMoment;
  if (!hasRecommendation) return false;
  if (item.classificationState !== 'recommended' && item.classificationState !== 'needs_confirmation') return true;
  return !(item.evidenceCitations || []).some((citation) => citation.sourceUrl && citation.supports);
}

function laneMatches(item, label) {
  if (!label.expectedLaneId) return item.laneRecommendation === null;
  const laneId = item.laneRecommendation && item.laneRecommendation.laneId;
  return laneId === label.expectedLaneId || (label.acceptedAlternateLaneIds || []).includes(laneId);
}

function expectedFieldsMatch(item, label) {
  if (item.classificationState === 'insufficient_evidence') {
    return item.productSeed === '' && item.productFamily === '' && item.demandMoment === '';
  }
  if (item.classificationState === 'needs_confirmation') {
    return !!item.confirmationPrompt && (item.competingCandidates || []).length >= 2;
  }
  const proofLabel = item.proofAnchorRecommendation && item.proofAnchorRecommendation.label;
  return item.productSeed === label.expectedProductSeed
    && item.productFamily === label.expectedProductFamily
    && (!label.expectedDemandMomentContains || item.demandMoment.includes(label.expectedDemandMomentContains))
    && (!label.expectedProofAnchorContains || (proofLabel || '').includes(label.expectedProofAnchorContains));
}

function main() {
  const corpus = readJson(corpusPath);
  const classifierTrace = readJson(classifierTracePath);
  const traceById = new Map((classifierTrace.cases || []).map((item) => [item.id, item]));
  const policy = corpus.evaluationPolicy;
  const findings = corpus.humanLabeledCorpus.map((label) => {
    const item = traceById.get(label.sourceTraceCase);
    if (!item) {
      return {
        id: label.id,
        sourceTraceCase: label.sourceTraceCase,
        status: 'FAIL',
        correctOrHonest: false,
        falseConfidentWrong: false,
        unsupportedClaims: ['missing_classifier_trace_case'],
        evidenceCovered: false,
        notes: ['Classifier trace case missing']
      };
    }
    const stateMatches = item.classificationState === label.expectedClassificationState;
    const laneOk = laneMatches(item, label);
    const fieldsOk = expectedFieldsMatch(item, label);
    const evidenceCovered = citationCoverage(item);
    const unsupported = hasUnsupportedClaim(item);
    const falseConfidentWrong = item.classificationState === 'recommended' && (!laneOk || !fieldsOk);
    const correctOrHonest = stateMatches && evidenceCovered && !unsupported && !falseConfidentWrong && (
      item.classificationState === 'recommended'
        ? laneOk && fieldsOk
        : true
    );
    const notes = [];
    if (!stateMatches) notes.push(`state:${item.classificationState}->${label.expectedClassificationState}`);
    if (!laneOk) notes.push('lane_mismatch_or_guess');
    if (!fieldsOk) notes.push('field_mismatch');
    if (!evidenceCovered) notes.push('evidence_coverage_gap');
    if (unsupported) notes.push('unsupported_claim');
    if (falseConfidentWrong) notes.push('false_confident_wrong');
    return {
      id: label.id,
      sourceTraceCase: label.sourceTraceCase,
      siteKind: label.siteKind,
      expectedClassificationState: label.expectedClassificationState,
      actualClassificationState: item.classificationState,
      expectedLaneId: label.expectedLaneId,
      actualLaneId: item.laneRecommendation ? item.laneRecommendation.laneId : '',
      correctOrHonest,
      falseConfidentWrong,
      unsupportedClaims: unsupported ? ['recommended_or_confirmation_output_without_required_supporting_citation'] : [],
      evidenceCovered,
      status: correctOrHonest ? 'PASS' : 'FAIL',
      notes
    };
  });

  const total = findings.length;
  const correctOrHonestCount = findings.filter((item) => item.correctOrHonest).length;
  const falseConfidentWrongCount = findings.filter((item) => item.falseConfidentWrong).length;
  const unsupportedClaimCount = findings.reduce((sum, item) => sum + item.unsupportedClaims.length, 0);
  const evidenceCoveredCount = findings.filter((item) => item.evidenceCovered).length;
  const metrics = {
    totalCases: total,
    correctOrHonestCount,
    correctOrHonestPassRate: total ? Number((correctOrHonestCount / total).toFixed(4)) : 0,
    falseConfidentWrongCount,
    falseConfidentWrongRate: total ? Number((falseConfidentWrongCount / total).toFixed(4)) : 0,
    unsupportedClaimCount,
    traceEvidenceCoverageScore: total ? Number((evidenceCoveredCount / total).toFixed(4)) : 0
  };
  const requiredMix = corpus.requiredSiteMix || [];
  const actualMix = new Set((corpus.humanLabeledCorpus || []).map((item) => item.siteKind));
  const mixCovered = requiredMix.every((kind) => actualMix.has(kind));
  const decision = metrics.correctOrHonestPassRate >= policy.correctOrHonestPassRateMinimum
    && metrics.falseConfidentWrongRate <= policy.falseConfidentWrongRateMaximum
    && metrics.unsupportedClaimCount <= policy.unsupportedClaimsMaximum
    && metrics.traceEvidenceCoverageScore >= policy.traceEvidenceCoverageMinimum
    && mixCovered
    && findings.every((item) => item.status === 'PASS')
    ? 'PASS'
    : 'FAIL';

  const evaluationTrace = {
    schema: 'idb.w52-end-goal-intelligence-evaluation-trace.v1',
    generated: new Date().toISOString(),
    decision,
    corpusSchema: corpus.schema,
    classifierTraceSchema: classifierTrace.schema,
    thresholds: policy,
    metrics,
    requiredSiteMix: requiredMix,
    mixCovered,
    noRegression: corpus.noRegression,
    findings
  };
  fs.writeFileSync(evaluationTracePath, `${JSON.stringify(evaluationTrace, null, 2)}\n`);

  const rows = findings.map((item) => `| ${item.status} | ${item.id} | ${item.siteKind} | ${item.actualClassificationState} | ${item.actualLaneId || 'none'} | ${item.correctOrHonest ? 'yes' : 'no'} | ${item.falseConfidentWrong ? 'yes' : 'no'} | ${item.unsupportedClaims.length} | ${item.evidenceCovered ? 'yes' : 'no'} | ${item.notes.join(', ') || 'None'} |`).join('\n');
  const report = `# W52 End-Goal Intelligence Test Harness

Decision: ${decision} / END-GOAL INTELLIGENCE HARNESS READY / NO WRITE AUTHORITY

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
| Correct or honest pass rate | ${metrics.correctOrHonestPassRate} | >= ${policy.correctOrHonestPassRateMinimum} |
| False-confident-wrong rate | ${metrics.falseConfidentWrongRate} | <= ${policy.falseConfidentWrongRateMaximum} |
| Unsupported claim count | ${metrics.unsupportedClaimCount} | <= ${policy.unsupportedClaimsMaximum} |
| Trace evidence coverage score | ${metrics.traceEvidenceCoverageScore} | >= ${policy.traceEvidenceCoverageMinimum} |
| Required site mix covered | ${mixCovered ? 'yes' : 'no'} | yes |

## Case Results

| Status | Case | Site Kind | State | Lane | Correct/Honest | False Confident Wrong | Unsupported Claims | Evidence Covered | Notes |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
${rows}

## No Regression

- Main drawer remains create-disabled.
- Main Suitelet remains create-disabled.
- Transaction writes remain blocked.
- N/LLM remains advisory-only.
- Notes cannot own website identification.
- Honest uncertainty is preferred over confident guessing.

## Next Block Prompt

W53: Consultant Evidence UX. Make the website intelligence visible and usable inside Review/Plan by showing what IDB saw, why it classified the prospect, what is uncertain, and exactly what the consultant should confirm before ROI, competitive, or write preparation proceeds.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`End-goal intelligence harness: ${decision} (${correctOrHonestCount}/${total} correct or honest, ${unsupportedClaimCount} unsupported claims)`);
  if (decision !== 'PASS') {
    console.error(findings.filter((item) => item.status !== 'PASS'));
    process.exit(1);
  }
}

main();
