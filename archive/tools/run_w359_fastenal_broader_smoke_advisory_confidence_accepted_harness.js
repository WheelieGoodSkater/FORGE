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
  const report = readArchiveText('reports', 'w359_fastenal_broader_smoke_advisory_confidence_accepted.md');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const evidence = hooks.websiteEvidenceUxModel(fastenal.state, fastenal.lane);
  const advisory = hooks.nllmAssistedWebsiteConfidenceW357(fastenal.state, fastenal.lane);
  const postImport = hooks.postImportConfidenceModelW346(fastenal.state);
  const planHtml = hooks.renderPlanView(fastenal.state, fastenal.lane, fastenal.page, fastenal.recommendation);
  const buildHtml = hooks.renderReviewView(fastenal.state, fastenal.lane, fastenal.page, fastenal.recommendation);
  const runHtml = hooks.renderRunView(fastenal.state, fastenal.lane, fastenal.page, fastenal.recommendation, 'Customer Record', { id: 'open' }, {});
  const planText = stripTags(planHtml);
  const buildText = stripTags(buildHtml);
  const runText = stripTags(runHtml);
  const topMarker = fastenal.trace.installedDrawerDisplayVersionW346 || {};
  const websiteRuntime = fastenal.state.websiteEvidenceV1 || {};
  const intake = fastenal.state.intake || {};

  assertCase(results, 'w359-live-marker-is-w357-current',
    topMarker.userscriptVersion === '1.0.8' &&
      topMarker.visibleVersionLabel === 'Drawer 1.0.8 / W357',
    JSON.stringify(topMarker));

  assertCase(results, 'w359-no-paste-condition-is-true',
    intake.customer === 'Fastenal Company' &&
      intake.website === 'https://www.fastenal.com/' &&
      !String(intake.websiteEvidence || '').trim() &&
      websiteRuntime.operatorSuppliedWebsiteEvidenceW355 === null &&
      websiteRuntime.resolverAdapter &&
      websiteRuntime.resolverAdapter.operatorSuppliedWebsiteEvidence === false,
    JSON.stringify({
      customer: intake.customer,
      website: intake.website,
      websiteEvidence: intake.websiteEvidence,
      operatorSuppliedWebsiteEvidenceW355: websiteRuntime.operatorSuppliedWebsiteEvidenceW355,
      resolverAdapter: websiteRuntime.resolverAdapter
    }));

  assertCase(results, 'w359-public-read-is-recommended-high-not-resolver-limited',
    evidence.status === 'recommended' &&
      evidence.confidence.state === 'recommended' &&
      evidence.confidence.scoreLabel === 'high' &&
      evidence.confidence.resolverLimited === false &&
      evidence.confidence.failureState === '' &&
      websiteRuntime.fetchStatus === 'runtime_resolved' &&
      websiteRuntime.confidence &&
      websiteRuntime.confidence.score >= 0.9,
    JSON.stringify({ confidence: evidence.confidence, websiteRuntime: {
      fetchStatus: websiteRuntime.fetchStatus,
      failureState: websiteRuntime.failureState,
      confidence: websiteRuntime.confidence,
      signals: websiteRuntime.signals
    } }));

  assertCase(results, 'w359-advisory-is-not-needed-because-public-read-is-strong',
    advisory.status === 'not_needed' &&
      advisory.visible === false &&
      advisory.canConfirmWebsite === false &&
      evidence.confidence.advisoryState === 'not_needed',
    JSON.stringify({ advisory, confidence: evidence.confidence }));

  assertCase(results, 'w359-plan-confidence-separates-public-read-and-import-proof',
    postImport.importedProofReady === true &&
      postImport.buildImportConfidence === 'verified' &&
      postImport.websiteEvidenceLabel === 'Recommended' &&
      /Build\/import verified/.test(planText) &&
      /Website read: Recommended/.test(planText) &&
      /Open links verified/.test(planText) &&
      !/Advisory: Supported \/ High/.test(planText),
    JSON.stringify({ postImport, plan: planText.slice(0, 2200) }));

  assertCase(results, 'w359-website-read-details-show-public-category-signals',
    /Website read Public read: Recommended High No confirmation needed/.test(planText) &&
      /Website-first evidence strongly supports Industrial Distribution & Branch Fulfillment/.test(planText) &&
      /Fetch status: runtime_resolved/.test(planText) &&
      /industrial supply/.test(planText) &&
      /Distributor SKU/.test(planText) &&
      /Industrial Distribution SKU/.test(planText),
    planText.slice(0, 3200));

  assertCase(results, 'w359-build-result-and-open-links-are-real',
    importedRecordGate(fastenal.trace) &&
      /Records ready/.test(buildText) &&
      /Fastenal Company Customer Account Open/.test(buildText) &&
      /SO2703 Open/.test(buildText) &&
      /Product Availability SKU Open/.test(buildText) &&
      /Fastenal Branch Availability \/ Replenishment Flow Open/.test(buildText),
    buildText.slice(0, 3000));

  assertCase(results, 'w359-run-proof-cta-is-claim-safe',
    /Open Product SKU, then prove branch availability/.test(runText) &&
      /Evidence confidence: High/.test(runText) &&
      /N\/LLM: advisory only/.test(runText) &&
      /review-only story shaping/.test(runText) &&
      /No delivery, ROI, write, or availability claim beyond evidence/.test(runText),
    runText.slice(0, 3000));

  assertCase(results, 'w359-graybar-resolver-limited-baseline-still-covered',
    graybar.trace.installedDrawerDisplayVersionW346 &&
      graybar.trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.8 / W357' &&
      graybar.trace.websiteEvidenceUx &&
      graybar.trace.websiteEvidenceUx.confidence &&
      graybar.trace.websiteEvidenceUx.confidence.resolverLimited === true &&
      graybar.trace.websiteEvidenceUx.confidence.advisoryState === 'advisory_supported',
    JSON.stringify(graybar.trace.websiteEvidenceUx && graybar.trace.websiteEvidenceUx.confidence));

  assertCase(results, 'w359-no-regression-boundaries-preserved',
    fastenal.state.dccFinalNamingResult &&
      fastenal.state.dccFinalNamingResult.noRegression &&
      fastenal.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      fastenal.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true &&
      websiteRuntime.noRegression &&
      websiteRuntime.noRegression.noWriteAuthority === true &&
      websiteRuntime.nllmAdvisoryOnly === true,
    JSON.stringify({
      finalNoRegression: fastenal.state.dccFinalNamingResult && fastenal.state.dccFinalNamingResult.noRegression,
      websiteNoRegression: websiteRuntime.noRegression,
      nllmAdvisoryOnly: websiteRuntime.nllmAdvisoryOnly
    }));

  assertCase(results, 'w359-report-records-decision-and-next-block',
    /W359: Fastenal Broader Smoke With W357 Advisory Confidence Accepted/.test(report) &&
      /positive branch that Graybar did not/.test(report) &&
      /W358 proved the resolver-limited plus advisory branch/.test(report) &&
      /Move through W360: Second adjacent distribution smoke after Fastenal positive public-read pass/.test(report),
    report.slice(0, 2600));

  printResults('W359 Fastenal broader smoke advisory confidence accepted harness', results);
}

main();
