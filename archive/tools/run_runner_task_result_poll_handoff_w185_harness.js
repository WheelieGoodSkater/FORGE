const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w185_runner_task_result_poll_handoff.json');
const tracePath = path.join(root, 'trace_samples', 'w185_runner_task_result_poll_handoff_trace.json');
const reportPath = path.join(root, 'reports', 'w185_runner_task_result_poll_handoff.md');

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
      notes: 'W185 harness approval evidence. Poll transport is mocked.'
    },
    idempotencyToken: 'idb-w185-ariat-international-one-call-001',
    oneSubmitLimit: {
      maxQueueSubmitAttempts: 1,
      duplicateIdempotencyBehavior: 'poll_existing_runner_task',
      secondSubmitBehavior: 'blocked_duplicate_submit'
    },
    rollbackPlan: {
      owner: 'server_deployment_flags',
      action: 'disable_server_flags_before_retry_or_stop',
      flagsToDisable: ['CREATE_ENABLED', 'GOVERNED_SANDBOX_WRITE_ENABLED', 'QUEUE_SUBMIT_ENABLED']
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

function pendingEnvelope(runnerTaskId) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'polling_pending',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      status: 'polling_pending',
      runnerTaskId,
      resultCaptureCursor: 'cursor_w185_pending'
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };
}

function completedEnvelope(runnerTaskId) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId,
      resultCaptureCursor: 'cursor_w185_completed'
    },
    finalGeneratedNamesJson: completedRunnerResultJson(),
    activeOpenLinks: 0
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
      transport: (requestEnvelope) => ({
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'queued_pending',
        queueSubmitted: true,
        runnerTaskId: `task_w185_${requestEnvelope.idempotencyToken}`,
        resultCapture: {
          status: 'pending_runner_completion',
          runnerTaskId: `task_w185_${requestEnvelope.idempotencyToken}`
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    }
  );
  const adapterErrorSubmit = hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
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
        resultCapture: { status: 'adapter_error', error: true },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      })
    }
  );
  const runnerTaskId = authorizedSubmit.runnerTaskIdEvidence.runnerTaskId;
  const pendingHandoff = hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w184SubmissionGate: authorizedSubmit,
      pollTransport: () => pendingEnvelope(runnerTaskId),
      poll: () => pendingEnvelope(runnerTaskId),
      maxPollAttempts: 1,
      handoffPacket
    }
  );
  const completedHandoff = hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w184SubmissionGate: authorizedSubmit,
      pollTransport: () => completedEnvelope(runnerTaskId),
      poll: () => completedEnvelope(runnerTaskId),
      maxPollAttempts: 1,
      handoffPacket
    }
  );
  const adapterErrorHandoff = hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w184SubmissionGate: adapterErrorSubmit,
      handoffPacket
    }
  );
  const missingRunnerTaskHandoff = hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      executionEvidence: {},
      runnerTaskIdEvidence: {},
      requestEnvelope: authorizedSubmit.requestEnvelope,
      handoffPacket
    }
  );

  const guardedHarness = {
    runnerTaskExposesCheckControl: pendingHandoff.buildReturnState.runnerTaskIdCaptured === true &&
      pendingHandoff.buildReturnState.checkRunnerResultVisible === true &&
      pendingHandoff.buildReturnState.checkRunnerResultEnabled === true,
    pendingDoesNotMutate: pendingHandoff.status === 'runner_task_poll_handoff_check_runner_result_ready_or_pending' &&
      pendingHandoff.mutationGuard.finalGeneratedNamesUnchanged === true &&
      pendingHandoff.mutationGuard.activeOpenLinks === 0,
    completedReadyButNotImported: completedHandoff.status === 'runner_task_poll_handoff_completed_result_ready_for_w151_import' &&
      completedHandoff.buildReturnState.completedResultReadyForW151Import === true &&
      completedHandoff.pollImportGate.importGate.stateMutationAllowedInThisBlock === false &&
      completedHandoff.mutationGuard.finalGeneratedNamesImported === false,
    adapterErrorStopsSafely: adapterErrorHandoff.status === 'runner_task_poll_handoff_stopped_adapter_error' &&
      adapterErrorHandoff.operatorEvidenceRequirement.required === true &&
      adapterErrorHandoff.buildReturnState.adapterErrorStoppedSafely === true,
    missingRunnerTaskBlocksControl: missingRunnerTaskHandoff.status === 'runner_task_poll_handoff_blocked_missing_runner_task_id' &&
      missingRunnerTaskHandoff.buildReturnState.checkRunnerResultVisible === false,
    w151GuardPreserved: completedHandoff.noRegression.w151CompletedResultImportGuardPreserved === true &&
      completedHandoff.pollImportGate.importGate.completedResultAcceptedByW151 === true,
    noDrawerWritesOrRecords: completedHandoff.noRegression.noDrawerWrites === true &&
      completedHandoff.noRegression.noDrawerTransactionWrites === true &&
      completedHandoff.noRegression.noDrawerCreatedRecords === true,
    noOpenLinksBeforeImport: completedHandoff.mutationGuard.activeOpenLinks === 0 &&
      completedHandoff.visualTestingDecision.visualTestingBlocked === true
  };

  const results = [];
  assertCase(results, 'w185_runner_task_exposes_check_control', guardedHarness.runnerTaskExposesCheckControl, JSON.stringify(pendingHandoff.buildReturnState));
  assertCase(results, 'w185_pending_does_not_mutate', guardedHarness.pendingDoesNotMutate, JSON.stringify(pendingHandoff.mutationGuard));
  assertCase(results, 'w185_completed_ready_but_not_imported', guardedHarness.completedReadyButNotImported, JSON.stringify(completedHandoff.buildReturnState));
  assertCase(results, 'w185_adapter_error_stops_safely', guardedHarness.adapterErrorStopsSafely, JSON.stringify(adapterErrorHandoff.operatorEvidenceRequirement));
  assertCase(results, 'w185_missing_runner_task_blocks_control', guardedHarness.missingRunnerTaskBlocksControl, JSON.stringify(missingRunnerTaskHandoff.buildReturnState));
  assertCase(results, 'w185_w151_guard_preserved', guardedHarness.w151GuardPreserved, JSON.stringify(completedHandoff.pollImportGate.importGate));
  assertCase(results, 'w185_no_drawer_writes_or_records', guardedHarness.noDrawerWritesOrRecords, JSON.stringify(completedHandoff.noRegression));
  assertCase(results, 'w185_no_open_links_before_import', guardedHarness.noOpenLinksBeforeImport, JSON.stringify(completedHandoff.visualTestingDecision));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w185-runner-task-result-poll-handoff.v1',
    status: failures.length ? 'blocked' : 'runner_task_poll_handoff_ready',
    decision: failures.length ? 'FAIL_RUNNER_TASK_RESULT_POLL_HANDOFF' : 'PASS_RUNNER_TASK_RESULT_POLL_HANDOFF_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    sourceEvidence: {
      w184Status: authorizedSubmit.status,
      runnerTaskId,
      adapterErrorStatus: adapterErrorSubmit.status
    },
    samples: {
      pendingHandoff,
      completedHandoff,
      adapterErrorHandoff,
      missingRunnerTaskHandoff
    },
    guardedHarness,
    results,
    visualTestingDecision: completedHandoff.visualTestingDecision,
    bestNextCodexPrompt: {
      block: 'W186: Completed Runner Result Import CTA From Poll Handoff',
      prompt: 'Move through W186: Completed Runner Result Import CTA From Poll Handoff. Use the W185 runnerTaskId poll handoff to enable Import completed runner result only when polling returns W151-valid completed runner result JSON with numeric internal ids, supported NetSuite URLs, and internal runner ownership. Keep pending, missing runnerTaskId, adapter-error, malformed completed result, and handoff JSON non-mutating. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and do not show active Open links before import. Output completed-result import CTA contract, guarded harness, trace samples, W186 report, visual testing decision blocked until import, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w185-runner-task-result-poll-handoff-trace.v1',
    generatedAt: contract.generatedAt,
    pendingTrace: pendingHandoff.traceSamples,
    completedTrace: completedHandoff.traceSamples,
    adapterErrorTrace: adapterErrorHandoff.traceSamples,
    missingRunnerTaskTrace: missingRunnerTaskHandoff.traceSamples,
    results,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W185 RunnerTaskId Result Poll Handoff From Authorized Build Call

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## RunnerTaskId Poll Handoff

- W184 source status: ${authorizedSubmit.status}
- Runner task id: ${runnerTaskId}
- Pending status: ${pendingHandoff.status}
- Completed status: ${completedHandoff.status}
- Adapter error status: ${adapterErrorHandoff.status}
- Missing runnerTaskId status: ${missingRunnerTaskHandoff.status}

## Build Return State

- Check runner result visible after runnerTaskId: ${pendingHandoff.buildReturnState.checkRunnerResultVisible}
- Check runner result enabled after runnerTaskId: ${pendingHandoff.buildReturnState.checkRunnerResultEnabled}
- Completed result ready for W151 import: ${completedHandoff.buildReturnState.completedResultReadyForW151Import}
- Final names mutated in W185: ${!completedHandoff.mutationGuard.finalGeneratedNamesUnchanged}
- Active Open links before import: ${completedHandoff.mutationGuard.activeOpenLinks}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## W185 Report

W185 wires the W184 runnerTaskId into the Build-return polling state. A runnerTaskId exposes Check runner result. Pending remains non-mutating. Adapter error stops safely with operator evidence required. Completed runner result JSON can become W151 import-ready, but W185 does not commit final names or Open links.

## Visual Testing Decision

Blocked. No Open-link visual testing until completed runner result JSON is imported.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W185 poll handoff failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W185 poll handoff: ${contract.decision}; runnerTaskId=${runnerTaskId}; visualBlocked=${contract.visualTestingDecision.visualTestingBlocked}`);
}

main();
