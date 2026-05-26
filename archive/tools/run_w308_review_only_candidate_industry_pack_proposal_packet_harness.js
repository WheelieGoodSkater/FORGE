#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const futureReadiness = require('../../src/contracts/futureLanePackExpansionReadiness');
const futureBridge = require('../../src/contracts/futureLanePackExpansionReadinessBridge');
const laneReadiness = require('../../src/contracts/laneResolutionReadiness');
const laneReadinessBridge = require('../../src/contracts/laneResolutionReadinessBridge');
const laneExpansion = require('../../src/contracts/lanePackExpansionWorkflow');
const laneReviewBridge = require('../../src/contracts/lanePackReviewBridge');
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

function candidateFacts(trace) {
  const packet = trace.proposalPacket;
  const facts = packet.futureExpansionReadinessFacts;
  return {
    proposalIdentity: packet.candidateIdentity,
    sourcePackComparison: packet.sourcePackComparison,
    websiteCategoryEvidence: packet.websiteCategoryEvidence,
    recordRoleCoverage: packet.recordRoleCoverage,
    vocabularyCoverage: packet.vocabularyCoverage,
    storyCopyCoverage: packet.storyCopyCoverage,
    nllmDraftIntake: packet.nllmDraftIntake,
    authoringReview: facts.authoringReview,
    proposedDiff: facts.proposedDiff,
    adminReview: facts.adminReview,
    receiptDrivenQa: facts.receiptDrivenQa,
    laneResolutionCompatibility: facts.laneResolutionCompatibility,
    humanReviewGate: facts.humanReviewGate,
    uncertaintyGate: facts.uncertaintyGate
  };
}

function laneFacts() {
  return {
    laneResolution: {
      status: 'resolved',
      packId: 'industrial-distributor',
      confidence: 'high',
      sourceAuthority: 'website_domain',
      matchedSignals: ['domain:motion.com', 'category:industrial distributor'],
      notesOverrideIdentityAllowed: false,
      nllmAuthority: 'advisory_only'
    },
    websiteEvidence: {
      website: 'https://www.motion.com',
      websiteDomain: 'motion.com',
      productFamily: 'Inventory / Fulfillment',
      matchedSignals: ['domain:motion.com', 'category:industrial distributor'],
      hasStrongWebsiteEvidence: true
    },
    consultantConfirmation: {
      selectedLaneId: 'distribution',
      laneSelectionSource: 'consultant_confirmed',
      laneConfirmed: true,
      toggles: { manufacturing: false, wip: false }
    },
    nllm: {
      advisoryOnly: true,
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyVisible: true,
      hardLimits: ['cannotOverrideWebsiteEvidence', 'cannotOverrideConsultantToggles', 'cannotCreateRecords']
    },
    storySurfaceInputs: {
      status: 'story_ready',
      packId: 'industrial-distributor',
      openTarget: 'Open Motion Branch Fulfillment SKU (Product SKU).'
    },
    laneAwareLabelFacts: {
      source: 'lanePackAwareRecordLabelW250',
      labelsReady: true,
      distributionLabelsProtected: true,
      manufacturingLabelsProtected: true
    },
    expansionWorkflow: {
      sourcePackFile: 'src/contracts/lanePacks.js',
      reviewOnlyProposals: true,
      noAutoInstall: true,
      advisoryOnly: true
    }
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W308 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w308_review_only_candidate_industry_pack_proposal_packet.md');
  const trace = readArchiveJson('trace_samples', 'w308_review_only_candidate_industry_pack_proposal_packet_trace.json');
  const w307Trace = readArchiveJson('trace_samples', 'w307_future_expansion_closure_industry_pack_authoring_plan_trace.json');
  const w306Trace = readArchiveJson('trace_samples', 'w306_future_lane_pack_expansion_readiness_runtime_shape_migration_trace.json');
  const w305Trace = readArchiveJson('trace_samples', 'w305_future_lane_pack_expansion_readiness_bridge_trace.json');
  const w304Trace = readArchiveJson('trace_samples', 'w304_future_lane_pack_expansion_readiness_contract_trace.json');
  const w303Trace = readArchiveJson('trace_samples', 'w303_lane_resolution_optimization_closure_future_expansion_readiness_trace.json');

  const facts = candidateFacts(trace);
  const runtimeShape = hooks.futureExpansionReadinessRuntimeShapeW306(facts);
  const bridgePacket = futureBridge.validateFutureLanePackExpansionReadiness(runtimeShape, facts);
  const contractShape = futureReadiness.normalizeFutureLanePackExpansionReadiness(facts);
  const laneShape = hooks.laneResolutionReadinessRuntimeShapeW302(laneFacts());
  const laneValidation = laneReadinessBridge.validateLaneResolutionReadiness(
    Object.assign({}, laneShape, { schema: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION }),
    laneFacts()
  );

  const sourceReview = hooks.reviewProposedLanePackChangeW247({
    schema: 'forge.lane-pack-authoring-proposal.v1',
    proposedBy: 'nllm_advisory',
    installRequested: true,
    candidatePackId: facts.proposalIdentity.proposedPackId,
    basePackId: facts.sourcePackComparison.basePackId,
    candidatePack: {
      schema: 'forge.lane-pack.v1',
      packVersion: '1.0.0',
      packId: facts.proposalIdentity.proposedPackId,
      laneId: 'industrial_distribution',
      subIndustryId: 'electrical-components-distributor',
      label: facts.proposalIdentity.label,
      operatingMode: 'distribution_replenishment',
      websiteSignals: {
        domains: [facts.websiteCategoryEvidence.domain],
        categoryTerms: facts.websiteCategoryEvidence.signals.slice(0, 4),
        evidenceTerms: facts.websiteCategoryEvidence.signals.slice(4)
      },
      recordRoles: facts.recordRoleCoverage,
      vocabulary: facts.vocabularyCoverage,
      liveDemo: facts.storyCopyCoverage,
      nllmAdvisory: {
        allowedTasks: [
          'summarizeWebsiteAndCategoryEvidence',
          'proposeRecordNames',
          'synthesizePainValueCompetitiveAndRoi',
          'draftSoWhatAndWhyItMatters',
          'draftLanePackSuggestionsForHumanReview'
        ],
        hardLimits: facts.nllmDraftIntake.hardLimits,
        writeAuthority: 'none',
        creationAllowed: false,
        uncertaintyPolicy: 'surface_uncertainty_and_request_confirmation'
      }
    },
    autoInstall: false
  });
  const diff = hooks.lanePackProposedChangeDiffW251({
    basePackId: facts.sourcePackComparison.basePackId,
    candidatePackId: facts.proposalIdentity.proposedPackId,
    candidatePack: {
      websiteSignals: {
        categoryTerms: facts.websiteCategoryEvidence.signals.slice(0, 4)
      },
      recordRoles: facts.recordRoleCoverage,
      vocabulary: facts.vocabularyCoverage,
      liveDemo: facts.storyCopyCoverage
    }
  });
  const reviewHtml = hooks.renderLanePackDiffReviewW252(sourceReview);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '308' });
  const completedRaw = completedRefreshResponse('runner-w308-motion-001', completedResult);
  const completedShape = hooks.actualAdapterResponseShapeW265(completedRaw, {
    phase: 'refresh',
    runnerTaskId: 'runner-w308-motion-001',
    idempotencyToken: 'motion-w308-token'
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, completedShape.finalGeneratedNamesJson);
  const normalizedImport = hooks.canonicalImportResultNormalizationW245(completedShape.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const html = hooks.renderConsultantStorySurfaceW248(normalizedImport.consultantStorySurfaceW247);
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(Object.assign({}, state, {
    intake: Object.assign({}, state.intake, {
      website: 'https://unknown-example.com',
      notes: 'Evidence is mixed and the buyer has not confirmed the lane.'
    })
  }), null, { displayReadyRecords: normalizedImport.visibleRecords });
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitTransport: () => submitResponse('runner-w308-motion-001', 'motion-w308-token'),
    pollTransport: () => completedRaw
  });

  assertCase(results, 'review-only-candidate-proposal-packet-exists',
    trace.schema === 'forge.w308.review-only-candidate-industry-pack-proposal-packet.trace.v1' &&
      trace.status === 'review_only_candidate_packet_ready' &&
      /W308 Review-Only Candidate Industry Pack Proposal Packet/.test(report) &&
      trace.proposalPacket.candidateIdentity.proposedPackId === 'electrical-components-distributor',
    JSON.stringify(trace.proposalPacket.candidateIdentity));

  assertCase(results, 'candidate-packet-represents-required-authoring-plan-fields',
    trace.proposalPacket.sourcePackComparison.sourcePackFile === 'src/contracts/lanePacks.js' &&
      trace.proposalPacket.websiteCategoryEvidence.signals.indexOf('switchgear') >= 0 &&
      trace.proposalPacket.recordRoleCoverage.required.indexOf('branch_or_product_sku') >= 0 &&
      trace.proposalPacket.recordRoleCoverage.invalid.indexOf('work_order_or_wip_object') >= 0 &&
      trace.proposalPacket.vocabularyCoverage.allowed.indexOf('component SKU') >= 0 &&
      trace.proposalPacket.vocabularyCoverage.forbidden.indexOf('measured ROI') >= 0 &&
      /component SKU/.test(trace.proposalPacket.storyCopyCoverage.proofMove) &&
      trace.proposalPacket.nllmDraftIntake.advisoryOnly === true &&
      trace.proposalPacket.reviewWorkflowExpectations.humanCodeReviewBeforeSourceMutation === true &&
      trace.proposalPacket.reviewWorkflowExpectations.postInstallSmokeAfterReviewedPackLands === true,
    JSON.stringify(trace.proposalPacket));

  assertCase(results, 'review-only-acceptance-packet-non-installable-not-source-truth',
    trace.acceptancePacket.decision === 'review_only_ready' &&
      trace.acceptancePacket.reviewOnly === true &&
      trace.acceptancePacket.nonInstallable === true &&
      trace.acceptancePacket.sourceTruth === false &&
      trace.acceptancePacket.runtimeWired === false &&
      trace.acceptancePacket.sourceLanePacksMutated === false &&
      trace.acceptancePacket.autoInstallIntroduced === false &&
      trace.acceptancePacket.humanCodeReviewRequiredBeforeSourceMutation === true,
    JSON.stringify(trace.acceptancePacket));

  assertCase(results, 'w247-w251-w252-w255-expectations-remain-review-only',
    sourceReview.status === 'review_ready' &&
      sourceReview.installAllowed === false &&
      sourceReview.humanReviewRequired === true &&
      diff.changes.length >= 4 &&
      /Lane-pack proposal/.test(reviewHtml) &&
      /Review only/.test(reviewHtml) &&
      /No install action/.test(reviewHtml) &&
      !/Deploy|Create records/i.test(reviewHtml) &&
      trace.proposalPacket.futureExpansionReadinessFacts.receiptDrivenQa.status === 'qa_ready',
    JSON.stringify({ review: sourceReview.status, diff: diff.changes.length }));

  assertCase(results, 'w304-through-w306-readiness-facts-ready-and-field-compatible',
    contractShape.status === 'future_lane_pack_expansion_ready_for_review' &&
      runtimeShape.status === contractShape.status &&
      bridgePacket.status === 'field_compatible' &&
      runtimeShape.readyForReview === true,
    JSON.stringify({ contract: contractShape.status, runtime: runtimeShape.status, bridge: bridgePacket.status }));

  assertCase(results, 'candidate-not-wired-into-runtime-or-source-packs',
    userscript.indexOf('electrical-components-distributor') < 0 &&
      lanePacksSource.indexOf('electrical-components-distributor') < 0 &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.guardrails.sourceLanePacksMutated === false,
    'candidate remains archive-only');

  assertCase(results, 'w307-through-w303-continuity-remains-available',
    w307Trace.status === 'closure_and_authoring_plan_ready' &&
      w306Trace.status === 'runtime_shape_migration_ready' &&
      w305Trace.status === 'bridge_ready' &&
      w304Trace.status === 'contract_ready' &&
      w303Trace.status === 'closure_and_future_expansion_readiness_ready' &&
      trace.continuity.w307ClosureAuthoringPlanAvailable === true &&
      trace.continuity.w306RuntimeShapeFieldCompatibleWithW305 === true,
    JSON.stringify({ w307: w307Trace.status, w306: w306Trace.status, w305: w305Trace.status, w304: w304Trace.status, w303: w303Trace.status }));

  assertCase(results, 'w302-through-w300-and-w274-w277-continuity-remain-available',
    laneValidation.status === 'field_compatible' &&
      laneExpansion.exportedContractSummary().schema === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      laneReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w302RuntimeShapeFieldCompatibleWithW301 === true &&
      trace.continuity.w274LanePackExpansionWorkflowAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({ lane: laneValidation.status, w274: laneExpansion.exportedContractSummary().schema, w277: laneReviewBridge.exportedContractSummary().schema }));

  assertCase(results, 'w264-w265-w245-w151-w214-behavior-remains-unchanged',
    w264Flow.status === 'records_imported' &&
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

  assertCase(results, 'returned-records-open-links-and-review-run-visible-copy-unchanged',
    normalizedImport.visibleRecords.some((record) =>
      record.recordName === 'Motion Branch Fulfillment SKU' &&
      /Product SKU/.test(record.consultantLabel) &&
      record.safeToOpen === true &&
      /netsuite\.com\/app\/common\/item\/item\.nl\?id=30803/.test(record.supportedOpenUrl)
    ) &&
      /Live proof CTA/.test(html) &&
      /Say this live/.test(html) &&
      /Guided demo sequence/.test(html) &&
      /Evidence receipt/.test(html) &&
      trace.continuity.returnedRecordNamesLabelsOpenLinksChanged === false &&
      trace.continuity.reviewRunVisibleCopyChanged === false,
    JSON.stringify(normalizedImport.visibleRecords.map((record) => `${record.consultantLabel}:${record.recordName}:${record.linkAuthorityStatus}`)));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakConflictingEvidenceConfirmationFirst === true,
    JSON.stringify({ weakStatus: weakStory.status, openTarget: weakStory.openTarget }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    !/script=6702|deploy=2|runner-w308-motion-001|finalGeneratedNamesJson|stack trace|schema/i.test(html) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    html.slice(0, 700));

  assertCase(results, 'no-runtime-authority-source-pack-mutation-install-or-auto-install',
    trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.sourceLanePacksMutated === false &&
      trace.guardrails.autoInstallIntroduced === false &&
      trace.guardrails.candidateWiredIntoRuntime === false &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true &&
      trace.continuity.sourceLanePacksChanged === false &&
      trace.continuity.proposedPacksInstalled === false,
    JSON.stringify({ guardrails: trace.guardrails, continuity: trace.continuity }));

  assertCase(results, 'w308-report-trace-harness-and-check-registration-present',
    packageJson.scripts['harness:review-only-candidate-industry-pack-proposal-packet-w308'] &&
      packageJson.scripts.check.includes('run_w308_review_only_candidate_industry_pack_proposal_packet_harness.js') &&
      trace.nextRecommendedBlock === 'W309: Candidate Industry Pack Proposal QA Closure And Source Change Readiness',
    packageJson.scripts['harness:review-only-candidate-industry-pack-proposal-packet-w308'] || '');

  printResults('W308 review-only candidate industry pack proposal packet harness', results);
}

main();
