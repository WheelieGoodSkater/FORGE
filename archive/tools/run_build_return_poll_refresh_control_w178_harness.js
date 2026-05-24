const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w175Path = path.join(root, 'data', 'w175_governed_runner_result_poll_import_gate.json');
const w176Path = path.join(root, 'data', 'w176_completed_runner_result_import_commit.json');
const operatorTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779017541100.json';
const operatorHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779017540246.json';
const dataPath = path.join(root, 'data', 'w178_build_return_poll_refresh_control.json');
const tracePath = path.join(root, 'trace_samples', 'w178_build_return_poll_refresh_control_trace.json');
const reportPath = path.join(root, 'reports', 'w178_build_return_poll_refresh_control.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readJsonIfExists(file) {
  return fs.existsSync(file) ? readJson(file) : null;
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

function hasControl(surface, id) {
  return surface.controls.some((control) => control.id === id && control.visible === true);
}

function enabledControl(surface, id) {
  return surface.controls.some((control) => control.id === id && control.enabled === true);
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w175 = readJson(w175Path);
  const w176 = readJson(w176Path);
  const operatorTrace = readJsonIfExists(operatorTracePath);
  const operatorHandoff = readJsonIfExists(operatorHandoffPath);

  const noResultState = Object.assign({}, context.state, {
    activeView: 'review',
    dccFinalNamingResult: null,
    integratedBuildRunnerResult: null
  });
  const noResultSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      operatorEvidenceSource: 'w177_operator_trace_and_screenshots',
      handoffOnly: true,
      handoffPacketSchema: operatorHandoff && operatorHandoff.schema
    }
  );

  const serverReadySurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      serverAdapterReady: true,
      approvedEndpointMode: 'approved_server_adapter_only'
    }
  );

  const authorizedSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      serverAdapterReady: true,
      oneCallAuthorized: true,
      approvedEndpointMode: 'approved_server_adapter_only'
    }
  );

  const runnerTaskSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterResult: {
        status: 'queued_pending',
        queueSubmitted: true,
        runnerTaskId: 'task_w178_operator_001',
        resultCapture: {
          status: 'pending_runner_completion',
          runnerTaskId: 'task_w178_operator_001'
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      }
    }
  );

  const pollingSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollAttempted: true,
      adapterResult: {
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId: 'task_w178_operator_001',
        resultCapture: {
          status: 'polling_pending',
          runnerTaskId: 'task_w178_operator_001'
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      }
    }
  );

  const completedSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterResult: w175.samples.completed.normalizedResponse,
      completedResultJson: w175.samples.completed.resultJsonEvidence.completedResultJson
    }
  );

  const importedState = Object.assign({}, context.state, w176.samples.commit.statePatch || {});
  const importedSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    importedState,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterResult: w175.samples.completed.normalizedResponse,
      completedResultJson: w175.samples.completed.resultJsonEvidence.completedResultJson
    }
  );

  const adapterErrorSurface = hooks.buildReturnPollRefreshControlSurfaceV1(
    noResultState,
    context.lane,
    context.page,
    context.recommendation,
    {
      adapterError: true,
      adapterResult: {
        status: 'adapter_error',
        error: true,
        queueSubmitted: false,
        runnerTaskId: null,
        resultCapture: { status: 'adapter_error' },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0
      }
    }
  );

  const renderedReview = hooks.renderReviewView(noResultState, context.lane, context.page, context.recommendation);
  const noResultEvidenceReview = {
    operatorTracePath,
    operatorHandoffPath,
    traceAvailable: !!operatorTrace,
    handoffAvailable: !!operatorHandoff,
    traceFinalNamingStatus: operatorTrace && operatorTrace.dccFinalNamingResultV1 && operatorTrace.dccFinalNamingResultV1.status || '',
    traceNavigationStatus: operatorTrace && operatorTrace.dccFinalNavigationModelV1 && operatorTrace.dccFinalNavigationModelV1.status || '',
    traceStateFinalNamingResult: operatorTrace && operatorTrace.state ? operatorTrace.state.dccFinalNamingResult || null : null,
    handoffSchema: operatorHandoff && operatorHandoff.schema || '',
    handoffStatus: operatorHandoff && operatorHandoff.status || '',
    handoffExecutionMode: operatorHandoff && operatorHandoff.executionMode || '',
    finding: 'handoff_only_no_runner_task_no_completed_result_no_links'
  };

  const buildReturnPollRefreshUxContract = {
    stages: noResultSurface.stageOrder,
    controlRules: {
      noServerAdapterCall: noResultSurface.controlRules,
      runnerTaskCaptured: runnerTaskSurface.controlRules,
      completedResultReady: completedSurface.controlRules,
      importedUrlsReady: importedSurface.controlRules
    },
    visibleControlByStage: {
      noServerAdapterCallMade: noResultSurface.visibleControls,
      serverAdapterReady: serverReadySurface.visibleControls,
      oneCallSubmitAuthorized: authorizedSurface.visibleControls,
      runnerTaskCaptured: runnerTaskSurface.visibleControls,
      pollCheckAvailable: pollingSurface.visibleControls,
      completedRunnerResultReadyToImport: completedSurface.visibleControls,
      importedUrlsReadyForTargetedLinkTesting: importedSurface.visibleControls,
      adapterErrorStop: adapterErrorSurface.visibleControls
    },
    disabledUntilPrerequisite: {
      checkRunnerResult: 'hidden_until_runnerTaskId_exists',
      importCompletedRunnerResult: 'hidden_until_completed_runner_result_json_passes_W151',
      targetedOpenLinkTest: 'hidden_until_completed_result_import_commits_final_names'
    }
  };

  const guardedHarness = {
    noResultEvidenceShowsHandoffOnly: noResultEvidenceReview.traceFinalNamingStatus === 'not_imported' &&
      noResultEvidenceReview.handoffSchema === 'idb.dcc-runner-handoff-packet.v1' &&
      noResultSurface.currentStage === 'no_server_adapter_call_made',
    noPollControlBeforeRunnerTask: !hasControl(noResultSurface, 'check_runner_result') &&
      noResultSurface.noResultEvidence.runnerTaskCaptured === false,
    serverAdapterAndAuthorizationSeparated: serverReadySurface.currentStage === 'server_adapter_ready' &&
      authorizedSurface.currentStage === 'one_call_submit_authorized' &&
      enabledControl(serverReadySurface, 'start_approved_adapter_call') === false &&
      enabledControl(authorizedSurface, 'start_approved_adapter_call') === true,
    checkRunnerVisibleOnlyAfterRunnerTask: hasControl(runnerTaskSurface, 'check_runner_result') &&
      enabledControl(runnerTaskSurface, 'check_runner_result') &&
      hasControl(pollingSurface, 'check_runner_result') &&
      runnerTaskSurface.controlRules.checkRunnerResultVisibleOnlyAfterRunnerTaskId === true,
    importBlockedUntilW151CompletedResult: !hasControl(runnerTaskSurface, 'import_completed_runner_result') &&
      hasControl(completedSurface, 'import_completed_runner_result') &&
      enabledControl(completedSurface, 'import_completed_runner_result') &&
      completedSurface.currentStage === 'completed_runner_result_ready_to_import',
    targetedLinksOnlyAfterImport: !hasControl(completedSurface, 'targeted_open_link_test') &&
      hasControl(importedSurface, 'targeted_open_link_test') &&
      enabledControl(importedSurface, 'targeted_open_link_test') &&
      importedSurface.currentStage === 'imported_urls_ready_for_targeted_link_testing',
    adapterErrorStopsSafely: adapterErrorSurface.currentStage === 'adapter_error_stop' &&
      hasControl(adapterErrorSurface, 'collect_adapter_error_evidence') &&
      adapterErrorSurface.noRegression.noDrawerWrites === true,
    renderSurfaceIncludesBuildReturnControls: /Build return controls/.test(renderedReview) &&
      /No runnerTaskId yet/.test(renderedReview) &&
      /No W151-valid result/.test(renderedReview),
    traceSamplesReady: noResultSurface.traceSamples.length >= 3 &&
      completedSurface.traceSamples.some((sample) => sample.event === 'w178_poll_refresh_control_rules')
  };

  const noRegression = {
    noDrawerWrites: noResultSurface.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: noResultSurface.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath:
      noResultSurface.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: noResultSurface.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: noResultSurface.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: noResultSurface.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: noResultSurface.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: noResultSurface.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: noResultSurface.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };

  const visualTestingDecision = {
    visualTestingBlockedUntilCompletedResultImported: true,
    targetedOpenLinkTestingReadyInNoResultState: false,
    targetedOpenLinkTestingReadyAfterImport: importedSurface.visualTestingDecision.targetedOpenLinkTestingReady === true,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W178 blocks targeted visual testing while no runnerTask/result capture exists; after import, only targeted Open-link verification may resume.'
  };

  const results = [];
  assertCase(results, 'w178_no_result_evidence_shows_handoff_only', guardedHarness.noResultEvidenceShowsHandoffOnly, JSON.stringify(noResultEvidenceReview));
  assertCase(results, 'w178_no_poll_control_before_runner_task', guardedHarness.noPollControlBeforeRunnerTask, JSON.stringify(noResultSurface.visibleControls));
  assertCase(results, 'w178_server_ready_and_authorization_are_separate', guardedHarness.serverAdapterAndAuthorizationSeparated, JSON.stringify({ serverReady: serverReadySurface.enabledControls, authorized: authorizedSurface.enabledControls }));
  assertCase(results, 'w178_check_runner_visible_only_after_runner_task', guardedHarness.checkRunnerVisibleOnlyAfterRunnerTask, JSON.stringify(runnerTaskSurface.controls));
  assertCase(results, 'w178_import_blocked_until_w151_completed_result', guardedHarness.importBlockedUntilW151CompletedResult, JSON.stringify(completedSurface.controls));
  assertCase(results, 'w178_targeted_links_only_after_import', guardedHarness.targetedLinksOnlyAfterImport, JSON.stringify(importedSurface.controls));
  assertCase(results, 'w178_adapter_error_stops_safely', guardedHarness.adapterErrorStopsSafely, JSON.stringify(adapterErrorSurface.controls));
  assertCase(results, 'w178_render_surface_includes_controls', guardedHarness.renderSurfaceIncludesBuildReturnControls, renderedReview.slice(0, 1200));
  assertCase(results, 'w178_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(noResultSurface.traceSamples));
  assertCase(results, 'w178_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w178-build-return-poll-refresh-control.v1',
    status: failures.length ? 'blocked' : 'build_return_poll_refresh_control_ready',
    decision: failures.length ? 'FAIL_BUILD_RETURN_POLL_REFRESH_CONTROL' : 'PASS_BUILD_RETURN_POLL_REFRESH_CONTROL_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    noResultEvidenceReview,
    buildReturnPollRefreshUxContract,
    samples: {
      noResultSurface,
      serverReadySurface,
      authorizedSurface,
      runnerTaskSurface,
      pollingSurface,
      completedSurface,
      importedSurface,
      adapterErrorSurface
    },
    guardedHarness,
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W179: Approved Server Adapter Result Poll Control Implementation',
      prompt: 'Move through W179: Approved Server Adapter Result Poll Control Implementation. Use the W178 Build-return poll/refresh control contract to wire the visible Check runner result control to the approved server adapter polling path, still behind server flags, sandbox allowlist, operator approval, idempotency, and approved endpoint mode. Keep the drawer from creating records or invoking SuiteScript outside the approved server adapter path. If no runnerTaskId exists, the control remains hidden. If runnerTaskId exists, the control polls result capture and normalizes pending, completed, and adapter-error responses. Completed results must remain blocked from final-name mutation until W151 validates numeric ids and supported NetSuite URLs. Preserve no drawer writes, no drawer transaction writes, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output poll-control implementation contract, guarded harness, trace samples, W179 report, visual testing decision blocked until completed result import, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w178-build-return-poll-refresh-control-trace.v1',
    generatedAt: contract.generatedAt,
    noResultTrace: noResultSurface.traceSamples,
    runnerTaskTrace: runnerTaskSurface.traceSamples,
    completedTrace: completedSurface.traceSamples,
    importedTrace: importedSurface.traceSamples,
    adapterErrorTrace: adapterErrorSurface.traceSamples,
    results,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W178 Build Return Poll/Refresh Control And No-Result Operator Evidence Intake

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## No-Result Evidence Review

- Operator trace available: ${noResultEvidenceReview.traceAvailable}
- Handoff available: ${noResultEvidenceReview.handoffAvailable}
- Final naming status: ${noResultEvidenceReview.traceFinalNamingStatus}
- Navigation status: ${noResultEvidenceReview.traceNavigationStatus}
- Handoff schema: ${noResultEvidenceReview.handoffSchema}
- Handoff mode: ${noResultEvidenceReview.handoffExecutionMode}
- Finding: ${noResultEvidenceReview.finding}

## Build-Return Poll/Refresh UX Contract

- No runnerTaskId: no Check runner result control.
- Server adapter ready: Start approved adapter call can appear, but remains disabled until one-call authorization.
- One-call authorized: Start approved adapter call can be enabled for the approved server adapter path.
- Runner task captured: Check runner result is visible and enabled.
- Completed W151-valid result: Import completed runner result is visible and enabled.
- Imported final names: targeted Open-link test can resume; broader visual testing stays blocked.

## Visible Controls By Stage

${Object.entries(buildReturnPollRefreshUxContract.visibleControlByStage).map(([stage, controls]) => `- ${stage}: ${controls.length ? controls.join(', ') : 'none'}`).join('\n')}

## Guarded Harness

| Gate | Result |
| --- | --- |
${Object.keys(guardedHarness).map((key) => `| ${key} | ${guardedHarness[key] ? 'PASS' : 'FAIL'} |`).join('\n')}

## Visual Testing Decision

Visual testing remains blocked until completed runner result JSON is imported. After import, only targeted Open-link verification may resume.

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  console.log(`W178 build return poll/refresh control: ${contract.decision}; noResultStage=${noResultSurface.currentStage}; runnerTaskControl=${hasControl(runnerTaskSurface, 'check_runner_result')}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
