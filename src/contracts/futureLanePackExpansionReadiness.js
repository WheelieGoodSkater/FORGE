'use strict';

const FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION = 'forge.w304.future-lane-pack-expansion-readiness.v1';

const FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES = Object.freeze({
  READY_FOR_REVIEW: 'future_lane_pack_expansion_ready_for_review',
  NEEDS_EVIDENCE: 'future_lane_pack_expansion_needs_evidence',
  BLOCKED_UNSAFE_AUTHORITY: 'future_lane_pack_expansion_blocked_unsafe_authority',
  BLOCKED_AUTO_INSTALL: 'future_lane_pack_expansion_blocked_auto_install',
  NOT_READY: 'future_lane_pack_expansion_not_ready'
});

const REQUIRED_FACT_FIELDS = Object.freeze([
  'proposalIdentity',
  'sourcePackComparison',
  'websiteCategoryEvidence',
  'recordRoleCoverage',
  'vocabularyCoverage',
  'storyCopyCoverage',
  'nllmDraftIntake',
  'authoringReview',
  'proposedDiff',
  'adminReview',
  'receiptDrivenQa',
  'laneResolutionCompatibility',
  'humanReviewGate',
  'uncertaintyGate'
]);

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function stringValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function hasText(value) {
  return !!stringValue(value).trim();
}

function firstObject(...candidates) {
  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || {};
}

function trueUnlessFalse(value) {
  return value !== false;
}

function proposalIdentityFacts(source) {
  const proposal = firstObject(source.proposalIdentity, source.proposal, source.candidatePack);
  return {
    proposedPackId: stringValue(proposal.proposedPackId || proposal.candidatePackId || proposal.packId || source.proposedPackId),
    laneId: stringValue(proposal.laneId || source.laneId),
    subIndustryId: stringValue(proposal.subIndustryId || proposal.subIndustry || source.subIndustryId),
    label: stringValue(proposal.label || proposal.name || source.label),
    source: stringValue(proposal.source || source.proposalSource || 'human_or_nllm_draft')
  };
}

function sourcePackComparisonFacts(source) {
  const comparison = firstObject(source.sourcePackComparison, source.comparison, source.proposedDiff);
  return {
    sourcePackFile: stringValue(comparison.sourcePackFile || source.sourcePackFile || 'src/contracts/lanePacks.js'),
    basePackId: stringValue(comparison.basePackId || source.basePackId),
    candidatePackId: stringValue(comparison.candidatePackId || source.candidatePackId),
    comparisonReady: comparison.comparisonReady === true || hasText(comparison.basePackId) || hasText(comparison.candidatePackId),
    sourcePackMutationRequested: comparison.sourcePackMutationRequested === true || source.sourcePackMutationRequested === true
  };
}

function websiteCategoryEvidenceFacts(source) {
  const evidence = firstObject(source.websiteCategoryEvidence, source.websiteEvidence, source.evidence);
  const signals = arrayValue(evidence.signals || evidence.matchedSignals || source.matchedSignals);
  return {
    website: stringValue(evidence.website || source.website),
    domain: stringValue(evidence.domain || evidence.websiteDomain || source.websiteDomain),
    category: stringValue(evidence.category || evidence.categoryText || source.category),
    signals,
    evidenceReady: evidence.evidenceReady === true || hasText(evidence.website) || hasText(evidence.domain) || hasText(evidence.category) || signals.length > 0,
    canOverrideWebsiteEvidence: evidence.canOverrideWebsiteEvidence === true || source.canOverrideWebsiteEvidence === true
  };
}

function recordRoleCoverageFacts(source) {
  const roles = firstObject(source.recordRoleCoverage, source.recordRoles, source.roles);
  const required = arrayValue(roles.required);
  const optional = arrayValue(roles.optional);
  const invalid = arrayValue(roles.invalid || roles.forbidden);
  return {
    required,
    optional,
    invalid,
    requiredReady: required.length > 0,
    invalidReady: invalid.length > 0,
    coverageReady: roles.coverageReady === true || required.length > 0 && invalid.length > 0
  };
}

function vocabularyCoverageFacts(source) {
  const vocabulary = firstObject(source.vocabularyCoverage, source.vocabulary);
  const allowed = arrayValue(vocabulary.allowed);
  const forbidden = arrayValue(vocabulary.forbidden || vocabulary.invalid);
  return {
    allowed,
    forbidden,
    coverageReady: vocabulary.coverageReady === true || allowed.length > 0 && forbidden.length > 0
  };
}

function storyCopyCoverageFacts(source) {
  const story = firstObject(source.storyCopyCoverage, source.story, source.liveDemo);
  const text = [
    story.proofMove,
    story.storyAnchor,
    story.roiSoWhat,
    story.competitiveContrast
  ].map(stringValue).join(' ');
  return {
    proofMove: stringValue(story.proofMove),
    storyAnchor: stringValue(story.storyAnchor),
    roiSoWhat: stringValue(story.roiSoWhat),
    competitiveContrast: stringValue(story.competitiveContrast),
    coverageReady: story.coverageReady === true ||
      hasText(story.proofMove) &&
      hasText(story.storyAnchor) &&
      hasText(story.roiSoWhat) &&
      hasText(story.competitiveContrast),
    hasGuaranteedOrMeasuredRoiClaim: /guarantee|guaranteed|measured roi|will increase|will reduce/i.test(text)
  };
}

function nllmDraftIntakeFacts(source) {
  const nllm = firstObject(source.nllmDraftIntake, source.nllm, source.nllmAdvisory);
  const hardLimits = arrayValue(nllm.hardLimits || nllm.limits);
  return {
    advisoryOnly: nllm.advisoryOnly === true || /advisory/i.test(stringValue(nllm.role || nllm.authority)),
    writeAuthority: stringValue(nllm.writeAuthority || source.nllmWriteAuthority || 'none'),
    creationAllowed: nllm.creationAllowed === true || source.nllmCreationAllowed === true,
    allowedTasks: arrayValue(nllm.allowedTasks),
    hardLimits,
    uncertaintyVisible: nllm.uncertaintyVisible === true || hasText(nllm.uncertainty) || source.uncertaintyVisible === true,
    canOverrideWebsiteEvidence: nllm.canOverrideWebsiteEvidence === true || source.nllmCanOverrideWebsiteEvidence === true,
    canOverrideConsultantToggles: nllm.canOverrideConsultantToggles === true || source.nllmCanOverrideConsultantToggles === true
  };
}

function authoringReviewFacts(source) {
  const review = firstObject(source.authoringReview, source.w247AuthoringReview, source.review);
  return {
    status: stringValue(review.status),
    installAllowed: review.installAllowed === true,
    humanReviewRequired: review.humanReviewRequired === true,
    nllmAdvisoryOnly: review.nllmAdvisoryOnly === true,
    ready: review.status === 'review_ready' && review.humanReviewRequired === true && review.nllmAdvisoryOnly === true && review.installAllowed !== true
  };
}

function proposedDiffFacts(source) {
  const diff = firstObject(source.proposedDiff, source.w251ProposedDiff, source.diff);
  const changes = arrayValue(diff.changes);
  const areas = changes.map((change) => change && change.area).filter(Boolean);
  return {
    status: stringValue(diff.status),
    basePackId: stringValue(diff.basePackId),
    candidatePackId: stringValue(diff.candidatePackId),
    changeAreas: areas,
    ready: changes.length > 0 && ['websiteSignals', 'recordRoles', 'vocabulary', 'liveDemo'].every((area) => areas.indexOf(area) >= 0)
  };
}

function adminReviewFacts(source) {
  const review = firstObject(source.adminReview, source.w252AdminReview);
  return {
    rendererReady: review.rendererReady === true || review.status === 'review_rendered',
    requiredSectionsVisible: review.requiredSectionsVisible === true,
    hiddenFromNormalUi: review.hiddenFromNormalUi !== false,
    noInstallAction: review.noInstallAction !== false,
    ready: (review.rendererReady === true || review.status === 'review_rendered') &&
      review.requiredSectionsVisible === true &&
      review.hiddenFromNormalUi !== false &&
      review.noInstallAction !== false
  };
}

function receiptDrivenQaFacts(source) {
  const qa = firstObject(source.receiptDrivenQa, source.w255ReceiptDrivenQa);
  const checks = arrayValue(qa.checks);
  const ids = checks.map((check) => check && check.id).filter(Boolean);
  return {
    status: stringValue(qa.status),
    checks,
    ready: qa.status === 'qa_ready' || [
      'lane_choice_explained',
      'open_target_explained',
      'proof_evidence_explained',
      'notes_contribution_explained',
      'nllm_limits_explained',
      'uncertainty_explained'
    ].every((id) => ids.indexOf(id) >= 0)
  };
}

function laneResolutionCompatibilityFacts(source) {
  const readiness = firstObject(source.laneResolutionCompatibility, source.laneResolutionReadiness, source.w300Readiness);
  return {
    status: stringValue(readiness.status),
    ready: readiness.ready === true || readiness.status === 'lane_resolution_ready',
    consumesFactsOnly: readiness.consumesFactsOnly !== false,
    changesLaneBehavior: readiness.changesLaneBehavior === true
  };
}

function humanReviewGateFacts(source) {
  const gate = firstObject(source.humanReviewGate, source.reviewGate);
  return {
    humanReviewRequired: gate.humanReviewRequired !== false,
    reviewOnly: gate.reviewOnly !== false,
    nonInstallable: gate.nonInstallable !== false,
    installAllowed: gate.installAllowed === true || source.installAllowed === true,
    autoInstall: gate.autoInstall === true || source.autoInstall === true
  };
}

function uncertaintyGateFacts(source) {
  const gate = firstObject(source.uncertaintyGate, source.uncertainty);
  return {
    uncertaintyVisible: gate.uncertaintyVisible === true || source.uncertaintyVisible === true || hasText(gate.copy),
    weakEvidenceConfirmationRequired: gate.weakEvidenceConfirmationRequired !== false,
    weakOrConflictingEvidence: gate.weakOrConflictingEvidence === true || source.weakEvidence === true || source.conflictingEvidence === true,
    hideUncertainty: gate.hideUncertainty === true || source.hideUncertainty === true
  };
}

function hasUnsafeAuthority(source) {
  const nllm = nllmDraftIntakeFacts(source);
  const evidence = websiteCategoryEvidenceFacts(source);
  const story = storyCopyCoverageFacts(source);
  const uncertainty = uncertaintyGateFacts(source);
  const laneCompatibility = laneResolutionCompatibilityFacts(source);
  const comparison = sourcePackComparisonFacts(source);
  return nllm.advisoryOnly !== true ||
    nllm.writeAuthority !== 'none' ||
    nllm.creationAllowed === true ||
    nllm.uncertaintyVisible !== true ||
    nllm.canOverrideWebsiteEvidence === true ||
    nllm.canOverrideConsultantToggles === true ||
    evidence.canOverrideWebsiteEvidence === true ||
    story.hasGuaranteedOrMeasuredRoiClaim === true ||
    uncertainty.hideUncertainty === true ||
    laneCompatibility.changesLaneBehavior === true ||
    comparison.sourcePackMutationRequested === true;
}

function hasAutoInstall(source) {
  const gate = humanReviewGateFacts(source);
  return gate.installAllowed === true || gate.autoInstall === true || gate.nonInstallable !== true;
}

function statusAndReasons(source) {
  const reasons = [];
  const identity = proposalIdentityFacts(source);
  const evidence = websiteCategoryEvidenceFacts(source);
  const roles = recordRoleCoverageFacts(source);
  const vocabulary = vocabularyCoverageFacts(source);
  const story = storyCopyCoverageFacts(source);
  const authoring = authoringReviewFacts(source);
  const diff = proposedDiffFacts(source);
  const admin = adminReviewFacts(source);
  const qa = receiptDrivenQaFacts(source);
  const laneCompatibility = laneResolutionCompatibilityFacts(source);
  const reviewGate = humanReviewGateFacts(source);
  const uncertainty = uncertaintyGateFacts(source);
  if (hasAutoInstall(source)) {
    reasons.push('future_lane_pack_must_remain_review_only_non_installable');
    return { status: FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.BLOCKED_AUTO_INSTALL, reasons };
  }
  if (hasUnsafeAuthority(source)) {
    reasons.push('unsafe_authority_or_hidden_uncertainty_forbidden');
    return { status: FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.BLOCKED_UNSAFE_AUTHORITY, reasons };
  }
  if (!evidence.evidenceReady) {
    reasons.push('website_category_evidence_required');
    return { status: FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.NEEDS_EVIDENCE, reasons };
  }
  if (!hasText(identity.proposedPackId)) reasons.push('proposed_pack_identity_missing');
  if (!roles.coverageReady) reasons.push('record_role_coverage_not_ready');
  if (!vocabulary.coverageReady) reasons.push('vocabulary_coverage_not_ready');
  if (!story.coverageReady) reasons.push('story_copy_coverage_not_ready');
  if (!authoring.ready) reasons.push('w247_authoring_review_not_ready');
  if (!diff.ready) reasons.push('w251_proposed_diff_not_ready');
  if (!admin.ready) reasons.push('w252_admin_review_not_ready');
  if (!qa.ready) reasons.push('w255_receipt_qa_not_ready');
  if (!laneCompatibility.ready || laneCompatibility.consumesFactsOnly !== true) reasons.push('lane_resolution_readiness_compatibility_not_ready');
  if (reviewGate.humanReviewRequired !== true || reviewGate.reviewOnly !== true) reasons.push('human_review_gate_not_ready');
  if (uncertainty.uncertaintyVisible !== true || uncertainty.weakEvidenceConfirmationRequired !== true) reasons.push('uncertainty_gate_not_ready');
  return {
    status: reasons.length ? FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.NOT_READY : FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.READY_FOR_REVIEW,
    reasons
  };
}

function normalizeFutureLanePackExpansionReadiness(input) {
  const source = input || {};
  const status = statusAndReasons(source);
  return {
    schema: FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION,
    status: status.status,
    readyForReview: status.status === FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES.READY_FOR_REVIEW,
    blockedReasons: status.reasons,
    proposalIdentity: proposalIdentityFacts(source),
    sourcePackComparison: sourcePackComparisonFacts(source),
    websiteCategoryEvidence: websiteCategoryEvidenceFacts(source),
    recordRoleCoverage: recordRoleCoverageFacts(source),
    vocabularyCoverage: vocabularyCoverageFacts(source),
    storyCopyCoverage: storyCopyCoverageFacts(source),
    nllmDraftIntake: nllmDraftIntakeFacts(source),
    authoringReview: authoringReviewFacts(source),
    proposedDiff: proposedDiffFacts(source),
    adminReview: adminReviewFacts(source),
    receiptDrivenQa: receiptDrivenQaFacts(source),
    laneResolutionCompatibility: laneResolutionCompatibilityFacts(source),
    humanReviewGate: humanReviewGateFacts(source),
    uncertaintyGate: uncertaintyGateFacts(source),
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

function contractSummary() {
  return {
    schema: FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION,
    status: 'contract_ready',
    statuses: Object.keys(FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES).map((key) => FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES[key]),
    requiredFactFields: REQUIRED_FACT_FIELDS.slice(),
    sourcePackFile: 'src/contracts/lanePacks.js',
    runtimeAuthority: {
      sourcePackMutation: false,
      proposalInstall: false,
      laneResolutionBehaviorChange: false,
      uiRendering: false,
      recordCreation: false,
      transactionWrites: false,
      adapterInvocation: false
    }
  };
}

module.exports = {
  FUTURE_LANE_PACK_EXPANSION_READINESS_SCHEMA_VERSION,
  FUTURE_LANE_PACK_EXPANSION_READINESS_STATUSES,
  REQUIRED_FACT_FIELDS,
  normalizeFutureLanePackExpansionReadiness,
  proposalIdentityFacts,
  sourcePackComparisonFacts,
  websiteCategoryEvidenceFacts,
  recordRoleCoverageFacts,
  vocabularyCoverageFacts,
  storyCopyCoverageFacts,
  nllmDraftIntakeFacts,
  authoringReviewFacts,
  proposedDiffFacts,
  adminReviewFacts,
  receiptDrivenQaFacts,
  laneResolutionCompatibilityFacts,
  humanReviewGateFacts,
  uncertaintyGateFacts,
  contractSummary
};
