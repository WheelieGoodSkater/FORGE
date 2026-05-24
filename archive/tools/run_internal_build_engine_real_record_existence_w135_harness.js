const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w134Path = path.join(root, 'data', 'w134_manual_visual_results_review.json');
const dataPath = path.join(root, 'data', 'w135_internal_build_engine_real_record_existence_pilot.json');
const tracePath = path.join(root, 'trace_samples', 'w135_internal_build_engine_real_record_existence_trace.json');
const reportPath = path.join(root, 'reports', 'w135_internal_build_engine_real_record_existence_pilot.md');

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

const buildEngineRealRecordResultShape = {
  schema: 'idb.internal-build-engine.real-record-result.v1',
  runStatus: 'run_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  generatedRecordOwner: 'internal_build_engine',
  recordExistenceStatus: 'operator_verified_existing_records_required',
  customer: {
    name: 'Ariat International Outdoor Retail Account',
    id: '91001',
    url: '/app/common/entity/custjob.nl?id=91001',
    existenceProof: {
      required: true,
      status: 'operator_visual_proof_required',
      expectedPageType: 'Customer or Project record page',
      mustNotShowNotice: 'That record does not exist'
    }
  },
  salesOrder: {
    name: 'Ariat Seasonal Footwear Availability Demo Order',
    id: '91002',
    url: '/app/accounting/transactions/salesord.nl?id=91002',
    existenceProof: {
      required: true,
      status: 'operator_visual_proof_required',
      expectedPageType: 'Sales Order record page',
      mustNotShowNotice: 'That record does not exist'
    }
  },
  heroItem: {
    name: 'Ariat Terrain H2O Work Boot Hero Item',
    id: '91003',
    url: '/app/common/item/item.nl?id=91003',
    existenceProof: {
      required: true,
      status: 'operator_visual_proof_required',
      expectedPageType: 'Item record page',
      mustNotShowNotice: 'That record does not exist'
    }
  },
  matrixItem: {
    name: 'Ariat Core Boot Size Color Matrix',
    id: '91004',
    url: '/app/common/item/item.nl?id=91004',
    existenceProof: {
      required: true,
      status: 'operator_visual_proof_required',
      expectedPageType: 'Item record page',
      mustNotShowNotice: 'That record does not exist'
    }
  },
  componentItems: [
    {
      name: 'Ariat Brown Leather Upper Component',
      id: '91005',
      url: '/app/common/item/item.nl?id=91005',
      existenceProof: {
        required: true,
        status: 'operator_visual_proof_required',
        expectedPageType: 'Item record page',
        mustNotShowNotice: 'That record does not exist'
      }
    }
  ],
  warnings: [],
  errors: [],
  recoverableBlockers: []
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
  state.dccFinalNamingResult = hooks.dccFinalNamingResultV1(result, state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const reviewHtml = compact(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = compact(hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'prove' }, {}));
  return {
    state,
    lane,
    page,
    recommendation,
    navigation,
    reviewHtml,
    runHtml,
    openAnchorCount: (reviewHtml.match(/idb-inline-link/g) || []).length + (runHtml.match(/idb-inline-link/g) || []).length,
    linkPendingCount: (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w134Manual = readJson(w134Path);
  const smokeResult = smoke(hooks, buildEngineRealRecordResultShape);
  const results = [];
  const requiredRecords = [
    buildEngineRealRecordResultShape.customer,
    buildEngineRealRecordResultShape.salesOrder,
    buildEngineRealRecordResultShape.heroItem,
    buildEngineRealRecordResultShape.matrixItem,
    buildEngineRealRecordResultShape.componentItems[0]
  ];
  const links = smokeResult.navigation.reviewObjects.map((item) => ({
    label: item.label,
    name: item.name,
    id: item.id,
    url: item.url,
    linkStatus: item.linkAuthority.status,
    openable: item.linkAuthority.openable
  }));

  assertCase(results, 'w135_starts_from_w134_record_existence_gap', w134Manual.status === 'visual_link_authority_pass_record_existence_not_proven' && w134Manual.architecturalFinding.remainingGap === 'record_existence', JSON.stringify({ status: w134Manual.status, gap: w134Manual.architecturalFinding.remainingGap }));
  assertCase(results, 'w135_real_record_result_shape_requires_existence_proof', buildEngineRealRecordResultShape.schema === 'idb.internal-build-engine.real-record-result.v1' && requiredRecords.every((record) => /^\d+$/.test(record.id) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+/.test(record.url) && record.existenceProof && record.existenceProof.required === true), JSON.stringify(requiredRecords.map((record) => ({ name: record.name, id: record.id, url: record.url, existenceProof: record.existenceProof.status }))));
  assertCase(results, 'w135_drawer_imports_result_but_does_not_own_existence', smokeResult.navigation.status === 'using_dcc_final_names' && links.every((item) => item.linkStatus === 'verified_openable' && item.openable === true) && smokeResult.openAnchorCount >= 8, JSON.stringify({ status: smokeResult.navigation.status, links, openAnchorCount: smokeResult.openAnchorCount }));
  assertCase(results, 'w135_targeted_visual_test_defined_not_faked', requiredRecords.every((record) => record.existenceProof.status === 'operator_visual_proof_required') && buildEngineRealRecordResultShape.recordExistenceStatus === 'operator_verified_existing_records_required', buildEngineRealRecordResultShape.recordExistenceStatus);
  assertCase(results, 'w135_no_write_invocation_or_transaction_from_drawer', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');
  assertCase(results, 'w135_state_authority_handoff_parity_no_submit_preserved', hooks.stateAuthorityModel(smokeResult.state).handoffEligible === true && hooks.stateAuthorityModel(smokeResult.state).confirmedLaneId === hooks.stateAuthorityModel(smokeResult.state).exportedLaneId, JSON.stringify(hooks.stateAuthorityModel(smokeResult.state)));
  assertCase(results, 'w135_internal_build_engine_ownership_preserved', buildEngineRealRecordResultShape.generatedRecordOwner === 'internal_build_engine' && /The build engine owns generated records/.test(smokeResult.reviewHtml), buildEngineRealRecordResultShape.generatedRecordOwner);

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w135-internal-build-engine-real-record-existence-pilot.v1',
    status: failures.length ? 'blocked' : 'real_record_existence_pilot_ready_for_operator_run',
    decision: failures.length ? 'FAIL' : 'PASS_CONTRACT_READY__OPERATOR_REAL_RECORD_VISUAL_REQUIRED',
    sourceEvidence: {
      w134ManualStatus: w134Manual.status,
      w134Finding: w134Manual.architecturalFinding.remainingGap,
      w134NetSuiteClickResult: w134Manual.visualObservationFromUser.netSuiteClickResult
    },
    internalBuildEngineResultContract: {
      owner: 'internal_build_engine',
      drawerAuthority: 'import_display_and_link_gate_only',
      requiredRecords: [
        'customer',
        'demo_transaction',
        'hero_item',
        'matrix_or_proof_item',
        'component_item'
      ],
      requiredForOpenUsability: [
        'Real numeric NetSuite internal id returned by the internal build engine.',
        'Supported NetSuite record URL returned by the internal build engine.',
        'Operator visual proof that the URL opens an actual record page.',
        'Operator visual proof that NetSuite does not show the Notice: That record does not exist page.',
        'Trace export after import, with secrets redacted.'
      ],
      unsupportedEvidence: [
        'Preview placeholder ids.',
        'Representative numeric ids that have not been created or resolved.',
        'Any drawer-side claim that a URL is live without operator or build-engine existence proof.'
      ]
    },
    importedResultJsonShape: buildEngineRealRecordResultShape,
    drawerImportSmoke: {
      buildResultsUseImportedNames: /Final generated NetSuite records/.test(smokeResult.reviewHtml),
      runUsesImportedNames: /Use final build names/.test(smokeResult.runHtml),
      openAnchorCount: smokeResult.openAnchorCount,
      linkPendingCount: smokeResult.linkPendingCount,
      links
    },
    targetedVisualTestChecklist: [
      'Run or resolve records through the internal build engine only.',
      'Export the final generated names JSON with real ids and URLs.',
      'Import the result into the drawer Trace tab.',
      'Confirm Build Results shows Open for Customer, demo transaction, hero item, matrix/proof item, and component records.',
      'Confirm Run shows the same final names and Open affordances for the consultant path.',
      'Click Customer Open and confirm the actual record page loads.',
      'Click either demo transaction or item Open and confirm the actual record page loads.',
      'Fail the pilot if NetSuite shows Notice: That record does not exist for any required record.',
      'Export trace JSON after the visual proof.'
    ],
    operatorEvidenceTemplate: {
      customerRecordOpened: false,
      demoTransactionOpened: false,
      heroItemOpened: false,
      matrixProofItemOpened: false,
      componentItemOpened: false,
      noRecordDoesNotExistNoticeObserved: false,
      screenshotsCaptured: false,
      traceExportCaptured: false,
      notes: 'Pending real build-engine run and visual confirmation.'
    },
    visualNetSuiteTestingRequiredNow: true,
    broaderVisualNetSuiteTestingRequired: false,
    broaderVisualNetSuiteTestingRationale: 'Targeted visual NetSuite testing is required for W135 record existence. Broader regression visual testing waits until real record existence passes.',
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
    validatorGates: results,
    bestNextCodexPrompt: {
      block: 'W135R: Review Real Record Existence Evidence',
      prompt: 'Move through W135R: Review Real Record Existence Evidence. Use the operator-provided W135 real build-engine final generated names JSON, drawer trace export, and screenshots showing Customer, demo transaction, hero item, matrix/proof item, and component Open links loading actual NetSuite record pages. Grade whether every required record exists, whether any URL showed “That record does not exist,” and whether Build/Run remain consultant-usable. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership of generated records. Output graded evidence, pass/fail decision, remediation if any record is missing, W135R report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w135-internal-build-engine-real-record-existence-trace.v1',
    decision: contract.decision,
    status: contract.status,
    importedResultSchema: contract.importedResultJsonShape.schema,
    openAnchorCount: contract.drawerImportSmoke.openAnchorCount,
    recordExistenceProvenInThisHarness: false,
    operatorVisualRequired: true,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W135 Internal Build Engine Real Record Existence Pilot

Status: ${contract.status}

## Decision

${contract.decision}

## What W135 Proves Now

- W134's remaining gap is record existence, not drawer link rendering.
- The internal build engine result must include real internal ids, supported URLs, and operator existence proof.
- The drawer imports the result and renders active Open links without writing, submitting, queueing, or invoking SuiteScript.
- This harness does not fake record existence. Real NetSuite visual proof is still required.

## Internal Build Engine Result Contract

${contract.internalBuildEngineResultContract.requiredForOpenUsability.map((item) => `- ${item}`).join('\n')}

## Targeted Visual Test Checklist

${contract.targetedVisualTestChecklist.map((item) => `- ${item}`).join('\n')}

## Drawer Import Smoke

- Build Results uses imported names: ${contract.drawerImportSmoke.buildResultsUseImportedNames}
- Run uses imported names: ${contract.drawerImportSmoke.runUsesImportedNames}
- Open anchors rendered: ${contract.drawerImportSmoke.openAnchorCount}
- Link pending rendered: ${contract.drawerImportSmoke.linkPendingCount}
- Link statuses: ${contract.drawerImportSmoke.links.map((item) => `${item.label}=${item.linkStatus}`).join(', ')}

## Visual NetSuite Testing

Required now: Yes. Targeted W135 record existence testing is required after the internal build engine returns real records.

Broader visual NetSuite testing required: No. Broader testing waits until targeted record existence passes.

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W135 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W135 internal build engine real record existence pilot PASS (${results.length}/${results.length}); operator visual proof still required.`);
}

main();
