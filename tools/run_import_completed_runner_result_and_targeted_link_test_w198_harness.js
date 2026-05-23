const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w197Path = path.join(root, 'data', 'w197_poll_governed_runner_result_capture.json');
const dataPath = path.join(root, 'data', 'w198_import_completed_runner_result_and_targeted_link_test.json');
const tracePath = path.join(root, 'trace_samples', 'w198_import_completed_runner_result_and_targeted_link_test_trace.json');
const reportPath = path.join(root, 'reports', 'w198_import_completed_runner_result_and_targeted_link_test.md');

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
    URLSearchParams,
    Blob: function Blob() {},
    Promise,
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W198 harness')),
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
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'task_w196_ariat_governed_runner_001',
      idempotencyToken: 'idb-build-ariat-international-apparel-accessories-apparelaccessories',
      resultCapture: {
        status: 'completed_runner_result_ready',
        runnerTaskId: 'task_w196_ariat_governed_runner_001',
        resultCaptureCursor: 'cursor_w197_completed'
      },
      finalGeneratedNamesJson: null
    },
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
  const w197 = readJson(w197Path);
  const completedResultJson = w197.completedRunnerResultJsonOrAdapterError &&
    w197.completedRunnerResultJsonOrAdapterError.completedResultJson;
  const completedGuard = hooks.validateDccFinalNamingImportPayload(
    completedResultJson,
    context.state,
    context.lane,
    context.page,
    context.recommendation
  );

  const imported = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollResult: {
        schema: 'idb.w190-governed-runner-result-capture-polling.v1',
        status: 'w190_completed_result_import_ready',
        requestReady: true,
        requestSent: true,
        pollRequestEnvelope: {
          runnerTaskId: w197.sourceRunnerTask && w197.sourceRunnerTask.runnerTaskId,
          idempotencyToken: w197.sourceRunnerTask && w197.sourceRunnerTask.idempotencyToken
        },
        normalizedResponse: {
          schema: 'idb.approved-server-adapter-result-envelope.v1',
          status: 'completed_runner_result_ready',
          resultCaptureStatus: 'completed_runner_result_ready',
          finalGeneratedNamesJson: completedResultJson
        },
        statePatch: {
          integratedBuildRunnerResult: {
            runnerTaskId: w197.sourceRunnerTask && w197.sourceRunnerTask.runnerTaskId,
            idempotencyToken: w197.sourceRunnerTask && w197.sourceRunnerTask.idempotencyToken,
            resultCapture: {
              status: 'completed_runner_result_ready',
              finalGeneratedNamesJson: completedResultJson
            },
            finalGeneratedNamesJson: completedResultJson
          }
        }
      },
      completedResultJson,
      operatorChoseImport: true
    }
  );

  const targetedPacket = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    context.state,
    context.lane,
    context.page,
    context.recommendation,
    {
      importCommit: {
        schema: 'idb.completed-runner-result-import-commit-operator-flow.v1',
        commitAllowed: imported.importGuard && imported.importGuard.commitAllowed === true,
        statePatch: imported.statePatch && imported.statePatch.dccFinalNamingResult
          ? { dccFinalNamingResult: imported.statePatch.dccFinalNamingResult }
          : {}
      },
      completedResultJson
    }
  );

  const landingChecklist = targetedPacket.targetedRecords.map((record) => ({
    role: record.role,
    label: record.label,
    name: record.name,
    internalId: record.internalId,
    url: record.url,
    drawerLinkReady: record.readyForOperatorClick === true,
    urlShapeVerified: record.numericId === true && record.supportedUrl === true,
    actualRecordPageLanding: 'awaiting_authenticated_operator_visual_evidence',
    passCriteria: [
      `URL path includes ${record.expectedPath}`,
      `URL id equals ${record.internalId}`,
      `NetSuite page displays ${record.name} or the corresponding record title`,
      'The page is not Notice, Error, Invalid number, or record-does-not-exist'
    ],
    failIf: [
      'Notice page',
      'Error page',
      'Invalid number',
      'That record does not exist',
      'Placeholder token',
      'Wrong NetSuite record path'
    ]
  }));

  const results = [];
  assertCase(results, 'w198_w197_completed_json_available', w197.status === 'PASS_W197_POLLING_TO_COMPLETED_JSON_READY' && completedResultJson && completedResultJson.schema === 'idb.completed-runner-result-json.v1', JSON.stringify({ status: w197.status, schema: completedResultJson && completedResultJson.schema }));
  assertCase(results, 'w198_w151_accepts_completed_runner_result', completedGuard.valid === true && completedResultJson.generatedRecordOwner === 'governed_runner_internal_build_engine', JSON.stringify(completedGuard));
  assertCase(results, 'w198_import_commits_final_names', imported.status === 'completed_result_imported_final_urls_ready' && imported.importGuard.commitAllowed === true && imported.statePatch.dccFinalNamingResult, JSON.stringify(imported.importGuard));
  assertCase(results, 'w198_build_and_run_show_imported_names', imported.buildAndRunAfterImport.buildShowsImportedNames === true && imported.buildAndRunAfterImport.runShowsImportedNames === true, JSON.stringify(imported.buildAndRunAfterImport));
  assertCase(results, 'w198_five_verified_open_links_ready_in_idb', imported.buildAndRunAfterImport.verifiedOpenLinkCount >= 5 && targetedPacket.targetedRecords.length === 5 && targetedPacket.targetedRecords.every((record) => record.readyForOperatorClick === true), JSON.stringify(targetedPacket.targetedRecords));
  assertCase(results, 'w198_targeted_visual_packet_ready', targetedPacket.status === 'imported_final_url_targeted_operator_verification_packet_ready' && targetedPacket.exactOperatorSteps.length === 6 && targetedPacket.screenshotsNeeded.length === 7, JSON.stringify({ status: targetedPacket.status, steps: targetedPacket.exactOperatorSteps.length, screenshots: targetedPacket.screenshotsNeeded.length }));
  assertCase(results, 'w198_notice_error_placeholder_rejection_ready', targetedPacket.failCriteria.some((item) => /Notice, Error, Invalid number/.test(item)) && targetedPacket.failCriteria.some((item) => /placeholder/.test(item)), JSON.stringify(targetedPacket.failCriteria));
  assertCase(results, 'w198_no_regression_preserved', imported.noRegression.noDrawerWrites === true && imported.noRegression.noDrawerTransactionWrites === true && imported.noRegression.noDrawerCreatedRecords === true && imported.noRegression.noDirectDrawerSuiteScriptInvocationOutsideApprovedAdapterPath === true && imported.noRegression.noActiveOpenLinksWithoutRealUrls === true, JSON.stringify(imported.noRegression));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w198-import-completed-runner-result-and-targeted-link-test.v1',
    status: pass
      ? 'PASS_W198_IMPORT_COMMITTED_TARGETED_LINK_TEST_READY_AUTHENTICATED_LANDING_EVIDENCE_REQUIRED'
      : 'FAIL_W198_IMPORT_OR_TARGETED_LINK_TEST',
    importedFinalGeneratedNamesJson: completedResultJson,
    buildRunImportEvidence: {
      sourceBlock: 'W197',
      w151Accepted: completedGuard.valid === true,
      importedIntoIdb: imported.status === 'completed_result_imported_final_urls_ready',
      buildShowsImportedNames: imported.buildAndRunAfterImport.buildShowsImportedNames === true,
      runShowsImportedNames: imported.buildAndRunAfterImport.runShowsImportedNames === true,
      verifiedOpenLinkCount: imported.buildAndRunAfterImport.verifiedOpenLinkCount,
      reviewObjects: imported.buildAndRunAfterImport.reviewObjects,
      runPivots: imported.buildAndRunAfterImport.runPivots
    },
    fiveLinkTargetedVisualEvidence: {
      status: 'awaiting_authenticated_operator_record_landing_screenshots',
      drawerSideReady: targetedPacket.status === 'imported_final_url_targeted_operator_verification_packet_ready',
      note: 'The harness proves IDB imports W151-valid completed JSON and renders verified real URL Open links. Actual NetSuite record landing proof requires an authenticated sandbox browser click/screenshot for each link.',
      landingChecklist
    },
    passFailRecordLandingChecklist: landingChecklist,
    traceSamples: [
      {
        event: 'w198_w197_completed_runner_result_imported',
        w151Accepted: completedGuard.valid === true,
        generatedRecordOwner: completedResultJson.generatedRecordOwner,
        importedIntoIdb: imported.status === 'completed_result_imported_final_urls_ready',
        activeOpenLinksAfterImport: imported.buildAndRunAfterImport.verifiedOpenLinkCount
      },
      {
        event: 'w198_build_run_import_evidence',
        buildShowsImportedNames: imported.buildAndRunAfterImport.buildShowsImportedNames,
        runShowsImportedNames: imported.buildAndRunAfterImport.runShowsImportedNames,
        requiredRecordsReady: imported.buildAndRunAfterImport.requiredRecordsReady,
        navigationStatus: imported.buildAndRunAfterImport.navigationStatus
      },
      {
        event: 'w198_targeted_visual_evidence_boundary',
        targetedRecordCount: targetedPacket.targetedRecords.length,
        drawerOpenLinksReady: targetedPacket.targetedRecords.every((record) => record.readyForOperatorClick),
        actualRecordLandingProof: 'requires_authenticated_operator_visual_evidence',
        broaderVisualTesting: 'blocked'
      }
    ],
    visualTestingDecision: {
      targetedOnly: true,
      broaderVisualNetSuiteTestingRequired: false,
      drawerSideReadyForTargetedClicking: targetedPacket.status === 'imported_final_url_targeted_operator_verification_packet_ready',
      actualLandingVerificationStatus: 'awaiting_authenticated_operator_visual_evidence',
      reason: 'Only the five imported W151-valid Open links need record landing verification. The local harness cannot authenticate into NetSuite and must not fake record-page landing proof.'
    },
    noRegression: imported.noRegression,
    productionReadinessNextPrompt: {
      block: 'W199: Authenticated Five-Link Landing Evidence Review And Production Readiness Gate',
      prompt: 'Move through W199: Authenticated Five-Link Landing Evidence Review And Production Readiness Gate. Use the W198 imported final generated names JSON and the operator screenshots from authenticated NetSuite clicks for Customer, demo transaction/Sales Order, hero item, matrix/proof item, and component item. Mark production readiness pass only if all five Open links land on actual record pages with matching numeric ids and record identity, and reject Notice/Error/placeholder/record-does-not-exist pages. Preserve no drawer writes, no drawer transaction writes, no drawer-created records, no direct SuiteScript outside the approved server adapter path, consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no broader visual testing. Output evidence review, pass/fail table, W199 report, production readiness decision, and next prompt.'
    },
    results
  };

  const trace = {
    schema: 'idb.w198-import-completed-runner-result-and-targeted-link-test-trace.v1',
    traceSamples: contract.traceSamples,
    landingChecklist,
    targetedPacketTrace: targetedPacket.traceSamples,
    results
  };

  const recordRows = landingChecklist.map((record) =>
    `| ${record.label} | ${record.name} | ${record.internalId} | ${record.url} | ${record.actualRecordPageLanding} |`
  ).join('\n');
  const report = `# W198 Import Completed Runner Result And Targeted Link Test

Decision: ${contract.status}

## Imported Final Generated Names JSON

\`\`\`json
${JSON.stringify(completedResultJson, null, 2)}
\`\`\`

## Build / Run Import Evidence

- W151 accepted completed result: ${contract.buildRunImportEvidence.w151Accepted ? 'yes' : 'no'}
- Imported into IDB: ${contract.buildRunImportEvidence.importedIntoIdb ? 'yes' : 'no'}
- Build shows imported names: ${contract.buildRunImportEvidence.buildShowsImportedNames ? 'yes' : 'no'}
- Run shows imported names: ${contract.buildRunImportEvidence.runShowsImportedNames ? 'yes' : 'no'}
- Verified Open links rendered by IDB: ${contract.buildRunImportEvidence.verifiedOpenLinkCount}

## Five-Link Targeted Visual Evidence

| Record | Name | Internal ID | URL | Landing Evidence |
| --- | --- | --- | --- | --- |
${recordRows}

## Pass / Fail Record Landing Checklist

Pass only after authenticated NetSuite screenshots prove all five Open links land on actual record pages. Fail any Notice, Error, Invalid number, record-does-not-exist, placeholder id, wrong record path, or URL id mismatch.

## W198 Report

IDB can import the W197 completed runner result, commit final generated names after W151 validation, and render five active Open links for supported NetSuite URLs. Actual record-page landing verification remains targeted-only and requires authenticated operator evidence; the harness does not fake NetSuite page existence.

## Production-Readiness Next Prompt

${contract.productionReadinessNextPrompt.prompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!pass) {
    const failures = results.filter((result) => !result.pass);
    console.error(`W198 import and targeted link test failed: ${failures.map((failure) => failure.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W198 import completed runner result and targeted link test: ${contract.status}; openLinks=${contract.buildRunImportEvidence.verifiedOpenLinkCount}; landing=${contract.visualTestingDecision.actualLandingVerificationStatus}`);
}

main();
