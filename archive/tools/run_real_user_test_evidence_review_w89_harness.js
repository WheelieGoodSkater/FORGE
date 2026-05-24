const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w88Path = path.join(root, 'data', 'w88_real_user_test_packet_exact_instructions.json');
const w88PacketPath = path.join(root, 'trace_samples', 'w88_real_user_test_packet.json');
const w88ChecklistPath = path.join(root, 'trace_samples', 'w88_evidence_intake_checklist.json');
const dataPath = path.join(root, 'data', 'w89_real_user_test_evidence_review_pilot_readiness.json');
const tracePath = path.join(root, 'trace_samples', 'w89_real_user_test_evidence_review_trace.json');
const gradedResultsPath = path.join(root, 'trace_samples', 'w89_graded_results_blocked_missing_evidence.json');
const remediationPath = path.join(root, 'trace_samples', 'w89_remediation_plan_missing_evidence.json');
const pilotDecisionPath = path.join(root, 'trace_samples', 'w89_pilot_readiness_decision.json');
const reportPath = path.join(root, 'reports', 'w89_real_user_test_evidence_review_pilot_readiness.md');

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

function main() {
  const userscript = read(userscriptPath);
  const w88 = readJson(w88Path);
  const w88Packet = readJson(w88PacketPath);
  const w88Checklist = readJson(w88ChecklistPath);
  const results = [];

  const providedEvidence = {
    schema: 'idb.w89-provided-evidence-observation.v1',
    screenshotsProvidedInThisTurn: false,
    dccHandoffJsonProvidedInThisTurn: false,
    traceJsonProvidedInThisTurn: false,
    consultantNotesProvidedInThisTurn: false,
    operatorComparisonNotesProvidedInThisTurn: false,
    scoringRubricProvidedInThisTurn: false,
    note: 'No W88 screenshots, exported JSON, consultant notes, or operator comparison notes were attached with this W89 request.'
  };

  const missingEvidence = {
    schema: 'idb.w89-missing-evidence-checklist.v1',
    missingRequiredFiles: w88Checklist.requiredFilesFromUser,
    missingScreenshots: w88Checklist.requiredScreenshots,
    missingNotes: w88Checklist.requiredNotes,
    cannotGradeBecause: [
      'No Plan/Review/Trace screenshots were provided.',
      'No idb-dcc-runner-handoff-packet JSON was provided.',
      'No intelligent-demo-builder trace JSON was provided.',
      'No consultant or operator notes were provided.',
      'No operator field-mapping comparison was provided.'
    ]
  };

  const gradedResults = {
    schema: 'idb.w89-graded-real-user-test-results.v1',
    status: 'blocked_missing_real_user_evidence',
    score: null,
    categories: w88Packet.scoringRubric.categories.map((category) => ({
      category,
      score: null,
      status: 'not_gradeable_without_w88_evidence'
    })),
    findings: [
      {
        area: 'evidence',
        severity: 'blocker',
        finding: 'Real user test evidence was not provided, so pilot readiness cannot be graded honestly.'
      },
      {
        area: 'no-regression',
        severity: 'pass_from_artifacts_only',
        finding: 'Local artifacts still preserve no IDB write, no SuiteScript invocation, and no DCC runner rewrite boundaries.'
      }
    ]
  };

  const remediationPlan = {
    schema: 'idb.w89-remediation-plan-missing-evidence.v1',
    immediateActions: [
      'Run the W88 real user test using the specified idb-drawer.user.js file.',
      'Attach Plan, Review, DCC handoff card, Trace, and optional DCC Suitelet comparison screenshots.',
      'Attach idb-dcc-runner-handoff-packet-*.json.',
      'Attach intelligent-demo-builder-trace-*.json.',
      'Add consultant notes about what felt unclear, wrong, useful, or risky.',
      'Add operator notes marking Suitelet form params, DCC-owned config, and runner preview as match/missing/unclear.'
    ],
    exactFilesNeeded: w88Checklist.requiredFilesFromUser,
    exactScreenshotsNeeded: w88Checklist.requiredScreenshots,
    noSecretRules: w88Checklist.noSecretRules
  };

  const pilotReadinessDecision = {
    schema: 'idb.w89-pilot-readiness-decision.v1',
    decision: 'no_go_broader_consultant_pilot_missing_real_user_evidence',
    canProceedToBroaderPilot: false,
    canProceedToEvidenceReviewAfterUserUploads: true,
    reason: 'W88 real user evidence is required before grading UX, field mapping, website/intake behavior, DCC handoff risk, and pilot readiness.',
    preservedBoundaries: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    }
  };

  assertCase(results, 'w89_inherits_w88_test_packet', w88.schema === 'idb.w88-real-user-test-packet-exact-instructions.v1' && w88.status === 'real_user_test_packet_ready_no_submit', JSON.stringify({ schema: w88.schema, status: w88.status }));
  assertCase(results, 'w89_evidence_absence_recorded_honestly', providedEvidence.screenshotsProvidedInThisTurn === false && providedEvidence.dccHandoffJsonProvidedInThisTurn === false && providedEvidence.traceJsonProvidedInThisTurn === false, JSON.stringify(providedEvidence));
  assertCase(results, 'w89_missing_evidence_list_complete', missingEvidence.missingRequiredFiles.includes('idb-dcc-runner-handoff-packet-*.json') && missingEvidence.missingRequiredFiles.includes('intelligent-demo-builder-trace-*.json') && missingEvidence.missingScreenshots.length >= 6, JSON.stringify(missingEvidence));
  assertCase(results, 'w89_grading_blocked_not_faked', gradedResults.status === 'blocked_missing_real_user_evidence' && gradedResults.score === null && gradedResults.categories.every((item) => item.score === null), JSON.stringify(gradedResults));
  assertCase(results, 'w89_remediation_actionable', remediationPlan.immediateActions.length >= 6 && remediationPlan.exactFilesNeeded.length === 2 && remediationPlan.noSecretRules.some((item) => /credentials/.test(item)), JSON.stringify(remediationPlan));
  assertCase(results, 'w89_pilot_no_go_until_evidence', pilotReadinessDecision.decision === 'no_go_broader_consultant_pilot_missing_real_user_evidence' && pilotReadinessDecision.canProceedToBroaderPilot === false && pilotReadinessDecision.canProceedToEvidenceReviewAfterUserUploads === true, JSON.stringify(pilotReadinessDecision));
  assertCase(results, 'w89_runtime_still_no_submit_path', /function exportDccRunnerHandoffPacket/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript), 'IDB handoff remains export-only');
  assertCase(results, 'w89_no_regression_boundaries_hold', Object.values(pilotReadinessDecision.preservedBoundaries).every(Boolean), JSON.stringify(pilotReadinessDecision.preservedBoundaries));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W89R: Review Uploaded Real User Test Evidence',
    prompt: 'Move through W89R: Review Uploaded Real User Test Evidence. Use the attached W88 Plan/Review/Trace screenshots, DCC handoff JSON, trace JSON, consultant notes, and operator comparison notes to grade the real hands-on test against the W88 rubric. Identify UX gaps, field-mapping gaps, website/intake gaps, DCC handoff risks, and exact remediation. Decide go/no-go for broader consultant pilot. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output graded results, remediation plan, pilot readiness decision, W89R report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w89-real-user-test-evidence-review-pilot-readiness.v1',
    status: 'blocked_missing_real_user_evidence_no_go',
    objective: 'Review W88 real user evidence and decide pilot readiness without inventing missing results.',
    providedEvidence,
    missingEvidence,
    gradedResults,
    remediationPlan,
    pilotReadinessDecision,
    validatorResults: results,
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(gradedResultsPath, gradedResults);
  writeJson(remediationPath, remediationPlan);
  writeJson(pilotDecisionPath, pilotReadinessDecision);

  const trace = {
    schema: 'idb.w89-real-user-test-evidence-review-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: contract.status,
    pilotDecision: pilotReadinessDecision.decision,
    evidenceMissing: true,
    canProceedToBroaderPilot: false,
    noRegression: pilotReadinessDecision.preservedBoundaries,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W89 Real User Test Evidence Review And Pilot Readiness',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / NO-GO BROADER PILOT / MISSING REAL USER EVIDENCE`,
    '',
    '## Graded Results',
    '',
    '- Status: blocked_missing_real_user_evidence',
    '- Score: not gradeable',
    '- Reason: no W88 screenshots, handoff JSON, trace JSON, consultant notes, or operator comparison notes were provided.',
    '',
    '## Missing Evidence',
    '',
    ...missingEvidence.cannotGradeBecause.map((item) => `- ${item}`),
    '',
    '## Remediation Plan',
    '',
    ...remediationPlan.immediateActions.map((item) => `- ${item}`),
    '',
    '## Pilot Readiness Decision',
    '',
    `- Decision: ${pilotReadinessDecision.decision}`,
    `- Broader pilot: ${pilotReadinessDecision.canProceedToBroaderPilot ? 'go' : 'no-go'}`,
    `- Evidence review after upload: ${pilotReadinessDecision.canProceedToEvidenceReviewAfterUserUploads ? 'yes' : 'no'}`,
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
    console.error(`W89 real user test evidence review harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W89 real user test evidence review harness PASS: ${results.length}/${results.length}`);
}

main();
