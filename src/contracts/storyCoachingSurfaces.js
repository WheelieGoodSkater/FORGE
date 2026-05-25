'use strict';

const STORY_COACHING_SCHEMA_VERSION = 'forge.w273.story-coaching-surfaces.v1';

const STORY_COACHING_SHAPES = Object.freeze({
  W254_EVIDENCE_RECEIPT: Object.freeze({
    schema: 'forge.w254.consultant-story-evidence-receipt.v1',
    requiredFields: Object.freeze(['status', 'renderAfterValidImportOnly', 'rows']),
    requiredRowIds: Object.freeze([
      'lane_pack_confidence',
      'website_evidence',
      'open_target_record',
      'conversation_notes',
      'nllm_limits',
      'uncertainty_gate'
    ])
  }),
  W255_FIRST_GLANCE: Object.freeze({
    schema: 'forge.w255.consultant-story-first-glance.v1',
    requiredFields: Object.freeze([
      'openTarget',
      'proveMove',
      'safeClaim',
      'doNotClaimGuardrail',
      'receiptSummary',
      'nextAction'
    ])
  }),
  W256_LIVE_DEMO_SCRIPT: Object.freeze({
    schema: 'forge.w256.consultant-live-demo-script.v1',
    requiredFields: Object.freeze(['status', 'source', 'lines', 'receiptSummary', 'nextAction']),
    requiredLineKeys: Object.freeze([
      'openingLine',
      'whatToOpen',
      'whatToProve',
      'safeBuyerClaim',
      'valueSoWhat',
      'stopGuardrail',
      'uncertaintyLine'
    ])
  }),
  W257_GUIDED_SEQUENCE: Object.freeze({
    schema: 'forge.w257.guided-demo-step-sequence.v1',
    requiredFields: Object.freeze([
      'status',
      'source',
      'steps',
      'stopCondition',
      'likelyBuyerObjection',
      'safeObjectionResponse',
      'uncertaintyResponse',
      'scriptStatus'
    ]),
    requiredStepIds: Object.freeze([
      'frame_buyer_problem',
      'open_returned_record',
      'prove_value_so_what'
    ])
  })
});

const POSITIVE_OVERCLAIM_PATTERNS = Object.freeze([
  Object.freeze({ id: 'record_creation_claim', pattern: /\b(records?\s+(were\s+)?created|created\s+records?|create[sd]?\s+netSuite\s+records?)\b/i }),
  Object.freeze({ id: 'drawer_write_claim', pattern: /\b(drawer\s+writes?|write\s+transactions?|transaction\s+writes?|writes?\s+to\s+netSuite)\b/i }),
  Object.freeze({ id: 'measured_or_guaranteed_roi_claim', pattern: /\b(measured\s+roi|guaranteed\s+roi|guaranteed\s+outcome|will\s+increase|will\s+reduce|guarantees?)\b/i }),
  Object.freeze({ id: 'unsupported_lane_fit_claim', pattern: /\b(confirmed\s+industry\s+fit|unsupported\s+lane\s+fit|definitely\s+the\s+right\s+lane)\b/i })
]);

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function shape(name) {
  return STORY_COACHING_SHAPES[name] || null;
}

function hasOwn(source, field) {
  return Object.prototype.hasOwnProperty.call(source || {}, field);
}

function packetMatchesShape(packet, contractShape) {
  const target = contractShape || {};
  const source = packet || {};
  if (target.schema && source.schema !== target.schema) return false;
  if (Array.isArray(target.requiredFields) && !target.requiredFields.every((field) => hasOwn(source, field))) return false;
  if (Array.isArray(target.requiredRowIds)) {
    const ids = arrayValue(source.rows).map((row) => row && row.id).filter(Boolean);
    if (!target.requiredRowIds.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  if (Array.isArray(target.requiredLineKeys)) {
    const lines = source.lines || {};
    if (!target.requiredLineKeys.every((key) => typeof lines[key] === 'string' && lines[key].trim())) return false;
  }
  if (Array.isArray(target.requiredStepIds)) {
    const ids = arrayValue(source.steps).map((step) => step && step.id).filter(Boolean);
    if (!target.requiredStepIds.every((id) => ids.indexOf(id) >= 0)) return false;
  }
  return true;
}

function collectPositiveStoryText(surface) {
  const source = surface || {};
  const pieces = [];
  [
    'openTarget',
    'proofMove',
    'safeClaim',
    'buyerFacingSoWhat',
    'competitiveContrast',
    'proveMove',
    'valueSoWhat',
    'safeBuyerClaim'
  ].forEach((field) => {
    if (typeof source[field] === 'string') pieces.push(source[field]);
  });
  const lines = source.lines || {};
  [
    'openingLine',
    'whatToOpen',
    'whatToProve',
    'safeBuyerClaim',
    'valueSoWhat'
  ].forEach((field) => {
    if (typeof lines[field] === 'string') pieces.push(lines[field]);
  });
  arrayValue(source.steps).forEach((step) => {
    if (step && typeof step.line === 'string') pieces.push(step.line);
  });
  if (typeof source.safeObjectionResponse === 'string') pieces.push(source.safeObjectionResponse);
  return pieces.join(' ');
}

function collectGuardrailText(surface) {
  const source = surface || {};
  const pieces = [];
  ['doNotClaim', 'doNotClaimGuardrail', 'stopGuardrail', 'stopCondition', 'uncertaintyResponse'].forEach((field) => {
    if (typeof source[field] === 'string') pieces.push(source[field]);
  });
  const lines = source.lines || {};
  ['stopGuardrail', 'uncertaintyLine'].forEach((field) => {
    if (typeof lines[field] === 'string') pieces.push(lines[field]);
  });
  const receiptRows = arrayValue(source.rows).concat(arrayValue(source.evidenceReceiptW254 && source.evidenceReceiptW254.rows));
  receiptRows.forEach((row) => {
    if (row && /nllm_limits|uncertainty_gate/i.test(row.id || '') && typeof row.value === 'string') pieces.push(row.value);
  });
  const advisory = source.nllmAdvisory || {};
  if (typeof advisory.uncertainty === 'string') pieces.push(advisory.uncertainty);
  if (typeof advisory.writeAuthority === 'string') pieces.push(`writeAuthority:${advisory.writeAuthority}`);
  return pieces.join(' ');
}

function consultantSafeGuardrailCheck(surface, options) {
  const opts = options || {};
  const positiveText = collectPositiveStoryText(surface);
  const guardrailText = collectGuardrailText(surface);
  const allText = `${positiveText} ${guardrailText}`;
  const violations = [];
  POSITIVE_OVERCLAIM_PATTERNS.forEach((item) => {
    if (item.pattern.test(positiveText)) violations.push(item.id);
  });
  if (opts.requireAdvisoryOnly !== false && !/advisory\s+only|writeAuthority:none|writeAuthority:\s*none/i.test(allText)) {
    violations.push('nllm_advisory_only_missing');
  }
  if (opts.requireUncertaintyVisible !== false && !/uncertainty|confirmation|confirm/i.test(allText)) {
    violations.push('uncertainty_visibility_missing');
  }
  if (/hide\s+uncertainty|uncertainty\s+hidden|without\s+showing\s+uncertainty/i.test(allText)) {
    violations.push('hidden_uncertainty_claim');
  }
  return {
    schema: 'forge.w273.consultant-safe-guardrail-check.v1',
    status: violations.length ? 'rejected' : 'pass',
    violations,
    positiveText,
    guardrailText
  };
}

function receiptVisibilityStatus(receipt, hasValidImport) {
  const source = receipt || {};
  return {
    schema: 'forge.w273.receipt-visibility-status.v1',
    renderAfterValidImportOnly: source.renderAfterValidImportOnly === true,
    receiptReady: source.status === 'receipt_ready',
    shouldRender: hasValidImport === true && source.status === 'receipt_ready',
    shouldHide: hasValidImport !== true || source.status !== 'receipt_ready'
  };
}

function exportedContractSummary() {
  return {
    schema: STORY_COACHING_SCHEMA_VERSION,
    shapes: STORY_COACHING_SHAPES,
    guardrails: [
      'no record-creation claims',
      'no drawer-write claims',
      'no measured or guaranteed ROI claims',
      'no unsupported lane-fit claims',
      'uncertainty remains visible',
      'N/LLM remains advisory-only'
    ]
  };
}

module.exports = {
  STORY_COACHING_SCHEMA_VERSION,
  STORY_COACHING_SHAPES,
  POSITIVE_OVERCLAIM_PATTERNS,
  shape,
  packetMatchesShape,
  consultantSafeGuardrailCheck,
  receiptVisibilityStatus,
  exportedContractSummary
};
