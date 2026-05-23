const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w193Path = path.join(root, 'data', 'w193_idb_polls_completed_result_imports_final_urls.json');
const dataPath = path.join(root, 'data', 'w194_targeted_real_imported_open_link_verification.json');
const tracePath = path.join(root, 'trace_samples', 'w194_targeted_real_imported_open_link_verification_trace.json');
const reportPath = path.join(root, 'reports', 'w194_targeted_real_imported_open_link_verification.md');

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
    fetch: () => Promise.reject(new Error('live fetch disabled in W194 harness')),
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

function baseState() {
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
  const state = baseState();
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
  const w193 = readJson(w193Path);
  const completedResultJson = w193.completedResultEnvelope && w193.completedResultEnvelope.completedResultJson;

  const importCommit = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      operatorChoseImport: true,
      completedResultJson,
      importCtaWiring: {
        schema: 'idb.completed-poll-result-import-cta-wiring.v1',
        status: 'completed_poll_result_import_cta_ready',
        importCta: {
          enabled: true,
          label: 'Import completed runner result'
        },
        commitPreview: {
          commitAllowedAfterOperatorImport: true
        },
        resultImportGuard: {
          completedResultAcceptedByW151: true,
          importReady: true
        },
        normalizedPollResponse: {
          status: 'completed_result_awaiting_w151_import',
          finalGeneratedNamesJson: completedResultJson,
          finalGeneratedNamesJsonReady: true
        }
      }
    }
  );

  const readyPacket = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      importCommit,
      completedResultJson
    }
  );

  const blockedPacket = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      importCommit: {
        schema: 'idb.completed-runner-result-import-commit-operator-flow.v1',
        commitAllowed: false,
        statePatch: {}
      },
      completedResultJson: null
    }
  );

  const currentRunEvidenceReview = {
    source: 'operator_screenshot_current_run_state',
    observedBuildStatus: 'blocked_before_server_adapter',
    noServerAdapterCallMade: true,
    runnerTaskIdCaptured: false,
    resultCaptureStarted: false,
    completedRunnerResultImported: false,
    activeOpenLinksVisible: false,
    targetedVerificationRunnableNow: false,
    decision: 'blocked_no_imported_urls_to_click',
    reason: 'The current screenshot shows Build is still before server adapter execution, so there are no imported Open links available for W194 clicking.'
  };

  const requiredRoles = ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'];
  const roles = readyPacket.targetedRecords.map((record) => record.role);
  const results = [];
  assertCase(results, 'w194_w193_completed_result_available', w193.status === 'PASS' && completedResultJson && completedResultJson.schema === 'idb.completed-runner-result-json.v1', JSON.stringify(w193.completedResultEnvelope || {}));
  assertCase(results, 'w194_import_commit_ready_from_w193', importCommit.commitAllowed === true && importCommit.statePatch && importCommit.statePatch.dccFinalNamingResult, JSON.stringify({ commitAllowed: importCommit.commitAllowed }));
  assertCase(results, 'w194_ready_packet_covers_five_open_links', readyPacket.status === 'imported_final_url_targeted_operator_verification_packet_ready' && requiredRoles.every((role) => roles.includes(role)) && readyPacket.targetedRecords.length === 5, JSON.stringify(roles));
  assertCase(results, 'w194_ready_packet_urls_are_numeric_and_supported', readyPacket.targetedRecords.every((record) => record.numericId === true && record.supportedUrl === true && record.openable === true), JSON.stringify(readyPacket.targetedRecords));
  assertCase(results, 'w194_operator_steps_and_screenshots_ready', readyPacket.exactOperatorSteps.length === 6 && readyPacket.screenshotsNeeded.length === 7, JSON.stringify({ steps: readyPacket.exactOperatorSteps.length, screenshots: readyPacket.screenshotsNeeded.length }));
  assertCase(results, 'w194_notice_error_placeholder_rejection_ready', readyPacket.failCriteria.some((item) => /Notice, Error, Invalid number/.test(item)) && readyPacket.failCriteria.some((item) => /placeholder/.test(item)), JSON.stringify(readyPacket.failCriteria));
  assertCase(results, 'w194_current_run_correctly_blocked', currentRunEvidenceReview.noServerAdapterCallMade === true && currentRunEvidenceReview.targetedVerificationRunnableNow === false && blockedPacket.status === 'imported_final_url_targeted_operator_verification_packet_blocked', JSON.stringify(currentRunEvidenceReview));
  assertCase(results, 'w194_no_regression_preserved', readyPacket.noRegression.noDrawerWrites === true && readyPacket.noRegression.noDrawerTransactionWrites === true && readyPacket.noRegression.noDrawerCreatedRecords === true && readyPacket.noRegression.noDrawerSuiteScriptInvocationOutsideApprovedServerAdapterPath === true, JSON.stringify(readyPacket.noRegression));
  assertCase(results, 'w194_broader_visual_testing_blocked', readyPacket.visualTestingDecision.targetedOnly === true && readyPacket.visualTestingDecision.broaderVisualNetSuiteTestingRequired === false, JSON.stringify(readyPacket.visualTestingDecision));

  const guardedHarness = {
    w193CompletedResultAvailable: results.find((result) => result.name === 'w194_w193_completed_result_available').pass,
    importCommitReadyFromW193: results.find((result) => result.name === 'w194_import_commit_ready_from_w193').pass,
    readyPacketCoversFiveOpenLinks: results.find((result) => result.name === 'w194_ready_packet_covers_five_open_links').pass,
    readyPacketUrlsNumericAndSupported: results.find((result) => result.name === 'w194_ready_packet_urls_are_numeric_and_supported').pass,
    operatorStepsAndScreenshotsReady: results.find((result) => result.name === 'w194_operator_steps_and_screenshots_ready').pass,
    noticeErrorPlaceholderRejectionReady: results.find((result) => result.name === 'w194_notice_error_placeholder_rejection_ready').pass,
    currentRunCorrectlyBlocked: results.find((result) => result.name === 'w194_current_run_correctly_blocked').pass,
    noRegressionPreserved: results.find((result) => result.name === 'w194_no_regression_preserved').pass,
    broaderVisualTestingBlocked: results.find((result) => result.name === 'w194_broader_visual_testing_blocked').pass
  };

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w194-targeted-real-imported-open-link-verification.v1',
    status: pass ? 'PASS_TARGETED_VERIFICATION_PACKET_READY_CURRENT_RUN_BLOCKED' : 'FAIL_W194_TARGETED_VERIFICATION_PACKET',
    decision: {
      currentRun: 'blocked_no_server_adapter_call_no_imported_urls',
      afterW193Import: 'targeted_open_link_verification_ready',
      broaderVisualTesting: 'blocked_not_required'
    },
    evidenceReview: currentRunEvidenceReview,
    targetedVerificationPacket: readyPacket,
    exactOperatorSteps: readyPacket.exactOperatorSteps,
    screenshotsNeeded: readyPacket.screenshotsNeeded,
    passFailEvidenceReview: {
      passOnlyIf: [
        'Customer Open lands on the actual customer record page.',
        'Demo transaction Open lands on the actual Sales Order page.',
        'Hero item Open lands on the actual item record page.',
        'Matrix/proof item Open lands on the actual item record page.',
        'Component item Open lands on the actual item record page.'
      ],
      failIf: readyPacket.failCriteria,
      currentRunFinding: 'Fail/blocked for targeted clicking right now because the screenshot shows no server adapter call, no runnerTaskId, no completed result import, and no Open links.'
    },
    guardedHarness,
    visualTestingDecision: {
      targetedOnlyAfterImportedUrlsExist: true,
      currentRunTargetedVerificationBlocked: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'Targeted clicking is useful only after W193 has imported completed runner result URLs. The current screenshot is pre-adapter and has no links to verify.'
    },
    noRegression: readyPacket.noRegression,
    bestNextCodexPrompt: {
      block: 'W195: Server Adapter Call Activation Or Result Import Recovery',
      prompt: 'Move through W195: Server Adapter Call Activation Or Result Import Recovery. Use the W194 finding that the current run is blocked before server adapter and has no imported URLs. Focus only on getting the approved server adapter call to execute or importing a real W151-valid completed runner result JSON from W191/W192. Do not request Open-link visual testing until Build shows imported final names and five active Open links. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output activation/recovery steps, exact operator inputs, trace samples, W195 report, and the next production-readiness prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w194-targeted-real-imported-open-link-verification-trace.v1',
    readyTrace: readyPacket.traceSamples,
    blockedTrace: blockedPacket.traceSamples,
    currentRunEvidence: currentRunEvidenceReview,
    targetedRecords: readyPacket.targetedRecords,
    results
  };

  const stepRows = readyPacket.exactOperatorSteps.map((step) =>
    `| ${step.step} | ${step.action} | ${(step.passCriteria || []).join('; ')} | ${step.screenshotRequired ? 'Yes' : 'No'} |`
  ).join('\n');
  const screenshotRows = readyPacket.screenshotsNeeded.map((shot) =>
    `| ${shot.label} | ${(shot.mustShow || []).join('; ')} | ${shot.optional ? 'Optional' : 'Required'} |`
  ).join('\n');
  const recordRows = readyPacket.targetedRecords.map((record) =>
    `| ${record.label} | ${record.name} | ${record.internalId} | ${record.expectedPath} | ${record.readyForOperatorClick ? 'Ready after import' : 'Blocked'} |`
  ).join('\n');
  const report = `# W194 Targeted Real Imported Open-Link Verification From W193

Decision: ${contract.status}

## Current Run Evidence Review

- Current screenshot state: ${currentRunEvidenceReview.observedBuildStatus}
- Runner task captured: ${currentRunEvidenceReview.runnerTaskIdCaptured ? 'yes' : 'no'}
- Completed runner result imported: ${currentRunEvidenceReview.completedRunnerResultImported ? 'yes' : 'no'}
- Open links visible: ${currentRunEvidenceReview.activeOpenLinksVisible ? 'yes' : 'no'}
- Targeted link test now: ${currentRunEvidenceReview.targetedVerificationRunnableNow ? 'ready' : 'blocked'}

## Targeted Records After W193 Import

| Record | Name | Internal ID | Expected Path | Status |
| --- | --- | --- | --- | --- |
${recordRows}

## Exact Operator Steps

| Step | Action | Pass Criteria | Screenshot |
| --- | --- | --- | --- |
${stepRows}

## Screenshots Needed

| Screenshot | Must Show | Required |
| --- | --- | --- |
${screenshotRows}

## Pass / Fail Evidence Review

Pass only when all five Open links land on actual record pages. Fail any Notice, Error, Invalid number, record-does-not-exist, placeholder id, wrong record path, or URL id mismatch.

## Visual Testing Decision

Targeted-only after imported URLs exist. The current run is blocked because Build is still before server adapter execution and no completed runner result has been imported. Broader visual NetSuite testing remains blocked/not required.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!pass) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W194 targeted real imported open-link verification failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W194 targeted real imported open-link verification: ${contract.status}; currentRun=${contract.decision.currentRun}; records=${readyPacket.targetedRecords.length}`);
}

main();
