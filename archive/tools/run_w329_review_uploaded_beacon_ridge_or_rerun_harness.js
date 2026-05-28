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
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const sourceLanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w321Trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const w322Trace = readArchiveJson('trace_samples', 'w322_distribution_proof_record_vocabulary_story_polish_trace.json');
  const w324Trace = readArchiveJson('trace_samples', 'w324_highest_value_story_pack_selection_trace.json');
  const w328Trace = readArchiveJson('trace_samples', 'w328_beacon_ridge_evidence_gate_trace.json');
  const w329Report = readArchiveText('reports', 'w329_review_uploaded_beacon_ridge_or_rerun.md');
  const w329Trace = readArchiveJson('trace_samples', 'w329_review_uploaded_beacon_ridge_or_rerun_trace.json');

  assertCase(results, 'w329-review-or-rerun-packet-exists',
    /W329: Review Uploaded Beacon Ridge Evidence Or Re-Run Smoke/.test(w329Report) &&
      w329Trace.schema === 'forge.w329.review-uploaded-beacon-ridge-or-rerun.trace.v1' &&
      w329Trace.status === 'beacon_ridge_evidence_missing',
    JSON.stringify({ schema: w329Trace.schema, status: w329Trace.status }));

  assertCase(results, 'w328-continuity-is-preserved',
    w328Trace.status === 'beacon_ridge_evidence_missing' &&
      w328Trace.decision === 'needs_attention_pending_w325_trace' &&
      w329Trace.w328Continuity.unchanged === true &&
      w329Trace.w328Continuity.dealerHardgoodsStatus === 'no_go_until_w325_keep',
    JSON.stringify(w329Trace.w328Continuity));

  assertCase(results, 'evidence-is-missing-or-reviewable',
    w329Trace.evidenceSearch.beaconRidgeTraceFound === false &&
      w329Trace.evidenceSearch.beaconRidgeScreenshotsFound === false &&
      w329Trace.evidenceSearch.traceFileReference === 'pending_user_upload' &&
      w329Trace.decision === 'needs_attention_pending_w325_trace',
    JSON.stringify(w329Trace.evidenceSearch));

  assertCase(results, 'rerun-upload-instructions-are-exact',
    w329Trace.rerunInstructions.customer === 'Beacon Ridge Electrical Supply' &&
      w329Trace.rerunInstructions.website === 'https://www.graybar.com' &&
      w329Trace.rerunInstructions.toggles.createNewItem === true &&
      w329Trace.rerunInstructions.toggles.manufacturing === false &&
      w329Trace.rerunInstructions.toggles.wip === false &&
      w329Trace.rerunInstructions.requiredUploads.length >= 5 &&
      /Upload these evidence files/.test(w329Report),
    JSON.stringify(w329Trace.rerunInstructions));

  assertCase(results, 'live-checks-remain-pending-without-evidence',
    Object.keys(w329Trace.liveChecks || {}).length >= 6 &&
      Object.keys(w329Trace.liveChecks || {}).every((key) => w329Trace.liveChecks[key] === 'pending') &&
      /Completed result passed W151\/W214\/W245/.test(w329Report),
    JSON.stringify(w329Trace.liveChecks));

  assertCase(results, 'w325-and-dealer-hardgoods-remain-no-go',
    w329Trace.goNoGo.w325KeepDecision === 'no_go_until_evidence_uploaded' &&
      w329Trace.goNoGo.dealerHardgoodsExpansion === 'no_go_until_w325_keep' &&
      /Dealer \/ Hardgoods Distribution expansion: no-go/.test(w329Report),
    JSON.stringify(w329Trace.goNoGo));

  assertCase(results, 'w321-w322-w324-baselines-remain-protected',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w322Trace.status === 'distribution_story_polish_ready' &&
      w324Trace.status === 'highest_value_story_pack_selected' &&
      w329Trace.protectedBaselines.w321BaselineProtected === true &&
      w329Trace.protectedBaselines.w322LabelsProtected === true &&
      w329Trace.protectedBaselines.w324ElectricalStoryAvailable === true,
    JSON.stringify(w329Trace.protectedBaselines));

  assertCase(results, 'w144-submit-refresh-import-and-w151-w214-w245-validation-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w329Trace.protectedBaselines.w144SubmitRefreshImportUnchanged === true &&
      w329Trace.protectedBaselines.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Beacon Ridge Electrical Supply|dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods/i.test(sourceLanePacks) &&
      w329Trace.guardrails.sourceLanePacksMutated === false &&
      w329Trace.guardrails.proposedPacksInstalled === false &&
      w329Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w329Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w329Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w329Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w329Trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:review-uploaded-beacon-ridge-or-rerun-w329'] === 'node archive/tools/run_w329_review_uploaded_beacon_ridge_or_rerun_harness.js' &&
      /run_w329_review_uploaded_beacon_ridge_or_rerun_harness/.test(packageJson.scripts.check) &&
      w329Trace.selectedNextBlock.id === 'W330',
    JSON.stringify(w329Trace.selectedNextBlock));

  printResults('W329 review uploaded Beacon Ridge evidence or re-run harness', results);
}

main();
