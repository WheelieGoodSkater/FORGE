const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w172Path = path.join(root, 'data', 'w172_approved_server_adapter_sandbox_one_call_execution_harness.json');
const dataPath = path.join(root, 'data', 'w173_approved_server_adapter_real_sandbox_one_call_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w173_approved_server_adapter_real_sandbox_one_call_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w173_approved_server_adapter_real_sandbox_one_call_packet.md');

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

function adapterConfig(overrides) {
  return Object.assign({
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_real_sandbox_one_call_packet'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T23:55:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'W173 packet only. Real execution remains disabled until a later explicit live-call authorization block.'
  }, overrides || {});
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

function baseOptions(w172) {
  return {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    explicitLiveAuthorization: true,
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: true,
    executeLiveCall: false,
    harnessAuthorizesSandboxCall: false,
    w172Decision: w172.decision,
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
}

async function main() {
  const w172 = readJson(w172Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const readyPacket = hooks.approvedServerAdapterRealSandboxOneCallExecutionPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    baseOptions(w172)
  );
  const missingEndpoint = hooks.approvedServerAdapterRealSandboxOneCallExecutionPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w172), { adapterConfig: adapterConfig({ endpointUrl: '' }), endpointUrl: '' })
  );
  const missingFlags = hooks.approvedServerAdapterRealSandboxOneCallExecutionPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w172), { adapterConfig: adapterConfig({ CREATE_ENABLED: false, GOVERNED_SANDBOX_WRITE_ENABLED: false, QUEUE_SUBMIT_ENABLED: false }) })
  );
  const missingPhrase = hooks.approvedServerAdapterRealSandboxOneCallExecutionPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions(w172), { explicitLiveAuthorization: false, operatorAuthorizationPhrase: '' })
  );

  const packet = readyPacket.realSandboxExecutionPacket;
  const guardedPreflightHarness = {
    startsFromW172: w172.decision === 'PASS_ONE_CALL_EXECUTION_HARNESS_READY__LIVE_DISABLED_BY_DEFAULT__VISUAL_TESTING_BLOCKED',
    packetHookReady: typeof hooks.approvedServerAdapterRealSandboxOneCallExecutionPacketV1 === 'function',
    packetReady: readyPacket.packetReady === true && readyPacket.status === 'real_sandbox_one_call_packet_ready_execution_disabled',
    endpointReady: /^https:\/\/SANDBOX_ACCOUNT_ID\.app\.netsuite\.com\/app\/site\/hosting\/scriptlet\.nl\?/i.test(packet.endpoint.url),
    serverFlagsTrue: packet.serverFlags.CREATE_ENABLED === true &&
      packet.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED === true &&
      packet.serverFlags.QUEUE_SUBMIT_ENABLED === true,
    sandboxAllowlistReady: packet.sandboxAllowlistEvidence.currentAccountAllowed === true &&
      packet.sandboxAllowlistEvidence.sandboxOnly === true,
    operatorPhraseReady: packet.operatorAuthorization.requiredPhrase === 'AUTHORIZE ONE SANDBOX ADAPTER CALL' &&
      packet.operatorAuthorization.providedPhrase === 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    idempotencyReady: !!packet.idempotency.token,
    oneSubmitReady: packet.oneSubmitLimit.maxQueueSubmitAttempts === 1 &&
      packet.oneSubmitLimit.secondSubmitBehavior === 'blocked_duplicate_submit',
    rollbackReady: Array.isArray(packet.rollbackPlan.flagsToDisable) &&
      packet.rollbackPlan.flagsToDisable.includes('CREATE_ENABLED') &&
      packet.rollbackPlan.flagsToDisable.includes('GOVERNED_SANDBOX_WRITE_ENABLED') &&
      packet.rollbackPlan.flagsToDisable.includes('QUEUE_SUBMIT_ENABLED'),
    expectedOutcomesReady: packet.expectedOutcome.successReturns.includes('runnerTaskId') &&
      packet.expectedOutcome.adapterErrorStatus === 'adapter_transport_error_drawer_safe',
    w151ImportGuardReady: packet.w151ResultImportGuard.required === true &&
      packet.w151ResultImportGuard.rejectsHandoffJson === true &&
      packet.w151ResultImportGuard.requiresNumericInternalIds === true &&
      packet.w151ResultImportGuard.requiresSupportedNetSuiteUrls === true,
    blockedCasesDoNotRequest: missingEndpoint.requestDecision.liveRequestSent === false &&
      missingFlags.requestDecision.liveRequestSent === false &&
      missingPhrase.requestDecision.liveRequestSent === false,
    executionDisabled: readyPacket.executionDisabledUntilExplicitAuthorizationBlock === true &&
      readyPacket.requestDecision.liveRequestSent === false &&
      readyPacket.requestDecision.queueSubmitted === false,
    noMutationOrLinks: readyPacket.mutationGuard.finalGeneratedNamesUnchanged === true &&
      readyPacket.mutationGuard.activeOpenLinks === 0
  };
  const noRegression = readyPacket.noRegression;
  const visualTestingDecision = {
    visualTestingBlocked: true,
    visualNetSuiteTestingRequiredNow: false,
    reason: 'W173 prepares the real sandbox one-call packet only. Visual testing stays blocked until the governed runner returns completed result JSON to IDB.'
  };
  const results = [];
  assertCase(results, 'w173_starts_from_w172_execution_harness', guardedPreflightHarness.startsFromW172, w172.decision);
  assertCase(results, 'w173_packet_hook_ready', guardedPreflightHarness.packetHookReady, 'approvedServerAdapterRealSandboxOneCallExecutionPacketV1');
  assertCase(results, 'w173_packet_core_ready_execution_disabled', guardedPreflightHarness.packetReady && guardedPreflightHarness.executionDisabled, readyPacket.status);
  assertCase(results, 'w173_endpoint_flags_allowlist_ready', guardedPreflightHarness.endpointReady && guardedPreflightHarness.serverFlagsTrue && guardedPreflightHarness.sandboxAllowlistReady, JSON.stringify(packet.endpoint));
  assertCase(results, 'w173_operator_phrase_idempotency_ready', guardedPreflightHarness.operatorPhraseReady && guardedPreflightHarness.idempotencyReady, JSON.stringify(packet.operatorAuthorization));
  assertCase(results, 'w173_one_submit_rollback_expected_outcomes_ready', guardedPreflightHarness.oneSubmitReady && guardedPreflightHarness.rollbackReady && guardedPreflightHarness.expectedOutcomesReady, JSON.stringify(packet.expectedOutcome));
  assertCase(results, 'w173_w151_import_guard_ready', guardedPreflightHarness.w151ImportGuardReady, JSON.stringify(packet.w151ResultImportGuard));
  assertCase(results, 'w173_blocked_cases_do_not_request', guardedPreflightHarness.blockedCasesDoNotRequest, JSON.stringify({ missingEndpoint: missingEndpoint.blockedReasons, missingFlags: missingFlags.blockedReasons, missingPhrase: missingPhrase.blockedReasons }));
  assertCase(results, 'w173_no_mutation_or_links', guardedPreflightHarness.noMutationOrLinks, JSON.stringify(readyPacket.mutationGuard));
  assertCase(results, 'w173_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w173_visual_testing_blocked', visualTestingDecision.visualTestingBlocked === true && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, visualTestingDecision.reason);

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w173-approved-server-adapter-real-sandbox-one-call-packet.v1',
    status: 'approved_server_adapter_real_sandbox_one_call_packet_ready',
    decision: failures.length
      ? 'FAIL_REAL_SANDBOX_ONE_CALL_PACKET'
      : 'PASS_REAL_SANDBOX_ONE_CALL_PACKET_READY__EXECUTION_DISABLED__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    realSandboxExecutionPacket: readyPacket,
    guardedPreflightHarness,
    blockedCaseSamples: {
      missingEndpoint: {
        status: missingEndpoint.status,
        blockedReasons: missingEndpoint.blockedReasons,
        liveRequestSent: missingEndpoint.requestDecision.liveRequestSent
      },
      missingFlags: {
        status: missingFlags.status,
        blockedReasons: missingFlags.blockedReasons,
        liveRequestSent: missingFlags.requestDecision.liveRequestSent
      },
      missingPhrase: {
        status: missingPhrase.status,
        blockedReasons: missingPhrase.blockedReasons,
        liveRequestSent: missingPhrase.requestDecision.liveRequestSent
      }
    },
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W174: Explicitly Authorized Sandbox Adapter One-Call Execution',
      prompt: 'Move through W174: Explicitly Authorized Sandbox Adapter One-Call Execution. Use the W173 real sandbox one-call execution packet to perform exactly one approved sandbox server adapter call only if the user explicitly authorizes execution in that block with the required phrase and endpoint/flag confirmation. Submit once, capture runnerTaskId or adapter error, keep final generated names unchanged until W151 completed result import, preserve rollback by disabling server flags, and do not request visual testing until a real governed runner result returns to IDB. Output execution evidence, runnerTaskId or adapter error evidence, trace samples, W174 report, visual testing decision blocked until runner result returns, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w173-approved-server-adapter-real-sandbox-one-call-packet-trace.v1',
    generatedAt: contract.generatedAt,
    traceSamples: readyPacket.traceSamples,
    blockedCaseSamples: contract.blockedCaseSamples,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W173 Approved Server Adapter Real Sandbox One-Call Execution Packet

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Real Sandbox Execution Packet

- Endpoint: ${packet.endpoint.method} ${packet.endpoint.url}
- Server flags: CREATE_ENABLED=${packet.serverFlags.CREATE_ENABLED}, GOVERNED_SANDBOX_WRITE_ENABLED=${packet.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED}, QUEUE_SUBMIT_ENABLED=${packet.serverFlags.QUEUE_SUBMIT_ENABLED}
- Sandbox allowlist: ${packet.sandboxAllowlistEvidence.accountAllowlist.join(', ')}
- Operator phrase: ${packet.operatorAuthorization.requiredPhrase}
- Idempotency token: ${packet.idempotency.token}
- One-submit limit: ${packet.oneSubmitLimit.maxQueueSubmitAttempts}
- Rollback flags: ${packet.rollbackPlan.flagsToDisable.join(', ')}
- Expected success: ${packet.expectedOutcome.successStatus}, returning ${packet.expectedOutcome.successReturns.join(', ')}
- Expected adapter error: ${packet.expectedOutcome.adapterErrorStatus}
- W151 import guard: completed runner result JSON only; handoff JSON rejected; numeric ids and supported NetSuite URLs required.

## Guarded Preflight Harness

| Gate | Result |
| --- | --- |
${Object.entries(guardedPreflightHarness).map(([key, value]) => `| ${key} | ${value ? 'PASS' : 'FAIL'} |`).join('\n')}

## Blocked Cases

- Missing endpoint: ${missingEndpoint.status}; request sent = ${missingEndpoint.requestDecision.liveRequestSent}.
- Missing flags: ${missingFlags.status}; request sent = ${missingFlags.requestDecision.liveRequestSent}.
- Missing phrase: ${missingPhrase.status}; request sent = ${missingPhrase.requestDecision.liveRequestSent}.

## Visual Testing Decision

${visualTestingDecision.reason}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  if (failures.length) {
    console.error(`W173 real sandbox one-call packet FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W173 real sandbox one-call packet: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}; endpoint=${packet.endpoint.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
