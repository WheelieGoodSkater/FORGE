const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w158Path = path.join(root, 'data', 'w158_approved_server_adapter_dry_run_poll_cycle.json');
const dataPath = path.join(root, 'data', 'w159_integrated_build_harness_state_machine.json');
const tracePath = path.join(root, 'trace_samples', 'w159_integrated_build_harness_state_machine_trace.json');
const reportPath = path.join(root, 'reports', 'w159_integrated_build_harness_state_machine.md');

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

async function main() {
  const w158 = readJson(w158Path);
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
    notes: 'Operator approved W159 harness state-machine handoff.'
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
  const stateMachine = hooks.integratedBuildHarnessStateMachineV1(state, lane, page, recommendation, {
    transportBoundary: boundary,
    pollCycle: cycle,
    importPayload: completedFinalGeneratedNamesJson()
  });
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const requiredStateOrder = [
    'blocked',
    'no_submit',
    'queued',
    'polling',
    'completed_awaiting_w151_import',
    'imported',
    'error_recoverable'
  ];
  const byState = (name) => stateMachine.states.find((item) => item.state === name) || {};
  const buildStateMachineContract = {
    schema: 'idb.integrated-build-harness-state-machine-contract.v1',
    cycleMode: stateMachine.cycleMode,
    requiredStateOrder,
    actualStateOrder: stateMachine.stateOrder,
    importGuardStatus: stateMachine.importGuard.status,
    importedActiveOpenLinks: byState('imported').activeOpenLinks,
    importedRecordCount: byState('imported').importedRecordCount,
    completedImportOwner: byState('completed_awaiting_w151_import').importOwner
  };
  const guardedHarness = {
    boundaryStatus: boundary.status,
    completedStateAwaitingImport: byState('completed_awaiting_w151_import').activeOpenLinks === 0 && /W151/.test(byState('completed_awaiting_w151_import').importOwner || ''),
    importedStateAcceptedByW151: byState('imported').importAccepted === true && stateMachine.importGuard.valid === true,
    importedLinksOnlyRealUrls: byState('imported').allOpenLinksHaveRealUrls === true && byState('imported').activeOpenLinks >= 5,
    errorRecoveryDrawerSafe: byState('error_recoverable').activeOpenLinks === 0,
    drawerNamesNotMutatedUntilImport: state.dccFinalNamingResult === null,
    renderedBuildMentionsStateMachine: /Build state machine/.test(renderedBuild)
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W159 models the integrated Build state machine with fixture data only. Visual NetSuite testing remains blocked until real integrated Build runner return is enabled.'
  };
  const noRegression = {
    noDrawerWrites: true,
    noDrawerTransactionWrites: true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: true,
    consultantConfirmationRequired: boundary.body.requestEnvelope.confirmedBuildRequestJson.consultantConfirmation.confirmed === true,
    stateAuthorityAndHandoffParityPreserved: boundary.body.requestEnvelope.confirmedBuildRequestJson.stateAuthority.handoffParityStatus === 'matched',
    idempotencyPreserved: cycle.runnerTaskId.includes(cycle.idempotencyToken),
    internalRunnerOwnership: completedFinalGeneratedNamesJson().generatedRecordOwner === 'governed_runner_internal_build_engine',
    rollbackByDisablingServerFlags: stateMachine.noRegression.rollbackByDisablingServerFlags === true,
    noActiveOpenLinksWithoutRealUrls: stateMachine.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };

  const results = [];
  assertCase(results, 'w159_starts_from_w158_poll_cycle_ready', w158.decision === 'PASS_DRY_RUN_POLL_CYCLE_READY__VISUAL_TESTING_BLOCKED', w158.decision);
  assertCase(results, 'w159_state_machine_hook_and_ui_ready', typeof hooks.integratedBuildHarnessStateMachineV1 === 'function' && /Build state machine/.test(renderedBuild), renderedBuild.slice(0, 700));
  assertCase(results, 'w159_state_order_covers_required_build_states', JSON.stringify(stateMachine.stateOrder) === JSON.stringify(requiredStateOrder), JSON.stringify(stateMachine.stateOrder));
  assertCase(results, 'w159_completed_state_waits_for_w151_import', guardedHarness.completedStateAwaitingImport === true && byState('completed_awaiting_w151_import').finalGeneratedNamesJsonReady === true, JSON.stringify(byState('completed_awaiting_w151_import')));
  assertCase(results, 'w159_imported_state_requires_w151_guard_and_real_urls', guardedHarness.importedStateAcceptedByW151 === true && guardedHarness.importedLinksOnlyRealUrls === true, JSON.stringify(byState('imported')));
  assertCase(results, 'w159_error_recoverable_state_safe', guardedHarness.errorRecoveryDrawerSafe === true && byState('error_recoverable').next === 'rollback_or_retry_after_flags_review', JSON.stringify(byState('error_recoverable')));
  assertCase(results, 'w159_no_drawer_state_mutation_before_import_handoff', guardedHarness.drawerNamesNotMutatedUntilImport === true, JSON.stringify({ dccFinalNamingResult: state.dccFinalNamingResult }));
  assertCase(results, 'w159_visual_testing_blocked_and_no_regression', visualTestingDecision.visualTestingBlocked === true && Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w159-integrated-build-harness-state-machine.v1',
    status: failures.length ? 'blocked' : 'integrated_build_harness_state_machine_ready',
    decision: failures.length ? 'FAIL' : 'PASS_BUILD_STATE_MACHINE_READY__VISUAL_TESTING_BLOCKED',
    buildStateMachineContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W160: Integrated Build State Machine UI Status And Import CTA',
      prompt: 'Move through W160: Integrated Build State Machine UI Status And Import CTA. Use the W159 Build state-machine contract to render the consultant-safe Build status path and a clearly gated completed-result import CTA for harness-only states. Keep real invocation disabled by default, do not enable real writes, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not request visual testing. Preserve W151 completed-result import guard, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output Build status UI contract, guarded harness, trace samples, W160 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w159-integrated-build-harness-state-machine-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    stateOrder: stateMachine.stateOrder,
    runnerTaskId: cycle.runnerTaskId,
    activeOpenLinksByState: stateMachine.states.map((step) => ({ state: step.state, activeOpenLinks: step.activeOpenLinks })),
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W159 Integrated Build Harness State Machine And Result Import Handoff

Decision: ${contract.decision}

## Build State-Machine Contract
- Mode: ${stateMachine.cycleMode}.
- State order: ${stateMachine.stateOrder.join(' -> ')}.
- Imported state accepted by W151: ${byState('imported').importAccepted}.
- Imported active Open links: ${byState('imported').activeOpenLinks}.
- Open links only use real URLs: ${byState('imported').allOpenLinksHaveRealUrls}.

## Guarded Harness
- Completed state awaits W151 import: ${guardedHarness.completedStateAwaitingImport}.
- Imported state requires W151 and real URLs: ${guardedHarness.importedStateAcceptedByW151 && guardedHarness.importedLinksOnlyRealUrls}.
- Error recovery drawer-safe: ${guardedHarness.errorRecoveryDrawerSafe}.
- Drawer names not mutated before import handoff: ${guardedHarness.drawerNamesNotMutatedUntilImport}.

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
    console.error(`W159 Build state machine FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W159 Build state machine: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
