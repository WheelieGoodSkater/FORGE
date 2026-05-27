#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  completedMotionResult,
  completedRefreshResponse,
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

function summitBadResult() {
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
        name: 'Summit Electrical Supply Customer Account',
        internalId: '2222',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=2222'
      },
      {
        role: 'sales_order',
        recordType: 'salesorder',
        type: 'salesorder',
        name: 'SO2689',
        internalId: '82029',
        url: 'https://td3021666.app.netsuite.com/app/accounting/transactions/salesord.nl?id=82029'
      },
      {
        role: 'branch_or_product_sku',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Summit Electrical Supply Style SKU - DISTRIBU-NBYNJB-WFH',
        internalId: '3345',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=3345'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Formula / Availability Context - Summit Electrical Supply Omn - DISTRIBU-NBYNJB-WFH',
        internalId: '3346',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=3346'
      },
      {
        role: 'component_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Ingredient / Packaging Component - Summit Electrical Supply C - DISTRIBU-NBYNJB-WFH',
        internalId: '3347',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=3347'
      }
    ]
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W318 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w318_runner_lane_vocabulary_reconciliation.md');
  const trace = readArchiveJson('trace_samples', 'w318_runner_lane_vocabulary_reconciliation_trace.json');

  const state = motionState(hooks, {
    intake: {
      customer: 'Summit Electrical Supply',
      website: 'https://www.gexpro.com',
      notes: 'Buyer: First discovery call with VP Sales and branch operations lead. Pain: contractors ask whether project-critical electrical components are actually available at the branch or stuck with a supplier. Proof: Prove Inventory / Fulfillment readiness with Inventory / Fulfillment.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  const confirmedRequest = hooks.confirmedBuildRequestJsonV1(state, context.lane, context.page, context.recommendation);

  const badShape = hooks.actualAdapterResponseShapeW265(completedRefreshResponse('runner-w318-summit-bad', summitBadResult()), {
    phase: 'refresh',
    runnerTaskId: 'runner-w318-summit-bad',
    idempotencyToken: 'summit-w318-bad'
  });
  const badGuard = hooks.validateDccFinalNamingImportPayload(badShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const badSemantic = hooks.completedRunnerResultSemanticGuardW214(badGuard.finalNaming, state, context.lane, badShape.finalGeneratedNamesJson);

  const corrected = completedMotionResult({ prefix: '318', salesOrderName: 'SO-W318 Summit Branch Availability' });
  corrected.records[0].name = 'Summit Electrical Supply Customer Account';
  corrected.records[2].name = 'Summit Electrical Supply Product Availability SKU';
  corrected.records[3].name = 'Summit Electrical Supply Branch Replenishment Flow';
  const goodShape = hooks.actualAdapterResponseShapeW265(completedRefreshResponse('runner-w318-summit-good', corrected), {
    phase: 'refresh',
    runnerTaskId: 'runner-w318-summit-good',
    idempotencyToken: 'summit-w318-good'
  });
  const goodGuard = hooks.validateDccFinalNamingImportPayload(goodShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const goodSemantic = hooks.completedRunnerResultSemanticGuardW214(goodGuard.finalNaming, state, context.lane, goodShape.finalGeneratedNamesJson);
  const goodImport = hooks.canonicalImportResultNormalizationW245(goodShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);

  assertCase(results, 'w318-agent-plan-consolidates-goals',
    trace.agentPlan.runnerContractAgent.goal === 'derive lane vocabulary policy from confirmed build request, not customer examples' &&
      trace.agentPlan.runnerMutationAgent.goal === 'apply policy at runner naming and result-capture save points' &&
      trace.agentPlan.drawerGuardAgent.goal === 'keep W151/W214/W245 strict and prove bad returned records stay blocked' &&
      trace.agentPlan.smokeAnalystAgent.goal === 'use Summit trace as regression evidence without saving Summit as a special case',
    JSON.stringify(trace.agentPlan));

  assertCase(results, 'confirmed-request-carries-distribution-contract',
    confirmedRequest.resolvedOperatingMode === 'distribution_replenishment' &&
      confirmedRequest.resultValidationExpectations.recordContract.allowedNouns.indexOf('product availability sku') >= 0 &&
      confirmedRequest.resultValidationExpectations.recordContract.allowedNouns.indexOf('branch replenishment flow') >= 0 &&
      confirmedRequest.resultValidationExpectations.recordContract.invalidTerms.indexOf('ingredient') >= 0 &&
      confirmedRequest.selectedToggles.enableManufacturing === false &&
      confirmedRequest.selectedToggles.enableWip === false,
    JSON.stringify(confirmedRequest.resultValidationExpectations.recordContract));

  assertCase(results, 'runner-reads-confirmed-build-request-json',
    /confirmedBuildRequestJson:\s*parseEmbeddedJson\(s\.getParameter\(\{\s*name:\s*'custscript_v3_runner_idb_request_json'\s*\}\)\)/.test(runner) &&
      /confirmedBuildRequestJson\s*=\s*runnerParams\.confirmedBuildRequestJson/.test(runner) &&
      /confirmedBuildRequestJson/.test(runner),
    'runner should consume W144 confirmed request context');

  assertCase(results, 'runner-policy-is-contract-shaped-not-example-shaped',
    /function runnerLaneVocabularyPolicyV1/.test(runner) &&
      /idb\.runner-lane-vocabulary-policy\.v1/.test(runner) &&
      /resultValidationExpectations/.test(runner) &&
      /recordContract/.test(runner) &&
      /allowedNouns/.test(runner) &&
      /invalidTerms/.test(runner) &&
      !/Summit Electrical Supply/.test(runner),
    'runner policy should not special-case the Summit smoke prospect');

  assertCase(results, 'distribution-mode-wins-before-dealer-and-apparel-fallbacks',
    /distribution_replenishment\|industrial_distribution\|distribution\|branch/.test(runner) &&
      runner.indexOf("return 'distribution_replenishment';") < runner.indexOf("return 'dealer_hardgoods';") &&
      /modeKey === 'distribution_replenishment'/.test(runner),
    'distribution should not drift to dealer/apparel fallback vocabulary');

  assertCase(results, 'runner-blocks-distribution-style-formula-ingredient-names',
    /style\|formula\|ingredient\|batch\|assembly\|work\\s\+order\|routing\|wip/.test(runner) &&
      /Product Availability SKU/.test(runner) &&
      /Availability Flow/.test(runner) &&
      /Fulfillment Support SKU/.test(runner),
    'runner should rewrite distribution/no-manufacturing vocabulary before records are created');

  assertCase(results, 'sidecar-result-capture-uses-policy-safe-final-names',
    /writeIdbSidecarResultCaptureV1/.test(runner) &&
      /resultNames\s*=\s*applyToggleAwareNamingGuardrails/.test(runner) &&
      /laneVocabularyPolicy/.test(runner) &&
      /Branch Availability \/ Replenishment Flow/.test(runner) &&
      /Fulfillment Support SKU/.test(runner),
    'result capture should not reintroduce Formula or Ingredient prefixes after the first naming guard');

  assertCase(results, 'adapter-canonicalizes-legacy-slots-for-distribution',
    /mode === 'distribution_replenishment' && base === 'formula_or_batch_structure'\) return 'replenishment_or_availability_flow'/.test(adapter) &&
      /mode === 'distribution_replenishment' && base === 'component_item'\) return 'supporting_sku'/.test(adapter) &&
      /supporting_sku/.test(adapter),
    'adapter should preserve legacy slots while exposing distribution-safe canonical roles');

  assertCase(results, 'current-bad-summit-result-remains-blocked-or-known-risk',
    trace.summitSmokeFailure.completedResultStatus === 'toggle_vocabulary_guardrail_failed' &&
      (badShape.finalGeneratedNamesReady === true || badShape.finalGeneratedNamesJsonReady === true || !!badShape.finalGeneratedNamesJson) &&
      badGuard.valid === false &&
      badGuard.status === 'toggle_vocabulary_guardrail_failed' &&
      badSemantic.valid === false &&
      trace.guardrails.strictValidationPreserved === true &&
      trace.summitSmokeFailure.invalidReturnedTerms.indexOf('Formula / Availability Context') >= 0 &&
      trace.summitSmokeFailure.invalidReturnedTerms.indexOf('Ingredient / Packaging Component') >= 0,
    JSON.stringify({ badShape: badShape.status, badGuard: badGuard.status, badSemantic: badSemantic.status }));

  assertCase(results, 'corrected-distribution-result-imports-with-safe-labels-and-open-links',
    goodGuard.valid === true &&
      goodSemantic.valid === true &&
      goodImport.status === 'display_ready_records_normalized' &&
      goodImport.visibleRecords.some((record) => record.recordName === 'Summit Electrical Supply Product Availability SKU' && /Product SKU/.test(record.consultantLabel) && record.safeToOpen === true) &&
      goodImport.visibleRecords.some((record) => /Branch Replenishment Flow/.test(record.recordName) && /Availability|Replenishment/.test(record.consultantLabel) && record.safeToOpen === true),
    JSON.stringify(goodImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.safeToOpen}`)));

  assertCase(results, 'normal-consultant-ui-and-runtime-authority-remain-unchanged',
    trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.drawerCreatedRecords === false &&
      trace.guardrails.drawerTransactionWrites === false &&
      trace.guardrails.w144DeploymentUpdated === false &&
      !/custscript_v3_runner_idb_request_json|runnerLaneVocabularyPolicy|finalGeneratedNamesJson|stack trace|script=6702|deploy=2/i.test(hooks.renderConsultantStorySurfaceW248(goodImport.consultantStorySurfaceW247)),
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w264-w317-continuity-and-package-registration',
    trace.continuity.w264ThroughW317StillRequired === true &&
      packageJson.scripts['harness:runner-lane-vocabulary-reconciliation-w318'] === 'node archive/tools/run_w318_runner_lane_vocabulary_reconciliation_harness.js' &&
      packageJson.scripts.check.includes('run_w318_runner_lane_vocabulary_reconciliation_harness.js') &&
      userscript.indexOf('Bug / Idea') >= 0,
    packageJson.scripts['harness:runner-lane-vocabulary-reconciliation-w318'] || '');

  printResults('W318 runner lane vocabulary reconciliation harness', results);
}

main();
