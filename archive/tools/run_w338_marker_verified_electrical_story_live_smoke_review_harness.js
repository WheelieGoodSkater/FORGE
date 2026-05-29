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

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function main() {
  const results = [];
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const lanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w337ZipDrawer = readRepoFile('upload_packages', 'forge_w337_electrical_story_final_ux_polish_upload_2026-05-29', 'idb-drawer.user.js');
  const report = readArchiveText('reports', 'w338_marker_verified_electrical_story_live_smoke_review.md');
  const trace = readArchiveJson('trace_samples', 'w338_marker_verified_electrical_story_live_smoke_review_trace.json');
  const uploadedTrace = readJsonFile(trace.traceFile);
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
  const buildHtml = hooks.renderReviewView(state, lane, state.pageContext, recommendation);
  const valueHtml = hooks.renderValueReviewView(state, lane, state.pageContext, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, state.pageContext, recommendation);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);
  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const runText = stripHtml(runHtml);
  const buildText = stripHtml(buildHtml);
  const valueText = stripHtml(valueHtml);
  const oldCopyTerms = [
    'Use final build names',
    'Use imported final generated names',
    'Run will use these final generated names',
    'Final generated NetSuite records'
  ];
  const currentRenderedOldCopy = oldCopyTerms.filter((term) => runText.includes(term) || buildText.includes(term));
  const noteSpecificTerms = [
    'supplier portals',
    'transfer spreadsheets',
    'text threads',
    'branch inventory checks',
    'manual counter promise'
  ];

  assertCase(results, 'w338-review-packet-exists',
    /W338: Marker-Verified Electrical Story UX Live Smoke Review/.test(report) &&
      trace.status === 'reviewed_needs_attention_installed_version_proof' &&
      trace.customer === 'Summit Ridge Electrical Supply',
    JSON.stringify({ status: trace.status, customer: trace.customer }));

  assertCase(results, 'summit-ridge-trace-confirms-writeback-import-open-links',
    uploadedTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      uploadedTrace.state.dccFinalNamingResult.status === 'dcc_final_names_imported' &&
      openableRecords.length >= 5 &&
      openableRecords.every((record) => record.id && record.safeToOpen === true && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(record.supportedOpenUrl || '')),
    JSON.stringify(openableRecords.map((record) => ({ label: record.consultantLabel, id: record.id }))));

  assertCase(results, 'trace-marker-is-w332-only-and-not-enough-for-w337-proof',
    uploadedTrace.installedDrawerRuntimeMarkerW332.marker === 'W332 post-import story polish active' &&
      /W332 post-import story polish active/.test(traceHtml) &&
      trace.uxFindings.rootCauseDecision === 'installed_drawer_version_drift_or_cache',
    JSON.stringify(uploadedTrace.installedDrawerRuntimeMarkerW332));

  assertCase(results, 'screenshots-find-old-copy-but-current-source-renders-w337-copy',
    trace.uxFindings.oldRunCopyStillVisibleInScreenshots === true &&
      trace.uxFindings.oldBuildCopyStillVisibleInScreenshots === true &&
      currentRenderedOldCopy.length === 0 &&
      /Use imported proof records/.test(runText) &&
      /Use returned NetSuite proof records for the next object pivot/.test(runText) &&
      /Imported NetSuite proof records/.test(buildText) &&
      /Run will use these imported proof records for the live story/.test(buildText),
    JSON.stringify({ currentRenderedOldCopy, run: runText.slice(0, 800), build: buildText.slice(0, 800) }));

  assertCase(results, 'w337-upload-package-contained-correct-copy',
    /Use imported proof records/.test(w337ZipDrawer) &&
      /Use returned NetSuite proof records for the next object pivot/.test(w337ZipDrawer) &&
      /Run will use these imported proof records for the live story/.test(w337ZipDrawer) &&
      !/Use imported final generated names for the next object pivot/.test(w337ZipDrawer),
    'W337 upload drawer contains corrected copy');

  assertCase(results, 'roi-competitive-remains-note-specific-and-claim-safe',
    noteSpecificTerms.every((term) => new RegExp(term, 'i').test(valueText)) &&
      /baseline before claiming savings|baseline before they can be claimed/i.test(valueText + runText) &&
      !/guaranteed delivery|guaranteed savings|will save/i.test(valueText + runText),
    valueText.slice(valueText.indexOf('Likely competitive pressure'), valueText.indexOf('Why this matters')));

  assertCase(results, 'returned-record-labels-remain-distribution-safe',
    trace.returnedRecords.every((record) => record.id && record.openLinkSupported === true) &&
      ['Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU'].every((label) => trace.returnedRecords.some((record) => record.label === label)) &&
      !/Finished\/Assembly|Formula|Work Order|Routing|WIP/.test(runHtml + buildHtml),
    JSON.stringify(trace.returnedRecords));

  assertCase(results, 'w144-w151-w214-w245-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  assertCase(results, 'no-authority-runner-adapter-source-pack-or-fake-link-changes',
    !/Summit Ridge Electrical|Electrical Components Distributor/.test(lanePacks) &&
      /v4\.0\.0-runner-sandbox/.test(runner) &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.runnerChanged === false &&
      trace.guardrails.adapterChanged === false &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:marker-verified-electrical-story-live-smoke-review-w338'] === 'node archive/tools/run_w338_marker_verified_electrical_story_live_smoke_review_harness.js' &&
      /run_w338_marker_verified_electrical_story_live_smoke_review_harness/.test(packageJson.scripts.check),
    'W338 harness registered');

  printResults('W338 marker-verified electrical story live smoke review harness', results);
}

main();
