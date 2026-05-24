const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w179Path = path.join(root, 'data', 'w179_approved_server_adapter_result_poll_control.json');
const dataPath = path.join(root, 'data', 'w180_completed_poll_result_import_cta.json');
const tracePath = path.join(root, 'trace_samples', 'w180_completed_poll_result_import_cta_trace.json');
const reportPath = path.join(root, 'reports', 'w180_completed_poll_result_import_cta.md');

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

function main() {
  const hooks = loadHooks();
  const context = buildContext(hooks);
  const w179 = readJson(w179Path);
  const pending = hooks.completedPollResultImportCtaWiringV1(context.state, context.lane, context.page, context.recommendation, {
    pollControl: w179.samples.pending
  });
  const completed = hooks.completedPollResultImportCtaWiringV1(context.state, context.lane, context.page, context.recommendation, {
    pollControl: w179.samples.completed
  });
  const malformedCompleted = hooks.completedPollResultImportCtaWiringV1(context.state, context.lane, context.page, context.recommendation, {
    pollControl: w179.samples.malformedCompleted
  });
  const adapterError = hooks.completedPollResultImportCtaWiringV1(context.state, context.lane, context.page, context.recommendation, {
    pollControl: w179.samples.adapterError
  });
  const noTask = hooks.completedPollResultImportCtaWiringV1(context.state, context.lane, context.page, context.recommendation, {
    pollControl: w179.samples.noTask
  });
  const completedImportPreview = hooks.completedRunnerResultImportCommitBuildReturnSurfaceV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollImportGate: {
        importGate: { importReady: true },
        resultJsonEvidence: {
          completedResultJson: w179.samples.completed.normalizedPollResponse.finalGeneratedNamesJson
        }
      },
      completedResultJson: w179.samples.completed.normalizedPollResponse.finalGeneratedNamesJson
    }
  );

  const importCtaWiringContract = {
    schema: 'idb.w180-import-cta-wiring-contract.v1',
    source: w179.schema,
    cta: 'Import completed runner result',
    appearsOnlyAfter: [
      'approved server adapter poll returns completed result',
      'W151 accepts numeric internal ids',
      'W151 accepts supported NetSuite URLs',
      'generatedRecordOwner is governed_runner_internal_build_engine'
    ],
    remainsBlockedFor: [
      'pending poll response',
      'adapter error',
      'malformed completed result',
      'missing runnerTaskId',
      'Build handoff JSON'
    ],
    mutationBoundary: 'CTA readiness does not mutate state.dccFinalNamingResult; import commit remains the separate action.'
  };

  const operatorRetestPacket = {
    title: 'W180 Completed Poll Result Import CTA Operator Retest',
    visualNetSuiteTestingNow: false,
    prerequisite: 'Use only after Build has runnerTaskId and Check runner result is visible.',
    exactSteps: [
      'Open IDB Build tab.',
      'Confirm Check runner result is visible only after runnerTaskId exists.',
      'Click Check runner result.',
      'For pending result: verify Import completed runner result is not enabled and Open links remain hidden.',
      'For adapter error: verify the drawer stops safely and asks for operator evidence.',
      'For malformed completed result: verify W151 rejects it and Open links remain hidden.',
      'For completed W151-valid result: verify Import completed runner result appears.',
      'Do not click or screenshot NetSuite record Open links until after the completed result is imported.'
    ],
    screenshotsToSendBack: [
      'Build tab with runnerTaskId captured and Check runner result visible.',
      'Build tab after completed poll with Import completed runner result visible.',
      'Any error or malformed-result message if the poll does not complete cleanly.'
    ],
    notNeededYet: [
      'Customer record page screenshot',
      'Sales Order page screenshot',
      'Item record page screenshots',
      'Broad visual regression sweep'
    ]
  };

  const guardedHarness = {
    pendingDoesNotEnableImport: pending.status === 'completed_poll_result_import_cta_blocked' &&
      pending.importCta.enabled === false &&
      pending.mutationGuard.finalGeneratedNamesUnchanged === true &&
      pending.mutationGuard.activeOpenLinks === 0,
    adapterErrorDoesNotEnableImport: adapterError.status === 'completed_poll_result_import_cta_blocked' &&
      adapterError.importCta.blockedReason === 'adapter_error_requires_operator_evidence' &&
      adapterError.importCta.enabled === false &&
      adapterError.mutationGuard.activeOpenLinks === 0,
    malformedCompletedRejected: malformedCompleted.status === 'completed_poll_result_import_cta_blocked' &&
      malformedCompleted.importCta.blockedReason === 'completed_result_rejected_by_w151' &&
      malformedCompleted.resultImportGuard.completedResultAcceptedByW151 === false,
    noTaskDoesNotEnableImport: noTask.status === 'completed_poll_result_import_cta_blocked' &&
      noTask.importCta.blockedReason === 'runner_task_id_missing' &&
      noTask.importCta.visible === false,
    completedEnablesImportCtaOnly: completed.status === 'completed_poll_result_import_cta_ready' &&
      completed.importCta.visible === true &&
      completed.importCta.enabled === true &&
      completed.resultImportGuard.completedResultAcceptedByW151 === true &&
      completed.commitPreview.commitAllowedAfterOperatorImport === true &&
      completed.mutationGuard.finalGeneratedNamesUnchanged === true &&
      completed.mutationGuard.activeOpenLinks === 0,
    commitPreviewReadyButNotApplied: completedImportPreview.commitAllowed === true &&
      completedImportPreview.statePatch.dccFinalNamingResult &&
      context.state.dccFinalNamingResult === null,
    operatorRetestPacketReady: operatorRetestPacket.visualNetSuiteTestingNow === false &&
      operatorRetestPacket.screenshotsToSendBack.length === 3 &&
      operatorRetestPacket.notNeededYet.indexOf('Customer record page screenshot') >= 0,
    traceSamplesReady: completed.traceSamples.some((sample) => sample.event === 'w180_poll_result_to_import_cta') &&
      adapterError.traceSamples.some((sample) => sample.event === 'w180_w151_guard_result'),
    noRegressionPreserved: [
      pending,
      completed,
      malformedCompleted,
      adapterError,
      noTask
    ].every((sample) => sample.noRegression.noDrawerWrites === true &&
      sample.noRegression.noDrawerTransactionWrites === true &&
      sample.noRegression.noActiveOpenLinksWithoutRealUrls === true &&
      sample.noRegression.w151CompletedResultImportGuardPreserved === true)
  };

  const visualTestingDecision = {
    visualTestingBlockedUntilCompletedResultImported: true,
    targetedOpenLinkTestingReady: false,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W180 only enables the guarded import CTA. Targeted Open-link screenshots wait for the import commit.'
  };

  const results = [];
  assertCase(results, 'w180_pending_does_not_enable_import', guardedHarness.pendingDoesNotEnableImport, JSON.stringify(pending.importCta));
  assertCase(results, 'w180_adapter_error_does_not_enable_import', guardedHarness.adapterErrorDoesNotEnableImport, JSON.stringify(adapterError.importCta));
  assertCase(results, 'w180_malformed_completed_rejected', guardedHarness.malformedCompletedRejected, JSON.stringify(malformedCompleted.resultImportGuard));
  assertCase(results, 'w180_no_task_does_not_enable_import', guardedHarness.noTaskDoesNotEnableImport, JSON.stringify(noTask.importCta));
  assertCase(results, 'w180_completed_enables_import_cta_only', guardedHarness.completedEnablesImportCtaOnly, JSON.stringify(completed.importCta));
  assertCase(results, 'w180_commit_preview_ready_but_not_applied', guardedHarness.commitPreviewReadyButNotApplied, JSON.stringify(completed.commitPreview));
  assertCase(results, 'w180_operator_retest_packet_ready', guardedHarness.operatorRetestPacketReady, JSON.stringify(operatorRetestPacket));
  assertCase(results, 'w180_trace_samples_ready', guardedHarness.traceSamplesReady, JSON.stringify(completed.traceSamples));
  assertCase(results, 'w180_no_regression_preserved', guardedHarness.noRegressionPreserved, JSON.stringify(completed.noRegression));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w180-completed-poll-result-import-cta.v1',
    status: failures.length ? 'blocked' : 'completed_poll_result_import_cta_wiring_ready',
    decision: failures.length ? 'FAIL_COMPLETED_POLL_RESULT_IMPORT_CTA' : 'PASS_COMPLETED_POLL_RESULT_IMPORT_CTA_READY__VISUAL_TESTING_BLOCKED',
    generatedAt: new Date().toISOString(),
    importCtaWiringContract,
    samples: {
      pending,
      completed,
      malformedCompleted,
      adapterError,
      noTask,
      completedImportPreview
    },
    operatorRetestPacket,
    guardedHarness,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W181: Completed Runner Result Import Commit Operator Flow',
      prompt: 'Move through W181: Completed Runner Result Import Commit Operator Flow. Use the W180 completed poll result import CTA to commit final generated names into IDB only after the operator chooses the W151-validated completed runner result import. Keep pending, adapter-error, malformed completed, and handoff JSON non-mutating; after commit, Build and Run may show imported names and verified Open links. Do not create records from the drawer and do not invoke SuiteScript outside the approved server adapter path. Output import commit operator flow, guarded harness, trace samples, W181 report, visual testing decision targeted-only after imported URLs exist, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w180-completed-poll-result-import-cta-trace.v1',
    generatedAt: contract.generatedAt,
    pendingTrace: pending.traceSamples,
    completedTrace: completed.traceSamples,
    malformedCompletedTrace: malformedCompleted.traceSamples,
    adapterErrorTrace: adapterError.traceSamples,
    noTaskTrace: noTask.traceSamples,
    results,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W180 Completed Poll Result Import CTA Wiring And Operator Retest Packet

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Import CTA Wiring Contract

- CTA: ${importCtaWiringContract.cta}
- Appears only after: ${importCtaWiringContract.appearsOnlyAfter.join('; ')}
- Remains blocked for: ${importCtaWiringContract.remainsBlockedFor.join('; ')}
- Mutation boundary: ${importCtaWiringContract.mutationBoundary}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## Operator Retest Packet

Do not run NetSuite Open-link visual testing yet.

${operatorRetestPacket.exactSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Screenshots to send back:
${operatorRetestPacket.screenshotsToSendBack.map((item) => `- ${item}`).join('\n')}

Not needed yet:
${operatorRetestPacket.notNeededYet.map((item) => `- ${item}`).join('\n')}

## Trace Samples

- Pending: ${pending.status}
- Completed: ${completed.status}
- Malformed completed: ${malformedCompleted.status}
- Adapter error: ${adapterError.status}
- No task: ${noTask.status}

## W180 Report

Completed poll responses now connect to a W151-owned import CTA. Pending, adapter-error, missing-task, and malformed completed responses keep final generated names unchanged and keep Open links hidden. A W151-valid completed response makes the import CTA ready and previews the W176 commit path, but the state is not mutated until the operator import action.

## Visual Testing Decision

Blocked until completed runner result JSON is imported. Broader visual testing is not required.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W180 completed poll result import CTA failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W180 completed poll result import CTA: ${contract.decision}; completedCta=${completed.importCta.enabled}; visualBlocked=${visualTestingDecision.visualTestingBlockedUntilCompletedResultImported}`);
}

main();
