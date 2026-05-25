'use strict';

const liveEvidence = require('./liveEvidencePackets');

const LIVE_EVIDENCE_SIGNOFF_BRIDGE_SCHEMA_VERSION = 'forge.w276.live-evidence-signoff-bridge.v1';

const BRIDGE_PACKET_SHAPES = Object.freeze({
  W260_INSTALL_READY_RELEASE_PACKET: 'W260_INSTALL_READY_RELEASE_PACKET',
  W261_POST_INSTALL_SMOKE_CAPTURE: 'W261_POST_INSTALL_SMOKE_CAPTURE',
  W266_CONTROLLED_LIVE_BUILD_RUN: 'W266_CONTROLLED_LIVE_BUILD_RUN',
  W267_SCREENSHOT_RECONCILIATION: 'W267_SCREENSHOT_RECONCILIATION',
  W268_INSTALLED_DRAWER_INTAKE: 'W268_INSTALLED_DRAWER_INTAKE',
  W268_RELEASE_KEEP_PACKET: 'W268_RELEASE_KEEP_PACKET'
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

function missingFields(packet, shape) {
  const source = packet || {};
  const target = shape || {};
  if (Array.isArray(target.requiredFields)) {
    return target.requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(source, field));
  }
  if (Array.isArray(target.requiredFieldIds)) {
    const ids = (Array.isArray(source.fields) ? source.fields : []).map((field) => field.id);
    return target.requiredFieldIds.filter((id) => ids.indexOf(id) < 0);
  }
  if (Array.isArray(target.requiredEvidenceRowIds)) {
    const ids = (Array.isArray(source.reviewerEvidenceRows) ? source.reviewerEvidenceRows : []).map((row) => row.id);
    return target.requiredEvidenceRowIds.filter((id) => ids.indexOf(id) < 0);
  }
  if (Array.isArray(target.requiredMapsToW267)) {
    const ids = (Array.isArray(source.evidenceFields) ? source.evidenceFields : []).map((field) => field.mapsToW267);
    return target.requiredMapsToW267.filter((id) => ids.indexOf(id) < 0);
  }
  return [];
}

function validateReviewOnlyPacket(shapeName, packet) {
  const shape = liveEvidence.contractShape(shapeName);
  const source = packet || {};
  const schemaMatches = !!(shape && source.schema === shape.schema);
  const requiredMissing = missingFields(source, shape);
  const matchesContract = !!(shape && liveEvidence.packetMatchesContractShape(source, shape));
  return {
    schema: 'forge.w276.review-only-packet-validation.v1',
    shapeName,
    sourceSchema: source.schema || '',
    expectedSchema: shape ? shape.schema : '',
    matchesContract,
    schemaMatches,
    requiredMissing,
    status: matchesContract ? 'field_compatible' : 'needs_attention'
  };
}

function normalizeReviewOnlyPacket(shapeName, packet) {
  const validation = validateReviewOnlyPacket(shapeName, packet);
  const policy = liveEvidence.reviewOnlyPolicy(packet && packet.reviewOnlyPolicy ? packet.reviewOnlyPolicy : {});
  return {
    schema: 'forge.w276.review-only-packet-bridge.v1',
    shapeName,
    sourceSchema: validation.sourceSchema,
    status: validation.matchesContract && liveEvidence.isReviewOnlyPolicySafe(policy)
      ? 'bridge_ready'
      : 'bridge_needs_attention',
    validation,
    reviewOnlyPolicy: policy,
    reviewOnlyPolicySafe: liveEvidence.isReviewOnlyPolicySafe(policy),
    normalizedPacket: clone(packet || {}),
    guardrails: {
      reviewOnlyAdminOnly: true,
      normalConsultantUiChanged: false,
      connectedSubmitRefreshImportChanged: false,
      laneResolutionChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true
    }
  };
}

function bridgeReviewOnlyPackets(packets) {
  const source = packets || {};
  const entries = [
    ['w260InstallReadyReleasePacket', BRIDGE_PACKET_SHAPES.W260_INSTALL_READY_RELEASE_PACKET, source.w260InstallReadyReleasePacket],
    ['w261PostInstallSmokeCapture', BRIDGE_PACKET_SHAPES.W261_POST_INSTALL_SMOKE_CAPTURE, source.w261PostInstallSmokeCapture],
    ['w266ControlledLiveBuildRun', BRIDGE_PACKET_SHAPES.W266_CONTROLLED_LIVE_BUILD_RUN, source.w266ControlledLiveBuildRun],
    ['w267ScreenshotReconciliation', BRIDGE_PACKET_SHAPES.W267_SCREENSHOT_RECONCILIATION, source.w267ScreenshotReconciliation],
    ['w268InstalledDrawerIntake', BRIDGE_PACKET_SHAPES.W268_INSTALLED_DRAWER_INTAKE, source.w268InstalledDrawerIntake],
    ['w268ReleaseKeepPacket', BRIDGE_PACKET_SHAPES.W268_RELEASE_KEEP_PACKET, source.w268ReleaseKeepPacket]
  ].map(([id, shapeName, packet]) => Object.assign({ id }, normalizeReviewOnlyPacket(shapeName, packet)));
  const failed = entries.filter((entry) => entry.status !== 'bridge_ready');
  return {
    schema: LIVE_EVIDENCE_SIGNOFF_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    entries,
    failedPacketIds: failed.map((entry) => entry.id),
    governingContract: liveEvidence.LIVE_EVIDENCE_SCHEMA_VERSION,
    reviewOnlyPolicy: liveEvidence.reviewOnlyPolicy(),
    guardrails: {
      reviewOnlyAdminOnly: true,
      rawEvidenceArchivedAdminOnly: true,
      normalConsultantUiChanged: false,
      connectedSubmitRefreshImportChanged: false,
      returnedRecordImportChanged: false,
      laneResolutionChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdateInThisBlock: true
    }
  };
}

function releaseSignoffFromEvidence(capture, fields) {
  return liveEvidence.releaseSignoffFromEvidence(capture, fields);
}

function liveRunDecision(evidence) {
  return liveEvidence.liveRunDecision(evidence);
}

function openLinkVerificationCapture(records, reviewerOpenLinks) {
  return liveEvidence.openLinkVerificationCapture(records, reviewerOpenLinks);
}

function screenshotSignoff(reconciliation) {
  return liveEvidence.screenshotSignoff(reconciliation);
}

function exportedContractSummary() {
  return {
    schema: LIVE_EVIDENCE_SIGNOFF_BRIDGE_SCHEMA_VERSION,
    governingContract: liveEvidence.LIVE_EVIDENCE_SCHEMA_VERSION,
    packetShapes: clone(BRIDGE_PACKET_SHAPES),
    signoffStatuses: clone(liveEvidence.SIGNOFF_STATUSES),
    guardrails: {
      reviewOnlyAdminOnly: true,
      normalConsultantUiChanged: false,
      connectedSubmitRefreshImportChanged: false,
      laneResolutionChanged: false,
      recordCreationAuthorityChanged: false
    }
  };
}

module.exports = {
  LIVE_EVIDENCE_SIGNOFF_BRIDGE_SCHEMA_VERSION,
  BRIDGE_PACKET_SHAPES,
  validateReviewOnlyPacket,
  normalizeReviewOnlyPacket,
  bridgeReviewOnlyPackets,
  releaseSignoffFromEvidence,
  liveRunDecision,
  openLinkVerificationCapture,
  screenshotSignoff,
  exportedContractSummary
};
