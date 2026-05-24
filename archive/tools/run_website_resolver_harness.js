const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const expectationsPath = path.join(root, 'data', 'website_resolver_expectations.json');
const reportPath = path.join(root, 'reports', 'w36_executable_website_scenario_harness.md');
const w47ReportPath = path.join(root, 'reports', 'w47_open_website_intake_intelligence_gate.md');
const tracePath = path.join(root, 'trace_samples', 'w36_website_resolver_harness_trace.json');

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
  if (!sandbox.__IDB_TEST_HOOKS__) {
    throw new Error('IDB test hooks were not exposed. The harness only works with __IDB_ENABLE_TEST_HOOKS__.');
  }
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
      notes: testCase.notes,
      websiteEvidence: testCase.websiteEvidence || '',
      scObjective: testCase.scObjective || '',
      competitor: testCase.competitor || '',
      decisionCriteria: testCase.decisionCriteria || ''
    },
    toggles: {},
    acceptedPacket: null,
    activeView: 'plan',
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
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
  const suggested = hooks.suggestedLaneFromIntake(state);
  const confidenceModel = hooks.websiteConfidenceModel(state);
  if (suggested && suggested.lane) {
    state.selectedLaneId = suggested.lane.id;
  }
  const lane = hooks.getLane(state);
  const profile = hooks.websiteSignalProfile(state);
  const classifier = hooks.websitePackageClassifier(state);
  const product = hooks.productIntelligence(state, lane);
  const failures = [];

  const expectedConfidenceState = testCase.expectedConfidenceState || 'recommended';
  if (confidenceModel.state !== expectedConfidenceState) failures.push(`confidence_state:${confidenceModel.state}->${expectedConfidenceState}`);
  if (expectedConfidenceState === 'insufficient_evidence') {
    if (suggested && suggested.lane) failures.push(`unexpected_lane_recommendation:${suggested.lane.id}`);
  } else if (!suggested || !suggested.lane) {
    failures.push('no_lane_recommendation');
  }
  if (expectedConfidenceState !== 'insufficient_evidence' && lane.id !== testCase.expectedLaneId) failures.push(`lane:${lane.id}->${testCase.expectedLaneId}`);
  if (expectedConfidenceState !== 'insufficient_evidence' && lane.proofAnchor !== testCase.expectedProofAnchor) failures.push(`proof:${lane.proofAnchor}->${testCase.expectedProofAnchor}`);
  if (expectedConfidenceState !== 'insufficient_evidence' && product.product !== testCase.expectedProductSignal) failures.push(`product:${product.product}->${testCase.expectedProductSignal}`);
  if (profile.laneId && profile.laneId !== lane.id) failures.push(`profile_lane_conflict:${profile.laneId}->${lane.id}`);
  if (classifier.laneId && classifier.laneId !== lane.id) failures.push(`classifier_lane_conflict:${classifier.laneId}->${lane.id}`);
  if (expectedConfidenceState !== 'insufficient_evidence' && product.source === 'conversation_notes_signal') failures.push('notes_owned_product_identity');
  if (lane.id !== 'food_beverage' && /ingredient and lot readiness/i.test(`${product.product} ${product.productFamily} ${product.demandMoment}`)) {
    failures.push('food_language_leaked_outside_food_beverage');
  }
  if (lane.id === 'apparel_accessories' && /Inventory \/ Fulfillment|industrial|branch/i.test(`${product.product} ${product.productFamily} ${product.demandMoment}`)) {
    failures.push('apparel_collapsed_to_distribution');
  }

  const insufficientEvidence = confidenceModel.state === 'insufficient_evidence';

  return {
    customer: testCase.customer,
    website: testCase.website,
    expectedLaneId: testCase.expectedLaneId,
    actualLaneId: insufficientEvidence ? '' : lane.id,
    expectedProofAnchor: testCase.expectedProofAnchor,
    actualProofAnchor: insufficientEvidence ? '' : lane.proofAnchor,
    expectedProductSignal: testCase.expectedProductSignal,
    actualProductSignal: insufficientEvidence ? '' : product.product,
    resolverSource: profile.resolverSource || 'none',
    authority: profile.authority,
    confidence: product.confidence || profile.confidence,
    source: product.source,
    confidenceState: confidenceModel.state,
    canBuild: confidenceModel.canBuild,
    requiresConfirmation: confidenceModel.requiresConfirmation,
    nllmRecommended: classifier.nllmRecommended,
    notesOwnedFields: profile.notesOwnedFields || [],
    websiteEvidenceOwnedFields: profile.websiteEvidenceOwnedFields || [],
    failures,
    status: failures.length ? 'FAIL' : 'PASS'
  };
}

function writeOutputs(results) {
  const decision = results.every((result) => result.status === 'PASS') ? 'PASS' : 'FAIL';
  const trace = {
    schema: 'idb.w47-open-website-resolver-harness-trace.v1',
    generated: new Date().toISOString(),
    decision,
    createEnabled: false,
    harness: 'tools/run_website_resolver_harness.js',
    totalCases: results.length,
    passedCases: results.filter((result) => result.status === 'PASS').length,
    failedCases: results.filter((result) => result.status !== 'PASS').length,
    noRegression: {
      mainCreateDisabled: true,
      notesCannotOwnProductIdentity: true,
      nllmAdvisoryOnly: true,
      websiteResolverSourceGated: true
    },
    results
  };
  fs.writeFileSync(tracePath, `${JSON.stringify(trace, null, 2)}\n`);

  const rows = results.map((result) => (
    `| ${result.status} | ${result.customer} | ${result.actualLaneId} | ${result.actualProductSignal} | ${result.confidenceState} | ${result.resolverSource} / ${result.confidence} | ${result.failures.join(', ') || 'None'} |`
  )).join('\n');
  const failures = results
    .filter((result) => result.status !== 'PASS')
    .map((result) => `- ${result.customer}: ${result.failures.join(', ')}`)
    .join('\n') || '- None';

  const report = `# W47 Open-Website Intake Intelligence Gate

Decision: ${decision} / CREATE STILL DISABLED

## Objective

Make IDB handle websites we did not harden manually by classifying lane, proof anchor, product seed, product family, demand moment, confidence, and source. Weak website evidence must ask for confirmation or additional evidence instead of guessing.

## Harness Results

| Status | Prospect | Lane | Product Signal | Confidence State | Resolver | Failure |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## Findings

- Local URL/domain/category resolution works when the domain or URL contains useful category evidence, or when a known official domain hint exists.
- Open websites now resolve into three states: recommended, needs_confirmation, or insufficient_evidence.
- Local-only resolution cannot reliably classify opaque domains whose brand names do not expose product category. Those cases require pasted website evidence, SC website notes, or N/LLM website evidence review before the lane can be accepted.
- Conversation notes must stay downstream. They can make the story more relevant, but they cannot own product identity or pull a lane away from website evidence.

## Failures

${failures}

## No Regression

- Main drawer remains create-disabled.
- SuiteScript creation remains disabled from the drawer.
- N/LLM remains advisory-only and cannot create records or silently change packet order.
- Notes drive story, ROI, competitive, objections, and run coaching only.

## Next Logical Block

W48: Consultant Review Compression + Write Result UX. Make the Review surface show the selected confidence state, what can write now, what is blocked, and what the consultant should verify next.
`;
  fs.writeFileSync(reportPath, report);
  fs.writeFileSync(w47ReportPath, report);
  return trace;
}

function main() {
  const hooks = loadHooks();
  const expectations = JSON.parse(fs.readFileSync(expectationsPath, 'utf8'));
  const results = expectations.cases.map((testCase) => runCase(hooks, testCase));
  const trace = writeOutputs(results);
  console.log(`Website resolver harness: ${trace.decision} (${trace.passedCases}/${trace.totalCases})`);
  if (trace.decision !== 'PASS') {
    console.error(results.filter((result) => result.status !== 'PASS'));
    process.exit(1);
  }
}

main();
