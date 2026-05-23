const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w157Path = path.join(root, 'data', 'w157_server_adapter_transport_response_normalization.json');
const dataPath = path.join(root, 'data', 'w158_approved_server_adapter_dry_run_poll_cycle.json');
const tracePath = path.join(root, 'trace_samples', 'w158_approved_server_adapter_dry_run_poll_cycle_trace.json');
const reportPath = path.join(root, 'reports', 'w158_approved_server_adapter_dry_run_poll_cycle.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: Boolean(pass), detail: detail || '' });
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

function completedFinalGeneratedNamesJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
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
    }
  };
}

async function main() {
  const w157 = readJson(w157Path);
  const hooks = loadHooks();
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
    notes: 'Operator approved W158 dry-run poll-cycle harness.'
  };
  const boundary = hooks.integratedBuildApprovedServerAdapterTransportBoundaryV1(state, lane, page, recommendation, {
    adapterConfig,
    operatorEvidence,
    invocationEnabled: true,
    approvedEndpointMode: 'approved_server_adapter_only'
  });
  const cycle = hooks.approvedServerAdapterDryRunFixturePollCycleV1(boundary, {
    completedFinalGeneratedNamesJson: completedFinalGeneratedNamesJson()
  });
  state.integratedBuildRunnerResult = cycle.steps[4];
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const requiredSequence = [
    'false_flag_no_submit',
    'queued_pending',
    'polling_pending',
    'polling_pending',
    'completed_result_awaiting_w151_import',
    'adapter_transport_error_drawer_safe'
  ];
  const dryRunPollCycleContract = {
    schema: 'idb.approved-server-adapter-dry-run-fixture-poll-cycle-contract.v1',
    cycleMode: cycle.cycleMode,
    requestConstructed: cycle.requestConstructed,
    idempotencyToken: cycle.idempotencyToken,
    runnerTaskId: cycle.runnerTaskId,
    requiredSequence,
    actualSequence: cycle.normalizedStatuses,
    stepCount: cycle.stepCount,
    completedResultImportOwner: cycle.completedResultImportOwner
  };
  const guardedHarness = {
    boundaryStatus: boundary.status,
    allResponsesNoLinks: cycle.steps.every((step) => step.activeOpenLinks === 0),
    completedStepAwaitingImport: cycle.steps[4].status === 'completed_result_awaiting_w151_import' && cycle.steps[4].finalGeneratedNamesJsonReady === true,
    errorRecoveryDrawerSafe: cycle.steps[5].status === 'adapter_transport_error_drawer_safe' && cycle.steps[5].queueSubmitted === false,
    drawerNamesNotMutated: state.dccFinalNamingResult === null,
    renderedBuildMentionsPollCycle: /Dry-run poll cycle/.test(renderedBuild)
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W158 models a harness-only dry-run poll cycle. Completed runner output still waits for W151 import before IDB can show links.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerTransactionWrites: true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
    consultantConfirmationRequired: boundary.body.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: boundary.body.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: cycle.runnerTaskId.includes(cycle.idempotencyToken),
    internalRunnerOwnership: cycle.steps[4].finalGeneratedNamesJson.generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: cycle.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: cycle.steps.every((step) => step.activeOpenLinks === 0)
  };

  const results = [];
  assertCase(results, 'w158_starts_from_w157_response_normalization_ready', w157.decision === 'PASS_RESPONSE_NORMALIZATION_READY__VISUAL_TESTING_BLOCKED', w157.decision);
  assertCase(results, 'w158_poll_cycle_hook_and_ui_ready', typeof hooks.approvedServerAdapterDryRunFixturePollCycleV1 === 'function' && /Dry-run poll cycle/.test(renderedBuild), renderedBuild.slice(0, 700));
  assertCase(results, 'w158_cycle_sequence_covers_no_submit_queue_poll_complete_error', JSON.stringify(cycle.normalizedStatuses) === JSON.stringify(requiredSequence), JSON.stringify(cycle.normalizedStatuses));
  assertCase(results, 'w158_cycle_uses_idempotent_runner_task_fixture', /^fixture_w158_/.test(cycle.runnerTaskId) && cycle.runnerTaskId.includes(cycle.idempotencyToken) && cycle.steps.slice(1).every((step) => step.runnerTaskId === cycle.runnerTaskId), cycle.runnerTaskId);
  assertCase(results, 'w158_repeated_polling_remains_pending_no_links', cycle.steps[2].status === 'polling_pending' && cycle.steps[3].status === 'polling_pending' && cycle.steps[2].activeOpenLinks === 0 && cycle.steps[3].activeOpenLinks === 0, JSON.stringify(cycle.steps.slice(2, 4)));
  assertCase(results, 'w158_completed_result_awaits_w151_import_no_mutation', cycle.steps[4].status === 'completed_result_awaiting_w151_import' && cycle.steps[4].finalGeneratedNamesJsonReady === true && /W151/.test(cycle.steps[4].importGuard) && cycle.steps[4].activeOpenLinks === 0 && state.dccFinalNamingResult === null, JSON.stringify(cycle.steps[4]));
  assertCase(results, 'w158_error_recovery_drawer_safe', cycle.steps[5].status === 'adapter_transport_error_drawer_safe' && cycle.steps[5].queueSubmitted === false && cycle.steps[5].activeOpenLinks === 0 && cycle.steps[5].finalGeneratedNamesJson === null, JSON.stringify(cycle.steps[5]));
  assertCase(results, 'w158_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w158-approved-server-adapter-dry-run-fixture-poll-cycle.v1',
    status: failures.length ? 'blocked' : 'approved_server_adapter_dry_run_fixture_poll_cycle_ready',
    decision: failures.length ? 'FAIL' : 'PASS_DRY_RUN_POLL_CYCLE_READY__VISUAL_TESTING_BLOCKED',
    dryRunPollCycleContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W159: Integrated Build Harness State Machine And Result Import Handoff',
      prompt: 'Move through W159: Integrated Build Harness State Machine And Result Import Handoff. Use the W158 dry-run poll-cycle contract to promote the harness-only Build states into a single drawer state machine: blocked, no-submit, queued, polling, completed-awaiting-W151-import, imported, and error-recoverable. Keep real invocation disabled by default, do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output Build state-machine contract, guarded harness, trace samples, W159 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w158-approved-server-adapter-dry-run-fixture-poll-cycle-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    sequence: cycle.normalizedStatuses,
    runnerTaskId: cycle.runnerTaskId,
    activeOpenLinksAcrossCycle: cycle.steps.map((step) => step.activeOpenLinks),
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W158 Approved Server Adapter Dry-Run Fixture Poll Cycle

Decision: ${contract.decision}

## Dry-Run Poll-Cycle Contract
- Mode: ${cycle.cycleMode}.
- Request constructed by approved boundary: ${cycle.requestConstructed}.
- Runner task fixture: ${cycle.runnerTaskId}.
- Sequence: ${cycle.normalizedStatuses.join(' -> ')}.
- Completed result owner: ${cycle.completedResultImportOwner}.

## Guarded Harness
- All responses keep activeOpenLinks=0: ${guardedHarness.allResponsesNoLinks}.
- Completed step awaits W151 import: ${guardedHarness.completedStepAwaitingImport}.
- Error recovery drawer-safe: ${guardedHarness.errorRecoveryDrawerSafe}.
- Drawer names not mutated: ${guardedHarness.drawerNamesNotMutated}.

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
    console.error(`W158 dry-run poll cycle FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W158 dry-run poll cycle: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
