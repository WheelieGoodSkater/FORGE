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
  const report = readArchiveText('reports', 'w360_msc_second_adjacent_distribution_smoke.md');
  const graybar = contextFromTrace(hooks, 'w358_graybar_no_paste_advisory_confidence_live_smoke_trace.json');
  const fastenal = contextFromTrace(hooks, 'w359_fastenal_broader_smoke_advisory_confidence_accepted_trace.json');
  const msc = contextFromTrace(hooks, 'w360_msc_second_adjacent_distribution_smoke_trace.json');
  const evidence = hooks.websiteEvidenceUxModel(msc.state, msc.lane);
  const advisory = hooks.nllmAssistedWebsiteConfidenceW357(msc.state, msc.lane);
  const postImport = hooks.postImportConfidenceModelW346(msc.state);
  const planHtml = hooks.renderPlanView(msc.state, msc.lane, msc.page, msc.recommendation);
  const buildHtml = hooks.renderReviewView(msc.state, msc.lane, msc.page, msc.recommendation);
  const runHtml = hooks.renderRunView(msc.state, msc.lane, msc.page, msc.recommendation, 'Customer Record', { id: 'open' }, {});
  const planText = stripTags(planHtml);
  const buildText = stripTags(buildHtml);
  const runText = stripTags(runHtml);
  const topMarker = msc.trace.installedDrawerDisplayVersionW346 || {};
  const websiteRuntime = msc.state.websiteEvidenceV1 || {};
  const intake = msc.state.intake || {};

  assertCase(results, 'w360-live-marker-is-w357-current',
    topMarker.userscriptVersion === '1.0.8' &&
      topMarker.visibleVersionLabel === 'Drawer 1.0.8 / W357',
    JSON.stringify(topMarker));

  assertCase(results, 'w360-no-paste-condition-is-true',
    intake.customer === 'MSC Industrial Supply Co.' &&
      intake.website === 'https://www.mscdirect.com/' &&
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

  assertCase(results, 'w360-public-read-is-medium-not-resolver-limited',
    evidence.status === 'needs_confirmation' &&
      evidence.confidence.state === 'needs_confirmation' &&
      evidence.confidence.scoreLabel === 'medium' &&
      evidence.confidence.resolverLimited === false &&
      evidence.confidence.failureState === '' &&
      websiteRuntime.fetchStatus === 'runtime_resolved' &&
      websiteRuntime.confidence &&
      websiteRuntime.confidence.score === 0.55,
    JSON.stringify({ confidence: evidence.confidence, websiteRuntime: {
      fetchStatus: websiteRuntime.fetchStatus,
      failureState: websiteRuntime.failureState,
      confidence: websiteRuntime.confidence,
      signals: websiteRuntime.signals
    } }));

  assertCase(results, 'w360-advisory-supports-but-does-not-upgrade-public-read',
    advisory.status === 'advisory_supported' &&
      advisory.scoreLabel === 'high' &&
      advisory.advisoryOnly === true &&
      advisory.canConfirmWebsite === false &&
      evidence.confidence.advisoryState === 'advisory_supported' &&
      evidence.confidence.state === 'needs_confirmation',
    JSON.stringify({ advisory, confidence: evidence.confidence }));

  assertCase(results, 'w360-plan-confidence-separates-medium-public-read-advisory-and-import-proof',
    postImport.importedProofReady === true &&
      postImport.buildImportConfidence === 'verified' &&
      postImport.websiteEvidenceLabel === 'Needs confirmation' &&
      /Build\/import verified/.test(planText) &&
      /Website read: Needs confirmation/.test(planText) &&
      /Advisory: Supported \/ High/.test(planText) &&
      /Open links verified/.test(planText),
    JSON.stringify({ postImport, plan: planText.slice(0, 2200) }));

  assertCase(results, 'w360-website-read-details-show-medium-evidence-and-confirmation-need',
    /Public read: Needs confirmation/.test(planText) &&
      /Medium/.test(planText) &&
      /Confirm before handoff/.test(planText) &&
      /Fetch status: runtime_resolved/.test(planText) &&
      /Branch Inventory Fulfillment Position/.test(planText) &&
      /Confirm the website category before ROI/.test(planText),
    planText.slice(0, 3600));

  assertCase(results, 'w360-build-result-and-open-links-are-real',
    importedRecordGate(msc.trace) &&
      /Records ready/.test(buildText) &&
      /MSC Industrial Supply Co. Customer Account Open/.test(buildText) &&
      /SO2704 Open/.test(buildText) &&
      /MSC Branch Availability \/ Replenishment Flow Open/.test(buildText),
    buildText.slice(0, 3000));

  assertCase(results, 'w360-run-proof-cta-is-claim-safe-but-specificity-needs-polish',
    /Open Product SKU, then prove branch availability/.test(runText) &&
      /Evidence confidence: Low/.test(runText) &&
      /N\/LLM: advisory only/.test(runText) &&
      /Advisory: Supported \/ High/.test(runText) &&
      /confirm public evidence before ROI claims/.test(runText) &&
      /No ROI, write, creation, or availability claim beyond evidence/.test(runText),
    runText.slice(0, 3200));

  assertCase(results, 'w360-three-branch-confidence-baseline-is-covered',
    graybar.trace.websiteEvidenceUx &&
      graybar.trace.websiteEvidenceUx.confidence &&
      graybar.trace.websiteEvidenceUx.confidence.resolverLimited === true &&
      graybar.trace.websiteEvidenceUx.confidence.advisoryState === 'advisory_supported' &&
      fastenal.trace.websiteEvidenceUx &&
      fastenal.trace.websiteEvidenceUx.confidence &&
      fastenal.trace.websiteEvidenceUx.confidence.state === 'recommended' &&
      fastenal.trace.websiteEvidenceUx.confidence.resolverLimited === false &&
      evidence.confidence.state === 'needs_confirmation' &&
      evidence.confidence.resolverLimited === false,
    JSON.stringify({
      graybar: graybar.trace.websiteEvidenceUx && graybar.trace.websiteEvidenceUx.confidence,
      fastenal: fastenal.trace.websiteEvidenceUx && fastenal.trace.websiteEvidenceUx.confidence,
      msc: evidence.confidence
    }));

  assertCase(results, 'w360-no-regression-boundaries-preserved',
    msc.state.dccFinalNamingResult &&
      msc.state.dccFinalNamingResult.noRegression &&
      msc.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      msc.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true &&
      websiteRuntime.noRegression &&
      websiteRuntime.noRegression.noWriteAuthority === true &&
      websiteRuntime.nllmAdvisoryOnly === true,
    JSON.stringify({
      finalNoRegression: msc.state.dccFinalNamingResult && msc.state.dccFinalNamingResult.noRegression,
      websiteNoRegression: websiteRuntime.noRegression,
      nllmAdvisoryOnly: websiteRuntime.nllmAdvisoryOnly
    }));

  assertCase(results, 'w360-report-records-optimized-plan-and-next-block',
    /W360: MSC Second Adjacent Distribution Smoke/.test(report) &&
      /Stop broad smoke loops for the moment/.test(report) &&
      /trust across the story and easy expansion through more industry lanes/.test(report) &&
      /Move through W361: Consolidated confidence and story-specificity polish/.test(report),
    report.slice(0, 3600));

  printResults('W360 MSC second adjacent distribution smoke harness', results);
}

main();
