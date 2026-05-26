'use strict';

const laneReadiness = require('./laneResolutionReadiness');

const LANE_RESOLUTION_READINESS_BRIDGE_SCHEMA_VERSION = 'forge.w301.lane-resolution-readiness-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'status',
  'ready',
  'laneResolution.status',
  'laneResolution.packId',
  'laneResolution.confidence',
  'laneResolution.sourceAuthority',
  'laneResolution.nllmAuthority',
  'websiteEvidence.website',
  'websiteEvidence.domain',
  'websiteEvidence.category',
  'websiteEvidence.hasWebsiteEvidence',
  'websiteEvidence.hasStrongWebsiteEvidence',
  'consultantConfirmation.selectedLaneId',
  'consultantConfirmation.laneSelectionSource',
  'consultantConfirmation.laneConfirmed',
  'consultantConfirmation.togglesPresent',
  'consultantConfirmation.manufacturingEnabled',
  'consultantConfirmation.wipEnabled',
  'nllm.advisoryOnly',
  'nllm.writeAuthority',
  'nllm.creationAllowed',
  'nllm.uncertaintyVisible',
  'nllm.hardLimitsVisible',
  'nllm.canOverrideWebsiteEvidence',
  'nllm.canOverrideConsultantToggles',
  'storySurfaceInputs.storyStatus',
  'storySurfaceInputs.packId',
  'storySurfaceInputs.hasOpenTarget',
  'storySurfaceInputs.usesLaneResolution',
  'storySurfaceInputs.usesReturnedRecords',
  'laneAwareLabelFacts.source',
  'laneAwareLabelFacts.labelsReady',
  'laneAwareLabelFacts.distributionLabelsProtected',
  'laneAwareLabelFacts.manufacturingLabelsProtected',
  'expansionWorkflow.sourcePackFile',
  'expansionWorkflow.reviewOnlyProposals',
  'expansionWorkflow.noAutoInstall',
  'expansionWorkflow.advisoryOnly',
  'validationBoundary.w246ResolutionConsumedNotReplaced',
  'validationBoundary.websiteEvidenceConsumedNotReplaced',
  'validationBoundary.consultantTogglesConsumedNotReplaced',
  'validationBoundary.w250LabelsConsumedNotReplaced',
  'validationBoundary.w245ValidationConsumedNotReplaced',
  'validationBoundary.w151ValidationConsumedNotReplaced',
  'validationBoundary.w214SemanticGuardConsumedNotReplaced',
  'runtimeBoundary.noLaneChoice',
  'runtimeBoundary.noConfidenceChange',
  'runtimeBoundary.noWebsiteEvidenceOverride',
  'runtimeBoundary.noConsultantToggleOverride',
  'runtimeBoundary.noHiddenUncertainty',
  'runtimeBoundary.noUiRendering',
  'runtimeBoundary.noVisibleCopyChange',
  'runtimeBoundary.noStateMutation',
  'runtimeBoundary.noRecordImport',
  'runtimeBoundary.noRecordCreation',
  'runtimeBoundary.noTransactionWrites',
  'runtimeBoundary.noOpenLinkCreation',
  'runtimeBoundary.noAdapterInvocation'
]);

function valueAt(source, fieldPath) {
  return String(fieldPath || '').split('.').reduce((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
}

function arrayEqual(left, right) {
  const a = Array.isArray(left) ? left : [];
  const b = Array.isArray(right) ? right : [];
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function compareField(drawerOutput, contractOutput, field) {
  const drawerValue = valueAt(drawerOutput || {}, field);
  const contractValue = valueAt(contractOutput || {}, field);
  return {
    field,
    drawerValue,
    contractValue,
    fieldCompatible: drawerValue === contractValue
  };
}

function validateLaneResolutionReadiness(drawerOutput, input) {
  const contractOutput = laneReadiness.normalizeLaneResolutionReadiness(input || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerOutput || {}, contractOutput, field));
  const blockedReasonsCompatible = arrayEqual(
    drawerOutput && drawerOutput.blockedReasons,
    contractOutput.blockedReasons
  );
  const matchedSignalsCompatible = arrayEqual(
    valueAt(drawerOutput || {}, 'laneResolution.matchedSignals'),
    contractOutput.laneResolution.matchedSignals
  ) && arrayEqual(
    valueAt(drawerOutput || {}, 'websiteEvidence.matchedSignals'),
    contractOutput.websiteEvidence.matchedSignals
  );
  const guardrails = {
    bridgeConsumesW246Resolution: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w246ResolutionConsumedNotReplaced),
    bridgeConsumesWebsiteEvidence: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.websiteEvidenceConsumedNotReplaced),
    bridgeConsumesConsultantToggles: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.consultantTogglesConsumedNotReplaced),
    bridgeConsumesW250Labels: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w250LabelsConsumedNotReplaced),
    bridgeConsumesW245Validation: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w245ValidationConsumedNotReplaced),
    bridgeConsumesW151Validation: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w151ValidationConsumedNotReplaced),
    bridgeConsumesW214SemanticGuard: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w214SemanticGuardConsumedNotReplaced),
    bridgeCannotChooseLane: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noLaneChoice),
    bridgeCannotChangeConfidence: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noConfidenceChange),
    bridgeCannotOverrideWebsiteEvidence: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noWebsiteEvidenceOverride),
    bridgeCannotOverrideConsultantToggles: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noConsultantToggleOverride),
    bridgeCannotHideUncertainty: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noHiddenUncertainty),
    bridgeCannotRenderUi: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noUiRendering),
    bridgeCannotMutateState: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noStateMutation),
    bridgeCannotImportRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordImport),
    bridgeCannotCreateRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordCreation),
    bridgeCannotWriteTransactions: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noTransactionWrites),
    bridgeCannotCreateOpenLinks: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noOpenLinkCreation),
    bridgeCannotInvokeAdapter: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noAdapterInvocation)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    blockedReasonsCompatible &&
    matchedSignalsCompatible &&
    Object.keys(guardrails).every((key) => guardrails[key] === true);
  return {
    schema: 'forge.w301.lane-resolution-readiness-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    fieldCompatible,
    fieldComparisons,
    blockedReasonsCompatible,
    matchedSignalsCompatible,
    sourceStatus: drawerOutput && drawerOutput.status || '',
    contractStatus: contractOutput.status,
    guardrails,
    contractOutput
  };
}

function bridgeLaneResolutionReadiness(outputs) {
  const source = outputs || {};
  const validations = [
    validateLaneResolutionReadiness(source.ready && source.ready.drawerOutput, source.ready && source.ready.input),
    validateLaneResolutionReadiness(source.needsConfirmation && source.needsConfirmation.drawerOutput, source.needsConfirmation && source.needsConfirmation.input),
    validateLaneResolutionReadiness(source.missingWebsiteEvidence && source.missingWebsiteEvidence.drawerOutput, source.missingWebsiteEvidence && source.missingWebsiteEvidence.input),
    validateLaneResolutionReadiness(source.hiddenUncertainty && source.hiddenUncertainty.drawerOutput, source.hiddenUncertainty && source.hiddenUncertainty.input),
    validateLaneResolutionReadiness(source.notReady && source.notReady.drawerOutput, source.notReady && source.notReady.input)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible')
    .map((item) => item.sourceStatus || item.contractStatus || 'unknown');
  return {
    schema: LANE_RESOLUTION_READINESS_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION,
    validations,
    failed,
    validationBoundary: {
      w246ResolutionConsumedNotReplaced: true,
      websiteEvidenceConsumedNotReplaced: true,
      consultantTogglesConsumedNotReplaced: true,
      w250LabelsConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    runtimeBoundary: {
      noLaneChoice: true,
      noConfidenceChange: true,
      noWebsiteEvidenceOverride: true,
      noConsultantToggleOverride: true,
      noHiddenUncertainty: true,
      noUiRendering: true,
      noVisibleCopyChange: true,
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noAdapterInvocation: true,
      noRuntimeDrawerImportRequired: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: LANE_RESOLUTION_READINESS_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: laneReadiness.LANE_RESOLUTION_READINESS_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat([
      'blockedReasons',
      'laneResolution.matchedSignals',
      'websiteEvidence.matchedSignals'
    ]),
    validatesStatuses: laneReadiness.contractSummary().statuses,
    validationBoundary: {
      w246ResolutionConsumedNotReplaced: true,
      websiteEvidenceConsumedNotReplaced: true,
      consultantTogglesConsumedNotReplaced: true,
      w250LabelsConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    runtimeBoundary: {
      noLaneChoice: true,
      noConfidenceChange: true,
      noWebsiteEvidenceOverride: true,
      noConsultantToggleOverride: true,
      noHiddenUncertainty: true,
      noUiRendering: true,
      noVisibleCopyChange: true,
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noAdapterInvocation: true
    }
  };
}

module.exports = {
  LANE_RESOLUTION_READINESS_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  validateLaneResolutionReadiness,
  bridgeLaneResolutionReadiness,
  exportedContractSummary
};
