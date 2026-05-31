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

function detailsClosedByDefault(html, summaryText) {
  const pattern = new RegExp(`<details[^>]*>\\s*<summary>${summaryText}`, 'i');
  return pattern.test(String(html || ''));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w367_consultant_cockpit_density_run_polish.md');
  const scenarios = [
    scenarioFromTrace(hooks, 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json', 'Summit Outdoor Supply'),
    scenarioFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json', 'Graybar'),
    scenarioFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json', 'Fastenal'),
    scenarioFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json', 'MSC')
  ];
  const summit = scenarios[0];

  assertCase(results, 'w367-current-drawer-marker-advanced',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.13 / W367' &&
      /@version\s+1\.0\.13/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W367';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w367-value-top-is-decision-cockpit',
    scenarios.every((scenario) => /Live value answer/.test(scenario.valueText) &&
      /Next move/.test(scenario.valueText) &&
      /NetSuite answer/.test(scenario.valueText) &&
      /ROI answer/.test(scenario.valueText) &&
      /Caution/.test(scenario.valueText) &&
      /Competitive pressure/.test(scenario.valueText)) &&
      /idb-w367-value-decision-card/.test(summit.valueHtml),
    summit.valueText.slice(0, 1600));

  assertCase(results, 'w367-value-supporting-detail-collapsed-by-default',
    scenarios.every((scenario) =>
      detailsClosedByDefault(scenario.valueHtml, 'Talk track, discovery, and proof moves') &&
      detailsClosedByDefault(scenario.valueHtml, 'Competitive lens and prep') &&
      !/<details[^>]*open[^>]*>\s*<summary>Talk track, discovery, and proof moves/i.test(scenario.valueHtml) &&
      !/<details[^>]*open[^>]*>\s*<summary>Competitive lens and prep/i.test(scenario.valueHtml)),
    summit.valueHtml.slice(0, 3200));

  assertCase(results, 'w367-run-path-professional-and-presenter-steps-active',
    scenarios.every((scenario) => /NetSuite path/.test(scenario.runText) &&
      /Open the imported records in order/.test(scenario.runText) &&
      /Live controls/.test(scenario.runText) &&
      /Say/.test(scenario.runText) &&
      /Show/.test(scenario.runText) &&
      /Close/.test(scenario.runText) &&
      /Selected script/.test(scenario.runText)) &&
      /idb-w367-presenter-steps/.test(summit.runHtml) &&
      /grid-template-columns: repeat\(auto-fit, minmax\(126px, 1fr\)\)/.test(userscript),
    summit.runText.slice(0, 2400));

  assertCase(results, 'w367-proof-records-and-open-links-preserved-collapsed',
    scenarios.every((scenario) => importedOpenLinksValid(scenario.state) &&
      detailsClosedByDefault(scenario.runHtml, 'Use imported proof records \\([0-9]+\\)') &&
      /idb-inline-link[^>]+href="https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(scenario.runHtml) &&
      />Open<\/a>/.test(scenario.runHtml)),
    JSON.stringify(scenarios.map((scenario) => ({
      label: scenario.label,
      imported: scenario.state.dccFinalNamingResult && scenario.state.dccFinalNamingResult.finalNamesImported,
      records: scenario.state.dccFinalNamingResult && scenario.state.dccFinalNamingResult.displayReadyRecords && scenario.state.dccFinalNamingResult.displayReadyRecords.length
    }))));

  assertCase(results, 'w367-claim-safety-and-confidence-separation-preserved',
    scenarios.every((scenario) => /Advisory only|advisory/i.test(scenario.runText + scenario.valueText + scenario.traceText) &&
      /Website read|Public read/i.test(scenario.runText + scenario.traceText) &&
      /Open links verified|Open record/i.test(scenario.runText + scenario.traceText) &&
      !/fake Open/i.test(scenario.runText + scenario.valueText)),
    summit.traceText.slice(0, 1600));

  assertCase(results, 'w367-no-regression-gates-report-complete',
    /Pass \/ Fail Gates/.test(report) &&
      /Value density/.test(report) &&
      /Run professionalism/.test(report) &&
      /Claim safety/.test(report) &&
      /Open-link preservation/.test(report) &&
      /Confidence separation/.test(report) &&
      /No-regression gates/.test(report) &&
      /Lock Dealer Hardgoods for one broader live smoke/.test(report),
    report.slice(0, 4200));

  printResults('W367 consultant cockpit density and Run polish harness', results);
}

main();
