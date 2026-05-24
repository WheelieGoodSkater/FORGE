const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w182_build_return_server_adapter_no_call_evidence_review.json');
const tracePath = path.join(root, 'trace_samples', 'w182_build_return_server_adapter_no_call_evidence_review_trace.json');
const reportPath = path.join(root, 'reports', 'w182_build_return_server_adapter_no_call_evidence_review.md');

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

function main() {
  const hooks = loadHooks();
  const uploadedTrace = fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null;
  const uploadedHandoff = fs.existsSync(uploadedHandoffPath) ? readJson(uploadedHandoffPath) : null;
  const context = buildContext(hooks, uploadedTrace);
  const handoffPacket = uploadedHandoff || hooks.dccRunnerHandoffPacketV1(context.state, context.lane, context.page, context.recommendation);
  const noCallReview = hooks.buildReturnServerAdapterNoCallEvidenceReviewV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      traceExport: uploadedTrace,
      handoffPacket,
      approvedEndpointConfigured: false,
      serverFlagsConfirmed: false,
      sandboxAllowlistConfirmed: false,
      operatorApprovalCaptured: false,
      idempotencyToken: '',
      oneSubmitLimitEnforced: false,
      rollbackFlagsPlanReady: true
    }
  );
  const activationReadyReview = hooks.buildReturnServerAdapterNoCallEvidenceReviewV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      traceExport: uploadedTrace,
      handoffPacket,
      approvedEndpointConfigured: true,
      serverFlagsConfirmed: true,
      sandboxAllowlistConfirmed: true,
      operatorApprovalCaptured: true,
      idempotencyToken: 'idb-w182-activation-token-ariat-001',
      oneSubmitLimitEnforced: true,
      rollbackFlagsPlanReady: true
    }
  );
  const finalNaming = hooks.dccFinalNamingResultV1(context.state.dccFinalNamingResult, context.state, context.lane, context.page, context.recommendation);
  const navigation = hooks.dccFinalNavigationModel(context.state, context.lane, context.page, context.recommendation);
  const handoffAsResultGuard = hooks.validateDccFinalNamingImportPayload(handoffPacket, context.state, context.lane, context.page, context.recommendation);
  const pollSurface = hooks.buildReturnPollRefreshControlSurfaceV1(context.state, context.lane, context.page, context.recommendation, {
    adapterResult: context.state.integratedBuildRunnerResult,
    handoffOnly: true,
    handoffPacketSchema: handoffPacket.schema
  });

  const noCallEvidenceReview = {
    uploadedTracePath,
    uploadedHandoffPath,
    handoffPacketSchema: handoffPacket.schema,
    handoffPacketStatus: handoffPacket.status,
    handoffPacketValid: noCallReview.noCallEvidenceReview.handoffPacketValid,
    handoffPacketIsCompletedRunnerResult: noCallReview.noCallEvidenceReview.handoffPacketIsCompletedRunnerResult,
    handoffPacketRejectedByW151AsFinalResult: noCallReview.noCallEvidenceReview.handoffPacketRejectedByW151AsFinalResult,
    finalNamingStatus: finalNaming.status,
    finalNamesImported: finalNaming.finalNamesImported,
    navigationStatus: navigation.status,
    linkAuthoritySummary: navigation.linkAuthoritySummary,
    runnerTaskIdCaptured: noCallReview.noCallEvidenceReview.runnerTaskIdCaptured,
    resultCaptureStarted: noCallReview.noCallEvidenceReview.resultCaptureStarted,
    noServerAdapterCallMade: noCallReview.noCallEvidenceReview.noServerAdapterCallMade,
    visibleControls: pollSurface.visibleControls,
    enabledControls: pollSurface.enabledControls
  };

  const guardedHarness = {
    uploadedEvidenceLoaded: noCallEvidenceReview.handoffPacketSchema === 'idb.dcc-runner-handoff-packet.v1' &&
      noCallEvidenceReview.handoffPacketStatus === 'ready_for_dcc_suitelet_submission_review',
    handoffValidButNotCompletedResult: noCallEvidenceReview.handoffPacketValid === true &&
      noCallEvidenceReview.handoffPacketIsCompletedRunnerResult === false &&
      noCallEvidenceReview.handoffPacketRejectedByW151AsFinalResult === true &&
      handoffAsResultGuard.valid === false,
    idbCorrectlyBlocksLinks: noCallEvidenceReview.finalNamingStatus === 'not_imported' &&
      noCallEvidenceReview.finalNamesImported === false &&
      noCallEvidenceReview.navigationStatus === 'using_provisional_preview_names' &&
      Number(noCallEvidenceReview.linkAuthoritySummary.missing_url || 0) > 0,
    noRefreshUntilRunnerTask: noCallEvidenceReview.runnerTaskIdCaptured === false &&
      noCallEvidenceReview.visibleControls.indexOf('check_runner_result') === -1 &&
      noCallEvidenceReview.enabledControls.indexOf('check_runner_result') === -1,
    buildStatusCopyExplainsHandoffNotExecution: /handoff packet only/i.test(noCallReview.buildStatusUxCorrection.primaryCopy) &&
      /not completed runner result JSON/i.test(noCallReview.buildStatusUxCorrection.handoffIsNotExecutionCopy) &&
      /runnerTaskId/i.test(noCallReview.buildStatusUxCorrection.noRefreshUntilRunnerTaskCopy),
    activationChecklistComplete: noCallReview.activationReadinessChecklist.length === 8 &&
      noCallReview.activationReadinessChecklist.some((item) => item.id === 'approved_server_adapter_endpoint_configured') &&
      noCallReview.activationReadinessChecklist.some((item) => item.id === 'expected_first_response_documented') &&
      noCallReview.activationBlockers.length === 6,
    activationReadyOnlyWhenAllPrereqsPresent: noCallReview.activationReady === false &&
      activationReadyReview.activationReady === true,
    expectedFirstResponseIsTaskOrError: /runnerTaskId plus pending result capture, or an adapter error/i.test(noCallReview.buildStatusUxCorrection.expectedFirstResponseCopy),
    w181ImportCommitUntouched: context.state.dccFinalNamingResult === null &&
      noCallReview.noRegression.noDrawerWrites === true &&
      noCallReview.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };

  const buildStatusUxCorrection = {
    headline: noCallReview.buildStatusUxCorrection.headline,
    primaryCopy: noCallReview.buildStatusUxCorrection.primaryCopy,
    handoffIsNotExecutionCopy: noCallReview.buildStatusUxCorrection.handoffIsNotExecutionCopy,
    noRefreshUntilRunnerTaskCopy: noCallReview.buildStatusUxCorrection.noRefreshUntilRunnerTaskCopy,
    importBlockedCopy: noCallReview.buildStatusUxCorrection.importBlockedCopy,
    expectedFirstResponseCopy: noCallReview.buildStatusUxCorrection.expectedFirstResponseCopy
  };

  const visualTestingDecision = {
    visualTestingBlocked: true,
    targetedOpenLinkTestingReady: false,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'Operator evidence is handoff-only. No runnerTaskId, result capture, completed runner result JSON, imported names, or real URLs exist.'
  };

  const results = [];
  assertCase(results, 'w182_uploaded_evidence_loaded', guardedHarness.uploadedEvidenceLoaded, JSON.stringify(noCallEvidenceReview));
  assertCase(results, 'w182_handoff_valid_but_not_completed_result', guardedHarness.handoffValidButNotCompletedResult, JSON.stringify(handoffAsResultGuard));
  assertCase(results, 'w182_idb_correctly_blocks_links', guardedHarness.idbCorrectlyBlocksLinks, JSON.stringify(noCallEvidenceReview.linkAuthoritySummary));
  assertCase(results, 'w182_no_refresh_until_runner_task', guardedHarness.noRefreshUntilRunnerTask, JSON.stringify(pollSurface.controls));
  assertCase(results, 'w182_build_status_copy_explains_handoff_not_execution', guardedHarness.buildStatusCopyExplainsHandoffNotExecution, JSON.stringify(buildStatusUxCorrection));
  assertCase(results, 'w182_activation_checklist_complete', guardedHarness.activationChecklistComplete, JSON.stringify(noCallReview.activationReadinessChecklist));
  assertCase(results, 'w182_activation_ready_only_when_all_prereqs_present', guardedHarness.activationReadyOnlyWhenAllPrereqsPresent, JSON.stringify({ blocked: noCallReview.activationReady, ready: activationReadyReview.activationReady }));
  assertCase(results, 'w182_expected_first_response_is_task_or_error', guardedHarness.expectedFirstResponseIsTaskOrError, buildStatusUxCorrection.expectedFirstResponseCopy);
  assertCase(results, 'w182_w181_import_commit_untouched', guardedHarness.w181ImportCommitUntouched, JSON.stringify(noCallReview.noRegression));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w182-build-return-server-adapter-no-call-evidence-review.v1',
    status: failures.length ? 'blocked' : 'server_adapter_no_call_evidence_review_ready',
    decision: failures.length ? 'FAIL_BUILD_RETURN_SERVER_ADAPTER_NO_CALL_REVIEW' : 'PASS_BUILD_RETURN_SERVER_ADAPTER_NO_CALL_REVIEW_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    noCallEvidenceReview,
    buildStatusUxCorrection,
    serverAdapterActivationReadinessChecklist: noCallReview.activationReadinessChecklist,
    guardedHarness,
    samples: {
      noCallReview,
      activationReadyReview,
      pollSurface
    },
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W183: Approved Server Adapter Activation Packet And One-Call Readiness',
      prompt: 'Move through W183: Approved Server Adapter Activation Packet And One-Call Readiness. Use the W182 no-call evidence review to prepare the exact next integration packet for the first approved server adapter call from Build: endpoint configuration, server flags, sandbox allowlist, operator approval evidence, idempotency token, one-submit limit, rollback flags, expected runnerTaskId-or-adapter-error response, and result-capture polling handoff. Keep real execution disabled unless explicitly authorized, do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and do not request Open-link visual testing until completed runner result JSON is imported. Output activation packet, guarded harness, trace samples, W183 report, visual testing decision blocked, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w182-build-return-server-adapter-no-call-evidence-review-trace.v1',
    generatedAt: contract.generatedAt,
    noCallTrace: noCallReview.traceSamples,
    activationReadyTrace: activationReadyReview.traceSamples,
    uploadedEvidence: noCallEvidenceReview,
    results,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W182 Build Return Server Adapter No-Call Evidence Review And Activation Readiness

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## No-Call Evidence Review

- Handoff packet: ${noCallEvidenceReview.handoffPacketSchema} / ${noCallEvidenceReview.handoffPacketStatus}
- Valid handoff: ${noCallEvidenceReview.handoffPacketValid}
- Completed runner result: ${noCallEvidenceReview.handoffPacketIsCompletedRunnerResult}
- W151 rejects handoff as final result: ${noCallEvidenceReview.handoffPacketRejectedByW151AsFinalResult}
- Final naming status: ${noCallEvidenceReview.finalNamingStatus}
- Navigation status: ${noCallEvidenceReview.navigationStatus}
- Link authority: ${JSON.stringify(noCallEvidenceReview.linkAuthoritySummary)}
- Runner task captured: ${noCallEvidenceReview.runnerTaskIdCaptured}
- Result capture started: ${noCallEvidenceReview.resultCaptureStarted}

## Build Status UX Correction

- ${buildStatusUxCorrection.primaryCopy}
- ${buildStatusUxCorrection.handoffIsNotExecutionCopy}
- ${buildStatusUxCorrection.noRefreshUntilRunnerTaskCopy}
- ${buildStatusUxCorrection.importBlockedCopy}
- ${buildStatusUxCorrection.expectedFirstResponseCopy}

## Server Adapter Activation Readiness Checklist

${noCallReview.activationReadinessChecklist.map((item) => `- ${item.ready ? 'READY' : 'BLOCKED'} ${item.label}${item.ready ? '' : `: ${item.blocker}`}`).join('\n')}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## Trace Samples

- No-call review: ${noCallReview.status}
- Activation blocked: ${noCallReview.activationReady}
- Activation ready fixture: ${activationReadyReview.activationReady}

## W182 Report

The latest operator evidence is handoff-only. IDB correctly blocks refresh, import, final names, and Open links because no approved server adapter call has produced a runnerTaskId or completed runner result JSON. The next block should activate readiness for the first approved server adapter call, whose expected first response is runnerTaskId or adapter error, not record URLs.

## Visual Testing Decision

Blocked. No Open-link visual testing until completed runner result JSON is imported.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W182 no-call evidence review failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W182 no-call evidence review: ${contract.decision}; noCall=${noCallEvidenceReview.noServerAdapterCallMade}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main();
