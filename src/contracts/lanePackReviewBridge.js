'use strict';

const workflow = require('./lanePackExpansionWorkflow');

const LANE_PACK_REVIEW_BRIDGE_SCHEMA_VERSION = 'forge.w277.lane-pack-review-bridge.v1';

const BRIDGE_PACKET_SHAPES = Object.freeze({
  W247_AUTHORING_REVIEW: 'W247_AUTHORING_REVIEW',
  W251_PROPOSED_CHANGE_DIFF: 'W251_PROPOSED_CHANGE_DIFF',
  W252_ADMIN_REVIEW_RENDERER: 'W252_ADMIN_REVIEW_RENDERER',
  W255_RECEIPT_DRIVEN_QA: 'W255_RECEIPT_DRIVEN_QA',
  REVIEW_ONLY_PROPOSED_PACK: 'REVIEW_ONLY_PROPOSED_PACK'
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
  if (Array.isArray(target.requiredReviewCopyFields)) {
    const copy = source.reviewCopy || {};
    return target.requiredReviewCopyFields.filter((field) => !(typeof copy[field] === 'string' && copy[field].trim()));
  }
  if (Array.isArray(target.requiredChangeAreas)) {
    const areas = arrayValue(source.changes).map((change) => change && change.area).filter(Boolean);
    return target.requiredChangeAreas.filter((area) => areas.indexOf(area) < 0);
  }
  if (Array.isArray(target.requiredCheckIds)) {
    const ids = arrayValue(source.checks).map((check) => check && check.id).filter(Boolean);
    return target.requiredCheckIds.filter((id) => ids.indexOf(id) < 0);
  }
  return [];
}

function validateAdminReviewPacket(shapeName, packet) {
  const contractShape = workflow.shape(shapeName);
  const source = packet || {};
  const expectedSchema = contractShape && contractShape.schema || '';
  const schemaMatches = expectedSchema ? source.schema === expectedSchema : true;
  const matchesContract = shapeName === BRIDGE_PACKET_SHAPES.W252_ADMIN_REVIEW_RENDERER
    ? workflow.reviewRendererMatchesShape(String(packet || ''), contractShape)
    : !!(contractShape && workflow.packetMatchesShape(source, contractShape));
  return {
    schema: 'forge.w277.admin-review-packet-validation.v1',
    shapeName,
    sourceSchema: source.schema || '',
    expectedSchema,
    matchesContract,
    schemaMatches,
    requiredMissing: missingFields(source, contractShape),
    status: matchesContract ? 'field_compatible' : 'needs_attention'
  };
}

function normalizeAdminReviewPacket(shapeName, packet, options = {}) {
  const validation = validateAdminReviewPacket(shapeName, packet);
  const proposal = options.proposal || null;
  const review = options.review || packet || null;
  const renderedHtml = options.renderedHtml || '';
  const guardrailCheck = proposal
    ? workflow.expansionGuardrailCheck(proposal, review && review.schema ? review : options.review)
    : null;
  const reviewOnly = proposal
    ? workflow.proposedPackIsReviewOnly(proposal, review, renderedHtml)
    : true;
  const status = validation.matchesContract && (!guardrailCheck || guardrailCheck.status === 'pass') && reviewOnly
    ? 'bridge_ready'
    : 'bridge_needs_attention';
  return {
    schema: 'forge.w277.admin-review-packet-bridge.v1',
    shapeName,
    sourceSchema: validation.sourceSchema,
    status,
    validation,
    expansionGuardrailCheck: guardrailCheck,
    reviewOnlyNonInstallable: reviewOnly,
    normalizedPacket: typeof packet === 'string' ? packet : clone(packet || {}),
    governingContract: workflow.LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
    guardrails: {
      adminOnlyReviewOnly: true,
      sourcePackChanged: false,
      proposedPacksInstalled: false,
      normalConsultantUiChanged: false,
      laneResolutionChanged: false,
      connectedSubmitRefreshImportChanged: false,
      returnedRecordImportChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      nllmAdvisoryOnly: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true
    }
  };
}

function bridgeLanePackReviewPackets(packets) {
  const source = packets || {};
  const authoringReview = source.w247AuthoringReview;
  const proposedDiff = source.w251ProposedChangeDiff;
  const adminReviewHtml = source.w252AdminReviewHtml;
  const receiptQa = source.w255ReceiptDrivenQa;
  const proposedPack = source.proposedLanePack;
  const proposedPackReview = source.proposedLanePackReview || authoringReview;
  const proposedPackReviewHtml = source.proposedLanePackReviewHtml || adminReviewHtml;
  const entries = [
    Object.assign({ id: 'w247AuthoringReview' },
      normalizeAdminReviewPacket(BRIDGE_PACKET_SHAPES.W247_AUTHORING_REVIEW, authoringReview, {
        proposal: proposedPack,
        review: authoringReview,
        renderedHtml: adminReviewHtml
      })),
    Object.assign({ id: 'w251ProposedChangeDiff' },
      normalizeAdminReviewPacket(BRIDGE_PACKET_SHAPES.W251_PROPOSED_CHANGE_DIFF, proposedDiff)),
    Object.assign({ id: 'w252AdminReviewHtml' },
      normalizeAdminReviewPacket(BRIDGE_PACKET_SHAPES.W252_ADMIN_REVIEW_RENDERER, adminReviewHtml)),
    Object.assign({ id: 'w255ReceiptDrivenQa' },
      normalizeAdminReviewPacket(BRIDGE_PACKET_SHAPES.W255_RECEIPT_DRIVEN_QA, receiptQa)),
    {
      id: 'reviewOnlyProposedPack',
      schema: 'forge.w277.review-only-proposed-pack-bridge.v1',
      shapeName: BRIDGE_PACKET_SHAPES.REVIEW_ONLY_PROPOSED_PACK,
      status: workflow.proposedPackIsReviewOnly(proposedPack, proposedPackReview, proposedPackReviewHtml)
        ? 'bridge_ready'
        : 'bridge_needs_attention',
      reviewOnlyNonInstallable: workflow.proposedPackIsReviewOnly(proposedPack, proposedPackReview, proposedPackReviewHtml),
      allowedProposalSchema: workflow.shape(BRIDGE_PACKET_SHAPES.REVIEW_ONLY_PROPOSED_PACK)
        ? workflow.shape(BRIDGE_PACKET_SHAPES.REVIEW_ONLY_PROPOSED_PACK).allowedProposalSchemas.indexOf(proposedPack && proposedPack.schema) >= 0
        : false,
      normalizedPacket: clone(proposedPack || {}),
      guardrails: {
        adminOnlyReviewOnly: true,
        proposedPacksInstalled: false,
        nllmAdvisoryOnly: true,
        noWriteAuthority: true,
        noRecordCreation: true
      }
    }
  ];
  const failed = entries.filter((entry) => entry.status !== 'bridge_ready');
  return {
    schema: LANE_PACK_REVIEW_BRIDGE_SCHEMA_VERSION,
    status: failed.length ? 'bridge_needs_attention' : 'bridge_ready',
    entries,
    failedPacketIds: failed.map((entry) => entry.id),
    governingContract: workflow.LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
    sourcePackFile: workflow.exportedContractSummary().sourcePackFile,
    guardrails: {
      adminOnlyReviewOnly: true,
      rawProposalEvidenceArchivedAdminOnly: true,
      sourcePackChanged: false,
      proposedPacksInstalled: false,
      normalConsultantUiChanged: false,
      laneResolutionChanged: false,
      connectedSubmitRefreshImportChanged: false,
      returnedRecordImportChanged: false,
      adapterEndpointProfileChanged: false,
      recordCreationAuthorityChanged: false,
      weakEvidenceConfirmationFirst: true,
      nllmAdvisoryOnly: true,
      noDrawerCreatedRecords: true,
      noDrawerTransactionWrites: true,
      noW144DeploymentUpdateInThisBlock: true
    }
  };
}

function expansionGuardrailCheck(proposal, review) {
  return workflow.expansionGuardrailCheck(proposal, review);
}

function proposedPackIsReviewOnly(proposal, review, renderedHtml) {
  return workflow.proposedPackIsReviewOnly(proposal, review, renderedHtml);
}

function exportedContractSummary() {
  return {
    schema: LANE_PACK_REVIEW_BRIDGE_SCHEMA_VERSION,
    governingContract: workflow.LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
    packetShapes: clone(BRIDGE_PACKET_SHAPES),
    sourcePackFile: workflow.exportedContractSummary().sourcePackFile,
    guardrails: {
      adminOnlyReviewOnly: true,
      sourcePackChanged: false,
      proposedPacksInstalled: false,
      normalConsultantUiChanged: false,
      laneResolutionChanged: false,
      recordCreationAuthorityChanged: false,
      nllmAdvisoryOnly: true
    }
  };
}

module.exports = {
  LANE_PACK_REVIEW_BRIDGE_SCHEMA_VERSION,
  BRIDGE_PACKET_SHAPES,
  validateAdminReviewPacket,
  normalizeAdminReviewPacket,
  bridgeLanePackReviewPackets,
  expansionGuardrailCheck,
  proposedPackIsReviewOnly,
  exportedContractSummary
};
