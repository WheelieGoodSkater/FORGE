const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const dataPath = path.join(root, 'data', 'w210_consultant_first_ui_cleanup_admin_debug_separation.json');
const tracePath = path.join(root, 'trace_samples', 'w210_consultant_first_ui_cleanup_admin_debug_separation_trace.json');
const reportPath = path.join(root, 'reports', 'w210_consultant_first_ui_cleanup_admin_debug_separation.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
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
    URLSearchParams,
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W210 harness')),
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
      setInterval: () => 1,
      clearInterval: () => {},
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

function consultantState(overrides = {}) {
  return Object.assign({
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    setupEditMode: false,
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {
      apparel_accessories: {
        createNewHeroItem: true,
        enableManufacturing: true,
        enableWip: false
      }
    },
    integratedBuildAdapterConfig: {
      endpointUrl: '',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      productionBuildModeEnabled: true
    },
    integratedBuildOperatorApproval: {
      endpointConfirmed: true,
      confirmedSandboxAccount: true,
      currentSandboxAccount: 'TD3021666',
      operatorName: 'Saved Admin Config',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      reviewDecision: 'operator_approved_queue_submit',
      confirmedNoSubmit: false
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      capturedAt: '2026-05-18T12:00:00.000Z'
    }
  }, overrides);
}

function completedRunnerResult() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Customer Account',
        internalId: '1722',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=1722'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2677',
        internalId: '80828',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=80828'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'Ariat International Finished Good',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: 'Ariat International BOM Assembly Structure',
        internalId: '2545',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat International Component Item',
        internalId: '2546',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2546'
      }
    }
  };
}

function contextFromState(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function main() {
  const hooks = loadHooks();
  const runnerSource = fs.readFileSync(runnerPath, 'utf8');
  const forbiddenNormalTerms = [
    'W144',
    'endpoint',
    'operator phrase',
    'runnerTaskId',
    'idempotency',
    'result JSON',
    'W151',
    'sandbox allowlist',
    'server flags',
    'Submit W144 once',
    'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    'QUEUE GOVERNED SANDBOX RUNNER',
    'Completed runner result import',
    'Export debug handoff',
    'Pilot evidence checklist'
  ];

  const readyContext = contextFromState(hooks, consultantState());
  const w210Model = hooks.consultantFirstUiCleanupAdminDebugSeparationW210V1(
    readyContext.state,
    readyContext.lane,
    readyContext.page,
    readyContext.recommendation
  );
  const readyBuildHtml = hooks.renderReviewView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);
  const readyTraceHtml = hooks.renderTraceView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);
  const readyPlanHtml = hooks.renderPlanView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);

  const queuedResult = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'queued_pending_result_capture',
    queueSubmitted: true,
    runnerTaskId: 'SCHEDSCRIPT_REDACTED',
    idempotencyToken: 'idb-build-ariat-international-apparel-accessories-apparelaccessories',
    resultCapture: { status: 'pending', runnerTaskId: 'SCHEDSCRIPT_REDACTED' }
  };
  const buildingContext = contextFromState(hooks, consultantState({ integratedBuildRunnerResult: queuedResult }));
  const buildingHtml = hooks.renderReviewView(buildingContext.state, buildingContext.lane, buildingContext.page, buildingContext.recommendation);

  const completedJson = completedRunnerResult();
  const completedContext = contextFromState(hooks, consultantState({
    integratedBuildRunnerResult: Object.assign({}, queuedResult, {
      status: 'completed_runner_result_ready',
      resultCapture: {
        status: 'completed_runner_result_ready',
        runnerTaskId: queuedResult.runnerTaskId,
        finalGeneratedNamesJson: completedJson
      },
      finalGeneratedNamesJson: completedJson
    })
  }));
  const completedHtml = hooks.renderReviewView(completedContext.state, completedContext.lane, completedContext.page, completedContext.recommendation);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedJson, completedContext.state, completedContext.lane, completedContext.page, completedContext.recommendation);
  const importedContext = contextFromState(hooks, consultantState({
    integratedBuildRunnerResult: completedContext.state.integratedBuildRunnerResult,
    dccFinalNamingResult: completedGuard.finalNaming
  }));
  const importedBuildHtml = hooks.renderReviewView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);
  const importedRunHtml = hooks.renderRunView(
    importedContext.state,
    importedContext.lane,
    importedContext.page,
    importedContext.recommendation,
    importedContext.lane.moves[0],
    { id: 'prove', label: 'Prove' }
  );

  const adminContext = contextFromState(hooks, consultantState({ setupEditMode: true }));
  const adminBuildHtml = hooks.renderReviewView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);
  const adminTraceHtml = hooks.renderTraceView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);

  const results = [];
  assertCase(results, 'w210_contract_declares_consultant_first_mode', w210Model.consultantFirstUiContract.normalBuildTabMode === 'production_consultant_tool' && w210Model.consultantFirstUiContract.visibleSurfaces.includes('Build demo records'), JSON.stringify(w210Model.consultantFirstUiContract.visibleSurfaces));
  assertCase(results, 'normal_build_uses_production_language', readyBuildHtml.includes('Build Demo Records') && readyBuildHtml.includes('Build demo records') && !readyBuildHtml.includes('Build handoff') && !readyBuildHtml.includes('Export debug handoff'), 'Normal Build is consultant-first.');
  assertCase(results, 'normal_build_hides_adapter_plumbing', !includesAny(readyBuildHtml, forbiddenNormalTerms), 'No adapter, raw result, or operator vocabulary is visible in normal Build.');
  assertCase(results, 'normal_trace_hides_result_import_and_debug_handoff', !includesAny(readyTraceHtml, forbiddenNormalTerms) && readyTraceHtml.includes('Export trace'), 'Trace normal mode keeps only support trace export.');
  assertCase(results, 'normal_plan_renames_build_handoff', readyPlanHtml.includes('Build records') && !readyPlanHtml.includes('Build handoff'), 'Plan CTA uses production language.');
  assertCase(results, 'admin_debug_keeps_recovery_controls', adminBuildHtml.includes('Submit W144 once') && adminTraceHtml.includes('Completed runner result import') && adminTraceHtml.includes('Export debug handoff'), 'Admin/debug retains diagnostics and recovery controls.');
  assertCase(results, 'status_controls_are_stage_gated', !readyBuildHtml.includes('Check status') && buildingHtml.includes('Check status') && !buildingHtml.includes(queuedResult.runnerTaskId) && completedHtml.includes('Finish build'), 'Check and Finish are shown only at their stages.');
  assertCase(results, 'open_links_wait_for_import', !completedHtml.includes('Open</a>') && completedGuard.valid && importedBuildHtml.includes('Open') && importedRunHtml.includes('Open'), completedGuard.status);
  assertCase(results, 'automatic_build_regression_preserved', w210Model.regression.automaticRunnerSubmitPreserved && w210Model.regression.pollingPreserved && w210Model.regression.w151ImportGuardInternal, JSON.stringify(w210Model.regression));
  assertCase(results, 'no_drawer_write_boundaries_preserved', w210Model.regression.noDrawerCreatedRecords && w210Model.regression.noDrawerTransactionWrites && w210Model.regression.noDirectSuiteScriptOutsideApprovedServerAdapterPath && w210Model.regression.runnerOwnsGeneratedRecords, JSON.stringify(w210Model.regression));
  assertCase(results, 'image_lookup_disabled_by_default', w210Model.regression.imageLookupDisabledByDefault && runnerSource.includes('skipped-admin-enrichment-disabled'), 'W209 image lookup removal remains in force.');

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w210-consultant-first-ui-cleanup-admin-debug-separation.report.v1',
    status: pass ? 'PASS_W210_CONSULTANT_FIRST_UI_CLEANUP' : 'FAIL_W210_CONSULTANT_FIRST_UI_CLEANUP',
    consultantFirstUiContract: w210Model.consultantFirstUiContract,
    adminDebugSeparationMap: w210Model.adminDebugSeparationMap,
    implementationChanges: w210Model.implementationChanges,
    regressionHarness: results,
    traceSamples: w210Model.traceSamples,
    releaseReadinessDecision: pass ? 'release_candidate_for_consultant_first_build_smoke' : 'blocked_until_ui_regression_fixed',
    nextPrompt: w210Model.nextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  const report = [
    '# W210 Consultant-First UI Cleanup And Admin Debug Separation',
    '',
    `Status: ${contract.status}`,
    '',
    '## Consultant-First UI Contract',
    `- Normal Build mode: ${contract.consultantFirstUiContract.normalBuildTabMode}`,
    `- Visible normal surfaces: ${contract.consultantFirstUiContract.visibleSurfaces.join(', ')}`,
    `- Hidden normal surfaces: ${contract.consultantFirstUiContract.hiddenNormalSurfaces.join(', ')}`,
    '',
    '## Admin/Debug Separation Map',
    ...contract.adminDebugSeparationMap.map((item) => `- ${item.surface}: normal=${item.normalFlow}; admin/debug=${item.adminDebug}`),
    '',
    '## Implementation Changes',
    ...contract.implementationChanges.map((item) => `- ${item}`),
    '',
    '## Regression Harness',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Release-Readiness Decision',
    `- ${contract.releaseReadinessDecision}`,
    '',
    '## Upload Packet',
    '- Upload idb-drawer.user.js to Tampermonkey.',
    '- No W144 Suitelet upload is required for W210 if the W208/W209 adapter and runner are already deployed.',
    '- Upload scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js only if the W209 image-lookup-disabled runner has not already been uploaded.'
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);
  console.log(`${contract.status}: ${results.filter((result) => result.pass).length}/${results.length} harness assertions passed`);
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
}

main();
