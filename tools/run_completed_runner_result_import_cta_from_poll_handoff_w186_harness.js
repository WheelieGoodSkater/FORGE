const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w186_completed_runner_result_import_cta_from_poll_handoff.json');
const tracePath = path.join(root, 'trace_samples', 'w186_completed_runner_result_import_cta_from_poll_handoff_trace.json');
const reportPath = path.join(root, 'reports', 'w186_completed_runner_result_import_cta_from_poll_handoff.md');

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

function malformedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: { type: 'customer', name: 'Ariat Placeholder Account', internalId: 'REPLACE_REAL_CUSTOMER_ID', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID' }
    }
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
      notes: 'W186 harness approval evidence. Poll transport is mocked.'
    },
    idempotencyToken: 'idb-w186-ariat-international-one-call-001',
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

function envelope(status, runnerTaskId, resultJson) {
  const captureStatus = status === 'completed_runner_result_ready'
    ? 'completed_result_capture_ready'
    : status === 'adapter_error'
      ? 'adapter_error'
      : 'polling_pending';
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status,
    queueSubmitted: status !== 'adapter_error',
    runnerTaskId,
    resultCapture: {
      status: captureStatus,
      runnerTaskId,
      resultCaptureCursor: `cursor_w186_${status}`
    },
    finalGeneratedNamesJson: resultJson || null,
    activeOpenLinks: 0
  };
}

function buildW184Gate(hooks, context, activationModel, adapterStatus) {
  const runnerTaskId = 'task_w186_idb-w186-ariat-international-one-call-001';
  return hooks.explicitOneCallServerAdapterAuthorizationSubmissionGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      activationModel,
      executeOneCall: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      endpointConfirmed: true,
      transport: () => envelope(adapterStatus || 'queued_pending', runnerTaskId, null)
    }
  );
}

function buildPollHandoff(hooks, context, w184Gate, pollEnvelope, extra) {
  return hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({
      w184SubmissionGate: w184Gate,
      pollTransport: () => pollEnvelope,
      poll: () => pollEnvelope,
      maxPollAttempts: 1,
      pollCursor: pollEnvelope && pollEnvelope.resultCapture && pollEnvelope.resultCapture.resultCaptureCursor || ''
    }, extra || {})
  );
}

function main() {
  const hooks = loadHooks();
  const uploadedTrace = fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null;
  const uploadedHandoff = fs.existsSync(uploadedHandoffPath) ? readJson(uploadedHandoffPath) : null;
  const context = buildContext(hooks, uploadedTrace);
  const activationModel = hooks.approvedServerAdapterActivationPacketAndOneCallReadinessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    activationOptions(uploadedHandoff)
  );
  const runnerTaskId = 'task_w186_idb-w186-ariat-international-one-call-001';
  const queuedGate = buildW184Gate(hooks, context, activationModel, 'queued_pending');
  const errorGate = buildW184Gate(hooks, context, activationModel, 'adapter_error');
  const pendingHandoff = buildPollHandoff(hooks, context, queuedGate, envelope('polling_pending', runnerTaskId, null));
  const completedHandoff = buildPollHandoff(hooks, context, queuedGate, envelope('completed_runner_result_ready', runnerTaskId, completedRunnerResultJson()));
  const malformedHandoff = buildPollHandoff(hooks, context, queuedGate, envelope('completed_runner_result_ready', runnerTaskId, malformedRunnerResultJson()));
  const adapterErrorHandoff = buildPollHandoff(hooks, context, errorGate, envelope('adapter_error', runnerTaskId, null));
  const missingRunnerTaskHandoff = hooks.runnerTaskIdResultPollHandoffFromAuthorizedBuildCallV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w184SubmissionGate: {
        executionEvidence: { idempotencyToken: 'idb-w186-missing-runner-task' },
        runnerTaskIdEvidence: { captured: false, runnerTaskId: null },
        adapterErrorEvidence: { captured: false },
        requestEnvelope: queuedGate.requestEnvelope
      }
    }
  );

  const pending = hooks.completedRunnerResultImportCtaFromPollHandoffV1(context.state, context.lane, context.page, context.recommendation, {
    pollHandoff: pendingHandoff,
    handoffJson: uploadedHandoff
  });
  const completed = hooks.completedRunnerResultImportCtaFromPollHandoffV1(context.state, context.lane, context.page, context.recommendation, {
    pollHandoff: completedHandoff,
    completedResultJson: completedRunnerResultJson(),
    handoffJson: uploadedHandoff
  });
  const malformed = hooks.completedRunnerResultImportCtaFromPollHandoffV1(context.state, context.lane, context.page, context.recommendation, {
    pollHandoff: malformedHandoff,
    completedResultJson: malformedRunnerResultJson(),
    handoffJson: uploadedHandoff
  });
  const adapterError = hooks.completedRunnerResultImportCtaFromPollHandoffV1(context.state, context.lane, context.page, context.recommendation, {
    pollHandoff: adapterErrorHandoff,
    handoffJson: uploadedHandoff
  });
  const missingRunnerTask = hooks.completedRunnerResultImportCtaFromPollHandoffV1(context.state, context.lane, context.page, context.recommendation, {
    pollHandoff: missingRunnerTaskHandoff,
    handoffJson: uploadedHandoff
  });

  const importCtaContract = {
    schema: 'idb.w186-completed-result-import-cta-contract.v1',
    source: 'W185 runnerTaskId poll handoff',
    cta: 'Import completed runner result',
    enabledOnlyWhen: [
      'runnerTaskId exists',
      'Check runner result polls approved server adapter result capture',
      'poll returns completed runner result JSON',
      'W151 validates numeric internal ids',
      'W151 validates supported NetSuite URLs',
      'generatedRecordOwner is governed_runner_internal_build_engine'
    ],
    blockedFor: [
      'pending result capture',
      'missing runnerTaskId',
      'adapter error',
      'malformed completed result',
      'Build handoff JSON'
    ],
    mutationBoundary: 'CTA readiness does not mutate state.dccFinalNamingResult; W181/W176 import commit remains the mutation boundary.'
  };

  const guardedHarness = {
    pendingNonMutating: pending.importCta.enabled === false &&
      pending.importCta.blockedReason === 'runner_result_still_pending' &&
      pending.mutationGuard.finalGeneratedNamesUnchanged === true &&
      pending.mutationGuard.activeOpenLinks === 0,
    missingRunnerTaskNonMutating: missingRunnerTask.importCta.enabled === false &&
      missingRunnerTask.importCta.blockedReason === 'runner_task_id_missing' &&
      missingRunnerTask.mutationGuard.activeOpenLinks === 0,
    adapterErrorNonMutating: adapterError.importCta.enabled === false &&
      adapterError.importCta.blockedReason === 'adapter_error_requires_operator_evidence' &&
      adapterError.pollHandoffStatus.adapterErrorStoppedSafely === true,
    malformedCompletedRejected: malformed.importCta.enabled === false &&
      malformed.importCta.blockedReason === 'completed_result_rejected_by_w151' &&
      malformed.resultImportGuard.completedResultAcceptedByW151 === false &&
      malformed.resultImportGuard.malformedCompletedRejected === true,
    handoffJsonRejected: completed.resultImportGuard.handoffJsonRejected === true &&
      pending.resultImportGuard.handoffJsonRejected === true,
    completedW151ValidEnablesCtaOnly: completed.status === 'completed_runner_result_import_cta_ready_from_poll_handoff' &&
      completed.importCta.enabled === true &&
      completed.resultImportGuard.completedResultAcceptedByW151 === true &&
      completed.resultImportGuard.internalRunnerOwnerValid === true &&
      completed.mutationGuard.finalGeneratedNamesUnchanged === true &&
      completed.mutationGuard.activeOpenLinks === 0,
    noRegressionPreserved: completed.noRegression.noDrawerWrites === true &&
      completed.noRegression.noDrawerTransactionWrites === true &&
      completed.noRegression.noDrawerCreatedRecords === true &&
      completed.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true &&
      completed.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    visualBlockedUntilImport: completed.visualTestingDecision.visualTestingBlockedUntilCompletedResultImported === true &&
      completed.visualTestingDecision.targetedOpenLinkTestingReady === false
  };

  const results = [];
  assertCase(results, 'w186_pending_non_mutating', guardedHarness.pendingNonMutating, JSON.stringify(pending.importCta));
  assertCase(results, 'w186_missing_runner_task_non_mutating', guardedHarness.missingRunnerTaskNonMutating, JSON.stringify(missingRunnerTask.importCta));
  assertCase(results, 'w186_adapter_error_non_mutating', guardedHarness.adapterErrorNonMutating, JSON.stringify(adapterError.importCta));
  assertCase(results, 'w186_malformed_completed_rejected', guardedHarness.malformedCompletedRejected, JSON.stringify(malformed.resultImportGuard));
  assertCase(results, 'w186_handoff_json_rejected', guardedHarness.handoffJsonRejected, JSON.stringify(completed.resultImportGuard));
  assertCase(results, 'w186_completed_w151_valid_enables_cta_only', guardedHarness.completedW151ValidEnablesCtaOnly, JSON.stringify(completed.importCta));
  assertCase(results, 'w186_no_regression_preserved', guardedHarness.noRegressionPreserved, JSON.stringify(completed.noRegression));
  assertCase(results, 'w186_visual_testing_blocked_until_import', guardedHarness.visualBlockedUntilImport, JSON.stringify(completed.visualTestingDecision));

  const contract = {
    schema: 'idb.w186-completed-runner-result-import-cta-from-poll-handoff.v1',
    status: results.every((result) => result.pass)
      ? 'completed_result_import_cta_from_poll_handoff_ready'
      : 'completed_result_import_cta_from_poll_handoff_failed',
    importCtaContract,
    guardedHarness,
    samples: {
      pending,
      missingRunnerTask,
      adapterError,
      malformed,
      completed
    },
    traceSamples: completed.traceSamples.concat(pending.traceSamples, adapterError.traceSamples, malformed.traceSamples),
    visualTestingDecision: {
      visualTestingBlocked: true,
      targetedOpenLinkTestingReady: false,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W186 enables the import CTA only. Targeted Open-link testing waits until completed runner result JSON is imported.'
    },
    bestNextCodexPrompt: {
      block: 'W187: Completed Runner Result Import Commit From Poll CTA',
      prompt: 'Move through W187: Completed Runner Result Import Commit From Poll CTA. Use the W186 completed runner result import CTA to commit final generated names into IDB only after the operator chooses Import completed runner result and W151 accepts numeric internal ids, supported NetSuite URLs, and internal runner ownership. Keep pending, missing runnerTaskId, adapter-error, malformed completed result, and handoff JSON non-mutating. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and only after import prepare targeted Open-link visual testing. Output import commit contract, guarded harness, trace samples, W187 report, visual testing decision targeted-only after import, and best next Codex prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w186-completed-runner-result-import-cta-from-poll-handoff-trace.v1',
    completedTrace: completed.traceSamples,
    pendingTrace: pending.traceSamples,
    missingRunnerTaskTrace: missingRunnerTask.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    malformedTrace: malformed.traceSamples,
    results
  };

  const report = `# W186 Completed Runner Result Import CTA From Poll Handoff

Decision: ${contract.status}

## Completed-Result Import CTA Contract

- Source: W185 runnerTaskId poll handoff.
- CTA: Import completed runner result.
- Enabled only after W151 accepts completed runner result JSON with numeric internal ids, supported NetSuite URLs, and internal runner ownership.
- Pending, missing runnerTaskId, adapter-error, malformed completed result, and Build handoff JSON remain non-mutating.
- Open links remain hidden before import.

## Guarded Harness

| Gate | Result |
| --- | --- |
| Pending result non-mutating | ${guardedHarness.pendingNonMutating ? 'PASS' : 'FAIL'} |
| Missing runnerTaskId non-mutating | ${guardedHarness.missingRunnerTaskNonMutating ? 'PASS' : 'FAIL'} |
| Adapter error non-mutating | ${guardedHarness.adapterErrorNonMutating ? 'PASS' : 'FAIL'} |
| Malformed completed result rejected | ${guardedHarness.malformedCompletedRejected ? 'PASS' : 'FAIL'} |
| Handoff JSON rejected | ${guardedHarness.handoffJsonRejected ? 'PASS' : 'FAIL'} |
| Completed W151-valid result enables CTA only | ${guardedHarness.completedW151ValidEnablesCtaOnly ? 'PASS' : 'FAIL'} |
| No-regression boundaries preserved | ${guardedHarness.noRegressionPreserved ? 'PASS' : 'FAIL'} |
| Visual testing blocked until import | ${guardedHarness.visualBlockedUntilImport ? 'PASS' : 'FAIL'} |

## Trace Samples

- ${tracePath}

## Visual Testing Decision

Blocked until completed runner result JSON is imported. No Open-link visual testing is requested in W186.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W186 completed runner result import CTA from poll handoff failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W186 completed runner result import CTA from poll handoff: ${contract.status}; importCta=${completed.importCta.enabled}; visualBlocked=${contract.visualTestingDecision.visualTestingBlocked}`);
}

main();
