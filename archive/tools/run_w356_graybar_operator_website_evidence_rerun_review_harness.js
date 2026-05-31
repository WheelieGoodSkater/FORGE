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

function noImportedRecordGate(trace) {
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  return !integrated.status && !finalResult.status;
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w356_graybar_operator_website_evidence_rerun_review.md');
  const noSupplied = readArchiveJson('trace_samples', 'w356_graybar_no_supplied_website_evidence_trace.json');
  const supplied = readArchiveJson('trace_samples', 'w356_graybar_supplied_website_evidence_trace.json');
  const noSuppliedEvidence = noSupplied.websiteEvidenceUx || {};
  const suppliedEvidence = supplied.websiteEvidenceUx || {};
  const suppliedWebsiteEvidence = supplied.state && supplied.state.websiteEvidenceV1 || {};
  const suppliedEvents = supplied.events || [];

  assertCase(results, 'w356-current-source-marker-and-w355-live-trace-markers-hold',
    /@version\s+1\.0\.12/.test(userscript) &&
      hooks.drawerDisplayVersionW346() === 'Drawer 1.0.12 / W365' &&
      noSupplied.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.7 / W355' &&
      supplied.installedDrawerDisplayVersionW346.visibleVersionLabel === 'Drawer 1.0.7 / W355',
    JSON.stringify({
      source: hooks.drawerDisplayVersionW346(),
      noSupplied: noSupplied.installedDrawerDisplayVersionW346.visibleVersionLabel,
      supplied: supplied.installedDrawerDisplayVersionW346.visibleVersionLabel
    }));

  assertCase(results, 'w356-no-supplied-evidence-is-imported-and-resolver-limited',
    importedRecordGate(noSupplied) &&
      noSupplied.runnerProofNamingMarkerW341.active === true &&
      noSuppliedEvidence.confidence &&
      noSuppliedEvidence.confidence.displayText === 'Resolver limited' &&
      noSuppliedEvidence.confidence.resolverLimited === true &&
      noSuppliedEvidence.confidence.failureState === 'thin',
    JSON.stringify({
      importStatus: noSupplied.state.integratedBuildRunnerResult.status,
      finalStatus: noSupplied.state.dccFinalNamingResult.status,
      websiteConfidence: noSuppliedEvidence.confidence
    }));

  assertCase(results, 'w356-supplied-evidence-proves-confidence-path-not-build-smoke',
    noImportedRecordGate(supplied) &&
      supplied.runnerProofNamingMarkerW341.active === false &&
      suppliedEvidence.status === 'recommended' &&
      suppliedEvidence.confidence &&
      suppliedEvidence.confidence.scoreLabel === 'high' &&
      suppliedEvidence.confidence.resolverLimited === false &&
      suppliedWebsiteEvidence.fetchStatus === 'operator_supplied_website_evidence' &&
      suppliedWebsiteEvidence.signals &&
      suppliedWebsiteEvidence.signals.productFamily === 'Electrical Distribution Branch Fulfillment',
    JSON.stringify({
      importStatus: supplied.state.integratedBuildRunnerResult && supplied.state.integratedBuildRunnerResult.status,
      runnerMarker: supplied.runnerProofNamingMarkerW341,
      websiteConfidence: suppliedEvidence.confidence,
      fetchStatus: suppliedWebsiteEvidence.fetchStatus
    }));

  assertCase(results, 'w356-supplied-evidence-auto-confirms-lane-but-remains-no-write',
    suppliedEvents.some((event) => (event.type || event.eventType || event.name) === 'demo_path_auto_confirmed') &&
      suppliedEvidence.traceExportCoverage &&
      suppliedEvidence.traceExportCoverage.noWriteAuthority === true &&
      suppliedEvidence.traceExportCoverage.nllmAdvisoryOnly === true &&
      supplied.installedDrawerDisplayVersionW346.writebackAuthorityChanged === false &&
      supplied.installedDrawerDisplayVersionW346.runnerChanged === false &&
      supplied.installedDrawerDisplayVersionW346.adapterChanged === false,
    JSON.stringify({
      hasAutoConfirm: suppliedEvents.some((event) => (event.type || event.eventType || event.name) === 'demo_path_auto_confirmed'),
      coverage: suppliedEvidence.traceExportCoverage,
      display: supplied.installedDrawerDisplayVersionW346
    }));

  assertCase(results, 'w356-report-captures-product-decision-and-w357-next-block',
    /W356: Graybar Operator Website Evidence Rerun Review/.test(report) &&
      /should not become the normal operator workflow/.test(report) &&
      /N\/LLM advisory inference/.test(report) &&
      /Website evidence`, `N\/LLM advisory inference`, and `Build\/import proof`/.test(report) &&
      /Move through W357: N\/LLM-assisted website confidence without operator paste dependency/.test(report),
    report.slice(0, 2600));

  printResults('W356 Graybar operator website evidence rerun review harness', results);
}

main();
