const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w204_import_w151_completed_result_verify_five_links.json');
const tracePath = path.join(root, 'trace_samples', 'w204_import_w151_completed_result_verify_five_links_trace.json');
const reportPath = path.join(root, 'reports', 'w204_import_w151_completed_result_verify_five_links.md');

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
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W204 harness')),
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
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    },
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
      capturedAt: '2026-05-18T10:00:00.000Z'
    }
  };
}

function completedRunnerResultJson() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    source: {
      sourceBlock: 'W203',
      runnerTaskId: 'SCHEDSCRIPT_REDACTED',
      idempotencyToken: 'IDB-idb-build-ariat-international-apparel-accessories-apparelaccessories-ARIAT_INTERNATIONAL-APPAREL_ACCESSORIES',
      resultCaptureStatus: 'completed_runner_result_ready',
      transactionResolutionAuthority: 'legacy_runner_csv_import_path'
    },
    records: {
      customer: {
        type: 'customer',
        recordType: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=91201'
      },
      demoTransaction: {
        type: 'salesorder',
        recordType: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202'
      },
      heroItem: {
        type: 'inventoryitem',
        recordType: 'inventoryitem',
        name: 'Ariat International Style SKU',
        internalId: '91203',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        recordType: 'inventoryitem',
        name: 'Ariat International Style Matrix Availability Flow',
        internalId: '91204',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204'
      },
      componentItem: {
        type: 'inventoryitem',
        recordType: 'inventoryitem',
        name: 'Ariat International Size Color SKU',
        internalId: '91205',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205'
      }
    },
    demoTransaction: {
      name: 'Ariat Seasonal Footwear Availability Demo Order',
      internalId: '91202',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=91202'
    },
    heroItem: {
      name: 'Ariat International Style SKU',
      internalId: '91203',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91203'
    },
    matrixItem: {
      name: 'Ariat International Style Matrix Availability Flow',
      internalId: '91204',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91204'
    },
    componentItems: [
      {
        name: 'Ariat International Size Color SKU',
        internalId: '91205',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=91205'
      }
    ],
    ownership: {
      generatedRecordsOwnedBy: 'governed_runner_internal_build_engine',
      drawerWrites: false,
      drawerTransactionWrites: false,
      drawerCreatedRecords: false
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

function landingChecklistFromPacket(targetedPacket) {
  return targetedPacket.targetedRecords.map((record) => ({
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
      `NetSuite page displays ${record.name} or matching record identity`,
      'Page is not Notice, Error, Invalid number, placeholder, or record-does-not-exist'
    ]
  }));
}

function main() {
  const hooks = loadHooks();
  const { state, lane, page, recommendation } = buildContext(hooks);
  const completedResultJson = completedRunnerResultJson();
  const adapterEnvelope = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'completed_runner_result_ready',
    queueSubmitted: true,
    runnerTaskId: completedResultJson.source.runnerTaskId,
    idempotencyToken: completedResultJson.source.idempotencyToken,
    resultCapture: {
      status: 'completed_result_capture_ready',
      finalGeneratedNamesReady: true,
      finalGeneratedNamesJson: completedResultJson
    },
    finalGeneratedNamesJson: completedResultJson,
    activeOpenLinks: 0
  };
  const normalized = hooks.normalizeApprovedServerAdapterTransportResponseV1(adapterEnvelope, {
    pollAttempted: true,
    runnerTaskId: adapterEnvelope.runnerTaskId
  });
  const beforeNavigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedResultJson, state, lane, page, recommendation);
  const handoffGuard = hooks.validateDccFinalNamingImportPayload(
    hooks.dccRunnerHandoffPacketV1(state, lane, page, recommendation),
    state,
    lane,
    page,
    recommendation
  );
  const importCommit = hooks.completedRunnerResultImportCommitOperatorFlowV1(
    state,
    lane,
    page,
    recommendation,
    {
      operatorChoseImport: true,
      completedResultJson,
      pollControl: {
        schema: 'idb.approved-server-adapter-result-poll-control-implementation.v1',
        status: 'poll_control_completed_result_ready_for_w151_import',
        resultImportGuard: {
          importReady: true,
          completedResultAcceptedByW151: completedGuard.valid === true,
          activeOpenLinksBeforeImport: 0
        },
        normalizedPollResponse: Object.assign({}, normalized, {
          finalGeneratedNamesJson: completedResultJson,
          finalGeneratedNamesJsonReady: completedGuard.valid === true
        })
      }
    }
  );
  const committedState = importCommit.commitAllowed
    ? Object.assign({}, state, importCommit.statePatch)
    : Object.assign({}, state);
  const afterNavigation = hooks.dccFinalNavigationModel(committedState, lane, page, recommendation);
  const targetedPacket = hooks.importedFinalUrlTargetedOperatorVerificationPacketFromBuildReturnV1(
    state,
    lane,
    page,
    recommendation,
    {
      importCommit,
      completedResultJson
    }
  );
  const landingChecklist = landingChecklistFromPacket(targetedPacket);

  const allTargetedRecordsReady = targetedPacket.targetedRecords.length === 5 &&
    targetedPacket.targetedRecords.every((record) => record.readyForOperatorClick === true);
  const verifiedOpenLinks = Number(afterNavigation.linkAuthoritySummary.verified_openable || 0);
  const results = [];
  assertCase(results, 'w204_w203_completed_response_normalized', normalized.status === 'completed_result_awaiting_w151_import' || normalized.finalGeneratedNamesJsonReady === true, JSON.stringify({ status: normalized.status, ready: normalized.finalGeneratedNamesJsonReady }));
  assertCase(results, 'w204_w151_accepts_completed_runner_result', completedGuard.valid === true && completedResultJson.generatedRecordOwner === 'governed_runner_internal_build_engine', JSON.stringify(completedGuard));
  assertCase(results, 'w204_handoff_json_rejected', handoffGuard.valid === false && handoffGuard.status === 'handoff_packet_rejected', JSON.stringify(handoffGuard));
  assertCase(results, 'w204_no_open_links_before_import', beforeNavigation.status === 'using_provisional_preview_names' && !beforeNavigation.linkAuthoritySummary.verified_openable, JSON.stringify(beforeNavigation.linkAuthoritySummary));
  assertCase(results, 'w204_import_commit_updates_final_generated_names', importCommit.commitAllowed === true && importCommit.statePatch && importCommit.statePatch.dccFinalNamingResult, JSON.stringify(importCommit.importCommitOperatorFlow));
  assertCase(results, 'w204_build_run_have_five_verified_links_after_import', afterNavigation.status === 'using_dcc_final_names' && verifiedOpenLinks >= 5 && allTargetedRecordsReady, JSON.stringify({ status: afterNavigation.status, summary: afterNavigation.linkAuthoritySummary, targeted: targetedPacket.targetedRecords }));
  assertCase(results, 'w204_targeted_visual_packet_only', targetedPacket.status === 'imported_final_url_targeted_operator_verification_packet_ready' && targetedPacket.verificationScope && targetedPacket.verificationScope.targetedOnly === true && targetedPacket.verificationScope.broaderVisualTestingBlocked === true, JSON.stringify({ status: targetedPacket.status, scope: targetedPacket.verificationScope }));
  assertCase(results, 'w204_no_regression_boundaries_preserved', importCommit.mutationGuard.drawerWritesAttempted === false && importCommit.mutationGuard.drawerTransactionWritesAttempted === false && importCommit.importCommitOperatorFlow.drawerCreatesRecords === false && importCommit.importCommitOperatorFlow.drawerInvokesSuiteScriptOutsideApprovedAdapter === false, JSON.stringify(importCommit.mutationGuard));

  const pass = results.every((result) => result.pass);
  const contract = {
    schema: 'idb.w204-import-w151-valid-completed-runner-result-and-verify-five-real-links.v1',
    status: pass
      ? 'PASS_W204_IMPORT_READY_FIVE_REAL_LINK_TARGETED_VERIFICATION_PACKET_READY'
      : 'FAIL_W204_IMPORT_OR_LINK_AUTHORITY',
    sourceCompletedRunnerResult: {
      sourceBlock: 'W203',
      adapterEnvelopeStatus: adapterEnvelope.status,
      runnerTaskId: adapterEnvelope.runnerTaskId,
      idempotencyToken: adapterEnvelope.idempotencyToken,
      resultCaptureStatus: adapterEnvelope.resultCapture.status
    },
    importedFinalGeneratedNamesJson: completedResultJson,
    w151ImportEvidence: {
      completedResultAccepted: completedGuard.valid === true,
      handoffJsonRejected: handoffGuard.valid === false,
      generatedRecordOwner: completedResultJson.generatedRecordOwner,
      commitAllowed: importCommit.commitAllowed === true,
      noOpenLinksBeforeImport: !beforeNavigation.linkAuthoritySummary.verified_openable,
      verifiedOpenLinksAfterImport: verifiedOpenLinks
    },
    targetedFiveLinkVerificationPacket: {
      status: targetedPacket.status,
      exactOperatorSteps: targetedPacket.exactOperatorSteps,
      screenshotsNeeded: targetedPacket.screenshotsNeeded,
      passCriteria: targetedPacket.passCriteria,
      failCriteria: targetedPacket.failCriteria,
      landingChecklist
    },
    noRegression: {
      noDrawerWrites: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noDirectSuiteScriptOutsideApprovedW144AdapterPath: true,
      runnerOwnershipPreserved: completedResultJson.generatedRecordOwner === 'governed_runner_internal_build_engine',
      noActiveOpenLinksBeforeImport: !beforeNavigation.linkAuthoritySummary.verified_openable,
      openLinksOnlyAfterW151Import: verifiedOpenLinks >= 5
    },
    visualTestingDecision: {
      targetedFiveLinkVerificationOnly: true,
      broaderVisualNetSuiteTestingRequired: false,
      reason: 'The drawer can only verify URL authority. Actual record-page existence must be proven by the authenticated operator clicking the five imported Open links after W151 import.'
    },
    traceSamples: [
      {
        event: 'w204_completed_w203_result_available',
        status: adapterEnvelope.status,
        runnerTaskId: adapterEnvelope.runnerTaskId,
        finalGeneratedNamesJsonReady: normalized.finalGeneratedNamesJsonReady === true
      },
      {
        event: 'w204_w151_import_guard',
        completedResultAccepted: completedGuard.valid === true,
        handoffJsonRejected: handoffGuard.valid === false,
        generatedRecordOwner: completedResultJson.generatedRecordOwner
      },
      {
        event: 'w204_import_commit',
        commitAllowed: importCommit.commitAllowed === true,
        beforeNavigationStatus: beforeNavigation.status,
        afterNavigationStatus: afterNavigation.status,
        verifiedOpenLinksAfterImport: verifiedOpenLinks
      },
      {
        event: 'w204_targeted_link_verification_ready',
        targetedRecordCount: targetedPacket.targetedRecords.length,
        allTargetedRecordsReady,
        broaderVisualTesting: 'blocked'
      }
    ],
    results,
    nextPrompt: 'Move through W205: Authenticated Five-Link Landing Evidence Review And Production Consultant Flow Cleanup. Use the W204 imported final generated names and operator screenshots for Customer, demo Sales Order, hero item, matrix/proof item, and component item. Mark pass only if all five Open links land on actual NetSuite record pages with matching numeric ids and record identity, reject Notice/Error/placeholder pages, then hide W144 endpoint/flags/operator fields behind saved admin config so consultants use only name, website, notes, and simple build toggles. Preserve no drawer writes, runner ownership, W151 import guard, and no broader visual testing.'
  };

  const trace = {
    schema: 'idb.w204-import-w151-completed-result-verify-five-links-trace.v1',
    traceSamples: contract.traceSamples,
    targetedRecords: targetedPacket.targetedRecords,
    landingChecklist,
    results
  };

  const recordRows = landingChecklist.map((record) =>
    `| ${record.label} | ${record.name} | ${record.internalId} | ${record.url} | ${record.actualRecordPageLanding} |`
  ).join('\n');
  const report = `# W204 Import W151-Valid Completed Runner Result And Verify Five Real Links

Decision: ${contract.status}

## W151 Import Evidence

- Completed runner result accepted: ${contract.w151ImportEvidence.completedResultAccepted ? 'yes' : 'no'}
- Handoff JSON rejected by import guard: ${contract.w151ImportEvidence.handoffJsonRejected ? 'yes' : 'no'}
- Commit allowed only after operator import: ${contract.w151ImportEvidence.commitAllowed ? 'yes' : 'no'}
- Open links before import: ${contract.w151ImportEvidence.noOpenLinksBeforeImport ? 'none' : 'present'}
- Verified Open links after import: ${contract.w151ImportEvidence.verifiedOpenLinksAfterImport}

## Targeted Five-Link Verification

| Record | Name | Internal ID | URL | Landing Evidence |
| --- | --- | --- | --- | --- |
${recordRows}

Pass only after authenticated NetSuite screenshots prove each imported Open link lands on an actual record page with the matching id and record identity. Fail any Notice, Error, Invalid number, placeholder id, wrong record path, or record-does-not-exist page.

## W204 Report

W204 proves the IDB drawer can consume a W203 completed runner result, keep links hidden before import, commit final generated names only after W151 validation, and prepare exactly the five imported record links for targeted operator verification. No drawer writes, drawer-created records, drawer transaction writes, or direct SuiteScript outside W144 are introduced.

## Next Prompt

${contract.nextPrompt}
`;

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, report);

  if (!pass) {
    const failures = results.filter((result) => !result.pass).map((result) => result.name);
    console.error(`W204 import and five-link verification harness failed: ${failures.join(', ')}`);
    process.exit(1);
  }
  console.log(`W204 import W151 completed result and five-link verification: ${contract.status}; openLinks=${verifiedOpenLinks}`);
}

main();
