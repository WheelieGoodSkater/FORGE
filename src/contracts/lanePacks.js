'use strict';

const LANE_PACK_SCHEMA_VERSION = 'forge.lane-pack.v1';

const NLLM_HARD_LIMITS = Object.freeze([
  'cannotCreateRecords',
  'cannotInvokeSuiteScriptOrWriteTransactions',
  'cannotSilentlyInstallTruth',
  'cannotOverrideWebsiteEvidence',
  'cannotOverrideConsultantToggles',
  'cannotHideUncertainty',
  'cannotInventVerifiedWebsiteFacts',
  'cannotClaimMeasuredRoiWithoutBaseline'
]);

const NLLM_ALLOWED_TASKS = Object.freeze([
  'summarizeWebsiteAndCategoryEvidence',
  'proposeRecordNames',
  'synthesizePainValueCompetitiveAndRoi',
  'draftSoWhatAndWhyItMatters',
  'draftLanePackSuggestionsForHumanReview'
]);

function pack(config) {
  return Object.freeze(Object.assign({
    schema: LANE_PACK_SCHEMA_VERSION,
    packVersion: '1.0.0',
    nllmAdvisory: {
      allowedTasks: NLLM_ALLOWED_TASKS.slice(),
      hardLimits: NLLM_HARD_LIMITS.slice(),
      writeAuthority: 'none',
      creationAllowed: false,
      uncertaintyPolicy: 'surface_uncertainty_and_request_confirmation'
    }
  }, config));
}

const LANE_PACKS = Object.freeze([
  pack({
    packId: 'industrial-manufacturing',
    laneId: 'industrial_equipment',
    subIndustryId: 'industrial-manufacturing',
    label: 'Industrial Manufacturing',
    operatingMode: 'discrete_manufacturing',
    websiteSignals: {
      domains: ['ariens.com'],
      categoryTerms: ['industrial manufacturing', 'assembly', 'component', 'production', 'plant'],
      evidenceTerms: ['component readiness', 'supplier timing', 'assembly confidence', 'delivery promise']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'production_planning_context'],
      invalid: ['ingredient_batch_terms_without_food_mode', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['assembly', 'component', 'supplier timing', 'configured demand', 'delivery confidence'],
      forbidden: ['ingredient batch', 'flavor', 'style matrix', 'branch transfer']
    },
    liveDemo: {
      proofMove: 'Open the assembly or finished item, then prove component readiness against the sales order promise.',
      storyAnchor: 'Configured demand only matters if component readiness and build timing protect the buyer promise.',
      roiSoWhat: 'Protect delivery revenue by exposing component or supplier gaps before the order promise is at risk.',
      competitiveContrast: 'NetSuite keeps demand, inventory, and manufacturing proof in one operating path instead of a planning handoff.'
    }
  }),
  pack({
    packId: 'equipment-manufacturing',
    laneId: 'industrial_equipment',
    subIndustryId: 'equipment-manufacturing',
    label: 'Equipment Manufacturing',
    operatingMode: 'wip_manufacturing',
    websiteSignals: {
      domains: ['cat.com', 'deere.com'],
      categoryTerms: ['equipment manufacturing', 'machine', 'configured equipment', 'service part', 'assembly'],
      evidenceTerms: ['configured order', 'component readiness', 'work order', 'routing', 'shipment control']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing', 'work_center'],
      invalid: ['formula_or_batch_structure', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['configured equipment', 'assembly', 'component availability', 'work order', 'routing'],
      forbidden: ['ingredient blend', 'case pack', 'style color size matrix']
    },
    liveDemo: {
      proofMove: 'Open the equipment assembly and show how WIP or routing context supports the promised shipment.',
      storyAnchor: 'The consultant should prove order-to-build control, not generic inventory visibility.',
      roiSoWhat: 'Reduce expediting and missed shipment risk by aligning configured demand to build capacity and components.',
      competitiveContrast: 'NetSuite lets the team see sales promise, WIP, and component constraints without switching systems.'
    }
  }),
  pack({
    packId: 'industrial-distributor',
    laneId: 'industrial_distribution',
    subIndustryId: 'industrial-distributor',
    label: 'Industrial Distributor',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['grainger.com', 'uline.com', 'mcmaster.com', 'fastenal.com', 'ferguson.com'],
      categoryTerms: ['industrial supply', 'branch', 'warehouse', 'MRO', 'distribution', 'stocking location'],
      evidenceTerms: ['branch availability', 'supplier lead time', 'replenishment', 'transfer-aware inventory']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
      optional: ['supporting_sku', 'location_planning_context'],
      invalid: ['assembly', 'work_order', 'ingredient', 'batch', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['branch availability', 'replenishment', 'supplier lead time', 'fulfillment confidence'],
      forbidden: ['production routing', 'ingredient batch', 'fashion collection']
    },
    liveDemo: {
      proofMove: 'Open the product or availability record and prove branch promise, replenishment timing, and fulfillment confidence.',
      storyAnchor: 'The buyer cares whether the distributor can promise from the right location at the right time.',
      roiSoWhat: 'Protect service level and margin by resolving supplier and branch exceptions before the order misses.',
      competitiveContrast: 'NetSuite shows branch and fulfillment control instead of a generic warehouse snapshot.'
    }
  }),
  pack({
    packId: 'cpg-distributor',
    laneId: 'products_cpg',
    subIndustryId: 'cpg-distributor',
    label: 'CPG Distributor',
    operatingMode: 'distribution_replenishment',
    websiteSignals: {
      domains: ['unfi.com', 'kehe.com'],
      categoryTerms: ['cpg distributor', 'grocery distribution', 'retail replenishment', 'consumer brands'],
      evidenceTerms: ['retail replenishment', 'case availability', 'promotion fulfillment', 'warehouse allocation']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'branch_or_product_sku', 'replenishment_or_availability_flow'],
      optional: ['supporting_sku', 'location_planning_context'],
      invalid: ['work_order_or_wip_object', 'routing', 'formula_or_batch_structure']
    },
    vocabulary: {
      allowed: ['retail replenishment', 'case availability', 'promotion fulfillment', 'warehouse allocation'],
      forbidden: ['assembly routing', 'work center', 'style matrix']
    },
    liveDemo: {
      proofMove: 'Open the CPG SKU and prove retailer replenishment, case availability, and allocation confidence.',
      storyAnchor: 'The distributor story is promotion-to-shelf reliability without pretending to manufacture the item.',
      roiSoWhat: 'Protect retail revenue by catching replenishment and allocation risk before promotion demand lands.',
      competitiveContrast: 'NetSuite connects order promise, inventory, and replenishment action in one proof path.'
    }
  }),
  pack({
    packId: 'cpg-manufacturer',
    laneId: 'products_cpg',
    subIndustryId: 'cpg-manufacturer',
    label: 'CPG Manufacturer',
    operatingMode: 'discrete_manufacturing',
    websiteSignals: {
      domains: ['milkbone.com'],
      categoryTerms: ['consumer packaged goods', 'brand assortment', 'case pack', 'packaging', 'promotion'],
      evidenceTerms: ['packaging readiness', 'case-pack timing', 'finished goods', 'retail availability']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_or_assembly_item', 'component_item'],
      optional: ['bom_or_assembly_structure', 'production_planning_context'],
      invalid: ['branch_or_product_sku_without_distribution_evidence', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['case pack', 'packaging readiness', 'finished goods', 'promotion demand'],
      forbidden: ['dealer network', 'branch transfer', 'regulated lot release']
    },
    liveDemo: {
      proofMove: 'Open the finished packaged good and prove packaging or component readiness against promotion demand.',
      storyAnchor: 'Promotion demand is only believable when packaging, replenishment, and finished goods stay connected.',
      roiSoWhat: 'Reduce missed promotion and chargeback risk by making readiness visible before fulfillment breaks.',
      competitiveContrast: 'NetSuite ties brand demand, inventory, and manufacturing readiness into one consultant-led path.'
    }
  }),
  pack({
    packId: 'food-beverage-manufacturer',
    laneId: 'food_beverage',
    subIndustryId: 'food-beverage-manufacturer',
    label: 'Food/Beverage Manufacturer',
    operatingMode: 'food_batch_manufacturing',
    websiteSignals: {
      domains: ['mccormick.com', 'keebler.com', 'liquiddeath.com', 'yerbamadre.com', 'guayaki.com'],
      categoryTerms: ['food', 'beverage', 'ingredient', 'flavor', 'packaging', 'batch'],
      evidenceTerms: ['ingredient readiness', 'packaging timing', 'line continuity', 'finished-good availability']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'finished_food_or_batch_item', 'ingredient_or_component_item'],
      optional: ['formula_or_batch_structure', 'lot_or_availability_context', 'work_order_or_wip_object'],
      invalid: ['style_matrix_or_availability_flow', 'dealer_availability_or_replenishment_flow']
    },
    vocabulary: {
      allowed: ['ingredient readiness', 'formula', 'batch', 'packaging timing', 'finished-good availability'],
      forbidden: ['style matrix', 'dealer allocation', 'equipment routing unless WIP is explicit']
    },
    liveDemo: {
      proofMove: 'Open the finished food or beverage item and prove ingredient, packaging, and finished-good readiness.',
      storyAnchor: 'Food and beverage trust comes from showing the batch inputs that protect the shelf promise.',
      roiSoWhat: 'Protect promotion and service revenue by catching ingredient or packaging gaps before production misses demand.',
      competitiveContrast: 'NetSuite keeps demand, ingredients, production readiness, and availability together.'
    }
  }),
  pack({
    packId: 'dealer-hardgoods',
    laneId: 'dealer_hardgoods',
    subIndustryId: 'dealer-hardgoods',
    label: 'Dealer Hardgoods',
    operatingMode: 'dealer_hardgoods_replenishment',
    websiteSignals: {
      domains: ['trekbikes.com', 'yeti.com', 'gordonandsmith.com'],
      categoryTerms: ['dealer', 'hardgoods', 'bicycle', 'outdoor gear', 'durable goods', 'channel'],
      evidenceTerms: ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'product_sku', 'dealer_availability_or_replenishment_flow'],
      optional: ['allocation_support_sku', 'channel_context'],
      invalid: ['ingredient', 'batch', 'assembly_without_manufacturing_evidence', 'style_matrix_or_availability_flow']
    },
    vocabulary: {
      allowed: ['dealer availability', 'allocation', 'channel replenishment', 'durable SKU'],
      forbidden: ['ingredient blend', 'batch formula', 'branch-only fulfillment']
    },
    liveDemo: {
      proofMove: 'Open the dealer SKU and prove channel availability, allocation, and replenishment timing.',
      storyAnchor: 'Dealer-channel promise depends on SKU availability and allocation, not generic branch inventory.',
      roiSoWhat: 'Protect dealer revenue and confidence by proving the product can be allocated and replenished.',
      competitiveContrast: 'NetSuite keeps channel availability and order promise visible in one SKU-centered path.'
    }
  }),
  pack({
    packId: 'apparel-style-matrix',
    laneId: 'apparel_accessories',
    subIndustryId: 'apparel-style-matrix',
    label: 'Apparel Style Matrix',
    operatingMode: 'apparel_style_matrix',
    websiteSignals: {
      domains: ['ariat.com', 'vans.com', 'patagonia.com'],
      categoryTerms: ['apparel', 'footwear', 'style', 'size', 'color', 'collection'],
      evidenceTerms: ['style readiness', 'size color availability', 'allocation', 'seasonal launch']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'style_sku', 'style_matrix_or_availability_flow'],
      optional: ['supporting_style_or_color_sku'],
      invalid: ['finished_good_without_style_evidence', 'work_order', 'ingredient_or_component_item']
    },
    vocabulary: {
      allowed: ['style', 'size', 'color', 'collection', 'variant availability'],
      forbidden: ['ingredient batch', 'industrial assembly', 'branch transfer']
    },
    liveDemo: {
      proofMove: 'Open the style or matrix item and prove size/color availability, allocation, and launch promise.',
      storyAnchor: 'The consultant should show matrix truth for variants rather than generic SKU availability.',
      roiSoWhat: 'Protect launch and seasonal revenue by exposing variant gaps before customers encounter them.',
      competitiveContrast: 'NetSuite keeps style, variant availability, allocation, and order promise in one path.'
    }
  }),
  pack({
    packId: 'retail-availability',
    laneId: 'products_cpg',
    subIndustryId: 'retail-availability',
    label: 'Retail Availability',
    operatingMode: 'retail_availability',
    websiteSignals: {
      domains: ['rei.com', 'target.com', 'walmart.com'],
      categoryTerms: ['retail', 'store availability', 'ecommerce', 'pickup', 'ship to store'],
      evidenceTerms: ['store availability', 'channel availability', 'replenishment', 'customer promise']
    },
    recordRoles: {
      required: ['customer', 'sales_order', 'hero_sku', 'availability_or_replenishment_flow'],
      optional: ['supporting_sku', 'location_or_channel_context'],
      invalid: ['bom_or_assembly_structure', 'work_order_or_wip_object', 'routing']
    },
    vocabulary: {
      allowed: ['store availability', 'channel availability', 'replenishment', 'customer promise'],
      forbidden: ['production routing', 'batch formula', 'regulated release']
    },
    liveDemo: {
      proofMove: 'Open the SKU or availability flow and prove the channel promise from demand to replenishment.',
      storyAnchor: 'Retail confidence is whether the buyer can trust availability across channels.',
      roiSoWhat: 'Protect conversion and service levels by surfacing availability and replenishment risk early.',
      competitiveContrast: 'NetSuite connects order demand, inventory, and channel availability without a separate lookup story.'
    }
  })
]);

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function evidenceText(input) {
  const parts = [];
  if (input) {
    parts.push(input.website, input.websiteDomain, input.category, input.categoryText, input.websiteText, input.evidenceText);
    if (Array.isArray(input.signals)) parts.push(input.signals.join(' '));
  }
  return normalizeText(parts.filter(Boolean).join(' '));
}

function domainFromWebsite(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./i, '').toLowerCase();
  } catch (err) {
    return raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
  }
}

function validateLanePack(packToValidate) {
  const errors = [];
  const requiredStringFields = ['schema', 'packVersion', 'packId', 'laneId', 'subIndustryId', 'label', 'operatingMode'];
  requiredStringFields.forEach((field) => {
    if (!packToValidate || typeof packToValidate[field] !== 'string' || !packToValidate[field]) errors.push(`${field} required`);
  });
  if (packToValidate && packToValidate.schema !== LANE_PACK_SCHEMA_VERSION) errors.push('schema mismatch');
  ['websiteSignals', 'recordRoles', 'vocabulary', 'liveDemo', 'nllmAdvisory'].forEach((field) => {
    if (!packToValidate || !packToValidate[field] || typeof packToValidate[field] !== 'object') errors.push(`${field} required`);
  });
  ['required', 'optional', 'invalid'].forEach((field) => {
    if (!Array.isArray(packToValidate && packToValidate.recordRoles && packToValidate.recordRoles[field])) errors.push(`recordRoles.${field} array required`);
  });
  ['allowed', 'forbidden'].forEach((field) => {
    if (!Array.isArray(packToValidate && packToValidate.vocabulary && packToValidate.vocabulary[field])) errors.push(`vocabulary.${field} array required`);
  });
  ['proofMove', 'storyAnchor', 'roiSoWhat', 'competitiveContrast'].forEach((field) => {
    if (!packToValidate || !packToValidate.liveDemo || typeof packToValidate.liveDemo[field] !== 'string' || !packToValidate.liveDemo[field]) errors.push(`liveDemo.${field} required`);
  });
  if (!packToValidate || !packToValidate.nllmAdvisory || packToValidate.nllmAdvisory.writeAuthority !== 'none') errors.push('nllmAdvisory.writeAuthority must be none');
  if (!packToValidate || !packToValidate.nllmAdvisory || packToValidate.nllmAdvisory.creationAllowed !== false) errors.push('nllmAdvisory.creationAllowed must be false');
  NLLM_HARD_LIMITS.forEach((limit) => {
    if (!packToValidate || !packToValidate.nllmAdvisory || !Array.isArray(packToValidate.nllmAdvisory.hardLimits) || !packToValidate.nllmAdvisory.hardLimits.includes(limit)) {
      errors.push(`missing hard limit ${limit}`);
    }
  });
  return { valid: errors.length === 0, errors };
}

function resolveLanePackFromEvidence(input) {
  const domain = domainFromWebsite(input && (input.websiteDomain || input.website));
  const text = evidenceText(Object.assign({}, input, { websiteDomain: domain }));
  const scored = LANE_PACKS.map((lanePack) => {
    let score = 0;
    const matched = [];
    (lanePack.websiteSignals.domains || []).forEach((knownDomain) => {
      if (domain && (domain === knownDomain || domain.endsWith(`.${knownDomain}`))) {
        score += 100;
        matched.push(`domain:${knownDomain}`);
      }
    });
    (lanePack.websiteSignals.categoryTerms || []).forEach((term) => {
      if (text.includes(normalizeText(term))) {
        score += 18;
        matched.push(`category:${term}`);
      }
    });
    (lanePack.websiteSignals.evidenceTerms || []).forEach((term) => {
      if (text.includes(normalizeText(term))) {
        score += 12;
        matched.push(`evidence:${term}`);
      }
    });
    return { lanePack, score, matched };
  }).sort((a, b) => b.score - a.score);
  const winner = scored[0] || { lanePack: null, score: 0, matched: [] };
  return {
    schema: 'forge.lane-pack-resolution.v1',
    status: winner.score >= 100 ? 'resolved' : winner.score >= 36 ? 'needs_confirmation' : 'insufficient_evidence',
    lanePack: winner.lanePack,
    packId: winner.lanePack ? winner.lanePack.packId : '',
    confidence: winner.score >= 100 ? 'high' : winner.score >= 36 ? 'medium' : 'low',
    score: winner.score,
    matchedSignals: winner.matched,
    notesOverrideIdentityAllowed: false,
    sourceAuthority: winner.score >= 100 ? 'website_domain' : winner.score >= 36 ? 'website_category' : 'insufficient'
  };
}

function nllmAdvisoryPayloadForLanePack(input, lanePack) {
  const selected = lanePack || resolveLanePackFromEvidence(input).lanePack;
  return {
    schema: 'forge.lane-pack-nllm-advisory.v1',
    lanePackSchema: LANE_PACK_SCHEMA_VERSION,
    packId: selected ? selected.packId : '',
    writeAuthority: 'none',
    creationAllowed: false,
    allowedTasks: NLLM_ALLOWED_TASKS.slice(),
    hardLimits: NLLM_HARD_LIMITS.slice(),
    websiteEvidence: {
      website: input && input.website,
      websiteDomain: domainFromWebsite(input && (input.websiteDomain || input.website)),
      signals: input && input.signals ? input.signals : []
    },
    conversationNotesUse: 'Use notes for pain, ROI, competitive framing, objections, and run coaching only. Do not override website-owned lane or naming identity.',
    requiredUncertaintyBehavior: 'If evidence is weak or conflicting, ask for confirmation and keep uncertainty visible.'
  };
}

function reviewProposedLanePackChange(proposal) {
  const errors = [];
  const warnings = [];
  const candidate = proposal && proposal.candidatePack;
  const validation = validateLanePack(candidate);
  validation.errors.forEach((error) => errors.push(error));
  if (!proposal || proposal.proposedBy !== 'nllm_advisory') errors.push('proposal.proposedBy must be nllm_advisory');
  if (!proposal || proposal.installRequested !== true) warnings.push('proposal is review-only until a human requests install');
  if (proposal && proposal.autoInstall === true) errors.push('autoInstall is forbidden');
  if (candidate && candidate.nllmAdvisory && candidate.nllmAdvisory.writeAuthority !== 'none') errors.push('candidate cannot grant write authority');
  if (candidate && candidate.nllmAdvisory && candidate.nllmAdvisory.creationAllowed !== false) errors.push('candidate cannot allow creation');
  if (candidate && candidate.websiteSignals && (!Array.isArray(candidate.websiteSignals.categoryTerms) || candidate.websiteSignals.categoryTerms.length < 2)) {
    errors.push('candidate needs at least two category evidence terms');
  }
  if (candidate && candidate.liveDemo && /guarantee|guaranteed|measured roi|will increase/i.test([
    candidate.liveDemo.proofMove,
    candidate.liveDemo.storyAnchor,
    candidate.liveDemo.roiSoWhat,
    candidate.liveDemo.competitiveContrast
  ].join(' '))) {
    errors.push('candidate story cannot make guaranteed or measured ROI claims');
  }
  if (candidate && LANE_PACKS.some((lanePack) => lanePack.packId === candidate.packId)) {
    warnings.push('candidate pack id already exists and would require an explicit replacement review');
  }
  return {
    schema: 'forge.lane-pack-authoring-review.v1',
    status: errors.length ? 'rejected' : 'review_ready',
    installAllowed: false,
    humanReviewRequired: true,
    nllmAdvisoryOnly: true,
    errors,
    warnings,
    candidatePackId: candidate && candidate.packId || ''
  };
}

function consultantStorySurfaceFromLanePack(input, lanePack, normalizedImport) {
  const resolution = resolveLanePackFromEvidence(input || {});
  const selected = lanePack || (resolution.status === 'insufficient_evidence' ? null : resolution.lanePack);
  const records = normalizedImport && Array.isArray(normalizedImport.displayReadyRecords)
    ? normalizedImport.displayReadyRecords
    : [];
  const visibleRecords = records.filter((record) => record && record.normalConsultantVisible !== false && record.linkAuthorityStatus !== 'blocked_invalid_internal_id');
  const firstProof = visibleRecords.find((record) => record && record.canonicalRole && !/customer|sales_order/.test(record.canonicalRole)) || visibleRecords[0] || null;
  const advisory = nllmAdvisoryPayloadForLanePack(input || {}, selected);
  if (!selected) {
    return {
      schema: 'forge.consultant-story-surface.v1',
      status: 'needs_lane_confirmation',
      openTarget: 'Confirm lane before opening proof records.',
      proofMove: 'Prove only what the imported records and website evidence support.',
      safeClaim: 'Evidence is not strong enough for a lane claim yet.',
      doNotClaim: 'Do not claim industry fit, ROI, record creation, or availability without confirmed evidence.',
      buyerFacingSoWhat: 'Keep the buyer story grounded in confirmed evidence and visible uncertainty.',
      nllmAdvisory: {
        confidence: 'low',
        uncertainty: 'Lane evidence is insufficient; ask for confirmation.',
        allowedTasks: advisory.allowedTasks,
        hardLimits: advisory.hardLimits
      }
    };
  }
  return {
    schema: 'forge.consultant-story-surface.v1',
    status: firstProof ? 'story_ready' : 'story_ready_without_open_target',
    packId: selected.packId,
    laneLabel: selected.label,
    openTarget: firstProof ? `Open ${firstProof.name}${firstProof.consultantLabel ? ` (${firstProof.consultantLabel})` : ''}.` : selected.liveDemo.proofMove,
    openUrl: firstProof && firstProof.supportedOpenUrl || '',
    proofMove: selected.liveDemo.proofMove,
    safeClaim: selected.liveDemo.storyAnchor,
    doNotClaim: `Do not claim ${selected.vocabulary.forbidden.join(', ')} or measured ROI without evidence.`,
    buyerFacingSoWhat: selected.liveDemo.roiSoWhat,
    competitiveContrast: selected.liveDemo.competitiveContrast,
    nllmAdvisory: {
      confidence: resolution.confidence,
      uncertainty: resolution.status === 'resolved' ? 'Low uncertainty: website evidence resolved the lane pack.' : 'Visible uncertainty: ask for confirmation before treating the pack as truth.',
      writeAuthority: 'none',
      creationAllowed: false,
      allowedTasks: advisory.allowedTasks,
      hardLimits: advisory.hardLimits
    }
  };
}

module.exports = {
  LANE_PACK_SCHEMA_VERSION,
  NLLM_ALLOWED_TASKS,
  NLLM_HARD_LIMITS,
  LANE_PACKS,
  validateLanePack,
  resolveLanePackFromEvidence,
  nllmAdvisoryPayloadForLanePack,
  reviewProposedLanePackChange,
  consultantStorySurfaceFromLanePack,
  domainFromWebsite
};
