#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function stripTags(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function openRecord(role, label, name, id, url) {
  return {
    schema: 'idb.w245-display-ready-record.v1',
    role,
    canonicalRole: role,
    consultantLabel: label,
    label,
    name,
    recordName: name,
    id,
    internalId: id,
    recordType: /Sales Order/i.test(label) ? 'salesorder' : /Customer/i.test(label) ? 'customer' : /Warranty|Equipment/i.test(label) ? 'customrecord' : 'inventoryitem',
    url,
    supportedOpenUrl: url,
    source: 'dcc_final',
    linkAuthorityStatus: 'verified_openable',
    sourceConfidence: 'verified_open_link',
    normalConsultantVisible: true,
    safeToOpen: true,
    linkAuthority: {
      status: 'verified_openable',
      openable: true,
      url
    }
  };
}

function fixtureState(hooks, config) {
  const state = Object.assign(hooks.defaultState(), {
    open: true,
    selectedLaneId: config.laneId,
    laneSelectionSource: config.source,
    selectedMoveIndex: 2,
    selectedActionId: 'prove',
    briefPrepared: true,
    intake: config.intake,
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  });
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext);
  state.acceptedPacket = hooks.buildAcceptedPacketContext(state, lane, state.pageContext, recommendation);
  state.dccFinalNamingResult = {
    schema: 'idb.dcc-final-naming-result.v1',
    status: 'dcc_final_names_imported',
    displayStatus: 'Final generated names imported',
    importedAt: '2026-05-31T15:00:00.000Z',
    source: config.source,
    finalNamesImported: true,
    runStatus: 'completed',
    prospect: config.prospect,
    scenario: config.scenario,
    familyKey: config.laneId,
    generated: { extId: '', agenda: '' },
    displayObjects: config.records.slice(0, 4),
    componentItems: config.records.slice(4),
    locationPlanningRecords: [],
    displayReadyRecords: config.records,
    warnings: [],
    errors: [],
    recoverableBlockers: [],
    noRegression: {
      importOnly: true,
      noIdbWrites: true,
      noSuiteScriptInvocationFromIdb: true,
      noTransactionWritesFromIdb: true
    }
  };
  hooks.reconcileStateAuthority(state);
  return state;
}

function northstarState(hooks) {
  return fixtureState(hooks, {
    laneId: 'medical_dental_supply',
    source: 'fixture_story_layer_w372_no_live_smoke',
    prospect: 'Northstar Dental Supply & Equipment Customer Account',
    scenario: 'Clinic Supply Availability',
    intake: {
      customer: 'Northstar Dental Supply & Equipment',
      website: 'https://www.northstardentalsupply.com',
      notes: "Talked to office ops person maybe Melanie or Melissa. They sell dental supplies, chairs, sterilization stuff, handpieces, small equipment, maybe service too. Main issue is clinics ask for product availability and they don't know what is in stock, what is backordered, or what can ship from which location. Some items have compliance or warranty info but I didn't get details. They use QuickBooks maybe, spreadsheets, maybe ecommerce orders. Need demo around customer order, item availability, substitute product, equipment/warranty info, and replenishment. Competitor maybe Shopify, QuickBooks, dental distributor portal, not sure.",
      websiteEvidence: 'Fixture website/category evidence: dental supplies, clinic equipment, sterilization supplies, handpieces, chairs, substitute products, multi-location stock, backorder, replenishment, equipment history, warranty, and compliance-sensitive items.',
      scObjective: 'Prepare a fixture-first Medical/Dental Supply demo story around clinic supply availability, substitutes, equipment/warranty context, replenishment, and backorder risk.',
      competitor: '',
      decisionCriteria: 'Show customer order demand, clinic supply item availability, substitute products, multi-location stock, backorder/replenishment action, and equipment/warranty context without dealer, apparel, or field-service dispatch language.',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Northstar Dental Supply & Equipment Customer Account', '7101', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7101'),
      openRecord('sales_order', 'Sales Order', 'SO-W372 Northstar Clinic Supply Order', '7102', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7102'),
      openRecord('clinic_supply_item', 'Clinic Supply Item', 'Northstar Sterilization Pouch Supply Item', '7103', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7103'),
      openRecord('substitute_product', 'Substitute Product', 'Northstar Approved Substitute Handpiece SKU', '7104', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7104'),
      openRecord('equipment_warranty_context', 'Equipment / Warranty Context', 'Northstar Chair Warranty Context', '7105', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7105')
    ]
  });
}

function bayviewState(hooks) {
  return fixtureState(hooks, {
    laneId: 'parts_service',
    source: 'fixture_story_layer_w371_no_live_smoke',
    prospect: 'Bayview Commercial Kitchen Service Customer Account',
    scenario: 'Work Order / Parts Availability',
    intake: {
      customer: 'Bayview Commercial Kitchen Service',
      website: 'https://www.bayviewkitchenservice.com',
      notes: "Talked to service manager maybe Rick or Rich. They repair restaurant equipment, ovens, refrigeration, dish machines, maybe sell parts too. Big problem is techs show up without the right parts or nobody knows if parts are in the truck, warehouse, or on order. They use spreadsheets, QuickBooks maybe, some dispatch app maybe ServiceTitan but not sure. They care about first-time fix, warranty, emergency calls, backordered parts, and not losing time calling around. Need demo to show customer equipment history, work order, parts availability, maybe replenishment or purchasing. I did not get exact systems.",
      websiteEvidence: 'Fixture website/category evidence: commercial kitchen service, equipment repair, service parts, emergency calls, warranty support, installed equipment history, work orders, truck stock, warehouse parts, backordered parts, and purchasing.',
      scObjective: 'Prepare a fixture-first Parts & Service demo story around work order readiness, installed equipment, parts availability, warranty, and first-time fix risk.',
      competitor: '',
      decisionCriteria: 'Show customer equipment history, work order demand, truck or warehouse parts availability, backorder/purchasing action, warranty exposure, and service margin without dealer or apparel language.',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Bayview Commercial Kitchen Service Customer Account', '7001', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7001'),
      openRecord('work_order', 'Work Order', 'WO-W371 Bayview Emergency Oven Repair', '7002', 'https://td3021666.app.netsuite.com/app/accounting/transactions/workord.nl?id=7002'),
      openRecord('installed_equipment', 'Installed Equipment', 'Bayview Customer Oven Installed Equipment', '7003', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7003'),
      openRecord('service_part_sku', 'Service Part / SKU', 'Bayview Oven Igniter Service Part SKU', '7004', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7004'),
      openRecord('parts_availability', 'Truck / Warehouse Availability', 'Bayview Truck and Warehouse Parts Availability', '7005', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7005')
    ]
  });
}

function harborState(hooks) {
  return fixtureState(hooks, {
    laneId: 'apparel_accessories',
    source: 'fixture_story_layer_w369_no_live_smoke',
    prospect: 'Harbor & Finch Outfitters Customer Account',
    scenario: 'Style / SKU Matrix',
    intake: {
      customer: 'Harbor & Finch Outfitters',
      website: 'https://www.harborfinchoutfitters.com',
      notes: "Met with retail ops person, maybe Dana. They sell apparel, bags, outdoor lifestyle stuff, some seasonal items and online orders. Main issue sounded like they don't know what sizes/colors are actually available across store and ecommerce, and they keep making promises then finding out inventory is wrong. Lots of spreadsheets and Shopify reports maybe. They care about margin, stockouts, transfers, and not disappointing customers. Need a demo around item availability, variants, maybe replenishment. I didn't get exact systems. Could be Shopify plus spreadsheets, maybe Lightspeed, maybe QuickBooks.",
      websiteEvidence: 'Fixture website/category evidence: apparel, bags, seasonal collections, store and ecommerce orders, size/color variants, replenishment, transfers, and retail availability.',
      scObjective: 'Prepare a fixture-first Apparel & Accessories demo story around style/size/color availability and store/ecommerce promise.',
      competitor: '',
      decisionCriteria: 'Show style/SKU matrix fit, size/color availability, replenishment timing, transfer risk, and margin exposure without dealer/channel language.',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Harbor & Finch Outfitters Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
      openRecord('sales_order', 'Sales Order', 'SO-W369 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
      openRecord('style_sku', 'Style SKU', 'Harbor & Finch Seasonal Field Jacket Style SKU', '6903', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6903'),
      openRecord('style_matrix_or_availability_flow', 'Style Matrix', 'Harbor & Finch Size / Color Availability Matrix', '6904', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6904'),
      openRecord('supporting_style_or_color_sku', 'Supporting Style / Color SKU', 'Harbor & Finch Navy Medium Variant Support SKU', '6905', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6905')
    ]
  });
}

function scenarioFromState(hooks, state, label) {
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const action = { id: state.selectedActionId || 'prove', label: 'Prove' };
  const selectedMove = lane.moves[state.selectedMoveIndex] || lane.moves[0];
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, selectedMove, action, '');
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  return {
    label,
    state,
    lane,
    value,
    runHtml,
    valueHtml,
    traceHtml,
    runText: stripTags(runHtml),
    valueText: stripTags(valueHtml),
    traceText: stripTags(traceHtml)
  };
}

function scenarioFromTrace(hooks, traceFile, label) {
  const trace = readArchiveJson('trace_samples', traceFile);
  return scenarioFromState(hooks, Object.assign(hooks.defaultState(), trace.state || {}), label);
}

function importedOpenLinksValid(state) {
  const finalResult = state && state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  return finalResult.finalNamesImported === true &&
    records.length >= 5 &&
    records.every((record) => record.safeToOpen === true &&
      record.linkAuthorityStatus === 'verified_openable' &&
      /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function countClickablePathNodes(html) {
  return (String(html || '').match(/class="idb-w361-path-node idb-w371-path-open idb-w371-path-clickable"/g) || []).length;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w372_third_fixture_first_medical_dental_roi_run_regression_lock.md');
  const northstar = scenarioFromState(hooks, northstarState(hooks), 'Northstar Dental Supply & Equipment');
  const bayview = scenarioFromState(hooks, bayviewState(hooks), 'Bayview Commercial Kitchen Service');
  const harbor = scenarioFromState(hooks, harborState(hooks), 'Harbor & Finch Outfitters');
  const baselines = [
    bayview,
    harbor,
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Powersports & Equipment'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const allScenarios = [northstar].concat(baselines);
  const northstarText = northstar.runText + ' ' + northstar.valueText;
  const northstarFirstRead = [
    northstar.valueText.slice(0, Math.max(0, northstar.valueText.indexOf('Competitive prep detail')) || 3600),
    northstar.runText.slice(0, Math.max(0, northstar.runText.indexOf('Proof guardrails and evidence receipt')) || 4200)
  ].join(' ');

  assertCase(results, 'w372-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.18 / W372' &&
      /@version\s+1\.0\.18/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W372';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w372-medical-dental-fixture-story-layer-active',
    northstar.lane.id === 'medical_dental_supply' &&
      northstar.value.medicalDentalPolishW372 &&
      northstar.value.medicalDentalPolishW372.active === true &&
      northstar.value.medicalDentalPolishW372.noRegression.storyLayerOnly === true &&
      /Clinic supply availability/.test(northstarText),
    JSON.stringify(northstar.value.medicalDentalPolishW372));

  assertCase(results, 'w372-medical-dental-story-is-distinct-and-no-leak',
    /clinic|dental|sterilization|handpiece|substitute|multi-location|backorder|replenishment|equipment|warranty/i.test(northstarFirstRead) &&
      /dental distributor portal|QuickBooks plus spreadsheets|Shopify ecommerce reports|manual substitute checks/i.test(northstarFirstRead) &&
      !/dealer allocation|supplier portals|channel fulfillment|dealer\/channel proof path/i.test(northstarFirstRead) &&
      !/style\/color\/size variants|seasonal assortment|store\/ecommerce promise|Apparel\/retail proof path/i.test(northstarFirstRead) &&
      !/work order dispatch|technician truck stock|first-time fix|Parts\/service proof path/i.test(northstarFirstRead),
    northstarFirstRead.slice(0, 5200));

  assertCase(results, 'w372-w371-roi-competitive-flow-preserved',
    allScenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      /Talk track/.test(northstar.valueText) &&
      /Discovery/.test(northstar.valueText) &&
      /Proof move/.test(northstar.valueText) &&
      /Largest value to prove/.test(northstar.valueText) &&
      /Objection handle/.test(northstar.valueText) &&
      /Claim caution/.test(northstar.valueText),
    northstar.valueText.slice(0, 3200));

  assertCase(results, 'w372-run-clickable-path-and-open-link-authority-preserved',
    allScenarios.every((scenario) => countClickablePathNodes(scenario.runHtml) >= 4) &&
      allScenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => !/href=""/.test(scenario.runHtml) && !/preview|placeholder/i.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => importedOpenLinksValid(scenario.state)),
    northstar.runHtml.slice(0, 3600));

  assertCase(results, 'w372-claim-safety-confidence-and-no-regression',
    /Baseline to capture/i.test(northstar.valueText) &&
      /Measured savings require|before claiming savings/i.test(northstar.valueText + northstar.runText) &&
      /Advisory only|advisory|Assumption|Inferred/i.test(northstar.valueText + northstar.traceText) &&
      /noTransactionWrites|sourceLanePacksMutated/.test(JSON.stringify(northstar.value.medicalDentalPolishW372) + report),
    northstar.traceText.slice(0, 2200));

  assertCase(results, 'w372-cross-lane-baselines-remain-distinct',
    bayview.value.partsServicePolishW370 && bayview.value.partsServicePolishW370.active === true &&
      harbor.value.apparelRetailPolishW369 && harbor.value.apparelRetailPolishW369.active === true &&
      baselines.slice(2, 4).every((scenario) => scenario.value.dealerHardgoodsPolishW365 && scenario.value.dealerHardgoodsPolishW365.active === true) &&
      baselines.every((scenario) => !scenario.value.medicalDentalPolishW372 || scenario.value.medicalDentalPolishW372.active === false),
    JSON.stringify({
      bayviewParts: bayview.value.partsServicePolishW370 && bayview.value.partsServicePolishW370.active,
      harborApparel: harbor.value.apparelRetailPolishW369 && harbor.value.apparelRetailPolishW369.active,
      dealerBaselines: baselines.slice(2, 4).map((scenario) => scenario.value.dealerHardgoodsPolishW365 && scenario.value.dealerHardgoodsPolishW365.active),
      medicalInBaselines: baselines.map((scenario) => scenario.value.medicalDentalPolishW372 && scenario.value.medicalDentalPolishW372.active)
    }));

  assertCase(results, 'w372-report-checklist-v3-present',
    /W372: Fixture-First Third Industry Lane/.test(report) &&
      /Northstar Dental Supply & Equipment/.test(report) &&
      /No live smoke was run/.test(report) &&
      /Smoke-Minimizing Expansion Checklist v3/.test(report) &&
      /Lock Medical\/Dental fixture-first story/.test(report),
    report.slice(0, 5200));

  printResults('W372 fixture-first Medical/Dental lane and ROI/Run regression lock harness', results);
}

main();
