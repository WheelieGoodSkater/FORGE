const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w207_production_build_mode_smoke.json');
const tracePath = path.join(root, 'trace_samples', 'w207_production_build_mode_smoke_trace.json');
const reportPath = path.join(root, 'reports', 'w207_production_build_mode_smoke.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W207 harness')),
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

function consultantState() {
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
      capturedAt: '2026-05-18T12:00:00.000Z'
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

function main() {
  const hooks = loadHooks();
  const state = consultantState();
  const context = contextFromState(hooks, state);
  const readyHtml = hooks.renderReviewView(context.state, context.lane, context.page, context.recommendation);

  const submittedRunnerResult = {
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
  const pendingState = Object.assign({}, context.state, { integratedBuildRunnerResult: submittedRunnerResult });
  const pendingContext = contextFromState(hooks, pendingState);
  const pendingHtml = hooks.renderReviewView(pendingContext.state, pendingContext.lane, pendingContext.page, pendingContext.recommendation);

  const completedJson = completedRunnerResult();
  const completedState = Object.assign({}, pendingContext.state, {
    integratedBuildRunnerResult: Object.assign({}, submittedRunnerResult, {
      status: 'completed_runner_result_ready',
      resultCapture: {
        status: 'completed_runner_result_ready',
        runnerTaskId: submittedRunnerResult.runnerTaskId,
        finalGeneratedNamesJson: completedJson
      },
      finalGeneratedNamesJson: completedJson
    })
  });
  const completedContext = contextFromState(hooks, completedState);
  const importReadyHtml = hooks.renderReviewView(completedContext.state, completedContext.lane, completedContext.page, completedContext.recommendation);
  const smoke = hooks.productionBuildModeSmokeWithSavedAdminConfigW207V1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      submittedRunnerResult: completedState.integratedBuildRunnerResult,
      completedRunnerResultJson: completedJson,
      operatorChoseImport: true
    }
  );
  const guard = hooks.validateDccFinalNamingImportPayload(completedJson, completedContext.state, completedContext.lane, completedContext.page, completedContext.recommendation);
  const importedState = Object.assign({}, completedContext.state, { dccFinalNamingResult: guard.finalNaming });
  const importedContext = contextFromState(hooks, importedState);
  const buildHtmlAfterImport = hooks.renderReviewView(importedContext.state, importedContext.lane, importedContext.page, importedContext.recommendation);
  const runHtmlAfterImport = hooks.renderRunView(
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

  const hiddenTerms = [
    'Approved W144 Suitelet endpoint',
    'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    'QUEUE GOVERNED SANDBOX RUNNER',
    'Submit W144 once',
    'Sandbox allowlist',
    'Current sandbox account'
  ];
  const results = [];
  assertCase(results, 'w207_normal_ready_build_surface_has_no_admin_plumbing', hiddenTerms.every((term) => !readyHtml.includes(term)) && readyHtml.includes('Build demo records'), 'Ready state hides endpoint/flags/operator fields and exposes Build demo records.');
  assertCase(results, 'w207_pending_runner_exposes_check_result_only_after_task', pendingHtml.includes('Check status') && !readyHtml.includes('Check status'), 'Check status appears only after the build has started.');
  assertCase(results, 'w207_completed_poll_exposes_import_cta_before_links', importReadyHtml.includes('Finish build') && !importReadyHtml.includes('Open</a>'), 'Completed records can be finished, but Open links are still blocked before import commit.');
  assertCase(results, 'w207_w151_import_guard_accepts_completed_result', guard.valid === true, JSON.stringify(guard));
  assertCase(
    results,
    'w207_build_and_run_show_real_open_links_after_import',
    importedNavigation.runCanUseImportedFinalNames === true &&
      importedNavigation.linkAuthoritySummary.verified_openable === 5 &&
      buildHtmlAfterImport.includes('Open') &&
      runHtmlAfterImport.includes('Open') &&
      smoke.smokeEvidence.verifiedOpenLinkCount === 5,
    JSON.stringify({
      linkChecklist: smoke.linkChecklist,
      linkAuthoritySummary: importedNavigation.linkAuthoritySummary
    })
  );
  assertCase(results, 'w207_all_urls_are_absolute_netsuite_urls', smoke.linkChecklist.every((item) => item.absoluteNetSuiteUrl), JSON.stringify(smoke.linkChecklist));
  assertCase(results, 'w207_no_regression_boundaries_preserved', smoke.noRegression.noDrawerWrites && smoke.noRegression.noDrawerCreatedRecords && smoke.noRegression.noDrawerTransactionWrites && smoke.noRegression.noDirectSuiteScriptOutsideApprovedServerAdapterPath && smoke.noRegression.runnerOwnershipPreserved, JSON.stringify(smoke.noRegression));
  assertCase(results, 'w207_release_decision_ready', smoke.releaseDecision === 'release_ready_for_controlled_production_consultant_smoke', smoke.releaseDecision);

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w207-production-build-mode-smoke-with-saved-admin-config.v1',
    status: pass ? 'PASS_W207_PRODUCTION_BUILD_MODE_SMOKE' : 'FAIL_W207_PRODUCTION_BUILD_MODE_SMOKE',
    smokeEvidence: smoke.smokeEvidence,
    passFailChecklist: smoke.passFailChecklist.concat(results),
    linkChecklist: smoke.linkChecklist,
    traceSamples: smoke.traceSamples,
    releaseDecision: pass ? smoke.releaseDecision : 'blocked_until_w207_smoke_failures_are_resolved'
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, contract.traceSamples);
  const report = [
    '# W207 Production Build Mode Smoke With Saved Admin Config',
    '',
    `Status: ${contract.status}`,
    `Release decision: ${contract.releaseDecision}`,
    '',
    '## Smoke Evidence',
    `- Request: ${contract.smokeEvidence.requestId}`,
    `- Runner task: ${contract.smokeEvidence.runnerTaskId}`,
    `- W151 guard: ${contract.smokeEvidence.completedGuardStatus}`,
    `- Imported status: ${contract.smokeEvidence.importedStatus}`,
    `- Verified Open links: ${contract.smokeEvidence.verifiedOpenLinkCount}`,
    '',
    '## Pass / Fail Checklist',
    ...contract.passFailChecklist.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id || item.name}: ${item.evidence || item.detail || ''}`),
    '',
    '## Link Checklist',
    ...contract.linkChecklist.map((item) => `- ${item.openable && item.absoluteNetSuiteUrl ? 'PASS' : 'FAIL'} ${item.role}: ${item.name} (${item.internalId}) ${item.url}`),
    '',
    '## Boundaries',
    '- No drawer writes.',
    '- No drawer-created records.',
    '- No drawer transaction writes.',
    '- No direct SuiteScript outside the approved server adapter path.',
    '- Runner owns generated records.',
    '- Open links appear only after W151-valid completed runner result import.'
  ].join('\n');
  fs.writeFileSync(reportPath, `${report}\n`);
  console.log(`${contract.status}: ${results.filter((result) => result.pass).length}/${results.length} harness assertions passed`);
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
}

main();
