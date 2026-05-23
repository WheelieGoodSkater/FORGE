const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w189_real_sandbox_server_adapter_execution_wiring.json');
const tracePath = path.join(root, 'trace_samples', 'w189_real_sandbox_server_adapter_execution_wiring_trace.json');
const reportPath = path.join(root, 'reports', 'w189_real_sandbox_server_adapter_execution_wiring.md');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in harness')),
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

function fallbackState() {
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
      websiteEvidence: '',
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

function buildContext(hooks) {
  const state = fallbackState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function readyOptions() {
  return {
    adapterConfig: {
      endpointUrl: '',
      adapterApproved: true,
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['TD3021666']
    },
    operatorEvidence: {
      operatorName: 'Operator User',
      currentSandboxAccount: 'TD3021666',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedSandboxAccount: true,
      confirmedNoSubmit: false,
      endpointConfirmed: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
    }
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const blocked = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {}
  );
  const ready = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    readyOptions()
  );
  const executed = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, readyOptions(), {
      executeLiveCall: true,
      transport: (requestEnvelope) => ({
        schema: 'idb.governed-runner-adapter-result.v1',
        adapterVersion: 'w144-governed-sandbox-queue-submit-pilot-behind-server-flags',
        runnerStatus: 'queued_result_capture_pending',
        queueSubmitted: true,
        runnerTaskId: `task_w189_${requestEnvelope.idempotencyToken}`,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId: `task_w189_${requestEnvelope.idempotencyToken}`,
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        createsRecords: false,
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine'
      })
    })
  );

  const results = [];
  assertCase(results, 'w189_blocked_without_config', blocked.status === 'w144_one_call_blocked' && blocked.readyForOneCall === false, JSON.stringify(blocked.blockedReasons));
  assertCase(results, 'w189_ready_uses_w144_not_w153', ready.status === 'w144_one_call_ready_not_submitted' && ready.targetAdapter === 'W144 governed runner adapter', ready.targetAdapter);
  assertCase(results, 'w189_request_shape_is_w144_form_post', ready.adapterRequestEnvelope && ready.adapterRequestEnvelope.bodyEncoding === 'application/x-www-form-urlencoded' && ready.adapterRequestEnvelope.bodyParams.custpage_idb_confirmed_build_request_json && ready.adapterRequestEnvelope.bodyParams.custpage_idb_operator_queue_gate_json, JSON.stringify(ready.adapterRequestJsonShape));
  assertCase(results, 'w189_operator_gates_ready', ready.gates.every((gate) => gate.ready === true), JSON.stringify(ready.gates));
  assertCase(results, 'w189_execution_captures_runner_task_id', executed.status === 'w144_runner_taskid_captured_result_pending' && executed.runnerTaskIdCapturePath.runnerTaskIdCaptured === true && /^task_w189_/.test(executed.runnerTaskIdCapturePath.runnerTaskId), JSON.stringify(executed.runnerTaskIdCapturePath));
  assertCase(results, 'w189_result_capture_pending_no_urls', executed.runnerTaskIdCapturePath.resultCaptureStatus === 'pending_runner_completion' && executed.resultPollingImportPath.openLinksBeforeCompletedImport === 0 && executed.normalizedResponse.finalGeneratedNamesJsonReady === false, JSON.stringify(executed.resultPollingImportPath));
  assertCase(results, 'w189_no_regression_preserved', executed.noRegression.noDrawerWrites === true && executed.noRegression.noDrawerTransactionWrites === true && executed.noRegression.noDrawerCreatedRecords === true && executed.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true && executed.noRegression.noActiveOpenLinksWithoutRealUrls === true, JSON.stringify(executed.noRegression));

  const guardedHarness = {
    blockedWithoutConfig: results.find((result) => result.name === 'w189_blocked_without_config').pass,
    readyUsesW144NotW153: results.find((result) => result.name === 'w189_ready_uses_w144_not_w153').pass,
    requestShapeIsW144FormPost: results.find((result) => result.name === 'w189_request_shape_is_w144_form_post').pass,
    operatorGatesReady: results.find((result) => result.name === 'w189_operator_gates_ready').pass,
    executionCapturesRunnerTaskId: results.find((result) => result.name === 'w189_execution_captures_runner_task_id').pass,
    resultCapturePendingNoUrls: results.find((result) => result.name === 'w189_result_capture_pending_no_urls').pass,
    noRegressionPreserved: results.find((result) => result.name === 'w189_no_regression_preserved').pass
  };

  const contract = {
    schema: 'idb.w189-real-sandbox-server-adapter-execution-wiring.v1',
    status: results.every((result) => result.pass)
      ? 'real_sandbox_server_adapter_execution_wiring_ready'
      : 'real_sandbox_server_adapter_execution_wiring_failed',
    realExecutionWiringContract: {
      targetAdapter: 'W144 governed runner adapter',
      legacyFixtureAdapterExcluded: 'W153 fixture-only skeleton is not used for real queue submit.',
      drawerAuthority: 'configure_endpoint_operator_gate_submit_once_capture_runnerTaskId_import_results_only',
      serverAuthority: 'W144 queues governed runner and runner owns generated records'
    },
    adapterRequestJsonShape: ready.adapterRequestJsonShape,
    adapterRequestEnvelope: ready.adapterRequestEnvelope,
    operatorSetupChecklist: ready.operatorSetupChecklist,
    runnerTaskIdCapturePath: executed.runnerTaskIdCapturePath,
    resultPollingImportPath: executed.resultPollingImportPath,
    guardedHarness,
    samples: {
      blocked,
      ready,
      executed
    },
    visualTestingDecision: {
      visualTestingBlockedUntilCompletedResultImport: true,
      targetedOpenLinkTestingReady: false,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W189 gets to runnerTaskId and pending result capture. Link testing waits for completed result JSON import.'
    },
    bestNextCodexPrompt: {
      block: 'W190: Governed Runner Result Capture Polling To Completed JSON',
      prompt: 'Move through W190: Governed Runner Result Capture Polling To Completed JSON. Use the W189 real W144 server adapter execution wiring and captured runnerTaskId to implement the approved server-adapter polling path that checks result capture until completed runner result JSON is available. Keep pending and adapter-error states non-mutating, require W151-valid numeric internal ids and supported NetSuite URLs before import, preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links before import. Output polling contract, completed result envelope shape, guarded harness, trace samples, W190 report, visual testing decision blocked until completed result import, and best next Codex prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w189-real-sandbox-server-adapter-execution-wiring-trace.v1',
    blockedTrace: blocked.traceSamples,
    readyTrace: ready.traceSamples,
    executedTrace: executed.traceSamples,
    results
  };

  const gateRows = ready.gates.map((gate) => `| ${gate.label} | ${gate.ready ? 'PASS' : 'FAIL'} |`).join('\n');
  const report = `# W189 Real Sandbox Server Adapter Execution Wiring And RunnerTaskId Capture

Decision: ${contract.status}

## Real Execution Wiring Contract

- Target adapter: W144 governed runner adapter.
- W153 fixture-only skeleton is excluded from real queue submit.
- The drawer configures the approved endpoint, sends confirmed request and operator gate, captures runnerTaskId, and imports completed results only after W151.
- W144/server-side runner owns queue submit and generated records.

## Adapter Request JSON Shape

- Method: ${ready.adapterRequestJsonShape.method}
- Content-Type: ${ready.adapterRequestJsonShape.contentType}
- Fields: ${ready.adapterRequestJsonShape.fields.join(', ')}
- Idempotency token: ${ready.adapterRequestJsonShape.idempotencyToken}

## Operator Setup Checklist

${ready.operatorSetupChecklist.map((item) => `- ${item}`).join('\n')}

## Gates

| Gate | Result |
| --- | --- |
${gateRows}

## RunnerTaskId Capture Path

- Submitted in harness: ${executed.runnerTaskIdCapturePath.submitted}
- Queue submitted: ${executed.runnerTaskIdCapturePath.queueSubmitted}
- RunnerTaskId captured: ${executed.runnerTaskIdCapturePath.runnerTaskId}
- Result capture status: ${executed.runnerTaskIdCapturePath.resultCaptureStatus}
- Final generated names remain unmutated until W151 import.

## Result Polling / Import Path

- Check runner result appears only after runnerTaskId exists.
- Completed result import is still W151-gated.
- Open links stay hidden until completed result JSON imports.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. No Open-link visual testing yet.

## Trace Samples

- ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W189 real sandbox server adapter execution wiring failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W189 real sandbox server adapter execution wiring: ${contract.status}; runnerTaskId=${executed.runnerTaskIdCapturePath.runnerTaskId}`);
}

main();
