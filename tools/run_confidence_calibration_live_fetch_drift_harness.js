const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w59_confidence_calibration_live_fetch_drift.json');
const baselineTracePath = path.join(root, 'trace_samples', 'w58_real_unknown_site_corpus_evaluation_trace.json');
const tracePath = path.join(root, 'trace_samples', 'w59_confidence_calibration_live_fetch_drift_trace.json');
const reportPath = path.join(root, 'reports', 'w59_confidence_calibration_live_fetch_drift.md');
const generated = '2026-05-12T16:59:00.000Z';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function calibratedState(sample, policy, baseline) {
  const live = sample.liveObservation;
  const margin = Number((live.leadingScore - live.secondScore).toFixed(4));
  const laneChanged = baseline && baseline.actualLaneId && live.leadingLaneId && baseline.actualLaneId !== live.leadingLaneId;
  const insufficientFailures = new Set(['blocked', 'thin', 'unavailable', 'timeout']);
  if (insufficientFailures.has(live.failureState) || live.state === 'insufficient_evidence' || !live.leadingLaneId) {
    return {
      state: 'insufficient_evidence',
      reason: live.failureState || 'no_lane_candidates',
      requiresConfirmation: true,
      laneChanged,
      margin
    };
  }
  if (
    live.failureState === 'ambiguous'
    || live.sourceUrlCount < policy.recommendedMinimumEvidenceCitations
    || laneChanged
    || margin <= policy.ambiguousMarginMaximum
    || live.leadingScore < policy.recommendedMinimumScore
  ) {
    return {
      state: 'needs_confirmation',
      reason: laneChanged ? 'snapshot_live_lane_drift' : live.failureState === 'ambiguous' ? 'ambiguous_live_evidence' : live.sourceUrlCount < policy.recommendedMinimumEvidenceCitations ? 'source_limited_live_evidence' : margin <= policy.ambiguousMarginMaximum ? 'close_competing_candidate' : 'below_recommended_threshold',
      requiresConfirmation: true,
      laneChanged,
      margin
    };
  }
  return {
    state: 'recommended',
    reason: 'stable_high_confidence_evidence',
    requiresConfirmation: false,
    laneChanged,
    margin
  };
}

function hasUnsupportedClaim(calibration, sample) {
  if (calibration.state === 'insufficient_evidence') {
    return false;
  }
  return sample.liveObservation.sourceUrlCount < 1 || !(sample.liveObservation.evidenceNotes || []).length;
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function main() {
  const contract = readJson(contractPath);
  const baselineTrace = readJson(baselineTracePath);
  const policy = contract.calibrationPolicy;
  const baselineById = new Map((baselineTrace.findings || []).map((item) => [item.id, item]));
  const findings = contract.approvedLiveFetchComparisonSamples.map((sample) => {
    const baseline = baselineById.get(sample.baselineCaseId);
    const calibration = calibratedState(sample, policy, baseline);
    const falseConfidentWrong = calibration.state === 'recommended'
      && sample.expectedLaneId
      && sample.liveObservation.leadingLaneId !== sample.expectedLaneId;
    const unsupportedClaim = hasUnsupportedClaim(calibration, sample);
    const stateMatches = calibration.state === sample.expectedCalibratedState;
    const laneOk = !sample.expectedLaneId || sample.liveObservation.leadingLaneId === sample.expectedLaneId;
    const correctOrHonest = stateMatches && laneOk && !falseConfidentWrong && !unsupportedClaim;
    const driftType = !baseline
      ? 'missing_baseline'
      : calibration.laneChanged
        ? 'lane_changed'
        : baseline.actualClassificationState !== sample.liveObservation.state
          ? 'state_changed'
          : sample.liveObservation.sourceUrlCount < policy.recommendedMinimumEvidenceCitations
            ? 'source_limited'
            : 'stable';
    const confirmationRequiredBeforePilot = calibration.state !== 'recommended' || calibration.laneChanged || driftType !== 'stable';
    const notes = [];
    if (!baseline) notes.push('missing_baseline');
    if (!stateMatches) notes.push(`state:${calibration.state}->${sample.expectedCalibratedState}`);
    if (!laneOk) notes.push('lane_mismatch');
    if (falseConfidentWrong) notes.push('false_confident_wrong');
    if (unsupportedClaim) notes.push('unsupported_claim');
    if (confirmationRequiredBeforePilot) notes.push('confirmation_required_before_pilot');
    return {
      id: sample.id,
      baselineCaseId: sample.baselineCaseId,
      website: sample.website,
      baselineState: baseline ? baseline.actualClassificationState : '',
      baselineLaneId: baseline ? baseline.actualLaneId : '',
      liveState: sample.liveObservation.state,
      liveLaneId: sample.liveObservation.leadingLaneId,
      liveScore: sample.liveObservation.leadingScore,
      secondLaneId: sample.liveObservation.secondLaneId,
      secondScore: sample.liveObservation.secondScore,
      sourceUrlCount: sample.liveObservation.sourceUrlCount,
      failureState: sample.liveObservation.failureState,
      calibratedState: calibration.state,
      calibrationReason: calibration.reason,
      candidateMargin: calibration.margin,
      driftType,
      expectedCalibratedState: sample.expectedCalibratedState,
      correctOrHonest,
      falseConfidentWrong,
      unsupportedClaim,
      confirmationRequiredBeforePilot,
      notes
    };
  });

  const total = findings.length;
  const correctOrHonestCount = findings.filter((item) => item.correctOrHonest).length;
  const falseConfidentWrongCount = findings.filter((item) => item.falseConfidentWrong).length;
  const unsupportedClaimCount = findings.filter((item) => item.unsupportedClaim).length;
  const confirmationRequiredCount = findings.filter((item) => item.confirmationRequiredBeforePilot).length;
  const stableRecommendedCount = findings.filter((item) => item.calibratedState === 'recommended' && item.driftType === 'stable').length;
  const driftHandledHonestlyCount = findings.filter((item) => item.driftType !== 'stable').filter((item) => item.calibratedState !== 'recommended' || item.correctOrHonest).length;
  const metrics = {
    totalCases: total,
    correctOrHonestCount,
    correctOrHonestPassRate: Number((correctOrHonestCount / total).toFixed(4)),
    falseConfidentWrongCount,
    falseConfidentWrongRate: Number((falseConfidentWrongCount / total).toFixed(4)),
    unsupportedClaimCount,
    confirmationRequiredCount,
    stableRecommendedCount,
    driftHandledHonestlyCount,
    driftHandledHonestlyRate: Number((driftHandledHonestlyCount / Math.max(1, findings.filter((item) => item.driftType !== 'stable').length)).toFixed(4))
  };
  const decision = metrics.falseConfidentWrongCount <= policy.falseConfidentWrongMaximum
    && metrics.unsupportedClaimCount <= policy.unsupportedClaimsMaximum
    && findings.every((item) => item.correctOrHonest)
    ? 'PASS'
    : 'FAIL';

  const trace = {
    schema: 'idb.w59-confidence-calibration-live-fetch-drift-trace.v1',
    generated,
    decision,
    contractSchema: contract.schema,
    baselineTraceSchema: baselineTrace.schema,
    calibrationPolicy: policy,
    metrics,
    pilotConfirmationRequirements: contract.pilotConfirmationRequirements,
    noRegression: contract.noRegression,
    findings
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = findings.map((item) => `| ${item.correctOrHonest ? 'PASS' : 'FAIL'} | ${item.id} | ${item.baselineState}/${item.baselineLaneId || 'none'} | ${item.liveState}/${item.liveLaneId || 'none'} | ${item.calibratedState} | ${item.driftType} | ${item.candidateMargin} | ${item.confirmationRequiredBeforePilot ? 'yes' : 'no'} | ${item.falseConfidentWrong ? 'yes' : 'no'} | ${item.unsupportedClaim ? 'yes' : 'no'} | ${escapeTable(item.notes.join(', ') || 'None')} |`).join('\n');
  const report = `# W59 Confidence Calibration And Live Fetch Drift

Decision: ${decision} / CONFIDENCE CALIBRATION READY / NO WRITE AUTHORITY

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
| Correct or honest pass rate | ${metrics.correctOrHonestPassRate} |
| False-confident-wrong count | ${metrics.falseConfidentWrongCount} |
| Unsupported claim count | ${metrics.unsupportedClaimCount} |
| Confirmation required before pilot | ${metrics.confirmationRequiredCount} |
| Stable recommended cases | ${metrics.stableRecommendedCount} |
| Drift handled honestly rate | ${metrics.driftHandledHonestlyRate} |

## Case Results

| Status | Case | Snapshot | Live Observation | Calibrated State | Drift Type | Margin | Confirm Before Pilot | False Confident Wrong | Unsupported Claim | Notes |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
${rows}

## Calibration Rules

- Recommend only when score is at least ${policy.recommendedMinimumScore}, at least ${policy.recommendedMinimumEvidenceCitations} source URLs are present, no lane drift exists, and no close competing candidate is inside ${policy.ambiguousMarginMaximum}.
- Downgrade to needs confirmation when evidence is source-limited, ambiguous, drifted, or below the recommended threshold.
- Mark insufficient evidence for blocked, thin, unavailable, timeout, unsafe URL, or no-candidate sites.
- Keep false-confident-wrong at zero before five-consultant pilot testing.

## No Regression

- Write authority remains \`none\`.
- No SuiteScript invocation.
- N/LLM remains advisory-only.
- Notes cannot own identification.
- Transaction writes remain blocked.

## Next Block Prompt

W60: Five-Consultant Pilot Readiness Gate. Use W57-W59 evidence to decide whether the drawer is ready for five consultant tests. Package install steps, live website test script, evidence checklist, go/no-go scorecard, confirmation rules, and recovery instructions.
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Confidence calibration and drift harness: ${decision} (${correctOrHonestCount}/${total} correct or honest, ${falseConfidentWrongCount} false-confident-wrong)`);
  if (decision !== 'PASS') {
    console.error(findings.filter((item) => !item.correctOrHonest));
    process.exit(1);
  }
}

main();
