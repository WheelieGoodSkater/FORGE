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

function hasNumericId(record) {
  return /^\d+$/.test(String(record && (record.internalId || record.id) || ''));
}

function hasSupportedNetSuiteUrl(record) {
  return /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record && (record.supportedOpenUrl || record.openableUrl || record.url) || ''));
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    records.every((record) => record.safeToOpen === true && record.linkAuthorityStatus === 'verified_openable' && hasNumericId(record) && hasSupportedNetSuiteUrl(record));
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w355_resolver_readiness_path_for_strong_public_websites.md');
  const graybar = smokeContext(hooks, 'w354_graybar_resolver_limited_clarity_rerun_trace.json');
  const parkway = smokeContext(hooks, 'w345_parkway_w344_successful_live_smoke_evidence_trace.json');
  const borderStates = smokeContext(hooks, 'w349_border_states_w348_controlled_live_smoke_trace.json');
  const triState = smokeContext(hooks, 'w351_tristate_second_broader_smoke_after_w350_trace.json');
  const noSuppliedState = Object.assign(hooks.defaultState(), clone(graybar.trace.state || {}));
  noSuppliedState.websiteEvidenceV1 = null;
  noSuppliedState.websiteResolverRuntime = null;
  hooks.ensureWebsiteEvidenceRuntime(noSuppliedState);
  const noSuppliedLane = hooks.getLane(noSuppliedState);
  const noSuppliedEvidence = hooks.websiteEvidenceUxModel(noSuppliedState, noSuppliedLane);
  const suppliedState = Object.assign(hooks.defaultState(), clone(graybar.trace.state || {}));
  suppliedState.intake = Object.assign({}, suppliedState.intake, {
    websiteEvidence: 'Graybar public website describes electrical distribution products including wire, cable, conduit, lighting, switchgear, automation, safety and industrial supplies. The site supports branch locations, product catalog availability, order fulfillment, pickup and delivery for contractors and commercial accounts.'
  });
  suppliedState.websiteEvidenceV1 = null;
  suppliedState.websiteResolverRuntime = null;
  hooks.ensureWebsiteEvidenceRuntime(suppliedState);
  const suppliedLane = hooks.getLane(suppliedState);
  const suppliedPage = suppliedState.pageContext || graybar.page;
  const suppliedRecommendation = hooks.recommendMove(suppliedLane, suppliedPage);
  const suppliedEvidence = hooks.websiteEvidenceUxModel(suppliedState, suppliedLane);
  const suppliedConfidence = hooks.websiteConfidenceModel(suppliedState);
  const suppliedPlanText = stripTags(hooks.renderPlanView(suppliedState, suppliedLane, suppliedPage, suppliedRecommendation));
  const setupState = Object.assign({}, suppliedState, { setupEditMode: true });
  const setupText = hooks.renderPlanView(setupState, suppliedLane, suppliedPage, suppliedRecommendation);
  const notesOnlyState = Object.assign(hooks.defaultState(), clone(graybar.trace.state || {}));
  notesOnlyState.intake = Object.assign({}, notesOnlyState.intake, {
    notes: `${notesOnlyState.intake.notes}\n\nWebsite-like notes: electrical distribution, wire, cable, conduit, lighting, branch locations, fulfillment, pickup and delivery.`,
    websiteEvidence: ''
  });
  notesOnlyState.websiteEvidenceV1 = null;
  notesOnlyState.websiteResolverRuntime = null;
  hooks.ensureWebsiteEvidenceRuntime(notesOnlyState);
  const notesOnlyEvidence = hooks.websiteEvidenceUxModel(notesOnlyState, hooks.getLane(notesOnlyState));
  const operatorReadiness = hooks.operatorSuppliedWebsiteEvidenceReadinessW355(suppliedState.intake, 'graybar.com');

  assertCase(results, 'w355-current-marker-and-version-advance',
    /@version\s+1\.0\.10/.test(userscript) &&
      hooks.drawerDisplayVersionW346() === 'Drawer 1.0.10 / W362' &&
      /operatorSuppliedWebsiteEvidenceReadinessW355/.test(userscript),
    JSON.stringify({ marker: hooks.drawerDisplayVersionW346() }));

  assertCase(results, 'w355-no-supplied-evidence-preserves-resolver-limited-clarity',
    hooks.isResolverLimitedWebsiteEvidenceW353(noSuppliedEvidence) === true &&
      noSuppliedEvidence.confidence.displayText === 'Resolver limited' &&
      noSuppliedEvidence.confidence.resolverMode === 'local_fallback_only' &&
      noSuppliedEvidence.confidence.failureState === 'thin',
    JSON.stringify(noSuppliedEvidence));

  assertCase(results, 'w355-strong-operator-website-evidence-moves-graybar-beyond-resolver-limited',
    operatorReadiness &&
      operatorReadiness.ready === true &&
      suppliedEvidence.confidence.state === 'recommended' &&
      suppliedEvidence.confidence.scoreLabel === 'high' &&
      suppliedEvidence.confidence.resolverLimited === false &&
      hooks.isResolverLimitedWebsiteEvidenceW353(suppliedEvidence) === false &&
      suppliedEvidence.productFamily === 'Electrical Distribution Branch Fulfillment' &&
      suppliedConfidence.source === 'website_evidence_v1' &&
      suppliedConfidence.canBuild === true,
    JSON.stringify({ operatorReadiness, suppliedEvidence, suppliedConfidence }));

  assertCase(results, 'w355-notes-alone-cannot-raise-website-confidence',
    hooks.isResolverLimitedWebsiteEvidenceW353(notesOnlyEvidence) === true &&
      notesOnlyEvidence.confidence.displayText === 'Resolver limited' &&
      !notesOnlyEvidence.productSeed,
    JSON.stringify(notesOnlyEvidence));

  assertCase(results, 'w355-visible-operator-safe-evidence-field-is-present',
    /Optional website\/category evidence/.test(setupText) &&
      /cannot create records, validate Open links, or write transactions/.test(setupText) &&
      /data-idb-intake="websiteEvidence"/.test(setupText),
    stripTags(setupText).slice(0, 1600));

  assertCase(results, 'w355-supplied-evidence-plan-no-longer-says-resolver-limited',
    /Website evidence: Recommended \/ High/.test(suppliedPlanText) &&
      /Build\/import verified/.test(suppliedPlanText) &&
      !/Website read: Resolver limited/.test(suppliedPlanText),
    suppliedPlanText.slice(0, 1600));

  assertCase(results, 'w355-import-and-open-link-regression-baselines-remain-green',
    hasRequiredImportedRecordGate(graybar.trace) &&
      hasRequiredImportedRecordGate(parkway.trace) &&
      hasRequiredImportedRecordGate(borderStates.trace) &&
      hasRequiredImportedRecordGate(triState.trace),
    JSON.stringify({
      graybar: graybar.trace.state.integratedBuildRunnerResult.status,
      parkway: parkway.trace.state.integratedBuildRunnerResult.status,
      borderStates: borderStates.trace.state.integratedBuildRunnerResult.status,
      triState: triState.trace.state.integratedBuildRunnerResult.status
    }));

  assertCase(results, 'w355-report-records-safe-path-and-next-live-rerun',
    /W355: Resolver Readiness Path For Strong Public Websites/.test(report) &&
      /operator-supplied public website\/category evidence/.test(report) &&
      /Conversation notes alone cannot raise website confidence/.test(report) &&
      /Move through W356: Live Graybar operator website-evidence rerun/.test(report) &&
      /No drawer transaction writes/.test(report),
    report.slice(0, 2200));

  printResults('W355 resolver readiness path for strong public websites harness', results);
}

main();
