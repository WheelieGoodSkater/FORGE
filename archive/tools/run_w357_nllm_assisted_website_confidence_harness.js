#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  userscriptPath
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

function context(hooks, traceFile) {
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w357_nllm_assisted_website_confidence_without_operator_paste.md');
  const graybarNoPaste = context(hooks, 'w356_graybar_no_supplied_website_evidence_trace.json');
  const graybarSupplied = context(hooks, 'w356_graybar_supplied_website_evidence_trace.json');
  const parkway = readArchiveJson('trace_samples', 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const borderStates = readArchiveJson('trace_samples', 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const triState = readArchiveJson('trace_samples', 'w351_tristate_second_broader_smoke_after_w350_trace.json');

  const noPasteEvidence = hooks.websiteEvidenceUxModel(graybarNoPaste.state, graybarNoPaste.lane);
  const noPasteAdvisory = hooks.nllmAssistedWebsiteConfidenceW357(graybarNoPaste.state, graybarNoPaste.lane);
  const noPastePlan = hooks.renderPlanView(graybarNoPaste.state, graybarNoPaste.lane, graybarNoPaste.page, graybarNoPaste.recommendation);
  const noPastePlanText = stripTags(noPastePlan);
  const noPasteRun = hooks.renderRunView(graybarNoPaste.state, graybarNoPaste.lane, graybarNoPaste.page, graybarNoPaste.recommendation, 'Customer Record', { id: 'open' }, {});
  const noPasteRunText = stripTags(noPasteRun);

  const notesOnlyState = Object.assign(hooks.defaultState(), clone(graybarNoPaste.trace.state || {}));
  notesOnlyState.intake = Object.assign({}, notesOnlyState.intake, {
    website: '',
    websiteEvidence: '',
    notes: `${notesOnlyState.intake.notes}\n\nElectrical distribution, branch availability, wire, cable, conduit, pickup, delivery, catalog, products.`
  });
  notesOnlyState.websiteEvidenceV1 = null;
  notesOnlyState.websiteResolverRuntime = null;
  hooks.ensureWebsiteEvidenceRuntime(notesOnlyState);
  const notesOnlyAdvisory = hooks.nllmAssistedWebsiteConfidenceW357(notesOnlyState, hooks.getLane(notesOnlyState));
  const notesOnlyConfidence = hooks.websiteConfidenceModel(notesOnlyState);

  const suppliedEvidence = hooks.websiteEvidenceUxModel(graybarSupplied.state, graybarSupplied.lane);
  const suppliedAdvisory = hooks.nllmAssistedWebsiteConfidenceW357(graybarSupplied.state, graybarSupplied.lane);

  assertCase(results, 'w357-current-marker-and-hook-advance',
    /@version\s+1\.0\.9/.test(userscript) &&
      hooks.drawerDisplayVersionW346() === 'Drawer 1.0.9 / W361' &&
      /nllmAssistedWebsiteConfidenceW357/.test(userscript),
    JSON.stringify({ marker: hooks.drawerDisplayVersionW346() }));

  assertCase(results, 'w357-graybar-no-paste-remains-public-read-resolver-limited',
    hooks.isResolverLimitedWebsiteEvidenceW353(noPasteEvidence) === true &&
      noPasteEvidence.confidence.displayText === 'Resolver limited' &&
      noPasteEvidence.confidence.resolverLimited === true &&
      noPasteEvidence.confidence.advisoryCanConfirmWebsite === false,
    JSON.stringify(noPasteEvidence.confidence));

  assertCase(results, 'w357-graybar-no-paste-gets-advisory-supported-high',
    noPasteAdvisory.status === 'advisory_supported' &&
      noPasteAdvisory.scoreLabel === 'high' &&
      noPasteAdvisory.advisoryOnly === true &&
      noPasteAdvisory.canConfirmWebsite === false &&
      noPasteAdvisory.productFamily === 'Electrical Distribution Branch Fulfillment',
    JSON.stringify(noPasteAdvisory));

  assertCase(results, 'w357-plan-visual-separates-build-public-read-and-advisory',
    /Build\/import verified/.test(noPastePlanText) &&
      /Website read: Resolver limited/.test(noPastePlanText) &&
      /Advisory: Supported \/ High/.test(noPastePlanText) &&
      /Open links verified/.test(noPastePlanText) &&
      /Evidence details/.test(noPastePlan) &&
      /Public fetch still limited/.test(noPastePlan),
    noPastePlanText.slice(0, 2200));

  assertCase(results, 'w357-run-copy-keeps-advisory-claim-safe',
    /Advisory: Supported \/ High/.test(noPasteRunText) &&
      /not public website proof/.test(noPasteRunText) &&
      /confirm public evidence before ROI claims/.test(noPasteRunText) &&
      /N\/LLM: advisory only/.test(noPasteRunText),
    noPasteRunText.slice(0, 2600));

  assertCase(results, 'w357-notes-alone-cannot-confirm-website',
    notesOnlyAdvisory.status === 'not_needed' &&
      notesOnlyAdvisory.canConfirmWebsite === false &&
      notesOnlyConfidence.state !== 'recommended',
    JSON.stringify({ notesOnlyAdvisory, notesOnlyConfidence }));

  assertCase(results, 'w357-w355-supplied-evidence-fallback-still-works',
    suppliedEvidence.status === 'recommended' &&
      suppliedEvidence.confidence.scoreLabel === 'high' &&
      suppliedEvidence.confidence.resolverLimited === false &&
      suppliedAdvisory.status === 'not_needed',
    JSON.stringify({ suppliedConfidence: suppliedEvidence.confidence, suppliedAdvisory }));

  assertCase(results, 'w357-import-open-link-regressions-remain-green',
    importedRecordGate(graybarNoPaste.trace) &&
      importedRecordGate(parkway) &&
      importedRecordGate(borderStates) &&
      importedRecordGate(triState),
    JSON.stringify({
      graybar: graybarNoPaste.trace.state.integratedBuildRunnerResult.status,
      parkway: parkway.state.integratedBuildRunnerResult.status,
      borderStates: borderStates.state.integratedBuildRunnerResult.status,
      triState: triState.state.integratedBuildRunnerResult.status
    }));

  assertCase(results, 'w357-report-records-next-live-smoke-and-boundaries',
    /W357: N\/LLM-Assisted Website Confidence Without Operator Paste Dependency/.test(report) &&
      /Public website read: actual resolver\/fetched\/operator-supplied website evidence/.test(report) &&
      /Advisory inference can make the no-paste Graybar flow clearer/.test(report) &&
      /Move through W358: Live Graybar no-paste advisory confidence smoke/.test(report) &&
      /No drawer transaction writes/.test(report),
    report.slice(0, 2600));

  printResults('W357 N/LLM-assisted website confidence harness', results);
}

main();
