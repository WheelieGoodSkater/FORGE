const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w104_dcc_invocation_readiness.json');
const tracePath = path.join(root, 'trace_samples', 'w104_dcc_invocation_readiness_trace.json');
const reportPath = path.join(root, 'reports', 'w104_dcc_invocation_readiness.md');

function makeStorage(initial) {
  const store = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks(initialStorage) {
  const storage = makeStorage(initialStorage);
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

  const handoff = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const blockedReadiness = hooks.dccInvocationReadinessV1(state, lane, page, recommendation);
  const exportedReadiness = hooks.dccInvocationReadinessV1(state, lane, page, recommendation, { handoffExportedOverride: true });
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));

  assertCase(results, 'w104_runtime_contract_function_present', typeof hooks.dccInvocationReadinessV1 === 'function' && /function dccInvocationReadinessV1/.test(userscript), 'dccInvocationReadinessV1 hook and runtime function');
  assertCase(results, 'w104_required_gates_present', ['prepared_brief', 'confirmed_lane', 'confirmed_dcc_pack_scenario', 'exported_handoff_packet', 'operator_review_status', 'type_to_confirm_placeholder'].every((id) => blockedReadiness.gates.some((gate) => gate.id === id)), blockedReadiness.gates.map((gate) => gate.id).join(', '));
  assertCase(results, 'w104_review_only_default_blocks_invocation', blockedReadiness.status === 'blocked_review_only' && blockedReadiness.canInvokeDccFromIdb === false && blockedReadiness.reviewOnlyDefault === true, JSON.stringify({ status: blockedReadiness.status, canInvoke: blockedReadiness.canInvokeDccFromIdb }));
  assertCase(results, 'w104_export_gate_changes_without_enabling_invocation', exportedReadiness.gates.find((gate) => gate.id === 'exported_handoff_packet').passed === true && exportedReadiness.canInvokeDccFromIdb === false && exportedReadiness.blockers.some((item) => /Operator approval/.test(item)), JSON.stringify(exportedReadiness.blockers));
  assertCase(results, 'w104_operator_and_type_to_confirm_placeholders_block', exportedReadiness.gates.find((gate) => gate.id === 'operator_review_status').passed === false && exportedReadiness.gates.find((gate) => gate.id === 'type_to_confirm_placeholder').passed === false && exportedReadiness.requiredPhrase === 'TYPE BUILD READY', JSON.stringify({ requiredPhrase: exportedReadiness.requiredPhrase }));
  assertCase(results, 'w104_review_ui_readiness_summary_present', reviewHtml.includes('Future invocation readiness') && reviewHtml.includes('Future type-to-confirm phrase') && reviewHtml.includes('TYPE BUILD READY'), reviewHtml.slice(0, 700));
  assertCase(results, 'w104_trace_export_coverage_present', /dccInvocationReadinessV1: dccInvocationReadinessV1/.test(userscript) && /dccInvocationReadiness: invocationReadiness/.test(userscript) && /handoffExportedOverride: true/.test(userscript), 'trace export and handoff export include readiness');
  assertCase(results, 'w104_w92_state_authority_preserved', handoff.stateAuthority.handoffEligible === true && handoff.stateAuthority.selectedLaneId === handoff.stateAuthority.confirmedLaneId && handoff.stateAuthority.confirmedLaneId === handoff.stateAuthority.exportedLaneId, JSON.stringify(handoff.stateAuthority));
  assertCase(results, 'w104_no_regression_boundaries_present', blockedReadiness.noRegression.noIdbWrites === true && blockedReadiness.noRegression.noSuiteScriptInvocationFromIdb === true && blockedReadiness.noRegression.noTransactionWrites === true && blockedReadiness.noRegression.dccOwnsObjectGeneration === true && /noSuiteScriptInvocationFromIdb: true/.test(userscript) && /noIdbTransactionWrite: true/.test(userscript), JSON.stringify(blockedReadiness.noRegression));
  assertCase(results, 'w104_dcc_runner_mechanics_unchanged_boundary', handoff.noRegression.noDccRunnerRewrite === true && handoff.noRegression.dccOwnsItemAssemblyBomLocationPlanningRoutingAndCsv === true && handoff.executionMode === 'review_only_no_submit', JSON.stringify(handoff.noRegression));

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W105: Governed DCC Preview And Operator Approval Model',
    prompt: 'Move through W105: Governed DCC Preview And Operator Approval Model. Build the review-only operator approval model that sits between IDB handoff export and any future DCC invocation: operator checklist status, approval evidence fields, type-to-confirm UI placeholder, preview-only Suitelet parameter review, no-submit rollback, and trace coverage. Preserve no IDB writes, no SuiteScript invocation from IDB, no transaction writes, hosted resolver optional until remoteSmokeExecuted=true, notes story-only, consultant confirmation required, W92 state authority, and DCC ownership of item names, assemblies, BOMs, locations, planning, routing/WIP, CSV, and Sales Order mechanics. Output approval model contract, Review UI summary, trace samples, validator gates, W105 report, and best next Codex prompt.'
  };

  const safetyGateMatrix = blockedReadiness.gates.map((gate) => ({
    id: gate.id,
    label: gate.label,
    required: gate.required,
    currentState: gate.passed ? 'pass' : 'blocked',
    blocker: gate.passed ? '' : gate.blocker
  }));

  const contract = {
    schema: 'idb.w104-dcc-invocation-readiness.v1',
    status: 'dcc_invocation_readiness_defined_review_only',
    objective: 'Define the governed path for IDB to invoke Demo Command Center only after consultant confirmation, review-only preview, and explicit operator-approved readiness.',
    invocationContract: {
      runtimeFunction: 'dccInvocationReadinessV1',
      defaultMode: 'review_only_no_submit',
      canInvokeDccFromIdbToday: false,
      futureRequiredPhrase: blockedReadiness.requiredPhrase,
      handoffContract: 'dccRunnerHandoffPacketV1',
      suiteletInvocation: 'disabled_from_idb'
    },
    safetyGateMatrix,
    reviewUiReadinessSummary: {
      card: 'Build control center',
      section: 'DCC invocation readiness',
      showsGateStatus: true,
      statesReviewOnlyDefault: true,
      statesFutureTypeToConfirmPhrase: true
    },
    traceCoverage: {
      traceExportIncludesDccInvocationReadinessV1: true,
      dccHandoffExportTraceIncludesInvocationReadiness: true,
      gateBlockersIncluded: true,
      rollbackIncluded: true
    },
    samples: {
      blockedReviewOnly: blockedReadiness,
      exportedStillBlocked: exportedReadiness
    },
    noRegression: blockedReadiness.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w104-dcc-invocation-readiness-trace.v1',
    generatedAt: new Date().toISOString(),
    decision,
    handoffStatus: handoff.status,
    blockedReadiness,
    exportedReadiness,
    safetyGateMatrix,
    noRegression: contract.noRegression,
    validatorResults: results,
    bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W104 DCC Invocation Readiness',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Decision: ${decision} / DCC INVOCATION READINESS DEFINED / REVIEW ONLY`,
    '',
    '## Contract',
    '',
    '- Runtime contract: `dccInvocationReadinessV1`.',
    '- Default mode: `review_only_no_submit`.',
    '- IDB cannot invoke DCC from the drawer in this block.',
    '- Future invocation requires prepared brief, confirmed lane, confirmed pack/scenario, exported handoff packet, operator approval, and type-to-confirm.',
    '- Required future phrase: `TYPE BUILD READY`.',
    '',
    '## Safety Gate Matrix',
    '',
    '| Gate | Current State | Blocker |',
    '| --- | --- | --- |',
    ...safetyGateMatrix.map((gate) => `| ${escapeTable(gate.label)} | ${escapeTable(gate.currentState)} | ${escapeTable(gate.blocker || 'none')} |`),
    '',
    '## Review UI Readiness Summary',
    '',
    '- Review `Build control center` now includes a collapsed `DCC invocation readiness` section.',
    '- The section states review-only remains the default and lists every required gate.',
    '- The UI shows the future type-to-confirm phrase without enabling submission.',
    '',
    '## Rollback / No Submit',
    '',
    '- If any gate is blocked, stay review-only and export corrected evidence.',
    '- Clear approval state if an operator rejects the handoff.',
    '- Reset session only after DCC handoff JSON, trace JSON, screenshots, and operator notes are captured.',
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
