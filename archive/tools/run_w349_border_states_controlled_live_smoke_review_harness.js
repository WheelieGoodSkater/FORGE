#!/usr/bin/env node

const {
  assertCase,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

const { runVerification } = require('../../tools/verify_deployment_sync_w347');

function hasNumericId(record) {
  return /^\d+$/.test(String(record && (record.internalId || record.id) || ''));
}

function hasSupportedNetSuiteUrl(record) {
  return /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record && (record.supportedOpenUrl || record.openableUrl || record.url) || ''));
}

function byRole(records, role) {
  return records.find((record) => record.canonicalRole === role || record.role === role);
}

function main() {
  const results = [];
  const trace = readArchiveJson('trace_samples', 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const report = readArchiveText('reports', 'w349_border_states_controlled_live_smoke_review.md');
  const deployment = runVerification();
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const capture = integrated.resultCapture || {};
  const completed = capture.finalGeneratedNamesJson || {};
  const guard = integrated.resultImportGuard || {};
  const records = finalResult.displayReadyRecords || [];
  const unsafeRecords = records.filter((record) => record.safeToOpen !== true || record.linkAuthorityStatus !== 'verified_openable' || !hasNumericId(record) || !hasSupportedNetSuiteUrl(record));
  const roles = ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow', 'supporting_sku'];
  const missingRoles = roles.filter((role) => !byRole(records, role));
  const screenshotObservedCopyIssue = [
    'Buyer: Buyer',
    'Pain: Pain',
    'Proof: Proof',
    'Value: Value',
    'Pain:',
    'Proof:'
  ];

  assertCase(results, 'w349-deployment-preflight-remains-green',
    deployment.status === 'PASS' &&
      deployment.targets.every((target) => target.root.sha256 === target.mirror.sha256),
    JSON.stringify({ status: deployment.status, hashes: deployment.targets.map((target) => [target.id, target.root.sha256]) }));

  assertCase(results, 'w349-border-states-trace-is-current-controlled-smoke',
    trace.exportedAt === '2026-05-30T00:44:41.224Z' &&
      trace.events &&
      trace.events.length === 23 &&
      trace.state &&
      trace.state.intake &&
      trace.state.intake.customer === 'Border States Supply' &&
      trace.installedDrawerDisplayVersionW346 &&
      trace.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.4 / W346',
    JSON.stringify({ exportedAt: trace.exportedAt, events: trace.events && trace.events.length, version: trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w349-w341-w342-markers-are-active',
    trace.installedDrawerCurrentBlockMarkerW342 &&
      trace.installedDrawerCurrentBlockMarkerW342.active === true &&
      trace.runnerProofNamingMarkerW341 &&
      trace.runnerProofNamingMarkerW341.active === true &&
      trace.runnerProofNamingMarkerW341.modeKey === 'distribution_replenishment' &&
      trace.runnerProofNamingMarkerW341.proofNames &&
      /Border States/.test(trace.runnerProofNamingMarkerW341.proofNames.heroItemName || ''),
    JSON.stringify({ w342: trace.installedDrawerCurrentBlockMarkerW342, w341: trace.runnerProofNamingMarkerW341 }));

  assertCase(results, 'w349-completed-result-import-path-passes',
    integrated.status === 'completed_result_imported' &&
      integrated.rawStatus === 'completed_runner_result_ready' &&
      integrated.resultCaptureStatus === 'completed_result_capture_ready' &&
      guard.completedResultAcceptedByW151 === true &&
      guard.importReady === true &&
      finalResult.status === 'dcc_final_names_imported' &&
      finalResult.finalNamesImported === true,
    JSON.stringify({ integratedStatus: integrated.status, guard, finalStatus: finalResult.status }));

  assertCase(results, 'w349-records-have-required-roles-and-open-authority',
    records.length === 5 &&
      missingRoles.length === 0 &&
      unsafeRecords.length === 0,
    JSON.stringify({ records: records.map((record) => ({ role: record.canonicalRole || record.role, id: record.internalId || record.id, safeToOpen: record.safeToOpen })), missingRoles, unsafeRecords }));

  assertCase(results, 'w349-distribution-policy-and-supporting-sku-survive',
    completed.resolvedOperatingMode === 'distribution_replenishment' &&
      completed.runnerLaneVocabularyPolicy &&
      completed.runnerLaneVocabularyPolicy.modeKey === 'distribution_replenishment' &&
      byRole(records, 'supporting_sku') &&
      /Safe Substitute Fulfillment Support SKU/.test(byRole(records, 'supporting_sku').recordName || byRole(records, 'supporting_sku').name || ''),
    JSON.stringify({ mode: completed.resolvedOperatingMode, policy: completed.runnerLaneVocabularyPolicy, supporting: byRole(records, 'supporting_sku') }));

  assertCase(results, 'w349-website-confidence-remains-low-and-separated',
    trace.websiteEvidenceUx &&
      trace.websiteEvidenceUx.status === 'needs_confirmation' &&
      trace.websiteEvidenceUx.confidence &&
      trace.websiteEvidenceUx.confidence.scoreLabel === 'low' &&
      trace.installedDrawerDisplayVersionW346.websiteConfidenceSeparatedFromBuildConfidence === true &&
      trace.installedDrawerDisplayVersionW346.postImportPlanShowsRecordsReady === true,
    JSON.stringify({ websiteEvidenceUx: trace.websiteEvidenceUx, w346: trace.installedDrawerDisplayVersionW346 }));

  assertCase(results, 'w349-report-identifies-copy-prefix-cleanup-as-next-smallest-fix',
    /pass with focused UX cleanup before second broader smoke/.test(report) &&
      /Consultant copy still leaks operator-note prefixes/.test(report) &&
      /Do not change runner or adapter behavior/.test(report) &&
      /Move through W350: Consultant note-prefix cleanup after Border States smoke/.test(report) &&
      screenshotObservedCopyIssue.every((issue) => report.includes(issue)),
    'W349 report captures pass decision, visible copy issue, and W350 recommendation');

  assertCase(results, 'w349-no-regression-boundaries-are-preserved',
    finalResult.noRegression &&
      finalResult.noRegression.importOnly === true &&
      finalResult.noRegression.noIdbWrites === true &&
      finalResult.noRegression.noTransactionWritesFromIdb === true &&
      /W151 completed-result import guard preserved/.test(report) &&
      /W214 semantic operating-mode guard preserved/.test(report) &&
      /W245 display-ready Open-link authority preserved/.test(report) &&
      /W348 smoke matrix discipline preserved/.test(report),
    JSON.stringify(finalResult.noRegression));

  printResults('W349 Border States controlled live smoke review harness', results);
}

main();
