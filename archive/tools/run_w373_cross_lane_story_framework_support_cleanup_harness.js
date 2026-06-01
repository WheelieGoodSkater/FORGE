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
    recordType: /Sales Order/i.test(label) ? 'salesorder' : /Customer/i.test(label) ? 'customer' : /Work Order/i.test(label) ? 'workorder' : /Context|Flow|Matrix/i.test(label) ? 'customrecord' : 'inventoryitem',
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
    importedAt: '2026-06-01T12:00:00.000Z',
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
    source: 'fixture_story_layer_w373_no_live_smoke',
    prospect: 'Northstar Dental Supply & Equipment Customer Account',
    scenario: 'Clinic Supply Availability',
    intake: {
      customer: 'Northstar Dental Supply & Equipment',
      website: 'https://www.northstardentalsupply.com',
      notes: "Talked to office ops person maybe Melanie or Melissa. They sell dental supplies, chairs, sterilization stuff, handpieces, small equipment, maybe service too. Main issue is clinics ask for product availability and they don't know what is in stock, what is backordered, or what can ship from which location. Some items have compliance or warranty info but I didn't get details. They use QuickBooks maybe, spreadsheets, maybe ecommerce orders. Need demo around customer order, item availability, substitute product, equipment/warranty info, and replenishment. Competitor maybe Shopify, QuickBooks, dental distributor portal, not sure.",
      websiteEvidence: 'Fixture website/category evidence: dental supplies, clinic equipment, sterilization supplies, handpieces, chairs, substitute products, multi-location stock, backorder, replenishment, equipment history, warranty, and compliance-sensitive items.',
      scObjective: 'Prepare a fixture-first Medical/Dental Supply demo story around clinic supply availability, substitutes, equipment/warranty context, replenishment, and backorder risk.',
      decisionCriteria: 'Show customer order demand, clinic supply item availability, substitute products, multi-location stock, backorder/replenishment action, and equipment/warranty context without dealer, apparel, or field-service dispatch language.',
      competitor: '',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Northstar Dental Supply & Equipment Customer Account', '7101', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7101'),
      openRecord('sales_order', 'Sales Order', 'SO-W373 Northstar Clinic Supply Order', '7102', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7102'),
      openRecord('clinic_supply_item', 'Clinic Supply Item', 'Northstar Sterilization Pouch Supply Item', '7103', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7103'),
      openRecord('substitute_product', 'Substitute Product', 'Northstar Approved Substitute Handpiece SKU', '7104', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7104'),
      openRecord('equipment_warranty_context', 'Equipment / Warranty Context', 'Northstar Chair Warranty Context', '7105', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7105')
    ]
  });
}

function bayviewState(hooks) {
  return fixtureState(hooks, {
    laneId: 'parts_service',
    source: 'fixture_story_layer_w373_no_live_smoke',
    prospect: 'Bayview Commercial Kitchen Service Customer Account',
    scenario: 'Work Order / Parts Availability',
    intake: {
      customer: 'Bayview Commercial Kitchen Service',
      website: 'https://www.bayviewkitchenservice.com',
      notes: "Talked to service manager maybe Rick or Rich. They repair restaurant equipment, ovens, refrigeration, dish machines, maybe sell parts too. Big problem is techs show up without the right parts or nobody knows if parts are in the truck, warehouse, or on order. They use spreadsheets, QuickBooks maybe, some dispatch app maybe ServiceTitan but not sure. They care about first-time fix, warranty, emergency calls, backordered parts, and not losing time calling around. Need demo to show customer equipment history, work order, parts availability, maybe replenishment or purchasing. I did not get exact systems.",
      websiteEvidence: 'Fixture website/category evidence: commercial kitchen service, equipment repair, service parts, emergency calls, warranty support, installed equipment history, work orders, truck stock, warehouse parts, backordered parts, and purchasing.',
      scObjective: 'Prepare a fixture-first Parts & Service demo story around work order readiness, installed equipment, parts availability, warranty, and first-time fix risk.',
      decisionCriteria: 'Show customer equipment history, work order demand, truck or warehouse parts availability, backorder/purchasing action, warranty exposure, and service margin without dealer or apparel language.',
      competitor: '',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Bayview Commercial Kitchen Service Customer Account', '7001', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7001'),
      openRecord('work_order', 'Work Order', 'WO-W373 Bayview Emergency Oven Repair', '7002', 'https://td3021666.app.netsuite.com/app/accounting/transactions/workord.nl?id=7002'),
      openRecord('installed_equipment', 'Installed Equipment', 'Bayview Customer Oven Installed Equipment', '7003', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7003'),
      openRecord('service_part_sku', 'Service Part / SKU', 'Bayview Oven Igniter Service Part SKU', '7004', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7004'),
      openRecord('parts_availability', 'Truck / Warehouse Availability', 'Bayview Truck and Warehouse Parts Availability', '7005', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7005')
    ]
  });
}

function harborState(hooks) {
  return fixtureState(hooks, {
    laneId: 'apparel_accessories',
    source: 'fixture_story_layer_w373_no_live_smoke',
    prospect: 'Harbor & Finch Outfitters Customer Account',
    scenario: 'Style / SKU Matrix',
    intake: {
      customer: 'Harbor & Finch Outfitters',
      website: 'https://www.harborfinchoutfitters.com',
      notes: "Met with retail ops person, maybe Dana. They sell apparel, bags, outdoor lifestyle stuff, some seasonal items and online orders. Main issue sounded like they don't know what sizes/colors are actually available across store and ecommerce, and they keep making promises then finding out inventory is wrong. Lots of spreadsheets and Shopify reports maybe. They care about margin, stockouts, transfers, and not disappointing customers. Need a demo around item availability, variants, maybe replenishment. I didn't get exact systems. Could be Shopify plus spreadsheets, maybe Lightspeed, maybe QuickBooks.",
      websiteEvidence: 'Fixture website/category evidence: apparel, bags, seasonal collections, store and ecommerce orders, size/color variants, replenishment, transfers, and retail availability.',
      scObjective: 'Prepare a fixture-first Apparel & Accessories demo story around style/size/color availability and store/ecommerce promise.',
      decisionCriteria: 'Show style/SKU matrix fit, size/color availability, replenishment timing, transfer risk, and margin exposure without dealer/channel language.',
      competitor: '',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Harbor & Finch Outfitters Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
      openRecord('sales_order', 'Sales Order', 'SO-W373 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
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
  const records = state && state.dccFinalNamingResult && state.dccFinalNamingResult.displayReadyRecords || [];
  return records.length >= 4 && records.every((record) =>
    record.safeToOpen === true &&
    record.linkAuthorityStatus === 'verified_openable' &&
    /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function clickablePathCount(html) {
  return (String(html || '').match(/idb-w371-path-clickable/g) || []).length;
}

function collapsedSupportText(scenario) {
  const runStart = scenario.runText.indexOf('Proof guardrails and evidence receipt');
  const valueStart = scenario.valueText.indexOf('Details: value evidence, proof stack, and claim guard');
  return [
    runStart >= 0 ? scenario.runText.slice(runStart) : scenario.runText,
    valueStart >= 0 ? scenario.valueText.slice(valueStart) : scenario.valueText
  ].join(' ');
}

function firstReadText(scenario) {
  const valueStop = scenario.valueText.indexOf('Competitive prep detail');
  const runStop = scenario.runText.indexOf('Proof guardrails and evidence receipt');
  return [
    scenario.valueText.slice(0, valueStop > 0 ? valueStop : 3600),
    scenario.runText.slice(0, runStop > 0 ? runStop : 4200)
  ].join(' ');
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const w371Trace = readArchiveJson('trace_samples', 'w371_bayview_w369_roi_competitive_review_trace.json');
  const northstar = scenarioFromState(hooks, northstarState(hooks), 'Northstar Medical/Dental');
  const bayview = scenarioFromState(hooks, bayviewState(hooks), 'Bayview Parts/Service');
  const harbor = scenarioFromState(hooks, harborState(hooks), 'Harbor Apparel/Retail');
  const baselines = [
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const allScenarios = [northstar, bayview, harbor].concat(baselines);
  const fixtureScenarios = [northstar, bayview, harbor].concat(baselines.slice(0, 2));
  const requiredContractFields = ['proofLabel', 'pathFlow', 'riskPressure', 'valueDecision', 'proofMove', 'safeClaim', 'competitorPressure', 'netsuiteContrast'];
  const northstarFirstRead = firstReadText(northstar);
  const northstarSupport = collapsedSupportText(northstar);

  assertCase(results, 'w373-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.19 / W373' &&
      /@version\s+1\.0\.19/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W373';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w373-story-contract-consistent-for-active-lanes',
    fixtureScenarios.every((scenario) => {
      const contract = scenario.value.storyContractW373;
      return contract &&
        contract.active === true &&
        contract.storyContractConsistent === true &&
        contract.missingFields.length === 0 &&
        requiredContractFields.every((field) => Array.isArray(contract[field]) ? contract[field].length > 0 : Boolean(contract[field])) &&
        contract.noRegression &&
        contract.noRegression.collapsedSupportCleanupOnly === true &&
        contract.noRegression.sourceLanePacksMutated === false;
    }),
    JSON.stringify(fixtureScenarios.map((scenario) => ({
      label: scenario.label,
      contract: scenario.value.storyContractW373
    }))));

  assertCase(results, 'w373-first-read-lanes-remain-distinct',
    /clinic|dental|sterilization|handpiece|substitute|multi-location|backorder|warranty/i.test(northstarFirstRead) &&
      /work order|truck|warehouse|first-time fix|warranty|service margin/i.test(firstReadText(bayview)) &&
      /style|size|color|seasonal|store|ecommerce|transfer|margin/i.test(firstReadText(harbor)) &&
      /dealer|channel|allocation|supplier lead-time|replenishment/i.test(firstReadText(baselines[0]) + firstReadText(baselines[1])),
    northstarFirstRead.slice(0, 3600));

  assertCase(results, 'w373-collapsed-support-lane-consistent-for-medical-dental',
    /Lane-consistent support/.test(northstar.runText) &&
      /Clinic supply availability/.test(northstarSupport) &&
      !/Industrial Distributor|production routing|ingredient batch|fashion collection|dealer allocation|style\/color\/size variants|work order dispatch|technician truck stock|first-time fix/i.test(northstarSupport),
    northstarSupport.slice(0, 5200));

  assertCase(results, 'w373-cross-lane-anti-leak-wording-held',
    !/dealer allocation|supplier portals|channel fulfillment/i.test(firstReadText(bayview)) &&
      !/style\/color\/size variants|seasonal assortment|store\/ecommerce promise|clinic supply/i.test(firstReadText(bayview)) &&
      !/service dispatch|first-time fix|truck stock|dealer allocation|clinic supply/i.test(firstReadText(harbor)) &&
      !/style\/color\/size variants|work order dispatch|technician truck stock|first-time fix/i.test(northstarFirstRead) &&
      !/style\/color\/size|clinic supply|first-time fix|technician truck stock/i.test(firstReadText(baselines[0]) + firstReadText(baselines[1])),
    JSON.stringify({
      bayview: firstReadText(bayview).slice(0, 1200),
      harbor: firstReadText(harbor).slice(0, 1200),
      dealer: firstReadText(baselines[0]).slice(0, 1200)
    }));

  assertCase(results, 'w373-w371-roi-competitive-flow-preserved',
    allScenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) &&
      allScenarios.every((scenario) => /Talk track/.test(scenario.valueText) && /Discovery/.test(scenario.valueText) && /Proof move/.test(scenario.valueText) && /Largest value to prove/.test(scenario.valueText) && /Objection handle/.test(scenario.valueText) && /Claim caution/.test(scenario.valueText)),
    northstar.valueText.slice(0, 3200));

  assertCase(results, 'w373-w371-run-clickable-open-link-preserved',
    allScenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4) &&
      allScenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => !/href=""/.test(scenario.runHtml) && !/preview|placeholder/i.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => importedOpenLinksValid(scenario.state)),
    northstar.runHtml.slice(0, 3600));

  assertCase(results, 'w373-claim-safety-confidence-and-authority-separation',
    /Baseline to capture/i.test(northstar.valueText) &&
      /Measured savings require|before claiming savings/i.test(northstar.valueText + northstar.runText) &&
      /Advisory only|advisory|Assumption|Inferred/i.test(northstar.valueText + northstar.traceText) &&
      /verified_openable|Open links verified|Open/.test(northstar.traceText + northstar.runText) &&
      /noDrawerWrites|noTransactionWrites|noFakeOpenLinks/.test(JSON.stringify(northstar.value.storyContractW373)),
    northstar.traceText.slice(0, 2200));

  assertCase(results, 'w373-w371-review-trace-used-as-ux-regression-evidence',
    /1\.0\.15|W369|Bayview Commercial Kitchen Service/i.test(JSON.stringify(w371Trace).slice(0, 8000)) &&
      /crossLaneStoryPolishContractW373/.test(userscript) &&
      /collapsedSupportCleanupOnly/.test(userscript),
    JSON.stringify(w371Trace).slice(0, 1200));

  printResults('W373 cross-lane story framework and collapsed support cleanup harness', results);
}

main();
