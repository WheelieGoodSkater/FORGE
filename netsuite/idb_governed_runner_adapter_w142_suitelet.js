/**
 * IDB Governed Runner Adapter W142
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/task', 'N/log'], (runtime, task, log) => {
  const ADAPTER_VERSION = 'w142-operator-queue-gate-dry-run-result-surface';
  const CREATE_ENABLED = false;
  const GOVERNED_SANDBOX_WRITE_ENABLED = false;
  const DRY_RUN_MODE = 'operator_queue_gate_write_disabled_dry_run';

  const PARAMS = {
    requestJson: 'custpage_idb_confirmed_build_request_json',
    operatorGateJson: 'custpage_idb_operator_queue_gate_json',
    runnerScriptId: 'custscript_idb_runner_script_id',
    runnerDeployId: 'custscript_idb_runner_deploy_id',
    mappingId: 'custscript_idb_runner_mapping_id',
    folderId: 'custscript_idb_runner_folder_id',
    subsidiaryId: 'custscript_idb_runner_subsidiary_id',
    locationId: 'custscript_idb_runner_location_id',
    workCenterSearchId: 'custscript_idb_runner_wc_search_id',
    sandboxAccountId: 'custscript_idb_sandbox_account_id'
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
    const requestParsed = parseJson(readInput(context, PARAMS.requestJson), 'confirmed IDB build request JSON');
    const operatorGateParsed = parseJson(readInput(context, PARAMS.operatorGateJson), 'operator queue gate JSON');
    const currentScript = runtime.getCurrentScript();
    const runnerConfig = resolveRunnerConfig(currentScript);
    const result = buildDryRunAdapterResult(requestParsed.value, runnerConfig, operatorGateParsed.value, requestParsed.errors.concat(operatorGateParsed.errors));

    log.audit({
      title: 'IDB governed runner adapter W142 dry run',
      details: JSON.stringify({
        version: ADAPTER_VERSION,
        status: result.runnerStatus,
        queueReadinessStatus: result.operatorQueueGate.queueReadinessStatus,
        queueSubmitted: result.queueSubmitted,
        createsRecords: result.createsRecords
      })
    });

    if (context && context.response && typeof context.response.write === 'function') {
      context.response.write(JSON.stringify(result, null, 2));
    }
  }

  function readInput(context, paramName) {
    const req = (context && context.request) || {};
    const params = req.parameters || {};
    if (params[paramName]) return String(params[paramName] || '');
    if (paramName === PARAMS.requestJson && req.body) return String(req.body || '');
    return '';
  }

  function parseJson(raw, label) {
    if (!raw) return { value: null, errors: [`${label} is required.`] };
    try {
      return { value: JSON.parse(raw), errors: [] };
    } catch (e) {
      return { value: null, errors: [`${label} is not valid JSON.`] };
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
      sandboxAccountId: getParam(currentScript, PARAMS.sandboxAccountId),
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
    ['runnerScriptId', 'runnerDeployId', 'mappingId', 'folderId', 'subsidiaryId', 'sandboxAccountId'].forEach((key) => {
      if (!config[key]) errors.push(`${key} runtime config is required.`);
    });
    return { valid: errors.length === 0, errors };
  }

  function validateOperatorQueueGate(gate) {
    const errors = [];
    if (!gate || typeof gate !== 'object') {
      return { valid: false, errors: ['operator queue gate JSON is required.'] };
    }
    if (gate.schema !== 'idb.operator-queue-gate.v1') errors.push('operator gate schema must be idb.operator-queue-gate.v1.');
    if (gate.operatorOnly !== true) errors.push('operatorOnly must be true.');
    if (!gate.operator || !gate.operator.name) errors.push('operator.name is required.');
    if (gate.reviewDecision !== 'dry_run_reviewed_no_submit') errors.push('reviewDecision must be dry_run_reviewed_no_submit in W142.');
    if (gate.confirmedNoSubmit !== true) errors.push('confirmedNoSubmit must be true.');
    if (gate.confirmedDrawerNoWrite !== true) errors.push('confirmedDrawerNoWrite must be true.');
    if (gate.confirmedSandboxAccount !== true) errors.push('confirmedSandboxAccount must be true.');
    if (gate.drawerInvocationTokenAccepted === true) errors.push('drawer invocation token must not be accepted.');
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

  function buildOperatorQueueGate(requestValidation, configValidation, operatorValidation, config, gate) {
    const writeFlagsEnabled = config.createEnabled === true && config.governedSandboxWriteEnabled === true;
    const gates = [
      gateRow('confirmed_build_request_valid', requestValidation.valid),
      gateRow('consultant_confirmation_present', requestValidation.valid),
      gateRow('state_authority_and_handoff_parity_matched', requestValidation.valid),
      gateRow('runtime_config_resolved_server_side', configValidation.valid),
      gateRow('operator_only_review_present', operatorValidation.valid),
      gateRow('sandbox_account_confirmed', !!(gate && gate.confirmedSandboxAccount)),
      gateRow('drawer_invocation_token_rejected', !(gate && gate.drawerInvocationTokenAccepted === true)),
      gateRow('create_enabled_flag_true', config.createEnabled === true),
      gateRow('governed_sandbox_write_enabled_flag_true', config.governedSandboxWriteEnabled === true)
    ];
    return {
      schema: 'idb.operator-queue-readiness-gate.v1',
      operatorOnly: true,
      reviewDecision: gate && gate.reviewDecision ? String(gate.reviewDecision) : '',
      queueReadinessStatus: writeFlagsEnabled && requestValidation.valid && configValidation.valid && operatorValidation.valid
        ? 'ready_to_queue_when_called_by_operator'
        : 'blocked_write_flags_disabled_or_gate_failed',
      canQueue: writeFlagsEnabled && requestValidation.valid && configValidation.valid && operatorValidation.valid,
      requiredBeforeQueue: [
        'confirmed IDB build request',
        'consultant confirmation',
        'matched state authority and handoff parity',
        'server-side runner runtime config',
        'operator-only review decision',
        'sandbox account confirmation',
        'CREATE_ENABLED true',
        'GOVERNED_SANDBOX_WRITE_ENABLED true'
      ],
      gates
    };
  }

  function gateRow(name, pass) {
    return { name, pass: !!pass };
  }

  function buildDryRunResultSurface(request, runnerConfig, operatorQueueGate, preview, validation) {
    return {
      schema: 'idb.dry-run-result-surface.v1',
      title: 'Governed runner dry-run review',
      status: validation.valid ? 'validated_no_submit' : 'blocked_validation_failed',
      primaryMessage: validation.valid
        ? 'The adapter accepted the confirmed IDB request and operator gate, resolved server-side runner config, and stopped before queue submit because write flags are disabled.'
        : 'The adapter stopped before queue submit because validation failed.',
      statusChips: [
        { label: 'Dry run only', state: 'info' },
        { label: 'No queue submit', state: 'blocked' },
        { label: 'No drawer writes', state: 'confirmed' },
        { label: 'No active links', state: 'confirmed' }
      ],
      operatorRows: [
        { label: 'Prospect', value: request && request.prospect ? String(request.prospect.name || '') : '' },
        { label: 'Demo path', value: request && request.demoPath ? String(request.demoPath.scenario || '') : '' },
        { label: 'Runner script config', value: runnerConfig.runnerScriptId ? 'present' : 'missing' },
        { label: 'Queue status', value: operatorQueueGate.queueReadinessStatus },
        { label: 'External id preview', value: preview.extId || '' }
      ],
      recordsPreview: {
        customer: request && request.prospect ? `${request.prospect.name} Outdoor Retail Account` : '',
        demoTransaction: request && request.prospect ? `${request.prospect.name} Demo Order` : '',
        heroItem: request && request.prospect ? `${request.prospect.name} Hero Item` : '',
        matrixProofItem: request && request.prospect ? `${request.prospect.name} Matrix Proof Item` : '',
        componentItem: request && request.prospect ? `${request.prospect.name} Component Item` : ''
      },
      linkPolicy: {
        activeOpenLinks: 0,
        reason: 'Dry-run surface has names only. Real Open links require numeric internal ids and supported NetSuite URLs returned by the governed runner after writes are explicitly enabled.'
      }
    };
  }

  function buildDryRunAdapterResult(request, runnerConfig, operatorGate, parseErrors) {
    const requestValidation = validateConfirmedRequest(request);
    const configValidation = validateRunnerConfig(runnerConfig);
    const operatorValidation = validateOperatorQueueGate(operatorGate);
    const errors = []
      .concat(parseErrors || [])
      .concat(requestValidation.errors || [])
      .concat(configValidation.errors || [])
      .concat(operatorValidation.errors || []);
    const preview = !errors.length ? buildRunnerParamPreview(request, runnerConfig) : { extId: '', runnerParams: {} };
    const operatorQueueGate = buildOperatorQueueGate(requestValidation, configValidation, operatorValidation, runnerConfig, operatorGate);
    const validation = {
      valid: errors.length === 0,
      requestValid: requestValidation.valid,
      runtimeConfigValid: configValidation.valid,
      operatorGateValid: operatorValidation.valid,
      errors
    };

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
      operatorQueueGate,
      dryRunResultSurface: buildDryRunResultSurface(request, runnerConfig, operatorQueueGate, preview, validation),
      noSubmitRollback: {
        supported: true,
        performed: true,
        behavior: 'The adapter validated request, operator gate, and runtime config but did not queue the governed runner because write flags are disabled.'
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
        warnings: ['W142 dry-run result contains names only. No record ids or URLs are returned until governed sandbox write flags are enabled.'],
        errors: [],
        recoverableBlockers: []
      },
      validation
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
      sandboxAccountIdPresent: !!config.sandboxAccountId,
      createEnabled: config.createEnabled,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled
    };
  }

  function queueRunnerIfEnabled() {
    if (!CREATE_ENABLED || !GOVERNED_SANDBOX_WRITE_ENABLED) {
      return {
        queued: false,
        taskId: null,
        reason: 'governed sandbox writes are disabled in W142'
      };
    }
    const scheduledTask = task.create({ taskType: task.TaskType.SCHEDULED_SCRIPT });
    return {
      queued: false,
      taskId: null,
      reason: 'W142 queue gate is ready, but this dry-run surface does not submit the scheduled runner yet',
      taskType: scheduledTask && scheduledTask.taskType
    };
  }

  return {
    onRequest,
    _test: {
      validateConfirmedRequest,
      validateRunnerConfig,
      validateOperatorQueueGate,
      buildOperatorQueueGate,
      buildDryRunResultSurface,
      buildRunnerParamPreview,
      buildDryRunAdapterResult,
      queueRunnerIfEnabled
    }
  };
});
