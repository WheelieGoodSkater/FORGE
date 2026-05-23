const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w163Path = path.join(root, 'data', 'w163_approved_server_adapter_result_alignment.json');
const dataPath = path.join(root, 'data', 'w164_approved_server_adapter_disabled_live_transport.json');
const tracePath = path.join(root, 'trace_samples', 'w164_approved_server_adapter_disabled_live_transport_trace.json');
const reportPath = path.join(root, 'reports', 'w164_approved_server_adapter_disabled_live_transport.md');

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
    mode: 'approved_server_adapter_transport_readiness'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T20:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Harness-only readiness. Do not invoke.'
  }, overrides || {});
}

async function main() {
  const w163 = readJson(w163Path);
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
  const readiness = hooks.approvedServerAdapterDisabledLiveTransportReadinessV1(state, lane, page, recommendation, {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedJson,
    runnerTaskId: 'fixture_w164_runner_task_001'
  });
  const defaultBlocked = hooks.approvedServerAdapterDisabledLiveTransportReadinessV1(state, lane, page, recommendation, {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: false,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedJson
  });
  const unconfirmedState = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(unconfirmedState);
  hooks.reconcileStateAuthority(unconfirmedState);
  const unconfirmedReadiness = hooks.approvedServerAdapterDisabledLiveTransportReadinessV1(unconfirmedState, lane, page, recommendation, {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedJson
  });

  const expectedStatuses = {
    queued: 'queued_pending',
    polling: 'polling_pending',
    completed: 'completed_result_awaiting_w151_import',
    error: 'adapter_transport_error_drawer_safe'
  };
  const guardedHarness = {
    startsFromW163: w163.decision === 'PASS_SERVER_ADAPTER_RESULT_ALIGNMENT_READY__VISUAL_TESTING_BLOCKED',
    readinessHookReady: typeof hooks.approvedServerAdapterDisabledLiveTransportReadinessV1 === 'function',
    allGatesCanConstructRequestOnly: readiness.requestConstructed === true &&
      readiness.requestEnvelope &&
      readiness.requestEnvelope.executionMode === 'construct_only_do_not_invoke' &&
      readiness.requestEnvelope.invocationAttempted === false,
    defaultDisabledNoSubmit: defaultBlocked.requestConstructed === false &&
      defaultBlocked.noSubmitCases.defaultDisabled.requestConstructed === false,
    missingConfirmedRequestNoSubmit: unconfirmedReadiness.requestConstructed === false &&
      unconfirmedReadiness.strictGates.confirmedBuildRequest === false,
    missingGateCasesNoSubmit: Object.values(readiness.noSubmitCases).every((item) => item.requestConstructed === false && item.invocationAttempted === false && item.activeOpenLinks === 0),
    strictGatesRequireFlagsAllowlistOperatorIdempotencyAndEndpoint: Object.values(readiness.strictGates).every(Boolean),
    responseNormalizationPreserved: JSON.stringify(readiness.normalizedResponsePath) === JSON.stringify(expectedStatuses),
    noLiveInvocationAndNoLinks: readiness.readyBoundary.invocationAttempted === false && readiness.requestEnvelope.activeOpenLinks === 0
  };
  const noRegression = {
    noDrawerWrites: readiness.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: readiness.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: readiness.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: readiness.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: readiness.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: readiness.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: readiness.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: readiness.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: readiness.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: readiness.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W164 constructs an approved adapter request envelope only in harness readiness mode. It does not invoke, submit, poll live, write, or expose Open links.'
  };

  const results = [];
  assertCase(results, 'w164_starts_from_w163_alignment', guardedHarness.startsFromW163, w163.decision);
  assertCase(results, 'w164_readiness_hook_ready', guardedHarness.readinessHookReady && readiness.status === 'disabled_live_transport_request_ready_construct_only', readiness.status);
  assertCase(results, 'w164_all_gates_construct_request_only', guardedHarness.allGatesCanConstructRequestOnly, JSON.stringify(readiness.readyBoundary));
  assertCase(results, 'w164_default_disabled_no_submit', guardedHarness.defaultDisabledNoSubmit, JSON.stringify(defaultBlocked.noSubmitCases.defaultDisabled));
  assertCase(results, 'w164_missing_confirmed_request_no_submit', guardedHarness.missingConfirmedRequestNoSubmit, JSON.stringify(unconfirmedReadiness.strictGates));
  assertCase(results, 'w164_missing_gate_cases_no_submit', guardedHarness.missingGateCasesNoSubmit, JSON.stringify(readiness.noSubmitCases));
  assertCase(results, 'w164_strict_gate_set_complete', guardedHarness.strictGatesRequireFlagsAllowlistOperatorIdempotencyAndEndpoint, JSON.stringify(readiness.strictGates));
  assertCase(results, 'w164_response_normalization_preserved', guardedHarness.responseNormalizationPreserved, JSON.stringify(readiness.normalizedResponsePath));
  assertCase(results, 'w164_no_live_invocation_and_no_links', guardedHarness.noLiveInvocationAndNoLinks, JSON.stringify({ readyBoundary: readiness.readyBoundary, activeOpenLinks: readiness.requestEnvelope.activeOpenLinks }));
  assertCase(results, 'w164_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w164-approved-server-adapter-disabled-live-transport-readiness.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_disabled_live_transport_ready',
    decision: failures.length ? 'FAIL' : 'PASS_DISABLED_LIVE_TRANSPORT_READINESS_READY__VISUAL_TESTING_BLOCKED',
    disabledLiveTransportReadinessContract: {
      schema: readiness.schema,
      status: readiness.status,
      mode: readiness.mode,
      requestConstructed: readiness.requestConstructed,
      requestSchema: readiness.requestEnvelope && readiness.requestEnvelope.schema,
      endpointUrl: readiness.requestEnvelope && readiness.requestEnvelope.endpointUrl,
      method: readiness.requestEnvelope && readiness.requestEnvelope.method,
      invocationAttempted: readiness.requestEnvelope && readiness.requestEnvelope.invocationAttempted,
      strictGates: readiness.strictGates,
      noSubmitCases: readiness.noSubmitCases,
      normalizedResponsePath: readiness.normalizedResponsePath
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W165: Approved Server Adapter Harness Request/Response Handshake',
      prompt: 'Move through W165: Approved Server Adapter Harness Request/Response Handshake. Use the W164 disabled live transport readiness contract to execute a harness-only request/response handshake against a mocked approved NetSuite server adapter endpoint. Keep real invocation disabled and do not enable writes. Prove the constructed request envelope carries the confirmed Build request, operator gate, idempotency token, sandbox allowlist evidence, and poll cursor, then prove mocked queued, polling, completed, and error responses normalize through W157-W162 without drawer writes, drawer transaction writes, or active Open links before W151 import. Preserve no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output harness handshake contract, trace samples, W165 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w164-approved-server-adapter-disabled-live-transport-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    requestConstructed: readiness.requestConstructed,
    strictGates: readiness.strictGates,
    noSubmitCases: readiness.noSubmitCases,
    normalizedResponsePath: readiness.normalizedResponsePath,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W164 Approved Server Adapter Disabled Live Transport Readiness

Decision: ${contract.decision}

## Disabled Live Transport Readiness Contract
- Mode: ${readiness.mode}.
- Request constructed: ${readiness.requestConstructed}.
- Request schema: ${contract.disabledLiveTransportReadinessContract.requestSchema}.
- Endpoint: ${contract.disabledLiveTransportReadinessContract.endpointUrl}.
- Method: ${contract.disabledLiveTransportReadinessContract.method}.
- Invocation attempted: ${contract.disabledLiveTransportReadinessContract.invocationAttempted}.

## Required Gates
${Object.entries(readiness.strictGates).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## No-Submit Cases
${Object.entries(readiness.noSubmitCases).map(([key, value]) => `- ${key}: ${value.status}; requestConstructed=${value.requestConstructed}; invocationAttempted=${value.invocationAttempted}`).join('\n')}

## Response Normalization Preserved
${Object.entries(readiness.normalizedResponsePath).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

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
    console.error(`W164 disabled live transport readiness FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W164 disabled live transport readiness: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
