const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w175Path = path.join(root, 'data', 'w175_governed_runner_result_poll_import_gate.json');
const dataPath = path.join(root, 'data', 'w176_completed_runner_result_import_commit.json');
const tracePath = path.join(root, 'trace_samples', 'w176_completed_runner_result_import_commit_trace.json');
const reportPath = path.join(root, 'reports', 'w176_completed_runner_result_import_commit.md');

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

async function main() {
  const w175 = readJson(w175Path);
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const completedGate = w175.samples.completed;
  const pendingGate = w175.samples.pending;
  const adapterErrorGate = w175.samples.adapterErrorFromW174;
  const completedResultJson = completedGate.resultJsonEvidence.completedResultJson;

  const commit = hooks.completedRunnerResultImportCommitBuildReturnSurfaceV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollImportGate: completedGate,
      pendingPollImportGate: pendingGate,
      adapterErrorPollImportGate: adapterErrorGate,
      completedResultJson
    }
  );
  const pendingNoCommit = hooks.completedRunnerResultImportCommitBuildReturnSurfaceV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollImportGate: pendingGate,
      pendingPollImportGate: pendingGate,
      adapterErrorPollImportGate: adapterErrorGate,
      completedResultJson: null
    }
  );
  const adapterErrorNoCommit = hooks.completedRunnerResultImportCommitBuildReturnSurfaceV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollImportGate: adapterErrorGate,
      pendingPollImportGate: pendingGate,
      adapterErrorPollImportGate: adapterErrorGate,
      completedResultJson: null
    }
  );

  const importCommitContract = {
    importOwner: 'W151 completed runner result import guard',
    commitTarget: 'state.dccFinalNamingResult',
    commitMode: 'drawer_local_result_import_only_no_record_creation',
    recordsCreatedByDrawer: false,
    suiteScriptInvokedByDrawer: false,
    openLinksRequireImportedNumericIdsAndSupportedUrls: true
  };
  const guardedHarness = {
    startsFromW175: w175.decision === 'PASS_GOVERNED_RUNNER_RESULT_POLL_IMPORT_GATE_READY__COMPLETED_RESULT_IMPORT_READY__VISUAL_TESTING_BLOCKED',
    commitHookReady: typeof hooks.completedRunnerResultImportCommitBuildReturnSurfaceV1 === 'function',
    completedCommitAllowed: commit.status === 'completed_runner_result_import_committed' &&
      commit.commitAllowed === true &&
      commit.importGuards.completedResultAccepted === true &&
      commit.mutationGuard.completedFinalNamesMutatedOnlyAfterW151 === true,
    pendingDoesNotMutate: pendingNoCommit.commitAllowed === false &&
      pendingNoCommit.status === 'completed_runner_result_import_commit_blocked' &&
      pendingNoCommit.mutationGuard.pendingFinalNamesMutated === false,
    adapterErrorDoesNotMutate: adapterErrorNoCommit.commitAllowed === false &&
      adapterErrorNoCommit.status === 'completed_runner_result_import_commit_blocked' &&
      adapterErrorNoCommit.mutationGuard.adapterErrorFinalNamesMutated === false,
    buildRunUseImportedNames: commit.buildSurface.finalNamesImported === true &&
      commit.buildSurface.customer === 'Ariat International Outdoor Retail Account' &&
      commit.runSurface.runCanUseImportedFinalNames === true &&
      commit.navigationAfterCommit.runCanUseImportedFinalNames === true,
    verifiedOpenLinksReady: commit.linkAuthority.importedUrlsReadyForTargetedVisual === true &&
      commit.linkAuthority.supportedOpenLinksAfterCommit >= 5 &&
      commit.linkAuthority.noActiveOpenLinksWithoutRealUrls === true,
    noActiveOpenLinksBeforeImport: commit.linkAuthority.activeOpenLinksBeforeImport === 0,
    traceSamplesReady: Array.isArray(commit.traceSamples) &&
      commit.traceSamples.length >= 3 &&
      commit.traceSamples.some((sample) => sample.event === 'w176_build_run_return_surface')
  };
  const noRegression = {
    noDrawerWrites: commit.noRegression.noDrawerWrites === true,
    noDrawerTransactionWrites: commit.noRegression.noDrawerTransactionWrites === true,
    noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath: commit.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true,
    consultantConfirmationRequired: commit.noRegression.consultantConfirmationRequired === true,
    stateAuthorityAndHandoffParityPreserved: commit.noRegression.stateAuthorityAndHandoffParityPreserved === true,
    idempotencyPreserved: commit.noRegression.idempotencyPreserved === true,
    internalRunnerOwnership: commit.noRegression.internalRunnerOwnership === true,
    rollbackByDisablingServerFlags: commit.noRegression.rollbackByDisablingServerFlags === true,
    w151CompletedResultImportGuardPreserved: commit.noRegression.w151CompletedResultImportGuardPreserved === true,
    noActiveOpenLinksWithoutRealUrls: commit.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };
  const visualTestingDecision = {
    visualTestingBlocked: true,
    importedUrlsReadyForTargetedVisual: commit.linkAuthority.importedUrlsReadyForTargetedVisual === true,
    visualNetSuiteTestingRequiredNow: false,
    reason: 'W176 proves imported URL readiness in harness but does not request visual testing. Targeted Open-link visual verification can start only after this imported URL state is installed in IDB.'
  };

  const results = [];
  assertCase(results, 'w176_starts_from_w175_import_ready_gate', guardedHarness.startsFromW175, w175.decision);
  assertCase(results, 'w176_commit_hook_ready', guardedHarness.commitHookReady, 'completedRunnerResultImportCommitBuildReturnSurfaceV1');
  assertCase(results, 'w176_completed_commit_allowed_after_w151', guardedHarness.completedCommitAllowed, JSON.stringify(commit.importGuards));
  assertCase(results, 'w176_pending_and_adapter_error_do_not_mutate', guardedHarness.pendingDoesNotMutate && guardedHarness.adapterErrorDoesNotMutate, JSON.stringify({ pending: pendingNoCommit.status, adapterError: adapterErrorNoCommit.status }));
  assertCase(results, 'w176_build_run_use_imported_names', guardedHarness.buildRunUseImportedNames, JSON.stringify({ build: commit.buildSurface, run: commit.runSurface }));
  assertCase(results, 'w176_verified_open_links_ready', guardedHarness.verifiedOpenLinksReady && guardedHarness.noActiveOpenLinksBeforeImport, JSON.stringify(commit.linkAuthority));
  assertCase(results, 'w176_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(commit.traceSamples));
  assertCase(results, 'w176_no_regression_boundaries_preserved', Object.values(noRegression).every(Boolean), JSON.stringify(noRegression));
  assertCase(results, 'w176_visual_testing_blocked_until_imported_urls_ready', visualTestingDecision.visualTestingBlocked === true && visualTestingDecision.importedUrlsReadyForTargetedVisual === true && visualTestingDecision.visualNetSuiteTestingRequiredNow === false, visualTestingDecision.reason);

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w176-completed-runner-result-import-commit.v1',
    status: 'completed_runner_result_import_commit_ready',
    decision: failures.length
      ? 'FAIL_COMPLETED_RUNNER_RESULT_IMPORT_COMMIT'
      : 'PASS_COMPLETED_RUNNER_RESULT_IMPORT_COMMIT_READY__BUILD_RUN_URLS_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    importCommitContract,
    guardedHarness,
    samples: {
      commit,
      pendingNoCommit,
      adapterErrorNoCommit
    },
    noRegression,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W177: Imported URL Targeted Open-Link Verification Packet',
      prompt: 'Move through W177: Imported URL Targeted Open-Link Verification Packet. Use the W176 completed runner result import commit to prepare the narrow targeted Open-link verification packet for Customer, demo transaction, hero item, matrix/proof item, and component item. Do not create records from the drawer, do not invoke SuiteScript from the drawer, and do not broaden visual testing. Prove the imported Build/Run names and verified NetSuite URLs are ready for targeted operator verification, preserve pending/error no-mutation behavior, and keep broader visual testing blocked. Output targeted verification packet, exact operator steps, trace samples, W177 report, visual testing decision targeted-only, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w176-completed-runner-result-import-commit-trace.v1',
    generatedAt: contract.generatedAt,
    commitTrace: commit.traceSamples,
    pendingNoCommitTrace: pendingNoCommit.traceSamples,
    adapterErrorNoCommitTrace: adapterErrorNoCommit.traceSamples,
    results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W176 Completed Runner Result Import Commit And Build Return Surface

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Import Commit Contract

- Import owner: ${importCommitContract.importOwner}
- Commit target: ${importCommitContract.commitTarget}
- Commit mode: ${importCommitContract.commitMode}
- Drawer creates records: false
- Drawer invokes SuiteScript: false
- Completed commit allowed: ${commit.commitAllowed}
- Pending mutates final names: ${pendingNoCommit.mutationGuard.pendingFinalNamesMutated}
- Adapter error mutates final names: ${adapterErrorNoCommit.mutationGuard.adapterErrorFinalNamesMutated}

## Build / Run Surface

- Customer: ${commit.buildSurface.customer}
- Demo transaction: ${commit.buildSurface.demoTransaction}
- Hero item: ${commit.buildSurface.heroItem}
- Matrix/proof item: ${commit.buildSurface.matrixProofItem}
- Run can use imported final names: ${commit.runSurface.runCanUseImportedFinalNames}
- Supported Open links after commit: ${commit.linkAuthority.supportedOpenLinksAfterCommit}

## Guarded Harness

| Gate | Result |
| --- | --- |
${Object.entries(guardedHarness).map(([key, value]) => `| ${key} | ${value ? 'PASS' : 'FAIL'} |`).join('\n')}

## Visual Testing Decision

${visualTestingDecision.reason}

## Best Next Codex Prompt

\`\`\`text
${contract.bestNextCodexPrompt.prompt}
\`\`\`
`);

  if (failures.length) {
    console.error(`W176 completed runner result import commit FAIL (${results.length - failures.length}/${results.length})`);
    process.exit(1);
  }
  console.log(`W176 completed runner result import commit: ${contract.decision}; visualBlocked=${visualTestingDecision.visualTestingBlocked}; urlsReady=${visualTestingDecision.importedUrlsReadyForTargetedVisual}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
