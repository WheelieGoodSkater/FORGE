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
  const report = readArchiveText('reports', 'w339_installed_drawer_version_fingerprint.md');
  const trace = readArchiveJson('trace_samples', 'w339_installed_drawer_version_fingerprint_trace.json');
  const w338Trace = readArchiveJson('trace_samples', 'w338_marker_verified_electrical_story_live_smoke_review_trace.json');
  const uploadedTrace = readJsonFile(w338Trace.traceFile);
  const uploadManifest = readRepoFile('upload_packages', 'forge_w339_installed_drawer_version_fingerprint_upload_2026-05-29', 'UPLOAD_MANIFEST.md');
  const packagedDrawer = readRepoFile('upload_packages', 'forge_w339_installed_drawer_version_fingerprint_upload_2026-05-29', 'idb-drawer.user.js');
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
  const traceHtml = hooks.renderTraceView(state, lane, state.pageContext, recommendation);
  const runText = stripHtml(runHtml);
  const buildText = stripHtml(buildHtml);
  const traceText = stripHtml(traceHtml);
  const fingerprint = hooks.installedDrawerVersionFingerprintW339();
  const currentCopyTerms = [
    'Use imported proof records',
    'Use returned NetSuite proof records',
    'Run will use these imported proof records',
    'Imported NetSuite proof records'
  ];
  const oldCopyTerms = [
    'Use final build names',
    'Use imported final generated names',
    'Run will use these final generated names',
    'Final generated NetSuite records'
  ];
  const renderedText = `${runText} ${buildText}`;

  assertCase(results, 'w338-review-packet-remains-available',
    w338Trace.status === 'reviewed_needs_attention_installed_version_proof' &&
      w338Trace.uxFindings.rootCauseDecision === 'installed_drawer_version_drift_or_cache',
    JSON.stringify({ status: w338Trace.status, rootCause: w338Trace.uxFindings.rootCauseDecision }));

  assertCase(results, 'w339-fingerprint-source-and-hook-exist',
    /installedDrawerVersionFingerprintW339/.test(userscript) &&
      fingerprint.schema === 'forge.installed-drawer-version-fingerprint.w339.v1' &&
      fingerprint.markerId === 'W339_IMPORTED_PROOF_RECORD_UX' &&
      fingerprint.marker === 'W339 imported proof record UX active',
    JSON.stringify(fingerprint));

  assertCase(results, 'current-block-marker-visible-and-w339-retained-as-support-context',
    /W342 runner naming verification active/.test(traceHtml) &&
      /Evidence details and markers/.test(traceText) &&
      /Current marker: W342 runner naming verification active/.test(traceText) &&
      /Previous marker: W332 post-import story polish active \/ W339 imported proof record UX active/.test(traceText) &&
      !/Installed drawer fingerprint: W339 imported proof record UX active/.test(traceText),
    traceText);

  assertCase(results, 'w339-fingerprint-in-exported-trace-model',
    /installedDrawerVersionFingerprintW339: installedDrawerVersionFingerprintW339\(\)/.test(userscript) &&
      trace.installedDrawerVersionFingerprintW339.marker === 'W339 imported proof record UX active',
    JSON.stringify(trace.installedDrawerVersionFingerprintW339));

  assertCase(results, 'copy-fingerprint-includes-imported-proof-record-ux-strings',
    currentCopyTerms.every((term) => fingerprint.copyFingerprint.includes(term)) &&
      currentCopyTerms.every((term) => report.includes(term)) &&
      currentCopyTerms.every((term) => packagedDrawer.includes(term)),
    JSON.stringify(fingerprint.copyFingerprint));

  assertCase(results, 'old-normal-consultant-copy-absent-from-current-build-run',
    oldCopyTerms.every((term) => !renderedText.includes(term)),
    JSON.stringify(oldCopyTerms.filter((term) => renderedText.includes(term))));

  assertCase(results, 'current-rendered-build-run-uses-imported-proof-record-copy',
    /Use imported proof records/.test(runText) &&
      /Use returned NetSuite proof records/.test(runText) &&
      /Run will use these imported proof records/.test(buildText) &&
      /Imported NetSuite proof records/.test(buildText),
    JSON.stringify({ run: runText.slice(0, 600), build: buildText.slice(0, 600) }));

  assertCase(results, 'upload-package-manifest-is-drawer-only-and-marker-gated',
    /Upload drawer only/i.test(uploadManifest) &&
      /Do not upload runner/i.test(uploadManifest) &&
      /Do not upload adapter/i.test(uploadManifest) &&
      /verify W339 fingerprint before running another smoke/i.test(uploadManifest) &&
      /Installed drawer fingerprint: W339 imported proof record UX active/.test(uploadManifest) &&
      fs.existsSync(path.join(root, 'upload_packages', 'forge_w339_installed_drawer_version_fingerprint_upload_2026-05-29.zip')),
    uploadManifest);

  assertCase(results, 'w144-w151-w214-w245-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  assertCase(results, 'runner-adapter-and-source-lane-packs-remain-unchanged',
    /v4\.0\.0-runner-sandbox/.test(runner) &&
      !/Summit Ridge Electrical|Electrical Components Distributor/.test(lanePacks) &&
      trace.guardrails.runnerChanged === false &&
      trace.guardrails.adapterChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-runtime-authority-drawer-write-or-fake-link-changes',
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false &&
      !/createRecord\(|record\.create\(|submitFields\(|nlapiSubmitRecord/i.test(userscript),
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:installed-drawer-version-fingerprint-w339'] === 'node archive/tools/run_w339_installed_drawer_version_fingerprint_harness.js' &&
      /run_w339_installed_drawer_version_fingerprint_harness/.test(packageJson.scripts.check),
    'W339 harness registered');

  printResults('W339 installed drawer version fingerprint harness', results);
}

main();
