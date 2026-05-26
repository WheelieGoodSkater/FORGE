'use strict';

const eligibility = require('./completedResultImportEligibility');

const COMPLETED_RESULT_IMPORT_ELIGIBILITY_BRIDGE_SCHEMA_VERSION = 'forge.w288.completed-result-import-eligibility-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'status',
  'finishBuildEligible',
  'openLinkPreconditionsReady',
  'wordingPreservation.w218SuccessWordingPreserved',
  'wordingPreservation.w220RecoveryWordingPreserved',
  'rawEvidencePolicy.adminOnly',
  'rawEvidencePolicy.archivedOnly',
  'rawEvidencePolicy.hiddenFromNormalConsultantUi',
  'validationBoundary.w151ValidationConsumedNotReplaced',
  'validationBoundary.w214SemanticGuardConsumedNotReplaced',
  'validationBoundary.w245NormalizationConsumedNotReplaced',
  'runtimeBoundary.noStateMutation',
  'runtimeBoundary.noRecordImport',
  'runtimeBoundary.noRecordCreation',
  'runtimeBoundary.noTransactionWrites',
  'runtimeBoundary.noOpenLinkCreation',
  'runtimeBoundary.finishBuildMutationStaysDrawerOwned'
]);

function valueAt(source, path) {
  return String(path || '').split('.').reduce((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
}

function arrayEqual(left, right) {
  const a = Array.isArray(left) ? left : [];
  const b = Array.isArray(right) ? right : [];
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function compareField(drawerEligibility, contractEligibility, field) {
  const drawerValue = valueAt(drawerEligibility || {}, field);
  const contractValue = valueAt(contractEligibility || {}, field);
  return {
    field,
    drawerValue,
    contractValue,
    fieldCompatible: drawerValue === contractValue
  };
}

function validateCompletedResultImportEligibility(drawerEligibility, facts) {
  const contractEligibility = eligibility.evaluateCompletedResultImportEligibility(facts || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerEligibility || {}, contractEligibility, field));
  const blockedReasonsCompatible = arrayEqual(
    drawerEligibility && drawerEligibility.blockedReasons,
    contractEligibility.blockedReasons
  );
  const guardrails = {
    w151ConsumedNotReplaced: !!(contractEligibility.validationBoundary && contractEligibility.validationBoundary.w151ValidationConsumedNotReplaced),
    w214ConsumedNotReplaced: !!(contractEligibility.validationBoundary && contractEligibility.validationBoundary.w214SemanticGuardConsumedNotReplaced),
    w245ConsumedNotReplaced: !!(contractEligibility.validationBoundary && contractEligibility.validationBoundary.w245NormalizationConsumedNotReplaced),
    bridgeCannotMutateState: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.noStateMutation),
    bridgeCannotImportRecords: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.noRecordImport),
    bridgeCannotCreateRecords: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.noRecordCreation),
    bridgeCannotWriteTransactions: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.noTransactionWrites),
    bridgeCannotCreateOpenLinks: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.noOpenLinkCreation),
    finishBuildMutationStaysDrawerOwned: !!(contractEligibility.runtimeBoundary && contractEligibility.runtimeBoundary.finishBuildMutationStaysDrawerOwned)
  };
  const rawEvidencePolicy = {
    drawerAdminOnly: !!(drawerEligibility && drawerEligibility.rawEvidencePolicy && drawerEligibility.rawEvidencePolicy.adminOnly),
    drawerArchivedOnly: !!(drawerEligibility && drawerEligibility.rawEvidencePolicy && drawerEligibility.rawEvidencePolicy.archivedOnly),
    drawerHiddenFromNormalConsultantUi: !!(drawerEligibility && drawerEligibility.rawEvidencePolicy && drawerEligibility.rawEvidencePolicy.hiddenFromNormalConsultantUi),
    contractAdminOnly: !!(contractEligibility.rawEvidencePolicy && contractEligibility.rawEvidencePolicy.adminOnly),
    contractArchivedOnly: !!(contractEligibility.rawEvidencePolicy && contractEligibility.rawEvidencePolicy.archivedOnly),
    contractHiddenFromNormalConsultantUi: !!(contractEligibility.rawEvidencePolicy && contractEligibility.rawEvidencePolicy.hiddenFromNormalConsultantUi)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    blockedReasonsCompatible &&
    Object.keys(guardrails).every((key) => guardrails[key] === true) &&
    Object.keys(rawEvidencePolicy).every((key) => rawEvidencePolicy[key] === true);
  return {
    schema: 'forge.w288.completed-result-import-eligibility-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    fieldCompatible,
    fieldComparisons,
    blockedReasonsCompatible,
    sourceStatus: drawerEligibility && drawerEligibility.status || '',
    contractStatus: contractEligibility.status,
    guardrails,
    rawEvidencePolicy,
    contractEligibility
  };
}

function bridgeCompletedResultImportEligibility(outputs) {
  const source = outputs || {};
  const validations = [
    validateCompletedResultImportEligibility(source.eligible && source.eligible.drawerEligibility, source.eligible && source.eligible.facts),
    validateCompletedResultImportEligibility(source.missingCompleted && source.missingCompleted.drawerEligibility, source.missingCompleted && source.missingCompleted.facts),
    validateCompletedResultImportEligibility(source.w151Rejected && source.w151Rejected.drawerEligibility, source.w151Rejected && source.w151Rejected.facts),
    validateCompletedResultImportEligibility(source.w214Blocked && source.w214Blocked.drawerEligibility, source.w214Blocked && source.w214Blocked.facts),
    validateCompletedResultImportEligibility(source.w245NotReady && source.w245NotReady.drawerEligibility, source.w245NotReady && source.w245NotReady.facts),
    validateCompletedResultImportEligibility(source.finishBuildBlocked && source.finishBuildBlocked.drawerEligibility, source.finishBuildBlocked && source.finishBuildBlocked.facts)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible').map((item) => item.sourceStatus || item.contractStatus || 'unknown');
  return {
    schema: COMPLETED_RESULT_IMPORT_ELIGIBILITY_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: eligibility.COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION,
    validations,
    failed,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245NormalizationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      finishBuildMutationStaysDrawerOwned: true,
      noRuntimeDrawerImportRequired: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: COMPLETED_RESULT_IMPORT_ELIGIBILITY_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: eligibility.COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat(['blockedReasons']),
    validatesStatuses: eligibility.contractSummary().statuses,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245NormalizationConsumedNotReplaced: true,
      bridgeCannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      finishBuildMutationStaysDrawerOwned: true
    }
  };
}

module.exports = {
  COMPLETED_RESULT_IMPORT_ELIGIBILITY_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  validateCompletedResultImportEligibility,
  bridgeCompletedResultImportEligibility,
  exportedContractSummary
};
