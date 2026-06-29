#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  root,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function main() {
  const results = [];
  const report = readArchiveText('reports', 'w321_live_writeback_baseline_industry_story_pivot.md');
  const trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');

  const scripts = packageJson.scripts || {};
  const returnedRecords = Array.isArray(trace.returnedRecords) ? trace.returnedRecords : [];
  const agentNames = new Set((trace.agentRoles || []).map((agent) => agent.name));
  const allOpenLinksAreRealNetSuiteLinks = returnedRecords.every((record) => (
    /^[0-9]+$/.test(String(record.internalId || '')) &&
    /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.url || '')) &&
    record.openLinkSupportedAfterImport === true
  ));

  assertCase(results, 'w321-baseline-packets-exist',
    /W321: Live Writeback Baseline And Industry Story Pivot/.test(report) &&
      trace.schema === 'forge.w321.live-writeback-baseline-industry-story-pivot.trace.v1' &&
      trace.status === 'live_writeback_baseline_locked',
    JSON.stringify({ schema: trace.schema, status: trace.status }));

  assertCase(results, 'known-good-baseline-includes-submit-runner-sidecar-sales-order-validation-import',
    trace.baseline &&
      trace.baseline.submitCapturedRunnerTaskId === true &&
      /SCHEDSCRIPT_/.test(trace.baseline.runnerTaskId || '') &&
      trace.baseline.w144FoundCurrentSidecar === true &&
      trace.baseline.sidecarLookupStatus === 'resolved_by_csv_import' &&
      trace.baseline.salesOrderResolved === true &&
      trace.baseline.salesOrderName === 'SO2690' &&
      trace.baseline.w151Accepted === true &&
      trace.baseline.w214Accepted === true &&
      trace.baseline.w245Accepted === true &&
      trace.baseline.completedResultStatus === 'completed_runner_result_accepted' &&
      trace.baseline.finalDrawerStatus === 'completed_result_imported' &&
      trace.baseline.returnedRecordsImported === true,
    JSON.stringify(trace.baseline || {}));

  assertCase(results, 'returned-records-and-open-link-evidence-are-archived',
    returnedRecords.length >= 5 &&
      returnedRecords.some((record) => record.recordType === 'salesorder' && record.name === 'SO2690') &&
      returnedRecords.some((record) => record.recordType === 'customer') &&
      returnedRecords.filter((record) => record.recordType === 'inventoryitem').length >= 3 &&
      allOpenLinksAreRealNetSuiteLinks &&
      trace.baseline.openLinksAppearedOnlyAfterValidImport === true,
    JSON.stringify(returnedRecords.map((record) => ({ name: record.name, id: record.internalId }))));

  assertCase(results, 'connection-freeze-protects-writeback-surfaces',
    trace.connectionFreeze &&
      trace.connectionFreeze.w144SubmitProtected === true &&
      trace.connectionFreeze.refreshPollProtected === true &&
      trace.connectionFreeze.sidecarLookupProtected === true &&
      trace.connectionFreeze.staleResultRejectionProtected === true &&
      trace.connectionFreeze.completedResultValidationProtected === true &&
      trace.connectionFreeze.finishBuildImportProtected === true &&
      trace.connectionFreeze.openLinkAuthorityProtected === true &&
      trace.connectionFreeze.noDrawerCreatedRecordsProtected === true &&
      trace.connectionFreeze.noDrawerTransactionWritesProtected === true &&
      /Connection Freeze/.test(report),
    JSON.stringify(trace.connectionFreeze || {}));

  assertCase(results, 'industry-story-pivot-defines-product-focus',
    trace.industryStoryPivot &&
      /industry/i.test(trace.industryStoryPivot.industryUnderstanding || '') &&
      /proof/i.test(trace.industryStoryPivot.proofRecordDesign || '') &&
      /First-call|talk tracks|demo moves/i.test(trace.industryStoryPivot.conversationDrivenStoryCoaching || '') &&
      /pack/i.test(trace.industryStoryPivot.reusableIndustryExpansionPacks || '') &&
      /Industry-Story Pivot/.test(report),
    JSON.stringify(trace.industryStoryPivot || {}));

  assertCase(results, 'future-agent-roles-are-documented',
    ['Connection Steward', 'Proof Architect', 'Industry Taxonomist', 'Story Strategist', 'Vocabulary Guard', 'QA Story Runner'].every((name) => agentNames.has(name)) &&
      (trace.agentRoles || []).every((agent) => Array.isArray(agent.responsibilities) && agent.responsibilities.length >= 2) &&
      /Connection Steward/.test(report) &&
      /Proof Architect/.test(report) &&
      /Industry Taxonomist/.test(report) &&
      /Story Strategist/.test(report) &&
      /Vocabulary Guard/.test(report) &&
      /QA Story Runner/.test(report),
    JSON.stringify(trace.agentRoles || []));

  assertCase(results, 'selected-next-block-targets-vocabulary-and-story-not-governance',
    trace.selectedNextBlock &&
      trace.selectedNextBlock.id === 'W322' &&
      trace.selectedNextBlock.targetsDistributionProofRecordVocabulary === true &&
      trace.selectedNextBlock.targetsStorySurfacePolish === true &&
      trace.selectedNextBlock.targetsGovernanceExpansion === false &&
      /Distribution Proof Record Vocabulary And Story Surface Polish/.test(report),
    JSON.stringify(trace.selectedNextBlock || {}));

  assertCase(results, 'w320-w318-w319-w264-w265-continuity-remains-available',
    fs.existsSync(path.join(root, 'archive', 'tools', 'run_w320_stale_result_capture_guard_build_attempt_provenance_harness.js')) &&
      fs.existsSync(path.join(root, 'archive', 'tools', 'run_w318_runner_lane_vocabulary_reconciliation_harness.js')) &&
      fs.existsSync(path.join(root, 'archive', 'tools', 'run_w319_install_runner_vocabulary_patch_live_distribution_smoke_harness.js')) &&
      fs.existsSync(path.join(root, 'archive', 'tools', 'run_w264_connected_build_submit_refresh_import_harness.js')) &&
      fs.existsSync(path.join(root, 'archive', 'tools', 'run_w265_live_adapter_smoke_retry_safety_harness.js')) &&
      scripts['harness:stale-result-capture-guard-build-attempt-provenance-w320'] &&
      scripts['harness:runner-lane-vocabulary-reconciliation-w318'] &&
      scripts['harness:install-runner-vocabulary-patch-live-distribution-smoke-w319'] &&
      scripts['harness:connected-build-submit-refresh-import-w264'] &&
      scripts['harness:live-adapter-smoke-retry-safety-w265'],
    'continuity harnesses should remain registered');

  assertCase(results, 'w151-w214-w245-validation-surfaces-remain-present',
    /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      /completed_runner_result_accepted/.test(userscript),
    'drawer validation surfaces should remain available');

  assertCase(results, 'w144-and-runner-connection-surfaces-remain-present',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /runnerLaneVocabularyPolicy/.test(runner) &&
      /recordSafeDemoContextMemo/.test(runner),
    'adapter and runner surfaces should still expose W320/W318 connection protections');

  assertCase(results, 'normal-ui-and-runtime-authority-guardrails-are-frozen',
    trace.guardrails &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      trace.guardrails.connectedBuildAuthorityUnchanged === true &&
      trace.guardrails.w151W214W245ValidationUnchanged === true &&
      trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      trace.guardrails.normalConsultantUiHiddenDiagnostics === true &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.sourcePackMutationIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false &&
      trace.baseline.drawerCreatedRecords === false &&
      trace.baseline.drawerTransactionWrites === false,
    JSON.stringify(trace.guardrails || {}));

  printResults('W321 live writeback baseline and industry story pivot harness', results);
}

main();
