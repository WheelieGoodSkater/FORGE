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
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'open' }, {});
  return {
    trace,
    state,
    lane,
    page,
    recommendation,
    traceHtml,
    valueHtml,
    runHtml,
    traceText: stripTags(traceHtml),
    valueText: stripTags(valueHtml),
    runText: stripTags(runHtml),
    evidence: hooks.websiteEvidenceUxModel(state, lane)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w363_trace_cleanup_operator_evidence_screen.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const msc = contextFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json');
  const samples = [graybar, fastenal, msc];

  assertCase(results, 'w363-source-marker-advances',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.11 / W363' &&
      /@version\s+1\.0\.11/.test(userscript) &&
      userscript.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.11';") &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W363';"),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w363-trace-normal-view-is-operator-evidence-first',
    samples.every((sample) => /Operator evidence/.test(sample.traceText) &&
      /Drawer 1\.0\.11 \/ W363/.test(sample.traceText) &&
      /Records imported/.test(sample.traceText) &&
      /Open links verified/.test(sample.traceText) &&
      /Website read/.test(sample.traceText) &&
      /Support export/.test(sample.traceText) &&
      /Copy operator summary/.test(sample.traceText) &&
      /Export trace/.test(sample.traceText)),
    msc.traceText);

  assertCase(results, 'w363-old-marker-noise-is-collapsed',
    samples.every((sample) => /Evidence details and markers/.test(sample.traceText) &&
      sample.traceText.indexOf('Current marker') > sample.traceText.indexOf('Evidence details and markers') &&
      sample.traceText.indexOf('Runner marker') > sample.traceText.indexOf('Evidence details and markers') &&
      !/Current installed block:|Runner naming marker:|Previous drawer marker:/.test(sample.traceText)),
    graybar.traceText);

  assertCase(results, 'w363-public-advisory-states-remain-clear',
    /Public read: resolver limited/.test(graybar.traceText) &&
      /Advisory: High/.test(graybar.traceText) &&
      /Public read: Recommended/.test(fastenal.traceText) &&
      /Public read: Needs confirmation/.test(msc.traceText),
    JSON.stringify(samples.map((sample) => ({ customer: sample.state.intake && sample.state.intake.customer, text: sample.traceText.slice(0, 500) }))));

  assertCase(results, 'w363-roi-competitive-tab-is-less-crowded',
    samples.every((sample) => /Competitive lens/.test(sample.valueText) &&
      /Competitive prep detail/.test(sample.valueText) &&
      /Expanded value answer/.test(sample.valueText) &&
      !/Competitive cockpit/.test(sample.valueText)) &&
      samples.every((sample) => sample.valueText.indexOf('Competitive prep detail') > sample.valueText.indexOf('Competitive lens')),
    msc.valueText.slice(0, 2600));

  assertCase(results, 'w363-w361-and-w362-run-value-boundaries-preserved',
    samples.every((sample) => /NetSuite path/.test(sample.runText) &&
      /Live controls/.test(sample.runText) &&
      /Competitive cue/.test(sample.runText) &&
      /N\/LLM advisory only/.test(sample.runText) &&
      /Advisory only; confirm before competitor-specific claims/.test(sample.runText)),
    graybar.runText.slice(0, 2600));

  assertCase(results, 'w363-import-open-link-and-no-write-boundaries-preserved',
    samples.every((sample) => sample.state.dccFinalNamingResult &&
      sample.state.dccFinalNamingResult.finalNamesImported === true &&
      sample.state.dccFinalNamingResult.displayReadyRecords.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable') &&
      sample.state.dccFinalNamingResult.noRegression &&
      sample.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      sample.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true),
    JSON.stringify(samples.map((sample) => sample.state.dccFinalNamingResult && sample.state.dccFinalNamingResult.noRegression)));

  assertCase(results, 'w363-report-records-next-block',
    /W363: Trace Cleanup And Operator Evidence Screen/.test(report) &&
      /ROI\/Competitive is lighter/.test(report) &&
      /Move through W364: Lane expansion readiness/.test(report) &&
      /No drawer writes, transaction writes, fake Open links/.test(report),
    report.slice(0, 3600));

  printResults('W363 trace cleanup and operator evidence screen harness', results);
}

main();
