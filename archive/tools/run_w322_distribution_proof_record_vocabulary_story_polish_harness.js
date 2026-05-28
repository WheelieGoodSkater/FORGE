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

function triStateCompletedResult() {
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
        name: 'Tri-State Hose & Hydraulics Customer Account',
        internalId: '2322',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=2322'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO2690',
        internalId: '82129',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=82129'
      },
      {
        role: 'finished_or_assembly_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Tri-State Hose & Hydraulics Machine Unit - ALDISTRI-OPNPVC-M6F',
        internalId: '4045',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=4045'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Branch Availability / Replenishment Flow - Tri-State Hose & H - ALDISTRI-OPNPVC-M6F',
        internalId: '4046',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=4046'
      },
      {
        role: 'component_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Fulfillment Support SKU - Tri-State Hose & Hydraulics Frame W - ALDISTRI-OPNPVC-M6F',
        internalId: '4047',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=4047'
      }
    ]
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W322 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w322_distribution_proof_record_vocabulary_story_polish.md');
  const trace = readArchiveJson('trace_samples', 'w322_distribution_proof_record_vocabulary_story_polish_trace.json');
  const w321Trace = readArchiveJson('trace_samples', 'w321_live_writeback_baseline_industry_story_pivot_trace.json');
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');

  const state = motionState(hooks, {
    selectedLaneId: 'industrial_distribution',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: 'Tri-State Hose & Hydraulics',
      website: 'https://www.gates.com',
      notes: 'First discovery call with the regional sales manager and branch operations lead. The team says the biggest trust issue is promising availability before they know whether the part is in the local branch, available from another branch, or waiting on supplier replenishment.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    triStateCompletedResult(),
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
  const storyText = [
    story.openTarget,
    story.proofMove,
    story.safeClaim,
    story.doNotClaim,
    story.buyerFacingSoWhat,
    story.competitiveContrast,
    story.firstCallSummaryW322,
    story.objectionResponseW322,
    script.lines && Object.keys(script.lines).map((key) => script.lines[key]).join(' '),
    sequence.safeObjectionResponse,
    renderedStory
  ].join(' ');
  const coreStoryText = [
    story.openTarget,
    story.proofMove,
    story.safeClaim,
    story.doNotClaim,
    story.buyerFacingSoWhat,
    story.competitiveContrast,
    story.firstCallSummaryW322,
    story.objectionResponseW322
  ].join(' ');
  const forbiddenTerms = trace.distributionProofRecordVocabulary.blockedConsultantFacingTerms;
  const forbiddenRegex = new RegExp(forbiddenTerms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  const visibleRecords = normalized.visibleRecords || [];

  assertCase(results, 'w321-baseline-remains-available',
    w321Trace.status === 'live_writeback_baseline_locked' &&
      w321Trace.baseline.finalDrawerStatus === 'completed_result_imported' &&
      w321Trace.guardrails.w144SubmitRefreshImportUnchanged === true,
    JSON.stringify({ w321: w321Trace.status }));

  assertCase(results, 'w322-vocabulary-and-story-packets-exist',
    /Distribution Proof Record Vocabulary/.test(report) &&
      /Story Surface Polish/.test(report) &&
      trace.schema === 'forge.w322.distribution-proof-record-vocabulary-story-polish.trace.v1' &&
      trace.status === 'distribution_story_polish_ready',
    JSON.stringify({ schema: trace.schema, status: trace.status }));

  assertCase(results, 'returned-record-labels-are-distribution-safe',
    ['Customer', 'Sales Order', 'Product SKU', 'Branch Availability / Replenishment Flow', 'Fulfillment Support SKU'].every((label) => labels.indexOf(label) >= 0),
    labels.join(' | '));

  assertCase(results, 'consultant-facing-distribution-output-blocks-manufacturing-vocabulary',
    !forbiddenRegex.test(labels.join(' | ')) &&
      !forbiddenRegex.test(story.openTarget) &&
      !forbiddenRegex.test(story.proofMove) &&
      !forbiddenRegex.test(story.safeClaim) &&
      !forbiddenRegex.test(script.lines.openingLine) &&
      !forbiddenRegex.test(sequence.safeObjectionResponse),
    storyText);

  assertCase(results, 'raw-netsuite-record-type-compatibility-is-preserved',
    visibleRecords.length >= 5 &&
      visibleRecords.some((record) => record.recordType === 'customer' && record.internalId === '2322') &&
      visibleRecords.some((record) => record.recordType === 'salesorder' && record.internalId === '82129') &&
      visibleRecords.filter((record) => record.recordType === 'inventoryitem' && /^[0-9]+$/.test(String(record.internalId))).length >= 3 &&
      trace.guardrails.rawNetSuiteRecordTypeCompatibilityPreserved === true,
    visibleRecords.map((record) => `${record.consultantLabel}:${record.recordType}:${record.internalId}`).join(' | '));

  assertCase(results, 'w151-w214-w245-validation-unchanged',
    /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w151W214W245ValidationUnchanged === true,
    'validation anchors remain present');

  assertCase(results, 'w144-submit-refresh-import-unchanged',
    /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter) &&
      /runnerTaskId/.test(adapter) &&
      trace.guardrails.w144SubmitRefreshImportUnchanged === true,
    'adapter W144 anchors remain present');

  assertCase(results, 'returned-record-names-ids-and-open-links-are-preserved-after-valid-import',
    normalized.status === 'display_ready_records_normalized' &&
      visibleRecords.every((record) => /^[0-9]+$/.test(String(record.internalId || '')) && /^https:\/\/td3021666\.app\.netsuite\.com\/app\//.test(String(record.supportedOpenUrl || ''))) &&
      visibleRecords.some((record) => /SO2690/.test(record.name)) &&
      visibleRecords.some((record) => /Branch Availability/.test(record.name)),
    visibleRecords.map((record) => `${record.name} -> ${record.supportedOpenUrl}`).join(' | '));

  assertCase(results, 'fake-open-links-remain-blocked-before-valid-import',
    normalized.noRegression.fakeOpenLinksBlockedBeforeValidImport === true &&
      trace.guardrails.returnedRecordOpenLinksOnlyAfterValidImport === true &&
      !/REPLACE_|YOUR_ACCOUNT_ID|example\.com|javascript:/i.test(visibleRecords.map((record) => record.supportedOpenUrl).join(' ')),
    visibleRecords.map((record) => record.supportedOpenUrl).join(' | '));

  assertCase(results, 'review-run-story-is-concise-sales-useful-and-claim-safe',
    /branch can make a believable availability promise/i.test(script.lines.openingLine) &&
      /returned records/i.test(sequence.safeObjectionResponse) &&
      /fewer missed promises/i.test(story.buyerFacingSoWhat) &&
      /measured ROI/i.test(story.doNotClaim) &&
      /record creation|write actions/i.test(story.doNotClaim) &&
      coreStoryText.length < 2500,
    coreStoryText);

  assertCase(results, 'normal-ui-hides-diagnostics-and-runtime-authority-is-unchanged',
    trace.guardrails.normalConsultantUiHiddenDiagnostics === true &&
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
    packageJson.scripts['harness:distribution-proof-record-vocabulary-story-polish-w322'] === 'node archive/tools/run_w322_distribution_proof_record_vocabulary_story_polish_harness.js' &&
      /run_w322_distribution_proof_record_vocabulary_story_polish_harness/.test(packageJson.scripts.check) &&
      trace.selectedNextBlock.id === 'W323',
    JSON.stringify(trace.selectedNextBlock));

  printResults('W322 distribution proof record vocabulary and story polish harness', results);
}

main();
