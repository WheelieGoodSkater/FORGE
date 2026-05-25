#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bridge = require('../../src/contracts/lanePackReviewBridge');
const workflow = require('../../src/contracts/lanePackExpansionWorkflow');
const lanePacks = require('../../src/contracts/lanePacks');
const liveEvidenceBridge = require('../../src/contracts/liveEvidenceSignoffBridge');
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

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function unsafeProposalFrom(proposal) {
  const clone = JSON.parse(JSON.stringify(proposal));
  clone.autoInstall = true;
  clone.overrideWebsiteEvidence = true;
  clone.overrideConsultantToggles = true;
  clone.candidatePack.liveDemo.roiSoWhat = 'This will increase margin with guaranteed measured ROI.';
  clone.candidatePack.nllmAdvisory.writeAuthority = 'write';
  clone.candidatePack.nllmAdvisory.creationAllowed = true;
  clone.candidatePack.nllmAdvisory.uncertaintyPolicy = 'hide_uncertainty';
  clone.candidatePack.nllmAdvisory.hardLimits = clone.candidatePack.nllmAdvisory.hardLimits.filter((limit) =>
    !/cannotHideUncertainty|cannotOverrideWebsiteEvidence|cannotOverrideConsultantToggles/.test(limit)
  );
  return clone;
}

function fixtureState(fixture) {
  return {
    selectedLaneId: fixture.laneId,
    laneSelectionSource: 'consultant_confirmed',
    selectedActionId: 'prove',
    briefPrepared: true,
    setupEditMode: false,
    intake: {
      customer: fixture.customer,
      website: fixture.website,
      notes: fixture.notes
    },
    toggles: {},
    pageContext: {
      title: 'NetSuite Home',
      url: 'https://td3021666.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function fixtureRecord(raw) {
  return {
    role: raw.role,
    recordType: raw.recordType,
    type: raw.recordType,
    name: raw.name,
    internalId: raw.internalId,
    url: `https://td3021666.app.netsuite.com${raw.path}?id=${raw.internalId}`
  };
}

function completedFixtureResult(fixture) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: fixture.records.map(fixtureRecord)
  };
}

function receiptQaFor(hooks, fixture) {
  const state = fixtureState(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedFixtureResult(fixture),
    state,
    lane,
    page,
    recommendation
  );
  return hooks.receiptDrivenLaneExpansionQaW255(
    normalized.versionedLanePackW246.lanePack,
    normalized.consultantStorySurfaceW247
  );
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W277 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'lanePackReviewBridge.js');
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const report = readArchiveText('reports', 'w277_lane_pack_review_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w277_lane_pack_review_bridge_trace.json');
  const w251Proposal = readArchiveJson('fixtures', 'w251_lane_pack_diff_review_fixture.json');
  const w255Proposal = readArchiveJson('fixtures', 'w255_proposed_lane_pack_receipt_fixture.json');
  const firstLaneFixture = readArchiveJson('fixtures', 'w249_lane_pack_expansion_qa_fixtures.json').fixtures[0];
  const drawerReview = hooks.reviewProposedLanePackChangeW247(w251Proposal);
  const sourceReview = lanePacks.reviewProposedLanePackChange(w251Proposal);
  const sourceDiff = lanePacks.lanePackProposedChangeDiff(w251Proposal);
  const drawerReviewHtml = hooks.renderLanePackDiffReviewW252(drawerReview);
  const receiptQa = receiptQaFor(hooks, firstLaneFixture);
  const w255Review = hooks.reviewProposedLanePackChangeW247(w255Proposal);
  const w255ReviewHtml = hooks.renderLanePackDiffReviewW252(w255Review);
  const unsafeProposal = unsafeProposalFrom(w251Proposal);
  const unsafeReview = hooks.reviewProposedLanePackChangeW247(unsafeProposal);
  const unsafeBridge = bridge.normalizeAdminReviewPacket('W247_AUTHORING_REVIEW', unsafeReview, {
    proposal: unsafeProposal,
    review: unsafeReview,
    renderedHtml: hooks.renderLanePackDiffReviewW252(unsafeReview)
  });
  const bridgePacket = bridge.bridgeLanePackReviewPackets({
    w247AuthoringReview: drawerReview,
    w251ProposedChangeDiff: sourceDiff,
    w252AdminReviewHtml: drawerReviewHtml,
    w255ReceiptDrivenQa: receiptQa,
    proposedLanePack: w251Proposal,
    proposedLanePackReview: drawerReview,
    proposedLanePackReviewHtml: drawerReviewHtml
  });
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: {
      customer: 'Unknown',
      website: 'https://unknown-example.com',
      notes: 'Conflicting evidence across category and conversation notes.'
    }
  }, null, { displayReadyRecords: [] });
  const motion = motionState(hooks);
  const context = motionContext(hooks, motion);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(motion, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w277-motion-001',
      idempotencyToken: 'motion-w277-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w277-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w277-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w277-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '277' })
      }
    }
  });

  assertCase(results, 'admin-only-lane-pack-review-bridge-exists',
    /LANE_PACK_REVIEW_BRIDGE_SCHEMA_VERSION/.test(source) &&
      /require\('\.\/lanePackExpansionWorkflow'\)/.test(source) &&
      bridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      bridge.exportedContractSummary().governingContract === workflow.LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
    JSON.stringify(bridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-lane-pack-expansion-workflow-contract',
    bridgePacket.status === 'bridge_ready' &&
      bridgePacket.governingContract === workflow.LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION &&
      bridgePacket.entries.length === 5 &&
      bridgePacket.entries.every((entry) => entry.status === 'bridge_ready'),
    JSON.stringify(bridgePacket.entries.map((entry) => ({ id: entry.id, status: entry.status, shapeName: entry.shapeName }))));

  assertCase(results, 'w247-w251-w252-w255-outputs-remain-field-compatible',
    bridge.validateAdminReviewPacket('W247_AUTHORING_REVIEW', sourceReview).matchesContract === true &&
      bridge.validateAdminReviewPacket('W247_AUTHORING_REVIEW', drawerReview).matchesContract === true &&
      bridge.validateAdminReviewPacket('W251_PROPOSED_CHANGE_DIFF', sourceDiff).matchesContract === true &&
      bridge.validateAdminReviewPacket('W252_ADMIN_REVIEW_RENDERER', drawerReviewHtml).matchesContract === true &&
      bridge.validateAdminReviewPacket('W255_RECEIPT_DRIVEN_QA', receiptQa).matchesContract === true,
    JSON.stringify({
      sourceReview: sourceReview.schema,
      drawerReview: drawerReview.schema,
      sourceDiff: sourceDiff.schema,
      receiptQa: receiptQa.schema
    }));

  assertCase(results, 'proposed-lane-pack-fixtures-remain-review-only-and-non-installable',
    bridge.proposedPackIsReviewOnly(w251Proposal, drawerReview, drawerReviewHtml) &&
      bridge.proposedPackIsReviewOnly(w255Proposal, w255Review, w255ReviewHtml) &&
      bridgePacket.entries.find((entry) => entry.id === 'reviewOnlyProposedPack').reviewOnlyNonInstallable === true,
    JSON.stringify({ w251: drawerReview.reviewCopy, w255: w255Review.reviewCopy }));

  assertCase(results, 'w274-expansion-guardrail-helpers-remain-authoritative',
    unsafeBridge.status === 'bridge_needs_attention' &&
      unsafeBridge.expansionGuardrailCheck.status === 'rejected' &&
      bridge.expansionGuardrailCheck(w251Proposal, drawerReview).status === 'pass' &&
      [
        'auto_install_forbidden',
        'write_authority_forbidden',
        'record_creation_forbidden',
        'hidden_uncertainty_forbidden',
        'website_evidence_override_forbidden',
        'consultant_toggle_override_forbidden',
        'guaranteed_or_measured_roi_forbidden'
      ].every((id) => unsafeBridge.expansionGuardrailCheck.violations.indexOf(id) >= 0),
    JSON.stringify(unsafeBridge.expansionGuardrailCheck));

  assertCase(results, 'normal-consultant-ui-hides-raw-proposal-diff-admin-diagnostics',
    workflow.reviewRendererMatchesShape(drawerReviewHtml, workflow.shape('W252_ADMIN_REVIEW_RENDERER')) &&
      bridgePacket.guardrails.rawProposalEvidenceArchivedAdminOnly === true &&
      bridgePacket.guardrails.normalConsultantUiChanged === false &&
      !/raw JSON|stack trace|data-idb-install|Install lane pack/.test(drawerReviewHtml),
    JSON.stringify(bridgePacket.guardrails));

  assertCase(results, 'source-pack-remains-src-contracts-lane-packs',
    /LANE_PACKS/.test(lanePacksSource) &&
      /reviewProposedLanePackChange/.test(lanePacksSource) &&
      bridge.exportedContractSummary().sourcePackFile === 'src/contracts/lanePacks.js' &&
      trace.sourcePackFile === 'src/contracts/lanePacks.js',
    bridge.exportedContractSummary().sourcePackFile);

  assertCase(results, 'lane-resolution-behavior-remains-unchanged',
    context.lane.id === 'industrial_distribution' &&
      context.recommendation &&
      context.recommendation.move === 'Customer Record' &&
      trace.continuity.laneResolutionChanged === false,
    JSON.stringify({ laneId: context.lane.id, recommendation: context.recommendation }));

  assertCase(results, 'connected-w264-submit-refresh-import-path-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w276-live-evidence-signoff-bridge-remains-available',
    liveEvidenceBridge.exportedContractSummary().schema === 'forge.w276.live-evidence-signoff-bridge.v1' &&
      liveEvidenceBridge.exportedContractSummary().governingContract === 'forge.w272.live-evidence-packets.v1',
    JSON.stringify(liveEvidenceBridge.exportedContractSummary()));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      trace.continuity.weakEvidenceConfirmationFirst === true,
    JSON.stringify(weakStory));

  assertCase(results, 'nllm-remains-advisory-only-with-no-write-authority',
    drawerReview.nllmAdvisoryOnly === true &&
      drawerReview.installAllowed === false &&
      w251Proposal.candidatePack.nllmAdvisory.writeAuthority === 'none' &&
      w251Proposal.candidatePack.nllmAdvisory.creationAllowed === false &&
      bridgePacket.guardrails.nllmAdvisoryOnly === true,
    JSON.stringify({ review: drawerReview.nllmAdvisoryOnly, advisory: w251Proposal.candidatePack.nllmAdvisory }));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    !/require\(['\"][^'\"]*lanePackReviewBridge/.test(userscript) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    bridgePacket.guardrails.noDrawerCreatedRecords === true &&
      bridgePacket.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ bridge: bridgePacket.guardrails, w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W277 Admin-Only Lane Pack Review Bridge/.test(report) &&
      trace.schema === 'forge.w277.lane-pack-review-bridge.trace.v1' &&
      trace.bridge.module === 'src/contracts/lanePackReviewBridge.js' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({ report: 'archive/reports/w277_lane_pack_review_bridge.md', trace: trace.schema }));

  printResults('W277 lane-pack review bridge harness', results);
}

main();
