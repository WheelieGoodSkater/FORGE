const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w167Path = path.join(root, 'data', 'w167_approved_server_adapter_live_disabled_retry_ui.json');
const dataPath = path.join(root, 'data', 'w168_approved_server_adapter_live_disabled_retry_recovery.json');
const tracePath = path.join(root, 'trace_samples', 'w168_approved_server_adapter_live_disabled_retry_recovery_trace.json');
const reportPath = path.join(root, 'reports', 'w168_approved_server_adapter_live_disabled_retry_recovery.md');

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

function adapterConfig() {
  return {
    endpointUrl: '',
    CREATE_ENABLED: true,
    GOVERNED_SANDBOX_WRITE_ENABLED: true,
    QUEUE_SUBMIT_ENABLED: true,
    sandboxAccountAllowlist: ['SANDBOX_ACCOUNT_ID'],
    adapterApproved: true,
    mode: 'approved_server_adapter_live_disabled_retry_recovery'
  };
}

function operatorEvidence() {
  return {
    operatorName: 'Operator QA',
    reviewedAt: '2026-05-16T21:30:00.000Z',
    reviewDecision: 'operator_approved_queue_submit',
    typeToConfirm: 'QUEUE GOVERNED SANDBOX RUNNER',
    confirmedSandboxAccount: true,
    confirmedNoSubmit: true,
    notes: 'Harness-only retry recovery. Do not invoke.'
  };
}

async function main() {
  const w167 = readJson(w167Path);
  const hooks = loadHooks();
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const options = {
    adapterConfig: adapterConfig(),
    operatorEvidence: operatorEvidence(),
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only',
    completedResultJson: completedRunnerResultJson(),
    correctedCompletedResultJson: completedRunnerResultJson(),
    runnerTaskId: 'fixture_w168_runner_task_001',
    retryLimit: 2
  };
  const retryUi = hooks.approvedServerAdapterLiveDisabledRetryUiStatusV1(state, lane, page, recommendation, options);
  const recovery = hooks.approvedServerAdapterLiveDisabledRetryRecoveryHarnessV1(state, lane, page, recommendation, Object.assign({}, options, { retryUi }));
  const guardedHarness = {
    startsFromW167: w167.decision === 'PASS_RETRY_UI_STATUS_READY__VISUAL_TESTING_BLOCKED',
    recoveryHookReady: typeof hooks.approvedServerAdapterLiveDisabledRetryRecoveryHarnessV1 === 'function',
    timeoutUsesSameIdempotency: recovery.recoverySteps.some((step) => step.id === 'timeout_retry' && step.action === 'retry_same_idempotency_token' && step.idempotencyToken === recovery.requestSummary.idempotencyToken),
    duplicatePollsSameRunnerTask: recovery.recoverySteps.some((step) => step.id === 'duplicate_idempotency_polling' && step.action === 'continue_poll_existing_runner_task' && step.runnerTaskId === recovery.requestSummary.runnerTaskId),
    adapterErrorStopsSafely: recovery.recoverySteps.some((step) => step.id === 'adapter_error_stop' && step.action === 'stop_and_require_operator_evidence' && step.operatorEvidenceRequired === true),
    malformedCompletedCannotImport: recovery.importGuards.malformedCompleted.rejectedByW151 === true,
    correctedCompletedImportReadyAfterW151: recovery.importGuards.correctedCompleted.importReadyAfterW151 === true,
    handoffJsonStillRejected: recovery.importGuards.handoff.rejected === true,
    recoveryDoesNotMutateFinalNames: recovery.mutationGuard.finalGeneratedNamesUnchanged === true,
    recoveryDoesNotCreateOpenLinks: recovery.mutationGuard.noActiveOpenLinksCreated === true && recovery.recoverySteps.every((step) => step.activeOpenLinks === 0),
    operatorEvidenceRequirementsReady: recovery.operatorEvidenceRequirements.required === true && recovery.operatorEvidenceRequirements.decisions.length === 5,
    traceSamplesReady: recovery.traceSamples.length === 5
  };
  const noRegression = {
    noDrawerWrites: recovery.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: recovery.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: recovery.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    w151CompletedResultImportGuardPreserved: recovery.noRegression.w151CompletedResultImportGuardPreserved === true,
    consultantConfirmationRequired: recovery.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: recovery.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: recovery.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: recovery.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: recovery.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: recovery.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noLiveInvocation: recovery.noRegression.noLiveInvocation === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W168 models retry recovery only. Real invocation remains disabled, no records are written, and no Open links are created.'
  };
  const results = [];
  assertCase(results, 'w168_starts_from_w167_retry_ui', guardedHarness.startsFromW167, w167.decision);
  assertCase(results, 'w168_recovery_hook_ready', guardedHarness.recoveryHookReady && recovery.status === 'retry_recovery_harness_ready', recovery.status);
  assertCase(results, 'w168_timeout_retry_same_idempotency', guardedHarness.timeoutUsesSameIdempotency, JSON.stringify(recovery.recoverySteps));
  assertCase(results, 'w168_duplicate_idempotency_poll_same_task', guardedHarness.duplicatePollsSameRunnerTask, JSON.stringify(recovery.recoverySteps));
  assertCase(results, 'w168_adapter_error_stop_operator_evidence', guardedHarness.adapterErrorStopsSafely && guardedHarness.operatorEvidenceRequirementsReady, JSON.stringify(recovery.operatorEvidenceRequirements));
  assertCase(results, 'w168_malformed_rejected_corrected_import_ready', guardedHarness.malformedCompletedCannotImport && guardedHarness.correctedCompletedImportReadyAfterW151, JSON.stringify(recovery.importGuards));
  assertCase(results, 'w168_handoff_rejected_and_trace_samples_ready', guardedHarness.handoffJsonStillRejected && guardedHarness.traceSamplesReady, JSON.stringify(recovery.traceSamples));
  assertCase(results, 'w168_recovery_does_not_mutate_names_or_links', guardedHarness.recoveryDoesNotMutateFinalNames && guardedHarness.recoveryDoesNotCreateOpenLinks, JSON.stringify(recovery.mutationGuard));
  assertCase(results, 'w168_visual_testing_blocked', recovery.visualTestingBlocked === true && visualTestingDecision.visualTestingBlocked === true, visualTestingDecision.reason);
  assertCase(results, 'w168_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w168-approved-server-adapter-live-disabled-retry-recovery.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_retry_recovery_ready',
    decision: failures.length ? 'FAIL' : 'PASS_RETRY_RECOVERY_READY__VISUAL_TESTING_BLOCKED',
    retryRecoveryContract: {
      schema: recovery.schema,
      status: recovery.status,
      mode: recovery.mode,
      requestSummary: recovery.requestSummary,
      recoverySteps: recovery.recoverySteps,
      operatorEvidenceRequirements: recovery.operatorEvidenceRequirements,
      importGuards: recovery.importGuards,
      mutationGuard: recovery.mutationGuard,
      traceSamples: recovery.traceSamples
    },
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W169: Approved Server Adapter Live Transport Readiness Gate',
      prompt: 'Move through W169: Approved Server Adapter Live Transport Readiness Gate. Use the W168 retry recovery contract to define the final go/no-go gate before any live approved server adapter call: approved endpoint URL, deployment flags, sandbox allowlist, operator approval evidence, idempotency token, retry recovery readiness, rollback flag plan, and W151 result import guard. Keep real invocation disabled and do not write. Prove the drawer can decide ready vs blocked without making a request, no final generated names mutate, no Open links appear, and visual testing remains blocked. Do not request visual testing. Output live transport readiness gate, guarded harness, trace samples, W169 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w168-approved-server-adapter-live-disabled-retry-recovery-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    recoverySteps: recovery.recoverySteps,
    operatorEvidenceRequirements: recovery.operatorEvidenceRequirements,
    importGuards: recovery.importGuards,
    mutationGuard: recovery.mutationGuard,
    traceSamples: recovery.traceSamples,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W168 Approved Server Adapter Live-Disabled Retry Recovery Harness

Decision: ${contract.decision}

## Retry Recovery Contract
- Mode: ${recovery.mode}.
- Idempotency token: ${recovery.requestSummary.idempotencyToken}.
- Runner task id: ${recovery.requestSummary.runnerTaskId}.
- Invocation attempted: ${recovery.requestSummary.invocationAttempted}.
- Active Open links: ${recovery.requestSummary.activeOpenLinks}.

## Recovery Steps
${recovery.recoverySteps.map((step) => `- ${step.id}: ${step.action}; result=${step.result}; operatorEvidenceRequired=${step.operatorEvidenceRequired}; mutatesFinalGeneratedNames=${step.mutatesFinalGeneratedNames}; activeOpenLinks=${step.activeOpenLinks}`).join('\n')}

## Import Guards
- Malformed completed result rejected by W151: ${recovery.importGuards.malformedCompleted.rejectedByW151}.
- Corrected completed result import-ready after W151: ${recovery.importGuards.correctedCompleted.importReadyAfterW151}.
- Handoff JSON rejected: ${recovery.importGuards.handoff.rejected}.
- Active Open links before import: ${recovery.importGuards.activeOpenLinksBeforeImport}.

## Operator Evidence
- Required: ${recovery.operatorEvidenceRequirements.required}.
- Fields: ${recovery.operatorEvidenceRequirements.fields.join(', ')}.
- Decisions: ${recovery.operatorEvidenceRequirements.decisions.join(', ')}.

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
    console.error(`W168 approved server adapter retry recovery FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W168 approved server adapter retry recovery: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
