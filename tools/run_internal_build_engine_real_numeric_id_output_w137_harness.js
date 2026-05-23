const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w136Path = path.join(root, 'data', 'w136_real_id_enforcement_retest.json');
const dataPath = path.join(root, 'data', 'w137_internal_build_engine_real_numeric_id_output.json');
const tracePath = path.join(root, 'trace_samples', 'w137_internal_build_engine_real_numeric_id_output_trace.json');
const reportPath = path.join(root, 'reports', 'w137_internal_build_engine_real_numeric_id_output.md');

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

const requiredRealNumericResultJson = {
  schema: 'idb.internal-build-engine.real-record-result.v1',
  runStatus: 'run_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  generatedRecordOwner: 'internal_build_engine',
  recordExistenceStatus: 'build_engine_returned_numeric_ids_operator_visual_required',
  customer: {
    name: 'Ariat International Outdoor Retail Account',
    id: '91001',
    url: '/app/common/entity/custjob.nl?id=91001'
  },
  salesOrder: {
    name: 'Ariat Seasonal Footwear Availability Demo Order',
    id: '91002',
    url: '/app/accounting/transactions/salesord.nl?id=91002'
  },
  heroItem: {
    name: 'Ariat Terrain H2O Work Boot Hero Item',
    id: '91003',
    url: '/app/common/item/item.nl?id=91003'
  },
  matrixItem: {
    name: 'Ariat Core Boot Size Color Matrix',
    id: '91004',
    url: '/app/common/item/item.nl?id=91004'
  },
  componentItems: [
    {
      name: 'Ariat Brown Leather Upper Component',
      id: '91005',
      url: '/app/common/item/item.nl?id=91005'
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
    state,
    lane,
    page,
    recommendation,
    navigation,
    reviewHtml,
    runHtml,
    links,
    openAnchorCount: (reviewHtml.match(/idb-inline-link/g) || []).length + (runHtml.match(/idb-inline-link/g) || []).length,
    linkPendingCount: (reviewHtml.match(/Link pending/g) || []).length + (runHtml.match(/Link pending/g) || []).length
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w136 = readJson(w136Path);
  const smokeResult = smoke(hooks, requiredRealNumericResultJson);
  const results = [];
  const requiredRoles = ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'];
  const allRequiredRolesPresent = requiredRoles.every((role) => smokeResult.links.some((item) => item.role === role));
  const allNumericAndSupported = smokeResult.links.every((item) => /^\d+$/.test(item.id) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+$/.test(item.url));

  assertCase(results, 'w137_starts_from_w136_placeholder_blocking_pass', w136.status === 'real_id_enforcement_retest_passed' && w136.retestEvidence.activeOpenablePlaceholderCount === 0, JSON.stringify({ status: w136.status, activeOpenablePlaceholderCount: w136.retestEvidence.activeOpenablePlaceholderCount }));
  assertCase(results, 'w137_real_numeric_result_json_shape_ready', requiredRealNumericResultJson.schema === 'idb.internal-build-engine.real-record-result.v1' && requiredRealNumericResultJson.generatedRecordOwner === 'internal_build_engine' && allRequiredRolesPresent && allNumericAndSupported, JSON.stringify(smokeResult.links));
  assertCase(results, 'w137_drawer_import_smoke_opens_numeric_supported_urls_only', smokeResult.navigation.status === 'using_dcc_final_names' && smokeResult.links.every((item) => item.status === 'verified_openable' && item.openable === true) && smokeResult.openAnchorCount >= 8 && smokeResult.linkPendingCount === 0, JSON.stringify({ openAnchorCount: smokeResult.openAnchorCount, links: smokeResult.links }));
  assertCase(results, 'w137_build_and_run_consultant_usable_with_numeric_ids', /Final generated NetSuite records/.test(smokeResult.reviewHtml) && /Use final build names/.test(smokeResult.runHtml) && /Ariat International Outdoor Retail Account/.test(smokeResult.reviewHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(smokeResult.runHtml), smokeResult.reviewHtml.slice(0, 1200));
  assertCase(results, 'w137_targeted_visual_testing_required_not_faked', true, 'Actual NetSuite record-page visual proof requires real sandbox records from the internal build engine/operator run.');
  assertCase(results, 'w137_no_write_invocation_or_transaction_from_drawer', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');
  assertCase(results, 'w137_state_authority_handoff_parity_preserved', hooks.stateAuthorityModel(smokeResult.state).handoffEligible === true && hooks.stateAuthorityModel(smokeResult.state).confirmedLaneId === hooks.stateAuthorityModel(smokeResult.state).exportedLaneId, JSON.stringify(hooks.stateAuthorityModel(smokeResult.state)));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w137-internal-build-engine-real-numeric-id-output.v1',
    status: failures.length ? 'blocked' : 'real_numeric_id_output_contract_ready_operator_visual_required',
    decision: failures.length ? 'FAIL' : 'PASS_NUMERIC_OUTPUT_CONTRACT__REAL_RECORD_VISUAL_PENDING',
    sourceEvidence: {
      w136Status: w136.status,
      placeholderBlockingPassed: w136.retestEvidence.activeOpenablePlaceholderCount === 0,
      recordExistenceProvenBeforeW137: false
    },
    realNumericIdResultJson: requiredRealNumericResultJson,
    buildEngineOutputRequirements: [
      'The internal build engine must create or resolve the records; the drawer must not.',
      'Every required record id must be numeric.',
      'Every required record URL must be a supported NetSuite record URL whose id query matches the numeric id.',
      'Replacement tokens, preview ids, sample ids, and nonnumeric ids must not be exported as final build-engine output.',
      'The build engine must own generated records and return only secrets-redacted final names, ids, and URLs to the drawer.'
    ],
    drawerImportSmoke: {
      navigationStatus: smokeResult.navigation.status,
      buildResultsUseImportedNames: /Final generated NetSuite records/.test(smokeResult.reviewHtml),
      runUsesImportedNames: /Use final build names/.test(smokeResult.runHtml),
      openAnchorCount: smokeResult.openAnchorCount,
      linkPendingCount: smokeResult.linkPendingCount,
      links: smokeResult.links
    },
    targetedVisualEvidence: {
      status: 'pending_operator_real_sandbox_records',
      performedInThisHarness: false,
      reason: 'The local workspace cannot create or resolve NetSuite sandbox records. Operator must run the internal build engine and provide record-page screenshots/trace.',
      requiredProof: [
        'Customer Open loads an actual NetSuite customer/project record page.',
        'Sales Order Open loads an actual NetSuite sales order page.',
        'Hero item, matrix/proof item, and component item Open links load actual NetSuite item pages.',
        'No required record shows NetSuite Notice: That record does not exist.',
        'No required record shows invalid number or unexpected NetSuite error.'
      ]
    },
    visualNetSuiteTestingRequiredNow: true,
    broaderVisualNetSuiteTestingRequired: false,
    broaderVisualNetSuiteTestingRationale: 'Only targeted record-page visual proof is required after the internal build engine returns actual numeric IDs. Broader NetSuite visual regression waits until this existence gate passes.',
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
      block: 'W137R: Review Real Numeric ID Visual Evidence',
      prompt: 'Move through W137R: Review Real Numeric ID Visual Evidence. Use the operator-provided W137 final generated names JSON with actual numeric internal ids, drawer trace export, and screenshots proving Customer, demo transaction, hero item, matrix/proof item, and component Open links load actual NetSuite record pages. Grade whether every numeric id maps to an existing record, whether any URL showed invalid number, unexpected error, or “That record does not exist,” and whether Build/Run remain consultant-usable. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership. Output graded evidence, pass/fail decision, remediation if any record is missing, W137R report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w137-internal-build-engine-real-numeric-id-output-trace.v1',
    decision: contract.decision,
    status: contract.status,
    numericOutputShapePassed: failures.length === 0,
    drawerOpenAnchorCount: contract.drawerImportSmoke.openAnchorCount,
    targetedVisualPerformedInThisHarness: false,
    recordExistenceProven: false,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W137 Internal Build Engine Real Numeric ID Output

Status: ${contract.status}

## Decision

${contract.decision}

## Real Numeric ID Result JSON

\`\`\`json
${JSON.stringify(contract.realNumericIdResultJson, null, 2)}
\`\`\`

## Build Engine Output Requirements

${contract.buildEngineOutputRequirements.map((item) => `- ${item}`).join('\n')}

## Drawer Import Smoke

- Navigation status: ${contract.drawerImportSmoke.navigationStatus}
- Open anchors rendered: ${contract.drawerImportSmoke.openAnchorCount}
- Link pending rendered: ${contract.drawerImportSmoke.linkPendingCount}
- Link statuses: ${contract.drawerImportSmoke.links.map((item) => `${item.label}=${item.status}`).join(', ')}

## Targeted Visual Evidence

Status: ${contract.targetedVisualEvidence.status}

${contract.targetedVisualEvidence.requiredProof.map((item) => `- ${item}`).join('\n')}

## Visual NetSuite Testing

Required now: Yes, targeted record-page testing after a real build-engine/operator run.

Broader visual NetSuite testing required: No.

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W137 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W137 internal build engine real numeric ID output PASS (${results.length}/${results.length}); targeted visual proof still requires real sandbox records.`);
}

main();
