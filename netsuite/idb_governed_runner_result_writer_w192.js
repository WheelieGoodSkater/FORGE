/**
 * IDB Governed Runner Result Writer W192
 *
 * Server-side helper for the governed internal runner. The drawer never calls
 * this module directly; it is intended to run only after the internal build
 * engine has created or resolved real sandbox records.
 *
 * @NApiVersion 2.1
 */
define(['N/file', 'N/log'], (file, log) => {
  const WRITER_VERSION = 'w192-governed-runner-result-capture-writer';
  const RESULT_SCHEMA = 'idb.completed-runner-result-json.v1';
  const OWNER = 'governed_runner_internal_build_engine';

  const ROLE_CONFIG = {
    customer: {
      type: 'customer',
      urlPath: '/app/common/entity/custjob.nl'
    },
    demoTransaction: {
      type: 'salesorder',
      urlPath: '/app/accounting/transactions/salesord.nl'
    },
    heroItem: {
      type: 'inventoryitem',
      urlPath: '/app/common/item/item.nl'
    },
    matrixProofItem: {
      type: 'matrixitem',
      urlPath: '/app/common/item/item.nl'
    },
    componentItem: {
      type: 'inventoryitem',
      urlPath: '/app/common/item/item.nl'
    }
  };

  function numericId(value) {
    return /^\d+$/.test(String(value || '').trim());
  }

  function clean(value) {
    return String(value || '').trim();
  }

  function fileSafeToken(value) {
    return clean(value)
      .replace(/[^A-Za-z0-9_.-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 96) || 'missing-token';
  }

  function supportedNetSuiteUrl(url) {
    const value = clean(url);
    return /^\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+$/i.test(value) ||
      /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+$/i.test(value);
  }

  function buildRelativeUrl(role, internalId) {
    const config = ROLE_CONFIG[role] || {};
    return `${config.urlPath || '/app/common/item/item.nl'}?id=${clean(internalId)}`;
  }

  function normalizeRecord(role, source) {
    const config = ROLE_CONFIG[role] || {};
    const raw = source || {};
    const internalId = clean(raw.internalId || raw.id);
    const normalized = {
      type: clean(raw.type || raw.recordType || config.type || role),
      name: clean(raw.name || raw.displayName || raw.label),
      internalId,
      url: clean(raw.url || raw.recordUrl || (numericId(internalId) ? buildRelativeUrl(role, internalId) : ''))
    };
    return normalized;
  }

  function componentSource(records) {
    const source = records || {};
    if (source.componentItem) return source.componentItem;
    if (Array.isArray(source.componentItems) && source.componentItems.length) return source.componentItems[0];
    return null;
  }

  function buildCompletedRunnerResult(input) {
    const source = input || {};
    const records = source.records || {};
    const customer = normalizeRecord('customer', records.customer || source.customer);
    const demoTransaction = normalizeRecord('demoTransaction', records.demoTransaction || records.salesOrder || source.demoTransaction || source.salesOrder);
    const heroItem = normalizeRecord('heroItem', records.heroItem || source.heroItem);
    const matrixProofItem = normalizeRecord('matrixProofItem', records.matrixProofItem || records.matrixItem || source.matrixProofItem || source.matrixItem || records.heroItem || source.heroItem);
    const componentItem = normalizeRecord('componentItem', componentSource(records) || componentSource(source));
    return {
      schema: RESULT_SCHEMA,
      writerVersion: WRITER_VERSION,
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: OWNER,
      runnerTaskId: clean(source.runnerTaskId || source.sourceRunnerTaskId),
      idempotencyToken: clean(source.idempotencyToken || source.extId),
      prospect: clean(source.prospect),
      completedAt: clean(source.completedAt) || new Date().toISOString(),
      records: {
        customer,
        demoTransaction,
        heroItem,
        matrixProofItem,
        componentItem
      },
      demoTransaction,
      heroItem,
      matrixItem: matrixProofItem,
      componentItems: [componentItem]
    };
  }

  function validateCompletedRunnerResult(result) {
    const errors = [];
    const source = result || {};
    const records = source.records || {};
    if (source.schema !== RESULT_SCHEMA) errors.push(`schema must be ${RESULT_SCHEMA}.`);
    if (source.generatedRecordOwner !== OWNER) errors.push(`generatedRecordOwner must be ${OWNER}.`);
    if (!source.idempotencyToken) errors.push('idempotencyToken is required.');
    ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].forEach((role) => {
      const record = records[role] || {};
      if (!record.name) errors.push(`${role}.name is required.`);
      if (!numericId(record.internalId)) errors.push(`${role}.internalId must be numeric.`);
      if (!supportedNetSuiteUrl(record.url)) errors.push(`${role}.url must be a supported NetSuite record URL.`);
    });
    return {
      valid: errors.length === 0,
      errors
    };
  }

  function buildResultCaptureFileName(result) {
    const taskToken = fileSafeToken(result.runnerTaskId || 'runnerTaskId-pending');
    const idempotencyToken = fileSafeToken(result.idempotencyToken);
    return `idb-result-${taskToken}-${idempotencyToken}.json`;
  }

  function writeCompletedRunnerResult(input) {
    const resultCaptureFolderId = clean(input && input.resultCaptureFolderId);
    const completedRunnerResultJson = buildCompletedRunnerResult(input);
    const validation = validateCompletedRunnerResult(completedRunnerResultJson);
    if (!resultCaptureFolderId) validation.errors.push('resultCaptureFolderId is required.');
    if (validation.errors.length) {
      const blocked = {
        schema: 'idb.runner-result-capture-write.v1',
        writerVersion: WRITER_VERSION,
        saved: false,
        status: 'blocked_invalid_completed_runner_result',
        errors: validation.errors,
        completedRunnerResultJson: null,
        activeOpenLinks: 0
      };
      log.error({ title: 'IDB W192 result capture blocked', details: JSON.stringify(blocked) });
      return blocked;
    }
    const captureFile = file.create({
      name: buildResultCaptureFileName(completedRunnerResultJson),
      fileType: file.Type.JSON,
      folder: Number(resultCaptureFolderId),
      contents: JSON.stringify(completedRunnerResultJson, null, 2)
    });
    const fileId = captureFile.save();
    const saved = {
      schema: 'idb.runner-result-capture-write.v1',
      writerVersion: WRITER_VERSION,
      saved: true,
      status: 'completed_result_capture_saved',
      source: 'governed_internal_runner_server_side',
      fileId: String(fileId || ''),
      fileName: captureFile.name,
      resultCaptureFolderId,
      runnerTaskId: completedRunnerResultJson.runnerTaskId,
      idempotencyToken: completedRunnerResultJson.idempotencyToken,
      completedRunnerResultJson,
      activeOpenLinks: 0
    };
    log.audit({ title: 'IDB W192 result capture saved', details: JSON.stringify({ fileId: saved.fileId, fileName: saved.fileName }) });
    return saved;
  }

  return {
    writeCompletedRunnerResult,
    buildCompletedRunnerResult,
    validateCompletedRunnerResult,
    buildResultCaptureFileName,
    _test: {
      supportedNetSuiteUrl,
      numericId,
      normalizeRecord
    }
  };
});
