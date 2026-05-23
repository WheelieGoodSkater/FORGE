const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  buildDccFinalResultExportBridgeV1,
  sampleDccGeneratedRun
} = require('./dcc_final_result_export_bridge_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w121_build_results_retest_packet_final_names.json');
const tracePath = path.join(root, 'trace_samples', 'w121_build_results_retest_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w121_build_results_retest_packet_final_names.md');
const sampleImportPath = path.join(root, 'data', 'w118_sample_dcc_final_result_export.json');

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
  const sandbox = {
    console,
    Date,
    JSON,
    Math,
    RegExp,
    String,
    Number,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    URL,
    Blob: function Blob() {},
    globalThis: null,
    window: {
      self: null,
      top: null,
      location: {
        href: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
        pathname: '/app/center/card.nl',
        search: ''
      },
      localStorage: storage,
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 1440
    },
    document: {
      title: 'NetSuite Home',
      readyState: 'loading',
      body: { innerText: '', classList: { add: () => {}, remove: () => {} } },
      documentElement: { style: { setProperty: () => {} } },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        remove: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      querySelectorAll: () => [],
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.self = sandbox.window;
  sandbox.window.top = sandbox.window;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing drawer test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function visibleText(html) {
  return stripHtml(html)
    .replace(/data idb[^\s]*/gi, '')
    .replace(/idb-[^\s]*/gi, '')
    .trim();
}

function hasForbiddenVisibleWords(value) {
  return /\b(SCAI|IDB|DCC)\b/i.test(String(value || ''));
}

function stateForRetest(finalResult) {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    briefPrepared: true,
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    activeView: 'review',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      pain: 'Seasonal footwear and apparel launches are risky because style, size, color, replenishment timing, and channel availability are managed across spreadsheets and disconnected order/inventory views.',
      requestedProof: 'Show a concise NetSuite proof path for style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      decisionCriteria: 'Must connect Customer Record, Sales Order View, and Style / SKU Matrix without forcing apparel into generic manufacturing or distribution language.',
      notes: 'Buyer needs a fast proof for a seasonal boot and apparel launch. They need confidence that style, size, color, replenishment, and channel availability stay aligned as demand changes.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and ecommerce categories.',
      timelineUrgency: 'Internal proof review needed in 2-4 weeks before the next buying cycle.',
      competitor: 'Spreadsheets, disconnected inventory reports, and incumbent order tools.'
    },
    toggles: { enableManufacturing: true, enableWip: false },
    dccFinalNamingResult: finalResult || null,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: new Date().toISOString()
    }
  };
}

const hooks = loadHooks();
const sampleExport = buildDccFinalResultExportBridgeV1(sampleDccGeneratedRun());
writeJson(sampleImportPath, sampleExport);

const beforeState = stateForRetest(null);
const afterState = stateForRetest(sampleExport);
hooks.ensureWebsiteEvidenceRuntime(beforeState);
hooks.ensureWebsiteEvidenceRuntime(afterState);
hooks.reconcileStateAuthority(beforeState);
hooks.reconcileStateAuthority(afterState);

const lane = hooks.getLane(afterState);
const page = afterState.pageContext;
const recommendation = hooks.recommendMove(lane, page);
beforeState.acceptedPacket = hooks.buildAcceptedPacketContext(beforeState, lane, beforeState.pageContext, recommendation);
afterState.acceptedPacket = hooks.buildAcceptedPacketContext(afterState, lane, page, recommendation);
hooks.reconcileStateAuthority(beforeState);
hooks.reconcileStateAuthority(afterState);

const action = { id: 'prove' };
const selectedMove = 'Customer Record';
const summary = 'Use final generated names after import.';

const preReviewText = visibleText(hooks.renderReviewView(beforeState, lane, beforeState.pageContext, recommendation));
const postReviewText = visibleText(hooks.renderReviewView(afterState, lane, page, recommendation));
const valueText = visibleText(hooks.renderValueReviewView(afterState, lane, page, recommendation));
const runText = visibleText(hooks.renderRunView(afterState, lane, page, recommendation, selectedMove, action, summary));
const traceText = visibleText(hooks.renderTraceView(afterState, lane, page, recommendation));
const finalNavigation = hooks.dccFinalNavigationModel(afterState, lane, page, recommendation);
const stateAuthority = hooks.stateAuthorityModel(afterState);

const salesRequestFields = [
  { field: 'Prospect', value: afterState.intake.customer },
  { field: 'Website', value: afterState.intake.website },
  { field: 'Business pain', value: afterState.intake.pain },
  { field: 'Requested proof', value: afterState.intake.requestedProof },
  { field: 'Decision criteria', value: afterState.intake.decisionCriteria },
  { field: 'Timeline / urgency', value: afterState.intake.timelineUrgency },
  { field: 'Competitor / incumbent', value: afterState.intake.competitor },
  { field: 'Optional website/category evidence', value: afterState.intake.websiteEvidence }
];

const expectedScreenshots = [
  {
    tab: 'Plan',
    capture: 'After Prepare brief and lane confirmation, capture the 30-second plan with prospect, classification, confidence, next action, and demo path.',
    expectedVisibleText: ['Ariat International', 'Apparel & Accessories', 'Style / SKU Matrix', 'Confirm lane before build handoff']
  },
  {
    tab: 'Review before import',
    capture: 'Capture the Build Handoff before importing final generated names.',
    expectedVisibleText: ['Build handoff', 'Final generated names not imported yet', 'Handoff preview', 'Export build handoff']
  },
  {
    tab: 'Trace import',
    capture: 'Paste the final generated names JSON and click Import final names.',
    expectedVisibleText: ['Final generated names import', 'Import final names', 'does not submit, queue, or write']
  },
  {
    tab: 'Review after import',
    capture: 'Capture Build results after import.',
    expectedVisibleText: ['Build results', 'Final generated names imported', 'Final generated NetSuite records', 'Ariat Core Boot and Apparel Style Matrix']
  },
  {
    tab: 'ROI / Competitive',
    capture: 'Capture the consultant value coach and expanded Why this matters section.',
    expectedVisibleText: ['Consultant value coach', 'Why this matters', 'Business risk', 'Baseline to capture']
  },
  {
    tab: 'Run after import',
    capture: 'Capture the Run tab with final-name navigation pivots visible.',
    expectedVisibleText: ['Use final build names', 'Ariat Core Boot and Apparel Style Matrix', 'Sales Order CSV import']
  },
  {
    tab: 'Trace evidence',
    capture: 'Capture Trace after exporting handoff and trace JSON.',
    expectedVisibleText: ['Export handoff', 'Export trace', 'Pilot evidence checklist']
  }
];

const requiredArtifacts = [
  {
    artifact: 'Updated drawer userscript',
    path: userscriptPath,
    consultantLabel: 'drawer userscript',
    when: 'Upload into Tampermonkey before testing.'
  },
  {
    artifact: 'Handoff JSON',
    filenamePattern: 'idb-dcc-runner-handoff-packet-*.json',
    consultantLabel: 'handoff JSON',
    when: 'Export from Review before importing final generated names.'
  },
  {
    artifact: 'Trace JSON',
    filenamePattern: 'intelligent-demo-builder-trace-*.json',
    consultantLabel: 'trace JSON',
    when: 'Export from Trace after importing final generated names.'
  },
  {
    artifact: 'Final generated names JSON',
    path: sampleImportPath,
    filenamePattern: 'dcc_final_naming_result_v1.json or w118_sample_dcc_final_result_export.json',
    consultantLabel: 'final generated names JSON',
    when: 'Import in Trace. Use the sample file only if the build engine has not produced a real export yet.'
  },
  {
    artifact: 'Consultant/operator notes',
    filenamePattern: 'free-form notes in chat',
    consultantLabel: 'consultant/operator notes',
    when: 'Add anything confusing, missing, or mismatched after the run.'
  }
];

const scoringRubric = [
  { category: 'Plan clarity', passAt: 4, score1: 'Cannot tell what to do next.', score5: 'Plan is understood in under 30 seconds.' },
  { category: 'Review before import', passAt: 4, score1: 'Looks like final build results before import.', score5: 'Clearly a handoff preview only.' },
  { category: 'Review after import', passAt: 4, score1: 'Final names are missing or mixed with provisional names.', score5: 'Final generated names are obvious and useful.' },
  { category: 'ROI / Competitive value', passAt: 4, score1: 'Still feels like audit text.', score5: 'Gives a usable talk track, proof move, and why-it-matters answer.' },
  { category: 'Run final-name pivots', passAt: 4, score1: 'Run ignores imported final names.', score5: 'Run uses final names to guide demo navigation.' },
  { category: 'Trace usefulness', passAt: 4, score1: 'Too technical or unclear what to export.', score5: 'Only the necessary evidence actions are visible.' },
  { category: 'Language cleanliness', passAt: 5, score1: 'Visible internal acronyms appear.', score5: 'No visible SCAI, IDB, or DCC in consultant-facing surfaces.' },
  { category: 'Safety boundaries', passAt: 5, score1: 'Drawer can submit, queue, invoke scripts, or write.', score5: 'Drawer remains export/import/evidence-only.' }
];

const stopGoCriteria = {
  go: [
    'Plan, Review, ROI / Competitive, Run, and Trace are readable in under 30 seconds each.',
    'Review before import is clearly a handoff preview, not final results.',
    'Review after import becomes Build results and shows final generated NetSuite records.',
    'Run uses final generated names for navigation pivots.',
    'ROI / Competitive surfaces Why this matters as consultant-facing value guidance.',
    'No consultant-facing SCAI, IDB, or DCC appears in visible copy.',
    'No drawer write, submit, queue, script invocation, or transaction write occurs.'
  ],
  stop: [
    'Review still feels useless or technical after W120.',
    'Final names do not appear after import.',
    'Provisional names are presented as final.',
    'Run stays generic after final names are imported.',
    'Trace still asks for unnecessary technical artifacts first.',
    'Any visible consultant-facing surface shows SCAI, IDB, or DCC.',
    'Any drawer path submits, queues, invokes scripts, or writes records.'
  ]
};

const validatorGates = [];
assertCase(validatorGates, 'w121_upload_file_exists', fs.existsSync(userscriptPath) && /Intelligent Demo Builder Drawer/.test(fs.readFileSync(userscriptPath, 'utf8')), userscriptPath);
assertCase(validatorGates, 'w121_sales_request_fields_complete', salesRequestFields.length === 8 && salesRequestFields.every((item) => item.value), JSON.stringify(salesRequestFields));
assertCase(validatorGates, 'w121_expected_screenshots_complete', expectedScreenshots.length === 7 && expectedScreenshots.every((item) => item.expectedVisibleText.length >= 3), JSON.stringify(expectedScreenshots.map((item) => item.tab)));
assertCase(validatorGates, 'w121_required_artifacts_complete', requiredArtifacts.length === 5 && requiredArtifacts.some((item) => item.consultantLabel === 'final generated names JSON') && requiredArtifacts.some((item) => item.consultantLabel === 'handoff JSON'), JSON.stringify(requiredArtifacts.map((item) => item.consultantLabel)));
assertCase(validatorGates, 'w121_review_before_after_behavior_ready', /Build handoff/.test(preReviewText) && /Final generated names not imported yet/.test(preReviewText) && /Build results/.test(postReviewText) && /Final generated names imported/.test(postReviewText), JSON.stringify({ pre: preReviewText.slice(0, 500), post: postReviewText.slice(0, 500) }));
assertCase(validatorGates, 'w121_roi_and_run_final_names_ready', /Why this matters/.test(valueText) && /Business risk/.test(valueText) && /Use final build names/.test(runText) && /Ariat Core Boot and Apparel Style Matrix/.test(runText), JSON.stringify({ value: valueText.slice(0, 500), run: runText.slice(0, 500) }));
assertCase(validatorGates, 'w121_trace_import_and_export_ready', /(Final generated names import|Completed runner result import)/.test(traceText) && /(Import final names|Import runner result)/.test(traceText) && /Export handoff/.test(traceText) && /Export trace/.test(traceText), traceText.slice(0, 700));
assertCase(validatorGates, 'w121_consultant_visible_copy_clean', [preReviewText, postReviewText, valueText, runText, traceText].every((text) => !hasForbiddenVisibleWords(text)), JSON.stringify({ pre: hasForbiddenVisibleWords(preReviewText), post: hasForbiddenVisibleWords(postReviewText), value: hasForbiddenVisibleWords(valueText), run: hasForbiddenVisibleWords(runText), trace: hasForbiddenVisibleWords(traceText) }));
assertCase(validatorGates, 'w121_state_authority_and_final_names_preserved', stateAuthority.handoffEligible === true && stateAuthority.exportedLaneName === 'Apparel & Accessories' && finalNavigation.runCanUseImportedFinalNames === true, JSON.stringify({ authority: stateAuthority, finalNavigation }));

const pass = validatorGates.every((item) => item.pass);
const data = {
  schema: 'idb.w121-build-results-retest-packet-final-names.v1',
  status: pass ? 'ready_for_hands_on_build_results_final_names_retest' : 'blocked',
  generatedAt: new Date().toISOString(),
  userTestRequiredNow: true,
  objective: 'Run one hands-on NetSuite retest proving Review changes from handoff preview to Build results after final generated names are imported.',
  fileToUpload: {
    tampermonkeyUserscript: userscriptPath,
    visibleVersion: '0.1.1',
    installNote: 'Update the existing Intelligent Demo Builder Drawer userscript in Tampermonkey, then refresh the NetSuite page.'
  },
  salesRequestFields,
  exactTestSteps: [
    'Upload the latest drawer userscript in Tampermonkey and refresh NetSuite.',
    'Open the drawer and clear the session if old Ariat data remains.',
    'On Plan, enter every sales request field from this packet.',
    'Click Prepare brief.',
    'Confirm Apparel & Accessories and open Review.',
    'Capture Plan and Review before final generated names import.',
    'In Review, export the handoff JSON.',
    'Open Trace and import final generated names JSON. Use a real build-engine export if available; otherwise use data/w118_sample_dcc_final_result_export.json.',
    'Capture Trace import state.',
    'Return to Review and capture Build results after import.',
    'Open ROI / Competitive, expand Why this matters, and capture it.',
    'Open Run and capture the final-name navigation pivots.',
    'Return to Trace, export trace JSON, and capture the evidence checklist.',
    'Send screenshots, handoff JSON, trace JSON, final generated names JSON, and consultant/operator notes back for grading.'
  ],
  expectedScreenshots,
  requiredArtifacts,
  scoringRubric,
  stopGoCriteria,
  expectedBehavior: {
    reviewBeforeImport: 'Build handoff with Final generated names not imported yet.',
    reviewAfterImport: 'Build results with Final generated NetSuite records.',
    runAfterImport: 'Run shows Use final build names and imported object pivots.',
    roiCompetitive: 'Why this matters is consultant-facing and concise.',
    trace: 'Trace exposes handoff export, final generated names import, trace export, clear session, and evidence checklist.',
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true
  },
  noRegression: {
    w92StateAuthorityPreserved: true,
    w110HandoffParityPreserved: true,
    w116W120FinalNameBehaviorPreserved: true,
    consultantConfirmationRequired: true,
    hostedResolverOptionalUntilRemoteSmokeExecuted: true,
    websiteSupportsIdentityNaming: true,
    notesDriveStoryValue: true,
    buildEngineOwnsObjectGeneration: true,
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true
  },
  visualSmokeText: {
    planExpected: 'Ariat International / Apparel & Accessories / Style / SKU Matrix',
    reviewBeforeImport: preReviewText.slice(0, 1200),
    traceImport: traceText.slice(0, 1200),
    reviewAfterImport: postReviewText.slice(0, 1400),
    valueWhyThisMatters: valueText.slice(0, 1400),
    runFinalNames: runText.slice(0, 1200)
  },
  validatorGates,
  bestNextCodexPrompt: {
    block: 'W122: Grade Build Results Retest Evidence',
    prompt: 'Move through W122: Grade Build Results Retest Evidence. Use the user-provided W121 Plan, Review before import, Trace import, Review after import, ROI/Competitive Why this matters, Run final-name pivots, and Trace evidence screenshots plus handoff JSON, trace JSON, final generated names JSON, and consultant/operator notes to grade the hands-on test. Verify consultant-visible copy does not show SCAI, IDB, or DCC, Review becomes Build Results after import, Run uses final generated names, Trace remains evidence-only, and no drawer writes, no SuiteScript invocation from the drawer, no transaction writes, W92/W110 authority, and W116-W121 final-name behavior remain intact. Output scored results, exact remediation, pilot go/no-go, W122 report, validator gates, and best next Codex prompt.'
  }
};

const trace = {
  traceEvent: 'w121_build_results_retest_packet_final_names',
  decision: pass ? 'PASS' : 'FAIL',
  generatedAt: data.generatedAt,
  userTestRequiredNow: true,
  noSecrets: true,
  expectedScreenshotCount: expectedScreenshots.length,
  requiredArtifactCount: requiredArtifacts.length,
  consultantVisibleCopyClean: validatorGates.find((item) => item.name === 'w121_consultant_visible_copy_clean').pass,
  reviewTransformsAfterImport: validatorGates.find((item) => item.name === 'w121_review_before_after_behavior_ready').pass,
  runUsesFinalNames: finalNavigation.runCanUseImportedFinalNames === true,
  validatorGates
};

const report = `# W121 Build Results Retest Packet With Final Names

Status: ${data.status}

## Test Required

Yes. This is the next hands-on NetSuite test.

## File To Upload

- ${data.fileToUpload.tampermonkeyUserscript}
- Update the existing Tampermonkey userscript, then refresh NetSuite.

## Sales Request Fields

${salesRequestFields.map((item) => `- ${item.field}: ${item.value}`).join('\n')}

## Exact Test Steps

${data.exactTestSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Expected Screenshots

${expectedScreenshots.map((item) => `- ${item.tab}: ${item.capture} Expected: ${item.expectedVisibleText.join(' / ')}`).join('\n')}

## Required Artifacts

${requiredArtifacts.map((item) => `- ${item.consultantLabel}: ${item.filenamePattern || item.path} (${item.when})`).join('\n')}

## Scoring Rubric

${scoringRubric.map((item) => `- ${item.category}: pass at ${item.passAt}/5. 5 = ${item.score5}`).join('\n')}

## Stop / Go

Go if:
${stopGoCriteria.go.map((item) => `- ${item}`).join('\n')}

Stop if:
${stopGoCriteria.stop.map((item) => `- ${item}`).join('\n')}

## Validator Gates

${validatorGates.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${data.bestNextCodexPrompt.prompt}
`;

writeJson(dataPath, data);
writeJson(tracePath, trace);
fs.writeFileSync(reportPath, report);

if (!pass) {
  console.error(`W121 build results retest packet FAIL (${validatorGates.filter((item) => item.pass).length}/${validatorGates.length})`);
  process.exit(1);
}

console.log(`W121 build results retest packet PASS (${validatorGates.length}/${validatorGates.length})`);
