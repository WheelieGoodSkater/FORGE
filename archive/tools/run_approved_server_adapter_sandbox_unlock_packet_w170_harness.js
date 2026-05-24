const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w169Path = path.join(root, 'data', 'w169_approved_server_adapter_live_transport_readiness_gate.json');
const dataPath = path.join(root, 'data', 'w170_approved_server_adapter_sandbox_unlock_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w170_approved_server_adapter_sandbox_unlock_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w170_approved_server_adapter_sandbox_unlock_packet.md');

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
    mode: 'approved_server_adapter_sandbox_unlock_packet'
  }, overrides || {});
}

function operatorEvidence(overrides) {
  return Object.assign({
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T23:00:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Unlock packet only. Do not invoke live transport in W170.'
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
  const w169 = readJson(w169Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const baseOptions = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    runnerTaskId: 'fixture_w170_runner_task_001',
    retryLimit: 2,
    operatorAuthorizationPhrase: '',
    explicitLiveAuthorization: false,
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
  const unlock = hooks.approvedServerAdapterSandboxLiveTransportOperatorUnlockPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    baseOptions
  );
  const explicitButStillNoInvoke = hooks.approvedServerAdapterSandboxLiveTransportOperatorUnlockPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, {
      explicitLiveAuthorization: true,
      operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL'
    })
  );
  const missingApproval = hooks.approvedServerAdapterSandboxLiveTransportOperatorUnlockPacketV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    Object.assign({}, baseOptions, {
      operatorEvidence: operatorEvidence({ reviewDecision: 'operator_review_not_started', typeToConfirm: '' })
    })
  );

  const guardedHarness = {
    startsFromW169: w169.decision === 'PASS_LIVE_TRANSPORT_READINESS_GATE_READY__NO_REQUEST_SENT__VISUAL_TESTING_BLOCKED',
    unlockHookReady: typeof hooks.approvedServerAdapterSandboxLiveTransportOperatorUnlockPacketV1 === 'function',
    unlockPacketReady: unlock.status === 'sandbox_operator_unlock_packet_ready_live_disabled' &&
      unlock.readyForExplicitAuthorization === true,
    containsEndpointAndFlags: /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/site\/hosting\/scriptlet\.nl\?/i.test(unlock.unlockPacket.endpointUrl) &&
      unlock.unlockPacket.deploymentFlags.CREATE_ENABLED === true &&
      unlock.unlockPacket.deploymentFlags.GOVERNED_SANDBOX_WRITE_ENABLED === true &&
      unlock.unlockPacket.deploymentFlags.QUEUE_SUBMIT_ENABLED === true,
    containsAllowlistOperatorAndIdempotency: unlock.unlockPacket.sandboxAllowlistEvidence.currentAccountAllowed === true &&
      unlock.unlockPacket.operatorApprovalEvidence.reviewDecision === 'operator_approved_queue_submit' &&
      !!unlock.unlockPacket.idempotencyToken,
    oneSubmitAndPollingLimitsReady: unlock.unlockPacket.oneSubmitLimit.maxQueueSubmitAttempts === 1 &&
      unlock.unlockPacket.pollingLimit.maxPollAttempts === 8,
    rollbackAndW151Ready: unlock.unlockPacket.retryRollbackPlan.rollback.flagsToDisable.length === 3 &&
      unlock.unlockPacket.w151ResultImportGuard.rejectsHandoffJson === true,
    missingApprovalBlocks: missingApproval.status === 'sandbox_operator_unlock_packet_blocked' &&
      missingApproval.packetChecks.some((check) => check.id === 'operator_approval_ready' && check.ready === false),
    explicitAuthorizationStillNoInvoke: explicitButStillNoInvoke.explicitLiveAuthorization === true &&
      explicitButStillNoInvoke.requestDecision.liveRequestSent === false &&
      explicitButStillNoInvoke.requestDecision.queueSubmitted === false,
    noFinalGeneratedNameMutation: unlock.mutationGuard.finalGeneratedNamesUnchanged === true,
    noActiveOpenLinks: unlock.mutationGuard.activeOpenLinks === 0,
    traceSamplesReady: unlock.traceSamples.length === 10
  };
  const noRegression = {
    noDrawerWrites: unlock.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: unlock.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: unlock.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: unlock.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: unlock.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: unlock.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: unlock.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: unlock.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: unlock.noRegression.w151CompletedResultImportGuardPreserved === true,
    oneSubmitLimit: unlock.noRegression.oneSubmitLimit === true,
    noActiveOpenLinksWithoutRealUrls: unlock.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: unlock.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W170 prepares the sandbox operator unlock packet only. Visual testing stays blocked until a real runner result returns to IDB.'
  };
  const results = [];
  assertCase(results, 'w170_starts_from_w169_readiness_gate', guardedHarness.startsFromW169, w169.decision);
  assertCase(results, 'w170_unlock_hook_ready', guardedHarness.unlockHookReady && guardedHarness.unlockPacketReady, unlock.status);
  assertCase(results, 'w170_endpoint_flags_allowlist_operator_idempotency_ready', guardedHarness.containsEndpointAndFlags && guardedHarness.containsAllowlistOperatorAndIdempotency, JSON.stringify(unlock.unlockPacket));
  assertCase(results, 'w170_one_submit_polling_rollback_w151_ready', guardedHarness.oneSubmitAndPollingLimitsReady && guardedHarness.rollbackAndW151Ready, JSON.stringify({ oneSubmit: unlock.unlockPacket.oneSubmitLimit, polling: unlock.unlockPacket.pollingLimit, rollback: unlock.unlockPacket.retryRollbackPlan, w151: unlock.unlockPacket.w151ResultImportGuard }));
  assertCase(results, 'w170_missing_operator_approval_blocks', guardedHarness.missingApprovalBlocks, JSON.stringify(missingApproval.packetChecks));
  assertCase(results, 'w170_explicit_authorization_still_no_invoke', guardedHarness.explicitAuthorizationStillNoInvoke, JSON.stringify(explicitButStillNoInvoke.requestDecision));
  assertCase(results, 'w170_no_names_or_links_mutated', guardedHarness.noFinalGeneratedNameMutation && guardedHarness.noActiveOpenLinks, JSON.stringify(unlock.mutationGuard));
  assertCase(results, 'w170_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(unlock.traceSamples));
  assertCase(results, 'w170_visual_testing_blocked', unlock.visualTestingBlocked === true && visualTestingDecision.visualTestingBlocked === true, visualTestingDecision.reason);
  assertCase(results, 'w170_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w170-approved-server-adapter-sandbox-unlock-packet.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_sandbox_unlock_packet_ready',
    decision: failures.length ? 'FAIL' : 'PASS_SANDBOX_UNLOCK_PACKET_READY__LIVE_DISABLED__VISUAL_TESTING_BLOCKED',
    operatorUnlockPacket: unlock.unlockPacket,
    guardedHarness,
    blockedCaseSamples: {
      missingOperatorApproval: {
        status: missingApproval.status,
        packetChecks: missingApproval.packetChecks,
        liveRequestSent: missingApproval.requestDecision.liveRequestSent
      },
      explicitAuthorizationStillNoInvoke: {
        status: explicitButStillNoInvoke.status,
        explicitLiveAuthorization: explicitButStillNoInvoke.explicitLiveAuthorization,
        liveRequestSent: explicitButStillNoInvoke.requestDecision.liveRequestSent,
        queueSubmitted: explicitButStillNoInvoke.requestDecision.queueSubmitted
      }
    },
    requestDecision: unlock.requestDecision,
    mutationGuard: unlock.mutationGuard,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W171: Approved Server Adapter Explicit Sandbox One-Call Authorization Gate',
      prompt: 'Move through W171: Approved Server Adapter Explicit Sandbox One-Call Authorization Gate. Use the W170 sandbox operator unlock packet to add the final explicit authorization gate for one sandbox approved server adapter call, requiring the operator phrase AUTHORIZE ONE SANDBOX ADAPTER CALL, endpoint confirmation, server flags true, sandbox allowlist, idempotency token, one-submit limit, rollback flags, and W151 import guard. Keep the default path no-submit and do not perform the live call unless the user explicitly authorizes execution in that block. Do not request visual testing. Output authorization gate contract, guarded harness, trace samples, W171 report, visual testing decision blocked until runner result returns, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w170-approved-server-adapter-sandbox-unlock-packet-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    operatorUnlockPacket: unlock.unlockPacket,
    requestDecision: unlock.requestDecision,
    mutationGuard: unlock.mutationGuard,
    traceSamples: unlock.traceSamples,
    blockedCaseSamples: contract.blockedCaseSamples,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W170 Approved Server Adapter Sandbox Live Transport Operator Unlock Packet

Decision: ${contract.decision}

## Operator Unlock Packet
- Endpoint URL: ${unlock.unlockPacket.endpointUrl}.
- CREATE_ENABLED: ${unlock.unlockPacket.deploymentFlags.CREATE_ENABLED}.
- GOVERNED_SANDBOX_WRITE_ENABLED: ${unlock.unlockPacket.deploymentFlags.GOVERNED_SANDBOX_WRITE_ENABLED}.
- QUEUE_SUBMIT_ENABLED: ${unlock.unlockPacket.deploymentFlags.QUEUE_SUBMIT_ENABLED}.
- Sandbox allowlist: ${unlock.unlockPacket.sandboxAllowlistEvidence.accountAllowlist.join(', ')}.
- Operator decision: ${unlock.unlockPacket.operatorApprovalEvidence.reviewDecision}.
- Idempotency token: ${unlock.unlockPacket.idempotencyToken}.
- One-submit max attempts: ${unlock.unlockPacket.oneSubmitLimit.maxQueueSubmitAttempts}.
- Polling max attempts: ${unlock.unlockPacket.pollingLimit.maxPollAttempts}.
- Poll interval ms: ${unlock.unlockPacket.pollingLimit.pollIntervalMs}.

## Retry And Rollback
- Timeout retry: ${unlock.unlockPacket.retryRollbackPlan.timeoutRetry}.
- Duplicate idempotency: ${unlock.unlockPacket.retryRollbackPlan.duplicateIdempotency}.
- Adapter error: ${unlock.unlockPacket.retryRollbackPlan.adapterError}.
- Rollback flags: ${unlock.unlockPacket.retryRollbackPlan.rollback.flagsToDisable.join(', ')}.

## W151 Import Guard
- Accepts only completed runner result JSON: ${unlock.unlockPacket.w151ResultImportGuard.acceptsOnlyCompletedRunnerResultJson}.
- Rejects handoff JSON: ${unlock.unlockPacket.w151ResultImportGuard.rejectsHandoffJson}.
- Requires numeric internal ids: ${unlock.unlockPacket.w151ResultImportGuard.requiresNumericInternalIds}.
- Requires supported NetSuite URLs: ${unlock.unlockPacket.w151ResultImportGuard.requiresSupportedNetSuiteUrls}.
- Active Open links before import: ${unlock.unlockPacket.w151ResultImportGuard.activeOpenLinksBeforeImport}.

## Invocation Decision
- Live request sent: ${unlock.requestDecision.liveRequestSent}.
- Transport invoked: ${unlock.requestDecision.transportInvoked}.
- Queue submitted: ${unlock.requestDecision.queueSubmitted}.
- Explicit authorization present: ${unlock.explicitLiveAuthorization}.

## Trace Samples
${unlock.traceSamples.map((item) => `- ${item.event}: ready=${item.ready}; liveRequestSent=${item.liveRequestSent}; queueSubmitted=${item.queueSubmitted}; activeOpenLinks=${item.activeOpenLinks}`).join('\n')}

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
    console.error(`W170 sandbox unlock packet FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W170 sandbox unlock packet: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
