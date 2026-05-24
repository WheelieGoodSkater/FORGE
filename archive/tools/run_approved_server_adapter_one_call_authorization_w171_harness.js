const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w170Path = path.join(root, 'data', 'w170_approved_server_adapter_sandbox_unlock_packet.json');
const dataPath = path.join(root, 'data', 'w171_approved_server_adapter_one_call_authorization_gate.json');
const tracePath = path.join(root, 'trace_samples', 'w171_approved_server_adapter_one_call_authorization_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w171_approved_server_adapter_one_call_authorization_gate.md');

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

function adapterConfig(overrides) {
  return Object.assign({
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_one_call_authorization_gate'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T23:15:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'One-call authorization gate only. Do not invoke live transport in W171.'
  }, overrides || {});
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
  const w170 = readJson(w170Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const baseOptions = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    runnerTaskId: 'fixture_w171_runner_task_001',
    retryLimit: 2,
    explicitLiveAuthorization: true,
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: true,
    executeLiveCall: false,
    oneSubmitLimit: {
      maxQueueSubmitAttempts: 1,
      duplicateIdempotencyBehavior: 'poll_existing_runner_task',
      secondSubmitBehavior: 'blocked_duplicate_submit'
    },
    pollingLimit: {
      maxPollAttempts: 8,
      pollIntervalMs: 1500,
      timeoutBehavior: 'retry_same_idempotency_until_limit_then_stop'
    }
  };
  const gate = hooks.approvedServerAdapterExplicitSandboxOneCallAuthorizationGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    baseOptions
  );
  const missingPhrase = hooks.approvedServerAdapterExplicitSandboxOneCallAuthorizationGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, { explicitLiveAuthorization: false, operatorAuthorizationPhrase: '' })
  );
  const endpointNotConfirmed = hooks.approvedServerAdapterExplicitSandboxOneCallAuthorizationGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, { endpointConfirmed: false })
  );
  const executeRequestedStillNoInvoke = hooks.approvedServerAdapterExplicitSandboxOneCallAuthorizationGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, { executeLiveCall: true })
  );

  const guardedHarness = {
    startsFromW170: w170.decision === 'PASS_SANDBOX_UNLOCK_PACKET_READY__LIVE_DISABLED__VISUAL_TESTING_BLOCKED',
    authorizationHookReady: typeof hooks.approvedServerAdapterExplicitSandboxOneCallAuthorizationGateV1 === 'function',
    authorizationGateReady: gate.status === 'one_call_authorization_gate_ready_no_submit' && gate.authorizationReady === true,
    requiredPhraseAccepted: gate.operatorAuthorization.explicitLiveAuthorization === true && gate.operatorAuthorization.providedPhrase === 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: gate.operatorAuthorization.endpointConfirmed === true,
    allCoreChecksReady: gate.authorizationChecks.length === 8 && gate.authorizationChecks.every((check) => check.ready === true),
    missingPhraseBlocks: missingPhrase.status === 'one_call_authorization_gate_blocked_no_submit' && missingPhrase.blockedReasons.indexOf('operator_phrase') >= 0,
    endpointMissingConfirmationBlocks: endpointNotConfirmed.status === 'one_call_authorization_gate_blocked_no_submit' && endpointNotConfirmed.blockedReasons.indexOf('endpoint_confirmation') >= 0,
    executeRequestedStillNoInvoke: executeRequestedStillNoInvoke.requestDecision.liveRequestSent === false && executeRequestedStillNoInvoke.requestDecision.queueSubmitted === false,
    oneSubmitRollbackAndW151Ready: gate.oneCallBoundary.maxQueueSubmitAttempts === 1 && gate.rollbackPlan.flagsToDisable.length === 3 && gate.noRegression.w151CompletedResultImportGuardPreserved === true,
    noFinalGeneratedNameMutation: gate.mutationGuard.finalGeneratedNamesUnchanged === true,
    noActiveOpenLinks: gate.mutationGuard.activeOpenLinks === 0,
    traceSamplesReady: gate.traceSamples.length === 8
  };
  const noRegression = {
    noDrawerWrites: gate.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: gate.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: gate.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: gate.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: gate.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: gate.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: gate.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: gate.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: gate.noRegression.w151CompletedResultImportGuardPreserved === true,
    oneSubmitLimit: gate.noRegression.oneSubmitLimit === true,
    noActiveOpenLinksWithoutRealUrls: gate.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: gate.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W171 authorizes readiness for one sandbox call but does not execute it. Visual testing stays blocked until a real runner result returns.'
  };
  const results = [];
  assertCase(results, 'w171_starts_from_w170_unlock_packet', guardedHarness.startsFromW170, w170.decision);
  assertCase(results, 'w171_authorization_hook_ready', guardedHarness.authorizationHookReady && guardedHarness.authorizationGateReady, gate.status);
  assertCase(results, 'w171_phrase_endpoint_and_core_checks_ready', guardedHarness.requiredPhraseAccepted && guardedHarness.endpointConfirmed && guardedHarness.allCoreChecksReady, JSON.stringify(gate.authorizationChecks));
  assertCase(results, 'w171_missing_phrase_and_endpoint_confirmation_block', guardedHarness.missingPhraseBlocks && guardedHarness.endpointMissingConfirmationBlocks, JSON.stringify({ missingPhrase: missingPhrase.blockedReasons, endpoint: endpointNotConfirmed.blockedReasons }));
  assertCase(results, 'w171_execute_requested_still_no_invoke', guardedHarness.executeRequestedStillNoInvoke, JSON.stringify(executeRequestedStillNoInvoke.requestDecision));
  assertCase(results, 'w171_one_submit_rollback_w151_ready', guardedHarness.oneSubmitRollbackAndW151Ready, JSON.stringify({ oneCall: gate.oneCallBoundary, rollback: gate.rollbackPlan }));
  assertCase(results, 'w171_no_names_or_links_mutated', guardedHarness.noFinalGeneratedNameMutation && guardedHarness.noActiveOpenLinks, JSON.stringify(gate.mutationGuard));
  assertCase(results, 'w171_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(gate.traceSamples));
  assertCase(results, 'w171_visual_testing_blocked', gate.visualTestingBlocked === true && visualTestingDecision.visualTestingBlocked === true, visualTestingDecision.reason);
  assertCase(results, 'w171_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w171-approved-server-adapter-one-call-authorization-gate.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_one_call_authorization_gate_ready',
    decision: failures.length ? 'FAIL' : 'PASS_ONE_CALL_AUTHORIZATION_GATE_READY__NO_SUBMIT__VISUAL_TESTING_BLOCKED',
    authorizationGateContract: {
      schema: gate.schema,
      status: gate.status,
      mode: gate.mode,
      authorizationReady: gate.authorizationReady,
      operatorAuthorization: gate.operatorAuthorization,
      authorizationChecks: gate.authorizationChecks,
      oneCallBoundary: gate.oneCallBoundary,
      rollbackPlan: gate.rollbackPlan,
      requestDecision: gate.requestDecision,
      mutationGuard: gate.mutationGuard,
      traceSamples: gate.traceSamples
    },
    blockedCaseSamples: {
      missingPhrase: {
        status: missingPhrase.status,
        blockedReasons: missingPhrase.blockedReasons,
        liveRequestSent: missingPhrase.requestDecision.liveRequestSent
      },
      endpointNotConfirmed: {
        status: endpointNotConfirmed.status,
        blockedReasons: endpointNotConfirmed.blockedReasons,
        liveRequestSent: endpointNotConfirmed.requestDecision.liveRequestSent
      },
      executeRequestedStillNoInvoke: {
        status: executeRequestedStillNoInvoke.status,
        liveRequestSent: executeRequestedStillNoInvoke.requestDecision.liveRequestSent,
        queueSubmitted: executeRequestedStillNoInvoke.requestDecision.queueSubmitted
      }
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W172: Approved Server Adapter Sandbox One-Call Execution Harness',
      prompt: 'Move through W172: Approved Server Adapter Sandbox One-Call Execution Harness. Use the W171 explicit one-call authorization gate to implement the first live-disabled-by-default execution harness that can perform exactly one approved sandbox server adapter call only when the user explicitly authorizes execution in the block. Default must remain no-submit. When not authorized, prove no request is sent. When authorized by harness flag only, submit once, capture runnerTaskId or adapter error, keep final generated names unchanged until W151 completed runner result import, preserve rollback by disabling server flags, and do not request visual testing until a real runner result returns to IDB. Output execution harness contract, guarded harness, trace samples, W172 report, visual testing decision blocked until runner result returns, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w171-approved-server-adapter-one-call-authorization-gate-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    authorizationGateContract: contract.authorizationGateContract,
    blockedCaseSamples: contract.blockedCaseSamples,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W171 Approved Server Adapter Explicit Sandbox One-Call Authorization Gate

Decision: ${contract.decision}

## Authorization Gate Contract
- Status: ${gate.status}.
- Authorization ready: ${gate.authorizationReady}.
- Required phrase: ${gate.operatorAuthorization.requiredPhrase}.
- Provided phrase: ${gate.operatorAuthorization.providedPhrase}.
- Endpoint confirmed: ${gate.operatorAuthorization.endpointConfirmed}.
- Execute live call requested: ${gate.operatorAuthorization.executeLiveCallRequested}.

## Request Decision
- Default no-submit: ${gate.requestDecision.defaultNoSubmit}.
- Live request sent: ${gate.requestDecision.liveRequestSent}.
- Queue submitted: ${gate.requestDecision.queueSubmitted}.
- Can proceed to execution block: ${gate.requestDecision.canProceedToExecutionBlock}.

## One-Call Boundary
- Max queue submit attempts: ${gate.oneCallBoundary.maxQueueSubmitAttempts}.
- Duplicate submit behavior: ${gate.oneCallBoundary.duplicateSubmitBehavior}.
- Poll limit: ${gate.oneCallBoundary.pollLimit}.
- Idempotency token: ${gate.oneCallBoundary.idempotencyToken}.

## Gate Checks
${gate.authorizationChecks.map((item) => `- ${item.ready ? 'READY' : 'BLOCKED'} ${item.id}`).join('\n')}

## Blocked Case Samples
- Missing phrase blocks: ${guardedHarness.missingPhraseBlocks}.
- Endpoint not confirmed blocks: ${guardedHarness.endpointMissingConfirmationBlocks}.
- Execution requested still no invoke: ${guardedHarness.executeRequestedStillNoInvoke}.

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
    console.error(`W171 one-call authorization gate FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W171 one-call authorization gate: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
