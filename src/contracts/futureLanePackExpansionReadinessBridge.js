'use strict';

const futureReadiness = require('./futureLanePackExpansionReadiness');

const FUTURE_LANE_PACK_EXPANSION_READINESS_BRIDGE_SCHEMA_VERSION = 'forge.w305.future-lane-pack-expansion-readiness-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'status',
  'readyForReview',
  'proposalIdentity.proposedPackId',
  'proposalIdentity.laneId',
  'proposalIdentity.subIndustryId',
  'proposalIdentity.label',
  'proposalIdentity.source',
  'sourcePackComparison.sourcePackFile',
  'sourcePackComparison.basePackId',
  'sourcePackComparison.candidatePackId',
  'sourcePackComparison.comparisonReady',
  'sourcePackComparison.sourcePackMutationRequested',
  'websiteCategoryEvidence.website',
  'websiteCategoryEvidence.domain',
  'websiteCategoryEvidence.category',
  'websiteCategoryEvidence.evidenceReady',
  'websiteCategoryEvidence.canOverrideWebsiteEvidence',
  'recordRoleCoverage.requiredReady',
  'recordRoleCoverage.invalidReady',
  'recordRoleCoverage.coverageReady',
  'vocabularyCoverage.coverageReady',
  'storyCopyCoverage.proofMove',
  'storyCopyCoverage.storyAnchor',
  'storyCopyCoverage.roiSoWhat',
  'storyCopyCoverage.competitiveContrast',
  'storyCopyCoverage.coverageReady',
  'storyCopyCoverage.hasGuaranteedOrMeasuredRoiClaim',
  'nllmDraftIntake.advisoryOnly',
  'nllmDraftIntake.writeAuthority',
  'nllmDraftIntake.creationAllowed',
  'nllmDraftIntake.uncertaintyVisible',
  'nllmDraftIntake.canOverrideWebsiteEvidence',
  'nllmDraftIntake.canOverrideConsultantToggles',
  'authoringReview.status',
  'authoringReview.installAllowed',
  'authoringReview.humanReviewRequired',
  'authoringReview.nllmAdvisoryOnly',
  'authoringReview.ready',
  'proposedDiff.status',
  'proposedDiff.basePackId',
  'proposedDiff.candidatePackId',
  'proposedDiff.ready',
  'adminReview.rendererReady',
  'adminReview.requiredSectionsVisible',
  'adminReview.hiddenFromNormalUi',
  'adminReview.noInstallAction',
  'adminReview.ready',
  'receiptDrivenQa.status',
  'receiptDrivenQa.ready',
  'laneResolutionCompatibility.status',
  'laneResolutionCompatibility.ready',
  'laneResolutionCompatibility.consumesFactsOnly',
  'laneResolutionCompatibility.changesLaneBehavior',
  'humanReviewGate.humanReviewRequired',
  'humanReviewGate.reviewOnly',
  'humanReviewGate.nonInstallable',
  'humanReviewGate.installAllowed',
  'humanReviewGate.autoInstall',
  'uncertaintyGate.uncertaintyVisible',
  'uncertaintyGate.weakEvidenceConfirmationRequired',
  'uncertaintyGate.weakOrConflictingEvidence',
  'uncertaintyGate.hideUncertainty',
  'consumedNotReplacedBoundary.w247AuthoringReviewConsumedNotReplaced',
  'consumedNotReplacedBoundary.w251ProposedDiffConsumedNotReplaced',
  'consumedNotReplacedBoundary.w252AdminReviewConsumedNotReplaced',
  'consumedNotReplacedBoundary.w255ReceiptDrivenQaConsumedNotReplaced',
  'consumedNotReplacedBoundary.w274WorkflowConsumedNotReplaced',
  'consumedNotReplacedBoundary.w277BridgeConsumedNotReplaced',
  'consumedNotReplacedBoundary.w300W301W302LaneReadinessConsumedNotReplaced',
  'consumedNotReplacedBoundary.w245ValidationConsumedNotReplaced',
  'consumedNotReplacedBoundary.w151ValidationConsumedNotReplaced',
  'consumedNotReplacedBoundary.w214SemanticGuardConsumedNotReplaced',
  'runtimeBoundary.noSourcePackMutation',
  'runtimeBoundary.noProposalInstall',
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
  'runtimeBoundary.noAdapterInvocation',
  'runtimeBoundary.noW245W151W214ValidityDeclaration'
]);

const ARRAY_PARITY_FIELDS = Object.freeze([
  'blockedReasons',
  'websiteCategoryEvidence.signals',
  'recordRoleCoverage.required',
  'recordRoleCoverage.optional',
  'recordRoleCoverage.invalid',
  'vocabularyCoverage.allowed',
  'vocabularyCoverage.forbidden',
  'nllmDraftIntake.allowedTasks',
  'nllmDraftIntake.hardLimits',
  'proposedDiff.changeAreas'
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

function compareArrayField(drawerOutput, contractOutput, field) {
  const drawerValue = valueAt(drawerOutput || {}, field);
  const contractValue = valueAt(contractOutput || {}, field);
  return {
    field,
    drawerValue: Array.isArray(drawerValue) ? drawerValue : [],
    contractValue: Array.isArray(contractValue) ? contractValue : [],
    fieldCompatible: arrayEqual(drawerValue, contractValue)
  };
}

function validateFutureLanePackExpansionReadiness(drawerOutput, input) {
  const contractOutput = futureReadiness.normalizeFutureLanePackExpansionReadiness(input || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerOutput || {}, contractOutput, field));
  const arrayComparisons = ARRAY_PARITY_FIELDS.map((field) => compareArrayField(drawerOutput || {}, contractOutput, field));
  const guardrails = {
    bridgeConsumesW247AuthoringReview: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w247AuthoringReviewConsumedNotReplaced),
    bridgeConsumesW251ProposedDiff: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w251ProposedDiffConsumedNotReplaced),
    bridgeConsumesW252AdminReview: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w252AdminReviewConsumedNotReplaced),
    bridgeConsumesW255ReceiptDrivenQa: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w255ReceiptDrivenQaConsumedNotReplaced),
    bridgeConsumesW274Workflow: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w274WorkflowConsumedNotReplaced),
    bridgeConsumesW277Bridge: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w277BridgeConsumedNotReplaced),
    bridgeConsumesW300W301W302Readiness: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w300W301W302LaneReadinessConsumedNotReplaced),
    bridgeConsumesW245Validation: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w245ValidationConsumedNotReplaced),
    bridgeConsumesW151Validation: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w151ValidationConsumedNotReplaced),
    bridgeConsumesW214SemanticGuard: !!(contractOutput.consumedNotReplacedBoundary && contractOutput.consumedNotReplacedBoundary.w214SemanticGuardConsumedNotReplaced),
    bridgeCannotMutateSourcePacks: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noSourcePackMutation),
    bridgeCannotInstallProposals: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noProposalInstall),
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
    bridgeCannotInvokeAdapter: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noAdapterInvocation),
    bridgeCannotDeclareW245W151W214Validity: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noW245W151W214ValidityDeclaration)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    arrayComparisons.every((item) => item.fieldCompatible) &&
    Object.keys(guardrails).every((key) => guardrails[key] === true);
  return {
    schema: 'forge.w305.future-lane-pack-expansion-readiness-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    fieldCompatible,
    fieldComparisons,
    arrayComparisons,
    sourceStatus: drawerOutput && drawerOutput.status || '',
    contractStatus: contractOutput.status,
    guardrails,
    contractOutput
  };
}

function bridgeFutureLanePackExpansionReadiness(outputs) {
  const source = outputs || {};
  const validations = [
    validateFutureLanePackExpansionReadiness(source.readyForReview && source.readyForReview.drawerOutput, source.readyForReview && source.readyForReview.input),
    validateFutureLanePackExpansionReadiness(source.needsEvidence && source.needsEvidence.drawerOutput, source.needsEvidence && source.needsEvidence.input),
    validateFutureLanePackExpansionReadiness(source.unsafeAuthority && source.unsafeAuthority.drawerOutput, source.unsafeAuthority && source.unsafeAuthority.input),
    validateFutureLanePackExpansionReadiness(source.autoInstall && source.autoInstall.drawerOutput, source.autoInstall && source.autoInstall.input),
    validateFutureLanePackExpansionReadiness(source.notReady && source.notReady.drawerOutput, source.notReady && source.notReady.input)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible').map((item) => item.sourceStatus || item.contractStatus || 'unknown');
  return {
    schema: FUTURE_LANE_PACK_EXPANSION_READINESS_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: futureReadiness.FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION,
    validations,
    failed,
    consumedNotReplacedBoundary: {
      w247AuthoringReviewConsumedNotReplaced: true,
      w251ProposedDiffConsumedNotReplaced: true,
      w252AdminReviewConsumedNotReplaced: true,
      w255ReceiptDrivenQaConsumedNotReplaced: true,
      w274WorkflowConsumedNotReplaced: true,
      w277BridgeConsumedNotReplaced: true,
      w300W301W302LaneReadinessConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    runtimeBoundary: {
      noSourcePackMutation: true,
      noProposalInstall: true,
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
      noW245W151W214ValidityDeclaration: true,
      noRuntimeDrawerImportRequired: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: FUTURE_LANE_PACK_EXPANSION_READINESS_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: futureReadiness.FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat(ARRAY_PARITY_FIELDS),
    validatesStatuses: futureReadiness.contractSummary().statuses,
    sourcePackFile: 'src/contracts/lanePacks.js',
    consumedNotReplacedBoundary: {
      w247AuthoringReviewConsumedNotReplaced: true,
      w251ProposedDiffConsumedNotReplaced: true,
      w252AdminReviewConsumedNotReplaced: true,
      w255ReceiptDrivenQaConsumedNotReplaced: true,
      w274WorkflowConsumedNotReplaced: true,
      w277BridgeConsumedNotReplaced: true,
      w300W301W302LaneReadinessConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    runtimeBoundary: {
      noSourcePackMutation: true,
      noProposalInstall: true,
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
      noW245W151W214ValidityDeclaration: true
    }
  };
}

module.exports = {
  FUTURE_LANE_PACK_EXPANSION_READINESS_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  ARRAY_PARITY_FIELDS,
  validateFutureLanePackExpansionReadiness,
  bridgeFutureLanePackExpansionReadiness,
  exportedContractSummary
};
