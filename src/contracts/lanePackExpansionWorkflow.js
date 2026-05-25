'use strict';

const LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION = 'forge.w274.lane-pack-expansion-workflow.v1';

const LANE_PACK_EXPANSION_SHAPES = Object.freeze({
  W247_AUTHORING_REVIEW: Object.freeze({
    schema: 'forge.lane-pack-authoring-review.v1',
    requiredFields: Object.freeze([
      'status',
      'installAllowed',
      'humanReviewRequired',
      'nllmAdvisoryOnly',
      'errors',
      'warnings',
      'candidatePackId',
      'proposedChangeDiff',
      'reviewCopy'
    ]),
    requiredReviewCopyFields: Object.freeze(['headline', 'summary', 'installGuidance'])
  }),
  W251_PROPOSED_CHANGE_DIFF: Object.freeze({
    schema: 'forge.lane-pack-proposed-change-diff.v1',
    requiredFields: Object.freeze(['status', 'basePackId', 'candidatePackId', 'changes']),
    requiredChangeAreas: Object.freeze([
      'websiteSignals',
      'recordRoles',
      'vocabulary',
      'liveDemo'
    ])
  }),
  W252_ADMIN_REVIEW_RENDERER: Object.freeze({
    requiredSections: Object.freeze([
      'Evidence changes',
      'Record-role changes',
      'Vocabulary changes',
      'Story, ROI, and competitive copy',
      'N/LLM authority and uncertainty'
    ]),
    requiredCopy: Object.freeze([
      'Lane-pack review',
      'No install action',
      'N/LLM advisory only'
    ]),
    forbiddenCopy: Object.freeze([
      'Install lane pack',
      'data-idb-install',
      'raw JSON',
      'stack trace'
    ])
  }),
  W255_RECEIPT_DRIVEN_QA: Object.freeze({
    schema: 'forge.w255.receipt-driven-lane-expansion-qa.v1',
    requiredFields: Object.freeze(['status', 'packId', 'checks']),
    requiredCheckIds: Object.freeze([
      'lane_choice_explained',
      'open_target_explained',
      'proof_evidence_explained',
      'notes_contribution_explained',
      'nllm_limits_explained',
      'uncertainty_explained'
    ])
  }),
  REVIEW_ONLY_PROPOSED_PACK: Object.freeze({
    allowedProposalSchemas: Object.freeze([
      'forge.lane-pack-authoring-proposal.v1',
      'forge.w255.proposed-lane-pack-receipt-fixture.v1'
    ]),
    requiredReviewStatus: 'review_ready',
    installAllowed: false,
    nllmAdvisoryOnly: true
  })
});

const EXPANSION_GUARDRAILS = Object.freeze([
  'N/LLM advisory-only',
  'no auto-install',
  'no write authority',
  'no record creation',
  'no hiding uncertainty',
  'no overriding website evidence',
  'no overriding consultant toggles',
  'no guaranteed or measured ROI claims'
]);

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function shape(name) {
  return LANE_PACK_EXPANSION_SHAPES[name] || null;
}

function hasOwn(source, field) {
  return Object.prototype.hasOwnProperty.call(source || {}, field);
}

function packetMatchesShape(packet, contractShape) {
  const source = packet || {};
  const target = contractShape || {};
  if (target.schema && source.schema !== target.schema) return false;
  if (Array.isArray(target.requiredFields) && !target.requiredFields.every((field) => hasOwn(source, field))) return false;
  if (Array.isArray(target.requiredReviewCopyFields)) {
    const copy = source.reviewCopy || {};
    if (!target.requiredReviewCopyFields.every((field) => typeof copy[field] === 'string' && copy[field].trim())) return false;
  }
  if (Array.isArray(target.requiredChangeAreas)) {
    const areas = arrayValue(source.changes).map((change) => change && change.area).filter(Boolean);
    if (!target.requiredChangeAreas.every((area) => areas.indexOf(area) >= 0)) return false;
  }
  if (Array.isArray(target.requiredCheckIds)) {
    const ids = arrayValue(source.checks).map((check) => check && check.id).filter(Boolean);
    if (!target.requiredCheckIds.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  return true;
}

function reviewRendererMatchesShape(html, contractShape) {
  const source = String(html || '');
  const target = contractShape || LANE_PACK_EXPANSION_SHAPES.W252_ADMIN_REVIEW_RENDERER;
  return arrayValue(target.requiredSections).every((section) => source.indexOf(section) >= 0) &&
    arrayValue(target.requiredCopy).every((copy) => source.indexOf(copy) >= 0) &&
    arrayValue(target.forbiddenCopy).every((copy) => source.indexOf(copy) === -1);
}

function collectProposalText(proposal) {
  const candidate = proposal && proposal.candidatePack || {};
  const liveDemo = candidate.liveDemo || {};
  const nllm = candidate.nllmAdvisory || {};
  return [
    liveDemo.proofMove,
    liveDemo.storyAnchor,
    liveDemo.roiSoWhat,
    liveDemo.competitiveContrast,
    nllm.uncertaintyPolicy,
    arrayValue(nllm.allowedTasks).join(' '),
    arrayValue(nllm.hardLimits).join(' ')
  ].filter(Boolean).join(' ');
}

function expansionGuardrailCheck(proposal, review) {
  const candidate = proposal && proposal.candidatePack || {};
  const nllm = candidate.nllmAdvisory || {};
  const hardLimits = arrayValue(nllm.hardLimits);
  const text = collectProposalText(proposal);
  const violations = [];
  if (proposal && proposal.autoInstall === true) violations.push('auto_install_forbidden');
  if (nllm.writeAuthority && nllm.writeAuthority !== 'none') violations.push('write_authority_forbidden');
  if (nllm.creationAllowed !== undefined && nllm.creationAllowed !== false) violations.push('record_creation_forbidden');
  if (/hide_uncertainty|hide uncertainty|without uncertainty/i.test(text) || nllm.uncertaintyPolicy !== undefined && nllm.uncertaintyPolicy !== 'surface_uncertainty_and_request_confirmation') {
    violations.push('hidden_uncertainty_forbidden');
  }
  if (hardLimits.indexOf('cannotOverrideWebsiteEvidence') === -1 || proposal && proposal.overrideWebsiteEvidence === true) {
    violations.push('website_evidence_override_forbidden');
  }
  if (hardLimits.indexOf('cannotOverrideConsultantToggles') === -1 || proposal && proposal.overrideConsultantToggles === true) {
    violations.push('consultant_toggle_override_forbidden');
  }
  if (/guarantee|guaranteed|measured roi|will increase|will reduce/i.test(text)) {
    violations.push('guaranteed_or_measured_roi_forbidden');
  }
  if (review && review.installAllowed !== false) violations.push('install_must_remain_false');
  if (review && review.nllmAdvisoryOnly !== true) violations.push('nllm_advisory_only_required');
  return {
    schema: 'forge.w274.expansion-guardrail-check.v1',
    status: violations.length ? 'rejected' : 'pass',
    violations
  };
}

function proposedPackIsReviewOnly(proposal, review, renderedHtml) {
  const fixtureSchemaAllowed = LANE_PACK_EXPANSION_SHAPES.REVIEW_ONLY_PROPOSED_PACK.allowedProposalSchemas.indexOf(proposal && proposal.schema) >= 0;
  const noInstallHtml = !/data-idb-install|Install lane pack/i.test(String(renderedHtml || ''));
  return Boolean(
    fixtureSchemaAllowed &&
      review &&
      review.status === LANE_PACK_EXPANSION_SHAPES.REVIEW_ONLY_PROPOSED_PACK.requiredReviewStatus &&
      review.installAllowed === false &&
      review.nllmAdvisoryOnly === true &&
      noInstallHtml
  );
}

function exportedContractSummary() {
  return {
    schema: LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
    shapes: LANE_PACK_EXPANSION_SHAPES,
    guardrails: EXPANSION_GUARDRAILS,
    sourcePackFile: 'src/contracts/lanePacks.js'
  };
}

module.exports = {
  LANE_PACK_EXPANSION_WORKFLOW_SCHEMA_VERSION,
  LANE_PACK_EXPANSION_SHAPES,
  EXPANSION_GUARDRAILS,
  shape,
  packetMatchesShape,
  reviewRendererMatchesShape,
  expansionGuardrailCheck,
  proposedPackIsReviewOnly,
  exportedContractSummary
};
