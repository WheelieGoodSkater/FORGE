#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  printResults,
  read,
  readArchiveJson,
  readArchiveText,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasForbiddenConsultantLabel(text) {
  return /Business Pain\s*\/\s*Request Notes|Requested Proof|Decision Criteria|Timeline\s*\/\s*Urgency|Competitor\s*\/\s*Current Tools|COV\s*\/\s*Call Notes|Optional Website\s*\/\s*Category Evidence/i.test(String(text || ''));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const trace = readArchiveJson('trace_samples', 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const report = readArchiveText('reports', 'w346_consultant_post_import_ux_cleanup.md');
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  state.activeView = 'plan';
  const lane = hooks.getLane(state);
  const page = {
    title: 'Home - NetSuite (F&B Stairway)',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl?sc=-29&whence=',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low',
    movePreference: ['Customer Record', 'Sales Order View']
  };
  const recommendation = hooks.recommendMove(lane, page);
  const postImport = hooks.postImportConfidenceModelW346(state, lane, page, recommendation);
  const marker = hooks.installedDrawerPostImportUxCleanupW346();
  const drawer = hooks.renderDrawer(state);
  const plan = hooks.renderPlanView(state, lane, page, recommendation);
  const value = hooks.renderValueReviewView(state, lane, page, recommendation);
  const run = hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id: 'open', label: 'Open' }, 'summary');
  const script = hooks.runSelectorTraceModel(state, lane, page, recommendation).scriptPreview;
  const planText = stripTags(plan);
  const valueText = stripTags(value);
  const runText = stripTags(run);
  const scriptText = [script.title, script.say, script.show, script.close].join(' ');

  assertCase(results, 'userscript-visible-version-is-current-not-legacy-header',
    /@version\s+1\.0\.10/.test(userscript) &&
      marker.userscriptVersion === '1.0.10' &&
      marker.visibleVersionLabel === 'Drawer 1.0.10 / W362' &&
      /Drawer 1\.0\.10 \/ W362/.test(drawer) &&
      !/idb-version-pill">V1\.0\.0</.test(drawer),
    JSON.stringify({ marker, headerHasW362: /Drawer 1\.0\.10 \/ W362/.test(drawer) }));

  assertCase(results, 'post-import-plan-separates-build-and-website-confidence',
    postImport.importedProofReady === true &&
      postImport.buildImportConfidence === 'verified' &&
      postImport.planConfidenceLabel === 'Build verified' &&
      /Build\/import verified/.test(planText) &&
      /(Website evidence: Needs confirmation|Website read: Resolver limited)/.test(planText) &&
      /Run imported proof records/.test(planText),
    JSON.stringify({ postImport, planText: planText.slice(0, 1200) }));

  assertCase(results, 'plan-no-longer-looks-like-post-import-build-is-uncertain',
    !/Run demo or build records/.test(planText) &&
      /Imported NetSuite proof records are ready for the live path/.test(planText),
    planText.slice(0, 1600));

  assertCase(results, 'run-script-copy-strips-internal-note-section-labels',
    !hasForbiddenConsultantLabel(scriptText) &&
      !hasForbiddenConsultantLabel(runText) &&
      /Use imported records: Customer, Sales Order, Product SKU, Availability\/Replenishment Flow, (?:and )?Supporting SKU/.test(runText),
    JSON.stringify({ script, runText: runText.slice(0, 1600) }));

  assertCase(results, 'value-copy-strips-internal-note-section-labels',
    !hasForbiddenConsultantLabel(valueText) &&
      /Consultant value coach/.test(valueText) &&
      /Measured savings require a customer baseline/.test(valueText),
    valueText.slice(0, 1600));

  assertCase(results, 'w345-evidence-and-core-guards-remain-valid',
    trace.adapterReadyRecordCreationUxW262 &&
      trace.adapterReadyRecordCreationUxW262.readinessState === 'records_imported' &&
      trace.installedDrawerCurrentBlockMarkerW342 &&
      trace.installedDrawerCurrentBlockMarkerW342.active === true &&
      trace.runnerProofNamingMarkerW341 &&
      trace.runnerProofNamingMarkerW341.active === true &&
      trace.state &&
      trace.state.dccFinalNamingResult &&
      trace.state.dccFinalNamingResult.noRegression &&
      trace.state.dccFinalNamingResult.noRegression.noIdbWrites === true &&
      trace.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true,
    'W345 baseline remains intact');

  assertCase(results, 'w346-report-documents-scope-and-next-block',
    /W346: Consultant Post-Import UX Cleanup/.test(report) &&
      /No runner creation behavior change/.test(report) &&
      /Move through W347: Deployment sync guard/.test(report),
    'W346 report captures scope, boundaries, and recommendation');

  printResults('W346 consultant post-import UX cleanup harness', results);
}

main();
