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
  const report = readArchiveText('reports', 'w336_post_import_electrical_story_readability_roi_specificity.md');
  const trace = readArchiveJson('trace_samples', 'w336_post_import_electrical_story_readability_roi_specificity_trace.json');
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
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);
  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const runText = stripHtml(runHtml);
  const valueText = stripHtml(valueHtml);
  const normalUi = `${runHtml} ${valueHtml}`;
  const forbiddenNormalTerms = [
    'Hero item',
    'Matrix item / proof item',
    'Component item 1',
    'Finished/Assembly',
    'Formula',
    'Work Order',
    'Routing',
    'WIP'
  ];
  const blockedTerms = forbiddenNormalTerms.filter((term) => normalUi.includes(term));
  const noteSpecificTerms = trace.polish.noteSpecificCompetitivePressure;
  const genericFallbackTerms = ['QuickBooks plus warehouse tools', 'Odoo', 'Microsoft Dynamics 365'];
  const ctaCellTexts = Array.from(runHtml.matchAll(/<div class="idb-status-cell">([\s\S]*?)<\/div>\s*<\/div>/g)).map((match) => stripHtml(match[1]));
  const maxCtaCellLength = ctaCellTexts.reduce((max, text) => Math.max(max, text.length), 0);

  assertCase(results, 'w335-keystone-evidence-review-packet-exists',
    /W336: Post-Import Electrical Story Readability/.test(report) &&
      trace.liveEvidence.customer === 'Keystone Electrical Supply' &&
      trace.liveEvidence.traceFile.indexOf('1780012482222') >= 0,
    JSON.stringify(trace.liveEvidence));

  assertCase(results, 'w332-marker-remains-present-exportable',
    uploadedTrace.installedDrawerRuntimeMarkerW332.marker === 'W332 post-import story polish active' &&
      /W332 post-import story polish active/.test(traceHtml) &&
      /installedDrawerRuntimeMarkerW332: installedDrawerRuntimeMarkerW332\(\)/.test(userscript),
    JSON.stringify(uploadedTrace.installedDrawerRuntimeMarkerW332));

  assertCase(results, 'writeback-import-and-open-links-remain-valid',
    uploadedTrace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      uploadedTrace.state.dccFinalNamingResult.status === 'dcc_final_names_imported' &&
      openableRecords.length >= 5 &&
      openableRecords.every((record) => record.id && record.safeToOpen === true && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(record.supportedOpenUrl || '')),
    JSON.stringify(openableRecords.map((record) => ({ label: record.consultantLabel, id: record.id }))));

  assertCase(results, 'old-lane-confirmation-cta-remains-absent-after-valid-import',
    !/Confirm lane before opening proof records/.test(runHtml) &&
      story.openUrl &&
      /Open the returned record and prove only what the receipt supports/.test(runHtml),
    story.openTarget);

  assertCase(results, 'post-import-cta-headline-is-short-and-consultant-ready',
    story.openTarget === 'Open Product SKU, then prove branch availability.' &&
      /Live proof CTA\s+Open Product SKU, then prove branch availability/i.test(runText) &&
      story.openTarget.length <= 55,
    story.openTarget);

  assertCase(results, 'proof-cta-columns-fit-mobile-text-budget',
    maxCtaCellLength <= 92 &&
      /Open Product SKU; prove branch availability/.test(runText) &&
      /Use imported records; confirm lane and ROI/.test(runText) &&
      /No ROI, write, creation, or availability claim beyond evidence/.test(runText),
    JSON.stringify({ maxCtaCellLength, ctaCellTexts }));

  assertCase(results, 'normal-run-proof-surfaces-use-primary-aliases',
    /Product SKU: Product Availability SKU/.test(runHtml) &&
      /Availability\/Replenishment Flow: Branch Availability \/ Replenishment Flow/.test(runHtml) &&
      /Supporting SKU: Fulfillment Support SKU/.test(runHtml) &&
      /Product SKU \| Branch Availability \/ Replenishment Flow \| Fulfillment Support SKU|Product SKU, Availability\/Replenishment Flow, and Supporting SKU/.test(runText),
    runText.slice(0, 1800));

  assertCase(results, 'raw-internal-labels-hidden-from-normal-run-proof-surfaces',
    blockedTerms.length === 0 &&
      !/Keystone Electrica\s+-|Compon\s+-/.test(runHtml),
    JSON.stringify({ blockedTerms }));

  assertCase(results, 'evidence-receipt-uses-distribution-label-not-manufacturing',
    /Receipt: Industrial Distribution &amp; Branch Fulfillment \/ Low|Receipt: Industrial Distribution & Branch Fulfillment \/ Low/.test(runHtml) &&
      !/Receipt: Industrial Manufacturing \/ Low/.test(runHtml) &&
      /Industrial Distribution & Branch Fulfillment \/ Low/.test(firstGlance.receiptSummary),
    firstGlance.receiptSummary);

  assertCase(results, 'roi-competitive-uses-note-specific-pressure',
    noteSpecificTerms.every((term) => new RegExp(term, 'i').test(valueText)) &&
      genericFallbackTerms.every((term) => !new RegExp(term, 'i').test(valueText)),
    valueText.slice(valueText.indexOf('Likely competitive pressure'), valueText.indexOf('Why this matters')));

  assertCase(results, 'roi-and-no-claim-language-remains-claim-safe',
    /baseline before claiming savings|baseline before they can be claimed/i.test(valueText + runText) &&
      /confirm lane and ROI|lane and ROI claims still need buyer confirmation/i.test(runText) &&
      !/guaranteed delivery|guaranteed savings|will save/i.test(valueText + runText),
    'claim-safe wording preserved');

  assertCase(results, 'w144-w151-w214-w245-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  assertCase(results, 'no-authority-runner-adapter-source-pack-or-fake-link-changes',
    !/Keystone Electrical|Electrical Components Distributor/.test(lanePacks) &&
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
    packageJson.scripts['harness:post-import-electrical-story-readability-roi-specificity-w336'] === 'node archive/tools/run_w336_post_import_electrical_story_readability_roi_specificity_harness.js' &&
      /run_w336_post_import_electrical_story_readability_roi_specificity_harness/.test(packageJson.scripts.check),
    'W336 harness registered');

  printResults('W336 post-import electrical story readability and ROI specificity harness', results);
}

main();
