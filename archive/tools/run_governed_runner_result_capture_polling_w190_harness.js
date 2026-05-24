const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w190_governed_runner_result_capture_polling.json');
const tracePath = path.join(root, 'trace_samples', 'w190_governed_runner_result_capture_polling_trace.json');
const reportPath = path.join(root, 'reports', 'w190_governed_runner_result_capture_polling.md');

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
    Blob: function Blob() {},
    Promise,
    fetch: () => Promise.reject(new Error('live fetch disabled in W190 harness')),
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
      customer: { type: 'customer', name: 'Ariat International Outdoor Retail Account', internalId: 501234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234' },
      demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
      heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
      matrixProofItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
      componentItem: { type: 'inventoryitem', name: 'Ariat Brown Boot Size Color Supporting SKU', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }
    },
    demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
    heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
    matrixItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
    componentItems: [{ type: 'inventoryitem', name: 'Ariat Brown Boot Size Color Supporting SKU', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }]
  };
}

function readyOptions() {
  return {
    adapterConfig: {
      endpointUrl: '',
      adapterApproved: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666'],
      currentSandboxAccount: 'TD3021666',
      idempotencyToken: 'idb_w190_ariatinternational_001'
    },
    operatorEvidence: {
      operatorName: 'Operator User',
      currentSandboxAccount: 'TD3021666',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedSandboxAccount: true,
      endpointConfirmed: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
    }
  };
}

function buildContext(hooks) {
  const state = ariatState();
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
  const context = buildContext(hooks);
  const ready = readyOptions();
  const executed = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, ready, {
      executeLiveCall: true,
      transport: () => ({
        schema: 'idb.governed-runner-adapter-result.v1',
        status: 'queued_result_capture_pending',
        queueSubmitted: true,
        runnerTaskId: 'task_w190_ariatinternational_001',
        idempotencyToken: ready.adapterConfig.idempotencyToken,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId: 'task_w190_ariatinternational_001',
          resultCaptureCursor: 'cursor_w190_initial',
          finalGeneratedNamesJson: null
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine'
      })
    })
  );
  context.state.integratedBuildAdapterConfig = ready.adapterConfig;
  context.state.integratedBuildOperatorApproval = ready.operatorEvidence;
  context.state.integratedBuildRunnerResult = executed.runnerTaskIdCapturePath.statePatch.integratedBuildRunnerResult;

  const noRunnerTask = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    Object.assign({}, context.state, { integratedBuildRunnerResult: null }),
    context.lane,
    context.page,
    context.recommendation,
    ready
  );
  const readyNoSubmit = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, ready, { adapterResult: context.state.integratedBuildRunnerResult, executePoll: false, approvedEndpointMode: 'approved_server_adapter_only' })
  );
  const pending = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, ready, {
      adapterResult: context.state.integratedBuildRunnerResult,
      executePoll: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      transport: (request) => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId: request.runnerTaskId,
        resultCapture: {
          status: 'polling_pending',
          runnerTaskId: request.runnerTaskId,
          resultCaptureCursor: 'cursor_w190_pending'
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    })
  );
  const completed = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, ready, {
      adapterResult: context.state.integratedBuildRunnerResult,
      executePoll: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      transport: (request) => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'completed_runner_result_ready',
        queueSubmitted: true,
        runnerTaskId: request.runnerTaskId,
        resultCapture: {
          status: 'completed_result_capture_ready',
          runnerTaskId: request.runnerTaskId,
          resultCaptureCursor: 'cursor_w190_completed',
          finalGeneratedNamesJson: completedRunnerResultJson()
        },
        finalGeneratedNamesJson: completedRunnerResultJson(),
        activeOpenLinks: 0
      })
    })
  );
  const adapterError = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, ready, {
      adapterResult: context.state.integratedBuildRunnerResult,
      executePoll: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      transport: (request) => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'adapter_error',
        error: true,
        runnerTaskId: request.runnerTaskId,
        resultCapture: {
          status: 'adapter_error',
          runnerTaskId: request.runnerTaskId
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    })
  );

  const results = [];
  assertCase(results, 'w190_blocks_without_runner_task_id', noRunnerTask.status === 'w190_poll_blocked_missing_runner_task_id' && noRunnerTask.requestSent === false, JSON.stringify(noRunnerTask.blockedReasons));
  assertCase(results, 'w190_constructs_approved_poll_request_without_submit', readyNoSubmit.status === 'w190_poll_ready_not_executed' && readyNoSubmit.pollRequestEnvelope.bodyParams.custpage_idb_action === 'poll_runner_result_capture' && readyNoSubmit.pollRequestEnvelope.bodyFormEncoded.includes('custpage_idb_runner_task_id='), JSON.stringify(readyNoSubmit.pollRequestEnvelope.bodyParams));
  assertCase(results, 'w190_pending_is_non_mutating', pending.status === 'w190_poll_pending_result_capture' && pending.resultImportGuard.importReady === false && pending.mutationGuard.finalGeneratedNamesUnchanged === true && pending.mutationGuard.activeOpenLinks === 0, JSON.stringify(pending.resultImportGuard));
  assertCase(results, 'w190_completed_is_w151_import_ready_only', completed.status === 'w190_completed_result_ready_for_w151_import' && completed.resultImportGuard.completedResultAcceptedByW151 === true && completed.resultImportGuard.importReady === true && completed.statePatch.integratedBuildRunnerResult.finalGeneratedNamesJson && completed.mutationGuard.finalGeneratedNamesImported === false, JSON.stringify(completed.resultImportGuard));
  assertCase(results, 'w190_adapter_error_stops_safely', adapterError.status === 'w190_adapter_error_drawer_safe' && adapterError.resultImportGuard.importReady === false && adapterError.mutationGuard.finalGeneratedNamesUnchanged === true, JSON.stringify(adapterError.resultImportGuard));
  assertCase(results, 'w190_no_active_links_before_import', [noRunnerTask, readyNoSubmit, pending, completed, adapterError].every((entry) => entry.mutationGuard.activeOpenLinks === 0 && entry.mutationGuard.drawerWritesAttempted === false && entry.mutationGuard.drawerTransactionWritesAttempted === false), 'all W190 states keep links hidden before W151 import');

  const guardedHarness = {
    blocksWithoutRunnerTaskId: results.find((result) => result.name === 'w190_blocks_without_runner_task_id').pass,
    constructsApprovedPollRequestWithoutSubmit: results.find((result) => result.name === 'w190_constructs_approved_poll_request_without_submit').pass,
    pendingIsNonMutating: results.find((result) => result.name === 'w190_pending_is_non_mutating').pass,
    completedIsW151ImportReadyOnly: results.find((result) => result.name === 'w190_completed_is_w151_import_ready_only').pass,
    adapterErrorStopsSafely: results.find((result) => result.name === 'w190_adapter_error_stops_safely').pass,
    noActiveLinksBeforeImport: results.find((result) => result.name === 'w190_no_active_links_before_import').pass
  };
  const pass = results.every((result) => result.pass);
  const report = {
    schema: 'idb.w190-report.v1',
    block: 'W190',
    title: 'Governed Runner Result Capture Polling To Completed JSON',
    status: pass ? 'PASS' : 'FAIL',
    pollingContract: completed.pollingContract,
    completedResultEnvelopeShape: completed.completedResultEnvelopeShape,
    guardedHarness,
    cases: {
      noRunnerTask,
      readyNoSubmit,
      pending,
      completed,
      adapterError
    },
    traceSamples: [
      ...noRunnerTask.traceSamples,
      ...readyNoSubmit.traceSamples,
      ...pending.traceSamples,
      ...completed.traceSamples,
      ...adapterError.traceSamples
    ],
    visualTestingDecision: {
      decision: 'blocked_until_completed_result_import',
      targetedOpenLinkTestingReady: false,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'Polling can return completed JSON, but IDB Open links stay hidden until W151 import commits numeric ids and supported URLs.'
    },
    bestNextCodexPrompt: 'Move through W191: Server Adapter Result Capture Endpoint Support And Completed JSON Return. Extend the W144 approved server adapter to support the W190 poll_runner_result_capture action, retrieve the governed runner result capture by runnerTaskId/idempotency token, and return either pending, adapter-error, or W151-valid completed runner result JSON with numeric internal ids and supported NetSuite URLs. Preserve no drawer writes, no drawer-created records, no direct SuiteScript outside the approved adapter path, internal runner ownership, rollback by disabling flags, and no active Open links until import. Output server endpoint changes, guarded harness, trace samples, W191 report, visual testing decision, and best next Codex prompt.'
  };
  writeJson(dataPath, report);
  writeJson(tracePath, report.traceSamples);
  fs.writeFileSync(reportPath, [
    '# W190: Governed Runner Result Capture Polling To Completed JSON',
    '',
    `Status: ${report.status}`,
    '',
    '## Polling Contract',
    '- Check runner result is hidden until runnerTaskId exists.',
    '- Poll requests use the approved W144 server adapter result-capture path only.',
    '- Pending and adapter-error responses do not mutate final generated names.',
    '- Completed responses are import-ready only after W151 validates numeric ids, supported NetSuite URLs, and internal runner ownership.',
    '- Open links remain hidden until the completed result is imported.',
    '',
    '## Completed Result Envelope Shape',
    '```json',
    JSON.stringify(report.completedResultEnvelopeShape, null, 2),
    '```',
    '',
    '## Guarded Harness',
    '```json',
    JSON.stringify(guardedHarness, null, 2),
    '```',
    '',
    '## Visual Testing Decision',
    'Blocked until completed runner result JSON is imported. No Open-link visual testing is useful before W151 commit.',
    '',
    '## Best Next Codex Prompt',
    report.bestNextCodexPrompt,
    ''
  ].join('\n'));
  if (!pass) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
  console.log(`W190 harness PASS (${results.length} checks).`);
}

main();
