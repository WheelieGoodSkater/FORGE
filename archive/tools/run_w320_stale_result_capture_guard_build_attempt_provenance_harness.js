#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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
  userscriptPath
} = require('./lib/forge_harness_fixtures');

function readRepoFile(...parts) {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W320 harness' });
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const userscript = read(userscriptPath);
  const adapter = readRepoFile('netsuite', 'idb_governed_runner_adapter_w144_suitelet.js');
  const runner = readRepoFile('netsuite', 'runner', 'scai_ss_so_csv_runner_sidecar_oldcore_roi_competitive_w472.js');
  const report = readArchiveText('reports', 'w320_stale_result_capture_guard_build_attempt_provenance.md');
  const trace = readArchiveJson('trace_samples', 'w320_stale_result_capture_guard_build_attempt_provenance_trace.json');

  const state = motionState(hooks, {
    intake: {
      customer: 'Tri-State Hose & Hydraulics',
      website: 'https://www.gates.com',
      notes: 'First discovery call with regional sales and branch operations. They need branch availability and replenishment confidence before promising urgent replacement orders.'
    },
    toggles: {
      createNewHeroItem: true,
      enableManufacturing: false,
      enableWip: false
    }
  });
  const context = motionContext(hooks, state);
  state.integratedBuildAttemptProvenance = {
    schema: 'forge.w320.build-attempt-provenance.v1',
    requestId: 'idb-build-tri-state-hose-hydraulics-industrial-distribution-distribution',
    sourceRequestId: 'idb-build-tri-state-hose-hydraulics-industrial-distribution-distribution',
    buildAttemptId: 'attempt-current-w320',
    submittedAt: '2026-05-27T12:00:00.000Z'
  };
  state.integratedBuildRunnerResult = {
    schema: 'idb.approved-server-adapter-result-envelope.v1',
    status: 'queued_result_capture_pending',
    queueSubmitted: true,
    runnerTaskId: 'runner-current-w320',
    idempotencyToken: state.integratedBuildAttemptProvenance.requestId,
    sourceRequestId: state.integratedBuildAttemptProvenance.sourceRequestId,
    buildAttemptId: state.integratedBuildAttemptProvenance.buildAttemptId,
    submittedAt: state.integratedBuildAttemptProvenance.submittedAt,
    resultCapture: {
      status: 'pending_runner_completion',
      runnerTaskId: 'runner-current-w320',
      idempotencyToken: state.integratedBuildAttemptProvenance.requestId,
      sourceRequestId: state.integratedBuildAttemptProvenance.sourceRequestId,
      buildAttemptId: state.integratedBuildAttemptProvenance.buildAttemptId,
      submittedAt: state.integratedBuildAttemptProvenance.submittedAt
    },
    finalGeneratedNamesJson: null,
    activeOpenLinks: 0
  };

  const currentFresh = completedMotionResult({ prefix: '320', salesOrderName: 'SO-W320 Tri-State Availability' });
  currentFresh.records[2].name = 'Tri-State Hose & Hydraulics Product Availability SKU';
  currentFresh.records[3].name = 'Tri-State Hose & Hydraulics Branch Replenishment Flow';
  currentFresh.records[4] = {
    role: 'supporting_sku',
    recordType: 'inventoryitem',
    type: 'inventoryitem',
    name: 'Tri-State Hose & Hydraulics Fulfillment Support SKU',
    internalId: '32005',
    url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=32005'
  };
  const freshResponse = completedRefreshResponse('runner-current-w320', currentFresh);
  freshResponse.idempotencyToken = state.integratedBuildAttemptProvenance.requestId;
  freshResponse.sourceRequestId = state.integratedBuildAttemptProvenance.sourceRequestId;
  freshResponse.buildAttemptId = state.integratedBuildAttemptProvenance.buildAttemptId;
  freshResponse.submittedAt = state.integratedBuildAttemptProvenance.submittedAt;
  freshResponse.resultCapture = Object.assign({}, freshResponse.resultCapture || {}, {
    runnerTaskId: 'runner-current-w320',
    idempotencyToken: state.integratedBuildAttemptProvenance.requestId,
    sourceRequestId: state.integratedBuildAttemptProvenance.sourceRequestId,
    buildAttemptId: state.integratedBuildAttemptProvenance.buildAttemptId,
    submittedAt: state.integratedBuildAttemptProvenance.submittedAt,
    finalGeneratedNamesJson: currentFresh
  });

  const staleResponse = completedRefreshResponse('runner-old-w319', completedMotionResult({ prefix: '319', salesOrderName: 'SO-W319 Old' }));
  staleResponse.idempotencyToken = state.integratedBuildAttemptProvenance.requestId;
  staleResponse.buildAttemptId = 'attempt-old-w319';
  staleResponse.resultCapture = Object.assign({}, staleResponse.resultCapture || {}, {
    runnerTaskId: 'runner-old-w319',
    idempotencyToken: state.integratedBuildAttemptProvenance.requestId,
    buildAttemptId: 'attempt-old-w319'
  });

  const pollFresh = hooks.governedRunnerResultCapturePollingToCompletedJsonV1(state, context.lane, context.page, context.recommendation, {
    adapterResult: state.integratedBuildRunnerResult,
    adapterConfig: state.integratedBuildAdapterConfig || {},
    operatorEvidence: state.integratedBuildOperatorApproval || {},
    approvedEndpointMode: 'approved_server_adapter_only',
    executePoll: true,
    transport: () => freshResponse
  });
  const completedGuard = hooks.validateDccFinalNamingImportPayload(pollFresh.statePatch.integratedBuildRunnerResult.finalGeneratedNamesJson, state, context.lane, context.page, context.recommendation);
  const semanticGuard = hooks.completedRunnerResultSemanticGuardW214(completedGuard.finalNaming, state, context.lane, pollFresh.statePatch.integratedBuildRunnerResult.finalGeneratedNamesJson);
  const blockedUi = hooks.oneClickProductionBuildAutomationAndHiddenAdminConfigW208V1(Object.assign({}, state, {
    integratedBuildRunnerResult: {
      status: 'completed_runner_result_ready',
      runnerTaskId: 'runner-current-w320',
      idempotencyToken: state.integratedBuildAttemptProvenance.requestId,
      resultImportGuard: {
        completedResultPresent: true,
        importReady: false,
        completedResultStatus: 'toggle_vocabulary_guardrail_failed'
      },
      finalGeneratedNamesJson: null,
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: { schema: 'idb.completed-runner-result-json.v1' }
      }
    }
  }), context.lane, context.page, context.recommendation);

  assertCase(results, 'w320-report-and-trace-exist',
    /W320 Stale Result Capture Guard And Build Attempt Provenance/.test(report) &&
      trace.schema === 'forge.w320.stale-result-capture-guard-build-attempt-provenance.trace.v1' &&
      trace.status === 'stale_result_guard_ready_for_upload',
    JSON.stringify({ status: trace.status, decision: trace.decision }));

  assertCase(results, 'drawer-adds-build-attempt-provenance-and-submitted-at',
    /function buildAttemptProvenanceW320/.test(userscript) &&
      /ensureExplicitBuildAttemptProvenanceW320/.test(userscript) &&
      /buildAttemptId/.test(userscript) &&
      /submittedAt/.test(userscript) &&
      /same_confirmed_request_reuses_existing_runner_task/.test(userscript),
    'drawer should stamp explicit build attempts');

  assertCase(results, 'w144-lookup-prefers-runner-task-then-attempt-before-idempotency',
      /pushUniqueSearchToken\(searchTokens, seen, 'runnerTaskId'/.test(adapter) &&
      /pushUniqueSearchToken\(searchTokens, seen, 'buildAttemptId'/.test(adapter) &&
      /pushUniqueSearchToken\(searchTokens, seen, 'idempotencyToken'/.test(adapter) &&
      adapter.indexOf("pushUniqueSearchToken(searchTokens, seen, 'runnerTaskId'") < adapter.indexOf("pushUniqueSearchToken(searchTokens, seen, 'buildAttemptId'") &&
      adapter.indexOf("pushUniqueSearchToken(searchTokens, seen, 'buildAttemptId'") < adapter.indexOf("pushUniqueSearchToken(searchTokens, seen, 'idempotencyToken'"),
    'adapter lookup priority should prefer current task/current attempt before idempotency fallback');

  assertCase(results, 'w144-lookup-searches-field-safe-sidecar-filename-tokens',
    /function resultCaptureFileSearchTokensW320/.test(adapter) &&
      /safeBuildAttemptIdFileTokenW320/.test(adapter) &&
      /safeIdempotencyFileTokenW320/.test(adapter) &&
      /safeAttempt\.slice\(0, 56\)/.test(adapter) &&
      /safeToken\.slice\(0, 48\)/.test(adapter) &&
      /resultCaptureFileSearchTokensW320\(expected\)/.test(adapter),
    'adapter should search the same truncated safe tokens used by runner sidecar filenames');

  assertCase(results, 'w144-rejects-stale-idempotency-only-result-captures',
    /stale_result_capture_file_rejected/.test(adapter) &&
      /buildAttemptId_missing/.test(adapter) &&
      /buildAttemptId_mismatch/.test(adapter) &&
      /runnerTaskId_mismatch/.test(adapter) &&
      /resultCaptureMatchesCurrentAttempt/.test(adapter) &&
      /staleCandidates/.test(adapter),
    'adapter should reject stale capture candidates');

  assertCase(results, 'w144-allows-current-safe-token-sidecar-when-runner-provenance-is-missing',
    /function legacyCurrentSafeTokenCaptureAllowed/.test(adapter) &&
      /legacy_current_safe_token_capture_allowed/.test(adapter) &&
      /sidecar_missing_build_attempt_provenance_but_matches_current_safe_token_and_file_time/.test(adapter) &&
      /timestampFromResultCaptureFileName/.test(adapter) &&
      /idempotencyToken_mismatch/.test(adapter) &&
      /idempotencyMatchesExtIdAlias/.test(adapter) &&
      /tokenSource === 'safeIdempotencyFileTokenW320'/.test(adapter) &&
      /fileTime >= submittedTime/.test(adapter),
    'adapter should recover current legacy sidecars without accepting stale mismatched captures');

  assertCase(results, 'runner-result-capture-includes-required-provenance',
    /sourceRequestId/.test(runner) &&
      /buildAttemptId/.test(runner) &&
      /submittedAt/.test(runner) &&
      /resolvedOperatingMode/.test(runner) &&
      /runnerLaneVocabularyPolicy/.test(runner) &&
      /function resultCaptureFileNameW320/.test(runner),
    'runner sidecar should include provenance plus vocabulary policy');

  assertCase(results, 'runner-fallback-vocabulary-is-distribution-safe-when-request-json-is-missing',
    /fallbackText/.test(runner) &&
      /opts && opts\.notes/.test(runner) &&
      /opts && opts\.agenda/.test(runner) &&
      /!modeKey && !enableManufacturing && !enableWip\) modeKey = 'distribution_replenishment'/.test(runner) &&
      /website,\n\s+notes,\n\s+agenda,\n\s+extId,\n\s+confirmedBuildRequestJson/.test(runner) &&
      /notes: args\.notes/.test(runner) &&
      /agenda: args\.agenda/.test(runner),
    'runner should not fall back to Formula/Ingredient labels when confirmed request JSON is unavailable');

  assertCase(results, 'runner-sales-order-memo-uses-record-safe-consolidated-context',
    /function recordSafeDemoContextMemo/.test(runner) &&
      /recordFieldSafeText/.test(runner) &&
      /Buyer:/.test(runner) &&
      /Pain:/.test(runner) &&
      /Proof:/.test(runner) &&
      /Value:/.test(runner) &&
      /recordSafeDemoContextMemo\(\{ prospect, website, notes, agenda \}\)/.test(runner) &&
      !/memoBase \+ ' - ' \+ summarizeOneLine\(agenda\)/.test(runner),
    'SO memo should be a field-safe buyer/pain/proof/value summary, not raw notes');

  assertCase(results, 'runner-result-capture-filename-is-field-safe',
    /function resultCaptureFileNameW320/.test(runner) &&
      /slice\(0, 56\)/.test(runner) &&
      /slice\(0, 48\)/.test(runner) &&
      /trimLen\(`idb_runner_sidecar_/.test(runner) &&
      /, 180\)/.test(runner),
    'result capture file name should stay under NetSuite field length limits');

  assertCase(results, 'duplicate-submit-safety-still-reuses-existing-task-scope',
    /duplicateSubmitScope: 'same_confirmed_request_reuses_existing_runner_task'/.test(userscript) &&
      /duplicateIdempotencyBehavior: 'poll_existing_runner_task'/.test(userscript) &&
      /secondSubmitBehavior: 'blocked_duplicate_submit'/.test(userscript),
    'duplicate submit policy should remain intact');

  assertCase(results, 'fresh-matching-build-attempt-result-can-import',
    pollFresh.status === 'w190_completed_result_ready_for_w151_import' &&
      completedGuard.valid === true &&
      semanticGuard.valid === true &&
      pollFresh.statePatch.integratedBuildRunnerResult.buildAttemptId === 'attempt-current-w320',
    JSON.stringify({ status: pollFresh.status, guard: completedGuard.status, semantic: semanticGuard.status }));

  assertCase(results, 'stale-result-simulation-would-be-rejected-by-provenance',
    staleResponse.resultCapture.buildAttemptId !== state.integratedBuildAttemptProvenance.buildAttemptId &&
      /buildAttemptId_mismatch/.test(adapter) &&
      /stale_result_capture_file_rejected/.test(adapter),
    JSON.stringify({ stale: staleResponse.resultCapture.buildAttemptId, current: state.integratedBuildAttemptProvenance.buildAttemptId }));

  assertCase(results, 'semantic-block-consultant-copy-is-safe',
    blockedUi.status === 'records_returned_blocked' &&
      blockedUi.label === 'Records returned but blocked' &&
      blockedUi.headline === 'Review needed' &&
      /No Open links until fixed/.test(blockedUi.copy) &&
      !/W151|W214|W245|runnerTaskId|raw JSON|endpoint|stack trace/i.test(`${blockedUi.label} ${blockedUi.headline} ${blockedUi.copy}`),
    JSON.stringify({ status: blockedUi.status, label: blockedUi.label, copy: blockedUi.copy }));

  assertCase(results, 'validation-guardrails-not-weakened',
    /validateDccFinalNamingImportPayload/.test(userscript) &&
      /completedRunnerResultSemanticGuardW214/.test(userscript) &&
      /canonicalImportResultNormalizationW245/.test(userscript) &&
      trace.guardrails.w151ValidationWeakened === false &&
      trace.guardrails.w214SemanticGuardWeakened === false &&
      trace.guardrails.w245CanonicalImportWeakened === false,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-record-authority-change',
    trace.guardrails.drawerCreatesRecords === false &&
      trace.guardrails.drawerTransactionWrites === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      !/record\.create\(|record\.submitFields\(|nlapiSubmitRecord/i.test(userscript),
    JSON.stringify(trace.guardrails));

  assertCase(results, 'package-registration-and-continuity',
    packageJson.scripts['harness:stale-result-capture-guard-build-attempt-provenance-w320'] === 'node archive/tools/run_w320_stale_result_capture_guard_build_attempt_provenance_harness.js' &&
      packageJson.scripts.check.includes('run_w320_stale_result_capture_guard_build_attempt_provenance_harness.js') &&
      trace.validationIntent.w318VocabularyHarnessStillRequired === true &&
      trace.validationIntent.w264W265W319ContinuityRequired === true,
    packageJson.scripts['harness:stale-result-capture-guard-build-attempt-provenance-w320'] || '');

  printResults('W320 stale result capture guard and build attempt provenance harness', results);
}

main();
