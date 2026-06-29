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
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function smokeContext(hooks, traceFile) {
  const trace = readArchiveJson('trace_samples', traceFile);
  const state = Object.assign(hooks.defaultState(), trace.state || {});
  const lane = hooks.getLane(state);
  const page = state.pageContext || {
    title: 'NetSuite Home',
    url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
    pageType: 'NetSuite page',
    contextId: 'generic_netsuite_page',
    confidence: 'low'
  };
  const recommendation = hooks.recommendMove(lane, page);
  return { trace, state, lane, page, recommendation };
}

function renderedSurfaces(hooks, context) {
  const { state, lane, page, recommendation } = context;
  const surfaces = [
    ['plan', stripTags(hooks.renderPlanView(state, lane, page, recommendation))],
    ['build', stripTags(hooks.renderReviewView(state, lane, page, recommendation))],
    ['roi', stripTags(hooks.renderValueReviewView(state, lane, page, recommendation))]
  ];
  ['open', 'prove', 'handle_objection', 'close_value'].forEach((id) => {
    state.selectedActionId = id;
    surfaces.push([
      `run-${id}`,
      stripTags(hooks.renderRunView(state, lane, page, recommendation, lane.moves[0], { id, label: id }, 'summary'))
    ]);
  });
  return surfaces;
}

function forbiddenNotePrefixMatch(text) {
  return String(text || '').match(/\b(?:Buyer|Pain|Proof|Value|Competitive|Decision criteria|Stop):\s*/i);
}

function hasRequiredImportedRecordGate(trace) {
  const integrated = trace.state && trace.state.integratedBuildRunnerResult || {};
  const guard = integrated.resultImportGuard || {};
  const finalResult = trace.state && trace.state.dccFinalNamingResult || {};
  const records = finalResult.displayReadyRecords || [];
  return integrated.status === 'completed_result_imported' &&
    guard.completedResultAcceptedByW151 === true &&
    guard.importReady === true &&
    finalResult.status === 'dcc_final_names_imported' &&
    finalResult.finalNamesImported === true &&
    records.length >= 5 &&
    records.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable' && /^\d+$/.test(String(record.internalId || record.id || '')));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w350_consultant_note_prefix_cleanup.md');
  const borderStates = smokeContext(hooks, 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const parkway = smokeContext(hooks, 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const borderSurfaces = renderedSurfaces(hooks, borderStates);
  const parkwaySurfaces = renderedSurfaces(hooks, parkway);
  const allSurfaces = borderSurfaces.concat(parkwaySurfaces);
  const prefixLeaks = allSurfaces
    .map(([surface, text]) => ({ surface, match: forbiddenNotePrefixMatch(text), sample: text }))
    .filter((item) => item.match);

  assertCase(results, 'w350-userscript-version-and-marker-bumped-for-auto-update',
    /@version\s+2\.0\.6-w481/.test(userscript) &&
      hooks.drawerDisplayVersionW346() === 'Drawer 2.0.6-w481 / W481' &&
      /stripConsultantNotePrefixesW350/.test(userscript),
    JSON.stringify({ version: /@version\s+([^\n]+)/.exec(userscript) && RegExp.$1, marker: hooks.drawerDisplayVersionW346() }));

  assertCase(results, 'w350-border-states-surfaces-do-not-leak-note-prefixes',
    borderSurfaces.every(([, text]) => !forbiddenNotePrefixMatch(text)) &&
      /Branch teams need one trusted view/.test(borderSurfaces.map(([, text]) => text).join(' ')) &&
      /(Website evidence: Needs confirmation|Website read: Resolver limited)/.test(borderSurfaces.find(([surface]) => surface === 'plan')[1]),
    JSON.stringify(borderSurfaces.map(([surface, text]) => ({ surface, leak: forbiddenNotePrefixMatch(text) && forbiddenNotePrefixMatch(text)[0], sample: text.slice(0, 500) }))));

  assertCase(results, 'w350-parkway-surfaces-do-not-leak-note-prefixes',
    parkwaySurfaces.every(([, text]) => !forbiddenNotePrefixMatch(text)) &&
      /Parkway Contractor Supply/.test(parkwaySurfaces.map(([, text]) => text).join(' ')) &&
      /(Website evidence: Needs confirmation|Website read: Resolver limited)/.test(parkwaySurfaces.find(([surface]) => surface === 'plan')[1]),
    JSON.stringify(parkwaySurfaces.map(([surface, text]) => ({ surface, leak: forbiddenNotePrefixMatch(text) && forbiddenNotePrefixMatch(text)[0], sample: text.slice(0, 500) }))));

  assertCase(results, 'w350-no-prefix-leaks-across-baseline-surfaces',
    prefixLeaks.length === 0,
    JSON.stringify(prefixLeaks.map((item) => ({ surface: item.surface, match: item.match && item.match[0], sample: item.sample.slice(Math.max(0, item.match ? item.match.index - 120 : 0), item.match ? item.match.index + 160 : 160) }))));

  assertCase(results, 'w350-import-open-link-gates-preserved-for-border-states-and-parkway',
    hasRequiredImportedRecordGate(borderStates.trace) &&
      hasRequiredImportedRecordGate(parkway.trace) &&
      borderStates.trace.installedDrawerDisplayVersionW346.websiteConfidenceSeparatedFromBuildConfidence === true &&
      parkway.trace.state.dccFinalNamingResult.noRegression.noTransactionWritesFromIdb === true,
    JSON.stringify({
      borderStatus: borderStates.trace.state.integratedBuildRunnerResult.status,
      parkwayStatus: parkway.trace.state.integratedBuildRunnerResult.status
    }));

  assertCase(results, 'w350-report-captures-scope-boundaries-and-next-smoke',
    /W350: Consultant Note-Prefix Cleanup/.test(report) &&
      /Proceed to deploy W350, then run the second broader smoke/.test(report) &&
      /does not change runner behavior, adapter behavior, record creation behavior/.test(report) &&
      /Move through W351: Grade second broader smoke after W350 copy cleanup/.test(report),
    report.slice(0, 1600));

  printResults('W350 consultant note-prefix cleanup harness', results);
}

main();
