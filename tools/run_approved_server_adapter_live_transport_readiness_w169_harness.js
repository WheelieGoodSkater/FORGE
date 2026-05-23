const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w168Path = path.join(root, 'data', 'w168_approved_server_adapter_live_disabled_retry_recovery.json');
const dataPath = path.join(root, 'data', 'w169_approved_server_adapter_live_transport_readiness_gate.json');
const tracePath = path.join(root, 'trace_samples', 'w169_approved_server_adapter_live_transport_readiness_gate_trace.json');
const reportPath = path.join(root, 'reports', 'w169_approved_server_adapter_live_transport_readiness_gate.md');

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

function adapterConfig(overrides) {
  return Object.assign({
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_live_transport_readiness_gate'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T22:30:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Readiness gate only. Do not invoke live transport.'
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
  const w168 = readJson(w168Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const baseOptions = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    runnerTaskId: 'fixture_w169_runner_task_001',
    retryLimit: 2,
    rollbackPlan: {
      owner: 'server_deployment_flags',
      action: 'disable_server_flags_before_any_retry',
      flagsToDisable: [
        'CREATE_ENABLED',
        'GOVERNED_SANDBOX_WRITE_ENABLED',
        'QUEUE_SUBMIT_ENABLED'
      ]
    }
  };

  const gate = hooks.approvedServerAdapterLiveTransportReadinessGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    baseOptions
  );
  const blockedMissingEndpoint = hooks.approvedServerAdapterLiveTransportReadinessGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, {
      adapterConfig: adapterConfig({ endpointUrl: '' })
    })
  );
  const blockedMissingFlags = hooks.approvedServerAdapterLiveTransportReadinessGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, {
      adapterConfig: adapterConfig({
        CREATE_ENABLED: false,
        GOVERNED_SANDBOX_WRITE_ENABLED: false,
        QUEUE_SUBMIT_ENABLED: false
      })
    })
  );
  const blockedMissingOperator = hooks.approvedServerAdapterLiveTransportReadinessGateV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, {
      operatorEvidence: operatorEvidence({
        reviewDecision: 'operator_review_not_started',
        typeToConfirm: ''
      })
    })
  );

  const guardedHarness = {
    startsFromW168: w168.decision === 'PASS_RETRY_RECOVERY_READY__VISUAL_TESTING_BLOCKED',
    readinessHookReady: typeof hooks.approvedServerAdapterLiveTransportReadinessGateV1 === 'function',
    allReadyGatesPresent: gate.gateChecks.length === 8 && gate.gateChecks.every((item) => item.ready === true),
    readyWithoutRequest: gate.readyForLiveCall === true &&
      gate.requestDecision.liveRequestSent === false &&
      gate.requestDecision.requestBodyConstructedForSend === false,
    missingEndpointBlocks: blockedMissingEndpoint.readyForLiveCall === false &&
      blockedMissingEndpoint.blockedReasons.indexOf('approved_endpoint_url') >= 0,
    missingFlagsBlock: blockedMissingFlags.readyForLiveCall === false &&
      blockedMissingFlags.blockedReasons.indexOf('deployment_flags') >= 0,
    missingOperatorBlocks: blockedMissingOperator.readyForLiveCall === false &&
      blockedMissingOperator.blockedReasons.indexOf('operator_approval_evidence') >= 0,
    noFinalGeneratedNameMutation: gate.mutationGuard.finalGeneratedNamesUnchanged === true,
    noActiveOpenLinks: gate.mutationGuard.activeOpenLinks === 0,
    traceSamplesReady: gate.traceSamples.length === 8,
    rollbackPlanReady: gate.rollbackPlan.flagsToDisable.length === 3,
    w151ImportGuardReady: gate.gateChecks.some((item) => item.id === 'w151_result_import_guard' && item.ready === true)
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
    noActiveOpenLinksWithoutRealUrls: gate.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: gate.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W169 is a go/no-go readiness gate only. It does not send a live request, write records, import final names, or create Open links.'
  };
  const results = [];
  assertCase(results, 'w169_starts_from_w168_retry_recovery', guardedHarness.startsFromW168, w168.decision);
  assertCase(results, 'w169_readiness_hook_ready', guardedHarness.readinessHookReady && gate.status === 'live_transport_go_gate_ready_no_request_sent', gate.status);
  assertCase(results, 'w169_all_ready_gates_present', guardedHarness.allReadyGatesPresent, JSON.stringify(gate.gateChecks));
  assertCase(results, 'w169_ready_without_request', guardedHarness.readyWithoutRequest, JSON.stringify(gate.requestDecision));
  assertCase(results, 'w169_blocked_cases_prove_no_request', guardedHarness.missingEndpointBlocks && guardedHarness.missingFlagsBlock && guardedHarness.missingOperatorBlocks, JSON.stringify({ endpoint: blockedMissingEndpoint.blockedReasons, flags: blockedMissingFlags.blockedReasons, operator: blockedMissingOperator.blockedReasons }));
  assertCase(results, 'w169_no_names_or_links_mutated', guardedHarness.noFinalGeneratedNameMutation && guardedHarness.noActiveOpenLinks, JSON.stringify(gate.mutationGuard));
  assertCase(results, 'w169_rollback_and_w151_import_guard_ready', guardedHarness.rollbackPlanReady && guardedHarness.w151ImportGuardReady, JSON.stringify({ rollback: gate.rollbackPlan, guards: gate.gateChecks }));
  assertCase(results, 'w169_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(gate.traceSamples));
  assertCase(results, 'w169_visual_testing_blocked', gate.visualTestingBlocked === true && visualTestingDecision.visualTestingBlocked === true, visualTestingDecision.reason);
  assertCase(results, 'w169_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w169-approved-server-adapter-live-transport-readiness-gate.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_live_transport_readiness_gate_ready',
    decision: failures.length ? 'FAIL' : 'PASS_LIVE_TRANSPORT_READINESS_GATE_READY__NO_REQUEST_SENT__VISUAL_TESTING_BLOCKED',
    liveTransportReadinessGate: {
      schema: gate.schema,
      status: gate.status,
      mode: gate.mode,
      readyForLiveCall: gate.readyForLiveCall,
      blockedReasons: gate.blockedReasons,
      endpointUrl: gate.endpointUrl,
      gateChecks: gate.gateChecks,
      requestDecision: gate.requestDecision,
      rollbackPlan: gate.rollbackPlan,
      mutationGuard: gate.mutationGuard,
      traceSamples: gate.traceSamples
    },
    blockedCaseSamples: {
      missingEndpoint: {
        status: blockedMissingEndpoint.status,
        blockedReasons: blockedMissingEndpoint.blockedReasons,
        liveRequestSent: blockedMissingEndpoint.requestDecision.liveRequestSent
      },
      missingFlags: {
        status: blockedMissingFlags.status,
        blockedReasons: blockedMissingFlags.blockedReasons,
        liveRequestSent: blockedMissingFlags.requestDecision.liveRequestSent
      },
      missingOperatorApproval: {
        status: blockedMissingOperator.status,
        blockedReasons: blockedMissingOperator.blockedReasons,
        liveRequestSent: blockedMissingOperator.requestDecision.liveRequestSent
      }
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W170: Approved Server Adapter Sandbox Live Transport Operator Unlock Packet',
      prompt: 'Move through W170: Approved Server Adapter Sandbox Live Transport Operator Unlock Packet. Use the W169 live transport readiness gate to prepare the exact sandbox-only operator unlock packet for the first approved server adapter call: endpoint URL, deployment flag values, sandbox allowlist evidence, operator approval evidence, idempotency token, retry/rollback plan, one-submit limit, polling limit, and W151 result import guard. Keep real invocation disabled unless the user explicitly authorizes the live sandbox call in that block. Do not request visual testing. Output operator unlock packet, guarded harness, trace samples, W170 report, visual testing decision blocked until a real runner result returns, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w169-approved-server-adapter-live-transport-readiness-gate-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    readyForLiveCall: gate.readyForLiveCall,
    gateChecks: gate.gateChecks,
    requestDecision: gate.requestDecision,
    blockedCaseSamples: contract.blockedCaseSamples,
    mutationGuard: gate.mutationGuard,
    traceSamples: gate.traceSamples,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W169 Approved Server Adapter Live Transport Readiness Gate

Decision: ${contract.decision}

## Live Transport Readiness Gate
- Mode: ${gate.mode}.
- Ready for live call after explicit unlock: ${gate.readyForLiveCall}.
- Live request sent: ${gate.requestDecision.liveRequestSent}.
- Request body constructed for send: ${gate.requestDecision.requestBodyConstructedForSend}.
- Endpoint URL: ${gate.endpointUrl}.

## Gate Checks
${gate.gateChecks.map((item) => `- ${item.ready ? 'READY' : 'BLOCKED'} ${item.id}: ${item.label}`).join('\n')}

## Blocked Case Samples
- Missing endpoint blocks: ${guardedHarness.missingEndpointBlocks}.
- Missing server flags block: ${guardedHarness.missingFlagsBlock}.
- Missing operator approval blocks: ${guardedHarness.missingOperatorBlocks}.

## Rollback Plan
- Owner: ${gate.rollbackPlan.owner}.
- Action: ${gate.rollbackPlan.action}.
- Flags to disable: ${gate.rollbackPlan.flagsToDisable.join(', ')}.

## Mutation And Link Guard
- Final generated names unchanged: ${gate.mutationGuard.finalGeneratedNamesUnchanged}.
- Active Open links: ${gate.mutationGuard.activeOpenLinks}.
- Writes attempted: ${gate.mutationGuard.writesAttempted}.

## Trace Samples
${gate.traceSamples.map((item) => `- ${item.event}: ready=${item.ready}; liveRequestSent=${item.liveRequestSent}; activeOpenLinks=${item.activeOpenLinks}`).join('\n')}

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
    console.error(`W169 approved server adapter live transport readiness gate FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W169 approved server adapter live transport readiness gate: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
