const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w159Path = path.join(root, 'data', 'w159_integrated_build_harness_state_machine.json');
const dataPath = path.join(root, 'data', 'w160_integrated_build_state_machine_ui_status.json');
const tracePath = path.join(root, 'trace_samples', 'w160_integrated_build_state_machine_ui_status_trace.json');
const reportPath = path.join(root, 'reports', 'w160_integrated_build_state_machine_ui_status.md');

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
  const w159 = readJson(w159Path);
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
    notes: 'Operator approved W160 harness UI status and import CTA.'
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
    pollCycle: cycle
  });
  const ui = hooks.integratedBuildStateMachineUiStatusAndImportCtaV1(state, lane, page, recommendation, {
    transportBoundary: boundary,
    pollCycle: cycle,
    stateMachine
  });
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);
  const importedState = Object.assign({}, state, {
    dccFinalNamingResult: hooks.validateDccFinalNamingImportPayload(completedFinalGeneratedNamesJson(), state, lane, page, recommendation).finalNaming
  });
  const importedUi = hooks.integratedBuildStateMachineUiStatusAndImportCtaV1(importedState, lane, page, recommendation, {
    transportBoundary: boundary,
    pollCycle: cycle,
    stateMachine
  });

  const buildStatusUiContract = {
    schema: 'idb.w160-build-status-ui-contract.v1',
    sourceStateMachine: w159.buildStateMachineContract.actualStateOrder,
    renderedStatePath: ui.path.map((step) => step.state),
    currentState: ui.currentState,
    importCta: ui.importCta,
    importedImportCta: importedUi.importCta,
    copy: {
      statusHeading: 'Build status path',
      importHeading: 'Completed result import',
      blockedMessage: 'Visual testing and Open links stay blocked until the integrated Build runner result is returned and imported.'
    }
  };
  const guardedHarness = {
    startsFromW159StateMachine: w159.decision === 'PASS_BUILD_STATE_MACHINE_READY__VISUAL_TESTING_BLOCKED',
    uiHookReady: typeof hooks.integratedBuildStateMachineUiStatusAndImportCtaV1 === 'function',
    allStatesRendered: JSON.stringify(buildStatusUiContract.renderedStatePath) === JSON.stringify(w159.buildStateMachineContract.actualStateOrder),
    completedResultCtaEnabledOnlyForAwaitingImport: ui.currentState === 'completed_awaiting_w151_import' && ui.importCta.enabled === true && ui.importCta.targetView === 'trace',
    importCtaUsesW151Guard: ui.importCta.guardOwner === 'W151 completed runner result import guard' && ui.importCta.acceptsBuildHandoffJson === false,
    importedStateDisablesImportCta: importedUi.currentState === 'imported' && importedUi.importCta.enabled === false,
    renderedBuildShowsPathAndCta: /Build status path/.test(renderedBuild) && /Completed result import/.test(renderedBuild) && /Open guarded result import/.test(renderedBuild),
    noOpenLinksBeforeImportCta: ui.importCta.activeOpenLinksBeforeImport === 0,
    visualTestingBlocked: ui.visualTestingBlocked === true
  };
  const noRegression = {
    noDrawerWrites: ui.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: ui.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: ui.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: ui.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: ui.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    internalRunnerOwnership: ui.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: ui.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: ui.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: ui.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W160 renders harness-only Build status and a guarded import CTA. Visual testing stays blocked until the approved server adapter returns real governed runner results.'
  };

  const results = [];
  assertCase(results, 'w160_starts_from_w159_state_machine', guardedHarness.startsFromW159StateMachine, w159.decision);
  assertCase(results, 'w160_ui_hook_and_render_ready', guardedHarness.uiHookReady && guardedHarness.renderedBuildShowsPathAndCta, renderedBuild.slice(0, 900));
  assertCase(results, 'w160_renders_all_required_states', guardedHarness.allStatesRendered, JSON.stringify(buildStatusUiContract.renderedStatePath));
  assertCase(results, 'w160_import_cta_gated_to_completed_awaiting_w151_import', guardedHarness.completedResultCtaEnabledOnlyForAwaitingImport && guardedHarness.importCtaUsesW151Guard, JSON.stringify(ui.importCta));
  assertCase(results, 'w160_imported_state_disables_cta_after_guarded_import', guardedHarness.importedStateDisablesImportCta, JSON.stringify(importedUi.importCta));
  assertCase(results, 'w160_no_open_links_before_import_and_visual_blocked', guardedHarness.noOpenLinksBeforeImportCta && guardedHarness.visualTestingBlocked, JSON.stringify({ activeOpenLinksBeforeImport: ui.importCta.activeOpenLinksBeforeImport, visualTestingBlocked: ui.visualTestingBlocked }));
  assertCase(results, 'w160_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w160-integrated-build-state-machine-ui-status.v1',
    status: failures.length ? 'blocked' : 'build_state_machine_ui_status_ready',
    decision: failures.length ? 'FAIL' : 'PASS_BUILD_STATUS_UI_AND_IMPORT_CTA_READY__VISUAL_TESTING_BLOCKED',
    buildStatusUiContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W161: Integrated Build Result Import CTA Harness To Server Result Fixture',
      prompt: 'Move through W161: Integrated Build Result Import CTA Harness To Server Result Fixture. Use the W160 Build status UI and import CTA to connect the completed-result awaiting state to a controlled server-result fixture handoff, while keeping real invocation disabled by default. Prove the CTA accepts only W151 completed runner result JSON with numeric ids and supported NetSuite URLs, rejects handoff JSON, preserves no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output fixture handoff contract, guarded harness, trace samples, W161 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w160-integrated-build-state-machine-ui-status-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    currentState: ui.currentState,
    statePath: buildStatusUiContract.renderedStatePath,
    importCta: ui.importCta,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W160 Integrated Build State Machine UI Status And Import CTA

Decision: ${contract.decision}

## Build Status UI Contract
- Source state order: ${buildStatusUiContract.sourceStateMachine.join(' -> ')}.
- Rendered state path: ${buildStatusUiContract.renderedStatePath.join(' -> ')}.
- Current harness state: ${buildStatusUiContract.currentState}.
- Import CTA: ${buildStatusUiContract.importCta.label}.
- Import target: ${buildStatusUiContract.importCta.targetView || 'none'}.
- Guard owner: ${buildStatusUiContract.importCta.guardOwner}.
- Build handoff JSON accepted by CTA: ${buildStatusUiContract.importCta.acceptsBuildHandoffJson}.

## Guarded Harness
- UI hook ready: ${guardedHarness.uiHookReady}.
- All states rendered: ${guardedHarness.allStatesRendered}.
- CTA enabled only for completed awaiting W151 import: ${guardedHarness.completedResultCtaEnabledOnlyForAwaitingImport}.
- Imported state disables CTA: ${guardedHarness.importedStateDisablesImportCta}.
- No Open links before import CTA: ${guardedHarness.noOpenLinksBeforeImportCta}.

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
    console.error(`W160 Build status UI FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W160 Build status UI: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
