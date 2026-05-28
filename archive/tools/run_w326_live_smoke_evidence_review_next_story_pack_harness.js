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
  const w326Report = readArchiveText('reports', 'w326_live_smoke_evidence_review_next_story_pack.md');
  const w326Trace = readArchiveJson('trace_samples', 'w326_live_smoke_evidence_review_next_story_pack_trace.json');

  assertCase(results, 'w325-evidence-review-packet-exists',
    /W326: Live Smoke Evidence Review/.test(w326Report) &&
      w326Trace.schema === 'forge.w326.live-smoke-evidence-review-next-story-pack.trace.v1' &&
      w326Trace.status === 'w325_live_evidence_not_uploaded',
    JSON.stringify({ schema: w326Trace.schema, status: w326Trace.status }));

  assertCase(results, 'uploaded-trace-and-screenshot-references-are-explicit',
    w326Trace.evidenceReview.traceFileReference === 'pending_user_upload' &&
      Array.isArray(w326Trace.evidenceReview.screenshotReferences) &&
      w326Trace.evidenceReview.uploadedTraceFound === false &&
      w326Trace.evidenceReview.uploadedScreenshotsFound === false,
    JSON.stringify(w326Trace.evidenceReview));

  assertCase(results, 'decision-is-explicit-and-not-falsely-keep',
    w326Trace.decision === 'needs_attention_pending_w325_trace' &&
      /Decision: `needs_attention_pending_w325_trace`/.test(w326Report) &&
      !/Decision: `keep`/.test(w326Report),
    w326Trace.decision);

  assertCase(results, 'returned-record-names-labels-ids-and-open-links-are-reviewed-as-pending',
    w326Trace.returnedRecordsReviewed.status === 'pending_live_evidence' &&
      ['Customer', 'Sales Order', 'Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU']
        .every((label) => w326Trace.returnedRecordsReviewed.expectedLabels.indexOf(label) >= 0) &&
      Array.isArray(w326Trace.returnedRecordsReviewed.names) &&
      Array.isArray(w326Trace.returnedRecordsReviewed.numericIds) &&
      Array.isArray(w326Trace.returnedRecordsReviewed.supportedOpenLinks),
    JSON.stringify(w326Trace.returnedRecordsReviewed));

  assertCase(results, 'w324-story-behavior-is-evaluated-against-w325-expectations',
    w324Trace.selection.selectedPack === 'electrical-components-distributor-review-only' &&
      w325Trace.protectedBaselines.w324ElectricalStorySurfaceActive === true &&
      ['buyerProblemClarity', 'proofMoveUsefulness', 'objectionResponseQuality', 'competitiveContrast', 'roiSafeValueFraming', 'noClaimCaution', 'weakEvidenceHonesty']
        .every((key) => Object.prototype.hasOwnProperty.call(w326Trace.storyQualityFindings, key)) &&
      w326Trace.guardrails.w324StoryBehaviorEvaluatedAgainstW325Expectations === true,
    JSON.stringify(w326Trace.storyQualityFindings));

  assertCase(results, 'w322-labels-and-w321-writeback-baseline-remain-protected',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w322Trace.status === 'distribution_story_polish_ready' &&
      w326Trace.guardrails.w321BaselineUnchanged === true &&
      w326Trace.guardrails.w322LabelsProtected === true,
    JSON.stringify({ w321: w321Trace.status, w322: w322Trace.status }));

  assertCase(results, 'w144-submit-refresh-import-and-w151-w214-w245-validation-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w326Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w326Trace.guardrails.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Beacon Ridge Electrical Supply|dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods/i.test(sourceLanePacks) &&
      w326Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w326Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w326Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w326Trace.guardrails.sourcePackMutationIntroduced === false &&
      w326Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w326Trace.guardrails));

  assertCase(results, 'selected-next-story-pack-is-conditional-dealer-hardgoods',
    w326Trace.selectedNextIndustryStoryPack.status === 'conditional_after_w325_keep' &&
      w326Trace.selectedNextIndustryStoryPack.pack === 'dealer-hardgoods-review-only' &&
      w326Trace.selectedNextIndustryStoryPack.candidateFixture === 'ridgeway-outdoor-power-dealer-hardgoods' &&
      /dealer\/hardgoods distribution/i.test(w326Report),
    JSON.stringify(w326Trace.selectedNextIndustryStoryPack));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:live-smoke-evidence-review-next-story-pack-w326'] === 'node archive/tools/run_w326_live_smoke_evidence_review_next_story_pack_harness.js' &&
      /run_w326_live_smoke_evidence_review_next_story_pack_harness/.test(packageJson.scripts.check) &&
      w326Trace.selectedNextBlock.id === 'W327',
    JSON.stringify(w326Trace.selectedNextBlock));

  printResults('W326 live smoke evidence review and next story pack harness', results);
}

main();
