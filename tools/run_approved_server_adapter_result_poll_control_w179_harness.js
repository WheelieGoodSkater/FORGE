const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w175Path = path.join(root, 'data', 'w175_governed_runner_result_poll_import_gate.json');
const w178Path = path.join(root, 'data', 'w178_build_return_poll_refresh_control.json');
const dataPath = path.join(root, 'data', 'w179_approved_server_adapter_result_poll_control.json');
const tracePath = path.join(root, 'trace_samples', 'w179_approved_server_adapter_result_poll_control_trace.json');
const reportPath = path.join(root, 'reports', 'w179_approved_server_adapter_result_poll_control.md');

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

function pendingEnvelope(runnerTaskId) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'poll_response_pending',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      status: 'pending_runner_completion',
      runnerTaskId,
      pollCursor: 'cursor_after_pending'
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };
}

function completedEnvelope(runnerTaskId, resultJson) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed',
    queueSubmitted: true,
    runnerTaskId,
    resultCapture: {
      status: 'completed',
      runnerTaskId,
      finalGeneratedNamesJson: resultJson
    },
    finalGeneratedNamesJson: resultJson,
    activeOpenLinks: 0
  };
}

function adapterErrorEnvelope(runnerTaskId) {
  return {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'adapter_error',
    error: true,
    errorMessage: 'fixture adapter error',
    queueSubmitted: false,
    runnerTaskId,
    resultCapture: {
      status: 'adapter_error',
      runnerTaskId
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w175 = readJson(w175Path);
  const w178 = readJson(w178Path);
  const completedResultJson = w175.samples.completed.resultJsonEvidence.completedResultJson;
  const malformedCompletedResultJson = Object.assign({}, completedResultJson, {
    records: Object.assign({}, completedResultJson.records, {
      customer: Object.assign({}, completedResultJson.records.customer, {
        internalId: 'REPLACE_REAL_CUSTOMER_ID',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID'
      })
    })
  });
  const runnerTaskId = 'task_w179_operator_001';
  const baseAdapterResult = {
    status: 'queued_pending',
    queueSubmitted: true,
    runnerTaskId,
    idempotencyToken: 'idb-w179-idempotency-001',
    resultCapture: {
      status: 'pending_runner_completion',
      runnerTaskId
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };
  const approvedOptions = {
    confirmedBuildRequest: hooks.confirmedBuildRequestJsonV1(context.state, context.lane, context.page, context.recommendation),
    serverFlags: {
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true
    },
    sandboxAllowlistEvidence: {
      allowlisted: true,
      accountId: 'SANDBOX_ACCOUNT_ID',
      environment: 'SANDBOX'
    },
    operatorApproval: {
      approved: true,
      operator: 'W179 harness',
      phrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
    },
    idempotencyToken: 'idb-w179-idempotency-001',
    approvedEndpointMode: 'approved_server_adapter_only'
  };
  const noTask = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, approvedOptions, {
      adapterResult: null,
      runnerTaskId: ''
    })
  );
  const missingPrereq = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterResult: baseAdapterResult,
      idempotencyToken: 'idb-w179-idempotency-001'
    }
  );
  const pending = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, approvedOptions, {
      adapterResult: baseAdapterResult,
      pollTransport: (request) => pendingEnvelope(request.runnerTaskId)
    })
  );
  const completed = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, approvedOptions, {
      adapterResult: baseAdapterResult,
      pollTransport: (request) => completedEnvelope(request.runnerTaskId, completedResultJson)
    })
  );
  const malformedCompleted = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, approvedOptions, {
      adapterResult: baseAdapterResult,
      pollTransport: (request) => completedEnvelope(request.runnerTaskId, malformedCompletedResultJson)
    })
  );
  const adapterError = hooks.approvedServerAdapterResultPollControlImplementationV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, approvedOptions, {
      adapterResult: baseAdapterResult,
      pollTransport: (request) => adapterErrorEnvelope(request.runnerTaskId)
    })
  );
  const renderedReview = hooks.renderReviewView(
    Object.assign({}, context.state, { integratedBuildRunnerResult: baseAdapterResult }),
    context.lane,
    context.page,
    context.recommendation
  );

  const pollControlImplementationContract = {
    sourceContract: w178.schema,
    requestSchema: 'idb.approved-server-adapter-result-poll-request.v1',
    visibleControl: 'Check runner result',
    hiddenWhenNoRunnerTaskId: true,
    prerequisites: [
      'confirmed Build request',
      'server flags',
      'sandbox allowlist',
      'operator approval',
      'idempotency token',
      'approved endpoint mode'
    ],
    normalizedStatuses: [
      'polling_pending',
      'completed_result_awaiting_w151_import',
      'adapter_transport_error_drawer_safe'
    ],
    mutationBoundary: 'polling never commits state.dccFinalNamingResult; W151 import remains separate'
  };

  const guardedHarness = {
    noTaskKeepsControlHiddenAndNoRequest: noTask.status === 'poll_control_hidden_no_runner_task' &&
      noTask.visibleControl.checkRunnerResultVisible === false &&
      noTask.pollRequest.requestSent === false,
    missingPrerequisitesBlockRequest: missingPrereq.status === 'poll_control_blocked_missing_prerequisites' &&
      missingPrereq.pollRequest.requestConstructed === false &&
      missingPrereq.prerequisiteFailures.length >= 4,
    pendingPollNormalizesNoMutation: pending.normalizedPollResponse.status === 'polling_pending' &&
      pending.pollRequest.requestSent === true &&
      pending.mutationGuard.finalGeneratedNamesUnchanged === true &&
      pending.mutationGuard.activeOpenLinks === 0,
    completedPollW151ReadyNoMutation: completed.status === 'poll_control_completed_result_ready_for_w151_import' &&
      completed.resultImportGuard.completedResultAcceptedByW151 === true &&
      completed.resultImportGuard.stateMutationAllowedInThisBlock === false &&
      completed.mutationGuard.finalGeneratedNamesUnchanged === true &&
      completed.mutationGuard.activeOpenLinks === 0,
    malformedCompletedRejectedByW151: malformedCompleted.status === 'poll_control_completed_result_rejected_by_w151' &&
      malformedCompleted.resultImportGuard.completedResultAcceptedByW151 === false &&
      malformedCompleted.mutationGuard.finalGeneratedNamesUnchanged === true,
    adapterErrorStopsSafely: adapterError.status === 'poll_control_adapter_error_stopped' &&
      adapterError.normalizedPollResponse.status === 'adapter_transport_error_drawer_safe' &&
      adapterError.mutationGuard.finalGeneratedNamesUnchanged === true,
    renderUsesBuildReturnActionBoundary: /data-idb-build-return-action="check_runner_result"/.test(renderedReview) &&
      !/data-idb-action="check_runner_result"/.test(renderedReview),
    traceSamplesReady: pending.traceSamples.some((sample) => sample.event === 'w179_poll_response_normalized') &&
      completed.traceSamples.some((sample) => sample.completedResultAcceptedByW151 === true),
    noRegressionPreserved: [
      noTask,
      missingPrereq,
      pending,
      completed,
      malformedCompleted,
      adapterError
    ].every((sample) => sample.noRegression.noDrawerWrites === true &&
      sample.noRegression.noDrawerTransactionWrites === true &&
      sample.noRegression.noActiveOpenLinksWithoutRealUrls === true)
  };

  const visualTestingDecision = {
    visualTestingBlockedUntilCompletedResultImported: true,
    targetedOpenLinkTestingReady: false,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W179 only polls result capture. A completed response is import-ready only after W151 and still does not expose Open links until import commit.'
  };

  const results = [];
  assertCase(results, 'w179_no_task_hidden_no_request', guardedHarness.noTaskKeepsControlHiddenAndNoRequest, JSON.stringify(noTask.visibleControl));
  assertCase(results, 'w179_missing_prerequisites_block_request', guardedHarness.missingPrerequisitesBlockRequest, JSON.stringify(missingPrereq.prerequisiteFailures));
  assertCase(results, 'w179_pending_poll_normalized_no_mutation', guardedHarness.pendingPollNormalizesNoMutation, JSON.stringify(pending.normalizedPollResponse));
  assertCase(results, 'w179_completed_poll_w151_ready_no_mutation', guardedHarness.completedPollW151ReadyNoMutation, JSON.stringify(completed.resultImportGuard));
  assertCase(results, 'w179_malformed_completed_rejected_by_w151', guardedHarness.malformedCompletedRejectedByW151, JSON.stringify(malformedCompleted.resultImportGuard));
  assertCase(results, 'w179_adapter_error_stops_safely', guardedHarness.adapterErrorStopsSafely, JSON.stringify(adapterError.normalizedPollResponse));
  assertCase(results, 'w179_render_uses_build_return_action_boundary', guardedHarness.renderUsesBuildReturnActionBoundary, renderedReview.slice(renderedReview.indexOf('idb-w178-poll-refresh-control'), renderedReview.indexOf('idb-w178-poll-refresh-control') + 900));
  assertCase(results, 'w179_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(completed.traceSamples));
  assertCase(results, 'w179_no_regression_preserved', guardedHarness.noRegressionPreserved, JSON.stringify(completed.noRegression));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w179-approved-server-adapter-result-poll-control.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_result_poll_control_ready',
    decision: failures.length ? 'FAIL_APPROVED_SERVER_ADAPTER_RESULT_POLL_CONTROL' : 'PASS_APPROVED_SERVER_ADAPTER_RESULT_POLL_CONTROL_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    pollControlImplementationContract,
    samples: {
      noTask,
      missingPrereq,
      pending,
      completed,
      malformedCompleted,
      adapterError
    },
    guardedHarness,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W180: Completed Poll Result Import CTA Wiring And Operator Retest Packet',
      prompt: 'Move through W180: Completed Poll Result Import CTA Wiring And Operator Retest Packet. Use the W179 approved server adapter result poll control to connect completed poll responses to the W151 guarded import CTA without mutating final generated names until the completed runner result is imported. Keep pending, adapter-error, and malformed completed responses non-mutating, keep Open links hidden before import, and do not request visual testing until imported URLs exist. Output import CTA wiring contract, guarded harness, operator retest packet, trace samples, W180 report, visual testing decision blocked until import, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w179-approved-server-adapter-result-poll-control-trace.v1',
    generatedAt: contract.generatedAt,
    noTaskTrace: noTask.traceSamples,
    missingPrereqTrace: missingPrereq.traceSamples,
    pendingTrace: pending.traceSamples,
    completedTrace: completed.traceSamples,
    malformedCompletedTrace: malformedCompleted.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    results,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W179 Approved Server Adapter Result Poll Control Implementation

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Poll-Control Implementation Contract

- Visible control: ${pollControlImplementationContract.visibleControl}
- Request schema: ${pollControlImplementationContract.requestSchema}
- Hidden when no runnerTaskId: ${pollControlImplementationContract.hiddenWhenNoRunnerTaskId}
- Required gates: ${pollControlImplementationContract.prerequisites.join(', ')}
- Mutation boundary: ${pollControlImplementationContract.mutationBoundary}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## Trace Samples

- No task: ${noTask.status}
- Missing prerequisites: ${missingPrereq.status}
- Pending: ${pending.normalizedPollResponse.status}
- Completed: ${completed.status}; W151 accepted=${completed.resultImportGuard.completedResultAcceptedByW151}
- Malformed completed: ${malformedCompleted.status}; W151 accepted=${malformedCompleted.resultImportGuard.completedResultAcceptedByW151}
- Adapter error: ${adapterError.status}

## W179 Report

The Check runner result control is now wired to a guarded approved-server-adapter poll model. No runnerTaskId keeps the control hidden. With a runnerTaskId, the poll request is constructed only after the confirmed Build request, server flags, sandbox allowlist, operator approval, idempotency token, and approved endpoint mode are present. Pending, completed, malformed completed, and adapter-error responses normalize through the existing W157-W162/W175 path without mutating final generated names.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. Broader visual testing is not required.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W179 approved server adapter result poll control failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W179 approved server adapter result poll control: ${contract.decision}; completed=${completed.status}; pending=${pending.normalizedPollResponse.status}`);
}

main();
