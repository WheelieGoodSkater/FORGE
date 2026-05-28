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

function beaconRidgeCompletedResult() {
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
        name: 'Beacon Ridge Electrical Supply Customer Account',
        internalId: '6321',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=6321'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO-W325 Beacon Ridge Contractor Counter',
        internalId: '6322',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=6322'
      },
      {
        role: 'finished_or_assembly_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Beacon Ridge Contractor Panel SKU - ELEC-BR-W325',
        internalId: '6323',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6323'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Branch Availability / Replenishment Flow - Beacon Ridge - ELEC-BR-W325',
        internalId: '6324',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6324'
      },
      {
        role: 'component_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Fulfillment Support SKU - Beacon Ridge Alternate - ELEC-BR-W325',
        internalId: '6325',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6325'
      }
    ]
  };
}

function includesAll(text, terms) {
  const lower = String(text || '').toLowerCase();
  return terms.every((term) => lower.indexOf(String(term).toLowerCase()) >= 0);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W325 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const sourceLanePacks = readRepoFile('src', 'contracts', 'lanePacks.js');
  const w321Trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const w322Trace = readArchiveJson('trace_samples', 'w322_distribution_proof_record_vocabulary_story_polish_trace.json');
  const w324Trace = readArchiveJson('trace_samples', 'w324_highest_value_story_pack_selection_trace.json');
  const report = readArchiveText('reports', 'w325_live_smoke_improved_industry_story_surface.md');
  const trace = readArchiveJson('trace_samples', 'w325_live_smoke_improved_industry_story_surface_trace.json');

  const state = motionState(hooks, {
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: trace.liveSmokeUseCase.customer,
      website: trace.liveSmokeUseCase.website,
      notes: trace.liveSmokeUseCase.notes
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    beaconRidgeCompletedResult(),
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
    story.proofMove,
    story.safeClaim,
    story.doNotClaim,
    story.buyerFacingSoWhat,
    story.competitiveContrast,
    story.objectionResponseW324,
    story.weakEvidenceConfirmationW324,
    Object.keys(script.lines || {}).map((key) => script.lines[key]).join(' '),
    sequence.safeObjectionResponse,
    renderedStory
  ].join(' ');
  const forbiddenTerms = [
    'Finished/Assembly Item',
    'Formula or Batch Structure',
    'Ingredient',
    'Component Item',
    'Work Order',
    'Routing',
    'WIP'
  ];
  const forbiddenRegex = new RegExp(forbiddenTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

  assertCase(results, 'w321-baseline-remains-frozen',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w321Trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      w321Trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true,
    JSON.stringify({ status: w321Trace.status }));

  assertCase(results, 'w322-distribution-labels-remain-frozen',
    w322Trace.status === 'distribution_story_polish_ready' &&
      ['Customer', 'Sales Order', 'Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU']
        .every((label) => labels.indexOf(label) >= 0) &&
      !forbiddenRegex.test(labels.join(' | ')),
    labels.join(' | '));

  assertCase(results, 'w324-electrical-story-surface-remains-available',
    w324Trace.status === 'highest_value_story_pack_selected' &&
      w324Trace.selection.selectedPack === 'electrical-components-distributor-review-only' &&
      story.storyPackCandidateW324 === 'electrical-components-distributor-review-only',
    JSON.stringify({ selectedPack: w324Trace.selection.selectedPack, storyPack: story.storyPackCandidateW324 }));

  assertCase(results, 'w325-live-smoke-evidence-packet-exists',
    /Beacon Ridge Electrical Supply/.test(report) &&
      trace.status === 'ready_for_user_live_smoke' &&
      trace.decision === 'needs_attention_pending_user_trace' &&
      trace.liveSmokeUseCase.customer === 'Beacon Ridge Electrical Supply' &&
      trace.liveEvidence.traceFileReference === 'pending_user_upload',
    JSON.stringify({ status: trace.status, decision: trace.decision }));

  assertCase(results, 'returned-records-keep-names-numeric-ids-safe-labels-and-supported-open-links',
    normalized.status === 'display_ready_records_normalized' &&
      visibleRecords.length >= 5 &&
      visibleRecords.every((record) => /^[0-9]+$/.test(String(record.internalId || '')) && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || ''))) &&
      visibleRecords.some((record) => /Beacon Ridge Contractor Panel SKU/.test(record.name)) &&
      visibleRecords.some((record) => /SO-W325/.test(record.name)),
    visibleRecords.map((record) => `${record.consultantLabel}:${record.name}:${record.internalId}:${record.supportedOpenUrl}`).join(' | '));

  assertCase(results, 'fake-open-links-remain-blocked-before-valid-import',
    normalized.noRegression.fakeOpenLinksBlockedBeforeValidImport === true &&
      trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      !/REPLACE_|YOUR_ACCOUNT_ID|example\.com|javascript:/i.test(visibleRecords.map((record) => record.supportedOpenUrl).join(' ')),
    visibleRecords.map((record) => record.supportedOpenUrl).join(' | '));

  assertCase(results, 'story-surface-includes-required-w325-industry-story-elements',
    includesAll(storyText, [
      'contractor',
      'availability',
      'Product SKU',
      'Branch Availability',
      'Fulfillment Support SKU',
      'callback',
      'branch transfer',
      'supplier ETA',
      'Eclipse reports',
      'supplier portals',
      'Excel',
      'customer texts',
      'fewer callbacks',
      'contractor counter decisions',
      'margin protection',
      'guaranteed delivery',
      'measured ROI',
      'source-pack truth',
      'website/category'
    ]),
    storyText);

  assertCase(results, 'consultant-facing-output-blocks-manufacturing-wip-leakage-for-distribution',
      !forbiddenRegex.test(labels.join(' | ')) &&
      !/Finished\/Assembly Item|Formula or Batch Structure|Ingredient|Component Item|Work Order|Routing/i.test(story.openTarget) &&
      !/Finished\/Assembly Item|Formula or Batch Structure|Ingredient|Component Item|Work Order|Routing/i.test(story.proofMove) &&
      !/manufacturing|WIP/i.test(story.doNotClaim),
    storyText);

  assertCase(results, 'w144-submit-refresh-import-and-w151-w214-w245-validation-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true &&
      trace.guardrails.w151W214W245ValidationUnchanged === true,
    'adapter and validation anchors remain present');

  assertCase(results, 'no-runtime-authority-or-source-pack-changes',
    !/Beacon Ridge Electrical Supply|electrical-components-distributor-review-only/i.test(sourceLanePacks) &&
      trace.guardrails.runtimeAuthorityChangesIntroduced === false &&
      trace.guardrails.drawerCreatedRecordsIntroduced === false &&
      trace.guardrails.drawerTransactionWritesIntroduced === false &&
      trace.guardrails.sourcePackMutationIntroduced === false &&
      trace.guardrails.fakeOpenLinksIntroduced === false &&
      normalized.noRegression.noDrawerWrites === true &&
      normalized.noRegression.noDrawerCreatedRecords === true &&
      normalized.noRegression.noDrawerTransactionWrites === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:live-smoke-improved-industry-story-surface-w325'] === 'node archive/tools/run_w325_live_smoke_improved_industry_story_surface_harness.js' &&
      /run_w325_live_smoke_improved_industry_story_surface_harness/.test(packageJson.scripts.check) &&
      trace.selectedNextBlock.id === 'W326',
    JSON.stringify(trace.selectedNextBlock));

  printResults('W325 live smoke improved industry story surface harness', results);
}

main();
