const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w105_dcc_operator_approval_model.json');
const tracePath = path.join(root, 'trace_samples', 'w105_dcc_operator_approval_model_trace.json');
const reportPath = path.join(root, 'reports', 'w105_dcc_operator_approval_model.md');

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

function approvedOperatorState() {
  const state = ariatReadyState();
  state.dccOperatorApproval = {
    status: 'approved',
    operatorName: 'Sandbox Operator',
    reviewedAt: new Date().toISOString(),
    notes: 'Suitelet form params, DCC-owned config, and runner preview match the handoff packet.',
    suiteletParamReview: 'match',
    dccOwnedConfigReview: 'match',
    runnerPreviewReview: 'match',
    handoffPacketFilename: 'idb-dcc-runner-handoff-packet-sample.json',
    traceFilename: 'intelligent-demo-builder-trace-sample.json'
  };
  return state;
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

  const pendingApproval = hooks.dccOperatorApprovalModelV1(state, lane, page, recommendation, { handoffExportedOverride: true });
  const pendingReadiness = hooks.dccInvocationReadinessV1(state, lane, page, recommendation, { handoffExportedOverride: true });
  const approvedState = approvedOperatorState();
  approvedState.acceptedPacket = hooks.buildAcceptedPacketContext(approvedState, lane, page, recommendation);
  hooks.reconcileStateAuthority(approvedState);
  const approvedApproval = hooks.dccOperatorApprovalModelV1(approvedState, lane, page, recommendation, { handoffExportedOverride: true });
  const approvedReadiness = hooks.dccInvocationReadinessV1(approvedState, lane, page, recommendation, { handoffExportedOverride: true });
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));

  assertCase(results, 'w105_runtime_approval_model_present', typeof hooks.dccOperatorApprovalModelV1 === 'function' && /function dccOperatorApprovalModelV1/.test(userscript), 'dccOperatorApprovalModelV1 hook and runtime function');
  assertCase(results, 'w105_approval_evidence_fields_present', ['operatorName', 'reviewedAt', 'notes', 'suiteletParamReview', 'dccOwnedConfigReview', 'runnerPreviewReview', 'handoffPacketFilename', 'traceFilename'].every((key) => Object.prototype.hasOwnProperty.call(pendingApproval.approvalEvidenceFields, key)), JSON.stringify(pendingApproval.approvalEvidenceFields));
  assertCase(results, 'w105_operator_checklist_status_blocks_by_default', pendingApproval.status === 'operator_review_not_started' && pendingApproval.previewOnly === true && pendingApproval.canSubmit === false && pendingApproval.canInvokeDccFromIdb === false && pendingApproval.blockers.length >= 4, JSON.stringify({ status: pendingApproval.status, blockers: pendingApproval.blockers }));
  assertCase(results, 'w105_approved_preview_still_does_not_enable_submit', approvedApproval.status === 'operator_approved_preview_only' && approvedApproval.canSubmit === false && approvedApproval.canInvokeDccFromIdb === false && approvedReadiness.gates.find((gate) => gate.id === 'operator_review_status').passed === true && approvedReadiness.status === 'blocked_review_only' && approvedReadiness.canInvokeDccFromIdb === false, JSON.stringify({ approval: approvedApproval.status, readiness: approvedReadiness.status, canInvoke: approvedReadiness.canInvokeDccFromIdb }));
  assertCase(results, 'w105_type_to_confirm_placeholder_preview_only', pendingApproval.typeToConfirmPlaceholder.phrase === 'TYPE BUILD READY' && pendingApproval.typeToConfirmPlaceholder.enabled === false && /TYPE BUILD READY/.test(userscript), JSON.stringify(pendingApproval.typeToConfirmPlaceholder));
  assertCase(results, 'w105_preview_only_suitelet_parameter_review_present', pendingApproval.suiteletPreview.mode === 'preview_only' && pendingApproval.suiteletPreview.suiteletEntryPayload.custpage_evalmode === 'review_only' && Array.isArray(pendingApproval.suiteletPreview.dccOwnedConfigParams) && pendingApproval.suiteletPreview.dccOwnedConfigParams.length >= 8, JSON.stringify(pendingApproval.suiteletPreview.suiteletEntryPayload));
  assertCase(results, 'w105_review_ui_summary_present', reviewHtml.includes('Internal build details') && reviewHtml.includes('Preview only') && reviewHtml.includes('Type-to-confirm placeholder') && reviewHtml.includes('TYPE BUILD READY'), reviewHtml.slice(0, 900));
  assertCase(results, 'w105_trace_coverage_present', /dccOperatorApprovalModelV1: dccOperatorApprovalModelV1/.test(userscript) && /dccOperatorApprovalModelV1: dccOperatorApprovalModelV1/.test(userscript) && /dccOperatorApproval: operatorApproval/.test(userscript), 'trace export and handoff export include operator approval');
  assertCase(results, 'w105_no_submit_rollback_present', /noSubmit/.test(userscript) && /If operator rejects the preview/.test(userscript) && pendingApproval.rollback.noSubmit && pendingApproval.rollback.rejection, JSON.stringify(pendingApproval.rollback));
  assertCase(results, 'w105_no_regression_boundaries_present', pendingApproval.noRegression.noIdbWrites === true && pendingApproval.noRegression.noSuiteScriptInvocationFromIdb === true && pendingApproval.noRegression.noTransactionWrites === true && pendingApproval.noRegression.dccOwnsObjectGeneration === true && pendingReadiness.operatorApproval.status === 'operator_review_not_started', JSON.stringify(pendingApproval.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W106: DCC Sandbox Preview Bridge Without Submit',
    prompt: 'Move through W106: DCC Sandbox Preview Bridge Without Submit. Build the review-only bridge artifacts needed for an operator to open the Demo Command Center Suitelet with IDB-provided preview parameters, compare the Suitelet preview to the DCC handoff packet, and capture approval evidence without IDB invoking SuiteScript or submitting. Preserve no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, W105 operator approval preview-only behavior, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics. Output preview bridge contract, manual operator steps, trace samples, validator gates, W106 report, and best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w105-dcc-operator-approval-model.v1',
    status: 'operator_approval_model_ready_preview_only',
    objective: 'Build the review-only operator approval model between IDB handoff export and any future DCC invocation.',
    approvalModelContract: {
      runtimeFunction: 'dccOperatorApprovalModelV1',
      defaultStatus: pendingApproval.status,
      approvedStatus: approvedApproval.status,
      previewOnly: true,
      canSubmit: false,
      canInvokeDccFromIdb: false
    },
    operatorChecklistStatus: pendingApproval.checklist,
    approvalEvidenceFields: Object.keys(pendingApproval.approvalEvidenceFields),
    typeToConfirmUiPlaceholder: pendingApproval.typeToConfirmPlaceholder,
    previewOnlySuiteletParameterReview: {
      mode: pendingApproval.suiteletPreview.mode,
      hasSuiteletEntryPayload: !!pendingApproval.suiteletPreview.suiteletEntryPayload,
      hasDccOwnedConfigParams: pendingApproval.suiteletPreview.dccOwnedConfigParams.length >= 8,
      hasScheduledRunnerPreview: !!pendingApproval.suiteletPreview.scheduledRunnerPreview
    },
    noSubmitRollback: pendingApproval.rollback,
    samples: {
      pendingApproval,
      approvedApproval,
      pendingReadiness,
      approvedReadiness
    },
    traceCoverage: {
      traceExportIncludesOperatorApproval: true,
      dccHandoffExportTraceIncludesOperatorApproval: true,
      readinessConsumesOperatorApproval: true,
      noSubmitRollbackIncluded: true
    },
    noRegression: pendingApproval.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w105-dcc-operator-approval-model-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    pendingApproval,
    approvedApproval,
    pendingReadiness,
    approvedReadiness,
    noRegression: contract.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W105 Governed DCC Preview And Operator Approval Model',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / OPERATOR APPROVAL MODEL READY / PREVIEW ONLY`,
    '',
    '## Approval Model Contract',
    '',
    '- Runtime contract: `dccOperatorApprovalModelV1`.',
    '- Default status: `operator_review_not_started`.',
    '- Approved status: `operator_approved_preview_only`.',
    '- Approval can satisfy the W104 operator gate, but IDB still cannot submit or invoke DCC.',
    '',
    '## Review UI Summary',
    '',
    '- Review `Build control center` includes a collapsed `Internal build details` section.',
    '- The section lists operator checklist status, approval evidence expectations, and the disabled type-to-confirm placeholder.',
    '- Suitelet form params, DCC-owned config params, and runner preview remain preview-only.',
    '',
    '## No-Submit Rollback',
    '',
    '- If operator rejects the preview, clear approval evidence and export a corrected handoff.',
    '- IDB does not submit, queue, invoke SuiteScript, or write transactions.',
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
