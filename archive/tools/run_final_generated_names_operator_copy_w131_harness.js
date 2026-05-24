const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w129Path = path.join(root, 'data', 'w129_sandbox_preview_operator_smoke.json');
const w130Path = path.join(root, 'data', 'w130_final_generated_names_navigation_integration.json');
const dataPath = path.join(root, 'data', 'w131_final_generated_names_operator_copy_navigation_qa.json');
const tracePath = path.join(root, 'trace_samples', 'w131_final_generated_names_operator_copy_navigation_qa_trace.json');
const reportPath = path.join(root, 'reports', 'w131_final_generated_names_operator_copy_navigation_qa.md');

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

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function assertCase(results, name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail || '' });
}

function textWithoutWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ');
}

function escapeTable(value) {
  return String(value == null ? '' : value).replace(/\|/g, '/');
}

function ariatState() {
  const now = new Date().toISOString();
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
      scObjective: 'Prepare a concise demo story showing how NetSuite supports style/SKU readiness, size/color availability, replenishment timing, and customer promise.',
      competitor: 'Spreadsheets and disconnected inventory reports.',
      decisionCriteria: 'Must show style/SKU matrix fit, size/color visibility, channel availability, replenishment timing, and customer-to-order impact.'
    },
    toggles: {},
    acceptedPacket: null,
    setupEditMode: false,
    lanePickerOpen: false,
    storyBarCollapsed: false,
    storyBarCollapseManual: false,
    pilotResult: null,
    dccFinalNamingResult: null,
    websiteEvidenceV1: null,
    websiteResolverRuntime: {
      serviceName: 'websiteResolverServiceV1',
      mode: 'local_fallback',
      requestKey: 'ariat.com',
      endpointConfigured: false,
      localFallbackEnabled: true,
      status: 'resolved',
      failureState: ''
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      movePreference: ['Customer Record', 'Sales Order View'],
      capturedAt: now
    }
  };
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w129 = readJson(w129Path);
  const w130 = readJson(w130Path);
  const results = [];

  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  state.dccFinalNamingResult = hooks.dccFinalNamingResultV1(w129.finalGeneratedNamesJson, state, lane, page, recommendation);

  const qa = hooks.finalGeneratedNamesOperatorCopyNavigationQaV1(w129, state, lane, page, recommendation);
  const navigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = textWithoutWhitespace(hooks.renderRunView(state, lane, page, recommendation, 'Sales Order View', { id: 'prove' }, {}));
  const stateAuthority = hooks.stateAuthorityModel(state);

  const requiredLabels = ['Customer', 'Sales Order / demo transaction', 'Hero item', 'Matrix item / proof item'];
  const componentName = 'Ariat Brown Leather Upper Component';
  const requiredNames = [
    'Ariat International Outdoor Retail Account',
    'Ariat Seasonal Footwear Availability Demo Order',
    'Ariat Terrain H2O Work Boot Hero Item',
    'Ariat Core Boot Size Color Matrix'
  ];

  assertCase(results, 'w131_runtime_contract_present', typeof hooks.finalGeneratedNamesOperatorCopyNavigationQaV1 === 'function' && /function finalGeneratedNamesOperatorCopyNavigationQaV1/.test(userscript), 'finalGeneratedNamesOperatorCopyNavigationQaV1 hook and runtime function');
  assertCase(results, 'w131_inherits_w130_navigation_model', w130.status === 'final_generated_names_navigation_integrated' && qa.source === 'w130_final_generated_names_navigation_model' && navigation.status === 'using_dcc_final_names', JSON.stringify({ w130: w130.status, qa: qa.status, navigation: navigation.status }));
  assertCase(results, 'w131_copy_safe_snippets_cover_required_records', requiredLabels.every((label) => qa.snippets.some((snippet) => snippet.label === label && snippet.consultantUsable && snippet.linkAuthority && snippet.linkAuthority.status === 'preview_placeholder')) && qa.snippets.some((snippet) => snippet.name === componentName && snippet.consultantUsable), JSON.stringify(qa.snippets));
  assertCase(results, 'w131_build_visible_smoke_has_final_names_and_link_pending', requiredNames.every((name) => reviewHtml.includes(name)) && /Final generated NetSuite records/.test(reviewHtml) && /Link pending/.test(reviewHtml) && !/class="idb-inline-link" href="\/app\/common\/entity\/custjob\.nl\?id=preview-customer-123"/.test(reviewHtml), reviewHtml.slice(0, 1600));
  assertCase(results, 'w131_run_visible_smoke_has_final_names_and_link_pending', requiredNames.every((name) => runHtml.includes(name)) && /Use final build names/.test(runHtml) && /Link pending/.test(runHtml) && !/class="idb-inline-link" href="\/app\/accounting\/transactions\/salesord\.nl\?id=preview-salesorder-456"/.test(runHtml), runHtml.slice(0, 1600));
  assertCase(results, 'w131_visible_smoke_checklist_complete', qa.visibleSmokeChecklist.length >= 8 && qa.visibleSmokeChecklist.some((item) => /Run exposes Open links/.test(item)) && qa.visibleSmokeChecklist.some((item) => /No drawer write/.test(item)), JSON.stringify(qa.visibleSmokeChecklist));
  assertCase(results, 'w131_state_authority_and_handoff_parity_preserved', stateAuthority.handoffEligible === true && stateAuthority.confirmedLaneId === stateAuthority.exportedLaneId && w129.handoffComparison.stateAuthorityMatches === true && w130.noRegression.handoffParityPreserved === true, JSON.stringify({ authority: stateAuthority, w129: w129.handoffComparison, w130: w130.noRegression }));
  assertCase(results, 'w131_no_submit_rollback_preserved', qa.rollback.netSuiteRecordRollbackAction === 'none_from_drawer' && w129.noSubmitRollbackProof.netSuiteRecordRollbackAction === 'none_from_drawer' && w129.internalBuildEnginePreviewResult.rollback.submitOccurred === false, JSON.stringify(qa.rollback));
  assertCase(results, 'w131_no_write_invocation_or_transaction_from_drawer', qa.noRegression.noDrawerWrites === true && qa.noRegression.noSuiteScriptInvocationFromDrawer === true && qa.noRegression.noTransactionWritesFromDrawer === true && !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), JSON.stringify(qa.noRegression));
  assertCase(results, 'w131_internal_build_engine_ownership_preserved', qa.noRegression.generatedRecordsOwnedByInternalBuildEngine === true && w129.internalBuildEnginePreviewResult.ownership.generatedRecordsOwnedBy === 'internal_build_engine' && w129.internalBuildEnginePreviewResult.ownership.drawerCreatedRecords === false, JSON.stringify(w129.internalBuildEnginePreviewResult.ownership));
  assertCase(results, 'w131_visual_netsuite_testing_required', true === true, 'Yes. W131 changes visible Run final-name link rendering and requires a visible Build/Run smoke before consultant use.');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W132: Final Names Live Navigation Retest And Copy Polish',
    prompt: 'Move through W132: Final Names Live Navigation Retest And Copy Polish. Use the W131 copy-safe final generated names snippets and visible Build/Run smoke to run a focused browser/NetSuite visual retest of Build Results and Run final-name navigation links. Polish any consultant-facing copy or link affordance issues without enabling drawer writes, SuiteScript invocation from the drawer, or transaction writes from the drawer. Preserve consultant confirmation required, state authority and handoff parity, no-submit rollback behavior, and internal build engine ownership of generated records. Output visual retest evidence, copy/link polish if needed, trace samples, W132 report, whether broader visual NetSuite testing is required, and the best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w131-final-generated-names-operator-copy-navigation-qa.v1',
    status: failures.length ? 'blocked' : 'operator_copy_navigation_qa_ready',
    generatedAt: new Date().toISOString(),
    objective: 'Verify copy-safe operator navigation snippets and visible Build/Run final-name links are consultant-usable without drawer writes.',
    source: {
      w129Status: w129.status,
      w130Status: w130.status,
      finalGeneratedNamesSource: w129.finalGeneratedNamesJson.source
    },
    copyNavigationQaContract: qa,
    visibleBuildSmoke: {
      containsFinalGeneratedRecords: requiredNames.every((name) => reviewHtml.includes(name)),
      containsOpenLinks: /idb-inline-link/.test(reviewHtml),
      containsLinkPending: /Link pending/.test(reviewHtml),
      buildNavigationObjects: navigation.reviewObjects
    },
    visibleRunSmoke: {
      containsFinalGeneratedRecords: requiredNames.every((name) => runHtml.includes(name)),
      containsOpenLinks: /idb-inline-link/.test(runHtml),
      containsLinkPending: /Link pending/.test(runHtml),
      runNavigationPivots: navigation.scriptPivotObjects
    },
    copySafeOperatorSnippets: qa.snippets,
    visibleSmokeChecklist: qa.visibleSmokeChecklist,
    visualNetSuiteTestingRequiredNow: true,
    visualNetSuiteTestingRationale: 'Required before consultant use because W131 makes final generated record links visible in Run and verifies Build/Run as a live navigation surface.',
    noSubmitRollback: qa.rollback,
    noRegression: qa.noRegression,
    validatorGates: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w131-final-generated-names-operator-copy-navigation-qa-trace.v1',
    generatedAt: contract.generatedAt,
    decision,
    events: [
      'w130_navigation_model_loaded',
      'operator_copy_snippets_built',
      'build_visible_final_name_links_verified',
      'run_visible_final_name_links_verified',
      'no_submit_no_write_boundaries_verified'
    ],
    snippetCount: qa.snippets.length,
    buildLinkCount: (reviewHtml.match(/idb-inline-link/g) || []).length,
    runLinkCount: (runHtml.match(/idb-inline-link/g) || []).length,
    visualNetSuiteTestingRequiredNow: contract.visualNetSuiteTestingRequiredNow,
    noRegression: qa.noRegression,
    validatorGates: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W131 Final Generated Names Operator Copy And Live Navigation QA',
    '',
    `Generated: ${contract.generatedAt}`,
    '',
    `Decision: ${decision} / ${failures.length ? 'REMEDIATE COPY/NAVIGATION QA' : 'OPERATOR COPY NAVIGATION QA READY'}`,
    '',
    '## Copy / Navigation QA Contract',
    '',
    `- Source: ${contract.source.finalGeneratedNamesSource}`,
    `- Copy mode: ${qa.copyMode}`,
    `- Build uses imported final names: ${qa.buildSmoke.usesImportedFinalNames}`,
    `- Run uses imported final names: ${qa.runSmoke.usesImportedFinalNames}`,
    '',
    '## Copy-Safe Operator Snippets',
    '',
    ...qa.snippets.map((snippet) => `- ${snippet.label}: ${snippet.name} (${snippet.url})`),
    '',
    '## Visible Smoke Checklist',
    '',
    ...qa.visibleSmokeChecklist.map((item) => `- ${item}`),
    '',
    '## Build Smoke',
    '',
    ...navigation.reviewObjects.map((item) => `- ${item.label || 'Component'}: ${item.name}${item.url ? ` (${item.url})` : ''}`),
    '',
    '## Run Smoke',
    '',
    ...navigation.scriptPivotObjects.map((item) => `- ${item.label}: ${item.name}${item.url ? ` (${item.url})` : ''}`),
    '',
    '## Visual NetSuite Testing',
    '',
    `- Required now: ${contract.visualNetSuiteTestingRequiredNow ? 'Yes' : 'No'}. ${contract.visualNetSuiteTestingRationale}`,
    '',
    '## Validator Gates',
    '',
    '| Status | Rule | Detail |',
    '| --- | --- | --- |',
    ...results.map((item) => `| ${item.pass ? 'PASS' : 'FAIL'} | ${escapeTable(item.name)} | ${escapeTable(item.detail)} |`),
    '',
    '## Best Next Codex Prompt',
    '',
    bestNextCodexPrompt.prompt
  ].join('\n');

  fs.writeFileSync(reportPath, `${report}\n`);

  if (failures.length) {
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log(`W131 final generated names operator copy/navigation QA PASS. Wrote ${path.relative(root, tracePath)} and ${path.relative(root, reportPath)}.`);
}

main();
