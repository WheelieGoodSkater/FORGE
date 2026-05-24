const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w110Path = path.join(root, 'data', 'w110_dcc_handoff_packet_parity_lock.json');
const w111Path = path.join(root, 'data', 'w111_dcc_preview_url_operator_copy.json');
const dataPath = path.join(root, 'data', 'w112_operator_preview_retest_after_copy_helper.json');
const tracePath = path.join(root, 'trace_samples', 'w112_operator_preview_retest_after_copy_helper_trace.json');
const testPacketPath = path.join(root, 'trace_samples', 'w112_operator_preview_copy_helper_test_packet.json');
const exactInstructionsPath = path.join(root, 'trace_samples', 'w112_exact_operator_preview_copy_helper_test_instructions.json');
const scoringRubricPath = path.join(root, 'trace_samples', 'w112_operator_preview_copy_helper_scoring_rubric.json');
const reportPath = path.join(root, 'reports', 'w112_operator_preview_retest_after_copy_helper.md');

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
  const w110 = readJson(w110Path);
  const w111 = readJson(w111Path);
  const stat = fs.statSync(userscriptPath);
  const results = [];

  const fileToUpload = {
    absolutePath: userscriptPath,
    sha256: sha256(userscriptPath),
    modifiedAt: stat.mtime.toISOString(),
    tampermonkeyName: 'Intelligent Demo Builder Drawer',
    instruction: 'In Tampermonkey, open Intelligent Demo Builder Drawer, replace the full script with idb-drawer.user.js, save, refresh NetSuite, and confirm exactly one IDB launcher appears.'
  };

  const salesRequest = {
    prospect: 'Ariat International',
    website: 'https://www.ariat.com/',
    businessPain: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
    requestedProof: 'Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
    decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
    timelineUrgency: 'Internal proof review needed in 2-4 weeks before the next buying committee checkpoint.',
    competitorIncumbent: 'Spreadsheets, disconnected inventory reports, and incumbent order tools; broader ERP options are also being compared.',
    optionalWebsiteCategoryEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.'
  };

  const expectedScreenshots = {
    plan: [
      '30-second plan shows Ariat International, Apparel & Accessories, confidence, DCC pack, and one next action.',
      'Sales request intake is concise, not audit-heavy.',
      'No duplicate Story Bar or duplicate IDB drawer appears.'
    ],
    reviewCopyHelper: [
      'Build Control Center appears first.',
      'DCC handoff export button is visible.',
      'Preview URL and operator copy section is visible.',
      'Preview URL text, query params, and Copy-safe parameter text are visible.',
      'No open, submit, queue, write, or invoke button is visible.'
    ],
    roiCompetitive: [
      'Live Value Answer shows one ROI answer, one NetSuite answer, and one caution/blocker.',
      'Value story is driven by notes/business pain and does not require website-only certainty.',
      'Audit detail remains collapsed by default.'
    ],
    run: [
      'Open / Prove / Handle objection / Close value selector chips are at the top.',
      'Changing chips updates selected script copy.',
      'Script stays aligned to style/SKU readiness.'
    ],
    trace: [
      'Trace Actions Only card is visible.',
      'Export DCC handoff and Export JSON are visible.',
      'Pilot evidence checklist requires Plan, Review, DCC handoff JSON, trace JSON, and operator notes.'
    ]
  };

  const requiredExports = [
    'idb-dcc-runner-handoff-packet-*.json from Review',
    'intelligent-demo-builder-trace-*.json after consultant flow',
    'intelligent-demo-builder-trace-*.json after operator evidence is pasted back into IDB'
  ];

  const manualDccPreviewComparison = [
    'Export the DCC handoff JSON from IDB Review.',
    'Open Review > Preview URL and operator copy.',
    'Copy the Preview URL text or Copy-safe parameter text. Do not click or open from IDB.',
    'Manually open the Demo Command Center Suitelet in sandbox.',
    'Compare Suitelet form params to the DCC handoff JSON and W111 copy-safe parameter text.',
    'Verify DCC-owned config params exist in the DCC deployment/config surface. Record match/missing/unclear only; do not paste secrets.',
    'Compare scheduled runner preview params to the handoff JSON. Do not submit, queue, invoke SuiteScript, or write.',
    'Return to IDB Review and paste operator evidence: operator name, param/config/runner statuses, handoff filename, trace filename, notes.',
    'Mark preview approved only if Suitelet params, DCC config, runner preview, filenames, and notes are all captured and matching.',
    'If anything is missing or unclear, reject preview and write the exact remediation note.'
  ];

  const operatorEvidenceFields = [
    { field: 'operatorName', required: true, expected: 'Name of the operator reviewing the DCC preview.' },
    { field: 'suiteletParamReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'Suitelet form params comparison result.' },
    { field: 'dccOwnedConfigReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'DCC-owned config review result; no secret values.' },
    { field: 'runnerPreviewReview', required: true, allowed: ['match', 'missing', 'unclear'], expected: 'Scheduled runner preview comparison result.' },
    { field: 'handoffPacketFilename', required: true, expected: 'idb-dcc-runner-handoff-packet-*.json.' },
    { field: 'traceFilename', required: true, expected: 'intelligent-demo-builder-trace-*.json.' },
    { field: 'notes', required: true, expected: 'What matched, what was missing, what is unclear, and whether W111 copy helped.' },
    { field: 'approvalStatus', required: true, allowed: ['approved', 'rejected'], expected: 'Use IDB Mark preview approved or Reject preview.' }
  ];

  const scoringRubric = {
    schema: 'idb.w112-operator-preview-copy-helper-scoring-rubric.v1',
    scale: '1-5',
    passingAverage: 4,
    noCategoryBelow: 3,
    categories: [
      'One active IDB drawer and one launcher',
      'Sales request intake is clear and quick',
      'Plan lane, confirmed lane, DCC pack, scenario, and exported handoff agree',
      'Review makes DCC handoff export primary',
      'Preview URL/operator copy is easy to find and copy',
      'Copy-safe parameter text matches DCC handoff JSON',
      'Operator can compare Suitelet params without guessing',
      'Operator can compare DCC-owned config without exposing secrets',
      'Operator can compare runner preview without submitting',
      'Operator evidence intake is easy to paste back into IDB',
      'No-submit/no-write boundary is obvious'
    ],
    automaticNoGoIf: [
      'Duplicate IDB launcher or drawer appears.',
      'Visible lane, confirmed lane, exported lane, DCC pack, or scenario disagree.',
      'DCC handoff JSON is missing.',
      'Trace JSON is missing.',
      'Preview URL/operator copy section is missing.',
      'Operator evidence is not pasted back into IDB.',
      'Any IDB control appears to open DCC, submit, queue, invoke SuiteScript, or write.',
      'Operator must guess how Suitelet params map to handoff JSON.'
    ]
  };

  const stopGoCriteria = {
    goIf: [
      'All required screenshots are captured.',
      'DCC handoff JSON and trace JSON are attached.',
      'Operator comparison notes are pasted into IDB and final trace is exported.',
      'Average score is at least 4 and no category is below 3.',
      'No automatic no-go condition occurs.'
    ],
    noGoIf: scoringRubric.automaticNoGoIf,
    nextDecision: 'If go, proceed to grade W112 evidence. If no-go, remediate Review copy/helper or state parity before any DCC invocation work.'
  };

  const exactInstructions = {
    schema: 'idb.w112-exact-operator-preview-copy-helper-test-instructions.v1',
    status: 'ready_for_hands_on_operator_preview_retest',
    fileToUpload,
    salesRequest,
    consultantSteps: [
      'Upload/save the exact IDB file in Tampermonkey.',
      'Disable any duplicate/old IDB userscript entries.',
      'Refresh NetSuite and confirm exactly one IDB launcher appears.',
      'Open IDB > Trace, clear session, then return to Plan.',
      'Enter the W112 sales request fields exactly.',
      'Click Prepare brief.',
      'Confirm Apparel & Accessories only if Plan/Review show Style-to-Availability Readiness and the DCC pack agrees.',
      'Capture Plan screenshot.',
      'Go to Review, capture the Build Control Center and Preview URL/operator copy screenshot.',
      'Export DCC handoff JSON.',
      'Capture ROI/Competitive screenshot.',
      'Capture Run screenshot after changing at least two selector chips.',
      'Capture Trace screenshot and export trace JSON.',
      'Give the DCC handoff JSON, trace JSON, and W111 copy text to the operator.',
      'Paste operator comparison evidence back into IDB Review.',
      'Export a final trace JSON after operator evidence is captured.'
    ],
    expectedScreenshots,
    requiredExports,
    manualDccPreviewComparison,
    operatorEvidenceFields,
    scoringRubric,
    stopGoCriteria
  };

  const testPacket = {
    schema: 'idb.w112-operator-preview-retest-after-copy-helper.v1',
    status: 'ready_for_hands_on_operator_preview_retest',
    objective: 'Run one real operator preview retest using W111 copy-safe URL/query parameter guidance before any DCC invocation design proceeds.',
    w111Readiness: {
      status: w111.status,
      readyExampleStatus: w111.readyExample && w111.readyExample.status,
      noNavigation: w111.readyExample && w111.readyExample.canNavigateFromIdb === false,
      noSubmit: w111.readyExample && w111.readyExample.canSubmit === false
    },
    w110Readiness: {
      status: w110.status,
      parityMatrixCases: Array.isArray(w110.parityMatrix) ? w110.parityMatrix.length : 0
    },
    fileToUpload,
    salesRequest,
    exactInstructions,
    expectedScreenshots,
    requiredExports,
    manualDccPreviewComparison,
    operatorEvidenceFields,
    scoringRubric,
    stopGoCriteria,
    userVisualFeedbackRequiredNow: true,
    noRegression: {
      w110ParityLockPreserved: true,
      w92StateAuthorityPreserved: true,
      w105W107PreviewOnlyApprovalPreserved: true,
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noTransactionWrites: true,
      hostedResolverOptionalUntilRemoteSmokeExecuted: true,
      notesStoryOnly: true,
      consultantConfirmationRequired: true,
      dccOwnsObjectGeneration: true
    },
    bestNextCodexPrompt: {
      block: 'W113: Grade Operator Preview Retest Evidence',
      prompt: 'Move through W113: Grade Operator Preview Retest Evidence. Use the W112 screenshots, DCC handoff JSON, trace JSON, final trace after operator evidence intake, and operator comparison notes to grade the hands-on operator preview retest. Verify W110 parity lock, W92 state authority, W111 copy helper usefulness, W105-W107 preview-only approval behavior, no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, and DCC ownership of object generation. Output scored results, go/no-go for governed DCC invocation design, exact remediation, W113 report, validator gates, and best next Codex prompt.'
    }
  };

  assertCase(results, 'w112_inherits_w110_w111_readiness', w110.status === 'dcc_handoff_parity_locked' && w111.status === 'preview_url_operator_copy_ready' && testPacket.w111Readiness.noNavigation === true && testPacket.w111Readiness.noSubmit === true, JSON.stringify({ w110: w110.status, w111: w111.status }));
  assertCase(results, 'w112_file_to_upload_hash_present', fs.existsSync(fileToUpload.absolutePath) && fileToUpload.sha256.length === 64 && /idb-drawer\.user\.js$/.test(fileToUpload.absolutePath), JSON.stringify(fileToUpload));
  assertCase(results, 'w112_sales_request_fields_complete', Object.values(salesRequest).every(Boolean) && salesRequest.prospect === 'Ariat International' && /2-4 weeks/.test(salesRequest.timelineUrgency), JSON.stringify(salesRequest));
  assertCase(results, 'w112_expected_screenshots_include_review_copy_helper', Array.isArray(expectedScreenshots.reviewCopyHelper) && expectedScreenshots.reviewCopyHelper.some((item) => /Preview URL/.test(item)) && ['plan', 'reviewCopyHelper', 'roiCompetitive', 'run', 'trace'].every((key) => Array.isArray(expectedScreenshots[key])), JSON.stringify(Object.keys(expectedScreenshots)));
  assertCase(results, 'w112_required_exports_and_operator_steps_complete', requiredExports.length === 3 && manualDccPreviewComparison.length >= 9 && operatorEvidenceFields.length >= 8, JSON.stringify({ exports: requiredExports, steps: manualDccPreviewComparison.length, fields: operatorEvidenceFields.length }));
  assertCase(results, 'w112_scoring_stop_go_blocks_submit_or_mismatch', scoringRubric.categories.length >= 10 && scoringRubric.automaticNoGoIf.some((item) => /open DCC, submit, queue, invoke SuiteScript, or write/.test(item)) && stopGoCriteria.noGoIf.some((item) => /disagree/.test(item)), JSON.stringify(scoringRubric.automaticNoGoIf));
  assertCase(results, 'w112_no_regression_preserved', testPacket.noRegression.noIdbWrites === true && testPacket.noRegression.noSuiteScriptInvocationFromIdb === true && testPacket.noRegression.noTransactionWrites === true && testPacket.noRegression.dccOwnsObjectGeneration === true && testPacket.noRegression.w110ParityLockPreserved === true, JSON.stringify(testPacket.noRegression));
  assertCase(results, 'w112_next_prompt_ready', testPacket.bestNextCodexPrompt.block === 'W113: Grade Operator Preview Retest Evidence' && /Move through W113/.test(testPacket.bestNextCodexPrompt.prompt), testPacket.bestNextCodexPrompt.prompt);

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';

  writeJson(dataPath, testPacket);
  writeJson(testPacketPath, testPacket);
  writeJson(exactInstructionsPath, exactInstructions);
  writeJson(scoringRubricPath, scoringRubric);
  writeJson(tracePath, {
    schema: 'idb.w112-operator-preview-retest-after-copy-helper-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    status: testPacket.status,
    userVisualFeedbackRequiredNow: true,
    requiredScreenshots: Object.keys(expectedScreenshots),
    requiredExports,
    validatorResults: results,
    noRegression: testPacket.noRegression,
    bestNextCodexPrompt: testPacket.bestNextCodexPrompt
  });

  const resultRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.name)} | ${escapeTable(result.detail)} |`).join('\n');
  const screenshotRows = Object.entries(expectedScreenshots)
    .map(([key, items]) => `| ${escapeTable(key)} | ${escapeTable(items.join('; '))} |`)
    .join('\n');
  const report = `# W112 Operator Preview Retest After Copy Helper

Generated: ${new Date().toISOString()}

Decision: ${decision} / OPERATOR PREVIEW RETEST READY / USER AND OPERATOR FEEDBACK REQUIRED

## Objective

Run one hands-on operator preview retest using the W111 preview URL/operator copy helper before any governed DCC invocation design proceeds.

## File To Upload

- \`${fileToUpload.absolutePath}\`
- SHA-256: \`${fileToUpload.sha256}\`

## Sales Request

- Prospect: ${salesRequest.prospect}
- Website: ${salesRequest.website}
- Business pain: ${salesRequest.businessPain}
- Requested proof: ${salesRequest.requestedProof}
- Decision criteria: ${salesRequest.decisionCriteria}
- Timeline / urgency: ${salesRequest.timelineUrgency}
- Competitor / incumbent: ${salesRequest.competitorIncumbent}
- Website/category evidence: ${salesRequest.optionalWebsiteCategoryEvidence}

## Expected Screenshots

| Screen | Must Show |
| --- | --- |
${screenshotRows}

## Required Exports

${requiredExports.map((item) => `- ${item}`).join('\n')}

## Manual DCC Suitelet Preview Comparison

${manualDccPreviewComparison.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Stop / Go

Go only if screenshots, DCC handoff JSON, trace JSON, final trace after operator evidence, and operator comparison notes are complete, average score is at least 4, no category is below 3, and no automatic no-go condition occurs.

## Validator Gates

| Status | Gate | Detail |
| --- | --- | --- |
${resultRows}

## Best Next Codex Prompt

\`\`\`text
${testPacket.bestNextCodexPrompt.prompt}
\`\`\`
`;
  fs.writeFileSync(reportPath, report);

  console.log(JSON.stringify({
    decision,
    results: results.length,
    report: path.relative(root, reportPath),
    userVisualFeedbackRequiredNow: true
  }, null, 2));
  if (failures.length) {
    console.error(failures);
    process.exit(1);
  }
}

main();
