#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const workflow = require('../../src/contracts/lanePackExpansionWorkflow');
const lanePacks = require('../../src/contracts/lanePacks');
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

function stateFor(fixture) {
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
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function record(raw) {
  return {
    role: raw.role,
    recordType: raw.recordType,
    type: raw.recordType,
    name: raw.name,
    internalId: raw.internalId,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${raw.path}?id=${raw.internalId}`
  };
}

function completedResult(fixture) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: fixture.records.map(record)
  };
}

function renderedFor(hooks, fixture) {
  const state = stateFor(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedResult(fixture),
    state,
    lane,
    page,
    recommendation
  );
  const story = normalized.consultantStorySurfaceW247;
  return {
    fixture,
    normalized,
    story,
    qa: hooks.receiptDrivenLaneExpansionQaW255(normalized.versionedLanePackW246.lanePack, story)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W274 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'lanePackExpansionWorkflow.js');
  const lanePacksSource = readRepoFile('src', 'contracts', 'lanePacks.js');
  const harnessSource = readRepoFile('archive', 'tools', 'run_w274_lane_pack_expansion_workflow_contract_harness.js');
  const report = readArchiveText('reports', 'w274_lane_pack_expansion_workflow_contract.md');
  const trace = readArchiveJson('trace_samples', 'w274_lane_pack_expansion_workflow_contract_trace.json');
  const w251Proposal = readArchiveJson('fixtures', 'w251_lane_pack_diff_review_fixture.json');
  const w255Proposal = readArchiveJson('fixtures', 'w255_proposed_lane_pack_receipt_fixture.json');
  const fixtures = readArchiveJson('fixtures', 'w249_lane_pack_expansion_qa_fixtures.json').fixtures;
  const rendered = fixtures.map((fixture) => renderedFor(hooks, fixture));

  const sourceReview = lanePacks.reviewProposedLanePackChange(w251Proposal);
  const drawerReview = hooks.reviewProposedLanePackChangeW247(w251Proposal);
  const sourceDiff = lanePacks.lanePackProposedChangeDiff(w251Proposal);
  const drawerReviewHtml = hooks.renderLanePackDiffReviewW252(drawerReview);
  const w255Review = hooks.reviewProposedLanePackChangeW247(w255Proposal);
  const w255ReviewHtml = hooks.renderLanePackDiffReviewW252(w255Review);
  const unsafeProposal = unsafeProposalFrom(w251Proposal);
  const unsafeReview = hooks.reviewProposedLanePackChangeW247(unsafeProposal);
  const unsafeGuard = workflow.expansionGuardrailCheck(unsafeProposal, unsafeReview);
  const safeGuard = workflow.expansionGuardrailCheck(w251Proposal, drawerReview);
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247({
    selectedLaneId: 'products_cpg',
    laneSelectionSource: 'consultant_confirmed',
    intake: { customer: 'Unknown', website: 'https://unknown-example.com', notes: 'Conflicting evidence.' }
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
      runnerTaskId: 'runner-w274-motion-001',
      idempotencyToken: 'motion-w274-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w274-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w274-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w274-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '274' })
      }
    }
  });

  assertCase(results, 'lane-pack-expansion-workflow-contract-module-exists',
    /LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION/.test(source) &&
      /LANE_PACK_EXPANSION_SHAPES/.test(source) &&
      typeof workflow.packetMatchesShape === 'function' &&
      typeof workflow.expansionGuardrailCheck === 'function',
    'src/contracts/lanePackExpansionWorkflow.js');

  assertCase(results, 'w247-w251-w252-w255-contract-shapes-represented',
    workflow.shape('W247_AUTHORING_REVIEW').schema === 'forge.lane-pack-authoring-review.v1' &&
      workflow.shape('W251_PROPOSED_CHANGE_DIFF').schema === 'forge.lane-pack-proposed-change-diff.v1' &&
      workflow.shape('W252_ADMIN_REVIEW_RENDERER').requiredSections.indexOf('Evidence changes') >= 0 &&
      workflow.shape('W255_RECEIPT_DRIVEN_QA').schema === 'forge.w255.receipt-driven-lane-expansion-qa.v1',
    JSON.stringify(workflow.exportedContractSummary()));

  assertCase(results, 'authoring-review-diff-review-and-qa-remain-field-compatible',
    workflow.packetMatchesShape(sourceReview, workflow.shape('W247_AUTHORING_REVIEW')) &&
      workflow.packetMatchesShape(drawerReview, workflow.shape('W247_AUTHORING_REVIEW')) &&
      workflow.packetMatchesShape(sourceDiff, workflow.shape('W251_PROPOSED_CHANGE_DIFF')) &&
      workflow.reviewRendererMatchesShape(drawerReviewHtml, workflow.shape('W252_ADMIN_REVIEW_RENDERER')) &&
      rendered.every((item) => workflow.packetMatchesShape(item.qa, workflow.shape('W255_RECEIPT_DRIVEN_QA'))),
    JSON.stringify({
      sourceReview: sourceReview.schema,
      drawerReview: drawerReview.schema,
      sourceDiff: sourceDiff.schema,
      qa: rendered.map((item) => item.qa.status)
    }));

  assertCase(results, 'expansion-guardrail-helper-rejects-unsafe-proposals',
    unsafeGuard.status === 'rejected' &&
      [
        'auto_install_forbidden',
        'write_authority_forbidden',
        'record_creation_forbidden',
        'hidden_uncertainty_forbidden',
        'website_evidence_override_forbidden',
        'consultant_toggle_override_forbidden',
        'guaranteed_or_measured_roi_forbidden'
      ].every((id) => unsafeGuard.violations.indexOf(id) >= 0) &&
      safeGuard.status === 'pass',
    JSON.stringify({ unsafe: unsafeGuard.violations, safe: safeGuard.violations }));

  assertCase(results, 'proposed-lane-pack-fixtures-remain-review-only-and-non-installable',
    workflow.proposedPackIsReviewOnly(w251Proposal, drawerReview, drawerReviewHtml) &&
      workflow.proposedPackIsReviewOnly(w255Proposal, w255Review, w255ReviewHtml),
    JSON.stringify({ w251: drawerReview.reviewCopy, w255: w255Review.reviewCopy }));

  assertCase(results, 'source-pack-remains-src-contracts-lane-packs',
    /LANE_PACKS/.test(lanePacksSource) &&
      /reviewProposedLanePackChange/.test(lanePacksSource) &&
      workflow.exportedContractSummary().sourcePackFile === 'src/contracts/lanePacks.js',
    workflow.exportedContractSummary().sourcePackFile);

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget),
    JSON.stringify(weakStory));

  assertCase(results, 'w273-story-coaching-contract-remains-available',
    storyContracts.exportedContractSummary().schema === 'forge.w273.story-coaching-surfaces.v1' &&
      typeof storyContracts.consultantSafeGuardrailCheck === 'function',
    JSON.stringify(storyContracts.exportedContractSummary().guardrails));

  assertCase(results, 'w272-live-evidence-signoff-contract-remains-available',
    liveEvidence.exportedContractSummary().schema === 'forge.w272.live-evidence-packets.v1' &&
      liveEvidence.isReviewOnlyPolicySafe(liveEvidence.reviewOnlyPolicy()) === true,
    JSON.stringify(liveEvidence.exportedContractSummary().reviewOnlyPolicy));

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
    !/require\(['\"][^'\"]*lanePackExpansionWorkflow/.test(userscript) &&
      /runtime behavior unchanged/i.test(report) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W274 Lane Pack Authoring Expansion Workflow Contract/.test(report) &&
      trace.schema === 'forge.w274.lane-pack-expansion-workflow-contract.trace.v1' &&
      trace.contractSummary.schema === 'forge.w274.lane-pack-expansion-workflow.v1',
    JSON.stringify(trace));

  printResults('W274 lane-pack expansion workflow contract harness', results);
}

main();
