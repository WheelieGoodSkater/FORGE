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
  const report = readArchiveText('reports', 'w337_electrical_story_final_ux_polish_baseline_lock.md');
  const trace = readArchiveJson('trace_samples', 'w337_electrical_story_final_ux_polish_baseline_lock_trace.json');
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
  const buildHtml = hooks.renderReviewView(state, lane, state.pageContext, recommendation);
  const valueHtml = hooks.renderValueReviewView(state, lane, state.pageContext, recommendation);
  const traceHtml = hooks.renderTraceView(state, lane, state.pageContext, recommendation);
  const story = hooks.consultantStorySurfaceFromLanePackW247(state, null, state.dccFinalNamingResult);
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const finalNavigation = hooks.dccFinalNavigationModel(state, lane, state.pageContext, recommendation);
  const openableRecords = finalNavigation.scriptPivotObjects.filter((record) => record.safeToOpen && record.supportedOpenUrl);
  const runText = stripHtml(runHtml);
  const buildText = stripHtml(buildHtml);
  const valueText = stripHtml(valueHtml);
  const normalUi = `${runHtml} ${buildHtml} ${valueHtml}`;
  const normalText = `${runText} ${buildText} ${stripHtml(valueHtml)}`;
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
  const genericGeneratedCopy = [
    'Use final build names',
    'Use imported final generated names',
    'Run will use these final generated names',
    'Final generated NetSuite records'
  ].filter((term) => normalText.includes(term));
  const noteSpecificTerms = [
    'supplier portals',
    'transfer spreadsheets',
    'text threads',
    'branch inventory checks',
    'manual counter promise'
  ];
  const genericFallbackTerms = ['QuickBooks plus warehouse tools', 'Odoo', 'Microsoft Dynamics 365'];

  assertCase(results, 'apex-w336-evidence-review-packet-exists',
    /W337: Electrical Story Final UX Polish/.test(report) &&
      trace.liveEvidence.customer === 'Apex Contractor Electrical Supply' &&
      trace.liveEvidence.traceFile.indexOf('1780063482812') >= 0 &&
      trace.liveEvidence.decision === 'keep',
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
    !/Confirm lane before opening proof records/.test(runHtml + buildHtml) &&
      story.openUrl &&
      /Open the returned record and prove only what the receipt supports/.test(runHtml + buildHtml),
    story.openTarget);

  assertCase(results, 'build-run-surfaces-use-imported-proof-record-language',
    /Imported NetSuite proof records/.test(buildText) &&
      /Run will use these imported proof records for the live story/.test(buildText) &&
      /Use imported proof records/.test(runText) &&
      /Use returned NetSuite proof records for the next object pivot/.test(runText) &&
      genericGeneratedCopy.length === 0,
    JSON.stringify({ genericGeneratedCopy, build: buildText.slice(0, 1500), run: runText.slice(0, 1200) }));

  assertCase(results, 'normal-consultant-surfaces-use-primary-aliases',
    /Product SKU: Product Availability SKU/.test(runHtml + buildHtml) &&
      /Availability\/Replenishment Flow: Branch Availability \/ Replenishment Flow/.test(runHtml + buildHtml) &&
      /Supporting SKU: Fulfillment Support SKU/.test(runHtml + buildHtml),
    normalText.slice(0, 2200));

  assertCase(results, 'internal-generated-labels-hidden-from-normal-consultant-surfaces',
    blockedTerms.length === 0,
    JSON.stringify({ blockedTerms }));

  assertCase(results, 'collapsed-story-sections-are-intentional-not-empty',
    /Say this live: open, prove, close/.test(runHtml + buildHtml) &&
      /Guided demo sequence: frame, open, prove/.test(runHtml + buildHtml) &&
      /Evidence receipt: confidence and proof source/.test(runHtml + buildHtml) &&
      !/<summary>\s*Say this live\s*<\/summary>/.test(runHtml + buildHtml) &&
      !/<summary>\s*Guided demo sequence\s*<\/summary>/.test(runHtml + buildHtml) &&
      !/<summary>\s*Evidence receipt\s*<\/summary>/.test(runHtml + buildHtml),
    runText.slice(runText.indexOf('Live proof CTA'), runText.indexOf('Live script first')));

  assertCase(results, 'roi-competitive-remains-note-specific-and-claim-safe',
    noteSpecificTerms.every((term) => new RegExp(term, 'i').test(valueText)) &&
      genericFallbackTerms.every((term) => !new RegExp(term, 'i').test(valueText)) &&
      /baseline before claiming savings|baseline before they can be claimed/i.test(valueText + runText) &&
      /confirm lane and ROI|lane evidence is insufficient/i.test(runText) &&
      !/guaranteed delivery|guaranteed savings|will save/i.test(valueText + runText),
    valueText.slice(valueText.indexOf('Likely competitive pressure'), valueText.indexOf('Why this matters')));

  assertCase(results, 'evidence-receipt-label-remains-fixed',
    /Receipt: Industrial Distribution &amp; Branch Fulfillment \/ Low|Receipt: Industrial Distribution & Branch Fulfillment \/ Low/.test(runHtml + buildHtml) &&
      !/Receipt: Industrial Manufacturing \/ Low/.test(runHtml + buildHtml) &&
      /Industrial Distribution & Branch Fulfillment \/ Low/.test(firstGlance.receiptSummary),
    firstGlance.receiptSummary);

  assertCase(results, 'w144-w151-w214-w245-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript),
    'writeback and validation anchors remain present');

  assertCase(results, 'no-authority-runner-adapter-source-pack-or-fake-link-changes',
    !/Apex Contractor Electrical|Electrical Components Distributor/.test(lanePacks) &&
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
    packageJson.scripts['harness:electrical-story-final-ux-polish-baseline-lock-w337'] === 'node archive/tools/run_w337_electrical_story_final_ux_polish_baseline_lock_harness.js' &&
      /run_w337_electrical_story_final_ux_polish_baseline_lock_harness/.test(packageJson.scripts.check),
    'W337 harness registered');

  printResults('W337 electrical story final UX polish baseline lock harness', results);
}

main();
