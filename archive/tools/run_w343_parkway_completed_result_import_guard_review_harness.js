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
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const report = readArchiveText('reports', 'w343_parkway_completed_result_import_guard_review.md');
  const trace = readJson('/Users/aaronsunshine/Downloads/intelligent-demo-builder-trace-1780088384303.json');
  const result = trace.state && trace.state.integratedBuildRunnerResult || {};
  const completed = result.resultCapture && result.resultCapture.finalGeneratedNamesJson || {};
  const guard = result.resultImportGuard || {};
  const records = completed.canonicalRecords || [];
  const names = records.map((record) => record.name || '').join(' | ');

  assertCase(results, 'parkway-trace-records-runner-finished-but-import-rejected',
    result.resultCaptureStatus === 'completed_result_capture_ready' &&
      guard.completedResultPresent === true &&
      guard.completedResultAcceptedByW151 === false &&
      guard.completedResultStatus === 'operating_mode_record_contract_failed',
    JSON.stringify({
      resultCaptureStatus: result.resultCaptureStatus,
      guard
    }));

  assertCase(results, 'parkway-returned-real-record-ids-and-urls',
    records.length >= 5 &&
      records.every((record) => /^\d+$/.test(String(record.internalId || '')) && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(String(record.url || ''))),
    JSON.stringify(records.map((record) => ({ role: record.role, id: record.internalId, url: record.url }))));

  assertCase(results, 'parkway-failure-is-mode-policy-loss-not-runner-death',
    completed.canonicalRuntimeContract &&
      completed.canonicalRuntimeContract.resolvedOperatingMode === '' &&
      /Generic component naming is manufacturing vocabulary when Manufacturing=false/.test(guard.completedResultMessage || '') &&
      /Parkway Contractor Supply Product Availability SKU/.test(names),
    JSON.stringify({
      resolvedOperatingMode: completed.canonicalRuntimeContract && completed.canonicalRuntimeContract.resolvedOperatingMode,
      message: guard.completedResultMessage,
      names
    }));

  assertCase(results, 'adapter-preserves-mode-and-runner-policy-on-promotion',
    /const sidecar = pendingSidecar && pendingSidecar\.partialGeneratedNamesJson/.test(adapter) &&
      /resolvedOperatingMode: sidecar\.resolvedOperatingMode \|\| pendingSidecar\.resolvedOperatingMode/.test(adapter) &&
      /runnerLaneVocabularyPolicy: sidecar\.runnerLaneVocabularyPolicy \|\| pendingSidecar\.runnerLaneVocabularyPolicy/.test(adapter) &&
      /runnerLaneVocabularyPolicy: promoted\.completed\.runnerLaneVocabularyPolicy/.test(adapter),
    'adapter promotion carries sidecar mode and W341 policy into completed result and envelope');

  assertCase(results, 'adapter-normalization-uses-policy-mode-fallback',
    /const vocabularyPolicy = source && source\.runnerLaneVocabularyPolicy/.test(adapter) &&
      /vocabularyPolicy && \(vocabularyPolicy\.modeKey \|\| vocabularyPolicy\.operatingMode\)/.test(adapter) &&
      /runnerLaneVocabularyPolicy: vocabularyPolicy/.test(adapter),
    'normalizeCompletedRunnerResult can recover mode from runnerLaneVocabularyPolicy');

  assertCase(results, 'drawer-w341-marker-reader-checks-promoted-completed-result',
    /state\.integratedBuildRunnerResult\.finalGeneratedNamesJson && state\.integratedBuildRunnerResult\.finalGeneratedNamesJson\.runnerLaneVocabularyPolicy/.test(userscript) &&
      /state\.integratedBuildRunnerResult\.resultCapture\.finalGeneratedNamesJson && state\.integratedBuildRunnerResult\.resultCapture\.finalGeneratedNamesJson\.runnerLaneVocabularyPolicy/.test(userscript) &&
      hooks.installedDrawerCurrentBlockMarkerW342().marker === 'W342 runner naming verification active',
    'drawer can find W341 marker after adapter promotion');

  assertCase(results, 'runner-still-contains-w341-policy-emission',
    /W341 prospect-specific proof naming active/.test(runner) &&
      /prospectSpecificProofNamingMarker/.test(runner) &&
      /runnerLaneVocabularyPolicy/.test(runner),
    'runner W341 marker emission remains present');

  assertCase(results, 'w343-report-documents-next-upload-block',
    /W343: Parkway Completed Result Import Guard Review/.test(report) &&
      /Move through W344: Upload W343 Adapter Preservation Fix/.test(report),
    'W343 report and W344 prompt ready');

  printResults('W343 Parkway completed result import guard review harness', results);
}

main();
