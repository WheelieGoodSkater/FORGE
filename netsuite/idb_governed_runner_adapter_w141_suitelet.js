/**
 * IDB Governed Runner Adapter W141
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/task', 'N/log'], (runtime, task, log) => {
  const ADAPTER_VERSION = 'w141-netSuite-side-governed-runner-adapter-skeleton';
  const CREATE_ENABLED = false;
  const GOVERNED_SANDBOX_WRITE_ENABLED = false;
  const DRY_RUN_MODE = 'write_disabled_dry_run';

  const PARAMS = {
    requestJson: 'custpage_idb_confirmed_build_request_json',
    runnerScriptId: 'custscript_idb_runner_script_id',
    runnerDeployId: 'custscript_idb_runner_deploy_id',
    mappingId: 'custscript_idb_runner_mapping_id',
    folderId: 'custscript_idb_runner_folder_id',
    subsidiaryId: 'custscript_idb_runner_subsidiary_id',
    locationId: 'custscript_idb_runner_location_id',
    workCenterSearchId: 'custscript_idb_runner_wc_search_id'
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

  function onRequest(context) {
    const requestJson = readRequestJson(context);
    const parsed = parseRequestJson(requestJson);
    const currentScript = runtime.getCurrentScript();
    const runnerConfig = resolveRunnerConfig(currentScript);
    const result = buildDryRunAdapterResult(parsed.value, runnerConfig, parsed.errors);

    log.audit({
      title: 'IDB governed runner adapter dry run',
      details: JSON.stringify({
        version: ADAPTER_VERSION,
        status: result.runnerStatus,
        runMode: result.runMode,
        queueSubmitted: result.queueSubmitted,
        createsRecords: result.createsRecords,
        errors: result.validation.errors
      })
    });

    if (context && context.response && typeof context.response.write === 'function') {
      context.response.write(JSON.stringify(result, null, 2));
    }
  }

  function readRequestJson(context) {
    const req = (context && context.request) || {};
    const params = req.parameters || {};
    if (params[PARAMS.requestJson]) return String(params[PARAMS.requestJson] || '');
    if (req.body) return String(req.body || '');
    return '';
  }

  function parseRequestJson(raw) {
    const errors = [];
    if (!raw) return { value: null, errors: ['confirmed IDB build request JSON is required.'] };
    try {
      return { value: JSON.parse(raw), errors };
    } catch (e) {
      return { value: null, errors: ['confirmed IDB build request JSON is not valid JSON.'] };
    }
  }

  function getParam(currentScript, name) {
    return String((currentScript && currentScript.getParameter && currentScript.getParameter({ name })) || '').trim();
  }

  function resolveRunnerConfig(currentScript) {
    return {
      schema: 'idb.governed-runner-runtime-config.v1',
      runnerScriptId: getParam(currentScript, PARAMS.runnerScriptId),
      runnerDeployId: getParam(currentScript, PARAMS.runnerDeployId),
      mappingId: getParam(currentScript, PARAMS.mappingId),
      folderId: getParam(currentScript, PARAMS.folderId),
      subsidiaryId: getParam(currentScript, PARAMS.subsidiaryId),
      locationId: getParam(currentScript, PARAMS.locationId),
      workCenterSearchId: getParam(currentScript, PARAMS.workCenterSearchId),
      createEnabled: CREATE_ENABLED,
      governedSandboxWriteEnabled: GOVERNED_SANDBOX_WRITE_ENABLED
    };
  }

  function validateConfirmedRequest(request) {
    const errors = [];
    if (!request || typeof request !== 'object') {
      return { valid: false, errors: ['request must be an object.'] };
    }
    if (request.schema !== 'idb.confirmed-build-request.v1') errors.push('schema must be idb.confirmed-build-request.v1.');
    if (request.requestStatus !== 'confirmed_ready_for_governed_runner') errors.push('requestStatus must be confirmed_ready_for_governed_runner.');
    if (!request.consultantConfirmation || request.consultantConfirmation.confirmed !== true) errors.push('consultant confirmation is required.');
    if (!request.stateAuthority || request.stateAuthority.handoffParityStatus !== 'matched' || request.stateAuthority.noStateMismatch !== true) errors.push('state authority and handoff parity must be matched.');
    if (!request.prospect || !request.prospect.name) errors.push('prospect.name is required.');
    if (!request.demoPath || !request.demoPath.laneId || !request.demoPath.scenario) errors.push('demoPath lane and scenario are required.');
    if (!Array.isArray(request.requiredRecords) || !['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => request.requiredRecords.indexOf(role) !== -1)) {
      errors.push('requiredRecords must include customer, demoTransaction, heroItem, matrixProofItem, and componentItem.');
    }
    return { valid: errors.length === 0, errors };
  }

  function validateRunnerConfig(config) {
    const errors = [];
    ['runnerScriptId', 'runnerDeployId', 'mappingId', 'folderId', 'subsidiaryId'].forEach((key) => {
      if (!config[key]) errors.push(`${key} runtime config is required.`);
    });
    return { valid: errors.length === 0, errors };
  }

  function boolFlag(value) {
    return value === true || value === 'T' || value === 'true' || value === '1' ? 'T' : 'F';
  }

  function safeToken(value) {
    return String(value || '')
      .replace(/[^A-Za-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48)
      .toUpperCase();
  }

  function buildRunnerParamPreview(request, config) {
    const extId = `IDB_${safeToken(`${request.prospect.name}_${request.demoPath.laneId}`) || 'DEMO'}_DRYRUN`;
    const runnerParams = {};
    runnerParams[RUNNER_PARAM_MAP.prospect] = String(request.prospect.name || '');
    runnerParams[RUNNER_PARAM_MAP.website] = String(request.prospect.website || '');
    runnerParams[RUNNER_PARAM_MAP.notes] = String((request.storyInputs && request.storyInputs.buyerNeed) || '');
    runnerParams[RUNNER_PARAM_MAP.agenda] = String((request.storyInputs && request.storyInputs.scObjective) || request.demoPath.scenario || '');
    runnerParams[RUNNER_PARAM_MAP.extId] = extId;
    runnerParams[RUNNER_PARAM_MAP.mappingId] = config.mappingId;
    runnerParams[RUNNER_PARAM_MAP.folderId] = config.folderId;
    runnerParams[RUNNER_PARAM_MAP.subsidiaryId] = config.subsidiaryId;
    runnerParams[RUNNER_PARAM_MAP.locationId] = config.locationId;
    runnerParams[RUNNER_PARAM_MAP.workCenterSearchId] = config.workCenterSearchId;
    runnerParams[RUNNER_PARAM_MAP.enableWip] = boolFlag(false);
    runnerParams[RUNNER_PARAM_MAP.enableManufacturing] = boolFlag(false);
    runnerParams[RUNNER_PARAM_MAP.createNewHero] = boolFlag(true);
    runnerParams[RUNNER_PARAM_MAP.heroItem] = '';
    return { extId, runnerParams };
  }

  function buildDryRunAdapterResult(request, runnerConfig, parseErrors) {
    const requestValidation = validateConfirmedRequest(request);
    const configValidation = validateRunnerConfig(runnerConfig);
    const errors = []
      .concat(parseErrors || [])
      .concat(requestValidation.errors || [])
      .concat(configValidation.errors || []);
    const preview = !errors.length ? buildRunnerParamPreview(request, runnerConfig) : { extId: '', runnerParams: {} };

    return {
      schema: 'idb.governed-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      runnerStatus: errors.length ? 'blocked_validation_failed' : 'validated_not_submitted',
      runMode: DRY_RUN_MODE,
      createsRecords: false,
      queueSubmitted: false,
      runnerTaskId: null,
      createEnabled: CREATE_ENABLED,
      governedSandboxWriteEnabled: GOVERNED_SANDBOX_WRITE_ENABLED,
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      sourceRequestId: request && request.requestId ? String(request.requestId) : '',
      runnerRuntimeConfig: redactRuntimeConfig(runnerConfig),
      runnerParamPreview: preview.runnerParams,
      noSubmitRollback: {
        supported: true,
        performed: true,
        behavior: 'The adapter validated input and runtime config but did not queue the governed runner because writes are disabled.'
      },
      finalGeneratedNamesImport: {
        schema: 'idb.internal-build-engine.real-record-result.v1',
        runStatus: 'dry_run_validated_not_submitted',
        prospect: request && request.prospect ? String(request.prospect.name || '') : '',
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
        recordExistenceStatus: 'not_created_dry_run',
        customer: { name: request && request.prospect ? `${request.prospect.name} Outdoor Retail Account` : '' },
        salesOrder: { name: request && request.prospect ? `${request.prospect.name} Demo Order` : '' },
        heroItem: { name: request && request.prospect ? `${request.prospect.name} Hero Item` : '' },
        matrixItem: { name: request && request.prospect ? `${request.prospect.name} Matrix Proof Item` : '' },
        componentItems: [{ name: request && request.prospect ? `${request.prospect.name} Component Item` : '' }],
        warnings: ['Dry-run result contains names only. No record ids or URLs are returned until governed sandbox write is enabled.'],
        errors: [],
        recoverableBlockers: []
      },
      validation: {
        valid: errors.length === 0,
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        errors
      }
    };
  }

  function redactRuntimeConfig(config) {
    return {
      schema: config.schema,
      runnerScriptIdPresent: !!config.runnerScriptId,
      runnerDeployIdPresent: !!config.runnerDeployId,
      mappingIdPresent: !!config.mappingId,
      folderIdPresent: !!config.folderId,
      subsidiaryIdPresent: !!config.subsidiaryId,
      locationIdPresent: !!config.locationId,
      workCenterSearchIdPresent: !!config.workCenterSearchId,
      createEnabled: config.createEnabled,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled
    };
  }

  function queueRunnerIfEnabled() {
    if (!CREATE_ENABLED || !GOVERNED_SANDBOX_WRITE_ENABLED) {
      return {
        queued: false,
        taskId: null,
        reason: 'governed sandbox writes are disabled in W141'
      };
    }
    const scheduledTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
    return {
      queued: false,
      taskId: null,
      reason: 'W141 skeleton does not submit the scheduled runner yet',
      taskType: scheduledTask && scheduledTask.taskType
    };
  }

  return {
    onRequest,
    _test: {
      validateConfirmedRequest,
      validateRunnerConfig,
      buildRunnerParamPreview,
      buildDryRunAdapterResult,
      queueRunnerIfEnabled
    }
  };
});
