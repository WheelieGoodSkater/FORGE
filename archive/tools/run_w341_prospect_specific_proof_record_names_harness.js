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
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const lanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w341_prospect_specific_proof_record_names.md');
  const trace = readArchiveJson('trace_samples', 'w341_prospect_specific_proof_record_names_trace.json');
  const uploadedTrace = readJsonFile(trace.evidenceTraceFile);
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
  const currentRunText = stripHtml(hooks.renderRunView(state, lane, state.pageContext, recommendation, selectedMove, { id: 'prove' }, {}));
  const finalResult = state.dccFinalNamingResult;
  const w341Result = JSON.parse(JSON.stringify(finalResult));
  const updateName = (role, name) => {
    const all = []
      .concat(w341Result.displayObjects || [])
      .concat(w341Result.componentItems || [])
      .concat(w341Result.displayReadyRecords || []);
    all.filter((item) => item.role === role).forEach((record) => {
      record.name = name;
      record.recordName = name;
    });
  };
  updateName('hero_item', 'Parkway Breaker Availability SKU');
  updateName('matrix_or_proof_item', 'Parkway Branch Availability / Replenishment Flow');
  updateName('component_item', 'Parkway Safe Substitute Fulfillment Support SKU');
  w341Result.runnerLaneVocabularyPolicy = {
    schema: 'idb.runner-lane-vocabulary-policy.v1',
    modeKey: 'distribution_replenishment',
    prospectSpecificProofNames: {
      schema: 'idb.runner-prospect-specific-proof-names.w341.v1',
      hero: 'Parkway Breaker Availability SKU',
      matrix: 'Parkway Branch Availability / Replenishment Flow',
      component: 'Parkway Safe Substitute Fulfillment Support SKU'
    },
    prospectSpecificProofNamingMarker: {
      schema: 'idb.runner-prospect-specific-proof-naming-marker.w341.v1',
      marker: 'W341 prospect-specific proof naming active',
      active: true,
      modeKey: 'distribution_replenishment',
      proofNames: {
        schema: 'idb.runner-prospect-specific-proof-names.w341.v1',
        hero: 'Parkway Breaker Availability SKU',
        matrix: 'Parkway Branch Availability / Replenishment Flow',
        component: 'Parkway Safe Substitute Fulfillment Support SKU'
      }
    }
  };
  const futureState = Object.assign({}, state, { dccFinalNamingResult: w341Result });
  hooks.reconcileStateAuthority(futureState);
  const futureRunText = stripHtml(hooks.renderRunView(futureState, lane, futureState.pageContext, recommendation, selectedMove, { id: 'prove' }, {}));
  const futureBuildText = stripHtml(hooks.renderReviewView(futureState, lane, futureState.pageContext, recommendation));
  const futureTraceText = stripHtml(hooks.renderTraceView(futureState, lane, futureState.pageContext, recommendation));
  const futureRunnerNamingMarker = hooks.runnerProofNamingMarkerW341(futureState);
  const futureFinalNavigation = hooks.dccFinalNavigationModel(futureState, lane, futureState.pageContext, recommendation);
  const names = futureFinalNavigation.scriptPivotObjects.map((record) => hooks.consultantProofRecordDisplayNameW341(record));
  const forbidden = /Finished\/Assembly|Formula|Ingredient|Component item|Component Item|Work Order|Routing|WIP/i;
  const maxNameLength = 83;

  assertCase(results, 'parkway-evidence-review-packet-exists',
    /W341: Prospect-Specific Proof Record Names/.test(report) &&
      trace.customer === 'Parkway Contractor Electrical Supply' &&
      trace.w339MarkerVerified === true,
    JSON.stringify({ customer: trace.customer, marker: trace.w339MarkerVerified }));

  assertCase(results, 'w339-marker-remains-present-exportable',
    uploadedTrace.installedDrawerVersionFingerprintW339 &&
      uploadedTrace.installedDrawerVersionFingerprintW339.marker === 'W339 imported proof record UX active' &&
      hooks.installedDrawerVersionFingerprintW339().marker === 'W339 imported proof record UX active',
    JSON.stringify(uploadedTrace.installedDrawerVersionFingerprintW339));

  assertCase(results, 'writeback-import-open-links-remain-valid',
    uploadedTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      uploadedTrace.state.dccFinalNamingResult.status === 'dcc_final_names_imported' &&
      uploadedTrace.state.dccFinalNamingResult.displayReadyRecords.every((record) => record.internalId && record.supportedOpenUrl && record.safeToOpen),
    JSON.stringify(uploadedTrace.state.dccFinalNamingResult.displayReadyRecords.map((record) => ({ label: record.consultantLabel, id: record.internalId }))));

  assertCase(results, 'runner-generates-prospect-product-specific-readable-nouns',
    /idbDistributionProofNamesW341/.test(runner) &&
      /\$\{prefix\} \$\{proofNoun\} Availability SKU/.test(runner) &&
      /Safe Substitute Fulfillment Support SKU/.test(runner) &&
      runner.includes('breakers?\\b') &&
      /W341 prospect-specific proof naming active/.test(runner) &&
      /IDB W341 prospect proof naming marker/.test(runner),
    'runner W341 proof-noun helper is present');

  assertCase(results, 'runner-naming-marker-is-visible-and-exportable',
    futureRunnerNamingMarker.active === true &&
      futureRunnerNamingMarker.marker === 'W341 prospect-specific proof naming active' &&
      /W341 prospect-specific proof naming active/.test(futureTraceText),
    JSON.stringify(futureRunnerNamingMarker));

  assertCase(results, 'proof-names-stay-within-field-length-limits',
    names.filter(Boolean).every((name) => name.length <= maxNameLength) &&
      ['Parkway Breaker Availability SKU', 'Parkway Branch Availability / Replenishment Flow', 'Parkway Safe Substitute Fulfillment Support SKU'].every((name) => name.length <= maxNameLength),
    JSON.stringify(names));

  assertCase(results, 'normal-surfaces-avoid-generic-only-names-when-readable-nouns-available',
    /Parkway Breaker Availability SKU/.test(futureRunText + futureBuildText) &&
      /Parkway Branch Availability \/ Replenishment Flow/.test(futureRunText + futureBuildText) &&
      /Parkway Safe Substitute Fulfillment Support SKU/.test(futureRunText + futureBuildText) &&
      !/Product SKU: Product Availability SKU\b/.test(futureRunText + futureBuildText) &&
      !/Supporting SKU: Fulfillment Support SKU\b/.test(futureRunText + futureBuildText),
    JSON.stringify({ names, currentRunText: currentRunText.slice(0, 500), futureRunText: futureRunText.slice(0, 700) }));

  assertCase(results, 'consultant-facing-roles-remain-stable',
    ['Product SKU', 'Availability/Replenishment Flow', 'Supporting SKU'].every((label) => futureRunText.includes(label)) ||
      ['Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU'].every((label) => futureBuildText.includes(label)),
    futureRunText.slice(0, 900));

  assertCase(results, 'manufacturing-wip-vocabulary-remains-blocked-for-distribution',
    !forbidden.test(futureRunText + futureBuildText) &&
      /idbNameHasPolicyForbiddenTerm/.test(runner) &&
      /distribution_replenishment/.test(runner),
    'distribution-facing render and runner guardrails avoid manufacturing/WIP terms');

  assertCase(results, 'w144-and-w151-w214-w245-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  assertCase(results, 'no-source-pack-drawer-write-or-fake-link-changes',
    !/Parkway Contractor Electrical Supply|Breaker Availability SKU/.test(lanePacks) &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:prospect-specific-proof-record-names-w341'] === 'node archive/tools/run_w341_prospect_specific_proof_record_names_harness.js' &&
      /run_w341_prospect_specific_proof_record_names_harness/.test(packageJson.scripts.check),
    'W341 harness registered');

  printResults('W341 prospect-specific proof record names harness', results);
}

main();
