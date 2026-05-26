'use strict';

const RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION = 'forge.w291.returned-record-display-ready-import.v1';

const DISPLAY_READY_RECORD_STATUSES = Object.freeze({
  VALID: 'display_ready_records_valid',
  MISSING: 'display_ready_records_missing',
  BLOCKED_INVALID_ID: 'display_ready_record_blocked_invalid_id',
  BLOCKED_UNSUPPORTED_URL: 'display_ready_record_blocked_unsupported_url',
  HIDDEN_INTERNAL: 'display_ready_record_hidden_internal',
  NOT_IMPORT_VALID: 'display_ready_records_not_import_valid'
});

const REQUIRED_RECORD_FIELDS = Object.freeze([
  'canonicalRole',
  'consultantLabel',
  'recordName',
  'netSuiteRecordType',
  'numericInternalId',
  'supportedOpenUrl',
  'linkAuthorityStatus',
  'sourceConfidence',
  'normalConsultantVisible',
  'laneAwareLabelSource',
  'evidenceGuardrailSource'
]);

function stringValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function bool(value) {
  return value === true;
}

function numericId(value) {
  const id = stringValue(value).trim();
  return /^[0-9]+$/.test(id) ? id : '';
}

function supportedNetSuiteUrl(value) {
  const url = stringValue(value).trim();
  if (!url) return '';
  if (!/^https:\/\/[^/]+\.app\.netsuite\.com\/app\//i.test(url)) return '';
  if (/REPLACE_|YOUR_ACCOUNT_ID|example\.com|javascript:/i.test(url)) return '';
  return url;
}

function linkAuthorityStatus(record) {
  const authority = (record && record.linkAuthority) || {};
  return stringValue(record && (record.linkAuthorityStatus || authority.status));
}

function openUrl(record) {
  return stringValue(record && (record.supportedOpenUrl || record.openUrl || record.openableUrl || record.url));
}

function internalId(record) {
  return stringValue(record && (record.internalId || record.id));
}

function normalVisible(record) {
  if (!record) return false;
  if (record.normalConsultantVisible === false) return false;
  if (record.internalDiagnostic === true || record.adminOnly === true) return false;
  const authority = record.linkAuthority || {};
  if (authority.hiddenFromNormalConsultantUi === true) return false;
  return true;
}

function normalizeDisplayReadyRecord(record, options) {
  const source = record || {};
  const opts = options || {};
  const id = numericId(internalId(source));
  const url = supportedNetSuiteUrl(openUrl(source));
  const authority = source.linkAuthority || {};
  const authorityStatus = linkAuthorityStatus(source) || (authority.openable === true ? 'verified_openable' : 'not_verified');
  const visible = normalVisible(source);
  const label = stringValue(source.consultantLabel || source.label);
  const role = stringValue(source.canonicalRole || source.role);
  const recordName = stringValue(source.recordName || source.name);
  return {
    schema: 'forge.w291.display-ready-returned-record.v1',
    canonicalRole: role,
    consultantLabel: label,
    recordName,
    netSuiteRecordType: stringValue(source.netSuiteRecordType || source.recordType || source.type),
    numericInternalId: id,
    supportedOpenUrl: url,
    linkAuthorityStatus: authorityStatus,
    sourceConfidence: stringValue(source.sourceConfidence || source.confidence || 'supplied_w245_fact'),
    normalConsultantVisible: visible,
    laneAwareLabelSource: stringValue(source.laneAwareLabelSource || opts.laneAwareLabelSource || 'W250 lane-aware label facts'),
    evidenceGuardrailSource: stringValue(source.evidenceGuardrailSource || opts.evidenceGuardrailSource || 'W245 normalized import + verified link authority facts'),
    safeToOpen: visible && !!id && !!url && (authority.openable === true || authorityStatus === 'verified_openable'),
    sourceRecord: source
  };
}

function recordsFromInput(input) {
  const source = input || {};
  if (Array.isArray(source.records)) return source.records;
  if (Array.isArray(source.displayReadyRecords)) return source.displayReadyRecords;
  if (source.normalizedImport && Array.isArray(source.normalizedImport.displayReadyRecords)) {
    return source.normalizedImport.displayReadyRecords;
  }
  if (source.w245 && Array.isArray(source.w245.displayReadyRecords)) return source.w245.displayReadyRecords;
  return [];
}

function w245FactsValid(input) {
  const source = input || {};
  const w245 = source.w245 || source.normalizedImport || {};
  if (source.w245ImportValid === false || source.w245CanonicalNormalizationReady === false) return false;
  if (source.w245ImportValid === true || source.w245CanonicalNormalizationReady === true) return true;
  return w245.status === 'display_ready_records_normalized' || w245.ready === true;
}

function statusForRecords(records, importValid) {
  if (!importValid) return DISPLAY_READY_RECORD_STATUSES.NOT_IMPORT_VALID;
  if (!records.length) return DISPLAY_READY_RECORD_STATUSES.MISSING;
  const visible = records.filter((record) => record.normalConsultantVisible !== false);
  if (!visible.length) return DISPLAY_READY_RECORD_STATUSES.HIDDEN_INTERNAL;
  if (visible.some((record) => !record.numericInternalId)) return DISPLAY_READY_RECORD_STATUSES.BLOCKED_INVALID_ID;
  if (visible.some((record) => !record.supportedOpenUrl || record.safeToOpen !== true)) {
    return DISPLAY_READY_RECORD_STATUSES.BLOCKED_UNSUPPORTED_URL;
  }
  return DISPLAY_READY_RECORD_STATUSES.VALID;
}

function blockedReasonsForStatus(status, records, importValid) {
  if (status === DISPLAY_READY_RECORD_STATUSES.VALID) return [];
  if (!importValid) return ['w245_import_valid_fact_not_supplied'];
  if (status === DISPLAY_READY_RECORD_STATUSES.MISSING) return ['display_ready_records_missing'];
  if (status === DISPLAY_READY_RECORD_STATUSES.HIDDEN_INTERNAL) return ['records_hidden_from_normal_consultant_ui'];
  if (status === DISPLAY_READY_RECORD_STATUSES.BLOCKED_INVALID_ID) return ['numeric_internal_id_missing_or_invalid'];
  if (status === DISPLAY_READY_RECORD_STATUSES.BLOCKED_UNSUPPORTED_URL) return ['supported_open_url_missing_or_unsupported'];
  return records.length ? ['display_ready_records_blocked'] : ['display_ready_records_missing'];
}

function evaluateReturnedRecordDisplayReadyImport(input) {
  const source = input || {};
  const importValid = w245FactsValid(source);
  const records = recordsFromInput(source).map((record) => normalizeDisplayReadyRecord(record, source));
  const visibleRecords = records.filter((record) => record.normalConsultantVisible !== false);
  const hiddenRecords = records.filter((record) => record.normalConsultantVisible === false);
  const status = statusForRecords(records, importValid);
  return {
    schema: RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION,
    status,
    displayReady: status === DISPLAY_READY_RECORD_STATUSES.VALID,
    blockedReasons: blockedReasonsForStatus(status, records, importValid),
    requiredRecordFields: REQUIRED_RECORD_FIELDS.slice(),
    records,
    visibleRecords,
    hiddenRecords,
    importFacts: {
      w245ImportValid: importValid,
      w245ValidationConsumedNotReplaced: true,
      w151ValidationConsumedNotReplaced: true,
      w214SemanticGuardConsumedNotReplaced: true
    },
    openLinkAuthority: {
      allVisibleRecordsHaveNumericIds: visibleRecords.every((record) => !!record.numericInternalId),
      allVisibleRecordsHaveSupportedOpenUrls: visibleRecords.every((record) => !!record.supportedOpenUrl),
      allVisibleRecordsSafeToOpen: visibleRecords.every((record) => record.safeToOpen === true)
    },
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noUiRendering: true,
      finishBuildMutationStaysDrawerOwned: true
    }
  };
}

function contractSummary() {
  return {
    schema: RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION,
    status: 'contract_ready',
    statuses: Object.keys(DISPLAY_READY_RECORD_STATUSES).map((key) => DISPLAY_READY_RECORD_STATUSES[key]),
    requiredRecordFields: REQUIRED_RECORD_FIELDS.slice(),
    selectedFromW290: 'returned_record_display_ready_import_contract_w291',
    futureBridge: 'src/contracts/returnedRecordDisplayReadyImportBridge.js',
    runtimeBoundary: {
      noStateMutation: true,
      noRecordImport: true,
      noRecordCreation: true,
      noTransactionWrites: true,
      noOpenLinkCreation: true,
      noUiRendering: true,
      finishBuildMutationStaysDrawerOwned: true
    }
  };
}

module.exports = {
  RETURNED_RECORD_DISPLAY_READY_IMPORT_SCHEMA_VERSION,
  DISPLAY_READY_RECORD_STATUSES,
  REQUIRED_RECORD_FIELDS,
  normalizeDisplayReadyRecord,
  evaluateReturnedRecordDisplayReadyImport,
  contractSummary
};
