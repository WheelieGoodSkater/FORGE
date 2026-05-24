const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const playgroundRoot = path.resolve(root, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const runnerPath = path.join(playgroundRoot, 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
const dataPath = path.join(root, 'data', 'w209_production_flow_hardening_image_lookup_removal.json');
const tracePath = path.join(root, 'trace_samples', 'w209_production_flow_hardening_image_lookup_removal_trace.json');
const reportPath = path.join(root, 'reports', 'w209_production_flow_hardening_image_lookup_removal.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W209 harness')),
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
  const hiddenTerms = [
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
    'QUEUE GOVERNED SANDBOX RUNNER'
  ];

  const readyContext = contextFromState(hooks, consultantState());
  const w209Model = hooks.productionFlowHardeningConsultantToggleImageRemovalW209V1(
    readyContext.state,
    readyContext.lane,
    readyContext.page,
    readyContext.recommendation
  );
  const readyHtml = hooks.renderReviewView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);
  const normalTraceHtml = hooks.renderTraceView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);

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
  const adminHtml = hooks.renderReviewView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);
  const adminTraceHtml = hooks.renderTraceView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);

  const results = [];
  assertCase(results, 'consultant_flow_limited_to_expected_controls', w209Model.productionFlowHardeningContract.normalConsultantFlow.includes('Build demo records') && w209Model.productionFlowHardeningContract.normalConsultantFlow.includes('Run demo'), JSON.stringify(w209Model.productionFlowHardeningContract.normalConsultantFlow));
  assertCase(results, 'normal_build_hides_admin_debug_terms', readyHtml.includes('Build demo records') && !includesAny(readyHtml, hiddenTerms), 'Normal Build hides W144 and raw runner controls.');
  assertCase(results, 'normal_trace_hides_raw_import_and_handoff', !normalTraceHtml.includes('Completed runner result import') && !normalTraceHtml.includes('Export debug handoff'), 'Trace normal mode stays consultant-safe.');
  assertCase(results, 'admin_debug_retains_support_controls', adminHtml.includes('Submit W144 once') && adminTraceHtml.includes('Completed runner result import') && adminTraceHtml.includes('Export debug handoff'), 'Admin/debug keeps recovery controls.');
  assertCase(results, 'toggles_are_durable_and_in_build_request', w209Model.consultantToggleRequestContract.includedInConfirmedBuildRequest && w209Model.consultantToggleRequestContract.confirmedBuildRequestToggles.createNewHeroItem && w209Model.consultantToggleRequestContract.confirmedBuildRequestToggles.enableManufacturing && !w209Model.consultantToggleRequestContract.confirmedBuildRequestToggles.enableWip, JSON.stringify(w209Model.consultantToggleRequestContract));
  assertCase(results, 'check_status_only_after_runner_task', !readyHtml.includes('Check status') && buildingHtml.includes('Check status') && !buildingHtml.includes(queuedResult.runnerTaskId), 'Check status appears after runner task without leaking task id.');
  assertCase(results, 'finish_build_only_after_completed_result_ready', !buildingHtml.includes('Finish build') && completedHtml.includes('Finish build') && !completedHtml.includes('Open</a>'), 'Finish build appears only after completed result is ready.');
  assertCase(results, 'open_links_only_after_import', completedGuard.valid && importedBuildHtml.includes('Open') && importedRunHtml.includes('Open'), completedGuard.status);
  assertCase(results, 'image_lookup_disabled_by_default_in_runner', runnerSource.includes('enableImageEnrichment') && runnerSource.includes('skipped-admin-enrichment-disabled') && runnerSource.includes('Image lookup is disabled by default for IDB production builds.'), 'Runner has image enrichment opt-in flag and default skipped status.');
  assertCase(results, 'image_lookup_non_blocking_guarantee_recorded', w209Model.imageLookupRemovalContract.criticalPathImpact.includes('never_blocks_record_creation') && runnerSource.includes('recordCreationBlocked: false') && runnerSource.includes('resultCaptureBlocked: false'), JSON.stringify(w209Model.imageLookupRemovalContract));
  assertCase(results, 'w208_successful_path_preserved', w209Model.regression.w208PathPreserved && w209Model.regression.noDrawerCreatedRecords && w209Model.regression.noDrawerTransactionWrites && w209Model.regression.runnerOwnsGeneratedRecords, JSON.stringify(w209Model.regression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w209-production-flow-hardening-image-lookup-removal.report.v1',
    status: pass ? 'PASS_W209_PRODUCTION_FLOW_HARDENING_IMAGE_LOOKUP_REMOVAL' : 'FAIL_W209_PRODUCTION_FLOW_HARDENING_IMAGE_LOOKUP_REMOVAL',
    productionFlowHardeningContract: w209Model.productionFlowHardeningContract,
    imageLookupRemovalContract: w209Model.imageLookupRemovalContract,
    consultantToggleRequestContract: w209Model.consultantToggleRequestContract,
    adminDebugRelocationMap: w209Model.adminDebugRelocationMap,
    passFailChecklist: results,
    traceSamples: w209Model.traceSamples,
    uploadPacketNeeded: true,
    nextPrompt: w209Model.nextPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  const report = [
    '# W209 Production Flow Hardening, Consultant Toggle Control, And Image Lookup Removal',
    '',
    `Status: ${contract.status}`,
    '',
    '## Production Flow Hardening Contract',
    `- Normal consultant flow: ${contract.productionFlowHardeningContract.normalConsultantFlow.join(', ')}`,
    `- Status copy: ${contract.productionFlowHardeningContract.buildStatusCopy.join(', ')}`,
    `- Check status rule: ${contract.productionFlowHardeningContract.checkStatusRule}`,
    `- Finish build rule: ${contract.productionFlowHardeningContract.finishBuildRule}`,
    '',
    '## Image Lookup Removal Contract',
    `- Runner image lookup default: ${contract.imageLookupRemovalContract.runnerImageLookupDefault}`,
    `- Critical path impact: ${contract.imageLookupRemovalContract.criticalPathImpact}`,
    `- Optional future mode: ${contract.imageLookupRemovalContract.optionalFutureMode}`,
    '',
    '## Consultant Toggle Request Contract',
    `- Create new item: ${contract.consultantToggleRequestContract.confirmedBuildRequestToggles.createNewHeroItem}`,
    `- Manufacturing: ${contract.consultantToggleRequestContract.confirmedBuildRequestToggles.enableManufacturing}`,
    `- WIP: ${contract.consultantToggleRequestContract.confirmedBuildRequestToggles.enableWip}`,
    '',
    '## Admin/Debug Relocation Map',
    ...contract.adminDebugRelocationMap.map((item) => `- ${item.surface}: normal=${item.normalFlow}; admin/debug=${item.adminDebug}`),
    '',
    '## Regression Harness',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Upload Packet',
    '- Upload idb-drawer.user.js to Tampermonkey.',
    '- Upload scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js to the active Demo Command Center Runner V3 scheduled script file.',
    '- Leave image enrichment parameters absent or false unless an admin intentionally enables optional enrichment later.'
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);
  console.log(`${contract.status}: ${results.filter((result) => result.pass).length}/${results.length} harness assertions passed`);
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
}

main();
