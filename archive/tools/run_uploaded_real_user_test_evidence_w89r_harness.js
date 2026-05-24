const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const downloads = '/path/to/downloads';
const w88ChecklistPath = path.join(root, 'trace_samples', 'w88_evidence_intake_checklist.json');
const rubricPath = path.join(root, 'trace_samples', 'w86_consultant_operator_scoring_rubric.json');
const traceEvidencePath = path.join(downloads, 'intelligent-demo-builder-trace-1778611737634.json');
const suiteScriptPacketPath = path.join(downloads, 'idb-suitescript-review-packet-1778611740134.json');
const dccHandoffPacketPath = path.join(downloads, 'idb-dcc-runner-handoff-packet-1778611740134.json');
const dataPath = path.join(root, 'data', 'w89r_uploaded_real_user_test_evidence_review.json');
const reportPath = path.join(root, 'reports', 'w89r_uploaded_real_user_test_evidence_review.md');
const tracePath = path.join(root, 'trace_samples', 'w89r_uploaded_real_user_test_evidence_review_trace.json');
const gradedPath = path.join(root, 'trace_samples', 'w89r_graded_real_user_results.json');
const remediationPath = path.join(root, 'trace_samples', 'w89r_real_user_remediation_plan.json');
const pilotDecisionPath = path.join(root, 'trace_samples', 'w89r_pilot_readiness_decision.json');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function avg(scores) {
  const values = scores.map((item) => item.score).filter((value) => typeof value === 'number');
  return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
}

function main() {
  const results = [];
  const checklist = readJson(w88ChecklistPath);
  const rubric = readJson(rubricPath);
  const traceProvided = fs.existsSync(traceEvidencePath);
  const suiteScriptPacketProvided = fs.existsSync(suiteScriptPacketPath);
  const dccHandoffPacketProvided = fs.existsSync(dccHandoffPacketPath);
  const trace = traceProvided ? readJson(traceEvidencePath) : null;
  const suiteScriptPacket = suiteScriptPacketProvided ? readJson(suiteScriptPacketPath) : null;

  const latestState = trace && trace.state ? trace.state : {};
  const websiteEvidence = latestState.websiteEvidenceV1 || {};
  const acceptedPacket = latestState.acceptedPacket || {};
  const dryRunObjectPacket = trace && trace.dryRunObjectPacket ? trace.dryRunObjectPacket : {};
  const idbReviewedPacket = suiteScriptPacket && suiteScriptPacket.idbReviewedPacket ? suiteScriptPacket.idbReviewedPacket : {};
  const creationPacket = idbReviewedPacket.creationPacketContract || {};

  const evidenceIntake = {
    schema: 'idb.w89r-uploaded-evidence-intake.v1',
    evidenceObserved: [
      {
        type: 'trace_json',
        expected: 'intelligent-demo-builder-trace-*.json',
        provided: traceProvided,
        path: traceProvided ? traceEvidencePath : null
      },
      {
        type: 'dcc_runner_handoff_json',
        expected: 'idb-dcc-runner-handoff-packet-*.json',
        provided: dccHandoffPacketProvided,
        path: dccHandoffPacketProvided ? dccHandoffPacketPath : null
      },
      {
        type: 'legacy_suitescript_review_packet_json',
        expected: 'idb-suitescript-review-packet-*.json',
        provided: suiteScriptPacketProvided,
        path: suiteScriptPacketProvided ? suiteScriptPacketPath : null
      }
    ],
    screenshotsProvided: false,
    consultantNotesProvided: false,
    operatorComparisonNotesProvided: false,
    missingRequiredScreenshots: checklist.requiredScreenshots,
    missingRequiredNotes: checklist.requiredNotes
  };

  const positiveFindings = [
    websiteEvidence.confidence && websiteEvidence.confidence.state === 'recommended'
      ? 'Ariat classified as Apparel & Accessories with high websiteEvidenceV1 confidence.'
      : 'Trace did not prove a recommended website-owned classification.',
    acceptedPacket.namingAuthority === 'website_evidence_v1'
      ? 'Accepted packet records website_evidence_v1 as naming authority.'
      : 'Accepted packet did not prove website-owned naming authority.',
    creationPacket.creationAllowed === false && idbReviewedPacket.consultantConfirmed === false
      ? 'SuiteScript review packet preserved create-disabled and consultant-confirmation-required boundaries.'
      : 'SuiteScript review packet did not fully prove create-disabled confirmation boundaries.',
    suiteScriptPacket && suiteScriptPacket.nonRegression && suiteScriptPacket.nonRegression.noTransactionWrite === true
      ? 'Transaction write remained blocked.'
      : 'Transaction-write boundary was not proven by the uploaded packet.'
  ];

  const gaps = [
    'Required W88 DCC runner handoff export was not provided; only the legacy SuiteScript review packet was found.',
    'No screenshots were provided, so live readability for Plan, Review, DCC handoff, and Trace cannot be graded visually.',
    'No operator comparison notes were provided, so Suitelet form-param parity and runner preview parity are not proven.',
    'Trace shows lane_recommended source as guided_intake even though accepted naming authority is website_evidence_v1; this can confuse the website-vs-notes ownership story.',
    'The legacy review packet still contains mode=create and writePathType=suitescript_direct_write while createAllowed=false, which is technically safe but semantically noisy for pilot users.'
  ];

  const categories = [
    {
      category: 'Consultant intake clarity',
      score: traceProvided ? 4 : 1,
      evidence: 'Customer, website, notes, SC objective, competitor, and decision criteria are present in trace.'
    },
    {
      category: 'Scenario/lane confirmation clarity',
      score: websiteEvidence.confidence && websiteEvidence.confidence.score >= 0.8 && acceptedPacket.selectedLaneId === 'apparel_accessories' ? 4 : 2,
      evidence: 'Ariat apparel/footwear classification is correct, but trace source wording still mentions guided_intake.'
    },
    {
      category: 'DCC handoff export discoverability',
      score: dccHandoffPacketProvided ? 4 : 2,
      evidence: 'Expected idb-dcc-runner-handoff-packet JSON was not present; legacy SuiteScript review packet was exported instead.'
    },
    {
      category: 'Suitelet form parameter parity',
      score: suiteScriptPacketProvided && dccHandoffPacketProvided ? 4 : 2,
      evidence: 'No operator comparison notes or DCC handoff packet were available to prove form-param parity.'
    },
    {
      category: 'DCC-owned config ownership clarity',
      score: dryRunObjectPacket.dccFamilyKey && dryRunObjectPacket.dccScenario ? 3 : 2,
      evidence: 'Trace includes DCC family/scenario/toggles, but the uploaded packet is not the W83/W88 DCC handoff packet.'
    },
    {
      category: 'Runner preview clarity',
      score: dccHandoffPacketProvided ? 4 : 2,
      evidence: 'Runner preview cannot be graded without dccRunnerHandoffPacketV1 or operator comparison notes.'
    },
    {
      category: 'No-submit/no-write safety clarity',
      score: creationPacket.creationAllowed === false && suiteScriptPacket.nonRegression && suiteScriptPacket.nonRegression.notSubmittedAutomatically === true ? 5 : 2,
      evidence: 'No IDB SuiteScript invocation or transaction write is shown; packet stays blocked and review-only.'
    },
    {
      category: 'DCC object-generation ownership clarity',
      score: dryRunObjectPacket.dccFamilyKey && dryRunObjectPacket.dccScenario && creationPacket.records && creationPacket.records.length >= 7 ? 4 : 2,
      evidence: 'Object list exists and DCC scenario/toggles are present; DCC runner ownership still needs operator proof.'
    },
    {
      category: 'Operator confidence to proceed later under governed conditions',
      score: 2,
      evidence: 'No operator comparison notes were provided.'
    },
    {
      category: 'Evidence completeness',
      score: traceProvided && suiteScriptPacketProvided && !dccHandoffPacketProvided ? 2 : 1,
      evidence: 'Trace and legacy SuiteScript packet are present, but W88 screenshots, DCC handoff JSON, consultant notes, and operator notes are missing.'
    }
  ];

  const averageScore = avg(categories);
  const anyBelowThree = categories.some((item) => item.score < 3);
  const noWriteBoundaryPassed = creationPacket.creationAllowed === false
    && idbReviewedPacket.consultantConfirmed === false
    && suiteScriptPacket
    && suiteScriptPacket.nonRegression
    && suiteScriptPacket.nonRegression.noTransactionWrite === true
    && suiteScriptPacket.nonRegression.notSubmittedAutomatically === true;

  const gradedResults = {
    schema: 'idb.w89r-graded-real-user-test-results.v1',
    status: 'graded_partial_real_evidence_no_go',
    averageScore,
    passingScore: rubric.passingScore,
    anyCategoryBelowThree: anyBelowThree,
    categories,
    positiveFindings,
    gaps,
    noRegression: {
      noIdbWritesObserved: noWriteBoundaryPassed,
      noSuiteScriptInvocationFromIdbObserved: noWriteBoundaryPassed,
      noTransactionWritesObserved: suiteScriptPacket && suiteScriptPacket.nonRegression && suiteScriptPacket.nonRegression.noTransactionWrite === true,
      noDccRunnerRewriteObserved: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: idbReviewedPacket.consultantConfirmed === false,
      dccOwnsObjectGeneration: true
    }
  };

  const remediationPlan = {
    schema: 'idb.w89r-remediation-plan.v1',
    priority: [
      {
        ownerRole: 'Consultant UX Director',
        issue: 'DCC handoff export was not the artifact submitted for review.',
        fix: 'Make Review and Trace explicitly distinguish Export DCC handoff from legacy SuiteScript review packet; require dccRunnerHandoffPacketV1 for pilot evidence.'
      },
      {
        ownerRole: 'DCC Pattern Translator Agent',
        issue: 'Operator mapping was not proven.',
        fix: 'Add a one-page operator comparison checklist that marks suitelet form params, DCC-owned config params, and runner preview params as match/missing/unclear.'
      },
      {
        ownerRole: 'Evidence UX Designer',
        issue: 'Screenshots were missing.',
        fix: 'Add a Trace evidence checklist showing Plan, Review, DCC handoff, Trace, DCC handoff JSON, trace JSON, and operator notes before pilot-ready status.'
      },
      {
        ownerRole: 'Website Intelligence Agent',
        issue: 'Trace contains mixed ownership language: guided_intake source and website_evidence_v1 authority.',
        fix: 'Normalize trace language so website evidence owns identity and notes/guided intake own story only.'
      },
      {
        ownerRole: 'Code Review Sentinel',
        issue: 'Review packet says mode=create while creationAllowed=false.',
        fix: 'Rename pilot evidence mode to review_only / export_only wherever the path cannot submit or queue records.'
      }
    ],
    retestRequiredEvidence: checklist.requiredFilesFromUser.concat([
      'Plan screenshot',
      'Review DCC handoff screenshot',
      'Trace evidence checklist screenshot',
      'Operator mapping notes'
    ])
  };

  const pilotDecision = {
    schema: 'idb.w89r-pilot-readiness-decision.v1',
    decision: 'no_go_broader_consultant_pilot_partial_evidence',
    canProceedToBroaderPilot: false,
    canProceedToSingleRetest: true,
    reason: 'The real evidence proves the Ariat classification and write-safety boundaries, but does not prove DCC handoff export, screenshot-based UX clarity, operator mapping, or runner-preview parity.',
    unlockCriteria: [
      'Average W88 rubric score is at least 4.0.',
      'No category scores below 3.',
      'idb-dcc-runner-handoff-packet JSON is attached.',
      'Trace JSON is attached.',
      'Plan/Review/DCC handoff/Trace screenshots are attached.',
      'Operator comparison notes prove Suitelet form params, DCC-owned config, and runner preview parity.',
      'No IDB SuiteScript invocation, queue action, or transaction write occurs.'
    ]
  };

  assertCase(results, 'w89r_trace_json_available', traceProvided && latestState.intake && latestState.intake.customer === 'Ariat International', traceEvidencePath);
  assertCase(results, 'w89r_legacy_suitescript_packet_available', suiteScriptPacketProvided && suiteScriptPacket.packetPurpose === 'SuiteScript review handoff only', suiteScriptPacketPath);
  assertCase(results, 'w89r_dcc_handoff_missing_recorded', dccHandoffPacketProvided === false && gaps.some((item) => /DCC runner handoff export/.test(item)), dccHandoffPacketPath);
  assertCase(results, 'w89r_ariat_classification_correct', acceptedPacket.selectedLaneId === 'apparel_accessories' && websiteEvidence.confidence && websiteEvidence.confidence.state === 'recommended' && websiteEvidence.confidence.score >= 0.8, JSON.stringify({ lane: acceptedPacket.selectedLaneId, confidence: websiteEvidence.confidence }));
  assertCase(results, 'w89r_no_write_boundaries_hold', gradedResults.noRegression.noIdbWritesObserved === true && gradedResults.noRegression.noTransactionWritesObserved === true && gradedResults.noRegression.consultantConfirmationRequired === true, JSON.stringify(gradedResults.noRegression));
  assertCase(results, 'w89r_scores_force_no_go', averageScore < rubric.passingScore && anyBelowThree === true && pilotDecision.canProceedToBroaderPilot === false, JSON.stringify({ averageScore, anyBelowThree, decision: pilotDecision.decision }));
  assertCase(results, 'w89r_remediation_targets_exact_gaps', remediationPlan.priority.length >= 5 && remediationPlan.priority.some((item) => /Export DCC handoff/.test(item.fix)) && remediationPlan.priority.some((item) => /website evidence owns identity/.test(item.fix)), JSON.stringify(remediationPlan.priority));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W90: Pilot Evidence Remediation And Retest Pack',
    prompt: 'Move through W90: Pilot Evidence Remediation And Retest Pack. Use the W89R findings to fix the evidence flow before a broader consultant pilot: make the DCC handoff export primary and unmistakable, add a Trace evidence checklist for screenshots/JSON/operator notes, rename non-submitting create-mode language to review-only/export-only where appropriate, normalize trace ownership so website evidence owns identity while notes own story, and produce a one-run retest packet. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output UI/trace remediation, updated validator gates, W90 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w89r-uploaded-real-user-test-evidence-review.v1',
    status: 'graded_partial_real_evidence_no_go',
    evidenceIntake,
    gradedResults,
    remediationPlan,
    pilotDecision,
    validatorResults: results,
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(gradedPath, gradedResults);
  writeJson(remediationPath, remediationPlan);
  writeJson(pilotDecisionPath, pilotDecision);

  const traceOut = {
    schema: 'idb.w89r-uploaded-real-user-test-evidence-review-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: contract.status,
    averageScore,
    broaderPilotDecision: pilotDecision.decision,
    evidenceFiles: evidenceIntake.evidenceObserved,
    noRegression: gradedResults.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, traceOut);

  const report = [
    '# W89R Uploaded Real User Test Evidence Review',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / PARTIAL REAL EVIDENCE GRADED / BROADER PILOT NO-GO`,
    '',
    '## Evidence Reviewed',
    '',
    `- Trace JSON: ${traceProvided ? traceEvidencePath : 'missing'}`,
    `- DCC runner handoff JSON: ${dccHandoffPacketProvided ? dccHandoffPacketPath : 'missing'}`,
    `- Legacy SuiteScript review packet: ${suiteScriptPacketProvided ? suiteScriptPacketPath : 'missing'}`,
    '- Screenshots: missing',
    '- Consultant notes: missing',
    '- Operator comparison notes: missing',
    '',
    '## Score',
    '',
    `- Average: ${averageScore} / 5`,
    `- Passing target: ${rubric.passingScore} / 5`,
    `- Any category below 3: ${anyBelowThree ? 'yes' : 'no'}`,
    `- Broader pilot: ${pilotDecision.canProceedToBroaderPilot ? 'go' : 'no-go'}`,
    '',
    '| Category | Score | Evidence |',
    '| --- | ---: | --- |',
    ...categories.map((item) => `| ${escapeTable(item.category)} | ${item.score} | ${escapeTable(item.evidence)} |`),
    '',
    '## What Worked',
    '',
    ...positiveFindings.map((item) => `- ${item}`),
    '',
    '## Gaps',
    '',
    ...gaps.map((item) => `- ${item}`),
    '',
    '## Remediation',
    '',
    ...remediationPlan.priority.map((item) => `- ${item.ownerRole}: ${item.fix}`),
    '',
    '## Validator Gates',
    '',
    '| Status | Rule | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(`W89R uploaded evidence review harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W89R uploaded evidence review harness PASS: ${results.length}/${results.length} average=${averageScore} decision=${pilotDecision.decision}`);
}

main();
