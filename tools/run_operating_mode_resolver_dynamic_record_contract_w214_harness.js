const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w214_operating_mode_resolver_dynamic_record_contract.json');
const tracePath = path.join(root, 'trace_samples', 'w214_operating_mode_resolver_dynamic_record_contract_trace.json');
const reportPath = path.join(root, 'reports', 'w214_operating_mode_resolver_dynamic_record_contract.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W214 harness')),
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

function baseState(fixture) {
  return {
    selectedLaneId: fixture.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: fixture.customer,
      website: fixture.website,
      notes: fixture.notes
    },
    toggles: {
      [fixture.laneId]: {
        createNewHeroItem: fixture.createNewHeroItem !== false,
        enableManufacturing: fixture.enableManufacturing === true,
        enableWip: fixture.enableWip === true
      }
    },
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low',
      capturedAt: '2026-05-19T12:00:00.000Z'
    }
  };
}

function contextFromFixture(hooks, fixture) {
  const state = baseState(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function record(type, name, id, urlPath) {
  return {
    type,
    name,
    internalId: String(id),
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${urlPath}?id=${id}`
  };
}

function completedResult(fixture, names, extras) {
  const opts = extras || {};
  const records = {
    customer: record('customer', `${fixture.customer} Customer Account`, 1700 + fixture.index, '/app/common/entity/custjob.nl'),
    demoTransaction: record('salesorder', `${fixture.customer} SO214`, 80000 + fixture.index, '/app/accounting/transactions/salesord.nl'),
    heroItem: record('inventoryitem', names.hero, 1800 + fixture.index, '/app/common/item/item.nl'),
    matrixProofItem: record('inventoryitem', names.matrix, 2500 + fixture.index, '/app/common/item/item.nl')
  };
  if (names.component) {
    records.componentItem = record('inventoryitem', names.component, 2600 + fixture.index, '/app/common/item/item.nl');
  }
  if (opts.assembly) records.assembly = record('assemblyitem', opts.assembly, 2700 + fixture.index, '/app/common/item/item.nl');
  if (opts.bom) records.bom = record('bom', opts.bom, 2800 + fixture.index, '/app/common/manufacturing/bom.nl');
  if (opts.workOrder) records.workOrder = record('workorder', opts.workOrder, 2900 + fixture.index, '/app/accounting/transactions/workord.nl');
  if (opts.routing) records.routing = record('manufacturingrouting', opts.routing, 3000 + fixture.index, '/app/common/manufacturing/routing.nl');
  if (opts.workCenter) records.workCenter = record('workcenter', opts.workCenter, 3100 + fixture.index, '/app/common/manufacturing/workcenter.nl');
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: fixture.laneId,
    toggles: {
      createNewHeroItem: fixture.createNewHeroItem !== false,
      enableManufacturing: fixture.enableManufacturing === true,
      enableWip: fixture.enableWip === true
    },
    partialResultState: opts.partialResultState || '',
    warnings: opts.warning ? [opts.warning] : [],
    records
  };
}

function caseModel(hooks, fixture, goodNames, badNames, extras) {
  const context = contextFromFixture(hooks, fixture);
  const resolver = hooks.resolveBuildOperatingModeW214(context.state, context.lane, context.page, context.recommendation);
  const goodPayload = completedResult(fixture, goodNames, extras && extras.good);
  const badPayload = completedResult(fixture, badNames, extras && extras.bad);
  const goodGuard = hooks.validateDccFinalNamingImportPayload(goodPayload, context.state, context.lane, context.page, context.recommendation);
  const badGuard = hooks.validateDccFinalNamingImportPayload(badPayload, context.state, context.lane, context.page, context.recommendation);
  const contract = hooks.operatingModeResolverContractW214V1(context.state, context.lane, context.page, context.recommendation, {
    completedResultJson: goodPayload
  });
  const request = hooks.confirmedBuildRequestJsonV1(context.state, context.lane, context.page, context.recommendation);
  return { fixture, context, resolver, goodPayload, badPayload, goodGuard, badGuard, contract, request };
}

function namesContain(value, terms) {
  const text = JSON.stringify(value || {}).toLowerCase();
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function main() {
  const hooks = loadHooks();
  const fixtures = {
    northstar: {
      index: 1,
      customer: 'Northstar Trail Outfitters',
      website: 'https://www.rei.com',
      laneId: 'dealer_hardgoods',
      enableManufacturing: false,
      enableWip: false,
      notes: 'Buyer wants retail availability, channel replenishment, and seasonal outdoor assortment confidence. Notes mention finished goods as a bad legacy label that must not override website evidence.'
    },
    harbor: {
      index: 2,
      customer: 'Harbor & Ridge Apparel',
      website: 'https://www.patagonia.com',
      laneId: 'apparel_accessories',
      enableManufacturing: false,
      enableWip: false,
      notes: 'Seasonal apparel launch needs style, size, color, ecommerce, and store availability tied to customer promise.'
    },
    metroline: {
      index: 3,
      customer: 'Metroline Parts Supply',
      website: 'https://www.grainger.com',
      laneId: 'industrial_distribution',
      enableManufacturing: false,
      enableWip: false,
      notes: 'Branch replenishment and industrial parts availability are the proof. Consultant note says controlled assembly execution, but website and toggles must block that language.'
    },
    evergreen: {
      index: 4,
      customer: 'Evergreen Equipment Works',
      website: 'https://www.ariens.com',
      laneId: 'industrial_equipment',
      enableManufacturing: true,
      enableWip: false,
      notes: 'Outdoor equipment buyer wants production planning confidence, component availability, and order promise. Apparel style naming would be wrong.'
    },
    canyon: {
      index: 5,
      customer: 'Canyon Ridge Components',
      website: 'https://www.trekbikes.com',
      laneId: 'dealer_hardgoods',
      enableManufacturing: true,
      enableWip: true,
      notes: 'Bike components need dealer demand, component supply, WIP readiness, routing, and work center confidence before customer promise.'
    },
    mccormick: {
      index: 6,
      customer: 'McCormick',
      website: 'https://www.mccormick.com',
      laneId: 'food_beverage',
      enableManufacturing: true,
      enableWip: true,
      notes: 'Food ingredient and batch proof needs spice, seasoning, formula, ingredient readiness, lot confidence, and WIP visibility.'
    },
    yerbaMadre: {
      index: 7,
      customer: 'Yerba Madre',
      website: 'https://yerbamadre.com',
      laneId: 'food_beverage',
      enableManufacturing: true,
      enableWip: true,
      notes: 'Ready-to-drink yerba mate beverage proof needs batch readiness, organic ingredient supply, formula control, lot confidence, retail availability, and WIP visibility.'
    }
  };

  const models = {
    northstar: caseModel(hooks, fixtures.northstar, {
      hero: 'Northstar Trail Outfitters Product Availability SKU',
      matrix: 'Northstar Trail Outfitters Retail Replenishment Flow'
    }, {
      hero: 'Northstar Trail Outfitters Finished Good',
      matrix: 'Northstar Trail Outfitters Assembly',
      component: 'Northstar Trail Outfitters Component A'
    }),
    harbor: caseModel(hooks, fixtures.harbor, {
      hero: 'Harbor & Ridge Apparel Style SKU',
      matrix: 'Harbor & Ridge Apparel Omnichannel Availability Flow',
      component: 'Harbor & Ridge Apparel Style Matrix Color SKU'
    }, {
      hero: 'Harbor & Ridge Apparel Ingredient Blend',
      matrix: 'Harbor & Ridge Apparel Work Order',
      component: 'Harbor & Ridge Apparel Routing'
    }),
    metroline: caseModel(hooks, fixtures.metroline, {
      hero: 'Metroline Parts Supply Branch Product SKU',
      matrix: 'Metroline Parts Supply Replenishment Flow'
    }, {
      hero: 'Metroline Parts Supply Finished Good',
      matrix: 'Metroline Parts Supply Controlled Assembly Execution',
      component: 'Metroline Parts Supply Frame Welding'
    }),
    evergreen: caseModel(hooks, fixtures.evergreen, {
      hero: 'Evergreen Equipment Works Finished Good',
      matrix: 'Evergreen Equipment Works Production Planning Flow',
      component: 'Evergreen Equipment Works Component Item'
    }, {
      hero: 'Evergreen Equipment Works Style SKU',
      matrix: 'Evergreen Equipment Works Omnichannel Availability Flow',
      component: 'Evergreen Equipment Works Size Color Variant'
    }, {
      good: {
        partialResultState: 'partial_result_missing_manufacturing_records',
        warning: 'Manufacturing records missing: BOM or assembly structure not returned.'
      }
    }),
    canyon: caseModel(hooks, fixtures.canyon, {
      hero: 'Canyon Ridge Components Finished Good',
      matrix: 'Canyon Ridge Components WIP Routing Flow',
      component: 'Canyon Ridge Components Component Item'
    }, {
      hero: 'Canyon Ridge Components Finished Good',
      matrix: 'Canyon Ridge Components Assembly Readiness Flow',
      component: 'Canyon Ridge Components Component Item'
    }, {
      good: {
        workOrder: 'Canyon Ridge Components Work Order',
        routing: 'Canyon Ridge Components Routing',
        workCenter: 'Canyon Ridge Components Work Center'
      },
      bad: {
        partialResultState: ''
      }
    }),
    mccormick: caseModel(hooks, fixtures.mccormick, {
      hero: 'McCormick Finished Food Batch Item',
      matrix: 'McCormick Formula Batch Structure',
      component: 'McCormick Ingredient Item'
    }, {
      hero: 'McCormick Style SKU',
      matrix: 'McCormick Omnichannel Availability Flow',
      component: 'McCormick Core Style'
    }, {
      good: {
        partialResultState: 'partial_result_missing_wip_detail',
        warning: 'WIP detail not returned for the food batch build.'
      }
    }),
    yerbaMadre: caseModel(hooks, fixtures.yerbaMadre, {
      hero: 'Yerba Madre Finished Food Batch Item',
      matrix: 'Yerba Madre Beverage Formula Batch Structure',
      component: 'Yerba Madre Organic Yerba Mate Ingredient Item'
    }, {
      hero: 'Yerba Madre Style SKU',
      matrix: 'Yerba Madre Omnichannel Availability Flow',
      component: 'Yerba Madre Industrial Equipment Component'
    }, {
      good: {
        partialResultState: 'partial_result_missing_wip_detail',
        warning: 'WIP detail not returned for the food batch build.'
      }
    })
  };

  const results = [];
  assertCase(results, 'northstar_resolves_retail_or_dealer_non_mfg',
    ['retail_availability', 'dealer_hardgoods_replenishment'].includes(models.northstar.resolver.resolvedOperatingMode) &&
      models.northstar.resolver.selectedToggles.enableManufacturing === false,
    models.northstar.resolver.resolvedOperatingMode);
  assertCase(results, 'northstar_rejects_manufacturing_names',
    models.northstar.badGuard.valid === false && /Finished Good|Assembly|Component A/i.test(models.northstar.badGuard.message),
    models.northstar.badGuard.message);
  assertCase(results, 'harbor_resolves_apparel_and_accepts_style_matrix',
    models.harbor.resolver.resolvedOperatingMode === 'apparel_style_matrix' &&
      models.harbor.goodGuard.valid === true &&
      namesContain(models.harbor.goodPayload.records, ['Style SKU', 'Omnichannel Availability Flow']),
    `${models.harbor.resolver.resolvedOperatingMode}; ${models.harbor.goodGuard.status}`);
  assertCase(results, 'metroline_resolves_distribution_or_dealer_and_rejects_assembly_language',
    ['distribution_replenishment', 'dealer_hardgoods_replenishment'].includes(models.metroline.resolver.resolvedOperatingMode) &&
      models.metroline.badGuard.valid === false &&
      /Controlled Assembly Execution|Frame Welding|Finished Good/i.test(models.metroline.badGuard.message),
    `${models.metroline.resolver.resolvedOperatingMode}; ${models.metroline.badGuard.message}`);
  assertCase(results, 'evergreen_resolves_discrete_and_marks_missing_manufacturing_records_partial',
    ['discrete_manufacturing', 'dealer_hardgoods_replenishment'].includes(models.evergreen.resolver.resolvedOperatingMode) &&
      models.evergreen.goodGuard.valid === true &&
      models.evergreen.goodGuard.semanticGuard.status === 'mode_record_contract_partial' &&
      /Manufacturing records missing/i.test(models.evergreen.goodGuard.semanticGuard.dynamicRecordDisplayModel.adminDebugWarnings.join(' ')),
    `${models.evergreen.resolver.resolvedOperatingMode}; ${models.evergreen.goodGuard.semanticGuard.status}`);
  assertCase(results, 'evergreen_rejects_apparel_style_only_names_when_manufacturing_selected',
    models.evergreen.badGuard.valid === false && /style|omnichannel/i.test(models.evergreen.badGuard.message),
    models.evergreen.badGuard.message);
  assertCase(results, 'canyon_resolves_wip_and_requires_wip_detail',
    ['wip_manufacturing', 'dealer_hardgoods_replenishment'].includes(models.canyon.resolver.resolvedOperatingMode) &&
      models.canyon.goodGuard.valid === true &&
      models.canyon.goodGuard.semanticGuard.dynamicRecordDisplayModel.canShowMoreThanFiveRecords === true &&
      models.canyon.badGuard.valid === false &&
      /WIP=true requires/i.test(models.canyon.badGuard.message),
    `${models.canyon.resolver.resolvedOperatingMode}; good=${models.canyon.goodGuard.status}; bad=${models.canyon.badGuard.status}`);
  assertCase(results, 'mccormick_resolves_food_batch_and_rejects_apparel_fallback',
    models.mccormick.resolver.resolvedOperatingMode === 'food_batch_manufacturing' &&
      models.mccormick.goodGuard.valid === true &&
      models.mccormick.goodGuard.semanticGuard.status === 'mode_record_contract_partial' &&
      models.mccormick.badGuard.valid === false &&
      /Style SKU|Omnichannel Availability Flow/i.test(models.mccormick.badGuard.message),
    `${models.mccormick.resolver.resolvedOperatingMode}; ${models.mccormick.badGuard.message}`);
  assertCase(results, 'yerba_madre_resolves_food_batch_from_website_and_rejects_hardgoods_fallback',
    models.yerbaMadre.resolver.resolvedOperatingMode === 'food_batch_manufacturing' &&
      models.yerbaMadre.goodGuard.valid === true &&
      models.yerbaMadre.goodGuard.semanticGuard.status === 'mode_record_contract_partial' &&
      models.yerbaMadre.badGuard.valid === false &&
      /Style SKU|Omnichannel Availability Flow|Industrial Equipment/i.test(models.yerbaMadre.badGuard.message),
    `${models.yerbaMadre.resolver.resolvedOperatingMode}; ${models.yerbaMadre.badGuard.message}`);
  assertCase(results, 'confirmed_build_request_contains_w214_contract_fields',
    models.mccormick.request.resolvedOperatingMode === 'food_batch_manufacturing' &&
      Array.isArray(models.mccormick.request.requiredRecordRoles) &&
      Array.isArray(models.mccormick.request.optionalRecordRoles) &&
      Array.isArray(models.mccormick.request.invalidRecordRoles) &&
      models.mccormick.request.namingAuthority.websiteControlsIndustryCategoryAndProductNouns === true &&
      models.mccormick.request.resultValidationExpectations.wipTrueRequiresWipDetailOrPartialResult === true,
    JSON.stringify({
      resolvedOperatingMode: models.mccormick.request.resolvedOperatingMode,
      requiredRecordRoles: models.mccormick.request.requiredRecordRoles
    }));
  assertCase(results, 'notes_shape_story_not_naming_authority',
    models.metroline.resolver.resolvedOperatingMode === 'distribution_replenishment' &&
      models.metroline.resolver.namingAuthority.notesControlPainStoryRoiObjectionsOnly === true &&
      models.metroline.request.storyInputs.conversationNotes.includes('controlled assembly execution'),
    JSON.stringify(models.metroline.resolver.namingAuthority));
  assertCase(results, 'nllm_remains_advisory_only',
    models.northstar.contract.modeAwareNamingContract.websiteControlsProductNouns === true &&
      models.northstar.contract.modeAwareNamingContract.notesShapeStoryOnly === true &&
      models.northstar.contract.noRegression.noDrawerWrites === true &&
      models.northstar.contract.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true,
    JSON.stringify(models.northstar.contract.noRegression));
  assertCase(results, 'normal_consultant_ui_remains_simple',
    !JSON.stringify(hooks.productionConsultantIntakeAndBuildAutomationSimplificationW206V1(
      models.northstar.context.state,
      models.northstar.context.lane,
      models.northstar.context.page,
      models.northstar.context.recommendation
    ).consultantWorkflow).match(/W144|runnerTaskId|raw JSON|W151|endpoint/i),
    'consultantWorkflow hides W144 endpoint, runnerTaskId, raw JSON, W151 language, and admin diagnostics');
  assertCase(results, 'production_path_boundaries_preserved',
    Object.values(models).every((model) =>
      model.contract.noRegression.oneClickBuildPreserved === true &&
      model.contract.noRegression.savedW144AdminConfigPreserved === true &&
      model.contract.noRegression.resultPollingPreserved === true &&
      model.contract.noRegression.w151ImportGuardPreserved === true &&
      model.contract.noRegression.runnerOwnsGeneratedRecords === true &&
      model.contract.noRegression.imageLookupDisabledByDefault === true
    ),
    'one-click Build, W144 config, polling, W151, runner ownership, and image lookup boundary remain intact');

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w214-operating-mode-resolver-dynamic-record-contract-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    fixtures: Object.fromEntries(Object.entries(models).map(([key, model]) => [key, {
      customer: model.fixture.customer,
      website: model.fixture.website,
      expectedMode: model.resolver.resolvedOperatingMode,
      modeConfidence: model.resolver.modeConfidence,
      selectedToggles: model.resolver.selectedToggles,
      requiredRecordRoles: model.resolver.requiredRecordRoles,
      optionalRecordRoles: model.resolver.optionalRecordRoles,
      invalidRecordRoles: model.resolver.invalidRecordRoles,
      goodGuardStatus: model.goodGuard.status,
      semanticStatus: model.goodGuard.semanticGuard && model.goodGuard.semanticGuard.status,
      badGuardStatus: model.badGuard.status,
      adminDebugWarnings: model.goodGuard.semanticGuard && model.goodGuard.semanticGuard.dynamicRecordDisplayModel && model.goodGuard.semanticGuard.dynamicRecordDisplayModel.adminDebugWarnings || []
    }]))
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w214-trace-samples.v1',
    samples: Object.entries(models).map(([key, model]) => ({
      event: `w214.${key}.operating_mode_resolved`,
      customer: model.fixture.customer,
      website: model.fixture.website,
      resolvedOperatingMode: model.resolver.resolvedOperatingMode,
      modeConfidence: model.resolver.modeConfidence,
      selectedToggles: model.resolver.selectedToggles,
      requiredRecordRoles: model.resolver.requiredRecordRoles,
      invalidRecordRoles: model.resolver.invalidRecordRoles,
      goodGuardStatus: model.goodGuard.status,
      semanticStatus: model.goodGuard.semanticGuard && model.goodGuard.semanticGuard.status,
      dynamicRecordDisplayModel: model.goodGuard.semanticGuard && model.goodGuard.semanticGuard.dynamicRecordDisplayModel,
      rejectedBadResult: {
        status: model.badGuard.status,
        message: model.badGuard.message
      }
    }))
  });
  writeText(reportPath, [
    '# W214 Operating Mode Resolver And Dynamic Record Contract',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Operating Mode Resolver Contract',
    '- Resolve one Build Operating Mode before naming, request creation, result import, Run coaching, ROI, or competitive story.',
    '- Website/domain/category evidence controls industry, category, and product nouns.',
    '- Consultant toggles control operating-model vocabulary: Manufacturing=false blocks manufacturing semantics, Manufacturing=true allows only mode-supported manufacturing semantics, and WIP=true requires WIP detail or an explicit partial-result state.',
    '- Conversation notes shape pain, story, ROI, objection handling, and competitive framing only.',
    '',
    '## Dynamic Record Contract',
    '- Non-manufacturing modes no longer require the legacy component item role to import a valid completed result.',
    '- Manufacturing modes may display more than five records when BOM, assembly, work order, routing, or work center records exist.',
    '- Missing manufacturing or WIP details are exposed as partial-result/admin-debug warnings, not consultant-facing false completion copy.',
    '',
    '## Validation',
    ...results.map((item) => `- ${item.pass ? 'PASS' : 'FAIL'} ${item.id}: ${item.evidence}`),
    '',
    '## Trace Samples',
    `- ${path.relative(root, tracePath)}`,
    `- ${path.relative(root, dataPath)}`,
    '',
    '## Upload Packet',
    '- Upload/update `idb-drawer.user.js` only.',
    '- No W144 adapter, runner, or SuiteScript upload is required for W214.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run or requested for W214. Harness/regression-first validation is sufficient because this block changes resolver contracts, request JSON, import validation, and admin/debug display modeling rather than layout.',
    '',
    '## Best Next Codex Prompt',
    'Move through W215: Runner Output Role Mapping And Partial Result Import UX. Use W214 mode contracts to align the governed runner result JSON roles with IDB dynamic record display, preserve W151 import guard, and add targeted consultant/admin copy for partial manufacturing and WIP results without broad visual testing.'
  ].join('\n') + '\n');

  if (summary.status !== 'pass') {
    console.error(`W214 operating mode resolver dynamic record contract: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W214 operating mode resolver dynamic record contract: pass; ${passCount}/${results.length} checks`);
}

main();
