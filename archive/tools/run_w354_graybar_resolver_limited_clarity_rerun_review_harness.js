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
  const graybar = smokeContext(hooks, 'w354_graybar_resolver_limited_clarity_rerun_trace.json');
  const parkway = smokeContext(hooks, 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const borderStates = smokeContext(hooks, 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const triState = smokeContext(hooks, 'w351_tristate_second_broader_smoke_after_w350_trace.json');
  const w352Graybar = smokeContext(hooks, 'w352_graybar_current_drawer_resolver_fallback_rerun_trace.json');
  const report = readArchiveText('reports', 'w354_graybar_resolver_limited_clarity_rerun_review.md');
  const evidence = graybar.trace.websiteEvidenceUx || hooks.websiteEvidenceUxModel(graybar.state, graybar.lane);
  const surfaces = renderedSurfaces(hooks, graybar);
  const surfaceText = surfaces.map(([, text]) => text).join(' ');
  const prefixLeaks = surfaces
    .map(([surface, text]) => ({ surface, match: forbiddenNotePrefixMatch(text), sample: text }))
    .filter((item) => item.match);
  const weakLanguageLeak = surfaceText.match(/\bweak lane evidence\b|\bwebsite appears weak\b|\bpublic website appears weak\b/i);
  const finalResult = graybar.trace.state && graybar.trace.state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];

  assertCase(results, 'w354-live-graybar-rerun-is-current-w353',
    graybar.trace.exportedAt === '2026-05-30T14:06:02.232Z' &&
      graybar.trace.events &&
      graybar.trace.events.length === 21 &&
      graybar.trace.state &&
      graybar.trace.state.intake &&
      graybar.trace.state.intake.customer === 'Graybar Electric' &&
      graybar.trace.installedDrawerDisplayVersionW346 &&
      graybar.trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.6 / W353',
    JSON.stringify({ exportedAt: graybar.trace.exportedAt, events: graybar.trace.events && graybar.trace.events.length, marker: graybar.trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w354-build-import-and-open-links-are-still-verified',
    hasRequiredImportedRecordGate(graybar.trace) &&
      records.some((record) => /Graybar Electric Machine Unit/.test(record.name || record.recordName || '')) &&
      records.some((record) => /Graybar Branch Availability/.test(record.name || record.recordName || '')) &&
      records.some((record) => /Graybar Safe Substitute/.test(record.name || record.recordName || '')),
    JSON.stringify(records.map((record) => ({ role: record.canonicalRole || record.role, name: record.name || record.recordName, id: record.internalId || record.id, safeToOpen: record.safeToOpen, linkAuthorityStatus: record.linkAuthorityStatus }))));

  assertCase(results, 'w354-resolver-limited-evidence-is-explicit-not-website-weak',
    evidence.status === 'needs_confirmation' &&
      evidence.confidence &&
      evidence.confidence.displayText === 'Resolver limited' &&
      evidence.confidence.resolverLimited === true &&
      evidence.confidence.resolverMode === 'local_fallback_only' &&
      evidence.confidence.failureState === 'thin' &&
      evidence.confidence.tokenConfigured === false &&
      /not proof that the public website is weak/.test(evidence.whyThisClassification || ''),
    JSON.stringify(evidence));

  assertCase(results, 'w354-current-rendered-surfaces-show-resolver-limited-and-verified-import',
    /Build\/import verified/.test(surfaceText) &&
      /Website read: Resolver limited/.test(surfaceText) &&
      /FORGE could not fetch enough website\/category evidence/.test(surfaceText) &&
      /Use returned NetSuite proof records/.test(surfaceText) &&
      !weakLanguageLeak,
    JSON.stringify({ weakLanguageLeak, sample: surfaceText.slice(0, 2200) }));

  assertCase(results, 'w354-w350-note-prefix-cleanup-holds',
    prefixLeaks.length === 0,
    JSON.stringify(prefixLeaks.map((item) => ({ surface: item.surface, match: item.match && item.match[0], sample: item.sample.slice(Math.max(0, item.match ? item.match.index - 120 : 0), item.match ? item.match.index + 160 : 160) }))));

  assertCase(results, 'w354-w341-w342-and-no-write-boundaries-preserved',
    graybar.trace.runnerProofNamingMarkerW341 &&
      graybar.trace.runnerProofNamingMarkerW341.active === true &&
      graybar.trace.installedDrawerCurrentBlockMarkerW342 &&
      graybar.trace.installedDrawerCurrentBlockMarkerW342.active === true &&
      finalResult.noRegression &&
      finalResult.noRegression.importOnly === true &&
      finalResult.noRegression.noIdbWrites === true &&
      finalResult.noRegression.noTransactionWritesFromIdb === true,
    JSON.stringify({ w341: graybar.trace.runnerProofNamingMarkerW341, w342: graybar.trace.installedDrawerCurrentBlockMarkerW342, noRegression: finalResult.noRegression }));

  assertCase(results, 'w354-baseline-regressions-remain-green',
    hasRequiredImportedRecordGate(parkway.trace) &&
      hasRequiredImportedRecordGate(borderStates.trace) &&
      hasRequiredImportedRecordGate(triState.trace) &&
      hasRequiredImportedRecordGate(w352Graybar.trace),
    JSON.stringify({
      parkway: parkway.trace.state.integratedBuildRunnerResult.status,
      borderStates: borderStates.trace.state.integratedBuildRunnerResult.status,
      triState: triState.trace.state.integratedBuildRunnerResult.status,
      w352Graybar: w352Graybar.trace.state.integratedBuildRunnerResult.status
    }));

  assertCase(results, 'w354-report-records-decision-and-next-resolver-readiness-block',
    /W354: Graybar Resolver-Limited Clarity Rerun Review/.test(report) &&
      /W354 passes the resolver-limited clarity gate/.test(report) &&
      /Proceed with the broader smoke matrix using W353 resolver-limited wording as accepted behavior/.test(report) &&
      /Move through W355: Resolver readiness path for strong public websites/.test(report) &&
      /No runner, adapter, record creation/.test(report),
    report.slice(0, 2200));

  printResults('W354 Graybar resolver-limited clarity rerun review harness', results);
}

main();
