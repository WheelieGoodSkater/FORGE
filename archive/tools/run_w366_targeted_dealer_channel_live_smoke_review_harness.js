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

function importedOpenLinksValid(state) {
  const finalResult = state && state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  return finalResult.finalNamesImported === true &&
    records.length >= 5 &&
    records.every((record) => record.safeToOpen === true &&
      record.linkAuthorityStatus === 'verified_openable' &&
      /^\d+$/.test(String(record.internalId || record.id || '')) &&
      /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || record.openableUrl || record.url || '')));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const trace = readArchiveJson('trace_samples', 'w366_summit_outdoor_dealer_channel_live_smoke_trace.json');
  const report = readArchiveText('reports', 'w366_targeted_dealer_channel_live_smoke_review.md');
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page);
  const value = hooks.valueReviewPacket(state, lane, page, recommendation);
  const dealerPolish = hooks.dealerHardgoodsStoryPolishW365(state, lane, value);
  const websiteEvidence = trace.websiteEvidenceUx || hooks.websiteEvidenceUxModel(state, lane);
  const planText = stripTags(hooks.renderPlanView(state, lane, page, recommendation));
  const buildText = stripTags(hooks.renderReviewView(state, lane, page, recommendation));
  const valueText = stripTags(hooks.renderValueReviewView(state, lane, page, recommendation));
  const runText = stripTags(hooks.renderRunView(state, lane, page, recommendation, 'Product / SKU', { id: 'prove', label: 'Prove' }, ''));
  const traceText = stripTags(hooks.renderTraceView(state, lane, page, recommendation));
  const events = trace.events || [];

  assertCase(results, 'w366-live-marker-is-current-w365',
    trace.installedDrawerDisplayVersionW346 &&
      trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.12 / W365' &&
      hooks.drawerDisplayVersionW346() === 'Drawer 1.0.12 / W365',
    JSON.stringify({
      trace: trace.installedDrawerDisplayVersionW346 && trace.installedDrawerDisplayVersionW346.visibleVersionLabel,
      source: hooks.drawerDisplayVersionW346()
    }));

  assertCase(results, 'w366-dealer-channel-lane-is-selected-and-specific',
    lane.id === 'dealer_hardgoods' &&
      trace.selectedLane &&
      trace.selectedLane.id === 'dealer_hardgoods' &&
      dealerPolish.active === true &&
      /Dealer Hardgoods & Channel Fulfillment/.test(planText) &&
      /Dealer Hardgoods \/ Dealer Channel Availability/.test(planText),
    JSON.stringify({ lane: lane.id, selectedLane: trace.selectedLane && trace.selectedLane.id, dealerPolish }));

  assertCase(results, 'w366-public-read-resolver-limited-and-advisory-separated',
    websiteEvidence.confidence &&
      websiteEvidence.confidence.resolverLimited === true &&
      websiteEvidence.confidence.displayText === 'Resolver limited' &&
      websiteEvidence.advisory &&
      websiteEvidence.advisory.status === 'advisory_supported' &&
      websiteEvidence.advisory.advisoryOnly === true &&
      /Website read: Resolver limited/.test(planText) &&
      /Advisory: Supported \/ High/.test(planText) &&
      /Build\/import verified/.test(planText),
    JSON.stringify(websiteEvidence.confidence));

  assertCase(results, 'w366-build-import-and-open-links-are-real',
    state.integratedBuildRunnerResult &&
      state.integratedBuildRunnerResult.status === 'completed_result_imported' &&
      state.integratedBuildRunnerResult.resultImportGuard &&
      state.integratedBuildRunnerResult.resultImportGuard.completedResultAcceptedByW151 === true &&
      importedOpenLinksValid(state) &&
      /5 Open links verified/.test(traceText) &&
      /Summit Outdoor Supply Customer Account Open/.test(buildText) &&
      /SO2679 Open/.test(buildText),
    JSON.stringify({
      importStatus: state.integratedBuildRunnerResult && state.integratedBuildRunnerResult.status,
      recordCount: state.dccFinalNamingResult && state.dccFinalNamingResult.displayReadyRecords && state.dccFinalNamingResult.displayReadyRecords.length
    }));

  assertCase(results, 'w366-run-dealer-channel-proof-path-is-claim-safe',
    /Dealer\/channel proof path/.test(runText) &&
      /Allocation position/.test(runText) &&
      /Supplier lead-time risk/.test(runText) &&
      /Channel fulfillment/.test(runText) &&
      /confirm real dealer allocation and supplier lead-time evidence before ROI or availability claims/.test(runText) &&
      /Advisory only; confirm before competitor-specific claims/.test(runText),
    runText.slice(0, 2800));

  assertCase(results, 'w366-value-dealer-lens-works-but-density-needs-w367-polish',
    /Dealer\/channel lens/.test(valueText) &&
      /supplier lead-time/.test(valueText) &&
      /dealer portals|supplier portals|allocation spreadsheets/.test(valueText) &&
      valueText.length > 8000 &&
      /Live Value Answer is still too text-rich/.test(report) &&
      /W367/.test(report),
    JSON.stringify({ valueLength: valueText.length, sample: valueText.slice(0, 1200) }));

  assertCase(results, 'w366-trace-operator-evidence-is-clean-and-exportable',
    events.length >= 20 &&
      /Operator evidence/.test(traceText) &&
      /Drawer 1\.0\.12 \/ W365/.test(traceText) &&
      /Records imported/.test(traceText) &&
      /Public read: resolver limited/.test(traceText) &&
      /Advisory: High/.test(traceText) &&
      !/Current installed block:|Runner naming marker:|W341 runner naming marker not returned/.test(traceText),
    JSON.stringify({ eventCount: events.length, trace: traceText.slice(0, 900) }));

  assertCase(results, 'w366-report-captures-decision-and-next-block',
    /W366: Targeted Dealer\/Channel Live Smoke Review/.test(report) &&
      /Do not lock Dealer Hardgoods broadly yet/.test(report) &&
      /Move through W367: Consultant cockpit density and Run polish/.test(report) &&
      /No new drawer transaction write paths/.test(report),
    report.slice(0, 4200));

  printResults('W366 targeted dealer/channel live smoke review harness', results);
}

main();
