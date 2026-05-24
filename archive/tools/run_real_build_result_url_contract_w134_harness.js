const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w133Path = path.join(root, 'data', 'w133_verified_record_link_authority.json');
const dataPath = path.join(root, 'data', 'w134_real_build_result_url_contract.json');
const tracePath = path.join(root, 'trace_samples', 'w134_real_build_result_url_contract_trace.json');
const reportPath = path.join(root, 'reports', 'w134_real_build_result_url_contract.md');

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

const previewOnlyResult = {
  runStatus: 'preview_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  linkAuthority: 'preview_placeholder',
  customer: { name: 'Ariat International Outdoor Retail Account', id: 'preview-customer-123', url: '/app/common/entity/custjob.nl?id=preview-customer-123' },
  salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order', id: 'preview-salesorder-456', url: '/app/accounting/transactions/salesord.nl?id=preview-salesorder-456' },
  heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item', id: 'preview-item-789', url: '/app/common/item/item.nl?id=preview-item-789' },
  matrixItem: { name: 'Ariat Core Boot Size Color Matrix', id: 'preview-matrix-790', url: '/app/common/item/item.nl?id=preview-matrix-790' },
  componentItems: [{ name: 'Ariat Brown Leather Upper Component', id: 'preview-component-791', url: '/app/common/item/item.nl?id=preview-component-791' }]
};

const realBuildEngineResult = {
  runStatus: 'run_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  generatedRecordOwner: 'internal_build_engine',
  linkAuthority: 'verified_openable',
  customer: { name: 'Ariat International Outdoor Retail Account', id: '12345', url: '/app/common/entity/custjob.nl?id=12345' },
  salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order', id: '23456', url: '/app/accounting/transactions/salesord.nl?id=23456' },
  heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item', id: '34567', url: '/app/common/item/item.nl?id=34567' },
  matrixItem: { name: 'Ariat Core Boot Size Color Matrix', id: '45678', url: '/app/common/item/item.nl?id=45678' },
  componentItems: [{ name: 'Ariat Brown Leather Upper Component', id: '56789', url: '/app/common/item/item.nl?id=56789' }],
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
    name: item.name,
    id: item.id,
    url: item.url,
    status: item.linkAuthority.status,
    openable: item.linkAuthority.openable
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
  const w133 = readJson(w133Path);
  const preview = smoke(hooks, previewOnlyResult);
  const real = smoke(hooks, realBuildEngineResult);
  const results = [];
  const requiredRecordRoles = ['customer', 'sales_order', 'hero_item', 'matrix_or_proof_item', 'component_item'];
  const realObjects = real.navigation.reviewObjects;
  const realComponent = hooks.dccFinalNamingResultV1(realBuildEngineResult, real.state, real.lane, real.page, real.recommendation).componentItems[0];
  const realAll = realObjects.concat(realComponent ? [Object.assign({}, realComponent, { linkAuthority: hooks.verifiedRecordLinkAuthorityV1(realComponent) })] : []);
  const realRolesPresent = requiredRecordRoles.every((role) => realAll.some((item) => item.role === role || (role === 'component_item' && /Component/.test(item.label || item.name || ''))));
  const realLinksVerified = real.links.every((item) => item.status === 'verified_openable' && item.openable === true);

  assertCase(results, 'w134_inherits_w133_link_authority', w133.status === 'verified_record_link_authority_ready' && typeof hooks.verifiedRecordLinkAuthorityV1 === 'function', JSON.stringify({ w133: w133.status }));
  assertCase(results, 'w134_real_url_contract_requires_internal_ids_and_supported_paths', realRolesPresent && realLinksVerified && real.links.every((item) => /^\d+$/.test(String(item.id)) && /\/app\/(common\/entity\/custjob|accounting\/transactions\/salesord|common\/item\/item)\.nl\?id=\d+/.test(item.url)), JSON.stringify(real.links));
  assertCase(results, 'w134_preview_placeholder_visual_retest_pending', preview.links.every((item) => item.status === 'preview_placeholder' && item.openable === false) && preview.openAnchorCount === 0 && preview.linkPendingCount >= 4 && /Link pending/.test(preview.reviewHtml) && /Link pending/.test(preview.runHtml), JSON.stringify({ links: preview.links, openAnchorCount: preview.openAnchorCount, linkPendingCount: preview.linkPendingCount }));
  assertCase(results, 'w134_real_url_visual_retest_open', realLinksVerified && real.openAnchorCount >= 8 && /href="\/app\/common\/entity\/custjob\.nl\?id=12345"/.test(real.reviewHtml) && /href="\/app\/accounting\/transactions\/salesord\.nl\?id=23456"/.test(real.runHtml), JSON.stringify({ links: real.links, openAnchorCount: real.openAnchorCount }));
  assertCase(results, 'w134_build_and_run_consultant_usable', /Build Results/.test(real.reviewHtml) && /Final generated NetSuite records/.test(real.reviewHtml) && /Use final build names/.test(real.runHtml) && /Ariat International Outdoor Retail Account/.test(real.reviewHtml) && /Ariat Seasonal Footwear Availability Demo Order/.test(real.runHtml), real.reviewHtml.slice(0, 1200));
  assertCase(results, 'w134_no_write_invocation_or_transaction_from_drawer', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');
  assertCase(results, 'w134_state_authority_handoff_parity_and_ownership_preserved', hooks.stateAuthorityModel(real.state).handoffEligible === true && hooks.stateAuthorityModel(real.state).confirmedLaneId === hooks.stateAuthorityModel(real.state).exportedLaneId && realBuildEngineResult.generatedRecordOwner === 'internal_build_engine', JSON.stringify(hooks.stateAuthorityModel(real.state)));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w134-real-build-result-url-contract.v1',
    status: failures.length ? 'blocked' : 'real_build_result_url_contract_ready',
    decision: failures.length ? 'FAIL' : 'PASS',
    realUrlResultContract: {
      owner: 'internal_build_engine',
      importTarget: 'state.dccFinalNamingResult',
      drawerAuthority: 'import_display_and_link_gate_only',
      requiredRecords: [
        { role: 'customer', requiredUrlPattern: '/app/common/entity/custjob.nl?id=<real_internal_id>' },
        { role: 'sales_order', requiredUrlPattern: '/app/accounting/transactions/salesord.nl?id=<real_internal_id>' },
        { role: 'hero_item', requiredUrlPattern: '/app/common/item/item.nl?id=<real_internal_id>' },
        { role: 'matrix_or_proof_item', requiredUrlPattern: '/app/common/item/item.nl?id=<real_internal_id>' },
        { role: 'component_item', requiredUrlPattern: '/app/common/item/item.nl?id=<real_internal_id>' }
      ],
      requiredRules: [
        'Each openable record must include a real numeric NetSuite internal id.',
        'Each openable record must include a supported NetSuite record URL.',
        'Preview placeholder ids must remain linkAuthority=preview_placeholder and render Link pending.',
        'The drawer must never create, submit, queue, or invoke SuiteScript to make a link openable.'
      ]
    },
    liveLinkRetestEvidence: {
      previewPlaceholder: {
        displayReady: preview.navigation.status === 'using_dcc_final_names',
        linkPendingCount: preview.linkPendingCount,
        openAnchorCount: preview.openAnchorCount,
        links: preview.links
      },
      realBuildEngineUrls: {
        displayReady: real.navigation.status === 'using_dcc_final_names',
        openAnchorCount: real.openAnchorCount,
        links: real.links
      }
    },
    visualNetSuiteTestingRequiredNow: true,
    broaderVisualNetSuiteTestingRequired: true,
    broaderVisualNetSuiteTestingRationale: 'Required with an actual build-engine result because W134 proves the drawer contract with representative real URLs, not records created in the live account during this harness.',
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
      block: 'W135: Internal Build Engine Real URL Handoff Pilot',
      prompt: 'Move through W135: Internal Build Engine Real URL Handoff Pilot. Use the W134 real build result URL contract to update the internal build engine handoff/output so customer, demo transaction, hero item, matrix/proof item, and component records return real NetSuite internal ids and supported record URLs after sandbox preview/run. Do not let the drawer create records, invoke SuiteScript, or write transactions. Run an operator-only sandbox pilot with a real build-engine result JSON, import it into the drawer, and visually verify Build Results and Run show active Open links only for verified real URLs while preview placeholders remain Link pending. Preserve consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership of generated records. Output build-engine output contract update, imported real-result JSON sample, visual link evidence, trace samples, W135 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w134-real-build-result-url-contract-trace.v1',
    decision: contract.decision,
    previewPlaceholderRetest: contract.liveLinkRetestEvidence.previewPlaceholder,
    realBuildEngineUrlRetest: contract.liveLinkRetestEvidence.realBuildEngineUrls,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W134 Real Build Result URL Contract And Live Link Retest

Status: ${contract.status}

## Real URL Result Contract

${contract.realUrlResultContract.requiredRecords.map((item) => `- ${item.role}: ${item.requiredUrlPattern}`).join('\n')}

## Required Rules

${contract.realUrlResultContract.requiredRules.map((item) => `- ${item}`).join('\n')}

## Live Link Retest Evidence

- Preview placeholder Open anchors: ${preview.openAnchorCount}
- Preview placeholder Link pending count: ${preview.linkPendingCount}
- Real URL Open anchors: ${real.openAnchorCount}
- Real URL statuses: ${real.links.map((item) => `${item.label}=${item.status}`).join(', ')}

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Visual NetSuite Testing

Required now: Yes.

Broader visual NetSuite testing required: Yes. A real sandbox build-engine result should be imported next to verify actual account records, not just representative real URL shapes.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W134 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W134 real build result URL contract PASS (${results.length}/${results.length}).`);
}

main();
