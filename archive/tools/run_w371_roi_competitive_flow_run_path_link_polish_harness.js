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
    recordType: /Work Order/i.test(label) ? 'workorder' : /Sales Order/i.test(label) ? 'salesorder' : /Customer/i.test(label) ? 'customer' : 'inventoryitem',
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
    selectedActionId: config.selectedActionId || 'prove',
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
    importedAt: '2026-05-31T14:10:00.000Z',
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
  const report = readArchiveText('reports', 'w371_roi_competitive_flow_run_path_link_polish.md');
  const bayview = scenarioFromState(hooks, bayviewState(hooks), 'Bayview Commercial Kitchen Service');
  const harbor = scenarioFromState(hooks, harborState(hooks), 'Harbor & Finch Outfitters');
  const oldBayviewTrace = readArchiveJson('trace_samples', 'w371_bayview_w369_roi_competitive_review_trace.json');
  const baselines = [
    harbor,
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Powersports & Equipment'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const allScenarios = [bayview].concat(baselines);
  const valueFirst = bayview.valueHtml.slice(0, Math.max(0, bayview.valueHtml.indexOf('idb-competitive-prep-card')));
  const bayviewText = bayview.runText + ' ' + bayview.valueText;

  assertCase(results, 'w371-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.17 / W371' &&
      /@version\s+1\.0\.17/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W371';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w371-review-trace-captured-without-live-smoke',
    oldBayviewTrace.installedDrawerDisplayVersionW346 &&
      oldBayviewTrace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.15 / W369' &&
      /Bayview Commercial Kitchen Service/.test(JSON.stringify(oldBayviewTrace.state && oldBayviewTrace.state.intake || {})) &&
      /No live smoke was run/.test(report),
    JSON.stringify(oldBayviewTrace.installedDrawerDisplayVersionW346));

  assertCase(results, 'w371-roi-competitive-flow-first-readable',
    /idb-w371-roi-competitive-flow/.test(valueFirst) &&
      /Talk track/.test(bayview.valueText) &&
      /Discovery/.test(bayview.valueText) &&
      /Proof move/.test(bayview.valueText) &&
      /Largest value to prove/.test(bayview.valueText) &&
      /Objection handle/.test(bayview.valueText) &&
      /Claim caution/.test(bayview.valueText) &&
      !/idb-w361-value-chip/.test(valueFirst),
    bayview.valueText.slice(0, 2800));

  assertCase(results, 'w371-roi-and-competitive-guidance-specific',
    /Baseline to capture/i.test(bayview.valueText) &&
      /first-time fix|work order|installed equipment|truck|warehouse|warranty|service margin/i.test(bayviewText) &&
      /ServiceTitan|dispatch app|QuickBooks plus spreadsheets|manual parts calls/i.test(bayviewText) &&
      /Advisory only|advisory|Assumption|Inferred/i.test(bayview.valueText + bayview.traceText),
    bayview.valueText.slice(0, 3600));

  assertCase(results, 'w371-run-path-uses-real-clickable-open-links',
    allScenarios.every((scenario) => countClickablePathNodes(scenario.runHtml) >= 4) &&
      allScenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => !/href=""/.test(scenario.runHtml) && !/preview|placeholder/i.test(scenario.runHtml)) &&
      allScenarios.every((scenario) => importedOpenLinksValid(scenario.state)),
    bayview.runHtml.slice(0, 3200));

  assertCase(results, 'w371-run-repetition-reduced-and-presenter-steps-preserved',
    /Use the Say \/ Show \/ Close steps above/.test(bayview.runText) &&
      /Say/.test(bayview.runText) &&
      /Show/.test(bayview.runText) &&
      /Close/.test(bayview.runText) &&
      /Selected script/.test(bayview.runText) &&
      !/ -> /.test(bayview.runText),
    bayview.runText.slice(0, 2400));

  assertCase(results, 'w371-cross-lane-no-regression',
    /Style\/size\/color availability/.test(harbor.runText + harbor.valueText) &&
      /Parts\/service proof path|Work order and service parts readiness/i.test(bayview.runText + bayview.valueText) &&
      baselines.slice(1, 3).every((scenario) => /dealer|channel|Product \/ SKU|Dealer\/channel/i.test(scenario.runText + scenario.valueText)) &&
      baselines.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)),
    harbor.valueText.slice(0, 1600));

  assertCase(results, 'w371-report-passfail-and-smoke-minimizing-note-present',
    /W371: Consultant ROI\/Competitive Flow Redesign/.test(report) &&
      /Pass \/ Fail Table/.test(report) &&
      /Run path clickable Open-link preservation/.test(report) &&
      /Future industry expansion continues fixture-first/.test(report) &&
      /Lock ROI\/Competitive flow redesign/.test(report),
    report.slice(0, 5200));

  printResults('W371 ROI/Competitive flow redesign and Run path link polish harness', results);
}

main();
