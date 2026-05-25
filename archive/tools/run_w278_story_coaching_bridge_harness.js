#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bridge = require('../../src/contracts/storyCoachingBridge');
const storyContracts = require('../../src/contracts/storyCoachingSurfaces');
const liveEvidenceBridge = require('../../src/contracts/liveEvidenceSignoffBridge');
const lanePackReviewBridge = require('../../src/contracts/lanePackReviewBridge');
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

function completedResultFromFixture(fixture) {
  return {
    schema: 'forge.completed-runner-result.v2',
    status: 'completed',
    runStatus: 'completed',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: fixture.resolvedOperatingMode,
    records: fixture.records.map(fixtureRecord)
  };
}

function stateFromFixture(fixture) {
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

function storyBundleFor(hooks, fixture) {
  const state = stateFromFixture(fixture);
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    completedResultFromFixture(fixture),
    state,
    lane,
    page,
    recommendation
  );
  const story = normalized.consultantStorySurfaceW247;
  const firstGlance = hooks.consultantStoryFirstGlanceW255(story);
  const script = hooks.consultantLiveDemoScriptW256(story);
  const sequence = hooks.guidedDemoStepSequenceW257(story);
  return {
    fixture,
    state,
    lane,
    page,
    recommendation,
    normalized,
    story,
    receipt: story.evidenceReceiptW254,
    firstGlance,
    script,
    sequence,
    html: hooks.renderConsultantStorySurfaceW248(story),
    bridgePacket: bridge.bridgeStoryCoachingSurfaces({
      w254EvidenceReceipt: story.evidenceReceiptW254,
      w255FirstGlance: firstGlance,
      w256LiveDemoScript: script,
      w257GuidedSequence: sequence
    }, { hasValidImport: true })
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W278 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'storyCoachingBridge.js');
  const report = readArchiveText('reports', 'w278_story_coaching_bridge.md');
  const trace = readArchiveJson('trace_samples', 'w278_story_coaching_bridge_trace.json');
  const fixtures = readArchiveJson('fixtures', 'w249_lane_pack_expansion_qa_fixtures.json').fixtures;
  const bundles = fixtures.map((fixture) => storyBundleFor(hooks, fixture));
  const sample = bundles.find((item) => item.fixture.laneId === 'industrial_distributor') || bundles[0];
  const unsafe = bridge.consultantSafeGuardrailCheck({
    openTarget: 'Open Product SKU.',
    proofMove: 'The drawer created records and this will reduce cost with guaranteed ROI.',
    safeClaim: 'This is definitely the right lane.',
    buyerFacingSoWhat: 'Drawer writes to NetSuite prove value without showing uncertainty.'
  });
  const safe = bridge.consultantSafeGuardrailCheck(Object.assign({}, sample.story, {
    doNotClaimGuardrail: sample.firstGlance.doNotClaimGuardrail,
    lines: sample.script.lines,
    steps: sample.sequence.steps
  }));
  const weakState = stateFromFixture(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: sample.normalized.visibleRecords
  });
  const weakFirstGlance = hooks.consultantStoryFirstGlanceW255(weakStory);
  const weakScript = hooks.consultantLiveDemoScriptW256(weakStory);
  const weakSequence = hooks.guidedDemoStepSequenceW257(weakStory);
  const weakBridge = bridge.bridgeStoryCoachingSurfaces({
    w254EvidenceReceipt: weakStory.evidenceReceiptW254,
    w255FirstGlance: weakFirstGlance,
    w256LiveDemoScript: weakScript,
    w257GuidedSequence: weakSequence
  }, { hasValidImport: true });
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w278-motion-001',
      idempotencyToken: 'motion-w278-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w278-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w278-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w278-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '278' })
      }
    }
  });

  assertCase(results, 'story-coaching-bridge-exists',
    /STORY_COACHING_BRIDGE_SCHEMA_VERSION/.test(source) &&
      /require\('\.\/storyCoachingSurfaces'\)/.test(source) &&
      bridge.exportedContractSummary().schema === 'forge.w278.story-coaching-bridge.v1' &&
      bridge.exportedContractSummary().governingContract === storyContracts.STORY_COACHING_SCHEMA_VERSION,
    JSON.stringify(bridge.exportedContractSummary()));

  assertCase(results, 'bridge-validates-against-story-coaching-surfaces-contract',
    bundles.every((item) =>
      item.bridgePacket.status === 'bridge_ready' &&
      item.bridgePacket.governingContract === storyContracts.STORY_COACHING_SCHEMA_VERSION &&
      item.bridgePacket.entries.length === 4 &&
      item.bridgePacket.entries.every((entry) => entry.status === 'bridge_ready')
    ),
    bundles.map((item) => `${item.fixture.id}:${item.bridgePacket.status}`).join(' | '));

  assertCase(results, 'w254-w255-w256-w257-outputs-remain-field-compatible',
    bundles.every((item) =>
      bridge.validateStoryPacket('W254_EVIDENCE_RECEIPT', item.receipt).matchesContract === true &&
      bridge.validateStoryPacket('W255_FIRST_GLANCE', item.firstGlance).matchesContract === true &&
      bridge.validateStoryPacket('W256_LIVE_DEMO_SCRIPT', item.script).matchesContract === true &&
      bridge.validateStoryPacket('W257_GUIDED_SEQUENCE', item.sequence).matchesContract === true
    ),
    bundles.map((item) => `${item.fixture.id}:${item.receipt.schema}:${item.firstGlance.schema}:${item.script.schema}:${item.sequence.schema}`).join(' | '));

  assertCase(results, 'valid-imported-records-keep-returned-names-labels-and-open-link-authority',
    bundles.every((item) => {
      const storyText = [
        item.story.openTarget,
        item.firstGlance.openTarget,
        item.script.lines.whatToOpen,
        item.sequence.steps.map((step) => step.line).join(' ')
      ].join(' ');
      const proofRecord = item.normalized.visibleRecords.find((record) => storyText.indexOf(record.name) >= 0);
      return proofRecord &&
        storyText.indexOf(item.fixture.proofRecordName) >= 0 &&
        /\((Product SKU|Finished\/Assembly Item|Finished Food\/Batch Item|Availability\/Replenishment Flow|Work Order|Ingredient Item|Formula or Batch Structure|Component Item)\)/.test(storyText) &&
        proofRecord.linkAuthority &&
        proofRecord.linkAuthority.openable === true;
    }),
    bundles.map((item) => `${item.fixture.id}:${item.firstGlance.openTarget}`).join(' | '));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Confirm the lane before opening proof records/.test(weakFirstGlance.nextAction) &&
      weakScript.status === 'needs_confirmation_script' &&
      weakSequence.status === 'confirmation_first_sequence' &&
      weakBridge.status === 'bridge_ready' &&
      trace.continuity.weakEvidenceConfirmationFirst === true,
    JSON.stringify({ story: weakStory.status, firstGlance: weakFirstGlance.nextAction, script: weakScript.status, sequence: weakSequence.status }));

  assertCase(results, 'w273-guardrail-helper-remains-authoritative',
    unsafe.status === 'rejected' &&
      ['record_creation_claim', 'drawer_write_claim', 'measured_or_guaranteed_roi_claim', 'unsupported_lane_fit_claim', 'nllm_advisory_only_missing', 'hidden_uncertainty_claim'].every((id) => unsafe.violations.indexOf(id) >= 0) &&
      safe.status === 'pass' &&
      trace.w273Authority.consultantSafeGuardrailsAuthoritative === true,
    JSON.stringify({ unsafe: unsafe.violations, safe: safe.violations }));

  assertCase(results, 'normal-consultant-ui-remains-unchanged-and-hides-raw-diagnostics',
    bundles.every((item) =>
      /idb-w248-story-surface/.test(item.html) &&
      !/raw JSON|runnerTaskId|schema name|stack trace|admin diagnostics|internal contract array/i.test(item.html)
    ) &&
      trace.guardrails.normalConsultantUiChanged === false &&
      trace.guardrails.visibleReviewRunCopyChanged === false,
    bundles.map((item) => item.html.slice(0, 180)).join(' | '));

  assertCase(results, 'w276-and-w277-bridges-remain-available',
    liveEvidenceBridge.exportedContractSummary().schema === 'forge.w276.live-evidence-signoff-bridge.v1' &&
      lanePackReviewBridge.exportedContractSummary().schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      trace.continuity.w276LiveEvidenceSignoffBridgeAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true,
    JSON.stringify({
      w276: liveEvidenceBridge.exportedContractSummary().schema,
      w277: lanePackReviewBridge.exportedContractSummary().schema
    }));

  assertCase(results, 'connected-w264-submit-refresh-import-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      w264Flow.guardrails.fakeOpenLinksBlockedBeforeImport === true,
    JSON.stringify({ status: w264Flow.status, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    !/require\(['\"][^'\"]*storyCoachingBridge/.test(userscript) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.openLinkAuthorityChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    sample.bridgePacket.guardrails.noDrawerCreatedRecords === true &&
      sample.bridgePacket.guardrails.noDrawerTransactionWrites === true &&
      w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ bridge: sample.bridgePacket.guardrails, w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W278 Story Coaching Surface Bridge/.test(report) &&
      trace.schema === 'forge.w278.story-coaching-bridge.trace.v1' &&
      trace.bridge.module === 'src/contracts/storyCoachingBridge.js' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({ report: 'archive/reports/w278_story_coaching_bridge.md', trace: trace.schema }));

  printResults('W278 story coaching bridge harness', results);
}

main();
