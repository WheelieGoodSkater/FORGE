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

function smokeContext(hooks, traceFile) {
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

function renderedSurfaces(hooks, context) {
  const { state, lane, page, recommendation } = context;
  const surfaces = [
    ['plan', stripTags(hooks.renderPlanView(state, lane, page, recommendation))],
    ['build', stripTags(hooks.renderReviewView(state, lane, page, recommendation))],
    ['roi', stripTags(hooks.renderValueReviewView(state, lane, page, recommendation))]
  ];
  ['open', 'prove', 'handle_objection', 'close_value'].forEach((id) => {
    state.selectedActionId = id;
    surfaces.push([
      `run-${id}`,
      stripTags(hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id, label: id }, 'summary'))
    ]);
  });
  return surfaces;
}

function forbiddenNotePrefixMatch(text) {
  return String(text || '').match(/\b(?:Buyer|Pain|Proof|Value|Competitive|Decision criteria|Stop):\s*/i);
}

function hasRequiredImportedRecordGate(trace) {
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w353_resolver_limited_website_evidence_clarity_gate.md');
  const graybar = smokeContext(hooks, 'w352_graybar_current_drawer_resolver_fallback_rerun_trace.json');
  const parkway = smokeContext(hooks, 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const borderStates = smokeContext(hooks, 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const triState = smokeContext(hooks, 'w351_tristate_second_broader_smoke_after_w350_trace.json');
  const graybarEvidence = hooks.websiteEvidenceUxModel(graybar.state, graybar.lane);
  const graybarPostImport = hooks.postImportConfidenceModelW346(graybar.state);
  const graybarSurfaces = renderedSurfaces(hooks, graybar);
  const baselineSurfaces = [graybar, parkway, borderStates, triState].flatMap((context) => renderedSurfaces(hooks, context));
  const prefixLeaks = baselineSurfaces
    .map(([surface, text]) => ({ surface, match: forbiddenNotePrefixMatch(text), sample: text }))
    .filter((item) => item.match);
  const graybarSurfaceText = graybarSurfaces.map(([, text]) => text).join(' ');
  const weakLanguageLeak = graybarSurfaceText.match(/\bweak lane evidence\b|\bwebsite appears weak\b|\bpublic website appears weak\b/i);

  assertCase(results, 'w353-userscript-version-and-marker-advance',
    /@version\s+1\.0\.11/.test(userscript) &&
      hooks.drawerDisplayVersionW346() === 'Drawer 1.0.11 / W363' &&
      /isResolverLimitedWebsiteEvidenceW353/.test(userscript),
    JSON.stringify({ marker: hooks.drawerDisplayVersionW346() }));

  assertCase(results, 'w353-graybar-resolver-limited-model-is-explicit',
    hooks.isResolverLimitedWebsiteEvidenceW353(graybarEvidence) === true &&
      graybarEvidence.confidence &&
      graybarEvidence.confidence.resolverMode === 'local_fallback_only' &&
      graybarEvidence.confidence.failureState === 'thin' &&
      graybarEvidence.confidence.displayText === 'Resolver limited' &&
      graybarEvidence.whatIdbSaw.includes('Website read: resolver-limited local fallback') &&
      (
        /not proof that the public website is weak/.test(graybarEvidence.whyThisClassification || '') ||
        /advisory support, not as proof that the public website was fetched/.test(graybarEvidence.whyThisClassification || '')
      ) &&
      graybarEvidence.advisory &&
      graybarEvidence.advisory.advisoryOnly === true &&
      graybarEvidence.advisory.canConfirmWebsite === false,
    JSON.stringify(graybarEvidence));

  assertCase(results, 'w353-graybar-plan-separates-build-import-from-resolver-limited-website-read',
    graybarPostImport.importedProofReady === true &&
      graybarPostImport.buildImportConfidence === 'verified' &&
      graybarPostImport.resolverLimitedWebsiteEvidence === true &&
      graybarPostImport.websiteEvidenceLabel === 'Resolver limited' &&
      /Build\/import verified/.test(graybarSurfaces.find(([surface]) => surface === 'plan')[1]) &&
      /Website read: Resolver limited/.test(graybarSurfaces.find(([surface]) => surface === 'plan')[1]) &&
      !/Website evidence: Needs confirmation \/ Low/.test(graybarSurfaces.find(([surface]) => surface === 'plan')[1]),
    JSON.stringify({ postImport: graybarPostImport, plan: graybarSurfaces.find(([surface]) => surface === 'plan')[1].slice(0, 900) }));

  assertCase(results, 'w353-graybar-run-copy-does-not-call-the-website-weak',
    /Website read Resolver limited/.test(graybarSurfaceText) &&
      /FORGE could not fetch enough website\/category evidence/.test(graybarSurfaceText) &&
      !weakLanguageLeak,
    JSON.stringify({ weakLanguageLeak, sample: graybarSurfaceText.slice(0, 1800) }));

  assertCase(results, 'w353-w350-note-prefix-cleanup-persists-across-baselines',
    prefixLeaks.length === 0,
    JSON.stringify(prefixLeaks.map((item) => ({ surface: item.surface, match: item.match && item.match[0], sample: item.sample.slice(Math.max(0, item.match ? item.match.index - 120 : 0), item.match ? item.match.index + 160 : 160) }))));

  assertCase(results, 'w353-import-validation-and-open-link-gates-preserved',
    hasRequiredImportedRecordGate(graybar.trace) &&
      hasRequiredImportedRecordGate(parkway.trace) &&
      hasRequiredImportedRecordGate(borderStates.trace) &&
      hasRequiredImportedRecordGate(triState.trace),
    JSON.stringify({
      graybar: graybar.trace.state.integratedBuildRunnerResult.status,
      parkway: parkway.trace.state.integratedBuildRunnerResult.status,
      borderStates: borderStates.trace.state.integratedBuildRunnerResult.status,
      triState: triState.trace.state.integratedBuildRunnerResult.status
    }));

  assertCase(results, 'w353-no-regression-boundaries-and-next-operator-steps-recorded',
    /W353: Resolver-Limited Website Evidence Clarity Gate/.test(report) &&
      /does not change runner behavior, adapter behavior, record creation behavior/.test(report) &&
      /No drawer write paths, no transaction writes, and no fake Open links were added/.test(report) &&
      /Drawer 1.0.6 \/ W353/.test(report) &&
      /Move through W354: Re-run Graybar with resolver-limited clarity installed/.test(report),
    report.slice(0, 2200));

  printResults('W353 resolver-limited website evidence clarity gate harness', results);
}

main();
