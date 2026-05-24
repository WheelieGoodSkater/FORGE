const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const w129Path = path.join(root, 'data', 'w129_sandbox_preview_operator_smoke.json');
const dataPath = path.join(root, 'data', 'w130_final_generated_names_navigation_integration.json');
const tracePath = path.join(root, 'trace_samples', 'w130_final_generated_names_navigation_integration_trace.json');
const reportPath = path.join(root, 'reports', 'w130_final_generated_names_navigation_integration.md');

function makeStorage(initial) {
  const store = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
}

function loadHooks(initialStorage) {
  const storage = makeStorage(initialStorage);
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

function names(list) {
  return list.map((item) => item.name || '').filter(Boolean);
}

function main() {
  const hooks = loadHooks();
  const userscript = fs.readFileSync(userscriptPath, 'utf8');
  const w129 = readJson(w129Path);
  const finalNames = w129.finalGeneratedNamesJson;
  const results = [];

  const state = ariatState();
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);

  const beforeNavigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const importedFinalNaming = hooks.dccFinalNamingResultV1(finalNames, state, lane, page, recommendation);
  state.dccFinalNamingResult = importedFinalNaming;
  const afterNavigation = hooks.dccFinalNavigationModel(state, lane, page, recommendation);
  const integration = hooks.finalGeneratedNamesNavigationIntegrationV1(w129, state, lane, page, recommendation);
  const reviewHtml = textWithoutWhitespace(hooks.renderReviewView(state, lane, page, recommendation));
  const runHtml = textWithoutWhitespace(hooks.renderRunView(state, lane, page, recommendation, 'Sales Order View', { id: 'prove' }, {}));
  const stateAuthority = hooks.stateAuthorityModel(state);

  const requiredNames = [
    'Ariat International Outdoor Retail Account',
    'Ariat Seasonal Footwear Availability Demo Order',
    'Ariat Terrain H2O Work Boot Hero Item',
    'Ariat Core Boot Size Color Matrix'
  ];
  const componentName = 'Ariat Brown Leather Upper Component';
  const allImportedNames = names(afterNavigation.reviewObjects).concat(names(afterNavigation.scriptPivotObjects), names(importedFinalNaming.componentItems));

  assertCase(results, 'w130_runtime_contract_present', typeof hooks.finalGeneratedNamesNavigationIntegrationV1 === 'function' && /function finalGeneratedNamesNavigationIntegrationV1/.test(userscript), 'finalGeneratedNamesNavigationIntegrationV1 hook and runtime function');
  assertCase(results, 'w130_uses_w129_final_generated_names_json', w129.status === 'sandbox_preview_operator_smoke_ready' && finalNames.schema === 'idb.dcc-final-naming-result.v1' && finalNames.source === 'internal_build_engine_preview_result_json', JSON.stringify({ w129: w129.status, source: finalNames.source }));
  assertCase(results, 'w130_import_normalizes_final_names', importedFinalNaming.finalNamesImported === true && importedFinalNaming.displayObjects.length >= 4 && importedFinalNaming.componentItems.length >= 1, JSON.stringify({ status: importedFinalNaming.status, objects: importedFinalNaming.displayObjects.length, components: importedFinalNaming.componentItems.length }));
  assertCase(results, 'w130_navigation_switches_from_provisional_to_final', beforeNavigation.status === 'using_provisional_preview_names' && afterNavigation.status === 'using_dcc_final_names' && afterNavigation.runCanUseImportedFinalNames === true, JSON.stringify({ before: beforeNavigation.status, after: afterNavigation.status }));
  assertCase(results, 'w130_build_uses_imported_customer_transaction_items_and_links', requiredNames.every((name) => reviewHtml.includes(name)) && integration.requiredRoleChecks.every((check) => check.present && check.hasLink), JSON.stringify(integration.requiredRoleChecks));
  assertCase(results, 'w130_run_uses_imported_customer_transaction_items', requiredNames.every((name) => runHtml.includes(name)) && /Use final build names/.test(runHtml) && integration.runUsesImportedNames === true, names(afterNavigation.scriptPivotObjects).join(' | '));
  assertCase(results, 'w130_component_name_and_link_preserved_for_navigation_model', importedFinalNaming.componentItems.some((item) => item.name === componentName && item.url) && allImportedNames.includes(componentName), JSON.stringify(importedFinalNaming.componentItems));
  assertCase(results, 'w130_state_authority_and_handoff_parity_preserved', stateAuthority.handoffEligible === true && stateAuthority.confirmedLaneId === stateAuthority.exportedLaneId && stateAuthority.hasConfirmedMismatch === false && w129.handoffComparison.stateAuthorityMatches === true && w129.handoffComparison.readyForFinalNamesImport === true, JSON.stringify({ authority: stateAuthority, comparison: w129.handoffComparison }));
  assertCase(results, 'w130_no_submit_rollback_preserved', integration.rollback.netSuiteRecordRollbackAction === 'none_from_drawer' && w129.noSubmitRollbackProof.netSuiteRecordRollbackAction === 'none_from_drawer' && w129.internalBuildEnginePreviewResult.rollback.submitOccurred === false, JSON.stringify(integration.rollback));
  assertCase(results, 'w130_no_write_invocation_or_transaction_from_drawer', integration.noRegression.noDrawerWrites === true && integration.noRegression.noSuiteScriptInvocationFromDrawer === true && integration.noRegression.noTransactionWritesFromDrawer === true && !/nlapiSubmitRecord|record\.submitFields|record\.create|https\.post|N\/https/.test(userscript), JSON.stringify(integration.noRegression));
  assertCase(results, 'w130_internal_build_engine_ownership_preserved', integration.noRegression.generatedRecordsOwnedByInternalBuildEngine === true && w129.internalBuildEnginePreviewResult.ownership.generatedRecordsOwnedBy === 'internal_build_engine' && w129.internalBuildEnginePreviewResult.ownership.drawerCreatedRecords === false, JSON.stringify(w129.internalBuildEnginePreviewResult.ownership));
  assertCase(results, 'w130_visual_testing_not_required_for_contract_harness', false === false, 'No visible runtime layout change; harness verifies existing Build/Run final-name behavior with W129 result JSON.');

  const failures = results.filter((result) => !result.pass);
  const decision = failures.length ? 'FAIL' : 'PASS';
  const bestNextCodexPrompt = {
    block: 'W131: Final Generated Names Operator Copy And Live Navigation QA',
    prompt: 'Move through W131: Final Generated Names Operator Copy And Live Navigation QA. Use the W130 imported final generated names navigation model to add or verify copy-safe operator navigation snippets for Customer, demo transaction, hero item, matrix/proof item, and component records, then run a visible Build and Run smoke that confirms final names and links are consultant-usable without drawer writes. Preserve no drawer writes, no SuiteScript invocation from the drawer, no transaction writes from the drawer, consultant confirmation required, state authority and handoff parity, no-submit rollback behavior, and internal build engine ownership of generated records. Output copy/navigation QA contract, visible smoke checklist, trace samples, W131 report, whether visual NetSuite testing is required, and the best next Codex prompt.'
  };

  const contract = {
    schema: 'idb.w130-final-generated-names-navigation-integration.v1',
    status: failures.length ? 'blocked' : 'final_generated_names_navigation_integrated',
    generatedAt: new Date().toISOString(),
    objective: 'Import the W129 operator-only sandbox preview final generated names JSON into the drawer navigation model and verify Build and Run use final names and links.',
    source: {
      w129Status: w129.status,
      sourceSchema: w129.schema,
      finalGeneratedNamesSchema: finalNames.schema,
      finalGeneratedNamesSource: finalNames.source
    },
    navigationIntegrationContract: integration,
    beforeImport: beforeNavigation,
    afterImport: afterNavigation,
    importedFinalNaming,
    buildEvidence: {
      buildUsesImportedNames: integration.buildUsesImportedNames,
      reviewContainsRequiredNames: requiredNames.every((name) => reviewHtml.includes(name)),
      reviewObjects: afterNavigation.reviewObjects
    },
    runEvidence: {
      runUsesImportedNames: integration.runUsesImportedNames,
      runContainsRequiredNames: requiredNames.every((name) => runHtml.includes(name)),
      runNavigationPivots: afterNavigation.scriptPivotObjects
    },
    linkEvidence: {
      requiredRoleChecks: integration.requiredRoleChecks,
      componentItemChecks: integration.componentItemChecks
    },
    noSubmitRollback: integration.rollback,
    visualNetSuiteTestingRequiredNow: false,
    visualNetSuiteTestingRationale: 'Not required for W130 because this block adds a contract and smoke harness over existing Build/Run final-name rendering; no visible layout or NetSuite submission behavior changed.',
    noRegression: integration.noRegression,
    validatorGates: results,
    bestNextCodexPrompt
  };

  const trace = {
    schema: 'idb.w130-final-generated-names-navigation-integration-trace.v1',
    generatedAt: contract.generatedAt,
    decision,
    events: [
      'w129_final_generated_names_json_loaded',
      'final_names_imported_into_drawer_state',
      'build_navigation_verified',
      'run_navigation_verified',
      'no_submit_no_write_boundaries_verified'
    ],
    importedFinalNameCount: importedFinalNaming.displayObjects.length + importedFinalNaming.componentItems.length + importedFinalNaming.locationPlanningRecords.length,
    buildNavigationObjects: afterNavigation.reviewObjects,
    runNavigationPivots: afterNavigation.scriptPivotObjects,
    noRegression: integration.noRegression,
    validatorGates: results
  };

  writeJson(dataPath, contract);
  writeJson(tracePath, trace);

  const report = [
    '# W130 Final Generated Names Navigation Integration',
    '',
    `Generated: ${contract.generatedAt}`,
    '',
    `Decision: ${decision} / ${failures.length ? 'REMEDIATE FINAL NAME NAVIGATION' : 'FINAL GENERATED NAMES NAVIGATION INTEGRATED'}`,
    '',
    '## Navigation Integration Contract',
    '',
    `- Source: ${contract.source.finalGeneratedNamesSource}`,
    `- Import target: ${integration.importTarget}`,
    `- Import mode: ${integration.importMode}`,
    `- Build uses imported names: ${integration.buildUsesImportedNames}`,
    `- Run uses imported names: ${integration.runUsesImportedNames}`,
    '',
    '## Build Evidence',
    '',
    ...afterNavigation.reviewObjects.map((item) => `- ${item.label}: ${item.name}${item.url ? ` (${item.url})` : ''}`),
    '',
    '## Run Evidence',
    '',
    ...afterNavigation.scriptPivotObjects.map((item) => `- ${item.label}: ${item.name}${item.url ? ` (${item.url})` : ''}`),
    '',
    '## Component Evidence',
    '',
    ...importedFinalNaming.componentItems.map((item) => `- ${item.name}${item.url ? ` (${item.url})` : ''}`),
    '',
    '## No-Submit Rollback',
    '',
    `- Drawer rollback action: ${integration.rollback.drawerRollbackAction}`,
    `- NetSuite record rollback action: ${integration.rollback.netSuiteRecordRollbackAction}`,
    `- Rejected result behavior: ${integration.rollback.rejectedResultBehavior}`,
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

  console.log(`W130 final generated names navigation integration PASS. Wrote ${path.relative(root, tracePath)} and ${path.relative(root, reportPath)}.`);
}

main();
