const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w165Path = path.join(root, 'data', 'w165_approved_server_adapter_harness_handshake.json');
const dataPath = path.join(root, 'data', 'w166_approved_server_adapter_live_disabled_error_retry.json');
const tracePath = path.join(root, 'trace_samples', 'w166_approved_server_adapter_live_disabled_error_retry_trace.json');
const reportPath = path.join(root, 'reports', 'w166_approved_server_adapter_live_disabled_error_retry.md');

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
    mode: 'approved_server_adapter_live_disabled_error_retry'
  };
}

function operatorEvidence() {
  return {
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T20:30:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Harness-only error/retry contract. Do not invoke.'
  };
}

async function main() {
  const w165 = readJson(w165Path);
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
    runnerTaskId: 'fixture_w166_runner_task_001',
    retryLimit: 2
  };
  const handshake = hooks.approvedServerAdapterHarnessHandshakeV1(state, lane, page, recommendation, options);
  const contractRuntime = hooks.approvedServerAdapterLiveDisabledErrorRetryContractV1(state, lane, page, recommendation, Object.assign({}, options, {
    handshake
  }));
  const handoffGuard = hooks.validateDccFinalNamingImportPayload(
    hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation),
    state,
    lane,
    page,
    recommendation
  );
  const guardedHarness = {
    startsFromW165: w165.decision === 'PASS_HARNESS_HANDSHAKE_READY__VISUAL_TESTING_BLOCKED',
    errorRetryHookReady: typeof hooks.approvedServerAdapterLiveDisabledErrorRetryContractV1 === 'function',
    timeoutDrawerSafe: contractRuntime.normalizedStatuses.timeout === 'adapter_transport_error_drawer_safe',
    duplicateIdempotencyContinuesPolling: contractRuntime.normalizedStatuses.duplicateIdempotency === 'polling_pending',
    adapterErrorDrawerSafe: contractRuntime.normalizedStatuses.adapterError === 'adapter_transport_error_drawer_safe',
    malformedCompletedBlockedByW151: contractRuntime.normalizedStatuses.malformedCompleted === 'completed_result_awaiting_w151_import' &&
      contractRuntime.malformedCompletedResultGuard.rejectedByW151 === true,
    retryPlanDoesNotMutateNames: contractRuntime.mutationGuard.finalGeneratedNamesUnchanged === true &&
      contractRuntime.retryPlan.every((item) => item.mutatesFinalGeneratedNames === false),
    retryPlanDoesNotCreateOpenLinks: contractRuntime.mutationGuard.noActiveOpenLinksCreated === true &&
      contractRuntime.retryPlan.every((item) => item.activeOpenLinks === 0),
    handoffStillRejected: handoffGuard.valid === false && handoffGuard.status === 'handoff_packet_rejected',
    liveInvocationStillDisabled: contractRuntime.requestSummary.invocationAttempted === false
  };
  const noRegression = {
    noDrawerWrites: contractRuntime.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: contractRuntime.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: contractRuntime.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    w151CompletedResultImportGuardPreserved: contractRuntime.noRegression.w151CompletedResultImportGuardPreserved === true,
    consultantConfirmationRequired: contractRuntime.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: contractRuntime.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: contractRuntime.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: contractRuntime.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: contractRuntime.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: contractRuntime.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: contractRuntime.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W166 is a live-disabled harness contract for retries and errors. No runner is invoked, no records are written, and no Open links can appear before a W151-accepted result import.'
  };
  const results = [];
  assertCase(results, 'w166_starts_from_w165_handshake', guardedHarness.startsFromW165, w165.decision);
  assertCase(results, 'w166_error_retry_hook_ready', guardedHarness.errorRetryHookReady && contractRuntime.status === 'approved_server_adapter_error_retry_contract_ready', contractRuntime.status);
  assertCase(results, 'w166_timeout_drawer_safe_retry_same_idempotency', guardedHarness.timeoutDrawerSafe && contractRuntime.retryPlan[0].action === 'retry_same_idempotency_token', JSON.stringify(contractRuntime.retryPlan[0]));
  assertCase(results, 'w166_duplicate_idempotency_poll_existing_task', guardedHarness.duplicateIdempotencyContinuesPolling && contractRuntime.retryPlan[1].action === 'continue_poll_existing_runner_task', JSON.stringify(contractRuntime.retryPlan[1]));
  assertCase(results, 'w166_adapter_error_drawer_safe_stop', guardedHarness.adapterErrorDrawerSafe && contractRuntime.retryPlan[2].action === 'stop_and_surface_drawer_safe_error', JSON.stringify(contractRuntime.retryPlan[2]));
  assertCase(results, 'w166_malformed_completed_result_rejected_by_w151', guardedHarness.malformedCompletedBlockedByW151, JSON.stringify(contractRuntime.malformedCompletedResultGuard));
  assertCase(results, 'w166_errors_and_retries_do_not_mutate_final_names', guardedHarness.retryPlanDoesNotMutateNames, JSON.stringify(contractRuntime.mutationGuard));
  assertCase(results, 'w166_errors_and_retries_do_not_create_open_links', guardedHarness.retryPlanDoesNotCreateOpenLinks, JSON.stringify(contractRuntime.retryPlan));
  assertCase(results, 'w166_handoff_still_rejected_and_live_disabled', guardedHarness.handoffStillRejected && guardedHarness.liveInvocationStillDisabled, handoffGuard.status);
  assertCase(results, 'w166_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w166-approved-server-adapter-live-disabled-error-retry.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_error_retry_contract_ready',
    decision: failures.length ? 'FAIL' : 'PASS_ERROR_RETRY_CONTRACT_READY__VISUAL_TESTING_BLOCKED',
    errorRetryContract: {
      schema: contractRuntime.schema,
      status: contractRuntime.status,
      mode: contractRuntime.mode,
      requestSummary: contractRuntime.requestSummary,
      normalizedStatuses: contractRuntime.normalizedStatuses,
      retryPlan: contractRuntime.retryPlan,
      malformedCompletedResultGuard: contractRuntime.malformedCompletedResultGuard,
      mutationGuard: contractRuntime.mutationGuard
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W167: Approved Server Adapter Live-Disabled Retry UI And Operator Evidence Surface',
      prompt: 'Move through W167: Approved Server Adapter Live-Disabled Retry UI And Operator Evidence Surface. Use the W166 error/retry contract to surface drawer-safe Build statuses for timeout retry, duplicate idempotency polling, adapter error stop, and malformed completed-result rejection while real invocation remains disabled. Prove the UI does not mutate final generated names, does not create active Open links, preserves W151 import guard, preserves state authority and handoff parity, and keeps rollback by disabling server flags. Do not enable writes, do not invoke NetSuite live, and do not request visual testing. Output retry UI/status contract, guarded harness, trace samples, W167 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w166-approved-server-adapter-live-disabled-error-retry-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    normalizedStatuses: contractRuntime.normalizedStatuses,
    retryPlan: contractRuntime.retryPlan,
    malformedCompletedResultGuard: contractRuntime.malformedCompletedResultGuard,
    mutationGuard: contractRuntime.mutationGuard,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W166 Approved Server Adapter Live-Disabled Transport Error And Retry Contract

Decision: ${contract.decision}

## Error And Retry Contract
- Mode: ${contractRuntime.mode}.
- Idempotency token: ${contractRuntime.requestSummary.idempotencyToken}.
- Runner task id: ${contractRuntime.requestSummary.runnerTaskId}.
- Invocation attempted: ${contractRuntime.requestSummary.invocationAttempted}.
- Active Open links: ${contractRuntime.requestSummary.activeOpenLinks}.

## Normalized Error/Retry Responses
${Object.entries(contractRuntime.normalizedStatuses).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Retry Plan
${contractRuntime.retryPlan.map((item) => `- ${item.condition}: ${item.action}; status=${item.normalizedStatus}; mutatesFinalGeneratedNames=${item.mutatesFinalGeneratedNames}; activeOpenLinks=${item.activeOpenLinks}`).join('\n')}

## Malformed Completed Result Guard
- W151 status: ${contractRuntime.malformedCompletedResultGuard.status}.
- Rejected by W151: ${contractRuntime.malformedCompletedResultGuard.rejectedByW151}.
- Active Open links before import: ${contractRuntime.malformedCompletedResultGuard.activeOpenLinksBeforeImport}.

## Mutation Guard
- Final generated names unchanged: ${contractRuntime.mutationGuard.finalGeneratedNamesUnchanged}.
- No active Open links created: ${contractRuntime.mutationGuard.noActiveOpenLinksCreated}.
- No import commit attempted: ${contractRuntime.mutationGuard.noImportCommitAttempted}.

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
    console.error(`W166 approved server adapter error/retry contract FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W166 approved server adapter error/retry contract: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
