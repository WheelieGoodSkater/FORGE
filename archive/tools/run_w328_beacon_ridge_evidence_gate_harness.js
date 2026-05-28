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
  const w327Trace = readArchiveJson('trace_samples', 'w327_apply_uploaded_w325_or_prepare_dealer_hardgoods_trace.json');
  const w328Report = readArchiveText('reports', 'w328_beacon_ridge_evidence_gate.md');
  const w328Trace = readArchiveJson('trace_samples', 'w328_beacon_ridge_evidence_gate_trace.json');

  assertCase(results, 'w328-evidence-gate-packet-exists',
    /W328: Beacon Ridge Evidence Gate/.test(w328Report) &&
      w328Trace.schema === 'forge.w328.beacon-ridge-evidence-gate.trace.v1' &&
      w328Trace.status === 'beacon_ridge_evidence_missing',
    JSON.stringify({ schema: w328Trace.schema, status: w328Trace.status }));

  assertCase(results, 'w327-continuity-is-preserved',
    w327Trace.status === 'w325_evidence_still_missing' &&
      w327Trace.decision === 'needs_attention_pending_w325_trace' &&
      w328Trace.w327Continuity.unchanged === true &&
      w328Trace.w327Continuity.dealerHardgoodsStatus === 'blocked_until_w325_keep',
    JSON.stringify(w328Trace.w327Continuity));

  assertCase(results, 'beacon-ridge-evidence-is-explicitly-missing',
    w328Trace.evidenceSearch.beaconRidgeTraceFound === false &&
      w328Trace.evidenceSearch.beaconRidgeScreenshotsFound === false &&
      w328Trace.evidenceSearch.traceFileReference === 'pending_user_upload' &&
      Array.isArray(w328Trace.evidenceSearch.screenshotReferences),
    JSON.stringify(w328Trace.evidenceSearch));

  assertCase(results, 'live-checks-remain-pending-without-evidence',
    Object.keys(w328Trace.liveChecks || {}).length >= 6 &&
      Object.keys(w328Trace.liveChecks || {}).every((key) => w328Trace.liveChecks[key] === 'pending') &&
      /Submit runnerTaskId capture/.test(w328Report),
    JSON.stringify(w328Trace.liveChecks));

  assertCase(results, 'w325-and-dealer-hardgoods-remain-no-go',
    w328Trace.decision === 'needs_attention_pending_w325_trace' &&
      w328Trace.goNoGo.w325KeepDecision === 'no_go_until_evidence_uploaded' &&
      w328Trace.goNoGo.dealerHardgoodsExpansion === 'no_go_until_w325_keep' &&
      /Dealer \/ Hardgoods Distribution expansion: no-go/.test(w328Report),
    JSON.stringify(w328Trace.goNoGo));

  assertCase(results, 'w321-w322-w324-baselines-remain-protected',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w322Trace.status === 'distribution_story_polish_ready' &&
      w324Trace.status === 'highest_value_story_pack_selected' &&
      w328Trace.protectedBaselines.w321BaselineProtected === true &&
      w328Trace.protectedBaselines.w322LabelsProtected === true &&
      w328Trace.protectedBaselines.w324ElectricalStoryAvailable === true,
    JSON.stringify(w328Trace.protectedBaselines));

  assertCase(results, 'w144-submit-refresh-import-and-w151-w214-w245-validation-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w328Trace.protectedBaselines.w144SubmitRefreshImportUnchanged === true &&
      w328Trace.protectedBaselines.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Beacon Ridge Electrical Supply|dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods/i.test(sourceLanePacks) &&
      w328Trace.guardrails.sourceLanePacksMutated === false &&
      w328Trace.guardrails.proposedPacksInstalled === false &&
      w328Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w328Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w328Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w328Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w328Trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:beacon-ridge-evidence-gate-w328'] === 'node archive/tools/run_w328_beacon_ridge_evidence_gate_harness.js' &&
      /run_w328_beacon_ridge_evidence_gate_harness/.test(packageJson.scripts.check) &&
      w328Trace.selectedNextBlock.id === 'W329',
    JSON.stringify(w328Trace.selectedNextBlock));

  printResults('W328 Beacon Ridge evidence gate harness', results);
}

main();
