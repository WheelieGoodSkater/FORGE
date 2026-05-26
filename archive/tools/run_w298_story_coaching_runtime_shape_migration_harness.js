#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const storyContracts = require('../../src/contracts/storyCoachingSurfaces');
const storyBridge = require('../../src/contracts/storyCoachingBridge');
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
  submitResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function bridgePacketFromShape(shape) {
  return storyBridge.bridgeStoryCoachingSurfaces({
    w254EvidenceReceipt: shape.w254EvidenceReceipt,
    w255FirstGlance: shape.w255FirstGlance,
    w256LiveDemoScript: shape.w256LiveDemoScript,
    w257GuidedSequence: shape.w257GuidedSequence
  }, { hasValidImport: true });
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W298 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w298_story_coaching_runtime_shape_migration.md');
  const trace = readArchiveJson('trace_samples', 'w298_story_coaching_runtime_shape_migration_trace.json');
  const w297Trace = readArchiveJson('trace_samples', 'w297_story_update_input_bridge_closure_story_coaching_readiness_trace.json');
  const w296Trace = readArchiveJson('trace_samples', 'w296_story_surface_update_input_bridge_trace.json');
  const w295Trace = readArchiveJson('trace_samples', 'w295_story_surface_update_input_contract_trace.json');
  const w294Trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '298' });
  const completedRaw = completedRefreshResponse('runner-w298-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w298-motion-001',
    idempotencyToken: 'motion-w298-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const story = normalizedImport.consultantStorySurfaceW247;
  const shape = hooks.storyCoachingRuntimeShapeW298(story);
  const bridgePacket = bridgePacketFromShape(shape);
  const directFirstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const directScript = hooks.consultantLiveDemoScriptW256(story);
  const directSequence = hooks.guidedDemoStepSequenceW257(story);
  const html = hooks.renderConsultantStorySurfaceW248(story);
  const safeStoryCheck = storyContracts.consultantSafeGuardrailCheck(Object.assign({}, story, {
    doNotClaimGuardrail: shape.w255FirstGlance.doNotClaimGuardrail,
    lines: shape.w256LiveDemoScript.lines,
    steps: shape.w257GuidedSequence.steps
  }));
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });
  const weakShape = hooks.storyCoachingRuntimeShapeW298(weakStory);
  const weakBridge = bridgePacketFromShape(weakShape);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w298-motion-001', 'motion-w298-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'w297-selected-source-anchors-present-or-mapped',
    [
      'consultantStorySurfaceFromLanePackW247',
      'storyEvidenceReceiptTrailW254',
      'consultantStoryFirstGlanceW255',
      'consultantLiveDemoScriptW256',
      'guidedDemoStepSequenceW257',
      'renderConsultantStorySurfaceW248',
      'storyCoachingRuntimeShapeW298'
    ].every((anchor) => userscript.indexOf(anchor) >= 0) &&
      trace.sourceAnchorsReviewed.indexOf('renderConsultantStorySurfaceW248') >= 0,
    JSON.stringify(trace.sourceAnchorsReviewed));

  assertCase(results, 'drawer-local-story-coaching-fact-assembly-field-compatible-with-w278',
    shape.schema === 'forge.w298.story-coaching-runtime-shape.v1' &&
      shape.governingContract === storyContracts.STORY_COACHING_SCHEMA_VERSION &&
      shape.governingBridge === storyBridge.STORY_COACHING_BRIDGE_SCHEMA_VERSION &&
      bridgePacket.status === 'bridge_ready' &&
      bridgePacket.entries.every((entry) => entry.status === 'bridge_ready'),
    JSON.stringify({ shape: shape.schema, bridge: bridgePacket.status, entries: bridgePacket.entries.map((entry) => `${entry.id}:${entry.status}`) }));

  assertCase(results, 'w254-w255-w256-w257-outputs-match-direct-helper-results',
    JSON.stringify(shape.w254EvidenceReceipt) === JSON.stringify(story.evidenceReceiptW254) &&
      JSON.stringify(shape.w255FirstGlance) === JSON.stringify(directFirstGlance) &&
      JSON.stringify(shape.w256LiveDemoScript) === JSON.stringify(directScript) &&
      JSON.stringify(shape.w257GuidedSequence) === JSON.stringify(directSequence),
    JSON.stringify({
      receipt: shape.w254EvidenceReceipt && shape.w254EvidenceReceipt.schema,
      firstGlance: shape.w255FirstGlance && shape.w255FirstGlance.schema,
      script: shape.w256LiveDemoScript && shape.w256LiveDemoScript.schema,
      sequence: shape.w257GuidedSequence && shape.w257GuidedSequence.schema
    }));

  assertCase(results, 'w247-story-surface-field-compatible-with-w273-w278-expectations',
    story.schema === 'forge.consultant-story-surface.v1' &&
      /^(story_ready|story_ready_without_open_target|needs_lane_confirmation)$/.test(story.status) &&
      safeStoryCheck.status === 'pass' &&
      storyContracts.packetMatchesShape(shape.w254EvidenceReceipt, storyContracts.shape('W254_EVIDENCE_RECEIPT')) &&
      storyContracts.packetMatchesShape(shape.w255FirstGlance, storyContracts.shape('W255_FIRST_GLANCE')) &&
      storyContracts.packetMatchesShape(shape.w256LiveDemoScript, storyContracts.shape('W256_LIVE_DEMO_SCRIPT')) &&
      storyContracts.packetMatchesShape(shape.w257GuidedSequence, storyContracts.shape('W257_GUIDED_SEQUENCE')),
    JSON.stringify({ storyStatus: story.status, safe: safeStoryCheck.status }));

  assertCase(results, 'render-consultant-story-surface-w248-remains-drawer-owned-and-visible-copy-unchanged',
    shape.boundaries.renderConsultantStorySurfaceW248DrawerOwned === true &&
      /function renderConsultantStorySurfaceW248/.test(userscript) &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      html.indexOf(shape.w255FirstGlance.openTarget) >= 0 &&
      html.indexOf(shape.w256LiveDemoScript.lines.whatToOpen) >= 0 &&
      trace.parity.visibleReviewRunCopyChanged === false,
    html.slice(0, 700));

  assertCase(results, 'migrated-helper-cannot-render-copy-mutate-import-create-write-links-invoke-adapter-or-declare-validity',
    Object.keys(shape.boundaries).every((key) => {
      if (key === 'renderConsultantStorySurfaceW248DrawerOwned') return shape.boundaries[key] === true;
      if (key === 'visibleReviewRunCopyChanged' || key === 'returnedRecordImportChanged' || key === 'w151W214W245ValidationChanged' || key === 'connectedSubmitRefreshImportChanged') return shape.boundaries[key] === false;
      return shape.boundaries[key] === false;
    }) &&
      trace.boundaries.canRenderUi === false &&
      trace.boundaries.canChangeVisibleCopy === false &&
      trace.boundaries.canMutateState === false &&
      trace.boundaries.canImportRecords === false &&
      trace.boundaries.canCreateRecords === false &&
      trace.boundaries.canWriteTransactions === false &&
      trace.boundaries.canCreateOpenLinks === false &&
      trace.boundaries.canInvokeAdapter === false &&
      trace.boundaries.canDeclareW245W151W214Validity === false,
    JSON.stringify({ shape: shape.boundaries, trace: trace.boundaries }));

  assertCase(results, 'drawer-self-contained-no-runtime-require-external-dependency-network-or-storage-write',
    !/require\(['\"][^'\"]*storyCoaching/.test(userscript) &&
      !/import\s+.*storyCoaching/.test(userscript) &&
      !/fetch\([^)]*storyCoaching/.test(userscript) &&
      !/localStorage\.setItem\([^)]*storyCoaching/.test(userscript),
    'drawer remains self-contained for W298 contract-shaped parity');

  assertCase(results, 'w297-w296-w295-w294-continuity-remains-available',
    w297Trace.status === 'closure_and_story_coaching_readiness_ready' &&
      w296Trace.status === 'bridge_ready' &&
      w295Trace.status === 'contract_ready' &&
      w294Trace.status === 'closure_and_story_update_readiness_ready' &&
      trace.continuity.w297ClosureReadinessMapAvailable === true &&
      trace.continuity.w296BridgeAvailableAndUnchanged === true &&
      trace.continuity.w295ContractAvailableAndUnchanged === true &&
      trace.continuity.w294ClosureReadinessMapAvailable === true,
    JSON.stringify({ w297: w297Trace.status, w296: w296Trace.status, w295: w295Trace.status, w294: w294Trace.status }));

  assertCase(results, 'w273-story-coaching-contract-and-w278-bridge-remain-available',
    storyContracts.exportedContractSummary().schema === 'forge.w273.story-coaching-surfaces.v1' &&
      storyBridge.exportedContractSummary().schema === 'forge.w278.story-coaching-bridge.v1' &&
      trace.continuity.w273StoryCoachingContractAvailable === true &&
      trace.continuity.w278StoryCoachingBridgeAvailable === true,
    JSON.stringify({ w273: storyContracts.exportedContractSummary().schema, w278: storyBridge.exportedContractSummary().schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.importCommit &&
      w264Flow.importCommit.commitAllowed === true &&
      completedGuard.status === 'completed_runner_result_accepted' &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      normalizedImport.status === 'display_ready_records_normalized' &&
      trace.continuity.w264SubmitRefreshImportChanged === false &&
      trace.continuity.w265RetrySafetyChanged === false &&
      trace.continuity.w245CanonicalImportChanged === false &&
      trace.continuity.w151ValidationChanged === false &&
      trace.continuity.w214SemanticGuardChanged === false,
    JSON.stringify({ w264: w264Flow.status, w151: completedGuard.status, w214: semanticGuard.status, w245: normalizedImport.status }));

  assertCase(results, 'returned-record-names-labels-supported-open-links-and-review-run-copy-preserved',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29803/.test(record.supportedOpenUrl)
    ) &&
      html.indexOf('Motion Branch Fulfillment SKU') >= 0 &&
      html.indexOf('Product SKU') >= 0 &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      weakShape.status === 'needs_confirmation' &&
      weakShape.guardrails.weakEvidenceConfirmationFirst === true &&
      weakShape.w256LiveDemoScript.status === 'needs_confirmation_script' &&
      weakShape.w257GuidedSequence.status === 'confirmation_first_sequence' &&
      weakBridge.status === 'bridge_ready' &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ story: weakStory.status, shape: weakShape.status, script: weakShape.w256LiveDemoScript.status, sequence: weakShape.w257GuidedSequence.status }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w298-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-changes-drawer-created-records-or-transaction-writes',
    shape.guardrails.noDrawerCreatedRecords === true &&
      shape.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noW144DeploymentUpdate === true,
    JSON.stringify({ shape: shape.guardrails, trace: trace.guardrails }));

  assertCase(results, 'w298-report-trace-harness-and-check-registration-present',
    /W298 Story Coaching Runtime Shape Migration/.test(report) &&
      trace.schema === 'forge.w298.story-coaching-runtime-shape-migration.trace.v1' &&
      trace.nextRecommendedBlock === 'W299: Story Coaching Runtime Shape Closure And Lane Resolution Readiness' &&
      packageJson.scripts['harness:story-coaching-runtime-shape-migration-w298'] &&
      packageJson.scripts.check.includes('run_w298_story_coaching_runtime_shape_migration_harness.js'),
    JSON.stringify({ report: 'archive/reports/w298_story_coaching_runtime_shape_migration.md', trace: trace.schema }));

  printResults('W298 story coaching runtime shape migration harness', results);
}

main();
