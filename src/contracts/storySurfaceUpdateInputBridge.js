'use strict';

const storyInputs = require('./storySurfaceUpdateInputs');

const STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION = 'forge.w296.story-surface-update-input-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'status',
  'ready',
  'returnedRecordFacts.status',
  'returnedRecordFacts.displayReady',
  'returnedRecordFacts.visibleRecordCount',
  'returnedRecordFacts.openTargetRecordName',
  'lanePack.packId',
  'lanePack.laneLabel',
  'lanePack.confidence',
  'laneAwareLabelSource',
  'openLinkAuthority.allVisibleRecordsHaveNumericIds',
  'openLinkAuthority.allVisibleRecordsHaveSupportedOpenUrls',
  'openLinkAuthority.allVisibleRecordsSafeToOpen',
  'receiptInputs.ready',
  'firstGlanceInputs.ready',
  'scriptInputs.ready',
  'sequenceInputs.ready',
  'weakEvidence.confirmationRequired',
  'weakEvidence.weakEvidence',
  'weakEvidence.conflictingEvidence',
  'nllm.advisoryOnly',
  'nllm.writeAuthority',
  'nllm.creationAllowed',
  'nllm.uncertaintyVisible',
  'nllm.hardLimitsVisible',
  'validationBoundary.w245ValidationConsumedNotReplaced',
  'validationBoundary.w151ValidationConsumedNotReplaced',
  'validationBoundary.w214SemanticGuardConsumedNotReplaced',
  'validationBoundary.cannotDeclareImportValidWithoutSuppliedFacts',
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

function validateStorySurfaceUpdateInputs(drawerOutput, input) {
  const contractOutput = storyInputs.normalizeStorySurfaceUpdateInputs(input || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerOutput || {}, contractOutput, field));
  const blockedReasonsCompatible = arrayEqual(
    drawerOutput && drawerOutput.blockedReasons,
    contractOutput.blockedReasons
  );
  const receiptRowsCompatible = arrayEqual(
    valueAt(drawerOutput || {}, 'receiptInputs.requiredRowIds'),
    contractOutput.receiptInputs.requiredRowIds
  );
  const firstGlanceFieldsCompatible = arrayEqual(
    valueAt(drawerOutput || {}, 'firstGlanceInputs.requiredFields'),
    contractOutput.firstGlanceInputs.requiredFields
  );
  const scriptLinesCompatible = arrayEqual(
    valueAt(drawerOutput || {}, 'scriptInputs.requiredLineKeys'),
    contractOutput.scriptInputs.requiredLineKeys
  );
  const sequenceStepsCompatible = arrayEqual(
    valueAt(drawerOutput || {}, 'sequenceInputs.requiredStepIds'),
    contractOutput.sequenceInputs.requiredStepIds
  );
  const guardrails = {
    w151ConsumedNotReplaced: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w151ValidationConsumedNotReplaced),
    w214ConsumedNotReplaced: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w214SemanticGuardConsumedNotReplaced),
    w245ConsumedNotReplaced: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.w245ValidationConsumedNotReplaced),
    bridgeCannotDeclareImportValidity: !!(contractOutput.validationBoundary && contractOutput.validationBoundary.cannotDeclareImportValidWithoutSuppliedFacts),
    bridgeCannotRenderUi: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noUiRendering),
    bridgeCannotChangeVisibleCopy: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noVisibleCopyChange),
    bridgeCannotMutateState: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noStateMutation),
    bridgeCannotImportRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordImport),
    bridgeCannotCreateRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordCreation),
    bridgeCannotWriteTransactions: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noTransactionWrites),
    bridgeCannotCreateOpenLinks: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noOpenLinkCreation),
    bridgeCannotInvokeAdapter: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noAdapterInvocation)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    blockedReasonsCompatible &&
    receiptRowsCompatible &&
    firstGlanceFieldsCompatible &&
    scriptLinesCompatible &&
    sequenceStepsCompatible &&
    Object.keys(guardrails).every((key) => guardrails[key] === true);
  return {
    schema: 'forge.w296.story-surface-update-input-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    fieldCompatible,
    fieldComparisons,
    blockedReasonsCompatible,
    receiptRowsCompatible,
    firstGlanceFieldsCompatible,
    scriptLinesCompatible,
    sequenceStepsCompatible,
    sourceStatus: drawerOutput && drawerOutput.status || '',
    contractStatus: contractOutput.status,
    guardrails,
    contractOutput
  };
}

function bridgeStorySurfaceUpdateInputs(outputs) {
  const source = outputs || {};
  const validations = [
    validateStorySurfaceUpdateInputs(source.ready && source.ready.drawerOutput, source.ready && source.ready.input),
    validateStorySurfaceUpdateInputs(source.waitingForImport && source.waitingForImport.drawerOutput, source.waitingForImport && source.waitingForImport.input),
    validateStorySurfaceUpdateInputs(source.needsConfirmation && source.needsConfirmation.drawerOutput, source.needsConfirmation && source.needsConfirmation.input),
    validateStorySurfaceUpdateInputs(source.missingOpenTarget && source.missingOpenTarget.drawerOutput, source.missingOpenTarget && source.missingOpenTarget.input),
    validateStorySurfaceUpdateInputs(source.hiddenUncertainty && source.hiddenUncertainty.drawerOutput, source.hiddenUncertainty && source.hiddenUncertainty.input)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible').map((item) => item.sourceStatus || item.contractStatus || 'unknown');
  return {
    schema: STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: storyInputs.STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION,
    validations,
    failed,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
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
    schema: STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: storyInputs.STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat([
      'blockedReasons',
      'receiptInputs.requiredRowIds',
      'firstGlanceInputs.requiredFields',
      'scriptInputs.requiredLineKeys',
      'sequenceInputs.requiredStepIds'
    ]),
    validatesStatuses: storyInputs.contractSummary().statuses,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
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
  STORY_SURFACE_UPDATE_INPUT_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  validateStorySurfaceUpdateInputs,
  bridgeStorySurfaceUpdateInputs,
  exportedContractSummary
};
