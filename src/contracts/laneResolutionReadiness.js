'use strict';

const LANE_RESOLUTION_READINESS_SCHEMA_VERSION = 'forge.w300.lane-resolution-readiness.v1';

const LANE_RESOLUTION_READINESS_STATUSES = Object.freeze({
  READY: 'lane_resolution_ready',
  NEEDS_CONFIRMATION: 'lane_resolution_needs_confirmation',
  BLOCKED_MISSING_WEBSITE_EVIDENCE: 'lane_resolution_blocked_missing_website_evidence',
  BLOCKED_HIDDEN_UNCERTAINTY: 'lane_resolution_blocked_hidden_uncertainty',
  NOT_READY: 'lane_resolution_not_ready'
});

const REQUIRED_FACT_FIELDS = Object.freeze([
  'laneResolution',
  'websiteEvidence',
  'consultantConfirmation',
  'nllm',
  'storySurfaceInputs',
  'laneAwareLabelFacts',
  'expansionWorkflow'
]);

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function stringValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function bool(value) {
  return value === true;
}

function firstObject(...candidates) {
  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || {};
}

function hasText(value) {
  return !!stringValue(value).trim();
}

function laneResolutionFacts(source) {
  const resolution = firstObject(source.laneResolution, source.resolution, source.w246Resolution);
  const lanePack = firstObject(source.lanePack, source.resolvedLanePack, resolution.lanePack);
  return {
    status: stringValue(resolution.status || source.status),
    packId: stringValue(resolution.packId || lanePack.packId || lanePack.id || source.packId),
    laneId: stringValue(lanePack.laneId || source.laneId),
    subIndustryId: stringValue(lanePack.subIndustryId || source.subIndustryId),
    confidence: stringValue(resolution.confidence || source.confidence),
    sourceAuthority: stringValue(resolution.sourceAuthority || source.sourceAuthority),
    matchedSignals: arrayValue(resolution.matchedSignals || source.matchedSignals),
    notesOverrideIdentityAllowed: resolution.notesOverrideIdentityAllowed === true || source.notesOverrideIdentityAllowed === true,
    nllmAuthority: stringValue(resolution.nllmAuthority || source.nllmAuthority || 'advisory_only')
  };
}

function websiteEvidenceFacts(source) {
  const evidence = firstObject(source.websiteEvidence, source.websiteEvidenceBridge, source.bridge);
  const matched = arrayValue(source.matchedSignals || evidence.matchedSignals || evidence.signals);
  const domain = stringValue(evidence.domain || evidence.websiteDomain || source.websiteDomain);
  const website = stringValue(evidence.website || source.website);
  const category = stringValue(evidence.category || evidence.productFamily || source.categoryText || source.productFamily);
  const text = [
    website,
    domain,
    category,
    evidence.evidence,
    evidence.demandMoment,
    matched.join(' ')
  ].filter(Boolean).join(' ');
  return {
    website,
    domain,
    category,
    matchedSignals: matched,
    hasWebsiteEvidence: hasText(website) || hasText(domain) || hasText(category) || matched.length > 0 || hasText(evidence.evidence),
    hasStrongWebsiteEvidence: bool(evidence.hasStrongWebsiteEvidence) || /domain:/i.test(matched.join(' ')) || hasText(domain) && matched.length > 0,
    evidenceTextPresent: hasText(text)
  };
}

function consultantConfirmationFacts(source) {
  const confirmation = firstObject(source.consultantConfirmation, source.confirmation, source.state);
  const toggles = firstObject(source.toggles, confirmation.toggles);
  const laneSelectionSource = stringValue(confirmation.laneSelectionSource || source.laneSelectionSource);
  return {
    selectedLaneId: stringValue(confirmation.selectedLaneId || source.selectedLaneId),
    laneSelectionSource,
    laneConfirmed: confirmation.laneConfirmed === true || source.laneConfirmed === true || laneSelectionSource === 'consultant_confirmed',
    togglesPresent: Object.keys(toggles).length > 0 || source.togglesPresent === true,
    manufacturingEnabled: toggles.manufacturing === true || toggles.enableManufacturing === true || source.manufacturingEnabled === true,
    wipEnabled: toggles.wip === true || toggles.enableWip === true || source.wipEnabled === true
  };
}

function nllmFacts(source) {
  const nllm = firstObject(source.nllm, source.nllmAdvisory, source.advisory);
  return {
    advisoryOnly: nllm.advisoryOnly === true || source.nllmAdvisoryOnly === true || /advisory/i.test(stringValue(nllm.role || nllm.authority)),
    writeAuthority: stringValue(nllm.writeAuthority || source.nllmWriteAuthority || 'none'),
    creationAllowed: nllm.creationAllowed === true || source.nllmCreationAllowed === true,
    uncertaintyVisible: nllm.uncertaintyVisible === true || source.uncertaintyVisible === true || hasText(nllm.uncertainty),
    hardLimitsVisible: arrayValue(nllm.hardLimits || nllm.limits || source.nllmHardLimits).length > 0,
    canOverrideWebsiteEvidence: nllm.canOverrideWebsiteEvidence === true || source.nllmCanOverrideWebsiteEvidence === true,
    canOverrideConsultantToggles: nllm.canOverrideConsultantToggles === true || source.nllmCanOverrideConsultantToggles === true
  };
}

function storySurfaceInputFacts(source) {
  const story = firstObject(source.storySurfaceInputs, source.story, source.w247StorySurface);
  return {
    storyStatus: stringValue(story.status),
    packId: stringValue(story.packId || source.packId),
    hasOpenTarget: hasText(story.openTarget) && !/confirm lane before opening proof records/i.test(story.openTarget),
    usesLaneResolution: source.usesLaneResolution !== false,
    usesReturnedRecords: source.usesReturnedRecords !== false
  };
}

function laneAwareLabelFacts(source) {
  const labelFacts = firstObject(source.laneAwareLabelFacts, source.labels);
  return {
    source: stringValue(labelFacts.source || source.laneAwareLabelSource || 'lanePackAwareRecordLabelW250'),
    labelsReady: labelFacts.labelsReady === true || source.labelsReady === true || stringValue(labelFacts.source || source.laneAwareLabelSource).indexOf('lanePackAwareRecordLabelW250') >= 0,
    distributionLabelsProtected: labelFacts.distributionLabelsProtected === true || source.distributionLabelsProtected === true,
    manufacturingLabelsProtected: labelFacts.manufacturingLabelsProtected === true || source.manufacturingLabelsProtected === true
  };
}

function expansionWorkflowFacts(source) {
  const expansion = firstObject(source.expansionWorkflow, source.lanePackExpansionWorkflow);
  return {
    sourcePackFile: stringValue(expansion.sourcePackFile || source.sourcePackFile || 'src/contracts/lanePacks.js'),
    reviewOnlyProposals: expansion.reviewOnlyProposals !== false && source.reviewOnlyProposals !== false,
    noAutoInstall: expansion.noAutoInstall !== false && source.noAutoInstall !== false,
    advisoryOnly: expansion.advisoryOnly !== false && source.expansionAdvisoryOnly !== false
  };
}

function hiddenUncertaintyOrBadAuthority(source) {
  const nllm = nllmFacts(source);
  const resolution = laneResolutionFacts(source);
  return nllm.advisoryOnly !== true ||
    nllm.writeAuthority !== 'none' ||
    nllm.creationAllowed === true ||
    nllm.uncertaintyVisible !== true ||
    nllm.canOverrideWebsiteEvidence === true ||
    nllm.canOverrideConsultantToggles === true ||
    source.hideUncertainty === true ||
    source.uncertaintyHidden === true ||
    resolution.notesOverrideIdentityAllowed === true ||
    resolution.nllmAuthority !== 'advisory_only';
}

function laneNeedsConfirmation(source) {
  const resolution = laneResolutionFacts(source);
  const confirmation = consultantConfirmationFacts(source);
  if (source.weakEvidence === true || source.conflictingEvidence === true || source.laneConfirmationRequired === true) return true;
  if (resolution.status === 'needs_confirmation' || resolution.status === 'insufficient_evidence') return true;
  if (/low|weak|conflicting|needs|medium/i.test(resolution.confidence) && confirmation.laneConfirmed !== true) return true;
  return false;
}

function statusAndReasons(source) {
  const reasons = [];
  const website = websiteEvidenceFacts(source);
  const resolution = laneResolutionFacts(source);
  const labels = laneAwareLabelFacts(source);
  const story = storySurfaceInputFacts(source);
  const expansion = expansionWorkflowFacts(source);
  if (hiddenUncertaintyOrBadAuthority(source)) {
    reasons.push('nllm_must_remain_advisory_only_and_uncertainty_visible');
    return { status: LANE_RESOLUTION_READINESS_STATUSES.BLOCKED_HIDDEN_UNCERTAINTY, reasons };
  }
  if (!website.hasWebsiteEvidence) {
    reasons.push('website_evidence_required_before_lane_readiness');
    return { status: LANE_RESOLUTION_READINESS_STATUSES.BLOCKED_MISSING_WEBSITE_EVIDENCE, reasons };
  }
  if (laneNeedsConfirmation(source)) {
    reasons.push('lane_confirmation_required_before_lane_claims');
    return { status: LANE_RESOLUTION_READINESS_STATUSES.NEEDS_CONFIRMATION, reasons };
  }
  if (!hasText(resolution.packId)) reasons.push('resolved_lane_pack_missing');
  if (!hasText(resolution.confidence)) reasons.push('lane_confidence_missing');
  if (!labels.labelsReady) reasons.push('lane_aware_labels_not_ready');
  if (!story.usesLaneResolution) reasons.push('story_surface_not_using_lane_resolution_facts');
  if (!expansion.reviewOnlyProposals || !expansion.noAutoInstall || !expansion.advisoryOnly) reasons.push('future_expansion_guardrails_not_ready');
  return {
    status: reasons.length ? LANE_RESOLUTION_READINESS_STATUSES.NOT_READY : LANE_RESOLUTION_READINESS_STATUSES.READY,
    reasons
  };
}

function normalizeLaneResolutionReadiness(input) {
  const source = input || {};
  const status = statusAndReasons(source);
  const nllm = nllmFacts(source);
  return {
    schema: LANE_RESOLUTION_READINESS_SCHEMA_VERSION,
    status: status.status,
    ready: status.status === LANE_RESOLUTION_READINESS_STATUSES.READY,
    blockedReasons: status.reasons,
    laneResolution: laneResolutionFacts(source),
    websiteEvidence: websiteEvidenceFacts(source),
    consultantConfirmation: consultantConfirmationFacts(source),
    nllm: {
      advisoryOnly: nllm.advisoryOnly,
      writeAuthority: nllm.writeAuthority,
      creationAllowed: nllm.creationAllowed,
      uncertaintyVisible: nllm.uncertaintyVisible,
      hardLimitsVisible: nllm.hardLimitsVisible,
      canOverrideWebsiteEvidence: nllm.canOverrideWebsiteEvidence,
      canOverrideConsultantToggles: nllm.canOverrideConsultantToggles
    },
    storySurfaceInputs: storySurfaceInputFacts(source),
    laneAwareLabelFacts: laneAwareLabelFacts(source),
    expansionWorkflow: expansionWorkflowFacts(source),
    validationBoundary: {
      w246ResolutionConsumedNotReplaced: true,
      websiteEvidenceConsumedNotReplaced: true,
      consultantTogglesConsumedNotReplaced: true,
      w250LabelsConsumedNotReplaced: true,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    runtimeBoundary: {
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
      noAdapterInvocation: true
    }
  };
}

function contractSummary() {
  return {
    schema: LANE_RESOLUTION_READINESS_SCHEMA_VERSION,
    status: 'contract_ready',
    statuses: Object.keys(LANE_RESOLUTION_READINESS_STATUSES).map((key) => LANE_RESOLUTION_READINESS_STATUSES[key]),
    requiredFactFields: REQUIRED_FACT_FIELDS.slice(),
    representedInputs: [
      'W246 resolved lane pack and confidence',
      'website evidence bridge and matched signals',
      'consultant lane and toggle confirmation',
      'resolveLanePackFromEvidenceW246 output',
      'nllmAdvisoryPayloadForLanePackW246 limits',
      'consultantStorySurfaceFromLanePackW247 inputs',
      'W250 lane-aware labels',
      'weak/conflicting evidence confirmation gate',
      'future lane-pack expansion workflow'
    ],
    selectedFromW299: 'lane_resolution_readiness_contract_w300',
    futureBridge: 'src/contracts/laneResolutionReadinessBridge.js',
    runtimeBoundary: {
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
      noAdapterInvocation: true
    }
  };
}

module.exports = {
  LANE_RESOLUTION_READINESS_SCHEMA_VERSION,
  LANE_RESOLUTION_READINESS_STATUSES,
  REQUIRED_FACT_FIELDS,
  normalizeLaneResolutionReadiness,
  contractSummary
};
