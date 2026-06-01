#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  openRecordFixture,
  printResults,
  readArchiveJson,
  storyFixtureState,
  storyScenarioFromState,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function fixture(hooks, config) {
  return storyScenarioFromState(hooks, storyFixtureState(hooks, config), config.label);
}

function traceScenario(hooks, file, label) {
  const trace = readArchiveJson('trace_samples', file);
  return storyScenarioFromState(hooks, Object.assign(hooks.defaultState(), trace.state || {}), label);
}

function firstReadText(scenario) {
  const valueStop = scenario.valueText.indexOf('Competitive prep detail');
  const runStop = scenario.runText.indexOf('Proof guardrails and evidence receipt');
  return [
    scenario.valueText.slice(0, valueStop > 0 ? valueStop : 3600),
    scenario.runText.slice(0, runStop > 0 ? runStop : 4200)
  ].join(' ');
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const w371Trace = readArchiveJson('trace_samples', 'w371_bayview_w369_roi_competitive_review_trace.json');
  const meridian = fixture(hooks, {
    label: 'Meridian Life Sciences',
    laneId: 'life_sciences',
    customer: 'Meridian BioSystems',
    website: 'https://www.meridianbiosystems.com',
    notes: "Talked to ops/quality person maybe Priya or Paula. They make or distribute diagnostic kits, lab instruments, reagents, maybe some regulated consumables. Big issue is customer service promises shipments before anyone knows lot status, expiration, validation paperwork, QA release, or what location has approved inventory. They use spreadsheets, maybe QuickBooks or an older quality system. Need demo around customer order, lot/release readiness, inventory availability, expiration, QA/validation docs, and shipment confidence. Competitor maybe spreadsheets, SAP, quality system, not sure.",
    websiteEvidence: 'Fixture website/category evidence: diagnostic kits, lab instruments, reagents, regulated consumables, lot status, expiration, validation paperwork, QA release, approved inventory, traceability, and shipment confidence.',
    scObjective: 'Prepare a fixture-first Life Sciences regulated supply and release demo story.',
    decisionCriteria: 'Show regulated order demand, lot/release readiness, approved inventory, expiration risk, QA/validation documentation, traceability, and shipment confidence without dealer, apparel, service, clinic, food, or equipment wording.',
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
  const allScenarios = [meridian, atlas, willow, northstar, bayview, harbor].concat(baselines);
  const activeStoryScenarios = [meridian, atlas, willow, northstar, bayview, harbor].concat(baselines.slice(0, 2));
  const meridianFirst = firstReadText(meridian);

  assertCase(results, 'w378-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.24 / W378' &&
      /@version\s+1\.0\.24/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W378';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w378-life-sciences-story-active-and-ready',
    meridian.lane.id === 'life_sciences' &&
      meridian.value.lifeSciencesPolishW378 &&
      meridian.value.lifeSciencesPolishW378.active === true &&
      meridian.value.storyContractW373.authoringReadinessW377.ready === true &&
      /Regulated lot and release readiness/.test(meridian.valueText + meridian.runText),
    JSON.stringify(meridian.value.storyContractW373));

  assertCase(results, 'w378-life-sciences-distinctness',
    /regulated|lot\/release|approved inventory|expiration|QA\/validation|traceability|shipment confidence/i.test(meridianFirst) &&
      /SAP|quality management system|LIMS|manual QA release/i.test(meridianFirst) &&
      !/dealer allocation|style\/color\/size|store\/ecommerce|technician truck stock|first-time fix|clinic supply substitutes|food batch|configured equipment assembly|engineering BOM/i.test(meridianFirst),
    meridianFirst.slice(0, 4200));

  assertCase(results, 'w378-w375-w377-framework-preserved',
    activeStoryScenarios.every((scenario) => /W375 shared story renderer/.test(scenario.valueHtml + scenario.runHtml)) &&
      activeStoryScenarios.every((scenario) => scenario.value.storyContractW373.storyContractConsistent === true) &&
      activeStoryScenarios.every((scenario) => scenario.value.storyContractW373.authoringReadinessW377.ready === true),
    JSON.stringify(activeStoryScenarios.map((scenario) => ({ label: scenario.label, readiness: scenario.value.storyContractW373.authoringReadinessW377 }))));

  assertCase(results, 'w378-cross-lane-anti-leak-wording',
    !/regulated lot|lot\/release|QA\/validation|traceability|LIMS/i.test(firstReadText(atlas) + firstReadText(willow) + firstReadText(northstar) + firstReadText(bayview) + firstReadText(harbor)) &&
      !/dealer allocation|style\/color\/size|first-time fix|clinic supply|configured equipment|ingredient batch/i.test(meridianFirst),
    meridianFirst.slice(0, 3000));

  assertCase(results, 'w378-w371-run-open-link-and-claim-safety',
    allScenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      allScenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4) &&
      allScenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => importedOpenLinksValid(scenario.state)) &&
      /Baseline to capture/i.test(meridian.valueText) &&
      /Measured savings require|before claiming savings/i.test(meridian.valueText + meridian.runText),
    meridian.runHtml.slice(0, 3200));

  assertCase(results, 'w378-confidence-separation-and-review-evidence',
    /Advisory only|advisory|Assumption|Inferred/i.test(meridian.valueText + meridian.traceText) &&
      /noDrawerWrites|noTransactionWrites|noFakeOpenLinks/.test(JSON.stringify(meridian.value.storyContractW373)) &&
      /1\.0\.15|W369|Bayview Commercial Kitchen Service/i.test(JSON.stringify(w371Trace).slice(0, 8000)),
    meridian.traceText.slice(0, 2400));

  printResults('W378 Life Sciences fixture-first final pre-pack-readiness harness', results);
}

main();
