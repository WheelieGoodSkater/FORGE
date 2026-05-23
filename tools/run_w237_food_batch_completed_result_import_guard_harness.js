#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const reportPath = path.join(root, 'reports', 'w237_food_batch_completed_result_import_guard.md');
const tracePath = path.join(root, 'trace_samples', 'w237_food_batch_completed_result_import_guard_trace.json');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function assertCase(results, id, pass, evidence) {
  results.push({ id, pass: Boolean(pass), evidence: evidence || '' });
}

function loadHooks() {
  const store = new Map();
  const storage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  };
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
    URLSearchParams,
    Promise,
    Blob: function Blob() {},
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W237 harness')),
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
      setInterval: () => 1,
      clearInterval: () => {},
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

function liquidDeathStateWithConfirmedRequest(toggleOverrides) {
  const toggles = Object.assign({
    createNewHeroItem: true,
    enableManufacturing: true,
    enableWip: false
  }, toggleOverrides || {});
  const confirmedRequest = {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-liquid-death-food-beverage-foodmanufacturing',
    prospect: {
      name: 'Liquid Death',
      website: 'https://liquiddeath.com'
    },
    demoPath: {
      laneId: 'food_beverage',
      laneName: 'Food / Beverage CPG Manufacturing',
      proofAnchor: 'Finished Good',
      familyKey: 'foodManufacturing',
      scenario: 'Promotion-Driven Food Manufacturing',
      confirmed: true
    },
    resolvedOperatingMode: 'food_batch_manufacturing',
    modeConfidence: 'high',
    selectedToggles: toggles,
    requiredRecordRoles: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
    optionalRecordRoles: ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object'],
    invalidRecordRoles: ['apparel_style_matrix_without_apparel_evidence'],
    resultValidationExpectations: {
      manufacturingFalseBlocksManufacturingSemantics: toggles.enableManufacturing !== true,
      wipTrueRequiresWipDetailOrPartialResult: toggles.enableWip === true,
      foodVocabularyRequiresFoodEvidenceAndManufacturing: true,
      openLinksBlockedUntilValidImport: true
    }
  };
  return {
    selectedLaneId: 'food_beverage',
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    briefPrepared: true,
    intake: {
      customer: 'Liquid Death',
      website: 'https://liquiddeath.com',
      notes: 'Buyer needs a food and beverage proof path for canned water, sparkling water, iced tea, finished beverage availability, ingredient/component readiness, and production planning.'
    },
    toggles: {},
    integratedBuildRunnerResult: {
      runnerParams: {
        custscript_v3_runner_create_new_hero: toggles.createNewHeroItem ? 'T' : 'F',
        custscript_v3_runner_enable_mfg: toggles.enableManufacturing ? 'T' : 'F',
        custscript_v3_runner_enable_wip: toggles.enableWip ? 'T' : 'F',
        custscript_v3_runner_idb_request_json: JSON.stringify(confirmedRequest)
      }
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function liquidDeathCompletedResult() {
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    records: {
      customer: {
        type: 'customer',
        name: 'Liquid Death Customer Account',
        internalId: '2123',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/entity/custjob.nl?id=2123'
      },
      demoTransaction: {
        type: 'salesorder',
        name: 'SO2688',
        internalId: '81630',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/accounting/transactions/salesord.nl?id=81630'
      },
      heroItem: {
        type: 'inventoryitem',
        name: 'SCAI - Liquid Death Finished Good',
        internalId: '1865',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=1865'
      },
      matrixProofItem: {
        type: 'inventoryitem',
        name: 'Liquid Death Production Line',
        internalId: '2947',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2947'
      },
      componentItem: {
        type: 'inventoryitem',
        name: 'Liquid Death Ingredient Blend',
        internalId: '2948',
        url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/common/item/item.nl?id=2948'
      }
    }
  };
}

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { state, lane, page, recommendation };
}

function main() {
  const hooks = loadHooks();
  const results = [];
  const payload = liquidDeathCompletedResult();

  const foodContext = contextFor(hooks, liquidDeathStateWithConfirmedRequest());
  const foodGuard = hooks.validateDccFinalNamingImportPayload(
    payload,
    foodContext.state,
    foodContext.lane,
    foodContext.page,
    foodContext.recommendation
  );

  assertCase(
    results,
    'w237_liquid_death_food_batch_completed_result_imports',
    foodGuard.valid === true &&
      foodGuard.status === 'completed_runner_result_accepted' &&
      foodGuard.namingGuard.selectedToggles.enableManufacturing === true &&
      foodGuard.semanticGuard.resolvedOperatingMode === 'food_batch_manufacturing',
    'Liquid Death completed runner result with Finished Good, Production Line, and Ingredient Blend imports when the confirmed request resolved food batch manufacturing with Manufacturing=true.'
  );

  const blockedContext = contextFor(hooks, liquidDeathStateWithConfirmedRequest({ enableManufacturing: false, enableWip: false }));
  const blockedGuard = hooks.validateDccFinalNamingImportPayload(
    payload,
    blockedContext.state,
    blockedContext.lane,
    blockedContext.page,
    blockedContext.recommendation
  );

  assertCase(
    results,
    'w237_food_manufacturing_names_still_block_when_manufacturing_false',
    blockedGuard.valid === false &&
      blockedGuard.status === 'toggle_vocabulary_guardrail_failed' &&
      /Finished Good|Ingredient Blend|Production Line/.test(blockedGuard.message || ''),
    'The same manufacturing vocabulary remains rejected when the confirmed request says Manufacturing=false.'
  );

  const nonFoodState = liquidDeathStateWithConfirmedRequest({ enableManufacturing: false, enableWip: false });
  nonFoodState.selectedLaneId = 'industrial_distribution';
  nonFoodState.intake.website = 'https://www.grainger.com';
  nonFoodState.intake.notes = 'Distribution replenishment only; no manufacturing proof should be accepted.';
  const nonFoodContext = contextFor(hooks, nonFoodState);
  const nonFoodGuard = hooks.validateDccFinalNamingImportPayload(
    payload,
    nonFoodContext.state,
    nonFoodContext.lane,
    nonFoodContext.page,
    nonFoodContext.recommendation
  );

  assertCase(
    results,
    'w237_distribution_fallback_names_remain_rejected',
    nonFoodGuard.valid === false &&
      nonFoodGuard.status === 'toggle_vocabulary_guardrail_failed',
    'Distribution/non-manufacturing paths still reject Finished Good, Production Line, and Ingredient Blend naming.'
  );

  const source = fs.readFileSync(userscriptPath, 'utf8');
  assertCase(
    results,
    'w237_confirmed_request_toggles_feed_w211_guard',
    source.includes('confirmedBuildRequestForNamingGuardW211') &&
      source.includes('custscript_v3_runner_idb_request_json') &&
      source.includes('confirmedToggles.enableManufacturing'),
    'W211 naming guard now reads the saved confirmed build request JSON used to submit the runner.'
  );

  const latestTraceCandidates = [
    path.join(root, 'trace_samples', 'w237_latest_rejected_completed_result_fixture.json'),
    '/path/to/downloads/intelligent-demo-builder-trace-1779288967945.json'
  ];
  const latestTracePath = latestTraceCandidates.find((candidate) => fs.existsSync(candidate));
  let liveTraceRepair = { repaired: false, skipped: true };
  if (latestTracePath) {
    const latestTrace = JSON.parse(fs.readFileSync(latestTracePath, 'utf8'));
    const repairState = latestTrace.state;
    const repairContext = contextFor(hooks, repairState);
    liveTraceRepair = hooks.revalidateCompletedRunnerResultImportFromSavedStateW237(
      repairContext.state,
      repairContext.lane,
      repairContext.page,
      repairContext.recommendation
    );
  }

  assertCase(
    results,
    'w237_saved_rejected_trace_revalidates_and_imports_after_fix',
    liveTraceRepair.repaired === true &&
      liveTraceRepair.status === 'saved_completed_result_import_repaired',
    'The latest exported FORGE state with a stale rejected completed result is repaired into imported final records by the current guard.'
  );

  assertCase(
    results,
    'w237_draw_repair_hook_registered',
    source.includes('revalidateCompletedRunnerResultImportFromSavedStateW237(state, lane, pageContext, recommendation)') &&
      source.includes('w237_saved_completed_result_import_repaired'),
    'Draw/load path revalidates a saved completed result so old rejected UI state can recover after the fixed userscript is installed.'
  );

  const trace = {
    schema: 'idb.w237-food-batch-completed-result-import-guard.trace.v1',
    generatedAt: new Date().toISOString(),
    reviewedTrace: '/path/to/downloads/intelligent-demo-builder-trace-1779288967945.json',
    conclusion: 'The runner completed and returned valid record IDs and URLs; FORGE rejected import because W211 forgot selected toggles when validating the completed result. The guard now reads the saved confirmed build request JSON before applying vocabulary rules and repairs stale rejected completed-result state on load.',
    acceptedStatus: foodGuard.status,
    acceptedMode: foodGuard.semanticGuard && foodGuard.semanticGuard.resolvedOperatingMode,
    acceptedRecordNames: Object.values(payload.records).map((record) => record.name),
    blockedStatus: blockedGuard.status,
    liveTraceRepair,
    passCount: results.filter((item) => item.pass).length,
    resultCount: results.length,
    results,
    visualTestingDecision: 'No broad visual testing. This harness validates the completed result import guard and record-link acceptance path only.'
  };

  const report = [
    '# W237 Food Batch Completed Result Import Guard',
    '',
    '## Diagnosis',
    '',
    'The supplied FORGE trace contains a completed runner result with numeric NetSuite internal IDs and supported URLs. The drawer rejected it with `toggle_vocabulary_guardrail_failed` because W211 validated the returned names without reading the confirmed build request toggles that were sent to the runner.',
    '',
    '## Fix',
    '',
    '- Read `custscript_v3_runner_idb_request_json` from the saved runner params during W211 import validation.',
    '- Preserve Manufacturing=true for the completed food batch result import guard.',
    '- Accept Liquid Death food batch records with Finished Good, Production Line, and Ingredient Blend names when the resolved mode is `food_batch_manufacturing`.',
    '- Revalidate saved completed-result state on drawer load so an already-returned runner result can recover after the fixed userscript is installed.',
    '- Keep the same vocabulary rejected when Manufacturing=false or the path is non-manufacturing.',
    '- Preserve no drawer-created records, no drawer transaction writes, and no direct SuiteScript outside W144.',
    '',
    '## Harness Results',
    '',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    `Result: ${trace.passCount}/${trace.resultCount}`,
    ''
  ].join('\n');

  writeJson(tracePath, trace);
  writeText(reportPath, report);

  if (trace.passCount !== trace.resultCount) {
    console.error(report);
    process.exit(1);
  }
  console.log(report);
}

main();
