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

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W319 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js');
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const userscript = read(userscriptPath);
  const report = readArchiveText('reports', 'w319_install_runner_vocabulary_patch_live_distribution_smoke.md');
  const trace = readArchiveJson('trace_samples', 'w319_install_runner_vocabulary_patch_live_distribution_smoke_trace.json');
  const w318Trace = readArchiveJson('trace_samples', 'w318_runner_lane_vocabulary_reconciliation_trace.json');

  const state = motionState(hooks, {
    intake: {
      customer: 'Summit Electrical Supply',
      website: 'https://www.gexpro.com',
      notes: 'First call with VP Sales and branch operations. Contractors need to know if project-critical electrical components are branch available or stuck with a supplier before quote-to-order commitment.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  const corrected = completedMotionResult({ prefix: '319', salesOrderName: 'SO-W319 Summit Branch Availability' });
  corrected.records[0].name = 'Summit Electrical Supply Customer Account';
  corrected.records[2].name = 'Summit Electrical Supply Product Availability SKU';
  corrected.records[3].name = 'Summit Electrical Supply Branch Replenishment Flow';
  corrected.records[4] = {
    role: 'supporting_sku',
    recordType: 'inventoryitem',
    type: 'inventoryitem',
    name: 'Summit Electrical Supply Fulfillment Support SKU',
    internalId: '31905',
    url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=31905'
  };
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRefreshResponse('runner-w319-summit-good', corrected), {
    phase: 'refresh',
    runnerTaskId: 'runner-w319-summit-good',
    idempotencyToken: 'summit-w319-good'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const html = hooks.renderConsultantStorySurfaceW248(normalizedImport.consultantStorySurfaceW247);

  assertCase(results, 'w319-report-and-trace-exist',
    /W319 Install Runner Vocabulary Patch And Live Distribution Smoke/.test(report) &&
      trace.schema === 'forge.w319.install-runner-vocabulary-patch-live-distribution-smoke.trace.v1' &&
      trace.status === 'operator_upload_required',
    JSON.stringify({ status: trace.status, decision: trace.decision }));

  assertCase(results, 'upload-summary-is-exact-runner-and-w144-adapter-only',
    trace.uploadPacket.uploadOnly.length === 2 &&
      trace.uploadPacket.uploadOnly.indexOf('netsuite/runner/scai_ss_so_csv_runner_v4_0_0_runner_sandbox.js') >= 0 &&
      trace.uploadPacket.uploadOnly.indexOf('netsuite/idb_governed_runner_adapter_w144_suitelet.js') >= 0 &&
      trace.uploadPacket.optionalDrawerRefresh === 'idb-drawer.user.js' &&
      trace.uploadPacket.sourceLanePacksMutated === false &&
      trace.uploadPacket.autoInstallIntroduced === false,
    JSON.stringify(trace.uploadPacket));

  assertCase(results, 'w318-runner-vocabulary-patch-present-in-upload-files',
    /function runnerLaneVocabularyPolicyV1/.test(runner) &&
      /custscript_v3_runner_idb_request_json/.test(runner) &&
      /Branch Availability \/ Replenishment Flow/.test(runner) &&
      /Fulfillment Support SKU/.test(runner) &&
      /mode === 'distribution_replenishment' && base === 'formula_or_batch_structure'\) return 'replenishment_or_availability_flow'/.test(adapter) &&
      /mode === 'distribution_replenishment' && base === 'component_item'\) return 'supporting_sku'/.test(adapter),
    'runner and adapter should include W318 vocabulary reconciliation');

  assertCase(results, 'live-smoke-evidence-packet-has-required-fields',
    trace.liveSmokeEvidencePacket.installTarget === 'td3021666.app.netsuite.com' &&
      trace.liveSmokeEvidencePacket.adapterEndpointPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      trace.liveSmokeEvidencePacket.prospectName === 'Summit Electrical Supply' &&
      trace.liveSmokeEvidencePacket.website === 'https://www.gexpro.com' &&
      trace.liveSmokeEvidencePacket.toggles.manufacturing === false &&
      trace.liveSmokeEvidencePacket.toggles.wip === false &&
      Array.isArray(trace.liveSmokeEvidencePacket.returnedRecords) &&
      Array.isArray(trace.liveSmokeEvidencePacket.openLinkVerification),
    JSON.stringify(trace.liveSmokeEvidencePacket));

  assertCase(results, 'decision-remains-needs-attention-until-real-upload-run-evidence',
    trace.decision === 'needs_attention' &&
      trace.decisionReason.indexOf('authenticated NetSuite upload and live smoke evidence are not present') >= 0 &&
      trace.acceptanceCriteria.currentDecision === 'needs_attention' &&
      trace.liveSmokeEvidencePacket.runnerFileUploaded === null &&
      trace.liveSmokeEvidencePacket.runnerTaskIdCaptured === null,
    JSON.stringify({ decision: trace.decision, reason: trace.decisionReason }));

  assertCase(results, 'corrected-distribution-result-would-pass-import-guards',
    completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      normalizedImport.visibleRecords.some((record) => record.recordName === 'Summit Electrical Supply Product Availability SKU' && /Product SKU/.test(record.consultantLabel) && record.safeToOpen === true) &&
      normalizedImport.visibleRecords.some((record) => /Branch Replenishment Flow/.test(record.recordName) && /Availability|Replenishment/.test(record.consultantLabel) && record.safeToOpen === true),
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.safeToOpen}`)));

  assertCase(results, 'blocked-vocabulary-acceptance-criteria-present',
    trace.acceptanceCriteria.readyToKeepRequires.some((item) => /avoid Style, Formula, Ingredient, Assembly, Work Order, Routing, and WIP/.test(item)) &&
      trace.acceptanceCriteria.rollbackTriggers.indexOf('bad vocabulary imported') >= 0 &&
      !/Style SKU|Formula|Ingredient|Assembly|Work Order|Routing|WIP/.test(corrected.records.map((record) => record.name).join(' ')),
    JSON.stringify(trace.acceptanceCriteria));

  assertCase(results, 'normal-consultant-ui-hides-diagnostics',
    !/custscript_v3_runner_idb_request_json|runnerLaneVocabularyPolicy|finalGeneratedNamesJson|stack trace|script=6702|deploy=2|runner-w319-summit-good/i.test(html) &&
      trace.continuity.normalConsultantUiChanged === false,
    html.slice(0, 700));

  assertCase(results, 'w318-continuity-remains-available',
    w318Trace.status === 'runner_lane_vocabulary_policy_applied' &&
      w318Trace.nextRecommendedBlock === 'W319: Install Runner Vocabulary Patch And Live Distribution Smoke' &&
      trace.continuity.w318RunnerLaneVocabularyReconciliationAvailable === true,
    JSON.stringify({ w318: w318Trace.status, next: w318Trace.nextRecommendedBlock }));

  assertCase(results, 'w264-w265-validation-and-authority-boundaries-preserved',
    trace.continuity.w264ConnectedBuildContinuityRequired === true &&
      trace.continuity.w265RetrySafetyRequired === true &&
      trace.continuity.w151ValidationWeakened === false &&
      trace.continuity.w214SemanticGuardWeakened === false &&
      trace.continuity.w245CanonicalImportWeakened === false &&
      trace.continuity.recordCreationAuthorityChanged === false,
    JSON.stringify(trace.continuity));

  assertCase(results, 'package-registration-and-next-block-present',
    packageJson.scripts['harness:install-runner-vocabulary-patch-live-distribution-smoke-w319'] === 'node archive/tools/run_w319_install_runner_vocabulary_patch_live_distribution_smoke_harness.js' &&
      packageJson.scripts.check.includes('run_w319_install_runner_vocabulary_patch_live_distribution_smoke_harness.js') &&
      trace.nextRecommendedBlock === 'W320: Storytelling Polish And Industry Expansion Prioritization' &&
      userscript.indexOf('Bug / Idea') >= 0,
    packageJson.scripts['harness:install-runner-vocabulary-patch-live-distribution-smoke-w319'] || '');

  printResults('W319 install runner vocabulary patch live distribution smoke harness', results);
}

main();
