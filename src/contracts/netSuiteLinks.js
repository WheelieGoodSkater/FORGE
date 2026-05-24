'use strict';

const SUPPORTED_RECORD_PATHS = Object.freeze({
  customer: '/app/common/entity/custjob.nl',
  salesorder: '/app/accounting/transactions/salesord.nl',
  inventoryitem: '/app/common/item/item.nl',
  matrixitem: '/app/common/item/item.nl',
  assemblyitem: '/app/common/item/item.nl',
  item: '/app/common/item/item.nl'
});

function numericInternalId(value) {
  return /^\d+$/.test(String(value || '').trim());
}

function supportedNetSuiteUrl(url) {
  const value = String(url || '').trim();
  return /^\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value) ||
    /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value);
}

function buildNetSuiteRecordUrl(recordType, internalId, accountId) {
  const id = String(internalId || '').trim();
  if (!numericInternalId(id)) return '';
  const type = String(recordType || '').toLowerCase();
  const path = SUPPORTED_RECORD_PATHS[type] || '';
  if (!path) return '';
  const account = String(accountId || '').toLowerCase().replace(/_/g, '-');
  const origin = account ? `https://${account}.app.netsuite.com` : '';
  return `${origin}${path}?id=${id}`;
}

function linkValidation(record) {
  const source = record || {};
  const internalId = String(source.internalId || source.id || '').trim();
  const url = String(source.url || source.openableUrl || '').trim();
  return {
    numericInternalId: numericInternalId(internalId),
    supportedUrl: supportedNetSuiteUrl(url),
    openable: numericInternalId(internalId) && supportedNetSuiteUrl(url),
    internalId,
    url
  };
}

module.exports = {
  SUPPORTED_RECORD_PATHS,
  numericInternalId,
  supportedNetSuiteUrl,
  buildNetSuiteRecordUrl,
  linkValidation
};
