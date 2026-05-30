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
  return { trace, state, lane, page, recommendation };
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = readArchiveText('..', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w361_consultant_day_in_life_run_value_ux.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const msc = contextFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json');

  const mscRunHtml = hooks.renderRunView(msc.state, msc.lane, msc.page, msc.recommendation, 'Customer Record', { id: 'open' }, {});
  const mscValueHtml = hooks.renderValueReviewView(msc.state, msc.lane, msc.page, msc.recommendation);
  const graybarRunHtml = hooks.renderRunView(graybar.state, graybar.lane, graybar.page, graybar.recommendation, 'Customer Record', { id: 'open' }, {});
  const fastenalRunHtml = hooks.renderRunView(fastenal.state, fastenal.lane, fastenal.page, fastenal.recommendation, 'Customer Record', { id: 'open' }, {});
  const mscRunText = stripTags(mscRunHtml);
  const mscValueText = stripTags(mscValueHtml);
  const graybarRunText = stripTags(graybarRunHtml);
  const fastenalRunText = stripTags(fastenalRunHtml);
  const graybarEvidence = hooks.websiteEvidenceUxModel(graybar.state, graybar.lane);
  const fastenalEvidence = hooks.websiteEvidenceUxModel(fastenal.state, fastenal.lane);
  const mscEvidence = hooks.websiteEvidenceUxModel(msc.state, msc.lane);

  assertCase(results, 'w361-source-marker-advances-current-drawer-only',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.9 / W361' &&
      userscript.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.9';") &&
      userscript.includes("const CURRENT_UX_BLOCK_W346 = 'W361';") &&
      /@version\s+1\.0\.9/.test(userscript),
    hooks.drawerDisplayVersionW346());

  assertCase(results, 'w361-run-starts-with-netsuite-path-flow',
    /idb-w361-netsuite-path/.test(mscRunHtml) &&
      /NetSuite path Customer MSC Industrial Supply Co\. Customer Account Sales Order SO2704 Product SKU Product Availability SKU Availability\/Replenishment Flow MSC Branch Availability \/ Replenishment Flow Live controls/.test(mscRunText),
    mscRunText.slice(0, 1200));

  assertCase(results, 'w361-run-keeps-live-controls-and-adds-say-show-close-chips',
    /idb-run-selector-chips/.test(mscRunHtml) &&
      /idb-w361-script-chips/.test(mscRunHtml) &&
      /Open Prove Handle objection Close value Say .* Show .* Close /.test(mscRunText) &&
      /Selected script Open on the buyer risk/.test(mscRunText),
    mscRunText.slice(0, 1600));

  assertCase(results, 'w361-imported-records-collapse-but-open-links-remain-real',
    /<details class="[^"]*idb-w116-final-navigation[^"]*idb-w361-imported-proof-records/.test(mscRunHtml) &&
      !/<details class="[^"]*idb-w116-final-navigation[^"]*" open/.test(mscRunHtml) &&
      /Use imported proof records \(5\)/.test(mscRunText) &&
      /MSC Industrial Supply Co\. Customer Account Open/.test(mscRunText) &&
      /SO2704 Open/.test(mscRunText) &&
      importedRecordGate(msc.trace),
    mscRunText.slice(0, 2200));

  assertCase(results, 'w361-live-proof-cta-is-collapsed-as-audit-detail',
    /<details class="[^"]*idb-w361-proof-audit/.test(mscRunHtml) &&
      !/<details class="[^"]*idb-w361-proof-audit[^"]*" open/.test(mscRunHtml) &&
      /Proof guardrails and evidence receipt Live proof CTA/.test(mscRunText) &&
      /No ROI, write, creation, or availability claim beyond evidence/.test(mscRunText),
    mscRunText.slice(0, 3200));

  assertCase(results, 'w361-value-answer-is-promoted-above-talk-track',
    /idb-w361-live-value-cockpit/.test(mscValueHtml) &&
      /idb-w361-value-chips/.test(mscValueHtml) &&
      mscValueText.indexOf('Live value answer') > -1 &&
      mscValueText.indexOf('Talk track') > mscValueText.indexOf('Live value answer') &&
      /Next move .* NetSuite answer .* ROI answer .* Caution/.test(mscValueText),
    mscValueText.slice(0, 1800));

  assertCase(results, 'w361-confidence-separation-preserved-across-locked-baselines',
    graybarEvidence.confidence.resolverLimited === true &&
      graybarEvidence.confidence.advisoryState === 'advisory_supported' &&
      fastenalEvidence.confidence.state === 'recommended' &&
      fastenalEvidence.confidence.scoreLabel === 'high' &&
      mscEvidence.confidence.state === 'needs_confirmation' &&
      mscEvidence.confidence.advisoryState === 'advisory_supported' &&
      /Website read Resolver limited/.test(graybarRunText) &&
      /Advisory: Supported \/ High/.test(graybarRunText) &&
      /confirm public evidence before ROI claims/.test(graybarRunText) &&
      /Evidence confidence: Low/.test(mscRunText) &&
      /Advisory: Supported \/ High/.test(mscRunText),
    JSON.stringify({
      graybar: graybarEvidence.confidence,
      fastenal: fastenalEvidence.confidence,
      msc: mscEvidence.confidence
    }));

  assertCase(results, 'w361-no-regression-import-and-write-boundaries-preserved',
    importedRecordGate(graybar.trace) &&
      importedRecordGate(fastenal.trace) &&
      importedRecordGate(msc.trace) &&
      [graybar, fastenal, msc].every((sample) => sample.state.dccFinalNamingResult &&
        sample.state.dccFinalNamingResult.noRegression &&
        sample.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
        sample.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true &&
        sample.state.websiteEvidenceV1 &&
        sample.state.websiteEvidenceV1.nllmAdvisoryOnly === true),
    JSON.stringify({
      graybar: graybar.state.dccFinalNamingResult && graybar.state.dccFinalNamingResult.noRegression,
      fastenal: fastenal.state.dccFinalNamingResult && fastenal.state.dccFinalNamingResult.noRegression,
      msc: msc.state.dccFinalNamingResult && msc.state.dccFinalNamingResult.noRegression
    }));

  assertCase(results, 'w361-report-records-plan-and-next-blocks',
    /W361: Consultant Day-In-The-Life Run And Value UX Redesign/.test(report) &&
      /W362.*competitive intelligence layer/.test(report) &&
      /W363.*Trace screen/.test(report) &&
      /No new live smoke is required/.test(report),
    report.slice(0, 3600));

  printResults('W361 consultant day-in-the-life Run and Value UX harness', results);
}

main();
