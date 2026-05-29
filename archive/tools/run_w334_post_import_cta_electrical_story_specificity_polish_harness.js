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

function maxTextLength(matches) {
  return matches.reduce((max, text) => Math.max(max, String(text || '').replace(/<[^>]+>/g, '').trim().length), 0);
}

function main() {
  const results = [];
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const lanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w334_post_import_cta_electrical_story_specificity_polish.md');
  const trace = readArchiveJson('trace_samples', 'w334_post_import_cta_electrical_story_specificity_polish_trace.json');
  const uploadedTrace = readJsonFile(trace.liveEvidence.traceFile);
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
  const valueHtml = hooks.renderValueReviewView(state, lane, state.pageContext, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, state.pageContext, recommendation);
  const story = hooks.consultantStorySurfaceFromLanePackW247(state, null, state.dccFinalNamingResult);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);
  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const normalUi = `${runHtml} ${valueHtml}`;
  const ctaCellTexts = Array.from(runHtml.matchAll(/<div class="idb-status-cell">([\s\S]*?)<\/div>\s*<\/div>/g)).map((match) => match[1]);
  const blockedTerms = trace.blockedNormalUiTerms.filter((term) => normalUi.includes(term));
  const noteSpecificTerms = trace.noteSpecificCompetitivePressure;
  const genericFallbackTerms = ['QuickBooks plus warehouse tools', 'Odoo', 'Microsoft Dynamics 365'];

  assertCase(results, 'w333-harborline-evidence-review-packet-exists',
    /W334: Post-Import Proof CTA Compression/.test(report) &&
      trace.liveEvidence.customer === 'Harborline Electrical Supply' &&
      trace.liveEvidence.runtimeMarker === 'W332 post-import story polish active' &&
      uploadedTrace.installedDrawerRuntimeMarkerW332.marker === 'W332 post-import story polish active',
    JSON.stringify(trace.liveEvidence));

  assertCase(results, 'w332-marker-remains-present-and-exportable',
    /W332 post-import story polish active/.test(traceHtml) &&
      uploadedTrace.installedDrawerRuntimeMarkerW332.postImportStoryPolishActive === true &&
      /installedDrawerRuntimeMarkerW332: installedDrawerRuntimeMarkerW332\(\)/.test(userscript),
    JSON.stringify(uploadedTrace.installedDrawerRuntimeMarkerW332));

  assertCase(results, 'post-import-cta-is-compact-and-mobile-readable',
    /Live proof CTA/.test(runHtml) &&
      maxTextLength(ctaCellTexts) <= 125 &&
      /Open Product SKU; prove branch availability/.test(runHtml) &&
      /Use imported records; confirm lane and ROI/.test(runHtml) &&
      /No ROI, write, creation, or availability claim beyond evidence/.test(runHtml),
    JSON.stringify({ maxLength: maxTextLength(ctaCellTexts), compactProof: story.compactProofActionW334 }));

  assertCase(results, 'old-lane-confirmation-cta-remains-absent-after-valid-import',
    !/Confirm lane before opening proof records/.test(runHtml) &&
      /Open Product SKU, then prove branch availability/.test(story.openTarget) &&
      /Open the returned record and prove only what the receipt supports/.test(runHtml),
    JSON.stringify({ openTarget: story.openTarget }));

  assertCase(results, 'raw-internal-labels-hidden-from-normal-run-surfaces',
    blockedTerms.length === 0 &&
      /Product SKU/.test(runHtml) &&
      /Availability\/Replenishment Flow/.test(runHtml) &&
      /Supporting SKU/.test(runHtml),
    JSON.stringify({ blockedTerms }));

  assertCase(results, 'consultant-display-aliases-used-for-truncated-record-names',
    /Product SKU: Product Availability SKU/.test(runHtml) &&
      /Availability\/Replenishment Flow: Branch Availability \/ Replenishment Flow/.test(runHtml) &&
      /Supporting SKU: Fulfillment Support SKU/.test(runHtml) &&
      !/Harborline Electri\s+-|Compon\s+-/.test(runHtml),
    'display aliases replace awkward truncated names in Run navigation');

  assertCase(results, 'electrical-competitive-language-prefers-note-specific-pressure',
    noteSpecificTerms.every((term) => new RegExp(term, 'i').test(`${runHtml} ${valueHtml}`)) &&
      genericFallbackTerms.every((term) => !new RegExp(term, 'i').test(valueHtml)),
    noteSpecificTerms.join(' | '));

  assertCase(results, 'roi-and-no-claim-language-remains-claim-safe',
    /baseline before claiming savings|baseline before they can be claimed/i.test(valueHtml + runHtml) &&
      /confirm lane and ROI|lane and ROI claims still need confirmation|lane and ROI still need confirmation/i.test(runHtml) &&
      !/NetSuite\.\./.test(runHtml),
    'claim safety and punctuation remain polished');

  assertCase(results, 'open-links-remain-supported-only-after-valid-import',
    uploadedTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      uploadedTrace.state.dccFinalNamingResult.status === 'dcc_final_names_imported' &&
      openableRecords.length >= 5 &&
      openableRecords.every((record) => record.id && record.safeToOpen === true && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(record.supportedOpenUrl || '')),
    JSON.stringify(openableRecords.map((record) => ({ label: record.consultantLabel, id: record.id }))));

  assertCase(results, 'w144-and-w151-w214-w245-validation-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      trace.guardrails.w151W214W245ValidationUnchanged === true,
    'writeback and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-source-pack-or-fake-link-changes',
    !/Harborline Electrical|Electrical Components Distributor/.test(lanePacks) &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-present',
    packageJson.scripts['harness:post-import-cta-electrical-story-specificity-polish-w334'] === 'node archive/tools/run_w334_post_import_cta_electrical_story_specificity_polish_harness.js' &&
      /run_w334_post_import_cta_electrical_story_specificity_polish_harness/.test(packageJson.scripts.check),
    'W334 harness registered');

  printResults('W334 post-import CTA and electrical story specificity polish harness', results);
}

main();
