const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w104Path = path.join(root, 'data', 'w104_dcc_invocation_readiness.json');
const w105Path = path.join(root, 'data', 'w105_dcc_operator_approval_model.json');
const w106Path = path.join(root, 'data', 'w106_dcc_sandbox_preview_bridge.json');
const w107Path = path.join(root, 'data', 'w107_operator_preview_evidence_intake.json');
const w107TracePath = path.join(root, 'trace_samples', 'w107_operator_preview_evidence_intake_trace.json');
const dataPath = path.join(root, 'data', 'w108_operator_preview_retest_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w108_operator_preview_retest_trace.json');
const testPacketPath = path.join(root, 'trace_samples', 'w108_operator_preview_test_packet.json');
const exactInstructionsPath = path.join(root, 'trace_samples', 'w108_exact_operator_preview_test_instructions.json');
const operatorEvidenceFieldsPath = path.join(root, 'trace_samples', 'w108_operator_evidence_fields.json');
const scoringRubricPath = path.join(root, 'trace_samples', 'w108_operator_preview_scoring_rubric.json');
const reportPath = path.join(root, 'reports', 'w108_operator_preview_retest_packet.md');

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
  const w104 = readJson(w104Path);
  const w105 = readJson(w105Path);
  const w106 = readJson(w106Path);
  const w107 = readJson(w107Path);
  const w107Trace = readJson(w107TracePath);
  const stat = fs.statSync(userscriptPath);
  const results = [];

  const fileToUpload = {
    absolutePath: userscriptPath,
    sha256: sha256(userscriptPath),
    modifiedAt: stat.mtime.toISOString(),
    tampermonkeyName: 'Intelligent Demo Builder Drawer',
    installInstruction: 'Open Tampermonkey, edit Intelligent Demo Builder Drawer, replace the full script with this file, save, refresh NetSuite, and confirm exactly one IDB launcher appears.'
  };

  const salesRequest = {
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    conversationNotes: 'Buyer says seasonal boot and apparel launches are hard to coordinate because style, size, color, replenishment timing, and channel availability live in separate spreadsheets and order views. They need a concise proof path that shows customer promise confidence before demand shifts close to launch.',
    scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.',
    knownCompetitorOrIncumbent: 'Spreadsheets, disconnected inventory reports, and existing order tools. They are also comparing broader ERP options.',
    decisionCriteria: 'Must show a clear path from customer record to order/proof context; must connect style/SKU matrix, size/color availability, channel availability, replenishment timing, and customer promise.',
    timelineUrgency: 'Internal proof review needed within 2-4 weeks.',
    bantMeddicc: {
      budget: 'Budget is not finalized; value proof must justify scope.',
      authority: 'VP Operations and merchandising operations influence; finance signs off after value story is clear.',
      need: 'Reduce seasonal launch risk and avoid inventory/customer promise surprises across apparel and footwear variants.',
      timeline: 'Proof path needed in the current evaluation cycle, ideally ready for internal review in 2-4 weeks.',
      metrics: 'Fewer spreadsheet handoffs, faster launch readiness review, clearer available-to-promise confidence by style/size/color/channel.',
      economicBuyer: 'Operations leadership with finance review.',
      decisionProcess: 'SC proof, DCC preview/operator review, internal stakeholder readout, sandbox/pilot decision.',
      decisionCriteria: 'Clear proof path, credible object naming, no forced generic manufacturing/distribution language.',
      identifyPain: 'Variant availability and replenishment uncertainty create launch and promise risk.',
      champion: 'Merchandising operations lead pushing for cleaner launch readiness.'
    }
  };

  const expectedScreenshots = {
    plan: [
      'One active IDB drawer and one launcher only.',
      'Ariat International appears as the prospect.',
      'Classification is Apparel & Accessories or a clearly explained confirmation state.',
      'Visible DCC pack/scenario is Apparel & Accessories / Style-to-Availability Readiness.',
      'Primary action moves toward Review/DCC handoff after consultant confirmation.'
    ],
    review: [
      'Build Control Center is the first major Review card.',
      'DCC handoff export is visible.',
      'Selected lane, DCC pack, scenario, and DCC-prepared objects agree.',
      'Operator evidence intake is visible or reachable without hunting.',
      'No submit/queue/write control is visible from IDB.'
    ],
    roiCompetitive: [
      'Live Value Answer shows one ROI answer, one NetSuite answer, and one caution/blocker.',
      'Value story uses notes and stated pain, not website-only blocking.',
      'Audit detail is collapsed by default.'
    ],
    run: [
      'Live controls selector chips are at the top.',
      'Selected script updates the live Say/Show/Close guidance.',
      'The script remains aligned to apparel/style/SKU readiness.'
    ],
    trace: [
      'Trace Actions Only card is visible.',
      'Export DCC handoff and Export JSON are visible.',
      'Pilot evidence checklist calls out Plan, Review, DCC handoff JSON, trace JSON, and operator notes.'
    ]
  };

  const manualDccPreviewSteps = [
    'In IDB Review, export idb-dcc-runner-handoff-packet-*.json.',
    'In IDB Trace, export intelligent-demo-builder-trace-*.json.',
    'Open the Demo Command Center Suitelet manually in the sandbox. Do not open it from IDB.',
    'Compare the DCC handoff suiteletEntryPayload to the Suitelet form params.',
    'Compare the DCC-owned config param list to the DCC deployment/config surface. Record only match/missing/unclear, not secret values.',
    'Compare scheduledRunnerPreview params to the DCC runner preview. Do not click submit, queue, or write.',
    'Return to IDB Review and paste operator evidence into the Operator evidence intake.',
    'Mark preview approved only when Suitelet params, DCC config, runner preview, handoff filename, trace filename, and notes are captured.',
    'If anything is missing or unclear, reject preview and capture the exact remediation note.'
  ];

  const operatorEvidenceFields = {
    schema: 'idb.w108-operator-evidence-fields.v1',
    status: 'required_for_w108_retest',
    fieldsToPasteIntoIdb: [
      { field: 'operatorName', required: true, expected: 'Operator reviewer name.' },
      { field: 'suiteletParamReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'Suitelet form params comparison result.' },
      { field: 'dccOwnedConfigReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'DCC-owned config comparison result. Do not paste secrets.' },
      { field: 'runnerPreviewReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'Scheduled runner preview comparison result.' },
      { field: 'handoffPacketFilename', required: true, expected: 'idb-dcc-runner-handoff-packet-*.json.' },
      { field: 'traceFilename', required: true, expected: 'intelligent-demo-builder-trace-*.json.' },
      { field: 'notes', required: true, expected: 'What matched, what was missing, and what is unclear.' },
      { field: 'approvalStatus', required: true, allowed: ['approved', 'rejected'], expected: 'Mark preview approved or reject preview in IDB.' }
    ],
    noSecretRules: [
      'Do not paste tokens, passwords, internal deployment secrets, or private config values.',
      'Record whether a config value exists and matches expectation, not the value itself.'
    ],
    previewOnlyBoundary: {
      idbCanSubmit: false,
      idbCanInvokeSuiteScript: false,
      idbCanWriteTransactions: false
    }
  };

  const scoringRubric = {
    schema: 'idb.w108-operator-preview-scoring-rubric.v1',
    scale: '1-5',
    passingAverage: 4,
    noCategoryBelow: 3,
    categories: [
      'One active drawer / no duplicate button',
      'Intake and Plan are understandable in under 30 seconds',
      'Lane, confirmed lane, DCC pack, and exported handoff agree',
      'Review makes DCC handoff export primary and unmistakable',
      'ROI / Competitive is useful without audit overload',
      'Run selector chips update live script clearly',
      'Trace evidence checklist is clear',
      'Operator can compare Suitelet params, DCC config, and runner preview without confusion',
      'Operator evidence can be pasted back into IDB and approved/rejected',
      'No-submit/no-write safety is obvious'
    ],
    automaticNoGoIf: [
      'Two IDB launchers or duplicate drawers appear after refresh.',
      'Plan/Review/exported handoff disagree on lane, pack, or scenario.',
      'DCC handoff JSON is missing.',
      'Trace JSON is missing.',
      'Operator evidence is not captured in IDB.',
      'Any IDB path appears to submit, queue, invoke SuiteScript, or write a transaction.',
      'Operator cannot complete preview comparison without guessing.'
    ]
  };

  const stopGoCriteria = {
    goForW109If: [
      'All five screenshots are provided: Plan, Review, ROI/Competitive, Run, Trace.',
      'DCC handoff JSON is attached.',
      'Trace JSON is attached.',
      'Operator evidence fields are pasted back into IDB and captured in the trace.',
      'Average score is 4 or higher and no category is below 3.',
      'No no-go condition occurs.'
    ],
    noGoAndRemediateIf: scoringRubric.automaticNoGoIf
  };

  const exactInstructions = {
    schema: 'idb.w108-exact-operator-preview-test-instructions.v1',
    status: 'ready_for_one_real_operator_preview_retest',
    fileToUpload,
    salesRequest,
    consultantSteps: [
      'Upload/save the exact IDB file in Tampermonkey.',
      'Disable any duplicate/old IDB userscript entries.',
      'Refresh NetSuite and confirm exactly one IDB launcher appears.',
      'Open IDB, go to Trace, clear session, then return to Plan.',
      'Enter the sales request exactly as listed.',
      'Use Prepare Brief / confirm lane only when Apparel & Accessories and Style-to-Availability Readiness are visible and reasonable.',
      'Capture Plan first viewport screenshot.',
      'Capture Review first viewport screenshot and export the DCC handoff JSON.',
      'Capture ROI/Competitive first viewport screenshot.',
      'Capture Run first viewport screenshot after trying at least two selector chips.',
      'Capture Trace first viewport screenshot and export trace JSON.',
      'Send the DCC handoff JSON and trace JSON to the operator for manual DCC preview comparison.',
      'Paste the operator comparison evidence back into IDB Review operator evidence intake.',
      'Export a final trace JSON after operator evidence is captured.'
    ],
    manualDccPreviewSteps,
    expectedScreenshots,
    requiredExports: [
      'idb-dcc-runner-handoff-packet-*.json',
      'intelligent-demo-builder-trace-*.json after consultant flow',
      'intelligent-demo-builder-trace-*.json after operator evidence intake'
    ],
    operatorEvidenceFields
  };

  const testPacket = {
    schema: 'idb.w108-one-real-operator-preview-retest-packet.v1',
    status: 'ready_for_user_and_operator_retest',
    objective: 'Run one real review-only consultant-to-operator preview test before any DCC invocation design proceeds.',
    fileToUpload,
    salesRequest,
    exactInstructions,
    manualDccPreviewSteps,
    operatorEvidenceFields,
    scoringRubric,
    stopGoCriteria,
    inheritedReadiness: {
      w104InvocationReadiness: w104.status,
      w105OperatorApprovalModel: w105.status,
      w106SandboxPreviewBridge: w106.status,
      w107OperatorEvidenceIntake: w107.status
    },
    noRegression: {
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      notesStoryOnly: true,
      consultantConfirmationRequired: true,
      w92StateAuthorityPreserved: true,
      w105W106W107PreviewOnlyBehavior: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt: {
      block: 'W109: Consultant Intake Cleanup And Sales Request Mode',
      prompt: 'Move through W109: Consultant Intake Cleanup And Sales Request Mode. Redesign Plan intake so a consultant enters a sales request surgically: prospect, website, business pain, requested proof, decision criteria, timeline/urgency, competitor/incumbent, and optional website/category evidence. Replace internal pack IDs with consultant-facing labels, reduce chips and audit language, require a clear Prepare Brief action before recommendations are treated as ready, and make website evidence supportive for identity/naming while notes drive value story. Preserve W92 state authority, W96-W98 compression, DCC handoff boundaries, no IDB writes, no SuiteScript invocation, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, consultant confirmation required, and DCC ownership of object generation. Output cleaned intake UI, trace coverage, validator gates, W109 report, and best next Codex prompt.'
    }
  };

  assertCase(results, 'w108_inherits_w104_w107_preview_only_chain', w104.status === 'dcc_invocation_readiness_defined_review_only' && w105.status === 'operator_approval_model_ready_preview_only' && w106.status === 'sandbox_preview_bridge_ready_manual_no_submit' && w107.status === 'operator_preview_evidence_intake_ready', JSON.stringify(testPacket.inheritedReadiness));
  assertCase(results, 'w108_file_to_upload_hash_present', fs.existsSync(fileToUpload.absolutePath) && fileToUpload.sha256.length === 64 && /idb-drawer\.user\.js$/.test(fileToUpload.absolutePath), JSON.stringify(fileToUpload));
  assertCase(results, 'w108_sales_request_realistic_complete', salesRequest.prospect === 'Ariat International' && salesRequest.website === 'https://www.ariat.com/' && salesRequest.conversationNotes.length > 160 && salesRequest.bantMeddicc.timeline.includes('2-4 weeks'), JSON.stringify(salesRequest));
  assertCase(results, 'w108_screenshots_cover_all_tabs', ['plan', 'review', 'roiCompetitive', 'run', 'trace'].every((key) => Array.isArray(expectedScreenshots[key]) && expectedScreenshots[key].length >= 3), JSON.stringify(Object.keys(expectedScreenshots)));
  assertCase(results, 'w108_operator_manual_preview_steps_no_submit', manualDccPreviewSteps.length >= 8 && manualDccPreviewSteps.some((step) => /Do not click submit/.test(step)) && manualDccPreviewSteps.some((step) => /paste operator evidence/i.test(step)), manualDccPreviewSteps.join(' | '));
  assertCase(results, 'w108_operator_evidence_fields_match_w107', w107.evidenceFields.every((field) => operatorEvidenceFields.fieldsToPasteIntoIdb.some((item) => item.field === field)) && operatorEvidenceFields.previewOnlyBoundary.idbCanSubmit === false, JSON.stringify(operatorEvidenceFields.fieldsToPasteIntoIdb.map((item) => item.field)));
  assertCase(results, 'w108_required_exports_and_final_trace_present', exactInstructions.requiredExports.includes('idb-dcc-runner-handoff-packet-*.json') && exactInstructions.requiredExports.some((item) => /after operator evidence/.test(item)), JSON.stringify(exactInstructions.requiredExports));
  assertCase(results, 'w108_scoring_and_stop_go_ready', scoringRubric.categories.length >= 10 && scoringRubric.automaticNoGoIf.some((item) => /SuiteScript/.test(item)) && stopGoCriteria.goForW109If.some((item) => /operator evidence/i.test(item)), JSON.stringify(scoringRubric));
  assertCase(results, 'w108_runtime_still_no_submit_path', /data-idb-export-dcc-handoff/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && /operatorApprovalEvidenceIntakeV1/.test(userscript) && /suiteScriptInvocationFromIdb: false/.test(userscript), 'export-only runtime with operator evidence intake');
  assertCase(results, 'w108_no_regression_boundaries_preserved', Object.values(testPacket.noRegression).every(Boolean) && w107Trace.operatorApprovalEvidenceIntakeV1.canSubmit === false, JSON.stringify(testPacket.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const contract = {
    schema: 'idb.w108-operator-preview-retest-packet.v1',
    status: failures.length ? 'blocked' : 'ready_for_one_real_operator_preview_retest',
    decision,
    objective: testPacket.objective,
    fileToUpload,
    outputs: {
      testPacket: path.relative(root, testPacketPath),
      exactInstructions: path.relative(root, exactInstructionsPath),
      operatorEvidenceFields: path.relative(root, operatorEvidenceFieldsPath),
      scoringRubric: path.relative(root, scoringRubricPath)
    },
    userVisualFeedbackRequiredNow: true,
    testPacket,
    validatorResults: results,
    bestNextCodexPrompt: testPacket.bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w108-operator-preview-retest-trace.v1',
    decision,
    pass: failures.length === 0,
    userVisualFeedbackRequiredNow: true,
    fileToUpload,
    requiredEvidence: {
      screenshots: Object.keys(expectedScreenshots),
      exports: exactInstructions.requiredExports,
      operatorEvidenceFields: operatorEvidenceFields.fieldsToPasteIntoIdb.map((field) => field.field)
    },
    noRegression: testPacket.noRegression,
    bestNextCodexPrompt: testPacket.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  writeJson(testPacketPath, testPacket);
  writeJson(exactInstructionsPath, exactInstructions);
  writeJson(operatorEvidenceFieldsPath, operatorEvidenceFields);
  writeJson(scoringRubricPath, scoringRubric);

  const reportRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${escapeTable(result.detail).slice(0, 260)} |`).join('\n');
  const report = [
    '# W108 Operator Preview Retest Packet And Go/No-Go',
    '',
    `Decision: ${decision} / ONE REAL OPERATOR PREVIEW RETEST READY / USER AND OPERATOR FEEDBACK REQUIRED`,
    '',
    '## File To Upload',
    `- ${fileToUpload.absolutePath}`,
    `- SHA-256: ${fileToUpload.sha256}`,
    `- Modified: ${fileToUpload.modifiedAt}`,
    '',
    '## Sales Request Fields',
    `- Prospect: ${salesRequest.prospect}`,
    `- Website: ${salesRequest.website}`,
    `- Conversation notes: ${salesRequest.conversationNotes}`,
    `- SC objective: ${salesRequest.scObjective}`,
    `- Competitor/incumbent: ${salesRequest.knownCompetitorOrIncumbent}`,
    `- Decision criteria: ${salesRequest.decisionCriteria}`,
    `- Timeline/urgency: ${salesRequest.timelineUrgency}`,
    '',
    '## Required Screenshots',
    '- Plan first viewport',
    '- Review first viewport',
    '- ROI / Competitive first viewport',
    '- Run first viewport after trying selector chips',
    '- Trace first viewport',
    '',
    '## Required Exports',
    ...exactInstructions.requiredExports.map((item) => `- ${item}`),
    '',
    '## Operator Preview Steps',
    ...manualDccPreviewSteps.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## Operator Evidence To Paste Back Into IDB',
    ...operatorEvidenceFields.fieldsToPasteIntoIdb.map((item) => `- ${item.field}: ${item.expected || item.allowed.join(', ')}`),
    '',
    '## Stop / Go',
    '- Go to W109 only after screenshots, DCC handoff JSON, trace JSON, and operator evidence are captured.',
    '- No-go if there is a lane/pack mismatch, missing export, missing operator evidence, duplicate drawer, or any apparent submit/write path.',
    '',
    '## Validator Gates',
    '| Status | Gate | Detail |',
    '| --- | --- | --- |',
    reportRows,
    '',
    '## Best Next Codex Prompt',
    testPacket.bestNextCodexPrompt.prompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(JSON.stringify({ decision, failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ decision, results: results.length, report: path.relative(root, reportPath), userVisualFeedbackRequiredNow: true }, null, 2));
}

main();
