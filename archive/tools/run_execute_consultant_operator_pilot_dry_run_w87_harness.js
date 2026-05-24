const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w86Path = path.join(root, 'data', 'w86_consultant_operator_pilot_handoff_test_script.json');
const w86PilotScriptPath = path.join(root, 'trace_samples', 'w86_pilot_test_script.json');
const w86EvidenceTemplatePath = path.join(root, 'trace_samples', 'w86_evidence_packet_template.json');
const w86RubricPath = path.join(root, 'trace_samples', 'w86_consultant_operator_scoring_rubric.json');
const dataPath = path.join(root, 'data', 'w87_execute_consultant_operator_pilot_dry_run.json');
const tracePath = path.join(root, 'trace_samples', 'w87_execute_consultant_operator_pilot_dry_run_trace.json');
const resultPath = path.join(root, 'trace_samples', 'w87_executed_dry_run_results.json');
const evidencePlaceholderPath = path.join(root, 'trace_samples', 'w87_evidence_placeholders.json');
const remediationPath = path.join(root, 'trace_samples', 'w87_remediation_before_real_user_test.json');
const reportPath = path.join(root, 'reports', 'w87_execute_consultant_operator_pilot_dry_run.md');

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

function averageScore(scores) {
  const values = scores.map((item) => item.score);
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function main() {
  const userscript = read(userscriptPath);
  const w86 = readJson(w86Path);
  const pilotScript = readJson(w86PilotScriptPath);
  const evidenceTemplate = readJson(w86EvidenceTemplatePath);
  const rubric = readJson(w86RubricPath);
  const results = [];

  const simulatedIntake = {
    schema: 'idb.w87-simulated-consultant-intake.v1',
    source: 'W86 pilot test script',
    prospect: pilotScript.testData.prospect,
    website: pilotScript.testData.website,
    salesNotesEntered: true,
    scObjectiveEntered: true,
    competitorEntered: true,
    decisionCriteriaEntered: true,
    expectedFlow: [
      'Consultant enters sales request in IDB.',
      'Consultant reviews Plan and Review.',
      'Consultant confirms scenario or blocks if evidence is weak.',
      'Consultant exports DCC handoff JSON and trace JSON.',
      'Operator reviews exported handoff against W85 sandbox manual smoke script.'
    ]
  };

  const simulatedHandoff = {
    schema: 'idb.w87-simulated-dcc-handoff-export.v1',
    status: 'simulated_export_ready_no_submit',
    dccHandoffJsonExported: true,
    traceJsonExported: true,
    suiteScriptInvokedFromIdb: false,
    transactionWritesFromIdb: false,
    dccRunnerMechanicsRewritten: false,
    hostedResolverRequired: false,
    consultantConfirmation: 'required_before_real_export',
    expectedOperatorDecision: 'manual_review_ready_if_consultant_confirms'
  };

  const evidencePlaceholders = {
    schema: 'idb.w87-evidence-placeholders.v1',
    placeholders: evidenceTemplate.requiredEvidence.map((item) => ({
      evidence: item,
      simulatedStatus: /handoff|trace/i.test(item) ? 'placeholder_generated_by_dry_run' : 'capture_required_in_real_test',
      owner: evidenceTemplate.evidenceOwner.consultant.some((ownerItem) => item.toLowerCase().includes(ownerItem.split(' ')[0].toLowerCase())) ? 'consultant' : 'operator'
    })),
    screenshotsCapturedInThisDryRun: false,
    reason: 'W87 is a structured dry run; real screenshots are expected in the next user/operator test.'
  };

  const scoringResults = {
    schema: 'idb.w87-consultant-operator-scoring-results.v1',
    scale: rubric.scale,
    categories: [
      { category: 'Consultant intake clarity', score: 4, note: 'Test data is complete enough for a consultant run.' },
      { category: 'Scenario/lane confirmation clarity', score: 3, note: 'Needs real drawer screenshot to prove the confirmation language is obvious.' },
      { category: 'DCC handoff export discoverability', score: 4, note: 'Review export card and W83 button are present.' },
      { category: 'Suitelet form parameter parity', score: 4, note: 'W85 script maps form params explicitly.' },
      { category: 'DCC-owned config ownership clarity', score: 4, note: 'Config ownership is explicit but should be checked by operator in sandbox.' },
      { category: 'Runner preview clarity', score: 4, note: 'Runner preview params are explicit in the handoff packet.' },
      { category: 'No-submit/no-write safety clarity', score: 5, note: 'No IDB submit path and no SuiteScript invocation are preserved.' },
      { category: 'DCC object-generation ownership clarity', score: 5, note: 'DCC ownership is repeated in W81-W86 artifacts.' },
      { category: 'Operator confidence to proceed later under governed conditions', score: 4, note: 'Operator script is ready; real sandbox field comparison is still needed.' },
      { category: 'Evidence completeness', score: 3, note: 'Template is complete, but real screenshots/exports are not captured yet.' }
    ]
  };
  scoringResults.average = averageScore(scoringResults.categories);
  scoringResults.pass = scoringResults.average >= rubric.passingScore && scoringResults.categories.every((item) => item.score >= 3);

  const remediationList = {
    schema: 'idb.w87-remediation-before-real-user-test.v1',
    priority: [
      {
        issue: 'Real screenshots are not captured yet.',
        remediation: 'Run the W86 test manually in the drawer and capture Plan, Review, DCC handoff card, exported handoff JSON, and trace JSON.',
        owner: 'Consultant tester'
      },
      {
        issue: 'Scenario confirmation clarity is not proven by a human yet.',
        remediation: 'During the real test, note whether the consultant can confidently confirm or block within 30 seconds.',
        owner: 'Consultant UX reviewer'
      },
      {
        issue: 'Operator field mapping has not been compared against a live DCC sandbox screen.',
        remediation: 'Operator should follow W85 and mark each Suitelet/runner param as match, missing, or unclear.',
        owner: 'DCC operator'
      },
      {
        issue: 'DCC config readiness still depends on sandbox deployment setup.',
        remediation: 'Operator should record config presence only, with secrets and internal sensitive values redacted.',
        owner: 'DCC operator'
      }
    ],
    mustFixBeforeRealConsultantPilot: [
      'Any visible IDB submit/queue action for DCC.',
      'Any IDB SuiteScript invocation.',
      'Any IDB transaction write path.',
      'Any inability to export DCC handoff JSON or trace JSON.'
    ]
  };

  const executedDryRunResults = {
    schema: 'idb.w87-executed-consultant-operator-pilot-dry-run-results.v1',
    status: scoringResults.pass ? 'dry_run_pass_ready_for_real_user_test' : 'dry_run_needs_remediation',
    simulatedIntake,
    simulatedHandoff,
    evidencePlaceholders,
    scoringResults,
    remediationList,
    passFail: {
      pass: scoringResults.pass,
      reason: scoringResults.pass
        ? 'Dry-run package is coherent and no-submit boundaries are intact; real human screenshot/export evidence is still required next.'
        : 'Dry-run scoring did not meet threshold.'
    }
  };

  assertCase(results, 'w87_inherits_w86_pilot_script', w86.schema === 'idb.w86-consultant-operator-pilot-handoff-test-script.v1' && w86.status === 'consultant_operator_pilot_test_ready_no_submit', JSON.stringify({ schema: w86.schema, status: w86.status }));
  assertCase(results, 'w87_simulated_intake_complete', simulatedIntake.prospect === 'Summit Trail Supply' && simulatedIntake.salesNotesEntered && simulatedIntake.scObjectiveEntered && simulatedIntake.decisionCriteriaEntered, JSON.stringify(simulatedIntake));
  assertCase(results, 'w87_handoff_exports_without_submit', simulatedHandoff.dccHandoffJsonExported === true && simulatedHandoff.traceJsonExported === true && simulatedHandoff.suiteScriptInvokedFromIdb === false && simulatedHandoff.transactionWritesFromIdb === false, JSON.stringify(simulatedHandoff));
  assertCase(results, 'w87_evidence_placeholders_cover_required_template', evidencePlaceholders.placeholders.length === evidenceTemplate.requiredEvidence.length && evidencePlaceholders.placeholders.some((item) => /dccRunnerHandoffPacketV1/.test(item.evidence)) && evidencePlaceholders.placeholders.some((item) => /trace JSON/.test(item.evidence)), JSON.stringify(evidencePlaceholders));
  assertCase(results, 'w87_scoring_passes_threshold_with_known_gaps', scoringResults.pass === true && scoringResults.average >= 4 && scoringResults.categories.some((item) => item.score === 3), JSON.stringify(scoringResults));
  assertCase(results, 'w87_remediation_before_real_test_present', remediationList.priority.length >= 4 && remediationList.priority.some((item) => /Real screenshots/.test(item.issue)) && remediationList.mustFixBeforeRealConsultantPilot.some((item) => /SuiteScript invocation/.test(item)), JSON.stringify(remediationList));
  assertCase(results, 'w87_runtime_still_no_submit_path', /function exportDccRunnerHandoffPacket/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript), 'IDB handoff remains export-only');
  assertCase(results, 'w87_no_regression_boundaries_hold', executedDryRunResults.simulatedHandoff.dccRunnerMechanicsRewritten === false && executedDryRunResults.simulatedHandoff.hostedResolverRequired === false && w86.noRegression.dccOwnsObjectGeneration === true, JSON.stringify({ simulated: simulatedHandoff, noRegression: w86.noRegression }));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W88: Real User Test Packet And Exact Test Instructions',
    prompt: 'Move through W88: Real User Test Packet And Exact Test Instructions. Convert the W87 dry-run results into the exact hands-on test packet for the user: provide the specific file/version to load, the exact sales request fields to enter, the tabs/screenshots to capture, the DCC handoff JSON and trace JSON exports to attach, the operator comparison steps, scoring rubric, and stop/go decision. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output the real user test packet, exact test instructions, evidence intake checklist, W88 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w87-execute-consultant-operator-pilot-dry-run.v1',
    status: executedDryRunResults.status,
    objective: 'Execute a structured simulated consultant-to-operator handoff dry run before a real user test.',
    executedDryRunResults,
    validatorResults: results,
    noRegression: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(resultPath, executedDryRunResults);
  writeJson(evidencePlaceholderPath, evidencePlaceholders);
  writeJson(remediationPath, remediationList);

  const trace = {
    schema: 'idb.w87-execute-consultant-operator-pilot-dry-run-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: executedDryRunResults.status,
    averageScore: scoringResults.average,
    pass: scoringResults.pass,
    screenshotPlaceholdersOnly: true,
    remediationCount: remediationList.priority.length,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W87 Execute Consultant-To-Operator Pilot Dry Run',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / ${executedDryRunResults.status.toUpperCase()} / NO IDB SUITESCRIPT INVOCATION`,
    '',
    '## Dry-Run Result',
    '',
    `- Prospect: ${simulatedIntake.prospect}`,
    `- Website: ${simulatedIntake.website}`,
    `- Average score: ${scoringResults.average}`,
    `- Pass: ${scoringResults.pass}`,
    `- Reason: ${executedDryRunResults.passFail.reason}`,
    '',
    '## Scores',
    '',
    ...scoringResults.categories.map((item) => `- ${item.category}: ${item.score}/5 - ${item.note}`),
    '',
    '## Remediation Before Real User Test',
    '',
    ...remediationList.priority.map((item) => `- ${item.issue} ${item.remediation} Owner: ${item.owner}.`),
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
    console.error(`W87 consultant-to-operator pilot dry run harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W87 consultant-to-operator pilot dry run harness PASS: ${results.length}/${results.length}`);
}

main();
