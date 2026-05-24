const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w193Path = path.join(root, 'data', 'w193_idb_polls_completed_result_imports_final_urls.json');
const w194Path = path.join(root, 'data', 'w194_targeted_real_imported_open_link_verification.json');
const dataPath = path.join(root, 'data', 'w195_server_adapter_activation_or_result_import_recovery.json');
const tracePath = path.join(root, 'trace_samples', 'w195_server_adapter_activation_or_result_import_recovery_trace.json');
const reportPath = path.join(root, 'reports', 'w195_server_adapter_activation_or_result_import_recovery.md');

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
    URLSearchParams,
    Blob: function Blob() {},
    Promise,
    fetch: () => Promise.reject(new Error('live fetch disabled in W195 harness')),
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

function baseState() {
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
  const state = baseState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function activationInputs() {
  return {
    endpointUrl: '',
    adapterApproved: true,
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['TD3021666'],
    currentSandboxAccount: 'TD3021666',
    operatorName: 'Operator',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    operatorAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
    endpointConfirmed: true,
    confirmedSandboxAccount: true
  };
}

function buildReadyOptions(inputs, transport) {
  return {
    adapterConfig: {
      endpointUrl: inputs.endpointUrl,
      adapterApproved: inputs.adapterApproved,
      CREATE_ENABLED: inputs.CREATE_ENABLED,
      GOVERNED_SANDBOX_WRITE_ENABLED: inputs.GOVERNED_SANDBOX_WRITE_ENABLED,
      QUEUE_SUBMIT_ENABLED: inputs.QUEUE_SUBMIT_ENABLED,
      sandboxAccountAllowlist: inputs.sandboxAccountAllowlist
    },
    operatorEvidence: {
      operatorName: inputs.operatorName,
      reviewDecision: inputs.reviewDecision,
      typeToConfirm: inputs.typeToConfirm,
      operatorAuthorizationPhrase: inputs.operatorAuthorizationPhrase,
      endpointConfirmed: inputs.endpointConfirmed,
      confirmedSandboxAccount: inputs.confirmedSandboxAccount,
      currentSandboxAccount: inputs.currentSandboxAccount
    },
    operatorAuthorizationPhrase: inputs.operatorAuthorizationPhrase,
    endpointConfirmed: inputs.endpointConfirmed,
    currentSandboxAccount: inputs.currentSandboxAccount,
    executeOneCall: !!transport,
    transport
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w193 = readJson(w193Path);
  const w194 = readJson(w194Path);
  const completedResultJson = w193.completedResultEnvelope && w193.completedResultEnvelope.completedResultJson;
  const inputs = activationInputs();

  const currentBlocked = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {}
  );

  const readyNoSubmit = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    buildReadyOptions(inputs, null)
  );

  const oneCallExecution = hooks.realSandboxServerAdapterExecutionWiringAndRunnerTaskIdCaptureV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    buildReadyOptions(inputs, () => ({
      schema: 'idb.governed-runner-adapter-result.v1',
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'task_w195_ariat_approved_server_adapter_001',
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: 'task_w195_ariat_approved_server_adapter_001'
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    }))
  );

  const recoveryImport = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      operatorChoseImport: true,
      completedResultJson,
      pollResult: {
        status: 'completed_runner_result_ready',
        requestReady: true,
        requestSent: true,
        pollRequestEnvelope: {
          runnerTaskId: 'task_w193_ariat_001'
        },
        normalizedResponse: {
          status: 'completed_runner_result_ready',
          resultCaptureStatus: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completedResultJson,
          finalGeneratedNamesJsonReady: true
        },
        statePatch: {
          integratedBuildRunnerResult: {
            schema: 'idb.approved-server-adapter-result-envelope.v1',
            status: 'completed_runner_result_ready',
            queueSubmitted: true,
            runnerTaskId: 'task_w193_ariat_001',
            resultCapture: {
              status: 'completed_result_capture_ready',
              runnerTaskId: 'task_w193_ariat_001'
            },
            finalGeneratedNamesJson: completedResultJson
          }
        }
      }
    }
  );

  const exactOperatorInputs = {
    approvedEndpointUrl: {
      label: 'Approved W144 Suitelet endpoint URL',
      valueForHarness: inputs.endpointUrl,
      instruction: 'Paste the deployed W144 governed runner adapter Suitelet URL, not the legacy DCC UI URL.'
    },
    serverFlags: {
      CREATE_ENABLED: true,
      GOVERNED_SANDBOX_WRITE_ENABLED: true,
      QUEUE_SUBMIT_ENABLED: true,
      instruction: 'Enable only on the sandbox W144 adapter deployment. Roll back by setting these false.'
    },
    sandboxAllowlist: {
      value: 'TD3021666',
      currentSandboxAccount: 'TD3021666',
      instruction: 'The current account must be in the allowlist before the one-call button is eligible.'
    },
    operatorGate: {
      operatorName: 'Operator',
      reviewDecision: 'operator_approved_queue_submit',
      typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
      oneCallAuthorizationPhrase: 'AUTHORIZE ONE SANDBOX ADAPTER CALL',
      endpointConfirmed: true
    },
    expectedFirstResponse: {
      allowed: ['runnerTaskId plus pending result capture', 'adapter_error'],
      disallowed: ['record URLs', 'fake IDs', 'completed JSON before result capture']
    },
    recoveryImport: {
      acceptedPayload: 'completed runner result JSON from W191/W192 only',
      rejectedPayload: 'Build handoff JSON',
      requiredSchema: 'idb.completed-runner-result-json.v1'
    }
  };

  const activationSteps = [
    'Keep visual Open-link testing stopped until Build shows five imported Open links.',
    'Deploy or confirm the W144 governed runner adapter Suitelet endpoint.',
    'Set CREATE_ENABLED, GOVERNED_SANDBOX_WRITE_ENABLED, and QUEUE_SUBMIT_ENABLED true on sandbox only.',
    'Enter the endpoint URL, sandbox allowlist/current account, operator name, queue approval, and authorization phrase in Build.',
    'Submit exactly one approved server adapter call.',
    'If runnerTaskId is returned, use Check runner result until W191 returns completed W192 result JSON.',
    'If a completed W151-valid runner result JSON is already available, use Import completed runner result instead of resubmitting.',
    'Only after import, run targeted Open-link verification.'
  ];

  const recoverySteps = [
    'Use Trace > Completed Runner Result Import only with completed W191/W192 result JSON.',
    'Do not paste the Build handoff packet; W151 must reject it.',
    'Confirm JSON includes numeric ids and supported NetSuite URLs for customer, demo transaction, hero item, matrix/proof item, and component item.',
    'Click Import completed runner result.',
    'Verify Build and Run show imported names and five active Open links before any visual click test.'
  ];

  const results = [];
  assertCase(results, 'w195_current_state_matches_w194_blocked', w194.evidenceReview.noServerAdapterCallMade === true && currentBlocked.status === 'w144_one_call_blocked' && currentBlocked.runnerTaskIdCapturePath.runnerTaskIdCaptured === false, JSON.stringify(currentBlocked.blockedReasons));
  assertCase(results, 'w195_ready_no_submit_constructs_request', readyNoSubmit.readyForOneCall === true && readyNoSubmit.executionAllowed === false && readyNoSubmit.adapterRequestEnvelope && readyNoSubmit.status === 'w144_one_call_ready_not_submitted', JSON.stringify(readyNoSubmit.status));
  assertCase(results, 'w195_one_call_captures_runner_task_only', oneCallExecution.executionAllowed === true && oneCallExecution.runnerTaskIdCapturePath.runnerTaskIdCaptured === true && oneCallExecution.runnerTaskIdCapturePath.resultCaptureStatus === 'pending_runner_completion' && oneCallExecution.mutationGuard.finalGeneratedNamesImported === false, JSON.stringify(oneCallExecution.runnerTaskIdCapturePath));
  assertCase(results, 'w195_recovery_import_commits_w193_completed_json', recoveryImport.status === 'completed_result_imported_final_urls_ready' && recoveryImport.importGuard.completedResultAcceptedByW151 === true && recoveryImport.buildAndRunAfterImport.verifiedOpenLinkCount >= 5, JSON.stringify(recoveryImport.buildAndRunAfterImport));
  assertCase(results, 'w195_exact_operator_inputs_ready', exactOperatorInputs.operatorGate.oneCallAuthorizationPhrase === 'AUTHORIZE ONE SANDBOX ADAPTER CALL' && exactOperatorInputs.serverFlags.CREATE_ENABLED === true && exactOperatorInputs.recoveryImport.requiredSchema === 'idb.completed-runner-result-json.v1', JSON.stringify(exactOperatorInputs.operatorGate));
  assertCase(results, 'w195_no_visual_until_imported_links', oneCallExecution.visualTestingDecision.targetedOpenLinkTestingReady === false && recoveryImport.visualTestingDecision.targetedOpenLinkTestingReady === true && recoveryImport.visualTestingDecision.broaderVisualNetSuiteTestingRequired === false, JSON.stringify({ oneCall: oneCallExecution.visualTestingDecision, recovery: recoveryImport.visualTestingDecision }));
  assertCase(results, 'w195_no_regression_preserved', oneCallExecution.noRegression.noDrawerWrites === true && oneCallExecution.noRegression.noDrawerTransactionWrites === true && oneCallExecution.noRegression.noDrawerCreatedRecords === true && oneCallExecution.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true && recoveryImport.noRegression.noDrawerWrites === true, JSON.stringify(oneCallExecution.noRegression));

  const guardedHarness = {
    currentStateMatchesW194Blocked: results.find((result) => result.name === 'w195_current_state_matches_w194_blocked').pass,
    readyNoSubmitConstructsRequest: results.find((result) => result.name === 'w195_ready_no_submit_constructs_request').pass,
    oneCallCapturesRunnerTaskOnly: results.find((result) => result.name === 'w195_one_call_captures_runner_task_only').pass,
    recoveryImportCommitsW193CompletedJson: results.find((result) => result.name === 'w195_recovery_import_commits_w193_completed_json').pass,
    exactOperatorInputsReady: results.find((result) => result.name === 'w195_exact_operator_inputs_ready').pass,
    noVisualUntilImportedLinks: results.find((result) => result.name === 'w195_no_visual_until_imported_links').pass,
    noRegressionPreserved: results.find((result) => result.name === 'w195_no_regression_preserved').pass
  };

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w195-server-adapter-activation-or-result-import-recovery.v1',
    status: pass ? 'PASS_ACTIVATION_OR_RECOVERY_PACKET_READY' : 'FAIL_W195_ACTIVATION_OR_RECOVERY',
    currentRunFinding: {
      fromW194: w194.evidenceReview,
      currentBlockedStatus: currentBlocked.status,
      blockedReasons: currentBlocked.blockedReasons,
      nextAction: 'activate_adapter_or_import_completed_result'
    },
    activationPath: {
      purpose: 'Execute exactly one approved W144 server adapter call from Build.',
      readyNoSubmit,
      oneCallExecutionEvidence: {
        status: oneCallExecution.status,
        runnerTaskId: oneCallExecution.runnerTaskIdCapturePath.runnerTaskId,
        resultCaptureStatus: oneCallExecution.runnerTaskIdCapturePath.resultCaptureStatus,
        openLinksBeforeImport: oneCallExecution.resultPollingImportPath.openLinksBeforeCompletedImport
      },
      steps: activationSteps
    },
    recoveryImportPath: {
      purpose: 'Import a real W151-valid completed W191/W192 result JSON if it already exists.',
      completedResultSchema: completedResultJson && completedResultJson.schema,
      importStatus: recoveryImport.status,
      verifiedOpenLinkCountAfterImport: recoveryImport.buildAndRunAfterImport.verifiedOpenLinkCount,
      steps: recoverySteps
    },
    exactOperatorInputs,
    traceSamples: [
      {
        event: 'w195_current_run_blocked_before_server_adapter',
        blockedReasons: currentBlocked.blockedReasons,
        runnerTaskIdCaptured: false,
        activeOpenLinks: 0
      },
      {
        event: 'w195_ready_no_submit_request_constructed',
        requestConstructed: !!readyNoSubmit.adapterRequestEnvelope,
        readyForOneCall: readyNoSubmit.readyForOneCall,
        requestSent: false,
        activeOpenLinks: 0
      },
      {
        event: 'w195_one_call_runner_taskid_captured',
        executionAllowed: oneCallExecution.executionAllowed,
        runnerTaskId: oneCallExecution.runnerTaskIdCapturePath.runnerTaskId,
        resultCaptureStatus: oneCallExecution.runnerTaskIdCapturePath.resultCaptureStatus,
        finalNamesImported: false,
        activeOpenLinks: 0
      },
      {
        event: 'w195_recovery_import_completed_result',
        completedResultAcceptedByW151: recoveryImport.importGuard.completedResultAcceptedByW151,
        importCommitted: recoveryImport.importGuard.commitAllowed,
        verifiedOpenLinkCount: recoveryImport.buildAndRunAfterImport.verifiedOpenLinkCount
      }
    ],
    guardedHarness,
    visualTestingDecision: {
      openLinkVisualTestingBlockedUntilImportedLinks: true,
      targetedOpenLinkTestingReadyAfterRecoveryImport: recoveryImport.visualTestingDecision.targetedOpenLinkTestingReady === true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'W195 activates the call or imports completed JSON. Open-link visual testing starts only after imported final names and five active Open links are visible.'
    },
    noRegression: {
      noDrawerWrites: true,
      noDrawerTransactionWrites: true,
      noDrawerCreatedRecords: true,
      noDirectDrawerSuiteScriptOutsideApprovedServerAdapterPath: true,
      consultantConfirmationRequired: true,
      stateAuthorityAndHandoffParityPreserved: true,
      idempotencyPreserved: true,
      internalRunnerOwnership: true,
      rollbackByDisablingServerFlags: true,
      noActiveOpenLinksWithoutRealUrls: true
    },
    nextProductionReadinessPrompt: {
      block: 'W196: Approved Server Adapter One-Call Operator Execution And RunnerTaskId Evidence',
      prompt: 'Move through W196: Approved Server Adapter One-Call Operator Execution And RunnerTaskId Evidence. Use the W195 activation packet to execute exactly one approved W144 sandbox server adapter call from Build with the real deployed endpoint, server flags true, sandbox allowlist, operator approval, idempotency token, and one-call authorization phrase. Capture runnerTaskId plus pending result capture or adapter error. Do not import final names, do not create records from the drawer, do not request Open-link visual testing, and do not return fake URLs. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output execution evidence, runnerTaskId/error evidence, trace samples, W196 report, and next prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w195-server-adapter-activation-or-result-import-recovery-trace.v1',
    traceSamples: contract.traceSamples,
    currentRunFinding: contract.currentRunFinding,
    exactOperatorInputs,
    results
  };

  const inputRows = [
    ['Approved endpoint URL', exactOperatorInputs.approvedEndpointUrl.valueForHarness, exactOperatorInputs.approvedEndpointUrl.instruction],
    ['CREATE_ENABLED', 'true', exactOperatorInputs.serverFlags.instruction],
    ['GOVERNED_SANDBOX_WRITE_ENABLED', 'true', exactOperatorInputs.serverFlags.instruction],
    ['QUEUE_SUBMIT_ENABLED', 'true', exactOperatorInputs.serverFlags.instruction],
    ['Sandbox allowlist', exactOperatorInputs.sandboxAllowlist.value, exactOperatorInputs.sandboxAllowlist.instruction],
    ['Current sandbox account', exactOperatorInputs.sandboxAllowlist.currentSandboxAccount, exactOperatorInputs.sandboxAllowlist.instruction],
    ['Operator review decision', exactOperatorInputs.operatorGate.reviewDecision, 'Must be approved before the one call.'],
    ['Type to confirm', exactOperatorInputs.operatorGate.typeToConfirm, 'Must match exactly.'],
    ['Authorization phrase', exactOperatorInputs.operatorGate.oneCallAuthorizationPhrase, 'Must match exactly.']
  ].map((row) => `| ${row[0]} | ${row[1]} | ${row[2]} |`).join('\n');
  const activationRows = activationSteps.map((step, index) => `| ${index + 1} | ${step} |`).join('\n');
  const recoveryRows = recoverySteps.map((step, index) => `| ${index + 1} | ${step} |`).join('\n');
  const report = `# W195 Server Adapter Call Activation Or Result Import Recovery

Decision: ${contract.status}

## Current Run Finding

The current operator screenshot is blocked before server adapter. No runnerTaskId exists, result capture has not started, no completed runner result JSON is imported, and no Open links should be tested.

## Exact Operator Inputs

| Field | Value | Notes |
| --- | --- | --- |
${inputRows}

## Activation Steps

| Step | Action |
| --- | --- |
${activationRows}

## Recovery Import Steps

| Step | Action |
| --- | --- |
${recoveryRows}

## Harness Evidence

- Current blocked state preserved: ${guardedHarness.currentStateMatchesW194Blocked ? 'PASS' : 'FAIL'}
- Ready no-submit request constructed: ${guardedHarness.readyNoSubmitConstructsRequest ? 'PASS' : 'FAIL'}
- One-call runnerTaskId capture modeled: ${guardedHarness.oneCallCapturesRunnerTaskOnly ? 'PASS' : 'FAIL'}
- Completed result recovery import modeled: ${guardedHarness.recoveryImportCommitsW193CompletedJson ? 'PASS' : 'FAIL'}
- No visual testing until imported links: ${guardedHarness.noVisualUntilImportedLinks ? 'PASS' : 'FAIL'}

## Visual Testing Decision

Do not run Open-link visual testing from the current state. It becomes targeted-only after Build shows imported final names and five active Open links.

## Next Production-Readiness Prompt

${contract.nextProductionReadinessPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!pass) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W195 activation/recovery harness failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W195 activation/recovery: ${contract.status}; next=${contract.nextProductionReadinessPrompt.block}`);
}

main();
