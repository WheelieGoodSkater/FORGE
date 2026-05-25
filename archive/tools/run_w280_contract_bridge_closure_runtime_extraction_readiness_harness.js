#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const liveEvidenceBridge = require('../../src/contracts/liveEvidenceSignoffBridge');
const lanePackReviewBridge = require('../../src/contracts/lanePackReviewBridge');
const storyCoachingBridge = require('../../src/contracts/storyCoachingBridge');
const adapterReadinessBridge = require('../../src/contracts/adapterReadinessBridge');
const adapterProfiles = require('../../src/contracts/adapterProfiles');
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

function bridgeById(trace, id) {
  return (trace.bridgeClosureMap.bridges || []).find((bridge) => bridge.id === id) || {};
}

function includesAll(source, expected) {
  const values = source || [];
  return expected.every((value) => values.indexOf(value) >= 0);
}

function main() {
  const results = [];
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W280 harness' });
  const userscript = read(userscriptPath);
  const packageJson = JSON.parse(readRepoFile('package.json'));
  const report = readArchiveText('reports', 'w280_contract_bridge_closure_runtime_extraction_readiness.md');
  const trace = readArchiveJson('trace_samples', 'w280_contract_bridge_closure_runtime_extraction_readiness_trace.json');
  const w276 = liveEvidenceBridge.exportedContractSummary();
  const w277 = lanePackReviewBridge.exportedContractSummary();
  const w278 = storyCoachingBridge.exportedContractSummary();
  const w279 = adapterReadinessBridge.exportedContractSummary();
  const w276Map = bridgeById(trace, 'W276');
  const w277Map = bridgeById(trace, 'W277');
  const w278Map = bridgeById(trace, 'W278');
  const w279Map = bridgeById(trace, 'W279');
  const selectedSlice = trace.runtimeExtractionReadinessPacket.selectedSlice;
  const readyState = motionState(hooks);
  const readyContext = motionContext(hooks, readyState);
  const w264Flow = hooks.connectedBuildSubmitRefreshImportW264(readyState, readyContext.lane, readyContext.page, readyContext.recommendation, {
    executeSubmit: true,
    executePoll: true,
    finishBuild: true,
    submitResponse: {
      status: 'queued_result_capture_pending',
      queueSubmitted: true,
      runnerTaskId: 'runner-w280-motion-001',
      idempotencyToken: 'motion-w280-token',
      resultCapture: { status: 'pending_runner_completion', runnerTaskId: 'runner-w280-motion-001' }
    },
    pollResponse: {
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId: 'runner-w280-motion-001',
      resultCapture: {
        status: 'completed_result_capture_ready',
        runnerTaskId: 'runner-w280-motion-001',
        finalGeneratedNamesJson: completedMotionResult({ prefix: '280' })
      }
    }
  });
  const retryPolicy = hooks.connectedBuildRetryPolicyW265({
    runnerTaskId: 'runner-w280-motion-001',
    idempotencyToken: 'motion-w280-token',
    completedResultAccepted: true
  });
  const readinessTrace = hooks.deployedAdapterReadinessTraceW263(
    readyState,
    readyContext.lane,
    readyContext.page,
    readyContext.recommendation
  );
  const buildHtml = hooks.renderIntegratedBuildRunnerReturnStatus(
    readyState,
    readyContext.lane,
    readyContext.page,
    readyContext.recommendation
  );

  assertCase(results, 'bridge-closure-map-includes-w276-through-w279',
    trace.bridgeClosureMap.schema === 'forge.w280.bridge-closure-map.v1' &&
      trace.bridgeClosureMap.bridges.length === 4 &&
      ['W276', 'W277', 'W278', 'W279'].every((id) => Boolean(bridgeById(trace, id).id)) &&
      /W276-W279 bridge closure map/.test(report),
    JSON.stringify(trace.bridgeClosureMap.bridges.map((bridge) => bridge.id)));

  assertCase(results, 'each-bridge-maps-to-governing-contract-and-protected-surface',
    w276Map.governingContract === 'src/contracts/liveEvidencePackets.js' &&
      w276Map.sourceSurfaceProtected.indexOf('W260/W261/W266/W267/W268') >= 0 &&
      w276.governingContract === 'forge.w272.live-evidence-packets.v1' &&
      w277Map.governingContract === 'src/contracts/lanePackExpansionWorkflow.js' &&
      w277Map.sourceSurfaceProtected.indexOf('W247/W251/W252/W255') >= 0 &&
      w277.governingContract === 'forge.w274.lane-pack-expansion-workflow.v1' &&
      w278Map.governingContract === 'src/contracts/storyCoachingSurfaces.js' &&
      w278Map.sourceSurfaceProtected.indexOf('W254 receipt') >= 0 &&
      w278.governingContract === 'forge.w273.story-coaching-surfaces.v1' &&
      w279Map.governingContract === 'src/contracts/adapterProfiles.js' &&
      w279Map.sourceSurfaceProtected.indexOf('W262 readiness states') >= 0 &&
      w279.governingContract === adapterProfiles.ADAPTER_PROFILE_SCHEMA_VERSION,
    JSON.stringify({
      w276: w276Map,
      w277: w277Map,
      w278: w278Map,
      w279: w279Map
    }));

  assertCase(results, 'each-bridge-lists-parity-ui-authority-and-rollback',
    includesAll(w276Map.parityHarnesses, ['W260', 'W261', 'W266', 'W267', 'W268', 'W272', 'W276']) &&
      includesAll(w277Map.parityHarnesses, ['W247', 'W251', 'W252', 'W255', 'W274', 'W277']) &&
      includesAll(w278Map.parityHarnesses, ['W254', 'W255', 'W256', 'W257', 'W273', 'W278']) &&
      includesAll(w279Map.parityHarnesses, ['W262', 'W263', 'W264', 'W265', 'W271', 'W279']) &&
      w276Map.normalConsultantUiSurfacesUnchanged.length > 0 &&
      w277Map.normalConsultantUiSurfacesUnchanged.length > 0 &&
      w278Map.normalConsultantUiSurfacesUnchanged.length > 0 &&
      w279Map.normalConsultantUiSurfacesUnchanged.length > 0 &&
      w276Map.runtimeAuthorityBoundariesUnchanged.length > 0 &&
      w277Map.runtimeAuthorityBoundariesUnchanged.length > 0 &&
      w278Map.runtimeAuthorityBoundariesUnchanged.length > 0 &&
      w279Map.runtimeAuthorityBoundariesUnchanged.length > 0 &&
      /Restore/.test(w276Map.rollbackBoundary + w277Map.rollbackBoundary + w278Map.rollbackBoundary + w279Map.rollbackBoundary),
    JSON.stringify(trace.bridgeClosureMap.bridges));

  assertCase(results, 'runtime-extraction-readiness-packet-selects-one-narrow-slice',
    trace.runtimeExtractionReadinessPacket.schema === 'forge.w280.runtime-extraction-readiness-packet.v1' &&
      selectedSlice.id === 'adapter_profile_readiness_contract_migration_prepare' &&
      selectedSlice.targetContractModules.indexOf('src/contracts/adapterProfiles.js') >= 0 &&
      selectedSlice.targetContractModules.indexOf('src/contracts/adapterReadinessBridge.js') >= 0 &&
      /Do not perform the selected runtime extraction/.test(report),
    JSON.stringify(selectedSlice));

  assertCase(results, 'selected-slice-includes-source-anchors-parity-harnesses-review-and-rollback',
    includesAll(selectedSlice.sourceAnchors, [
      'releasedAdapterProfileW263',
      'adapterProfileEndpointW263',
      'adapterProfilesFromConfigW263',
      'selectedAdapterProfileW263',
      'applySelectedAdapterProfileToConfigW263',
      'adapterReadyRecordCreationUxW262',
      'deployedAdapterReadinessTraceW263'
    ]) &&
      includesAll(selectedSlice.requiredHarnesses, ['W262', 'W263', 'W264', 'W265', 'W271', 'W279', 'W280', 'npm run check', 'npm run validate']) &&
      selectedSlice.expectedParityBehavior.some((item) => /W262 readiness states/.test(item)) &&
      selectedSlice.manualReviewNotes.some((item) => /Do not touch actual W144 endpoint values/.test(item)) &&
      selectedSlice.rollbackPlan.some((item) => /Restore drawer-owned W262\/W263/.test(item)),
    JSON.stringify(selectedSlice));

  assertCase(results, 'w276-w277-w278-w279-bridges-remain-available',
    w276.schema === 'forge.w276.live-evidence-signoff-bridge.v1' &&
      w277.schema === 'forge.w277.lane-pack-review-bridge.v1' &&
      w278.schema === 'forge.w278.story-coaching-bridge.v1' &&
      w279.schema === 'forge.w279.adapter-readiness-bridge.v1' &&
      trace.continuity.w276LiveEvidenceSignoffBridgeAvailable === true &&
      trace.continuity.w277LanePackReviewBridgeAvailable === true &&
      trace.continuity.w278StoryCoachingBridgeAvailable === true &&
      trace.continuity.w279AdapterReadinessBridgeAvailable === true,
    JSON.stringify({ w276: w276.schema, w277: w277.schema, w278: w278.schema, w279: w279.schema }));

  assertCase(results, 'connected-w264-submit-refresh-import-remains-unchanged',
    w264Flow.status === 'records_imported' &&
      w264Flow.endpointUrl === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      w264Flow.completedResultGuard.completedResultAcceptedByW151 === true &&
      w264Flow.importedRecords.length > 0 &&
      trace.continuity.w264SubmitRefreshImportChanged === false,
    JSON.stringify({ status: w264Flow.status, endpointUrl: w264Flow.endpointUrl, guard: w264Flow.completedResultGuard }));

  assertCase(results, 'w265-retry-safety-remains-unchanged',
    retryPolicy.duplicateSubmit.allowed === false &&
      retryPolicy.duplicateSubmit.createsSecondBuild === false &&
      retryPolicy.duplicateSubmit.idempotencyPreserved === true &&
      retryPolicy.afterAdapterError.allowedAutomatically === false &&
      retryPolicy.finishBuild.allowed === true &&
      trace.continuity.w265RetrySafetyChanged === false,
    JSON.stringify(retryPolicy));

  assertCase(results, 'w262-w263-adapter-readiness-profile-behavior-remains-unchanged',
    adapterReadinessBridge.validateReadinessTrace(readinessTrace).fieldCompatible === true &&
      readinessTrace.selectedAdapterProfile.deploymentId === '2' &&
      readinessTrace.selectedAdapterProfile.suiteletPath === '/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      adapterProfiles.adapterProfileEndpoint(hooks.releasedAdapterProfileW263()) === 'https://td3021666.app.netsuite.com/app/site/hosting/scriptlet.nl?script=6702&deploy=2' &&
      trace.continuity.w262W263AdapterReadinessProfileBehaviorChanged === false,
    JSON.stringify({
      traceValidation: adapterReadinessBridge.validateReadinessTrace(readinessTrace),
      endpoint: adapterProfiles.adapterProfileEndpoint(hooks.releasedAdapterProfileW263())
    }));

  assertCase(results, 'normal-consultant-ui-hides-endpoint-profile-raw-admin-diagnostics',
    /Ready to create NetSuite records/.test(buildHtml) &&
      /Build records/.test(buildHtml) &&
      !/script=6702|deploy=2|customdeployidb_governed_runner_adapter|td3021666\.app\.netsuite\.com|endpoint|raw json|schema|task id|stack trace|admin diagnostics/i.test(buildHtml) &&
      trace.guardrails.normalConsultantUiHidesEndpointProfileRawAdminDiagnostics === true,
    buildHtml.slice(0, 1400));

  assertCase(results, 'no-runtime-authority-changes-introduced',
    !/require\(['\"][^'\"]*adapterReadinessBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*liveEvidenceSignoffBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*lanePackReviewBridge/.test(userscript) &&
      !/require\(['\"][^'\"]*storyCoachingBridge/.test(userscript) &&
      trace.guardrails.runtimeBehaviorChanged === false &&
      trace.guardrails.connectedBuildFlowChanged === false &&
      trace.guardrails.recordCreationAuthorityChanged === false &&
      trace.guardrails.noW144DeploymentUpdateInThisBlock === true,
    JSON.stringify(trace.guardrails));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    w264Flow.guardrails.noDrawerCreatedRecords === true &&
      w264Flow.guardrails.noDrawerTransactionWrites === true &&
      trace.guardrails.noDrawerCreatedRecords === true &&
      trace.guardrails.noDrawerTransactionWrites === true,
    JSON.stringify({ w264: w264Flow.guardrails, trace: trace.guardrails }));

  assertCase(results, 'package-script-and-check-include-w280-harness',
    packageJson.scripts['harness:contract-bridge-closure-runtime-extraction-readiness-w280'] ===
      'node archive/tools/run_w280_contract_bridge_closure_runtime_extraction_readiness_harness.js' &&
      packageJson.scripts.check.indexOf('run_w280_contract_bridge_closure_runtime_extraction_readiness_harness.js') >= 0,
    JSON.stringify(packageJson.scripts['harness:contract-bridge-closure-runtime-extraction-readiness-w280']));

  assertCase(results, 'report-and-trace-archived',
    /W280 Contract Bridge Closure Map/.test(report) &&
      trace.schema === 'forge.w280.contract-bridge-closure-runtime-extraction-readiness.trace.v1' &&
      trace.visualTestingDecision.broadVisualRegressionRequired === false,
    JSON.stringify({
      report: 'archive/reports/w280_contract_bridge_closure_runtime_extraction_readiness.md',
      trace: trace.schema
    }));

  printResults('W280 contract bridge closure runtime extraction readiness harness', results);
}

main();
