#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const storyUpdateInputs = require('../../src/contracts/storySurfaceUpdateInputs');
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
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W295 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w295_story_surface_update_input_contract.md');
  const trace = readArchiveJson('trace_samples', 'w295_story_surface_update_input_contract_trace.json');
  const w294Trace = readArchiveJson('trace_samples', 'w294_returned_record_import_closure_story_update_readiness_trace.json');
  const w293Trace = readArchiveJson('trace_samples', 'w293_returned_record_display_ready_import_runtime_migration_trace.json');
  const w292Trace = readArchiveJson('trace_samples', 'w292_returned_record_display_ready_import_bridge_trace.json');

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '295' });
  const completedRaw = completedRefreshResponse('runner-w295-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w295-motion-001',
    idempotencyToken: 'motion-w295-token'
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
    submitTransport: () => submitResponse('runner-w295-motion-001', 'motion-w295-token'),
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

  const ready = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(baseFacts);
  const waiting = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(Object.assign(clone(baseFacts), {
    validImport: false,
    returnedRecordFacts: Object.assign(clone(displayReadyShape), {
      status: 'display_ready_records_not_import_valid',
      displayReady: false,
      importFacts: { w245ImportValid: false }
    })
  }));
  const needsConfirmation = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(Object.assign(clone(baseFacts), {
    weakEvidence: true,
    laneConfirmationRequired: true,
    lanePack: { packId: story.packId, laneLabel: story.laneLabel, confidence: 'low' },
    story: Object.assign(clone(story), { status: 'needs_lane_confirmation' })
  }));
  const missingOpen = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(Object.assign(clone(baseFacts), {
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
  }));
  const hiddenUncertainty = storyUpdateInputs.normalizeStorySurfaceUpdateInputs(Object.assign(clone(baseFacts), {
    nllm: {
      advisoryOnly: false,
      writeAuthority: 'write',
      creationAllowed: true,
      uncertaintyVisible: false,
      hardLimits: []
    },
    hideUncertainty: true
  }));
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });

  assertCase(results, 'story-surface-update-input-contract-module-exists',
    storyUpdateInputs.STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION === 'forge.w295.story-surface-update-inputs.v1' &&
      Object.keys(storyUpdateInputs.STORY_UPDATE_INPUT_STATUSES).length === 5 &&
      trace.status === 'contract_ready' &&
      /W295 Story Surface Update Input Contract/.test(report),
    JSON.stringify(storyUpdateInputs.contractSummary()));

  assertCase(results, 'contract-represents-required-story-update-inputs-and-statuses',
    trace.representedInputs.length === 10 &&
      trace.statuses.indexOf('story_update_inputs_ready') >= 0 &&
      trace.statuses.indexOf('story_update_inputs_waiting_for_valid_import') >= 0 &&
      trace.statuses.indexOf('story_update_inputs_need_lane_confirmation') >= 0 &&
      trace.statuses.indexOf('story_update_inputs_blocked_missing_open_target') >= 0 &&
      trace.statuses.indexOf('story_update_inputs_blocked_hidden_uncertainty') >= 0,
    JSON.stringify(trace.statuses));

  assertCase(results, 'valid-imported-motion-distribution-story-facts-ready',
    ready.status === 'story_update_inputs_ready' &&
      ready.ready === true &&
      ready.receiptInputs.ready === true &&
      ready.firstGlanceInputs.ready === true &&
      ready.scriptInputs.ready === true &&
      ready.sequenceInputs.ready === true &&
      ready.returnedRecordFacts.openTargetRecordName === 'Motion Branch Fulfillment SKU',
    JSON.stringify(ready));

  assertCase(results, 'missing-valid-import-facts-waiting-for-valid-import',
    waiting.status === 'story_update_inputs_waiting_for_valid_import' &&
      waiting.ready === false &&
      waiting.blockedReasons.indexOf('valid_w245_returned_record_import_facts_missing') >= 0,
    JSON.stringify(waiting));

  assertCase(results, 'weak-or-conflicting-evidence-needs-lane-confirmation',
    needsConfirmation.status === 'story_update_inputs_need_lane_confirmation' &&
      needsConfirmation.weakEvidence.confirmationRequired === true &&
      needsConfirmation.blockedReasons.indexOf('lane_confirmation_required_before_story_claims') >= 0,
    JSON.stringify(needsConfirmation));

  assertCase(results, 'missing-open-target-blocks-story-update-inputs',
    missingOpen.status === 'story_update_inputs_blocked_missing_open_target' &&
      missingOpen.openLinkAuthority.allVisibleRecordsSafeToOpen === false &&
      missingOpen.blockedReasons.indexOf('supported_open_target_missing_or_not_authoritative') >= 0,
    JSON.stringify(missingOpen));

  assertCase(results, 'hidden-uncertainty-or-non-advisory-nllm-blocked',
    hiddenUncertainty.status === 'story_update_inputs_blocked_hidden_uncertainty' &&
      hiddenUncertainty.nllm.advisoryOnly === false &&
      hiddenUncertainty.nllm.creationAllowed === true &&
      hiddenUncertainty.nllm.uncertaintyVisible === false,
    JSON.stringify(hiddenUncertainty));

  assertCase(results, 'contract-cannot-render-copy-mutate-import-create-write-links-or-invoke-adapter',
    ready.runtimeBoundary.noUiRendering === true &&
      ready.runtimeBoundary.noVisibleCopyChange === true &&
      ready.runtimeBoundary.noStateMutation === true &&
      ready.runtimeBoundary.noRecordImport === true &&
      ready.runtimeBoundary.noRecordCreation === true &&
      ready.runtimeBoundary.noTransactionWrites === true &&
      ready.runtimeBoundary.noOpenLinkCreation === true &&
      ready.runtimeBoundary.noAdapterInvocation === true &&
      ready.validationBoundary.w245ValidationConsumedNotReplaced === true &&
      ready.validationBoundary.w151ValidationConsumedNotReplaced === true &&
      ready.validationBoundary.w214SemanticGuardConsumedNotReplaced === true,
    JSON.stringify({ runtime: ready.runtimeBoundary, validation: ready.validationBoundary }));

  assertCase(results, 'contract-not-wired-into-drawer-runtime-and-drawer-self-contained',
    !/storySurfaceUpdateInputs|STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION|require\(.+storySurfaceUpdateInputs/i.test(userscript) &&
      trace.runtimeBoundary.notWiredIntoDrawerRuntime === true,
    'drawer runtime contains no W295 contract import or runtime wiring');

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
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=29503/.test(record.supportedOpenUrl)
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
    !/script=6702|deploy=2|runner-w295-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
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

  assertCase(results, 'w295-harness-and-check-registration-present',
    packageJson.scripts['harness:story-surface-update-input-contract-w295'] &&
      packageJson.scripts.check.includes('src/contracts/storySurfaceUpdateInputs.js') &&
      packageJson.scripts.check.includes('run_w295_story_surface_update_input_contract_harness.js') &&
      trace.nextRecommendedBlock === 'W296: Story Surface Update Input Bridge Without Review/Run UI Change',
    packageJson.scripts['harness:story-surface-update-input-contract-w295'] || '');

  printResults('W295 story surface update input contract harness', results);
}

main();
