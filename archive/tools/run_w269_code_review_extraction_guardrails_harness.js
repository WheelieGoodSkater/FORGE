#!/usr/bin/env node

const {
  assertCase,
  loadHooks,
  printResults,
  readArchiveJson,
  readArchiveText
} = require('./lib/forge_harness_fixtures');

function main() {
  const hooks = loadHooks({ fetchMessage: 'live fetch disabled in W269 harness' });
  const report = readArchiveText('reports', 'w269_code_review_extraction_guardrails.md');
  const trace = readArchiveJson('trace_samples', 'w269_code_review_extraction_guardrails_trace.json');
  const inventory = hooks.codeReviewPrepInventoryW268();
  const findings = hooks.codeReviewFindingsReportW269({ inventory });
  const plan = hooks.extractionPlanW269();
  const guardrails = hooks.optimizationGuardrailPacketW269();
  const releaseTemplate = hooks.installedDrawerLiveEvidenceIntakeTemplateW268();
  const releasePacketAvailable = typeof hooks.releaseKeepPacketV100W268 === 'function';
  const requiredRiskCategories = [
    'behavior/regression risk',
    'maintainability risk',
    'test/harness duplication risk',
    'future lane-pack expansion risk',
    'UX trust/readability risk'
  ];
  const requiredPhaseIds = [
    'phase_1_shared_archived_harness_fixture_utilities',
    'phase_2_adapter_profile_readiness_contract_extraction',
    'phase_3_live_evidence_signoff_packet_contract_extraction',
    'phase_4_story_surface_receipt_script_sequence_contract_extraction',
    'phase_5_lane_pack_authoring_expansion_workflow_cleanup'
  ];
  const results = [];

  assertCase(results, 'code-review-findings-include-all-risk-categories',
    findings.schema === 'forge.w269.code-review-findings-report.v1' &&
      requiredRiskCategories.every((category) => findings.findings.some((finding) => finding.riskCategory === category)) &&
      findings.findings.every((finding) => finding.id && finding.severity && finding.recommendation),
    JSON.stringify(findings.findings));

  assertCase(results, 'extraction-plan-includes-five-phases-with-parity-and-rollback',
    plan.schema === 'forge.w269.low-risk-extraction-plan.v1' &&
      requiredPhaseIds.every((id) => plan.phases.some((phase) => phase.id === id)) &&
      plan.phases.every((phase) =>
        phase.sourceHelperArea &&
        phase.proposedTargetModule &&
        Array.isArray(phase.behaviorSurfacesThatMustStayIdentical) &&
        phase.behaviorSurfacesThatMustStayIdentical.length > 0 &&
        Array.isArray(phase.parityHarnesses) &&
        phase.parityHarnesses.length > 0 &&
        phase.rollbackBoundary
      ),
    JSON.stringify(plan.phases));

  assertCase(results, 'optimization-guardrail-preserves-w218-w220-w245-w262-through-w268',
    guardrails.schema === 'forge.w269.optimization-guardrail-packet.v1' &&
      /W218/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W220/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W245/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W262/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      /W268/.test(guardrails.preservedBehaviorSurfaces.join(' ')) &&
      guardrails.guardrails.noDrawerCreatedRecords === true &&
      guardrails.guardrails.noDrawerTransactionWrites === true &&
      guardrails.guardrails.approvedW144AdapterOnlyRecordCreation === true,
    JSON.stringify(guardrails));

  assertCase(results, 'review-artifacts-introduce-no-external-actions',
    findings.reviewOnlyPolicy.networkCallAllowed === false &&
      plan.reviewOnlyPolicy.externalUploadAllowed === false &&
      guardrails.reviewOnlyPolicy.trackingAllowed === false &&
      guardrails.reviewOnlyPolicy.localStorageWriteAllowed === false &&
      guardrails.reviewOnlyPolicy.installActionAllowed === false &&
      guardrails.reviewOnlyPolicy.runtimeDependencyAdded === false,
    JSON.stringify({ findings: findings.reviewOnlyPolicy, plan: plan.reviewOnlyPolicy, guardrails: guardrails.reviewOnlyPolicy }));

  assertCase(results, 'w268-release-keep-packet-remains-available',
    releaseTemplate.schema === 'forge.w268.installed-drawer-live-evidence-intake-template.v1' &&
      releasePacketAvailable === true &&
      inventory.schema === 'forge.w268.code-review-prep-inventory.v1',
    JSON.stringify({ releaseTemplate: releaseTemplate.schema, releasePacketAvailable, inventory: inventory.schema }));

  assertCase(results, 'w264-through-w268-continuity-harnesses-listed',
    guardrails.requiredParityHarnesses.some((cmd) => /w264/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w265/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w266/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w267/.test(cmd)) &&
      guardrails.requiredParityHarnesses.some((cmd) => /w268/.test(cmd)),
    guardrails.requiredParityHarnesses.join(' | '));

  assertCase(results, 'no-drawer-created-records-or-transaction-writes-introduced',
    guardrails.authorityBoundaries.some((item) => /no drawer-created records/.test(item)) &&
      guardrails.authorityBoundaries.some((item) => /no drawer transaction writes/.test(item)) &&
      guardrails.authorityBoundaries.some((item) => /approved W144/.test(item)),
    JSON.stringify(guardrails.authorityBoundaries));

  assertCase(results, 'report-and-trace-archived',
    /W269 Code Review Findings/.test(report) &&
      trace.schema === 'forge.w269.code-review-extraction-guardrails.trace.v1' &&
      trace.extractionPlan.phaseCount === 5 &&
      trace.guardrails.noDrawerCreatedRecords === true,
    JSON.stringify(trace));

  printResults('W269 code review extraction guardrails harness', results);
}

main();
