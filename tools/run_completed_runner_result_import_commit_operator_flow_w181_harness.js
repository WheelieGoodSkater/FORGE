const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w179Path = path.join(root, 'data', 'w179_approved_server_adapter_result_poll_control.json');
const dataPath = path.join(root, 'data', 'w181_completed_runner_result_import_commit_operator_flow.json');
const tracePath = path.join(root, 'trace_samples', 'w181_completed_runner_result_import_commit_operator_flow_trace.json');
const reportPath = path.join(root, 'reports', 'w181_completed_runner_result_import_commit_operator_flow.md');

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
  const completedJson = w179.samples.completed.normalizedPollResponse.finalGeneratedNamesJson;
  const handoffJson = context.state.acceptedPacket;
  const pendingFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: true, pollControl: w179.samples.pending }
  );
  const adapterErrorFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: true, pollControl: w179.samples.adapterError }
  );
  const malformedFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: true, pollControl: w179.samples.malformedCompleted }
  );
  const noChoiceFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: false, pollControl: w179.samples.completed, completedResultJson: completedJson }
  );
  const handoffFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: true, pollControl: w179.samples.completed, completedResultJson: handoffJson, handoffJson }
  );
  const completedFlow = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    { operatorChoseImport: true, pollControl: w179.samples.completed, completedResultJson: completedJson, handoffJson }
  );
  const committedState = Object.assign({}, context.state, completedFlow.statePatch || {});
  const buildNavigation = hooks.dccFinalNavigationModel(committedState, context.lane, context.page, context.recommendation);
  const runShowText = buildNavigation.scriptPivotObjects
    .map((record) => `${record.name} ${record.linkAuthority && record.linkAuthority.label || ''}`)
    .join(' -> ');
  const targetedPacket = hooks.importedUrlTargetedOpenLinkVerificationPacketV1(
    {
      schema: 'idb.completed-runner-result-import-commit-build-return-surface.v1',
      commitAllowed: completedFlow.commitAllowed,
      linkAuthority: {
        importedUrlsReadyForTargetedVisual: completedFlow.buildRunAfterCommit.targetedOpenLinkTestingReady,
        activeOpenLinksBeforeImport: 0,
        supportedOpenLinksAfterCommit: completedFlow.buildRunAfterCommit.verifiedOpenLinkCount
      },
      navigationAfterCommit: {
        reviewObjects: buildNavigation.reviewObjects,
        scriptPivotObjects: buildNavigation.scriptPivotObjects,
        runCanUseImportedFinalNames: buildNavigation.runCanUseImportedFinalNames
      }
    },
    {}
  );

  const importCommitOperatorFlow = {
    schema: 'idb.w181-import-commit-operator-flow-contract.v1',
    operatorAction: 'Import completed runner result',
    allowedOnlyWhen: [
      'operator chooses the W180 import CTA',
      'completed runner result JSON exists',
      'W151 accepts numeric internal ids',
      'W151 accepts supported NetSuite URLs',
      'generatedRecordOwner is governed_runner_internal_build_engine'
    ],
    blockedFor: [
      'pending poll response',
      'adapter error',
      'malformed completed result',
      'handoff JSON',
      'no operator import choice'
    ],
    commitTarget: 'state.dccFinalNamingResult',
    mutationBoundary: 'drawer-local final-name import only; no NetSuite record creation and no drawer transaction writes'
  };

  const guardedHarness = {
    noOperatorChoiceBlocksCommit: noChoiceFlow.commitAllowed === false &&
      noChoiceFlow.blockedReason === 'operator_import_choice_required' &&
      !noChoiceFlow.statePatch.dccFinalNamingResult,
    pendingDoesNotMutate: pendingFlow.commitAllowed === false &&
      pendingFlow.mutationGuard.pendingFinalNamesMutated === false &&
      !pendingFlow.statePatch.dccFinalNamingResult,
    adapterErrorDoesNotMutate: adapterErrorFlow.commitAllowed === false &&
      adapterErrorFlow.mutationGuard.adapterErrorFinalNamesMutated === false &&
      !adapterErrorFlow.statePatch.dccFinalNamingResult,
    malformedCompletedDoesNotMutate: malformedFlow.commitAllowed === false &&
      malformedFlow.mutationGuard.malformedCompletedFinalNamesMutated === false &&
      malformedFlow.importGuards.completedResultAcceptedByW151 === false,
    handoffJsonRejectedAndNonMutating: handoffFlow.commitAllowed === false &&
      handoffFlow.mutationGuard.handoffJsonFinalNamesMutated === false &&
      !handoffFlow.statePatch.dccFinalNamingResult,
    completedOperatorImportCommitsStatePatch: completedFlow.commitAllowed === true &&
      completedFlow.statePatch.dccFinalNamingResult &&
      completedFlow.mutationGuard.finalGeneratedNamesMutatedOnlyByOperatorImport === true,
    buildAndRunUseImportedNamesAfterCommit: completedFlow.buildRunAfterCommit.buildMayShowImportedNames === true &&
      completedFlow.buildRunAfterCommit.runMayShowImportedNames === true &&
      buildNavigation.runCanUseImportedFinalNames === true &&
      /Ariat International Outdoor Retail Account/.test(runShowText),
    verifiedOpenLinksReadyAfterCommit: completedFlow.buildRunAfterCommit.verifiedOpenLinkCount >= 5 &&
      targetedPacket.status === 'targeted_open_link_verification_packet_ready',
    noRegressionPreserved: [
      pendingFlow,
      adapterErrorFlow,
      malformedFlow,
      handoffFlow,
      completedFlow
    ].every((sample) => sample.noRegression.noDrawerWrites === true &&
      sample.noRegression.noDrawerTransactionWrites === true &&
      sample.noRegression.noActiveOpenLinksWithoutRealUrls === true &&
      sample.noRegression.w151CompletedResultImportGuardPreserved === true)
  };

  const visualTestingDecision = {
    targetedOnlyAfterImportedUrlsExist: completedFlow.visualTestingDecision.targetedOnlyAfterImportedUrlsExist === true,
    broaderVisualNetSuiteTestingRequired: false,
    decision: 'targeted_only_after_imported_urls_exist',
    reason: 'W181 commits W151-valid URLs into IDB; the next test should only click the five imported Open links.'
  };

  const results = [];
  assertCase(results, 'w181_no_operator_choice_blocks_commit', guardedHarness.noOperatorChoiceBlocksCommit, JSON.stringify(noChoiceFlow));
  assertCase(results, 'w181_pending_does_not_mutate', guardedHarness.pendingDoesNotMutate, JSON.stringify(pendingFlow));
  assertCase(results, 'w181_adapter_error_does_not_mutate', guardedHarness.adapterErrorDoesNotMutate, JSON.stringify(adapterErrorFlow));
  assertCase(results, 'w181_malformed_completed_does_not_mutate', guardedHarness.malformedCompletedDoesNotMutate, JSON.stringify(malformedFlow));
  assertCase(results, 'w181_handoff_json_rejected_non_mutating', guardedHarness.handoffJsonRejectedAndNonMutating, JSON.stringify(handoffFlow));
  assertCase(results, 'w181_completed_operator_import_commits_state_patch', guardedHarness.completedOperatorImportCommitsStatePatch, JSON.stringify(completedFlow.statePatch));
  assertCase(results, 'w181_build_and_run_use_imported_names_after_commit', guardedHarness.buildAndRunUseImportedNamesAfterCommit, runShowText);
  assertCase(results, 'w181_verified_open_links_ready_after_commit', guardedHarness.verifiedOpenLinksReadyAfterCommit, JSON.stringify(targetedPacket.targetedRecords));
  assertCase(results, 'w181_no_regression_preserved', guardedHarness.noRegressionPreserved, JSON.stringify(completedFlow.noRegression));

  const failures = results.filter((result) => !result.pass);
  const contract = {
    schema: 'idb.w181-completed-runner-result-import-commit-operator-flow.v1',
    status: failures.length ? 'blocked' : 'completed_runner_result_import_commit_operator_flow_ready',
    decision: failures.length ? 'FAIL_COMPLETED_RUNNER_RESULT_IMPORT_COMMIT_OPERATOR_FLOW' : 'PASS_COMPLETED_RUNNER_RESULT_IMPORT_COMMIT_OPERATOR_FLOW_READY',
    generatedAt: new Date().toISOString(),
    importCommitOperatorFlow,
    samples: {
      noChoiceFlow,
      pendingFlow,
      adapterErrorFlow,
      malformedFlow,
      handoffFlow,
      completedFlow,
      targetedPacket
    },
    guardedHarness,
    visualTestingDecision,
    results,
    bestNextCodexPrompt: {
      block: 'W182: Targeted Imported URL Open-Link Operator Test Packet',
      prompt: 'Move through W182: Targeted Imported URL Open-Link Operator Test Packet. Use the W181 completed runner result import commit flow to provide the exact targeted-only operator test for Customer, demo transaction, hero item, matrix/proof item, and component item Open links. Require imported W151-valid numeric ids and supported NetSuite URLs, do not create records from the drawer, do not invoke SuiteScript from the drawer outside the approved server adapter path, and do not broaden visual testing. Output exact test steps, screenshots needed, trace samples, W182 report, broader visual testing decision blocked, and best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w181-completed-runner-result-import-commit-operator-flow-trace.v1',
    generatedAt: contract.generatedAt,
    noChoiceTrace: noChoiceFlow.traceSamples,
    pendingTrace: pendingFlow.traceSamples,
    adapterErrorTrace: adapterErrorFlow.traceSamples,
    malformedTrace: malformedFlow.traceSamples,
    handoffTrace: handoffFlow.traceSamples,
    completedTrace: completedFlow.traceSamples,
    targetedTrace: targetedPacket.traceSamples,
    results,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W181 Completed Runner Result Import Commit Operator Flow

Generated: ${contract.generatedAt}

Decision: ${contract.decision}

## Import Commit Operator Flow

- Operator action: ${importCommitOperatorFlow.operatorAction}
- Commit target: ${importCommitOperatorFlow.commitTarget}
- Mutation boundary: ${importCommitOperatorFlow.mutationBoundary}
- Allowed only when: ${importCommitOperatorFlow.allowedOnlyWhen.join('; ')}
- Blocked for: ${importCommitOperatorFlow.blockedFor.join('; ')}

## Guarded Harness

${results.map((result) => `- ${result.pass ? 'PASS' : 'FAIL'} ${result.name}`).join('\n')}

## Trace Samples

- No operator choice: ${noChoiceFlow.status}
- Pending: ${pendingFlow.status}
- Adapter error: ${adapterErrorFlow.status}
- Malformed completed: ${malformedFlow.status}
- Handoff JSON: ${handoffFlow.status}
- Completed import: ${completedFlow.status}

## W181 Report

W181 turns the W180 ready CTA into the operator-owned commit flow. Pending, adapter-error, malformed completed, handoff JSON, and no-choice states remain non-mutating. A completed W151-valid runner result from the internal runner creates a drawer-local state patch for final generated names, after which Build and Run may show imported names and verified Open links.

## Visual Testing Decision

Targeted-only after imported URLs exist. Broader visual NetSuite testing remains blocked.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W181 completed runner result import commit operator flow failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W181 completed runner result import commit operator flow: ${contract.decision}; commitAllowed=${completedFlow.commitAllowed}; targetedReady=${visualTestingDecision.targetedOnlyAfterImportedUrlsExist}`);
}

main();
