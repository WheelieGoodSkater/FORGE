#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  loadHooks,
  printResults,
  read,
  readArchiveText,
  root,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const report = readArchiveText('reports', 'w342_runner_naming_marker_liberty_review.md');
  const trace = readJson('/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780079392838.json');
  const state = JSON.parse(JSON.stringify(trace.state || {}));
  const lane = hooks.getLane(state);
  const page = state.pageContext || { title: 'NetSuite Home', url: 'https://td3021666.app.netsuite.com/app/center/card.nl', pageType: 'NetSuite page', contextId: 'generic_netsuite_page', confidence: 'low' };
  const recommendation = hooks.recommendMove(lane, page) || {};
  const traceHtml = hooks.renderTraceView(state, lane, page, recommendation);
  const traceText = stripHtml(traceHtml);
  const exportedMarker = hooks.runnerProofNamingMarkerW341(state);
  const currentMarker = hooks.installedDrawerCurrentBlockMarkerW342();

  assertCase(results, 'liberty-evidence-review-packet-exists',
    /W342: Liberty Runner Naming Marker Evidence Review/.test(report) &&
      /W341 runner naming marker not returned/.test(report),
    'W342 evidence review packet records the marker miss');

  assertCase(results, 'uploaded-liberty-trace-confirms-import-and-marker-miss',
    trace.adapterReadyRecordCreationUxW262 &&
      trace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      trace.runnerProofNamingMarkerW341 &&
      trace.runnerProofNamingMarkerW341.marker === 'W341 runner naming marker not returned',
    JSON.stringify(trace.runnerProofNamingMarkerW341));

  assertCase(results, 'current-block-marker-visible-in-trace',
    currentMarker.marker === 'W342 runner naming verification active' &&
      /W342 runner naming verification active/.test(traceText),
    traceText);

  assertCase(results, 'previous-w332-w339-markers-not-visible-as-normal-trace-chips',
    !/<span class="idb-chip idb-ready">W332 post-import story polish active<\/span>/.test(traceHtml) &&
      !/<span class="idb-chip idb-ready">W339 imported proof record UX active<\/span>/.test(traceHtml) &&
      /Evidence details and markers/.test(traceText) &&
      /Previous marker: W332 post-import story polish active \/ W339 imported proof record UX active/.test(traceText),
    'older markers retained only in collapsed support context');

  assertCase(results, 'runner-naming-marker-visible-and-exportable',
    exportedMarker.marker === 'W341 runner naming marker not returned' &&
      /W341 runner naming marker not returned/.test(traceText) &&
      /runnerProofNamingMarkerW341: runnerProofNamingMarkerW341/.test(userscript),
    JSON.stringify(exportedMarker));

  assertCase(results, 'runner-emits-w341-marker-when-installed',
    /W341 prospect-specific proof naming active/.test(runner) &&
      /IDB W341 prospect proof naming marker/.test(runner) &&
      /prospectSpecificProofNamingMarker/.test(runner),
    'runner contains active W341 marker emission');

  assertCase(results, 'writeback-validation-and-authority-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  printResults('W342 runner naming marker trace focus harness', results);
}

main();
