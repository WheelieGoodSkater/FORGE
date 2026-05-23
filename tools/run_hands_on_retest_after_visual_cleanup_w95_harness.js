const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w94Path = path.join(root, 'data', 'w94_visual_qa_duplicate_drawer_cleanup.json');
const w94TracePath = path.join(root, 'trace_samples', 'w94_visual_qa_duplicate_drawer_cleanup_trace.json');
const w93TracePath = path.join(root, 'trace_samples', 'w93_consultant_ux_compression_trace.json');
const dataPath = path.join(root, 'data', 'w95_hands_on_retest_after_visual_cleanup.json');
const tracePath = path.join(root, 'trace_samples', 'w95_hands_on_retest_after_visual_cleanup_trace.json');
const retestPacketPath = path.join(root, 'trace_samples', 'w95_hands_on_retest_packet.json');
const exactInstructionsPath = path.join(root, 'trace_samples', 'w95_exact_test_instructions.json');
const operatorChecklistPath = path.join(root, 'trace_samples', 'w95_operator_comparison_checklist.json');
const scoringRubricPath = path.join(root, 'trace_samples', 'w95_scoring_rubric.json');
const reportPath = path.join(root, 'reports', 'w95_hands_on_retest_after_visual_cleanup.md');

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
  const w94 = readJson(w94Path);
  const w94Trace = readJson(w94TracePath);
  const w93Trace = readJson(w93TracePath);
  const contract = readJson(dataPath);
  const stat = fs.statSync(userscriptPath);
  const results = [];

  const fileToUpload = {
    absolutePath: userscriptPath,
    sha256: sha256(userscriptPath),
    modifiedAt: stat.mtime.toISOString(),
    tampermonkeyName: 'Intelligent Demo Builder Drawer',
    installInstruction: 'Open Tampermonkey, edit Intelligent Demo Builder Drawer, replace the full script with this file, save, refresh NetSuite, and confirm only one IDB launcher appears.'
  };

  const salesRequest = {
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    conversationNotes: 'Buyer says style, size, color, replenishment timing, and channel availability are hard to keep aligned for seasonal boot and apparel launches. The team uses spreadsheets and disconnected inventory views, which makes customer promise risky when demand shifts close to launch.',
    scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise for a seasonal boot and apparel launch.',
    knownCompetitorOrIncumbent: 'Spreadsheets, disconnected inventory reports, and existing order tools. They are also comparing broader ERP options.',
    decisionCriteria: 'Must show a clear path from customer record to order/proof context; must connect style/SKU matrix, size/color availability, channel availability, replenishment timing, and customer promise.',
    bantMeddicc: {
      budget: 'Budget is not finalized; team needs value proof before committing to scope.',
      authority: 'VP Operations and merchandising operations influence; finance signs off after value story is clear.',
      need: 'Reduce launch risk and avoid inventory/customer promise surprises across apparel and footwear variants.',
      timeline: 'Wants a credible proof path within the current evaluation cycle, ideally ready for internal review in 2-4 weeks.',
      metrics: 'Fewer spreadsheet handoffs, faster launch readiness review, clearer available-to-promise confidence by style/size/color/channel.',
      economicBuyer: 'Operations leadership with finance review.',
      decisionProcess: 'SC demo proof, operator build review, internal stakeholder readout, then sandbox/pilot decision.',
      identifyPain: 'Seasonal launches expose variant availability gaps and replenishment uncertainty.',
      champion: 'Merchandising operations lead pushing for cleaner launch readiness.'
    }
  };

  const expectedFirstViewport = {
    plan: [
      'Only one IDB drawer and one IDB button are visible.',
      'Plan shows Ariat International as the prospect.',
      'Classification should be Apparel & Accessories.',
      'Confidence should be recommended/high or a clear confirmation state, not Products CPG.',
      'DCC pack should align to apparelAccessories / Style-to-Availability Readiness.',
      'Primary action should be confirm/review packet, not a long story bar.'
    ],
    review: [
      'DCC handoff export is the first major card.',
      'Status is blocked until consultant confirmation or confirmed for operator review after confirmation.',
      'Selected pack/scenario match the visible lane.',
      'DCC will prepare object list is visible without scrolling through audit detail.',
      'Export DCC handoff button is visible.'
    ],
    run: [
      'Live script first is visible.',
      'Say, Show, and Close appear before controls, guardrails, or audit detail.',
      'The script stays in the apparel/style/SKU path.'
    ],
    trace: [
      'Trace actions only is visible.',
      'Export DCC handoff and Export JSON are visible.',
      'Pilot evidence checklist is visible.',
      'Pilot result import is not part of the normal first viewport.'
    ]
  };

  const exactInstructions = {
    schema: 'idb.w95-exact-test-instructions.v1',
    status: 'ready_for_user_hands_on_retest',
    fileToUpload,
    salesRequest,
    steps: [
      'Update Tampermonkey with the exact file listed in fileToUpload.',
      'Disable any old duplicate Intelligent Demo Builder scripts in Tampermonkey if more than one is enabled.',
      'Refresh NetSuite and confirm only one IDB launcher button is visible before opening the drawer.',
      'Open IDB and clear the current session.',
      'Enter the sales request fields exactly as provided.',
      'On Plan, capture the first viewport screenshot before expanding any audit detail.',
      'Confirm the lane only if Apparel & Accessories / Style-to-Availability Readiness is visible and reasonable.',
      'Go to Review and capture the first viewport screenshot showing DCC handoff export.',
      'Export the DCC handoff JSON from Review.',
      'Go to Run and capture the first viewport screenshot showing Say/Show/Close.',
      'Go to Trace and capture the first viewport screenshot showing export/checklist/reset.',
      'Export the trace JSON from Trace.',
      'Have the operator compare the DCC handoff JSON to DCC Suitelet form params and runner preview without submitting anything.',
      'Return screenshots, both JSON exports, consultant feedback, and operator comparison notes.'
    ],
    screenshotsRequired: [
      'Plan first viewport',
      'Review first viewport with DCC handoff export',
      'Run first viewport with Say/Show/Close',
      'Trace first viewport with export/checklist/reset'
    ],
    jsonExportsRequired: [
      'idb-dcc-runner-handoff-packet-*.json',
      'intelligent-demo-builder-trace-*.json'
    ],
    expectedFirstViewport
  };

  const operatorChecklist = {
    schema: 'idb.w95-operator-comparison-checklist.v1',
    status: 'ready_for_operator_review_no_submit',
    compare: [
      'suiteletEntryPayload prospect/customer matches Ariat International.',
      'suiteletEntryPayload website matches https://www.ariat.com/.',
      'Selected pack is apparelAccessories.',
      'Selected scenario is Style-to-Availability Readiness.',
      'Family key maps to the DCC apparel/accessories path.',
      'Write/submission mode is review-only/export-only from IDB.',
      'DCC-owned config params are present as DCC-owned, not generated by IDB.',
      'Scheduled runner preview params look usable for DCC manual review.',
      'DCC remains owner of item names, assemblies, BOMs, locations, planning, routing/WIP, CSV/Sales Order mechanics.',
      'No operator clicks submit/queue/write as part of this IDB test.'
    ],
    markEachItemAs: ['match', 'missing', 'unclear'],
    noSecretRules: [
      'Do not paste tokens, passwords, script deployment secrets, or private config values into notes.',
      'Record whether config exists, not the secret value.'
    ]
  };

  const scoringRubric = {
    schema: 'idb.w95-scoring-rubric.v1',
    scale: '1-5',
    passingAverage: 4,
    noCategoryBelow: 3,
    categories: [
      'One active drawer / no duplicate button',
      'Plan first-viewport clarity',
      'Website/lane/DCC pack consistency',
      'Review DCC handoff export clarity',
      'Run live script usefulness',
      'Trace evidence checklist clarity',
      'DCC operator field mapping clarity',
      'No-submit/no-write safety clarity'
    ],
    automaticNoGoIf: [
      'Two IDB buttons or two drawers appear after refresh.',
      'Plan shows Apparel & Accessories while export shows Products CPG, or any other lane/pack mismatch.',
      'DCC handoff JSON is not exported.',
      'Trace JSON is not exported.',
      'Any IDB control appears to submit, queue, invoke SuiteScript, or write a transaction.',
      'Operator cannot map selected pack/scenario to DCC in under 5 minutes.'
    ]
  };

  const retestPacket = {
    schema: 'idb.w95-hands-on-retest-packet.v1',
    status: 'ready_for_user_hands_on_retest_visual_feedback_required',
    objective: 'Run one post-W94, post-W93 hands-on test and return visual/evidence feedback for W96 grading.',
    fileToUpload,
    salesRequest,
    exactInstructions,
    operatorChecklist,
    scoringRubric,
    stopGoCriteria: {
      goForW96ReviewIf: [
        'All four screenshots are provided.',
        'DCC handoff JSON is attached.',
        'Trace JSON is attached.',
        'Operator comparison notes are provided.',
        'No write/submit/queue behavior is observed.'
      ],
      noGoBeforeW96If: scoringRubric.automaticNoGoIf
    },
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  assertCase(results, 'w95_inherits_w94_one_active_drawer_pass', w94.status === 'visual_qa_duplicate_cleanup_ready' && w94Trace.cleanedDiagnostics.oneActiveRoot === true && w94Trace.cleanedDiagnostics.duplicateDetected === false, JSON.stringify(w94Trace.cleanedDiagnostics));
  assertCase(results, 'w95_inherits_w93_compressed_ui_pass', w93Trace.decision === 'PASS' && w93Trace.compressedTabs.plan && w93Trace.compressedTabs.review && w93Trace.compressedTabs.run && w93Trace.compressedTabs.trace, JSON.stringify(w93Trace.compressedTabs));
  assertCase(results, 'w95_file_to_upload_hash_present', fs.existsSync(fileToUpload.absolutePath) && fileToUpload.sha256.length === 64 && /idb-drawer\.user\.js$/.test(fileToUpload.absolutePath), JSON.stringify(fileToUpload));
  assertCase(results, 'w95_sales_request_realistic_and_complete', salesRequest.prospect === 'Ariat International' && salesRequest.website === 'https://www.ariat.com/' && salesRequest.conversationNotes.length > 100 && salesRequest.bantMeddicc.timeline.includes('2-4 weeks'), JSON.stringify(salesRequest));
  assertCase(results, 'w95_expected_viewports_cover_plan_review_run_trace', Object.keys(expectedFirstViewport).sort().join(',') === 'plan,review,run,trace' && expectedFirstViewport.plan.some((item) => /DCC pack/.test(item)) && expectedFirstViewport.trace.some((item) => /Pilot result import/.test(item)), JSON.stringify(expectedFirstViewport));
  assertCase(results, 'w95_required_evidence_complete', exactInstructions.screenshotsRequired.length === 4 && exactInstructions.jsonExportsRequired.includes('idb-dcc-runner-handoff-packet-*.json') && exactInstructions.jsonExportsRequired.includes('intelligent-demo-builder-trace-*.json') && operatorChecklist.compare.length >= 10, JSON.stringify({ screenshots: exactInstructions.screenshotsRequired, json: exactInstructions.jsonExportsRequired }));
  assertCase(results, 'w95_scoring_rubric_has_auto_no_go', scoringRubric.categories.length >= 8 && scoringRubric.automaticNoGoIf.some((item) => /two drawers/i.test(item)) && scoringRubric.automaticNoGoIf.some((item) => /SuiteScript/.test(item)), JSON.stringify(scoringRubric));
  assertCase(results, 'w95_runtime_still_export_only', /data-idb-export-dcc-handoff/.test(userscript) && !/data-idb-submit-dcc-handoff/.test(userscript) && /suiteScriptInvocationFromIdb: false/.test(userscript) && /noIdbTransactionWrite: true/.test(userscript), 'export-only no-write runtime');
  assertCase(results, 'w95_no_regression_boundaries_preserved', Object.values(retestPacket.noRegression).every(Boolean), JSON.stringify(retestPacket.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  contract.status = decision === 'PASS' ? 'hands_on_retest_packet_ready_user_feedback_required' : 'hands_on_retest_packet_failed';
  contract.retestPacket = retestPacket;
  contract.validatorResults = results;

  writeJson(dataPath, contract);
  writeJson(retestPacketPath, retestPacket);
  writeJson(exactInstructionsPath, exactInstructions);
  writeJson(operatorChecklistPath, operatorChecklist);
  writeJson(scoringRubricPath, scoringRubric);

  const trace = {
    schema: 'idb.w95-hands-on-retest-after-visual-cleanup-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    status: contract.status,
    userFeedbackRequiredNow: decision === 'PASS',
    fileToUpload: {
      absolutePath: fileToUpload.absolutePath,
      sha256: fileToUpload.sha256,
      modifiedAt: fileToUpload.modifiedAt
    },
    requiredEvidence: contract.requiredEvidence,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt,
    validatorResults: results
  };
  writeJson(tracePath, trace);

  const report = [
    '# W95 Hands-On Retest Packet After Visual Cleanup',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / HANDS-ON RETEST READY / USER VISUAL FEEDBACK REQUIRED`,
    '',
    '## File To Upload',
    '',
    `- ${fileToUpload.absolutePath}`,
    `- SHA-256: ${fileToUpload.sha256}`,
    `- Modified: ${fileToUpload.modifiedAt}`,
    '',
    '## Sales Request',
    '',
    `- Prospect: ${salesRequest.prospect}`,
    `- Website: ${salesRequest.website}`,
    `- Conversation notes: ${salesRequest.conversationNotes}`,
    `- SC objective: ${salesRequest.scObjective}`,
    `- Competitor/incumbent: ${salesRequest.knownCompetitorOrIncumbent}`,
    `- Decision criteria: ${salesRequest.decisionCriteria}`,
    `- Timeline: ${salesRequest.bantMeddicc.timeline}`,
    '',
    '## Screenshots Required',
    '',
    ...exactInstructions.screenshotsRequired.map((item) => `- ${item}`),
    '',
    '## JSON Exports Required',
    '',
    ...exactInstructions.jsonExportsRequired.map((item) => `- ${item}`),
    '',
    '## Operator Checklist',
    '',
    ...operatorChecklist.compare.map((item) => `- ${item}`),
    '',
    '## Automatic No-Go',
    '',
    ...scoringRubric.automaticNoGoIf.map((item) => `- ${item}`),
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${escapeTable(result.name)} | ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    contract.bestNextCodexPrompt.prompt,
    ''
  ].join('\n');
  fs.writeFileSync(reportPath, report);

  if (failures.length) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
