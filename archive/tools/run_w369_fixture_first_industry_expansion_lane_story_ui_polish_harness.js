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
    recordType: /Sales Order/i.test(label) ? 'salesorder' : /Customer/i.test(label) ? 'customer' : 'inventoryitem',
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

function harborState(hooks) {
  const state = Object.assign(hooks.defaultState(), {
    open: true,
    selectedLaneId: 'apparel_accessories',
    laneSelectionSource: 'fixture_story_layer_w369',
    selectedMoveIndex: 2,
    selectedActionId: 'prove',
    briefPrepared: true,
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
  const records = [
    openRecord('customer', 'Customer', 'Harbor & Finch Outfitters Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
    openRecord('sales_order', 'Sales Order', 'SO-W369 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
    openRecord('style_sku', 'Style SKU', 'Harbor & Finch Seasonal Field Jacket Style SKU', '6903', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6903'),
    openRecord('style_matrix_or_availability_flow', 'Style Matrix', 'Harbor & Finch Size / Color Availability Matrix', '6904', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6904'),
    openRecord('supporting_style_or_color_sku', 'Supporting Style / Color SKU', 'Harbor & Finch Navy Medium Variant Support SKU', '6905', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6905')
  ];
  state.dccFinalNamingResult = {
    schema: 'idb.dcc-final-naming-result.v1',
    status: 'dcc_final_names_imported',
    displayStatus: 'Final generated names imported',
    importedAt: '2026-05-31T12:10:00.000Z',
    source: 'fixture_w369_no_live_smoke',
    finalNamesImported: true,
    runStatus: 'completed',
    prospect: 'Harbor & Finch Outfitters Customer Account',
    scenario: 'Style / SKU Matrix',
    familyKey: 'apparel_accessories',
    generated: { extId: '', agenda: '' },
    displayObjects: records.slice(0, 4),
    componentItems: records.slice(4),
    locationPlanningRecords: [],
    displayReadyRecords: records,
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

function scenarioFromState(hooks, state, label) {
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const action = { id: state.selectedActionId || 'prove', label: 'Prove' };
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Style / SKU Matrix', action, '');
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
  const report = readArchiveText('reports', 'w369_fixture_first_industry_expansion_lane_story_ui_polish.md');
  const harbor = scenarioFromState(hooks, harborState(hooks), 'Harbor & Finch Outfitters');
  const baselines = [
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Powersports & Equipment'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];

  assertCase(results, 'w369-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.15 / W369' &&
      /@version\s+1\.0\.15/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W369';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w369-apparel-fixture-story-layer-active',
    harbor.lane.id === 'apparel_accessories' &&
      harbor.value.apparelRetailPolishW369 &&
      harbor.value.apparelRetailPolishW369.active === true &&
      harbor.value.apparelRetailPolishW369.noRegression.storyLayerOnly === true &&
      /Style\/size\/color availability/.test(harbor.runText + harbor.valueText),
    JSON.stringify(harbor.value.apparelRetailPolishW369));

  assertCase(results, 'w369-apparel-story-is-distinct-and-no-dealer-leak',
      /style|size|color|seasonal|store|ecommerce|margin|transfer/i.test(harbor.runText + harbor.valueText) &&
      /Shopify inventory apps|PLM tools|Lightspeed|ecommerce inventory apps|QuickBooks plus spreadsheets/i.test(harbor.valueText) &&
      !/dealer allocation|supplier portals|channel fulfillment/i.test(harbor.runText + harbor.valueText) &&
      !/dealer\/channel proof path/i.test(harbor.runText + harbor.valueText),
    (harbor.runText + harbor.valueText).slice(0, 3200));

  assertCase(results, 'w369-run-and-value-cockpit-still-polished',
    [harbor].concat(baselines).every((scenario) => /idb-w361-path-step/.test(scenario.runHtml) &&
      /Live controls/.test(scenario.runText) &&
      /Say/.test(scenario.runText) &&
      /Show/.test(scenario.runText) &&
      /Close/.test(scenario.runText) &&
      /Selected script/.test(scenario.runText) &&
      /Live value answer/.test(scenario.valueText) &&
      /Competitive pressure/.test(scenario.valueText) &&
      !/ -> /.test(scenario.runText)),
    harbor.runText.slice(0, 2600));

  assertCase(results, 'w369-open-link-confidence-and-no-write-boundaries',
    importedOpenLinksValid(harbor.state) &&
      baselines.every((scenario) => importedOpenLinksValid(scenario.state)) &&
      /Open/.test(harbor.runText + harbor.traceText) &&
      /Website read|Public read/i.test(harbor.runText + harbor.traceText) &&
      /Advisory only|advisory/i.test(harbor.runText + harbor.valueText + harbor.traceText) &&
      /noTransactionWrites|no drawer transaction write paths|No new drawer transaction write paths/i.test(JSON.stringify(harbor.value.apparelRetailPolishW369) + report),
    harbor.traceText.slice(0, 1600));

  assertCase(results, 'w369-report-and-expansion-checklist-present',
    /W369: Fixture-First Industry Expansion/.test(report) &&
      /Harbor & Finch Outfitters/.test(report) &&
      /No live smoke was run/.test(report) &&
      /Smoke-Minimizing Expansion Checklist/.test(report) &&
      /Lock fixture-first Apparel\/Retail story/.test(report),
    report.slice(0, 5200));

  printResults('W369 fixture-first industry expansion and lane-story UI polish harness', results);
}

main();
