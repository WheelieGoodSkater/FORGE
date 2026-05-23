const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w87Path = path.join(root, 'data', 'w87_execute_consultant_operator_pilot_dry_run.json');
const w87ResultsPath = path.join(root, 'trace_samples', 'w87_executed_dry_run_results.json');
const w87RemediationPath = path.join(root, 'trace_samples', 'w87_remediation_before_real_user_test.json');
const w86PilotScriptPath = path.join(root, 'trace_samples', 'w86_pilot_test_script.json');
const w86RubricPath = path.join(root, 'trace_samples', 'w86_consultant_operator_scoring_rubric.json');
const dataPath = path.join(root, 'data', 'w88_real_user_test_packet_exact_instructions.json');
const tracePath = path.join(root, 'trace_samples', 'w88_real_user_test_packet_trace.json');
const packetPath = path.join(root, 'trace_samples', 'w88_real_user_test_packet.json');
const exactInstructionsPath = path.join(root, 'trace_samples', 'w88_exact_test_instructions.json');
const evidenceChecklistPath = path.join(root, 'trace_samples', 'w88_evidence_intake_checklist.json');
const reportPath = path.join(root, 'reports', 'w88_real_user_test_packet_exact_instructions.md');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function main() {
  const userscript = read(userscriptPath);
  const w87 = readJson(w87Path);
  const w87Results = readJson(w87ResultsPath);
  const w87Remediation = readJson(w87RemediationPath);
  const pilotScript = readJson(w86PilotScriptPath);
  const rubric = readJson(w86RubricPath);
  const results = [];
  const stat = fs.statSync(userscriptPath);

  const fileToLoad = {
    label: 'Tampermonkey userscript',
    absolutePath: userscriptPath,
    sha256: sha256(userscriptPath),
    modifiedAt: stat.mtime.toISOString(),
    loadInstruction: 'Open Tampermonkey, replace the current Intelligent Demo Builder userscript with this file contents, then save and refresh NetSuite sandbox.'
  };

  const exactSalesRequestFields = {
    customer: pilotScript.testData.prospect,
    website: pilotScript.testData.website,
    conversationNotes: pilotScript.testData.salesNotes,
    scObjective: pilotScript.testData.scObjective,
    knownCompetitor: pilotScript.testData.knownCompetitor,
    decisionCriteria: pilotScript.testData.decisionCriteria,
    bantMeddicc: pilotScript.testData.bantMeddicc
  };

  const exactTestInstructions = {
    schema: 'idb.w88-exact-test-instructions.v1',
    status: 'ready_for_user_hands_on_test',
    fileToLoad,
    steps: [
      'Install or update the Tampermonkey script from the specified idb-drawer.user.js file.',
      'Open a NetSuite sandbox page and open Intelligent Demo Builder.',
      'Clear the current IDB session before starting.',
      'Enter the exact sales request fields from this packet.',
      'On Plan, verify the objective, classification/confidence, and next action.',
      'On Review, verify the DCC build packet bridge and DCC handoff export card.',
      'Confirm the scenario only if lane, proof anchor, scenario pack, and DCC build mode make sense.',
      'Export the DCC handoff JSON from Review.',
      'Export trace JSON from Trace.',
      'Do not submit or queue anything from IDB.',
      'Operator compares the exported handoff to DCC Suitelet/scheduled runner fields using W85 operator steps.',
      'Score the rubric and record go/no-go.'
    ],
    screenshotsToCapture: [
      'Plan tab after intake.',
      'Review tab top summary.',
      'Review DCC build packet bridge.',
      'Review DCC handoff export card with form/config/runner sections.',
      'Trace tab before export.',
      'DCC Suitelet sandbox comparison screen, if operator opens it for manual review.'
    ],
    exportsToAttach: [
      'idb-dcc-runner-handoff-packet-*.json',
      'intelligent-demo-builder-trace-*.json'
    ],
    operatorComparisonSteps: [
      'Open the exported DCC handoff JSON.',
      'Compare suiteletEntryPayload to DCC Suitelet form fields.',
      'Confirm DCC-owned config params are present/understood, without recording secrets.',
      'Compare scheduledRunnerPreview to DCC runner preview expectations.',
      'Confirm no IDB SuiteScript invocation and no IDB transaction writes.',
      'Confirm DCC owns item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics, and runner queue behavior.'
    ]
  };

  const evidenceIntakeChecklist = {
    schema: 'idb.w88-evidence-intake-checklist.v1',
    requiredFilesFromUser: exactTestInstructions.exportsToAttach,
    requiredScreenshots: exactTestInstructions.screenshotsToCapture,
    requiredNotes: [
      'Was the lane/scenario obvious enough to confirm?',
      'Was the DCC handoff export easy to find?',
      'Could the operator map fields in under 5 minutes?',
      'What looked confusing, wrong, generic, or risky?',
      'Did any IDB path appear to submit/write/queue?'
    ],
    noSecretRules: [
      'Do not include NetSuite credentials, tokens, or deployment secrets.',
      'Redact sensitive internal IDs if screenshots leave the sandbox team.',
      'Record config presence/absence, not secret values.'
    ]
  };

  const stopGoDecision = {
    schema: 'idb.w88-real-user-test-stop-go.v1',
    scoreBeforeRealRun: w87Results.scoringResults.average,
    runNowDecision: 'go_for_user_hands_on_test_no_submit',
    goIf: rubric.stopGoCriteria.goIf,
    noGoIf: rubric.stopGoCriteria.noGoIf.concat(w87Remediation.mustFixBeforeRealConsultantPilot),
    afterUserTestDecisionRule: 'Proceed to W89 only if evidence exports are attached, no submit/write path appears, average score is at least 4.0, and no category is below 3.'
  };

  const realUserTestPacket = {
    schema: 'idb.w88-real-user-test-packet.v1',
    status: 'ready_for_user_hands_on_test_no_submit',
    objective: 'Provide exact hands-on test instructions for the next real IDB-to-DCC handoff test.',
    fileToLoad,
    exactSalesRequestFields,
    exactTestInstructions,
    evidenceIntakeChecklist,
    scoringRubric: rubric,
    stopGoDecision,
    noRegression: {
      noSuiteScriptInvocationFromIdb: true,
      noDccRunnerMechanicsRewrite: true,
      noIdbTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    }
  };

  assertCase(results, 'w88_inherits_w87_ready_for_real_test', w87.schema === 'idb.w87-execute-consultant-operator-pilot-dry-run.v1' && w87.status === 'dry_run_pass_ready_for_real_user_test', JSON.stringify({ schema: w87.schema, status: w87.status }));
  assertCase(results, 'w88_file_to_load_exists_and_hash_present', fs.existsSync(fileToLoad.absolutePath) && fileToLoad.sha256.length === 64 && /idb-drawer\.user\.js$/.test(fileToLoad.absolutePath), JSON.stringify(fileToLoad));
  assertCase(results, 'w88_exact_sales_request_fields_complete', exactSalesRequestFields.customer === 'Summit Trail Supply' && exactSalesRequestFields.website === 'https://www.rei.com/' && exactSalesRequestFields.conversationNotes.length > 80 && exactSalesRequestFields.bantMeddicc.timeline, JSON.stringify(exactSalesRequestFields));
  assertCase(results, 'w88_screenshots_and_exports_specified', exactTestInstructions.screenshotsToCapture.length >= 6 && exactTestInstructions.exportsToAttach.includes('idb-dcc-runner-handoff-packet-*.json') && exactTestInstructions.exportsToAttach.includes('intelligent-demo-builder-trace-*.json'), JSON.stringify({ screenshots: exactTestInstructions.screenshotsToCapture, exports: exactTestInstructions.exportsToAttach }));
  assertCase(results, 'w88_operator_steps_and_rubric_present', exactTestInstructions.operatorComparisonSteps.length >= 6 && rubric.categories.includes('No-submit/no-write safety clarity') && rubric.categories.includes('DCC object-generation ownership clarity'), JSON.stringify({ operator: exactTestInstructions.operatorComparisonSteps, rubric: rubric.categories }));
  assertCase(results, 'w88_stop_go_preserves_boundaries', stopGoDecision.runNowDecision === 'go_for_user_hands_on_test_no_submit' && stopGoDecision.noGoIf.some((item) => /submits SuiteScript|SuiteScript invocation/.test(item)) && stopGoDecision.afterUserTestDecisionRule.includes('average score'), JSON.stringify(stopGoDecision));
  assertCase(results, 'w88_runtime_still_no_submit_path', /function exportDccRunnerHandoffPacket/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript), 'IDB handoff remains export-only');
  assertCase(results, 'w88_no_regression_boundaries_hold', realUserTestPacket.noRegression.noSuiteScriptInvocationFromIdb && realUserTestPacket.noRegression.noIdbTransactionWrites && realUserTestPacket.noRegression.dccOwnsObjectGeneration, JSON.stringify(realUserTestPacket.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W89: Review Real User Test Evidence And Decide Pilot Readiness',
    prompt: 'Move through W89: Review Real User Test Evidence And Decide Pilot Readiness. Use the user-provided W88 screenshots, DCC handoff JSON, trace JSON, consultant notes, operator comparison notes, and scoring rubric to grade the real hands-on test. Identify UX gaps, field-mapping gaps, website/intake gaps, DCC handoff risks, and exact remediation. Decide go/no-go for a broader consultant pilot. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output graded results, remediation plan, pilot readiness decision, W89 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w88-real-user-test-packet-exact-instructions.v1',
    status: 'real_user_test_packet_ready_no_submit',
    realUserTestPacket,
    validatorResults: results,
    bestNextCodexPrompt: bestNextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(packetPath, realUserTestPacket);
  writeJson(exactInstructionsPath, exactTestInstructions);
  writeJson(evidenceChecklistPath, evidenceIntakeChecklist);

  const trace = {
    schema: 'idb.w88-real-user-test-packet-trace.v1',
    generated: new Date().toISOString(),
    decision,
    status: contract.status,
    fileToLoad: {
      absolutePath: fileToLoad.absolutePath,
      sha256: fileToLoad.sha256,
      modifiedAt: fileToLoad.modifiedAt
    },
    runNowDecision: stopGoDecision.runNowDecision,
    noRegression: realUserTestPacket.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W88 Real User Test Packet And Exact Test Instructions',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / REAL USER TEST PACKET READY / NO IDB SUITESCRIPT INVOCATION`,
    '',
    '## File To Load',
    '',
    `- File: ${fileToLoad.absolutePath}`,
    `- SHA-256: ${fileToLoad.sha256}`,
    `- Modified: ${fileToLoad.modifiedAt}`,
    '',
    '## Exact Sales Request Fields',
    '',
    `- Customer: ${exactSalesRequestFields.customer}`,
    `- Website: ${exactSalesRequestFields.website}`,
    `- Conversation notes: ${exactSalesRequestFields.conversationNotes}`,
    `- SC objective: ${exactSalesRequestFields.scObjective}`,
    `- Known competitor: ${exactSalesRequestFields.knownCompetitor}`,
    `- Decision criteria: ${exactSalesRequestFields.decisionCriteria}`,
    '',
    '## Screenshots To Capture',
    '',
    ...exactTestInstructions.screenshotsToCapture.map((item) => `- ${item}`),
    '',
    '## Exports To Attach',
    '',
    ...exactTestInstructions.exportsToAttach.map((item) => `- ${item}`),
    '',
    '## Operator Comparison Steps',
    '',
    ...exactTestInstructions.operatorComparisonSteps.map((item) => `- ${item}`),
    '',
    '## Stop / Go',
    '',
    `- Run now decision: ${stopGoDecision.runNowDecision}`,
    `- After-test rule: ${stopGoDecision.afterUserTestDecisionRule}`,
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
    console.error(`W88 real user test packet harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W88 real user test packet harness PASS: ${results.length}/${results.length}`);
}

main();
