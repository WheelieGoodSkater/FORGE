const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w106_dcc_sandbox_preview_bridge.json');
const tracePath = path.join(root, 'trace_samples', 'w106_dcc_sandbox_preview_bridge_trace.json');
const reportPath = path.join(root, 'reports', 'w106_dcc_sandbox_preview_bridge.md');

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
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function ariatReadyState() {
  const now = new Date().toISOString();
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    briefPrepared: true,
    dccPreviewBridge: {
      suiteletUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_dcc_preview&deploy=customdeploy_dcc_preview'
    },
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      competitor: 'Spreadsheets and disconnected inventory reports.',
      decisionCriteria: 'Must show style/SKU matrix fit, size/color visibility, channel availability, replenishment timing, and customer-to-order impact.'
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'review',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    websiteEvidenceV1: null,
    websiteResolverRuntime: {
      serviceName: 'websiteResolverServiceV1',
      mode: 'local_fallback',
      requestKey: 'ariat.com',
      endpointConfigured: false,
      localFallbackEnabled: true,
      status: 'resolved',
      failureState: ''
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: now
    }
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const state = ariatReadyState();

  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const bridge = hooks.dccSandboxPreviewBridgeV1(state, lane, page, recommendation, { handoffExportedOverride: true });
  const approval = hooks.dccOperatorApprovalModelV1(state, lane, page, recommendation, { handoffExportedOverride: true });
  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));

  assertCase(results, 'w106_runtime_preview_bridge_present', typeof hooks.dccSandboxPreviewBridgeV1 === 'function' && /function dccSandboxPreviewBridgeV1/.test(userscript), 'dccSandboxPreviewBridgeV1 hook and runtime function');
  assertCase(results, 'w106_bridge_manual_no_submit', bridge.status === 'preview_bridge_ready_manual_only' && bridge.mode === 'manual_preview_no_submit' && bridge.canOpenSuiteletFromIdb === false && bridge.canSubmit === false && bridge.canInvokeSuiteScriptFromIdb === false, JSON.stringify({ status: bridge.status, mode: bridge.mode, canSubmit: bridge.canSubmit }));
  assertCase(results, 'w106_preview_params_are_review_only', bridge.suiteletPreviewParams.custpage_evalmode === 'review_only' && bridge.suiteletPreviewParams.custpage_actionmode === 'previewbrief' && /custpage_evalmode/.test(bridge.previewUrl) && /custpage_actionmode/.test(bridge.previewUrl), JSON.stringify(bridge.suiteletPreviewParams));
  assertCase(results, 'w106_manual_operator_steps_complete', bridge.manualOperatorSteps.length >= 8 && bridge.manualOperatorSteps.some((item) => /Open the build preview manually/.test(item)) && bridge.manualOperatorSteps.some((item) => /do not submit/i.test(item)), bridge.manualOperatorSteps.join(' | '));
  assertCase(results, 'w106_comparison_checklist_covers_handoff_to_suitelet', ['prospect', 'website', 'notes', 'scenario', 'review_only', 'action_mode', 'dcc_config', 'runner_preview'].every((id) => bridge.comparisonChecklist.some((item) => item.id === id)), bridge.comparisonChecklist.map((item) => item.id).join(', '));
  assertCase(results, 'w106_approval_evidence_capture_reuses_w105', bridge.approvalEvidenceCapture && Object.prototype.hasOwnProperty.call(bridge.approvalEvidenceCapture, 'operatorName') && approval.previewOnly === true && approval.canSubmit === false, JSON.stringify(bridge.approvalEvidenceCapture));
  assertCase(results, 'w106_review_ui_summary_present', reviewHtml.includes('Internal preview bridge') && reviewHtml.includes('manual_preview_no_submit') && reviewHtml.includes('Submit from drawer') && reviewHtml.includes('no'), reviewHtml.slice(0, 1000));
  assertCase(results, 'w106_trace_export_coverage_present', /dccSandboxPreviewBridgeV1: dccSandboxPreviewBridgeV1/.test(userscript) && /dccSandboxPreviewBridge: sandboxPreviewBridge/.test(userscript), 'trace export and handoff export include sandbox preview bridge');
  assertCase(results, 'w106_w92_w105_boundaries_preserved', handoff.stateAuthority.handoffEligible === true && bridge.noRegression.w92StateAuthorityPreserved === true && bridge.noRegression.w105OperatorApprovalPreviewOnly === true && bridge.noRegression.noSuiteScriptInvocationFromIdb === true, JSON.stringify({ authority: handoff.stateAuthority.handoffEligible, noRegression: bridge.noRegression }));
  assertCase(results, 'w106_dcc_ownership_preserved', bridge.noRegression.dccOwnsObjectGeneration === true && handoff.noRegression.dccOwnsItemAssemblyBomLocationPlanningRoutingAndCsv === true && handoff.noRegression.noDccRunnerRewrite === true, JSON.stringify(handoff.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W107: Operator Preview Evidence Intake And Approval Capture',
    prompt: 'Move through W107: Operator Preview Evidence Intake And Approval Capture. Add the review-only evidence intake needed for an operator to paste preview comparison notes back into IDB: operator name, Suitelet param match status, DCC config match status, runner preview match status, notes, handoff filename, trace filename, approval/rejection status, and reset/rollback behavior. Preserve no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, W105 operator approval preview-only behavior, W106 manual preview bridge only, and DCC ownership of object generation. Output evidence intake UI, trace samples, validator gates, W107 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w106-dcc-sandbox-preview-bridge.v1',
    status: 'sandbox_preview_bridge_ready_manual_no_submit',
    objective: 'Build review-only bridge artifacts for an operator to open the Demo Command Center Suitelet with IDB-provided preview parameters and compare without IDB invoking SuiteScript.',
    previewBridgeContract: {
      runtimeFunction: 'dccSandboxPreviewBridgeV1',
      mode: bridge.mode,
      canOpenSuiteletFromIdb: bridge.canOpenSuiteletFromIdb,
      canSubmit: bridge.canSubmit,
      canInvokeSuiteScriptFromIdb: bridge.canInvokeSuiteScriptFromIdb
    },
    suiteletPreview: {
      baseUrl: bridge.suiteletBaseUrl,
      previewUrlRedaction: 'Non-secret sandbox URL and query params only; no tokens or secrets.',
      params: bridge.suiteletPreviewParams
    },
    manualOperatorSteps: bridge.manualOperatorSteps,
    comparisonChecklist: bridge.comparisonChecklist,
    approvalEvidenceCapture: Object.keys(bridge.approvalEvidenceCapture),
    rollback: bridge.rollback,
    samples: {
      bridge,
      handoffStatus: handoff.status,
      operatorApprovalStatus: approval.status
    },
    traceCoverage: {
      traceExportIncludesSandboxPreviewBridge: true,
      dccHandoffExportTraceIncludesSandboxPreviewBridge: true,
      manualStepsIncluded: true,
      comparisonChecklistIncluded: true
    },
    noRegression: bridge.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w106-dcc-sandbox-preview-bridge-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    bridge,
    handoffStatus: handoff.status,
    operatorApprovalStatus: approval.status,
    noRegression: contract.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W106 DCC Sandbox Preview Bridge Without Submit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / SANDBOX PREVIEW BRIDGE READY / MANUAL ONLY / NO SUBMIT`,
    '',
    '## Preview Bridge Contract',
    '',
    '- Runtime contract: `dccSandboxPreviewBridgeV1`.',
    '- Mode: `manual_preview_no_submit`.',
    '- IDB does not open the Suitelet, invoke SuiteScript, submit, queue, or write.',
    '- Operator manually opens the Demo Command Center Suitelet and compares preview params to the DCC handoff packet.',
    '',
    '## Manual Operator Steps',
    '',
    bridge.manualOperatorSteps.map((item) => `- ${item}`).join('\n'),
    '',
    '## Comparison Checklist',
    '',
    '| Field | IDB Preview Value |',
    '| --- | --- |',
    ...bridge.comparisonChecklist.map((item) => `| ${escapeTable(item.label)} | ${escapeTable(item.idbValue)} |`),
    '',
    '## Validator Gates',
    '',
    '| Gate | Result | Detail |',
    '| --- | --- | --- |',
    ...results.map((result) => `| ${escapeTable(result.name)} | ${result.pass ? 'PASS' : 'FAIL'} | ${escapeTable(result.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextCodexPrompt.prompt,
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
