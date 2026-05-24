'use strict';

const { canonicalRole, labelForRole, LEGACY_SLOT_TO_ROLE } = require('./recordRoles');
const { numericInternalId, supportedNetSuiteUrl } = require('./netSuiteLinks');

const LEGACY_SLOT_ORDER = Object.freeze([
  'customer',
  'demoTransaction',
  'salesOrder',
  'heroItem',
  'matrixProofItem',
  'matrixItem',
  'componentItem'
]);

function normalizeRecordShape(record, role, operatingMode) {
  const source = record || {};
  const normalizedRole = canonicalRole(source.role || role, operatingMode);
  return {
    role: normalizedRole,
    legacyRole: role || source.legacyRole || '',
    label: source.label || labelForRole(normalizedRole),
    recordType: source.recordType || source.type || '',
    type: source.type || source.recordType || '',
    name: String(source.name || source.displayName || '').trim(),
    internalId: String(source.internalId || source.id || '').trim(),
    url: String(source.url || source.openableUrl || '').trim()
  };
}

function collectLegacyRecords(source, operatingMode) {
  const recordsObject = source && source.records && !Array.isArray(source.records) ? source.records : {};
  const collected = [];
  LEGACY_SLOT_ORDER.forEach((slot) => {
    const record = recordsObject[slot] || source && source[slot];
    if (!record) return;
    collected.push(normalizeRecordShape(record, LEGACY_SLOT_TO_ROLE[slot] || slot, operatingMode));
  });
  const componentItems = recordsObject.componentItems || source && source.componentItems;
  if (Array.isArray(componentItems)) {
    componentItems.forEach((record, index) => {
      collected.push(normalizeRecordShape(record, index === 0 ? 'componentItem' : 'component_item', operatingMode));
    });
  }
  return collected;
}

function normalizeRunnerResultToCanonical(raw, options) {
  const opts = options || {};
  const source = raw && raw.finalGeneratedNamesJson ? raw.finalGeneratedNamesJson : raw || {};
  const operatingMode = source.resolvedOperatingMode || opts.resolvedOperatingMode || '';
  const canonicalRecords = Array.isArray(source.records)
    ? source.records.map((record) => normalizeRecordShape(record, record && record.role, operatingMode))
    : collectLegacyRecords(source, operatingMode);
  const uniqueRecords = [];
  const seen = new Set();
  canonicalRecords.forEach((record) => {
    const key = `${record.role}|${record.internalId}|${record.url}|${record.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniqueRecords.push(record);
  });
  const linkFailures = uniqueRecords
    .filter((record) => !numericInternalId(record.internalId) || !supportedNetSuiteUrl(record.url))
    .map((record) => ({
      role: record.role,
      name: record.name,
      internalId: record.internalId,
      url: record.url,
      numericInternalId: numericInternalId(record.internalId),
      supportedUrl: supportedNetSuiteUrl(record.url)
    }));
  return {
    schema: 'forge.completed-runner-result.compatibility.v1',
    status: linkFailures.length ? 'canonical_records_blocked' : 'canonical_records_ready',
    resolvedOperatingMode: operatingMode,
    records: uniqueRecords,
    linkFailures,
    allRecordsOpenable: linkFailures.length === 0 && uniqueRecords.length > 0
  };
}

module.exports = {
  LEGACY_SLOT_ORDER,
  normalizeRecordShape,
  normalizeRunnerResultToCanonical
};
