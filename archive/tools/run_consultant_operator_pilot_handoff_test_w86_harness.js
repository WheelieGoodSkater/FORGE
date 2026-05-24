const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w85Path = path.join(root, 'data', 'w85_dcc_sandbox_manual_handoff_parameter_smoke.json');
const w85SmokeScriptPath = path.join(root, 'trace_samples', 'w85_sandbox_manual_handoff_smoke_script.json');
const w85EvidencePath = path.join(root, 'trace_samples', 'w85_expected_evidence_captures.json');
const dataPath = path.join(root, 'data', 'w86_consultant_operator_pilot_handoff_test_script.json');
const tracePath = path.join(root, 'trace_samples', 'w86_consultant_operator_pilot_handoff_test_trace.json');
const pilotScriptPath = path.join(root, 'trace_samples', 'w86_pilot_test_script.json');
const evidenceTemplatePath = path.join(root, 'trace_samples', 'w86_evidence_packet_template.json');
const rubricPath = path.join(root, 'trace_samples', 'w86_consultant_operator_scoring_rubric.json');
const reportPath = path.join(root, 'reports', 'w86_consultant_operator_pilot_handoff_test_script.md');

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
  const w85 = readJson(w85Path);
  const w85SmokeScript = readJson(w85SmokeScriptPath);
  const w85Evidence = readJson(w85EvidencePath);
  const results = [];

  const testData = {
    schema: 'idb.w86-consultant-sales-request-test-data.v1',
    prospect: 'Summit Trail Supply',
    website: 'https://www.rei.com/',
    salesNotes: [
      'Outdoor gear retailer expanding seasonal private-label assortment.',
      'Buyer needs confidence in style/color availability, replenishment timing, store/channel allocation, and customer promise before summer launch.',
      'Current spreadsheet process is slow and inventory availability differs by channel.',
      'Decision team wants a concise proof path, not a broad manufacturing demo.'
    ].join(' '),
    scObjective: 'Prepare a concise proof story showing how NetSuite can support seasonal assortment readiness, inventory availability, replenishment, allocation, and channel promise without forcing the prospect into manufacturing language.',
    knownCompetitor: 'Current spreadsheets and disconnected inventory tools',
    decisionCriteria: 'Clear path from customer/prospect context to item assortment readiness, allocation/replenishment, and Sales Order/customer promise impact.',
    bantMeddicc: {
      budget: 'Budget not confirmed; discovery should quantify manual planning and inventory availability pain.',
      authority: 'VP Operations plus merchandising lead likely influence decision.',
      need: 'Need is seasonal assortment readiness and channel inventory promise.',
      timeline: 'Wants directional fit within 30 days before deeper process demo.',
      metrics: 'Reduce assortment planning effort and avoid missed customer promise during seasonal launch.',
      economicBuyer: 'VP Operations / CFO not yet confirmed.',
      decisionProcess: 'Initial SC proof, then stakeholder review.',
      decisionCriteria: 'Fast evidence that NetSuite can connect item/variant readiness, replenishment, and customer promise.',
      paperProcess: 'Unknown.',
      identifyPain: 'Spreadsheet-driven inventory and channel promise disconnects.',
      champion: 'Operations manager requested the proof.'
    },
    expectedConsultantConfirmation: {
      lane: 'Apparel & Accessories or Dealer Hardgoods style/SKU path, depending on evidence displayed by IDB.',
      proofAnchor: 'Style / SKU Matrix or equivalent DCC scenario pack',
      buildMode: 'review_only_no_submit',
      caution: 'Consultant must confirm scenario before export; weak website evidence should not silently override.'
    }
  };

  const pilotTestScript = {
    schema: 'idb.w86-consultant-to-operator-pilot-test-script.v1',
    status: 'pilot_handoff_test_ready_no_submit',
    objective: 'Run a realistic consultant-to-operator IDB-to-DCC handoff test without IDB invoking SuiteScript.',
    testData,
    consultantInstructions: [
      'Open any NetSuite sandbox page with the IDB drawer installed.',
      'Enter the test prospect, website, sales notes, SC objective, competitor, and decision criteria.',
      'Review Plan and Review tabs; confirm the scenario only if the selected lane, proof anchor, naming hints, and DCC build mode make sense.',
      'Export the DCC handoff packet from Review.',
      'Export trace JSON after the handoff packet.',
      'Do not attempt to submit to DCC from IDB.'
    ],
    operatorInstructions: [
      'Open the exported DCC handoff packet.',
      'Use the W85 sandbox manual smoke script to compare Suitelet form params, DCC-owned config, and runner preview params.',
      'Open DCC Suitelet sandbox only for manual comparison; do not submit/queue from this pilot unless a later governed block explicitly authorizes it.',
      'Record field parity, config readiness, runner preview clarity, and any ambiguity.',
      'Score the rubric and attach required evidence.'
    ],
    stopConditions: [
      'IDB tries to invoke SuiteScript.',
      'IDB exposes a submit/queue DCC action.',
      'Transaction writes are enabled from IDB.',
      'Consultant cannot tell what must be confirmed before export.',
      'Operator cannot map handoff params to DCC fields.',
      'DCC object-generation ownership becomes ambiguous.'
    ],
    linkedW85SmokeScript: {
      schema: w85SmokeScript.schema,
      status: w85SmokeScript.status,
      operatorMode: w85SmokeScript.operatorMode,
      stepCount: w85SmokeScript.steps.length
    }
  };

  const evidencePacketTemplate = {
    schema: 'idb.w86-evidence-packet-template.v1',
    requiredEvidence: [
      'Screenshot: IDB Plan tab after intake.',
      'Screenshot: IDB Review tab showing DCC handoff export card.',
      'Export: dccRunnerHandoffPacketV1 JSON.',
      'Export: IDB trace JSON.',
      'Screenshot/notes: DCC Suitelet sandbox field parity review.',
      'Screenshot/notes: DCC-owned deployment config readiness, with secrets redacted.',
      'Screenshot/notes: scheduled runner preview comparison.',
      'Completed operator scoring rubric.',
      'Consultant notes: what felt unclear, slow, wrong, or useful.',
      'Operator notes: what could block a governed DCC handoff.'
    ],
    inheritedW85Evidence: w85Evidence.requiredCaptures,
    noSecretRules: w85Evidence.noSecretRules,
    evidenceOwner: {
      consultant: ['Plan screenshot', 'Review screenshot', 'DCC handoff JSON', 'trace JSON', 'consultant notes'],
      operator: ['Suitelet parity review', 'config readiness review', 'runner preview comparison', 'scoring rubric', 'operator notes']
    }
  };

  const scoringRubric = {
    schema: 'idb.w86-consultant-operator-scoring-rubric.v1',
    scale: '1-5',
    passingScore: 4,
    categories: [
      'Consultant intake clarity',
      'Scenario/lane confirmation clarity',
      'DCC handoff export discoverability',
      'Suitelet form parameter parity',
      'DCC-owned config ownership clarity',
      'Runner preview clarity',
      'No-submit/no-write safety clarity',
      'DCC object-generation ownership clarity',
      'Operator confidence to proceed later under governed conditions',
      'Evidence completeness'
    ],
    stopGoCriteria: {
      goIf: [
        'Average score is at least 4.0.',
        'No category scores below 3.',
        'No IDB SuiteScript invocation or transaction write occurs.',
        'Operator can map handoff to DCC Suitelet in under 5 minutes.',
        'DCC object-generation ownership remains clear.'
      ],
      noGoIf: [
        'Any IDB path submits SuiteScript or creates/queues records.',
        'Consultant cannot confirm scenario confidently.',
        'Operator cannot map required params to DCC fields.',
        'DCC-owned config ownership is unclear.',
        'Evidence packet is missing handoff JSON or trace JSON.'
      ]
    }
  };

  assertCase(results, 'w86_inherits_w85_manual_sandbox_smoke', w85.schema === 'idb.w85-dcc-sandbox-manual-handoff-parameter-smoke.v1' && w85.status === 'sandbox_manual_handoff_parameter_smoke_ready_no_submit', JSON.stringify({ schema: w85.schema, status: w85.status }));
  assertCase(results, 'w86_test_data_realistic_sales_request_present', testData.prospect && testData.website && /seasonal/.test(testData.salesNotes) && testData.bantMeddicc.timeline, JSON.stringify(testData));
  assertCase(results, 'w86_consultant_instructions_export_trace_and_handoff', pilotTestScript.consultantInstructions.some((item) => /Export the DCC handoff packet/.test(item)) && pilotTestScript.consultantInstructions.some((item) => /Export trace JSON/.test(item)), JSON.stringify(pilotTestScript.consultantInstructions));
  assertCase(results, 'w86_operator_instructions_use_w85_without_submit', pilotTestScript.operatorInstructions.some((item) => /Use the W85 sandbox manual smoke script/.test(item)) && pilotTestScript.operatorInstructions.some((item) => /do not submit\/queue/.test(item)), JSON.stringify(pilotTestScript.operatorInstructions));
  assertCase(results, 'w86_evidence_template_complete', evidencePacketTemplate.requiredEvidence.length >= 10 && evidencePacketTemplate.requiredEvidence.some((item) => /dccRunnerHandoffPacketV1/.test(item)) && evidencePacketTemplate.requiredEvidence.some((item) => /trace JSON/.test(item)), JSON.stringify(evidencePacketTemplate.requiredEvidence));
  assertCase(results, 'w86_scoring_rubric_covers_safety_and_dcc_ownership', scoringRubric.categories.includes('No-submit/no-write safety clarity') && scoringRubric.categories.includes('DCC object-generation ownership clarity') && scoringRubric.stopGoCriteria.noGoIf.some((item) => /submits SuiteScript/.test(item)), JSON.stringify(scoringRubric));
  assertCase(results, 'w86_runtime_still_no_dcc_submit_path', /function exportDccRunnerHandoffPacket/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && !/exportDccRunnerHandoffPacket[\s\S]{0,1200}fetch\(/.test(userscript), 'IDB handoff remains export-only');
  assertCase(results, 'w86_stop_conditions_preserve_no_regression', pilotTestScript.stopConditions.some((item) => /invoke SuiteScript/.test(item)) && pilotTestScript.stopConditions.some((item) => /Transaction writes/.test(item)) && pilotTestScript.stopConditions.some((item) => /DCC object-generation ownership/.test(item)), JSON.stringify(pilotTestScript.stopConditions));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextPrompt = {
    block: 'W87: Execute Consultant-To-Operator Pilot Dry Run',
    prompt: 'Move through W87: Execute Consultant-To-Operator Pilot Dry Run. Use the W86 pilot test script to run a simulated consultant-to-operator handoff using the provided realistic sales request: complete IDB intake, confirm or block the scenario, export DCC handoff JSON and trace JSON, then evaluate the handoff against the W86 evidence template and rubric without invoking SuiteScript from IDB. Capture pass/fail, screenshots/trace placeholders, scoring results, UX gaps, operator mapping gaps, and exact remediation before a real user test. Preserve no IDB writes, no DCC runner rewrite, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output executed dry-run results, remediation list, W87 report, validator gates, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w86-consultant-operator-pilot-handoff-test-script.v1',
    status: 'consultant_operator_pilot_test_ready_no_submit',
    objective: 'Package the IDB-to-DCC flow into a real consultant-to-operator handoff test with evidence, scoring, and no-regression gates.',
    pilotTestScript,
    evidencePacketTemplate,
    scoringRubric,
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
  writeJson(pilotScriptPath, pilotTestScript);
  writeJson(evidenceTemplatePath, evidencePacketTemplate);
  writeJson(rubricPath, scoringRubric);

  const trace = {
    schema: 'idb.w86-consultant-operator-pilot-handoff-test-trace.v1',
    generated: new Date().toISOString(),
    decision,
    testProspect: testData.prospect,
    consultantInstructionCount: pilotTestScript.consultantInstructions.length,
    operatorInstructionCount: pilotTestScript.operatorInstructions.length,
    requiredEvidenceCount: evidencePacketTemplate.requiredEvidence.length,
    rubricCategoryCount: scoringRubric.categories.length,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: bestNextPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W86 Consultant-To-Operator Pilot Handoff Test Script',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / PILOT HANDOFF TEST READY / NO IDB SUITESCRIPT INVOCATION`,
    '',
    '## Test Data',
    '',
    `- Prospect: ${testData.prospect}`,
    `- Website: ${testData.website}`,
    `- SC objective: ${testData.scObjective}`,
    '',
    '## Consultant Instructions',
    '',
    ...pilotTestScript.consultantInstructions.map((item) => `- ${item}`),
    '',
    '## Operator Instructions',
    '',
    ...pilotTestScript.operatorInstructions.map((item) => `- ${item}`),
    '',
    '## Evidence Packet',
    '',
    ...evidencePacketTemplate.requiredEvidence.map((item) => `- ${item}`),
    '',
    '## Scoring Rubric',
    '',
    ...scoringRubric.categories.map((item) => `- ${item}`),
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
    console.error(`W86 consultant-to-operator pilot handoff test harness FAIL: ${failures.length} failure(s)`);
    failures.forEach((failure) => console.error(`- ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }

  console.log(`W86 consultant-to-operator pilot handoff test harness PASS: ${results.length}/${results.length}`);
}

main();
