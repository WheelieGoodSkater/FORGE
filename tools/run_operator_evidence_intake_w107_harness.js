const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w107_operator_preview_evidence_intake.json');
const tracePath = path.join(root, 'trace_samples', 'w107_operator_preview_evidence_intake_trace.json');
const reportPath = path.join(root, 'reports', 'w107_operator_preview_evidence_intake.md');

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

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function ariatReadyState(approvalPatch) {
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
    dccOperatorApproval: approvalPatch || null,
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

function prepareState(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const results = [];
  const approvedState = ariatReadyState({
    status: 'approved',
    operatorName: 'Sandbox Operator',
    reviewedAt: new Date().toISOString(),
    notes: 'Suitelet params, DCC config, and runner preview match the exported DCC handoff packet.',
    suiteletParamReview: 'match',
    dccOwnedConfigReview: 'match',
    runnerPreviewReview: 'match',
    handoffPacketFilename: 'idb-dcc-runner-handoff-packet-1778766076074.json',
    traceFilename: 'intelligent-demo-builder-trace-1778766225474.json'
  });
  const rejectedState = ariatReadyState({
    status: 'rejected',
    operatorName: 'Sandbox Operator',
    reviewedAt: new Date().toISOString(),
    notes: 'Runner preview does not match the handoff packet scenario.',
    suiteletParamReview: 'match',
    dccOwnedConfigReview: 'match',
    runnerPreviewReview: 'missing',
    handoffPacketFilename: 'idb-dcc-runner-handoff-packet-rejected.json',
    traceFilename: 'intelligent-demo-builder-trace-rejected.json'
  });
  const pendingState = ariatReadyState();

  const approvedContext = prepareState(hooks, approvedState);
  const rejectedContext = prepareState(hooks, rejectedState);
  const pendingContext = prepareState(hooks, pendingState);

  const approvedIntake = hooks.operatorApprovalEvidenceIntakeV1(approvedState, approvedContext.lane, approvedContext.page, approvedContext.recommendation, { handoffExportedOverride: true });
  const approvedModel = hooks.dccOperatorApprovalModelV1(approvedState, approvedContext.lane, approvedContext.page, approvedContext.recommendation, { handoffExportedOverride: true });
  const rejectedIntake = hooks.operatorApprovalEvidenceIntakeV1(rejectedState, rejectedContext.lane, rejectedContext.page, rejectedContext.recommendation, { handoffExportedOverride: true });
  const bridge = hooks.dccSandboxPreviewBridgeV1(approvedState, approvedContext.lane, approvedContext.page, approvedContext.recommendation, { handoffExportedOverride: true });
  const invocation = hooks.dccInvocationReadinessV1(approvedState, approvedContext.lane, approvedContext.page, approvedContext.recommendation, { handoffExportedOverride: true });
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(pendingState, pendingContext.lane, pendingContext.page, pendingContext.recommendation));

  assertCase(results, 'w107_runtime_evidence_intake_present', typeof hooks.operatorApprovalEvidenceIntakeV1 === 'function' && /function operatorApprovalEvidenceIntakeV1/.test(userscript), 'operatorApprovalEvidenceIntakeV1 hook and runtime function');
  assertCase(results, 'w107_review_ui_fields_present', reviewHtml.includes('Operator evidence intake') && reviewHtml.includes('data-idb-operator-approval="operatorName"') && reviewHtml.includes('data-idb-operator-approval="suiteletParamReview"') && reviewHtml.includes('data-idb-operator-approval="dccOwnedConfigReview"') && reviewHtml.includes('data-idb-operator-approval="runnerPreviewReview"'), reviewHtml.slice(0, 1000));
  assertCase(results, 'w107_review_ui_approval_rejection_reset_present', reviewHtml.includes('data-idb-operator-approval-status="approved"') && reviewHtml.includes('data-idb-operator-approval-status="rejected"') && reviewHtml.includes('data-idb-clear-operator-approval') && reviewHtml.includes('cannot submit, queue, invoke scripts, or write'), reviewHtml.slice(0, 1000));
  assertCase(results, 'w107_approved_preview_only_status', approvedModel.status === 'operator_approved_preview_only' && approvedIntake.status === 'operator_approved_preview_only' && approvedIntake.canSubmit === false && approvedIntake.canInvokeSuiteScriptFromIdb === false, JSON.stringify({ model: approvedModel.status, intake: approvedIntake.status }));
  assertCase(results, 'w107_rejected_preview_rolls_back', rejectedIntake.status === 'operator_rejected' && rejectedIntake.approvalControls.resetRollbackBehavior.rejection.includes('clear approval evidence'), JSON.stringify(rejectedIntake.approvalControls.resetRollbackBehavior));
  assertCase(results, 'w107_trace_export_coverage_present', /operatorApprovalEvidenceIntakeV1: operatorApprovalEvidenceIntakeV1/.test(userscript) && /operatorApprovalEvidenceIntake: operatorEvidenceIntake/.test(userscript) && /operator_preview_evidence_updated/.test(userscript) && /operator_preview_evidence_cleared/.test(userscript), 'trace export, handoff export trace, update, and clear events present');
  assertCase(results, 'w107_w105_w106_preview_only_preserved', bridge.canSubmit === false && bridge.canInvokeSuiteScriptFromIdb === false && approvedIntake.previewBridgeStatus === 'preview_bridge_ready_manual_only' && invocation.canInvokeDccFromIdb === false, JSON.stringify({ bridge: bridge.status, invocation: invocation.status }));
  assertCase(results, 'w107_no_regression_boundaries_preserved', approvedIntake.noRegression.noIdbWrites === true && approvedIntake.noRegression.noSuiteScriptInvocationFromIdb === true && approvedIntake.noRegression.noTransactionWrites === true && approvedIntake.noRegression.dccOwnsObjectGeneration === true, JSON.stringify(approvedIntake.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W108: Operator Preview Retest Packet And Go/No-Go',
    prompt: 'Move through W108: Operator Preview Retest Packet And Go/No-Go. Use W104-W107 to produce the exact hands-on operator preview test: file to upload, realistic sales request, DCC handoff export, trace export, manual Demo Command Center Suitelet preview steps, operator evidence fields to capture, screenshots, scoring rubric, stop/go criteria, and no-regression gates. Preserve no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, W105/W106/W107 preview-only behavior, and DCC ownership of object generation. Output test packet, validator gates, W108 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w107-operator-preview-evidence-intake.v1',
    status: 'operator_preview_evidence_intake_ready',
    objective: 'Capture operator preview comparison evidence back into IDB without invoking SuiteScript or submitting to DCC.',
    evidenceFields: Object.keys(approvedIntake.fields),
    statusOptions: approvedIntake.requiredStatuses,
    uiControls: {
      operatorEvidenceInputs: true,
      approvePreviewButton: true,
      rejectPreviewButton: true,
      clearEvidenceRollback: true,
      submitFromIdb: false
    },
    samples: {
      approvedIntake,
      rejectedIntake,
      operatorApprovalModel: approvedModel,
      sandboxPreviewBridge: bridge,
      invocationReadiness: invocation
    },
    traceCoverage: approvedIntake.traceCoverage,
    noRegression: approvedIntake.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w107-operator-preview-evidence-intake-trace.v1',
    decision,
    pass: failures.length === 0,
    operatorApprovalEvidenceIntakeV1: approvedIntake,
    rejectedOperatorApprovalEvidenceIntakeV1: rejectedIntake,
    noRegression: approvedIntake.noRegression,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const reportRows = results.map((result) => `| ${result.pass ? 'PASS' : 'FAIL'} | ${result.name} | ${String(result.detail || '').replace(/\|/g, '/').slice(0, 220)} |`).join('\n');
  const report = [
    '# W107 Operator Preview Evidence Intake And Approval Capture',
    '',
    `Decision: ${decision} / OPERATOR EVIDENCE INTAKE READY / PREVIEW ONLY`,
    '',
    '## What Changed',
    '- Added operator preview evidence intake fields in Review: operator name, Suitelet params, DCC config, runner preview, notes, DCC handoff filename, trace filename, approval, rejection, and clear evidence rollback.',
    '- Preserved W105/W106 behavior: operator evidence can approve the preview state, but IDB still cannot submit, invoke SuiteScript, or write transactions.',
    '- Added W107 trace/export coverage so operator approval evidence is visible in trace JSON and DCC handoff export trace events.',
    '',
    '## Validator Gates',
    '| Status | Gate | Detail |',
    '| --- | --- | --- |',
    reportRows,
    '',
    '## Best Next Codex Prompt',
    bestNextCodexPrompt.prompt
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(JSON.stringify({ decision, failures }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ decision, results: results.length, report: path.relative(root, reportPath) }, null, 2));
}

main();
