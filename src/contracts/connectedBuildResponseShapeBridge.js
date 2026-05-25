'use strict';

const responseShapes = require('./connectedBuildResponseShapes');

const CONNECTED_BUILD_RESPONSE_SHAPE_BRIDGE_SCHEMA_VERSION = 'forge.w284.connected-build-response-shape-bridge.v1';

const PARITY_FIELDS = Object.freeze([
  'schema',
  'phase',
  'status',
  'runnerTaskId',
  'idempotencyToken',
  'resultCaptureStatus',
  'finalGeneratedNamesJsonLocation',
  'finalGeneratedNamesJsonReady',
  'adapterSafeErrorCopy',
  'normalUiCopy'
]);

function valueAt(source, path) {
  return String(path || '').split('.').reduce((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
}

function compareField(drawerShape, contractShape, field) {
  const drawerValue = valueAt(drawerShape, field);
  const contractValue = valueAt(contractShape, field);
  return {
    field,
    drawerValue,
    contractValue,
    fieldCompatible: drawerValue === contractValue
  };
}

function validateResponseShape(drawerShape, rawResponse, options) {
  const contractShape = responseShapes.normalizeResponseShape(rawResponse || {}, options || {});
  const fieldComparisons = PARITY_FIELDS.map((field) => compareField(drawerShape || {}, contractShape, field));
  const normalizedStatusComparison = compareField(drawerShape || {}, contractShape, 'normalizedResponse.status');
  const rawEvidencePolicy = {
    drawerAdminOnly: !!(drawerShape && drawerShape.rawEvidence && drawerShape.rawEvidence.adminOnly),
    drawerArchivedOnly: !!(drawerShape && drawerShape.rawEvidence && drawerShape.rawEvidence.archivedOnly),
    contractAdminOnly: !!(contractShape.rawEvidence && contractShape.rawEvidence.adminOnly),
    contractArchivedOnly: !!(contractShape.rawEvidence && contractShape.rawEvidence.archivedOnly),
    hiddenFromNormalConsultantUi: !!(drawerShape && drawerShape.guardrails && drawerShape.guardrails.normalUiHidesRawEvidence) &&
      !!(contractShape.guardrails && contractShape.guardrails.normalUiHidesRawEvidence)
  };
  const guardrails = {
    drawerRequiresW245W151Validation: !!(drawerShape && drawerShape.guardrails && drawerShape.guardrails.w245W151ValidationStillRequired),
    contractRequiresW245W151Validation: !!(contractShape.guardrails && contractShape.guardrails.w245W151ValidationStillRequired),
    contractCannotDeclareImportValid: !!(contractShape.guardrails && contractShape.guardrails.cannotDeclareImportValid),
    noDrawerCreatedRecords: !!(contractShape.guardrails && contractShape.guardrails.noDrawerCreatedRecords),
    noDrawerTransactionWrites: !!(contractShape.guardrails && contractShape.guardrails.noDrawerTransactionWrites)
  };
  const fieldCompatible = fieldComparisons.every((item) => item.fieldCompatible) &&
    normalizedStatusComparison.fieldCompatible &&
    rawEvidencePolicy.drawerAdminOnly &&
    rawEvidencePolicy.drawerArchivedOnly &&
    rawEvidencePolicy.contractAdminOnly &&
    rawEvidencePolicy.contractArchivedOnly &&
    rawEvidencePolicy.hiddenFromNormalConsultantUi &&
    guardrails.drawerRequiresW245W151Validation &&
    guardrails.contractRequiresW245W151Validation &&
    guardrails.contractCannotDeclareImportValid;
  return {
    schema: 'forge.w284.connected-build-response-shape-validation.v1',
    status: fieldCompatible ? 'field_compatible' : 'needs_attention',
    phase: contractShape.phase,
    sourceStatus: drawerShape && drawerShape.status || '',
    contractStatus: contractShape.status,
    fieldCompatible,
    fieldComparisons,
    normalizedStatusComparison,
    rawEvidencePolicy,
    guardrails,
    contractShape
  };
}

function bridgeResponseShapes(outputs) {
  const source = outputs || {};
  const validations = [
    validateResponseShape(source.submit && source.submit.drawerShape, source.submit && source.submit.rawResponse, source.submit && source.submit.options),
    validateResponseShape(source.pendingRefresh && source.pendingRefresh.drawerShape, source.pendingRefresh && source.pendingRefresh.rawResponse, source.pendingRefresh && source.pendingRefresh.options),
    validateResponseShape(source.completedRefresh && source.completedRefresh.drawerShape, source.completedRefresh && source.completedRefresh.rawResponse, source.completedRefresh && source.completedRefresh.options),
    validateResponseShape(source.malformedOrError && source.malformedOrError.drawerShape, source.malformedOrError && source.malformedOrError.rawResponse, source.malformedOrError && source.malformedOrError.options)
  ];
  const failed = validations.filter((item) => item.status !== 'field_compatible').map((item) => item.phase || item.sourceStatus || 'unknown');
  return {
    schema: CONNECTED_BUILD_RESPONSE_SHAPE_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    governingContract: responseShapes.CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION,
    actualShapeSchema: responseShapes.ACTUAL_ADAPTER_RESPONSE_SHAPE_SCHEMA,
    validations,
    failed,
    validationBoundary: {
      w151OwnsImportValidity: true,
      w214OwnsSemanticGuard: true,
      w245OwnsCanonicalImportNormalization: true,
      bridgeCannotDeclareImportValid: true
    },
    runtimeBoundary: {
      noSubmitExecutionMoved: true,
      noRefreshExecutionMoved: true,
      noRuntimeDrawerImportRequired: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdate: true
    }
  };
}

function exportedContractSummary() {
  return {
    schema: CONNECTED_BUILD_RESPONSE_SHAPE_BRIDGE_SCHEMA_VERSION,
    status: 'bridge_contract_ready',
    governingContract: responseShapes.CONNECTED_BUILD_RESPONSE_SHAPE_SCHEMA_VERSION,
    comparedFields: PARITY_FIELDS.slice().concat(['normalizedResponse.status']),
    validatesShapes: [
      'submit_response_shape',
      'pending_refresh_response_shape',
      'completed_refresh_response_shape',
      'malformed_error_refresh_response_shape'
    ],
    validationBoundary: {
      w151OwnsImportValidity: true,
      w214OwnsSemanticGuard: true,
      w245OwnsCanonicalImportNormalization: true,
      bridgeCannotDeclareImportValid: true
    }
  };
}

module.exports = {
  CONNECTED_BUILD_RESPONSE_SHAPE_BRIDGE_SCHEMA_VERSION,
  PARITY_FIELDS,
  validateResponseShape,
  bridgeResponseShapes,
  exportedContractSummary
};
