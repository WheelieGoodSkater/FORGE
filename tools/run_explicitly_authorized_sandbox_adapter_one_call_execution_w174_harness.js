const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w173Path = path.join(root, 'data', 'w173_approved_server_adapter_real_sandbox_one_call_packet.json');
const dataPath = path.join(root, 'data', 'w174_explicitly_authorized_sandbox_adapter_one_call_execution.json');
const tracePath = path.join(root, 'trace_samples', 'w174_explicitly_authorized_sandbox_adapter_one_call_execution_trace.json');
const reportPath = path.join(root, 'reports', 'w174_explicitly_authorized_sandbox_adapter_one_call_execution.md');

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

function adapterConfig(overrides) {
  return Object.assign({
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'explicitly_authorized_sandbox_adapter_one_call_execution'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T23:59:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'W174 explicitly authorized one-call harness. Final names remain unchanged until W151 import.'
  }, overrides || {});
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
      componentItem: { type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }
    },
    demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
    heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
    matrixItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
    componentItems: [{ type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }]
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

function baseOptions(w173) {
  return {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    explicitLiveAuthorization: true,
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: true,
    executeLiveCall: false,
    explicitW174Authorization: false,
    w172Decision: 'PASS_ONE_CALL_EXECUTION_HARNESS_READY__LIVE_DISABLED_BY_DEFAULT__VISUAL_TESTING_BLOCKED',
    w172ExecutionHarnessReady: true,
    w173Decision: w173.decision,
    oneSubmitLimit: {
      maxQueueSubmitAttempts: 1,
      duplicateIdempotencyBehavior: 'poll_existing_runner_task',
      secondSubmitBehavior: 'blocked_duplicate_submit'
    },
    pollingLimit: {
      maxPollAttempts: 8,
      pollIntervalMs: 1500,
      timeoutBehavior: 'retry_same_idempotency_until_limit_then_stop'
    }
  };
}

async function main() {
  const w173 = readJson(w173Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  let submitCalls = 0;
  let errorCalls = 0;
  const queuedTransport = (request) => {
    submitCalls += 1;
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_pending_transport_fixture',
      queueSubmitted: true,
      runnerTaskId: `task_w174_${request.idempotencyToken || 'no_token'}_001`,
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: `task_w174_${request.idempotencyToken || 'no_token'}_001`,
        resultCaptureCursor: 'cursor_w174_one_call_queued'
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
  };
  const errorTransport = () => {
    errorCalls += 1;
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'adapter_error',
      error: true,
      queueSubmitted: false,
      runnerTaskId: null,
      resultCapture: {
        status: 'adapter_error',
        error: true,
        resultCaptureCursor: 'cursor_w174_adapter_error'
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
  };

  const defaultNoSubmit = hooks.explicitlyAuthorizedSandboxAdapterOneCallExecutionV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w173), { transport: queuedTransport })
  );
  const authorizedSubmit = hooks.explicitlyAuthorizedSandboxAdapterOneCallExecutionV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w173), {
      executeLiveCall: true,
      explicitW174Authorization: true,
      transport: queuedTransport
    })
  );
  const duplicateBlocked = hooks.explicitlyAuthorizedSandboxAdapterOneCallExecutionV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w173), {
      executeLiveCall: true,
      explicitW174Authorization: true,
      oneSubmitAlreadyUsed: true,
      transport: queuedTransport
    })
  );
  const adapterError = hooks.explicitlyAuthorizedSandboxAdapterOneCallExecutionV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w173), {
      executeLiveCall: true,
      explicitW174Authorization: true,
      transport: errorTransport
    })
  );

  const executionContract = {
    defaultPath: 'explicit_one_call_blocked_no_submit',
    authorizedPath: 'explicit_one_call_submitted_result_capture_pending',
    adapterErrorPath: 'explicit_one_call_adapter_error_drawer_safe',
    requiredPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    explicitAuthorizationFlag: 'explicitW174Authorization',
    oneSubmitRule: 'Exactly one approved adapter transport invocation is allowed; duplicate submit attempts are blocked and must poll existing runnerTaskId.',
    importRule: 'Final generated names remain unchanged until W151 accepts completed runner result JSON.'
  };
  const guardedHarness = {
    startsFromW173: w173.decision === 'PASS_REAL_SANDBOX_ONE_CALL_PACKET_READY__EXECUTION_DISABLED__VISUAL_TESTING_BLOCKED',
    executionHookReady: typeof hooks.explicitlyAuthorizedSandboxAdapterOneCallExecutionV1 === 'function',
    defaultNoSubmitNoRequest: defaultNoSubmit.status === 'explicit_one_call_blocked_no_submit' &&
      defaultNoSubmit.executionEvidence.requestSent === false &&
      defaultNoSubmit.executionEvidence.queueSubmitted === false,
    authorizedSubmitsExactlyOnce: authorizedSubmit.status === 'explicit_one_call_submitted_result_capture_pending' &&
      authorizedSubmit.executionEvidence.submitAttemptCount === 1 &&
      authorizedSubmit.executionEvidence.requestSent === true &&
      authorizedSubmit.executionEvidence.queueSubmitted === true &&
      /^task_w174_/.test(String(authorizedSubmit.executionEvidence.runnerTaskId || '')) &&
      submitCalls === 1,
    duplicateSubmitBlocked: duplicateBlocked.status === 'explicit_one_call_blocked_no_submit' &&
      duplicateBlocked.executionEvidence.submitAttemptCount === 0 &&
      duplicateBlocked.executionEvidence.requestSent === false &&
      duplicateBlocked.blockedReasons.includes('one_submit_limit_already_used') &&
      submitCalls === 1,
    adapterErrorCapturedSafely: adapterError.status === 'explicit_one_call_adapter_error_drawer_safe' &&
      adapterError.adapterErrorEvidence.captured === true &&
      adapterError.executionEvidence.queueSubmitted === false &&
      errorCalls === 1,
    finalGeneratedNamesUnchanged: defaultNoSubmit.mutationGuard.finalGeneratedNamesUnchanged === true &&
      authorizedSubmit.mutationGuard.finalGeneratedNamesUnchanged === true &&
      adapterError.mutationGuard.finalGeneratedNamesUnchanged === true,
    noActiveOpenLinks: defaultNoSubmit.mutationGuard.activeOpenLinks === 0 &&
      authorizedSubmit.mutationGuard.activeOpenLinks === 0 &&
      adapterError.mutationGuard.activeOpenLinks === 0,
    w151ImportStillRequired: authorizedSubmit.runnerTaskIdEvidence.w151ImportRequiredBeforeNamesMutate === true &&
      authorizedSubmit.normalizedResponse.finalGeneratedNamesJsonReady === false,
    traceSamplesReady: Array.isArray(authorizedSubmit.traceSamples) &&
      authorizedSubmit.traceSamples.length >= 3 &&
      authorizedSubmit.traceSamples.every((sample) => sample.activeOpenLinks === 0 && sample.mutatesFinalGeneratedNames === false)
  };
  const noRegression = {
    noDrawerWrites: authorizedSubmit.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: authorizedSubmit.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: authorizedSubmit.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: authorizedSubmit.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: authorizedSubmit.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: authorizedSubmit.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: authorizedSubmit.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: authorizedSubmit.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: authorizedSubmit.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: authorizedSubmit.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };
  const visualTestingDecision = {
    visualTestingBlocked: true,
    visualNetSuiteTestingRequiredNow: false,
    reason: 'W174 captures runnerTaskId or adapter-error evidence only. Visual testing stays blocked until a real governed runner result returns to IDB and W151 import succeeds.'
  };

  const results = [];
  assertCase(results, 'w174_starts_from_w173_execution_packet', guardedHarness.startsFromW173, w173.decision);
  assertCase(results, 'w174_execution_hook_ready', guardedHarness.executionHookReady, 'explicitlyAuthorizedSandboxAdapterOneCallExecutionV1');
  assertCase(results, 'w174_default_no_submit_no_request', guardedHarness.defaultNoSubmitNoRequest, JSON.stringify(defaultNoSubmit.blockedReasons));
  assertCase(results, 'w174_authorized_submits_exactly_once', guardedHarness.authorizedSubmitsExactlyOnce, JSON.stringify(authorizedSubmit.executionEvidence));
  assertCase(results, 'w174_duplicate_submit_blocked', guardedHarness.duplicateSubmitBlocked, JSON.stringify(duplicateBlocked.blockedReasons));
  assertCase(results, 'w174_adapter_error_captured_safely', guardedHarness.adapterErrorCapturedSafely, JSON.stringify(adapterError.adapterErrorEvidence));
  assertCase(results, 'w174_names_and_links_unchanged_until_w151_import', guardedHarness.finalGeneratedNamesUnchanged && guardedHarness.noActiveOpenLinks && guardedHarness.w151ImportStillRequired, JSON.stringify(authorizedSubmit.mutationGuard));
  assertCase(results, 'w174_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(authorizedSubmit.traceSamples));
  assertCase(results, 'w174_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w174_visual_testing_blocked_until_runner_result_returns', visualTestingDecision.visualTestingBlocked === true && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, visualTestingDecision.reason);

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w174-explicitly-authorized-sandbox-adapter-one-call-execution.v1',
    status: 'explicitly_authorized_sandbox_adapter_one_call_execution_ready',
    decision: failures.length
      ? 'FAIL_EXPLICITLY_AUTHORIZED_SANDBOX_ADAPTER_ONE_CALL_EXECUTION'
      : 'PASS_EXPLICITLY_AUTHORIZED_SANDBOX_ADAPTER_ONE_CALL_EXECUTION_READY__RUNNER_TASK_OR_ERROR_CAPTURED__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    executionContract,
    guardedHarness,
    executionEvidence: {
      defaultNoSubmit: defaultNoSubmit.executionEvidence,
      authorizedSubmit: authorizedSubmit.executionEvidence,
      duplicateBlocked: duplicateBlocked.executionEvidence,
      adapterError: adapterError.executionEvidence
    },
    runnerTaskIdEvidence: authorizedSubmit.runnerTaskIdEvidence,
    adapterErrorEvidence: adapterError.adapterErrorEvidence,
    samples: {
      defaultNoSubmit,
      authorizedSubmit,
      duplicateBlocked,
      adapterError
    },
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W175: Governed Runner Result Poll And Import Gate',
      prompt: 'Move through W175: Governed Runner Result Poll And Import Gate. Use the W174 runnerTaskId or adapter error evidence to add the result-capture polling/import gate. If runnerTaskId exists, poll or accept the approved server adapter result envelope until completed runner result JSON is available; if adapter error exists, stop safely with operator evidence. Do not mutate final generated names until W151 validates completed runner result JSON with numeric ids and supported NetSuite URLs. Preserve no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing until completed runner result JSON is imported. Output polling/import gate contract, guarded harness, trace samples, W175 report, visual testing decision blocked until completed result import, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w174-explicitly-authorized-sandbox-adapter-one-call-execution-trace.v1',
    generatedAt: contract.generatedAt,
    defaultNoSubmitTrace: defaultNoSubmit.traceSamples,
    authorizedSubmitTrace: authorizedSubmit.traceSamples,
    duplicateBlockedTrace: duplicateBlocked.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W174 Explicitly Authorized Sandbox Adapter One-Call Execution

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Execution Evidence

- Default path: ${defaultNoSubmit.status}; request sent = ${defaultNoSubmit.executionEvidence.requestSent}.
- Authorized one-call path: ${authorizedSubmit.status}; request sent = ${authorizedSubmit.executionEvidence.requestSent}; queue submitted = ${authorizedSubmit.executionEvidence.queueSubmitted}; runnerTaskId = ${authorizedSubmit.executionEvidence.runnerTaskId}.
- Duplicate path: ${duplicateBlocked.status}; request sent = ${duplicateBlocked.executionEvidence.requestSent}; blocked reasons = ${duplicateBlocked.blockedReasons.join(', ')}.
- Adapter error path: ${adapterError.status}; adapter error captured = ${adapterError.adapterErrorEvidence.captured}.
- Final generated names unchanged until W151 import: ${authorizedSubmit.mutationGuard.finalGeneratedNamesUnchanged}.
- Active Open links before completed result import: 0.

## Guarded Harness

| Gate | Result |
| --- | --- |
${Object.entries(guardedHarness).map(([key, value]) => `| ${key} | ${value ? 'PASS' : 'FAIL'} |`).join('\n')}

## Visual Testing Decision

${visualTestingDecision.reason}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  if (failures.length) {
    console.error(`W174 explicitly authorized one-call execution FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W174 explicitly authorized one-call execution: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}; runnerTaskId=${authorizedSubmit.executionEvidence.runnerTaskId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
