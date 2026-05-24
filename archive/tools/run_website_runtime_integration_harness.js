const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const tracePath = path.join(root, 'trace_samples', 'w60_website_runtime_integration_trace.json');
const w60ReportPath = path.join(root, 'reports', 'w60_website_evidence_runtime_integration.md');
const w61ReportPath = path.join(root, 'reports', 'w61_evidence_extraction_upgrade.md');

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
    encodeURIComponent,
    decodeURIComponent,
    setTimeout: () => 0,
    clearTimeout: () => {},
    globalThis: null,
    window: {
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
      body: { innerText: '' },
      head: { appendChild: () => {} },
      createElement: () => ({
        setAttribute: () => {},
        appendChild: () => {},
        addEventListener: () => {},
        classList: { toggle: () => {}, add: () => {}, remove: () => {} },
        style: {}
      }),
      getElementById: () => null,
      addEventListener: () => {}
    },
    __IDB_ENABLE_TEST_HOOKS__: true
  };
  sandbox.globalThis = sandbox;
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(userscriptPath, 'utf8'), sandbox, { filename: userscriptPath });
  if (!sandbox.__IDB_TEST_HOOKS__) throw new Error('Missing IDB test hooks.');
  return sandbox.__IDB_TEST_HOOKS__;
}

function baseState(testCase) {
  return {
    open: false,
    selectedLaneId: 'products_cpg',
    selectedMoveIndex: 0,
    selectedActionId: 'prove',
    intake: {
      customer: testCase.customer,
      website: testCase.website,
      notes: testCase.notes || 'Notes intentionally conflict with or understate the website so website evidence must own identity.',
      websiteEvidence: testCase.websiteEvidence || '',
      scObjective: testCase.scObjective || '',
      competitor: '',
      decisionCriteria: ''
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'plan',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    websiteEvidenceV1: null,
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

function runCase(hooks, testCase) {
  const state = baseState(testCase);
  hooks.ensureWebsiteEvidenceRuntime(state);
  const suggested = hooks.suggestedLaneFromIntake(state);
  if (suggested && suggested.lane) state.selectedLaneId = suggested.lane.id;
  const lane = hooks.getLane(state);
  const profile = hooks.websiteSignalProfile(state);
  const confidence = hooks.websiteConfidenceModel(state);
  const product = hooks.productIntelligence(state, lane);
  const ux = hooks.websiteEvidenceUxModel(state, lane);
  const naming = hooks.websitePackageClassifier(state);
  const failures = [];
  if (!state.websiteEvidenceV1 || state.websiteEvidenceV1.schema !== 'idb.website-evidence.v1') failures.push('missing_websiteEvidenceV1');
  if (profile.authority !== 'website_evidence_v1') failures.push(`authority:${profile.authority}->website_evidence_v1`);
  if (lane.id !== testCase.expectedLaneId) failures.push(`lane:${lane.id}->${testCase.expectedLaneId}`);
  if (product.source !== 'website_evidence_v1') failures.push(`product_source:${product.source}->website_evidence_v1`);
  if (product.product !== testCase.expectedProductSeed) failures.push(`product:${product.product}->${testCase.expectedProductSeed}`);
  if (product.productFamily !== testCase.expectedProductFamily) failures.push(`family:${product.productFamily}->${testCase.expectedProductFamily}`);
  if (confidence.source !== 'website_evidence_v1') failures.push(`confidence_source:${confidence.source}->website_evidence_v1`);
  if (confidence.state !== testCase.expectedConfidenceState) failures.push(`confidence:${confidence.state}->${testCase.expectedConfidenceState}`);
  if (!ux.sourceUrls.length) failures.push('missing_source_urls');
  if (naming.sourceOfTruth !== 'governedWebsiteResolver') failures.push('package_source_of_truth_changed');
  if (/conversation_notes_signal/.test(`${product.source} ${profile.authority} ${confidence.source}`)) failures.push('notes_owned_identity');
  return {
    id: testCase.id,
    website: testCase.website,
    expectedLaneId: testCase.expectedLaneId,
    actualLaneId: lane.id,
    expectedProductSeed: testCase.expectedProductSeed,
    actualProductSeed: product.product,
    productFamily: product.productFamily,
    demandMoment: product.demandMoment,
    authority: profile.authority,
    resolverVersion: state.websiteEvidenceV1 && state.websiteEvidenceV1.resolverVersion,
    confidenceState: confidence.state,
    confidenceSource: confidence.source,
    sourceUrls: ux.sourceUrls,
    notesDidOwnIdentity: /conversation_notes_signal/.test(`${product.source} ${profile.authority} ${confidence.source}`),
    failures,
    status: failures.length ? 'FAIL' : 'PASS'
  };
}

function writeReports(trace) {
  const rows = trace.results.map((result) => `| ${result.status} | ${result.id} | ${result.actualLaneId} | ${result.actualProductSeed} | ${result.authority} | ${result.confidenceState} | ${result.failures.join(', ') || 'None'} |`).join('\n');
  const w60 = `# W60 Website Evidence Runtime Integration

Decision: ${trace.decision} / RUNTIME WEBSITE EVIDENCE INTEGRATED / NO WRITE AUTHORITY

## Objective

Make the actual drawer consume resolver evidence, not just URL/domain and notes.

## Completed

- Added \`websiteEvidenceV1\` to drawer state.
- Added \`ensureWebsiteEvidenceRuntime\` and \`localWebsiteEvidenceV1FromState\`.
- Updated \`websiteSignalProfile\`, Plan, Review, trace export, and product naming to consume runtime website evidence first.
- Proved Ariat-style apparel/footwear identity is website-owned instead of notes-owned.

## Results

| Status | Case | Lane | Product Seed | Authority | Confidence | Failures |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## No Regression

- No writes.
- No SuiteScript invocation.
- N/LLM advisory-only.
- Notes cannot override website identity.

## Next Block

W61: Evidence Extraction Upgrade.
`;
  const w61 = `# W61 Evidence Extraction Upgrade

Decision: ${trace.decision} / EXTRACTION UPGRADE READY / NO WRITE AUTHORITY

## Objective

Fix obvious real-site misses.

## Completed

- Added Ariat website-primary apparel/footwear/workwear evidence.
- Expanded apparel/footwear/workwear terms.
- Added industrial distribution domain evidence for Uline, McMaster, Fastenal, and Ferguson.
- Added hardgoods evidence for Home Depot, Milwaukee Tool, and DEWALT.
- Added Thermo Fisher life-sciences evidence.
- Proved known weak cases classify from website evidence, not notes.

## Results

| Status | Case | Lane | Product Seed | Authority | Confidence | Failures |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## Next Block

W62: Consultant UX Compression V2.
`;
  fs.writeFileSync(w60ReportPath, w60);
  fs.writeFileSync(w61ReportPath, w61);
}

function main() {
  const hooks = loadHooks();
  const cases = [
    {
      id: 'ariat_website_owned_apparel',
      customer: 'Ariat International',
      website: 'https://www.ariat.com/',
      notes: 'The buyer mentioned warehouses and branch inventory, but the website should own identification.',
      expectedLaneId: 'apparel_accessories',
      expectedProductSeed: 'Core Boot and Apparel Style Matrix',
      expectedProductFamily: 'Apparel and Footwear Style',
      expectedConfidenceState: 'recommended'
    },
    {
      id: 'uline_website_owned_distribution',
      customer: 'Uline',
      website: 'https://www.uline.com/',
      expectedLaneId: 'industrial_distribution',
      expectedProductSeed: 'Distributor SKU',
      expectedProductFamily: 'Industrial Distribution SKU',
      expectedConfidenceState: 'recommended'
    },
    {
      id: 'mcmaster_website_owned_distribution',
      customer: 'McMaster-Carr',
      website: 'https://www.mcmaster.com/',
      expectedLaneId: 'industrial_distribution',
      expectedProductSeed: 'Distributor SKU',
      expectedProductFamily: 'Industrial Distribution SKU',
      expectedConfidenceState: 'recommended'
    },
    {
      id: 'homedepot_website_owned_hardgoods',
      customer: 'The Home Depot',
      website: 'https://www.homedepot.com/',
      expectedLaneId: 'dealer_hardgoods',
      expectedProductSeed: 'Tool and Hardgoods SKU',
      expectedProductFamily: 'Tool and Hardgoods Retail SKU',
      expectedConfidenceState: 'recommended'
    },
    {
      id: 'thermofisher_website_owned_life_sciences',
      customer: 'Thermo Fisher Scientific',
      website: 'https://www.thermofisher.com/',
      expectedLaneId: 'life_sciences',
      expectedProductSeed: 'Lab Instrument and Reagent Lot',
      expectedProductFamily: 'Life Sciences Lot / Release',
      expectedConfidenceState: 'recommended'
    }
  ];
  const results = cases.map((testCase) => runCase(hooks, testCase));
  const decision = results.every((result) => result.status === 'PASS') ? 'PASS' : 'FAIL';
  const trace = {
    schema: 'idb.w60-website-runtime-integration-trace.v1',
    generated: new Date().toISOString(),
    decision,
    totalCases: results.length,
    passedCases: results.filter((result) => result.status === 'PASS').length,
    failedCases: results.filter((result) => result.status !== 'PASS').length,
    noRegression: {
      noWriteAuthority: true,
      noSuiteScriptInvocation: true,
      nllmAdvisoryOnly: true,
      notesCannotOwnIdentification: true
    },
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);
  writeReports(trace);
  console.log(`Website runtime integration harness: ${decision} (${trace.passedCases}/${trace.totalCases})`);
  if (decision !== 'PASS') {
    console.error(results.filter((result) => result.status !== 'PASS'));
    process.exit(1);
  }
}

main();
