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

function dealerFixtureFromTrace(hooks, traceFile, customer) {
  const trace = readArchiveJson('trace_samples', traceFile);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  state.selectedLaneId = 'dealer_hardgoods';
  state.laneSelectionSource = 'fixture_story_layer_w365';
  state.selectedActionId = 'prove';
  state.intake = Object.assign({}, state.intake || {}, {
    customer,
    website: state.intake && state.intake.website || '',
    notes: 'Dealer channel teams need one trusted view of SKU availability, allocation position, supplier lead-time changes, replenishment timing, and channel fulfillment confidence before making dealer promises.',
    scObjective: 'Prove dealer/channel availability and replenishment confidence using the current imported NetSuite proof record spine.',
    decisionCriteria: 'The consultant can show allocation, supplier lead-time pressure, replenishment timing, and channel promise risk without claiming new record creation or fake proof.'
  });
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const competitive = hooks.competitiveAdvisoryModelW362(state, lane, value);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Product / SKU', { id: 'prove', label: 'Prove' }, '');
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  return {
    trace,
    state,
    lane,
    page,
    recommendation,
    value,
    competitive,
    polish: hooks.dealerHardgoodsStoryPolishW365(state, lane, value),
    runText: stripTags(runHtml),
    valueText: stripTags(valueHtml),
    traceText: stripTags(traceHtml)
  };
}

function importedOpenLinksValid(state) {
  const finalResult = state && state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  return finalResult.finalNamesImported === true &&
    records.length >= 5 &&
    records.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable');
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w365_dealer_hardgoods_fixture_only_lane_polish.md');
  const fixtures = [
    dealerFixtureFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar Dealer Fixture'),
    dealerFixtureFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal Dealer Fixture'),
    dealerFixtureFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC Dealer Fixture')
  ];

  assertCase(results, 'w365-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.12 / W365' &&
      /@version\s+1\.0\.12/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W365';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w365-dealer-polish-is-fixture-only-story-layer',
    fixtures.every((fixture) => fixture.polish.active === true &&
      fixture.polish.laneMode === 'fixture_only_story_layer' &&
      fixture.polish.noRegression.storyLayerOnly === true &&
      fixture.polish.noRegression.noDrawerWrites === true &&
      fixture.polish.noRegression.completedResultValidationUnchanged === true),
    JSON.stringify(fixtures.map((fixture) => fixture.polish)));

  assertCase(results, 'w365-dealer-run-copy-is-distinct-from-generic-distribution',
    fixtures.every((fixture) => /Dealer\/channel proof path/.test(fixture.runText) &&
      /allocation/i.test(fixture.runText) &&
      /supplier lead-time/i.test(fixture.runText) &&
      /channel fulfillment/i.test(fixture.runText)),
    fixtures[0].runText.slice(0, 2600));

  assertCase(results, 'w365-value-and-competitive-copy-uses-dealer-channel-pressure',
    fixtures.every((fixture) => /Dealer\/channel lens/.test(fixture.valueText) &&
      /allocation gaps/i.test(fixture.valueText) &&
      /supplier lead-time/i.test(fixture.valueText) &&
      /dealer portals|supplier portals|allocation spreadsheets/i.test(fixture.valueText) &&
      /Advisory prep only|N\/LLM advisory/i.test(fixture.valueText)),
    fixtures[1].valueText.slice(0, 2800));

  assertCase(results, 'w365-imported-proof-spine-and-open-link-authority-preserved',
    fixtures.every((fixture) => importedOpenLinksValid(fixture.state) &&
      /Use imported records|Imported NetSuite proof records|Open links verified/i.test(fixture.runText + fixture.traceText)),
    JSON.stringify(fixtures.map((fixture) => ({
      customer: fixture.state.intake.customer,
      imported: fixture.state.dccFinalNamingResult && fixture.state.dccFinalNamingResult.finalNamesImported,
      recordCount: fixture.state.dccFinalNamingResult && fixture.state.dccFinalNamingResult.displayReadyRecords && fixture.state.dccFinalNamingResult.displayReadyRecords.length
    }))));

  assertCase(results, 'w365-w361-w362-w363-surfaces-still-hold',
    fixtures.every((fixture) => /NetSuite path/.test(fixture.runText) &&
      /Live controls/.test(fixture.runText) &&
      /Competitive cue/.test(fixture.runText) &&
      /Competitive lens/.test(fixture.valueText) &&
      /Operator evidence/.test(fixture.traceText) &&
      /Evidence details and markers/.test(fixture.traceText) &&
      !/Current installed block:|Previous drawer marker:/.test(fixture.traceText)),
    fixtures[2].traceText.slice(0, 2200));

  assertCase(results, 'w365-report-keeps-live-smoke-deferred-until-fixture-proof',
    /Do not run live smoke/.test(report) &&
      /fixture-only/.test(report) &&
      /story layer/.test(report) &&
      /Run one targeted live dealer\/channel smoke only/.test(report),
    report.slice(0, 4200));

  assertCase(results, 'w365-package-registration-present',
    /harness:dealer-hardgoods-fixture-only-lane-polish-w365/.test(readArchiveText('..', 'package.json')) &&
      /run_w365_dealer_hardgoods_fixture_only_lane_polish_harness\.js/.test(readArchiveText('..', 'package.json')),
    'package.json W365 script registration');

  printResults('W365 dealer hardgoods fixture-only lane polish harness', results);
}

main();
