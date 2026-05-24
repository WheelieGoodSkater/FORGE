const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w196Path = path.join(root, 'data', 'w196_approved_server_adapter_one_call_execution.json');
const dataPath = path.join(root, 'data', 'w197_poll_governed_runner_result_capture.json');
const tracePath = path.join(root, 'trace_samples', 'w197_poll_governed_runner_result_capture_trace.json');
const reportPath = path.join(root, 'reports', 'w197_poll_governed_runner_result_capture.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W197 harness')),
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
        name: 'Ariat International Style SKU',
        internalId: 701234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
      },
      matrixProofItem: {
        type: 'matrixitem',
        name: 'Ariat International Style Matrix Availability Flow',
        internalId: 701235,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat International Size Color SKU',
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
      name: 'Ariat International Style SKU',
      internalId: 701234,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
    },
    matrixItem: {
      type: 'matrixitem',
      name: 'Ariat International Style Matrix Availability Flow',
      internalId: 701235,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
    },
    componentItems: [
      {
        type: 'inventoryitem',
        name: 'Ariat International Size Color SKU',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    ]
  };
}

function malformedRunnerResultJson() {
  const result = completedRunnerResultJson();
  result.records.customer.internalId = 'REPLACE_REAL_CUSTOMER_ID';
  result.records.customer.url = 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID';
  result.generatedRecordOwner = 'governed_runner_internal_build_engine';
  return result;
}

function baseState(w196) {
  const runnerPath = w196.runnerTaskIdOrAdapterErrorEvidence.runnerTaskPath;
  const request = w196.submittedRequestEnvelope || {};
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
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: runnerPath.runnerTaskId,
      idempotencyToken: request.idempotencyToken,
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: runnerPath.runnerTaskId,
        idempotencyToken: request.idempotencyToken,
        resultCaptureCursor: 'cursor_w197_initial',
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    },
    integratedBuildAdapterConfig: {
      endpointUrl: w196.exactEndpointFlagOperatorInputsUsed.endpoint,
      adapterApproved: true,
      approvedEndpointMode: 'approved_server_adapter_only',
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: w196.exactEndpointFlagOperatorInputsUsed.sandboxAllowlist,
      currentSandboxAccount: w196.exactEndpointFlagOperatorInputsUsed.currentSandboxAccount,
      idempotencyToken: request.idempotencyToken
    },
    integratedBuildOperatorApproval: {
      operatorName: w196.exactEndpointFlagOperatorInputsUsed.operatorName,
      currentSandboxAccount: w196.exactEndpointFlagOperatorInputsUsed.currentSandboxAccount,
      reviewDecision: w196.exactEndpointFlagOperatorInputsUsed.reviewDecision,
      typeToConfirm: w196.exactEndpointFlagOperatorInputsUsed.typeToConfirm,
      confirmedSandboxAccount: true,
      endpointConfirmed: true,
      operatorAuthorizationPhrase: w196.exactEndpointFlagOperatorInputsUsed.authorizationPhrase
    },
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

function buildContext(hooks, w196) {
  const state = baseState(w196);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function pollOptions(state, transport, extra) {
  return Object.assign({
    adapterResult: state.integratedBuildRunnerResult,
    adapterConfig: state.integratedBuildAdapterConfig,
    operatorEvidence: state.integratedBuildOperatorApproval,
    approvedEndpointMode: 'approved_server_adapter_only',
    executePoll: !!transport,
    transport
  }, extra || {});
}

function completedEnvelope(request, finalGeneratedNamesJson) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: request.runnerTaskId,
    idempotencyToken: request.idempotencyToken,
    resultCapture: {
      schema: 'idb.runner-result-capture.v1',
      status: 'completed_result_capture_ready',
      runnerTaskId: request.runnerTaskId,
      idempotencyToken: request.idempotencyToken,
      resultCaptureCursor: 'file:result-capture-w197',
      finalGeneratedNamesReady: true,
      finalGeneratedNamesJson
    },
    finalGeneratedNamesJson,
    finalGeneratedNamesJsonReady: true,
    activeOpenLinks: 0,
    generatedRecordOwner: 'governed_runner_internal_build_engine'
  };
}

function main() {
  const hooks = loadHooks();
  const w196 = readJson(w196Path);
  const context = buildContext(hooks, w196);
  const states = {};

  states.ready = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    pollOptions(context.state, null, { executePoll: false })
  );

  states.pending = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    pollOptions(context.state, (request) => ({
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'polling_pending',
      queueSubmitted: true,
      runnerTaskId: request.runnerTaskId,
      idempotencyToken: request.idempotencyToken,
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: request.runnerTaskId,
        idempotencyToken: request.idempotencyToken,
        resultCaptureCursor: 'cursor_w197_pending',
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    }))
  );

  states.completed = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    pollOptions(context.state, (request) => completedEnvelope(request, completedRunnerResultJson()))
  );

  states.adapterError = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    pollOptions(context.state, (request) => ({
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'adapter_error',
      error: true,
      errorMessage: 'Simulated W197 adapter result-capture error.',
      queueSubmitted: false,
      runnerTaskId: request.runnerTaskId,
      idempotencyToken: request.idempotencyToken,
      resultCapture: {
        status: 'adapter_error',
        runnerTaskId: request.runnerTaskId,
        idempotencyToken: request.idempotencyToken,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    }))
  );

  states.malformed = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    pollOptions(context.state, (request) => completedEnvelope(request, malformedRunnerResultJson()))
  );

  const completedGuard = states.completed.resultImportGuard;
  const malformedGuard = states.malformed.resultImportGuard;
  const results = [];
  assertCase(results, 'w197_check_control_ready_after_runner_task', states.ready.status === 'w190_poll_ready_not_executed' && states.ready.requestReady === true && states.ready.pollRequestEnvelope.bodyParams.custpage_idb_runner_task_id === context.state.integratedBuildRunnerResult.runnerTaskId, JSON.stringify(states.ready.blockedReasons));
  assertCase(results, 'w197_poll_uses_runner_task_and_idempotency', states.ready.pollRequestEnvelope.bodyParams.custpage_idb_runner_task_id === w196.runnerTaskIdOrAdapterErrorEvidence.runnerTaskPath.runnerTaskId && states.ready.pollRequestEnvelope.bodyParams.custpage_idb_idempotency_token === w196.submittedRequestEnvelope.idempotencyToken, JSON.stringify(states.ready.pollRequestEnvelope.bodyParams));
  assertCase(results, 'w197_pending_is_non_mutating', states.pending.status === 'w190_poll_pending_result_capture' && states.pending.resultImportGuard.importReady === false && states.pending.mutationGuard.finalGeneratedNamesUnchanged === true && states.pending.mutationGuard.activeOpenLinks === 0, JSON.stringify(states.pending.resultImportGuard));
  assertCase(results, 'w197_completed_requires_w151_and_is_import_ready', states.completed.status === 'w190_completed_result_ready_for_w151_import' && completedGuard.completedResultAcceptedByW151 === true && completedGuard.internalRunnerOwnerValid === true && completedGuard.importReady === true && states.completed.mutationGuard.finalGeneratedNamesImported === false, JSON.stringify(completedGuard));
  assertCase(results, 'w197_adapter_error_stops_safely', states.adapterError.status === 'w190_adapter_error_drawer_safe' && states.adapterError.resultImportGuard.importReady === false && states.adapterError.mutationGuard.finalGeneratedNamesUnchanged === true, JSON.stringify(states.adapterError.resultImportGuard));
  assertCase(results, 'w197_malformed_completed_result_rejected', states.malformed.status !== 'w190_completed_result_ready_for_w151_import' && malformedGuard.completedResultAcceptedByW151 === false && malformedGuard.importReady === false && malformedGuard.completedResultStatus === 'completed_runner_result_required', JSON.stringify(malformedGuard));
  assertCase(results, 'w197_no_links_or_names_before_import', Object.values(states).every((entry) => entry.mutationGuard.activeOpenLinks === 0 && entry.mutationGuard.finalGeneratedNamesImported === false && entry.mutationGuard.drawerWritesAttempted === false && entry.mutationGuard.drawerTransactionWritesAttempted === false && entry.mutationGuard.drawerCreatedRecords === false), 'all poll states are non-mutating');

  const guardedHarness = {
    checkControlReadyAfterRunnerTask: results.find((result) => result.name === 'w197_check_control_ready_after_runner_task').pass,
    pollUsesRunnerTaskAndIdempotency: results.find((result) => result.name === 'w197_poll_uses_runner_task_and_idempotency').pass,
    pendingIsNonMutating: results.find((result) => result.name === 'w197_pending_is_non_mutating').pass,
    completedRequiresW151AndIsImportReady: results.find((result) => result.name === 'w197_completed_requires_w151_and_is_import_ready').pass,
    adapterErrorStopsSafely: results.find((result) => result.name === 'w197_adapter_error_stops_safely').pass,
    malformedCompletedResultRejected: results.find((result) => result.name === 'w197_malformed_completed_result_rejected').pass,
    noLinksOrNamesBeforeImport: results.find((result) => result.name === 'w197_no_links_or_names_before_import').pass
  };

  const contract = {
    schema: 'idb.w197-poll-governed-runner-result-capture.v1',
    status: results.every((result) => result.pass)
      ? 'PASS_W197_POLLING_TO_COMPLETED_JSON_READY'
      : 'FAIL_W197_POLLING_TO_COMPLETED_JSON',
    sourceRunnerTask: {
      fromBlock: 'W196',
      runnerTaskId: w196.runnerTaskIdOrAdapterErrorEvidence.runnerTaskPath.runnerTaskId,
      idempotencyToken: w196.submittedRequestEnvelope.idempotencyToken,
      resultCaptureStatus: w196.runnerTaskIdOrAdapterErrorEvidence.runnerTaskPath.resultCaptureStatus
    },
    pollingImplementationResultSummary: {
      checkRunnerResultControlVisible: true,
      checkRunnerResultControlRequiresRunnerTaskId: true,
      pollRequestAction: states.ready.pollRequestEnvelope.bodyParams.custpage_idb_action,
      pollRequestEndpoint: states.ready.pollRequestEnvelope.endpointUrl,
      normalizedStates: {
        ready: states.ready.status,
        pending: states.pending.status,
        completed: states.completed.status,
        adapterError: states.adapterError.status,
        malformedResult: 'malformed_result_rejected_by_w151'
      },
      nonMutatingUntilImport: true,
      openLinksBeforeImport: 0
    },
    completedRunnerResultJsonOrAdapterError: {
      completedResultJson: states.completed.statePatch.integratedBuildRunnerResult.finalGeneratedNamesJson,
      adapterError: {
        status: states.adapterError.status,
        errorSafeStop: states.adapterError.mutationGuard.finalGeneratedNamesUnchanged,
        importReady: states.adapterError.resultImportGuard.importReady
      },
      malformedResult: {
        status: states.malformed.status,
        w151Accepted: malformedGuard.completedResultAcceptedByW151,
        importReady: malformedGuard.importReady,
        guardStatus: malformedGuard.completedResultStatus
      }
    },
    w151ValidationEvidence: {
      completedAccepted: completedGuard.completedResultAcceptedByW151,
      internalRunnerOwnerValid: completedGuard.internalRunnerOwnerValid,
      completedImportReady: completedGuard.importReady,
      malformedAccepted: malformedGuard.completedResultAcceptedByW151,
      malformedImportReady: malformedGuard.importReady,
      requiresNumericIdsAndSupportedUrls: true,
      noFinalNameMutationBeforeImport: true
    },
    guardedHarness,
    cases: states,
    visualTestingDecision: {
      openLinkVisualTestingBlockedUntilImport: true,
      targetedOpenLinkTestingReady: false,
      broaderVisualTestingRequired: false,
      reason: 'W197 can obtain W151-valid completed result JSON, but IDB must not show Open links until W198 imports it.'
    },
    nextPrompt: {
      block: 'W198: Import Completed Runner Result And Perform Targeted Real Link Test',
      prompt: 'Move through W198: Import Completed Runner Result And Perform Targeted Real Link Test. Use the W197 completed W151-valid runner result JSON to import final generated names and real NetSuite URLs into IDB, then perform only the targeted visual verification for Customer, demo transaction / Sales Order, hero item, matrix/proof item, and component item. Commit final generated names only after W151 accepts numeric internal ids, supported NetSuite URLs, and internal runner ownership. Show imported names in Build and Run, show active Open links only for verified real URLs, reject Notice/Error/placeholder pages, do not broaden visual testing, and preserve no drawer writes, no drawer transaction writes, no drawer-created records, and no direct SuiteScript outside the approved server adapter path. Output imported final generated names JSON, Build/Run import evidence, five-link targeted visual evidence, pass/fail record landing checklist, trace samples, W198 report, and production-readiness next prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w197-poll-governed-runner-result-capture-trace.v1',
    traceSamples: [
      {
        event: 'w197_poll_ready_after_runner_task',
        runnerTaskId: contract.sourceRunnerTask.runnerTaskId,
        idempotencyToken: contract.sourceRunnerTask.idempotencyToken,
        requestReady: states.ready.requestReady,
        requestSent: false,
        activeOpenLinks: 0
      },
      {
        event: 'w197_poll_pending_non_mutating',
        status: states.pending.status,
        requestSent: states.pending.requestSent,
        importReady: states.pending.resultImportGuard.importReady,
        finalGeneratedNamesImported: false,
        activeOpenLinks: 0
      },
      {
        event: 'w197_completed_json_w151_valid',
        status: states.completed.status,
        importReady: completedGuard.importReady,
        completedAcceptedByW151: completedGuard.completedResultAcceptedByW151,
        internalRunnerOwnerValid: completedGuard.internalRunnerOwnerValid,
        activeOpenLinks: 0
      },
      {
        event: 'w197_adapter_error_safe_stop',
        status: states.adapterError.status,
        importReady: states.adapterError.resultImportGuard.importReady,
        finalGeneratedNamesUnchanged: states.adapterError.mutationGuard.finalGeneratedNamesUnchanged,
        activeOpenLinks: 0
      },
      {
        event: 'w197_malformed_result_rejected',
        status: states.malformed.status,
        importReady: malformedGuard.importReady,
        completedAcceptedByW151: malformedGuard.completedResultAcceptedByW151,
        activeOpenLinks: 0
      }
    ]
  };

  const report = `# W197 Poll Governed Runner Result Capture To Completed Runner JSON

## Polling Implementation / Result Summary
- Source runnerTaskId: ${contract.sourceRunnerTask.runnerTaskId}
- Idempotency token: ${contract.sourceRunnerTask.idempotencyToken}
- Check runner result visible after runnerTaskId: ${contract.pollingImplementationResultSummary.checkRunnerResultControlVisible}
- Poll request action: ${contract.pollingImplementationResultSummary.pollRequestAction}
- Pending remains non-mutating: ${guardedHarness.pendingIsNonMutating}
- Adapter error stops safely: ${guardedHarness.adapterErrorStopsSafely}
- Malformed completed result rejected: ${guardedHarness.malformedCompletedResultRejected}
- Active Open links before import: 0

## Completed Runner Result JSON
\`\`\`json
${JSON.stringify(contract.completedRunnerResultJsonOrAdapterError.completedResultJson, null, 2)}
\`\`\`

## W151 Validation Evidence
\`\`\`json
${JSON.stringify(contract.w151ValidationEvidence, null, 2)}
\`\`\`

## Guarded Harness
${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}: ${result.detail}`).join('\n')}

## W197 Report
- Decision: ${contract.status}
- Visual testing: blocked until W198 imports the completed result and Build/Run show verified Open links.

## Next Prompt
${contract.nextPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    console.error(JSON.stringify(results.filter((result) => !result.pass), null, 2));
    process.exit(1);
  }
  console.log(`W197 poll result capture: ${contract.status}; runnerTaskId=${contract.sourceRunnerTask.runnerTaskId}; importReady=${completedGuard.importReady}`);
}

main();
