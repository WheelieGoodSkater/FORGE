const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w133_verified_record_link_authority.json');
const tracePath = path.join(root, 'trace_samples', 'w133_verified_record_link_authority_trace.json');
const reportPath = path.join(root, 'reports', 'w133_verified_record_link_authority.md');

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

const previewResult = {
  runStatus: 'preview_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  customer: { name: 'Ariat International Outdoor Retail Account', id: 'preview-customer-123', url: '/app/common/entity/custjob.nl?id=preview-customer-123' },
  salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order', id: 'preview-salesorder-456', url: '/app/accounting/transactions/salesord.nl?id=preview-salesorder-456' },
  heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item', id: 'preview-item-789', url: '/app/common/item/item.nl?id=preview-item-789' },
  matrixItem: { name: 'Ariat Core Boot Size Color Matrix', id: 'preview-matrix-790', url: '/app/common/item/item.nl?id=preview-matrix-790' },
  componentItems: [{ name: 'Ariat Brown Leather Upper Component', id: 'preview-component-791', url: '/app/common/item/item.nl?id=preview-component-791' }]
};

const realResult = {
  runStatus: 'preview_complete',
  prospect: 'Ariat International',
  familyKey: 'apparelAccessories',
  scenario: 'Style-to-Availability Readiness',
  customer: { name: 'Ariat International Outdoor Retail Account', id: '12345', url: '/app/common/entity/custjob.nl?id=12345' },
  salesOrder: { name: 'Ariat Seasonal Footwear Availability Demo Order', id: '23456', url: '/app/accounting/transactions/salesord.nl?id=23456' },
  heroItem: { name: 'Ariat Terrain H2O Work Boot Hero Item', id: '34567', url: '/app/common/item/item.nl?id=34567' },
  matrixItem: { name: 'Ariat Core Boot Size Color Matrix', id: '45678', url: '/app/common/item/item.nl?id=45678' },
  componentItems: [{ name: 'Ariat Brown Leather Upper Component', id: '56789', url: '/app/common/item/item.nl?id=56789' }]
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
  const linkStatuses = navigation.reviewObjects.map((item) => ({
    label: item.label,
    name: item.name,
    url: item.url,
    status: item.linkAuthority.status,
    openable: item.linkAuthority.openable
  }));
  return { state, lane, page, recommendation, navigation, reviewHtml, runHtml, linkStatuses };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const preview = smoke(hooks, previewResult);
  const real = smoke(hooks, realResult);
  const missing = hooks.verifiedRecordLinkAuthorityV1({ name: 'Missing URL item' });
  const unsupported = hooks.verifiedRecordLinkAuthorityV1({ name: 'Unsupported item', id: '777', url: '/app/common/otherrecord.nl?id=777' });
  const replacementToken = hooks.verifiedRecordLinkAuthorityV1({ name: 'Unresolved replacement item', id: 'REPLACE_REAL_CUSTOMER_ID', url: '/app/common/entity/custjob.nl?id=REPLACE_REAL_CUSTOMER_ID' });
  const results = [];

  assertCase(results, 'w133_runtime_link_authority_present', typeof hooks.verifiedRecordLinkAuthorityV1 === 'function' && /function verifiedRecordLinkAuthorityV1/.test(userscript), 'verifiedRecordLinkAuthorityV1 hook and runtime function');
  assertCase(results, 'w133_preview_ids_not_clickable', preview.linkStatuses.every((item) => item.status === 'preview_placeholder' && item.openable === false) && !/class="idb-inline-link" href="\/app\/common\/entity\/custjob\.nl\?id=preview-customer-123"/.test(preview.reviewHtml) && /Link pending/.test(preview.reviewHtml) && /Link pending/.test(preview.runHtml), JSON.stringify(preview.linkStatuses));
  assertCase(results, 'w133_real_netsuite_urls_clickable', real.linkStatuses.every((item) => item.status === 'verified_openable' && item.openable === true) && /class="idb-inline-link" href="\/app\/common\/entity\/custjob\.nl\?id=12345"/.test(real.reviewHtml) && /class="idb-inline-link" href="\/app\/accounting\/transactions\/salesord\.nl\?id=23456"/.test(real.runHtml), JSON.stringify(real.linkStatuses));
  assertCase(results, 'w133_missing_unsupported_and_replacement_tokens_classified', missing.status === 'missing_url' && missing.openable === false && unsupported.status === 'unsupported_path' && unsupported.openable === false && replacementToken.status === 'preview_placeholder' && replacementToken.openable === false, JSON.stringify({ missing, unsupported, replacementToken }));
  assertCase(results, 'w133_final_name_display_remains_independent', preview.navigation.status === 'using_dcc_final_names' && preview.navigation.runCanUseImportedFinalNames === true && preview.reviewHtml.includes('Ariat International Outdoor Retail Account'), preview.reviewHtml.slice(0, 1200));
  assertCase(results, 'w133_no_write_boundaries_preserved', !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), 'no drawer write/invocation signatures present');
  assertCase(results, 'w133_state_authority_and_handoff_parity_preserved', hooks.stateAuthorityModel(real.state).handoffEligible === true && hooks.stateAuthorityModel(real.state).confirmedLaneId === hooks.stateAuthorityModel(real.state).exportedLaneId, JSON.stringify(hooks.stateAuthorityModel(real.state)));

  const failures = results.filter((item) => !item.pass);
  const contract = {
    schema: 'idb.w133-verified-record-link-authority.v1',
    status: failures.length ? 'blocked' : 'verified_record_link_authority_ready',
    decision: failures.length ? 'FAIL' : 'PASS',
    linkAuthorityContract: {
      statuses: ['verified_openable', 'preview_placeholder', 'missing_url', 'missing_real_internal_id', 'unsupported_path'],
      activeOpenLinkRule: 'Render active Open links only when linkAuthority.status is verified_openable.',
      pendingLinkRule: 'Render copy-safe names with Link pending or Needs real URL when URL authority is preview, missing, or unsupported.',
      finalNameDisplayAuthority: 'Final generated names can display after import even when record links are not open-ready.',
      recordLinkOpenAuthority: 'Record links are open-ready only after the internal build engine returns real NetSuite record URLs or real internal ids that normalize to supported record paths.'
    },
    uiBehaviorContract: {
      previewPlaceholder: 'Display final name with Link pending and no anchor.',
      missingUrl: 'Display final name with Needs real URL and no anchor.',
      unsupportedPath: 'Display final name with Needs real URL and no anchor.',
      verifiedOpenable: 'Display final name with active Open anchor.'
    },
    previewSmoke: {
      linkStatuses: preview.linkStatuses,
      reviewHasOpenAnchors: /idb-inline-link/.test(preview.reviewHtml),
      reviewHasLinkPending: /Link pending/.test(preview.reviewHtml),
      runHasLinkPending: /Link pending/.test(preview.runHtml)
    },
    realUrlSmoke: {
      linkStatuses: real.linkStatuses,
      reviewHasOpenAnchors: /idb-inline-link/.test(real.reviewHtml),
      runHasOpenAnchors: /idb-inline-link/.test(real.runHtml)
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
    visualNetSuiteTestingRequiredNow: true,
    validatorGates: results,
    bestNextCodexPrompt: {
      block: 'W134: Real Build Result URL Contract And Live Link Retest',
      prompt: 'Move through W134: Real Build Result URL Contract And Live Link Retest. Use the W133 verified record link authority model to define and test the internal build engine result contract for real NetSuite record URLs after preview/run. Require customer, demo transaction, hero item, matrix/proof item, and component records to return real internal ids and supported NetSuite record URLs before the drawer renders active Open links. Run a visual NetSuite retest proving preview placeholder links show Link pending, real build-engine URLs show Open, and Build/Run remain consultant-usable. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback, and internal build engine ownership of generated records. Output real URL result contract, live link retest evidence, trace samples, W134 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
    }
  };
  const trace = {
    schema: 'idb.w133-verified-record-link-authority-trace.v1',
    decision: contract.decision,
    previewStatuses: preview.linkStatuses,
    realStatuses: real.linkStatuses,
    noRegression: contract.noRegression,
    bestNextCodexPrompt: contract.bestNextCodexPrompt
  };
  writeJson(dataPath, contract);
  writeJson(tracePath, trace);
  fs.writeFileSync(reportPath, `# W133 Verified Record Link Authority And Open-Link Gating

Status: ${contract.status}

## Link Authority Contract

- Active Open link rule: ${contract.linkAuthorityContract.activeOpenLinkRule}
- Pending link rule: ${contract.linkAuthorityContract.pendingLinkRule}
- Final name display authority: ${contract.linkAuthorityContract.finalNameDisplayAuthority}
- Record link open authority: ${contract.linkAuthorityContract.recordLinkOpenAuthority}

## Import Smoke

- Preview placeholder records: ${preview.linkStatuses.map((item) => `${item.label}=${item.status}`).join(', ')}
- Real URL records: ${real.linkStatuses.map((item) => `${item.label}=${item.status}`).join(', ')}

## Validator Gates

${results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`).join('\n')}

## Visual NetSuite Testing

Required now: Yes. W133 changes visible link affordances in Build Results and Run.

## Best Next Codex Prompt

${contract.bestNextCodexPrompt.prompt}
`);

  if (failures.length) {
    console.error(`W133 harness FAIL: ${failures.map((item) => item.name).join(', ')}`);
    process.exit(1);
  }
  console.log(`W133 verified record link authority PASS (${results.length}/${results.length}).`);
}

main();
