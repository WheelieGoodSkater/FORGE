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

function contextFromTrace(hooks, traceFile) {
  const trace = readArchiveJson('trace_samples', traceFile);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'open' }, {});
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  return {
    trace,
    state,
    lane,
    page,
    recommendation,
    runText: stripTags(runHtml),
    valueText: stripTags(valueHtml),
    traceText: stripTags(traceHtml),
    evidence: hooks.websiteEvidenceUxModel(state, lane)
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
  const report = readArchiveText('reports', 'w364_lane_expansion_readiness_smoke_minimizing_growth_plan.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const msc = contextFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json');
  const samples = [graybar, fastenal, msc];
  const laneNames = (userscript.match(/name: '([^']+)'/g) || []).join(' ');

  assertCase(results, 'w364-keeps-w363-runtime-baseline-unchanged',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.12 / W365' &&
      /@version\s+1\.0\.12/.test(userscript) &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W365';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w364-report-prioritizes-safe-adjacent-lanes',
    /Dealer Hardgoods & Channel Fulfillment/.test(report) &&
      /Apparel & Accessories Channel Availability/.test(report) &&
      /Products CPG Retail Replenishment/.test(report) &&
      report.indexOf('Dealer Hardgoods & Channel Fulfillment') < report.indexOf('Apparel & Accessories Channel Availability') &&
      /Food \/ Beverage CPG Manufacturing, Industrial Equipment Manufacturing, and Life Sciences should wait/.test(report),
    report.slice(0, 3000));

  assertCase(results, 'w364-current-lane-contracts-contain-expansion-candidates',
    /Dealer Hardgoods & Channel Fulfillment/.test(laneNames) &&
      /Apparel & Accessories/.test(laneNames) &&
      /Products CPG/.test(laneNames) &&
      /Industrial Distribution & Branch Fulfillment/.test(laneNames),
    laneNames);

  assertCase(results, 'w364-smoke-minimizing-plan-defers-live-smoke',
    /No immediate live smoke/.test(report) &&
      /fixture-only/.test(report) &&
      /Run one targeted live smoke only after/.test(report) &&
      /Hosted resolver work should wait/.test(report),
    report.slice(0, 4200));

  assertCase(results, 'w364-baseline-public-advisory-import-separation-holds',
    graybar.evidence.confidence.resolverLimited === true &&
      graybar.evidence.confidence.advisoryState === 'advisory_supported' &&
      fastenal.evidence.confidence.state === 'recommended' &&
      fastenal.evidence.confidence.resolverLimited === false &&
      msc.evidence.confidence.state === 'needs_confirmation' &&
      msc.evidence.confidence.advisoryState === 'advisory_supported' &&
      samples.every((sample) => importedOpenLinksValid(sample.state)),
    JSON.stringify(samples.map((sample) => ({
      customer: sample.state.intake && sample.state.intake.customer,
      confidence: sample.evidence.confidence,
      imported: importedOpenLinksValid(sample.state)
    }))));

  assertCase(results, 'w364-w361-w362-w363-surfaces-remain-protected',
    samples.every((sample) => /NetSuite path/.test(sample.runText) &&
      /Live controls/.test(sample.runText) &&
      /Competitive cue/.test(sample.runText) &&
      /Competitive lens/.test(sample.valueText) &&
      /Operator evidence/.test(sample.traceText) &&
      /Evidence details and markers/.test(sample.traceText) &&
      !/Current installed block:|Previous drawer marker:/.test(sample.traceText)),
    msc.traceText.slice(0, 2200));

  assertCase(results, 'w364-no-regression-boundaries-are-explicit',
    /No drawer runtime marker, runner, adapter, record creation behavior, import validation, Open-link authority, or drawer write path changed/.test(report) &&
      /No new drawer transaction write paths/.test(report) &&
      /No fake Open links/.test(report) &&
      /Keep N\/LLM advisory only/.test(report),
    report.slice(0, 5000));

  assertCase(results, 'w364-next-block-is-dealer-hardgoods-fixture-only',
    /Move through W365: Dealer Hardgoods fixture-only lane polish/.test(report) &&
      /Do not run live smoke/.test(report) &&
      /Recommendation on whether one targeted live dealer\/channel smoke is worth running/.test(report),
    report.slice(report.indexOf('## Next Prompt Block')));

  printResults('W364 lane expansion readiness and smoke-minimizing growth plan harness', results);
}

main();
