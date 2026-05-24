const SUPPORTED_RECORD_URLS = {
  customer: /^\/app\/common\/entity\/custjob\.nl\?id=\d+$/,
  salesorder: /^\/app\/accounting\/transactions\/salesord\.nl\?id=\d+$/,
  inventoryitem: /^\/app\/common\/item\/item\.nl\?id=\d+$/,
  matrixitem: /^\/app\/common\/item\/item\.nl\?id=\d+$/
};

const RUNNER_PARAM_MAP = {
  prospect: 'custscript_v3_runner_prospect',
  website: 'custscript_v3_runner_website',
  notes: 'custscript_v3_runner_notes',
  agenda: 'custscript_v3_runner_agenda',
  extId: 'custscript_v3_runner_extid',
  mappingId: 'custscript_v3_runner_mapping',
  folderId: 'custscript_v3_runner_folder',
  subsidiaryId: 'custscript_v3_runner_subsidiary',
  locationId: 'custscript_v3_runner_location',
  workCenterSearchId: 'custscript_v3_runner_wc_search',
  enableWip: 'custscript_v3_runner_enable_wip',
  enableManufacturing: 'custscript_v3_runner_enable_mfg',
  createNewHero: 'custscript_v3_runner_create_new_hero',
  heroItem: 'custscript_v3_runner_hero_item'
};

function normalizeBoolFlag(value) {
  return value === true || value === 'T' || value === 'true' || value === '1' ? 'T' : 'F';
}

function requireString(value, label, errors) {
  const normalized = String(value || '').trim();
  if (!normalized) errors.push(`${label} is required.`);
  return normalized;
}

function safeExternalToken(value) {
  return String(value || '')
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48)
    .toUpperCase();
}

function validateConfirmedBuildRequest(request) {
  const errors = [];
  if (!request || typeof request !== 'object') {
    return { valid: false, errors: ['request must be an object'] };
  }
  if (request.schema !== 'idb.confirmed-build-request.v1') errors.push('schema must be idb.confirmed-build-request.v1');
  if (request.requestStatus !== 'confirmed_ready_for_governed_runner') errors.push('requestStatus must be confirmed_ready_for_governed_runner');
  if (!request.consultantConfirmation || request.consultantConfirmation.confirmed !== true) errors.push('consultant confirmation is required.');
  if (!request.stateAuthority || request.stateAuthority.handoffParityStatus !== 'matched' || request.stateAuthority.noStateMismatch !== true) errors.push('state authority and handoff parity must be matched.');
  requireString(request.prospect && request.prospect.name, 'prospect.name', errors);
  requireString(request.demoPath && request.demoPath.laneId, 'demoPath.laneId', errors);
  requireString(request.demoPath && request.demoPath.scenario, 'demoPath.scenario', errors);
  if (!Array.isArray(request.requiredRecords) || !['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => request.requiredRecords.includes(role))) {
    errors.push('requiredRecords must include customer, demoTransaction, heroItem, matrixProofItem, and componentItem.');
  }
  return { valid: errors.length === 0, errors };
}

function buildRunnerAdapterInput(confirmedBuildRequest, runnerConfig, options) {
  const validation = validateConfirmedBuildRequest(confirmedBuildRequest);
  const errors = validation.errors.slice();
  const cfg = runnerConfig || {};
  const opts = options || {};
  const extSeed = safeExternalToken(`${confirmedBuildRequest && confirmedBuildRequest.prospect && confirmedBuildRequest.prospect.name}_${confirmedBuildRequest && confirmedBuildRequest.demoPath && confirmedBuildRequest.demoPath.laneId}`);
  const extId = String(opts.extId || `IDB_${extSeed || 'DEMO'}_${opts.sequence || '001'}`);

  const mappingId = requireString(cfg.mappingId, 'runnerConfig.mappingId', errors);
  const folderId = requireString(cfg.folderId, 'runnerConfig.folderId', errors);
  const subsidiaryId = requireString(cfg.subsidiaryId, 'runnerConfig.subsidiaryId', errors);
  const locationId = String(cfg.locationId || '').trim();

  const adapterInput = {
    schema: 'idb.governed-runner-adapter-input.v1',
    sourceRequestId: confirmedBuildRequest && confirmedBuildRequest.requestId,
    runMode: opts.runMode || 'write_disabled_dry_run',
    writeAuthority: 'governed_internal_runner_only',
    drawerAuthority: 'none',
    extId,
    runnerParams: {
      [RUNNER_PARAM_MAP.prospect]: String((confirmedBuildRequest.prospect || {}).name || ''),
      [RUNNER_PARAM_MAP.website]: String((confirmedBuildRequest.prospect || {}).website || ''),
      [RUNNER_PARAM_MAP.notes]: String((confirmedBuildRequest.storyInputs || {}).buyerNeed || ''),
      [RUNNER_PARAM_MAP.agenda]: String((confirmedBuildRequest.storyInputs || {}).scObjective || (confirmedBuildRequest.demoPath || {}).scenario || ''),
      [RUNNER_PARAM_MAP.extId]: extId,
      [RUNNER_PARAM_MAP.mappingId]: mappingId,
      [RUNNER_PARAM_MAP.folderId]: folderId,
      [RUNNER_PARAM_MAP.subsidiaryId]: subsidiaryId,
      [RUNNER_PARAM_MAP.locationId]: locationId,
      [RUNNER_PARAM_MAP.workCenterSearchId]: String(cfg.workCenterSearchId || ''),
      [RUNNER_PARAM_MAP.enableWip]: normalizeBoolFlag(cfg.enableWip),
      [RUNNER_PARAM_MAP.enableManufacturing]: normalizeBoolFlag(cfg.enableManufacturing),
      [RUNNER_PARAM_MAP.createNewHero]: normalizeBoolFlag(cfg.createNewHero),
      [RUNNER_PARAM_MAP.heroItem]: String(cfg.heroItemId || '')
    },
    requiredResultRoles: [
      'customer',
      'demoTransaction',
      'heroItem',
      'matrixProofItem',
      'componentItem'
    ],
    noSubmitRollback: {
      enabled: true,
      dryRunCreatesRecords: false,
      preSubmitFailureBehavior: 'return blocked result and do not promote imported names'
    },
    validation: {
      valid: errors.length === 0,
      errors
    }
  };

  return adapterInput;
}

function isSupportedRecordUrl(recordType, url) {
  const rx = SUPPORTED_RECORD_URLS[recordType];
  return !!(rx && rx.test(String(url || '')));
}

function normalizeCreatedRecord(role, record) {
  const source = record || {};
  const internalId = String(source.internalId || source.id || '').trim();
  const recordType = String(source.recordType || '').trim();
  const url = String(source.url || '').trim();
  const openable = /^\d+$/.test(internalId) && isSupportedRecordUrl(recordType, url);
  return {
    role,
    recordType,
    name: String(source.name || ''),
    internalId,
    url,
    createdOrResolvedBy: String(source.createdOrResolvedBy || 'governed_internal_runner'),
    openable
  };
}

function normalizeRunnerResultToIdbResult(runnerResult) {
  const records = (runnerResult && runnerResult.records) || {};
  const componentItems = Array.isArray(records.componentItems) ? records.componentItems : [];
  const normalized = {
    customer: normalizeCreatedRecord('customer', records.customer),
    demoTransaction: normalizeCreatedRecord('demoTransaction', records.demoTransaction),
    heroItem: normalizeCreatedRecord('heroItem', records.heroItem),
    matrixProofItem: normalizeCreatedRecord('matrixProofItem', records.matrixProofItem),
    componentItems: componentItems.map((item) => normalizeCreatedRecord('componentItem', item))
  };
  const required = [normalized.customer, normalized.demoTransaction, normalized.heroItem, normalized.matrixProofItem].concat(normalized.componentItems.slice(0, 1));
  const errors = required
    .filter((record) => !record.openable)
    .map((record) => `${record.role} is missing numeric id or supported URL.`);

  return {
    schema: 'idb.governed-runner-result-normalized.v1',
    runnerStatus: errors.length ? 'blocked_invalid_result' : 'complete',
    generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
    records: normalized,
    finalGeneratedNamesImport: errors.length ? null : {
      schema: 'idb.internal-build-engine.real-record-result.v1',
      runStatus: 'run_complete',
      prospect: String(runnerResult.prospect || ''),
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      recordExistenceStatus: 'runner_created_or_resolved_targeted_visual_required',
      customer: {
        name: normalized.customer.name,
        id: normalized.customer.internalId,
        url: normalized.customer.url
      },
      salesOrder: {
        name: normalized.demoTransaction.name,
        id: normalized.demoTransaction.internalId,
        url: normalized.demoTransaction.url
      },
      heroItem: {
        name: normalized.heroItem.name,
        id: normalized.heroItem.internalId,
        url: normalized.heroItem.url
      },
      matrixItem: {
        name: normalized.matrixProofItem.name,
        id: normalized.matrixProofItem.internalId,
        url: normalized.matrixProofItem.url
      },
      componentItems: normalized.componentItems.map((item) => ({
        name: item.name,
        id: item.internalId,
        url: item.url
      })),
      warnings: [],
      errors: [],
      recoverableBlockers: []
    },
    validation: {
      valid: errors.length === 0,
      errors
    }
  };
}

module.exports = {
  RUNNER_PARAM_MAP,
  validateConfirmedBuildRequest,
  buildRunnerAdapterInput,
  normalizeRunnerResultToIdbResult,
  isSupportedRecordUrl
};
