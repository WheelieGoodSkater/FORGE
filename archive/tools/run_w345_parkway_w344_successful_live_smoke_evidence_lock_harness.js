#!/usr/bin/env node

const {
  assertCase,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function hasNumericId(record) {
  return /^\d+$/.test(String(record && (record.internalId || record.id) || ''));
}

function hasNetSuiteUrl(record) {
  return /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record && (record.supportedOpenUrl || record.openableUrl || record.url) || ''));
}

function byRole(records, role) {
  return records.find((record) => record.canonicalRole === role || record.role === role);
}

function main() {
  const results = [];
  const trace = readArchiveJson('trace_samples', 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const report = readArchiveText('reports', 'w345_parkway_w344_successful_live_smoke_evidence_lock.md');
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const capture = integrated.resultCapture || {};
  const completed = capture.finalGeneratedNamesJson || {};
  const guard = integrated.resultImportGuard || {};
  const records = finalResult.displayReadyRecords || [];
  const marker = trace.runnerProofNamingMarkerW341 || {};
  const w342 = trace.installedDrawerCurrentBlockMarkerW342 || {};
  const readiness = trace.adapterReadyRecordCreationUxW262 || {};
  const w208 = trace.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1 || {};
  const roles = ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow', 'supporting_sku'];
  const missingRoles = roles.filter((role) => !byRole(records, role));
  const unsafeRecords = records.filter((record) => record.safeToOpen !== true || record.linkAuthorityStatus !== 'verified_openable' || !hasNumericId(record) || !hasNetSuiteUrl(record));
  const supporting = byRole(records, 'supporting_sku');

  assertCase(results, 'trace-export-is-the-parkway-w345-live-smoke',
    trace.exportedAt === '2026-05-29T22:42:18.105Z' &&
      trace.events && trace.events.length === 24 &&
      trace.product && trace.product.version === 'V1.0.0',
    JSON.stringify({ exportedAt: trace.exportedAt, events: trace.events && trace.events.length, product: trace.product }));

  assertCase(results, 'w342-current-block-and-w341-runner-marker-are-active',
    w342.active === true &&
      w342.marker === 'W342 runner naming verification active' &&
      marker.active === true &&
      marker.marker === 'W341 prospect-specific proof naming active' &&
      marker.proofNames &&
      marker.proofNames.proofNoun === 'Breaker' &&
      marker.proofNames.componentItemName === 'Parkway Safe Substitute Fulfillment Support SKU',
    JSON.stringify({ w342, marker }));

  assertCase(results, 'completed-result-import-path-is-accepted',
    integrated.status === 'completed_result_imported' &&
      integrated.rawStatus === 'completed_runner_result_ready' &&
      integrated.resultCaptureStatus === 'completed_result_capture_ready' &&
      guard.completedResultAcceptedByW151 === true &&
      guard.importReady === true &&
      finalResult.status === 'dcc_final_names_imported' &&
      finalResult.finalNamesImported === true,
    JSON.stringify({
      integratedStatus: integrated.status,
      rawStatus: integrated.rawStatus,
      resultCaptureStatus: integrated.resultCaptureStatus,
      guard,
      finalStatus: finalResult.status
    }));

  assertCase(results, 'w208-w262-consultant-state-is-records-ready',
    readiness.readinessState === 'records_imported' &&
      readiness.source &&
      readiness.source.w206Status === 'production_build_completed_imported' &&
      readiness.source.w208Status === 'records_ready' &&
      w208.status === 'records_ready',
    JSON.stringify({ readinessState: readiness.readinessState, source: readiness.source, w208Status: w208.status }));

  assertCase(results, 'final-record-set-has-required-distribution-roles',
    missingRoles.length === 0 &&
      records.length >= 5,
    JSON.stringify({ missingRoles, roles: records.map((record) => record.canonicalRole || record.role) }));

  assertCase(results, 'supporting-sku-role-and-name-survive-w344-import',
    supporting &&
      supporting.role === 'supporting_sku' &&
      supporting.canonicalRole === 'supporting_sku' &&
      /Parkway Safe Substitute Fulfillment Support SKU/.test(supporting.recordName || supporting.name || '') &&
      !/Component/.test(supporting.recordName || supporting.name || ''),
    JSON.stringify(supporting));

  assertCase(results, 'all-display-ready-records-have-safe-open-authority',
    records.length >= 5 &&
      unsafeRecords.length === 0,
    JSON.stringify(unsafeRecords));

  assertCase(results, 'runner-result-preserves-distribution-mode-policy',
    completed.resolvedOperatingMode === 'distribution_replenishment' &&
      completed.runnerLaneVocabularyPolicy &&
      completed.runnerLaneVocabularyPolicy.modeKey === 'distribution_replenishment' &&
      completed.runnerLaneVocabularyPolicy.prospectSpecificProofNamingMarker &&
      completed.runnerLaneVocabularyPolicy.prospectSpecificProofNamingMarker.active === true,
    JSON.stringify({
      resolvedOperatingMode: completed.resolvedOperatingMode,
      policy: completed.runnerLaneVocabularyPolicy
    }));

  assertCase(results, 'no-regression-boundaries-are-exported',
    finalResult.noRegression &&
      finalResult.noRegression.importOnly === true &&
      finalResult.noRegression.noIdbWrites === true &&
      finalResult.noRegression.noTransactionWritesFromIdb === true &&
      finalResult.noRegression.dccOwnsObjectGeneration === true,
    JSON.stringify(finalResult.noRegression));

  assertCase(results, 'w345-report-captures-decision-and-next-block',
    /Decision\n\nPass/.test(report) &&
      /Move to W346 before broader smoke testing/.test(report) &&
      /No drawer-created records/.test(report) &&
      /No fake Open links/.test(report),
    'W345 report locks pass decision, no-regression boundaries, and W346 recommendation');

  printResults('W345 Parkway W344 successful live smoke evidence lock harness', results);
}

main();
