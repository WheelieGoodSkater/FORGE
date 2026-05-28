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
  const w325Trace = readArchiveJson('trace_samples', 'w325_live_smoke_improved_industry_story_surface_trace.json');
  const w326Trace = readArchiveJson('trace_samples', 'w326_live_smoke_evidence_review_next_story_pack_trace.json');
  const w327Report = readArchiveText('reports', 'w327_apply_uploaded_w325_or_prepare_dealer_hardgoods.md');
  const w327Trace = readArchiveJson('trace_samples', 'w327_apply_uploaded_w325_or_prepare_dealer_hardgoods_trace.json');

  assertCase(results, 'w326-continuity-is-preserved',
    w326Trace.status === 'w325_live_evidence_not_uploaded' &&
      w326Trace.decision === 'needs_attention_pending_w325_trace' &&
      w327Trace.w326Continuity.unchanged === true,
    JSON.stringify(w327Trace.w326Continuity));

  assertCase(results, 'w325-evidence-is-present-or-explicitly-missing',
    w327Trace.status === 'w325_evidence_still_missing' &&
      w327Trace.w325Evidence.uploadedTraceFound === false &&
      w327Trace.w325Evidence.uploadedScreenshotsFound === false &&
      w327Trace.w325Evidence.traceFileReference === 'pending_user_upload' &&
      Array.isArray(w327Trace.w325Evidence.screenshotReferences),
    JSON.stringify(w327Trace.w325Evidence));

  assertCase(results, 'no-false-keep-decision-without-uploaded-evidence',
    w327Trace.decision === 'needs_attention_pending_w325_trace' &&
      w327Trace.w325Evidence.falseKeepDecisionPrevented === true &&
      !/Decision: `keep`/.test(w327Report),
    w327Trace.decision);

  assertCase(results, 'evidence-present-review-fields-remain-pending',
    w327Trace.w325ReviewIfEvidencePresent.returnedRecordsReviewed === 'not_applicable_until_upload' &&
      w327Trace.w325ReviewIfEvidencePresent.openLinksReviewed === 'not_applicable_until_upload' &&
      w327Trace.w325ReviewIfEvidencePresent.storyQualityReviewed === 'not_applicable_until_upload' &&
      w327Trace.w325ReviewIfEvidencePresent.keepNeedsAttentionRollbackDecision === 'needs_attention_pending_w325_trace',
    JSON.stringify(w327Trace.w325ReviewIfEvidencePresent));

  assertCase(results, 'dealer-hardgoods-next-pack-is-blocked-until-w325-keep',
    w327Trace.dealerHardgoodsReadiness.candidatePack === 'dealer-hardgoods-review-only' &&
      w327Trace.dealerHardgoodsReadiness.candidateFixture === 'ridgeway-outdoor-power-dealer-hardgoods' &&
      w327Trace.dealerHardgoodsReadiness.status === 'blocked_until_w325_keep' &&
      w327Trace.dealerHardgoodsReadiness.selectedOnlyIfW325Keep === true &&
      w327Trace.dealerHardgoodsReadiness.implementationStarted === false,
    JSON.stringify(w327Trace.dealerHardgoodsReadiness));

  assertCase(results, 'dealer-hardgoods-future-scope-is-prepared-but-not-implemented',
    [
      'buyer problem summary',
      'dealer SKU proof move',
      'allocation replenishment service support story',
      'seasonal spike objection response',
      'DMS OEM portal whiteboard competitive contrast',
      'ROI-safe seasonal risk framing',
      'no-claim caution',
      'weak-evidence confirmation'
    ].every((scope) => w327Trace.dealerHardgoodsReadiness.preparedStoryShapingScope.indexOf(scope) >= 0) &&
      /blocked_until_w325_keep/.test(w327Report),
    JSON.stringify(w327Trace.dealerHardgoodsReadiness.preparedStoryShapingScope));

  assertCase(results, 'w321-w322-w324-w325-baselines-remain-protected',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w322Trace.status === 'distribution_story_polish_ready' &&
      w324Trace.status === 'highest_value_story_pack_selected' &&
      w325Trace.status === 'ready_for_user_live_smoke' &&
      w327Trace.protectedBaselines.w321BaselineProtected === true &&
      w327Trace.protectedBaselines.w322LabelsProtected === true &&
      w327Trace.protectedBaselines.w324ElectricalStoryAvailable === true,
    JSON.stringify(w327Trace.protectedBaselines));

  assertCase(results, 'w144-submit-refresh-import-and-w151-w214-w245-validation-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w327Trace.protectedBaselines.w144SubmitRefreshImportUnchanged === true &&
      w327Trace.protectedBaselines.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods|Beacon Ridge Electrical Supply/i.test(sourceLanePacks) &&
      w327Trace.guardrails.sourceLanePacksMutated === false &&
      w327Trace.guardrails.proposedPacksInstalled === false &&
      w327Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w327Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w327Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w327Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w327Trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:apply-uploaded-w325-or-prepare-dealer-hardgoods-w327'] === 'node archive/tools/run_w327_apply_uploaded_w325_or_prepare_dealer_hardgoods_harness.js' &&
      /run_w327_apply_uploaded_w325_or_prepare_dealer_hardgoods_harness/.test(packageJson.scripts.check) &&
      w327Trace.selectedNextBlock.id === 'W328',
    JSON.stringify(w327Trace.selectedNextBlock));

  printResults('W327 apply uploaded W325 evidence or prepare dealer hardgoods harness', results);
}

main();
