#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const {
  assertCase,
  completedMotionResult,
  loadHooks,
  motionContext,
  motionState,
  printResults
} = require('./lib/forge_harness_fixtures');

const root = path.resolve(__dirname, '..', '..');
const drawerPath = path.join(root, 'idb-drawer.user.js');
const fileCabinetDrawerPath = path.join(root, 'src', 'FileCabinet', 'SuiteScripts', 'Intelligent Demo Builder', 'idb-drawer.user.js');
const reportPath = path.join(root, 'archive', 'reports', 'w427_refresh_completed_result_auto_import.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function main() {
  const results = [];
  const hooks = loadHooks();
  const drawer = read(drawerPath);
  const fileCabinetDrawer = read(fileCabinetDrawerPath);

  const state = motionState(hooks);
  const context = motionContext(hooks, state);
  const completedResult = completedMotionResult({ prefix: '427' });
  const kettleSidecarResult = {
    schema: 'forge.completed-runner-result.v2',
    status: 'pending_transaction_resolution',
    runStatus: 'pending_transaction_resolution',
    generatedRecordOwner: 'governed_runner_internal_build_engine',
    resolvedOperatingMode: 'foodmanufacturing',
    partialResultState: 'pending_transaction_resolution',
    records: [
      {
        role: 'customer',
        recordType: 'customer',
        type: 'customer',
        name: 'Kettle Brand Snacks Customer Account',
        internalId: '4422',
        url: 'https://td3021666.app.netsuite.com/app/common/entity/custjob.nl?id=4422'
      },
      {
        role: 'finished_food_or_batch_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Kettle Brand Snacks Finished Good',
        internalId: '6884',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6884'
      },
      {
        role: 'formula_or_batch_structure',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Kettle Brand Snacks Finished Good Replenishment',
        internalId: '6885',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6885'
      },
      {
        role: 'ingredient_or_component_item',
        recordType: 'inventoryitem',
        type: 'inventoryitem',
        name: 'Kettle Brand Snacks Finished Good Packaging / Case Pack',
        internalId: '6886',
        url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=6886'
      }
    ],
    transactionResolution: {
      status: 'pending_transaction_resolution'
    }
  };
  const originalConfirmedRequest = {
    schema: 'idb.confirmed-build-request.v1',
    requestId: 'idb-build-motion-industries-distribution',
    buildAttemptId: 'attempt-idb-build-motion-industries-distribution-427',
    submittedAt: '2026-06-23T20:14:00.000Z',
    requestStatus: 'confirmed_ready_for_governed_runner',
    consultantConfirmation: { confirmed: true },
    stateAuthority: { handoffParityStatus: 'matched', noStateMismatch: true }
  };

  const completedPoll = {
    schema: 'idb.w190-governed-runner-result-capture-polling-to-completed-json.v1',
    status: 'w190_completed_result_ready_for_w151_import',
    requestReady: true,
    requestSent: true,
    pollRequestEnvelope: {
      runnerTaskId: 'CSVIMPORT_W427',
      idempotencyToken: originalConfirmedRequest.requestId,
      buildAttemptId: originalConfirmedRequest.buildAttemptId
    },
    normalizedResponse: {
      status: 'completed_runner_result_ready',
      runnerTaskId: 'CSVIMPORT_W427',
      finalGeneratedNamesJsonReady: true,
      finalGeneratedNamesJson: completedResult,
      resultCapture: {
        status: 'completed_result_capture_ready',
        finalGeneratedNamesJson: completedResult
      }
    },
    statePatch: {
      integratedBuildRunnerResult: {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        status: 'completed_runner_result_ready',
        runnerTaskId: 'CSVIMPORT_W427',
        idempotencyToken: originalConfirmedRequest.requestId,
        buildAttemptId: originalConfirmedRequest.buildAttemptId,
        confirmedBuildRequest: originalConfirmedRequest,
        finalGeneratedNamesJson: completedResult,
        finalGeneratedNamesJsonReady: true,
        resultCapture: {
          status: 'completed_result_capture_ready',
          runnerTaskId: 'CSVIMPORT_W427',
          idempotencyToken: originalConfirmedRequest.requestId,
          buildAttemptId: originalConfirmedRequest.buildAttemptId,
          confirmedBuildRequest: originalConfirmedRequest,
          finalGeneratedNamesJson: completedResult
        },
        resultImportGuard: {
          completedResultPresent: true,
          completedResultAcceptedByW151: true,
          generatedRecordOwner: 'governed_runner_internal_build_engine',
          importReady: true
        }
      }
    },
    resultImportGuard: {
      completedResultPresent: true,
      completedResultAcceptedByW151: true,
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      importReady: true
    }
  };

  const importFlow = hooks.idbPollsCompletedResultAndImportsFinalUrlsV1(
    state,
    context.lane,
    context.page,
    context.recommendation,
    {
      pollResult: completedPoll,
      completedResultJson: completedResult,
      operatorChoseImport: true,
      actionId: 'import_completed_runner_result'
    }
  );

  const waitingState = motionState(hooks, {
    integratedBuildRunnerResult: {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      status: 'polling_pending',
      queueSubmitted: true,
      runnerTaskId: 'CSVIMPORT_W427_PENDING',
      idempotencyToken: originalConfirmedRequest.requestId,
      buildAttemptId: originalConfirmedRequest.buildAttemptId,
      confirmedBuildRequest: originalConfirmedRequest,
      resultCapture: {
        status: 'pending_transaction_resolution',
        lookupStatus: 'pending_transaction_resolution',
        runnerTaskId: 'CSVIMPORT_W427_PENDING',
        idempotencyToken: originalConfirmedRequest.requestId,
        buildAttemptId: originalConfirmedRequest.buildAttemptId,
        confirmedBuildRequest: originalConfirmedRequest,
        partialGeneratedNamesJson: kettleSidecarResult,
        sidecarGeneratedNamesJson: kettleSidecarResult,
        transactionResolution: {
          status: 'pending_transaction_resolution'
        }
      }
    }
  });
  const waitingContext = motionContext(hooks, waitingState);
  const waitingHtml = hooks.renderIntegratedBuildRunnerReturnStatus(
    waitingState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation
  );
  const waitingStage = hooks.consultantDayInLifeStageW416(
    waitingState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation
  );
  const sidecarImport = hooks.commitRunnerSidecarDisplayResultW431(
    waitingState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation,
    waitingState.integratedBuildRunnerResult,
    { source: 'harness_w431' }
  );
  const sidecarImportedState = Object.assign({}, waitingState, sidecarImport.statePatch || {});
  const sidecarImportedHtml = hooks.renderIntegratedBuildRunnerReturnStatus(
    sidecarImportedState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation
  );

  assertCase(results, 'w428-drawer-marker-updated',
    /@version\s+1\.0\.47/.test(drawer) &&
      drawer.includes("const DRAWER_USERSCRIPT_VERSION = '1.0.47';") &&
      drawer.includes("const CURRENT_UX_BLOCK_W346 = 'W439';"),
    'Drawer should identify the current install marker while preserving the refresh auto-import repair patch.');

  assertCase(results, 'w427-filecabinet-drawer-synced',
    drawer === fileCabinetDrawer,
    'Root and FileCabinet drawer copies should match.');

  assertCase(results, 'w427-submitted-confirmed-request-is-preserved',
    drawer.includes('confirmedBuildRequest: confirmedRequest') &&
      drawer.includes('const savedConfirmedBuildRequest = [') &&
      drawer.includes("candidate.schema === 'idb.confirmed-build-request.v1'"),
    'Submitted confirmed request should be stored and reused for polling.');

  assertCase(results, 'w427-refresh-auto-import-code-present',
    drawer.includes('idbPollsCompletedResultAndImportsFinalUrlsV1(') &&
      drawer.includes('completed_runner_result_auto_imported_on_refresh') &&
      drawer.includes('completed_runner_result_auto_import_blocked_on_refresh'),
    'Refresh should auto-import a W151-valid completed result.');

  assertCase(results, 'w427-auto-import-uses-existing-w151-guard',
    importFlow.status === 'completed_result_imported_final_urls_ready' &&
      importFlow.importGuard &&
      importFlow.importGuard.commitAllowed === true &&
      importFlow.statePatch &&
      importFlow.statePatch.dccFinalNamingResult &&
      importFlow.buildAndRunAfterImport &&
      importFlow.buildAndRunAfterImport.verifiedOpenLinkCount >= 4,
    JSON.stringify(importFlow.importGuard));

  assertCase(results, 'w427-auto-import-preserves-open-link-authority',
    importFlow.mutationGuard &&
      importFlow.mutationGuard.drawerWritesAttempted === false &&
      importFlow.noRegression &&
      importFlow.noRegression.noActiveOpenLinksWithoutRealUrls === true,
    JSON.stringify(importFlow.noRegression));

  const stalePollControl = {
    schema: 'idb.approved-server-adapter-result-poll-control-implementation.v1',
    status: 'poll_control_pending_or_no_submit',
    resultImportGuard: {
      importReady: false,
      completedResultAcceptedByW151: false
    }
  };
  const refreshReadiness = hooks.completedRunnerResultReadyForRefreshAutoImportW428(
    stalePollControl,
    completedPoll,
    completedResult,
    state,
    context.lane,
    context.page,
    context.recommendation
  );
  assertCase(results, 'w428-refresh-auto-import-trusts-completed-poll-result',
    refreshReadiness.ready === true &&
      refreshReadiness.localW151Accepted === true &&
      refreshReadiness.pollImportReady === true &&
      refreshReadiness.pollControlImportReady === false,
    JSON.stringify(refreshReadiness));

  assertCase(results, 'w427-pending-transaction-resolution-copy-is-honest',
    /waiting for the Sales Order import to resolve/i.test(waitingHtml) &&
      /Resolving import/.test(waitingHtml) &&
      !/Paste the completed build result/i.test(waitingHtml),
    waitingHtml.slice(0, 1600));

  assertCase(results, 'w431-refresh-imports-sidecar-brand-records-before-sales-order-resolution',
    sidecarImport.imported === true &&
      sidecarImport.statePatch &&
      sidecarImport.statePatch.dccFinalNamingResult &&
      sidecarImport.statePatch.dccFinalNamingResult.finalNamesImported === true &&
      sidecarImport.statePatch.dccFinalNamingResult.partialResultImported === true &&
      /Kettle Brand Snacks Finished Good/.test(JSON.stringify(sidecarImport.statePatch.dccFinalNamingResult)) &&
      !/Paste the completed build result/i.test(sidecarImportedHtml),
    JSON.stringify(sidecarImport));

  const genericSidecarImport = hooks.commitRunnerSidecarDisplayResultW431(
    waitingState,
    waitingContext.lane,
    waitingContext.page,
    waitingContext.recommendation,
    {
      resultCapture: {
        status: 'pending_transaction_resolution',
        partialGeneratedNamesJson: Object.assign({}, kettleSidecarResult, {
          records: [
            {
              role: 'branch_or_product_sku',
              recordType: 'inventoryitem',
              type: 'inventoryitem',
              name: 'Product Availability SKU',
              internalId: '9991',
              url: 'https://td3021666.app.netsuite.com/app/common/item/item.nl?id=9991'
            }
          ]
        })
      }
    },
    { source: 'harness_w433_generic_import_not_blocked' }
  );
  assertCase(results, 'w433-sidecar-imports-returned-records-even-when-name-review-needed',
    genericSidecarImport.imported === true &&
      genericSidecarImport.statePatch &&
      genericSidecarImport.statePatch.dccFinalNamingResult &&
      genericSidecarImport.statePatch.dccFinalNamingResult.sidecarNameQuality === 'returned_records_imported_name_review_needed' &&
      /retrieval is not blocked by naming guardrails/i.test(JSON.stringify(genericSidecarImport.statePatch.dccFinalNamingResult.warnings || [])),
    JSON.stringify(genericSidecarImport));

  assertCase(results, 'w431-sidecar-import-only-blocks-empty-sidecar',
    hooks.commitRunnerSidecarDisplayResultW431(
      waitingState,
      waitingContext.lane,
      waitingContext.page,
      waitingContext.recommendation,
      {
        resultCapture: {
          status: 'pending_transaction_resolution',
          partialGeneratedNamesJson: {
            schema: 'forge.completed-runner-result.v2',
            status: 'partial_result_imported_for_display',
            generatedRecordOwner: 'governed_runner_internal_build_engine',
            records: []
          }
        }
      },
      { source: 'harness_w431_empty' }
    ).imported === false,
    'Empty sidecar payloads should still not be imported as real returned records.');

  assertCase(results, 'w430-pending-transaction-resolution-stage-is-not-generic-building',
    waitingStage.stage === 'resolving_records' &&
      /resolving returned records/i.test(waitingStage.label.title) &&
      hooks.runnerResultPendingTransactionResolutionW430(waitingState.integratedBuildRunnerResult) === true,
    JSON.stringify(waitingStage));

  const report = `# W428 Refresh Completed Result Auto-Import Repair

## Summary
W428 repairs the simplified consultant flow after a runner task completes. Refresh preserves the original submitted build identity, polls the result capture with that identity, and auto-imports the completed runner result into the cockpit when the completed result validates locally or the completed poll response carries W151-ready evidence.

## Fix
- Store the submitted confirmed build request on the captured runner result.
- Reuse that confirmed request during result-capture polling.
- On Refresh build status, commit a W151-valid completed result immediately instead of requiring a separate Finish build click.
- Trust the completed poll result when the older poll-control object still reports a conservative pending state.
- Show a more honest waiting message when the sidecar exists but Sales Order import resolution is still pending.

## Pass/Fail
| Gate | Result |
| --- | --- |
${results.map((result) => `| ${result.id} | ${result.pass ? 'PASS' : 'FAIL'} |`).join('\n')}

## Boundaries
- No live smoke was run.
- No upload or deployment was performed.
- No runner write path, adapter record creation, source pack, completed-result validation, or Open-link authority check was weakened.

## Recommendation
Lock W439, reinstall Drawer 1.0.47 / W439 in Tampermonkey, and rerun one controlled Food/Beverage build. After the runner returns sidecar records, Refresh build status should import returned records into the cockpit even while transaction import resolution or naming review continues.
`;
  fs.writeFileSync(reportPath, report);

  printResults('W428 refresh completed result auto-import repair harness', results);
}

main();
