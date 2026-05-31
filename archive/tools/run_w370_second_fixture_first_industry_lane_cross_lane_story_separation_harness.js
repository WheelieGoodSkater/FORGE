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
    recordType: /Work Order/i.test(label) ? 'workorder' : /Customer/i.test(label) ? 'customer' : 'inventoryitem',
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
    importedAt: '2026-05-31T13:20:00.000Z',
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

function bayviewState(hooks) {
  return fixtureState(hooks, {
    laneId: 'parts_service',
    source: 'fixture_story_layer_w370_no_live_smoke',
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
      openRecord('work_order', 'Work Order', 'WO-W370 Bayview Emergency Oven Repair', '7002', 'https://td3021666.app.netsuite.com/app/accounting/transactions/workord.nl?id=7002'),
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w370_second_fixture_first_industry_lane_cross_lane_story_separation.md');
  const bayview = scenarioFromState(hooks, bayviewState(hooks), 'Bayview Commercial Kitchen Service');
  const harbor = scenarioFromState(hooks, harborState(hooks), 'Harbor & Finch Outfitters');
  const baselines = [
    harbor,
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Powersports & Equipment'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const bayviewText = bayview.runText + ' ' + bayview.valueText;

  assertCase(results, 'w370-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.16 / W370' &&
      /@version\s+1\.0\.16/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W370';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w370-parts-service-fixture-story-layer-active',
    bayview.lane.id === 'parts_service' &&
      bayview.value.partsServicePolishW370 &&
      bayview.value.partsServicePolishW370.active === true &&
      bayview.value.partsServicePolishW370.noRegression.storyLayerOnly === true &&
      /Work order and service parts readiness/.test(bayviewText),
    JSON.stringify(bayview.value.partsServicePolishW370));

  assertCase(results, 'w370-parts-service-story-is-distinct',
    /work order|installed equipment|technician|truck|warehouse|first-time fix|warranty|backorder|service margin/i.test(bayviewText) &&
      /ServiceTitan|dispatch apps|QuickBooks plus spreadsheets|truck stock spreadsheets|manual parts calls/i.test(bayviewText) &&
      !/dealer allocation|supplier portals|channel fulfillment|dealer\/channel proof path/i.test(bayviewText) &&
      !/style\/color\/size variants|seasonal assortment|store\/ecommerce promise|Apparel\/retail proof path/i.test(bayviewText),
    bayviewText.slice(0, 4200));

  assertCase(results, 'w370-cross-lane-baselines-remain-separated',
    /Style\/size\/color availability/.test(harbor.runText + harbor.valueText) &&
      !/work order and service parts readiness|first-time fix|truck stock|installed equipment/i.test(harbor.runText + harbor.valueText) &&
      baselines.slice(1, 3).every((scenario) => /dealer|channel|Product \/ SKU|Dealer\/channel/i.test(scenario.runText + scenario.valueText)) &&
      !/style\/color\/size variants|store\/ecommerce promise|first-time fix/i.test(baselines.slice(1, 3).map((scenario) => scenario.runText + scenario.valueText).join(' ')),
    harbor.valueText.slice(0, 1600));

  assertCase(results, 'w370-run-and-value-cockpit-still-polished',
    [bayview].concat(baselines).every((scenario) => /idb-w361-path-step/.test(scenario.runHtml) &&
      /Live controls/.test(scenario.runText) &&
      /Say/.test(scenario.runText) &&
      /Show/.test(scenario.runText) &&
      /Close/.test(scenario.runText) &&
      /Selected script/.test(scenario.runText) &&
      /Live value answer/.test(scenario.valueText) &&
      /Competitive pressure/.test(scenario.valueText) &&
      !/ -> /.test(scenario.runText)),
    bayview.runText.slice(0, 2600));

  assertCase(results, 'w370-open-link-confidence-and-no-write-boundaries',
    importedOpenLinksValid(bayview.state) &&
      importedOpenLinksValid(harbor.state) &&
      baselines.slice(1).every((scenario) => importedOpenLinksValid(scenario.state)) &&
      /Open/.test(bayview.runText + bayview.traceText) &&
      /Website read|Public read/i.test(bayview.runText + bayview.traceText) &&
      /Advisory only|advisory/i.test(bayview.runText + bayview.valueText + bayview.traceText) &&
      /noTransactionWrites|No new drawer transaction write paths|sourceLanePacksMutated: false/i.test(JSON.stringify(bayview.value.partsServicePolishW370) + report),
    bayview.traceText.slice(0, 1600));

  assertCase(results, 'w370-report-and-expansion-checklist-v2-present',
    /W370: Second Fixture-First Industry Lane/.test(report) &&
      /Bayview Commercial Kitchen Service/.test(report) &&
      /No live smoke was run/.test(report) &&
      /Smoke-Minimizing Expansion Checklist v2/.test(report) &&
      /Lock Parts\/Service fixture-first story/.test(report),
    report.slice(0, 5200));

  printResults('W370 second fixture-first industry lane and cross-lane story separation harness', results);
}

main();
