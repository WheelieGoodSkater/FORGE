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

function hasNumericId(record) {
  return /^\d+$/.test(String(record && (record.internalId || record.id) || ''));
}

function hasSupportedNetSuiteUrl(record) {
  return /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record && (record.supportedOpenUrl || record.openableUrl || record.url) || ''));
}

function importedRecordGate(trace) {
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const guard = integrated.resultImportGuard || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  return integrated.status === 'completed_result_imported' &&
    guard.completedResultAcceptedByW151 === true &&
    guard.importReady === true &&
    finalResult.status === 'dcc_final_names_imported' &&
    finalResult.finalNamesImported === true &&
    records.length >= 5 &&
    records.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable' && hasNumericId(record) && hasSupportedNetSuiteUrl(record));
}

function contextFromTrace(hooks, traceFile) {
  const trace = readArchiveJson('trace_samples', traceFile);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const competitive = hooks.competitiveAdvisoryModelW362(state, lane, value);
  const runHtml = hooks.renderRunView(state, lane, page, recommendation, 'Customer Record', { id: 'open' }, {});
  const valueHtml = hooks.renderValueReviewView(state, lane, page, recommendation);
  return {
    trace,
    state,
    lane,
    page,
    recommendation,
    value,
    competitive,
    runHtml,
    valueHtml,
    runText: stripTags(runHtml),
    valueText: stripTags(valueHtml),
    evidence: hooks.websiteEvidenceUxModel(state, lane)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w362_consultant_safe_competitive_intelligence_layer.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const msc = contextFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json');
  const samples = [graybar, fastenal, msc];

  assertCase(results, 'w362-source-marker-and-hooks-advance',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.12 / W365' &&
      userscript.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.12';") &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W365';") &&
      /@version\s+1\.0\.12/.test(userscript) &&
      /competitiveAdvisoryModelW362/.test(userscript) &&
      /standardCompetitiveAlternativesW362/.test(userscript),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w362-model-is-advisory-only-and-standardized',
    samples.every((sample) => sample.competitive.schema === 'idb.w362-consultant-safe-competitive-intelligence.v1' &&
      sample.competitive.advisoryOnly === true &&
      sample.competitive.status === 'advisory_competitive_ready' &&
      sample.competitive.alternatives.length >= 4 &&
      /Advisory/.test(sample.competitive.authorityLabel)) &&
      graybar.competitive.alternatives.includes('Fastenal') &&
      !fastenal.competitive.alternatives.includes('Fastenal') &&
      !msc.competitive.alternatives.includes('MSC Industrial'),
    JSON.stringify(samples.map((sample) => ({ customer: sample.value.customer, alternatives: sample.competitive.alternatives }))));

  assertCase(results, 'w362-value-surface-adds-compact-competitive-lens-after-live-value',
    samples.every((sample) => /idb-w362-competitive-card/.test(sample.valueHtml) &&
      /Competitive lens/.test(sample.valueText) &&
      sample.valueText.indexOf('Live value answer') > -1 &&
      sample.valueText.indexOf('Competitive lens') > sample.valueText.indexOf('Live value answer') &&
      /Alternatives .* NetSuite contrast .* Claim guard/.test(sample.valueText)),
    msc.valueText.slice(0, 2400));

  assertCase(results, 'w362-run-surface-adds-competitive-cue-without-crowding-w361',
    samples.every((sample) => /Competitive cue/.test(sample.runText) &&
      sample.runText.indexOf('NetSuite path') < sample.runText.indexOf('Live controls') &&
      sample.runText.indexOf('Say') < sample.runText.indexOf('Competitive cue') &&
      sample.runText.indexOf('Competitive cue') < sample.runText.indexOf('Selected script') &&
      /If competitive pressure comes up/.test(sample.runText)),
    msc.runText.slice(0, 2200));

  assertCase(results, 'w362-claim-safety-and-advisory-boundaries-are-visible',
    samples.every((sample) => /N\/LLM advisory only/.test(sample.runText) &&
      /Advisory only; confirm before competitor-specific claims/.test(sample.runText) &&
      /without making unsupported competitor claims/.test(sample.valueText)) &&
      !samples.some((sample) => /competitor lacks a feature|uses Grainger|uses Fastenal|uses MSC Industrial|uses Graybar/i.test(sample.runText)),
    msc.runText.slice(0, 2600));

  assertCase(results, 'w362-confidence-separation-preserved',
    graybar.evidence.confidence.resolverLimited === true &&
      graybar.evidence.confidence.advisoryState === 'advisory_supported' &&
      fastenal.evidence.confidence.state === 'recommended' &&
      fastenal.evidence.confidence.scoreLabel === 'high' &&
      fastenal.competitive.sourceLabel === 'Public evidence plus advisory context' &&
      msc.evidence.confidence.state === 'needs_confirmation' &&
      msc.evidence.confidence.advisoryState === 'advisory_supported' &&
      msc.competitive.sourceLabel === 'N/LLM advisory from lane, URL/domain, and request language',
    JSON.stringify({
      graybar: graybar.evidence.confidence,
      fastenal: fastenal.evidence.confidence,
      msc: msc.evidence.confidence
    }));

  assertCase(results, 'w362-import-open-link-and-write-boundaries-preserved',
    samples.every((sample) => importedRecordGate(sample.trace) &&
      sample.state.dccFinalNamingResult &&
      sample.state.dccFinalNamingResult.noRegression &&
      sample.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      sample.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true &&
      sample.state.websiteEvidenceV1 &&
      sample.state.websiteEvidenceV1.nllmAdvisoryOnly === true),
    JSON.stringify(samples.map((sample) => sample.state.dccFinalNamingResult && sample.state.dccFinalNamingResult.noRegression)));

  assertCase(results, 'w362-report-records-next-trace-cleanup',
    /W362: Consultant-Safe Competitive Intelligence Layer/.test(report) &&
      /Trace cleanup/.test(report) &&
      /No new live smoke is required/.test(report) &&
      /No drawer writes, transaction writes, fake Open links/.test(report),
    report.slice(0, 3600));

  printResults('W362 consultant-safe competitive intelligence harness', results);
}

main();
