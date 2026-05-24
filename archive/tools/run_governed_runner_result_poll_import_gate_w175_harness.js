const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w174Path = path.join(root, 'data', 'w174_explicitly_authorized_sandbox_adapter_one_call_execution.json');
const dataPath = path.join(root, 'data', 'w175_governed_runner_result_poll_import_gate.json');
const tracePath = path.join(root, 'trace_samples', 'w175_governed_runner_result_poll_import_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w175_governed_runner_result_poll_import_gate.md');

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

async function main() {
  const w174 = readJson(w174Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const runnerTaskId = w174.runnerTaskIdEvidence.runnerTaskId;
  const completedJson = completedRunnerResultJson();
  let pollCalls = 0;
  const pendingThenCompletedPoll = (request) => {
    pollCalls += 1;
    if (request.attempt < 2) {
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId,
        resultCapture: {
          status: 'polling_pending',
          runnerTaskId,
          resultCaptureCursor: 'cursor_w175_pending'
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      };
    }
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId,
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId,
        resultCaptureCursor: 'cursor_w175_completed'
      },
      finalGeneratedNamesJson: completedJson,
      activeOpenLinks: 0
    };
  };
  const adapterErrorPoll = () => ({
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'adapter_error',
    error: true,
    queueSubmitted: false,
    runnerTaskId,
    resultCapture: {
      status: 'adapter_error',
      runnerTaskId,
      resultCaptureCursor: 'cursor_w175_adapter_error'
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  });
  const pendingOnlyPoll = () => ({
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'polling_pending',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      status: 'polling_pending',
      runnerTaskId,
      resultCaptureCursor: 'cursor_w175_pending_only'
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  });

  const completed = hooks.governedRunnerResultPollAndImportGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w174ExecutionEvidence: w174.executionEvidence.authorizedSubmit,
      w174RunnerTaskIdEvidence: w174.runnerTaskIdEvidence,
      idempotencyToken: w174.executionEvidence.authorizedSubmit.idempotencyToken,
      maxPollAttempts: 3,
      poll: pendingThenCompletedPoll
    }
  );
  const pending = hooks.governedRunnerResultPollAndImportGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w174ExecutionEvidence: w174.executionEvidence.authorizedSubmit,
      w174RunnerTaskIdEvidence: w174.runnerTaskIdEvidence,
      idempotencyToken: w174.executionEvidence.authorizedSubmit.idempotencyToken,
      maxPollAttempts: 2,
      poll: pendingOnlyPoll
    }
  );
  const adapterErrorFromW174 = hooks.governedRunnerResultPollAndImportGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w174ExecutionEvidence: w174.executionEvidence.adapterError,
      adapterErrorEvidence: w174.adapterErrorEvidence,
      idempotencyToken: w174.executionEvidence.authorizedSubmit.idempotencyToken,
      maxPollAttempts: 2,
      poll: adapterErrorPoll
    }
  );
  const missingTask = hooks.governedRunnerResultPollAndImportGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      w174ExecutionEvidence: {},
      idempotencyToken: w174.executionEvidence.authorizedSubmit.idempotencyToken,
      maxPollAttempts: 2,
      poll: pendingOnlyPoll
    }
  );

  const pollImportGateContract = {
    terminalStatuses: {
      pending: 'runner_result_poll_pending_or_blocked',
      completed: 'completed_runner_result_ready_for_w151_import',
      adapterError: 'poll_stopped_adapter_error_operator_evidence_required'
    },
    importRule: 'W151 must accept completed runner result JSON before final generated names can mutate.',
    stateMutationInThisBlock: false,
    visualTestingRule: 'Visual testing stays blocked until completed result JSON is imported into IDB.'
  };
  const guardedHarness = {
    startsFromW174: w174.decision === 'PASS_EXPLICITLY_AUTHORIZED_SANDBOX_ADAPTER_ONE_CALL_EXECUTION_READY__RUNNER_TASK_OR_ERROR_CAPTURED__VISUAL_TESTING_BLOCKED',
    pollGateHookReady: typeof hooks.governedRunnerResultPollAndImportGateV1 === 'function',
    completedPollAcceptedByW151: completed.status === 'completed_runner_result_ready_for_w151_import' &&
      completed.importGate.completedResultAcceptedByW151 === true &&
      completed.importGate.importReady === true &&
      completed.resultJsonEvidence.acceptedRecordCount >= 5 &&
      pollCalls === 2,
    pendingDoesNotImport: pending.status === 'runner_result_poll_pending_or_blocked' &&
      pending.importGate.importReady === false &&
      pending.resultJsonEvidence.finalGeneratedNamesJsonReady === false,
    adapterErrorStopsSafely: adapterErrorFromW174.status === 'poll_stopped_adapter_error_operator_evidence_required' &&
      adapterErrorFromW174.adapterErrorEvidence.operatorEvidenceRequired === true &&
      adapterErrorFromW174.importGate.importReady === false,
    missingTaskBlocks: missingTask.status === 'runner_result_poll_blocked_missing_runner_task_id' &&
      missingTask.pollGate.runnerTaskIdPresent === false &&
      missingTask.importGate.importReady === false,
    namesAndLinksUnchanged: completed.mutationGuard.finalGeneratedNamesUnchanged === true &&
      pending.mutationGuard.finalGeneratedNamesUnchanged === true &&
      adapterErrorFromW174.mutationGuard.finalGeneratedNamesUnchanged === true &&
      completed.mutationGuard.activeOpenLinks === 0 &&
      pending.mutationGuard.activeOpenLinks === 0,
    handoffRejected: completed.importGate.handoffRejected === true,
    traceSamplesReady: Array.isArray(completed.traceSamples) &&
      completed.traceSamples.length >= 3 &&
      completed.traceSamples.every((sample) => sample.activeOpenLinks === 0 && sample.mutatesFinalGeneratedNames === false)
  };
  const noRegression = {
    noDrawerWrites: completed.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: completed.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: completed.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: completed.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: completed.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: completed.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: completed.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: completed.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: completed.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: completed.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };
  const visualTestingDecision = {
    visualTestingBlocked: true,
    visualNetSuiteTestingRequiredNow: false,
    reason: 'W175 only gates poll/result capture and W151 import readiness. Visual testing remains blocked until completed runner result JSON is imported into IDB.'
  };

  const results = [];
  assertCase(results, 'w175_starts_from_w174_execution_evidence', guardedHarness.startsFromW174, w174.decision);
  assertCase(results, 'w175_poll_gate_hook_ready', guardedHarness.pollGateHookReady, 'governedRunnerResultPollAndImportGateV1');
  assertCase(results, 'w175_completed_poll_accepted_by_w151', guardedHarness.completedPollAcceptedByW151, JSON.stringify(completed.importGate));
  assertCase(results, 'w175_pending_does_not_import', guardedHarness.pendingDoesNotImport, JSON.stringify(pending.pollGate));
  assertCase(results, 'w175_adapter_error_stops_safely', guardedHarness.adapterErrorStopsSafely, JSON.stringify(adapterErrorFromW174.adapterErrorEvidence));
  assertCase(results, 'w175_missing_task_blocks', guardedHarness.missingTaskBlocks, JSON.stringify(missingTask.pollGate));
  assertCase(results, 'w175_names_links_and_handoff_guarded', guardedHarness.namesAndLinksUnchanged && guardedHarness.handoffRejected, JSON.stringify(completed.mutationGuard));
  assertCase(results, 'w175_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(completed.traceSamples));
  assertCase(results, 'w175_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w175_visual_testing_blocked_until_completed_result_import', visualTestingDecision.visualTestingBlocked === true && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, visualTestingDecision.reason);

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w175-governed-runner-result-poll-import-gate.v1',
    status: 'governed_runner_result_poll_import_gate_ready',
    decision: failures.length
      ? 'FAIL_GOVERNED_RUNNER_RESULT_POLL_IMPORT_GATE'
      : 'PASS_GOVERNED_RUNNER_RESULT_POLL_IMPORT_GATE_READY__COMPLETED_RESULT_IMPORT_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    pollImportGateContract,
    guardedHarness,
    samples: {
      completed,
      pending,
      adapterErrorFromW174,
      missingTask
    },
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W176: Completed Runner Result Import Commit And Build Return Surface',
      prompt: 'Move through W176: Completed Runner Result Import Commit And Build Return Surface. Use the W175 completed runner result import-ready gate to commit final generated names into IDB only after W151 accepts numeric internal ids and supported NetSuite URLs. Keep the commit drawer-local and result-import only; do not create records from the drawer and do not invoke SuiteScript outside the approved server adapter path. Prove pending and adapter-error states do not mutate final names, completed result import updates Build/Run names and verified Open links, and visual testing remains blocked until the imported URLs exist. Preserve no drawer writes, no drawer transaction writes, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output import commit contract, guarded harness, trace samples, W176 report, visual testing decision blocked until imported URLs are ready, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w175-governed-runner-result-poll-import-gate-trace.v1',
    generatedAt: contract.generatedAt,
    completedTrace: completed.traceSamples,
    pendingTrace: pending.traceSamples,
    adapterErrorTrace: adapterErrorFromW174.traceSamples,
    missingTaskTrace: missingTask.traceSamples,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W175 Governed Runner Result Poll And Import Gate

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Polling / Import Gate Contract

- Runner task id: ${runnerTaskId}
- Completed poll status: ${completed.status}
- Completed result accepted by W151: ${completed.importGate.completedResultAcceptedByW151}
- Import ready: ${completed.importGate.importReady}
- State mutation in W175: false
- Pending poll status: ${pending.status}; import ready = ${pending.importGate.importReady}
- Adapter error status: ${adapterErrorFromW174.status}; operator evidence required = ${adapterErrorFromW174.adapterErrorEvidence.operatorEvidenceRequired}
- Missing runnerTaskId status: ${missingTask.status}
- Active Open links before import: 0

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
    console.error(`W175 governed runner result poll/import gate FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W175 governed runner result poll/import gate: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}; importReady=${completed.importGate.importReady}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
