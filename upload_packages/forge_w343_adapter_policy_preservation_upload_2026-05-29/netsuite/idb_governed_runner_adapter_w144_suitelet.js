/**
 * IDB Governed Runner Adapter W144
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/runtime', 'N/task', 'N/log', 'N/file', 'N/search'], (runtime, task, log, file, search) => {
  const ADAPTER_VERSION = 'w144-governed-sandbox-queue-submit-pilot-behind-server-flags';

  const PARAMS = {
    action: 'custpage_idb_action',
    requestJson: 'custpage_idb_confirmed_build_request_json',
    operatorGateJson: 'custpage_idb_operator_queue_gate_json',
    runnerTaskId: 'custpage_idb_runner_task_id',
    idempotencyToken: 'custpage_idb_idempotency_token',
    resultCaptureCursor: 'custpage_idb_result_capture_cursor',
    expectedResultSchema: 'custpage_idb_expected_result_schema',
    createEnabled: 'custscript_idb_create_enabled',
    governedSandboxWriteEnabled: 'custscript_idb_governed_sandbox_write_enabled',
    governedSandboxWriteEnabledShort: 'custscript_idb_governed_sandbox_write',
    queueSubmitEnabled: 'custscript_idb_queue_submit_enabled',
    sandboxAccountAllowlist: 'custscript_idb_sandbox_account_allowlist',
    runnerScriptId: 'custscript_idb_runner_script_id',
    runnerDeployId: 'custscript_idb_runner_deploy_id',
    mappingId: 'custscript_idb_runner_mapping_id',
    folderId: 'custscript_idb_runner_folder_id',
    subsidiaryId: 'custscript_idb_runner_subsidiary_id',
    locationId: 'custscript_idb_runner_location_id',
    workCenterSearchId: 'custscript_idb_runner_wc_search_id',
    resultCaptureFolderId: 'custscript_idb_result_capture_folder_id'
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
    heroItem: 'custscript_v3_runner_hero_item',
    resultCaptureFolderId: 'custscript_v3_runner_result_capture_folder',
    confirmedBuildRequestJson: 'custscript_v3_runner_idb_request_json'
  };

  function onRequest(context) {
    let result;
    let action = '';
    try {
      action = readInput(context, PARAMS.action);
      const requestParsed = parseJson(readInput(context, PARAMS.requestJson), 'confirmed IDB build request JSON');
      const operatorGateParsed = parseJson(readInput(context, PARAMS.operatorGateJson), 'operator queue gate JSON');
      const runnerConfig = resolveRunnerConfig(runtime.getCurrentScript(), runtime.accountId || '');
      result = action === 'poll_runner_result_capture'
        ? buildResultCapturePollEnvelope({
          runnerTaskId: readInput(context, PARAMS.runnerTaskId),
          idempotencyToken: readInput(context, PARAMS.idempotencyToken),
          resultCaptureCursor: readInput(context, PARAMS.resultCaptureCursor),
          expectedResultSchema: readInput(context, PARAMS.expectedResultSchema),
          confirmedRequest: requestParsed.value,
          operatorGate: operatorGateParsed.value
        }, runnerConfig, { file, search }, requestParsed.errors.concat(operatorGateParsed.errors))
        : buildAdapterResult(requestParsed.value, runnerConfig, operatorGateParsed.value, requestParsed.errors.concat(operatorGateParsed.errors));

      log.audit({
        title: 'IDB governed runner adapter W144',
        details: JSON.stringify({
          version: ADAPTER_VERSION,
          action: action || 'queue_submit',
          runnerStatus: result.runnerStatus || result.status,
          queueSubmitted: result.queueSubmitted,
          runnerTaskId: result.runnerTaskId,
          resultCaptureStatus: result.resultCapture && result.resultCapture.status
        })
      });
    } catch (error) {
      result = adapterExceptionEnvelope(error, action || 'queue_submit');
      log.error({
        title: 'IDB governed runner adapter W144 exception',
        details: JSON.stringify(result)
      });
    }
    writeJson(context, result);
  }

  function writeJson(context, result) {
    if (context && context.response && typeof context.response.write === 'function') {
      context.response.write(JSON.stringify(result, null, 2));
    }
  }

  function adapterExceptionEnvelope(error, action) {
    const name = error && (error.name || error.id) ? String(error.name || error.id) : 'ADAPTER_EXCEPTION';
    const message = error && error.message ? String(error.message) : String(error || 'Unknown adapter exception');
    return {
      schema: 'idb.governed-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'adapter_error',
      runnerStatus: 'adapter_error',
      action: action || 'queue_submit',
      error: true,
      errorName: name,
      errorMessage: message,
      errorStack: error && error.stack ? String(error.stack).slice(0, 1200) : '',
      createsRecords: false,
      queueSubmitted: false,
      runnerTaskId: null,
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      idempotencyToken: '',
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'adapter_error',
        error: true,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0
    };
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

  function flag(value) {
    return value === true || value === 'T' || value === 'true' || value === '1';
  }

  function resolveRunnerConfig(currentScript, accountId) {
    return {
      schema: 'idb.governed-runner-runtime-config.v1',
      accountId: String(accountId || '').trim(),
      createEnabled: flag(getParam(currentScript, PARAMS.createEnabled)),
      governedSandboxWriteEnabled: flag(getParam(currentScript, PARAMS.governedSandboxWriteEnabled) || getParam(currentScript, PARAMS.governedSandboxWriteEnabledShort)),
      queueSubmitEnabled: flag(getParam(currentScript, PARAMS.queueSubmitEnabled)),
      sandboxAccountAllowlist: splitCsv(getParam(currentScript, PARAMS.sandboxAccountAllowlist)),
      runnerScriptId: getParam(currentScript, PARAMS.runnerScriptId),
      runnerDeployId: getParam(currentScript, PARAMS.runnerDeployId),
      mappingId: getParam(currentScript, PARAMS.mappingId),
      folderId: getParam(currentScript, PARAMS.folderId),
      subsidiaryId: getParam(currentScript, PARAMS.subsidiaryId),
      locationId: getParam(currentScript, PARAMS.locationId),
      workCenterSearchId: getParam(currentScript, PARAMS.workCenterSearchId),
      resultCaptureFolderId: getParam(currentScript, PARAMS.resultCaptureFolderId)
    };
  }

  function splitCsv(value) {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
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
    const legacyRequiredRecordsValid = Array.isArray(request.requiredRecords) &&
      ['customer', 'demoTransaction', 'heroItem', 'matrixProofItem', 'componentItem'].every((role) => request.requiredRecords.indexOf(role) !== -1);
    const canonicalRequiredRolesValid = Array.isArray(request.requiredRecordRoles) &&
      request.requiredRecordRoles.indexOf('customer') !== -1 &&
      request.requiredRecordRoles.indexOf('sales_order') !== -1 &&
      request.requiredRecordRoles.length >= 4;
    if (!legacyRequiredRecordsValid && !canonicalRequiredRolesValid) {
      errors.push('request must include legacy requiredRecords or canonical requiredRecordRoles with customer, sales_order, and mode-specific records.');
    }
    return { valid: errors.length === 0, errors };
  }

  function validateRunnerConfig(config) {
    const errors = [];
    ['runnerScriptId', 'runnerDeployId', 'mappingId', 'folderId', 'subsidiaryId', 'resultCaptureFolderId'].forEach((key) => {
      if (!config[key]) errors.push(`${key} runtime config is required.`);
    });
    if (!config.accountId) errors.push('runtime account id is required.');
    if (!config.sandboxAccountAllowlist.length) errors.push('sandbox account allowlist is required.');
    if (config.accountId && config.sandboxAccountAllowlist.length && config.sandboxAccountAllowlist.indexOf(config.accountId) === -1) {
      errors.push('runtime account id is not in sandbox account allowlist.');
    }
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
    if (gate.reviewDecision !== 'operator_approved_queue_submit') errors.push('reviewDecision must be operator_approved_queue_submit for W144 queue submit.');
    if (gate.confirmedNoSubmit !== false) errors.push('confirmedNoSubmit must be false only for the W144 server-flagged queue pilot.');
    if (gate.confirmedDrawerNoWrite !== true) errors.push('confirmedDrawerNoWrite must be true.');
    if (gate.confirmedSandboxAccount !== true) errors.push('confirmedSandboxAccount must be true.');
    if (gate.drawerInvocationTokenAccepted === true) errors.push('drawer invocation token must not be accepted.');
    if (gate.typeToConfirm !== 'QUEUE GOVERNED SANDBOX RUNNER') errors.push('typeToConfirm must be QUEUE GOVERNED SANDBOX RUNNER.');
    return { valid: errors.length === 0, errors };
  }

  function safeToken(value) {
    return String(value || '')
      .replace(/[^A-Za-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48)
      .toUpperCase();
  }

  function buildIdempotencyToken(request) {
    return `IDB-${request.requestId || 'request'}-${safeToken(request.prospect && request.prospect.name)}-${safeToken(request.demoPath && request.demoPath.laneId)}`.slice(0, 120);
  }

  function buildRunnerParams(request, config, idempotencyToken) {
    const runnerParams = {};
    const toggles = normalizeSelectedToggles(request);
    runnerParams[RUNNER_PARAM_MAP.prospect] = String(request.prospect.name || '');
    runnerParams[RUNNER_PARAM_MAP.website] = String(request.prospect.website || '');
    runnerParams[RUNNER_PARAM_MAP.notes] = String((request.storyInputs && request.storyInputs.buyerNeed) || '');
    runnerParams[RUNNER_PARAM_MAP.agenda] = String((request.storyInputs && request.storyInputs.scObjective) || request.demoPath.scenario || '');
    runnerParams[RUNNER_PARAM_MAP.extId] = idempotencyToken;
    runnerParams[RUNNER_PARAM_MAP.mappingId] = config.mappingId;
    runnerParams[RUNNER_PARAM_MAP.folderId] = config.folderId;
    runnerParams[RUNNER_PARAM_MAP.subsidiaryId] = config.subsidiaryId;
    runnerParams[RUNNER_PARAM_MAP.locationId] = config.locationId;
    runnerParams[RUNNER_PARAM_MAP.workCenterSearchId] = config.workCenterSearchId;
    runnerParams[RUNNER_PARAM_MAP.enableWip] = toTf(toggles.enableWip);
    runnerParams[RUNNER_PARAM_MAP.enableManufacturing] = toTf(toggles.enableManufacturing);
    runnerParams[RUNNER_PARAM_MAP.createNewHero] = toTf(toggles.createNewHeroItem);
    runnerParams[RUNNER_PARAM_MAP.heroItem] = toggles.createNewHeroItem ? '' : String(request.heroItemId || request.existingHeroItemId || '');
    runnerParams[RUNNER_PARAM_MAP.resultCaptureFolderId] = config.resultCaptureFolderId;
    runnerParams[RUNNER_PARAM_MAP.confirmedBuildRequestJson] = JSON.stringify(buildRunnerRequestContext(request, toggles, idempotencyToken));
    return runnerParams;
  }

  function toTf(value) {
    return value === true ? 'T' : 'F';
  }

  function booleanFromRequest(value) {
    if (value === true || value === 'T' || value === 'true' || value === 'Y' || value === '1' || value === 1) return true;
    if (value === false || value === 'F' || value === 'false' || value === 'N' || value === '0' || value === 0) return false;
    return null;
  }

  function normalizeSelectedToggles(request) {
    const selected = request && request.selectedToggles || {};
    const runnerControls = request && request.runnerControls && request.runnerControls.selectedToggles || {};
    const legacy = request && request.toggles || {};
    return {
      schema: 'idb.w144-normalized-runner-toggles.v1',
      createNewHeroItem: booleanFromRequest(selected.createNewHeroItem) === true ||
        booleanFromRequest(selected.createNewItem) === true ||
        booleanFromRequest(runnerControls.createNewHeroItem) === true ||
        booleanFromRequest(legacy.createNewHeroItem) === true,
      enableManufacturing: booleanFromRequest(selected.enableManufacturing) === true ||
        booleanFromRequest(runnerControls.enableManufacturing) === true ||
        booleanFromRequest(legacy.enableManufacturing) === true,
      enableWip: booleanFromRequest(selected.enableWip) === true ||
        booleanFromRequest(selected.enableWIP) === true ||
        booleanFromRequest(runnerControls.enableWip) === true ||
        booleanFromRequest(legacy.enableWip) === true
    };
  }

  function buildRunnerRequestContext(request, toggles, idempotencyToken) {
    return {
      schema: request.schema,
      requestId: request.requestId || '',
      buildAttemptId: request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId || '',
      submittedAt: request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt || '',
      prospect: request.prospect || {},
      demoPath: request.demoPath || {},
      storyInputs: request.storyInputs || {},
      resolvedOperatingMode: request.resolvedOperatingMode || '',
      modeConfidence: request.modeConfidence || '',
      selectedToggles: toggles,
      namingAuthority: request.namingAuthority || {},
      requiredRecordRoles: request.requiredRecordRoles || [],
      optionalRecordRoles: request.optionalRecordRoles || [],
      invalidRecordRoles: request.invalidRecordRoles || [],
      resultValidationExpectations: request.resultValidationExpectations || {},
      requiredRecords: request.requiredRecords || [],
      canonicalRuntimeContract: {
        schema: 'forge.runtime-contract.v1',
        compatibility: 'legacy-five-record-fields-plus-canonical-role-metadata',
        recordsArrayAccepted: true,
        legacyFiveRecordFieldsPreserved: true
      },
      buildAttemptProvenance: request.buildAttemptProvenance || {
        schema: 'forge.w320.build-attempt-provenance.v1',
        requestId: request.requestId || '',
        sourceRequestId: request.requestId || '',
        buildAttemptId: request.buildAttemptId || '',
        submittedAt: request.submittedAt || ''
      },
      idempotencyToken
    };
  }

  function buildQueueGate(requestValidation, configValidation, operatorValidation, config) {
    const flagGates = {
      createEnabled: config.createEnabled === true,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled === true,
      queueSubmitEnabled: config.queueSubmitEnabled === true
    };
    const allPass = requestValidation.valid && configValidation.valid && operatorValidation.valid && flagGates.createEnabled && flagGates.governedSandboxWriteEnabled && flagGates.queueSubmitEnabled;
    return {
      schema: 'idb.w144-queue-submit-gate.v1',
      queueReadinessStatus: allPass ? 'ready_to_submit_governed_runner' : 'blocked_no_submit',
      canSubmit: allPass,
      gates: {
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        operatorGateValid: operatorValidation.valid,
        sandboxAllowlistPassed: configValidation.valid,
        createEnabled: flagGates.createEnabled,
        governedSandboxWriteEnabled: flagGates.governedSandboxWriteEnabled,
        queueSubmitEnabled: flagGates.queueSubmitEnabled
      }
    };
  }

  function submitRunnerIfAllowed(queueGate, config, runnerParams) {
    if (!queueGate.canSubmit) {
      return {
        queueSubmitted: false,
        runnerTaskId: null,
        submitAttempted: false,
        reason: 'queue gate blocked before submit'
      };
    }
    const scheduledTask = task.create({
      taskType: task.TaskType.SCHEDULED_SCRIPT,
      scriptId: config.runnerScriptId,
      deploymentId: config.runnerDeployId,
      params: runnerParams
    });
    try {
      const taskId = scheduledTask.submit();
      return {
        queueSubmitted: true,
        runnerTaskId: String(taskId || ''),
        submitAttempted: true,
        reason: 'governed runner scheduled task submitted by NetSuite-side adapter'
      };
    } catch (error) {
      return {
        queueSubmitted: false,
        runnerTaskId: null,
        submitAttempted: true,
        error: true,
        errorName: error && (error.name || error.id) ? String(error.name || error.id) : 'RUNNER_SUBMIT_FAILED',
        errorMessage: error && error.message ? String(error.message) : String(error || 'Scheduled runner submit failed.'),
        errorStack: error && error.stack ? String(error.stack).slice(0, 1200) : '',
        reason: 'scheduled runner task submit failed inside W144 adapter'
      };
    }
  }

  function resultCapturePending(idempotencyToken, queueSubmit, request) {
    return {
      schema: 'idb.runner-result-capture.v1',
      status: queueSubmit.queueSubmitted ? 'pending_runner_completion' : 'not_started_no_submit',
      idempotencyToken,
      runnerTaskId: queueSubmit.runnerTaskId,
      sourceRequestId: request && request.requestId ? String(request.requestId) : '',
      buildAttemptId: request && (request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId) ? String(request.buildAttemptId || request.buildAttemptProvenance.buildAttemptId) : '',
      submittedAt: request && (request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt) ? String(request.submittedAt || request.buildAttemptProvenance.submittedAt) : '',
      finalGeneratedNamesReady: false,
      activeOpenLinks: 0,
      importPolicy: 'drawer_must_wait_for_result_capture_with_real_ids_and_urls',
      records: {
        customer: null,
        salesOrder: null,
        heroItem: null,
        matrixItem: null,
        componentItems: []
      }
    };
  }

  function supportedNetSuiteUrl(url) {
    const value = String(url || '');
    return /^\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value) ||
      /^https:\/\/[^/]+\.app\.netsuite\.com\/app\/(common\/entity\/custjob\.nl|accounting\/transactions\/salesord\.nl|common\/item\/item\.nl)\?id=\d+/i.test(value);
  }

  function numericId(value) {
    return /^\d+$/.test(String(value || ''));
  }

  function safeFileToken(value) {
    return String(value || '').replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 80) || 'missing_token';
  }

  function pushUniqueSearchToken(tokens, seen, source, token) {
    const normalized = String(token || '').trim();
    if (!normalized || seen[normalized]) return;
    seen[normalized] = true;
    tokens.push({ source, token: normalized });
  }

  function resultCaptureFileSearchTokensW320(expected) {
    const searchTokens = [];
    const seen = {};
    const runnerTaskId = expected && expected.runnerTaskId;
    const buildAttemptId = expected && expected.buildAttemptId;
    const idempotencyToken = expected && expected.idempotencyToken;
    if (runnerTaskId) pushUniqueSearchToken(searchTokens, seen, 'runnerTaskId', runnerTaskId);
    if (buildAttemptId) {
      pushUniqueSearchToken(searchTokens, seen, 'buildAttemptId', buildAttemptId);
      const safeAttempt = safeFileToken(buildAttemptId);
      pushUniqueSearchToken(searchTokens, seen, 'safeBuildAttemptId', safeAttempt);
      pushUniqueSearchToken(searchTokens, seen, 'safeBuildAttemptIdFileTokenW320', safeAttempt.slice(0, 56));
    }
    if (idempotencyToken) {
      pushUniqueSearchToken(searchTokens, seen, 'idempotencyToken', idempotencyToken);
      const safeToken = safeFileToken(idempotencyToken);
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyToken', safeToken);
      pushUniqueSearchToken(searchTokens, seen, 'safeIdempotencyFileTokenW320', safeToken.slice(0, 48));
    }
    return searchTokens;
  }

  function resultCaptureLookupProvenance(lookup) {
    const confirmed = lookup && lookup.confirmedRequest || {};
    const provenance = confirmed.buildAttemptProvenance || {};
    return {
      runnerTaskId: String(lookup && lookup.runnerTaskId || '').trim(),
      idempotencyToken: String(lookup && lookup.idempotencyToken || confirmed.idempotencyToken || '').trim(),
      buildAttemptId: String(lookup && lookup.buildAttemptId || confirmed.buildAttemptId || provenance.buildAttemptId || '').trim(),
      sourceRequestId: String(lookup && lookup.sourceRequestId || confirmed.requestId || provenance.sourceRequestId || '').trim(),
      submittedAt: String(lookup && lookup.submittedAt || confirmed.submittedAt || provenance.submittedAt || '').trim()
    };
  }

  function captureProvenanceFromJson(parsed) {
    const capture = parsed || {};
    const sidecar = capture.sidecarGeneratedNamesJson || capture.partialGeneratedNamesJson || capture.finalGeneratedNamesJson || {};
    const sourceRequest = capture.sourceRequest || sidecar.sourceRequest || {};
    const provenance = capture.buildAttemptProvenance || sidecar.buildAttemptProvenance || sourceRequest.buildAttemptProvenance || {};
    return {
      runnerTaskId: String(capture.runnerTaskId || sidecar.runnerTaskId || sourceRequest.runnerTaskId || '').trim(),
      idempotencyToken: String(capture.idempotencyToken || sidecar.idempotencyToken || sourceRequest.idempotencyToken || '').trim(),
      buildAttemptId: String(capture.buildAttemptId || sidecar.buildAttemptId || sourceRequest.buildAttemptId || provenance.buildAttemptId || '').trim(),
      sourceRequestId: String(capture.sourceRequestId || sidecar.sourceRequestId || sourceRequest.requestId || sourceRequest.sourceRequestId || provenance.sourceRequestId || '').trim(),
      submittedAt: String(capture.submittedAt || sidecar.submittedAt || sourceRequest.submittedAt || provenance.submittedAt || '').trim()
    };
  }

  function resultCaptureMatchesCurrentAttempt(parsed, lookup) {
    const expected = resultCaptureLookupProvenance(lookup);
    const actual = captureProvenanceFromJson(parsed);
    const reasons = [];
    if (expected.runnerTaskId && actual.runnerTaskId && actual.runnerTaskId !== expected.runnerTaskId) {
      reasons.push('runnerTaskId_mismatch');
    }
    if (expected.buildAttemptId && actual.buildAttemptId !== expected.buildAttemptId) {
      reasons.push(actual.buildAttemptId ? 'buildAttemptId_mismatch' : 'buildAttemptId_missing');
    }
    if (expected.sourceRequestId && actual.sourceRequestId && actual.sourceRequestId !== expected.sourceRequestId) {
      reasons.push('sourceRequestId_mismatch');
    }
    if (expected.idempotencyToken && actual.idempotencyToken && actual.idempotencyToken !== expected.idempotencyToken) {
      reasons.push('idempotencyToken_mismatch');
    }
    return {
      matches: reasons.length === 0,
      reasons,
      expected,
      actual
    };
  }

  function timestampFromResultCaptureFileName(fileName) {
    const match = String(fileName || '').match(/_(\d{12,})\.json$/);
    return match ? Number(match[1]) : 0;
  }

  function submittedAtTime(value) {
    const parsed = Date.parse(String(value || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function legacyCurrentSafeTokenCaptureAllowed(matchResult, searchToken, fileName) {
    const expected = matchResult && matchResult.expected || {};
    const actual = matchResult && matchResult.actual || {};
    const reasons = matchResult && matchResult.reasons || [];
    const tokenSource = searchToken && searchToken.source || '';
    const fileTime = timestampFromResultCaptureFileName(fileName);
    const submittedTime = submittedAtTime(expected.submittedAt);
    const provenanceMissingWithExtIdAliasOnly = reasons.length > 0 && reasons.every((reason) => {
      return reason === 'buildAttemptId_missing' || reason === 'idempotencyToken_mismatch';
    });
    const noActualCurrentFields = !actual.runnerTaskId && !actual.buildAttemptId && !actual.sourceRequestId && !actual.submittedAt;
    const idempotencyMatchesExtIdAlias = expected.idempotencyToken && actual.idempotencyToken &&
      (actual.idempotencyToken === expected.idempotencyToken || actual.idempotencyToken.indexOf(expected.idempotencyToken) !== -1);
    return tokenSource === 'safeIdempotencyFileTokenW320' &&
      provenanceMissingWithExtIdAliasOnly &&
      noActualCurrentFields &&
      idempotencyMatchesExtIdAlias &&
      fileTime > 0 &&
      (!submittedTime || fileTime >= submittedTime);
  }

  function buildNetSuiteRecordUrl(type, id) {
    const internalId = String(id || '').trim();
    if (!numericId(internalId)) return '';
    const normalizedType = String(type || '').toLowerCase();
    const accountId = String(runtime.accountId || '').toLowerCase().replace(/_/g, '-');
    const origin = accountId ? `https://${accountId}.app.netsuite.com` : '';
    if (normalizedType === 'customer') return `${origin}/app/common/entity/custjob.nl?id=${internalId}`;
    if (normalizedType === 'salesorder') return `${origin}/app/accounting/transactions/salesord.nl?id=${internalId}`;
    if (normalizedType === 'inventoryitem' || normalizedType === 'matrixitem' || normalizedType === 'assemblyitem') {
      return `${origin}/app/common/item/item.nl?id=${internalId}`;
    }
    return '';
  }

  function normalizeRecord(record, fallbackType) {
    const raw = record || {};
    const internalId = String(raw.internalId || raw.id || '').trim();
    const rawUrl = String(raw.url || '').trim();
    const fallbackUrl = buildNetSuiteRecordUrl(raw.type || raw.recordType || fallbackType, internalId);
    const url = supportedNetSuiteUrl(rawUrl) && /^https:\/\//i.test(rawUrl) ? rawUrl : fallbackUrl;
    return {
      type: String(raw.type || raw.recordType || fallbackType || '').trim(),
      name: String(raw.name || '').trim(),
      internalId,
      url
    };
  }

  function canonicalRoleForAdapter(role, operatingMode) {
    const value = String(role || '').trim();
    const mode = String(operatingMode || '').trim();
    const aliases = {
      customer: 'customer',
      demoTransaction: 'sales_order',
      salesOrder: 'sales_order',
      sales_order: 'sales_order',
      heroItem: 'finished_or_assembly_item',
      hero_item: 'finished_or_assembly_item',
      matrixProofItem: 'formula_or_batch_structure',
      matrixItem: 'formula_or_batch_structure',
      matrix_or_proof_item: 'formula_or_batch_structure',
      componentItem: 'component_item',
      component_item: 'component_item',
      finished_food_or_batch_item: 'finished_food_or_batch_item',
      ingredient_or_component_item: 'ingredient_or_component_item',
      formula_or_batch_structure: 'formula_or_batch_structure',
      work_order_or_wip_object: 'work_order_or_wip_object',
      routing: 'routing',
      work_center: 'work_center'
    };
    const base = aliases[value] || value;
    if (mode === 'food_batch_manufacturing') {
      if (base === 'finished_or_assembly_item') return 'finished_food_or_batch_item';
      if (base === 'component_item') return 'ingredient_or_component_item';
    }
    if (mode === 'retail_availability' && base === 'finished_or_assembly_item') return 'hero_sku';
    if (mode === 'apparel_style_matrix' && base === 'finished_or_assembly_item') return 'style_sku';
    if (mode === 'dealer_hardgoods_replenishment' && base === 'finished_or_assembly_item') return 'product_sku';
    if (mode === 'distribution_replenishment' && base === 'finished_or_assembly_item') return 'branch_or_product_sku';
    if (mode === 'distribution_replenishment' && base === 'formula_or_batch_structure') return 'replenishment_or_availability_flow';
    if (mode === 'distribution_replenishment' && base === 'component_item') return 'supporting_sku';
    return base;
  }

  function canonicalLabelForAdapter(role) {
    const labels = {
      customer: 'Customer',
      sales_order: 'Sales Order',
      hero_sku: 'Product SKU',
      style_sku: 'Style SKU',
      product_sku: 'Product SKU',
      branch_or_product_sku: 'Product SKU',
      replenishment_or_availability_flow: 'Availability/Replenishment Flow',
      supporting_sku: 'Product SKU',
      finished_or_assembly_item: 'Finished/Assembly Item',
      finished_food_or_batch_item: 'Finished Food/Batch Item',
      component_item: 'Component Item',
      ingredient_or_component_item: 'Ingredient Item',
      formula_or_batch_structure: 'Formula or Batch Structure',
      work_order_or_wip_object: 'Work Order',
      routing: 'Routing',
      work_center: 'Work Center'
    };
    return labels[role] || String(role || '').replace(/_/g, ' ');
  }

  function normalizeCanonicalRecordForAdapter(record, role, operatingMode, fallbackType) {
    const normalized = normalizeRecord(record, fallbackType);
    const canonicalRole = canonicalRoleForAdapter(record && record.role || role, operatingMode);
    return Object.assign({}, normalized, {
      role: canonicalRole,
      legacyRole: role || record && record.legacyRole || '',
      label: record && record.label || canonicalLabelForAdapter(canonicalRole),
      recordType: normalized.type
    });
  }

  function canonicalRecordsFromCompletedSource(source, operatingMode) {
    if (Array.isArray(source && source.records)) {
      return source.records.map((record) => normalizeCanonicalRecordForAdapter(record, record && record.role, operatingMode, record && (record.recordType || record.type)));
    }
    const records = source && source.records || {};
    const output = [];
    [
      ['customer', records.customer || source && source.customer, 'customer'],
      ['demoTransaction', records.demoTransaction || records.salesOrder || source && (source.demoTransaction || source.salesOrder), 'salesorder'],
      ['heroItem', records.heroItem || source && source.heroItem, 'inventoryitem'],
      ['matrixProofItem', records.matrixProofItem || records.matrixItem || source && (source.matrixProofItem || source.matrixItem), 'matrixitem'],
      ['componentItem', records.componentItem || records.componentItems && records.componentItems[0] || source && (source.componentItem || source.componentItems && source.componentItems[0]), 'inventoryitem']
    ].forEach((item) => {
      if (item[1]) output.push(normalizeCanonicalRecordForAdapter(item[1], item[0], operatingMode, item[2]));
    });
    const componentItems = records.componentItems || source && source.componentItems;
    if (Array.isArray(componentItems)) {
      componentItems.slice(1).forEach((record) => output.push(normalizeCanonicalRecordForAdapter(record, 'component_item', operatingMode, 'inventoryitem')));
    }
    return output;
  }

  function firstCanonicalRecord(canonicalRecords, roles) {
    const wanted = roles || [];
    return canonicalRecords.find((record) => wanted.indexOf(record.role) !== -1 || wanted.indexOf(record.legacyRole) !== -1) || null;
  }

  function normalizeCompletedRunnerResult(raw) {
    const source = raw && raw.finalGeneratedNamesJson ? raw.finalGeneratedNamesJson : raw;
    const vocabularyPolicy = source && source.runnerLaneVocabularyPolicy || raw && raw.runnerLaneVocabularyPolicy || null;
    const operatingMode = String(
      source && source.resolvedOperatingMode ||
      raw && raw.resolvedOperatingMode ||
      vocabularyPolicy && (vocabularyPolicy.modeKey || vocabularyPolicy.operatingMode) ||
      source && source.canonicalRuntimeContract && source.canonicalRuntimeContract.resolvedOperatingMode ||
      raw && raw.canonicalRuntimeContract && raw.canonicalRuntimeContract.resolvedOperatingMode ||
      ''
    ).trim();
    const canonicalRecords = canonicalRecordsFromCompletedSource(source, operatingMode);
    const customer = firstCanonicalRecord(canonicalRecords, ['customer']) || normalizeRecord(null, 'customer');
    const demoTransaction = firstCanonicalRecord(canonicalRecords, ['sales_order', 'demoTransaction', 'salesOrder']) || normalizeRecord(null, 'salesorder');
    const heroItem = firstCanonicalRecord(canonicalRecords, ['finished_food_or_batch_item', 'finished_or_assembly_item', 'hero_sku', 'style_sku', 'product_sku', 'branch_or_product_sku', 'heroItem']) || normalizeRecord(null, 'inventoryitem');
    const matrixProofItem = firstCanonicalRecord(canonicalRecords, ['formula_or_batch_structure', 'availability_or_replenishment_flow', 'style_matrix_or_availability_flow', 'dealer_availability_or_replenishment_flow', 'replenishment_or_availability_flow', 'matrixProofItem', 'matrixItem']) || normalizeRecord(null, 'matrixitem');
    const componentItem = firstCanonicalRecord(canonicalRecords, ['supporting_sku', 'ingredient_or_component_item', 'component_item', 'componentItem']) || normalizeRecord(null, 'inventoryitem');
    const completed = {
      schema: 'idb.completed-runner-result-json.v1',
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      canonicalRuntimeContract: {
        schema: 'forge.completed-runner-result.compatibility.v1',
        recordsArrayAccepted: true,
        legacyFiveRecordFieldsPreserved: true,
        resolvedOperatingMode: operatingMode
      },
      canonicalRecords,
      resolvedOperatingMode: operatingMode,
      runnerLaneVocabularyPolicy: vocabularyPolicy,
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
    const required = [customer, demoTransaction, heroItem, matrixProofItem, componentItem];
    const errors = [];
    required.forEach((record) => {
      if (!record.name) errors.push(`${record.type || 'record'} name is required.`);
      if (!numericId(record.internalId)) errors.push(`${record.name || record.type || 'record'} requires numeric internalId.`);
      if (!supportedNetSuiteUrl(record.url)) errors.push(`${record.name || record.type || 'record'} requires supported NetSuite record URL.`);
    });
    return { valid: errors.length === 0, completed, errors };
  }

  function normalizePendingSidecarResultCapture(raw) {
    const capture = raw && raw.schema === 'idb.runner-result-capture.v1' ? raw : null;
    const status = String(capture && capture.status || '').trim();
    if (status !== 'pending_transaction_resolution') return { pending: false };
    return {
      pending: true,
      status,
      finalGeneratedNamesReady: false,
      partialGeneratedNamesJson: capture.partialGeneratedNamesJson || capture.sidecarGeneratedNamesJson || null,
      transactionResolution: capture.transactionResolution || {
        status: 'pending_transaction_resolution',
        authority: 'legacy_runner_csv_import_path'
      }
    };
  }

  function getSidecarRecords(pendingSidecar) {
    const source = pendingSidecar && pendingSidecar.partialGeneratedNamesJson || {};
    return source.records || {};
  }

  function resolveSalesOrderByExternalIdCandidates(candidates, modules) {
    const searchModule = modules && modules.search;
    if (!searchModule) return { found: false, reason: 'search module unavailable' };
    const unique = [];
    (candidates || []).forEach((candidate) => {
      const value = String(candidate || '').trim();
      if (value && unique.indexOf(value) === -1) unique.push(value);
    });
    if (!unique.length) return { found: false, reason: 'no expected sales order external id candidates' };
    for (let i = 0; i < unique.length; i++) {
      const candidate = unique[i];
      const attempts = [
        { field: 'externalidstring', op: 'is', value: candidate },
        { field: 'externalid', op: 'is', value: candidate }
      ];
      for (let j = 0; j < attempts.length; j++) {
        const attempt = attempts[j];
        try {
          const salesOrderSearch = searchModule.create({
            type: 'salesorder',
            filters: [[attempt.field, attempt.op, attempt.value], 'AND', ['mainline', 'is', 'T']],
            columns: ['internalid', 'tranid', 'externalid']
          });
          const matches = salesOrderSearch.run().getRange({ start: 0, end: 1 }) || [];
          if (matches.length) {
            const match = matches[0];
            const id = String(match.getValue && match.getValue({ name: 'internalid' }) || match.id || '').trim();
            const tranid = String(match.getValue && match.getValue({ name: 'tranid' }) || '').trim();
            if (numericId(id)) {
              return {
                found: true,
                candidate,
                internalId: id,
                name: tranid || `Sales Order ${id}`,
                url: buildNetSuiteRecordUrl('salesorder', id)
              };
            }
          }
        } catch (e) {
          // Try the next NetSuite search field; accounts differ on exposed external id filters.
        }
      }
    }
    return { found: false, reason: 'sales order not found for expected external id candidates', candidates: unique };
  }

  function promotePendingSidecarIfTransactionResolved(pendingSidecar, modules) {
    const records = getSidecarRecords(pendingSidecar);
    const sidecar = pendingSidecar && pendingSidecar.partialGeneratedNamesJson || {};
    const tx = pendingSidecar && pendingSidecar.transactionResolution || {};
    const demoSource = records.demoTransaction || {};
    const candidates = []
      .concat(tx.expectedExternalIdCandidates || [])
      .concat(demoSource.externalIdCandidates || [])
      .concat(tx.expectedDemoTransactionExternalId || demoSource.expectedExternalId || []);
    const salesOrder = resolveSalesOrderByExternalIdCandidates(candidates, modules);
    if (!salesOrder.found) {
      return {
        promoted: false,
        reason: salesOrder.reason,
        candidates: salesOrder.candidates || candidates
      };
    }
    const completed = {
      schema: 'idb.completed-runner-result-json.v1',
      status: 'completed',
      runStatus: 'completed',
      generatedRecordOwner: 'governed_runner_internal_build_engine',
      source: 'w144_sidecar_transaction_resolution',
      idempotencyToken: sidecar.idempotencyToken || '',
      resolvedOperatingMode: sidecar.resolvedOperatingMode || pendingSidecar.resolvedOperatingMode || '',
      runnerLaneVocabularyPolicy: sidecar.runnerLaneVocabularyPolicy || pendingSidecar.runnerLaneVocabularyPolicy || null,
      records: {
        customer: normalizeRecord(records.customer, 'customer'),
        demoTransaction: normalizeRecord({
          type: 'salesorder',
          name: salesOrder.name || demoSource.name,
          internalId: salesOrder.internalId,
          url: salesOrder.url
        }, 'salesorder'),
        heroItem: normalizeRecord(records.heroItem, 'inventoryitem'),
        matrixProofItem: normalizeRecord(records.matrixProofItem || records.matrixItem, 'inventoryitem'),
        componentItem: normalizeRecord(records.componentItem || records.componentItems && records.componentItems[0], 'inventoryitem')
      },
      ownership: {
        generatedRecordsOwnedBy: 'governed_runner_internal_build_engine',
        drawerWrites: false,
        drawerTransactionWrites: false
      },
      transactionResolution: {
        status: 'resolved_by_csv_import',
        authority: 'legacy_runner_csv_import_path',
        matchedExternalId: salesOrder.candidate
      }
    };
    completed.demoTransaction = completed.records.demoTransaction;
    completed.heroItem = completed.records.heroItem;
    completed.matrixItem = completed.records.matrixProofItem;
    completed.componentItems = [completed.records.componentItem];
    const normalized = normalizeCompletedRunnerResult(completed);
    return normalized.valid
      ? { promoted: true, completed: normalized.completed, transactionResolution: completed.transactionResolution }
      : { promoted: false, reason: normalized.errors.join(' '), candidates };
  }

  function findResultCaptureFile(config, lookup, modules) {
    if (!config.resultCaptureFolderId) return { found: false, reason: 'result capture folder is not configured' };
    const expected = resultCaptureLookupProvenance(lookup || {});
    const runnerTaskId = expected.runnerTaskId;
    const idempotencyToken = expected.idempotencyToken;
    const buildAttemptId = expected.buildAttemptId;
    if (!runnerTaskId && !buildAttemptId && !idempotencyToken) return { found: false, reason: 'runnerTaskId or buildAttemptId or idempotencyToken is required' };
    const searchModule = modules && modules.search;
    const fileModule = modules && modules.file;
    if (!searchModule || !fileModule) return { found: false, reason: 'file/search modules unavailable' };
    const searchTokens = resultCaptureFileSearchTokensW320(expected);
    const staleCandidates = [];
    const checkedFileIds = {};
    for (let tokenIndex = 0; tokenIndex < searchTokens.length; tokenIndex += 1) {
      const searchToken = searchTokens[tokenIndex];
      const filters = [['folder', 'anyof', config.resultCaptureFolderId], 'AND', ['name', 'contains', searchToken.token]];
      const modifiedColumn = searchModule.createColumn && searchModule.Sort
        ? searchModule.createColumn({ name: 'modified', sort: searchModule.Sort.DESC })
        : 'modified';
      const captureSearch = searchModule.create({
        type: 'file',
        filters,
        columns: ['internalid', 'name', modifiedColumn]
      });
      const matches = captureSearch.run().getRange({ start: 0, end: 10 }) || [];
      for (let i = 0; i < matches.length; i += 1) {
        const match = matches[i];
        const fileId = String(match.id || match.getValue && match.getValue({ name: 'internalid' }) || '');
        if (!fileId || checkedFileIds[fileId]) continue;
        checkedFileIds[fileId] = true;
        const fileName = match.getValue && match.getValue({ name: 'name' }) || match.name || '';
        const captureFile = fileModule.load({ id: fileId });
        const contents = captureFile.getContents();
        let parsed = null;
        try {
          parsed = JSON.parse(contents || '{}');
        } catch (e) {
          staleCandidates.push({ fileId, fileName: String(fileName || captureFile.name || ''), reason: 'invalid_json' });
          continue;
        }
        const matchResult = resultCaptureMatchesCurrentAttempt(parsed, expected);
        if (!matchResult.matches) {
          if (legacyCurrentSafeTokenCaptureAllowed(matchResult, searchToken, fileName || captureFile.name || '')) {
            return {
              found: true,
              fileId,
              fileName: String(fileName || captureFile.name || ''),
              contents,
              lookupSource: searchToken.source,
              provenance: matchResult.actual,
              provenanceFallback: {
                status: 'legacy_current_safe_token_capture_allowed',
                reason: 'sidecar_missing_build_attempt_provenance_but_matches_current_safe_token_and_file_time',
                expected: matchResult.expected,
                actual: matchResult.actual
              }
            };
          }
          staleCandidates.push({
            fileId,
            fileName: String(fileName || captureFile.name || ''),
            lookupSource: searchToken.source,
            reasons: matchResult.reasons,
            expected: matchResult.expected,
            actual: matchResult.actual
          });
          continue;
        }
        return {
          found: true,
          fileId,
          fileName: String(fileName || captureFile.name || ''),
          contents,
          lookupSource: searchToken.source,
          provenance: matchResult.actual
        };
      }
    }
    return {
      found: false,
      reason: staleCandidates.length ? 'stale_result_capture_file_rejected' : 'result capture file not found',
      expected,
      staleRejected: staleCandidates.length > 0,
      staleCandidates
    };
  }

  function buildResultCapturePollEnvelope(lookup, config, modules, parseErrors) {
    const lookupProvenance = resultCaptureLookupProvenance(lookup || {});
    const runnerTaskId = lookupProvenance.runnerTaskId;
    const idempotencyToken = lookupProvenance.idempotencyToken;
    const buildAttemptId = lookupProvenance.buildAttemptId;
    const sourceRequestId = lookupProvenance.sourceRequestId;
    const submittedAt = lookupProvenance.submittedAt;
    const cursor = String(lookup && lookup.resultCaptureCursor || '').trim();
    const errors = [].concat(parseErrors || []);
    if (!runnerTaskId) errors.push('runnerTaskId is required for result-capture polling.');
    if (!idempotencyToken) errors.push('idempotencyToken is required for result-capture polling.');
    if (!buildAttemptId) errors.push('buildAttemptId is required for stale-safe result-capture polling.');
    if (!config.resultCaptureFolderId) errors.push('resultCaptureFolderId runtime config is required.');
    if (lookup && lookup.expectedResultSchema && lookup.expectedResultSchema !== 'idb.completed-runner-result-json.v1') {
      errors.push('expected result schema must be idb.completed-runner-result-json.v1.');
    }
    if (errors.length) {
      return adapterPollError(runnerTaskId, idempotencyToken, errors.join(' '), cursor);
    }
    const found = findResultCaptureFile(config, lookup, modules);
    if (!found.found) {
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        adapterVersion: ADAPTER_VERSION,
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId,
        idempotencyToken,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_runner_completion',
          runnerTaskId,
          idempotencyToken,
          sourceRequestId,
          buildAttemptId,
          submittedAt,
          resultCaptureCursor: cursor || `pending:${runnerTaskId}`,
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null,
          lookupStatus: found.reason,
          staleRejected: found.staleRejected === true,
          staleCandidates: found.staleCandidates || []
        },
        finalGeneratedNamesJson: null,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine'
      };
    }
    let parsed;
    try {
      parsed = JSON.parse(found.contents || '{}');
    } catch (e) {
      return adapterPollError(runnerTaskId, idempotencyToken, 'result capture file is not valid JSON.', cursor, found);
    }
    const pendingSidecar = normalizePendingSidecarResultCapture(parsed);
    if (pendingSidecar.pending) {
      const promoted = promotePendingSidecarIfTransactionResolved(pendingSidecar, modules);
      if (promoted.promoted) {
        return {
          schema: 'idb.approved-server-adapter-result-envelope.v1',
          adapterVersion: ADAPTER_VERSION,
          status: 'completed_runner_result_ready',
          queueSubmitted: true,
          runnerTaskId,
          idempotencyToken,
          resultCapture: {
            schema: 'idb.runner-result-capture.v1',
            status: 'completed_result_capture_ready',
            runnerTaskId,
            idempotencyToken,
            sourceRequestId,
            buildAttemptId,
            submittedAt,
            resultCaptureCursor: `file:${found.fileId}`,
            sourceFileId: found.fileId,
            sourceFileName: found.fileName,
            lookupStatus: 'resolved_by_csv_import',
            lookupSource: found.lookupSource || '',
            finalGeneratedNamesReady: true,
            finalGeneratedNamesJson: promoted.completed,
            runnerLaneVocabularyPolicy: promoted.completed.runnerLaneVocabularyPolicy || null,
            transactionResolution: promoted.transactionResolution
          },
          finalGeneratedNamesJson: promoted.completed,
          runnerLaneVocabularyPolicy: promoted.completed.runnerLaneVocabularyPolicy || null,
          finalGeneratedNamesJsonReady: true,
          activeOpenLinks: 0,
          generatedRecordOwner: 'governed_runner_internal_build_engine'
        };
      }
      return {
        schema: 'idb.approved-server-adapter-result-envelope.v1',
        adapterVersion: ADAPTER_VERSION,
        status: 'polling_pending',
        queueSubmitted: true,
        runnerTaskId,
          idempotencyToken,
          sourceRequestId,
          buildAttemptId,
          submittedAt,
          resultCapture: {
          schema: 'idb.runner-result-capture.v1',
          status: 'pending_transaction_resolution',
            runnerTaskId,
            idempotencyToken,
            sourceRequestId,
            buildAttemptId,
            submittedAt,
            resultCaptureCursor: `file:${found.fileId}`,
          sourceFileId: found.fileId,
          sourceFileName: found.fileName,
            lookupStatus: 'pending_transaction_resolution',
            lookupSource: found.lookupSource || '',
          finalGeneratedNamesReady: false,
          finalGeneratedNamesJson: null,
          partialGeneratedNamesJson: pendingSidecar.partialGeneratedNamesJson,
          transactionResolution: Object.assign({}, pendingSidecar.transactionResolution, {
            lookupStatus: promoted.reason || 'pending_transaction_resolution',
            candidates: promoted.candidates || []
          })
        },
        finalGeneratedNamesJson: null,
        finalGeneratedNamesJsonReady: false,
        activeOpenLinks: 0,
        generatedRecordOwner: 'governed_runner_internal_build_engine'
      };
    }
    const normalized = normalizeCompletedRunnerResult(parsed);
    if (!normalized.valid) {
      return adapterPollError(runnerTaskId, idempotencyToken, normalized.errors.join(' '), cursor, found);
    }
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'completed_runner_result_ready',
      queueSubmitted: true,
      runnerTaskId,
      idempotencyToken,
      sourceRequestId,
      buildAttemptId,
      submittedAt,
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'completed_result_capture_ready',
        runnerTaskId,
        idempotencyToken,
        sourceRequestId,
        buildAttemptId,
        submittedAt,
        resultCaptureCursor: `file:${found.fileId}`,
        sourceFileId: found.fileId,
        sourceFileName: found.fileName,
        lookupSource: found.lookupSource || '',
        finalGeneratedNamesReady: true,
        finalGeneratedNamesJson: normalized.completed
      },
      finalGeneratedNamesJson: normalized.completed,
      finalGeneratedNamesJsonReady: true,
      activeOpenLinks: 0,
      generatedRecordOwner: 'governed_runner_internal_build_engine'
    };
  }

  function adapterPollError(runnerTaskId, idempotencyToken, message, cursor, found) {
    return {
      schema: 'idb.approved-server-adapter-result-envelope.v1',
      adapterVersion: ADAPTER_VERSION,
      status: 'adapter_error',
      error: true,
      errorMessage: message,
      queueSubmitted: false,
      runnerTaskId: runnerTaskId || null,
      idempotencyToken: idempotencyToken || null,
      resultCapture: {
        schema: 'idb.runner-result-capture.v1',
        status: 'adapter_error',
        error: true,
        runnerTaskId: runnerTaskId || null,
        idempotencyToken: idempotencyToken || null,
        resultCaptureCursor: cursor || null,
        sourceFileId: found && found.fileId || null,
        sourceFileName: found && found.fileName || null,
        finalGeneratedNamesReady: false,
        finalGeneratedNamesJson: null
      },
      finalGeneratedNamesJson: null,
      activeOpenLinks: 0,
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine'
    };
  }

  function buildAdapterResult(request, config, operatorGate, parseErrors) {
    const requestValidation = validateConfirmedRequest(request);
    const configValidation = validateRunnerConfig(config);
    const operatorValidation = validateOperatorQueueGate(operatorGate);
    const errors = []
      .concat(parseErrors || [])
      .concat(requestValidation.errors || [])
      .concat(configValidation.errors || [])
      .concat(operatorValidation.errors || []);
    const idempotencyToken = requestValidation.valid ? buildIdempotencyToken(request) : '';
    const runnerParams = !errors.length ? buildRunnerParams(request, config, idempotencyToken) : {};
    const queueGate = buildQueueGate(requestValidation, configValidation, operatorValidation, config);
    const queueSubmit = submitRunnerIfAllowed(queueGate, config, runnerParams);
    const adapterError = queueSubmit.error === true;

    return {
      schema: 'idb.governed-runner-adapter-result.v1',
      adapterVersion: ADAPTER_VERSION,
      status: adapterError ? 'adapter_error' : (queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : (errors.length ? 'blocked_validation_failed' : 'validated_not_submitted')),
      runnerStatus: adapterError ? 'adapter_error' : (queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : (errors.length ? 'blocked_validation_failed' : 'validated_not_submitted')),
      runMode: queueSubmit.queueSubmitted ? 'governed_sandbox_queue_submit' : 'write_disabled_or_gate_blocked_no_submit',
      error: adapterError,
      errorName: queueSubmit.errorName || '',
      errorMessage: queueSubmit.errorMessage || '',
      errorStack: queueSubmit.errorStack || '',
      createsRecords: false,
      queueSubmitted: queueSubmit.queueSubmitted,
      runnerTaskId: queueSubmit.runnerTaskId,
      generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
      sourceRequestId: request && request.requestId ? String(request.requestId) : '',
      buildAttemptId: request && (request.buildAttemptId || request.buildAttemptProvenance && request.buildAttemptProvenance.buildAttemptId) ? String(request.buildAttemptId || request.buildAttemptProvenance.buildAttemptId) : '',
      submittedAt: request && (request.submittedAt || request.buildAttemptProvenance && request.buildAttemptProvenance.submittedAt) ? String(request.submittedAt || request.buildAttemptProvenance.submittedAt) : '',
      idempotencyToken,
      runnerRuntimeConfig: redactRuntimeConfig(config),
      runnerParams: runnerParams,
      queueGate,
      queueSubmit,
      resultCapture: resultCapturePending(idempotencyToken, queueSubmit, request),
      noSubmitRollback: {
        supported: true,
        performed: !queueSubmit.queueSubmitted,
        behavior: queueSubmit.queueSubmitted
          ? 'Queue submit occurred only after every W144 server-side gate passed; no drawer rollback or record rollback is available from IDB.'
          : 'The adapter stopped before scheduled task submit; no NetSuite records or transactions were created.'
      },
      finalGeneratedNamesImport: {
        schema: 'idb.internal-build-engine.real-record-result.v1',
        runStatus: queueSubmit.queueSubmitted ? 'queued_result_capture_pending' : 'dry_run_validated_not_submitted',
        prospect: request && request.prospect ? String(request.prospect.name || '') : '',
        generatedRecordOwner: 'governed_dcc_runner_internal_build_engine',
        recordExistenceStatus: queueSubmit.queueSubmitted ? 'pending_runner_completion' : 'not_created_dry_run',
        warnings: ['No record ids or URLs are returned by W144. Drawer Open links remain unavailable until result capture returns real NetSuite URLs.'],
        errors: [],
        recoverableBlockers: []
      },
      validation: {
        valid: errors.length === 0,
        requestValid: requestValidation.valid,
        runtimeConfigValid: configValidation.valid,
        operatorGateValid: operatorValidation.valid,
        errors
      }
    };
  }

  function redactRuntimeConfig(config) {
    return {
      schema: config.schema,
      accountIdPresent: !!config.accountId,
      sandboxAccountAllowlistCount: config.sandboxAccountAllowlist.length,
      runnerScriptIdPresent: !!config.runnerScriptId,
      runnerDeployIdPresent: !!config.runnerDeployId,
      mappingIdPresent: !!config.mappingId,
      folderIdPresent: !!config.folderId,
      subsidiaryIdPresent: !!config.subsidiaryId,
      locationIdPresent: !!config.locationId,
      workCenterSearchIdPresent: !!config.workCenterSearchId,
      resultCaptureFolderIdPresent: !!config.resultCaptureFolderId,
      createEnabled: config.createEnabled,
      governedSandboxWriteEnabled: config.governedSandboxWriteEnabled,
      queueSubmitEnabled: config.queueSubmitEnabled
    };
  }

  return {
    onRequest,
    _test: {
      resolveRunnerConfig,
      validateConfirmedRequest,
      validateRunnerConfig,
      validateOperatorQueueGate,
      buildIdempotencyToken,
      buildRunnerParams,
      buildQueueGate,
      submitRunnerIfAllowed,
      buildAdapterResult,
      buildResultCapturePollEnvelope,
      normalizeCompletedRunnerResult,
      findResultCaptureFile
    }
  };
});
