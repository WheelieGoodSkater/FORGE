#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const workflow = require('../../src/contracts/lanePackExpansionWorkflow');
const storyContracts = require('../../src/contracts/storyCoachingSurfaces');
const liveEvidence = require('../../src/contracts/liveEvidencePackets');
const {
  assertCase,
  completedMotionResult,
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

function ids(items) {
  return items.map((item) => item.id);
}

function includesAll(values, required) {
  return required.every((value) => values.indexOf(value) >= 0);
}

function readinessContains(readiness, expected) {
  return expected.every((value) => readiness.indexOf(value) >= 0);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W275 harness' });
  const userscript = read(userscriptPath);
  const harnessSource = read(path.join(root, 'archive', 'tools', 'run_w275_extraction_closure_runtime_inventory_harness.js'));
  const report = readArchiveText('reports', 'w275_extraction_closure_runtime_inventory.md');
  const trace = readArchiveJson('trace_samples', 'w275_extraction_closure_runtime_inventory_trace.json');
  const closureIds = ids(trace.extractionClosureMap.blocks);
  const groups = trace.runtimeHelperDependencyInventory.groups;
  const groupIds = ids(groups);
  const readiness = trace.optimizationReadinessPacket.futureRuntimeExtractionAcceptedOnlyIf;

  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: 'Unknown',
      website: 'https://unknown-example.com',
      notes: 'Conflicting evidence across category and conversation notes.'
    }
  }, null, { displayReadyRecords: [] });

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w275-motion-001',
      idempotencyToken: 'motion-w275-token',
      resultCapture: {
        status: 'pending_runner_completion',
        runnerTaskId: 'runner-w275-motion-001'
      }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w275-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w275-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '275' })
      }
    }
  });

  assertCase(results, 'extraction-closure-map-includes-w270-through-w274',
    includesAll(closureIds, ['W270', 'W271', 'W272', 'W273', 'W274']) &&
      trace.extractionClosureMap.blocks.every((block) => block.runtimeBehaviorChanged === false) &&
      trace.extractionClosureMap.blocks.some((block) => block.artifact === 'archive/tools/lib/forge_harness_fixtures.js') &&
      trace.extractionClosureMap.blocks.some((block) => block.artifact === 'src/contracts/adapterProfiles.js') &&
      trace.extractionClosureMap.blocks.some((block) => block.artifact === 'src/contracts/liveEvidencePackets.js') &&
      trace.extractionClosureMap.blocks.some((block) => block.artifact === 'src/contracts/storyCoachingSurfaces.js') &&
      trace.extractionClosureMap.blocks.some((block) => block.artifact === 'src/contracts/lanePackExpansionWorkflow.js'),
    JSON.stringify(trace.extractionClosureMap.blocks));

  assertCase(results, 'runtime-helper-dependency-inventory-includes-required-groups',
    trace.runtimeHelperDependencyInventory.sourceFile === 'idb-drawer.user.js' &&
      includesAll(groupIds, [
        'adapter_profile_readiness',
        'connected_submit_refresh_import',
        'live_evidence_signoff_packets',
        'story_receipt_script_sequence',
        'lane_pack_authoring_diff_review_qa',
        'normal_consultant_ui_renderers',
        'admin_debug_only_renderers'
      ]),
    JSON.stringify(groupIds));

  assertCase(results, 'each-helper-group-maps-to-contract-or-protected-surface',
    groups.every((group) =>
      group.governingContract &&
      group.protectedSurfaces &&
      group.protectedSurfaces.length > 0 &&
      group.firstSafeOpportunity &&
      group.rollbackBoundary
    ) &&
      groups.some((group) => group.governingContract === 'protected runtime surface') &&
      groups.some((group) => group.governingContract === 'src/contracts/liveEvidencePackets.js'),
    JSON.stringify(groups.map((group) => ({ id: group.id, governingContract: group.governingContract }))));

  assertCase(results, 'first-optimization-slice-selected-with-parity-and-rollback',
    trace.selectedFirstOptimizationSlice.id === 'review_only_live_evidence_signoff_bridge' &&
      trace.selectedFirstOptimizationSlice.targetContract === 'src/contracts/liveEvidencePackets.js' &&
      includesAll(trace.selectedFirstOptimizationSlice.parityHarnesses, ['W260', 'W261', 'W266', 'W267', 'W268', 'W272', 'W275']) &&
      /restore drawer-local W265-W268 helpers/i.test(trace.selectedFirstOptimizationSlice.rollbackBoundary),
    JSON.stringify(trace.selectedFirstOptimizationSlice));

  assertCase(results, 'optimization-readiness-packet-requires-w244-w275-check-and-validate',
    readinessContains(readiness, [
      'W244-W275 harnesses pass',
      'npm run check passes',
      'npm run validate passes'
    ]),
    JSON.stringify(readiness));

  assertCase(results, 'normal-ui-connected-build-and-lane-resolution-marked-unchanged',
    trace.optimizationReadinessPacket.normalConsultantUiChanged === false &&
      trace.optimizationReadinessPacket.connectedBuildFlowChanged === false &&
      trace.optimizationReadinessPacket.laneResolutionChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.laneResolutionChanged === false,
    JSON.stringify({ readiness: trace.optimizationReadinessPacket, guardrails: trace.guardrails }));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.guardrails.weakEvidenceConfirmationFirst === true,
    JSON.stringify(weakStory));

  assertCase(results, 'w274-lane-pack-expansion-workflow-contract-remains-available',
    workflow.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      typeof workflow.expansionGuardrailCheck === 'function',
    JSON.stringify(workflow.exportedContractSummary()));

  assertCase(results, 'w273-story-coaching-contract-remains-available',
    storyContracts.exportedContractSummary().schema === 'forge.w273.story-coaching-surfaces.v1' &&
      typeof storyContracts.consultantSafeGuardrailCheck === 'function',
    JSON.stringify(storyContracts.exportedContractSummary()));

  assertCase(results, 'w272-live-evidence-signoff-contract-remains-available',
    liveEvidence.exportedContractSummary().schema === 'forge.w272.live-evidence-packets.v1' &&
      typeof liveEvidence.releaseSignoffFromEvidence === 'function' &&
      typeof liveEvidence.liveRunDecision === 'function' &&
      liveEvidence.isReviewOnlyPolicySafe(liveEvidence.reviewOnlyPolicy()) === true,
    JSON.stringify(liveEvidence.exportedContractSummary()));

  assertCase(results, 'w264-connected-build-imports-only-w151-valid-completed-results',
    w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w270-shared-harness-utilities-remain-available',
    fs.existsSync(path.join(root, 'archive', 'tools', 'lib', 'forge_harness_fixtures.js')) &&
      harnessSource.includes("require('./lib/forge_harness_fixtures')"),
    'archive/tools/lib/forge_harness_fixtures.js');

  assertCase(results, 'no-runtime-file-behavior-changes-introduced',
    !/w275_extraction_closure_runtime_inventory/.test(userscript) &&
      /runtime behavior unchanged/i.test(report) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W275 Extraction Closure Runtime Inventory/.test(report) &&
      trace.schema === 'forge.w275.extraction-closure-runtime-inventory.trace.v1' &&
      trace.extractionClosureMap.schema === 'forge.w275.extraction-closure-map.v1' &&
      trace.runtimeHelperDependencyInventory.schema === 'forge.w275.runtime-helper-dependency-inventory.v1',
    JSON.stringify({ report: 'archive/reports/w275_extraction_closure_runtime_inventory.md', trace: trace.schema }));

  printResults('W275 extraction closure runtime inventory harness', results);
}

main();
