const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w208_one_click_production_build_automation.json');
const tracePath = path.join(root, 'trace_samples', 'w208_one_click_production_build_automation_trace.json');
const reportPath = path.join(root, 'reports', 'w208_one_click_production_build_automation.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W208 harness')),
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
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
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
        name: 'SCAI - Ariat International Style SKU - ESSORIES',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: 'Ariat International Omnichannel Availability Flow',
        internalId: '2545',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2545'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat International Core Style',
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
  const readyModel = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
    readyContext.state,
    readyContext.lane,
    readyContext.page,
    readyContext.recommendation
  );
  const readyHtml = hooks.renderReviewView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);
  const normalTraceHtml = hooks.renderTraceView(readyContext.state, readyContext.lane, readyContext.page, readyContext.recommendation);

  const freshSessionState = consultantState({
    integratedBuildAdapterConfig: null,
    integratedBuildOperatorApproval: null,
    dccOperatorApproval: null,
    toggles: {}
  });
  const freshSessionContext = contextFromState(hooks, freshSessionState);
  const freshSessionModel = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
    freshSessionContext.state,
    freshSessionContext.lane,
    freshSessionContext.page,
    freshSessionContext.recommendation
  );
  const freshSessionHtml = hooks.renderReviewView(
    freshSessionContext.state,
    freshSessionContext.lane,
    freshSessionContext.page,
    freshSessionContext.recommendation
  );

  const queuedResult = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'queued_pending_result_capture',
    queueSubmitted: true,
    runnerTaskId: 'SCHEDSCRIPT_REDACTED',
    idempotencyToken: 'idb-build-ariat-international-apparel-accessories-apparelaccessories',
    resultCapture: {
      status: 'pending',
      runnerTaskId: 'SCHEDSCRIPT_REDACTED'
    }
  };
  const buildingContext = contextFromState(hooks, consultantState({ integratedBuildRunnerResult: queuedResult }));
  const buildingModel = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
    buildingContext.state,
    buildingContext.lane,
    buildingContext.page,
    buildingContext.recommendation
  );
  const buildingHtml = hooks.renderReviewView(buildingContext.state, buildingContext.lane, buildingContext.page, buildingContext.recommendation);
  const completedStatusOnlyContext = contextFromState(hooks, consultantState({
    integratedBuildRunnerResult: Object.assign({}, queuedResult, {
      status: 'completed_result_awaiting_w151_import',
      rawStatus: 'completed_runner_result_ready',
      label: 'Completed result waiting for import',
      message: 'Completed runner result is available before Open links appear.',
      resultCaptureStatus: 'completed_result_capture_ready',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: queuedResult.runnerTaskId,
        finalGeneratedNamesReady: false
      },
      finalGeneratedNamesJson: null
    })
  }));
  const completedStatusOnlyModel = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
    completedStatusOnlyContext.state,
    completedStatusOnlyContext.lane,
    completedStatusOnlyContext.page,
    completedStatusOnlyContext.recommendation
  );
  const completedStatusOnlyHtml = hooks.renderReviewView(
    completedStatusOnlyContext.state,
    completedStatusOnlyContext.lane,
    completedStatusOnlyContext.page,
    completedStatusOnlyContext.recommendation
  );
  const completedStatusOnlyRunHtml = hooks.renderRunView(
    completedStatusOnlyContext.state,
    completedStatusOnlyContext.lane,
    completedStatusOnlyContext.page,
    completedStatusOnlyContext.recommendation,
    completedStatusOnlyContext.lane.moves[0],
    { id: 'prove', label: 'Prove' }
  );

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
  const completedModel = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
    completedContext.state,
    completedContext.lane,
    completedContext.page,
    completedContext.recommendation
  );
  const guard = hooks.validateDccFinalNamingImportPayload(completedJson, completedContext.state, completedContext.lane, completedContext.page, completedContext.recommendation);
  const importedContext = contextFromState(hooks, consultantState({
    integratedBuildRunnerResult: completedContext.state.integratedBuildRunnerResult,
    dccFinalNamingResult: guard.finalNaming
  }));
  const importedHtml = hooks.renderReviewView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);
  const runHtml = hooks.renderRunView(
    importedContext.state,
    importedContext.lane,
    importedContext.page,
    importedContext.recommendation,
    importedContext.lane.moves[0],
    { id: 'prove', label: 'Prove' }
  );
  const importedNavigation = hooks.dccFinalNavigationModel(
    importedContext.state,
    importedContext.lane,
    importedContext.page,
    importedContext.recommendation
  );
  const adminContext = contextFromState(hooks, consultantState({ setupEditMode: true }));
  const adminHtml = hooks.renderReviewView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);
  const adminTraceHtml = hooks.renderTraceView(adminContext.state, adminContext.lane, adminContext.page, adminContext.recommendation);

  const results = [];
  assertCase(results, 'normal_build_surface_has_only_consultant_controls', readyHtml.includes('Build demo records') && !includesAny(readyHtml, hiddenTerms), 'Ready Build surface exposes one button and hides adapter details.');
  assertCase(results, 'fresh_session_uses_hidden_saved_admin_config', freshSessionModel.status === 'ready_to_build' && freshSessionHtml.includes('Build demo records') && !freshSessionHtml.includes('Build needs saved admin setup'), freshSessionModel.status);
  assertCase(results, 'normal_build_surface_shows_simple_toggles', freshSessionHtml.includes('Create new item') && freshSessionHtml.includes('Manufacturing') && freshSessionHtml.includes('WIP'), 'Normal Build includes consultant build toggles.');
  assertCase(results, 'normal_trace_hides_handoff_and_manual_import', !normalTraceHtml.includes('Export debug handoff') && !normalTraceHtml.includes('Completed runner result import') && normalTraceHtml.includes('Normal Build starts the saved build path'), 'Trace normal mode is support evidence only.');
  assertCase(results, 'admin_debug_keeps_fallback_controls', adminHtml.includes('Submit W144 once') && adminTraceHtml.includes('Completed runner result import') && adminTraceHtml.includes('Export debug handoff'), 'Admin/debug mode retains endpoint, submit, and manual import fallback.');
  assertCase(results, 'w208_model_has_consultant_safe_statuses', readyModel.consultantNormalFlow.visibleStatuses.includes('Ready to build') && readyModel.consultantNormalFlow.visibleStatuses.includes('Build failed, ask admin'), JSON.stringify(readyModel.consultantNormalFlow.visibleStatuses));
  assertCase(results, 'building_state_shows_check_status_without_raw_runner_task', buildingModel.status === 'still_building' && buildingHtml.includes('Check status') && !buildingHtml.includes(queuedResult.runnerTaskId), buildingModel.status);
  assertCase(results, 'completed_status_only_without_payload_waits_for_links',
    completedStatusOnlyModel.status === 'records_waiting_for_links' &&
      completedStatusOnlyHtml.includes('Links not returned yet') &&
      completedStatusOnlyHtml.includes('Check status') &&
      completedStatusOnlyHtml.includes('NetSuite has not returned the completed record names and links yet') &&
      !completedStatusOnlyHtml.includes('Still building') &&
      !completedStatusOnlyHtml.includes(queuedResult.runnerTaskId),
    completedStatusOnlyModel.status);
  assertCase(results, 'run_blocks_provisional_live_record_script_until_links_import',
    completedStatusOnlyRunHtml.includes('Record links are not back yet') &&
      completedStatusOnlyRunHtml.includes('Go to Build') &&
      !completedStatusOnlyRunHtml.includes('Move through the live Customer, Sales Order, and item records'),
    'Run waits for imported links before live record coaching.');
  assertCase(results, 'completed_state_finishes_build_before_links', completedModel.status === 'records_ready_to_finish' && completedHtml.includes('Finish build') && !completedHtml.includes('Open</a>'), completedModel.status);
  assertCase(results, 'w151_guard_still_accepts_only_completed_result', guard.valid === true && guard.finalNaming.finalNamesImported === true, guard.status);
  assertCase(results, 'imported_build_and_run_show_real_open_links', importedNavigation.linkAuthoritySummary.verified_openable === 5 && importedHtml.includes('Open') && runHtml.includes('Open'), JSON.stringify(importedNavigation.linkAuthoritySummary));
  assertCase(results, 'boundaries_preserved', readyModel.regression.noDrawerCreatedRecords && readyModel.regression.noDrawerTransactionWrites && readyModel.regression.noDirectSuiteScriptOutsideApprovedServerAdapterPath && readyModel.regression.runnerOwnsGeneratedRecords, JSON.stringify(readyModel.regression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w208-one-click-production-build-automation-hidden-admin-config.report.v1',
    status: pass ? 'PASS_W208_ONE_CLICK_PRODUCTION_BUILD_AUTOMATION' : 'FAIL_W208_ONE_CLICK_PRODUCTION_BUILD_AUTOMATION',
    oneClickProductionBuildContract: {
      consultantInputs: readyModel.consultantNormalFlow.requiredInputs,
      consultantToggles: readyModel.consultantNormalFlow.simpleToggles,
      primaryButton: readyModel.consultantNormalFlow.primaryButton,
      visibleStatuses: readyModel.consultantNormalFlow.visibleStatuses,
      hiddenAdminConfig: readyModel.consultantNormalFlow.adminDebugOnly,
      automationPath: readyModel.automation.oneClickPath
    },
    consultantSafeStatusCopy: {
      ready: readyModel.headline,
      building: buildingModel.headline,
      completedAwaitingFinish: completedModel.headline,
      imported: hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(
        importedContext.state,
        importedContext.lane,
        importedContext.page,
        importedContext.recommendation
      ).headline
    },
    adminDebugFallbackContract: readyModel.adminDebugFallback,
    passFailChecklist: results,
    traceSamples: readyModel.traceSamples.concat(buildingModel.traceSamples, completedModel.traceSamples),
    releaseDecision: pass ? 'release_ready_for_one_click_production_build_pilot' : 'blocked_until_w208_failures_are_resolved'
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  const report = [
    '# W208 One-Click Production Build Automation And Hidden Admin Config',
    '',
    `Status: ${contract.status}`,
    `Release decision: ${contract.releaseDecision}`,
    '',
    '## One-Click Production Build Contract',
    `- Consultant inputs: ${contract.oneClickProductionBuildContract.consultantInputs.join(', ')}`,
    `- Consultant toggles: ${contract.oneClickProductionBuildContract.consultantToggles.join(', ')}`,
    `- Primary action: ${contract.oneClickProductionBuildContract.primaryButton}`,
    `- Visible statuses: ${contract.oneClickProductionBuildContract.visibleStatuses.join(', ')}`,
    '- Admin/debug configuration is hidden from normal consultant flow.',
    '',
    '## Implementation Changes',
    '- Normal Build renders consultant-safe Build demo records, Check status, and Finish build controls.',
    '- Normal Trace hides debug handoff export and manual completed-result import.',
    '- Admin/debug mode keeps endpoint, flags, operator gate, submit, and manual import fallback surfaces.',
    '- The existing W144 submit, W190 polling, and W151 import path remains the record-return authority.',
    '',
    '## Regression Harness',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Boundaries',
    '- No drawer-created records.',
    '- No drawer transaction writes.',
    '- No direct SuiteScript outside the approved server adapter path.',
    '- Runner owns generated records.',
    '- Open links appear only after real numeric ids and supported NetSuite URLs exist.'
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);
  console.log(`${contract.status}: ${results.filter((result) => result.pass).length}/${results.length} harness assertions passed`);
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
}

main();
