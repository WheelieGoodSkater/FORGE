'use strict';

const STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION = 'forge.w295.story-surface-update-inputs.v1';

const STORY_UPDATE_INPUT_STATUSES = Object.freeze({
  READY: 'story_update_inputs_ready',
  WAITING_FOR_VALID_IMPORT: 'story_update_inputs_waiting_for_valid_import',
  NEED_LANE_CONFIRMATION: 'story_update_inputs_need_lane_confirmation',
  BLOCKED_MISSING_OPEN_TARGET: 'story_update_inputs_blocked_missing_open_target',
  BLOCKED_HIDDEN_UNCERTAINTY: 'story_update_inputs_blocked_hidden_uncertainty'
});

const REQUIRED_RECEIPT_ROW_IDS = Object.freeze([
  'lane_pack_confidence',
  'website_evidence',
  'open_target_record',
  'conversation_notes',
  'nllm_limits',
  'uncertainty_gate'
]);

const REQUIRED_FIRST_GLANCE_FIELDS = Object.freeze([
  'openTarget',
  'proveMove',
  'safeClaim',
  'doNotClaimGuardrail',
  'receiptSummary',
  'nextAction'
]);

const REQUIRED_SCRIPT_LINE_KEYS = Object.freeze([
  'openingLine',
  'whatToOpen',
  'whatToProve',
  'safeBuyerClaim',
  'valueSoWhat',
  'stopGuardrail',
  'uncertaintyLine'
]);

const REQUIRED_SEQUENCE_STEP_IDS = Object.freeze([
  'frame_buyer_problem',
  'open_returned_record',
  'prove_value_so_what'
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

function own(source, field) {
  return Object.prototype.hasOwnProperty.call(source || {}, field);
}

function nested(source, path) {
  return path.reduce((value, field) => (value && value[field] !== undefined ? value[field] : undefined), source || {});
}

function firstObject(...candidates) {
  return candidates.find((candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)) || {};
}

function returnedRecordFacts(source) {
  return firstObject(source.returnedRecordFacts, source.returnedRecords, source.displayReadyImport, source.w293ReturnedRecordFacts);
}

function visibleRecordsFromFacts(facts) {
  return arrayValue(facts.visibleRecords || facts.records).filter((record) => record && record.normalConsultantVisible !== false);
}

function w245ImportFactsValid(source) {
  const facts = returnedRecordFacts(source);
  if (source.validImport === true || source.w245ImportValid === true) return true;
  if (facts.status === 'display_ready_records_valid' || facts.displayReady === true) return true;
  if (facts.importFacts && facts.importFacts.w245ImportValid === true) return true;
  return false;
}

function supportedOpenTargetFromRecords(source) {
  const facts = returnedRecordFacts(source);
  const visible = visibleRecordsFromFacts(facts);
  const safeRecords = visible.filter((record) =>
    record &&
    record.safeToOpen === true &&
    stringValue(record.recordName || record.name).trim() &&
    stringValue(record.supportedOpenUrl || record.openUrl || record.url).trim()
  );
  return safeRecords.find((record) => /sku|product|availability|proof|flow/i.test(stringValue(record.canonicalRole || record.role || record.consultantLabel))) ||
    safeRecords.find((record) => /sales_order|transaction/i.test(stringValue(record.canonicalRole || record.role || record.consultantLabel))) ||
    safeRecords[0] ||
    null;
}

function firstGlance(source) {
  return firstObject(source.w255FirstGlance, source.firstGlance, source.story && source.story.firstGlance);
}

function receipt(source) {
  return firstObject(source.w254Receipt, source.receipt, source.story && source.story.evidenceReceiptW254);
}

function script(source) {
  return firstObject(source.w256Script, source.script, source.story && source.story.liveDemoScriptW256);
}

function sequence(source) {
  return firstObject(source.w257Sequence, source.sequence, source.story && source.story.guidedSequenceW257);
}

function receiptInputReady(source) {
  const rows = arrayValue(receipt(source).rows);
  const ids = rows.map((row) => row && row.id).filter(Boolean);
  return REQUIRED_RECEIPT_ROW_IDS.every((id) => ids.indexOf(id) >= 0);
}

function firstGlanceInputReady(source) {
  const glance = firstGlance(source);
  return REQUIRED_FIRST_GLANCE_FIELDS.every((field) => own(glance, field) && stringValue(glance[field]).trim());
}

function scriptInputReady(source) {
  const lines = script(source).lines || {};
  return REQUIRED_SCRIPT_LINE_KEYS.every((field) => typeof lines[field] === 'string' && lines[field].trim());
}

function sequenceInputReady(source) {
  const ids = arrayValue(sequence(source).steps).map((step) => step && step.id).filter(Boolean);
  return REQUIRED_SEQUENCE_STEP_IDS.every((id) => ids.indexOf(id) >= 0);
}

function lanePackFacts(source) {
  const story = source.story || {};
  const lanePack = firstObject(source.lanePack, story.lanePack, source.resolvedLanePack);
  return {
    packId: stringValue(lanePack.packId || lanePack.id || story.packId || source.packId),
    laneLabel: stringValue(lanePack.laneLabel || lanePack.label || story.laneLabel || source.laneLabel),
    confidence: stringValue(lanePack.confidence || story.confidence || nested(story, ['nllmAdvisory', 'confidence']) || source.lanePackConfidence)
  };
}

function supportedOpenAuthority(source) {
  const facts = returnedRecordFacts(source);
  const authority = firstObject(source.openLinkAuthority, facts.openLinkAuthority);
  return {
    allVisibleRecordsHaveNumericIds: bool(authority.allVisibleRecordsHaveNumericIds),
    allVisibleRecordsHaveSupportedOpenUrls: bool(authority.allVisibleRecordsHaveSupportedOpenUrls),
    allVisibleRecordsSafeToOpen: bool(authority.allVisibleRecordsSafeToOpen)
  };
}

function hasSupportedOpenTarget(source) {
  const explicit = stringValue(source.openTarget || firstGlance(source).openTarget || nested(source, ['story', 'openTarget'])).trim();
  if (explicit && !/confirm lane before opening proof records/i.test(explicit)) return true;
  return !!supportedOpenTargetFromRecords(source);
}

function laneConfirmationNeeded(source) {
  const story = source.story || {};
  const lane = lanePackFacts(source);
  if (source.laneConfirmationRequired === false && source.weakEvidence === false && source.conflictingEvidence !== true && !/low|weak|conflicting|needs/i.test(lane.confidence)) {
    return false;
  }
  return source.weakEvidence === true ||
    source.laneConfirmationRequired === true ||
    source.conflictingEvidence === true ||
    story.status === 'needs_lane_confirmation' ||
    /low|weak|conflicting|needs/i.test(lane.confidence);
}

function nllmAndUncertaintyFacts(source) {
  const story = source.story || {};
  const advisory = firstObject(source.nllm, source.nllmAdvisory, story.nllmAdvisory);
  return {
    advisoryOnly: advisory.advisoryOnly === true || source.nllmAdvisoryOnly === true || /advisory/i.test(stringValue(advisory.role)),
    writeAuthority: stringValue(advisory.writeAuthority || source.nllmWriteAuthority || 'none'),
    creationAllowed: advisory.creationAllowed === true || source.nllmCreationAllowed === true,
    uncertaintyVisible: advisory.uncertaintyVisible === true || source.uncertaintyVisible === true || !!stringValue(advisory.uncertainty).trim(),
    hardLimits: arrayValue(advisory.hardLimits || advisory.limits)
  };
}

function hiddenUncertaintyOrBadNllm(source) {
  const nllm = nllmAndUncertaintyFacts(source);
  return nllm.advisoryOnly !== true ||
    nllm.creationAllowed === true ||
    nllm.writeAuthority !== 'none' ||
    nllm.uncertaintyVisible !== true ||
    source.hideUncertainty === true ||
    source.uncertaintyHidden === true;
}

function statusAndReasons(source) {
  const reasons = [];
  if (hiddenUncertaintyOrBadNllm(source)) {
    reasons.push('nllm_must_remain_advisory_only_and_uncertainty_visible');
    return { status: STORY_UPDATE_INPUT_STATUSES.BLOCKED_HIDDEN_UNCERTAINTY, reasons };
  }
  if (!w245ImportFactsValid(source)) {
    reasons.push('valid_w245_returned_record_import_facts_missing');
    return { status: STORY_UPDATE_INPUT_STATUSES.WAITING_FOR_VALID_IMPORT, reasons };
  }
  if (!hasSupportedOpenTarget(source) || !supportedOpenAuthority(source).allVisibleRecordsSafeToOpen) {
    reasons.push('supported_open_target_missing_or_not_authoritative');
    return { status: STORY_UPDATE_INPUT_STATUSES.BLOCKED_MISSING_OPEN_TARGET, reasons };
  }
  if (laneConfirmationNeeded(source)) {
    reasons.push('lane_confirmation_required_before_story_claims');
    return { status: STORY_UPDATE_INPUT_STATUSES.NEED_LANE_CONFIRMATION, reasons };
  }
  if (!receiptInputReady(source)) reasons.push('w254_receipt_inputs_incomplete');
  if (!firstGlanceInputReady(source)) reasons.push('w255_first_glance_inputs_incomplete');
  if (!scriptInputReady(source)) reasons.push('w256_script_inputs_incomplete');
  if (!sequenceInputReady(source)) reasons.push('w257_sequence_inputs_incomplete');
  return {
    status: STORY_UPDATE_INPUT_STATUSES.READY,
    reasons
  };
}

function normalizeStorySurfaceUpdateInputs(input) {
  const source = input || {};
  const facts = returnedRecordFacts(source);
  const recordTarget = supportedOpenTargetFromRecords(source);
  const status = statusAndReasons(source);
  const nllm = nllmAndUncertaintyFacts(source);
  return {
    schema: STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION,
    status: status.status,
    ready: status.status === STORY_UPDATE_INPUT_STATUSES.READY,
    blockedReasons: status.reasons,
    returnedRecordFacts: {
      status: stringValue(facts.status),
      displayReady: facts.displayReady === true,
      visibleRecordCount: visibleRecordsFromFacts(facts).length,
      openTargetRecordName: stringValue(recordTarget && (recordTarget.recordName || recordTarget.name)) ||
        stringValue(source.openTarget || firstGlance(source).openTarget),
      source: 'W245/W293 supplied returned-record facts'
    },
    lanePack: lanePackFacts(source),
    laneAwareLabelSource: stringValue(source.labelSource || source.laneAwareLabelSource || 'W250 lane-aware label facts'),
    openLinkAuthority: supportedOpenAuthority(source),
    receiptInputs: {
      schema: stringValue(receipt(source).schema),
      ready: receiptInputReady(source),
      requiredRowIds: REQUIRED_RECEIPT_ROW_IDS.slice()
    },
    firstGlanceInputs: {
      schema: stringValue(firstGlance(source).schema),
      ready: firstGlanceInputReady(source),
      requiredFields: REQUIRED_FIRST_GLANCE_FIELDS.slice()
    },
    scriptInputs: {
      schema: stringValue(script(source).schema),
      ready: scriptInputReady(source),
      requiredLineKeys: REQUIRED_SCRIPT_LINE_KEYS.slice()
    },
    sequenceInputs: {
      schema: stringValue(sequence(source).schema),
      ready: sequenceInputReady(source),
      requiredStepIds: REQUIRED_SEQUENCE_STEP_IDS.slice()
    },
    weakEvidence: {
      confirmationRequired: laneConfirmationNeeded(source),
      weakEvidence: source.weakEvidence === true,
      conflictingEvidence: source.conflictingEvidence === true
    },
    nllm: {
      advisoryOnly: nllm.advisoryOnly,
      writeAuthority: nllm.writeAuthority,
      creationAllowed: nllm.creationAllowed,
      uncertaintyVisible: nllm.uncertaintyVisible,
      hardLimitsVisible: nllm.hardLimits.length > 0
    },
    validationBoundary: {
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true,
      cannotDeclareImportValidWithoutSuppliedFacts: true
    },
    runtimeBoundary: {
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
    schema: STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION,
    status: 'contract_ready',
    statuses: Object.keys(STORY_UPDATE_INPUT_STATUSES).map((key) => STORY_UPDATE_INPUT_STATUSES[key]),
    representedInputs: [
      'W245/W293 returned record facts used by story surfaces',
      'W246 resolved lane pack and confidence',
      'W250 lane-aware label source',
      'supported Open-link authority',
      'W254 receipt input rows',
      'W255 first-glance input fields',
      'W256 live-demo script input fields',
      'W257 guided sequence input fields',
      'weak/conflicting evidence confirmation state',
      'N/LLM advisory-only limits and uncertainty visibility'
    ],
    selectedFromW294: 'story_surface_update_input_contract_w295',
    futureBridge: 'src/contracts/storySurfaceUpdateInputBridge.js',
    runtimeBoundary: {
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
  STORY_SURFACE_UPDATE_INPUTS_SCHEMA_VERSION,
  STORY_UPDATE_INPUT_STATUSES,
  REQUIRED_RECEIPT_ROW_IDS,
  REQUIRED_FIRST_GLANCE_FIELDS,
  REQUIRED_SCRIPT_LINE_KEYS,
  REQUIRED_SEQUENCE_STEP_IDS,
  normalizeStorySurfaceUpdateInputs,
  contractSummary
};
