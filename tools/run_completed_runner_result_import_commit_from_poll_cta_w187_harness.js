const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w186Path = path.join(root, 'data', 'w186_completed_runner_result_import_cta_from_poll_handoff.json');
const uploadedTracePath = '/path/to/downloads/intelligent-demo-builder-trace-1779023753249.json';
const uploadedHandoffPath = '/path/to/downloads/idb-dcc-runner-handoff-packet-1779023752645.json';
const dataPath = path.join(root, 'data', 'w187_completed_runner_result_import_commit_from_poll_cta.json');
const tracePath = path.join(root, 'trace_samples', 'w187_completed_runner_result_import_commit_from_poll_cta_trace.json');
const reportPath = path.join(root, 'reports', 'w187_completed_runner_result_import_commit_from_poll_cta.md');

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

function buildContext(hooks) {
  const uploadedTrace = fs.existsSync(uploadedTracePath) ? readJson(uploadedTracePath) : null;
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

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: { type: 'customer', name: 'Ariat International Outdoor Retail Account', internalId: 501234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=501234' },
      demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
      heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
      matrixProofItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
      componentItem: { type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }
    },
    demoTransaction: { type: 'salesorder', name: 'Ariat Seasonal Footwear Availability Demo Order', internalId: 601234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=601234' },
    heroItem: { type: 'inventoryitem', name: 'Ariat Terrain H2O Work Boot Hero Item', internalId: 701234, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701234' },
    matrixItem: { type: 'matrixitem', name: 'Ariat Core Boot Size Color Matrix', internalId: 701235, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701235' },
    componentItems: [{ type: 'inventoryitem', name: 'Ariat Brown Leather Upper Component', internalId: 701236, url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=701236' }]
  };
}

function malformedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: { type: 'customer', name: 'Ariat Placeholder Account', internalId: 'REPLACE_REAL_CUSTOMER_ID', url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID' }
    }
  };
}

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w186 = readJson(w186Path);
  const uploadedHandoff = fs.existsSync(uploadedHandoffPath) ? readJson(uploadedHandoffPath) : null;
  const completedResult = completedRunnerResultJson();
  const noChoice = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.completed,
    completedResultJson: completedResult,
    operatorChoseImport: false,
    handoffJson: uploadedHandoff
  });
  const completed = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.completed,
    completedResultJson: completedResult,
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });
  const pending = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.pending,
    completedResultJson: null,
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });
  const missingRunnerTask = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.missingRunnerTask,
    completedResultJson: null,
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });
  const adapterError = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.adapterError,
    completedResultJson: null,
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });
  const malformed = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.malformed,
    completedResultJson: malformedRunnerResultJson(),
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });
  const handoffOnly = hooks.completedRunnerResultImportCommitFromPollCtaV1(context.state, context.lane, context.page, context.recommendation, {
    completedResultImportCtaFromPollHandoff: w186.samples.completed,
    completedResultJson: uploadedHandoff,
    operatorChoseImport: true,
    handoffJson: uploadedHandoff
  });

  const guardedHarness = {
    noOperatorChoiceBlocksCommit: noChoice.commitAllowed === false &&
      noChoice.blockedReason === 'operator_import_choice_required' &&
      !noChoice.statePatch.dccFinalNamingResult,
    pendingNonMutating: pending.commitAllowed === false &&
      pending.blockedReason === 'runner_result_still_pending' &&
      pending.mutationGuard.pendingFinalNamesMutated === false,
    missingRunnerTaskNonMutating: missingRunnerTask.commitAllowed === false &&
      missingRunnerTask.blockedReason === 'runner_task_id_missing' &&
      missingRunnerTask.mutationGuard.missingRunnerTaskFinalNamesMutated === false,
    adapterErrorNonMutating: adapterError.commitAllowed === false &&
      adapterError.blockedReason === 'adapter_error_requires_operator_evidence' &&
      adapterError.mutationGuard.adapterErrorFinalNamesMutated === false,
    malformedCompletedRejected: malformed.commitAllowed === false &&
      malformed.blockedReason === 'completed_result_rejected_by_w151' &&
      malformed.ctaStatus.completedResultAcceptedByW151 === false,
    handoffJsonRejectedNonMutating: handoffOnly.commitAllowed === false &&
      handoffOnly.ctaStatus.handoffJsonRejected === true &&
      !handoffOnly.statePatch.dccFinalNamingResult,
    completedOperatorImportCommitsStatePatch: completed.commitAllowed === true &&
      !!(completed.statePatch && completed.statePatch.dccFinalNamingResult) &&
      completed.ctaStatus.completedResultAcceptedByW151 === true &&
      completed.ctaStatus.generatedRecordOwner === 'governed_runner_internal_build_engine',
    buildRunAndTargetedLinksReadyAfterCommit: completed.buildRunAfterCommit.buildMayShowImportedNames === true &&
      completed.buildRunAfterCommit.runMayShowImportedNames === true &&
      completed.buildRunAfterCommit.verifiedOpenLinkCount >= 5 &&
      completed.visualTestingDecision.targetedOnlyAfterImportedUrlsExist === true,
    noRegressionPreserved: completed.noRegression.noDrawerWrites === true &&
      completed.noRegression.noDrawerTransactionWrites === true &&
      completed.noRegression.noDrawerCreatedRecords === true &&
      completed.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true &&
      completed.noRegression.noActiveOpenLinksWithoutRealUrls === true
  };

  const results = [];
  assertCase(results, 'w187_no_operator_choice_blocks_commit', guardedHarness.noOperatorChoiceBlocksCommit, JSON.stringify(noChoice));
  assertCase(results, 'w187_pending_non_mutating', guardedHarness.pendingNonMutating, JSON.stringify(pending));
  assertCase(results, 'w187_missing_runner_task_non_mutating', guardedHarness.missingRunnerTaskNonMutating, JSON.stringify(missingRunnerTask));
  assertCase(results, 'w187_adapter_error_non_mutating', guardedHarness.adapterErrorNonMutating, JSON.stringify(adapterError));
  assertCase(results, 'w187_malformed_completed_rejected', guardedHarness.malformedCompletedRejected, JSON.stringify(malformed));
  assertCase(results, 'w187_handoff_json_rejected_non_mutating', guardedHarness.handoffJsonRejectedNonMutating, JSON.stringify(handoffOnly));
  assertCase(results, 'w187_completed_operator_import_commits_state_patch', guardedHarness.completedOperatorImportCommitsStatePatch, JSON.stringify(completed.statePatch));
  assertCase(results, 'w187_build_run_and_targeted_links_ready_after_commit', guardedHarness.buildRunAndTargetedLinksReadyAfterCommit, JSON.stringify(completed.buildRunAfterCommit));
  assertCase(results, 'w187_no_regression_preserved', guardedHarness.noRegressionPreserved, JSON.stringify(completed.noRegression));

  const contract = {
    schema: 'idb.w187-completed-runner-result-import-commit-from-poll-cta.v1',
    status: results.every((result) => result.pass)
      ? 'completed_result_import_commit_from_poll_cta_ready'
      : 'completed_result_import_commit_from_poll_cta_failed',
    importCommitContract: completed.importCommitContract,
    guardedHarness,
    samples: {
      noChoice,
      pending,
      missingRunnerTask,
      adapterError,
      malformed,
      handoffOnly,
      completed
    },
    visualTestingDecision: {
      targetedOnlyAfterImportedUrlsExist: true,
      broaderVisualNetSuiteTestingRequired: false,
      decision: 'targeted_only_after_import',
      reason: 'After W187 import commit, only the imported Customer, demo transaction, hero item, matrix/proof item, and component Open links need visual verification.'
    },
    bestNextCodexPrompt: {
      block: 'W188: Imported Final URL Targeted Operator Verification Packet From Build Return',
      prompt: 'Move through W188: Imported Final URL Targeted Operator Verification Packet From Build Return. Use the W187 completed runner result import commit to produce the exact targeted-only operator verification packet for Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Require W151-valid imported numeric ids and supported NetSuite URLs, do not create records from the drawer, do not invoke SuiteScript outside the approved server adapter path, and do not broaden visual testing. Output exact operator steps, screenshots needed, trace samples, W188 report, broader visual testing decision blocked, and best next Codex prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w187-completed-runner-result-import-commit-from-poll-cta-trace.v1',
    completedTrace: completed.traceSamples,
    blockedTrace: noChoice.traceSamples.concat(pending.traceSamples, missingRunnerTask.traceSamples, adapterError.traceSamples, malformed.traceSamples),
    results
  };

  const report = `# W187 Completed Runner Result Import Commit From Poll CTA

Decision: ${contract.status}

## Import Commit Contract

- Source: W186 completed runner result import CTA.
- Commit requires operator choice, W151-valid numeric internal ids, supported NetSuite URLs, and internal runner ownership.
- Pending, missing runnerTaskId, adapter-error, malformed completed result, and handoff JSON remain non-mutating.
- The drawer imports final generated names only; it does not create records, create transactions, or invoke SuiteScript outside the approved server adapter path.

## Guarded Harness

| Gate | Result |
| --- | --- |
| No operator choice blocks commit | ${guardedHarness.noOperatorChoiceBlocksCommit ? 'PASS' : 'FAIL'} |
| Pending non-mutating | ${guardedHarness.pendingNonMutating ? 'PASS' : 'FAIL'} |
| Missing runnerTaskId non-mutating | ${guardedHarness.missingRunnerTaskNonMutating ? 'PASS' : 'FAIL'} |
| Adapter error non-mutating | ${guardedHarness.adapterErrorNonMutating ? 'PASS' : 'FAIL'} |
| Malformed completed result rejected | ${guardedHarness.malformedCompletedRejected ? 'PASS' : 'FAIL'} |
| Handoff JSON rejected | ${guardedHarness.handoffJsonRejectedNonMutating ? 'PASS' : 'FAIL'} |
| Completed operator import commits state patch | ${guardedHarness.completedOperatorImportCommitsStatePatch ? 'PASS' : 'FAIL'} |
| Build/Run and targeted links ready after commit | ${guardedHarness.buildRunAndTargetedLinksReadyAfterCommit ? 'PASS' : 'FAIL'} |
| No-regression boundaries preserved | ${guardedHarness.noRegressionPreserved ? 'PASS' : 'FAIL'} |

## Trace Samples

- ${tracePath}

## Visual Testing Decision

Targeted-only after import. Broader visual NetSuite testing remains blocked.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!results.every((result) => result.pass)) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W187 completed runner result import commit from poll CTA failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W187 completed runner result import commit from poll CTA: ${contract.status}; commitAllowed=${completed.commitAllowed}; targetedReady=${completed.visualTestingDecision.targetedOnlyAfterImportedUrlsExist}`);
}

main();
