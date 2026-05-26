#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const storyUpdateInputs = require('../../src/contracts/storySurfaceUpdateInputs');
const storyUpdateBridge = require('../../src/contracts/storySurfaceUpdateInputBridge');
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
  submitResponse,
  completedRefreshResponse,
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W296 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w296_story_surface_update_input_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w296_story_surface_update_input_bridge_trace.json');
  const w295Trace = readArchiveJson('trace_samples', 'w295_story_surface_update_input_contract_trace.json');
  const w294Trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');
  const w293Trace = readArchiveJson('trace_samples', 'w293_returned_record_display_ready_import_runtime_migration_trace.json');
  const w292Trace = readArchiveJson('trace_samples', 'w292_returned_record_display_ready_import_bridge_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '296' });
  const completedRaw = completedRefreshResponse('runner-w296-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w296-motion-001',
    idempotencyToken: 'motion-w296-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const displayReadyShape = hooks.returnedRecordDisplayReadyImportShapeW293({
    normalizedImport,
    w245ImportValid: true,
    laneAwareLabelSource: 'lanePackAwareRecordLabelW250',
    evidenceGuardrailSource: 'canonicalImportResultNormalizationW245 + verifiedRecordLinkAuthorityV1'
  });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w296-motion-001', 'motion-w296-token'),
    pollTransport: () => completedRaw
  });
  const story = normalizedImport.consultantStorySurfaceW247;
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const script = hooks.consultantLiveDemoScriptW256(story);
  const sequence = hooks.guidedDemoStepSequenceW257(story);
  const html = hooks.renderConsultantStorySurfaceW248(story);

  const baseFacts = {
    validImport: true,
    returnedRecordFacts: displayReadyShape,
    lanePack: {
      packId: story.packId,
      laneLabel: story.laneLabel,
      confidence: 'high'
    },
    labelSource: 'lanePackAwareRecordLabelW250',
    openLinkAuthority: displayReadyShape.openLinkAuthority,
    w254Receipt: story.evidenceReceiptW254,
    w255FirstGlance: firstGlance,
    w256Script: script,
    w257Sequence: sequence,
    story,
    weakEvidence: false,
    laneConfirmationRequired: false,
    nllm: {
      advisoryOnly: true,
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyVisible: true,
      hardLimits: story.nllmAdvisory.hardLimits
    }
  };

  const readyInput = baseFacts;
  const waitingInput = Object.assign(clone(baseFacts), {
    validImport: false,
    returnedRecordFacts: Object.assign(clone(displayReadyShape), {
      status: 'display_ready_records_not_import_valid',
      displayReady: false,
      importFacts: { w245ImportValid: false }
    })
  });
  const needsConfirmationInput = Object.assign(clone(baseFacts), {
    weakEvidence: true,
    laneConfirmationRequired: true,
    lanePack: { packId: story.packId, laneLabel: story.laneLabel, confidence: 'low' },
    story: Object.assign(clone(story), { status: 'needs_lane_confirmation' })
  });
  const missingOpenInput = Object.assign(clone(baseFacts), {
    openTarget: '',
    w255FirstGlance: Object.assign(clone(firstGlance), { openTarget: '' }),
    story: Object.assign(clone(story), { openTarget: '' }),
    returnedRecordFacts: Object.assign(clone(displayReadyShape), {
      visibleRecords: displayReadyShape.visibleRecords.map((record) => Object.assign({}, record, {
        supportedOpenUrl: '',
        safeToOpen: false
      })),
      openLinkAuthority: {
        allVisibleRecordsHaveNumericIds: true,
        allVisibleRecordsHaveSupportedOpenUrls: false,
        allVisibleRecordsSafeToOpen: false
      }
    }),
    openLinkAuthority: {
      allVisibleRecordsHaveNumericIds: true,
      allVisibleRecordsHaveSupportedOpenUrls: false,
      allVisibleRecordsSafeToOpen: false
    }
  });
  const hiddenUncertaintyInput = Object.assign(clone(baseFacts), {
    nllm: {
      advisoryOnly: false,
      writeAuthority: 'write',
      creationAllowed: true,
      uncertaintyVisible: false,
      hardLimits: []
    },
    hideUncertainty: true
  });

  const ready = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(readyInput);
  const waiting = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(waitingInput);
  const needsConfirmation = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(needsConfirmationInput);
  const missingOpen = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(missingOpenInput);
  const hiddenUncertainty = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(hiddenUncertaintyInput);
  const readyValidation = storyUpdateBridge.validateStorySurfaceUpdateInputs(ready, readyInput);
  const waitingValidation = storyUpdateBridge.validateStorySurfaceUpdateInputs(waiting, waitingInput);
  const needsConfirmationValidation = storyUpdateBridge.validateStorySurfaceUpdateInputs(needsConfirmation, needsConfirmationInput);
  const missingOpenValidation = storyUpdateBridge.validateStorySurfaceUpdateInputs(missingOpen, missingOpenInput);
  const hiddenUncertaintyValidation = storyUpdateBridge.validateStorySurfaceUpdateInputs(hiddenUncertainty, hiddenUncertaintyInput);
  const bridge = storyUpdateBridge.bridgeStorySurfaceUpdateInputs({
    ready: { drawerOutput: ready, input: readyInput },
    waitingForImport: { drawerOutput: waiting, input: waitingInput },
    needsConfirmation: { drawerOutput: needsConfirmation, input: needsConfirmationInput },
    missingOpenTarget: { drawerOutput: missingOpen, input: missingOpenInput },
    hiddenUncertainty: { drawerOutput: hiddenUncertainty, input: hiddenUncertaintyInput }
  });
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });

  assertCase(results, 'story-surface-update-input-bridge-module-exists',
    storyUpdateBridge.STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION === 'forge.w296.story-surface-update-input-bridge.v1' &&
      storyUpdateBridge.exportedContractSummary().governingContract === storyUpdateInputs.STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION &&
      trace.status === 'bridge_ready' &&
      /W296 Story Surface Update Input Bridge/.test(report),
    JSON.stringify(storyUpdateBridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-w295-contract',
    bridge.status === 'bridge_ready' &&
      bridge.governingContract === 'forge.w295.story-surface-update-inputs.v1' &&
      bridge.validations.length === 5 &&
      bridge.validations.every((item) => item.status === 'field_compatible'),
    JSON.stringify({ status: bridge.status, failed: bridge.failed }));

  assertCase(results, 'ready-waiting-confirmation-missing-open-hidden-uncertainty-compatible',
    readyValidation.status === 'field_compatible' &&
      waitingValidation.status === 'field_compatible' &&
      needsConfirmationValidation.status === 'field_compatible' &&
      missingOpenValidation.status === 'field_compatible' &&
      hiddenUncertaintyValidation.status === 'field_compatible' &&
      bridge.validations.map((item) => item.contractStatus).join('|') === [
        'story_update_inputs_ready',
        'story_update_inputs_waiting_for_valid_import',
        'story_update_inputs_need_lane_confirmation',
        'story_update_inputs_blocked_missing_open_target',
        'story_update_inputs_blocked_hidden_uncertainty'
      ].join('|'),
    JSON.stringify(bridge.validations.map((item) => `${item.sourceStatus}:${item.status}`)));

  assertCase(results, 'bridge-consumes-story-record-facts-does-not-replace-w151-w214-w245',
    readyValidation.guardrails.w151ConsumedNotReplaced === true &&
      readyValidation.guardrails.w214ConsumedNotReplaced === true &&
      readyValidation.guardrails.w245ConsumedNotReplaced === true &&
      readyValidation.guardrails.bridgeCannotDeclareImportValidity === true &&
      bridge.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      bridge.validationBoundary.w214SemanticGuardConsumedNotReplaced === true &&
      bridge.validationBoundary.w245ValidationConsumedNotReplaced === true,
    JSON.stringify({ validation: readyValidation.guardrails, bridge: bridge.validationBoundary }));

  assertCase(results, 'bridge-cannot-render-copy-mutate-import-create-write-links-or-invoke-adapter',
    readyValidation.guardrails.bridgeCannotRenderUi === true &&
      readyValidation.guardrails.bridgeCannotChangeVisibleCopy === true &&
      readyValidation.guardrails.bridgeCannotMutateState === true &&
      readyValidation.guardrails.bridgeCannotImportRecords === true &&
      readyValidation.guardrails.bridgeCannotCreateRecords === true &&
      readyValidation.guardrails.bridgeCannotWriteTransactions === true &&
      readyValidation.guardrails.bridgeCannotCreateOpenLinks === true &&
      readyValidation.guardrails.bridgeCannotInvokeAdapter === true &&
      bridge.runtimeBoundary.noRuntimeDrawerImportRequired === true,
    JSON.stringify({ guardrails: readyValidation.guardrails, runtime: bridge.runtimeBoundary }));

  assertCase(results, 'bridge-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/storySurfaceUpdateInputBridge|STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION|require\(.+storySurfaceUpdateInputBridge/i.test(userscript) &&
      trace.runtimeBoundary.notWiredIntoDrawerRuntime === true,
    'drawer runtime contains no W296 bridge import or runtime wiring');

  assertCase(results, 'w295-contract-remains-available-and-unchanged',
    w295Trace.status === 'contract_ready' &&
      w295Trace.module === 'src/contracts/storySurfaceUpdateInputs.js' &&
      trace.continuity.w295ContractAvailableAndUnchanged === true,
    JSON.stringify({ w295: w295Trace.status, module: w295Trace.module }));

  assertCase(results, 'w294-closure-readiness-map-remains-available',
    w294Trace.status === 'closure_and_story_update_readiness_ready' &&
      w294Trace.selectedNextMicroSlice.proposedContractModule === 'src/contracts/storySurfaceUpdateInputs.js' &&
      trace.continuity.w294ClosureReadinessMapAvailable === true,
    JSON.stringify(w294Trace.selectedNextMicroSlice));

  assertCase(results, 'w293-runtime-migration-remains-field-compatible-with-w292',
    w293Trace.status === 'runtime_shape_migration_ready' &&
      w292Trace.status === 'bridge_ready' &&
      trace.continuity.w293RuntimeMigrationFieldCompatibleWithW292 === true,
    JSON.stringify({ w293: w293Trace.status, w292: w292Trace.status }));

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

  assertCase(results, 'returned-record-names-labels-supported-open-links-and-review-copy-unchanged',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29603/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    html.slice(0, 600));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ status: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w296-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 600));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.nlLmAdvisoryOnly === true &&
      trace.guardrails.uncertaintyVisible === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'w296-harness-and-check-registration-present',
    packageJson.scripts['harness:story-surface-update-input-bridge-w296'] &&
      packageJson.scripts.check.includes('src/contracts/storySurfaceUpdateInputBridge.js') &&
      packageJson.scripts.check.includes('run_w296_story_surface_update_input_bridge_harness.js') &&
      trace.nextRecommendedBlock === 'W297: Story Update Input Bridge Closure And Story Coaching Runtime Shape Readiness',
    packageJson.scripts['harness:story-surface-update-input-bridge-w296'] || '');

  printResults('W296 story surface update input bridge harness', results);
}

main();
