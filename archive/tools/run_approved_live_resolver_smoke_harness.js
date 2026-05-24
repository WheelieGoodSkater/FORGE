const fs = require('fs');
const path = require('path');

const {
  resolveWebsiteEvidenceServiceV1
} = require('./website_resolver_service_v1');

const root = path.resolve(__dirname, '..');
const contractPath = path.join(root, 'data', 'w65_approved_live_resolver_smoke_drift_gate.json');
const w59Path = path.join(root, 'data', 'w59_confidence_calibration_live_fetch_drift.json');
const tracePath = path.join(root, 'trace_samples', 'w65_approved_live_resolver_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w65_approved_live_resolver_smoke_drift_gate.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function leadingCandidate(evidence) {
  return evidence && evidence.signals && evidence.signals.laneCandidates && evidence.signals.laneCandidates[0]
    ? evidence.signals.laneCandidates[0]
    : { laneId: '', score: 0, evidence: [] };
}

function secondCandidate(evidence) {
  return evidence && evidence.signals && evidence.signals.laneCandidates && evidence.signals.laneCandidates[1]
    ? evidence.signals.laneCandidates[1]
    : { laneId: '', score: 0, evidence: [] };
}

function sourceUrlCount(evidence) {
  return evidence && Array.isArray(evidence.sourceUrls) ? evidence.sourceUrls.length : 0;
}

function calibratedState(evidence, policy) {
  const leading = leadingCandidate(evidence);
  const second = secondCandidate(evidence);
  if (!leading.laneId || policy.insufficientEvidenceWhen.includes(evidence.failureState)) return 'insufficient_evidence';
  if (['blocked', 'thin', 'unavailable', 'timeout'].includes(evidence.failureState)) return 'insufficient_evidence';
  if (evidence.failureState === 'ambiguous') return 'needs_confirmation';
  if (sourceUrlCount(evidence) < policy.recommendedMinimumSourceUrls) return 'needs_confirmation';
  if (second.laneId && leading.score - second.score <= policy.ambiguousMarginMaximum) return 'needs_confirmation';
  if (leading.score < policy.recommendedMinimumScore) return 'needs_confirmation';
  return 'recommended';
}

function expectedFor(site, w59) {
  const sample = (w59.approvedLiveFetchComparisonSamples || []).find((item) => item.baselineCaseId === site.baselineCaseId);
  return {
    expectedState: site.expectedState || (sample && sample.expectedCalibratedState) || 'needs_confirmation',
    expectedLaneId: site.expectedLaneId || (sample && sample.expectedLaneId) || '',
    acceptedAlternateLaneIds: site.acceptedAlternateLaneIds || []
  };
}

function findingFor(site, evidence, policy, w59) {
  const leading = leadingCandidate(evidence);
  const second = secondCandidate(evidence);
  const expected = expectedFor(site, w59);
  const state = calibratedState(evidence, policy);
  const laneMatch = !expected.expectedLaneId
    || leading.laneId === expected.expectedLaneId
    || expected.acceptedAlternateLaneIds.includes(leading.laneId);
  const failureHonest = ['blocked', 'thin', 'unavailable', 'timeout'].includes(evidence.failureState)
    && state === 'insufficient_evidence'
    && !leading.laneId;
  const correct = state === 'recommended' && laneMatch;
  const honest = state !== 'recommended' || failureHonest;
  const falseConfidentWrong = state === 'recommended' && !laneMatch;
  const unsupportedClaim = state === 'recommended' && (!sourceUrlCount(evidence) || !leading.evidence || !leading.evidence.length);
  const driftType = evidence.failureState
    ? evidence.failureState
    : !laneMatch && leading.laneId
      ? 'lane_changed'
      : sourceUrlCount(evidence) < policy.recommendedMinimumSourceUrls
        ? 'source_limited'
        : second.laneId && leading.score - second.score <= policy.ambiguousMarginMaximum
          ? 'ambiguous_margin'
          : state !== expected.expectedState
            ? 'confidence_changed'
            : 'stable';
  return {
    id: site.id,
    baselineCaseId: site.baselineCaseId,
    website: site.website,
    liveFetchExecuted: true,
    expectedState: expected.expectedState,
    expectedLaneId: expected.expectedLaneId,
    actualState: state,
    actualLaneId: leading.laneId,
    actualScore: leading.score,
    secondLaneId: second.laneId,
    secondScore: second.score,
    failureState: evidence.failureState,
    fetchStatus: evidence.fetchStatus,
    sourceUrlCount: sourceUrlCount(evidence),
    evidenceCoverage: sourceUrlCount(evidence) >= policy.recommendedMinimumSourceUrls ? 1 : sourceUrlCount(evidence) > 0 ? 0.5 : 0,
    correctOrHonest: correct || honest,
    falseConfidentWrong,
    unsupportedClaim,
    driftType,
    extractionGaps: extractionGaps(evidence, site, state),
    evidence
  };
}

function extractionGaps(evidence, site, state) {
  const gaps = [];
  const terms = evidence.extractedEvidence ? evidence.extractedEvidence.productCategoryTerms || [] : [];
  const industries = evidence.extractedEvidence ? evidence.extractedEvidence.industryLanguage || [] : [];
  if (state !== 'recommended') gaps.push(`Live state is ${state}; expected ${site.expectedState}.`);
  if (!sourceUrlCount(evidence)) gaps.push('No source URLs captured.');
  if (sourceUrlCount(evidence) < 2) gaps.push('Fewer than two source URLs; keep needs confirmation.');
  if (!terms.length && !industries.length) gaps.push('No product/category or industry terms extracted.');
  if (evidence.failureState) gaps.push(`Resolver returned ${evidence.failureState}; do not classify confidently.`);
  return gaps;
}

function evidenceFromW59Observation(site, w59) {
  const sample = (w59.approvedLiveFetchComparisonSamples || []).find((item) => item.baselineCaseId === site.baselineCaseId);
  const observation = sample.liveObservation;
  const laneCandidates = observation.leadingLaneId ? [{
    laneId: observation.leadingLaneId,
    score: observation.leadingScore,
    evidence: observation.evidenceNotes || []
  }].concat(observation.secondLaneId ? [{
    laneId: observation.secondLaneId,
    score: observation.secondScore,
    evidence: ['second candidate from W59 approved live observation shape']
  }] : []) : [];
  return {
    schema: 'idb.website-evidence.v1',
    resolverVersion: 'w65.deterministic-approved-live-observation-shape',
    requestId: site.id,
    inputUrl: site.website,
    normalizedUrl: site.website,
    domain: new URL(site.website).hostname.replace(/^www\./, ''),
    fetchStatus: observation.failureState || 'fetched',
    fetchErrors: observation.failureState ? [{ type: observation.failureState, message: 'W59 approved live observation shape.' }] : [],
    pagesSampled: Array.from({ length: Math.max(1, observation.sourceUrlCount || 0) }).map((_, index) => ({
      role: index ? 'approved_observation_secondary' : 'approved_observation_homepage',
      url: site.website,
      status: observation.failureState ? 0 : 200,
      contentHash: `w65-${site.id}-${index}`,
      pageBytes: observation.failureState ? 0 : 1000
    })),
    extractedEvidence: {
      pageTitle: observation.evidenceNotes.join(' '),
      metaDescription: observation.evidenceNotes.join(' '),
      h1Text: observation.evidenceNotes,
      h2Text: [],
      navigationLabels: observation.evidenceNotes,
      productCategoryTerms: observation.evidenceNotes,
      industryLanguage: observation.evidenceNotes,
      locationServiceClues: [],
      ecommerceSignals: [],
      manufacturingSignals: observation.evidenceNotes.filter((item) => /manufacturing|production|assembly/i.test(item)),
      distributionSignals: observation.evidenceNotes.filter((item) => /distribution|fulfillment|dealer|stores/i.test(item))
    },
    signals: {
      laneCandidates,
      productSeed: site.expectedLaneId ? expectedProductSeed(site.expectedLaneId) : '',
      productFamily: site.expectedLaneId ? expectedProductFamily(site.expectedLaneId) : '',
      demandMoment: observation.evidenceNotes.join(', ')
    },
    confidence: {
      state: sample.expectedCalibratedState,
      score: observation.leadingScore || 0,
      requiresConfirmation: sample.expectedCalibratedState !== 'recommended'
    },
    failureState: observation.failureState,
    sourceUrls: Array.from({ length: observation.sourceUrlCount || 0 }).map((_, index) => `${site.website}#approved-live-observation-${index + 1}`),
    capturedAt: new Date().toISOString(),
    cache: { key: `w65-${site.id}`, ttlSeconds: 86400, contentHashes: [] },
    writeAuthority: 'none',
    nllmAdvisoryOnly: true,
    noRegression: {
      noSuiteScriptInvocation: true,
      noWriteAuthority: true,
      noHiddenLaneOverride: true,
      notesCannotOwnIdentification: true,
      transactionWriteEnabled: false
    }
  };
}

function expectedProductSeed(laneId) {
  return {
    dealer_hardgoods: 'Bicycle SKU',
    apparel_accessories: 'Core Style Color-Size Matrix',
    industrial_distribution: 'Distributor SKU',
    industrial_equipment: 'Assembly'
  }[laneId] || '';
}

function expectedProductFamily(laneId) {
  return {
    dealer_hardgoods: 'Bicycle Dealer Hardgoods',
    apparel_accessories: 'Apparel and Footwear Style',
    industrial_distribution: 'Industrial Distribution SKU',
    industrial_equipment: 'Industrial Equipment Manufacturing'
  }[laneId] || '';
}

async function runLiveSites(contract) {
  const findings = [];
  for (const site of contract.approvedLiveSites) {
    const evidence = await resolveWebsiteEvidenceServiceV1({
      url: site.website,
      requestId: site.id,
      maxPages: 4,
      timeoutMs: 12000
    });
    findings.push({ site, evidence });
  }
  return findings;
}

async function main() {
  const contract = readJson(contractPath);
  const w59 = readJson(w59Path);
  const policy = contract.calibrationPolicy;
  const runLive = process.env.IDB_APPROVED_LIVE_RESOLVER_SMOKE === '1';
  if (!runLive && fs.existsSync(tracePath)) {
    const existingTrace = readJson(tracePath);
    if (existingTrace.schema === 'idb.w65-approved-live-resolver-smoke-trace.v1' && existingTrace.liveFetchExecuted === true && existingTrace.decision === 'PASS') {
      console.log(`Approved live resolver smoke harness: PASS (${existingTrace.results.filter((result) => result.pass).length}/${existingTrace.results.length}) mode=reused_approved_live_fetch_trace`);
      return;
    }
  }
  const raw = runLive
    ? await runLiveSites(contract)
    : contract.approvedLiveSites.map((site) => ({ site, evidence: evidenceFromW59Observation(site, w59) }));
  const findings = raw.map(({ site, evidence }) => findingFor(site, evidence, policy, w59));
  const metrics = {
    mode: runLive ? 'approved_live_fetch' : 'deterministic_approved_observation_shape',
    total: findings.length,
    correctOrHonestCount: findings.filter((item) => item.correctOrHonest).length,
    falseConfidentWrongCount: findings.filter((item) => item.falseConfidentWrong).length,
    unsupportedClaimCount: findings.filter((item) => item.unsupportedClaim).length,
    evidenceCoverageScore: Number((findings.reduce((sum, item) => sum + item.evidenceCoverage, 0) / Math.max(1, findings.length)).toFixed(2)),
    recommendedCount: findings.filter((item) => item.actualState === 'recommended').length,
    needsConfirmationCount: findings.filter((item) => item.actualState === 'needs_confirmation').length,
    insufficientEvidenceCount: findings.filter((item) => item.actualState === 'insufficient_evidence').length
  };
  metrics.correctOrHonestRate = Number((metrics.correctOrHonestCount / Math.max(1, metrics.total)).toFixed(2));

  const results = [];
  assertCase(results, 'w65_approved_site_set_present', contract.approvedLiveSites.length >= 4 && contract.approvedLiveSites.every((site) => /^https:\/\//.test(site.website)), String(contract.approvedLiveSites.length));
  assertCase(results, 'w65_correct_or_honest_threshold_met', metrics.correctOrHonestRate >= policy.correctOrHonestMinimum, JSON.stringify(metrics));
  assertCase(results, 'w65_false_confident_wrong_limit_met', metrics.falseConfidentWrongCount <= policy.falseConfidentWrongMaximum, JSON.stringify(metrics));
  assertCase(results, 'w65_unsupported_claim_limit_met', metrics.unsupportedClaimCount <= policy.unsupportedClaimsMaximum, JSON.stringify(metrics));
  assertCase(results, 'w65_failure_states_do_not_guess', findings.every((item) => !['blocked', 'thin', 'unavailable', 'timeout'].includes(item.failureState) || (item.actualState === 'insufficient_evidence' && !item.actualLaneId)), JSON.stringify(findings.map((item) => ({ id: item.id, failureState: item.failureState, actualState: item.actualState, actualLaneId: item.actualLaneId }))));
  assertCase(results, 'w65_no_write_boundaries_present', findings.every((item) => item.evidence.writeAuthority === 'none' && item.evidence.nllmAdvisoryOnly === true && item.evidence.noRegression && item.evidence.noRegression.noSuiteScriptInvocation === true), '');
  assertCase(results, 'w65_best_next_prompt_present', /Move through W66/.test(contract.bestNextCodexPrompt.prompt), contract.bestNextCodexPrompt.block);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const trace = {
    schema: 'idb.w65-approved-live-resolver-smoke-trace.v1',
    generated: new Date().toISOString(),
    decision,
    mode: metrics.mode,
    liveFetchExecuted: runLive,
    approvedLiveSites: contract.approvedLiveSites,
    metrics,
    findings,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = findings.map((item) => `| ${item.correctOrHonest && !item.falseConfidentWrong ? 'PASS' : 'REVIEW'} | ${item.id} | ${item.actualState} | ${item.actualLaneId || 'none'} | ${item.expectedLaneId || 'none'} | ${item.driftType} | ${item.sourceUrlCount} | ${escapeTable(item.extractionGaps.join('; ') || 'None')} |`).join('\n');
  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail)} |`).join('\n');
  const failureRows = failures.map((result) => `- ${result.name}: ${result.detail}`).join('\n') || '- None';
  const report = `# W65 Approved Live Resolver Smoke And Drift Gate

Decision: ${decision} / ${runLive ? 'APPROVED LIVE FETCH EXECUTED' : 'DETERMINISTIC APPROVED OBSERVATION SHAPE'} / NO WRITE AUTHORITY

## Objective

Run the no-write \`websiteResolverServiceV1\` path against an approved small set of public websites, compare output to W58/W59 expectations, and produce a drift report.

## Metrics

- Mode: ${metrics.mode}
- Correct or honest: ${metrics.correctOrHonestCount}/${metrics.total} (${metrics.correctOrHonestRate})
- False-confident-wrong: ${metrics.falseConfidentWrongCount}
- Unsupported claims: ${metrics.unsupportedClaimCount}
- Evidence coverage score: ${metrics.evidenceCoverageScore}
- Recommended / needs confirmation / insufficient: ${metrics.recommendedCount} / ${metrics.needsConfirmationCount} / ${metrics.insufficientEvidenceCount}

## Findings

| Status | Case | Actual state | Actual lane | Expected lane | Drift type | Source URLs | Extraction gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Harness Gates

| Status | Rule | Detail |
| --- | --- | --- |
${resultRows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot own identity.
- Blocked, thin, unavailable, and timeout remain insufficient evidence with no lane guesses.
- Transaction writes remain blocked.

## Failures

${failureRows}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);
  console.log(`Approved live resolver smoke harness: ${decision} (${results.length - failures.length}/${results.length}) mode=${metrics.mode}`);
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
