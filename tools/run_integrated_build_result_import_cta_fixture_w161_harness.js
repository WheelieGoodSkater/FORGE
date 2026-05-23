const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w160Path = path.join(root, 'data', 'w160_integrated_build_state_machine_ui_status.json');
const dataPath = path.join(root, 'data', 'w161_integrated_build_result_import_cta_fixture.json');
const tracePath = path.join(root, 'trace_samples', 'w161_integrated_build_result_import_cta_fixture_trace.json');
const reportPath = path.join(root, 'reports', 'w161_integrated_build_result_import_cta_fixture.md');

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
  const w160 = readJson(w160Path);
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
    runnerTaskId: 'fixture_w161_integrated_build_result_001',
    resultCapture: {
      status: 'completed_result_capture_ready',
      runnerTaskId: 'fixture_w161_integrated_build_result_001'
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
  const acceptedGuard = hooks.validateDccFinalNamingImportPayload(completedJson, state, lane, page, recommendation);
  const rejectedGuard = hooks.validateDccFinalNamingImportPayload(handoffPacket, state, lane, page, recommendation);
  const previewState = Object.assign({}, state, {
    dccFinalNamingResult: acceptedGuard.finalNaming
  });
  const navigationAfterGuardedImport = hooks.dccFinalNavigationModel(previewState, lane, page, recommendation);
  const renderedBuild = hooks.renderReviewView(state, lane, page, recommendation);

  const fixtureHandoffContract = {
    schema: 'idb.w161-fixture-handoff-contract.v1',
    startsFromW160Decision: w160.decision,
    ctaLabel: fixtureHandoff.ctaStatus.label,
    ctaEnabled: fixtureHandoff.ctaStatus.enabled,
    ctaAction: fixtureHandoff.ctaStatus.action,
    sourceFixtureStatus: fixtureHandoff.serverResultFixture.status,
    completedResultGuardStatus: fixtureHandoff.importGuard.completedResultStatus,
    handoffRejectionStatus: fixtureHandoff.importGuard.handoffStatus,
    generatedRecordOwner: fixtureHandoff.serverResultFixture.generatedRecordOwner,
    guardedRecordCount: fixtureHandoff.guardedImportPreview.recordCount,
    guardedOpenableCount: fixtureHandoff.guardedImportPreview.openableAfterGuardCount,
    activeOpenLinksBeforeImport: fixtureHandoff.guardedImportPreview.activeOpenLinksBeforeImport
  };
  const guardedHarness = {
    startsFromW160: w160.decision === 'PASS_BUILD_STATUS_UI_AND_IMPORT_CTA_READY__VISUAL_TESTING_BLOCKED',
    fixtureHookReady: typeof hooks.integratedBuildResultImportCtaFixtureHandoffV1 === 'function',
    completedResultAcceptedByW151: acceptedGuard.valid === true && fixtureHandoff.importGuard.completedResultAccepted === true,
    handoffJsonRejected: rejectedGuard.valid === false && rejectedGuard.status === 'handoff_packet_rejected' && fixtureHandoff.importGuard.handoffRejected === true,
    ctaConnectsToServerFixture: fixtureHandoff.ctaStatus.enabled === true && fixtureHandoff.serverResultFixture.finalGeneratedNamesJsonReady === true,
    numericIdsAndSupportedUrlsAccepted: fixtureHandoff.guardedImportPreview.openableAfterGuardCount >= 5 && fixtureHandoff.guardedImportPreview.allOpenableHaveRealUrls === true,
    noOpenLinksBeforeImport: fixtureHandoff.guardedImportPreview.activeOpenLinksBeforeImport === 0 && state.dccFinalNamingResult === null,
    navigationWouldUseOpenLinksOnlyAfterGuardedImport: navigationAfterGuardedImport.linkAuthoritySummary.verified_openable >= 5,
    renderedBuildStillShowsGuardedCta: /Open guarded result import/.test(renderedBuild) && /Build handoff JSON rejected/.test(renderedBuild)
  };
  const noRegression = {
    noDrawerWrites: fixtureHandoff.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: fixtureHandoff.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: fixtureHandoff.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: fixtureHandoff.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: fixtureHandoff.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    internalRunnerOwnership: fixtureHandoff.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: fixtureHandoff.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: fixtureHandoff.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: fixtureHandoff.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    noActiveOpenLinksBeforeImport: fixtureHandoff.noRegression.noActiveOpenLinksBeforeImport === true
  };
  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    visualTestingBlocked: true,
    reason: 'W161 uses a controlled server-result fixture only. Visual testing remains blocked until real approved server adapter execution returns completed runner result JSON.'
  };

  const results = [];
  assertCase(results, 'w161_starts_from_w160_ui_status_contract', guardedHarness.startsFromW160, w160.decision);
  assertCase(results, 'w161_fixture_handoff_hook_ready', guardedHarness.fixtureHookReady && fixtureHandoff.status === 'completed_result_fixture_ready_for_w151_import', fixtureHandoff.status);
  assertCase(results, 'w161_cta_connects_completed_result_fixture_to_w151', guardedHarness.ctaConnectsToServerFixture && guardedHarness.completedResultAcceptedByW151, JSON.stringify(fixtureHandoff.ctaStatus));
  assertCase(results, 'w161_handoff_json_rejected_by_import_guard', guardedHarness.handoffJsonRejected, JSON.stringify({ rejected: rejectedGuard.status, fixture: fixtureHandoff.importGuard.handoffStatus }));
  assertCase(results, 'w161_numeric_ids_and_supported_urls_required', guardedHarness.numericIdsAndSupportedUrlsAccepted, JSON.stringify(fixtureHandoff.guardedImportPreview.records));
  assertCase(results, 'w161_no_open_links_before_explicit_import', guardedHarness.noOpenLinksBeforeImport, JSON.stringify({ stateImport: state.dccFinalNamingResult, activeOpenLinksBeforeImport: fixtureHandoff.guardedImportPreview.activeOpenLinksBeforeImport }));
  assertCase(results, 'w161_navigation_links_only_after_guarded_import_preview', guardedHarness.navigationWouldUseOpenLinksOnlyAfterGuardedImport, JSON.stringify(navigationAfterGuardedImport.linkAuthoritySummary));
  assertCase(results, 'w161_rendered_build_keeps_guarded_cta_copy', guardedHarness.renderedBuildStillShowsGuardedCta, renderedBuild.slice(0, 1000));
  assertCase(results, 'w161_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w161-integrated-build-result-import-cta-fixture.v1',
    status: failures.length ? 'blocked' : 'result_import_cta_fixture_handoff_ready',
    decision: failures.length ? 'FAIL' : 'PASS_RESULT_IMPORT_CTA_FIXTURE_HANDOFF_READY__VISUAL_TESTING_BLOCKED',
    fixtureHandoffContract,
    guardedHarness,
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W162: Integrated Build Result Fixture Import State Commit Harness',
      prompt: 'Move through W162: Integrated Build Result Fixture Import State Commit Harness. Use the W161 controlled server-result fixture handoff to model the final drawer import commit step after W151 validation, still harness-only and real invocation disabled by default. Prove completed runner result JSON can update IDB final generated names only after W151 accepts numeric ids and supported NetSuite URLs, while handoff JSON remains rejected and no active Open links appear before import. Preserve no drawer writes, no drawer transaction writes, no drawer SuiteScript invocation outside the approved server adapter path, consultant confirmation, state authority and handoff parity, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Do not request visual testing. Output import commit contract, guarded harness, trace samples, W162 report, visual testing decision blocked, and best next Codex prompt.'
    },
    validatorGates: results
  };
  const trace = {
    schema: 'idb.w161-integrated-build-result-import-cta-fixture-trace.v1',
    decision: contract.decision,
    visualTestingBlocked: true,
    ctaStatus: fixtureHandoff.ctaStatus,
    completedResultGuardStatus: acceptedGuard.status,
    handoffRejectionStatus: rejectedGuard.status,
    openableAfterGuardCount: fixtureHandoff.guardedImportPreview.openableAfterGuardCount,
    activeOpenLinksBeforeImport: fixtureHandoff.guardedImportPreview.activeOpenLinksBeforeImport,
    noRegression,
    events: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W161 Integrated Build Result Import CTA Harness To Server Result Fixture

Decision: ${contract.decision}

## Fixture Handoff Contract
- Starts from W160: ${fixtureHandoffContract.startsFromW160Decision}.
- CTA: ${fixtureHandoffContract.ctaLabel}.
- CTA enabled: ${fixtureHandoffContract.ctaEnabled}.
- Source fixture status: ${fixtureHandoffContract.sourceFixtureStatus}.
- Completed result guard: ${fixtureHandoffContract.completedResultGuardStatus}.
- Handoff rejection guard: ${fixtureHandoffContract.handoffRejectionStatus}.
- Generated record owner: ${fixtureHandoffContract.generatedRecordOwner}.
- Guarded records: ${fixtureHandoffContract.guardedRecordCount}.
- Openable after W151 guard: ${fixtureHandoffContract.guardedOpenableCount}.
- Active Open links before import: ${fixtureHandoffContract.activeOpenLinksBeforeImport}.

## Guarded Harness
- Completed runner result accepted by W151: ${guardedHarness.completedResultAcceptedByW151}.
- Build handoff JSON rejected: ${guardedHarness.handoffJsonRejected}.
- Numeric ids and supported URLs required: ${guardedHarness.numericIdsAndSupportedUrlsAccepted}.
- No Open links before explicit import: ${guardedHarness.noOpenLinksBeforeImport}.
- Navigation would use Open links only after guarded import: ${guardedHarness.navigationWouldUseOpenLinksOnlyAfterGuardedImport}.

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
    console.error(`W161 fixture handoff FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W161 fixture handoff: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}`);
}

main().catch((err) => {
  console.error(err && err.stack || err);
  process.exit(1);
});
