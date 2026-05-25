#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  assertCase,
  archivePath,
  completedMotionResult,
  invalidMotionResult,
  loadHooks,
  motionContext,
  motionState,
  pendingRefreshResponse,
  printResults,
  readArchiveJson,
  readArchiveText,
  root,
  submitResponse
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function main() {
  const results = [];
  const utilityPath = archivePath('tools', 'lib', 'forge_harness_fixtures.js');
  const utilitySource = fs.readFileSync(utilityPath, 'utf8');
  const report = readArchiveText('reports', 'w270_shared_harness_fixture_utilities.md');
  const trace = readArchiveJson('trace_samples', 'w270_shared_harness_fixture_utilities_trace.json');
  const harnessFiles = [
    'run_w264_connected_build_submit_refresh_import_harness.js',
    'run_w265_live_adapter_smoke_retry_safety_harness.js',
    'run_w266_controlled_live_build_run_evidence_harness.js',
    'run_w267_live_run_screenshot_reconciliation_harness.js',
    'run_w268_installed_drawer_live_evidence_release_prep_harness.js',
    'run_w269_code_review_extraction_guardrails_harness.js'
  ];
  const harnessSources = harnessFiles.map((file) => ({
    file,
    source: readRepoFile('archive', 'tools', file)
  }));
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W270 harness' });
  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completed = completedMotionResult({ prefix: '270', salesOrderName: 'SO-W270 Motion Branch Availability' });
  const invalid = invalidMotionResult({ prefix: '270' });
  const guard = hooks.validateDccFinalNamingImportPayload(completed, state, context.lane, context.page, context.recommendation);
  const invalidGuard = hooks.validateDccFinalNamingImportPayload(invalid, state, context.lane, context.page, context.recommendation);
  const w266Packet = hooks.controlledLiveBuildRunEvidencePacketW266(state, context.lane, context.page, context.recommendation, {
    submittedAt: '2026-05-25T14:00:00.000Z',
    submitResponse: submitResponse('runner-w270-motion-001', 'motion-w270-token'),
    pendingRefreshResponse: pendingRefreshResponse('runner-w270-motion-001'),
    completedRefreshResponse: {
      ok: true,
      payload: {
        status: 'done',
        queueSubmitted: true,
        runner_task_id: 'runner-w270-motion-001',
        resultCapture: {
          status: 'completed_result_capture_ready',
          finalGeneratedNamesJson: completed
        }
      }
    },
    finishBuild: true
  });
  const w267Packet = hooks.postLiveRunScreenshotEvidencePacketW267(w266Packet, {
    reviewerEvidence: {
      buildRecordsClicked: true,
      buildSubmittedStateShown: true,
      refreshBuildStatusStateShown: true,
      recordsReadyFinishBuildStateShown: true,
      returnedNamesLaneLabelsShown: true,
      supportedOpenLinksAfterImport: true,
      reviewRunStorySurfacesVisible: true,
      weakUncertaintyVisible: { pass: true, note: 'Thin evidence remains visible.' },
      expectedConsultantCopyShown: true,
      returnedRecordsShown: w266Packet.importEvidence.returnedRecords.map((record) => ({ name: record.name, label: record.label })),
      openLinks: w266Packet.importEvidence.returnedRecords.reduce((acc, record) => {
        acc[record.role] = { openedSuccessfully: true, note: 'Opened in W270 fixture review.' };
        return acc;
      }, {}),
      rawDiagnosticsVisible: false,
      endpointVisible: false,
      runnerTaskIdVisible: false,
      schemaNamesVisible: false,
      stackTraceVisible: false,
      adminDiagnosticsVisible: false,
      fakeOpenLinksVisible: false,
      unsupportedUrlsVisible: false,
      invalidImportVisible: false
    }
  });
  const w268Release = hooks.releaseKeepPacketV100W268(w266Packet, w267Packet);
  const w269Guardrails = hooks.optimizationGuardrailPacketW269();

  assertCase(results, 'shared-harness-utility-exists-under-archive-tools-lib',
    fs.existsSync(utilityPath) &&
      /function loadHooks/.test(utilitySource) &&
      /function motionState/.test(utilitySource) &&
      /function completedMotionResult/.test(utilitySource) &&
      /module\.exports/.test(utilitySource),
    utilityPath);

  assertCase(results, 'w264-through-w269-harnesses-load-shared-fixtures',
    harnessSources.every((item) => /require\('\.\/lib\/forge_harness_fixtures'\)/.test(item.source)) &&
      trace.refactoredHarnesses.length === 6,
    harnessSources.map((item) => `${item.file}:${/forge_harness_fixtures/.test(item.source)}`).join(' | '));

  assertCase(results, 'motion-fixture-output-remains-equivalent',
    state.intake.customer === 'Motion Industries' &&
      state.selectedLaneId === 'industrial_distribution' &&
      state.toggles.enableManufacturing === false &&
      state.toggles.enableWip === false &&
      context.lane.id === 'industrial_distribution',
    JSON.stringify({ customer: state.intake.customer, lane: context.lane.id, toggles: state.toggles }));

  assertCase(results, 'completed-result-fixture-remains-w151-valid',
    guard.valid === true &&
      invalidGuard.valid === false &&
      completed.records.length === 4 &&
      completed.records.every((record) => /^\d+$/.test(String(record.internalId || '')) && /^https:\/\/td3021666\.app\.netsuite\.com\//.test(record.url || '')),
    JSON.stringify({ guard: guard.valid, invalidGuard: invalidGuard.valid, records: completed.records }));

  assertCase(results, 'w266-w267-w268-w269-outputs-remain-field-compatible',
    w266Packet.schema === 'forge.w266.controlled-live-build-run-evidence-packet.v1' &&
      w266Packet.liveRunDecision.status === 'ready_to_keep' &&
      w267Packet.schema === 'forge.w267.post-live-run-screenshot-evidence-reconciliation.v1' &&
      w267Packet.signoff.status === 'ready_to_keep' &&
      w268Release.schema === 'forge.w268.v1-release-keep-packet.v1' &&
      w268Release.status === 'ready_to_keep' &&
      w269Guardrails.schema === 'forge.w269.optimization-guardrail-packet.v1',
    JSON.stringify({ w266: w266Packet.schema, w267: w267Packet.schema, w268: w268Release.schema, w269: w269Guardrails.schema }));

  assertCase(results, 'no-runtime-file-behavior-changes-introduced',
    /No runtime behavior was changed/.test(report) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.normalConsultantUiChanged === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w266Packet.guardrails.noDrawerCreatedRecords === true &&
      w266Packet.guardrails.noDrawerTransactionWrites === true &&
      w267Packet.guardrails.noDrawerCreatedRecords === true &&
      w268Release.guardrails.noDrawerCreatedRecords === true &&
      w269Guardrails.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w266: w266Packet.guardrails, w267: w267Packet.guardrails, w268: w268Release.guardrails, w269: w269Guardrails.guardrails }));

  assertCase(results, 'report-and-trace-archived',
    /W270 Shared Archived Harness Fixture Utilities/.test(report) &&
      trace.schema === 'forge.w270.shared-harness-fixture-utilities.trace.v1' &&
      trace.utility.path === 'archive/tools/lib/forge_harness_fixtures.js',
    JSON.stringify(trace.utility));

  printResults('W270 shared harness fixture utilities harness', results);
}

main();
