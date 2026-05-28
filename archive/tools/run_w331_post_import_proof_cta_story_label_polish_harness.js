#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  loadHooks,
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
  const w330Trace = readArchiveJson('trace_samples', 'w330_crescent_live_smoke_evidence_review_trace.json');
  const w331Report = readArchiveText('reports', 'w331_post_import_proof_cta_story_label_polish.md');
  const w331Trace = readArchiveJson('trace_samples', 'w331_post_import_proof_cta_story_label_polish_trace.json');
  const liveTrace = readJsonFile(w330Trace.evidence.traceFile);

  const hooks = loadHooks();
  const state = JSON.parse(JSON.stringify(liveTrace.state));
  state.selectedActionId = 'prove';
  state.pageContext = state.pageContext || liveTrace.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const recommendation = hooks.recommendMove(lane, state.pageContext) || {};
  if (!recommendation.move) recommendation.move = lane.primaryMove || 'Branch Availability Control';
  const runHtml = hooks.renderRunView(state, lane, state.pageContext, recommendation, lane.primaryMove, { id: 'prove' }, {});
  const story = hooks.consultantStorySurfaceFromLanePackW247(state, null, state.dccFinalNamingResult);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);

  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const runNavigationText = runHtml.replace(/\s+/g, ' ');
  const legacyRunLabels = [
    'Hero item',
    'Matrix item / proof item',
    'Component item 1',
    'Finished/Assembly',
    'Formula',
    'Work Order',
    'Routing',
    'WIP'
  ].filter((term) => runNavigationText.includes(term));
  const storyText = [
    story.openTarget,
    story.proofMove,
    story.safeClaim,
    story.buyerFacingSoWhat,
    story.firstCallSummaryW322
  ].join(' ');

  assertCase(results, 'w331-packets-exist',
    /W331: Post-Import Proof CTA And Story Label Polish/.test(w331Report) &&
      w331Trace.schema === 'forge.w331.post-import-proof-cta-story-label-polish.trace.v1' &&
      w331Trace.status === 'post_import_story_label_polish_ready_for_live_smoke',
    JSON.stringify({ schema: w331Trace.schema, status: w331Trace.status }));

  assertCase(results, 'w330-evidence-review-remains-available',
    w330Trace.connectionDecision === 'keep' &&
      w330Trace.storyProofSurfaceDecision === 'needs_attention_before_dealer_hardgoods' &&
      fs.existsSync(w330Trace.evidence.traceFile) &&
      liveTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported',
    JSON.stringify({ decision: w330Trace.connectionDecision, readiness: liveTrace.adapterReadyRecordCreationUxW262.readinessState }));

  assertCase(results, 'post-import-cta-uses-imported-record-guidance',
    story.status === 'story_ready_needs_lane_confirmation' &&
      /Use imported records: open/.test(story.openTarget) &&
      !/^Confirm lane before opening proof records/.test(story.openTarget) &&
      /lane and ROI claims still need buyer confirmation/i.test(story.safeClaim),
    JSON.stringify({ status: story.status, openTarget: story.openTarget, safeClaim: story.safeClaim }));

  assertCase(results, 'pre-import-fake-open-links-remain-blocked',
    /Confirm lane before opening proof records/.test(userscript) &&
      /fake Open-link blocking|fake Open links remain blocked|No Open links yet/i.test(userscript + w331Report),
    'pre-import confirmation/open-link blocking language remains available');

  assertCase(results, 'imported-records-keep-names-ids-and-supported-open-links',
    openableRecords.length >= 5 &&
      openableRecords.every((record) => record.name && record.id && record.supportedOpenUrl && record.safeToOpen === true),
    JSON.stringify(openableRecords.map((record) => ({ label: record.consultantLabel || record.label, id: record.id, safeToOpen: record.safeToOpen }))));

  assertCase(results, 'run-navigation-prefers-consultant-labels',
    /Product SKU/.test(runNavigationText) &&
      /Availability\/Replenishment Flow/.test(runNavigationText) &&
      /Supporting SKU/.test(runNavigationText) &&
      legacyRunLabels.length === 0 &&
      /item\.consultantLabel \|\| item\.label/.test(userscript),
    JSON.stringify({ legacyRunLabels }));

  assertCase(results, 'electrical-story-language-is-specific-and-claim-safe',
    /contractor counter availability/i.test(storyText) &&
      /branch transfer/i.test(storyText) &&
      /replenishment/i.test(storyText) &&
      /supplier portal/i.test(storyText) &&
      /transfer spreadsheets/i.test(storyText) &&
      /text threads/i.test(storyText) &&
      /callbacks/i.test(storyText) &&
      /urgent alternates/i.test(storyText) &&
      /margin-safe substitutes/i.test(storyText) &&
      /Keep lane confidence confirmation-first|weak lane evidence visible/i.test(storyText),
    storyText);

  assertCase(results, 'w144-and-validation-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w331Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w331Trace.guardrails.w151W214W245ValidationUnchanged === true,
    'writeback and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Beacon Ridge Electrical Supply|dealer-hardgoods-review-only|ridgeway-outdoor-power-dealer-hardgoods/i.test(sourceLanePacks) &&
      w331Trace.guardrails.sourceLanePacksMutated === false &&
      w331Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w331Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w331Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w331Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w331Trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:post-import-proof-cta-story-label-polish-w331'] === 'node archive/tools/run_w331_post_import_proof_cta_story_label_polish_harness.js' &&
      /run_w331_post_import_proof_cta_story_label_polish_harness/.test(packageJson.scripts.check),
    'W331 harness registered');

  printResults('W331 post-import proof CTA and story label polish harness', results);
}

main();
