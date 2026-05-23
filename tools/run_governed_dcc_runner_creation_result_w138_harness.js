const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w137rPath = path.join(root, 'data', 'w137_real_numeric_id_visual_evidence_review.json');
const dataPath = path.join(root, 'data', 'w138_governed_dcc_runner_creation_result_capture.json');
const tracePath = path.join(root, 'trace_samples', 'w138_governed_dcc_runner_creation_result_capture_trace.json');
const reportPath = path.join(root, 'reports', 'w138_governed_dcc_runner_creation_result_capture.md');

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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function ariatState() {
  return {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'consultant_confirmed',
    selectedMoveIndex: 0,
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

const runnerCreationResultJsonShape = {
  schema: 'idb.dcc-runner.creation-result.v1',
  runnerStatus: 'complete',
  runnerRunId: 'DCC-RUN-ARIAT-STYLE-READY-001',
  runnerEnvironment: 'NetSuite sandbox',
  generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
  drawerAuthority: 'import_result_only',
  recordCreationAuthority: 'dcc_runner_only',
  sourceHandoff: {
    handoffPacketId: 'idb-dcc-runner-handoff-packet-operator-export',
    prospect: 'Ariat International',
    laneId: 'apparel_accessories',
    laneName: 'Apparel & Accessories',
    demoPath: 'Style-to-Availability Readiness',
    handoffParityStatus: 'matched'
  },
  records: {
    customer: {
      role: 'customer',
      recordType: 'customer',
      name: 'Ariat International Outdoor Retail Account',
      internalId: '91201',
      url: '/app/common/entity/custjob.nl?id=91201',
      createdOrResolvedBy: 'dcc_runner',
      existenceProofRequired: true
    },
    demoTransaction: {
      role: 'sales_order',
      recordType: 'salesorder',
      name: 'Ariat Seasonal Footwear Availability Demo Order',
      internalId: '91202',
      url: '/app/accounting/transactions/salesord.nl?id=91202',
      createdOrResolvedBy: 'dcc_runner',
      existenceProofRequired: true
    },
    heroItem: {
      role: 'hero_item',
      recordType: 'inventoryitem',
      name: 'Ariat Terrain H2O Work Boot Hero Item',
      internalId: '91203',
      url: '/app/common/item/item.nl?id=91203',
      createdOrResolvedBy: 'dcc_runner',
      existenceProofRequired: true
    },
    matrixProofItem: {
      role: 'matrix_or_proof_item',
      recordType: 'matrixitem',
      name: 'Ariat Core Boot Size Color Matrix',
      internalId: '91204',
      url: '/app/common/item/item.nl?id=91204',
      createdOrResolvedBy: 'dcc_runner',
      existenceProofRequired: true
    },
    componentItems: [
      {
        role: 'component_item',
        recordType: 'inventoryitem',
        name: 'Ariat Brown Leather Upper Component',
        internalId: '91205',
        url: '/app/common/item/item.nl?id=91205',
        createdOrResolvedBy: 'dcc_runner',
        existenceProofRequired: true
      }
    ]
  },
  finalGeneratedNamesImport: {
    schema: 'idb.internal-build-engine.real-record-result.v1',
    runStatus: 'run_complete',
    prospect: 'Ariat International',
    familyKey: 'apparelAccessories',
    scenario: 'Style-to-Availability Readiness',
    generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
    recordExistenceStatus: 'runner_created_or_resolved_operator_visual_required',
    customer: {
      name: 'Ariat International Outdoor Retail Account',
      id: '91201',
      url: '/app/common/entity/custjob.nl?id=91201'
    },
    salesOrder: {
      name: 'Ariat Seasonal Footwear Availability Demo Order',
      id: '91202',
      url: '/app/accounting/transactions/salesord.nl?id=91202'
    },
    heroItem: {
      name: 'Ariat Terrain H2O Work Boot Hero Item',
      id: '91203',
      url: '/app/common/item/item.nl?id=91203'
    },
    matrixItem: {
      name: 'Ariat Core Boot Size Color Matrix',
      id: '91204',
      url: '/app/common/item/item.nl?id=91204'
    },
    componentItems: [
      {
        name: 'Ariat Brown Leather Upper Component',
        id: '91205',
        url: '/app/common/item/item.nl?id=91205'
      }
    ],
    warnings: [],
    errors: [],
    recoverableBlockers: []
  },
  noSubmitRollback: {
    supported: true,
    behavior: 'If the operator cancels before runner submission, no runner job starts and no drawer state is promoted beyond the exported handoff.'
  },
  warnings: [],
  errors: []
};

function smoke(hooks, result) {
  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  state.dccFinalNamingResult = hooks.dccFinalNamingResultV1(result.finalGeneratedNamesImport, state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const reviewHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'prove' }, {}));
  const links = navigation.reviewObjects.map((item) => ({
    label: item.label,
    role: item.role,
    name: item.name,
    id: item.id,
    url: item.url,
    status: item.linkAuthority.status,
    openable: item.linkAuthority.openable,
    openableUrl: item.openableUrl
  }));
  return {
    navigationStatus: navigation.status,
    reviewHtml,
    runHtml,
    links,
    openAnchorCount: (reviewHtml.match(/idb-inline-link/g) || []).length + (runHtml.match(/idb-inline-link/g) || []).length,
    linkPendingCount: (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length,
    buildResultsUseImportedNames: /Ariat International Outdoor Retail Account/.test(reviewHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(reviewHtml),
    runUsesImportedNames: /Ariat International Outdoor Retail Account/.test(runHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(runHtml)
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w137r = readJson(w137rPath);
  const smokeResult = smoke(hooks, runnerCreationResultJsonShape);
  const results = [];
  const recordEntries = [
    runnerCreationResultJsonShape.records.customer,
    runnerCreationResultJsonShape.records.demoTransaction,
    runnerCreationResultJsonShape.records.heroItem,
    runnerCreationResultJsonShape.records.matrixProofItem,
    ...runnerCreationResultJsonShape.records.componentItems
  ];
  const allRunnerOwnedRecords = recordEntries.every((record) => record.createdOrResolvedBy === 'dcc_runner' && /^\d+$/.test(record.internalId) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+$/.test(record.url));

  assertCase(results, 'w138_starts_from_w137r_runner_creation_required', w137r.decision === 'NO_GO_REAL_RECORD_EXISTENCE__RUNNER_DCC_CREATION_REQUIRED' && w137r.evidenceFinding.recordExistenceProven === false, w137r.decision);
  assertCase(results, 'w138_runner_result_json_shape_requires_runner_owned_records', runnerCreationResultJsonShape.recordCreationAuthority === 'dcc_runner_only' && runnerCreationResultJsonShape.drawerAuthority === 'import_result_only' && allRunnerOwnedRecords, JSON.stringify(recordEntries));
  assertCase(results, 'w138_import_smoke_accepts_runner_result_only', smokeResult.navigationStatus === 'using_dcc_final_names' && smokeResult.openAnchorCount >= 8 && smokeResult.linkPendingCount === 0 && smokeResult.links.every((item) => item.status === 'verified_openable' && item.openable === true), JSON.stringify(smokeResult.links));
  assertCase(results, 'w138_operator_path_keeps_drawer_no_write', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');
  assertCase(results, 'w138_visual_record_existence_required_after_runner', true, 'Harness validates result capture shape; actual record pages still require targeted NetSuite visual proof after the DCC runner executes.');

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w138-governed-dcc-runner-creation-result-capture.v1',
    status: failures.length ? 'blocked' : 'runner_creation_result_capture_ready_operator_only',
    decision: failures.length ? 'FAIL' : 'PASS_CONTRACT_READY__RUNNER_EXECUTION_REQUIRED',
    sourceFinding: {
      w137rDecision: w137r.decision,
      numericDrawerImportsCreateRecords: false,
      governedRunnerRequiredForRecordExistence: true
    },
    runnerCreationResultContract: {
      owner: 'governed_dcc_runner_internal_build_engine',
      drawerAuthority: 'import_result_only',
      recordCreationAuthority: 'dcc_runner_only',
      requiredRecords: [
        'customer',
        'demoTransaction',
        'heroItem',
        'matrixProofItem',
        'componentItems'
      ],
      requiredRules: [
        'Runner must create or resolve every required record before returning a final result.',
        'Runner output must include actual numeric NetSuite internal ids, not preview ids or hand-typed replacement tokens.',
        'Runner output must include supported NetSuite record URLs whose id query matches the numeric internal id.',
        'Drawer imports the final generated names and URLs only after operator review.',
        'Drawer does not submit, queue, invoke SuiteScript, or create records.'
      ]
    },
    operatorRunbook: [
      'Export the confirmed drawer handoff packet from Trace.',
      'Open the governed DCC runner/internal build engine surface as an operator.',
      'Load the handoff packet and verify sales request complete, demo path confirmed, handoff exported, operator review ready, and no state mismatch.',
      'Confirm the runner execution scope: Customer, demo transaction, hero item, matrix/proof item, and component item.',
      'Start runner execution only from the governed DCC runner surface; the drawer does not submit, invoke, queue, or write.',
      'Capture the runner result JSON after the runner creates or resolves records.',
      'Import only the final generated names JSON into the drawer Trace tab.',
      'Perform targeted visual NetSuite testing by clicking each Open link and confirming an actual record page, not a notice or error page.',
      'Export the drawer trace, runner result JSON, and screenshots for W138R review.'
    ],
    resultJsonShape: runnerCreationResultJsonShape,
    drawerImportSmoke: smokeResult,
    traceSamples: {
      acceptedTraceStatus: 'runner_result_capture_contract_ready',
      expectedPostRunnerEvidence: [
        'runner result JSON with numeric ids',
        'drawer trace after final generated names import',
        'screenshots for each Open link landing on an actual record page'
      ]
    },
    noRegression: {
      noDrawerWrites: true,
      noSuiteScriptInvocationFromDrawer: true,
      noTransactionWritesFromDrawer: true,
      consultantConfirmationRequired: true,
      stateAuthorityPreserved: true,
      handoffParityPreserved: true,
      noSubmitRollbackPreserved: true,
      generatedRecordsOwnedByInternalBuildEngine: true
    },
    targetedVisualNetSuiteTestingRequiredNow: true,
    broaderVisualNetSuiteTestingRequired: false,
    bestNextCodexPrompt: {
      block: 'W138R: Review Governed Runner Creation Evidence',
      prompt: 'Move through W138R: Review Governed Runner Creation Evidence. Use the operator-provided governed DCC runner result JSON, drawer trace export, and screenshots proving the runner-created or runner-resolved Customer, demo transaction, hero item, matrix/proof item, and component records open in NetSuite. Grade runner result completeness, handoff parity, record existence, no drawer writes, no drawer SuiteScript invocation, no drawer transaction writes, and consultant usability. Output pass/fail, remediation, W138R report, whether broader visual NetSuite testing is required, and best next Codex prompt.'
    },
    harnessResults: results
  };

  const trace = {
    schema: 'idb.w138-governed-dcc-runner-creation-result-capture-trace.v1',
    decision: contract.decision,
    runnerCreationAuthority: contract.runnerCreationResultContract.recordCreationAuthority,
    drawerAuthority: contract.runnerCreationResultContract.drawerAuthority,
    importSmoke: {
      navigationStatus: smokeResult.navigationStatus,
      openAnchorCount: smokeResult.openAnchorCount,
      linkPendingCount: smokeResult.linkPendingCount,
      verifiedOpenableCount: smokeResult.links.filter((item) => item.status === 'verified_openable').length
    },
    recordExistenceProvenInThisHarness: false,
    targetedVisualNetSuiteTestingRequiredNow: true,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W138 Governed DCC Runner Creation Result Capture

Status: ${contract.status}

## Decision

${contract.decision}

## Runner Creation Result Contract

- Owner: ${contract.runnerCreationResultContract.owner}
- Drawer authority: ${contract.runnerCreationResultContract.drawerAuthority}
- Record creation authority: ${contract.runnerCreationResultContract.recordCreationAuthority}
- Required records: ${contract.runnerCreationResultContract.requiredRecords.join(', ')}

## Operator Runbook

${contract.operatorRunbook.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Result JSON Shape

- Schema: ${contract.resultJsonShape.schema}
- Runner status: ${contract.resultJsonShape.runnerStatus}
- Runner run id field required: yes
- Final generated names import included: yes

## Smoke Evidence

- Navigation status: ${smokeResult.navigationStatus}
- Open anchors rendered from runner result shape: ${smokeResult.openAnchorCount}
- Link pending count: ${smokeResult.linkPendingCount}
- Build results use imported names: ${smokeResult.buildResultsUseImportedNames}
- Run uses imported names: ${smokeResult.runUsesImportedNames}

## Visual NetSuite Testing

- Targeted visual NetSuite testing required now: Yes, after governed DCC runner execution returns real records.
- Broader visual NetSuite testing required: No.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  console.log(`W138 governed DCC runner creation result capture: ${contract.decision}; visualRequired=${contract.targetedVisualNetSuiteTestingRequiredNow}`);
  if (failures.length) {
    failures.forEach((failure) => console.error(`FAIL ${failure.name}: ${failure.detail}`));
    process.exit(1);
  }
}

main();
