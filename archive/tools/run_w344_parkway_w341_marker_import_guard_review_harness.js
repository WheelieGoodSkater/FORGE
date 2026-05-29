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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const report = readArchiveText('reports', 'w344_parkway_w341_marker_import_guard_review.md');
  const trace = readJson('/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780092135325.json');
  const state = trace.state || {};
  const lane = hooks.getLane(state);
  const page = state.pageContext || {};
  const recommendation = hooks.recommendMove(lane, page) || {};
  const payload = state.integratedBuildRunnerResult && state.integratedBuildRunnerResult.resultCapture && state.integratedBuildRunnerResult.resultCapture.finalGeneratedNamesJson || {};
  const guard = hooks.validateDccFinalNamingImportPayload(payload, state, lane, page, recommendation);
  const marker = hooks.runnerProofNamingMarkerW341(state);
  const componentItems = guard.finalNaming && guard.finalNaming.componentItems || [];

  assertCase(results, 'parkway-w341-marker-is-live-in-trace',
    marker.active === true &&
      marker.marker === 'W341 prospect-specific proof naming active' &&
      marker.proofNames &&
      marker.proofNames.componentItemName === 'Parkway Safe Substitute Fulfillment Support SKU',
    JSON.stringify(marker));

  assertCase(results, 'adapter-mode-policy-preservation-is-now-live',
    payload.resolvedOperatingMode === 'distribution_replenishment' &&
      payload.runnerLaneVocabularyPolicy &&
      payload.runnerLaneVocabularyPolicy.modeKey === 'distribution_replenishment',
    JSON.stringify({
      resolvedOperatingMode: payload.resolvedOperatingMode,
      policy: payload.runnerLaneVocabularyPolicy
    }));

  assertCase(results, 'drawer-preserves-supporting-sku-role-from-legacy-component-slot',
    guard.valid === true &&
      guard.semanticGuard &&
      guard.semanticGuard.status === 'operating_mode_record_contract_passed' &&
      componentItems.some((record) => record.role === 'supporting_sku' && /Fulfillment Support SKU/.test(record.name || '')),
    JSON.stringify({
      valid: guard.valid,
      status: guard.status,
      semanticStatus: guard.semanticGuard && guard.semanticGuard.status,
      violations: guard.semanticGuard && guard.semanticGuard.violations,
      componentItems
    }));

  assertCase(results, 'runner-forces-w341-distribution-support-proof-name',
    /const policyProofName = laneVocabularyPolicy && laneVocabularyPolicy\.modeKey === 'distribution_replenishment'/.test(runner) &&
      /laneVocabularyPolicy\.prospectSpecificProofNames\.componentItemName/.test(runner) &&
      /const componentName = policyProofName \|\| roleSpecificGeneratedItemName/.test(runner),
    'runner uses W341 componentItemName directly for distribution support item');

  assertCase(results, 'drawer-version-bumped-for-auto-update',
    /@version\s+1\.0\.3/.test(userscript) &&
      /raw\.githubusercontent\.com\/WheelieGoodSkater\/FORGE\/main\/idb-drawer\.user\.js/.test(userscript),
    'drawer auto-update metadata points at GitHub raw and version is 1.0.3');

  assertCase(results, 'w344-report-documents-next-upload-block',
    /W344: Parkway W341 Marker Import Guard Review/.test(report) &&
      /Move through W345: Upload W344 Drawer And Runner Role\/Name Fix/.test(report),
    'W344 report and W345 next block ready');

  printResults('W344 Parkway W341 marker import guard review harness', results);
}

main();
