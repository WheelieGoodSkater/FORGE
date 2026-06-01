#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  openRecordFixture,
  printResults,
  readArchiveJson,
  storyFixtureState,
  storyScenarioFromState
} = require('./lib/forge_harness_fixtures');

const {
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence,
  consultantStorySurfaceFromLanePack
} = require('../../src/contracts/lanePacks');

function fixture(hooks, config) {
  return storyScenarioFromState(hooks, storyFixtureState(hooks, config), config.label);
}

function traceScenario(hooks, file, label) {
  const trace = readArchiveJson('trace_samples', file);
  return storyScenarioFromState(hooks, Object.assign(hooks.defaultState(), trace.state || {}), label);
}

function textOf(scenario) {
  return [scenario.valueText, scenario.runText, scenario.traceText].join(' ');
}

function clickablePathCount(html) {
  return (String(html || '').match(/idb-w371-path-clickable/g) || []).length;
}

function importedOpenLinksValid(state) {
  const records = state && state.dccFinalNamingResult && state.dccFinalNamingResult.displayReadyRecords || [];
  return records.length >= 4 && records.every((record) =>
    record.safeToOpen === true &&
    record.linkAuthorityStatus === 'verified_openable' &&
    /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function packById(id) {
  return LANE_PACKS.find((pack) => pack.packId === id);
}

function packText(pack) {
  return JSON.stringify({
    websiteSignals: pack && pack.websiteSignals,
    recordRoles: pack && pack.recordRoles,
    vocabulary: pack && pack.vocabulary,
    liveDemo: pack && pack.liveDemo,
    nllmAdvisory: pack && pack.nllmAdvisory
  }).toLowerCase();
}

function includesAll(text, terms) {
  return terms.every((term) => text.includes(String(term).toLowerCase()));
}

function reviewLane(laneId, expectedRoles, expectedTerms, gapTerms) {
  const packs = LANE_PACKS.filter((pack) => pack.laneId === laneId);
  const directPackCount = packs.length;
  const roles = packs.map((pack) => []
    .concat(pack.recordRoles.required || [])
    .concat(pack.recordRoles.optional || [])
    .join(' ')
    .toLowerCase()).join(' ');
  const text = packs.map(packText).join(' ');
  const roleCoverage = expectedRoles.map((terms) => terms.some((term) => roles.includes(String(term).toLowerCase())));
  const termCoverage = expectedTerms.map((term) => text.includes(String(term).toLowerCase()));
  const gapTermsPresent = (gapTerms || []).filter((term) => text.includes(String(term).toLowerCase()));
  const roleCoverageRatio = roleCoverage.filter(Boolean).length / roleCoverage.length;
  const termCoverageRatio = termCoverage.filter(Boolean).length / termCoverage.length;
  let status = 'needs_scoped_source_pack_cleanup';
  if (directPackCount && roleCoverageRatio >= 0.8 && termCoverageRatio >= 0.75 && (!gapTerms || gapTermsPresent.length === gapTerms.length)) {
    status = 'ready_now';
  } else if (directPackCount && roleCoverageRatio >= 0.6 && termCoverageRatio >= 0.5) {
    status = 'ready_with_fixture_only_proof';
  }
  return { laneId, directPackCount, packIds: packs.map((pack) => pack.packId), roleCoverageRatio, termCoverageRatio, status };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const partsPack = packById('parts-service-field-operations');
  const lifePack = packById('life-sciences-regulated-supply-release');
  const bayviewRecords = [
    openRecordFixture('customer', 'Customer', 'Bayview Customer Account', '7001', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7001'),
    openRecordFixture('work_order', 'Work Order', 'WO-W370 Bayview Repair', '7002', 'https://td3021666.app.netsuite.com/app/accounting/transactions/workord.nl?id=7002'),
    openRecordFixture('installed_equipment', 'Installed Equipment', 'Bayview Installed Oven', '7003', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7003'),
    openRecordFixture('service_part', 'Service Part / SKU', 'Bayview Igniter SKU', '7004', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7004')
  ];
  const bayview = fixture(hooks, {
    label: 'Bayview Parts/Service',
    laneId: 'parts_service',
    customer: 'Bayview Commercial Kitchen Service',
    website: 'https://www.bayviewkitchenservice.com',
    notes: 'Service manager needs work order, installed equipment, truck/warehouse parts, backorder, warranty, and first-time fix readiness.',
    websiteEvidence: 'Commercial kitchen service, repair service, work orders, installed equipment, technician readiness, service parts, truck stock, warehouse parts, warranty, emergency repair, and first-time fix risk.',
    records: bayviewRecords
  });
  const meridian = fixture(hooks, {
    label: 'Meridian Life Sciences',
    laneId: 'life_sciences',
    customer: 'Meridian BioSystems',
    website: 'https://www.meridianbiosystems.com',
    notes: 'Diagnostic kits, lab instruments, reagents, lot status, expiration, validation paperwork, QA release, approved inventory, and shipment confidence.',
    websiteEvidence: 'Diagnostic kits, lab instruments, reagents, regulated consumables, lot status, expiration, validation paperwork, QA release, approved inventory, traceability, and shipment confidence.',
    records: [
      openRecordFixture('customer', 'Customer', 'Meridian BioSystems Customer Account', '7401', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7401'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W378 Meridian Diagnostic Kit Order', '7402', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7402'),
      openRecordFixture('lot_release', 'Lot / Release', 'Meridian Diagnostic Kit Lot Release Record', '7403', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7403'),
      openRecordFixture('approved_inventory', 'Approved Inventory', 'Meridian Approved Reagent Inventory', '7404', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7404'),
      openRecordFixture('qa_validation', 'QA / Validation Documentation', 'Meridian QA Validation Documentation Packet', '7405', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7405')
    ]
  });
  const atlas = fixture(hooks, {
    label: 'Atlas Industrial Equipment',
    laneId: 'industrial_equipment',
    customer: 'Atlas Lift Systems',
    website: 'https://www.atlasliftsystems.com',
    notes: 'Configured lift systems need component availability, supplier lead time, build schedule, inspection/test readiness, and delivery promise confidence.',
    websiteEvidence: 'Industrial equipment, configured assemblies, components, supplier lead times, inspection/testing.',
    records: [
      openRecordFixture('customer', 'Customer', 'Atlas Lift Systems Customer Account', '7301', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7301'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W376 Atlas Configured Lift Order', '7302', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7302'),
      openRecordFixture('assembly', 'Assembly', 'Atlas Configured Hydraulic Lift Assembly', '7303', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7303'),
      openRecordFixture('component', 'Component / Supplier Lead Time', 'Atlas Hydraulic Component Lead-Time Signal', '7304', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7304')
    ]
  });
  const willow = fixture(hooks, {
    label: 'Willow Food/Beverage',
    laneId: 'food_beverage',
    customer: 'Willow Creek Specialty Foods',
    website: 'https://www.willowcreekspecialtyfoods.com',
    notes: 'Ingredients, packaging, batch timing, QA holds, lot readiness, and ship dates are hard to trust.',
    websiteEvidence: 'Food manufacturer, ingredients, packaging, batch schedule, QA holds.',
    records: [
      openRecordFixture('customer', 'Customer', 'Willow Creek Specialty Foods Customer Account', '7201', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7201'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W374 Willow Creek Seasonal Sauce Promotion', '7202', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7202'),
      openRecordFixture('finished_good', 'Finished Good', 'Willow Creek Finished Good', '7203', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7203'),
      openRecordFixture('ingredient_packaging', 'Ingredient / Packaging Structure', 'Willow Creek Packaging Readiness', '7204', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7204')
    ]
  });
  const northstar = fixture(hooks, {
    label: 'Northstar Medical/Dental',
    laneId: 'medical_dental_supply',
    customer: 'Northstar Dental Supply & Equipment',
    website: 'https://www.northstardentalsupply.com',
    notes: 'Clinics need dental supply availability, substitutes, backorders, multi-location stock, and warranty context.',
    websiteEvidence: 'Dental supplies, substitutes, backorder, multi-location stock.',
    records: [
      openRecordFixture('customer', 'Customer', 'Northstar Dental Supply Customer Account', '7101', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7101'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W372 Northstar Clinic Supply Order', '7102', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7102'),
      openRecordFixture('clinic_supply_item', 'Clinic Supply Item', 'Northstar Sterilization Supply Item', '7103', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7103'),
      openRecordFixture('substitute_product', 'Substitute Product', 'Northstar Substitute SKU', '7104', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7104')
    ]
  });
  const harbor = fixture(hooks, {
    label: 'Harbor Apparel/Retail',
    laneId: 'apparel_accessories',
    customer: 'Harbor & Finch Outfitters',
    website: 'https://www.harborfinchoutfitters.com',
    notes: 'Apparel retailer needs style, size, color, ecommerce promise, transfer, replenishment, and margin visibility.',
    websiteEvidence: 'Apparel, style, size, color, ecommerce, seasonal assortment.',
    records: [
      openRecordFixture('customer', 'Customer', 'Harbor Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W369 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
      openRecordFixture('style_sku', 'Style SKU', 'Harbor Field Jacket SKU', '6903', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6903'),
      openRecordFixture('style_matrix', 'Style Matrix', 'Harbor Size Color Matrix', '6904', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6904')
    ]
  });
  const baselines = [
    traceScenario(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Dealer Hardgoods'),
    traceScenario(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Dealer Hardgoods'),
    traceScenario(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    traceScenario(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    traceScenario(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const scenarios = [bayview, meridian, atlas, willow, northstar, harbor].concat(baselines);
  const sharedRendererScenarios = [bayview, meridian, atlas, willow, northstar, harbor].concat(baselines.slice(0, 2));
  const partsPackText = packText(partsPack);
  const strongResolution = resolveLanePackFromEvidence({
    website: 'https://www.bayviewkitchenservice.com',
    categoryText: 'Commercial kitchen service, equipment service, installed equipment, work order, technician, service parts, truck stock, warehouse parts, emergency repair, warranty.',
    signals: ['work order readiness', 'installed equipment history', 'truck/warehouse parts availability', 'backordered parts', 'first-time fix risk']
  });
  const weakResolution = resolveLanePackFromEvidence({
    website: 'https://example.invalid',
    categoryText: 'maybe equipment stuff',
    signals: []
  });
  const storySurface = consultantStorySurfaceFromLanePack({
    website: 'https://www.bayviewkitchenservice.com',
    categoryText: 'Commercial kitchen service, repair service, installed equipment, work order, technician, service parts, truck stock, warranty.'
  }, partsPack, { displayReadyRecords: bayviewRecords });
  const readiness = {
    dealer_hardgoods: reviewLane('dealer_hardgoods', [
      ['customer'], ['sales_order'], ['product_sku'], ['dealer_availability_or_replenishment_flow'], ['allocation_support_sku', 'channel_context']
    ], ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU']),
    apparel_accessories: reviewLane('apparel_accessories', [
      ['customer'], ['sales_order'], ['style_sku'], ['style_matrix_or_availability_flow'], ['supporting_style_or_color_sku']
    ], ['style', 'size', 'color', 'variant availability'], ['ecommerce', 'transfer', 'store availability']),
    parts_service: reviewLane('parts_service', [
      ['customer'], ['work_order'], ['installed_equipment'], ['service_part'], ['truck_stock_context'], ['warehouse_parts_context'], ['backorder_context'], ['warranty_context']
    ], ['work order readiness', 'installed equipment history', 'truck/warehouse parts availability', 'backordered parts', 'warranty exposure', 'first-time fix risk', 'emergency response', 'service margin']),
    medical_dental_supply: reviewLane('medical_dental_supply', [
      ['customer'], ['sales_order'], ['clinic_supply', 'equipment'], ['substitute'], ['backorder', 'multi-location', 'warranty', 'compliance']
    ], ['clinic', 'substitute', 'backorder', 'multi-location', 'warranty']),
    food_beverage: reviewLane('food_beverage', [
      ['customer'], ['sales_order'], ['finished_food_or_batch_item'], ['ingredient_or_component_item'], ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object']
    ], ['ingredient readiness', 'batch', 'packaging timing', 'finished-good availability']),
    industrial_equipment: reviewLane('industrial_equipment', [
      ['customer'], ['sales_order'], ['finished_or_assembly_item'], ['component_item'], ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing', 'work_center']
    ], ['configured equipment', 'assembly', 'component availability', 'supplier timing']),
    life_sciences: reviewLane('life_sciences', [
      ['customer'], ['sales_order'], ['lot_or_release_record'], ['approved_inventory_item'], ['expiration_or_shelf_life_context'], ['qa_validation_documentation'], ['traceability_context']
    ], ['lot/release readiness', 'approved inventory', 'expiration risk', 'QA/validation documentation', 'traceability', 'shipment confidence'])
  };

  assertCase(results, 'w381-parts-service-source-pack-present-and-valid',
    !!partsPack &&
      partsPack.laneId === 'parts_service' &&
      partsPack.label === 'Parts & Service Field Operations' &&
      partsPack.operatingMode === 'services_field' &&
      validateLanePack(partsPack).valid === true,
    JSON.stringify(partsPack || null, null, 2));

  assertCase(results, 'w381-parts-service-proof-role-coverage',
    includesAll(partsPackText, ['customer', 'work_order', 'installed_equipment', 'service_part', 'truck_stock_context', 'warehouse_parts_context', 'backorder_context', 'warranty_context', 'emergency_response_context', 'service_margin_context']),
    partsPackText);

  assertCase(results, 'w381-parts-service-signal-vocabulary-and-anti-leak-coverage',
    includesAll(partsPackText, ['field service', 'service operations', 'repair service', 'commercial kitchen service', 'equipment service', 'installed equipment', 'work order', 'technician', 'service parts', 'truck stock', 'warehouse parts', 'emergency repair', 'warranty']) &&
      includesAll(partsPackText, ['work order readiness', 'installed equipment history', 'truck/warehouse parts availability', 'backordered parts', 'warranty exposure', 'first-time fix risk', 'emergency response', 'service margin']) &&
      includesAll(partsPackText, ['dealer allocation', 'channel fulfillment', 'style/color/size', 'store/ecommerce promise', 'clinic supply substitutes', 'food batch', 'QA release'.toLowerCase(), 'lot/release readiness', 'configured equipment assembly']),
    partsPackText);

  assertCase(results, 'w381-lane-pack-resolution-and-story-surface-safety',
    strongResolution.packId === 'parts-service-field-operations' &&
      strongResolution.status === 'resolved' &&
      weakResolution.status !== 'resolved' &&
      storySurface.status === 'story_ready' &&
      /work order|installed equipment|service part|truck|warehouse|warranty|first-time-fix|service-margin/i.test(JSON.stringify(storySurface)) &&
      !/guarantee|guaranteed|measured roi|will increase/i.test([
        storySurface.proofMove,
        storySurface.safeClaim,
        storySurface.buyerFacingSoWhat,
        storySurface.competitiveContrast
      ].join(' ')) &&
      /Do not claim .*measured ROI without evidence/i.test(storySurface.doNotClaim || ''),
    JSON.stringify({ strongResolution, weakResolution, storySurface }, null, 2));

  assertCase(results, 'w381-readiness-map-updated-without-other-lane-regression',
    readiness.parts_service.status === 'ready_now' &&
      readiness.parts_service.packIds.indexOf('parts-service-field-operations') >= 0 &&
      readiness.life_sciences.status === 'ready_now' &&
      readiness.life_sciences.packIds.indexOf('life-sciences-regulated-supply-release') >= 0 &&
      readiness.dealer_hardgoods.status === 'ready_now' &&
      readiness.food_beverage.status === 'ready_now' &&
      readiness.industrial_equipment.status === 'ready_now' &&
      readiness.apparel_accessories.status === 'ready_with_fixture_only_proof' &&
      readiness.medical_dental_supply.status === 'needs_scoped_source_pack_cleanup',
    JSON.stringify(readiness, null, 2));

  assertCase(results, 'w381-bayview-life-sciences-and-w371-run-value-preserved',
    /work order|installed equipment|truck|warehouse|first-time fix/i.test(bayview.valueText + bayview.runText) &&
      /Regulated lot and release readiness/i.test(meridian.valueText + meridian.runText) &&
      lifePack && validateLanePack(lifePack).valid === true &&
      scenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      sharedRendererScenarios.every((scenario) => /W375 shared story renderer/.test(scenario.valueHtml + scenario.runHtml)) &&
      sharedRendererScenarios.every((scenario) => scenario.value.storyContractW373.authoringReadinessW377.ready === true) &&
      scenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4),
    bayview.valueText.slice(0, 2200));

  assertCase(results, 'w381-open-link-claim-safety-confidence-and-no-fake-links',
    scenarios.every((scenario) => importedOpenLinksValid(scenario.state)) &&
      scenarios.every((scenario) => /Measured savings require|before claiming savings|Baseline to capture/i.test(textOf(scenario))) &&
      scenarios.every((scenario) => /Advisory only|advisory|Assumption|Inferred|confidence/i.test(textOf(scenario))) &&
      LANE_PACKS.every((pack) => validateLanePack(pack).valid) &&
      LANE_PACKS.every((pack) => pack.nllmAdvisory.writeAuthority === 'none' && pack.nllmAdvisory.creationAllowed === false),
    JSON.stringify(readiness, null, 2));

  printResults('W381 Parts/Service source-pack readiness cleanup harness', results);
}

main();
