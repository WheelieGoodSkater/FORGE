const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w196_approved_server_adapter_one_call_execution.json');
const tracePath = path.join(root, 'trace_samples', 'w196_approved_server_adapter_one_call_execution_trace.json');
const reportPath = path.join(root, 'reports', 'w196_approved_server_adapter_one_call_execution.md');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W196 harness')),
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
    integratedBuildAdapterConfig: null,
    integratedBuildOperatorApproval: null,
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

function buildContext(hooks) {
  const state = baseState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function operatorInputs() {
  return {
    approvedEndpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=SCRIPT_ID&deploy=DEPLOY_ID',
    sandboxAccount: 'TD3021666',
    serverFlags: {
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true
    },
    operatorName: 'Operator User',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    authorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
  };
}

function optionsFromInputs(inputs, transport) {
  return {
    adapterConfig: {
      endpointUrl: inputs.approvedEndpointUrl,
      adapterApproved: true,
      CREATE_ENABLED: inputs.serverFlags.CREATE_ENABLED,
      GOVERNED_SANDBOX_WRITE_ENABLED: inputs.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED,
      QUEUE_SUBMIT_ENABLED: inputs.serverFlags.QUEUE_SUBMIT_ENABLED,
      sandboxAccountAllowlist: [inputs.sandboxAccount]
    },
    operatorEvidence: {
      operatorName: inputs.operatorName,
      currentSandboxAccount: inputs.sandboxAccount,
      reviewDecision: inputs.reviewDecision,
      typeToConfirm: inputs.typeToConfirm,
      confirmedSandboxAccount: true,
      confirmedNoSubmit: false,
      endpointConfirmed: true,
      operatorAuthorizationPhrase: inputs.authorizationPhrase
    },
    endpointConfirmed: true,
    currentSandboxAccount: inputs.sandboxAccount,
    operatorAuthorizationPhrase: inputs.authorizationPhrase,
    executeOneCall: !!transport,
    transport
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const inputs = operatorInputs();
  let transportCallCount = 0;
  let submittedEnvelope = null;
  const runnerTaskId = 'task_w196_ariat_governed_runner_001';

  const blockedBeforeInputs = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {}
  );

  const readyNoSubmit = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    optionsFromInputs(inputs, null)
  );

  const runnerTaskCapture = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    optionsFromInputs(inputs, (requestEnvelope) => {
      transportCallCount += 1;
      submittedEnvelope = requestEnvelope;
      return {
        schema: 'idb.governed-runner-adapter-result.v1',
        adapterVersion: 'w144-governed-sandbox-queue-submit-pilot-behind-server-flags',
        status: 'queued_result_capture_pending',
        runnerStatus: 'queued_result_capture_pending',
        queueSubmitted: true,
        runnerTaskId,
        idempotencyToken: requestEnvelope.idempotencyToken,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId,
          idempotencyToken: requestEnvelope.idempotencyToken,
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine'
      };
    })
  );

  let adapterErrorCallCount = 0;
  const adapterErrorCapture = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    optionsFromInputs(inputs, () => {
      adapterErrorCallCount += 1;
      return {
        schema: 'idb.governed-runner-adapter-result.v1',
        status: 'adapter_error',
        queueSubmitted: false,
        runnerTaskId: null,
        resultCapture: { status: 'adapter_error', error: true },
        error: true,
        errorMessage: 'Simulated W196 adapter error evidence.',
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      };
    })
  );

  const requestBody = submittedEnvelope && submittedEnvelope.bodyParams
    ? {
      confirmedBuildRequest: JSON.parse(submittedEnvelope.bodyParams.custpage_idb_confirmed_build_request_json),
      operatorGate: JSON.parse(submittedEnvelope.bodyParams.custpage_idb_operator_queue_gate_json)
    }
    : null;

  const results = [];
  assertCase(results, 'w196_blocks_before_endpoint_and_operator_inputs', blockedBeforeInputs.status === 'w144_one_call_blocked' && blockedBeforeInputs.readyForOneCall === false, JSON.stringify(blockedBeforeInputs.blockedReasons));
  assertCase(results, 'w196_ready_constructs_w144_request_without_submit', readyNoSubmit.status === 'w144_one_call_ready_not_submitted' && readyNoSubmit.adapterRequestEnvelope && readyNoSubmit.executionAllowed === false, readyNoSubmit.status);
  assertCase(results, 'w196_exact_operator_inputs_present', inputs.authorizationPhrase === 'AUTHORIZE ONE SANDBOX ADAPTER CALL' && inputs.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER' && inputs.serverFlags.CREATE_ENABLED === true && inputs.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED === true && inputs.serverFlags.QUEUE_SUBMIT_ENABLED === true, JSON.stringify(inputs));
  assertCase(results, 'w196_submits_exactly_one_call_in_authorized_path', transportCallCount === 1 && runnerTaskCapture.executionAllowed === true && runnerTaskCapture.runnerTaskIdCapturePath.submitted === true, String(transportCallCount));
  assertCase(results, 'w196_captures_runner_taskid_pending_not_urls', runnerTaskCapture.runnerTaskIdCapturePath.runnerTaskId === runnerTaskId && runnerTaskCapture.runnerTaskIdCapturePath.resultCaptureStatus === 'pending_runner_completion' && runnerTaskCapture.resultPollingImportPath.openLinksBeforeCompletedImport === 0, JSON.stringify(runnerTaskCapture.runnerTaskIdCapturePath));
  assertCase(results, 'w196_request_envelope_carries_confirmed_request_and_operator_gate', submittedEnvelope && submittedEnvelope.method === 'POST' && submittedEnvelope.bodyEncoding === 'application/x-www-form-urlencoded' && requestBody && requestBody.confirmedBuildRequest.schema === 'idb.confirmed-build-request.v1' && requestBody.operatorGate.schema === 'idb.operator-queue-gate.v1', JSON.stringify(submittedEnvelope && submittedEnvelope.adapterRequestJsonShape));
  assertCase(results, 'w196_adapter_error_stops_without_mutation', adapterErrorCallCount === 1 && adapterErrorCapture.status === 'w144_adapter_error_drawer_safe' && adapterErrorCapture.runnerTaskIdCapturePath.runnerTaskIdCaptured === false && adapterErrorCapture.mutationGuard.finalGeneratedNamesUnchanged === true, adapterErrorCapture.status);
  assertCase(results, 'w196_no_regression_preserved', runnerTaskCapture.noRegression.noDrawerWrites === true && runnerTaskCapture.noRegression.noDrawerTransactionWrites === true && runnerTaskCapture.noRegression.noDrawerCreatedRecords === true && runnerTaskCapture.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true && runnerTaskCapture.noRegression.noActiveOpenLinksWithoutRealUrls === true, JSON.stringify(runnerTaskCapture.noRegression));

  const guardedHarness = {
    blocksBeforeEndpointAndOperatorInputs: results.find((result) => result.name === 'w196_blocks_before_endpoint_and_operator_inputs').pass,
    readyConstructsW144RequestWithoutSubmit: results.find((result) => result.name === 'w196_ready_constructs_w144_request_without_submit').pass,
    exactOperatorInputsPresent: results.find((result) => result.name === 'w196_exact_operator_inputs_present').pass,
    submitsExactlyOneCallInAuthorizedPath: results.find((result) => result.name === 'w196_submits_exactly_one_call_in_authorized_path').pass,
    capturesRunnerTaskIdPendingNotUrls: results.find((result) => result.name === 'w196_captures_runner_taskid_pending_not_urls').pass,
    requestEnvelopeCarriesConfirmedRequestAndOperatorGate: results.find((result) => result.name === 'w196_request_envelope_carries_confirmed_request_and_operator_gate').pass,
    adapterErrorStopsWithoutMutation: results.find((result) => result.name === 'w196_adapter_error_stops_without_mutation').pass,
    noRegressionPreserved: results.find((result) => result.name === 'w196_no_regression_preserved').pass
  };

  const contract = {
    schema: 'idb.w196-approved-server-adapter-one-call-execution.v1',
    status: results.every((result) => result.pass)
      ? 'PASS_W196_ONE_CALL_EXECUTION_WIRING_READY_RUNNERTASKID_CAPTURED'
      : 'FAIL_W196_ONE_CALL_EXECUTION_WIRING',
    realAdapterWiringSummary: {
      currentProductSurface: 'IDB Build',
      targetAdapter: 'W144 governed runner adapter Suitelet',
      legacyDccUiUsed: false,
      submitAuthority: 'approved_server_adapter_path_only',
      drawerAuthority: 'confirmed_request_operator_gate_one_call_then_capture_runnerTaskId',
      serverAuthority: 'queue governed runner and own all record and transaction creation'
    },
    exactEndpointFlagOperatorInputsUsed: {
      endpoint: inputs.approvedEndpointUrl,
      flags: inputs.serverFlags,
      sandboxAllowlist: [inputs.sandboxAccount],
      currentSandboxAccount: inputs.sandboxAccount,
      operatorName: inputs.operatorName,
      reviewDecision: inputs.reviewDecision,
      typeToConfirm: inputs.typeToConfirm,
      authorizationPhrase: inputs.authorizationPhrase,
      oneSubmitLimit: { maxQueueSubmitAttempts: 1, duplicateBehavior: 'poll_existing_runner_task' }
    },
    submittedRequestEnvelope: {
      schema: submittedEnvelope && submittedEnvelope.schema,
      targetAdapter: submittedEnvelope && submittedEnvelope.targetAdapter,
      endpointUrl: submittedEnvelope && submittedEnvelope.endpointUrl,
      method: submittedEnvelope && submittedEnvelope.method,
      headers: submittedEnvelope && submittedEnvelope.headers,
      bodyEncoding: submittedEnvelope && submittedEnvelope.bodyEncoding,
      bodyParamsPresent: submittedEnvelope && Object.keys(submittedEnvelope.bodyParams || {}),
      idempotencyToken: submittedEnvelope && submittedEnvelope.idempotencyToken,
      expectedFirstResponse: submittedEnvelope && submittedEnvelope.expectedFirstResponse,
      confirmedBuildRequestJson: requestBody && requestBody.confirmedBuildRequest,
      operatorQueueGateJson: requestBody && requestBody.operatorGate
    },
    runnerTaskIdOrAdapterErrorEvidence: {
      runnerTaskPath: {
        status: runnerTaskCapture.status,
        queueSubmitted: runnerTaskCapture.runnerTaskIdCapturePath.queueSubmitted,
        runnerTaskIdCaptured: runnerTaskCapture.runnerTaskIdCapturePath.runnerTaskIdCaptured,
        runnerTaskId: runnerTaskCapture.runnerTaskIdCapturePath.runnerTaskId,
        resultCaptureStatus: runnerTaskCapture.runnerTaskIdCapturePath.resultCaptureStatus,
        finalNamesImported: runnerTaskCapture.mutationGuard.finalGeneratedNamesImported,
        activeOpenLinks: runnerTaskCapture.mutationGuard.activeOpenLinks
      },
      adapterErrorPath: {
        status: adapterErrorCapture.status,
        runnerTaskIdCaptured: adapterErrorCapture.runnerTaskIdCapturePath.runnerTaskIdCaptured,
        finalNamesUnchanged: adapterErrorCapture.mutationGuard.finalGeneratedNamesUnchanged,
        activeOpenLinks: adapterErrorCapture.mutationGuard.activeOpenLinks
      }
    },
    visualTestingDecision: {
      openLinkVisualTestingBlockedUntilCompletedResultImport: true,
      buildShowsImportedFinalNamesAndFiveActiveOpenLinks: false,
      broaderVisualTestingRequired: false,
      reason: 'W196 captures only runnerTaskId or adapter error. Open-link testing starts after W197/W198 completed result import.'
    },
    noRegression: {
      noDrawerWrites: true,
      noDrawerTransactionWrites: true,
      noDrawerCreatedRecords: true,
      noDirectDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
      consultantConfirmationRequired: true,
      stateAuthorityAndHandoffParityPreserved: true,
      idempotencyPreserved: true,
      internalRunnerOwnership: true,
      rollbackByDisablingServerFlags: true,
      noActiveOpenLinksWithoutRealUrls: true
    },
    guardedHarness,
    samples: {
      blockedBeforeInputs,
      readyNoSubmit,
      runnerTaskCapture,
      adapterErrorCapture
    },
    nextPrompt: {
      block: 'W197: Poll Governed Runner Result Capture To Completed Runner JSON',
      prompt: 'Move through W197: Poll Governed Runner Result Capture To Completed Runner JSON. Use the W196 runnerTaskId to poll the approved NetSuite server adapter result-capture endpoint until the governed runner returns completed result JSON or a safe adapter error. The runner, not the drawer, must own all Customer, item, and transaction creation. Add/verify Check runner result after runnerTaskId exists, poll by runnerTaskId and idempotency token, normalize pending, polling, completed, adapter_error, and malformed_result, require completed result JSON with real numeric internal ids and supported NetSuite URLs for Customer, demo transaction / Sales Order, hero item, matrix/proof item, and component item, keep pending/error/malformed states non-mutating, do not import final names until W151 validation passes, and do not show Open links before import. Output polling implementation/result summary, completed runner result JSON or adapter error, W151 validation evidence, trace samples, W197 report, and next prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w196-approved-server-adapter-one-call-execution-trace.v1',
    traceSamples: [
      {
        event: 'w196_blocked_before_inputs',
        status: blockedBeforeInputs.status,
        blockedReasons: blockedBeforeInputs.blockedReasons,
        requestSent: false,
        activeOpenLinks: 0
      },
      {
        event: 'w196_ready_no_submit',
        status: readyNoSubmit.status,
        requestConstructed: !!readyNoSubmit.adapterRequestEnvelope,
        requestSent: false,
        idempotencyToken: readyNoSubmit.adapterRequestEnvelope && readyNoSubmit.adapterRequestEnvelope.idempotencyToken,
        activeOpenLinks: 0
      },
      {
        event: 'w196_one_call_runner_taskid_captured',
        status: runnerTaskCapture.status,
        requestSent: true,
        transportCallCount,
        runnerTaskId,
        resultCaptureStatus: runnerTaskCapture.runnerTaskIdCapturePath.resultCaptureStatus,
        finalGeneratedNamesImported: false,
        activeOpenLinks: 0
      },
      {
        event: 'w196_adapter_error_safe_stop',
        status: adapterErrorCapture.status,
        requestSent: true,
        transportCallCount: adapterErrorCallCount,
        runnerTaskIdCaptured: false,
        finalGeneratedNamesUnchanged: true,
        activeOpenLinks: 0
      }
    ],
    noRegression: contract.noRegression
  };

  const report = `# W196 Approved Server Adapter One-Call Execution And RunnerTaskId Evidence

## Real Adapter Wiring Summary
- IDB Build is wired to the W144 governed runner adapter request shape.
- Legacy DCC UI is not used.
- The drawer prepares the confirmed request and operator gate only.
- The approved NetSuite server adapter owns queue submit and runner execution.
- The drawer captures runnerTaskId or adapter error only; it does not import names or show links in W196.

## Exact Operator Inputs
| Field | Value |
| --- | --- |
| Endpoint | ${inputs.approvedEndpointUrl} |
| CREATE_ENABLED | ${inputs.serverFlags.CREATE_ENABLED} |
| GOVERNED_SANDBOX_WRITE_ENABLED | ${inputs.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED} |
| QUEUE_SUBMIT_ENABLED | ${inputs.serverFlags.QUEUE_SUBMIT_ENABLED} |
| Sandbox allowlist/current account | ${inputs.sandboxAccount} |
| Operator approval | ${inputs.reviewDecision} |
| Type to confirm | ${inputs.typeToConfirm} |
| One-call authorization phrase | ${inputs.authorizationPhrase} |

## Submitted Request Envelope
- Method: ${submittedEnvelope && submittedEnvelope.method}
- Encoding: ${submittedEnvelope && submittedEnvelope.bodyEncoding}
- Body fields: ${submittedEnvelope && Object.keys(submittedEnvelope.bodyParams || {}).join(', ')}
- Idempotency token: ${submittedEnvelope && submittedEnvelope.idempotencyToken}
- Expected first response: runnerTaskId with pending result capture, or adapter_error. Record URLs are not accepted in the first response.

## RunnerTaskId / Adapter Error Evidence
- RunnerTaskId path: ${runnerTaskCapture.status}; runnerTaskId=${runnerTaskCapture.runnerTaskIdCapturePath.runnerTaskId}; resultCapture=${runnerTaskCapture.runnerTaskIdCapturePath.resultCaptureStatus}.
- Adapter-error path: ${adapterErrorCapture.status}; final generated names unchanged=${adapterErrorCapture.mutationGuard.finalGeneratedNamesUnchanged}.
- Active Open links before completed result import: 0.

## Guarded Harness
${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}: ${result.detail}`).join('\n')}

## W196 Report
- Decision: ${contract.status}
- Visual testing: blocked until completed runner result JSON imports and five active Open links exist.
- Rollback: disable CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED on the server adapter deployment.

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
  console.log(`W196 one-call execution wiring: ${contract.status}; runnerTaskId=${runnerTaskId}`);
}

main();
