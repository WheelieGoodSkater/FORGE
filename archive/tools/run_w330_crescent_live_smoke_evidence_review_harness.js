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

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const results = [];
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const sourceLanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w329Trace = readArchiveJson('trace_samples', 'w329_review_uploaded_beacon_ridge_or_rerun_trace.json');
  const w330Report = readArchiveText('reports', 'w330_crescent_live_smoke_evidence_review.md');
  const w330Trace = readArchiveJson('trace_samples', 'w330_crescent_live_smoke_evidence_review_trace.json');
  const liveTrace = readJsonFile(w330Trace.evidence.traceFile);

  const runnerTaskId = liveTrace.state.integratedBuildRunnerResult.runnerTaskId || '';
  const finalNavigationRecords = liveTrace.dccFinalNavigationModelV1.reviewObjects || [];
  const openableCount = finalNavigationRecords.filter((record) => record.safeToOpen && record.supportedOpenUrl).length;
  const labels = finalNavigationRecords.map((record) => record.consultantLabel || record.label);
  const names = finalNavigationRecords.map((record) => record.recordName || record.name).join(' ');

  assertCase(results, 'w330-evidence-review-packet-exists',
    /W330: Crescent Live Smoke Evidence Review/.test(w330Report) &&
      w330Trace.schema === 'forge.w330.crescent-live-smoke-evidence-review.trace.v1' &&
      w330Trace.status === 'live_writeback_keep_story_needs_attention',
    JSON.stringify({ schema: w330Trace.schema, status: w330Trace.status }));

  assertCase(results, 'w329-continuity-and-evidence-present',
    w329Trace.decision === 'needs_attention_pending_w325_trace' &&
      fs.existsSync(w330Trace.evidence.traceFile) &&
      w330Trace.evidence.customer === 'Crescent Electric Supply' &&
      liveTrace.state.intake.customer === 'Crescent Electric Supply',
    JSON.stringify(w330Trace.evidence));

  assertCase(results, 'live-writeback-path-is-keep',
    w330Trace.connectionDecision === 'keep' &&
      w330Trace.livePath.runnerTaskIdCaptured === true &&
      /SCHEDSCRIPT_/.test(runnerTaskId) &&
      w330Trace.livePath.currentCompletedResultImported === true &&
      liveTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported',
    JSON.stringify(w330Trace.livePath));

  assertCase(results, 'returned-records-have-ids-and-open-links',
    w330Trace.returnedRecords.length === 5 &&
      w330Trace.returnedRecords.every((record) => record.id && record.openLinkPresent === true) &&
      openableCount === 5,
    JSON.stringify({ returned: w330Trace.returnedRecords.length, openableCount }));

  assertCase(results, 'distribution-safe-names-and-labels-are-present',
    labels.includes('Product SKU') &&
      labels.includes('Availability/Replenishment Flow') &&
      labels.includes('Supporting SKU') &&
      /Product Availability SKU/.test(names) &&
      /Branch Availability \/ Replenishment Flow/.test(names) &&
      /Fulfillment Support SKU/.test(names),
    JSON.stringify({ labels, names }));

  assertCase(results, 'story-quality-is-useful-but-needs-attention',
    w330Trace.storyQuality.buyerProblemClear === true &&
      w330Trace.storyQuality.proofMoveUseful === true &&
      w330Trace.storyQuality.objectionResponseClaimSafe === true &&
      w330Trace.storyProofSurfaceDecision === 'needs_attention_before_dealer_hardgoods' &&
      w330Trace.needsAttention.length >= 4,
    JSON.stringify(w330Trace.storyQuality));

  assertCase(results, 'dealer-hardgoods-remains-blocked-before-polish',
    w330Trace.dealerHardgoodsUnlock === 'no_go_until_post_import_story_label_cleanup' &&
      w330Trace.selectedNextBlock.id === 'W331',
    JSON.stringify(w330Trace.selectedNextBlock));

  assertCase(results, 'w144-and-validation-guardrails-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w330Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w330Trace.guardrails.w151W214W245ValidationUnchanged === true,
    'adapter and import validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Beacon Ridge Electrical Supply|dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods/i.test(sourceLanePacks) &&
      w330Trace.guardrails.sourceLanePacksMutated === false &&
      w330Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w330Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w330Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w330Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w330Trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:crescent-live-smoke-evidence-review-w330'] === 'node archive/tools/run_w330_crescent_live_smoke_evidence_review_harness.js' &&
      /run_w330_crescent_live_smoke_evidence_review_harness/.test(packageJson.scripts.check),
    'W330 harness registered');

  printResults('W330 Crescent live smoke evidence review harness', results);
}

main();
