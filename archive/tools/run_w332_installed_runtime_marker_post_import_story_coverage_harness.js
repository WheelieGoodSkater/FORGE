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
  const lanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w332Report = readArchiveText('reports', 'w332_installed_runtime_marker_post_import_story_coverage.md');
  const w332Trace = readArchiveJson('trace_samples', 'w332_installed_runtime_marker_post_import_story_coverage_trace.json');
  const uploadedTrace = readJsonFile(w332Trace.evidence.uploadedTraceFile);
  const hooks = loadHooks();

  const state = JSON.parse(JSON.stringify(uploadedTrace.state));
  state.selectedActionId = 'prove';
  state.pageContext = state.pageContext || {
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
  const selectedMove = lane.moves[2] || lane.primaryMove || 'Inventory / Fulfillment';
  const runHtml = hooks.renderRunView(state, lane, state.pageContext, recommendation, selectedMove, { id: 'prove' }, {});
  const traceHtml = hooks.renderTraceView(state, lane, state.pageContext, recommendation);
  const story = hooks.consultantStorySurfaceFromLanePackW247(state, null, state.dccFinalNamingResult);
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);
  const marker = hooks.installedDrawerRuntimeMarkerW332();

  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const normalUi = `${runHtml} ${traceHtml}`;
  const legacyRunLabels = [
    'Hero item',
    'Matrix item / proof item',
    'Component item 1',
    'Finished/Assembly',
    'Formula',
    'Work Order',
    'Routing',
    'WIP'
  ].filter((term) => runHtml.includes(term));
  const storyText = [
    story.openTarget,
    story.proofMove,
    story.safeClaim,
    story.buyerFacingSoWhat,
    story.firstCallSummaryW322,
    firstGlance.nextAction
  ].join(' ');

  assertCase(results, 'northline-evidence-review-packet-exists',
    /W332: Installed Drawer Runtime Marker And Post-Import Story Coverage/.test(w332Report) &&
      w332Trace.schema === 'forge.w332.installed-runtime-marker-post-import-story-coverage.trace.v1' &&
      w332Trace.evidence.customer === 'Northline Electrical & Contractor Supply',
    JSON.stringify({ schema: w332Trace.schema, customer: w332Trace.evidence.customer }));

  assertCase(results, 'northline-trace-confirms-imported-records-and-open-links',
    uploadedTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      uploadedTrace.state.dccFinalNamingResult.status === 'dcc_final_names_imported' &&
      openableRecords.length >= 5 &&
      openableRecords.every((record) => record.id && record.safeToOpen === true && record.supportedOpenUrl),
    JSON.stringify(openableRecords.map((record) => ({ label: record.consultantLabel || record.label, id: record.id }))));

  assertCase(results, 'installed-runtime-marker-visible-and-exportable',
    marker.marker === 'W332 post-import story polish active' &&
      /W332 post-import story polish active/.test(traceHtml) &&
      /installedDrawerRuntimeMarkerW332: installedDrawerRuntimeMarkerW332\(\)/.test(userscript) &&
      /W332 post-import story polish active/.test(w332Trace.runtimeMarker),
    JSON.stringify(marker));

  assertCase(results, 'post-import-story-surface-uses-imported-record-guidance',
    !/Confirm lane before opening proof records/.test(runHtml) &&
      /Use imported records: open/.test(story.openTarget) &&
      /Open the returned record and prove only what the receipt supports/.test(firstGlance.nextAction) &&
      /lane and ROI claims still need buyer confirmation/i.test(story.safeClaim),
    JSON.stringify({ openTarget: story.openTarget, nextAction: firstGlance.nextAction, safeClaim: story.safeClaim }));

  assertCase(results, 'run-navigation-uses-consultant-labels-and-blocks-legacy-labels',
    /Product SKU/.test(runHtml) &&
      /Availability\/Replenishment Flow/.test(runHtml) &&
      /Supporting SKU/.test(runHtml) &&
      legacyRunLabels.length === 0,
    JSON.stringify({ legacyRunLabels }));

  assertCase(results, 'electrical-story-remains-specific-and-claim-safe',
    /contractor counter/i.test(storyText) &&
      /branch transfer/i.test(storyText) &&
      /replenishment/i.test(storyText) &&
      /supplier portal/i.test(storyText) &&
      /callbacks/i.test(storyText) &&
      /urgent alternates/i.test(storyText) &&
      /margin-safe substitutes/i.test(storyText),
    storyText);

  assertCase(results, 'pre-import-fake-open-links-remain-blocked',
    /No Open links yet|Links appear when ready|fake Open links remain blocked/i.test(userscript + w332Report),
    'pre-import fake links remain blocked in source/report');

  assertCase(results, 'w144-and-validation-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      w332Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w332Trace.guardrails.w151W214W245ValidationUnchanged === true,
    'writeback and validation anchors remain present');

  assertCase(results, 'normal-ui-hides-diagnostics-and-authority-is-unchanged',
    !/endpointUrl|runnerTaskId|schemaName|stack trace/i.test(normalUi) &&
      !/Northline Electrical|Electrical Components Distributor/.test(lanePacks) &&
      w332Trace.guardrails.sourceLanePacksMutated === false &&
      w332Trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      w332Trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      w332Trace.guardrails.drawerTransactionWritesIntroduced === false &&
      w332Trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(w332Trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:installed-runtime-marker-post-import-story-coverage-w332'] === 'node archive/tools/run_w332_installed_runtime_marker_post_import_story_coverage_harness.js' &&
      /run_w332_installed_runtime_marker_post_import_story_coverage_harness/.test(packageJson.scripts.check),
    'W332 harness registered');

  printResults('W332 installed runtime marker and post-import story coverage harness', results);
}

main();
