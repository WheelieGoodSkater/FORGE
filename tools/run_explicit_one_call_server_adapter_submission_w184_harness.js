const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w184_explicit_one_call_server_adapter_submission_gate.json');
const tracePath = path.join(root, 'trace_samples', 'w184_explicit_one_call_server_adapter_submission_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w184_explicit_one_call_server_adapter_submission_gate.md');

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

function buildContext(hooks, uploadedTrace) {
  const state = uploadedTrace && uploadedTrace.state ? uploadedTrace.state : fallbackState();
  state.dccFinalNamingResult = null;
  state.integratedBuildRunnerResult = null;
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || fallbackState().pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  if (!state.acceptedPacket) state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function activationOptions(handoffPacket) {
  return {
    traceExport: fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null,
    handoffPacket,
    endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_governed_runner_adapter&deploy=customdeploy_idb_governed_runner_adapter',
    adapterConfig: {
      endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_governed_runner_adapter&deploy=customdeploy_idb_governed_runner_adapter',
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
      adapterApproved: true,
      mode: 'approved_server_adapter_only'
    },
    currentSandboxAccount: 'SANDBOX_ACCOUNT_ID',
    operatorEvidence: {
      operatorName: 'Operator User',
      reviewedAt: '2026-05-17T10:52:20-04:00',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedSandboxAccount: true,
      confirmedNoSubmit: true,
      notes: 'W184 harness approval evidence. Transport is mocked; no live NetSuite request is sent.'
    },
    idempotencyToken: 'idb-w184-ariat-international-one-call-001',
    oneSubmitLimit: {
      maxQueueSubmitAttempts: 1,
      duplicateIdempotencyBehavior: 'poll_existing_runner_task',
      secondSubmitBehavior: 'blocked_duplicate_submit'
    },
    rollbackPlan: {
      owner: 'server_deployment_flags',
      action: 'disable_server_flags_before_retry_or_stop',
      flagsToDisable: [
        'CREATE_ENABLED',
        'GOVERNED_SANDBOX_WRITE_ENABLED',
        'QUEUE_SUBMIT_ENABLED'
      ]
    },
    pollingHandoff: {
      firstResponse: 'runnerTaskId_or_adapter_error',
      runnerTaskIdSource: 'approved_server_adapter_response',
      pendingStatus: 'pending_runner_completion',
      nextControlAfterRunnerTaskId: 'check_runner_result',
      completedResultGate: 'W151_completed_runner_result_import_guard',
      importMutationPolicy: 'do_not_mutate_final_names_until_w151_valid_import',
      expectedFirstResponseDoesNotContainRecordUrls: true
    }
  };
}

function main() {
  const hooks = loadHooks();
  const uploadedTrace = fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null;
  const uploadedHandoff = fs.existsSync(uploadedHandoffPath) ? readJson(uploadedHandoffPath) : null;
  const context = buildContext(hooks, uploadedTrace);
  const handoffPacket = uploadedHandoff || hooks.dccRunnerHandoffPacketV1(context.state, context.lane, context.page, context.recommendation);
  const activationModel = hooks.approvedServerAdapterActivationPacketAndOneCallReadinessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    activationOptions(handoffPacket)
  );

  let submitCount = 0;
  const mockTransport = (requestEnvelope) => {
    submitCount += 1;
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'queued_pending',
      queueSubmitted: true,
      runnerTaskId: `task_w184_${requestEnvelope.idempotencyToken}`,
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: `task_w184_${requestEnvelope.idempotencyToken}`
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
  };

  const defaultNoSubmit = hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      activationModel,
      executeOneCall: false,
      operatorAuthorizationPhrase: '',
      endpointConfirmed: false,
      transport: mockTransport
    }
  );
  const authorizedSubmit = hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      activationModel,
      executeOneCall: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      endpointConfirmed: true,
      transport: mockTransport
    }
  );
  const duplicateBlocked = hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      activationModel,
      executeOneCall: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      endpointConfirmed: true,
      oneSubmitAlreadyUsed: true,
      transport: mockTransport
    }
  );
  const adapterError = hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      activationModel,
      executeOneCall: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      endpointConfirmed: true,
      transport: () => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'adapter_error',
        queueSubmitted: false,
        runnerTaskId: null,
        resultCapture: {
          status: 'adapter_error',
          error: true
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    }
  );

  const guardedHarness = {
    activationPacketReady: activationModel.activationReady === true,
    defaultNoSubmitNoRequest: defaultNoSubmit.submissionAllowed === false &&
      defaultNoSubmit.executionEvidence.requestSent === false &&
      defaultNoSubmit.blockedReasons.indexOf('execution_not_requested_default_no_submit') >= 0,
    authorizedSubmitOnce: authorizedSubmit.submissionAllowed === true &&
      authorizedSubmit.executionEvidence.requestSent === true &&
      authorizedSubmit.executionEvidence.submitAttemptCount === 1 &&
      submitCount === 1,
    runnerTaskCapturedPendingOnly: authorizedSubmit.runnerTaskIdEvidence.captured === true &&
      /^task_w184_/.test(authorizedSubmit.runnerTaskIdEvidence.runnerTaskId) &&
      authorizedSubmit.executionEvidence.resultCaptureStatus === 'pending_runner_completion' &&
      authorizedSubmit.executionEvidence.recordUrlsReturned === false,
    duplicateSubmitBlocked: duplicateBlocked.submissionAllowed === false &&
      duplicateBlocked.blockedReasons.indexOf('one_submit_limit_already_used') >= 0,
    adapterErrorStopsSafely: adapterError.status === 'one_call_adapter_error_drawer_safe' &&
      adapterError.adapterErrorEvidence.captured === true &&
      adapterError.executionEvidence.queueSubmitted === false,
    noFinalNameMutation: authorizedSubmit.mutationGuard.finalGeneratedNamesUnchanged === true &&
      authorizedSubmit.mutationGuard.finalGeneratedNamesImported === false,
    noDrawerWritesOrRecords: authorizedSubmit.noRegression.noDrawerWrites === true &&
      authorizedSubmit.noRegression.noDrawerTransactionWrites === true &&
      authorizedSubmit.noRegression.noDrawerCreatedRecords === true,
    w151GuardPreserved: authorizedSubmit.noRegression.w151CompletedResultImportGuardPreserved === true &&
      authorizedSubmit.runnerTaskIdEvidence.w151ImportRequiredBeforeNamesMutate === true,
    noOpenLinksAndVisualBlocked: authorizedSubmit.mutationGuard.activeOpenLinks === 0 &&
      authorizedSubmit.visualTestingDecision.visualTestingBlocked === true,
    firstResponseNotUrls: authorizedSubmit.executionEvidence.firstResponseAllowed === true &&
      authorizedSubmit.executionEvidence.recordUrlsReturned === false
  };

  const results = [];
  assertCase(results, 'w184_activation_packet_ready', guardedHarness.activationPacketReady, activationModel.status);
  assertCase(results, 'w184_default_no_submit_no_request', guardedHarness.defaultNoSubmitNoRequest, JSON.stringify(defaultNoSubmit.blockedReasons));
  assertCase(results, 'w184_authorized_submit_once', guardedHarness.authorizedSubmitOnce, JSON.stringify(authorizedSubmit.executionEvidence));
  assertCase(results, 'w184_runner_task_captured_pending_only', guardedHarness.runnerTaskCapturedPendingOnly, JSON.stringify(authorizedSubmit.runnerTaskIdEvidence));
  assertCase(results, 'w184_duplicate_submit_blocked', guardedHarness.duplicateSubmitBlocked, JSON.stringify(duplicateBlocked.blockedReasons));
  assertCase(results, 'w184_adapter_error_stops_safely', guardedHarness.adapterErrorStopsSafely, JSON.stringify(adapterError.adapterErrorEvidence));
  assertCase(results, 'w184_no_final_name_mutation', guardedHarness.noFinalNameMutation, JSON.stringify(authorizedSubmit.mutationGuard));
  assertCase(results, 'w184_no_drawer_writes_or_records', guardedHarness.noDrawerWritesOrRecords, JSON.stringify(authorizedSubmit.noRegression));
  assertCase(results, 'w184_w151_guard_preserved', guardedHarness.w151GuardPreserved, JSON.stringify(authorizedSubmit.runnerTaskIdEvidence));
  assertCase(results, 'w184_no_open_links_and_visual_blocked', guardedHarness.noOpenLinksAndVisualBlocked, JSON.stringify(authorizedSubmit.visualTestingDecision));
  assertCase(results, 'w184_first_response_not_urls', guardedHarness.firstResponseNotUrls, JSON.stringify(authorizedSubmit.executionEvidence));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w184-explicit-one-call-server-adapter-submission-gate.v1',
    status: failures.length ? 'blocked' : 'explicit_one_call_submission_gate_ready',
    decision: failures.length ? 'FAIL_EXPLICIT_ONE_CALL_SERVER_ADAPTER_SUBMISSION_GATE' : 'PASS_EXPLICIT_ONE_CALL_SERVER_ADAPTER_SUBMISSION_GATE_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    authorizationSubmissionGate: {
      requiredPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      defaultNoSubmitStatus: defaultNoSubmit.status,
      authorizedStatus: authorizedSubmit.status,
      duplicateStatus: duplicateBlocked.status,
      adapterErrorStatus: adapterError.status,
      firstResponsePolicy: 'runnerTaskId_or_adapter_error_not_record_urls'
    },
    samples: {
      activationModel,
      defaultNoSubmit,
      authorizedSubmit,
      duplicateBlocked,
      adapterError
    },
    guardedHarness,
    results,
    visualTestingDecision: authorizedSubmit.visualTestingDecision,
    bestNextCodexPrompt: {
      block: 'W185: RunnerTaskId Result Poll Handoff From Authorized Build Call',
      prompt: 'Move through W185: RunnerTaskId Result Poll Handoff From Authorized Build Call. Use the W184 explicit one-call server adapter gate and captured runnerTaskId or adapter error evidence to wire the next Build-return state: if runnerTaskId exists, expose Check runner result and poll result capture through the approved server adapter; if adapter error exists, stop safely with operator evidence. Do not mutate final generated names until W151 validates completed runner result JSON with numeric ids and supported NetSuite URLs. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request Open-link visual testing until completed runner result JSON is imported. Output runnerTaskId poll handoff, guarded harness, trace samples, W185 report, visual testing decision blocked, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w184-explicit-one-call-server-adapter-submission-gate-trace.v1',
    generatedAt: contract.generatedAt,
    defaultNoSubmitTrace: defaultNoSubmit.traceSamples,
    authorizedSubmitTrace: authorizedSubmit.traceSamples,
    duplicateBlockedTrace: duplicateBlocked.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    results,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W184 Explicit One-Call Server Adapter Authorization And Submission Gate

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Authorization / Submission Gate

- Required phrase: AUTHORIZE ONE SANDBOX ADAPTER CALL
- Default state: ${defaultNoSubmit.status}
- Authorized state: ${authorizedSubmit.status}
- Duplicate state: ${duplicateBlocked.status}
- Adapter error state: ${adapterError.status}
- First response policy: runnerTaskId or adapter error, not record URLs

## Execution Evidence

- Request sent by default: ${defaultNoSubmit.executionEvidence.requestSent}
- Request sent when authorized: ${authorizedSubmit.executionEvidence.requestSent}
- Submit attempts when authorized: ${authorizedSubmit.executionEvidence.submitAttemptCount}
- Runner task captured: ${authorizedSubmit.runnerTaskIdEvidence.runnerTaskId}
- Result capture status: ${authorizedSubmit.runnerTaskIdEvidence.resultCaptureStatus}
- Record URLs returned: ${authorizedSubmit.executionEvidence.recordUrlsReturned}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## W184 Report

W184 adds the final one-call gate after W183 activation. The default path remains no-submit. The authorized harness path submits exactly once to a mocked approved server adapter and accepts only runnerTaskId plus pending result capture, or adapter error. Final generated names remain unchanged until W151 completed-result import.

## Visual Testing Decision

Blocked. No Open-link visual testing until completed runner result JSON is imported.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W184 submission gate failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W184 submission gate: ${contract.decision}; runnerTaskId=${authorizedSubmit.runnerTaskIdEvidence.runnerTaskId}; visualBlocked=${contract.visualTestingDecision.visualTestingBlocked}`);
}

main();
