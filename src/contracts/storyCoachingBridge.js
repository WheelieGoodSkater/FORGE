'use strict';

const storyContracts = require('./storyCoachingSurfaces');

const STORY_COACHING_BRIDGE_SCHEMA_VERSION = 'forge.w278.story-coaching-bridge.v1';

const BRIDGE_PACKET_SHAPES = Object.freeze({
  W254_EVIDENCE_RECEIPT: 'W254_EVIDENCE_RECEIPT',
  W255_FIRST_GLANCE: 'W255_FIRST_GLANCE',
  W256_LIVE_DEMO_SCRIPT: 'W256_LIVE_DEMO_SCRIPT',
  W257_GUIDED_SEQUENCE: 'W257_GUIDED_SEQUENCE'
});

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = clone(value[key]);
      return acc;
    }, {});
  }
  return value;
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function missingFields(packet, contractShape) {
  const source = packet || {};
  const target = contractShape || {};
  if (Array.isArray(target.requiredFields)) {
    return target.requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(source, field));
  }
  if (Array.isArray(target.requiredRowIds)) {
    const ids = arrayValue(source.rows).map((row) => row && row.id).filter(Boolean);
    return target.requiredRowIds.filter((id) => ids.indexOf(id) < 0);
  }
  if (Array.isArray(target.requiredLineKeys)) {
    const lines = source.lines || {};
    return target.requiredLineKeys.filter((key) => !(typeof lines[key] === 'string' && lines[key].trim()));
  }
  if (Array.isArray(target.requiredStepIds)) {
    const ids = arrayValue(source.steps).map((step) => step && step.id).filter(Boolean);
    return target.requiredStepIds.filter((id) => ids.indexOf(id) < 0);
  }
  return [];
}

function validateStoryPacket(shapeName, packet) {
  const contractShape = storyContracts.shape(shapeName);
  const source = packet || {};
  const matchesContract = !!(contractShape && storyContracts.packetMatchesShape(source, contractShape));
  return {
    schema: 'forge.w278.story-packet-validation.v1',
    shapeName,
    sourceSchema: source.schema || '',
    expectedSchema: contractShape && contractShape.schema || '',
    schemaMatches: contractShape && contractShape.schema ? source.schema === contractShape.schema : true,
    matchesContract,
    requiredMissing: missingFields(source, contractShape),
    status: matchesContract ? 'field_compatible' : 'needs_attention'
  };
}

function normalizeStoryPacket(shapeName, packet, options = {}) {
  const validation = validateStoryPacket(shapeName, packet);
  const guardrailCheck = options.skipGuardrailCheck
    ? null
    : storyContracts.consultantSafeGuardrailCheck(packet, options.guardrailOptions || {});
  const receiptVisibility = shapeName === BRIDGE_PACKET_SHAPES.W254_EVIDENCE_RECEIPT
    ? storyContracts.receiptVisibilityStatus(packet, options.hasValidImport === true)
    : null;
  const guardrailsPass = !guardrailCheck || guardrailCheck.status === 'pass';
  return {
    schema: 'forge.w278.story-packet-bridge.v1',
    shapeName,
    sourceSchema: validation.sourceSchema,
    status: validation.matchesContract && guardrailsPass ? 'bridge_ready' : 'bridge_needs_attention',
    validation,
    consultantSafeGuardrailCheck: guardrailCheck,
    receiptVisibility,
    normalizedPacket: clone(packet || {}),
    governingContract: storyContracts.STORY_COACHING_SCHEMA_VERSION,
    guardrails: {
      consultantFacingSurfaceOnly: true,
      normalConsultantUiChanged: false,
      visibleReviewRunCopyChanged: false,
      returnedRecordBehaviorChanged: false,
      openLinkAuthorityChanged: false,
      weakEvidenceConfirmationFirst: true,
      connectedSubmitRefreshImportChanged: false,
      laneResolutionChanged: false,
      recordCreationAuthorityChanged: false,
      nllmAdvisoryOnly: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true
    }
  };
}

function bridgeStoryCoachingSurfaces(surfaces, options = {}) {
  const source = surfaces || {};
  const entries = [
    Object.assign({ id: 'w254EvidenceReceipt' },
      normalizeStoryPacket(BRIDGE_PACKET_SHAPES.W254_EVIDENCE_RECEIPT, source.w254EvidenceReceipt, {
        hasValidImport: options.hasValidImport === true,
        skipGuardrailCheck: true
      })),
    Object.assign({ id: 'w255FirstGlance' },
      normalizeStoryPacket(BRIDGE_PACKET_SHAPES.W255_FIRST_GLANCE, source.w255FirstGlance, { skipGuardrailCheck: true })),
    Object.assign({ id: 'w256LiveDemoScript' },
      normalizeStoryPacket(BRIDGE_PACKET_SHAPES.W256_LIVE_DEMO_SCRIPT, source.w256LiveDemoScript, { skipGuardrailCheck: true })),
    Object.assign({ id: 'w257GuidedSequence' },
      normalizeStoryPacket(BRIDGE_PACKET_SHAPES.W257_GUIDED_SEQUENCE, source.w257GuidedSequence, { skipGuardrailCheck: true }))
  ];
  const failed = entries.filter((entry) => entry.status !== 'bridge_ready');
  return {
    schema: STORY_COACHING_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    entries,
    failedPacketIds: failed.map((entry) => entry.id),
    governingContract: storyContracts.STORY_COACHING_SCHEMA_VERSION,
    guardrails: {
      consultantFacingSurfaceOnly: true,
      normalConsultantUiChanged: false,
      visibleReviewRunCopyChanged: false,
      returnedRecordBehaviorChanged: false,
      openLinkAuthorityChanged: false,
      weakEvidenceConfirmationFirst: true,
      connectedSubmitRefreshImportChanged: false,
      laneResolutionChanged: false,
      recordCreationAuthorityChanged: false,
      nllmAdvisoryOnly: true,
      uncertaintyVisible: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdateInThisBlock: true
    }
  };
}

function consultantSafeGuardrailCheck(surface, options) {
  return storyContracts.consultantSafeGuardrailCheck(surface, options);
}

function receiptVisibilityStatus(receipt, hasValidImport) {
  return storyContracts.receiptVisibilityStatus(receipt, hasValidImport);
}

function exportedContractSummary() {
  return {
    schema: STORY_COACHING_BRIDGE_SCHEMA_VERSION,
    governingContract: storyContracts.STORY_COACHING_SCHEMA_VERSION,
    packetShapes: clone(BRIDGE_PACKET_SHAPES),
    guardrails: {
      normalConsultantUiChanged: false,
      visibleReviewRunCopyChanged: false,
      returnedRecordBehaviorChanged: false,
      openLinkAuthorityChanged: false,
      weakEvidenceConfirmationFirst: true,
      connectedSubmitRefreshImportChanged: false,
      laneResolutionChanged: false,
      recordCreationAuthorityChanged: false,
      nllmAdvisoryOnly: true
    }
  };
}

module.exports = {
  STORY_COACHING_BRIDGE_SCHEMA_VERSION,
  BRIDGE_PACKET_SHAPES,
  validateStoryPacket,
  normalizeStoryPacket,
  bridgeStoryCoachingSurfaces,
  consultantSafeGuardrailCheck,
  receiptVisibilityStatus,
  exportedContractSummary
};
