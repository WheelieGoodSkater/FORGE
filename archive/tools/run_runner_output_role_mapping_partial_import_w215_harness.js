const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const userscriptPath = path.join(root, 'idb-drawer.user.js');
const dataPath = path.join(root, 'data', 'w215_runner_output_role_mapping_partial_import.json');
const tracePath = path.join(root, 'trace_samples', 'w215_runner_output_role_mapping_partial_import_trace.json');
const reportPath = path.join(root, 'reports', 'w215_runner_output_role_mapping_partial_import.md');

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
    fetch: () => Promise.reject(new Error('live NetSuite fetch disabled in W215 harness')),
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

function baseState(fixture, adminDebug) {
  return {
    selectedLaneId: fixture.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    selectedMoveIndex: 0,
    briefPrepared: true,
    setupEditMode: adminDebug === true,
    intake: {
      customer: fixture.customer,
      website: fixture.website,
      notes: fixture.notes
    },
    toggles: {
      [fixture.laneId]: {
        createNewHeroItem: true,
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

function contextFromFixture(hooks, fixture, adminDebug) {
  const state = baseState(fixture, adminDebug);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, page, recommendation);
  hooks.reconcileStateAuthority(state);
  return { state, lane, page, recommendation };
}

function nsRecord(role, type, name, id, pathName) {
  return {
    role,
    type,
    name,
    internalId: String(id),
    id: String(id),
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${pathName || '/app/common/item/item.nl'}?id=${id}`
  };
}

function semanticPayload(fixture, semanticRecords, options) {
  const opts = options || {};
  return {
    schema: 'idb.completed-runner-result-json.v1',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    familyKey: fixture.laneId,
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: fixture.enableManufacturing === true,
      enableWip: fixture.enableWip === true
    },
    partialResultState: opts.partialResultState || '',
    warnings: opts.warning ? [opts.warning] : [],
    records: [
      nsRecord('customer', 'customer', `${fixture.customer} Customer Account`, 1700 + fixture.index, '/app/common/entity/custjob.nl'),
      nsRecord('sales_order', 'salesorder', `${fixture.customer} SO215`, 80000 + fixture.index, '/app/accounting/transactions/salesord.nl'),
      ...semanticRecords.map((record, recordIndex) => nsRecord(record.role, record.type || 'inventoryitem', record.name, 2100 + fixture.index * 100 + recordIndex))
    ]
  };
}

function badPayloadWithInvalidNames(fixture, names) {
  return semanticPayload(fixture, [
    { role: names.heroRole || 'product_sku', name: names.hero },
    { role: names.flowRole || 'replenishment_or_availability_flow', name: names.flow },
    { role: names.componentRole || 'component_item', name: names.component }
  ]);
}

function modelFor(hooks, fixture, payload, adminDebug) {
  const context = contextFromFixture(hooks, fixture, adminDebug);
  const guard = hooks.validateDccFinalNamingImportPayload(payload, context.state, context.lane, context.page, context.recommendation);
  const mapping = hooks.runnerOutputRoleMappingContractW215V1(payload, context.state, context.lane, context.page, context.recommendation);
  const ux = hooks.partialResultImportUxModelW215V1(payload, context.state, context.lane, context.page, context.recommendation);
  const resolver = hooks.resolveBuildOperatingModeW214(context.state, context.lane, context.page, context.recommendation, { payload });
  return { context, guard, mapping, ux, resolver };
}

function mappedRoles(mapping) {
  return (mapping.mappedRecords || []).map((record) => record.w215MappedRole).join('|');
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
      notes: 'Retail availability and seasonal outdoor replenishment proof. Manufacturing words in notes are legacy noise only.'
    },
    harbor: {
      index: 2,
      customer: 'Harbor & Ridge Apparel',
      website: 'https://www.patagonia.com',
      laneId: 'apparel_accessories',
      enableManufacturing: false,
      enableWip: false,
      notes: 'Style, size, color, channel availability, and seasonal apparel launch readiness.'
    },
    metroline: {
      index: 3,
      customer: 'Metroline Parts Supply',
      website: 'https://www.grainger.com',
      laneId: 'industrial_distribution',
      enableManufacturing: false,
      enableWip: false,
      notes: 'Branch parts replenishment. Controlled Assembly Execution is a bad note phrase and must not name records.'
    },
    evergreen: {
      index: 4,
      customer: 'Evergreen Equipment Works',
      website: 'https://www.ariens.com',
      laneId: 'industrial_equipment',
      enableManufacturing: true,
      enableWip: false,
      notes: 'Outdoor equipment manufacturing needs finished item, component, BOM, and assembly readiness.'
    },
    canyon: {
      index: 5,
      customer: 'Canyon Ridge Components',
      website: 'https://www.trekbikes.com',
      laneId: 'dealer_hardgoods',
      enableManufacturing: true,
      enableWip: true,
      notes: 'Bike component WIP needs work order, routing, and work center visibility.'
    },
    mccormick: {
      index: 6,
      customer: 'McCormick',
      website: 'https://www.mccormick.com',
      laneId: 'food_beverage',
      enableManufacturing: true,
      enableWip: true,
      notes: 'Spice and seasoning food batch proof with ingredient, formula, lot, and WIP readiness.'
    }
  };

  const payloads = {
    northstarComplete: semanticPayload(fixtures.northstar, [
      { role: 'hero_sku', name: 'Northstar Trail Outfitters Product Availability SKU' },
      { role: 'availability_or_replenishment_flow', name: 'Northstar Trail Outfitters Retail Replenishment Flow' },
      { role: 'location_or_channel_context', name: 'Northstar Trail Outfitters Store Channel Context' }
    ]),
    harborComplete: semanticPayload(fixtures.harbor, [
      { role: 'style_sku', name: 'Harbor & Ridge Apparel Style SKU' },
      { role: 'style_matrix_or_availability_flow', name: 'Harbor & Ridge Apparel Omnichannel Availability Flow' },
      { role: 'component_item', name: 'Harbor & Ridge Apparel Style Matrix Color SKU' }
    ]),
    metrolineInvalid: badPayloadWithInvalidNames(fixtures.metroline, {
      heroRole: 'branch_or_product_sku',
      flowRole: 'replenishment_or_availability_flow',
      componentRole: 'component_item',
      hero: 'Metroline Parts Supply Finished Good',
      flow: 'Metroline Parts Supply Controlled Assembly Execution',
      component: 'Metroline Parts Supply Frame Welding'
    }),
    evergreenComplete: semanticPayload(fixtures.evergreen, [
      { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Evergreen Equipment Works Assembly Structure' },
      { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
    ]),
    evergreenPartial: semanticPayload(fixtures.evergreen, [
      { role: 'finished_or_assembly_item', name: 'Evergreen Equipment Works Finished Good' },
      { role: 'production_planning_context', name: 'Evergreen Equipment Works Production Planning Context' },
      { role: 'component_item', name: 'Evergreen Equipment Works Component Item' }
    ], {
      partialResultState: 'partial_result_missing_manufacturing_records',
      warning: 'Manufacturing records missing: BOM or assembly structure not returned.'
    }),
    canyonComplete: semanticPayload(fixtures.canyon, [
      { role: 'finished_or_assembly_item', name: 'Canyon Ridge Components Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Canyon Ridge Components Assembly Structure' },
      { role: 'component_item', name: 'Canyon Ridge Components Component Item' },
      { role: 'work_order_or_wip_object', name: 'Canyon Ridge Components Work Order' },
      { role: 'routing', name: 'Canyon Ridge Components Routing' },
      { role: 'work_center', name: 'Canyon Ridge Components Work Center' }
    ]),
    canyonPartial: semanticPayload(fixtures.canyon, [
      { role: 'finished_or_assembly_item', name: 'Canyon Ridge Components Finished Good' },
      { role: 'bom_or_assembly_structure', name: 'Canyon Ridge Components Assembly Structure' },
      { role: 'component_item', name: 'Canyon Ridge Components Component Item' }
    ], {
      partialResultState: 'partial_result_missing_wip_detail',
      warning: 'WIP detail not returned.'
    }),
    mccormickPartial: semanticPayload(fixtures.mccormick, [
      { role: 'finished_food_or_batch_item', name: 'McCormick Finished Food Batch Item' },
      { role: 'formula_or_batch_structure', name: 'McCormick Formula Batch Structure' },
      { role: 'ingredient_or_component_item', name: 'McCormick Ingredient Item' },
      { role: 'lot_or_availability_context', name: 'McCormick Lot Availability Context' }
    ], {
      partialResultState: 'partial_result_missing_wip_detail',
      warning: 'WIP detail not returned for food batch result.'
    }),
    mccormickInvalid: badPayloadWithInvalidNames(fixtures.mccormick, {
      heroRole: 'finished_food_or_batch_item',
      flowRole: 'style_matrix_or_availability_flow',
      componentRole: 'ingredient_or_component_item',
      hero: 'McCormick Style SKU',
      flow: 'McCormick Omnichannel Availability Flow',
      component: 'McCormick Core Style'
    })
  };

  const models = {
    northstar: modelFor(hooks, fixtures.northstar, payloads.northstarComplete, false),
    harbor: modelFor(hooks, fixtures.harbor, payloads.harborComplete, false),
    metrolineInvalid: modelFor(hooks, fixtures.metroline, payloads.metrolineInvalid, false),
    evergreenComplete: modelFor(hooks, fixtures.evergreen, payloads.evergreenComplete, false),
    evergreenPartialConsultant: modelFor(hooks, fixtures.evergreen, payloads.evergreenPartial, false),
    evergreenPartialAdmin: modelFor(hooks, fixtures.evergreen, payloads.evergreenPartial, true),
    canyonComplete: modelFor(hooks, fixtures.canyon, payloads.canyonComplete, false),
    canyonPartialAdmin: modelFor(hooks, fixtures.canyon, payloads.canyonPartial, true),
    mccormickPartialAdmin: modelFor(hooks, fixtures.mccormick, payloads.mccormickPartial, true),
    mccormickInvalid: modelFor(hooks, fixtures.mccormick, payloads.mccormickInvalid, false)
  };
  const handoffContext = contextFromFixture(hooks, fixtures.northstar, false);
  const handoffPayload = hooks.dccRunnerHandoffPacketV1(handoffContext.state, handoffContext.lane, handoffContext.page, handoffContext.recommendation);
  const handoffGuard = hooks.validateDccFinalNamingImportPayload(handoffPayload, handoffContext.state, handoffContext.lane, handoffContext.page, handoffContext.recommendation);

  const productionModel = hooks.productionConsultantIntakeAndBuildAutomationSimplificationW206V1(
    handoffContext.state,
    handoffContext.lane,
    handoffContext.page,
    handoffContext.recommendation
  );

  const results = [];
  assertCase(results, 'complete_non_manufacturing_records_map_without_legacy_component_requirement',
    models.northstar.guard.valid === true &&
      models.northstar.resolver.resolvedOperatingMode === 'retail_availability' &&
      mappedRoles(models.northstar.mapping).includes('hero_sku') &&
      mappedRoles(models.northstar.mapping).includes('availability_or_replenishment_flow'),
    `${models.northstar.guard.status}; ${mappedRoles(models.northstar.mapping)}`);
  assertCase(results, 'apparel_semantic_roles_import_cleanly',
    models.harbor.guard.valid === true &&
      mappedRoles(models.harbor.mapping).includes('style_sku') &&
      mappedRoles(models.harbor.mapping).includes('style_matrix_or_availability_flow'),
    `${models.harbor.resolver.resolvedOperatingMode}; ${mappedRoles(models.harbor.mapping)}`);
  assertCase(results, 'invalid_distribution_role_name_combo_rejected',
    models.metrolineInvalid.guard.valid === false &&
      /Controlled Assembly Execution|Frame Welding|Finished Good/i.test(models.metrolineInvalid.guard.message),
    models.metrolineInvalid.guard.message);
  assertCase(results, 'complete_manufacturing_records_can_import_and_display_more_than_five',
    models.evergreenComplete.guard.valid === true &&
      models.evergreenComplete.guard.semanticGuard.status === 'operating_mode_record_contract_passed' &&
      models.evergreenComplete.guard.semanticGuard.dynamicRecordDisplayModel.canShowMoreThanFiveRecords === true,
    `${models.evergreenComplete.guard.status}; records=${models.evergreenComplete.mapping.mappedRecords.length}`);
  assertCase(results, 'partial_manufacturing_import_suppresses_admin_warning_for_consultant',
    models.evergreenPartialConsultant.guard.valid === true &&
      models.evergreenPartialConsultant.ux.status === 'partial_result_imported_with_admin_debug_warning' &&
      models.evergreenPartialConsultant.ux.adminDebugWarnings.length === 0 &&
      models.evergreenPartialConsultant.ux.fullManufacturingOrWipClaimAllowed === false,
    JSON.stringify(models.evergreenPartialConsultant.ux));
  assertCase(results, 'partial_manufacturing_admin_debug_warning_visible',
    models.evergreenPartialAdmin.ux.adminDebugWarnings.join(' ').includes('Manufacturing records missing'),
    JSON.stringify(models.evergreenPartialAdmin.ux.adminDebugWarnings));
  assertCase(results, 'complete_wip_records_import_with_work_order_routing_work_center',
    models.canyonComplete.guard.valid === true &&
      ['work_order_or_wip_object', 'routing', 'work_center'].every((role) => mappedRoles(models.canyonComplete.mapping).includes(role)),
    mappedRoles(models.canyonComplete.mapping));
  assertCase(results, 'partial_wip_admin_debug_says_wip_detail_not_returned',
    models.canyonPartialAdmin.guard.valid === true &&
      models.canyonPartialAdmin.ux.adminDebugWarnings.join(' ').includes('WIP detail not returned') &&
      models.canyonPartialAdmin.ux.fullManufacturingOrWipClaimAllowed === false,
    JSON.stringify(models.canyonPartialAdmin.ux.adminDebugWarnings));
  assertCase(results, 'mccormick_food_batch_partial_import_rejects_apparel_fallback',
    models.mccormickPartialAdmin.guard.valid === true &&
      models.mccormickPartialAdmin.resolver.resolvedOperatingMode === 'food_batch_manufacturing' &&
      mappedRoles(models.mccormickPartialAdmin.mapping).includes('ingredient_or_component_item') &&
      models.mccormickInvalid.guard.valid === false &&
      /Style SKU|Omnichannel Availability Flow/i.test(models.mccormickInvalid.guard.message),
    `${models.mccormickPartialAdmin.resolver.resolvedOperatingMode}; invalid=${models.mccormickInvalid.guard.status}`);
  assertCase(results, 'handoff_json_still_rejected_by_w151',
    handoffGuard.valid === false && handoffGuard.status === 'handoff_packet_rejected',
    handoffGuard.message);
  assertCase(results, 'w151_numeric_ids_and_supported_urls_preserved',
    models.harbor.mapping.requiredRoleReadiness.every((item) => item.present && item.openable) &&
      models.harbor.mapping.w151Preservation.numericInternalIdsRequired === true &&
      models.harbor.mapping.w151Preservation.supportedNetSuiteUrlsRequired === true,
    JSON.stringify(models.harbor.mapping.requiredRoleReadiness));
  assertCase(results, 'normal_consultant_ui_hides_internal_plumbing',
    !JSON.stringify(productionModel.consultantWorkflow).match(/W144|runnerTaskId|raw JSON|W151|endpoint/i) &&
      models.evergreenPartialConsultant.ux.adminDebugWarningsSuppressedForConsultant === true,
    JSON.stringify(productionModel.consultantWorkflow));
  assertCase(results, 'nllm_and_production_boundaries_preserved',
    models.northstar.mapping.noRegression.noDrawerWrites === true &&
      models.northstar.mapping.noRegression.noDirectSuiteScriptOutsideApprovedW144AdapterPath === true &&
      models.northstar.ux.noRegression.noDrawerCreatedRecords === true &&
      models.northstar.ux.noRegression.noDrawerTransactionWrites === true &&
      models.northstar.ux.noRegression.runnerOwnsGeneratedRecords === true,
    JSON.stringify(models.northstar.ux.noRegression));
  assertCase(results, 'production_path_boundaries_preserved',
    productionModel.noRegression.w151ImportGuardPreserved === true &&
      productionModel.noRegression.noDrawerWrites === true &&
      productionModel.noRegression.noDirectDrawerSuiteScriptOutsideApprovedAdapterPath === true &&
      productionModel.noRegression.runnerOwnershipPreserved === true,
    JSON.stringify(productionModel.noRegression));

  const passCount = results.filter((item) => item.pass).length;
  const summary = {
    schema: 'idb.w215-runner-output-role-mapping-partial-import-harness.v1',
    status: passCount === results.length ? 'pass' : 'fail',
    passCount,
    total: results.length,
    results,
    fixtures: {
      northstar: { mode: models.northstar.resolver.resolvedOperatingMode, mappedRoles: mappedRoles(models.northstar.mapping), guard: models.northstar.guard.status },
      harbor: { mode: models.harbor.resolver.resolvedOperatingMode, mappedRoles: mappedRoles(models.harbor.mapping), guard: models.harbor.guard.status },
      metrolineInvalid: { mode: models.metrolineInvalid.resolver.resolvedOperatingMode, guard: models.metrolineInvalid.guard.status },
      evergreenComplete: { mode: models.evergreenComplete.resolver.resolvedOperatingMode, mappedRoles: mappedRoles(models.evergreenComplete.mapping), guard: models.evergreenComplete.guard.status },
      evergreenPartial: { status: models.evergreenPartialAdmin.ux.status, adminDebugWarnings: models.evergreenPartialAdmin.ux.adminDebugWarnings },
      canyonComplete: { mode: models.canyonComplete.resolver.resolvedOperatingMode, mappedRoles: mappedRoles(models.canyonComplete.mapping), guard: models.canyonComplete.guard.status },
      canyonPartial: { status: models.canyonPartialAdmin.ux.status, adminDebugWarnings: models.canyonPartialAdmin.ux.adminDebugWarnings },
      mccormickPartial: { mode: models.mccormickPartialAdmin.resolver.resolvedOperatingMode, mappedRoles: mappedRoles(models.mccormickPartialAdmin.mapping), guard: models.mccormickPartialAdmin.guard.status },
      handoffGuard: handoffGuard.status
    }
  };

  writeJson(dataPath, summary);
  writeJson(tracePath, {
    schema: 'idb.w215-trace-samples.v1',
    samples: [
      {
        event: 'w215.complete_non_manufacturing_role_mapping',
        customer: fixtures.northstar.customer,
        mode: models.northstar.resolver.resolvedOperatingMode,
        mappedRoles: models.northstar.mapping.mappedRecords.map((record) => ({ role: record.role, w215MappedRole: record.w215MappedRole, name: record.name }))
      },
      {
        event: 'w215.complete_manufacturing_more_than_five_records',
        customer: fixtures.evergreen.customer,
        displayStatus: models.evergreenComplete.guard.semanticGuard.dynamicRecordDisplayModel.status,
        recordCount: models.evergreenComplete.guard.semanticGuard.dynamicRecordDisplayModel.visibleRecords.length
      },
      {
        event: 'w215.partial_wip_admin_debug_warning',
        customer: fixtures.canyon.customer,
        status: models.canyonPartialAdmin.ux.status,
        adminDebugWarnings: models.canyonPartialAdmin.ux.adminDebugWarnings,
        normalConsultantCopy: models.canyonPartialAdmin.ux.normalConsultantCopy
      },
      {
        event: 'w215.handoff_json_rejected',
        status: handoffGuard.status,
        message: handoffGuard.message
      }
    ]
  });
  writeText(reportPath, [
    '# W215 Runner Output Role Mapping And Partial Result Import UX',
    '',
    `Status: ${summary.status.toUpperCase()} (${passCount}/${results.length})`,
    '',
    '## Runner Output Role Mapping Contract',
    '- Runner records can arrive with semantic W214/W215 roles such as `style_sku`, `finished_food_or_batch_item`, `work_order_or_wip_object`, `routing`, `work_center`, and `lot_or_availability_context`.',
    '- IDB maps those roles into the import/display model before W151 validates required records, numeric ids, supported URLs, and mode-aware naming.',
    '- Handoff JSON remains rejected because it requests runner work but does not contain completed result records.',
    '',
    '## Partial Result Import UX',
    '- Partial manufacturing results can import only when required core records are W151-valid and the runner explicitly marks the result partial.',
    '- Missing BOM/assembly structure and missing WIP detail are admin/debug warnings only.',
    '- Normal consultant copy stays simple and does not claim full manufacturing or WIP support when details are missing.',
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
    '- No W144 adapter, runner, or SuiteScript upload is required for W215.',
    '',
    '## Visual Testing Decision',
    'No broad visual testing was run or requested for W215. This block changes import role mapping, W151 result validation, and admin/debug partial-result copy; harness regression is the correct gate.',
    '',
    '## Best Next Codex Prompt',
    'Move through W216: Consultant-Facing Partial Result Review Polish. Use W215 role mapping and partial import UX to make Review/Run explain partial manufacturing and WIP results in plain consultant language while keeping admin/debug diagnostics hidden unless enabled. Preserve W151, real Open links, no drawer writes, and no broad visual testing.'
  ].join('\n') + '\n');

  if (summary.status !== 'pass') {
    console.error(`W215 runner output role mapping partial import: fail; ${passCount}/${results.length} checks`);
    process.exit(1);
  }
  console.log(`W215 runner output role mapping partial import: pass; ${passCount}/${results.length} checks`);
}

main();
