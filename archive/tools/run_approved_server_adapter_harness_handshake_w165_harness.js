const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w164Path = path.join(root, 'data', 'w164_approved_server_adapter_disabled_live_transport.json');
const dataPath = path.join(root, 'data', 'w165_approved_server_adapter_harness_handshake.json');
const tracePath = path.join(root, 'trace_samples', 'w165_approved_server_adapter_harness_handshake_trace.json');
const reportPath = path.join(root, 'reports', 'w165_approved_server_adapter_harness_handshake.md');

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

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
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
    matrixItem: {
      type: 'matrixitem',
      name: 'Ariat Core Boot Size Color Matrix',
      internalId: 701235,
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235'
    },
    componentItems: [
      {
        type: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: 701236,
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236'
      }
    ]
  };
}

function adapterConfig() {
  return {
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_harness_handshake'
  };
}

function operatorEvidence() {
  return {
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T20:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Harness-only handshake. Do not invoke.'
  };
}

async function main() {
  const w164 = readJson(w164Path);
  const hooks = loadHooks();
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const completedJson = completedRunnerResultJson();
  const readinessOptions = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedJson,
    runnerTaskId: 'fixture_w165_runner_task_001'
  };
  const readiness = hooks.approvedServerAdapterDisabledLiveTransportReadinessV1(state, lane, page, recommendation, readinessOptions);
  const handshake = hooks.approvedServerAdapterHarnessHandshakeV1(state, lane, page, recommendation, Object.assign({}, readinessOptions, {
    readiness
  }));
  const noRequestHandshake = hooks.approvedServerAdapterHarnessHandshakeV1(state, lane, page, recommendation, Object.assign({}, readinessOptions, {
    invocationEnabled: false
  }));
  const expectedStatuses = {
    queued: 'queued_pending',
    polling: 'polling_pending',
    completed: 'completed_result_awaiting_w151_import',
    error: 'adapter_transport_error_drawer_safe'
  };
  const guardedHarness = {
    startsFromW164: w164.decision === 'PASS_DISABLED_LIVE_TRANSPORT_READINESS_READY__VISUAL_TESTING_BLOCKED',
    handshakeHookReady: typeof hooks.approvedServerAdapterHarnessHandshakeV1 === 'function',
    mockEndpointReceivesConstructedRequest: handshake.requestAcceptedByMockEndpoint === true,
    requestCarriesRequiredFacts: Object.values(handshake.requestFacts).every(Boolean),
    responsesNormalizeThroughW157W162: JSON.stringify(handshake.normalizedStatuses) === JSON.stringify(expectedStatuses),
    completedResultAwaitsW151Import: handshake.completedImportGuard.acceptedByW151 === true && handshake.completedImportGuard.activeOpenLinksBeforeImport === 0,
    handoffStillRejected: handshake.completedImportGuard.handoffRejected === true,
    blockedHandshakeNoSubmit: noRequestHandshake.requestAcceptedByMockEndpoint === false && noRequestHandshake.requestSummary.activeOpenLinks === 0,
    noLiveInvocationAndNoLinks: handshake.requestSummary.invocationAttempted === false && handshake.requestSummary.activeOpenLinks === 0
  };
  const noRegression = {
    noDrawerWrites: handshake.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: handshake.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: handshake.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: handshake.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: handshake.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: handshake.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: handshake.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: handshake.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: handshake.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: handshake.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W165 is a mocked request/response handshake only. It does not invoke NetSuite, submit the runner, write records, or expose Open links.'
  };
  const results = [];
  assertCase(results, 'w165_starts_from_w164_readiness', guardedHarness.startsFromW164, w164.decision);
  assertCase(results, 'w165_handshake_hook_ready', guardedHarness.handshakeHookReady && handshake.status === 'approved_server_adapter_harness_handshake_ready', handshake.status);
  assertCase(results, 'w165_mock_endpoint_receives_constructed_request', guardedHarness.mockEndpointReceivesConstructedRequest, JSON.stringify(handshake.requestSummary));
  assertCase(results, 'w165_request_carries_required_facts', guardedHarness.requestCarriesRequiredFacts, JSON.stringify(handshake.requestFacts));
  assertCase(results, 'w165_responses_normalize_through_w157_w162', guardedHarness.responsesNormalizeThroughW157W162, JSON.stringify(handshake.normalizedStatuses));
  assertCase(results, 'w165_completed_result_awaits_w151_import', guardedHarness.completedResultAwaitsW151Import, JSON.stringify(handshake.completedImportGuard));
  assertCase(results, 'w165_handoff_still_rejected', guardedHarness.handoffStillRejected, JSON.stringify(handshake.completedImportGuard));
  assertCase(results, 'w165_blocked_handshake_stays_no_submit', guardedHarness.blockedHandshakeNoSubmit, JSON.stringify(noRequestHandshake.requestSummary));
  assertCase(results, 'w165_no_live_invocation_and_no_links', guardedHarness.noLiveInvocationAndNoLinks, JSON.stringify(handshake.requestSummary));
  assertCase(results, 'w165_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w165-approved-server-adapter-harness-handshake.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_harness_handshake_ready',
    decision: failures.length ? 'FAIL' : 'PASS_HARNESS_HANDSHAKE_READY__VISUAL_TESTING_BLOCKED',
    harnessHandshakeContract: {
      schema: handshake.schema,
      status: handshake.status,
      mode: handshake.mode,
      requestAcceptedByMockEndpoint: handshake.requestAcceptedByMockEndpoint,
      requestSummary: handshake.requestSummary,
      requestFacts: handshake.requestFacts,
      normalizedStatuses: handshake.normalizedStatuses,
      completedImportGuard: handshake.completedImportGuard
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W166: Approved Server Adapter Live-Disabled Transport Error And Retry Contract',
      prompt: 'Move through W166: Approved Server Adapter Live-Disabled Transport Error And Retry Contract. Use the W165 harness-only request/response handshake to define drawer-safe retry, timeout, duplicate idempotency, adapter error, and malformed completed-result behavior while real invocation remains disabled. Prove errors and retries do not mutate final generated names, do not create active Open links, preserve W151 completed-result import guard, preserve state authority and handoff parity, and keep rollback by disabling server flags. Do not enable writes, do not invoke NetSuite live, and do not request visual testing. Output error/retry contract, guarded harness, trace samples, W166 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w165-approved-server-adapter-harness-handshake-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    requestFacts: handshake.requestFacts,
    requestSummary: handshake.requestSummary,
    normalizedStatuses: handshake.normalizedStatuses,
    completedImportGuard: handshake.completedImportGuard,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W165 Approved Server Adapter Harness Request/Response Handshake

Decision: ${contract.decision}

## Harness Handshake Contract
- Mode: ${handshake.mode}.
- Request accepted by mocked endpoint: ${handshake.requestAcceptedByMockEndpoint}.
- Endpoint: ${handshake.requestSummary.endpointUrl}.
- Method: ${handshake.requestSummary.method}.
- Idempotency token: ${handshake.requestSummary.idempotencyToken}.
- Invocation attempted: ${handshake.requestSummary.invocationAttempted}.
- Active Open links before import: ${handshake.requestSummary.activeOpenLinks}.

## Request Facts
${Object.entries(handshake.requestFacts).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Normalized Mock Responses
${Object.entries(handshake.normalizedStatuses).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Completed Result Guard
- W151 status: ${handshake.completedImportGuard.status}.
- Accepted by W151: ${handshake.completedImportGuard.acceptedByW151}.
- Handoff rejected: ${handshake.completedImportGuard.handoffRejected}.
- Active Open links before import: ${handshake.completedImportGuard.activeOpenLinksBeforeImport}.

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
    console.error(`W165 approved server adapter harness handshake FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W165 approved server adapter harness handshake: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
