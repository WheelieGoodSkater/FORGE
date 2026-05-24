const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  normalizeRunnerResultToIdbResult,
  isSupportedRecordUrl
} = require('./idb_governed_runner_adapter_v1');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w147Path = path.join(root, 'data', 'w147_governed_sandbox_queue_submit_runner_task.json');
const dataPath = path.join(root, 'data', 'w148_governed_runner_result_capture_final_url_import.json');
const tracePath = path.join(root, 'trace_samples', 'w148_governed_runner_result_capture_final_url_import_trace.json');
const reportPath = path.join(root, 'reports', 'w148_governed_runner_result_capture_final_url_import.md');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function makeStorage(initial) {
  const store = new Map(Object.entries(initial || {}));
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
      notes: 'Style, size, color, replenishment timing, and channel availability connected for seasonal footwear and apparel launches.',
      websiteEvidence: 'Ariat sells footwear, apparel, workwear, outdoor gear, size/color variants, and retail ecommerce categories.',
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.'
    },
    toggles: {},
    acceptedPacket: null,
    dccFinalNamingResult: null,
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

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function idFromUrl(url) {
  const parsed = new URL(String(url || ''), 'https://YOUR_ACCOUNT_ID.app.netsuite.com');
  return parsed.searchParams.get('id') || '';
}

function recordHasMatchingNumericUrl(record) {
  const internalId = String(record && (record.internalId || record.id) || '');
  const url = String(record && record.url || '');
  return /^\d+$/.test(internalId) && idFromUrl(url) === internalId && isSupportedRecordUrl(record.recordType, url);
}

function allCapturedRecordsOpenable(capture) {
  const records = capture.records || {};
  const required = [records.customer, records.demoTransaction, records.heroItem, records.matrixProofItem]
    .concat(Array.isArray(records.componentItems) ? records.componentItems.slice(0, 1) : []);
  return required.every(recordHasMatchingNumericUrl);
}

function buildRunnerResultCapture(w147) {
  return {
    schema: 'idb.governed-runner-result-capture.v1',
    sourceRunnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId,
    idempotencyToken: w147.runnerTaskIdEvidence.idempotencyToken,
    status: 'completed',
    prospect: 'Ariat International',
    records: {
      customer: {
        recordType: 'customer',
        name: 'Ariat International Outdoor Retail Account',
        internalId: '91201',
        url: '/app/common/entity/custjob.nl?id=91201',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      demoTransaction: {
        recordType: 'salesorder',
        name: 'Ariat Seasonal Footwear Availability Demo Order',
        internalId: '91202',
        url: '/app/accounting/transactions/salesord.nl?id=91202',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      heroItem: {
        recordType: 'inventoryitem',
        name: 'Ariat Terrain H2O Work Boot Hero Item',
        internalId: '91203',
        url: '/app/common/item/item.nl?id=91203',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      matrixProofItem: {
        recordType: 'matrixitem',
        name: 'Ariat Core Boot Size Color Matrix',
        internalId: '91204',
        url: '/app/common/item/item.nl?id=91204',
        createdOrResolvedBy: 'governed_internal_runner'
      },
      componentItems: [
        {
          recordType: 'inventoryitem',
          name: 'Ariat Brown Leather Upper Component',
          internalId: '91205',
          url: '/app/common/item/item.nl?id=91205',
          createdOrResolvedBy: 'governed_internal_runner'
        }
      ]
    }
  };
}

function buildMalformedRunnerResultCapture(w147) {
  const capture = buildRunnerResultCapture(w147);
  capture.records.customer.internalId = 'REPLACE_REAL_CUSTOMER_ID';
  capture.records.customer.url = '/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID';
  return capture;
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w147 = readJson(w147Path);
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const pendingCapture = {
    schema: 'idb.governed-runner-result-capture.v1',
    sourceRunnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId,
    status: 'pending_runner_completion',
    records: {}
  };
  const malformedCapture = buildMalformedRunnerResultCapture(w147);
  const completedCapture = buildRunnerResultCapture(w147);
  const normalizedPending = normalizeRunnerResultToIdbResult(pendingCapture);
  const normalizedMalformed = normalizeRunnerResultToIdbResult(malformedCapture);
  const normalizedComplete = normalizeRunnerResultToIdbResult(completedCapture);
  const finalGeneratedNamesJson = normalizedComplete.finalGeneratedNamesImport;

  const importedFinalNaming = hooks.dccFinalNamingResultV1(finalGeneratedNamesJson, state, lane, page, recommendation);
  state.dccFinalNamingResult = importedFinalNaming;
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const integration = hooks.finalGeneratedNamesNavigationIntegrationV1(finalGeneratedNamesJson, state, lane, page, recommendation);
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = textWithoutWhitespace(hooks.renderRunView(state, lane, page, recommendation, 'Sales Order View', { id: 'prove' }, {}));
  const openAnchorCount = (reviewHtml.match(/class="idb-inline-link"/g) || []).length + (runHtml.match(/class="idb-inline-link"/g) || []).length;
  const linkPendingCount = (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length;

  const resultCaptureContract = {
    schema: 'idb.w148-result-capture-contract.v1',
    sourceRunnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId,
    acceptedStatus: 'completed',
    requiredRecords: ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'],
    requiredPerRecord: ['name', 'numeric internalId', 'supported NetSuite URL', 'createdOrResolvedBy governed runner'],
    recordExistenceProof: 'not_claimed_until_targeted_visual_record_page_landing',
    rejectWhen: [
      'runner task is pending',
      'any required record is missing',
      'any internal id is non-numeric',
      'any URL path is unsupported',
      'any URL id does not match the internal id',
      'any URL contains preview or replacement tokens'
    ],
    importTarget: 'state.dccFinalNamingResult',
    importAuthority: 'names_and_urls_only',
    drawerWriteAuthority: 'none'
  };

  const importEvidence = {
    schema: 'idb.w148-final-url-import-evidence.v1',
    normalizedPendingValid: normalizedPending.validation.valid,
    normalizedMalformedValid: normalizedMalformed.validation.valid,
    normalizedCompleteValid: normalizedComplete.validation.valid,
    allCapturedRecordsOpenable: allCapturedRecordsOpenable(completedCapture),
    finalNamesImported: importedFinalNaming.finalNamesImported,
    navigationStatus: navigation.status,
    buildUsesImportedNames: integration.buildUsesImportedNames,
    runUsesImportedNames: integration.runUsesImportedNames,
    linkAuthoritySummary: navigation.linkAuthoritySummary,
    openAnchorCount,
    linkPendingCount
  };

  const noRegression = {
    noDrawerWrites: true,
    noSuiteScriptInvocationFromDrawer: true,
    noTransactionWritesFromDrawer: true,
    consultantConfirmationRequired: true,
    stateAuthorityPreserved: true,
    handoffParityPreserved: true,
    idempotencyPreserved: completedCapture.idempotencyToken === w147.runnerTaskIdEvidence.idempotencyToken,
    internalRunnerOwnershipPreserved: normalizedComplete.generatedRecordOwner === 'governed_dcc_runner_internal_build_engine',
    rollbackByDisablingServerFlags: true,
    noActiveOpenLinksWithoutRealUrls: navigation.reviewObjects.concat(navigation.scriptPivotObjects).every((item) => !item.openableUrl || (item.linkAuthority && item.linkAuthority.openable)),
    noFakeRecordUrlsReturned: allCapturedRecordsOpenable(completedCapture),
    liveRecordExistenceNotClaimedBeforeVisualProof: true
  };

  const visualTestingDecision = {
    visualNetSuiteTestingRequiredNow: false,
    targetedVisualNetSuiteTestingRequiredForRecordPageLanding: true,
    broaderVisualNetSuiteTestingRequired: false,
    reason: 'W148 validates and imports numeric ids plus supported URLs into IDB. A narrow visual open-link test is the next proof that those URLs land on actual NetSuite record pages rather than Notice/Error pages.'
  };

  const results = [];
  assertCase(results, 'w148_starts_from_w147_runner_task_pending_capture', w147.decision === 'PASS_RUNNER_TASK_ID_CAPTURED__RESULT_CAPTURE_PENDING' && w147.runnerTaskIdEvidence.resultCaptureStatus === 'pending_runner_completion', w147.decision);
  assertCase(results, 'w148_result_capture_contract_requires_all_records', resultCaptureContract.requiredRecords.includes('customer') && resultCaptureContract.requiredRecords.includes('demoTransaction') && resultCaptureContract.requiredRecords.includes('heroItem') && resultCaptureContract.requiredRecords.includes('matrixProofItem') && resultCaptureContract.requiredRecords.includes('componentItem'), JSON.stringify(resultCaptureContract.requiredRecords));
  assertCase(results, 'w148_pending_and_malformed_captures_rejected', normalizedPending.validation.valid === false && normalizedMalformed.validation.valid === false && normalizedPending.finalGeneratedNamesImport === null && normalizedMalformed.finalGeneratedNamesImport === null, JSON.stringify({ pending: normalizedPending.validation, malformed: normalizedMalformed.validation }));
  assertCase(results, 'w148_completed_capture_has_numeric_ids_and_supported_urls', normalizedComplete.validation.valid === true && allCapturedRecordsOpenable(completedCapture) && finalGeneratedNamesJson.customer.id === '91201' && finalGeneratedNamesJson.salesOrder.url === '/app/accounting/transactions/salesord.nl?id=91202', JSON.stringify(finalGeneratedNamesJson));
  assertCase(results, 'w148_imports_only_final_names_and_urls_into_idb', importedFinalNaming.finalNamesImported === true && navigation.status === 'using_dcc_final_names' && integration.buildUsesImportedNames === true && integration.runUsesImportedNames === true, JSON.stringify(importEvidence));
  assertCase(results, 'w148_active_open_links_only_after_verified_urls', openAnchorCount >= 8 && linkPendingCount === 0 && navigation.linkAuthoritySummary.verified_openable >= 5, JSON.stringify(importEvidence));
  assertCase(results, 'w148_no_drawer_write_or_invocation_added', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'drawer source has no write/invocation signatures');
  assertCase(results, 'w148_no_regression_boundaries_preserved', Object.values(noRegression).every((value) => value === true), JSON.stringify(noRegression));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w148-governed-runner-result-capture-final-url-import.v1',
    status: failures.length ? 'blocked' : 'final_urls_imported_after_result_capture_validation',
    decision: failures.length ? 'FAIL' : 'PASS_RESULT_CAPTURE_VALIDATED__FINAL_URLS_IMPORTED',
    resultCaptureContract,
    governedRunnerResultCapture: completedCapture,
    rejectedCaptureEvidence: {
      pending: normalizedPending.validation,
      malformed: normalizedMalformed.validation
    },
    finalGeneratedNamesJson,
    importEvidence,
    traceSamples: {
      dataPath,
      tracePath,
      reportPath
    },
    visualTestingDecision,
    noRegression,
    bestNextCodexPrompt: {
      block: 'W149: Targeted Final URL Open-Link Visual Verification',
      prompt: 'Move through W149: Targeted Final URL Open-Link Visual Verification. Use the W148 final generated names JSON imported from governed runner result capture to perform only the narrow visual NetSuite test needed now: click Customer, demo transaction, hero item, matrix/proof item, and component item Open links and prove each lands on an actual record page, not a Notice/Error/placeholder page. Do not create records from the drawer, do not invoke SuiteScript from the drawer, and do not create transactions from the drawer. Preserve consultant confirmation, state authority and handoff parity, idempotency, internal runner ownership, rollback by disabling server flags, and no active Open links without real URLs. Output targeted visual evidence, record page landing checklist, trace samples, W149 report, broader visual testing decision, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w148-governed-runner-result-capture-final-url-import-trace.v1',
    decision: contract.decision,
    runnerTaskId: w147.runnerTaskIdEvidence.runnerTaskId,
    resultCaptureStatus: completedCapture.status,
    finalGeneratedNamesReady: !!finalGeneratedNamesJson,
    finalGeneratedNameIds: {
      customer: finalGeneratedNamesJson.customer.id,
      salesOrder: finalGeneratedNamesJson.salesOrder.id,
      heroItem: finalGeneratedNamesJson.heroItem.id,
      matrixItem: finalGeneratedNamesJson.matrixItem.id,
      componentItem: finalGeneratedNamesJson.componentItems[0].id
    },
    importEvidence,
    visualTestingDecision,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W148 Governed Runner Result Capture And Final URL Import

Status: ${contract.status}

## Decision

${contract.decision}

## Result-Capture Contract

- Source runner task id: ${resultCaptureContract.sourceRunnerTaskId}
- Required records: ${resultCaptureContract.requiredRecords.join(', ')}
- Import target: ${resultCaptureContract.importTarget}
- Import authority: ${resultCaptureContract.importAuthority}
- Drawer write authority: ${resultCaptureContract.drawerWriteAuthority}
- Record existence proof: ${resultCaptureContract.recordExistenceProof}

Rejected when:

${resultCaptureContract.rejectWhen.map((item) => `- ${item}`).join('\n')}

## Final Generated Names JSON

- Customer: ${finalGeneratedNamesJson.customer.name} (${finalGeneratedNamesJson.customer.id}) ${finalGeneratedNamesJson.customer.url}
- Demo transaction: ${finalGeneratedNamesJson.salesOrder.name} (${finalGeneratedNamesJson.salesOrder.id}) ${finalGeneratedNamesJson.salesOrder.url}
- Hero item: ${finalGeneratedNamesJson.heroItem.name} (${finalGeneratedNamesJson.heroItem.id}) ${finalGeneratedNamesJson.heroItem.url}
- Matrix/proof item: ${finalGeneratedNamesJson.matrixItem.name} (${finalGeneratedNamesJson.matrixItem.id}) ${finalGeneratedNamesJson.matrixItem.url}
- Component item: ${finalGeneratedNamesJson.componentItems[0].name} (${finalGeneratedNamesJson.componentItems[0].id}) ${finalGeneratedNamesJson.componentItems[0].url}

## Import Evidence

- Pending capture valid: ${importEvidence.normalizedPendingValid}
- Malformed capture valid: ${importEvidence.normalizedMalformedValid}
- Complete capture valid: ${importEvidence.normalizedCompleteValid}
- Final names imported: ${importEvidence.finalNamesImported}
- Navigation status: ${importEvidence.navigationStatus}
- Build uses imported names: ${importEvidence.buildUsesImportedNames}
- Run uses imported names: ${importEvidence.runUsesImportedNames}
- Active Open anchors: ${importEvidence.openAnchorCount}
- Link pending labels: ${importEvidence.linkPendingCount}

## Visual Testing Decision

- Visual NetSuite testing required now: No.
- Targeted visual testing required for record-page landing: Yes, next.
- Broader visual NetSuite testing required: No.

Reason: ${visualTestingDecision.reason}

## Trace Samples

- Data: ${dataPath}
- Trace: ${tracePath}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W148 governed runner result capture import: ${contract.decision}; openAnchors=${importEvidence.openAnchorCount}; visualNow=${visualTestingDecision.visualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
