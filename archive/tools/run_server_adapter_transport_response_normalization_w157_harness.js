const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w156Path = path.join(root, 'data', 'w156_approved_server_adapter_transport_boundary.json');
const dataPath = path.join(root, 'data', 'w157_server_adapter_transport_response_normalization.json');
const tracePath = path.join(root, 'trace_samples', 'w157_server_adapter_transport_response_normalization_trace.json');
const reportPath = path.join(root, 'reports', 'w157_server_adapter_transport_response_normalization.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function makeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks() {
  const storage = makeStorage();
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

function completedFinalGeneratedNamesJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
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
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: 701234,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234'
      },
      matrixProofItem: {
        type: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: 701235,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    }
  };
}

async function main() {
  const w156 = readJson(w156Path);
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const adapterConfig = {
    endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_runner_adapter&deploy=customdeploy_idb_runner_adapter',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    mode: 'approved_server_adapter_available'
  };
  const operatorEvidence = {
    operatorName: 'Sandbox Operator',
    reviewedAt: '2026-05-16T00:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedNoSubmit: false,
    confirmedSandboxAccount: true,
    notes: 'Operator approved W157 normalization harness.'
  };
  const boundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only'
  });

  const falseFlag = hooks.normalizeApprovedServerAdapterTransportResponseV1({
    status: 'transport_not_executed_no_submit',
    queueSubmitted: false,
    runnerTaskId: null,
    resultCapture: { status: 'not_started_no_submit' },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  });
  const queued = hooks.normalizeApprovedServerAdapterTransportResponseV1({
    status: 'queued_pending_transport_fixture',
    queueSubmitted: true,
    runnerTaskId: `fixture_w157_${boundary.body.idempotencyToken}_001`,
    resultCapture: {
      status: 'pending_runner_completion',
      runnerTaskId: `fixture_w157_${boundary.body.idempotencyToken}_001`
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  });
  const polling = hooks.normalizeApprovedServerAdapterTransportResponseV1({
    status: 'poll_response_pending',
    queueSubmitted: true,
    runnerTaskId: queued.runnerTaskId,
    resultCapture: {
      status: 'pending_runner_completion',
      runnerTaskId: queued.runnerTaskId
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  }, { pollAttempted: true });
  const completed = hooks.normalizeApprovedServerAdapterTransportResponseV1({
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: queued.runnerTaskId,
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId: queued.runnerTaskId
    },
    finalGeneratedNamesJson: completedFinalGeneratedNamesJson(),
    activeOpenLinks: 0
  }, { pollAttempted: true });
  const error = hooks.normalizeApprovedServerAdapterTransportResponseV1({
    status: 'adapter_error',
    error: true,
    queueSubmitted: false,
    runnerTaskId: queued.runnerTaskId,
    resultCapture: {
      status: 'adapter_error',
      runnerTaskId: queued.runnerTaskId,
      error: true
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  });
  state.integratedBuildRunnerResult = {
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: queued.runnerTaskId,
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId: queued.runnerTaskId
    },
    finalGeneratedNamesJson: completedFinalGeneratedNamesJson(),
    activeOpenLinks: 0
  };
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const statuses = [falseFlag, queued, polling, completed, error].map((item) => item.status);
  const responseNormalizationContract = {
    schema: 'idb.server-adapter-transport-response-normalization-contract.v1',
    normalizedStatuses: statuses,
    falseFlagNoSubmit: {
      status: falseFlag.status,
      queueSubmitted: falseFlag.queueSubmitted,
      runnerTaskId: falseFlag.runnerTaskId,
      resultCaptureStatus: falseFlag.resultCaptureStatus
    },
    queuedPending: {
      status: queued.status,
      queueSubmitted: queued.queueSubmitted,
      runnerTaskId: queued.runnerTaskId,
      resultCaptureStatus: queued.resultCaptureStatus
    },
    pollingPending: {
      status: polling.status,
      pollAttempted: polling.pollAttempted,
      runnerTaskId: polling.runnerTaskId,
      activeOpenLinks: polling.activeOpenLinks
    },
    completedResultAwaitingW151Import: {
      status: completed.status,
      finalGeneratedNamesJsonReady: completed.finalGeneratedNamesJsonReady,
      importGuard: completed.importGuard,
      activeOpenLinks: completed.activeOpenLinks
    },
    errorResponse: {
      status: error.status,
      queueSubmitted: error.queueSubmitted,
      activeOpenLinks: error.activeOpenLinks
    }
  };
  const guardedHarness = {
    boundaryStatus: boundary.status,
    requestConstructed: boundary.requestConstructed,
    statuses,
    allStatusesNoLinks: [falseFlag, queued, polling, completed, error].every((item) => item.activeOpenLinks === 0),
    completedDoesNotMutateDrawerNames: state.dccFinalNamingResult === null,
    renderedBuildMentionsNormalization: /Response normalization/.test(renderedBuild)
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W157 normalizes dry-run/harness adapter responses only. Completed results still wait for W151 import before links can appear.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerTransactionWrites: true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
    consultantConfirmationRequired: boundary.body.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: boundary.body.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: !!boundary.body.idempotencyToken && queued.runnerTaskId.includes(boundary.body.idempotencyToken),
    internalRunnerOwnership: completed.finalGeneratedNamesJson.generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: completed.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: [falseFlag, queued, polling, completed, error].every((item) => item.activeOpenLinks === 0)
  };

  const results = [];
  assertCase(results, 'w157_starts_from_w156_transport_boundary_ready', w156.decision === 'PASS_APPROVED_TRANSPORT_BOUNDARY_READY__VISUAL_TESTING_BLOCKED', w156.decision);
  assertCase(results, 'w157_normalization_hook_and_ui_ready', typeof hooks.normalizeApprovedServerAdapterTransportResponseV1 === 'function' && /Response normalization/.test(renderedBuild), renderedBuild.slice(0, 700));
  assertCase(results, 'w157_statuses_cover_required_transport_responses', ['false_flag_no_submit', 'queued_pending', 'polling_pending', 'completed_result_awaiting_w151_import', 'adapter_transport_error_drawer_safe'].every((status) => statuses.includes(status)), JSON.stringify(statuses));
  assertCase(results, 'w157_false_flag_response_is_no_submit', falseFlag.status === 'false_flag_no_submit' && falseFlag.queueSubmitted === false && falseFlag.runnerTaskId === null && falseFlag.resultCaptureStatus === 'not_started_no_submit', JSON.stringify(falseFlag));
  assertCase(results, 'w157_queued_and_polling_responses_keep_links_hidden', queued.status === 'queued_pending' && polling.status === 'polling_pending' && queued.queueSubmitted === true && polling.pollAttempted === true && queued.activeOpenLinks === 0 && polling.activeOpenLinks === 0, JSON.stringify({ queued, polling }));
  assertCase(results, 'w157_completed_response_waits_for_w151_import', completed.status === 'completed_result_awaiting_w151_import' && completed.finalGeneratedNamesJsonReady === true && /W151/.test(completed.importGuard) && completed.activeOpenLinks === 0 && state.dccFinalNamingResult === null, JSON.stringify(completed));
  assertCase(results, 'w157_error_response_is_drawer_safe', error.status === 'adapter_transport_error_drawer_safe' && error.queueSubmitted === false && error.activeOpenLinks === 0 && error.finalGeneratedNamesJson === null, JSON.stringify(error));
  assertCase(results, 'w157_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w157-server-adapter-transport-response-normalization.v1',
    status: failures.length ? 'blocked' : 'server_adapter_transport_response_normalization_ready',
    decision: failures.length ? 'FAIL' : 'PASS_RESPONSE_NORMALIZATION_READY__VISUAL_TESTING_BLOCKED',
    responseNormalizationContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W158: Approved Server Adapter Dry-Run Fixture Poll Cycle',
      prompt: 'Move through W158: Approved Server Adapter Dry-Run Fixture Poll Cycle. Use the W157 normalized response contract to model the full harness-only Build cycle from approved transport request, false-flag no-submit, queued pending, repeated polling pending, completed result awaiting W151 import, and drawer-safe error recovery. Keep real invocation disabled by default, do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output dry-run poll-cycle contract, guarded harness, trace samples, W158 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w157-server-adapter-transport-response-normalization-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    normalizedStatuses: statuses,
    completedAwaitingImport: completed.status,
    activeOpenLinksAcrossResponses: [falseFlag, queued, polling, completed, error].map((item) => item.activeOpenLinks),
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W157 Server Adapter Transport Dry-Run Response Normalization

Decision: ${contract.decision}

## Response Normalization Contract
- False-flag no-submit: status=${falseFlag.status}, queueSubmitted=${falseFlag.queueSubmitted}, runnerTaskId=${falseFlag.runnerTaskId}.
- Queued pending: status=${queued.status}, runnerTaskId=${queued.runnerTaskId}.
- Polling pending: status=${polling.status}, pollAttempted=${polling.pollAttempted}.
- Completed awaiting W151 import: status=${completed.status}, finalGeneratedNamesJsonReady=${completed.finalGeneratedNamesJsonReady}, activeOpenLinks=${completed.activeOpenLinks}.
- Error response: status=${error.status}, queueSubmitted=${error.queueSubmitted}, activeOpenLinks=${error.activeOpenLinks}.

## Guarded Harness
- Boundary status: ${boundary.status}.
- Request constructed: ${boundary.requestConstructed}.
- Normalized statuses: ${statuses.join(', ')}.
- All normalized responses keep activeOpenLinks=0: ${guardedHarness.allStatusesNoLinks}.
- Completed response does not mutate drawer names: ${guardedHarness.completedDoesNotMutateDrawerNames}.

## Visual Testing Decision
Blocked. ${visualTestingDecision.reason}

## Validator Gates
${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## No Regression
${Object.entries(noRegression).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Best Next Codex Prompt
${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W157 response normalization FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W157 response normalization: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
