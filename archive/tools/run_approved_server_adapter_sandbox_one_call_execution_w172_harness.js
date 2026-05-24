const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w171Path = path.join(root, 'data', 'w171_approved_server_adapter_one_call_authorization_gate.json');
const dataPath = path.join(root, 'data', 'w172_approved_server_adapter_sandbox_one_call_execution_harness.json');
const tracePath = path.join(root, 'trace_samples', 'w172_approved_server_adapter_sandbox_one_call_execution_harness_trace.json');
const reportPath = path.join(root, 'reports', 'w172_approved_server_adapter_sandbox_one_call_execution_harness.md');

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
    mode: 'approved_server_adapter_sandbox_one_call_execution_harness'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T23:40:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'W172 harness-only one-call execution. No real NetSuite invocation.'
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

function baseOptions() {
  return {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    retryLimit: 2,
    explicitLiveAuthorization: true,
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: true,
    executeLiveCall: false,
    harnessAuthorizesSandboxCall: false,
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
  const w171 = readJson(w171Path);
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
      runnerTaskId: `task_w172_${request.idempotencyToken || 'no_token'}_001`,
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: `task_w172_${request.idempotencyToken || 'no_token'}_001`,
        resultCaptureCursor: 'cursor_w172_one_call_queued'
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
        resultCaptureCursor: 'cursor_w172_adapter_error'
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
  };

  const defaultNoSubmit = hooks.approvedServerAdapterSandboxOneCallExecutionHarnessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(), { transport: queuedTransport })
  );
  const authorizedSubmit = hooks.approvedServerAdapterSandboxOneCallExecutionHarnessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(), {
      executeLiveCall: true,
      harnessAuthorizesSandboxCall: true,
      transport: queuedTransport
    })
  );
  const secondSubmitBlocked = hooks.approvedServerAdapterSandboxOneCallExecutionHarnessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(), {
      executeLiveCall: true,
      harnessAuthorizesSandboxCall: false,
      transport: queuedTransport
    })
  );
  const adapterError = hooks.approvedServerAdapterSandboxOneCallExecutionHarnessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(), {
      executeLiveCall: true,
      harnessAuthorizesSandboxCall: true,
      transport: errorTransport
    })
  );

  const executionHarnessContract = {
    defaultPath: 'one_call_execution_not_authorized_no_submit',
    authorizedPath: 'one_call_submitted_result_capture_pending',
    adapterErrorPath: 'one_call_attempted_adapter_error_drawer_safe',
    liveDisabledByDefault: true,
    harnessAuthorizationFlag: 'harnessAuthorizesSandboxCall',
    operatorPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    importRule: 'W151 completed runner result import guard must validate completed result JSON before final generated names update.',
    oneSubmitRule: 'One execution harness call may invoke the approved adapter transport once; duplicate submits stay blocked and poll existing task in later blocks.'
  };
  const guardedHarness = {
    startsFromW171: w171.decision === 'PASS_ONE_CALL_AUTHORIZATION_GATE_READY__NO_SUBMIT__VISUAL_TESTING_BLOCKED',
    executionHookReady: typeof hooks.approvedServerAdapterSandboxOneCallExecutionHarnessV1 === 'function',
    defaultNoSubmitBlocks: defaultNoSubmit.status === 'one_call_execution_not_authorized_no_submit' &&
      defaultNoSubmit.transportOutcome.liveRequestSent === false &&
      defaultNoSubmit.transportOutcome.queueSubmitted === false,
    authorizedHarnessSubmitsOnce: authorizedSubmit.status === 'one_call_submitted_result_capture_pending' &&
      authorizedSubmit.submitBoundary.submitAttemptCount === 1 &&
      authorizedSubmit.transportOutcome.liveRequestSent === true &&
      authorizedSubmit.transportOutcome.queueSubmitted === true &&
      /^task_w172_/.test(String(authorizedSubmit.transportOutcome.runnerTaskId || '')) &&
      submitCalls === 1,
    duplicateOrUnauthorisedSecondSubmitBlocked: secondSubmitBlocked.status === 'one_call_execution_not_authorized_no_submit' &&
      secondSubmitBlocked.submitBoundary.submitAttemptCount === 0 &&
      secondSubmitBlocked.transportOutcome.liveRequestSent === false &&
      submitCalls === 1,
    adapterErrorCapturedSafely: adapterError.status === 'one_call_attempted_adapter_error_drawer_safe' &&
      adapterError.transportOutcome.adapterError === true &&
      adapterError.transportOutcome.queueSubmitted === false &&
      errorCalls === 1,
    finalGeneratedNamesUnchanged: defaultNoSubmit.mutationGuard.finalGeneratedNamesUnchanged === true &&
      authorizedSubmit.mutationGuard.finalGeneratedNamesUnchanged === true &&
      adapterError.mutationGuard.finalGeneratedNamesUnchanged === true,
    noActiveOpenLinks: defaultNoSubmit.mutationGuard.activeOpenLinks === 0 &&
      authorizedSubmit.mutationGuard.activeOpenLinks === 0 &&
      adapterError.mutationGuard.activeOpenLinks === 0,
    w151ImportStillRequired: authorizedSubmit.normalizedResponse.finalGeneratedNamesJsonReady === false &&
      authorizedSubmit.normalizedResponse.importGuard &&
      /W151/.test(authorizedSubmit.normalizedResponse.importGuard),
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
    reason: 'W172 only proves a harness-authorized one-call execution boundary. Visual testing remains blocked until a real governed runner result returns to IDB.'
  };

  const results = [];
  assertCase(results, 'w172_starts_from_w171_authorization_gate', guardedHarness.startsFromW171, w171.decision);
  assertCase(results, 'w172_execution_hook_ready', guardedHarness.executionHookReady, 'approvedServerAdapterSandboxOneCallExecutionHarnessV1');
  assertCase(results, 'w172_default_no_submit_no_request', guardedHarness.defaultNoSubmitBlocks, JSON.stringify(defaultNoSubmit.blockedReasons));
  assertCase(results, 'w172_authorized_harness_submits_once', guardedHarness.authorizedHarnessSubmitsOnce, JSON.stringify(authorizedSubmit.transportOutcome));
  assertCase(results, 'w172_duplicate_second_submit_blocked', guardedHarness.duplicateOrUnauthorisedSecondSubmitBlocked, JSON.stringify(secondSubmitBlocked.blockedReasons));
  assertCase(results, 'w172_adapter_error_captured_safely', guardedHarness.adapterErrorCapturedSafely, JSON.stringify(adapterError.transportOutcome));
  assertCase(results, 'w172_names_and_links_unchanged_until_w151_import', guardedHarness.finalGeneratedNamesUnchanged && guardedHarness.noActiveOpenLinks && guardedHarness.w151ImportStillRequired, JSON.stringify(authorizedSubmit.mutationGuard));
  assertCase(results, 'w172_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(authorizedSubmit.traceSamples));
  assertCase(results, 'w172_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w172_visual_testing_blocked_until_runner_result_returns', visualTestingDecision.visualTestingBlocked === true && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, visualTestingDecision.reason);

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w172-approved-server-adapter-sandbox-one-call-execution-harness.v1',
    status: 'approved_server_adapter_sandbox_one_call_execution_harness_ready',
    decision: failures.length
      ? 'FAIL_ONE_CALL_EXECUTION_HARNESS'
      : 'PASS_ONE_CALL_EXECUTION_HARNESS_READY__LIVE_DISABLED_BY_DEFAULT__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    executionHarnessContract,
    guardedHarness,
    samples: {
      defaultNoSubmit,
      authorizedSubmit,
      secondSubmitBlocked,
      adapterError
    },
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W173: Approved Server Adapter Real Sandbox One-Call Execution Packet',
      prompt: 'Move through W173: Approved Server Adapter Real Sandbox One-Call Execution Packet. Use the W172 one-call execution harness to prepare the exact operator packet for one real sandbox approved server adapter call, but keep execution disabled until the user explicitly authorizes that block. Include endpoint, server flags, sandbox allowlist, operator phrase, idempotency token, one-submit limit, rollback, expected runnerTaskId or adapter error handling, and W151 import guard. Do not request visual testing until the governed runner returns completed result JSON to IDB. Output real sandbox execution packet, guarded preflight harness, trace samples, W173 report, visual testing decision blocked until runner result returns, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w172-approved-server-adapter-sandbox-one-call-execution-harness-trace.v1',
    generatedAt: contract.generatedAt,
    defaultNoSubmitTrace: defaultNoSubmit.traceSamples,
    authorizedSubmitTrace: authorizedSubmit.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W172 Approved Server Adapter Sandbox One-Call Execution Harness

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Execution Harness Contract

- Default path: ${executionHarnessContract.defaultPath}.
- Authorized harness path: ${executionHarnessContract.authorizedPath}.
- Adapter error path: ${executionHarnessContract.adapterErrorPath}.
- Live invocation remains disabled by default.
- Harness-only execution requires \`${executionHarnessContract.harnessAuthorizationFlag}\`, \`executeLiveCall\`, the W171 operator phrase, endpoint confirmation, true server flags, sandbox allowlist, idempotency, rollback, and W151 import guard.
- Final generated names do not mutate until W151 accepts completed runner result JSON.

## Guarded Harness

| Gate | Result |
| --- | --- |
${Object.entries(guardedHarness).map(([key, value]) => `| ${key} | ${value ? 'PASS' : 'FAIL'} |`).join('\n')}

## Trace Samples

- Default no-submit: request sent = ${defaultNoSubmit.transportOutcome.liveRequestSent}, queue submitted = ${defaultNoSubmit.transportOutcome.queueSubmitted}.
- Authorized harness submit: request sent = ${authorizedSubmit.transportOutcome.liveRequestSent}, queue submitted = ${authorizedSubmit.transportOutcome.queueSubmitted}, runnerTaskId = ${authorizedSubmit.transportOutcome.runnerTaskId}.
- Adapter error: adapterError = ${adapterError.transportOutcome.adapterError}, queue submitted = ${adapterError.transportOutcome.queueSubmitted}.
- Active Open links before W151 import: 0.

## Visual Testing Decision

${visualTestingDecision.reason}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  if (failures.length) {
    console.error(`W172 one-call execution harness FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W172 one-call execution harness: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}; runnerTaskId=${authorizedSubmit.transportOutcome.runnerTaskId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
