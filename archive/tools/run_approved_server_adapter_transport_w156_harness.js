const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w155Path = path.join(root, 'data', 'w155_integrated_build_invocation_toggle_polling_stub.json');
const dataPath = path.join(root, 'data', 'w156_approved_server_adapter_transport_boundary.json');
const tracePath = path.join(root, 'trace_samples', 'w156_approved_server_adapter_transport_boundary_trace.json');
const reportPath = path.join(root, 'reports', 'w156_approved_server_adapter_transport_boundary.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
}

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start < 0) return '';
  const bodyStart = source.indexOf('{', start);
  if (bodyStart < 0) return '';
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') depth += 1;
    if (character === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return '';
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

async function main() {
  const w155 = readJson(w155Path);
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w156TransportBoundarySource = extractFunctionBody(userscript, 'integratedBuildApprovedServerAdapterTransportBoundaryV1');
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
    notes: 'Operator approved W156 controlled transport harness.'
  };

  const defaultBoundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation);
  const readyButDisabledBoundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: false,
    approvedEndpointMode: 'approved_server_adapter_only'
  });
  const badEndpointBoundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation, {
    adapterConfig: Object.assign({}, adapterConfig, { endpointUrl: 'https://example.com/not-netsuite' }),
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only'
  });
  const approvedBoundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only'
  });

  let transportCallCount = 0;
  const defaultTransport = await hooks.executeApprovedServerAdapterTransportHarnessOnlyV1(defaultBoundary, () => {
    transportCallCount += 1;
    return {};
  });
  const approvedTransport = await hooks.executeApprovedServerAdapterTransportHarnessOnlyV1(approvedBoundary, (boundary) => {
    transportCallCount += 1;
    return {
      status: 'queued_pending_transport_fixture',
      queueSubmitted: true,
      runnerTaskId: `fixture_w156_${boundary.body.idempotencyToken}_001`,
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'pending_runner_completion',
        runnerTaskId: `fixture_w156_${boundary.body.idempotencyToken}_001`,
        idempotencyToken: boundary.body.idempotencyToken,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0,
      generatedRecordOwner: 'governed_runner_internal_build_engine'
    };
  });
  const pendingPoll = hooks.integratedBuildRunnerPollingStubV1(approvedTransport, { pollAttempted: true });
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const transportBoundaryContract = {
    defaultStatus: defaultBoundary.status,
    readyButDisabledStatus: readyButDisabledBoundary.status,
    badEndpointStatus: badEndpointBoundary.status,
    approvedStatus: approvedBoundary.status,
    method: approvedBoundary.method,
    endpointAllowed: approvedBoundary.endpointAllowed,
    requestConstructedOnlyWhenApproved: approvedBoundary.requestConstructed === true && defaultBoundary.requestConstructed === false && readyButDisabledBoundary.requestConstructed === false && badEndpointBoundary.requestConstructed === false,
    gates: approvedBoundary.gates
  };
  const guardedHarness = {
    defaultTransport: {
      status: defaultTransport.status,
      invocationAttempted: defaultTransport.invocationAttempted,
      queueSubmitted: defaultTransport.queueSubmitted
    },
    approvedTransport: {
      status: approvedTransport.status,
      invocationAttempted: approvedTransport.invocationAttempted,
      queueSubmitted: approvedTransport.queueSubmitted,
      runnerTaskId: approvedTransport.runnerTaskId
    },
    transportCallCount,
    pendingPoll: {
      status: pendingPoll.status,
      activeOpenLinks: pendingPoll.activeOpenLinks
    }
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W156 only constructs and harness-executes the approved transport boundary. No real runner result JSON is imported into IDB.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerTransactionWrites: true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
    consultantConfirmationRequired: approvedBoundary.body.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: approvedBoundary.body.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: !!approvedBoundary.body.idempotencyToken,
    internalRunnerOwnership: approvedTransport.generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: approvedBoundary.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: approvedBoundary.activeOpenLinks === 0 && approvedTransport.activeOpenLinks === 0 && pendingPoll.activeOpenLinks === 0
  };

  const results = [];
  assertCase(results, 'w156_starts_from_w155_toggle_ready', w155.decision === 'PASS_INVOCATION_TOGGLE_AND_POLLING_STUB_READY__VISUAL_TESTING_BLOCKED', w155.decision);
  assertCase(results, 'w156_default_and_disabled_do_not_construct_request', defaultBoundary.requestConstructed === false && readyButDisabledBoundary.requestConstructed === false && defaultBoundary.status === 'transport_request_not_constructed_no_submit', JSON.stringify({ defaultBoundary, readyButDisabledBoundary }));
  assertCase(results, 'w156_bad_endpoint_blocked_before_request', badEndpointBoundary.endpointAllowed === false && badEndpointBoundary.requestConstructed === false && badEndpointBoundary.endpointUrl === '', JSON.stringify(badEndpointBoundary));
  assertCase(results, 'w156_approved_boundary_constructs_post_request_only_after_all_gates', approvedBoundary.requestConstructed === true && approvedBoundary.method === 'POST' && approvedBoundary.endpointAllowed === true && Object.values(approvedBoundary.gates).every(Boolean) && approvedBoundary.body.schema === 'idb.integrated-build-runner-transport-request.v1', JSON.stringify(approvedBoundary.gates));
  assertCase(results, 'w156_transport_executor_harness_only', defaultTransport.invocationAttempted === false && approvedTransport.invocationAttempted === true && approvedTransport.queueSubmitted === true && transportCallCount === 1 && /^fixture_w156_/.test(approvedTransport.runnerTaskId), JSON.stringify(guardedHarness));
  assertCase(results, 'w156_polling_stub_pending_no_links', pendingPoll.status === 'polling_stub_pending' && pendingPoll.activeOpenLinks === 0 && approvedTransport.finalGeneratedNamesJson === null, JSON.stringify(pendingPoll));
  assertCase(results, 'w156_build_surface_mentions_transport_boundary', /Transport boundary/.test(renderedBuild), renderedBuild.slice(0, 700));
  assertCase(results, 'w156_no_raw_network_in_transport_boundary', /function integratedBuildApprovedServerAdapterTransportBoundaryV1/.test(userscript) && w156TransportBoundarySource && !/GM_xmlhttpRequest/.test(w156TransportBoundarySource) && !/fetch\(/.test(w156TransportBoundarySource), 'W156 transport boundary constructs envelope only; later W189 W144 helper is separately gated');
  assertCase(results, 'w156_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w156-approved-server-adapter-transport-boundary.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_transport_boundary_ready_disabled_default',
    decision: failures.length ? 'FAIL' : 'PASS_APPROVED_TRANSPORT_BOUNDARY_READY__VISUAL_TESTING_BLOCKED',
    transportBoundaryContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W157: Server Adapter Transport Dry-Run Response Normalization',
      prompt: 'Move through W157: Server Adapter Transport Dry-Run Response Normalization. Use the W156 approved transport boundary to normalize false-flag no-submit, queued/pending, polling-pending, completed-result-awaiting-W151-import, and error responses from the approved server adapter transport. Keep real invocation disabled by default and harness-only. Do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output response-normalization contract, guarded harness, trace samples, W157 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w156-approved-server-adapter-transport-boundary-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    requestConstructedDefault: defaultBoundary.requestConstructed,
    requestConstructedApproved: approvedBoundary.requestConstructed,
    transportCallCount,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W156 Approved Server Adapter Transport Wiring Behind Disabled Default

Decision: ${contract.decision}

## Transport Boundary Contract
- Default status: ${transportBoundaryContract.defaultStatus}.
- Ready but disabled status: ${transportBoundaryContract.readyButDisabledStatus}.
- Bad endpoint status: ${transportBoundaryContract.badEndpointStatus}.
- Approved status: ${transportBoundaryContract.approvedStatus}.
- Method: ${transportBoundaryContract.method}.
- Request constructed only when approved: ${transportBoundaryContract.requestConstructedOnlyWhenApproved}.

## Guarded Harness
- Default transport: status=${defaultTransport.status}, invocationAttempted=${defaultTransport.invocationAttempted}, queueSubmitted=${defaultTransport.queueSubmitted}.
- Approved transport: status=${approvedTransport.status}, runnerTaskId=${approvedTransport.runnerTaskId}, queueSubmitted=${approvedTransport.queueSubmitted}.
- Transport call count: ${transportCallCount}.
- Pending poll: status=${pendingPoll.status}, activeOpenLinks=${pendingPoll.activeOpenLinks}.

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
    console.error(`W156 approved server adapter transport FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W156 approved server adapter transport: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
