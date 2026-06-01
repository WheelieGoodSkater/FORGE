#!/usr/bin/env node

const { assertCase, loadHooks, printResults, readArchiveJson, readArchiveText } = require('./lib/forge_harness_fixtures');

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
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
    recordType: /Sales Order/i.test(label) ? 'salesorder' : /Customer/i.test(label) ? 'customer' : /Assembly/i.test(label) ? 'assemblyitem' : /Schedule|Inspection|Test/i.test(label) ? 'customrecord' : 'inventoryitem',
    url,
    supportedOpenUrl: url,
    source: 'dcc_final',
    linkAuthorityStatus: 'verified_openable',
    sourceConfidence: 'verified_open_link',
    normalConsultantVisible: true,
    safeToOpen: true,
    linkAuthority: { status: 'verified_openable', openable: true, url }
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
    importedAt: '2026-06-01T16:00:00.000Z',
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
    noRegression: { importOnly: true, noIdbWrites: true, noSuiteScriptInvocationFromIdb: true, noTransactionWritesFromIdb: true }
  };
  hooks.reconcileStateAuthority(state);
  return state;
}

function atlasState(hooks) {
  return fixtureState(hooks, {
    laneId: 'industrial_equipment',
    source: 'fixture_story_layer_w376_no_live_smoke',
    prospect: 'Atlas Lift Systems Customer Account',
    scenario: 'Configured Equipment Assembly Readiness',
    intake: {
      customer: 'Atlas Lift Systems',
      website: 'https://www.atlasliftsystems.com',
      notes: "Talked to operations or engineering person maybe Martin. They build custom lift tables, conveyors, hydraulic units, maybe configurable equipment. Sales keeps promising delivery before anyone confirms components, supplier lead times, build schedule, or inspection/testing. They use QuickBooks maybe spreadsheets and engineering BOMs. Need demo around customer order, configured assembly, component availability, supplier lead time, build schedule, inspection/test readiness, and delivery promise. Competitor maybe Odoo, Dynamics, spreadsheets, not sure.",
      websiteEvidence: 'Fixture website/category evidence: industrial equipment manufacturer, custom lift systems, configured assemblies, hydraulic units, components, supplier lead times, build schedule, inspection/testing, and delivery promise.',
      scObjective: 'Prepare a fixture-first Industrial Equipment Manufacturing demo story around configured assembly readiness, components, supplier timing, build schedule, inspection/test readiness, and delivery confidence.',
      decisionCriteria: 'Show customer configuration demand, assembly item, component availability, supplier lead time, build schedule, inspection or test readiness, and delivery promise without dealer, apparel, service, clinic, or food production wording.',
      competitor: '',
      timelineUrgency: ''
    },
    records: [
      openRecord('customer', 'Customer', 'Atlas Lift Systems Customer Account', '7301', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7301'),
      openRecord('sales_order', 'Sales Order', 'SO-W376 Atlas Configured Lift Order', '7302', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7302'),
      openRecord('assembly', 'Assembly', 'Atlas Configured Hydraulic Lift Assembly', '7303', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7303'),
      openRecord('component', 'Component / Supplier Lead Time', 'Atlas Hydraulic Component Supplier Lead-Time Signal', '7304', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7304'),
      openRecord('inspection_schedule', 'Inspection / Test Schedule', 'Atlas Lift Inspection and Test Readiness Schedule', '7305', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7305')
    ]
  });
}

function simpleFixture(hooks, laneId, customer, notes, websiteEvidence, records) {
  return fixtureState(hooks, {
    laneId,
    source: 'fixture_story_layer_w376_regression_no_live_smoke',
    prospect: `${customer} Customer Account`,
    scenario: laneId,
    intake: { customer, website: `https://www.${customer.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`, notes, websiteEvidence, scObjective: `Regression fixture for ${laneId}.`, decisionCriteria: `Keep ${laneId} distinct.`, competitor: '' },
    records
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
  return { label, state, lane, value, runHtml, valueHtml, traceHtml, runText: stripTags(runHtml), valueText: stripTags(valueHtml), traceText: stripTags(traceHtml) };
}

function scenarioFromTrace(hooks, traceFile, label) {
  const trace = readArchiveJson('trace_samples', traceFile);
  return scenarioFromState(hooks, Object.assign(hooks.defaultState(), trace.state || {}), label);
}

function firstReadText(scenario) {
  const valueStop = scenario.valueText.indexOf('Competitive prep detail');
  const runStop = scenario.runText.indexOf('Proof guardrails and evidence receipt');
  return [scenario.valueText.slice(0, valueStop > 0 ? valueStop : 3600), scenario.runText.slice(0, runStop > 0 ? runStop : 4200)].join(' ');
}

function importedOpenLinksValid(state) {
  const records = state && state.dccFinalNamingResult && state.dccFinalNamingResult.displayReadyRecords || [];
  return records.length >= 4 && records.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable' && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function clickablePathCount(html) {
  return (String(html || '').match(/idb-w371-path-clickable/g) || []).length;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const w375Report = readArchiveText('reports', 'w375_cross_lane_story_helper_consolidation.md');
  const atlas = scenarioFromState(hooks, atlasState(hooks), 'Atlas Industrial Equipment');
  const willow = scenarioFromState(hooks, simpleFixture(hooks, 'food_beverage', 'Willow Creek Specialty Foods', 'They make sauces and gift packs. Ingredients, jars, labels, batch timing, QA holds, and ship dates are hard to trust.', 'Food manufacturer, ingredients, packaging, batch schedule, QA holds, lot readiness.', [
    openRecord('customer', 'Customer', 'Willow Creek Specialty Foods Customer Account', '7201', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7201'),
    openRecord('sales_order', 'Sales Order', 'SO-W374 Willow Creek Seasonal Sauce Promotion', '7202', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7202'),
    openRecord('finished_good', 'Finished Good', 'Willow Creek Roasted Pepper Sauce Finished Good', '7203', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7203'),
    openRecord('ingredient_packaging', 'Ingredient / Packaging Structure', 'Willow Creek Ingredient and Jar Packaging Readiness', '7204', 'https://td3021666.app.netsuite.com/app/common/custom/custrecordentry.nl?id=7204')
  ]), 'Willow Food/Beverage');
  const northstar = scenarioFromState(hooks, simpleFixture(hooks, 'medical_dental_supply', 'Northstar Dental Supply & Equipment', 'Clinics ask for dental supply availability, substitutes, backorders, multi-location stock, and warranty-sensitive equipment.', 'Dental supplies, substitutes, backorder, multi-location stock, equipment warranty.', [
    openRecord('customer', 'Customer', 'Northstar Dental Supply & Equipment Customer Account', '7101', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=7101'),
    openRecord('sales_order', 'Sales Order', 'SO-W372 Northstar Clinic Supply Order', '7102', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=7102'),
    openRecord('clinic_supply_item', 'Clinic Supply Item', 'Northstar Sterilization Pouch Supply Item', '7103', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7103'),
    openRecord('substitute_product', 'Substitute Product', 'Northstar Approved Substitute Handpiece SKU', '7104', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=7104')
  ]), 'Northstar Medical/Dental');
  const harbor = scenarioFromState(hooks, simpleFixture(hooks, 'apparel_accessories', 'Harbor & Finch Outfitters', 'They sell apparel and bags. Size color availability, ecommerce promise, store transfer, replenishment, and margin exposure are the issue.', 'Apparel, style, size, color, ecommerce, seasonal assortment, transfers.', [
    openRecord('customer', 'Customer', 'Harbor & Finch Outfitters Customer Account', '6901', 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6901'),
    openRecord('sales_order', 'Sales Order', 'SO-W369 Harbor Style Availability', '6902', 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6902'),
    openRecord('style_sku', 'Style SKU', 'Harbor Field Jacket Style SKU', '6903', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6903'),
    openRecord('style_matrix', 'Style Matrix', 'Harbor Size Color Matrix', '6904', 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6904')
  ]), 'Harbor Apparel/Retail');
  const baselines = [
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Dealer Hardgoods'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const allScenarios = [atlas, willow, northstar, harbor].concat(baselines);
  const activeStoryScenarios = [atlas, willow, northstar, harbor].concat(baselines.slice(0, 2));
  const atlasFirstRead = firstReadText(atlas);

  assertCase(results, 'w376-current-drawer-marker-advanced', hooks.drawerDisplayVersionW346() === 'Drawer 1.0.22 / W376' && /@version\s+1\.0\.22/.test(userscript) && userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W376';"), hooks.drawerDisplayVersionW346());

  assertCase(results, 'w376-industrial-equipment-story-layer-active', atlas.lane.id === 'industrial_equipment' && atlas.value.industrialEquipmentPolishW376 && atlas.value.industrialEquipmentPolishW376.active === true && atlas.value.storyContractW373.sourceSchema === 'idb.w376-industrial-equipment-story-polish.v1' && /Configured equipment assembly readiness/.test(atlas.valueText + atlas.runText), JSON.stringify(atlas.value.industrialEquipmentPolishW376));

  assertCase(results, 'w376-w375-shared-renderer-preserved', activeStoryScenarios.every((scenario) => /W375 shared story renderer/.test(scenario.valueHtml + scenario.runHtml)) && /Industrial equipment lens/.test(atlas.valueText) && /Industrial equipment proof path/.test(atlas.runText), atlas.valueHtml.slice(0, 2600));

  assertCase(results, 'w376-story-contract-consistency', activeStoryScenarios.every((scenario) => {
    const contract = scenario.value.storyContractW373;
    return contract && contract.active === true && contract.storyContractConsistent === true && contract.missingFields.length === 0 && contract.noRegression && contract.noRegression.sourceLanePacksMutated === false && contract.noRegression.noFakeOpenLinks === true;
  }), JSON.stringify(activeStoryScenarios.map((scenario) => ({ label: scenario.label, contract: scenario.value.storyContractW373 }))));

  assertCase(results, 'w376-industrial-equipment-distinctness', /configured|assembly|component|supplier lead|build schedule|inspection|test readiness|delivery promise/i.test(atlasFirstRead) && /Odoo|Microsoft Dynamics|engineering BOM|supplier status/i.test(atlasFirstRead) && !/dealer allocation|style\/color\/size|store\/ecommerce|first-time fix|clinic supply|dental distributor|ingredient batch|QA hold|finished-good production/i.test(atlasFirstRead), atlasFirstRead.slice(0, 4200));

  assertCase(results, 'w376-cross-lane-anti-leak-wording', !/configured equipment|component availability|inspection\/test|engineering BOM/i.test(firstReadText(willow) + firstReadText(northstar) + firstReadText(harbor)) && !/clinic supply|style\/color\/size|dealer allocation|first-time fix|QA hold/i.test(atlasFirstRead), atlasFirstRead.slice(0, 2200));

  assertCase(results, 'w376-w371-roi-and-run-open-link-preserved', allScenarios.every((scenario) => /idb-w371-roi-competitive-flow/.test(scenario.valueHtml)) && allScenarios.every((scenario) => clickablePathCount(scenario.runHtml) >= 4) && allScenarios.every((scenario) => /idb-w371-open-badge/.test(scenario.runHtml)) && allScenarios.every((scenario) => importedOpenLinksValid(scenario.state)), atlas.runHtml.slice(0, 3200));

  assertCase(results, 'w376-claim-safety-confidence-and-no-smoke', /Baseline to capture/i.test(atlas.valueText) && /Measured savings require|before claiming savings/i.test(atlas.valueText + atlas.runText) && /Advisory only|advisory|Assumption|Inferred/i.test(atlas.valueText + atlas.traceText) && /fixture-first|No live smoke was run/i.test(w375Report) && /noDrawerWrites|noTransactionWrites|noFakeOpenLinks/.test(JSON.stringify(atlas.value.storyContractW373)), atlas.traceText.slice(0, 2200));

  printResults('W376 fifth fixture-first Industrial Equipment lane and expansion status harness', results);
}

main();
