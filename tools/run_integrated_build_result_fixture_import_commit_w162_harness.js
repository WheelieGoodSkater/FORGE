const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w161Path = path.join(root, 'data', 'w161_integrated_build_result_import_cta_fixture.json');
const dataPath = path.join(root, 'data', 'w162_integrated_build_result_fixture_import_commit.json');
const tracePath = path.join(root, 'trace_samples', 'w162_integrated_build_result_fixture_import_commit_trace.json');
const reportPath = path.join(root, 'reports', 'w162_integrated_build_result_fixture_import_commit.md');

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

async function main() {
  const w161 = readJson(w161Path);
  const hooks = loadHooks();
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const completedJson = completedRunnerResultJson();
  const serverResultFixture = {
    schema: 'idb.integrated-build-approved-server-adapter-transport-result.v1',
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: 'fixture_w162_integrated_build_result_001',
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId: 'fixture_w162_integrated_build_result_001'
    },
    finalGeneratedNamesJson: completedJson,
    activeOpenLinks: 0
  };
  state.integratedBuildRunnerResult = serverResultFixture;

  const handoffPacket = hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation);
  const fixtureHandoff = hooks.integratedBuildResultImportCtaFixtureHandoffV1(state, lane, page, recommendation, {
    serverResultFixture,
    handoffPacket
  });
  const commit = hooks.integratedBuildResultFixtureImportStateCommitV1(state, lane, page, recommendation, {
    fixtureHandoff,
    completedResultJson: completedJson,
    serverResultFixture,
    handoffPacket
  });
  const handoffCommit = hooks.integratedBuildResultFixtureImportStateCommitV1(state, lane, page, recommendation, {
    fixtureHandoff,
    completedResultJson: handoffPacket,
    serverResultFixture: Object.assign({}, serverResultFixture, { finalGeneratedNamesJson: handoffPacket }),
    handoffPacket
  });
  const committedState = Object.assign({}, state, commit.statePatch);
  const finalNaming = hooks.dccFinalNamingResultV1(committedState.dccFinalNamingResult, committedState, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(committedState, lane, page, recommendation);
  const renderedBuild = hooks.renderReviewView(committedState, lane, page, recommendation);
  const selectedMove = lane.moves[committedState.selectedMoveIndex] || lane.moves[0];
  const action = {
    id: 'prove',
    label: 'Prove',
    title: 'Prove in NetSuite',
    copy: 'Show the proof record and connect it to the business outcome.'
  };
  const renderedRun = hooks.renderRunView(committedState, lane, page, recommendation, selectedMove, action, '');

  const importCommitContract = {
    schema: 'idb.w162-import-commit-contract.v1',
    startsFromW161Decision: w161.decision,
    commitStatus: commit.status,
    commitMode: commit.commitMode,
    commitTarget: commit.commitTarget,
    completedResultGuardStatus: commit.importGuards.completedResultStatus,
    handoffRejectionStatus: commit.importGuards.handoffStatus,
    finalNamesImported: commit.committedStatePreview.finalNamesImported,
    committedRecordCount: commit.committedStatePreview.recordCount,
    openableAfterCommit: commit.linkAuthority.openableAfterCommit,
    activeOpenLinksBeforeImport: commit.linkAuthority.activeOpenLinksBeforeImport,
    rollbackAction: commit.rollback.action
  };
  const guardedHarness = {
    startsFromW161: w161.decision === 'PASS_RESULT_IMPORT_CTA_FIXTURE_HANDOFF_READY__VISUAL_TESTING_BLOCKED',
    commitHookReady: typeof hooks.integratedBuildResultFixtureImportStateCommitV1 === 'function',
    completedResultCommitsOnlyAfterW151: commit.commitAllowed === true && commit.importGuards.completedResultAccepted === true && commit.statePatch.dccFinalNamingResult.finalNamesImported === true,
    handoffJsonRejectedAndCannotCommit: handoffCommit.commitAllowed === false && handoffCommit.importGuards.handoffRejected === true && !handoffCommit.statePatch.dccFinalNamingResult,
    originalStateHasNoFinalNamesBeforeCommit: state.dccFinalNamingResult === null && commit.linkAuthority.activeOpenLinksBeforeImport === 0,
    committedStateUsesFinalNames: finalNaming.finalNamesImported === true && navigation.status === 'using_dcc_final_names' && navigation.runCanUseImportedFinalNames === true,
    openLinksOnlyAfterCommit: navigation.linkAuthoritySummary.verified_openable >= 5 && commit.linkAuthority.noActiveOpenLinksWithoutRealUrls === true,
    buildAndRunRenderCommittedNames: /Final generated names imported/.test(renderedBuild) && /Use final generated names/.test(renderedRun),
    rollbackScopedToDrawerState: commit.rollback.action === 'clear_state_dccFinalNamingResult_only' && commit.rollback.netSuiteRecordRollbackFromDrawer === 'none'
  };
  const noRegression = {
    noDrawerWrites: commit.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: commit.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: commit.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: commit.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: commit.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    internalRunnerOwnership: commit.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: commit.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: commit.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: commit.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noActiveOpenLinksBeforeImport: commit.noRegression.noActiveOpenLinksBeforeImport === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W162 commits a controlled fixture into drawer state only after W151 validation. Real server adapter execution and visual NetSuite testing remain blocked.'
  };

  const results = [];
  assertCase(results, 'w162_starts_from_w161_fixture_handoff', guardedHarness.startsFromW161, w161.decision);
  assertCase(results, 'w162_import_commit_hook_ready', guardedHarness.commitHookReady && commit.status === 'fixture_import_commit_ready', commit.status);
  assertCase(results, 'w162_completed_result_commits_only_after_w151', guardedHarness.completedResultCommitsOnlyAfterW151, JSON.stringify(importCommitContract));
  assertCase(results, 'w162_handoff_json_rejected_and_cannot_commit', guardedHarness.handoffJsonRejectedAndCannotCommit, JSON.stringify({ status: handoffCommit.status, guards: handoffCommit.importGuards }));
  assertCase(results, 'w162_no_open_links_before_import', guardedHarness.originalStateHasNoFinalNamesBeforeCommit, JSON.stringify({ beforeImport: state.dccFinalNamingResult, activeOpenLinksBeforeImport: commit.linkAuthority.activeOpenLinksBeforeImport }));
  assertCase(results, 'w162_committed_state_updates_final_generated_names', guardedHarness.committedStateUsesFinalNames && guardedHarness.buildAndRunRenderCommittedNames, JSON.stringify({ finalNaming: finalNaming.displayStatus, navigation: navigation.status }));
  assertCase(results, 'w162_open_links_only_after_commit_and_real_urls', guardedHarness.openLinksOnlyAfterCommit, JSON.stringify(commit.linkAuthority));
  assertCase(results, 'w162_rollback_scope_is_drawer_state_only', guardedHarness.rollbackScopedToDrawerState, JSON.stringify(commit.rollback));
  assertCase(results, 'w162_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w162-integrated-build-result-fixture-import-commit.v1',
    status: failures.length ? 'blocked' : 'fixture_import_commit_ready',
    decision: failures.length ? 'FAIL' : 'PASS_FIXTURE_IMPORT_COMMIT_READY__VISUAL_TESTING_BLOCKED',
    importCommitContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W163: Approved Server Adapter Result Contract Alignment',
      prompt: 'Move through W163: Approved Server Adapter Result Contract Alignment. Use the W162 fixture import commit contract to align the approved NetSuite server adapter response shape with the completed runner result JSON that IDB can import. Keep real invocation disabled by default and do not enable writes. Prove the adapter response can return queued, polling, completed, and error envelopes that normalize into the W157-W162 state/commit path, with completed results requiring W151 numeric ids and supported NetSuite URLs before IDB final generated names update. Preserve no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output server adapter result alignment contract, guarded harness, trace samples, W163 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w162-integrated-build-result-fixture-import-commit-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    commitStatus: commit.status,
    completedResultGuardStatus: commit.importGuards.completedResultStatus,
    handoffRejectionStatus: commit.importGuards.handoffStatus,
    activeOpenLinksBeforeImport: commit.linkAuthority.activeOpenLinksBeforeImport,
    openableAfterCommit: commit.linkAuthority.openableAfterCommit,
    rollback: commit.rollback,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W162 Integrated Build Result Fixture Import State Commit Harness

Decision: ${contract.decision}

## Import Commit Contract
- Starts from W161: ${importCommitContract.startsFromW161Decision}.
- Commit status: ${importCommitContract.commitStatus}.
- Commit mode: ${importCommitContract.commitMode}.
- Commit target: ${importCommitContract.commitTarget}.
- Completed result guard: ${importCommitContract.completedResultGuardStatus}.
- Handoff rejection guard: ${importCommitContract.handoffRejectionStatus}.
- Final names imported: ${importCommitContract.finalNamesImported}.
- Committed record count: ${importCommitContract.committedRecordCount}.
- Openable after commit: ${importCommitContract.openableAfterCommit}.
- Active Open links before import: ${importCommitContract.activeOpenLinksBeforeImport}.
- Rollback action: ${importCommitContract.rollbackAction}.

## Guarded Harness
- Completed result commits only after W151: ${guardedHarness.completedResultCommitsOnlyAfterW151}.
- Handoff JSON rejected and cannot commit: ${guardedHarness.handoffJsonRejectedAndCannotCommit}.
- Original state has no final names before commit: ${guardedHarness.originalStateHasNoFinalNamesBeforeCommit}.
- Committed state uses final names: ${guardedHarness.committedStateUsesFinalNames}.
- Open links only after commit: ${guardedHarness.openLinksOnlyAfterCommit}.
- Rollback scoped to drawer state: ${guardedHarness.rollbackScopedToDrawerState}.

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
    console.error(`W162 import commit FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W162 import commit: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
