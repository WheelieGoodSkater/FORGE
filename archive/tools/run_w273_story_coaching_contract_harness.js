#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

function fixtureRecord(raw) {
  return {
    role: raw.role,
    recordType: raw.recordType,
    type: raw.recordType,
    name: raw.name,
    internalId: raw.internalId,
    url: `https://YOUR_ACCOUNT_ID.app.netsuite.com${raw.path}?id=${raw.internalId}`
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
      url: 'https://YOUR_ACCOUNT_ID.app.netsuite.com/app/center/card.nl',
      pageType: 'NetSuite page',
      contextId: 'generic_netsuite_page',
      confidence: 'low'
    }
  };
}

function contextFor(hooks, state) {
  hooks.ensureWebsiteEvidenceRuntime(state);
  hooks.reconcileStateAuthority(state);
  const lane = hooks.getLane(state);
  const page = state.pageContext;
  const recommendation = hooks.recommendMove(lane, page);
  return { state, lane, page, recommendation };
}

function renderedFixture(hooks, fixture) {
  const context = contextFor(hooks, stateFromFixture(fixture));
  const result = completedResultFromFixture(fixture);
  const normalized = hooks.canonicalImportResultNormalizationW245(
    result,
    context.state,
    context.lane,
    context.page,
    context.recommendation
  );
  const story = normalized.consultantStorySurfaceW247;
  return {
    fixture,
    context,
    normalized,
    story,
    receipt: story.evidenceReceiptW254,
    firstGlance: hooks.consultantStoryFirstGlanceW255(story),
    script: hooks.consultantLiveDemoScriptW256(story),
    sequence: hooks.guidedDemoStepSequenceW257(story),
    html: hooks.renderConsultantStorySurfaceW248(story)
  };
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W273 harness' });
  const userscript = read(userscriptPath);
  const source = readRepoFile('src', 'contracts', 'storyCoachingSurfaces.js');
  const report = readArchiveText('reports', 'w273_story_coaching_contract.md');
  const trace = readArchiveJson('trace_samples', 'w273_story_coaching_contract_trace.json');
  const fixtures = readArchiveJson('fixtures', 'w249_lane_pack_expansion_qa_fixtures.json').fixtures;
  const rendered = fixtures.map((fixture) => renderedFixture(hooks, fixture));
  const sample = rendered.find((item) => item.fixture.laneId === 'industrial_distributor') || rendered[0];
  const weakState = stateFromFixture(fixtures[0]);
  weakState.intake.website = 'https://unknown-example.com';
  weakState.intake.notes = 'Maybe food, maybe apparel, maybe distributor. Evidence is conflicting.';
  const weakStory = hooks.consultantStorySurfaceFromLanePackW247(weakState, null, {
    displayReadyRecords: sample.normalized.visibleRecords
  });
  const weakFirstGlance = hooks.consultantStoryFirstGlanceW255(weakStory);
  const weakScript = hooks.consultantLiveDemoScriptW256(weakStory);
  const weakSequence = hooks.guidedDemoStepSequenceW257(weakStory);
  const unsafe = storyContracts.consultantSafeGuardrailCheck({
    openTarget: 'Open Product SKU.',
    proofMove: 'The records were created by the drawer and this will increase measured ROI with guaranteed outcome.',
    safeClaim: 'This is definitely the right lane and unsupported lane fit is fine.',
    buyerFacingSoWhat: 'Drawer writes to NetSuite prove value without showing uncertainty.'
  });
  const safe = storyContracts.consultantSafeGuardrailCheck(Object.assign({}, sample.story, {
    doNotClaimGuardrail: sample.firstGlance.doNotClaimGuardrail,
    lines: sample.script.lines,
    steps: sample.sequence.steps
  }));
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(state, context.lane, context.page, context.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w273-motion-001',
      idempotencyToken: 'motion-w273-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w273-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w273-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w273-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '273' })
      }
    }
  });

  assertCase(results, 'story-coaching-contract-module-exists',
    /STORY_COACHING_SCHEMA_VERSION/.test(source) &&
      /STORY_COACHING_SHAPES/.test(source) &&
      typeof storyContracts.packetMatchesShape === 'function' &&
      typeof storyContracts.consultantSafeGuardrailCheck === 'function',
    'src/contracts/storyCoachingSurfaces.js');

  assertCase(results, 'w254-w255-w256-w257-contract-shapes-represented',
    storyContracts.shape('W254_EVIDENCE_RECEIPT').schema === 'forge.w254.consultant-story-evidence-receipt.v1' &&
      storyContracts.shape('W255_FIRST_GLANCE').schema === 'forge.w255.consultant-story-first-glance.v1' &&
      storyContracts.shape('W256_LIVE_DEMO_SCRIPT').schema === 'forge.w256.consultant-live-demo-script.v1' &&
      storyContracts.shape('W257_GUIDED_SEQUENCE').schema === 'forge.w257.guided-demo-step-sequence.v1',
    JSON.stringify(storyContracts.exportedContractSummary()));

  assertCase(results, 'drawer-produced-story-outputs-remain-field-compatible',
    rendered.every((item) =>
      storyContracts.packetMatchesShape(item.receipt, storyContracts.shape('W254_EVIDENCE_RECEIPT')) &&
      storyContracts.packetMatchesShape(item.firstGlance, storyContracts.shape('W255_FIRST_GLANCE')) &&
      storyContracts.packetMatchesShape(item.script, storyContracts.shape('W256_LIVE_DEMO_SCRIPT')) &&
      storyContracts.packetMatchesShape(item.sequence, storyContracts.shape('W257_GUIDED_SEQUENCE'))
    ),
    rendered.map((item) => `${item.fixture.id}:${item.receipt.schema}:${item.firstGlance.schema}:${item.script.schema}:${item.sequence.schema}`).join(' | '));

  assertCase(results, 'guardrail-helper-rejects-overclaims-and-hidden-uncertainty',
    unsafe.status === 'rejected' &&
      ['record_creation_claim', 'drawer_write_claim', 'measured_or_guaranteed_roi_claim', 'unsupported_lane_fit_claim', 'nllm_advisory_only_missing', 'hidden_uncertainty_claim'].every((id) => unsafe.violations.indexOf(id) >= 0) &&
      safe.status === 'pass',
    JSON.stringify({ unsafe: unsafe.violations, safe: safe.violations }));

  assertCase(results, 'valid-imported-records-keep-returned-names-labels-and-open-link-authority',
    rendered.every((item) => {
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
    rendered.map((item) => `${item.fixture.id}:${item.firstGlance.openTarget}`).join(' | '));

  assertCase(results, 'weak-conflicting-evidence-remains-confirmation-first',
    weakStory.status === 'needs_lane_confirmation' &&
      /Confirm lane before opening proof records/.test(weakStory.openTarget) &&
      /Confirm the lane before opening proof records/.test(weakFirstGlance.nextAction) &&
      weakScript.status === 'needs_confirmation_script' &&
      weakSequence.status === 'confirmation_first_sequence' &&
      storyContracts.receiptVisibilityStatus(weakStory.evidenceReceiptW254, true).shouldRender === true,
    JSON.stringify({ story: weakStory.status, firstGlance: weakFirstGlance.nextAction, script: weakScript.status, sequence: weakSequence.status }));

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
      readRepoFile('archive', 'tools', 'run_w273_story_coaching_contract_harness.js').includes("require('./lib/forge_harness_fixtures')"),
    'archive/tools/lib/forge_harness_fixtures.js');

  assertCase(results, 'no-runtime-file-behavior-changes-introduced',
    !/require\(['\"][^'\"]*storyCoachingSurfaces/.test(userscript) &&
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
    /W273 Story Surface Receipt Script Sequence Contract/.test(report) &&
      trace.schema === 'forge.w273.story-coaching-contract.trace.v1' &&
      trace.contractSummary.schema === 'forge.w273.story-coaching-surfaces.v1',
    JSON.stringify(trace));

  printResults('W273 story coaching contract harness', results);
}

main();
