'use strict';

const displayReady = require('./returnedRecordDisplayReadyImport');

const RETURNED_RECORD_DISPLAY_READY_IMPORT_BRIDGE_SCHEMA_VERSION = 'forge.w292.returned-record-display-ready-import-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'status',
  'displayReady',
  'importFacts.w245ImportValid',
  'importFacts.w245ValidationConsumedNotReplaced',
  'importFacts.w151ValidationConsumedNotReplaced',
  'importFacts.w214SemanticGuardConsumedNotReplaced',
  'openLinkAuthority.allVisibleRecordsHaveNumericIds',
  'openLinkAuthority.allVisibleRecordsHaveSupportedOpenUrls',
  'openLinkAuthority.allVisibleRecordsSafeToOpen',
  'runtimeBoundary.noStateMutation',
  'runtimeBoundary.noRecordImport',
  'runtimeBoundary.noRecordCreation',
  'runtimeBoundary.noTransactionWrites',
  'runtimeBoundary.noOpenLinkCreation',
  'runtimeBoundary.noUiRendering',
  'runtimeBoundary.finishBuildMutationStaysDrawerOwned'
]);

const RECORD_PARITY_FIELDS = Object.freeze([
  'canonicalRole',
  'consultantLabel',
  'recordName',
  'netSuiteRecordType',
  'numericInternalId',
  'supportedOpenUrl',
  'linkAuthorityStatus',
  'sourceConfidence',
  'normalConsultantVisible',
  'laneAwareLabelSource',
  'evidenceGuardrailSource',
  'safeToOpen'
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

function compareRecord(drawerRecord, contractRecord, index) {
  const fieldComparisons = RECORD_PARITY_FIELDS.map((field) => compareField(drawerRecord || {}, contractRecord || {}, field));
  return {
    index,
    fieldCompatible: fieldComparisons.every((item) => item.fieldCompatible),
    fieldComparisons
  };
}

function compareRecords(drawerRecords, contractRecords) {
  const left = Array.isArray(drawerRecords) ? drawerRecords : [];
  const right = Array.isArray(contractRecords) ? contractRecords : [];
  const lengthCompatible = left.length === right.length;
  const comparisons = left.map((record, index) => compareRecord(record, right[index], index));
  return {
    lengthCompatible,
    comparisons,
    recordsCompatible: lengthCompatible && comparisons.every((item) => item.fieldCompatible)
  };
}

function validateReturnedRecordDisplayReadyImport(drawerOutput, input) {
  const contractOutput = displayReady.evaluateReturnedRecordDisplayReadyImport(input || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerOutput || {}, contractOutput, field));
  const blockedReasonsCompatible = arrayEqual(
    drawerOutput && drawerOutput.blockedReasons,
    contractOutput.blockedReasons
  );
  const records = compareRecords(drawerOutput && drawerOutput.records, contractOutput.records);
  const visibleRecords = compareRecords(drawerOutput && drawerOutput.visibleRecords, contractOutput.visibleRecords);
  const hiddenRecords = compareRecords(drawerOutput && drawerOutput.hiddenRecords, contractOutput.hiddenRecords);
  const guardrails = {
    w151ConsumedNotReplaced: !!(contractOutput.importFacts && contractOutput.importFacts.w151ValidationConsumedNotReplaced),
    w214ConsumedNotReplaced: !!(contractOutput.importFacts && contractOutput.importFacts.w214SemanticGuardConsumedNotReplaced),
    w245ConsumedNotReplaced: !!(contractOutput.importFacts && contractOutput.importFacts.w245ValidationConsumedNotReplaced),
    bridgeCannotMutateState: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noStateMutation),
    bridgeCannotImportRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordImport),
    bridgeCannotCreateRecords: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noRecordCreation),
    bridgeCannotWriteTransactions: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noTransactionWrites),
    bridgeCannotCreateOpenLinks: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noOpenLinkCreation),
    bridgeCannotRenderUi: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.noUiRendering),
    finishBuildMutationStaysDrawerOwned: !!(contractOutput.runtimeBoundary && contractOutput.runtimeBoundary.finishBuildMutationStaysDrawerOwned)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    blockedReasonsCompatible &&
    records.recordsCompatible &&
    visibleRecords.recordsCompatible &&
    hiddenRecords.recordsCompatible &&
    Object.keys(guardrails).every((key) => guardrails[key] === true);
  return {
    schema: 'forge.w292.returned-record-display-ready-import-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    fieldCompatible,
    fieldComparisons,
    blockedReasonsCompatible,
    records,
    visibleRecords,
    hiddenRecords,
    sourceStatus: drawerOutput && drawerOutput.status || '',
    contractStatus: contractOutput.status,
    guardrails,
    contractOutput
  };
}

function bridgeReturnedRecordDisplayReadyImport(outputs) {
  const source = outputs || {};
  const validations = [
    validateReturnedRecordDisplayReadyImport(source.valid && source.valid.drawerOutput, source.valid && source.valid.input),
    validateReturnedRecordDisplayReadyImport(source.invalidId && source.invalidId.drawerOutput, source.invalidId && source.invalidId.input),
    validateReturnedRecordDisplayReadyImport(source.unsupportedUrl && source.unsupportedUrl.drawerOutput, source.unsupportedUrl && source.unsupportedUrl.input),
    validateReturnedRecordDisplayReadyImport(source.hiddenInternal && source.hiddenInternal.drawerOutput, source.hiddenInternal && source.hiddenInternal.input),
    validateReturnedRecordDisplayReadyImport(source.missingRecords && source.missingRecords.drawerOutput, source.missingRecords && source.missingRecords.input),
    validateReturnedRecordDisplayReadyImport(source.notImportValid && source.notImportValid.drawerOutput, source.notImportValid && source.notImportValid.input)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible').map((item) => item.sourceStatus || item.contractStatus || 'unknown');
  return {
    schema: RETURNED_RECORD_DISPLAY_READY_IMPORT_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: displayReady.RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION,
    validations,
    failed,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noUiRendering: true,
      finishBuildMutationStaysDrawerOwned: true,
      noRuntimeDrawerImportRequired: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: RETURNED_RECORD_DISPLAY_READY_IMPORT_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: displayReady.RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat(['blockedReasons', 'records', 'visibleRecords', 'hiddenRecords']),
    comparedRecordFields: RECORD_PARITY_FIELDS.slice(),
    validatesStatuses: displayReady.contractSummary().statuses,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noUiRendering: true,
      finishBuildMutationStaysDrawerOwned: true
    }
  };
}

module.exports = {
  RETURNED_RECORD_DISPLAY_READY_IMPORT_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  RECORD_PARITY_FIELDS,
  validateReturnedRecordDisplayReadyImport,
  bridgeReturnedRecordDisplayReadyImport,
  exportedContractSummary
};
