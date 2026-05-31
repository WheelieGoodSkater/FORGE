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

function scenarioFromTrace(hooks, traceFile, label) {
  const trace = readArchiveJson('trace_samples', traceFile);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  state.selectedActionId = state.selectedActionId || 'prove';
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const action = { id: state.selectedActionId, label: state.selectedActionId === 'close_value' ? 'Close value' : 'Prove' };
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Product / SKU', action, '');
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  return {
    label,
    trace,
    state,
    lane,
    runHtml,
    valueHtml,
    traceHtml,
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
    records.every((record) => record.safeToOpen === true &&
      record.linkAuthorityStatus === 'verified_openable' &&
      /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w368_final_dealer_hardgoods_live_smoke_expansion_handoff.md');
  const scenarios = [
    scenarioFromTrace(hooks, 'w368_ridgeline_powersports_final_dealer_hardgoods_live_smoke_trace.json', 'RidgeLine Powersports & Equipment'),
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const ridgeLine = scenarios[0];

  assertCase(results, 'w368-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.14 / W368' &&
      /@version\s+1\.0\.14/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W368';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w368-ridgeline-live-smoke-evidence-imported',
    ridgeLine.state.intake.customer === 'RidgeLine Powersports & Equipment' &&
      ridgeLine.state.intake.website === 'https://www.ridgelinepowersports.com' &&
      /Talked to ops guy maybe Jason or Justin/.test(ridgeLine.state.intake.notes || '') &&
      ridgeLine.lane.id === 'dealer_hardgoods' &&
      importedOpenLinksValid(ridgeLine.state),
    JSON.stringify({
      customer: ridgeLine.state.intake.customer,
      website: ridgeLine.state.intake.website,
      lane: ridgeLine.lane.id,
      records: ridgeLine.state.dccFinalNamingResult && ridgeLine.state.dccFinalNamingResult.displayReadyRecords && ridgeLine.state.dccFinalNamingResult.displayReadyRecords.length
    }));

  assertCase(results, 'w368-run-path-is-visual-flow-not-ascii-arrows',
    scenarios.every((scenario) => /idb-w361-path-step/.test(scenario.runHtml) &&
      /idb-w361-path-flow/.test(scenario.runHtml) &&
      /Customer/.test(scenario.runText) &&
      /Sales Order/.test(scenario.runText) &&
      /Product SKU/.test(scenario.runText) &&
      !/ -> /.test(scenario.runText)) &&
      /idb-w361-path-flow::before/.test(userscript) &&
      !/content:\s*">"/.test(userscript) &&
      !/pathFlow\.join\(' -> '\)/.test(userscript),
    ridgeLine.runText.slice(0, 2200));

  assertCase(results, 'w368-value-and-run-density-gates-hold',
    scenarios.every((scenario) => /Live value answer/.test(scenario.valueText) &&
      /Competitive pressure/.test(scenario.valueText) &&
      /Live controls/.test(scenario.runText) &&
      /Say/.test(scenario.runText) &&
      /Show/.test(scenario.runText) &&
      /Close/.test(scenario.runText) &&
      /Selected script/.test(scenario.runText)),
    ridgeLine.valueText.slice(0, 1600));

  assertCase(results, 'w368-open-link-confidence-and-claim-safety-preserved',
    scenarios.every((scenario) => importedOpenLinksValid(scenario.state) &&
      /Open/.test(scenario.runText + scenario.traceText) &&
      /Website read|Public read/i.test(scenario.runText + scenario.traceText) &&
      /Advisory only|advisory/i.test(scenario.runText + scenario.valueText + scenario.traceText) &&
      !/fake Open/i.test(scenario.runText + scenario.valueText)),
    ridgeLine.traceText.slice(0, 1800));

  assertCase(results, 'w368-smoke-minimizing-expansion-handoff-present',
    /Smoke-Minimizing Expansion Handoff/.test(report) &&
      /Fixture-first is enough/.test(report) &&
      /Live smoke is required only/.test(report) &&
      /No additional live smoke is recommended/.test(report) &&
      /Move into industry expansion/.test(report),
    report.slice(0, 5200));

  printResults('W368 final Dealer Hardgoods live smoke and expansion handoff harness', results);
}

main();
