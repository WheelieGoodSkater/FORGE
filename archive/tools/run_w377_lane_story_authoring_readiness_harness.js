#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  openRecordFixture,
  printResults,
  readArchiveJson,
  readArchiveText,
  storyFixtureState,
  storyScenarioFromState
} = require('./lib/forge_harness_fixtures');

function fixture(hooks, config) {
  return storyScenarioFromState(hooks, storyFixtureState(hooks, config), config.label);
}

function scenarioFromTrace(hooks, traceFile, label) {
  const trace = readArchiveJson('trace_samples', traceFile);
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
  const w376Report = readArchiveText('reports', 'w376_fifth_fixture_first_industrial_equipment.md');
  const w371Trace = readArchiveJson('trace_samples', 'w371_bayview_w369_roi_competitive_review_trace.json');
  const template = hooks.laneStoryAuthoringTemplateW377();

  const atlas = fixture(hooks, {
    label: 'Atlas Industrial Equipment',
    laneId: 'industrial_equipment',
    customer: 'Atlas Lift Systems',
    website: 'https://www.atlasliftsystems.com',
    notes: 'They build configurable lift systems. Sales promises delivery before components, supplier lead time, build schedule, inspection/testing, and delivery promise are trusted.',
    websiteEvidence: 'Industrial equipment, configured assemblies, hydraulic units, components, supplier lead times, build schedule, inspection/testing, delivery promise.',
    records: [
      openRecordFixture('customer', 'Customer', 'Atlas Lift Systems Customer Account', '7301', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7301'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W377 Atlas Configured Lift Order', '7302', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7302'),
      openRecordFixture('assembly', 'Assembly', 'Atlas Configured Hydraulic Lift Assembly', '7303', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7303'),
      openRecordFixture('component', 'Component / Supplier Lead Time', 'Atlas Hydraulic Component Lead-Time Signal', '7304', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7304'),
      openRecordFixture('inspection_schedule', 'Inspection / Test Schedule', 'Atlas Lift Inspection Readiness Schedule', '7305', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7305')
    ]
  });
  const willow = fixture(hooks, {
    label: 'Willow Food/Beverage',
    laneId: 'food_beverage',
    customer: 'Willow Creek Specialty Foods',
    website: 'https://www.willowcreekspecialtyfoods.com',
    notes: 'Ingredients, labels, jars, case packs, batch timing, QA holds, lot readiness, and ship dates are hard to trust.',
    websiteEvidence: 'Food manufacturer, ingredients, packaging, batch schedule, QA holds, lot readiness.',
    records: [
      openRecordFixture('customer', 'Customer', 'Willow Creek Specialty Foods Customer Account', '7201', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7201'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W374 Willow Creek Seasonal Sauce Promotion', '7202', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7202'),
      openRecordFixture('finished_good', 'Finished Good', 'Willow Creek Roasted Pepper Sauce Finished Good', '7203', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7203'),
      openRecordFixture('ingredient_packaging', 'Ingredient / Packaging Structure', 'Willow Creek Ingredient and Jar Readiness', '7204', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7204')
    ]
  });
  const northstar = fixture(hooks, {
    label: 'Northstar Medical/Dental',
    laneId: 'medical_dental_supply',
    customer: 'Northstar Dental Supply & Equipment',
    website: 'https://www.northstardentalsupply.com',
    notes: 'Clinics ask for dental supply availability, substitutes, backorders, multi-location stock, and warranty-sensitive equipment.',
    websiteEvidence: 'Dental supplies, substitutes, backorder, multi-location stock, equipment warranty.',
    records: [
      openRecordFixture('customer', 'Customer', 'Northstar Dental Supply & Equipment Customer Account', '7101', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7101'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W372 Northstar Clinic Supply Order', '7102', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7102'),
      openRecordFixture('clinic_supply_item', 'Clinic Supply Item', 'Northstar Sterilization Pouch Supply Item', '7103', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7103'),
      openRecordFixture('substitute_product', 'Substitute Product', 'Northstar Approved Substitute Handpiece SKU', '7104', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7104')
    ]
  });
  const harbor = fixture(hooks, {
    label: 'Harbor Apparel/Retail',
    laneId: 'apparel_accessories',
    customer: 'Harbor & Finch Outfitters',
    website: 'https://www.harborfinchoutfitters.com',
    notes: 'They sell apparel and bags. Size/color availability, ecommerce promise, store transfer, replenishment, and margin exposure are the issue.',
    websiteEvidence: 'Apparel, style, size, color, ecommerce, seasonal assortment, transfers.',
    records: [
      openRecordFixture('customer', 'Customer', 'Harbor & Finch Outfitters Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
      openRecordFixture('sales_order', 'Sales Order', 'SO-W369 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
      openRecordFixture('style_sku', 'Style SKU', 'Harbor Field Jacket Style SKU', '6903', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6903'),
      openRecordFixture('style_matrix', 'Style Matrix', 'Harbor Size Color Matrix', '6904', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6904')
    ]
  });
  const baselines = [
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const allScenarios = [atlas, willow, northstar, harbor].concat(baselines);
  const activeStoryScenarios = [atlas, willow, northstar, harbor].concat(baselines.slice(0, 2));

  assertCase(results, 'w377-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.23 / W377' &&
      /@version\s+1\.0\.23/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W377';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w377-authoring-template-complete',
    template.schema === 'idb.w377-lane-story-authoring-template.v1' &&
      ['proofLabel', 'pathFlow', 'riskPressure', 'valueDecision', 'proofMove', 'safeClaim', 'competitorPressure', 'netsuiteContrast', 'antiLeakTerms', 'noRegression'].every((field) => template.requiredFields.includes(field)) &&
      template.requiredNoRegressionFlags.includes('sourceLanePacksMutated') &&
      /Open-link authority checks change/.test(template.liveSmokeRequiredWhen.join(' ')),
    JSON.stringify(template));

  assertCase(results, 'w377-authoring-readiness-for-active-stories',
    activeStoryScenarios.every((scenario) => scenario.value.storyContractW373.authoringReadinessW377 && scenario.value.storyContractW373.authoringReadinessW377.ready === true),
    JSON.stringify(activeStoryScenarios.map((scenario) => ({ label: scenario.label, readiness: scenario.value.storyContractW373.authoringReadinessW377 }))));

  assertCase(results, 'w377-shared-fixture-utility-proven',
    /function storyFixtureState/.test(readArchiveText('tools', 'lib/forge_harness_fixtures.js')) &&
      /function openRecordFixture/.test(readArchiveText('tools', 'lib/forge_harness_fixtures.js')) &&
      activeStoryScenarios.slice(0, 4).every((scenario) => importedOpenLinksValid(scenario.state)) &&
      activeStoryScenarios.slice(0, 4).every((scenario) => /W375 shared story renderer/.test(scenario.valueHtml + scenario.runHtml)),
    atlas.runHtml.slice(0, 2400));

  assertCase(results, 'w377-first-read-distinctness-preserved',
    /configured|assembly|component|supplier lead|inspection|delivery promise/i.test(firstReadText(atlas)) &&
      /ingredient|packaging|batch|QA|lot|ship/i.test(firstReadText(willow)) &&
      /clinic|dental|substitute|multi-location|warranty/i.test(firstReadText(northstar)) &&
      /style|size|color|ecommerce|transfer|margin/i.test(firstReadText(harbor)) &&
      /dealer|channel|allocation|supplier lead-time/i.test(firstReadText(baselines[0]) + firstReadText(baselines[1])),
    firstReadText(atlas).slice(0, 2200));

  assertCase(results, 'w377-w371-w373-w375-behavior-preserved',
    allScenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      allScenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4) &&
      activeStoryScenarios.every((scenario) => scenario.value.storyContractW373.storyContractConsistent === true) &&
      /fixture-first|No live smoke was run/i.test(w376Report),
    atlas.runHtml.slice(0, 2600));

  assertCase(results, 'w377-claim-safety-confidence-and-review-trace',
    /Baseline to capture/i.test(atlas.valueText) &&
      /Measured savings require|before claiming savings/i.test(atlas.valueText + atlas.runText) &&
      /Advisory only|advisory|Assumption|Inferred/i.test(atlas.valueText + atlas.traceText) &&
      /1\.0\.15|W369|Bayview Commercial Kitchen Service/i.test(JSON.stringify(w371Trace).slice(0, 8000)) &&
      /noDrawerWrites|noTransactionWrites|noFakeOpenLinks/.test(JSON.stringify(atlas.value.storyContractW373)),
    atlas.traceText.slice(0, 2200));

  printResults('W377 lane story authoring readiness and fixture utility hardening harness', results);
}

main();
