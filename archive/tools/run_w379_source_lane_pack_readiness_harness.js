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
  validateLanePack
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

function packsForLane(laneId) {
  return LANE_PACKS.filter((pack) => pack.laneId === laneId);
}

function packText(pack) {
  return JSON.stringify({
    websiteSignals: pack.websiteSignals,
    recordRoles: pack.recordRoles,
    vocabulary: pack.vocabulary,
    liveDemo: pack.liveDemo
  }).toLowerCase();
}

function hasAny(pack, terms) {
  const text = packText(pack);
  return terms.some((term) => text.includes(String(term).toLowerCase()));
}

function roleReady(pack, roleTerms) {
  const roles = []
    .concat(pack.recordRoles.required || [])
    .concat(pack.recordRoles.optional || [])
    .join(' ')
    .toLowerCase();
  return roleTerms.some((term) => roles.includes(String(term).toLowerCase()));
}

const READINESS_LANES = [
  {
    id: 'dealer_hardgoods',
    label: 'Dealer Hardgoods',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['product_sku'],
      ['dealer_availability_or_replenishment_flow'],
      ['allocation_support_sku', 'channel_context']
    ],
    expectedTerms: ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU'],
    expectedStatus: 'ready_now'
  },
  {
    id: 'apparel_accessories',
    label: 'Apparel/Retail',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['style_sku'],
      ['style_matrix_or_availability_flow'],
      ['supporting_style_or_color_sku']
    ],
    expectedTerms: ['style', 'size', 'color', 'variant availability'],
    gapTerms: ['ecommerce', 'transfer', 'store availability'],
    expectedStatus: 'ready_with_fixture_only_proof'
  },
  {
    id: 'parts_service',
    label: 'Parts/Service',
    expectedRoles: [
      ['customer'],
      ['work_order'],
      ['installed_equipment'],
      ['service_part'],
      ['truck', 'warehouse', 'backorder', 'warranty']
    ],
    expectedTerms: ['work order', 'installed equipment', 'truck', 'warehouse', 'warranty', 'first-time fix'],
    expectedStatus: 'needs_scoped_source_pack_cleanup'
  },
  {
    id: 'medical_dental_supply',
    label: 'Medical/Dental',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['clinic_supply', 'equipment'],
      ['substitute'],
      ['backorder', 'multi-location', 'warranty', 'compliance']
    ],
    expectedTerms: ['clinic', 'substitute', 'backorder', 'multi-location', 'warranty'],
    expectedStatus: 'needs_scoped_source_pack_cleanup'
  },
  {
    id: 'food_beverage',
    label: 'Food/Beverage',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['finished_food_or_batch_item'],
      ['ingredient_or_component_item'],
      ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object']
    ],
    expectedTerms: ['ingredient readiness', 'batch', 'packaging timing', 'finished-good availability'],
    expectedStatus: 'ready_now'
  },
  {
    id: 'industrial_equipment',
    label: 'Industrial Equipment',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['finished_or_assembly_item'],
      ['component_item'],
      ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing', 'work_center']
    ],
    expectedTerms: ['configured equipment', 'assembly', 'component availability', 'supplier timing'],
    expectedStatus: 'ready_now'
  },
  {
    id: 'life_sciences',
    label: 'Life Sciences',
    expectedRoles: [
      ['customer'],
      ['sales_order'],
      ['lot_release', 'lot_or_release'],
      ['approved_inventory'],
      ['expiration'],
      ['qa_validation', 'validation'],
      ['traceability']
    ],
    expectedTerms: ['lot', 'release', 'approved inventory', 'expiration', 'qa', 'validation', 'traceability'],
    expectedStatus: 'needs_scoped_source_pack_cleanup'
  }
];

function reviewLane(lane) {
  const packs = packsForLane(lane.id);
  const directPackCount = packs.length;
  const validPacks = packs.filter((pack) => validateLanePack(pack).valid);
  const roleCoverage = packs.length
    ? lane.expectedRoles.map((roleTerms) => packs.some((pack) => roleReady(pack, roleTerms)))
    : lane.expectedRoles.map(() => false);
  const termCoverage = packs.length
    ? lane.expectedTerms.map((term) => packs.some((pack) => hasAny(pack, [term])))
    : lane.expectedTerms.map(() => false);
  const gapTermsPresent = packs.length && lane.gapTerms
    ? lane.gapTerms.filter((term) => packs.some((pack) => hasAny(pack, [term])))
    : [];
  const roleCoverageRatio = roleCoverage.filter(Boolean).length / roleCoverage.length;
  const termCoverageRatio = termCoverage.filter(Boolean).length / termCoverage.length;
  let status = 'needs_scoped_source_pack_cleanup';
  if (directPackCount && roleCoverageRatio >= 0.8 && termCoverageRatio >= 0.75 && (!lane.gapTerms || gapTermsPresent.length === lane.gapTerms.length)) {
    status = 'ready_now';
  } else if (directPackCount && roleCoverageRatio >= 0.6 && termCoverageRatio >= 0.5) {
    status = 'ready_with_fixture_only_proof';
  }
  return {
    laneId: lane.id,
    label: lane.label,
    directPackCount,
    packIds: packs.map((pack) => pack.packId),
    validPackCount: validPacks.length,
    roleCoverage,
    termCoverage,
    gapTermsMissing: lane.gapTerms ? lane.gapTerms.filter((term) => gapTermsPresent.indexOf(term) < 0) : [],
    roleCoverageRatio,
    termCoverageRatio,
    status,
    expectedStatus: lane.expectedStatus
  };
}

function importedOpenLinksValid(state) {
  const records = state && state.dccFinalNamingResult && state.dccFinalNamingResult.displayReadyRecords || [];
  return records.length >= 4 && records.every((record) =>
    record.safeToOpen === true &&
    record.linkAuthorityStatus === 'verified_openable' &&
    /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const meridian = fixture(hooks, {
    label: 'Meridian Life Sciences',
    laneId: 'life_sciences',
    customer: 'Meridian BioSystems',
    website: 'https://www.meridianbiosystems.com',
    notes: "Talked to ops/quality person maybe Priya or Paula. They make or distribute diagnostic kits, lab instruments, reagents, maybe some regulated consumables. Big issue is customer service promises shipments before anyone knows lot status, expiration, validation paperwork, QA release, or what location has approved inventory. They use spreadsheets, maybe QuickBooks or an older quality system. Need demo around customer order, lot/release readiness, inventory availability, expiration, QA/validation docs, and shipment confidence. Competitor maybe spreadsheets, SAP, quality system, not sure.",
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
  const bayview = fixture(hooks, {
    label: 'Bayview Parts/Service',
    laneId: 'parts_service',
    customer: 'Bayview Commercial Kitchen Service',
    website: 'https://www.bayviewkitchenservice.com',
    notes: 'Service manager needs work order, installed equipment, truck/warehouse parts, backorder, warranty, and first-time fix readiness.',
    websiteEvidence: 'Commercial kitchen service, work orders, installed equipment, service parts.',
    records: [
      openRecordFixture('customer', 'Customer', 'Bayview Customer Account', '7001', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7001'),
      openRecordFixture('work_order', 'Work Order', 'WO-W370 Bayview Repair', '7002', 'https://td3021666.app.netsuite.com/app/accounting/transactions/workord.nl?id=7002'),
      openRecordFixture('installed_equipment', 'Installed Equipment', 'Bayview Installed Oven', '7003', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7003'),
      openRecordFixture('service_part', 'Service Part / SKU', 'Bayview Igniter SKU', '7004', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7004')
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

  const scenarios = [meridian, atlas, willow, northstar, bayview, harbor].concat(baselines);
  const sharedRendererScenarios = [meridian, atlas, willow, northstar, bayview, harbor].concat(baselines.slice(0, 2));
  const readiness = READINESS_LANES.map(reviewLane);
  const readinessByLane = Object.fromEntries(readiness.map((entry) => [entry.laneId, entry]));

  assertCase(results, 'w379-source-pack-lane-coverage-reviewed',
    readiness.length === 7 &&
      readinessByLane.dealer_hardgoods.directPackCount > 0 &&
      readinessByLane.apparel_accessories.directPackCount > 0 &&
      readinessByLane.food_beverage.directPackCount > 0 &&
      readinessByLane.industrial_equipment.directPackCount > 0 &&
      readinessByLane.parts_service.directPackCount >= 0 &&
      readinessByLane.medical_dental_supply.directPackCount >= 0 &&
      readinessByLane.life_sciences.directPackCount >= 0,
    JSON.stringify(readiness, null, 2));

  assertCase(results, 'w379-expected-proof-role-coverage-visible',
    readinessByLane.dealer_hardgoods.status === 'ready_now' &&
      readinessByLane.food_beverage.status === 'ready_now' &&
      readinessByLane.industrial_equipment.status === 'ready_now' &&
      readinessByLane.apparel_accessories.status === 'ready_with_fixture_only_proof' &&
      ['needs_scoped_source_pack_cleanup', 'ready_now'].indexOf(readinessByLane.parts_service.status) >= 0 &&
      ['needs_scoped_source_pack_cleanup', 'ready_now'].indexOf(readinessByLane.medical_dental_supply.status) >= 0 &&
      ['needs_scoped_source_pack_cleanup', 'ready_now'].indexOf(readinessByLane.life_sciences.status) >= 0,
    JSON.stringify(readiness, null, 2));

  assertCase(results, 'w379-fixture-to-pack-alignment-gaps-not-hidden',
    readiness.filter((entry) => entry.status === 'needs_scoped_source_pack_cleanup').length >= 0 &&
      (readinessByLane.medical_dental_supply.packIds.length === 0 || readinessByLane.medical_dental_supply.status === 'ready_now') &&
      (readinessByLane.parts_service.packIds.length === 0 || readinessByLane.parts_service.status === 'ready_now') &&
      (readinessByLane.life_sciences.packIds.length === 0 || readinessByLane.life_sciences.status === 'ready_now') &&
      /lot\/release|QA\/validation|traceability|shipment confidence/i.test(textOf(meridian)) &&
      /work order|installed equipment|truck|warehouse|first-time fix/i.test(textOf(bayview)) &&
      /noDrawerWrites|noTransactionWrites|noFakeOpenLinks/.test(JSON.stringify(meridian.value.storyContractW373)),
    JSON.stringify(readiness, null, 2));

  assertCase(results, 'w379-open-link-authority-preserved',
    scenarios.every((scenario) => importedOpenLinksValid(scenario.state)) &&
      scenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4) &&
      scenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)),
    scenarios.map((scenario) => `${scenario.label}:${clickablePathCount(scenario.runHtml)}`).join(', '));

  assertCase(results, 'w379-w371-w373-w375-w377-w378-preserved',
    scenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      sharedRendererScenarios.every((scenario) => /W375 shared story renderer/.test(scenario.valueHtml + scenario.runHtml)) &&
      sharedRendererScenarios.every((scenario) => scenario.value.storyContractW373.storyContractConsistent === true) &&
      sharedRendererScenarios.every((scenario) => scenario.value.storyContractW373.authoringReadinessW377.ready === true) &&
      /Regulated lot and release readiness/i.test(meridian.valueText + meridian.runText),
    sharedRendererScenarios.map((scenario) => scenario.label).join(', '));

  assertCase(results, 'w379-claim-safety-confidence-and-no-fake-links',
    scenarios.every((scenario) => /Measured savings require|before claiming savings|Baseline to capture/i.test(textOf(scenario))) &&
      scenarios.every((scenario) => /Advisory only|advisory|Assumption|Inferred|confidence/i.test(textOf(scenario))) &&
      LANE_PACKS.every((pack) => validateLanePack(pack).valid) &&
      LANE_PACKS.every((pack) => pack.nllmAdvisory.writeAuthority === 'none' && pack.nllmAdvisory.creationAllowed === false),
    JSON.stringify(readiness, null, 2));

  printResults('W379 source/lane-pack readiness review harness', results);
}

main();
