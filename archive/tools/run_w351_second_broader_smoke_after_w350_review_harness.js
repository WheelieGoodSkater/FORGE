#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

const { runVerification } = require('../../tools/verify_deployment_sync_w347');

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

function smokeContext(hooks, trace) {
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
  return { state, lane, page, recommendation };
}

function renderedSurfaces(hooks, trace) {
  const context = smokeContext(hooks, trace);
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

function main() {
  const results = [];
  const hooks = loadHooks();
  const trace = readArchiveJson('trace_samples', 'w351_tristate_second_broader_smoke_after_w350_trace.json');
  const report = readArchiveText('reports', 'w351_second_broader_smoke_after_w350_review.md');
  const deployment = runVerification();
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const guard = integrated.resultImportGuard || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  const requiredRoles = ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow', 'supporting_sku'];
  const missingRoles = requiredRoles.filter((role) => !byRole(records, role));
  const unsafeRecords = records.filter((record) => record.safeToOpen !== true || record.linkAuthorityStatus !== 'verified_openable' || !hasNumericId(record) || !hasSupportedNetSuiteUrl(record));
  const surfaces = renderedSurfaces(hooks, trace);
  const prefixLeaks = surfaces
    .map(([surface, text]) => ({ surface, match: forbiddenNotePrefixMatch(text), sample: text }))
    .filter((item) => item.match);

  assertCase(results, 'w351-deployment-preflight-remains-green-for-w350',
    deployment.status === 'PASS' &&
      deployment.baseline &&
      deployment.baseline.visibleMarker === 'Drawer 1.0.8 / W357' &&
      deployment.targets.every((target) => target.root.sha256 === target.mirror.sha256),
    JSON.stringify({ status: deployment.status, baseline: deployment.baseline }));

  assertCase(results, 'w351-tristate-trace-is-current-second-broader-smoke',
    trace.exportedAt === '2026-05-30T01:38:48.886Z' &&
      trace.events &&
      trace.events.length === 35 &&
      trace.state &&
      trace.state.intake &&
      trace.state.intake.customer === 'TriState Electrical Supply' &&
      trace.installedDrawerDisplayVersionW346 &&
      trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.5 / W350',
    JSON.stringify({ exportedAt: trace.exportedAt, events: trace.events && trace.events.length, marker: trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w351-w341-w342-markers-remain-active',
    trace.installedDrawerCurrentBlockMarkerW342 &&
      trace.installedDrawerCurrentBlockMarkerW342.active === true &&
      trace.runnerProofNamingMarkerW341 &&
      trace.runnerProofNamingMarkerW341.active === true &&
      trace.runnerProofNamingMarkerW341.modeKey === 'distribution_replenishment' &&
      /TriState/.test(trace.runnerProofNamingMarkerW341.proofNames && trace.runnerProofNamingMarkerW341.proofNames.heroItemName || ''),
    JSON.stringify({ w342: trace.installedDrawerCurrentBlockMarkerW342, w341: trace.runnerProofNamingMarkerW341 }));

  assertCase(results, 'w351-completed-result-import-and-final-names-pass',
    integrated.status === 'completed_result_imported' &&
      guard.completedResultAcceptedByW151 === true &&
      guard.importReady === true &&
      finalResult.status === 'dcc_final_names_imported' &&
      finalResult.finalNamesImported === true,
    JSON.stringify({ integratedStatus: integrated.status, guard, finalStatus: finalResult.status }));

  assertCase(results, 'w351-records-have-required-roles-and-open-authority',
    records.length === 5 &&
      missingRoles.length === 0 &&
      unsafeRecords.length === 0 &&
      /TriState Product Availability SKU/.test(byRole(records, 'branch_or_product_sku').name || byRole(records, 'branch_or_product_sku').recordName || '') &&
      /TriState Safe Substitute Fulfillment Support SKU/.test(byRole(records, 'supporting_sku').name || byRole(records, 'supporting_sku').recordName || ''),
    JSON.stringify({ records: records.map((record) => ({ role: record.canonicalRole || record.role, id: record.internalId || record.id, safeToOpen: record.safeToOpen, linkAuthorityStatus: record.linkAuthorityStatus })), missingRoles, unsafeRecords }));

  assertCase(results, 'w351-website-confidence-remains-low-and-separated',
    trace.websiteEvidenceUx &&
      trace.websiteEvidenceUx.status === 'needs_confirmation' &&
      trace.websiteEvidenceUx.confidence &&
      trace.websiteEvidenceUx.confidence.scoreLabel === 'low' &&
      trace.installedDrawerDisplayVersionW346.websiteConfidenceSeparatedFromBuildConfidence === true &&
      trace.installedDrawerDisplayVersionW346.postImportPlanShowsRecordsReady === true,
    JSON.stringify({ websiteEvidenceUx: trace.websiteEvidenceUx, marker: trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w351-w350-note-prefix-cleanup-holds-on-current-surfaces',
    prefixLeaks.length === 0 &&
      surfaces.some(([, text]) => /Build\/import verified/.test(text)) &&
      surfaces.some(([, text]) => /(Website evidence: Needs confirmation|Website read: Resolver limited)/.test(text)) &&
      surfaces.some(([, text]) => /Use imported proof records/.test(text)),
    JSON.stringify(prefixLeaks.map((item) => ({ surface: item.surface, match: item.match && item.match[0], sample: item.sample.slice(Math.max(0, item.match ? item.match.index - 120 : 0), item.match ? item.match.index + 160 : 160) }))));

  assertCase(results, 'w351-no-regression-boundaries-are-preserved',
    finalResult.noRegression &&
      finalResult.noRegression.importOnly === true &&
      finalResult.noRegression.noIdbWrites === true &&
      finalResult.noRegression.noTransactionWritesFromIdb === true &&
      /W151 completed-result import guard preserved/.test(report) &&
      /W214 semantic operating-mode guard preserved/.test(report) &&
      /W245 display-ready Open-link authority preserved/.test(report) &&
      /W350 note-prefix cleanup preserved/.test(report) &&
      /No new drawer write paths/.test(report) &&
      /No fake Open links/.test(report),
    JSON.stringify(finalResult.noRegression));

  assertCase(results, 'w351-report-recommends-next-stronger-website-smoke',
    /Proceed to the next matrix smoke/.test(report) &&
      /The remaining risk is not a blocker: website evidence is still low/.test(report) &&
      /Move through W352: Third broader smoke with stronger website evidence/.test(report),
    report.slice(0, 1800));

  printResults('W351 second broader smoke after W350 review harness', results);
}

main();
