const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w206_production_consultant_build_automation.json');
const tracePath = path.join(root, 'trace_samples', 'w206_production_consultant_build_automation_trace.json');
const reportPath = path.join(root, 'reports', 'w206_production_consultant_build_automation.md');

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W206 harness')),
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

function baseState() {
  return {
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
      capturedAt: '2026-05-18T10:00:00.000Z'
    }
  };
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
        url: '/app/accounting/transactions/salesord.nl?id=80828'
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

function prepareState(hooks, overrides) {
  const state = Object.assign(baseState(), overrides || {});
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  return { state, lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const results = [];

  const readyScenario = prepareState(hooks);
  const readyModel = hooks.productionConsultantIntakeAndBuildAutomationSimplificationW206V1(
    readyScenario.state,
    readyScenario.lane,
    readyScenario.page,
    readyScenario.recommendation
  );
  const readyHtml = hooks.renderReviewView(readyScenario.state, readyScenario.lane, readyScenario.page, readyScenario.recommendation);

  const pendingScenario = prepareState(hooks, {
    integratedBuildRunnerResult: {
      status: 'queued_pending_result_capture',
      runnerTaskId: 'SCHEDSCRIPT_REDACTED',
      resultCapture: { status: 'pending' }
    }
  });
  const pendingModel = hooks.productionConsultantIntakeAndBuildAutomationSimplificationW206V1(
    pendingScenario.state,
    pendingScenario.lane,
    pendingScenario.page,
    pendingScenario.recommendation
  );
  const pendingHtml = hooks.renderReviewView(pendingScenario.state, pendingScenario.lane, pendingScenario.page, pendingScenario.recommendation);

  const importedScenario = prepareState(hooks);
  const guard = hooks.validateDccFinalNamingImportPayload(completedRunnerResult(), importedScenario.state, importedScenario.lane, importedScenario.page, importedScenario.recommendation);
  importedScenario.state.dccFinalNamingResult = guard.finalNaming;
  const importedModel = hooks.productionConsultantIntakeAndBuildAutomationSimplificationW206V1(
    importedScenario.state,
    importedScenario.lane,
    importedScenario.page,
    importedScenario.recommendation
  );
  const importedNavigation = hooks.dccFinalNavigationModel(importedScenario.state, importedScenario.lane, importedScenario.page, importedScenario.recommendation);

  assertCase(results, 'w206_consultant_inputs_are_only_name_website_notes', readyModel.consultantWorkflow.requiredVisibleInputs.length === 3 && readyModel.consultantWorkflow.requiredVisibleInputs.includes('Website'), JSON.stringify(readyModel.consultantWorkflow));
  assertCase(results, 'w206_simple_build_toggles_are_preserved', readyModel.consultantWorkflow.simpleBuildToggles.join('|') === 'Create new hero item|Manufacturing|WIP', JSON.stringify(readyModel.consultantWorkflow.simpleBuildToggles));
  assertCase(results, 'w206_confirmed_request_generated_from_simplified_intake', readyModel.confirmedBuildRequest.requestStatus === 'confirmed_ready_for_governed_runner' && readyModel.confirmedBuildRequest.requiredRecords.length === 5, JSON.stringify(readyModel.confirmedBuildRequest.requiredRecords));
  assertCase(results, 'w206_saved_admin_config_gates_submit_without_visible_fields', readyModel.status === 'production_build_ready_to_submit' && readyModel.automationStates.submitReady === true && readyHtml.includes('Build demo records'), readyHtml.slice(0, 1000));
  assertCase(results, 'w206_normal_consultant_flow_hides_runner_plumbing', !readyHtml.includes('Approved W144 Suitelet endpoint') && !readyHtml.includes('AUTHORIZE ONE SANDBOX ADAPTER CALL') && !readyHtml.includes('Submit W144 once'), 'W144 endpoint and phrases are hidden unless setup edit mode is enabled.');
  assertCase(results, 'w206_pending_runner_shows_check_result_not_open_links', pendingModel.status === 'production_build_waiting_for_result_capture' && pendingHtml.includes('Check status') && !pendingHtml.includes('Open</a>'), pendingModel.status);
  assertCase(results, 'w206_imported_result_opens_only_after_w151_guard', guard.valid === true && importedModel.status === 'production_build_completed_imported' && importedNavigation.linkAuthoritySummary.verified_openable === 5, JSON.stringify(importedNavigation.linkAuthoritySummary));
  assertCase(results, 'w206_no_regression_boundaries_preserved', readyModel.noRegression.noDrawerWrites && readyModel.noRegression.noDrawerCreatedRecords && readyModel.noRegression.noDrawerTransactionWrites && readyModel.noRegression.w151ImportGuardPreserved && readyModel.noRegression.noActiveOpenLinksBeforeCompletedResultImport, JSON.stringify(readyModel.noRegression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w206-production-consultant-intake-build-automation-simplification.v1',
    status: pass ? 'PASS_W206_PRODUCTION_CONSULTANT_BUILD_AUTOMATION_READY' : 'FAIL_W206_PRODUCTION_CONSULTANT_BUILD_AUTOMATION',
    productionConsultantFlowContract: {
      visibleInputs: readyModel.consultantWorkflow.requiredVisibleInputs,
      visibleBuildToggles: readyModel.consultantWorkflow.simpleBuildToggles,
      hiddenAdminDebugConfig: readyModel.savedAdminDebugConfiguration.fieldsHiddenFromConsultant,
      primaryBuildPath: readyModel.callPath
    },
    readinessStates: {
      readyToSubmit: readyModel.status,
      pendingPoll: pendingModel.status,
      imported: importedModel.status
    },
    traceSamples: [
      {
        event: 'w206_production_build_ready',
        status: readyModel.status,
        requestId: readyModel.confirmedBuildRequest.requestId,
        submitReady: readyModel.automationStates.submitReady,
        noDrawerWrites: true
      },
      {
        event: 'w206_runner_task_poll_ready',
        status: pendingModel.status,
        runnerTaskCaptured: pendingModel.automationStates.runnerTaskCaptured,
        pollingReady: pendingModel.automationStates.pollingReady,
        noActiveOpenLinks: true
      },
      {
        event: 'w206_completed_result_imported',
        status: importedModel.status,
        verifiedOpenLinks: importedNavigation.linkAuthoritySummary.verified_openable,
        w151Accepted: guard.valid
      }
    ],
    releaseReadinessChecklist: [
      'Consultant workflow only asks for customer/prospect name, website, conversation notes, and simple toggles.',
      'Approved W144 endpoint, flags, sandbox account, operator approval, idempotency, and runner plumbing are admin/debug saved config.',
      'Build submits only through the approved server adapter path when production build mode is enabled.',
      'Runner owns Customer, Sales Order, item, manufacturing, and WIP record creation.',
      'IDB imports only W151-valid completed runner result JSON.',
      'Open links render only after real NetSuite URLs are imported.'
    ],
    assertions: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  const report = [
    '# W206 Production Consultant Intake And Build Automation Simplification',
    '',
    `Status: ${contract.status}`,
    '',
    '## Production Consultant Flow Contract',
    `- Visible inputs: ${contract.productionConsultantFlowContract.visibleInputs.join(', ')}`,
    `- Visible toggles: ${contract.productionConsultantFlowContract.visibleBuildToggles.join(', ')}`,
    '- Admin/debug config is saved and hidden from normal consultant workflow.',
    '- Build calls the approved W144 adapter only through saved config and production build mode.',
    '- Poll/import remains guarded by W151 before any Open links appear.',
    '',
    '## Regression Harness',
    ...results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}: ${result.detail}`),
    '',
    '## Release Readiness Checklist',
    ...contract.releaseReadinessChecklist.map((item) => `- ${item}`)
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);
  console.log(`${contract.status}: ${results.filter((result) => result.pass).length}/${results.length} assertions passed`);
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
}

main();
