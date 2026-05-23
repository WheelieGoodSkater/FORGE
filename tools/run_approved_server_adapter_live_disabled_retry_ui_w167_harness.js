const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w166Path = path.join(root, 'data', 'w166_approved_server_adapter_live_disabled_error_retry.json');
const dataPath = path.join(root, 'data', 'w167_approved_server_adapter_live_disabled_retry_ui.json');
const tracePath = path.join(root, 'trace_samples', 'w167_approved_server_adapter_live_disabled_retry_ui_trace.json');
const reportPath = path.join(root, 'reports', 'w167_approved_server_adapter_live_disabled_retry_ui.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

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
    Promise,
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

function ariatState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    activeView: 'review',
    intake: {
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'Buyer needs style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {},
    acceptedPacket: null,
    dccFinalNamingResult: null,
    integratedBuildRunnerResult: null,
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

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: {
        type: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: 501234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: 601234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: 701234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
      },
      matrixProofItem: {
        type: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: 701235,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    },
    demoTransaction: {
      type: 'salesorder',
      name: 'Ariat Seasonal Footwear Availability Demo Order',
      internalId: 601234,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234'
    },
    heroItem: {
      type: 'inventoryitem',
      name: 'Ariat Terrain H2O Work Boot Hero Item',
      internalId: 701234,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
    },
    matrixItem: {
      type: 'matrixitem',
      name: 'Ariat Core Boot Size Color Matrix',
      internalId: 701235,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
    },
    componentItems: [
      {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    ]
  };
}

function adapterConfig() {
  return {
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_live_disabled_retry_ui'
  };
}

function operatorEvidence() {
  return {
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T21:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Harness-only retry UI surface. Do not invoke.'
  };
}

async function main() {
  const w166 = readJson(w166Path);
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const hooks = loadHooks();
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const options = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedRunnerResultJson(),
    runnerTaskId: 'fixture_w167_runner_task_001',
    retryLimit: 2
  };
  const errorRetryContract = hooks.approvedServerAdapterLiveDisabledErrorRetryContractV1(state, lane, page, recommendation, options);
  const retryUi = hooks.approvedServerAdapterLiveDisabledRetryUiStatusV1(state, lane, page, recommendation, {
    errorRetryContract
  });
  const guardedHarness = {
    startsFromW166: w166.decision === 'PASS_ERROR_RETRY_CONTRACT_READY__VISUAL_TESTING_BLOCKED',
    retryUiHookReady: typeof hooks.approvedServerAdapterLiveDisabledRetryUiStatusV1 === 'function',
    buildSurfaceCopyReady: /idb-w167-retry-ui-status/.test(userscript) &&
      /Retry and error status/.test(userscript) &&
      /Open links stay hidden/.test(userscript),
    timeoutRetrySurfaced: retryUi.statusCards.some((card) => card.id === 'timeout_retry' && card.action === 'retry_same_idempotency_token'),
    duplicateIdempotencySurfaced: retryUi.statusCards.some((card) => card.id === 'duplicate_idempotency_polling' && card.action === 'continue_poll_existing_runner_task'),
    adapterErrorStopSurfaced: retryUi.statusCards.some((card) => card.id === 'adapter_error_stop' && card.action === 'stop_and_surface_drawer_safe_error'),
    malformedCompletedRejectedSurfaced: retryUi.statusCards.some((card) => card.id === 'malformed_completed_result_rejection' && card.action === 'reject_w151_import_and_keep_previous_names'),
    statusCardsDoNotMutateFinalNames: retryUi.statusCards.every((card) => card.mutatesFinalGeneratedNames === false),
    statusCardsDoNotCreateOpenLinks: retryUi.statusCards.every((card) => card.activeOpenLinks === 0),
    operatorEvidenceSurfaceReady: retryUi.operatorEvidenceSurface.required === true &&
      retryUi.operatorEvidenceSurface.fields.includes('idempotencyToken') &&
      retryUi.operatorEvidenceSurface.fields.includes('rollbackFlagState'),
    importGuardPreserved: retryUi.importGuard.malformedCompletedRejected === true &&
      retryUi.importGuard.acceptsBuildHandoffJson === false,
    visualTestingBlocked: retryUi.visualTestingBlocked === true
  };
  const noRegression = {
    noDrawerWrites: retryUi.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: retryUi.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: retryUi.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    w151CompletedResultImportGuardPreserved: retryUi.noRegression.w151CompletedResultImportGuardPreserved === true,
    consultantConfirmationRequired: retryUi.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: retryUi.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: retryUi.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: retryUi.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: retryUi.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: retryUi.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: retryUi.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W167 surfaces live-disabled retry/error statuses only. Real Build invocation remains disabled, so visual NetSuite testing stays blocked.'
  };
  const results = [];
  assertCase(results, 'w167_starts_from_w166_error_retry_contract', guardedHarness.startsFromW166, w166.decision);
  assertCase(results, 'w167_retry_ui_hook_and_build_surface_ready', guardedHarness.retryUiHookReady && guardedHarness.buildSurfaceCopyReady && retryUi.status === 'retry_ui_status_ready', retryUi.status);
  assertCase(results, 'w167_timeout_retry_surface_ready', guardedHarness.timeoutRetrySurfaced, JSON.stringify(retryUi.statusCards));
  assertCase(results, 'w167_duplicate_idempotency_surface_ready', guardedHarness.duplicateIdempotencySurfaced, JSON.stringify(retryUi.statusCards));
  assertCase(results, 'w167_adapter_error_stop_surface_ready', guardedHarness.adapterErrorStopSurfaced, JSON.stringify(retryUi.statusCards));
  assertCase(results, 'w167_malformed_completed_rejection_surface_ready', guardedHarness.malformedCompletedRejectedSurfaced, JSON.stringify(retryUi.statusCards));
  assertCase(results, 'w167_status_cards_do_not_mutate_names_or_links', guardedHarness.statusCardsDoNotMutateFinalNames && guardedHarness.statusCardsDoNotCreateOpenLinks, JSON.stringify(retryUi.statusCards));
  assertCase(results, 'w167_operator_evidence_surface_ready', guardedHarness.operatorEvidenceSurfaceReady, JSON.stringify(retryUi.operatorEvidenceSurface));
  assertCase(results, 'w167_import_guard_and_visual_testing_blocked', guardedHarness.importGuardPreserved && guardedHarness.visualTestingBlocked, JSON.stringify(retryUi.importGuard));
  assertCase(results, 'w167_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w167-approved-server-adapter-live-disabled-retry-ui.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_retry_ui_status_ready',
    decision: failures.length ? 'FAIL' : 'PASS_RETRY_UI_STATUS_READY__VISUAL_TESTING_BLOCKED',
    retryUiStatusContract: {
      schema: retryUi.schema,
      status: retryUi.status,
      mode: retryUi.mode,
      currentBuildStatus: retryUi.currentBuildStatus,
      statusCards: retryUi.statusCards,
      operatorEvidenceSurface: retryUi.operatorEvidenceSurface,
      importGuard: retryUi.importGuard,
      mutationGuard: retryUi.mutationGuard
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W168: Approved Server Adapter Live-Disabled Retry Recovery Harness',
      prompt: 'Move through W168: Approved Server Adapter Live-Disabled Retry Recovery Harness. Use the W167 retry UI/status surface to model the drawer-safe recovery loop for timeout retry, duplicate idempotency polling, adapter error stop, and malformed completed-result correction while real invocation remains disabled. Prove retry recovery cannot mutate final generated names, cannot create Open links, preserves W151 import guard, preserves state authority and handoff parity, and keeps rollback by disabling server flags. Do not enable writes, do not invoke NetSuite live, and do not request visual testing. Output retry recovery contract, guarded harness, trace samples, W168 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w167-approved-server-adapter-live-disabled-retry-ui-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    statusCards: retryUi.statusCards,
    operatorEvidenceSurface: retryUi.operatorEvidenceSurface,
    importGuard: retryUi.importGuard,
    mutationGuard: retryUi.mutationGuard,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W167 Approved Server Adapter Live-Disabled Retry UI And Operator Evidence Surface

Decision: ${contract.decision}

## Retry UI/Status Contract
- Mode: ${retryUi.mode}.
- Current Build status: ${retryUi.currentBuildStatus}.
- Visual testing blocked: ${retryUi.visualTestingBlocked}.

## Status Cards
${retryUi.statusCards.map((card) => `- ${card.label}: ${card.state}; action=${card.action}; mutatesFinalGeneratedNames=${card.mutatesFinalGeneratedNames}; activeOpenLinks=${card.activeOpenLinks}`).join('\n')}

## Operator Evidence Surface
- Required: ${retryUi.operatorEvidenceSurface.required}.
- Fields: ${retryUi.operatorEvidenceSurface.fields.join(', ')}.
- Copy: ${retryUi.operatorEvidenceSurface.copy}

## Import Guard
- Owner: ${retryUi.importGuard.owner}.
- Malformed completed result rejected: ${retryUi.importGuard.malformedCompletedRejected}.
- Accepts Build handoff JSON: ${retryUi.importGuard.acceptsBuildHandoffJson}.
- Active Open links before import: ${retryUi.importGuard.activeOpenLinksBeforeImport}.

## Visual Testing Decision
Blocked. ${visualTestingDecision.reason}

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
${Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt
${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W167 approved server adapter retry UI/status FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W167 approved server adapter retry UI/status: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
