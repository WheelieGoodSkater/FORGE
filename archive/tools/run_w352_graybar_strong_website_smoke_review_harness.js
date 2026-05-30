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

function byRole(records, role) {
  return records.find((record) => record.canonicalRole === role || record.role === role);
}

function renderedSurfaces(hooks, trace) {
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const staleTrace = readArchiveJson('trace_samples', 'w352_graybar_strong_website_smoke_version_drift_trace.json');
  const trace = readArchiveJson('trace_samples', 'w352_graybar_current_drawer_resolver_fallback_rerun_trace.json');
  const report = readArchiveText('reports', 'w352_graybar_strong_website_smoke_review.md');
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const guard = integrated.resultImportGuard || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  const requiredRoles = ['customer', 'sales_order', 'hero_sku', 'availability_or_replenishment_flow', 'supporting_sku'];
  const missingRoles = requiredRoles.filter((role) => !byRole(records, role));
  const unsafeRecords = records.filter((record) => record.safeToOpen !== true || record.linkAuthorityStatus !== 'verified_openable' || !hasNumericId(record) || !hasSupportedNetSuiteUrl(record));
  const currentSourceSurfaces = renderedSurfaces(hooks, trace);
  const currentSourceLeaks = currentSourceSurfaces
    .map(([surface, text]) => ({ surface, match: forbiddenNotePrefixMatch(text), sample: text }))
    .filter((item) => item.match);

  assertCase(results, 'w352-first-graybar-trace-captures-stale-live-drawer',
    staleTrace.exportedAt === '2026-05-30T12:40:08.849Z' &&
      staleTrace.events &&
      staleTrace.events.length === 23 &&
      staleTrace.state &&
      staleTrace.state.intake &&
      staleTrace.state.intake.customer === 'Graybar Electric' &&
      staleTrace.installedDrawerDisplayVersionW346 &&
      staleTrace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.4 / W346',
    JSON.stringify({ exportedAt: staleTrace.exportedAt, events: staleTrace.events && staleTrace.events.length, drawer: staleTrace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w352-corrected-rerun-is-current-w350-drawer',
    trace.exportedAt === '2026-05-30T12:50:09.692Z' &&
      trace.events &&
      trace.events.length === 35 &&
      trace.state &&
      trace.state.intake &&
      trace.state.intake.customer === 'Graybar Electric' &&
      trace.installedDrawerDisplayVersionW346 &&
      trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.5 / W350',
    JSON.stringify({ exportedAt: trace.exportedAt, events: trace.events && trace.events.length, drawer: trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w352-build-import-and-open-links-pass-despite-version-drift',
    integrated.status === 'completed_result_imported' &&
      guard.completedResultAcceptedByW151 === true &&
      guard.importReady === true &&
      finalResult.status === 'dcc_final_names_imported' &&
      finalResult.finalNamesImported === true &&
      records.length === 5 &&
      missingRoles.length === 0 &&
      unsafeRecords.length === 0,
    JSON.stringify({ integratedStatus: integrated.status, guard, finalStatus: finalResult.status, missingRoles, unsafeRecords }));

  assertCase(results, 'w352-w341-w342-markers-active',
    trace.installedDrawerCurrentBlockMarkerW342 &&
      trace.installedDrawerCurrentBlockMarkerW342.active === true &&
      trace.runnerProofNamingMarkerW341 &&
      trace.runnerProofNamingMarkerW341.active === true &&
      trace.runnerProofNamingMarkerW341.modeKey === 'distribution_replenishment' &&
      /Graybar/.test(trace.runnerProofNamingMarkerW341.proofNames && trace.runnerProofNamingMarkerW341.proofNames.heroItemName || ''),
    JSON.stringify({ w342: trace.installedDrawerCurrentBlockMarkerW342, w341: trace.runnerProofNamingMarkerW341 }));

  assertCase(results, 'w352-website-strong-in-reality-but-resolver-thin-in-trace',
    trace.websiteEvidenceUx &&
      trace.websiteEvidenceUx.status === 'needs_confirmation' &&
      trace.websiteEvidenceUx.confidence &&
      trace.websiteEvidenceUx.confidence.scoreLabel === 'low' &&
      trace.websiteEvidenceUx.confidence.resolverMode === 'local_fallback_only' &&
      trace.websiteEvidenceUx.confidence.failureState === 'thin' &&
      trace.websiteEvidenceUx.confidence.tokenConfigured === false,
    JSON.stringify(trace.websiteEvidenceUx));

  assertCase(results, 'w352-current-source-w350-renders-graybar-without-prefix-leaks',
    hooks.drawerDisplayVersionW346() === 'Drawer 1.0.9 / W361' &&
      currentSourceLeaks.length === 0 &&
      currentSourceSurfaces.some(([, text]) => /Graybar Electric/.test(text)) &&
      currentSourceSurfaces.some(([, text]) => /Website read: Resolver limited/.test(text)),
    JSON.stringify(currentSourceLeaks.map((item) => ({ surface: item.surface, match: item.match && item.match[0], sample: item.sample.slice(Math.max(0, item.match ? item.match.index - 120 : 0), item.match ? item.match.index + 160 : 160) }))));

  assertCase(results, 'w352-report-identifies-version-drift-and-resolver-plan',
    /Treat W352 as a build\/import pass with a website resolver readiness blocker/.test(report) &&
      /The rerun corrected this and proved W350 is live/.test(report) &&
      /Resolver mode: `local_fallback_only`/.test(report) &&
      /W353: Add a pre-smoke live install and resolver-readiness gate/.test(report) &&
      /W354: Re-run Graybar with both gates satisfied/.test(report),
    report.slice(0, 2000));

  assertCase(results, 'w352-no-regression-boundaries-preserved',
    finalResult.noRegression &&
      finalResult.noRegression.importOnly === true &&
      finalResult.noRegression.noIdbWrites === true &&
      finalResult.noRegression.noTransactionWritesFromIdb === true &&
      /No IDB writes and no drawer transaction writes remain true/.test(report) &&
      /Keep all no-write, no-transaction-write, no-fake-link/.test(report),
    JSON.stringify(finalResult.noRegression));

  printResults('W352 Graybar strong-website smoke review harness', results);
}

main();
