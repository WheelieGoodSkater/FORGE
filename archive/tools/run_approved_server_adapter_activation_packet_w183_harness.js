const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w183_approved_server_adapter_activation_packet.json');
const tracePath = path.join(root, 'trace_samples', 'w183_approved_server_adapter_activation_packet_trace.json');
const reportPath = path.join(root, 'reports', 'w183_approved_server_adapter_activation_packet.md');

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

function fallbackState() {
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
      websiteEvidence: '',
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

function buildContext(hooks, uploadedTrace) {
  const state = uploadedTrace && uploadedTrace.state ? uploadedTrace.state : fallbackState();
  state.dccFinalNamingResult = null;
  state.integratedBuildRunnerResult = null;
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext || fallbackState().pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  if (!state.acceptedPacket) state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function activationOptions(handoffPacket) {
  return {
    traceExport: fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null,
    handoffPacket,
    endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_governed_runner_adapter&deploy=customdeploy_idb_governed_runner_adapter',
    adapterConfig: {
      endpointUrl: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/site/hosting/scriptlet.nl?script=customscript_idb_governed_runner_adapter&deploy=customdeploy_idb_governed_runner_adapter',
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
      adapterApproved: true,
      mode: 'approved_server_adapter_only'
    },
    currentSandboxAccount: 'SANDBOX_ACCOUNT_ID',
    operatorEvidence: {
      operatorName: 'Operator User',
      reviewedAt: '2026-05-17T10:52:20-04:00',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      confirmedSandboxAccount: true,
      confirmedNoSubmit: true,
      notes: 'W183 activation packet only. No live request is sent in this harness.'
    },
    idempotencyToken: 'idb-w183-ariat-international-one-call-001',
    oneSubmitLimit: {
      maxQueueSubmitAttempts: 1,
      duplicateIdempotencyBehavior: 'poll_existing_runner_task',
      secondSubmitBehavior: 'blocked_duplicate_submit'
    },
    rollbackPlan: {
      owner: 'server_deployment_flags',
      action: 'disable_server_flags_before_retry_or_stop',
      flagsToDisable: [
        'CREATE_ENABLED',
        'GOVERNED_SANDBOX_WRITE_ENABLED',
        'QUEUE_SUBMIT_ENABLED'
      ]
    },
    pollingHandoff: {
      firstResponse: 'runnerTaskId_or_adapter_error',
      runnerTaskIdSource: 'approved_server_adapter_response',
      pendingStatus: 'pending_runner_completion',
      nextControlAfterRunnerTaskId: 'check_runner_result',
      completedResultGate: 'W151_completed_runner_result_import_guard',
      importMutationPolicy: 'do_not_mutate_final_names_until_w151_valid_import',
      expectedFirstResponseDoesNotContainRecordUrls: true
    }
  };
}

function main() {
  const hooks = loadHooks();
  const uploadedTrace = fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null;
  const uploadedHandoff = fs.existsSync(uploadedHandoffPath) ? readJson(uploadedHandoffPath) : null;
  const context = buildContext(hooks, uploadedTrace);
  const handoffPacket = uploadedHandoff || hooks.dccRunnerHandoffPacketV1(context.state, context.lane, context.page, context.recommendation);
  const blockedPacket = hooks.approvedServerAdapterActivationPacketAndOneCallReadinessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      traceExport: uploadedTrace,
      handoffPacket,
      endpointUrl: '',
      adapterConfig: {
        endpointUrl: '',
        CREATE_ENABLED: false,
        GOVERNED_SANDBOX_WRITE_ENABLED: false,
        QUEUE_SUBMIT_ENABLED: false,
        sandboxAccountAllowlist: [],
        adapterApproved: false
      },
      operatorEvidence: {},
      idempotencyToken: '',
      oneSubmitLimit: {
        maxQueueSubmitAttempts: 1,
        duplicateIdempotencyBehavior: 'poll_existing_runner_task',
        secondSubmitBehavior: 'blocked_duplicate_submit'
      }
    }
  );
  const readyPacket = hooks.approvedServerAdapterActivationPacketAndOneCallReadinessV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    activationOptions(handoffPacket)
  );
  const finalNaming = hooks.dccFinalNamingResultV1(context.state.dccFinalNamingResult, context.state, context.lane, context.page, context.recommendation);
  const pollSurface = hooks.buildReturnPollRefreshControlSurfaceV1(context.state, context.lane, context.page, context.recommendation, {
    adapterResult: context.state.integratedBuildRunnerResult,
    handoffOnly: true,
    handoffPacketSchema: handoffPacket.schema
  });

  const activationPacket = readyPacket.activationPacket;
  const guardedHarness = {
    blockedWithoutPrereqsNoRequest: blockedPacket.activationReady === false &&
      blockedPacket.requestDecision.liveRequestSent === false &&
      blockedPacket.requestDecision.queueSubmitted === false,
    readyOnlyWithAllActivationPrereqs: readyPacket.activationReady === true &&
      readyPacket.activationChecks.every((check) => check.ready === true),
    endpointConfigured: /^https:\/\/SANDBOX_ACCOUNT_ID\.app\.netsuite\.com\/app\/site\/hosting\/scriptlet\.nl\?/i.test(activationPacket.endpoint.url),
    serverFlagsConfirmed: activationPacket.serverFlags.CREATE_ENABLED === true &&
      activationPacket.serverFlags.GOVERNED_SANDBOX_WRITE_ENABLED === true &&
      activationPacket.serverFlags.QUEUE_SUBMIT_ENABLED === true,
    sandboxAllowlistConfirmed: activationPacket.sandboxAllowlistEvidence.currentAccountAllowed === true &&
      activationPacket.sandboxAllowlistEvidence.sandboxOnly === true,
    operatorApprovalCaptured: activationPacket.operatorGate.reviewDecision === 'operator_approved_queue_submit' &&
      activationPacket.operatorGate.typeToConfirm === 'QUEUE GOVERNED SANDBOX RUNNER',
    idempotencyTokenGenerated: activationPacket.idempotency.token === 'idb-w183-ariat-international-one-call-001',
    oneSubmitLimitEnforced: activationPacket.oneSubmitLimit.maxQueueSubmitAttempts === 1 &&
      activationPacket.oneSubmitLimit.secondSubmitBehavior === 'blocked_duplicate_submit',
    rollbackFlagsReady: activationPacket.rollbackPlan.flagsToDisable.indexOf('CREATE_ENABLED') >= 0 &&
      activationPacket.rollbackPlan.flagsToDisable.indexOf('GOVERNED_SANDBOX_WRITE_ENABLED') >= 0 &&
      activationPacket.rollbackPlan.flagsToDisable.indexOf('QUEUE_SUBMIT_ENABLED') >= 0,
    firstResponseTaskOrErrorNotUrls: activationPacket.expectedFirstResponse.allowed.indexOf('runnerTaskId') >= 0 &&
      activationPacket.expectedFirstResponse.allowed.indexOf('adapter_error') >= 0 &&
      activationPacket.expectedFirstResponse.disallowed.indexOf('record_urls') >= 0,
    resultCapturePollingHandoffReady: activationPacket.resultCapturePollingHandoff.nextControlAfterRunnerTaskId === 'check_runner_result' &&
      activationPacket.resultCapturePollingHandoff.completedResultGate === 'W151_completed_runner_result_import_guard',
    noFinalNameMutation: readyPacket.mutationGuard.finalGeneratedNamesUnchanged === true &&
      finalNaming.finalNamesImported === false,
    noOpenLinksBeforeImport: readyPacket.mutationGuard.activeOpenLinks === 0 &&
      pollSurface.visibleControls.indexOf('targeted_open_link_test') === -1,
    visualTestingBlocked: readyPacket.visualTestingDecision.visualTestingBlocked === true
  };

  const results = [];
  assertCase(results, 'w183_blocked_without_prereqs_no_request', guardedHarness.blockedWithoutPrereqsNoRequest, JSON.stringify(blockedPacket.activationBlockers));
  assertCase(results, 'w183_ready_only_with_all_activation_prereqs', guardedHarness.readyOnlyWithAllActivationPrereqs, JSON.stringify(readyPacket.activationChecks));
  assertCase(results, 'w183_endpoint_configured', guardedHarness.endpointConfigured, activationPacket.endpoint.url);
  assertCase(results, 'w183_server_flags_confirmed', guardedHarness.serverFlagsConfirmed, JSON.stringify(activationPacket.serverFlags));
  assertCase(results, 'w183_sandbox_allowlist_confirmed', guardedHarness.sandboxAllowlistConfirmed, JSON.stringify(activationPacket.sandboxAllowlistEvidence));
  assertCase(results, 'w183_operator_approval_captured', guardedHarness.operatorApprovalCaptured, JSON.stringify(activationPacket.operatorGate));
  assertCase(results, 'w183_idempotency_token_generated', guardedHarness.idempotencyTokenGenerated, activationPacket.idempotency.token);
  assertCase(results, 'w183_one_submit_limit_enforced', guardedHarness.oneSubmitLimitEnforced, JSON.stringify(activationPacket.oneSubmitLimit));
  assertCase(results, 'w183_rollback_flags_ready', guardedHarness.rollbackFlagsReady, JSON.stringify(activationPacket.rollbackPlan));
  assertCase(results, 'w183_first_response_task_or_error_not_urls', guardedHarness.firstResponseTaskOrErrorNotUrls, JSON.stringify(activationPacket.expectedFirstResponse));
  assertCase(results, 'w183_result_capture_polling_handoff_ready', guardedHarness.resultCapturePollingHandoffReady, JSON.stringify(activationPacket.resultCapturePollingHandoff));
  assertCase(results, 'w183_no_final_name_mutation', guardedHarness.noFinalNameMutation, JSON.stringify(readyPacket.mutationGuard));
  assertCase(results, 'w183_no_open_links_before_import', guardedHarness.noOpenLinksBeforeImport, JSON.stringify(pollSurface.visibleControls));
  assertCase(results, 'w183_visual_testing_blocked', guardedHarness.visualTestingBlocked, JSON.stringify(readyPacket.visualTestingDecision));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w183-approved-server-adapter-activation-packet.v1',
    status: failures.length ? 'blocked' : 'activation_packet_ready_no_submit',
    decision: failures.length ? 'FAIL_APPROVED_SERVER_ADAPTER_ACTIVATION_PACKET' : 'PASS_APPROVED_SERVER_ADAPTER_ACTIVATION_PACKET_READY__NO_SUBMIT__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    sourceEvidence: {
      w182NoCallStatus: readyPacket.activationChecks.find((check) => check.id === 'w182_no_call_evidence_confirmed').evidence,
      uploadedTracePath,
      uploadedHandoffPath,
      handoffPacketSchema: handoffPacket.schema,
      handoffPacketStatus: handoffPacket.status
    },
    activationPacket,
    blockedPacket,
    readyPacket,
    guardedHarness,
    results,
    visualTestingDecision: readyPacket.visualTestingDecision,
    bestNextCodexPrompt: {
      block: 'W184: Explicit One-Call Server Adapter Authorization And Submission Gate',
      prompt: 'Move through W184: Explicit One-Call Server Adapter Authorization And Submission Gate. Use the W183 activation packet to add the final execution gate for exactly one approved sandbox server adapter call from Build. Require the operator phrase AUTHORIZE ONE SANDBOX ADAPTER CALL, confirmed endpoint, server flags true, sandbox allowlist, operator approval, idempotency token, one-submit limit, rollback flags, and W151 import guard. Default remains no-submit; only if explicitly authorized should the approved server adapter be called once, returning runnerTaskId plus pending result capture or adapter error, not record URLs. Do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, do not mutate final names, and do not request Open-link visual testing until completed runner result JSON is imported. Output authorization/submission gate, guarded harness, trace samples, W184 report, visual testing decision blocked, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w183-approved-server-adapter-activation-packet-trace.v1',
    generatedAt: contract.generatedAt,
    blockedTrace: blockedPacket.traceSamples,
    readyTrace: readyPacket.traceSamples,
    requestDecision: readyPacket.requestDecision,
    pollingHandoff: readyPacket.pollingHandoff,
    results,
    visualTestingDecision: contract.visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W183 Approved Server Adapter Activation Packet And One-Call Readiness

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Activation Packet

- Endpoint: ${activationPacket.endpoint.url}
- Server flags: ${JSON.stringify(activationPacket.serverFlags)}
- Sandbox allowlist: ${JSON.stringify(activationPacket.sandboxAllowlistEvidence)}
- Operator approval: ${activationPacket.operatorGate.reviewDecision}
- Idempotency token: ${activationPacket.idempotency.token}
- One-submit limit: ${activationPacket.oneSubmitLimit.maxQueueSubmitAttempts}
- Rollback flags: ${activationPacket.rollbackPlan.flagsToDisable.join(', ')}

## Expected First Response

The first approved server adapter response must be runnerTaskId plus pending result capture or adapter error. It must not return fake record URLs or mutate final generated names.

## Result-Capture Polling Handoff

- Runner task source: ${activationPacket.resultCapturePollingHandoff.runnerTaskIdSource}
- Next control after runnerTaskId: ${activationPacket.resultCapturePollingHandoff.nextControlAfterRunnerTaskId}
- Completed result gate: ${activationPacket.resultCapturePollingHandoff.completedResultGate}
- Import policy: ${activationPacket.resultCapturePollingHandoff.importMutationPolicy}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## W183 Report

W183 converts the W182 no-call evidence into an exact activation packet for the next Build-owned server adapter step. The packet is ready in harness, but W183 does not submit, does not create records, does not invoke SuiteScript from the drawer, and does not expose Open links. W151 remains the only import authority for completed runner result JSON.

## Visual Testing Decision

Blocked. No Open-link visual testing until completed runner result JSON is imported.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W183 activation packet failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W183 activation packet: ${contract.decision}; activationReady=${readyPacket.activationReady}; visualBlocked=${contract.visualTestingDecision.visualTestingBlocked}`);
}

main();
