'use strict';

const COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION = 'forge.w287.completed-result-import-eligibility.v1';

const IMPORT_ELIGIBILITY_STATUSES = Object.freeze({
  MISSING_COMPLETED_RESULT: 'missing_completed_result',
  W151_REJECTED: 'w151_rejected',
  W214_SEMANTIC_BLOCKED: 'w214_semantic_blocked',
  W245_NORMALIZATION_NOT_READY: 'w245_normalization_not_ready',
  FINISH_BUILD_ELIGIBLE: 'finish_build_eligible',
  FINISH_BUILD_BLOCKED: 'finish_build_blocked'
});

const REQUIRED_INPUTS = Object.freeze([
  'completedResultJsonPresent',
  'w151ValidationStatus',
  'w214SemanticGuardStatus',
  'w245CanonicalNormalizationReady',
  'generatedRecordOwner',
  'governedRunnerOwnerValid',
  'finishBuildCtaEligible',
  'openLinkPreconditions',
  'w218SuccessWordingPreserved',
  'w220RecoveryWordingPreserved',
  'rawEvidencePolicy'
]);

function bool(value) {
  return value === true;
}

function stringValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function factsFromInput(input) {
  const source = input || {};
  const w151 = source.w151 || source.w151Guard || source.completedGuard || {};
  const w214 = source.w214 || source.w214Guard || source.semanticGuard || {};
  const w245 = source.w245 || source.w245Normalization || source.normalizedImport || {};
  const owner = stringValue(source.generatedRecordOwner || source.recordOwner || source.owner);
  const openLinks = source.openLinkPreconditions || {};
  const rawEvidence = source.rawEvidencePolicy || {};
  return {
    completedResultJsonPresent: bool(source.completedResultJsonPresent) || !!source.completedResultJson,
    w151ValidationStatus: stringValue(source.w151ValidationStatus || w151.status),
    w151Valid: bool(source.w151Valid) || bool(w151.valid) || source.w151ValidationStatus === 'completed_runner_result_accepted',
    w214SemanticGuardStatus: stringValue(source.w214SemanticGuardStatus || w214.status),
    w214Valid: bool(source.w214Valid) || bool(w214.valid),
    w245CanonicalNormalizationReady: bool(source.w245CanonicalNormalizationReady) ||
      bool(w245.ready) ||
      w245.status === 'display_ready_records_normalized',
    w245NormalizationStatus: stringValue(source.w245NormalizationStatus || w245.status),
    generatedRecordOwner: owner,
    governedRunnerOwnerValid: bool(source.governedRunnerOwnerValid) || owner === 'governed_runner_internal_build_engine',
    finishBuildCtaEligible: bool(source.finishBuildCtaEligible),
    openLinkPreconditions: {
      realUrlsOnly: bool(openLinks.realUrlsOnly),
      numericInternalIds: bool(openLinks.numericInternalIds),
      supportedNetSuiteUrls: bool(openLinks.supportedNetSuiteUrls),
      fakeLinksBlockedBeforeImport: openLinks.fakeLinksBlockedBeforeImport !== false
    },
    w218SuccessWordingPreserved: source.w218SuccessWordingPreserved !== false,
    w220RecoveryWordingPreserved: source.w220RecoveryWordingPreserved !== false,
    rawEvidencePolicy: {
      adminOnly: rawEvidence.adminOnly !== false,
      archivedOnly: rawEvidence.archivedOnly !== false,
      hiddenFromNormalConsultantUi: rawEvidence.hiddenFromNormalConsultantUi !== false
    }
  };
}

function openLinkPreconditionsReady(preconditions) {
  const checks = preconditions || {};
  return bool(checks.realUrlsOnly) &&
    bool(checks.numericInternalIds) &&
    bool(checks.supportedNetSuiteUrls) &&
    checks.fakeLinksBlockedBeforeImport !== false;
}

function statusForFacts(facts) {
  if (!facts.completedResultJsonPresent) return IMPORT_ELIGIBILITY_STATUSES.MISSING_COMPLETED_RESULT;
  if (!facts.w151Valid) return IMPORT_ELIGIBILITY_STATUSES.W151_REJECTED;
  if (!facts.w214Valid) return IMPORT_ELIGIBILITY_STATUSES.W214_SEMANTIC_BLOCKED;
  if (!facts.w245CanonicalNormalizationReady) return IMPORT_ELIGIBILITY_STATUSES.W245_NORMALIZATION_NOT_READY;
  if (
    facts.finishBuildCtaEligible &&
    facts.governedRunnerOwnerValid &&
    openLinkPreconditionsReady(facts.openLinkPreconditions)
  ) {
    return IMPORT_ELIGIBILITY_STATUSES.FINISH_BUILD_ELIGIBLE;
  }
  return IMPORT_ELIGIBILITY_STATUSES.FINISH_BUILD_BLOCKED;
}

function blockedReasonsForFacts(facts, status) {
  const reasons = [];
  if (!facts.completedResultJsonPresent) reasons.push('completed_result_json_missing');
  if (facts.completedResultJsonPresent && !facts.w151Valid) reasons.push('w151_validation_not_accepted');
  if (facts.w151Valid && !facts.w214Valid) reasons.push('w214_semantic_guard_not_accepted');
  if (facts.w214Valid && !facts.w245CanonicalNormalizationReady) reasons.push('w245_canonical_normalization_not_ready');
  if (facts.w245CanonicalNormalizationReady && !facts.governedRunnerOwnerValid) reasons.push('generated_record_owner_not_governed_runner');
  if (facts.w245CanonicalNormalizationReady && !facts.finishBuildCtaEligible) reasons.push('finish_build_cta_not_eligible');
  if (facts.w245CanonicalNormalizationReady && !openLinkPreconditionsReady(facts.openLinkPreconditions)) reasons.push('open_link_preconditions_not_ready');
  if (status === IMPORT_ELIGIBILITY_STATUSES.FINISH_BUILD_ELIGIBLE) return [];
  return reasons.length ? reasons : ['finish_build_blocked'];
}

function evaluateCompletedResultImportEligibility(input) {
  const facts = factsFromInput(input);
  const status = statusForFacts(facts);
  const finishBuildEligible = status === IMPORT_ELIGIBILITY_STATUSES.FINISH_BUILD_ELIGIBLE;
  return {
    schema: COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION,
    status,
    finishBuildEligible,
    blockedReasons: blockedReasonsForFacts(facts, status),
    requiredInputs: REQUIRED_INPUTS.slice(),
    facts,
    openLinkPreconditionsReady: openLinkPreconditionsReady(facts.openLinkPreconditions),
    wordingPreservation: {
      w218SuccessWordingPreserved: facts.w218SuccessWordingPreserved,
      w220RecoveryWordingPreserved: facts.w220RecoveryWordingPreserved
    },
    rawEvidencePolicy: facts.rawEvidencePolicy,
    validationBoundary: {
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      w245NormalizationConsumedNotReplaced: true,
      moduleCannotDeclareImportValidWithoutSuppliedFacts: true
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

function contractSummary() {
  return {
    schema: COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION,
    status: 'contract_ready',
    statuses: Object.keys(IMPORT_ELIGIBILITY_STATUSES).map((key) => IMPORT_ELIGIBILITY_STATUSES[key]),
    requiredInputs: REQUIRED_INPUTS.slice(),
    selectedFromW286: 'completed_result_import_eligibility_contract_w287',
    futureBridge: 'src/contracts/completedResultImportEligibilityBridge.js',
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
  COMPLETED_RESULT_IMPORT_ELIGIBILITY_SCHEMA_VERSION,
  IMPORT_ELIGIBILITY_STATUSES,
  REQUIRED_INPUTS,
  evaluateCompletedResultImportEligibility,
  contractSummary
};
