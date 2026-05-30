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
  const report = readArchiveText('reports', 'w358_graybar_no_paste_advisory_confidence_live_smoke.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const evidence = hooks.websiteEvidenceUxModel(graybar.state, graybar.lane);
  const advisory = hooks.nllmAssistedWebsiteConfidenceW357(graybar.state, graybar.lane);
  const postImport = hooks.postImportConfidenceModelW346(graybar.state);
  const planHtml = hooks.renderPlanView(graybar.state, graybar.lane, graybar.page, graybar.recommendation);
  const buildHtml = hooks.renderReviewView(graybar.state, graybar.lane, graybar.page, graybar.recommendation);
  const runHtml = hooks.renderRunView(graybar.state, graybar.lane, graybar.page, graybar.recommendation, 'Customer Record', { id: 'open' }, {});
  const planText = stripTags(planHtml);
  const buildText = stripTags(buildHtml);
  const runText = stripTags(runHtml);
  const topMarker = graybar.trace.installedDrawerDisplayVersionW346 || {};
  const websiteRuntime = graybar.state.websiteEvidenceV1 || {};
  const intake = graybar.state.intake || {};

  assertCase(results, 'w358-live-marker-is-w357-current',
    topMarker.userscriptVersion === '1.0.8' &&
      topMarker.visibleVersionLabel === 'Drawer 1.0.8 / W357' &&
      graybar.trace.installedDrawerCurrentBlockMarkerW342 &&
      /W342 runner naming verification active/.test(graybar.trace.installedDrawerCurrentBlockMarkerW342.marker || ''),
    JSON.stringify(topMarker));

  assertCase(results, 'w358-no-paste-condition-is-true',
    intake.website === 'https://www.graybar.com/' &&
      !String(intake.websiteEvidence || '').trim() &&
      websiteRuntime.operatorSuppliedWebsiteEvidenceW355 === null &&
      websiteRuntime.resolverAdapter &&
      websiteRuntime.resolverAdapter.operatorSuppliedWebsiteEvidence === false,
    JSON.stringify({
      website: intake.website,
      websiteEvidence: intake.websiteEvidence,
      operatorSuppliedWebsiteEvidenceW355: websiteRuntime.operatorSuppliedWebsiteEvidenceW355,
      resolverAdapter: websiteRuntime.resolverAdapter
    }));

  assertCase(results, 'w358-public-read-remains-resolver-limited',
    hooks.isResolverLimitedWebsiteEvidenceW353(evidence) === true &&
      evidence.confidence.displayText === 'Resolver limited' &&
      evidence.confidence.scoreLabel === 'low' &&
      evidence.confidence.resolverMode === 'local_fallback_only' &&
      evidence.confidence.failureState === 'thin',
    JSON.stringify(evidence.confidence));

  assertCase(results, 'w358-advisory-support-is-visible-but-not-proof',
    advisory.status === 'advisory_supported' &&
      advisory.scoreLabel === 'high' &&
      advisory.advisoryOnly === true &&
      advisory.canConfirmWebsite === false &&
      evidence.confidence.advisoryCanConfirmWebsite === false &&
      /Advisory supported/.test(evidence.confidence.advisoryLabel || ''),
    JSON.stringify({ advisory, confidence: evidence.confidence }));

  assertCase(results, 'w358-plan-confidence-separates-proof-layers',
    postImport.importedProofReady === true &&
      postImport.buildImportConfidence === 'verified' &&
      postImport.websiteEvidenceLabel === 'Resolver limited' &&
      postImport.advisoryConfidenceLabel === 'Advisory supported' &&
      /Build\/import verified/.test(planText) &&
      /Website read: Resolver limited/.test(planText) &&
      /Advisory: Supported \/ High/.test(planText) &&
      /Open links verified/.test(planText),
    JSON.stringify({ postImport, plan: planText.slice(0, 2200) }));

  assertCase(results, 'w358-website-read-details-are-consultant-safe',
    /Website read Resolver limited/i.test(planText) &&
      /Treat this as resolver-limited, not as proof that the public website is weak/.test(planText) &&
      /N\/LLM advisory can guide the talk track, but it does not confirm public website evidence or proof links/.test(planText) &&
      /Evidence details/.test(planHtml) &&
      /Public fetch still limited/.test(planHtml),
    planText.slice(0, 2600));

  assertCase(results, 'w358-build-result-and-open-links-are-real',
    importedRecordGate(graybar.trace) &&
      /Records ready/.test(buildText) &&
      /Graybar Electric Customer Account Open/.test(buildText) &&
      /SO2702 Open/.test(buildText) &&
      /Graybar Electric Machine Unit Open/.test(buildText),
    buildText.slice(0, 2600));

  assertCase(results, 'w358-run-proof-cta-keeps-advisory-claim-safe',
    /Open Product SKU, then prove branch availability/.test(runText) &&
      /N\/LLM: advisory only/.test(runText) &&
      /Advisory: Supported \/ High/.test(runText) &&
      /not public website proof/.test(runText) &&
      /confirm public evidence before ROI claims/.test(runText) &&
      /No ROI, write, creation, or availability claim beyond evidence/.test(runText),
    runText.slice(0, 3000));

  assertCase(results, 'w358-no-regression-boundaries-preserved',
    graybar.state.dccFinalNamingResult &&
      graybar.state.dccFinalNamingResult.noRegression &&
      graybar.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      graybar.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true &&
      websiteRuntime.noRegression &&
      websiteRuntime.noRegression.noWriteAuthority === true &&
      websiteRuntime.nllmAdvisoryOnly === true,
    JSON.stringify({
      finalNoRegression: graybar.state.dccFinalNamingResult && graybar.state.dccFinalNamingResult.noRegression,
      websiteNoRegression: websiteRuntime.noRegression,
      nllmAdvisoryOnly: websiteRuntime.nllmAdvisoryOnly
    }));

  assertCase(results, 'w358-report-records-decision-and-next-block',
    /W358: Graybar No-Paste Advisory Confidence Live Smoke/.test(report) &&
      /Proceed with broader smoke matrix using the W357 language as accepted/.test(report) &&
      /Move through W359: Resume broader smoke matrix with W357 advisory confidence accepted/.test(report) &&
      /No new drawer transaction write paths/.test(report),
    report.slice(0, 2600));

  printResults('W358 Graybar no-paste advisory confidence live smoke harness', results);
}

main();
