#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  loadHooks,
  motionContext,
  motionState,
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

function electricalCompletedResult() {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'distribution_replenishment',
    records: [
      {
        role: 'customer',
        recordType: 'customer',
        type: 'customer',
        name: 'MetroVolt Electrical Supply Customer Account',
        internalId: '5321',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=5321'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO-W324 MetroVolt Contractor Counter',
        internalId: '5322',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=5322'
      },
      {
        role: 'finished_or_assembly_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'MetroVolt Contractor Breaker SKU - ELEC-CNTR-W324',
        internalId: '5323',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=5323'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Branch Transfer / Replenishment Flow - MetroVolt Electrical - ELEC-CNTR-W324',
        internalId: '5324',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=5324'
      },
      {
        role: 'component_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Alternate Fulfillment Support SKU - MetroVolt Electrical - ELEC-CNTR-W324',
        internalId: '5325',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=5325'
      }
    ]
  };
}

function includesAll(text, terms) {
  return terms.every((term) => new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text));
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W324 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const sourceLanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w321Trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const w322Trace = readArchiveJson('trace_samples', 'w322_distribution_proof_record_vocabulary_story_polish_trace.json');
  const w323Trace = readArchiveJson('trace_samples', 'w323_industry_story_pack_architecture_trace.json');
  const fixtures = readArchiveJson('fixtures', 'w323_industry_story_first_call_fixtures.json');
  const report = readArchiveText('reports', 'w324_highest_value_story_pack_selection.md');
  const trace = readArchiveJson('trace_samples', 'w324_highest_value_story_pack_selection_trace.json');
  const selectedFixture = (fixtures.fixtures || []).find((fixture) => fixture.id === 'metrovolt-electrical-components-counter-sales') || {};

  const state = motionState(hooks, {
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: 'MetroVolt Electrical Supply',
      website: 'https://example.invalid/metrovolt-electrical',
      notes: [
        'First discovery call with the Director of Sales, branch manager, and inside sales lead.',
        'Contractors ask whether breakers, conduit, panels, and job-critical parts are available today.',
        'Reps do not trust the branch transfer and supplier ETA story.',
        'They compare against Epicor Eclipse reports, supplier portals, Excel branch transfer sheets, and customer texts.',
        'Show availability, alternate readiness, and replenishment confidence for a contractor order without production language.'
      ].join(' ')
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    electricalCompletedResult(),
    state,
    context.lane,
    context.page,
    context.recommendation
  );
  const distributionPack = hooks.versionedLanePacksW246().find((pack) => pack.packId === 'industrial-distributor');
  const story = hooks.consultantStorySurfaceFromLanePackW247(state, distributionPack, {
    displayReadyRecords: normalized.displayReadyRecords
  });
  const script = hooks.consultantLiveDemoScriptW256(story);
  const sequence = hooks.guidedDemoStepSequenceW257(story);
  const renderedStory = hooks.renderConsultantStorySurfaceW248(story);
  const labels = normalized.displayReadyRecords.map((record) => record.consultantLabel);
  const visibleRecords = normalized.visibleRecords || [];
  const storyText = [
    story.firstCallSummaryW322,
    story.firstCallSummaryW324,
    story.openTarget,
    story.proofMove,
    story.safeClaim,
    story.doNotClaim,
    story.buyerFacingSoWhat,
    story.competitiveContrast,
    story.objectionResponseW322,
    story.objectionResponseW324,
    story.weakEvidenceConfirmationW324,
    story.nllmAdvisory && story.nllmAdvisory.uncertainty,
    Object.keys(script.lines || {}).map((key) => script.lines[key]).join(' '),
    sequence.safeObjectionResponse,
    renderedStory
  ].join(' ');
  const forbiddenTerms = ['Finished/Assembly Item', 'Formula or Batch Structure', 'Ingredient', 'Component Item', 'Work Order', 'Routing', 'WIP'];
  const forbiddenRegex = new RegExp(forbiddenTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  const requiredStoryTerms = [
    'branch transfer',
    'replenishment',
    'callback',
    'supplier ETA',
    'contractor leaves',
    'Eclipse reports',
    'supplier portals',
    'Excel',
    'customer texts',
    'fewer callbacks',
    'contractor counter decisions',
    'margin protection',
    'baseline',
    'guaranteed delivery',
    'measured ROI',
    'manufacturing',
    'WIP',
    'source-pack truth',
    'write actions',
    'review-only',
    'website/category'
  ];
  const lowerStoryText = storyText.toLowerCase();
  const missingStoryTerms = requiredStoryTerms.filter((term) => lowerStoryText.indexOf(term.toLowerCase()) < 0);

  assertCase(results, 'w323-fixtures-and-scoring-remain-available',
    w323Trace.status === 'industry_story_pack_architecture_ready' &&
      (fixtures.fixtures || []).length >= 3 &&
      selectedFixture.candidatePackReference === 'electrical-components-distributor-review-only' &&
      ['industrySpecificity', 'proofRecordFit', 'storyUsefulness', 'objectionReadiness', 'claimSafety', 'vocabularySafety', 'weakEvidenceHonesty']
        .every((key) => Object.prototype.hasOwnProperty.call(w323Trace.storyScoringModel || {}, key)),
    JSON.stringify({ fixture: selectedFixture.id, scoring: Object.keys(w323Trace.storyScoringModel || {}) }));

  assertCase(results, 'selected-story-pack-is-documented-with-rationale',
    /electrical-components-distributor-review-only/.test(report) &&
      /metrovolt-electrical-components-counter-sales/.test(report) &&
      trace.selection.selectedPack === 'electrical-components-distributor-review-only' &&
      trace.selection.selectedFixture === 'metrovolt-electrical-components-counter-sales' &&
      /distribution writeback path/i.test(trace.selection.reason),
    JSON.stringify(trace.selection));

  assertCase(results, 'live-story-surface-produces-selected-pack-shaped-copy',
    story.storyPackCandidateW324 === 'electrical-components-distributor-review-only' &&
      includesAll(storyText, ['contractor', 'availability', 'branch transfer', 'replenishment', 'fulfillment support']),
    storyText);

  assertCase(results, 'buyer-problem-proof-objection-competitive-roi-caution-and-weak-evidence-are-represented',
    /counter reps can prove contractor-critical availability/i.test(story.firstCallSummaryW324) &&
      /Product SKU/i.test(storyText) &&
      missingStoryTerms.length === 0,
    JSON.stringify({ missingStoryTerms, storyText }));

  assertCase(results, 'selected-implementation-does-not-mutate-source-lane-packs-or-install-pack',
    trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.proposedPackInstalled === false &&
      !/electrical-components-distributor-review-only|MetroVolt Electrical/i.test(sourceLanePacks),
    'candidate remains review-only and not source truth');

  assertCase(results, 'w322-distribution-proof-labels-remain-unchanged',
    ['Customer', 'Sales Order', 'Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU'].every((label) => labels.indexOf(label) >= 0) &&
      !forbiddenRegex.test(labels.join(' | ')) &&
      w322Trace.guardrails.returnedRecordLabelsW322Compatible !== false,
    labels.join(' | '));

  assertCase(results, 'w321-writeback-baseline-remains-unchanged',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w321Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w321Trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      trace.protectedBaselines.w321LiveWritebackBaselineFrozen === true,
    JSON.stringify({ w321: w321Trace.status }));

  assertCase(results, 'w144-submit-refresh-import-and-validation-remain-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      trace.guardrails.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'returned-record-names-ids-and-supported-open-links-remain-preserved',
    normalized.status === 'display_ready_records_normalized' &&
      visibleRecords.length >= 5 &&
      visibleRecords.every((record) => /^[0-9]+$/.test(String(record.internalId || '')) && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || ''))) &&
      visibleRecords.some((record) => /SO-W324/.test(record.name)) &&
      visibleRecords.some((record) => /MetroVolt Contractor Breaker SKU/.test(record.name)),
    visibleRecords.map((record) => `${record.consultantLabel}:${record.name}:${record.internalId}:${record.supportedOpenUrl}`).join(' | '));

  assertCase(results, 'fake-open-links-remain-blocked-before-valid-import',
    normalized.noRegression.fakeOpenLinksBlockedBeforeValidImport === true &&
      trace.guardrails.openLinksOnlyAfterValidImport === true &&
      !/REPLACE_|YOUR_ACCOUNT_ID|example\.com|javascript:/i.test(visibleRecords.map((record) => record.supportedOpenUrl).join(' ')),
    visibleRecords.map((record) => record.supportedOpenUrl).join(' | '));

  assertCase(results, 'normal-ui-hides-diagnostics-and-no-runtime-authority-changes',
    trace.guardrails.normalConsultantUiHiddenDiagnostics === true &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false &&
      normalized.noRegression.noDrawerWrites === true &&
      normalized.noRegression.noDrawerCreatedRecords === true &&
      normalized.noRegression.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:highest-value-industry-story-pack-live-surface-w324'] === 'node archive/tools/run_w324_highest_value_industry_story_pack_live_surface_harness.js' &&
      /run_w324_highest_value_industry_story_pack_live_surface_harness/.test(packageJson.scripts.check) &&
      trace.selectedNextBlock.id === 'W325',
    JSON.stringify(trace.selectedNextBlock));

  printResults('W324 highest-value industry story pack live surface harness', results);
}

main();
